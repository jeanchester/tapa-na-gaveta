"""Confere e corrige áudio descasado (voz adiantada ou atrasada em relação à boca).

  python ferramentas/video/sincronia.py diagnostico bruto.MOV
      ritmo de quadros variável, áudio que começa depois do vídeo, rotação: as causas comuns do descasamento

  python ferramentas/video/sincronia.py comparar bruto.MOV final.mp4 --inicio 2.4
      compara o vídeo final com a gravação original em vários trechos: mede quanto a voz andou e quanto a
      imagem da câmera andou; a diferença é o descasamento (em ms). Constante = deslocamento; crescendo = deriva.

  python ferramentas/video/sincronia.py estimar final.mp4
      sem a gravação original: cruza o volume da voz com o movimento da metade de baixo (quem fala mexe a
      cabeça e a boca junto com a fala). Dá uma estimativa; confirme no olho antes de corrigir.

  python ferramentas/video/sincronia.py conferir NOME --camera bruto.MOV
      o jeito certo de conferir um vídeo do render.py (com cortes e velocidade): casa o movimento da câmera e o
      envelope da voz do final com a gravação, ponto a ponto, no meio dos trechos mantidos. O render.py roda isso
      sozinho no fim e corrige a voz se passar de 20 ms.

  python ferramentas/video/sincronia.py corrigir final.mp4 --ms 120 [--saida final-sinc.mp4]
      ms > 0: a voz está ATRASADA e é adiantada em tantos ms; ms < 0: a voz está ADIANTADA e é atrasada.
      A imagem é copiada sem recompressão; só o áudio é refeito.

Regra prática: até 40 ms ninguém percebe; acima de 80 ms já incomoda; acima de 120 ms é "áudio descasado".
"""
import argparse
import json
import pathlib
import subprocess
import sys

import numpy as np

FPS = 30
SR = 8000


def sondar(arq):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(arq)], capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def frac(s):
    try:
        a, b = s.split('/')
        return float(a) / float(b) if float(b) else 0.0
    except Exception:
        return 0.0


def diagnostico(arq):
    info = sondar(arq)
    v = next((s for s in info['streams'] if s['codec_type'] == 'video'), None)
    a = next((s for s in info['streams'] if s['codec_type'] == 'audio'), None)
    print(f'arquivo: {arq}')
    problemas = []
    if v:
        r, avg = frac(v.get('r_frame_rate', '0/1')), frac(v.get('avg_frame_rate', '0/1'))
        rot = next((d.get('rotation') for d in v.get('side_data_list', []) if 'rotation' in d), v.get('tags', {}).get('rotate'))
        print(f"  vídeo: {v['codec_name']} {v.get('width')}x{v.get('height')}  início {v.get('start_time')} s  ritmo nominal {r:.3f} / médio {avg:.3f} fps  rotação {rot}")
        if r and avg and abs(r - avg) > 0.05:
            problemas.append('ritmo de quadros VARIÁVEL (comum no iPhone): converta para ritmo constante junto com o áudio (o render.py já faz)')
    if a:
        print(f"  áudio: {a['codec_name']} {a.get('sample_rate')} Hz  início {a.get('start_time')} s  duração {a.get('duration')} s")
    if v and a:
        dif = (float(a.get('start_time') or 0) - float(v.get('start_time') or 0)) * 1000
        print(f'  áudio começa {dif:+.0f} ms em relação ao vídeo')
        if abs(dif) > 20:
            problemas.append(f'áudio e vídeo começam em tempos diferentes ({dif:+.0f} ms). Quem zera os dois separadamente '
                             '(asetpts/setpts=PTS-STARTPTS em cada um, ou editor que "alinha no começo") descasa a voz nesse tanto')
        dv, da = float(v.get('duration') or 0), float(a.get('duration') or 0)
        if dv and da and abs(dv - da) > 0.15:
            problemas.append(f'durações diferentes (vídeo {dv:.2f} s, áudio {da:.2f} s): sinal de deriva ou corte desigual')
    print('problemas:' if problemas else 'nada suspeito no arquivo.')
    for p in problemas:
        print('  -', p)


def audio(arq, ini=0.0, dur=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', f'{ini:.3f}', '-i', str(arq)] + (['-t', f'{dur:.3f}'] if dur else []) + \
          ['-vn', '-ac', '1', '-ar', str(SR), '-af', 'highpass=f=250,lowpass=f=3400', '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32)


def movimento(arq, ini=0.0, dur=None, recorte=None):
    """Energia de movimento quadro a quadro (média da diferença absoluta entre quadros), a 30 fps."""
    vf = (f'crop={recorte},' if recorte else '') + f'fps={FPS},scale=48:48,format=gray'
    cmd = ['ffmpeg', '-v', 'error', '-ss', f'{ini:.3f}', '-i', str(arq)] + (['-t', f'{dur:.3f}'] if dur else []) + \
          ['-an', '-vf', vf, '-f', 'rawvideo', '-']
    q = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.uint8).astype(np.float32)
    q = q.reshape(-1, 48 * 48)
    d = np.abs(np.diff(q, axis=0)).mean(axis=1)
    return np.concatenate([[0.0], d])           # a mudança entre os quadros i-1 e i fica no quadro i


def envelope(sinal, sr, fps=FPS):
    passo = sr // fps
    n = len(sinal) // passo
    return np.sqrt((sinal[:n * passo].reshape(n, passo) ** 2).mean(axis=1))


def atraso(a, b, max_lag):
    """Quanto b está atrasado em relação a a (em amostras), pela correlação cruzada normalizada."""
    a = (a - a.mean()) / (a.std() + 1e-9)
    b = (b - b.mean()) / (b.std() + 1e-9)
    n = min(len(a), len(b))
    a, b = a[:n], b[:n]
    lags = range(-max_lag, max_lag + 1)
    cs = [np.dot(a[max(0, -l):n - max(0, l)], b[max(0, l):n - max(0, -l)]) / (n - abs(l)) for l in lags]
    k = int(np.argmax(cs))
    return list(lags)[k], float(cs[k]), float(np.median(cs))


def recorte_baixo(arq):
    v = next(s for s in sondar(arq)['streams'] if s['codec_type'] == 'video')
    w, h = int(v['width']), int(v['height'])
    if h >= 1900:                     # vídeo do modelo: câmera na metade de baixo (abaixo de 964 px)
        return f'{w}:{h - 964}:0:964'
    return f'{w}:{h // 2}:0:{h // 2}'


def comparar(orig, final, inicio, janela=8.0):
    dur_final = float(sondar(final)['format']['duration'])
    rec = recorte_baixo(final)
    pontos = [p for p in np.linspace(1.0, max(1.0, dur_final - janela - 1.0), 4)]
    print(f'comparando em {len(pontos)} trechos de {janela:.0f} s (lag máx. ±1 s)')
    res = []
    for p in pontos:
        a0 = audio(orig, inicio + p, janela)
        a1 = audio(final, p, janela)
        la, ca, _ = atraso(envelope(a0, SR, 200), envelope(a1, SR, 200), 200)      # 5 ms de resolução
        m0 = movimento(orig, inicio + p, janela)
        m1 = movimento(final, p, janela, rec)
        lv, cv, _ = atraso(m0, m1, FPS)
        da, dv = la * 5.0, lv * 1000.0 / FPS
        res.append(da - dv)
        print(f'  {p:6.1f} s: voz andou {da:+6.0f} ms, imagem andou {dv:+6.0f} ms  →  voz {"ATRASADA" if da - dv > 0 else "adiantada"} {abs(da - dv):4.0f} ms  (confiança voz {ca:.2f}, imagem {cv:.2f})')
    res = np.array(res)
    print(f'descasamento médio: {res.mean():+.0f} ms (variação {res.min():+.0f} a {res.max():+.0f} ms)')
    if res.max() - res.min() > 70:
        print('a diferença muda ao longo do vídeo: é DERIVA (ritmo variável). Refaça a montagem com o render.py em vez de só deslocar.')
    elif abs(res.mean()) > 40:
        print(f'corrija com: python ferramentas/video/sincronia.py corrigir "{final}" --ms {res.mean():.0f}')
    else:
        print('sincronia ok.')


def estimar(final):
    rec = recorte_baixo(final)
    env = envelope(audio(final), SR)
    mov = movimento(final, recorte=rec)
    n = min(len(env), len(mov))
    # positivo = a voz vem DEPOIS do movimento (voz atrasada)
    lag, c, med = atraso(mov[:n], env[:n], 15)
    ms = lag * 1000.0 / FPS
    print(f'estimativa: voz {"ATRASADA" if ms > 0 else "adiantada"} cerca de {abs(ms):.0f} ms (pico {c:.2f}, fundo {med:.2f})')
    if c - med < 0.08:
        print('pico fraco: não confie no número; confira no olho (sílabas com p, b, m fecham a boca).')


def corrigir(final, ms, saida):
    saida = saida or str(pathlib.Path(final).with_name(pathlib.Path(final).stem + '-sinc.mp4'))
    s = abs(ms) / 1000.0
    af = f'atrim=start={s:.3f},asetpts=PTS-STARTPTS' if ms > 0 else f'adelay={abs(ms):.0f}:all=1'
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(final), '-map', '0:v', '-map', '0:a', '-c:v', 'copy',
                    '-af', af, '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', saida], check=True)
    print('salvo:', saida)


# ====================================================================== conferir (cortes + velocidade)
W_CAM, H_CAM, TOPO_CAM = 1080, 956, 964


def _grav(tf, inicio, cortes, vel):
    """tempo do vídeo final → tempo da gravação bruta"""
    t = tf * vel
    for a, b in sorted(cortes):
        if t >= a:
            t += b - a
    return t + inicio


def _filtro_grav(zoom, cy):
    """o mesmo recorte que o render.py faz da gravação (metade de baixo do final)"""
    if zoom >= 1:
        lw, lh = int(W_CAM * zoom) // 2 * 2, int(H_CAM * zoom) // 2 * 2
        return (f"scale={lw}:{lh}:force_original_aspect_ratio=increase,"
                f"crop={W_CAM}:{H_CAM}:(iw-{W_CAM})/2:'max(0,min(ih-{H_CAM},ih*{cy}-{H_CAM}/2))'"), f'crop={W_CAM}:{H_CAM}:0:{TOPO_CAM}'
    fw = int(W_CAM * zoom) // 2 * 2
    return (f"scale={fw}:-2,crop={fw}:{H_CAM}:0:'max(0,min(ih-{H_CAM},ih*{cy}-{H_CAM}/2))'",
            f'crop={fw}:{H_CAM}:({W_CAM}-{fw})/2:{TOPO_CAM}')


def _difs(arq, t0, dur, vf, fps):
    q = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t0:.3f}', '-i', str(arq), '-t', f'{dur:.3f}', '-an', '-vf',
                                      vf + f',fps={fps},scale=48:48,format=gray', '-f', 'rawvideo', '-'],
                                     capture_output=True).stdout, np.uint8).astype(np.float32).reshape(-1, 48 * 48)
    return np.diff(q, axis=0)


def _norm(m):
    m = m - m.mean(1, keepdims=True)
    return m / (np.linalg.norm(m, axis=1, keepdims=True) + 1e-6)


def _env(arq, t0, dur, passo):
    x = np.frombuffer(subprocess.run(
        ['ffmpeg', '-v', 'error', '-ss', f'{t0:.3f}', '-i', str(arq), '-t', f'{dur:.3f}', '-vn', '-ac', '1', '-ar', '16000',
         '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
    n = len(x) // passo
    return np.log(np.sqrt((x[:n * passo].reshape(n, passo) ** 2).mean(1)) + 1e-4)


def medir_ponto(orig, final, tf, inicio, cortes, vel, zoom, cy, fps=FPS):
    """(imagem_ms, voz_ms, conf_img, conf_voz) no instante tf do final. imagem_ms > 0: o quadro do final mostra um
    instante da gravação MAIS TARDE do que deveria (imagem adiantada); voz_ms > 0: a voz toca um instante mais tarde
    (voz adiantada). O descasamento é imagem_ms - voz_ms (> 0 = voz atrasada em relação à boca)."""
    tr = _grav(tf, inicio, cortes, vel)
    vf_g, vf_f = _filtro_grav(zoom, cy)
    f = _norm(_difs(final, tf, 1.5, vf_f, fps))
    sub = 10                                            # gravação a 10× o fps: passos de 3,3 ms
    o = _difs(orig, tr - .6, 1.5 * vel + 1.2, vf_g, fps * sub)
    passo = int(round(sub * vel))
    melhor_i = []
    for L in range(-60, 61, 2):                        # ±200 ms
        idx = [int(round(.6 * fps * sub + L + k * vel * sub)) for k in range(len(f))]
        if min(idx) < 0 or max(idx) + passo > len(o):
            continue
        g = _norm(np.array([o[i:i + passo].sum(0) for i in idx]))
        melhor_i.append((float((f * g).sum(1).mean()), L))
    melhor_i.sort(reverse=True)
    a1 = _env(final, tf, 1.5, 80)                       # 5 ms do final
    e0 = _env(orig, tr - .5, 1.5 * vel + 1.0, 8)        # 0,5 ms da gravação
    k = int(round(10 * vel))
    melhor_v = []
    for L in range(-400, 401, 4):                       # ±200 ms
        idx = (1000 + L + np.arange(len(a1)) * 10 * vel).astype(int)
        if idx.min() < 0 or idx.max() + k >= len(e0):
            continue
        g = np.array([e0[i:i + k].mean() for i in idx])
        melhor_v.append((float(np.corrcoef(a1, g)[0, 1]), L))
    melhor_v.sort(reverse=True)
    return (melhor_i[0][1] * 1000 / (fps * sub), melhor_v[0][1] * .5, melhor_i[0][0], melhor_v[0][0])


def pontos_meio(dur, inicio, cortes, vel, n=8):
    """instantes do final no meio de trechos mantidos (longe das emendas), espalhados pelo vídeo"""
    q = lambda x: round(x * FPS) / FPS
    trechos, t0 = [], 0.0
    for a, b in sorted((q(a), q(b)) for a, b in cortes):
        if a > t0:
            trechos.append((t0, a))
        t0 = max(t0, b)
    trechos.append((t0, t0 + dur * vel - sum(b - a for a, b in trechos)))
    pts, acc = [], 0.0
    for a, b in trechos:
        if (b - a) / vel > 2.6:
            pts.append((acc + (b - a) / 2) / vel - .75)
        acc += b - a
    pts = [p for p in pts if 0 < p < dur - 1.6]
    if len(pts) > n:
        pts = [pts[round(i * (len(pts) - 1) / (n - 1))] for i in range(n)]
    return pts


def conferir(orig, final, inicio, cortes, vel, zoom, cy, mostrar=True):
    """mede em vários pontos e devolve a mediana do descasamento em ms (> 0 = voz atrasada) ou None"""
    dur = float(sondar(final)['format']['duration'])
    res = []
    for tf in pontos_meio(dur, inicio, cortes, vel):
        im, vz, ci, cv = medir_ponto(orig, final, tf, inicio, cortes, vel, zoom, cy)
        ok = ci > .6 and cv > .6
        if mostrar:
            print(f'  final {tf:5.1f} s: imagem {im:+4.0f} ms · voz {vz:+4.0f} ms · descasamento {im - vz:+4.0f} ms'
                  f' (conf. {ci:.2f}/{cv:.2f}{"" if ok else ", ignorado"})')
        if ok:
            res.append(im - vz)
    if not res:
        print('  sem pontos confiáveis: confira no olho')
        return None
    m = float(np.median(res))
    print(f'  mediana: {"voz atrasada" if m > 0 else "voz adiantada"} {abs(m):.0f} ms em {len(res)} pontos'
          f' (espalhamento {np.ptp(res):.0f} ms)')
    return m


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    d = sub.add_parser('diagnostico'); d.add_argument('arq')
    c = sub.add_parser('comparar'); c.add_argument('original'); c.add_argument('final'); c.add_argument('--inicio', type=float, default=0.0)
    e = sub.add_parser('estimar'); e.add_argument('final')
    k = sub.add_parser('corrigir'); k.add_argument('final'); k.add_argument('--ms', type=float, required=True); k.add_argument('--saida')
    f = sub.add_parser('conferir', help='com cortes e velocidade: lê saida/NOME/info.json'); f.add_argument('nome'); f.add_argument('--camera', required=True)
    a = ap.parse_args()
    if a.cmd == 'diagnostico':
        diagnostico(a.arq)
    elif a.cmd == 'comparar':
        comparar(a.original, a.final, a.inicio)
    elif a.cmd == 'estimar':
        estimar(a.final)
    elif a.cmd == 'conferir':
        pasta = pathlib.Path(__file__).resolve().parent / 'saida' / a.nome
        info = json.loads((pasta / 'info.json').read_text())
        conferir(a.camera, pasta / f'{a.nome}.mp4', info['inicio'], info.get('cortes', []), info.get('meta', {}).get('velocidade') or 1,
                 info.get('camera_zoom', 1.0), info.get('camera_y', .5))
    else:
        corrigir(a.final, a.ms, a.saida)


if __name__ == '__main__':
    sys.exit(main())

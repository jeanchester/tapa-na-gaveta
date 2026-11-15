"""Confere e corrige áudio descasado (voz adiantada ou atrasada em relação à boca).

  python ferramentas/video/sincronia.py diagnostico bruto.MOV
      ritmo de quadros variável, áudio que começa depois do vídeo, rotação: as causas comuns do descasamento

  python ferramentas/video/sincronia.py comparar bruto.MOV final.mp4 --inicio 2.4
      compara o vídeo final com a gravação original em vários trechos: mede quanto a voz andou e quanto a
      imagem da câmera andou; a diferença é o descasamento (em ms). Constante = deslocamento; crescendo = deriva.

  python ferramentas/video/sincronia.py estimar final.mp4
      sem a gravação original: cruza o volume da voz com o movimento da metade de baixo (quem fala mexe a
      cabeça e a boca junto com a fala). Dá uma estimativa; confirme no olho antes de corrigir.

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


def pontos_roteiro(nome, fps=FPS):
    """Com cortes ou ordem, as janelas têm de cair dentro de um trecho mantido, senão a comparação mistura
    pedaços diferentes da gravação. Lê saida/NOME/info.json (gravado pelo render.py) e devolve uma janela por
    trecho, dos mais longos: [(tempo no final, tempo na gravação, duração)]."""
    info = json.loads((pathlib.Path(__file__).resolve().parent / 'saida' / nome / 'info.json').read_text())
    ini, dur = info.get('inicio', 0.0), info['duracao']
    q = lambda x: round(x * fps) / fps
    if info.get('ordem'):
        trechos = [(q(a), q(b)) for a, b in info['ordem']]
    else:
        trechos, t0 = [], 0.0
        for a, b in sorted((q(a), q(b)) for a, b in info.get('cortes', [])):
            if a > t0:
                trechos.append((t0, a))
            t0 = max(t0, b)
        trechos.append((t0, t0 + dur - sum(b - a for a, b in trechos)))
    janelas, acc = [], 0.0
    for a, b in trechos:
        n = b - a
        if n >= 4:
            j = min(8.0, n - 1.0)
            janelas.append((acc + (n - j) / 2, ini + a + (n - j) / 2, j))
        acc += n
    janelas.sort(key=lambda x: -x[2])
    return sorted(janelas[:5])


def comparar(orig, final, inicio, janela=8.0, roteiro=None):
    dur_final = float(sondar(final)['format']['duration'])
    rec = recorte_baixo(final)
    if roteiro:
        js = pontos_roteiro(roteiro)
    else:
        js = [(p, inicio + p, janela) for p in np.linspace(1.0, max(1.0, dur_final - janela - 1.0), 4)]
    print(f'comparando em {len(js)} trechos de até {janela:.0f} s (lag máx. ±1 s)')
    res = []
    for p, p0, janela in js:
        a0 = audio(orig, p0, janela)
        a1 = audio(final, p, janela)
        la, ca, _ = atraso(envelope(a0, SR, 200), envelope(a1, SR, 200), 200)      # 5 ms de resolução
        m0 = movimento(orig, p0, janela)
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


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest='cmd', required=True)
    d = sub.add_parser('diagnostico'); d.add_argument('arq')
    c = sub.add_parser('comparar'); c.add_argument('original'); c.add_argument('final'); c.add_argument('--inicio', type=float, default=0.0)
    c.add_argument('--roteiro', help='NOME do roteiro renderizado: usa inicio, cortes e ordem de saida/NOME/info.json')
    e = sub.add_parser('estimar'); e.add_argument('final')
    k = sub.add_parser('corrigir'); k.add_argument('final'); k.add_argument('--ms', type=float, required=True); k.add_argument('--saida')
    a = ap.parse_args()
    if a.cmd == 'diagnostico':
        diagnostico(a.arq)
    elif a.cmd == 'comparar':
        comparar(a.original, a.final, a.inicio, roteiro=a.roteiro)
    elif a.cmd == 'estimar':
        estimar(a.final)
    else:
        corrigir(a.final, a.ms, a.saida)


if __name__ == '__main__':
    sys.exit(main())

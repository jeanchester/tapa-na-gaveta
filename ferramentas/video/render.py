"""Renderiza um roteiro do modelo de vídeo e monta o vídeo final do TikTok (1080×1920).

Uso:
  python ferramentas/video/render.py exemplo-degola                     só a animação (1080×964) + efeitos e trilha
  python ferramentas/video/render.py NOME --camera bruto.MOV            vídeo final: animação em cima, câmera embaixo
  python ferramentas/video/render.py NOME --camera bruto.MOV --inicio 2.4 --vol-trilha 0.10
  python ferramentas/video/render.py NOME --camera bruto.MOV --variante B         uma versão do roteiro (ver "variantes")
  python ferramentas/video/render.py NOME --camera bruto.MOV --variante todas     todas as versões, uma depois da outra

Saída em ferramentas/video/saida/NOME/ (ou NOME-B/ para a variante B): animacao.mp4, efeitos.wav, trilha.wav,
experimento.json (fator e nível testados) e NOME.mp4 (final).
O áudio da câmera nunca é deslocado à parte: corte e ritmo de quadros valem para som e imagem juntos,
e no fim o sincronia.py confere a voz contra a boca (ver SKILL.md). Precisa de Playwright e ffmpeg.
"""
import argparse
import base64
import datetime
import json
import pathlib
import re
import shutil
import subprocess
import sys

AQUI = pathlib.Path(__file__).resolve().parent
W, H_ANIM, H_TOTAL = 1080, 964, 1920
FONTES = AQUI / 'fontes'


def run(cmd):
    print('$', ' '.join(str(c) for c in cmd), flush=True)
    subprocess.run([str(c) for c in cmd], check=True)


def abrir(p, nome, variante, guia):
    url = (AQUI / 'modelo.html').as_uri() + f'?r={nome}&render' + ('&guia' if guia else '') + (f'&v={variante}' if variante else '')
    nav = p.chromium.launch()
    pg = nav.new_page(viewport={'width': W, 'height': H_ANIM}, device_scale_factor=1)
    erros = []
    pg.on('pageerror', lambda e: erros.append(str(e)))
    pg.goto(url)
    pg.wait_for_function('window.VIDEO && window.VIDEO.duracao > 0', timeout=15000)
    avisos = pg.evaluate('VIDEO.pronto()')
    if avisos or erros:
        print('ATENÇÃO:', avisos, erros)
    return nav, pg


def variantes(nome):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        nav, pg = abrir(p, nome, None, False)
        vs = pg.evaluate('VIDEO.meta()')['variantes']
        nav.close()
    return vs


def animar(nome, saida, fps, guia, variante=None, base=None):
    """Gera animacao.mp4 e os WAV. Se a variante só muda o vídeo (legenda, fator...), copia a animação da base."""
    from playwright.sync_api import sync_playwright
    arq = saida / 'animacao.mp4'
    with sync_playwright() as p:
        nav, pg = abrir(p, nome, variante, guia)
        meta = pg.evaluate('VIDEO.meta()')
        dur = pg.evaluate('VIDEO.duracao')
        inicio = pg.evaluate('VIDEO.inicio()')
        cortes = pg.evaluate('VIDEO.cortes()')
        if variante and not meta['mudaAnimacao'] and base and (base / 'animacao.mp4').exists() and not guia:
            nav.close()
            for f in ('animacao.mp4', 'efeitos.wav', 'trilha.wav'):
                shutil.copy(base / f, saida / f)
            print('animação igual à da versão base: reaproveitada de', base)
            return dur, inicio, cortes, meta
        n = int(round(dur * fps))
        ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', str(fps), '-c:v', 'mjpeg', '-i', '-',
                               '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', str(fps), str(arq)],
                              stdin=subprocess.PIPE)
        for q in range(n):
            pg.evaluate(f'VIDEO.ir({q / fps})')
            ff.stdin.write(pg.screenshot(type='jpeg', quality=95, clip={'x': 0, 'y': 0, 'width': W, 'height': H_ANIM}))
            if q % (fps * 5) == 0:
                print(f'  quadro {q}/{n}', flush=True)
        ff.stdin.close()
        ff.wait()
        for q in ('sfx', 'trilha'):
            (saida / ('efeitos.wav' if q == 'sfx' else 'trilha.wav')).write_bytes(base64.b64decode(pg.evaluate(f'VIDEO.wav("{q}")')))
        nav.close()
    return dur, inicio, cortes, meta


# ====================================================================== legenda na tela
def sem_cortes(t, cortes):
    d = 0.0
    for a, b in sorted(cortes):
        if t >= b:
            d += b - a
        elif t > a:
            return None                      # palavra dentro de um corte: sai da legenda
    return t - d


def palavras(meta):
    """[(palavra, início, fim)] no tempo da gravação (depois do inicio). T dá o tempo de cada palavra;
    fala ([de, até, 'texto']) reparte o trecho pelas palavras conforme o tamanho delas."""
    out = []
    if meta.get('fala'):
        for ini, fim, texto in meta['fala']:
            ps = texto.split()
            if not ps:
                continue
            pesos = [len(re.sub(r'\W', '', p)) + 2 for p in ps]
            tot, acc = sum(pesos), 0
            for p, w in zip(ps, pesos):
                out.append((p, ini + (fim - ini) * acc / tot, ini + (fim - ini) * (acc + w) / tot))
                acc += w
    elif meta.get('T'):
        T = meta['T']
        for i, (p, t) in enumerate(T):
            fim = T[i + 1][1] if i + 1 < len(T) else t + .5
            out.append((p, t, min(fim, t + .8)))
    return out


def ass_tempo(t):
    cs = max(0, round(t * 100))
    return f'{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}'


def legenda_ass(meta, cortes, arq, y=1030, max_pal=4, max_letras=20):
    """Legenda queimada no estilo do site: Archivo extra negrito, tinta clara com contorno azul-noite,
    números em dourado, até 4 palavras (20 letras) por vez, cada bloco entra com um pulo curto."""
    ps = []
    for p, a, b in palavras(meta):
        ma, mb = sem_cortes(a, cortes), sem_cortes(b, cortes)
        if ma is None:
            continue
        ps.append((p, ma, mb if mb is not None else ma + .3))
    blocos, atual = [], []
    for p, a, b in ps:
        if atual and (len(atual) >= max_pal or len(' '.join(x[0] for x in atual + [(p,)])) > max_letras
                      or a - atual[-1][2] > .35):
            blocos.append(atual)
            atual = []
        atual.append((p, a, b))
        if re.search(r'[.!?,;:]$', p) and atual[-1][2] - atual[0][1] >= .45:     # pontuação fecha o bloco (se não ficar curto demais)
            blocos.append(atual)
            atual = []
    if atual:
        blocos.append(atual)
    cab = (f'[Script Info]\nScriptType: v4.00+\nPlayResX: {W}\nPlayResY: {H_TOTAL}\nWrapStyle: 0\nScaledBorderAndShadow: yes\n\n'
           '[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, '
           'Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n'
           f'Style: Fala,Archivo Legenda,86,&H00FBF6F4,&H00FBF6F4,&H0040160B,&H00000000,0,0,0,0,100,100,1,0,1,8,0,2,140,140,{H_TOTAL - y},1\n\n'
           '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n')
    linhas = []
    for i, bl in enumerate(blocos):
        ini = bl[0][1]
        fim = min(bl[-1][2] + .25, blocos[i + 1][0][1] if i + 1 < len(blocos) else bl[-1][2] + .6)
        if fim - ini < .12:
            continue
        txt = ' '.join(re.sub(r'[,;:]$', '', p) for p, _, _ in bl)
        txt = re.sub(r'(\d[\d,.%º×x-]*)', r'{\\c&H3DC2FF&}\1{\\c&H00FBF6F4&}', txt)   # números em dourado (#ffc23d)
        linhas.append(f'Dialogue: 0,{ass_tempo(ini)},{ass_tempo(fim)},Fala,,0,0,0,,'
                      '{\\fscx88\\fscy88\\t(0,90,\\fscx100\\fscy100)}' + txt)
    arq.write_text(cab + '\n'.join(linhas) + '\n', encoding='utf-8')
    return len(linhas)


def hdr(camera):
    v = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=color_transfer', '-of', 'csv=p=0', str(camera)],
                       capture_output=True, text=True).stdout
    v = (v.strip().split(',') or [''])[0]               # ffprobe pode devolver "arib-std-b67," (com vírgula)
    return v in ('arib-std-b67', 'smpte2084')          # HLG (iPhone) ou PQ


def montar(saida, nome, camera, inicio, dur, fps, vol_voz, vol_sfx, vol_trilha, zoom=1.0, cy=0.5, cortes=(), legenda=None):
    final = saida / f'{nome}.mp4'
    tem_audio = bool(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', str(camera)],
                                    capture_output=True, text=True).stdout.strip())
    h_cam = H_TOTAL - H_ANIM
    # câmera: -ss antes do -i corta som e imagem juntos; ritmo constante (o iPhone grava com ritmo variável);
    # o áudio é reamostrado com async=1 e first_pts=0, que preenche buracos sem empurrar a voz para frente ou para trás
    # zoom > 1 aproxima o rosto; cy = altura do centro do recorte (0 = topo, 1 = base da gravação)
    lw, lh = int(W * zoom) // 2 * 2, int(h_cam * zoom) // 2 * 2
    # iPhone grava em HDR (HLG): sem converter para SDR a cor sai lavada/estranha no TikTok
    cor = ('zscale=t=linear:npl=203,format=gbrpf32le,zscale=p=bt709,tonemap=tonemap=mobius:desat=0,'
           'zscale=t=bt709:m=bt709:r=tv,format=yuv420p,') if hdr(camera) else ''
    if zoom >= 1:
        base_v = (f'[1:v]{cor}fps={fps},scale={lw}:{lh}:force_original_aspect_ratio=increase,'
                  f"crop={W}:{h_cam}:(iw-{W})/2:'max(0,min(ih-{h_cam},ih*{cy}-{h_cam}/2))',setsar=1")
    else:
        # zoom < 1 afasta a câmera para caber mais do corpo (escudo da camisa): a gravação inteira encolhe e as laterais
        # que sobram são preenchidas com a própria imagem desfocada (a parede lisa some no fundo)
        fw = int(W * zoom) // 2 * 2
        base_v = (f'[1:v]{cor}fps={fps},split[s0][s1];'
                  f'[s0]scale={W}:{h_cam}:force_original_aspect_ratio=increase,crop={W}:{h_cam},gblur=sigma=40[bg];'
                  f"[s1]scale={fw}:-2,crop={fw}:{h_cam}:0:'max(0,min(ih-{h_cam},ih*{cy}-{h_cam}/2))'[fg];"
                  f'[bg][fg]overlay=(W-w)/2:0,setsar=1')
    base_a = f'[1:a]aresample=48000:async=1:first_pts=0,volume={vol_voz}'
    mix = []
    if cortes:
        # cortes no meio da fala: cada trecho mantido sai junto em som e imagem (limites no quadro exato,
        # para não acumular atraso entre os trechos) e o som ganha 20 ms de fade nas emendas (sem estalo)
        q = lambda x: round(x * fps) / fps
        cs = sorted((q(a), q(b)) for a, b in cortes)
        partes, ini = [], 0.0
        for a, b in cs:
            if a > ini:
                partes.append((ini, a))
            ini = max(ini, b)
        partes.append((ini, None))
        k = len(partes)
        spf = 48000 // fps                       # amostras de áudio por quadro (48 kHz / 30 = 1600)
        # imagem: tira os quadros dos cortes pelo número do quadro e renumera (sem filtro concat, que atrasava
        # a imagem 2 a 3 quadros depois da primeira emenda); som: os mesmos trechos, contados em amostras
        fora = '+'.join(f'between(n,{round(a * fps)},{round(b * fps) - 1})' for a, b in cs)
        filtro = base_v + f",select='not({fora})',setpts=N/({fps}*TB)[cam];"
        if tem_audio:
            filtro += base_a + f',asplit={k}' + ''.join(f'[a{i}]' for i in range(k)) + ';'
            pares = ''
            for i, (a, b) in enumerate(partes):
                fa, fb = round(a * fps), (round(b * fps) if b is not None else None)
                fima = f':end_sample={fb * spf}' if fb is not None else ''
                fo = f',afade=t=out:st={(fb - fa) / fps - .02:.4f}:d=0.02' if fb is not None else ''
                filtro += f'[a{i}]atrim=start_sample={fa * spf}{fima},asetpts=PTS-STARTPTS,afade=t=in:d=0.02{fo}[ca{i}];'
                pares += f'[ca{i}]'
            filtro += pares + f'concat=n={k}:v=0:a=1[voz];'
    else:
        filtro = base_v + '[cam];'
        if tem_audio:
            filtro += base_a + '[voz];'
    # legenda (variante com legenda na tela): queimada por cima do quadro inteiro, já no tempo do vídeo final
    leg = f",ass=filename='{legenda}':fontsdir='{FONTES}'" if legenda else ''
    filtro += f'[0:v][cam]vstack=inputs=2{leg},format=yuv420p[v];'
    if tem_audio:
        mix.append('[voz]')
    filtro += f'[2:a]volume={vol_sfx}[sfx];[3:a]volume={vol_trilha}[tri];'
    mix += ['[sfx]', '[tri]']
    filtro += ''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=longest,alimiter=limit=0.95[a]'
    run(['ffmpeg', '-y', '-loglevel', 'error', '-i', saida / 'animacao.mp4', '-ss', f'{inicio:.3f}', '-i', camera,
         '-i', saida / 'efeitos.wav', '-i', saida / 'trilha.wav', '-filter_complex', filtro, '-map', '[v]', '-map', '[a]',
         '-t', f'{dur:.3f}', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-r', str(fps),
         '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
         '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', final])
    return final


def gerar(a, variante):
    pasta = a.nome + (f'-{variante}' if variante else '')
    saida = AQUI / 'saida' / pasta
    saida.mkdir(parents=True, exist_ok=True)
    base = AQUI / 'saida' / a.nome
    if a.pular_animacao and (saida / 'animacao.mp4').exists():
        info = json.loads((saida / 'info.json').read_text())
        dur, inicio, cortes, meta = info['duracao'], info['inicio'], info.get('cortes', []), info.get('meta', {})
    else:
        dur, inicio, cortes, meta = animar(a.nome, saida, a.fps, a.guia, variante, base)
        (saida / 'info.json').write_text(json.dumps({'duracao': dur, 'inicio': inicio, 'cortes': cortes, 'meta': meta}, ensure_ascii=False))
    if a.inicio is not None:
        inicio = a.inicio
    legenda = None
    if a.legenda or meta.get('legenda'):
        cfg = meta.get('legenda') if isinstance(meta.get('legenda'), dict) else {}
        legenda = saida / 'legenda.ass'
        n = legenda_ass(meta, cortes, legenda, y=a.legenda_y or cfg.get("y", 1030))
        print(f'legenda: {n} blocos' + ('' if n else ' (ATENÇÃO: roteiro sem "fala" nem "T", a legenda saiu vazia)'))
    exp = {'roteiro': a.nome, 'variante': variante or 'A', 'fator': meta.get('fator'), 'nivel': meta.get('nivel'),
           'legenda': bool(legenda), 'duracao_s': round(dur, 1), 'gerado_em': datetime.datetime.now().isoformat(timespec='minutes')}
    (saida / 'experimento.json').write_text(json.dumps(exp, ensure_ascii=False, indent=1))
    if not a.camera:
        print('animação pronta:', saida / 'animacao.mp4')
        return
    final = montar(saida, pasta, pathlib.Path(a.camera), inicio, dur, a.fps, a.vol_voz, a.vol_sfx, a.vol_trilha,
                   a.camera_zoom, a.camera_y, cortes, legenda)
    print('vídeo final:', final, '·', exp['fator'] or 'sem fator', '=', exp['nivel'] or '-')
    print('confira a sincronia:', f'python ferramentas/video/sincronia.py comparar "{a.camera}" "{final}" --inicio {inicio}')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('nome', help='roteiro em ferramentas/video/roteiros/NOME.js')
    ap.add_argument('--camera', help='gravação da câmera (vai na metade de baixo)')
    ap.add_argument('--inicio', type=float, help='segundos a cortar do começo da câmera (padrão: "inicio" do roteiro)')
    ap.add_argument('--fps', type=int, default=30)
    ap.add_argument('--vol-voz', type=float, default=1.0)
    ap.add_argument('--vol-sfx', type=float, default=0.55)
    ap.add_argument('--vol-trilha', type=float, default=0.12)
    ap.add_argument('--camera-zoom', type=float, default=1.0, help='aproxima (ex.: 1.15) ou afasta (ex.: 0.8, laterais desfocadas) a câmera; 0.8 com --camera-y 0.62 cabe rosto e escudo da camisa')
    ap.add_argument('--camera-y', type=float, default=0.5, help='centro vertical do recorte da câmera, 0 a 1 (rosto alto: 0.45)')
    ap.add_argument('--variante', help='letra da variante do roteiro (B, C...), A = roteiro base, "todas" = base e todas as variantes')
    ap.add_argument('--legenda', action='store_true', help='queima a legenda da fala mesmo sem variante')
    ap.add_argument('--legenda-y', type=int, help='linha de base da legenda em px (padrão 1030: na emenda entre a animação e a câmera, longe da boca e da descrição do TikTok)')
    ap.add_argument('--guia', action='store_true', help='desenha a área segura (só para conferir, não para postar)')
    ap.add_argument('--pular-animacao', action='store_true', help='reaproveita animacao.mp4 e os WAV já gerados')
    a = ap.parse_args()
    if a.variante == 'todas':
        vs = variantes(a.nome)
        for v in [None] + [v for v in vs if v != 'A']:
            print(f'\n=== versão {v or "A"} ===', flush=True)
            gerar(a, v)
    else:
        gerar(a, None if a.variante in (None, 'A') else a.variante)


if __name__ == '__main__':
    sys.exit(main())

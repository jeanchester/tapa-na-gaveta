"""Renderiza um roteiro do modelo de vídeo e monta o vídeo final do TikTok (1080×1920).

Uso:
  python ferramentas/video/render.py exemplo-degola                     só a animação (1080×964) + efeitos e trilha
  python ferramentas/video/render.py NOME --camera bruto.MOV            vídeo final: animação em cima, câmera embaixo
  python ferramentas/video/render.py NOME --camera bruto.MOV --inicio 2.4 --vol-trilha 0.10

Saída em ferramentas/video/saida/NOME/: animacao.mp4, efeitos.wav, trilha.wav e NOME.mp4 (final).
O áudio da câmera nunca é deslocado à parte: corte e ritmo de quadros valem para som e imagem juntos,
e no fim o sincronia.py confere a voz contra a boca (ver SKILL.md). Precisa de Playwright e ffmpeg.
"""
import argparse
import base64
import json
import pathlib
import subprocess
import sys

AQUI = pathlib.Path(__file__).resolve().parent
W, H_ANIM, H_TOTAL = 1080, 964, 1920


def run(cmd):
    print('$', ' '.join(str(c) for c in cmd), flush=True)
    subprocess.run([str(c) for c in cmd], check=True)


def animar(nome, saida, fps, guia):
    from playwright.sync_api import sync_playwright
    url = (AQUI / 'modelo.html').as_uri() + f'?r={nome}&render' + ('&guia' if guia else '')
    arq = saida / 'animacao.mp4'
    with sync_playwright() as p:
        nav = p.chromium.launch()
        pg = nav.new_page(viewport={'width': W, 'height': H_ANIM}, device_scale_factor=1)
        erros = []
        pg.on('pageerror', lambda e: erros.append(str(e)))
        pg.goto(url)
        pg.wait_for_function('window.VIDEO && window.VIDEO.duracao > 0', timeout=15000)
        avisos = pg.evaluate('VIDEO.pronto()')
        if avisos or erros:
            print('ATENÇÃO:', avisos, erros)
        dur = pg.evaluate('VIDEO.duracao')
        inicio = pg.evaluate('VIDEO.inicio()')
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
    return dur, inicio


def montar(saida, nome, camera, inicio, dur, fps, vol_voz, vol_sfx, vol_trilha, zoom=1.0, cy=0.5):
    final = saida / f'{nome}.mp4'
    tem_audio = bool(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', str(camera)],
                                    capture_output=True, text=True).stdout.strip())
    h_cam = H_TOTAL - H_ANIM
    # câmera: -ss antes do -i corta som e imagem juntos; ritmo constante (o iPhone grava com ritmo variável);
    # o áudio é reamostrado com async=1 e first_pts=0, que preenche buracos sem empurrar a voz para frente ou para trás
    # zoom > 1 aproxima o rosto; cy = altura do centro do recorte (0 = topo, 1 = base da gravação)
    lw, lh = int(W * zoom) // 2 * 2, int(h_cam * zoom) // 2 * 2
    filtro = (f'[1:v]fps={fps},scale={lw}:{lh}:force_original_aspect_ratio=increase,'
              f"crop={W}:{h_cam}:(iw-{W})/2:'max(0,min(ih-{h_cam},ih*{cy}-{h_cam}/2))',setsar=1[cam];"
              f'[0:v][cam]vstack=inputs=2,format=yuv420p[v];')
    mix = []
    if tem_audio:
        filtro += f'[1:a]aresample=48000:async=1:first_pts=0,volume={vol_voz}[voz];'
        mix.append('[voz]')
    filtro += f'[2:a]volume={vol_sfx}[sfx];[3:a]volume={vol_trilha}[tri];'
    mix += ['[sfx]', '[tri]']
    filtro += ''.join(mix) + f'amix=inputs={len(mix)}:normalize=0:duration=longest,alimiter=limit=0.95[a]'
    run(['ffmpeg', '-y', '-loglevel', 'error', '-i', saida / 'animacao.mp4', '-ss', f'{inicio:.3f}', '-i', camera,
         '-i', saida / 'efeitos.wav', '-i', saida / 'trilha.wav', '-filter_complex', filtro, '-map', '[v]', '-map', '[a]',
         '-t', f'{dur:.3f}', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-r', str(fps),
         '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', final])
    return final


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('nome', help='roteiro em ferramentas/video/roteiros/NOME.js')
    ap.add_argument('--camera', help='gravação da câmera (vai na metade de baixo)')
    ap.add_argument('--inicio', type=float, help='segundos a cortar do começo da câmera (padrão: "inicio" do roteiro)')
    ap.add_argument('--fps', type=int, default=30)
    ap.add_argument('--vol-voz', type=float, default=1.0)
    ap.add_argument('--vol-sfx', type=float, default=0.55)
    ap.add_argument('--vol-trilha', type=float, default=0.12)
    ap.add_argument('--camera-zoom', type=float, default=1.0, help='aproxima a câmera (ex.: 1.15)')
    ap.add_argument('--camera-y', type=float, default=0.5, help='centro vertical do recorte da câmera, 0 a 1 (rosto alto: 0.45)')
    ap.add_argument('--guia', action='store_true', help='desenha a área segura (só para conferir, não para postar)')
    ap.add_argument('--pular-animacao', action='store_true', help='reaproveita animacao.mp4 e os WAV já gerados')
    a = ap.parse_args()

    saida = AQUI / 'saida' / a.nome
    saida.mkdir(parents=True, exist_ok=True)
    if a.pular_animacao and (saida / 'animacao.mp4').exists():
        info = json.loads((saida / 'info.json').read_text())
        dur, inicio = info['duracao'], info['inicio']
    else:
        dur, inicio = animar(a.nome, saida, a.fps, a.guia)
        (saida / 'info.json').write_text(json.dumps({'duracao': dur, 'inicio': inicio}))
    if a.inicio is not None:
        inicio = a.inicio
    if not a.camera:
        print('animação pronta:', saida / 'animacao.mp4')
        return
    final = montar(saida, a.nome, pathlib.Path(a.camera), inicio, dur, a.fps, a.vol_voz, a.vol_sfx, a.vol_trilha, a.camera_zoom, a.camera_y)
    print('vídeo final:', final)
    print('confira a sincronia:', f'python ferramentas/video/sincronia.py comparar "{a.camera}" "{final}" --inicio {inicio}')


if __name__ == '__main__':
    sys.exit(main())

# Escudos limpos para vídeo, a partir dos de midia/escudos/ (128 px, PNG de paleta com transparência de 1 bit,
# que deixa o contorno serrilhado quando o escudo aparece grande ou em cima de cor).
#
#   python ferramentas/video/escudos_limpos.py corinthians gremio vitoria          -> ferramentas/video/escudos/SLUG.png (512 px)
#   python ferramentas/video/escudos_limpos.py --lado 288 --recortar --saida /tmp/x corinthians
#
# O que faz: converte o perfil de cor embutido (P3 etc.) para sRGB, estende a cor para fora do contorno (sem halo
# escuro), amplia 4x, deixa as áreas chapadas lisas com filtro bilateral, dá nitidez leve e refaz a silhueta com
# alfa suave (borda anti-serrilhada). Não inventa detalhe: é o mesmo desenho, com borda limpa.
# Precisa de numpy, opencv-python-headless, scipy e Pillow.
import sys, os, numpy as np, cv2
from PIL import Image
from scipy import ndimage as ndi
import argparse
raiz = os.path.dirname(os.path.abspath(__file__))
ap = argparse.ArgumentParser()
ap.add_argument('slugs', nargs='+'); ap.add_argument('--lado', type=int, default=512)
ap.add_argument('--origem', default=os.path.join(raiz, '..', '..', 'midia', 'escudos')); ap.add_argument('--saida', default=os.path.join(raiz, 'escudos'))
ap.add_argument('--recortar', action='store_true', help='corta a margem vazia (para HTML com object-fit); sem isso sai quadrado')
arg = ap.parse_args(); src, dst, lado = arg.origem, arg.saida, arg.lado
os.makedirs(dst, exist_ok=True)
for slug in arg.slugs:
    im0 = Image.open(f'{src}/{slug}.png'); icc = im0.info.get('icc_profile'); im = im0.convert('RGBA')
    if icc:   # perfil de cor embutido (P3 etc.): converte para sRGB, senão a cor muda fora do navegador
        import io; from PIL import ImageCms
        al_ = im.getchannel('A'); rgb_ = ImageCms.profileToProfile(im.convert('RGB'), ImageCms.ImageCmsProfile(io.BytesIO(icc)), ImageCms.createProfile('sRGB'), outputMode='RGB')
        im = rgb_.convert('RGBA'); im.putalpha(al_)
    a = np.asarray(im).astype(np.float32) / 255
    h, w = a.shape[:2]; m = 6; S = max(h, w) + 2 * m
    c = np.zeros((S, S, 4), np.float32); y0, x0 = (S - h) // 2, (S - w) // 2; c[y0:y0+h, x0:x0+w] = a
    al = c[..., 3]; op = al > 0.5
    # cor dos pixels transparentes = cor do pixel opaco mais próximo (evita halo escuro na borda)
    idx = ndi.distance_transform_edt(~op, return_distances=False, return_indices=True)
    rgb = c[..., :3][idx[0], idx[1]]
    K = 4; N = S * K
    up = cv2.resize(rgb, (N, N), interpolation=cv2.INTER_LANCZOS4)
    up = np.clip(up, 0, 1)
    # áreas chapadas e bordas internas nítidas: filtro bilateral + máscara de nitidez
    u8 = (up * 255).astype(np.uint8)
    bf = cv2.bilateralFilter(u8, 9, 28, 5).astype(np.float32) / 255
    bl = cv2.GaussianBlur(bf, (0, 0), 2.2)
    up = np.clip(bf + 0.55 * (bf - bl), 0, 1)
    # silhueta: alfa ampliado, desfocado e recortado com curva suave -> contorno liso e anti-serrilhado
    A = cv2.resize(op.astype(np.float32), (N, N), interpolation=cv2.INTER_CUBIC)
    A = cv2.GaussianBlur(A, (0, 0), 1.9)
    A = np.clip((A - 0.5) / 0.16 + 0.5, 0, 1); A = A * A * (3 - 2 * A)
    out = np.dstack([up, A])
    # reduz para o lado final com média de área (sem serrilhar)
    o = cv2.resize(out * np.dstack([A, A, A, np.ones_like(A)]), (lado, lado), interpolation=cv2.INTER_AREA)
    al2 = o[..., 3:4]; rgb2 = np.where(al2 > 1e-4, o[..., :3] / np.maximum(al2, 1e-4), 0)
    fin = np.dstack([np.clip(rgb2, 0, 1), al2])
    img = Image.fromarray((fin * 255 + 0.5).astype(np.uint8), 'RGBA')
    if arg.recortar:
        bb = img.getchannel('A').point(lambda v: 255 if v > 2 else 0).getbbox()   # recorta a margem vazia (+2 px)
        img = img.crop((max(0, bb[0] - 2), max(0, bb[1] - 2), min(lado, bb[2] + 2), min(lado, bb[3] + 2)))
    img.save(f'{dst}/{slug}.png', optimize=True)
    print(slug, im.size, '->', img.size)

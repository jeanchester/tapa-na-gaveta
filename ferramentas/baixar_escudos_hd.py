"""Escudos em alta para as animações, imagens de compartilhar e vídeo.

Os escudos de lista (midia/escudos/<slug>.png, 128 px) continuam como estão. Este script baixa a versão
de 500 px da ESPN de cada time que aparece em dados/*.json (campo logo_espn), recorta a sobra
transparente, centraliza num quadrado com respiro igual para todos e grava
midia/escudos/hd/<slug>.webp (256 px, cabe em 3x num escudo de 80 px na tela).

    python ferramentas/baixar_escudos_hd.py            # só os que faltam
    python ferramentas/baixar_escudos_hd.py --forcar   # todos de novo

Se a ESPN falhar para um time, o site usa o PNG de 128 px (o carregador já cai para ele).
Times cujo escudo da ESPN não bate com o nosso (versão antiga, por exemplo) vão em MANTER: para eles
o HD é gerado a partir do PNG de 128 px, então nada muda na aparência.
"""
import glob
import io
import json
import os
import sys
import urllib.request

from PIL import Image

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
DESTINO = os.path.join(RAIZ, 'midia', 'escudos', 'hd')
LADO = 256
RESPIRO = 0.06          # fração do lado livre em cada borda (o escudo ocupa 88%)
MANTER = set()          # slugs em que a ESPN mostra outro escudo; preenchido depois de conferir a folha


def times():
    vistos = {}
    for arq in sorted(glob.glob(os.path.join(RAIZ, 'dados', '*.json'))):
        try:
            d = json.load(open(arq, encoding='utf-8'))
        except Exception:  # noqa: BLE001
            continue
        if not isinstance(d, dict) or not isinstance(d.get('times'), list):
            continue
        for t in d['times']:
            if t.get('escudo') and t.get('logo_espn') and t['escudo'] not in vistos:
                vistos[t['escudo']] = t['logo_espn']
    return vistos


def enquadrar(img):
    img = img.convert('RGBA')
    caixa = img.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    if caixa:
        img = img.crop(caixa)
    util = round(LADO * (1 - 2 * RESPIRO))
    w, h = img.size
    k = util / max(w, h)
    img = img.resize((max(1, round(w * k)), max(1, round(h * k))), Image.LANCZOS)
    tela = Image.new('RGBA', (LADO, LADO), (0, 0, 0, 0))
    tela.paste(img, ((LADO - img.width) // 2, (LADO - img.height) // 2), img)
    return tela


def baixar(url):
    url = url.replace('/soccer/500-dark/', '/soccer/500/')
    req = urllib.request.Request(url, headers={'User-Agent': 'tapa-na-gaveta/1.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return Image.open(io.BytesIO(r.read()))


def main():
    forcar = '--forcar' in sys.argv
    os.makedirs(DESTINO, exist_ok=True)
    feitos = falhas = 0
    for slug, url in sorted(times().items()):
        alvo = os.path.join(DESTINO, slug + '.webp')
        if os.path.exists(alvo) and not forcar:
            continue
        try:
            if slug in MANTER:
                img = Image.open(os.path.join(RAIZ, 'midia', 'escudos', slug + '.png'))
            else:
                img = baixar(url)
            enquadrar(img).save(alvo, 'WEBP', quality=90, method=6)
            feitos += 1
        except Exception as e:  # noqa: BLE001
            falhas += 1
            print('não saiu:', slug, e)
    print('escudos HD gravados:', feitos, '| falhas:', falhas)


if __name__ == '__main__':
    main()

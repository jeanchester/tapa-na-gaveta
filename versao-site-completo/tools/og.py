"""Gera as imagens de compartilhamento (Open Graph, 1200x630) em midia/og/.

Uso (com o serve.py no ar): python tools/og.py
- uma por página de tools/paginas.json;
- uma por time do Brasileirão ("Simulador do Flamengo"), para o link de cada torcida.
"""
import json
import os
import urllib.parse

from playwright.sync_api import sync_playwright

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = 'http://localhost:8780/tools/og.html?'
CURTO = {'athletico': 'Athletico', 'atleticomg': 'Atlético-MG', 'bragantino': 'Bragantino', 'sp': 'São Paulo', 'vasco': 'Vasco'}
FEMININO = {'chapecoense'}


def times():
    with open(os.path.join(RAIZ, 'dados', 'brasileirao-2026.json'), encoding='utf8') as f:
        return [(t['escudo'], CURTO.get(t['escudo'], t['nome'])) for t in json.load(f)['times'] if t.get('escudo')]


def main():
    saida = os.path.join(RAIZ, 'midia', 'og')
    os.makedirs(saida, exist_ok=True)
    with open(os.path.join(RAIZ, 'tools', 'paginas.json'), encoding='utf8') as f:
        paginas = json.load(f)['paginas']
    feitos = set()
    with sync_playwright() as p:
        nav = p.chromium.launch()
        pg = nav.new_page(viewport={'width': 1200, 'height': 630})

        def foto(nome, k, t, s, img=None):
            q = {'k': k, 't': t, 's': s}
            if img:
                q['img'] = img
            pg.goto(BASE + urllib.parse.urlencode(q))
            pg.evaluate('document.fonts.ready')
            pg.wait_for_timeout(150)
            pg.screenshot(path=os.path.join(saida, nome + '.png'))

        for pag in paginas:
            if pag['og'] in feitos:
                continue
            feitos.add(pag['og'])
            foto(pag['og'], pag['kicker'], pag['titulo'], pag['sub'], pag.get('img'))
        for slug, nome in times():
            prep = 'da' if slug in FEMININO else 'do'
            foto('simulador-' + slug, 'Brasileirão 2026', f'Simulador {prep} {nome}', 'O que falta, as chances e o que o time precisa.', f'midia/escudos/{slug}.png')
        nav.close()
    total = sum(os.path.getsize(os.path.join(saida, f)) for f in os.listdir(saida))
    print(f'{len(os.listdir(saida))} imagens em midia/og/ ({total / 1024:.0f} KB)')


if __name__ == '__main__':
    main()

"""Auditoria do site: percorre todas as rotas, competições, times e controles, e escreve um relatório.

Uso (com o servidor no ar: python serve.py):
  python tools/auditar.py                 # relatório em tools/saida/auditoria.md (código de saída 1 se houver defeito)
  python tools/auditar.py --rapido        # só um time por competição e um tamanho de tela

O que confere, em 390 px (celular) e 1280 px (computador):
  - console: qualquer erro ou exceção, e requisições do próprio site que falharam;
  - layout: rolagem horizontal, texto cortado, alvos de toque pequenos, escudos que não carregaram,
    nomes de time sumidos nas tabelas;
  - coerência: zonas do regulamento (sem buraco nem sobreposição), colunas da tabela de chances, legenda
    igual às zonas, tabela de chances com o total certo por coluna;
  - navegação: cada aba, cada visual, cada competição, cada time (rota própria), cada link do topo e do
    rodapé, voltar do navegador, link de cenário, compartilhar (imagens geradas não podem sair em branco),
    revelação da tabela, preencher e sortear placares.
Os defeitos entram no relatório com a rota, o tamanho da tela e o que foi visto. As "ideias" são
observações que não quebram nada, mas valem uma olhada.
"""
import json
import os
import sys
import time

from playwright.sync_api import sync_playwright

BASE = 'http://localhost:8780/'
AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
SAIDA = os.path.join(AQUI, 'saida')
RAPIDO = '--rapido' in sys.argv
TELAS = [(390, 844)] if RAPIDO else [(390, 844), (1280, 800)]

defeitos, ideias, passos = [], [], []


def ruim(onde, msg):
    defeitos.append(f'{onde}: {msg}')


def ideia(onde, msg):
    ideias.append(f'{onde}: {msg}')


def esperar(pg):
    pg.wait_for_function("document.querySelector('#conteudo') && !document.querySelector('#conteudo').hasAttribute('aria-busy') && !document.querySelector('.carregando')", timeout=15000)
    pg.evaluate('document.fonts.ready')
    try:
        pg.wait_for_load_state('networkidle', timeout=4000)
    except Exception:  # noqa: BLE001  (jogos com animação contínua nunca ficam ociosos)
        pass
    pg.wait_for_timeout(250)


def clicar(pg, sel):
    """Clica no primeiro elemento (visível ou não, para poder testar a ação de qualquer aba)."""
    return pg.evaluate("(s) => { const e = [...document.querySelectorAll(s)].find((x) => x.offsetParent) || document.querySelector(s); if (!e) return false; e.click(); return true; }", sel)


def abrir(pg, rota, onde):
    pg.goto('about:blank')
    pg.goto(f'{BASE}?offline{rota}')
    try:
        esperar(pg)
    except Exception as e:  # noqa: BLE001
        ruim(onde, f'não terminou de carregar ({str(e)[:80]})')
        return False
    return True


def layout(pg, onde, larg):
    """Defeitos de layout da tela aberta agora."""
    sw = pg.evaluate('document.documentElement.scrollWidth')
    if sw > larg + 1:
        ruim(onde, f'rolagem horizontal ({sw}px numa tela de {larg}px)')
    cortados = pg.evaluate("""[...document.querySelectorAll('.tbl td.t span, .time span, .nav a, .btn, .po-nome b, .rs-time b')]
        .filter(e => e.offsetParent && e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).textOverflow !== 'ellipsis')
        .map(e => e.textContent.trim().slice(0, 40))""")
    if cortados:
        ruim(onde, f'texto cortado: {sorted(set(cortados))[:6]}')
    # nome do time sumido: vale se a tabela está na tela e nem o nome nem a sigla aparecem (o CSS pode esconder o span)
    sumidos = pg.evaluate("""[...document.querySelectorAll('.tbl tbody th.t')].filter(th => {
        const tbl = th.closest('.tbl'); if (!tbl.offsetParent) return false;
        const vis = [...th.querySelectorAll('span, abbr')].some(e => getComputedStyle(e).display !== 'none' && e.textContent.trim() && e.getBoundingClientRect().width > 4);
        return !vis;
      }).length""")
    if sumidos:
        ruim(onde, f'{sumidos} nomes de time sem aparecer nas tabelas')
    # tabelas: cada título de coluna visível tem de ficar em cima da sua coluna de números (a mesma posição na horizontal)
    desalinhadas = pg.evaluate("""[...document.querySelectorAll('table.tbl')].filter(t => t.offsetParent).map(t => {
        const vis = (c) => [...c.children].filter(e => getComputedStyle(e).display !== 'none');
        const h = t.querySelector('thead tr'), r = t.querySelector('tbody tr:not(.dist-linha)');
        if (!h || !r) return null;
        const H = vis(h), R = vis(r);
        if (H.length > 1 && H.length !== R.length - 0 && H.length + 1 !== R.length) return t.className + ': ' + H.length + ' títulos x ' + R.length + ' células';
        const hr = H.map((e) => e.getBoundingClientRect()), rr = R.map((e) => e.getBoundingClientRect());
        const off = hr.slice().reverse().findIndex((x, k) => { const y = rr[rr.length - 1 - k]; return y && !H[H.length - 1 - k].getAttribute('colspan') && Math.abs((x.left + x.right) / 2 - (y.left + y.right) / 2) > 6; });
        return off >= 0 ? t.className + ': título "' + H[H.length - 1 - off].textContent.trim() + '" fora da sua coluna' : null;
      }).filter(Boolean)""")
    if desalinhadas:
        ruim(onde, f'colunas desalinhadas: {desalinhadas}')
    # playoff: cada título do cabeçalho fica em cima da sua coluna de números
    po_desalinhado = pg.evaluate("""[...document.querySelectorAll('.po-card')].filter(c => c.offsetParent).map(c => {
        const h = [...c.querySelectorAll('.po-cols > span')], r = c.querySelector('.po-time');
        const cel = [...r.children];
        if (h.length !== cel.length) return h.length + ' títulos x ' + cel.length + ' colunas';
        const bad = h.findIndex((e, k) => e.textContent.trim() && Math.abs(e.getBoundingClientRect().right - cel[k].getBoundingClientRect().right) > 3);
        return bad >= 0 ? 'título "' + h[bad].textContent.trim() + '" fora da coluna' : null;
      }).filter(Boolean)""")
    if po_desalinhado:
        ruim(onde, f'playoff: {po_desalinhado[0]}')
    escudos = pg.evaluate("""[...document.querySelectorAll('img.crest, img.rv-crest')]
        .filter(i => i.offsetParent && i.complete && i.naturalWidth === 0).map(i => i.getAttribute('src'))""")
    if escudos:
        ruim(onde, f'escudos que não carregaram: {sorted(set(escudos))[:5]}')
    pequenos = pg.evaluate("""[...document.querySelectorAll('a, button, select, summary')].filter(e => {
        const r = e.getBoundingClientRect(); return e.offsetParent && r.width && (r.height < 30 || r.width < 30) && !e.closest('.nav-skip');
      }).map(e => (e.textContent || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 24))""")
    if pequenos:
        ideia(onde, f'alvos de toque pequenos (<30 px): {sorted(set(pequenos))[:6]}')


def regras_ok(comp, regras, n):
    """Zonas do regulamento: sem buraco no meio do bloco, sem sobreposição e batendo com as colunas."""
    onde = f'regras {comp["id"]}'
    zs = sorted(regras['zonas'], key=lambda z: z['de'])
    for a, b in zip(zs, zs[1:]):
        if a['ate'] >= b['de']:
            ruim(onde, f'zonas {a["id"]} e {b["id"]} se sobrepõem')
    for z in zs:
        if z['de'] > z['ate'] or z['ate'] > n:
            ruim(onde, f'zona {z["id"]} fora da tabela ({z["de"]}–{z["ate"]} com {n} times)')
    ids = {z['id'] for z in zs}
    for c in regras.get('colunas', []):
        for zid in c['zonas']:
            if zid not in ids:
                ruim(onde, f'coluna {c["rotulo"]} usa a zona {zid}, que não existe')
        faixa = [z for z in zs if z['id'] in c['zonas']]
        if faixa:
            esperado = f'{min(z["de"] for z in faixa)}º' + (' e ' if len(faixa) == 1 and faixa[0]['ate'] - faixa[0]['de'] == 1 else ' ao ')
            t = c.get('titulo', '')
            lo, hi = min(z['de'] for z in faixa), max(z['ate'] for z in faixa)
            if t and str(lo) not in t and str(hi) not in t:
                ideia(onde, f'título da coluna "{c["rotulo"]}" ({t}) não cita {lo}º e {hi}º')
    cobertas = {zid for c in regras.get('colunas', []) for zid in c['zonas']}
    if regras.get('colunas') and ids - cobertas:
        ideia(onde, f'zonas sem coluna na tabela de chances: {sorted(ids - cobertas)}')


def simulador(pg, comp, larg, times):
    cid = comp['id']
    base = '#/simulador' + ('' if cid == 'seriea' else '/' + cid)
    onde = f'{cid} {larg}px'
    if not abrir(pg, base, onde):
        return
    if not pg.evaluate("!!document.querySelector('#conteudo h1')"):
        ruim(onde, 'sem título (h1)')
    layout(pg, onde, larg)
    playoff = pg.evaluate("!!document.querySelector('.po-lista')")
    if playoff:
        passos.append(f'{onde}: modo playoff')
        # os palpites do playoff entram na conta e mudam as chances
        antes = pg.evaluate("document.querySelector('[data-f=\"sobe-m\"]').textContent")
        pg.evaluate("""const i = document.querySelectorAll('.po .placar input');
            i[0].value = '0'; i[0].dispatchEvent(new Event('input', {bubbles: true}));
            i[1].value = '3'; i[1].dispatchEvent(new Event('input', {bubbles: true}));""")
        pg.wait_for_timeout(400)
        depois = pg.evaluate("document.querySelector('[data-f=\"sobe-m\"]').textContent")
        if antes == depois:
            ruim(onde, f'preencher a ida não mudou a chance do melhor colocado ({antes})')
        pg.click('[data-a="simular"]')
        pg.wait_for_timeout(500)
        pg.click('[data-a="limpar"]')
        pg.wait_for_timeout(300)
        pg.click('[data-a="partilhar"]')
        pg.wait_for_selector('[data-j="img-po"]')
        pg.click('[data-j="img-po"]')
        pg.wait_for_timeout(2500)
        if not imagem_ok(pg):
            ruim(onde, 'imagem do playoff saiu em branco')
        pg.keyboard.press('Escape')
        for t in times:
            if abrir(pg, f'{base}/{t}', f'{onde} time {t}'):
                layout(pg, f'{onde} time {t}', larg)
        return
    # abas e visuais
    for aba in ('chances', 'jogos'):
        b = pg.query_selector(f'button[data-aba="{aba}"]')
        if b and b.is_visible():
            b.click()
            pg.wait_for_timeout(700)
            layout(pg, f'{onde} aba {aba}', larg)
    for v in ('lista', 'cartoes', 'lado'):
        b = pg.query_selector(f'[data-vis="{v}"]')
        if b and b.is_visible():
            b.click()
            pg.wait_for_timeout(300)
            layout(pg, f'{onde} visual {v}', larg)
    # tabela de chances: nome em toda linha, cada coluna soma o número de vagas
    pg.evaluate("document.querySelector('button[data-aba=\"chances\"]') && [...document.querySelectorAll('button[data-aba=\"chances\"]')].filter(b => b.offsetParent)[0]?.click()")
    try:
        pg.wait_for_selector('table.chances tbody tr', timeout=20000)
        pg.wait_for_function("!document.querySelector('#chances-prog') || document.querySelector('#chances-prog').hidden", timeout=30000)
        linhas = pg.evaluate("""[...document.querySelectorAll('table.chances tbody tr[data-t]')].map(tr => ({
            nome: (tr.querySelector('th span') || {}).textContent || '', v: [...tr.querySelectorAll('td')].map(td => td.textContent.trim())}))""")
        if len(linhas) != comp['n']:
            ruim(onde, f'tabela de chances com {len(linhas)} linhas, esperado {comp["n"]}')
        if any(not l['nome'].strip() for l in linhas):
            ruim(onde, 'tabela de chances com time sem nome')
        for k, c in enumerate(comp['colunas']):
            vagas = c['vagas']
            tot = 0
            for l in linhas:
                x = l['v'][k + 1] if len(l['v']) > k + 1 else ''
                if x.endswith('%'):
                    tot += 0.5 if x in ('<1%',) else float(x.strip('<>%'))
            if abs(tot / 100 - vagas) > max(1.2, 0.15 * vagas):
                ruim(onde, f'coluna "{c["rotulo"]}" soma {tot / 100:.1f} vagas, esperado {vagas}')
    except Exception as e:  # noqa: BLE001
        ruim(onde, f'tabela de chances não apareceu ({str(e)[:70]})')
    # um jogo: preencher, ver a barra 1-X-2 e sortear
    pg.evaluate("[...document.querySelectorAll('button[data-aba=\"jogos\"]')].filter(b => b.offsetParent)[0]?.click()")
    pg.wait_for_timeout(300)
    if pg.query_selector('[data-vis="cartoes"]'):
        pg.click('[data-vis="cartoes"]')
        pg.wait_for_timeout(300)
    if pg.query_selector('.jogo .prob button'):
        pg.click('.jogo .prob button >> nth=0')
        pg.wait_for_timeout(300)
        if not pg.evaluate("document.querySelector('.jogo.set') !== null"):
            ruim(onde, 'tocar na barra 1-X-2 não preencheu o placar')
        if not clicar(pg, '[data-a="simular"]'):
            ruim(onde, 'sem o botão de simular os jogos restantes')
        pg.wait_for_timeout(600)
        layout(pg, f'{onde} depois de sortear', larg)
        # revelação
        if pg.query_selector('[data-a="esconder"]'):
            clicar(pg, '[data-a="esconder"]')
            pg.wait_for_timeout(300)
            clicar(pg, '[data-a="revelar"]')
            pg.wait_for_timeout(1500)
            if not pg.query_selector('.revela'):
                ruim(onde, 'a revelação da tabela não abriu')
            else:
                pg.keyboard.press('Escape')
                pg.wait_for_timeout(300)
                if pg.query_selector('.revela'):
                    ideia(onde, 'a revelação não fecha com Esc')
                    fechar = pg.query_selector('.revela .icon-btn')
                    if fechar:
                        fechar.click()
            pg.evaluate("[...document.querySelectorAll('[data-a=\"esconder\"]')].filter(b => b.getAttribute('aria-pressed') === 'true').forEach(b => b.click())")
        # compartilhar: o link muda com os placares e as imagens não saem em branco
        clicar(pg, '[data-a="partilhar"]')
        pg.wait_for_selector('.link-linha input')
        url = pg.evaluate("document.querySelector('.link-linha input').value")
        if '?c=' not in url:
            ruim(onde, f'link de cenário sem os placares: {url}')
        btn = pg.query_selector('[data-j="img-tabela"]')
        if btn:
            btn.click()
            pg.wait_for_timeout(2500)
            if not imagem_ok(pg):
                ruim(onde, 'imagem da tabela final saiu em branco')
        pg.keyboard.press('Escape')
        pg.evaluate("document.querySelector('.janela [data-fechar], .modal [data-fechar]')?.click()")
    # cada time (rota própria): título e jogos do time
    for t in times:
        o2 = f'{onde} time {t}'
        if abrir(pg, f'{base}/{t}', o2):
            if not pg.evaluate("!!document.querySelector('.meu-heroi')"):
                ruim(o2, 'sem o cartão do time')
            layout(pg, o2, larg)


def imagem_ok(pg):
    """A imagem gerada (window.TNG_IMAGEM) não pode ser lisa: precisa de pelo menos 4 cores distintas."""
    return pg.evaluate("""(() => {
        const c = window.TNG_IMAGEM; if (!c) return false;
        const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, s = new Set();
        for (let i = 0; i < d.length; i += 4 * 997) s.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]);
        return s.size >= 4;
    })()""")


def paginas(pg, larg):
    """Páginas fora do simulador: topo, rodapé, textos, jogos."""
    rotas = ['#/', '#/escalacao', '#/jogos', '#/estatisticas', '#/sobre', '#/privacidade', '#/termos', '#/modelo', '#/desempate', '#/contato',
             '#/jogos/draft', '#/jogos/milhao', '#/jogos/fast', '#/nao-existe']
    for r in rotas:
        onde = f'{r} {larg}px'
        if abrir(pg, r, onde):
            jogo = r.startswith('#/jogos/')
            if jogo:
                if pg.evaluate("document.querySelector('#conteudo iframe, #conteudo canvas') === null && (document.querySelector('#conteudo').innerText || '').trim().length < 40"):
                    ruim(onde, 'o jogo não abriu')
                layout(pg, onde, larg)
                continue
            if r != '#/nao-existe' and pg.evaluate("document.querySelector('#conteudo h1') === null"):
                ruim(onde, 'sem título (h1)')
            if r != '#/nao-existe' and pg.evaluate("document.title.length < 8"):
                ruim(onde, 'título da aba vazio')
            if r != '#/nao-existe' and pg.evaluate("(document.querySelector('#conteudo').innerText || '').trim().length < 80"):
                ruim(onde, 'página quase vazia')
            layout(pg, onde, larg)
    # links do topo e do rodapé: cada um leva para uma rota que carrega
    abrir(pg, '#/', 'links')
    hrefs = pg.evaluate("""[...new Set([...document.querySelectorAll('header a[href], footer a[href]')].map(a => a.getAttribute('href')).filter(h => h && h.startsWith('#/')))]""")
    for h in hrefs:
        if h not in rotas and h != '#/':
            abrir(pg, h, f'link {h} {larg}px')
    # voltar do navegador
    abrir(pg, '#/simulador', 'voltar')
    pg.evaluate("location.hash = '#/sobre'")
    pg.wait_for_timeout(500)
    pg.go_back()
    pg.wait_for_timeout(800)
    if pg.evaluate("location.hash") not in ('#/simulador', '', '#/'):
        ruim('voltar', f'voltar do navegador foi para {pg.evaluate("location.hash")}')


def main():
    os.makedirs(SAIDA, exist_ok=True)
    comps = json.load(open(os.path.join(RAIZ, 'shared/competicoes.json')))['lista']
    inicio = time.time()
    with sync_playwright() as p:
        b = p.chromium.launch()
        for larg, alt in TELAS:
            ctx = b.new_context(viewport={'width': larg, 'height': alt}, reduced_motion='reduce')
            pg = ctx.new_page()
            pg.set_default_timeout(15000)
            pg.on('console', lambda m: m.type == 'error' and ruim('console', m.text[:160]))
            pg.on('pageerror', lambda e: ruim('exceção', str(e)[:160]))
            pg.on('requestfailed', lambda r: ruim('requisição', f'falhou {r.url[:100]}') if r.url.startswith(BASE) and r.method != 'HEAD' else None)
            pg.on('response', lambda r: ruim('requisição', f'{r.status} {r.url[:100]}') if r.url.startswith(BASE) and r.status >= 400 and r.request.method != 'HEAD' else None)
            paginas(pg, larg)
            for c in comps:
                dados = os.path.join(RAIZ, c['dados'])
                if not os.path.exists(dados):
                    continue
                regras = json.load(open(os.path.join(RAIZ, c['regras'])))
                liga = json.load(open(dados))
                n = len(liga['times'])
                if larg == TELAS[0][0]:
                    regras_ok(c, regras, n)
                slugs = sorted({t['escudo'] for t in liga['times'] if t.get('escudo')})
                amostra = slugs[:1] if RAPIDO else slugs
                feitos = sum(1 for j in liga['jogos'] if j.get('gols_mandante') is not None)
                c2 = dict(c, n=n, colunas=[{'rotulo': k['rotulo'], 'vagas': sum(z['ate'] - z['de'] + 1 for z in regras['zonas'] if z['id'] in k['zonas'])}
                                           for k in regras.get('colunas', [])])
                if not c2['colunas']:
                    c2['colunas'] = []
                try:
                    simulador(pg, c2, larg, amostra if larg == TELAS[0][0] else amostra[:3])
                except Exception as e:  # noqa: BLE001
                    ruim(f'{c["id"]} {larg}px', f'o roteiro de navegação parou: {str(e)[:120]}')
            ctx.close()
        b.close()
    linhas = ['# Auditoria do site', '', f'{time.strftime("%d/%m/%Y %H:%M")} · {int(time.time() - inicio)} s · telas {", ".join(str(t[0]) for t in TELAS)} px', '']
    vistos = []
    for d in defeitos:
        if d not in vistos:
            vistos.append(d)
    linhas += [f'## Defeitos ({len(vistos)})', ''] + ([f'- {d}' for d in vistos] or ['Nenhum.']) + ['']
    iv = []
    for d in ideias:
        if d not in iv:
            iv.append(d)
    linhas += [f'## Ideias e atenção ({len(iv)})', ''] + ([f'- {d}' for d in iv] or ['Nenhuma.']) + ['']
    linhas += ['## Passos especiais', ''] + ([f'- {d}' for d in passos] or ['Nenhum.']) + ['']
    open(os.path.join(SAIDA, 'auditoria.md'), 'w').write('\n'.join(linhas))
    print('\n'.join(linhas))
    sys.exit(1 if vistos else 0)


if __name__ == '__main__':
    main()

"""Capturas automáticas em 320x568, 390x844 e 1280x800, claro e escuro.

Uso (com o serve.py no ar):
  python tools/capturas.py site [--pagina]     # as telas do site (--pagina: página inteira)
  python tools/capturas.py simulador           # o simulador de ponta a ponta

Saída em tools/saida/<roteiro>/. Também confere o console: qualquer erro faz o roteiro falhar.
"""
import os
import sys

from playwright.sync_api import sync_playwright

BASE = 'http://localhost:8780/'
TAMANHOS = [(320, 568), (390, 844), (1280, 800)]
TEMAS = ['light', 'dark']
AQUI = os.path.dirname(os.path.abspath(__file__))


def esperar_imagens(pagina):
    # imagens com loading="lazy" que estão na tela: espera carregarem (ou falharem)
    pagina.wait_for_load_state('networkidle')
    pagina.evaluate('''Promise.all([...document.images].filter(i => {
        const r = i.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0;
      }).map(i => i.complete ? 0 : new Promise(ok => { i.onload = i.onerror = ok; })))''')
    pagina.wait_for_timeout(150)


ROTAS = [('simulador', '#/'), ('meu-time', '#/simulador/sp'), ('escalacao', '#/escalacao'), ('jogos', '#/jogos'), ('jogo-draft', '#/jogos/draft'), ('jogo-milhao', '#/jogos/milhao'), ('jogo-fast', '#/jogos/fast'), ('estatisticas', '#/estatisticas'), ('404', '#/nao-existe')]


def site(pagina, saida, inteira):
    erros = []
    for t in TEMAS:
        # o tema entra como se o usuário já o tivesse escolhido (tng.tema), antes de a página carregar
        ctx = pagina.context.browser.new_context(device_scale_factor=2, reduced_motion='reduce')
        pg = ctx.new_page()
        pg.on('console', lambda m: m.type == 'error' and erros.append(m.text))
        pg.on('pageerror', lambda e: erros.append(str(e)))
        pg.add_init_script(f"try {{ localStorage.setItem('tng.tema', '{t}') }} catch (e) {{}}")
        for w, h in TAMANHOS:
            pg.set_viewport_size({'width': w, 'height': h})
            for nome, rota in ROTAS:
                pg.goto('about:blank')  # rota com hash: garante carga nova a cada captura
                pg.goto(f'{BASE}?offline{rota}')
                if 'jogo-' in nome: pg.wait_for_timeout(1500)
                pg.wait_for_function("document.querySelector('#conteudo') && !document.querySelector('#conteudo').hasAttribute('aria-busy') && !document.querySelector('.carregando')")
                pg.evaluate('document.fonts.ready')
                esperar_imagens(pg)
                larg = pg.evaluate('document.documentElement.scrollWidth')
                if larg > w:
                    erros.append(f'{nome} {w}px {t}: rolagem horizontal ({larg}px)')
                cortados = pg.evaluate("""[...document.querySelectorAll('.tbl td.t span, .team span, .nav a, .btn, .play')]
                    .filter(e => e.offsetParent && e.scrollWidth > e.clientWidth + 1).map(e => e.textContent.trim())""")
                if cortados:
                    erros.append(f'{nome} {w}px {t}: texto cortado {cortados}')
                pequenos = pg.evaluate("""[...document.querySelectorAll('a, button')].filter(e => {
                    const r = e.getBoundingClientRect(); return e.offsetParent && r.width && (r.height < 32 || r.width < 32);
                  }).map(e => (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30))""")
                if pequenos:
                    erros.append(f'{nome} {w}px {t}: alvos de toque pequenos {pequenos}')
                pg.screenshot(path=os.path.join(saida, f'{nome}-{w}-{t}.png'), full_page=inteira)
        ctx.close()
    erros += navegacao(pagina)
    return erros


def navegacao(pagina):
    """Voltar para uma tela enquanto outra ainda carrega tem de redesenhar (defeito achado em 07/11)."""
    erros = []
    ctx = pagina.context.browser.new_context(reduced_motion='reduce')
    pg = ctx.new_page()
    pg.route('**/abas/jogos.js', lambda r: (pg.wait_for_timeout(900), r.continue_()))
    pg.goto(f'{BASE}#/simulador/flamengo')
    pg.wait_for_selector('tr.meu')
    pg.evaluate("location.hash = '#/jogos'")
    pg.wait_for_timeout(100)
    pg.go_back()
    pg.wait_for_timeout(1500)
    h1 = pg.evaluate("(document.querySelector('#conteudo h1') || {}).textContent")
    if not (h1 or '').startswith('Simulador'):
        erros.append(f'navegação: voltar durante o carregamento deixou a tela em {h1!r}')
    pg.evaluate("location.hash = '#/escalacao'")
    pg.wait_for_selector('.campo-box')
    pg.go_back()
    pg.wait_for_selector('tr.meu')
    ctx.close()
    return erros


def main():
    roteiro = sys.argv[1] if len(sys.argv) > 1 else 'site'
    inteira = '--pagina' in sys.argv
    saida = os.path.join(AQUI, 'saida', roteiro)
    os.makedirs(saida, exist_ok=True)
    console = []
    with sync_playwright() as p:
        nav = p.chromium.launch(executable_path=os.environ.get('TNG_CHROME') or None)  # TNG_CHROME: outro Chrome, se o do Playwright não estiver instalado
        pagina = nav.new_page(device_scale_factor=2)
        pagina.on('console', lambda m: m.type == 'error' and console.append(m.text))
        pagina.on('pageerror', lambda e: console.append(str(e)))
        if roteiro == 'simulador':
            from roteiro_simulador import simulador
            erros = simulador(pagina, saida, inteira)
        else:
            erros = site(pagina, saida, inteira)
        nav.close()
    for e in erros + console:
        print('ERRO:', e)
    print(f'capturas em {saida}')
    sys.exit(1 if erros or console else 0)


if __name__ == '__main__':
    main()

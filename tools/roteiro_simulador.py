"""Roteiro do simulador: usa a aba como uma pessoa usaria, com capturas a cada passo.
Chamado por: python tools/capturas.py simulador (com o serve.py no ar)."""
import base64
import os

from capturas import BASE, TEMAS, esperar_imagens


def simulador(pagina, saida, inteira):
    erros = []
    navegador = pagina.context.browser

    def nova(w, h, tema):
        ctx = navegador.new_context(device_scale_factor=2, viewport={'width': w, 'height': h})
        pg = ctx.new_page()
        pg.on('console', lambda m: m.type == 'error' and erros.append(f'{w}px {tema}: ' + m.text))
        pg.on('pageerror', lambda e: erros.append(f'{w}px {tema}: ' + str(e)))
        pg.add_init_script("try { localStorage.setItem('tng.tema', '%s') } catch (e) {}" % tema)
        return ctx, pg

    def foto(pg, nome, cheia=False):
        pg.evaluate('document.fonts.ready')
        esperar_imagens(pg)
        pg.screenshot(path=os.path.join(saida, nome + '.png'), full_page=cheia)

    def pronto(pg):
        pg.wait_for_selector('.jogo', state='attached')
        pg.wait_for_timeout(200)

    def salvar_imagem(pg, nome):
        pg.evaluate("window.__img = null; TNG_IMAGEM.toBlob(b => { const r = new FileReader(); r.onload = () => { window.__img = r.result }; r.readAsDataURL(b) })")
        pg.wait_for_function('window.__img')
        with open(os.path.join(saida, nome), 'wb') as f:
            f.write(base64.b64decode(pg.evaluate('window.__img').split(',')[1]))

    def calculado(pg):
        pg.wait_for_function("!document.querySelector('#chances-prog') || document.querySelector('#chances-prog').hidden", timeout=30000)
        pg.wait_for_timeout(150)

    # ------------------------------------------------------------ celular: preencher, simular, abas
    for w, h in [(390, 844), (320, 568)]:
        tema = 'light' if w == 390 else 'dark'
        ctx, pg = nova(w, h, tema)
        pg.goto(f'{BASE}?offline#/simulador')
        pronto(pg)
        foto(pg, f'sim-{w}-1-inicio')
        ins = pg.locator('.placar input')
        ins.nth(0).click()
        pg.keyboard.type('2')
        pg.keyboard.type('1')
        foco = pg.evaluate("document.activeElement.dataset.l + ' ' + document.activeElement.closest('.jogo').dataset.c")
        if foco != '0 ' + pg.evaluate("document.querySelectorAll('.jogo')[1].dataset.c"):
            erros.append(f'{w}px: o foco não pulou para o jogo seguinte ({foco})')
        pg.locator('.prob button').nth(4).click()              # empate no segundo jogo
        pg.wait_for_timeout(300)
        n = pg.evaluate("document.querySelectorAll('.jogo.set').length")
        if n != 2:
            erros.append(f'{w}px: esperava 2 jogos preenchidos, achei {n}')
        pg.locator('.prob button').nth(4).click()              # tocar de novo desfaz
        pg.wait_for_timeout(200)
        if pg.evaluate("document.querySelectorAll('.jogo.set').length") != 1:
            erros.append(f'{w}px: tocar de novo na probabilidade não desfez o placar')
        pg.locator('.prob button').nth(4).click()
        pg.evaluate('window.scrollTo(0, 0)')
        foto(pg, f'sim-{w}-2-preenchido')
        pg.click('[data-a="simular"]')
        pg.wait_for_timeout(300)
        faltam = pg.evaluate("TNG_SIM.L.jogos.filter(j => !j.feito && !TNG_SIM.p[j.chave]).length")
        if faltam:
            erros.append(f'{w}px: depois de simular o resto ainda faltam {faltam}')
        salvos = pg.evaluate("Object.keys(JSON.parse(localStorage.getItem('tng.placares')).p).length")
        if salvos != 41:
            erros.append(f'{w}px: tng.placares guardou {salvos} placares (esperava 41)')
        foto(pg, f'sim-{w}-3-simulado')
        pg.click('.seg-cel [data-aba="tabela"]')
        pg.wait_for_timeout(250)
        foto(pg, f'sim-{w}-4-tabela')
        pg.click('.seg-cel [data-aba="chances"]')
        pg.wait_for_selector('table.chances', timeout=15000)
        calculado(pg)
        pg.locator('table.chances tbody tr[data-t]').nth(0).click()
        pg.wait_for_timeout(200)
        foto(pg, f'sim-{w}-5-chances')
        # recarregar mantém os placares
        pg.reload()
        pronto(pg)
        if pg.evaluate("document.querySelectorAll('.jogo.set, .jogo.sorteado').length") != 41:
            erros.append(f'{w}px: os placares não voltaram depois de recarregar')
        ctx.close()

    # ------------------------------------------------------------ meu time, revelar, compartilhar, cenários
    ctx, pg = nova(390, 844, 'light')
    pg.goto(f'{BASE}?offline#/simulador/flamengo')
    pronto(pg)
    if pg.evaluate("document.querySelectorAll('.jogo').length") != 4:
        erros.append('meu time: esperava só os 4 jogos do Flamengo')
    foto(pg, 'sim-390-6-meu-time')
    pg.click('.seg-cel [data-aba="chances"]')
    pg.wait_for_selector('.obj', timeout=20000)
    calculado(pg)
    foto(pg, 'sim-390-7-precisa', True)
    pg.goto(f'{BASE}?offline#/simulador/fluminense?aba=chances')
    pg.wait_for_selector('.obj', timeout=20000)
    calculado(pg)
    foto(pg, 'sim-390-8-precisa-flu', True)
    pg.goto(f'{BASE}?offline#/simulador')
    pronto(pg)
    pg.click('.seg-cel [data-aba="tabela"]')
    pg.click('[data-a="esconder"]')
    pg.wait_for_timeout(200)
    foto(pg, 'sim-390-9-escondida')
    pg.click('.capa [data-a="revelar"]')
    pg.wait_for_timeout(2600)
    foto(pg, 'sim-390-10-revelando')
    pg.evaluate('TNG_REVELA.fim()')
    pg.wait_for_timeout(500)
    foto(pg, 'sim-390-11-revelada')
    pg.evaluate('TNG_REVELA.fechar()')
    pg.click('[data-a="esconder"]')
    pg.click('[data-a="partilhar"]')
    pg.click('[data-j="img-tabela"]')
    pg.wait_for_selector('.previa img', timeout=10000)
    pg.wait_for_timeout(300)
    foto(pg, 'sim-390-12-compartilhar')
    salvar_imagem(pg, 'imagem-tabela.png')
    pg.click('[data-j="img-jogos"]')
    pg.wait_for_timeout(1500)
    salvar_imagem(pg, 'imagem-jogos.png')
    link = pg.input_value('.link-linha input')
    pg.click('.jan-x')
    pg.click('[data-a="cenarios"]')
    pg.fill('#cen-nome', 'Flamengo campeão')
    pg.click('.salvar button')
    pg.wait_for_timeout(300)
    foto(pg, 'sim-390-13-cenarios')
    pg.click('.jan-x')
    # o link compartilhado abre o mesmo cenário em outro aparelho (contexto novo, sem nada salvo)
    ctx2, pg2 = nova(390, 844, 'light')
    pg2.goto(link.replace('#/', '?offline#/'))
    pg2.wait_for_selector('.faixa')
    a = pg2.evaluate("JSON.stringify(TNGCore.tabela(TNG_SIM.L, TNG_SIM.compartilhado).map(x => x.i))")
    b = pg.evaluate("JSON.stringify(TNGCore.tabela(TNG_SIM.L, TNG_SIM.p).map(x => x.i))")
    if a != b:
        erros.append('o link compartilhado não reproduz a mesma tabela')
    if pg2.evaluate("localStorage.getItem('tng.placares')"):
        erros.append('abrir um link alheio gravou por cima dos placares do usuário')
    foto(pg2, 'sim-390-14-link-recebido')
    ctx2.close()
    ctx.close()

    # ------------------------------------------------------------ computador, claro e escuro
    for tema in TEMAS:
        ctx, pg = nova(1280, 800, tema)
        pg.goto(f'{BASE}?offline#/simulador')
        pronto(pg)
        pg.click('[data-a="simular"]')
        pg.wait_for_timeout(400)
        foto(pg, f'sim-1280-{tema}')
        pg.click('.seg-lado [data-aba="chances"]')
        pg.wait_for_selector('table.chances', timeout=15000)
        calculado(pg)
        foto(pg, f'sim-1280-{tema}-chances')
        if tema == 'dark':
            pg.click('[data-a="limpar"]')
            pg.goto(f'{BASE}?offline#/simulador/palmeiras?aba=chances')
            pg.wait_for_selector('.obj', timeout=20000)
            calculado(pg)
            foto(pg, 'sim-1280-dark-precisa')
        ctx.close()
    return erros

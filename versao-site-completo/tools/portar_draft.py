"""Porta o Football Draft (apps/football-draft) para o site, em jogos/draft/.

Uso: python tools/portar_draft.py      (rode de novo sempre que o Draft mudar)

O que faz:
- copia app/ e shared/ para jogos/draft/;
- converte as 133 fotos de estádio (pacote de mídia) para WebP, carregadas só quando escolhidas;
- grava app/web.js (window.DEZ_WEB) e aplica pequenos ajustes, cada um conferido (falha alto se o
  código do Draft mudar e o ajuste não couber mais):
    * sem anúncios e sem compras na web (o jogo fica todo liberado, exceto o que se ganha com moedas);
    * link da loja com origem medida (utm_source=tapanagaveta, utm_medium=jogos);
    * escudos de midia/escudos (sem cópia), estádios em .webp;
    * idioma português; abertura com o logo em português;
    * cores do fundo e do acento na identidade do site (verde-escuro e giz).
"""
import os
import shutil
import sys

from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEM = os.path.join(RAIZ, 'apps', 'football-draft')
MIDIA = os.path.join(RAIZ, 'tapa-na-gaveta-midia', 'tapa-na-gaveta-kit', 'apps', 'football-draft', 'shared', 'estadios')
DESTINO = os.path.join(RAIZ, 'jogos', 'draft')


def trocar(caminho, pares):
    with open(caminho, encoding='utf8') as f:
        s = f.read()
    for velho, novo in pares:
        if velho not in s:
            sys.exit(f'ERRO: o Draft mudou, não achei em {os.path.relpath(caminho, RAIZ)}:\n{velho[:120]}')
        s = s.replace(velho, novo)
    with open(caminho, 'w', encoding='utf8') as f:
        f.write(s)


def main():
    if os.path.exists(DESTINO):
        shutil.rmtree(DESTINO)
    for pasta in ('app', 'shared'):
        shutil.copytree(os.path.join(ORIGEM, pasta), os.path.join(DESTINO, pasta))

    # estádios em WebP (≈ 1/3 do tamanho), com as miniaturas da loja
    saida = os.path.join(DESTINO, 'shared', 'estadios')
    os.makedirs(os.path.join(saida, 'mini'), exist_ok=True)
    n = 0
    if os.path.isdir(MIDIA):
        for sub in ('', 'mini'):
            pasta = os.path.join(MIDIA, sub)
            for nome in os.listdir(pasta):
                if not nome.endswith('.jpg'):
                    continue
                im = Image.open(os.path.join(pasta, nome)).convert('RGB')
                im.save(os.path.join(saida, sub, nome[:-4] + '.webp'), 'WEBP', quality=70 if not sub else 65, method=6)
                n += 1
    else:
        print('AVISO: pacote de mídia não encontrado; os estádios ficam sem foto (o campinho desenha o gramado)')

    # música do menu (pacote de mídia) e fundo desfocado do logo (recriado de uma foto de estádio,
    # como fazia o tools/logo.py do Draft): 1600x893, bem desfocado e escurecido
    musica = os.path.join(os.path.dirname(MIDIA), 'audio', 'musica_menu.m4a')
    if os.path.exists(musica):
        os.makedirs(os.path.join(DESTINO, 'shared', 'audio'), exist_ok=True)
        shutil.copy(musica, os.path.join(DESTINO, 'shared', 'audio', 'musica_menu.m4a'))
    foto = os.path.join(MIDIA, 'maracana.jpg') if os.path.exists(os.path.join(MIDIA, 'maracana.jpg')) else None
    if not foto and os.path.isdir(MIDIA):
        foto = os.path.join(MIDIA, sorted(f for f in os.listdir(MIDIA) if f.endswith('.jpg'))[0])
    if foto:
        from PIL import ImageEnhance, ImageFilter
        im = Image.open(foto).convert('RGB').rotate(90, expand=True).resize((1600, 893))
        im = ImageEnhance.Brightness(im.filter(ImageFilter.GaussianBlur(28))).enhance(0.55)
        im.save(os.path.join(DESTINO, 'app', 'img', 'logo-fundo.jpg'), 'JPEG', quality=72)

    app = os.path.join(DESTINO, 'app')
    with open(os.path.join(app, 'web.js'), 'w', encoding='utf8') as f:
        f.write("// Versão web do Football Draft no site Tapa na Gaveta (gerado por tools/portar_draft.py).\n"
                "window.DEZ_WEB = true;\n"
                "// o site é em português: o jogo também (os textos em en/es continuam no código)\n"
                "try { var c = JSON.parse(localStorage.getItem('dez.config') || '{}'); if (!c.idioma) { c.idioma = 'pt'; localStorage.setItem('dez.config', JSON.stringify(c)); } } catch (e) { /* sem armazenamento */ }\n")

    trocar(os.path.join(app, 'index.html'), [
        ('<script src="../shared/dados/selecoes.js"></script>', '<script src="web.js"></script>\n  <script src="../shared/dados/selecoes.js"></script>'),
        ("img.src = 'img/logo-' + (l === 'pt' || l === 'es' ? l : 'en') + '.png';", "img.src = 'img/logo-pt.png';"),
        ('<meta name="theme-color" content="#0C1210">', '<meta name="theme-color" content="#0b1510">'),
        ('<link rel="icon" type="image/png" href="icons/favicon.png">', '<link rel="icon" type="image/png" href="../../../midia/icones/football-draft.png">'),
    ])
    trocar(os.path.join(app, 'servicos.js'), [
        ("const LINK_LOJA = 'https://play.google.com/store/apps/details?id=' + PLAY_PACKAGE_ID;",
         "const WEB = !!window.DEZ_WEB; // versão do site Tapa na Gaveta: sem anúncios e sem compras\n"
         "  const LINK_LOJA = 'https://play.google.com/store/apps/details?id=' + PLAY_PACKAGE_ID + (WEB ? '&referrer=utm_source%3Dtapanagaveta%26utm_medium%3Djogos' : '');"),
        ("    owned() { return guarda.json(IAP_KEY); },",
         "    owned() { const o = guarda.json(IAP_KEY); return WEB ? Object.assign({ remove_ads: 1 }, o) : o; },"),
        ("    disponivel() { return !!billing.api() || !RELEASE; },",
         "    disponivel() { return !WEB && (!!billing.api() || !RELEASE); },"),
    ])
    trocar(os.path.join(app, 'visual.js'), [
        ("const srcEscudo = (id) => 'img/escudos/' + id + '.png';", "const srcEscudo = (id) => '../../../midia/escudos/' + id + '.png';"),
        ("im.src = '../shared/estadios/' + (mini ? 'mini/' : '') + id + '.jpg';", "im.src = '../shared/estadios/' + (mini ? 'mini/' : '') + id + '.webp';"),
    ])
    trocar(os.path.join(app, 'telas-extras.js'), [
        ('src="../shared/estadios/mini/${e.id}.jpg"', 'src="../shared/estadios/mini/${e.id}.webp"'),
        ('src="../shared/estadios/${e.id}.jpg"', 'src="../shared/estadios/${e.id}.webp"'),
    ])
    trocar(os.path.join(app, 'estilo.css'), [
        ('  --fundo: #0C1210;\n  --sup: #131B18;\n  --sup2: #1A2420;\n  --sup3: #22302A;',
         '  --fundo: #0b1510;\n  --sup: #111f18;\n  --sup2: #182a21;\n  --sup3: #213329;'),
        ('  --acento: #D4F25C;', '  --acento: #DDEF8A;'),
        ('  --acento-tom: rgba(212, 242, 92, 0.12);', '  --acento-tom: rgba(221, 239, 138, 0.12);'),
        ('  --vitoria: #D4F25C;', '  --vitoria: #DDEF8A;'),
        ('background: #070B09;', 'background: #08130d;'),
    ])
    tam = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(DESTINO) for f in fs)
    print(f'jogos/draft/ pronto: {n} imagens de estádio em WebP, {tam / 1048576:.1f} MB no total')


if __name__ == '__main__':
    main()

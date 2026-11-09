# SuperCroc · Vestibulares Resolvidos

*Torne-se o topo da cadeia vestibular.* Questões de vestibular resolvidas passo a passo, com
desenhos, análise de todas as alternativas e vídeos escritos à mão. Feito para celular e tablet
(Capacitor) e, depois, para virar site.

## Rodar

```bash
python serve.py                 # http://localhost:8770/app/
npm run check                   # junta as questões e confere tudo (gabarito, taxonomia, arquivos, fórmulas)
python tools/testar_questoes.py # abre as 90 telas e confere que tudo carrega (com o serve.py no ar)
python tools/shots.py           # capturas em 320, 390 e 1280 px
npm run build                   # monta www/ (acrescente -- --release para a versão da loja)
```

## Estrutura

```
app/                    o app (index.html, app.css, app.js): página única, sem build
conteudo/<prova>/       FONTE das questões: prova.json (cabeçalho) + qNN.json (uma por arquivo)
assets/                 imagens originais do mascote e do ícone (geradas por IA)
shared/
  content/
    taxonomia.json      matérias e assuntos (ids estáveis: são o filtro "por matéria")
    provas/index.json   lista de provas
    provas/<id>/        prova.json (GERADO por tools/montar_provas.js) + img/ + fig/ + video/
  images/croc/          poses do mascote (tools/recortar_mascote.py)
  vendor/katex/         fórmulas (local, sem CDN)
  fonts/                Inter, Baloo 2, Caveat (local)
fontes/<id>/            prova.pdf, gabarito.pdf, gabarito.json, resolucao.pdf (75 provas; ver fontes/LEIA-ME.md
                        e fontes/catalogo.json; organizado por tools/organizar_fontes.py). Não vai para o app.
tools/
  crop_figs.py          recorta figuras do enunciado direto do PDF
  figs/fuvest2021.py    desenhos das resoluções, com geometria exata
  check_content.js      verificação do conteúdo
  build_www.js          monta www/ (marca a versão da loja no HTML)
  video/                vídeos "escritos à mão" (ver abaixo)
docs/revisao-*.md       comparação com gabarito oficial e com a resolução do cursinho
```

## Por que não Phaser

O PLAYBOOK foi feito para jogos. Este app é de leitura (texto, fórmulas, figuras), então usa HTML e
CSS puros, que dão rolagem, seleção e acessibilidade sem esforço. Do playbook vieram: sem build, o
mesmo arquivo no navegador e no app, armazenamento protegido por `try/catch` com chaves estáveis
(`supercroc.*`), ponto único para plugins nativos, a marca `SUPERCROC_RELEASE` gravada pelo build,
a faixa vermelha de erro só no desenvolvimento e o `safe-area` desde o primeiro dia.

## Formato de uma questão (`conteudo/<prova>/qNN.json`)

```jsonc
{
  "n": 9, "materia": "matematica", "assunto": "geometria-plana", "topicos": ["Pitágoras"],
  "dificuldade": 1,                // 1 fácil · 2 média · 3 difícil
  "gabarito": "A",                 // conferido com o oficial pelo npm run check
  "enunciado": [ blocos ], "alternativas": { "A": "...", ... },
  "resumo": "a resolução em uma frase",
  "resolucao": [ { "passo": "título", "c": [ blocos ] }, { "dica": "..." } ],
  "comentarios": { "A": "por que está certa/errada", ... },
  "video": { "src": "video/q09.mp4", "poster": "video/q09.jpg" }
}
```

Blocos: `p` (texto), `eq` (fórmula em destaque), `img` (recorte da prova), `fig` (desenho SVG),
`lista`, `tabela`, `citacao` (texto da prova, integral, com `fonte`), `texto_base` (antigo, não
usar mais), `nota` ("Note e adote"), `dica` ("Pulo do croc"), `alerta` ("Cuidado"),
`polemica` ("Gabarito polêmico").

Questões realmente interdisciplinares (raras) podem ter `materias_extra` (ver o manual, seção 6).

Regras de conteúdo: exatas de conta **não** têm `comentarios` (análise das alternativas); exatas
conceituais, humanas, linguagens e biologia têm. Todo texto da prova é transcrito integral e fiel, e
tirinhas e charges são recortadas (ver `docs/MUDANCAS-DE-REGRAS.md`). Resposta diferente do arquivo de gabarito só com
registro em `fontes/<prova>/divergencias.json`. No texto: `$...$` é
fórmula (KaTeX), `**negrito**`, `*itálico*`.

## Vídeos escritos à mão

```bash
python tools/video/gravar_lousa.py fuvest-2021-q09 shared/content/provas/fuvest-2021-1f/video/q09
python tools/video/gravar_lousa.py fuvest-2021-q09 saida --narracao pasta/   # com a sua voz
```

- `roteiros/<nome>.js`: as falas e o que se escreve ou desenha em cada uma (coordenadas do vídeo
  1080×1920).
- `lousa.html` + `lousa.js`: o motor. A letra cursiva (Caveat) é revelada seguindo o esqueleto de
  cada letra, na ordem em que se escreve. O esqueleto é gerado uma vez por `build_glyphs.py` e fica
  em `glyphs-caveat.json`.
- Narração automática pela voz `pt-BR-AntonioNeural` (edge-tts), ou pela sua gravação: um arquivo
  por fala, com o nome do `id` da fala (`intro.wav`, `figura.wav`...). O tempo de cada trecho se
  ajusta sozinho à duração da fala.
- Voz clonada do autor (Chatterbox, ambiente em `C:/Users/juvit/venvs/chatterbox`): `voz/clonar.py` gera
  3 versões de cada fala a partir de `voz/ref_3e1.wav`; `voz/escolher.py` transcreve, descarta as que
  erraram palavras, apara o fim e monta a pasta para `--narracao`. Escreva os nomes de pontos por
  extenso ("dê éfe") e prefira "vale" a "mede" com número logo depois.
- Som de giz sintetizado, grave e baixo, que abaixa sozinho quando a voz fala. Sem música.
- Abra `http://localhost:8770/tools/video/lousa.html` para uma prévia ao vivo no navegador.

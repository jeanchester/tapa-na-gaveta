# Tapa na Gaveta

Site de futebol: **simulador do Brasileirão** (a isca), **monte sua escalação**, **jogos**
(Football Draft, Jogo do Milhão do Futebol, Fast Football) e **estatísticas**. HTML, CSS e JavaScript
puros, sem build: editar e apertar F5 é o ciclo inteiro. Decisões e porquês em [docs/PLANO.md](docs/PLANO.md).

## Rodar

```bash
python serve.py                          # http://localhost:8780/   (?offline usa só a reserva, sem ESPN)
```

## Testar

```bash
node tools/testar-core.js                # regras do simulador: tabela, desempates, modelo, Monte Carlo, link, "o que precisa", ESPN
node tools/testar-milhao.js              # regras do Jogo do Milhão e as 1.007 perguntas
node tools/calibrar.js                   # calibração do modelo de probabilidade (Brier nos jogos disputados)
python tools/capturas.py site --pagina   # todas as telas em 320, 390 e 1280 px, claro e escuro (+ conferências)
python tools/capturas.py simulador       # usa o simulador de ponta a ponta (preencher, revelar, chances, link...)
```

As capturas conferem também: erro no console, rolagem lateral, texto cortado, alvos de toque
menores que 32 px e a navegação (voltar enquanto outra aba carrega). Saem em `tools/saida/`.

## Estrutura

```
index.html                 página única (rotas por hash: #/simulador, #/escalacao, #/jogos/draft...)
app/app.js  app.css        casca: armazenamento protegido, tema, rotas, topo, rodapé, janela, aviso
app/abas/*.js              uma aba por arquivo, carregada na primeira visita
app/compartilhar.js        imagens em canvas e envio (navigator.share; sem suporte, baixa e abre o WhatsApp)
shared/simulador-core.js   regras puras do simulador (navegador, Worker e Node)
shared/simulador-worker.js Monte Carlo e "o que o meu time precisa" fora da tela
shared/espn.js             ESPN ao vivo → cache do aparelho → retrato publicado
shared/elencos.js          elencos do Você Escala (GitHub do Julio) no formato da aba de escalação
shared/regras-brasileirao-2026.json   desempates e zonas (edite aqui quando as vagas mudarem)
shared/fonts  shared/vendor            Manrope, Big Shoulders (OFL) e Matter.js 0.19 (MIT), locais
jogos/draft  jogos/milhao  jogos/fast  cada jogo isolado, aberto num <iframe>
dados/                     reservas: brasileirao-2026.json, elencos-escalacao.json (+ as fontes delas)
midia/escudos  icones  og  escudos, ícones dos apps e imagens de compartilhamento
tools/                     build, testes, capturas, calibração, imagens og, porte do Draft
ferramentas/baixar_espn.py gera dados/brasileirao-2026.json
```

Chaves salvas no aparelho (são contrato, não renomear): `tng.tema`, `tng.placares`, `tng.cenarios`,
`tng.prefs`, `tng.espn.cache`, `tng.escalacoes`, `tng.elencos.cache`, `tng.milhao.*`, `tng.fast.*`
(e as do Draft, `dez.*`).

## Atualizar

```bash
python ferramentas/baixar_espn.py 2026 dados/brasileirao-2026.json   # reserva do simulador
node tools/elencos.js                                                # reserva dos elencos (depois de baixar os dois JSON)
python tools/portar_draft.py                                         # quando o Football Draft mudar
python tools/og.py                                                   # imagens de compartilhamento (serve.py no ar)
```

O GitHub Actions faz as duas primeiras sozinho, duas vezes por dia (`.github/workflows/atualizar-dados.yml`).

## Publicar

```bash
node tools/build.js --release --site https://SEU-DOMINIO
```

Gera `dist/` com a marca de versão publicada (some a faixa vermelha de erro), os JSON compactados,
`sitemap.xml`, `robots.txt` e as **páginas de entrada** (`/escalacao/`, `/jogos/`, `/jogar/milhao/`,
`/simulador/flamengo/`...), que dão ao link do WhatsApp o título e a imagem certos e levam à rota do
site. `dist/` sobe como está para qualquer hospedagem estática:

- **GitHub Pages:** `.github/workflows/publicar.yml` (defina a variável `SITE_URL` no repositório);
- **Cloudflare Pages / Netlify:** comando de build `node tools/build.js --release --site $URL`, pasta `dist`.

### Prévia como Artifact do claude.ai

Prévia atual: https://claude.ai/artifact/DdzuM9tAFYmdeQ32iojXy5 (compartilhe pelo menu "Share" da página).
Para atualizar, gere a pasta e peça ao Claude para republicar `dist-artifact/` no mesmo endereço:

```bash
node tools/build.js --release && node tools/artifact.js https://claude.ai/artifact/DdzuM9tAFYmdeQ32iojXy5
```

Lá dentro o site roda sem acesso à internet de fora: usa as reservas (ESPN e elencos do dia do
build), os links levam só a aba (`#simulador-flamengo`), sem os placares, e as imagens se salvam
tocando e segurando, porque downloads são bloqueados.

# Tapa na Gaveta: plano

Site de futebol com quatro abas: **Simulador do Brasileirão** (a isca), **Monte sua escalação**,
**Jogos** e, se der, **Estatísticas**. Objetivo do negócio: atrair torcedores, fazê-los voltar e
compartilhar, e levá-los aos apps da Google Play.

Este arquivo guarda as decisões e os porquês. Muda quando uma decisão muda.

Em 10/11/2026 as duas versões do site viraram uma só (seção 10): a estrutura, o núcleo e as abas
desta versão, com a identidade azul-noite e dourado e as funções que só existiam na versão em
arquivo único do Jean (resumo no topo, revelação um a um, vídeo, envio das imagens num toque).

## 1. Decisões de arquitetura

| Tema | Decisão | Por quê |
|---|---|---|
| Stack | HTML, CSS e JS puros, sem build; IIFE com `'use strict'` | Playbook e SuperCroc: editar e apertar F5 é o ciclo inteiro. |
| Onde mora o site | Na raiz do repositório: `index.html`, `app/`, `shared/`, `jogos/`, `tools/`, `docs/`. `ferramentas/` e `tools/` não vão para o ar; o material de consulta (`referencias/`, `apps/`, `tapa-na-gaveta-midia/`) fica fora do repositório | O `tools/build.js` copia só o que é publicado para `dist/`. |
| Rotas | Uma página, roteador por hash como o do SuperCroc (`parse`, `render`, `goBack`): `#/simulador`, `#/simulador/flamengo`, `#/escalacao`, `#/jogos/draft`, `#/estatisticas` | Funciona em hospedagem estática, sem configurar servidor. |
| Módulos das abas | `app/abas/<aba>.js`, carregados sob demanda por `<script>` injetado na primeira visita | Página inicial leve (meta: menos de 300 KB antes das imagens). |
| Núcleo de regras | `shared/simulador-core.js`, sem DOM, exportado para o navegador (`window.TNGCore`) e para o Node (`module.exports`) | Testável com `node tools/testar-core.js`. Regra de ouro do playbook. |
| Contas pesadas | Monte Carlo num Web Worker (`shared/simulador-worker.js`) que importa o mesmo núcleo | A página nunca trava; barra de progresso. |
| Jogos | Cada um na sua pasta (`jogos/draft/`, `jogos/milhao/`, `jogos/fast/`), com `index.html` próprio, aberto num `<iframe>` | O CSS e as globais de um jogo não vazam; cada jogo continua testável sozinho. |
| Armazenamento | Sempre em `try/catch`, com o padrão sensato no `catch`. Prefixo `tng.` | **As chaves são contrato:** `tng.tema`, `tng.espn.cache`, `tng.placares`, `tng.cenarios`, `tng.escalacoes`, `tng.prefs`. As da versão em arquivo único (`tng-rascunho-v1/v2`, `tng-cenarios-v1/v2`) são lidas uma vez, convertidas e apagadas. |
| Dev x publicado | `window.TNG_RELEASE` gravado por `tools/build.js --release`; faixa vermelha de erro só no desenvolvimento | Playbook, seção 5. |
| Sem CDN | Fontes em `shared/fonts/`: Archivo variável no site; Manrope e Big Shoulders nos jogos (OFL); Matter.js em `shared/vendor/` | Funciona sem internet. |
| Números | Tabelas e porcentagens em Archivo com `tabular-nums`; "Archivo Largo" (a mesma fonte presa na largura máxima) em títulos e números grandes | Uma família só, com a largura como hierarquia. |
| Testes | `node tools/testar-core.js` (regras) e `python tools/capturas.py` (Playwright, 320x568, 390x844 e 1280x800, claro e escuro) | Nada de "deve funcionar". |

## 2. Dados do simulador

- **Camadas:** ESPN ao vivo → `tng.espn.cache` (com data) → `dados/brasileirao-2026.json`. O site
  nunca abre vazio; mostra discretamente "atualizado às 21h40".
- **Rodadas:** a ESPN não informa. Dedução: para cada time, o k-ésimo jogo restante, em ordem de
  data, é a rodada `jogos_feitos + k`. No retrato de 07/11 isso dá as rodadas 35 a 38 com 10 jogos
  cada e mais um jogo atrasado (Chapecoense x Vasco, rodada 34). Se a dedução não fechar (dois
  jogos do mesmo time na mesma rodada), cai para agrupar por data ("fim de semana de 22/11").
- **Regras** em `shared/regras-brasileirao-2026.json`: ordem dos critérios de desempate e zonas.
  Cartões não vêm da ESPN: depois do confronto direto, o desempate vira sorteio (simplificação
  documentada na própria tela). Conferir o regulamento de 2026 na fase 3.

## 3. Modelo de probabilidade

1. Força de ataque e de defesa de cada time (gols por jogo, separados em casa e fora), encolhida
   para a média da liga com peso `k` jogos fictícios.
2. Ajuste de forma recente (últimos 3 ou 5 jogos) e de pontos por jogo, com pesos pequenos.
3. Gols esperados → Poisson com correção de Dixon-Coles (`rho`) para placares baixos →
   vitória/empate/derrota e placar mais provável.
4. **Calibração:** para cada um dos 339 jogos, ajustar o modelo só com os jogos de datas
   anteriores e medir o Brier score; escolher `k`, pesos e `rho` pela menor média. Comparar com
   dois modelos de referência (sempre 45/27/28 e "só mando"). Resultado anotado aqui.

**Resultado da calibração (07/11/2026, `node tools/calibrar.js`)**: 289 jogos avaliados (os 50
primeiros só alimentam o modelo), 1.260 combinações.

| Modelo | Brier |
|---|---|
| Referência: frequências da liga até a véspera | 0,632 |
| Só força de ataque e defesa (sem forma, sem campanha) | 0,614 |
| **Escolhido:** k = 32, forma de 5 jogos (peso 0,3), pontos por jogo (peso 1,2), rho = −0,1 | **0,604** |
| Com forma de 3 jogos (peso 0,15) | 0,606 |

O que os números dizem: com só 34 rodadas, gols separados em casa e fora são barulhentos; o modelo
melhora quando encolhe bastante essas forças (k alto) e dá peso à campanha (pontos por jogo, que é
a "posição na tabela" do Julio) e à forma recente. A melhora fica plana a partir de k ≈ 32: escolhi o
meio da região boa, não o canto da grade. Calibração por faixas: quando o modelo diz 50–60%,
aconteceu 58%; quando diz 20–30%, aconteceu 26%.

Desempate (REC 2026, art. 15): pontos, vitórias, saldo, gols pró, confronto direto (só entre dois
clubes), cartões vermelhos, amarelos, sorteio. Sem cartões na ESPN, o simulador vai do confronto
direto ao sorteio. Conferido: a classificação calculada bate posição a posição com a da ESPN.

## 4. Ideias comparadas (e a escolhida)

**Simulador no celular**
- (a) Uma rolagem só: tabela em cima, jogos embaixo. Simples, mas a tabela empurra os jogos.
- (b) **Abas internas fixas no topo: Jogos · Tabela · Chances.** O polegar fica nos jogos; a tabela
  está a um toque. No computador, duas colunas: jogos à esquerda, tabela fixa à direita. ← escolhida
- (c) Tabela numa gaveta que sobe do rodapé. Bonita, mas briga com a rolagem e o teclado.

**Preencher placar**
- (a) Dois campos numéricos (`inputmode="numeric"`), que pulam sozinhos para o próximo campo.
- (b) Botões + e − de cada lado: lentos para 41 jogos.
- (c) Atalhos 1 · X · 2 que preenchem o placar mais provável daquele resultado.
- **Escolha: (a) + (c), com os atalhos embutidos na barra de probabilidades:** cada um dos três
  trechos da barra é um botão (alvo de 44 px de largura no mínimo). Tocar em "48%" do visitante
  preenche o placar mais provável de vitória dele. Um elemento só mostra a chance e preenche.

**Jogo no celular**: em linha (escudo, nome, placar, nome, escudo) cortava "Chapecoense" já em
390 px. Ficou em formato de placar: escudo em cima e nome embaixo, de cada lado do placar; cabe
inteiro em 320 px (conferido por medição no roteiro de capturas).

**Probabilidades no jogo**: barra fina dividida em três tons neutros (mandante escuro, empate
médio, visitante claro) com os números pequenos em cima. Sem cores de clube, sem tabela de
números.

**Revelação da tabela** (fase 4, prova com protótipo antes):
- (a) Linhas entram uma a uma, de baixo para cima, com pausa nas fronteiras de zona e uma pausa
  maior antes do campeão.
- (b) Linhas deslizam da posição atual até a final (animação FLIP), todas juntas.
- (c) Placar de aeroporto (letras virando).
- Inclinação: (a), com o número de pontos "contando" em cada linha; (c) parece efeito pelo efeito.

**Cenário por link** (feito): mapa de bits dos 400 pares mandante × visitante + 1 byte por placar,
em base64url. O par, e não o id da ESPN, é a chave: não muda quando a ESPN remarca um jogo adiado.
41 jogos ≈ 120 caracteres. Quem abre o link vê o cenário numa faixa ("cenário de outra pessoa"),
sem apagar os próprios placares, e pode revelar a tabela ou "usar e editar".

**"O que o meu time precisa"** (feito): três camadas, da mais exata para a mais aproximada.
1. Situação pelos pontos: "já garantiu" (o objetivo mais alto) e "já não alcança" (o mais modesto).
2. Até 10 jogos relevantes: enumeração exata de vitória/empate/derrota (3^k combinações), com
   desempate por vitórias e "decide no saldo" quando o saldo é que decide. Daí saem a frase por pontos
   ("Garante o título se somar 8 pontos nos 4 jogos que faltam") e as condições suficientes mais
   curtas, achadas com conjuntos de bits ("vencer o Athletico e o Palmeiras").
3. Sempre: 8.000 simulações no Worker para a chance, a chance por pontos feitos e "para torcer"
   (os jogos de outros times que mais mexem na chance).
Primeira tentativa (descartada): árvore de condições jogo a jogo. Ficava certa, mas ilegível.

## 5. Identidade visual

**Desde 10/11/2026: azul-noite e dourado**, escolhida na unificação (a da versão do Jean).

- Topo azul-noite (`#0b1640`) com linhas de campo bem apagadas (meio-campo e círculo central); no
  simulador, a faixa continua com o resumo ao vivo: líder ou campeão, quem mais vai à Libertadores
  e quem cai.
- Área de trabalho clara (`#eef0f4`, superfícies brancas); tema escuro em azul profundo.
- **Dourado (`#ffc23d`) marca o que o usuário escolheu**: placar, resultado na barra de chances,
  time, rodadas preenchidas.
- Zonas: Libertadores `#2b4bff`, pré `#8fb0ff`, Sul-Americana `#12a26b`, rebaixamento `#e5484d`.
- Escudos sobre fundo escuro sempre numa placa branca (resumo, revelação, imagens, vídeo).
- Frases em caixa baixa, sem rótulos em caixa alta. Cor de clube só no cartão do "meu time".
- Os jogos (Draft, Milhão, Fast) mantêm a identidade própria, dentro do `<iframe>`.

Antes disso valia a C · Prancheta (verde-gramado e giz-limão), escolhida pelo Julio em 07/11/2026
entre três direções: no mesmo protótipo, com dados reais, para o Julio escolher. Todas com fundo neutro, uma cor de marca e no máximo um destaque; cores dos clubes só nos
escudos e numa barra fina; números tabulares.

- **A · Jornal**: papel claro e tinta, vermelho de caderno de esporte, fios finos como tabela de
  jornal.
- **B · Placar**: grafite, números grandes condensados, âmbar de placar de estádio.
- **C · Prancheta**: verde-gramado fechado, linhas de giz, mais arejado.

Logotipo: "gaveta" é o ângulo do gol. A marca é o nome em caixa-alta condensada com um esquadro
(travessão + trave) no canto superior direito e a bola encaixada nele. Versão curta "TG" para
ícone e celular.

## 5b. Como rodar

```bash
python serve.py                      # http://localhost:8780/
python tools/capturas.py site        # capturas + conferências (servidor no ar)
node tools/build.js --release        # dist/ com a marca TNG_RELEASE
```

Aprendizados da fase 2: o roteador compara o `hashchange` com a tela **pedida**, não com a última
desenhada (voltar enquanto outra aba carrega deixava a tela em "Carregando…"); o nome do time é
`<th scope="row">` na tabela, com estilo de célula comum.

## 6. Fases

| # | Fase | Situação |
|---|---|---|
| 1 | Plano + direções visuais + logotipo | **Feita:** escolhida a C · Prancheta (trocada na unificação) |
| 2 | Esqueleto: roteador, menu, tokens, temas, rodapé | **Feita** |
| 3 | Núcleo do simulador no Node | **Feita:** `node tools/testar-core.js` (198 conferências) e calibração |
| 4 | Preencher, esconder e revelar, probabilidades, simular o resto, meu time | **Feita** |
| 5 | Chances (Worker), cenários salvos e por link, imagens para compartilhar | **Feita** |
| 6 | "O que o meu time precisa" | **Feita** |
| 7 | Monte sua escalação | **Feita** (sem o modo confronto: fica como atrativo do app) |
| 8 | Jogos: Draft (porte), Milhão e Fast Football (refeitos) | **Feita:** `node tools/testar-milhao.js` (8.424 conferências) |
| 9 | Estatísticas e desenho das eliminatórias | **Feita:** aba Estatísticas; `docs/ELIMINATORIAS.md` |
| 10 | Publicação: build, Open Graph, páginas de entrada, sitemap, automação | **Feita** no código; publicação pelo GitHub Pages (Actions) |
| 11 | Unificação com a versão em arquivo único | **Feita** em 10/11/2026 (seção 10) |

Todos os roteiros: `python tools/capturas.py site --pagina` e `python tools/capturas.py simulador`.

## 7. Decisões tomadas por padrão (o Julio pode trocar)

| Tema | Padrão adotado | Onde trocar |
|---|---|---|
| Zonas de 2026 | Vagas iniciais da CBF: 1º–4º Libertadores, 5º pré, 6º–11º Sul-Americana, 17º–20º queda; "podem mudar" na tela | `shared/regras-brasileirao-2026.json` |
| Jogos na web | Tudo liberado, sem anúncios e sem compras; cartão "tem mais no app" com link medido | `tools/portar_draft.py` (Draft), `jogos/*/` |
| Anúncios no site | Nenhum por enquanto; o layout não reservou espaço | — |
| Idioma | Só português (os jogos trazem os textos em três línguas no código) | — |
| Domínio | `tapanagaveta.com.br` só como texto provisório na marca-d'água das imagens | `enderecoSite()` em `app/app.js` e `--site` no build |
| Modo confronto da escalação | Fora da web (chamariz do app) | — |
| Estádios do Draft | As 133 fotos em WebP, carregadas só quando escolhidas (16 MB no total, fora da página inicial) | `tools/portar_draft.py` |

## 8. Decisões do Julio (em aberto)

- Domínio próprio (hoje o GitHub Pages do repositório; o `dist/` serve também para Cloudflare Pages
  ou Netlify).
- Anúncios: agora ou depois, e onde.
- Jogos na web: manter tudo liberado ou guardar algo para o app.
- Versão em inglês ou espanhol.

## 9. Aprendizados (para não repetir)

- O roteador compara o `hashchange` com a tela **pedida**, não com a última desenhada.
- `fetch` solto (`o.fetch = fetch; o.fetch(url)`) perde o `this` no navegador: "Illegal invocation".
- `select()` atrasado num campo puxa o foco de volta: só selecionar se o campo ainda tiver o foco.
- Contêiner com `data-aba` captura `closest('[data-aba]')` de qualquer clique: usar `button[data-aba]`.
- A Big Shoulders não tem algarismos tabulares (por isso, na época, números de tabela em Manrope).
- Ao editar arquivos com quebra de linha CRLF por script, preservar o CRLF (`newline=''` no Python):
  senão o diff mostra o arquivo inteiro trocado.
- O proxy da empresa bloqueia fontes e pacotes do npm, não o Matter.js do cdnjs; e às vezes bloqueia a
  ESPN no Chromium de teste (o site cai para a reserva, como deve).
- Peso da página inicial: 319 KB brutos, **125 KB transferidos** (gzip), sem imagens.

## 10. Unificação (10/11/2026)

Duas versões conviviam: a do Julio (esta estrutura, com núcleo testado, Worker, escalação, jogos e
build) e a do Jean (um `index.html` único, azul-noite e dourado). Ficou esta estrutura, e de cada
função a melhor implementação:

| Função | Ficou com | O que veio da versão do Jean |
|---|---|---|
| Estrutura, dados (ESPN → cache → reserva atualizada pelo Actions), modelo, desempate | Julio | — |
| Identidade visual | Jean | tokens, Archivo, linhas de campo, dourado nas escolhas |
| Topo do simulador | Jean | resumo ao vivo (líder, Libertadores, queda) e a frase que acompanha os palpites |
| Rodadas | Julio + Jean | linha do tempo com o progresso de cada rodada |
| Placar | Julio + Jean | botões − e + embaixo do campo; linhas da tabela deslizando e pontos contando |
| Revelação | Julio + Jean | modo "um a um, no toque" e confete |
| O que o meu time precisa | motor do Julio | cartão na cor do clube, chance de cada objetivo, distribuição das posições |
| Imagens | Julio + Jean | as duas num envio só; escudos em placa branca |
| Vídeo da tabela placar a placar | Jean | `app/video.js` |
| Escalação, Jogos, Estatísticas, cenários, link | Julio | — |
| Proxy próprio da ESPN | — | saiu: a ESPN responde direto ao navegador |

Dados salvos e links da versão antiga continuam valendo: `migrarAntigos`, `placaresAntigos` e
`decodificarAntigo` no núcleo (com conferências), e os endereços `#simular`, `#chances`,
`#meu-time`, `#salvos` e `#numeros` levam às rotas novas.

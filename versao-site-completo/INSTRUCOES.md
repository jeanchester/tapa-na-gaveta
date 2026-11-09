# Tapa na Gaveta — instruções para construir o site

Este documento é o ponto de partida. Leia-o inteiro antes de escrever a primeira linha de código,
depois leia `referencias/PLAYBOOK.md` e `referencias/supercroc/README.md`. Os outros arquivos da
pasta são material de consulta: abra quando chegar a hora de cada aba.

Pacote preparado em 07/11/2026 a partir dos projetos do Julio (Cotuba Inc.).

---

## 1. Quem pede e para quê

O Julio publica apps e jogos Android de futebol (Você Escala, Jogo do Milhão do Futebol, Fast
Football, Football Draft) e quer um site de futebol chamado **Tapa na Gaveta**. A prioridade número
um dele é **aumentar a receita**: o site deve atrair torcedores (o simulador do Brasileirão é a
isca principal), fazer com que eles voltem e compartilhem, e levar gente para os apps da Google Play.

Ele conversa em português e corrige regência e crase: revise tudo o que for texto do site e tudo
o que escrever para ele.

## 2. Como trabalhar

- **Calma e organização.** Antes de codar, leia, entenda e escreva um plano curto em
  `docs/PLANO.md` (decisões e porquês, como no `PLAYBOOK.md`). Trabalhe por fases (seção 9), uma
  aba de cada vez, e só passe adiante quando a fase anterior estiver testada.
- **Tenha várias ideias e escolha as melhores.** Para cada tela importante, pense em duas ou três
  soluções, compare-as rapidamente (no próprio plano) e implemente a melhor. Não implemente tudo
  o que pensar: menos coisas, muito bem feitas.
- **Teste de verdade.** Núcleo de regras testável no Node, sem tela. Capturas em 320x568, 390x844
  e 1280x800 (claro e escuro) a cada tela nova, olhadas com atenção. Nada de "deve funcionar".
- **Mostre ao Julio** o que fez ao fim de cada fase, com capturas, e pergunte quando a decisão for
  dele (seção 10). Não invente respostas para o que é decisão de negócio.
- Nada de senhas, chaves ou segredos no código ou no repositório. As cópias de código desta pasta
  já tiveram as chaves trocadas por `CHAVE_REMOVIDA`; o site não precisa de nenhuma delas.

## 3. O que tem nesta pasta

| Caminho | O que é | Para que serve |
|---|---|---|
| `referencias/PLAYBOOK.md` | Como o Julio constrói apps em HTML/JS puro + Capacitor | Robustez (seção 4), marca de release (5), estrutura (2), testes (11), convenções (12) |
| `referencias/supercroc/` | App/site de vestibular dele em HTML/CSS/JS puro, já pensado para virar site | **Modelo de arquitetura do site**: roteador por hash, tokens de cor com tema escuro, `safe-area`, armazenamento protegido, faixa de erro só no desenvolvimento. Copie o esqueleto, **não** o visual |
| `apps/football-draft/` | Código do Football Draft (HTML/CSS/JS + Canvas, sem Phaser) | Porta quase direta para a aba Jogos. Os dados de elencos reais estão em `shared/dados/` |
| `apps/milhao-do-futebol/` | `perguntas.json` (1.007 perguntas), réplica web (`replica-web/game.js`, Phaser), o código original (`app-original-index.tsx`), sons e símbolos das ajudas | Refazer o Jogo do Milhão na aba Jogos |
| `apps/voce-escala/` | Código original (`app-original-index.tsx`, React Native) e réplica web (`replica-web/game.js`) | Base da aba "Monte sua escalação": esquemas táticos, times, cores, regras |
| `apps/fast-football/` | Código original (`app-original-index.tsx`, React Native + Matter.js) e sons | Refazer o Fast Football em Canvas na aba Jogos |
| `midia/escudos/` | 207 escudos em PNG de até 128 px (clubes do Brasil e da Europa, seleções) | Todas as abas. Nomes de arquivo = chaves usadas no Draft e no quiz do Milhão |
| `midia/icones/` | Ícones dos 4 apps (192 px) | Cartões "baixe o app" |
| `dados/brasileirao-2026.json` | Retrato da ESPN de 07/11/2026: 20 times, classificação, 380 jogos (339 terminados, 41 a jogar) | Reserva do simulador quando a API falhar, e para testar sem rede |
| `ferramentas/baixar_espn.py` | Gera o retrato acima | Rodar de novo para atualizar a reserva (`python ferramentas/baixar_espn.py 2026`) |

**Mídia pesada em zip separado** (`tapa-na-gaveta-midia.zip`, ~35 MB, extraído por cima desta
pasta; ver `LEIA-ME-MIDIA.md`): as 133 fotos de estádio (com miniaturas), a música do Draft, a
abertura do Milhão, a animação do chute e os personagens do Milhão. Se o Julio não tiver mandado
esse zip, peça. Use com moderação: carregue sob demanda e, quando um desenho resolver bem (gramado
em Canvas/SVG, sons curtos com Web Audio), prefira o desenho.

## 4. Arquitetura (decidida; ajuste só com bom motivo)

O que veio do `PLAYBOOK.md` e do SuperCroc e vale aqui:

- **HTML, CSS e JavaScript puros, sem build** (sem React, sem Vite, sem TypeScript). O mesmo
  arquivo roda no navegador do desenvolvedor e no servidor. Editar e apertar F5 é o ciclo inteiro.
  Hospedagem estática (GitHub Pages, Cloudflare Pages ou Netlify: pergunte ao Julio).
- **Uma página com roteador por hash** (`#/simulador`, `#/escalacao`, `#/jogos/draft`...), como
  em `referencias/supercroc/app.js` (funções `parse`, `render`, `goBack`). Cada aba é um módulo
  próprio (`app/abas/simulador.js` etc.) que só carrega quando é aberta.
- **Núcleo de regras puro** em `shared/` (sem DOM): `simulador-core.js` (tabela, desempates,
  probabilidades, Monte Carlo, cenários), testável com `node`. É a regra de ouro do playbook.
- **Os jogos rodam isolados**, cada um na sua pasta (`jogos/draft/`, `jogos/milhao/`,
  `jogos/fast/`) com o seu `index.html`, abertos dentro de um `<iframe>` na página da aba. Assim o
  CSS e as variáveis globais de um jogo não vazam para o site, e cada jogo continua testável sozinho.
- **Armazenamento sempre em `try/catch`** com o padrão sensato no `catch` (playbook, 4.1). Prefixo
  das chaves: `tng.` (por exemplo `tng.cenarios`, `tng.escalacoes`). As chaves são contrato: não
  renomeie depois de publicado.
- **Faixa vermelha de erro só no desenvolvimento** e marca `window.TNG_RELEASE` gravada pelo
  `tools/build.js` na versão publicada (playbook, seção 5).
- **Sem CDN para o essencial**: fontes e bibliotecas (Matter.js, se usar) em `shared/vendor/` e
  `shared/fonts/`.
- **Contas pesadas fora da tela**: o Monte Carlo do simulador roda num Web Worker, com barra de
  progresso, para a página nunca travar.
- `serve.py` sem cache para o desenvolvimento (copie o do SuperCroc ou do Draft) e um roteiro de
  capturas automatizado (playbook, seção 11; o Draft tem `tools/roteiro.js` como exemplo, não
  incluído aqui: um Chrome headless por CDP ou Playwright resolve).
- SEO básico: `title`, `description` e imagem de compartilhamento (Open Graph) por aba, porque o
  link vai circular no WhatsApp. `sitemap.xml` e `robots.txt` simples.

## 5. Identidade visual: belíssimo, limpo, moderno e sem cara de IA

O Julio quer um design que pareça feito por um bom estúdio, não por IA. O que dá "cara de IA" e
deve ser evitado:

- gradiente roxo/azul, bolhas desfocadas no fundo, vidro fosco em tudo, brilho neon;
- emojis no lugar de ícones; ícones genéricos em círculos coloridos sobre cada cartão;
- grade de cartões iguais com ícone + título + duas linhas de texto vago;
- frases de efeito vazias ("Revolucione sua experiência futebolística");
- sombras pesadas, bordas arredondadas exageradas, tudo centralizado, excesso de cores.

Direção sugerida (proponha a sua com 2 ou 3 variações e escolha a melhor, mostrando ao Julio):

- **Inspiração**: tabela de jornal esportivo bem diagramada, placar de estádio, prancheta de
  técnico. Tipografia forte e números grandes fazem o trabalho que enfeites fariam.
- **Tipografia**: uma fonte de títulos com personalidade esportiva (condensada ou de largura
  variável) e uma fonte de texto muito legível, com **algarismos tabulares** em todas as tabelas
  (`font-variant-numeric: tabular-nums`). Fontes locais (`shared/fonts/`, licença livre).
- **Cor**: fundo neutro (papel claro / grafite escuro), uma cor de marca e no máximo uma cor de
  destaque. As cores dos clubes aparecem só nos escudos e em detalhes finos (uma barra lateral na
  linha da tabela), nunca como fundo de tela inteira. Zonas da tabela (Libertadores,
  Sul-Americana, rebaixamento) em marcas discretas, coerentes nas duas versões de tema.
- **Tokens no `:root`** com tema escuro por `prefers-color-scheme` e por `data-theme`, como no
  `app.css` do SuperCroc.
- **Movimento com propósito**: a revelação da tabela é o grande momento de animação do site;
  o resto é contido (transições curtas, nada pulando sozinho).
- **Celular primeiro**: a maior parte do público chega pelo WhatsApp no celular. Alvos de toque de
  44 px, tabela que cabe em 320 px sem rolagem horizontal (colunas que somem com elegância), e
  layout de duas colunas no computador.
- **Logo**: crie um logotipo tipográfico para "Tapa na Gaveta" (SVG). Proponha opções.
- Os apps têm identidades próprias (verde e amarelo do Milhão, campo do Você Escala...). Ao trazer
  um app para o site, **adapte-o à identidade do site** (fontes, cores, botões), mantendo as regras
  e a graça do jogo.

## 6. Abas

### 6.1 Simulador do Brasileirão (a aba principal)

#### Dados

- **API pública da ESPN** (não oficial, sem chave, **CORS liberado**: dá para chamar do navegador;
  conferido em 07/11/2026):
  - classificação: `https://site.api.espn.com/apis/v2/sports/soccer/bra.1/standings?season=2026`
  - jogos de um mês: `https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard?dates=202611&limit=300`
    (só o formato de mês `AAAAMM` funciona; intervalo de datas e dia avulso voltam vazios).
  - Cada jogo traz mandante/visitante, placar, `status` (`STATUS_FULL_TIME`, `STATUS_SCHEDULED`,
    `STATUS_POSTPONED`) e `form` (últimos 5 resultados de cada time, W/D/L).
  - **A ESPN não informa a rodada.** O jogo adiado continua listado como `STATUS_POSTPONED`, e a
    remarcação vem com outro id. O `ferramentas/baixar_espn.py` já trata isso; leia-o.
    Para numerar as rodadas, procure uma fonte (tabela da CBF) ou deduza (cada time joga uma vez por
    rodada, na ordem do calendário original); se não der com segurança, agrupe os jogos restantes por
    data ("próximos jogos", "fim de semana de 22/11"), o que funciona bem para o usuário.
- **Camadas de reserva** (robustez do playbook): ESPN ao vivo → último resultado guardado no
  aparelho (`tng.espn.cache`, com a data) → `dados/brasileirao-2026.json` publicado com o site.
  O site nunca pode abrir vazio. Mostre discretamente "atualizado às 21h40".
- Depois de publicado, uma automação simples (GitHub Actions diário com o `baixar_espn.py`) mantém
  o arquivo de reserva fresco. Proponha ao Julio.
- Escudos: `midia/escudos/<chave>.png`; a chave de cada time está no campo `escudo` do JSON.
- **Regras que precisam estar certas e configuráveis** (`shared/regras-brasileirao-2026.json`):
  critérios de desempate (pela ordem do regulamento da CBF: pontos, vitórias, saldo, gols pró,
  confronto direto, menos cartões vermelhos, menos amarelos, sorteio; **confira no regulamento de
  2026**) e as zonas (Libertadores, pré-Libertadores, Sul-Americana, rebaixamento). As vagas mudam
  com campeões de copas: deixe-as num arquivo, marque "pode mudar" na interface e confirme os
  números com o Julio. Cartões provavelmente não estarão disponíveis: documente a simplificação.

#### Modelo de probabilidade (mostrado em cada jogo)

Ideia do Julio: usar posição na tabela, resultados dos últimos 3 ou 5 jogos e mando de campo.
Uma forma sólida e explicável:

1. Força de ataque e de defesa de cada time a partir dos gols da temporada, separados em casa e
   fora, puxados para a média da liga quando há poucos jogos (encolhimento).
2. Ajuste de forma recente (últimos 3 ou 5 jogos, o usuário escolhe) e da posição/pontos por jogo,
   com pesos moderados.
3. Gols esperados de cada lado → **Poisson** (com um pequeno ajuste para empates, tipo
   Dixon-Coles) → probabilidades de vitória do mandante, empate e vitória do visitante, e o placar
   mais provável.
4. **Calibre com os 339 jogos já disputados**: simule cada rodada passada só com o que se sabia
   antes dela e meça o erro (Brier score). Escolha os pesos assim, não no olho, e anote no plano.

Mostre as três porcentagens em cada jogo de um jeito limpo (uma barra fina dividida em três), não
como uma tabela de números.

#### Funções (ideias do Julio, todas desejadas; a ordem sugerida está na seção 9)

1. **Preencher os placares** dos jogos restantes (toque rápido, teclado numérico no celular,
   atalhos "vitória/empate/derrota" que preenchem um placar típico).
2. **Ocultar a tabela** enquanto preenche, para ter suspense.
3. **Revelação animada** ao terminar: time a time, de baixo para cima ou de cima para baixo (o
   usuário escolhe). É o momento mais "compartilhável" do site: capriche no ritmo, na tipografia e
   na hora do campeão e dos rebaixados, sem exagero.
4. **Probabilidades à mostra** em cada jogo (modelo acima).
5. **Simular todos os jogos restantes** com base nas probabilidades (sorteio de placar pelo
   Poisson, não só do resultado).
6. **Simular só o meu time**: o torcedor escolhe o time, preenche só os jogos dele, e o resto é
   simulado pelas probabilidades. É a porta de entrada para cada torcida: dê um link direto
   (`#/simulador/flamengo`).
7. **Chances em N simulações** (Monte Carlo, N = 10.000 por padrão, no Worker): para cada time,
   chance de título, Libertadores, Sul-Americana e rebaixamento, respeitando os placares que o
   usuário já fixou. Tabela de chances e, para um time, a distribuição de posições finais.
8. **Cenários salvos**: o usuário salva, dá nome, reabre e compara. Guarde no aparelho
   (`tng.cenarios`) e permita **compartilhar o cenário por link** (os placares codificados de forma
   compacta no próprio link: quem abre vê exatamente aquele cenário, sem servidor).
9. **"O que o meu time precisa"**: na reta final (ou desde a rodada em que der matematicamente),
   o usuário escolhe um time e o site mostra em quais cenários ele é campeão, vai à Libertadores,
   à Sul-Americana ou cai. Com poucos jogos relevantes, enumere as combinações (vitória/empate/
   derrota de cada jogo que importa) e resuma em linguagem humana ("é campeão se vencer o Santos e
   o Palmeiras não vencer"); com muitos, use o Monte Carlo e mostre as condições mais decisivas.
   Também vale mostrar "já garantido" e "matematicamente eliminado".
10. **Exportar em 1 ou 2 imagens** (tabela final; jogos preenchidos), com a marca-d'água e o
    endereço do site, prontas para o WhatsApp e os stories: gerar num `<canvas>` (1080x1350 e
    1080x1920), compartilhar com `navigator.share({ files })` e, sem suporte, baixar a imagem e
    abrir o WhatsApp com o texto e o link (`https://wa.me/?text=...`). O Football Draft já faz algo
    parecido: veja `apps/football-draft/app/servicos.js`, perto de `toDataURL` e `navigator.share`.
11. **Competições eliminatórias** (Copa do Brasil, Libertadores, Copa do Mundo): pense o núcleo
    de modo que "liga", "grupos" e "mata-mata (ida e volta, pênaltis)" sejam formatos plugáveis. Na
    primeira versão, só o Brasileirão; deixe o desenho pronto e proponha a próxima competição.

### 6.2 Estatísticas (não é obrigatória agora)

Só faça se for fácil e com dados confiáveis. A ESPN tem outros endpoints públicos no mesmo padrão
(por exemplo estatísticas e artilheiros da liga); confira o que existe e se o CORS está liberado
antes de decidir. Sugestão de primeira versão, com o que já vem dos jogos: campanha em casa e fora,
sequências, gols por rodada, ataque e defesa, aproveitamento dos últimos jogos. Se não der, deixe a
aba com "em breve" bem desenhado, ou fora do menu.

### 6.3 Monte sua escalação (a partir do Você Escala)

- **Regras e dados** em `apps/voce-escala/app-original-index.tsx`: `ESQUEMAS_TATICOS` (posições
  de 8 esquemas em frações do campo), cores dos times, modo confronto (dois times no mesmo campo),
  jogadores personalizados, salvar escalações. A réplica `replica-web/game.js` mostra o visual em
  Canvas; use como referência de comportamento, não de código.
- **Elencos atualizados** no repositório público do Julio, já com CORS liberado:
  - `https://raw.githubusercontent.com/jujubs333/futebol-elencos/main/data/elencos.json`
  - `https://raw.githubusercontent.com/jujubs333/futebol-elencos/main/data/elencos_copa_2026.json`
  (é de lá que o app baixa; times em `replica-web/dados/base.json`, com id e cores).
- Na web, faça com **HTML/CSS** (campo em SVG ou CSS, jogadores arrastáveis no computador e de
  toque no celular), com o visual do site.
- **Exportar a escalação em imagem** com marca-d'água e compartilhar, como no simulador.
- Chamada discreta e bonita para o app: "Monte no celular, salve e compare com os amigos: baixe o
  Você Escala" com o link da Play (seção 7).

### 6.4 Jogos

Três jogos, cada um isolado na sua pasta e aberto em `<iframe>`, cada um com o cartão "jogue
aqui" e o link para a versão Android.

- **Football Draft** (`apps/football-draft/`): já é HTML/CSS/JS + Canvas, então a porta é quase
  direta. Leia o `README.md` e o `docs/PLANO.md`. Na web: tirar anúncios, compras e Firebase (os
  pontos únicos de `servicos.js` já degradam sem plugin; deixe tudo liberado ou decida com o Julio),
  escudos de `midia/escudos/` em `app/img/escudos/`, e os estádios (imagens não incluídas): use o
  gramado desenhado ou um estádio só. Adaptar a identidade ao site.
- **Jogo do Milhão do Futebol** (`apps/milhao-do-futebol/`): 16 perguntas valendo de R$ 1 mil a
  R$ 1 milhão (`PREMIOS`), 45 s por pergunta, ajudas Cartões, VAR, Torcida e Driblar (`AJUDAS`,
  `TEXTOS_AJUDA`), opção de parar, modos Brasileiro, Europeu, Copa do Mundo e Só Escudos.
  `perguntas.json` tem 5 níveis (`facil` a `impossivel`), tipos `texto` e `escudo` (a chave do
  escudo está em `midia/escudos/`). Os sons com a narração dos valores estão em `sons/`. Refaça em
  HTML/CSS (é um jogo de tela e botões), com o visual do site e o "clima de programa de TV".
- **Fast Football** (`apps/fast-football/`): partida rápida numa arena circular com uma barra
  giratória no centro, dois goleiros que se mexem, a bola quicando e gols em cima e embaixo; modo
  assistir (simulação) e modo jogar (o jogador gira a barra para a esquerda ou a direita);
  campeonato em mata-mata de 16 times. A física está em `app-original-index.tsx` (procure
  `Bodies.`, `spinner`, `keeper`, `restitution`): refaça em Canvas com Matter.js local, mantendo as
  constantes para o jogo "ter o mesmo jeito".

## 7. Links para os apps (Google Play)

| App | Pacote |
|---|---|
| Você Escala | `com.julio.escalafutebol` |
| Jogo do Milhão do Futebol | `com.julio333.ShowMilhaoFutebol` |
| Fast Football | `com.julio.footballexpress` |
| Football Draft | `com.julio333.FootballDraft` |

Link com origem medida (o Julio já usa nos apps):
`https://play.google.com/store/apps/details?id=<pacote>&referrer=utm_source%3Dtapanagaveta%26utm_medium%3D<aba>`.
Selo "Disponível no Google Play" oficial (guia de marca do Google) ou um botão próprio sóbrio.

## 8. Qualidade mínima de cada entrega

- Abre sem erro no console em Chrome, Safari (iPhone) e Firefox; funciona sem a ESPN.
- Capturas em 320, 390 e 1280 px, claro e escuro, sem nada vazando ou colado na borda.
- Acessível: contraste AA, foco visível, botões com nome, tabela com cabeçalhos de verdade.
- Rápido: a página inicial com menos de ~300 KB antes das imagens; escudos com `loading="lazy"`.
- Textos revisados (português do Brasil, crase e regência).

## 9. Ordem sugerida

1. Ler tudo, propor o plano (`docs/PLANO.md`) e 2 ou 3 direções visuais com o logotipo. Esperar a
   escolha do Julio.
2. Esqueleto do site: roteador, menu das abas, tokens, temas, rodapé, páginas vazias bem desenhadas.
3. Núcleo do simulador (Node, com testes): tabela, desempates, modelo, calibração, Monte Carlo.
4. Simulador: preencher, ocultar e revelar, probabilidades, simular restantes, só o meu time.
5. Simulador: chances em N simulações, cenários salvos e por link, exportar imagem.
6. Simulador: "o que o meu time precisa".
7. Monte sua escalação.
8. Jogos: Football Draft (o mais rápido), depois Milhão, depois Fast Football.
9. Estatísticas, se der; eliminatórias, desenho para a próxima versão.
10. Publicação: build de release, SEO, imagem de compartilhamento, hospedagem.

## 10. Decisões que são do Julio (pergunte, não suponha)

- Hospedagem e domínio.
- Anúncios no site (por exemplo AdSense) agora ou depois; se sim, onde (reserve espaço no layout
  sem poluir).
- Nos jogos da web, liberar tudo ou manter algum incentivo para baixar o app.
- Zonas de classificação de 2026 (quantas vagas de Libertadores e Sul-Americana).
- Se o site terá versão em inglês ou espanhol (os jogos têm textos em três idiomas).

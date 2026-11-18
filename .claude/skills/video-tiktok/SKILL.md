---
name: video-tiktok
description: Edita os vídeos de divulgação do Tapa na Gaveta para o TikTok (animação do simulador em cima, câmera embaixo), no estilo dos vídeos do Isake e no padrão visual do site, gera versões para testar um fator por vez (legenda, abertura, duração...) e confere/corrige áudio descasado. Use para montar, renderizar, testar ou consertar um vídeo do perfil.
---

# Vídeos do TikTok (Tapa na Gaveta)

O formato que dá certo no perfil do Isake: a metade de cima é a animação do simulador (1080×964) e a
metade de baixo é a pessoa falando para a câmera. A animação segue a fala: cada coisa entra quando a
palavra é dita. Tudo aqui gera essa metade de cima no padrão visual do site (azul-noite e dourado),
monta o vídeo final e confere se a voz está casada com a boca.

Arquivos (todos em `ferramentas/video/`):

| arquivo | para quê |
|---|---|
| `modelo.html` | o motor: cenas, sons sintetizados, área segura, prévia com a voz |
| `roteiros/NOME.js` | um arquivo por vídeo: textos, números, tempos (copie `exemplo-degola.js`) |
| `chances.js` | números do modelo do site (título, vagas, queda e "se vencer / empatar / perder") |
| `legendas.py` | legendas `.srt` → `T` (o tempo de cada palavra da fala) |
| `render.py` | gera a animação quadro a quadro e monta o vídeo final 1080×1920 |
| `sincronia.py` | diagnostica, mede e corrige áudio descasado |
| `repeticoes.py` | acha palavras e frases repetidas na transcrição, para cortar de modo que sobre uma vez só |
| `fala.py` | transcrição do sherpa-onnx → rascunho do campo `fala` (texto da legenda na tela) |
| `fontes/` | fonte da legenda queimada (Archivo extra negrito, OFL) |
| `escudos/` | escudos grandes (512 px) só para vídeo; o modelo usa estes primeiro e cai nos de `midia/escudos/` (128 px, ficam borrados quando ampliados) |

Saídas em `ferramentas/video/saida/` (fora do git). Gravações brutas também não vão para o git:
ficam na pasta "TikTok Tapa" do Drive.

## Regras que não mudam

- **A voz é sempre de gente.** Nada de voz de IA, nada de selo, marca d'água ou etiqueta de "editado
  com IA". Os efeitos sonoros e a trilha são sintetizados no próprio modelo (sem banco de áudio).
- **Os números são do modelo do site** (`chances.js` ou o próprio site), com a data em que foram
  tirados. Nunca invente porcentagem; se o jogo de ontem ainda não está no retrato, use `--placar`.
- **Área segura.** O que importa fica dentro do retângulo (115, 262, 850×682), que é a parte que a
  interface do TikTok não cobre. O modelo já põe o palco ali, **centralizado** (o Isake reclamou de
  animação descentralizada quando o vídeo foi encolhido para caber: não encolha, edite o roteiro).
  A faixa corrida e o cabeçalho ficam acima de propósito: são decoração.
- **Padrão visual do site:** azul-noite `#0b1640`, dourado `#ffc23d` para o que importa, cartões
  `#0f1733`, zonas da tabela (Libertadores `#2b4bff`, pré `#8fb0ff`, Sul-Americana `#12a26b`,
  rebaixamento `#e5484d`), fontes Archivo e Archivo Largo, logo do site, escudos de
  `midia/escudos/SLUG.png`. Texto em frase normal (nada de rótulo em caixa alta).
- **Movimento de impacto só quando responde à fala** (placar pulando, linha batendo na tabela, barra
  crescendo). Fora isso, só a camada leve de movimento contínuo (veja "Movimento leve"), para a tela
  nunca ficar parada sem cair no teatral.
- Português de torcedor, frases curtas. O Corinthians é o time do Jean e do Isake ("o Timão", "a gente").

## O que denuncia IA (evitar nas edições)

Lista de 20 sinais de visual feito por IA, do vídeo "20 sinais de que o teu dashboard foi feito por IA" do
@prof.julianofaccioni (TikTok, nov/2026), lida do vídeo e traduzida para o que fazemos. A animação de cima do
vídeo é uma interface, então vale tudo isto. São coisas para **não fazer**: a alternativa não é inventar outro
visual, é tirar o enfeite ou trocar por algo mais enxuto dentro da identidade do site.

| # | sinal | o que fazer no lugar |
|---|---|---|
| 1 | gradiente roxo e azul | cor chapada do padrão do site (azul-noite, dourado); nada de degradê |
| 2 | neon em cima de preto | o fundo é azul-noite; brilho só no dourado do que importa (ver "O que fica") |
| 3 | efeito de vidro nos cards | cartão opaco `#0f1733`, sem blur nem transparência |
| 4 | sombra desproporcional | sem sombra grande; separar com borda fina ou diferença de tom |
| 5 | eyebrow em todo título | `selo` só quando diz algo que o título não diz (data, competição); nunca em toda cena |
| 6 | tag de "ao vivo" | nada de bolinha pulsando, "ao vivo", "novo", "destaque" sem ser verdade |
| 7 | chips coloridinhos | sem chip decorativo; cor só carrega significado (zona, vitória, derrota) |
| 8 | ícone colorido nos KPIs | número grande sem ícone; o escudo do clube é o único desenho |
| 9 | pílula verde com setinha (+12%) | variação em texto simples, na cor da zona; sem pílula e sem seta de enfeite |
| 10 | emoji nos títulos | nenhum emoji no vídeo, nem na legenda |
| 11 | ícone de brilho (sparkle) | nenhum sparkle, estrelinha ou "mágica" |
| 12 | rosca com total no meio | barras com o número ao lado; rosca só se for proporção de verdade |
| 13 | arco-íris nos gráficos | uma cor por gráfico, as das zonas quando for tabela; resto em tons do azul |
| 14 | título "vendas por mês" | título que diz a conclusão ("o Corinthians tem 41% de cair"), não o nome do gráfico |
| 15 | sparkline pequenininha | sem mini-gráfico solto ao lado do número; mostre a série grande ou nada |
| 16 | "bem-vindo de volta" | sem saudação nem texto de interface vazio na animação |
| 17 | faixa colorida na borda | cartão sem listra de cor na borda; destaque é cor do número ou do texto |
| 18 | menu lateral de enfeite | nada que pareça menu, aba ou navegação que ninguém toca |
| 19 | filtro que não filtra | nenhum controle (botão, seletor, tab) desenhado que não faz nada |
| 20 | insight que ninguém lê | frase curta que a voz já diz; se o texto não é falado, corte |

Regra geral: cada elemento na tela é dito pela voz ou é dado do modelo. Se não é nenhum dos dois, é enfeite.

**O que fica (a marca do perfil).** A identidade visual do site não muda de vídeo para vídeo: azul-noite `#0b1640`,
dourado `#ffc23d`, Archivo e Archivo Largo, o logo, os escudos, a faixa corrida de cima e o brilho dourado nos
destaques (camisa de `destaque` na escalação, número que importa). Quem vê o vídeo tem que reconhecer o perfil em
um segundo. O estilo dos vídeos do Isake (HTML dele) é a régua do meio-termo: leve, no padrão do site.

**O que muda (o que se testa).** Dentro dessa identidade, os elementos de interface mudam um fator por vez, pela
planilha de testes (ver "Versões e experimentos"): hoje, selo e chip colorido ligados ou desligados
(`semPilulas: true` no roteiro tira os dois). Outras inspirações de design (tabela em filetes, número gigante,
marca-texto no destaque) entram como nível de teste, uma de cada vez, e só viram padrão se ganharem na planilha.
Não troque o visual todo de um vídeo para o outro: se o perfil parecer outro, a marca enfraquece.

## Ritmo (padrão desde 18/11/2026)

O vídeo que mais rendeu no @tapa.na.gaveta até 18/11 foi "Será que o Corinthians se salva? Testando um
simulador que revela a classificação um a um" (14/11, 1,2 mil views, 95% pelo Para você, 9 seguidores). Medido no
próprio vídeo (TikTok Studio, áudio e quadros lidos no navegador):

- **quase sem pausa:** só 2 silêncios de 0,3 s em 113 s, nenhum acima disso; a fala emenda direto;
- **corte seco a cada ~3 s** na câmera (mediana entre cortes de 3,3 s) e a tela de cima mudando no mesmo ritmo;
- **fundo sonoro o vídeo inteiro:** nunca cai em silêncio; o fundo fica ~24 dB abaixo dos picos da voz (piso em
  -37 a -42 dB, voz em -13 dB).

O Jean pediu para todo vídeo seguir isso: **cortes mais rápidos, uma leve acelerada e o sonzinho de fundo do
começo ao fim.** Na prática:

1. **Pausas:** toda pausa acima de 0,25 s entre frases sai, sobrando ~0,08 s de cada lado (0,15 s no total). Gere
   os `cortes` a partir dos intervalos do VAD (`--silero-vad-min-silence-duration=0.2`) dentro dos trechos mantidos,
   depois de tirar instruções, tentativas repetidas e tropeços. Exemplo: `2026-11-18-flamengo-nubank-parque.js`
   (99 s de gravação → 57 s).
2. **Velocidade:** `velocidade: 1.1` no topo do roteiro. Imagem e voz aceleram juntas depois dos cortes (`setpts` e
   `atempo`, sem mudar o tom); `cortes`, `em` e `T` continuam no tempo da gravação, o modelo divide sozinho. Não
   passe de 1,15: a voz começa a soar apressada.
3. **Fundo:** a trilha agora tem um acorde sustentado (lá menor, fá, dó, sol) por baixo da batida, sem buraco
   entre as notas (`fundo: false` no roteiro desliga só o acorde). O render abaixa o fundo ~6 dB enquanto a pessoa
   fala e devolve nas pausas (`sidechaincompress`; `--sem-ducking` desliga). Volume padrão 0,16. Confira o nível:
   o 5% mais baixo do áudio final fica uns 24 a 26 dB abaixo do 90% mais alto (não pode cair a -60 dB como antes).
4. **Uma cena a cada 3 a 5 s:** se a fala fica num assunto mais tempo, quebre a tela (tabela → barras → placar)
   no número ou no time dito, em vez de deixar uma cena parada 10 s.
5. **Manchete:** quando a pessoa diz na gravação qual é a manchete ("a manchete tem que ser..."), ela vira o
   título da abertura e a instrução sai do vídeo.

Sincronia com cortes e velocidade: o render confere sozinho no fim (`sincronia.conferir`) e corrige a voz se o
descasamento passar de 20 ms. O primeiro vídeo a 1,1× (Flamengo, 18/11) saiu com a voz ~45 ms atrasada e o Jean
percebeu no celular: com velocidade, 40 ms já não é "bom o bastante". Veja a seção 7.

## O que copiar do estilo do Isake

Do HTML e dos vídeos dele (os que mais deram view são "o [time] vai terminar o Brasileirão com N
pontos", "quantos pontos o Corinthians precisa" e "o [rival] perdeu e ajudou o Timão"):

- faixa corrida no topo com "tapa na gaveta · simulador do brasileirão 2026 · simule você também";
- cabeçalho com a marca à esquerda e o estado do vídeo à direita ("atualização", "jogos de hoje",
  "simulando", "degola"), com um ponto piscando;
- selo em pílula acima do título ("atualização de hoje", "faltam 4 rodadas");
- título em duas linhas, a segunda em destaque (dourado), às vezes com o escudo na frente;
- cartão de placar com escudos grandes e dígitos que pulam, e um chip de resultado ("empate");
- tabela com as linhas batendo uma a uma, o time do vídeo destacado e a linha do Z4;
- barras de chance que crescem com o número contando;
- cartões dos próximos jogos com a divisão 1, X, 2;
- fecho com o endereço do site.

Cada um desses é um tipo de cena no `modelo.html`. Quando o Isake mandar um HTML novo com um efeito
que ainda não existe, transforme o efeito em um tipo de cena novo em `CENAS` (padrão visual do site,
tempo a partir de `t` local, sons via `ev(tempo, tipo)`), em vez de copiar o arquivo dele inteiro.

## Movimento leve (camada contínua)

Cada cena tem uma camada de movimento contínuo por cima das entradas. Ela liga depois que os
elementos terminam de entrar e some suavemente antes de cada transição, para não brigar com as
entradas de impacto. Os movimentos que mais uso:

- **Escudos flutuando:** sobem e descem uns 2 a 3 px, com uma "respiração" de tamanho bem pequena e
  às vezes uma inclinação quase imperceptível.
- **Brilho passando:** um reflexo diagonal fraco atravessa um card de cada vez, em sequência, ou cruza
  a tabela a cada poucos segundos.
- **Números respirando:** o número principal da tela (o "45", o "44") cresce e encolhe bem devagar.
- **Detalhes de espera:** a borda tracejada de uma caixa vazia gira devagar e as bolinhas de uma régua
  oscilam.

Três regras para nada ficar chamativo:

- **Ritmos diferentes:** cada elemento se mexe no seu próprio tempo (período e fase próprios), então
  uma coluna de cards nunca balança junta.
- **Movimento pequeno e lento:** amplitude mínima, cada ciclo leva alguns segundos.
- **Menos movimento depois do resultado:** quando o resultado entra, o brilho fica ainda mais fraco,
  para o foco ficar no conteúdo.

Como fazer no `modelo.html`: o render desenha quadro a quadro chamando `desenhar(t)`, então nada de
animação CSS (`@keyframes`, `transition`): todo movimento tem que ser função do tempo, dentro do `at(t)`
da cena, somado à transformação de entrada. Exemplo de escudo flutuando, com fase pelo índice:
`k * 2.5 * Math.sin(t * 2 * Math.PI / (3.2 + i * .37) + i * 1.7)` px, onde `k` vai de 0 a 1 logo depois
da entrada e volta a 0 nos ~0,3 s antes do fim da cena.

## Passo a passo

### 1. Números

```bash
python ferramentas/baixar_espn.py                       # atualiza dados/brasileirao-2026.json (precisa de rede para a ESPN)
node ferramentas/video/chances.js corinthians gremio vitoria internacional
node ferramentas/video/chances.js flamengo palmeiras --n 200000
# Champions (fase de liga, 36 times): 1º, oitavas (1º a 8º), playoff (9º a 24º), fora (25º a 36º) e mata-mata (1º a 24º)
python ferramentas/baixar_espn.py --comp champions       # atualiza dados/champions-2026.json
node ferramentas/video/chances.js --comp champions --times               # apelidos dos 36 times
node ferramentas/video/chances.js --comp champions real_madrid liverpool
```

Na Champions a força de cada time parte do Elo do ClubElo (gravado em `dados/champions-2026.json`),
porque cada um só joga 8 vezes; no vídeo, diga "no nosso simulador" e não "pela tabela". O 1º lugar da
fase de liga não é título: o texto do site diz "termina em 1º", e o vídeo deve seguir.

Sem acesso à ESPN, o retrato do repositório pode estar um jogo atrás: complete com
`--placar mandante-visitante=gh-ga` (slugs de `midia/escudos`). Confira a tabela que o script imprime
contra a do site antes de gravar. Anote a data dos números no roteiro.

### 2. Roteiro

Copie `roteiros/exemplo-degola.js` para `roteiros/AAAA-MM-DD-assunto.js`. Campos do topo:
`nome`, `estado` (palavra do cabeçalho), `inicio` (segundos cortados do começo da gravação),
`duracao`, `T` (fala) e `cenas`. Cada cena tem `tipo` e `em` (segundos ou uma palavra do `T`:
`'ajudou'`, ou `'ajudou#2'` para a segunda vez que ela aparece). Tipos:

| tipo | campos |
|---|---|
| `abertura` | `selo`, `titulo` ([linha, linha em dourado]), `escudo` (grande) ou `escudos` (fileira), `cartoes` (n cartões vermelhos) |
| `placar` | `h`, `a` (slugs), `gh`, `ga` (sem gols = jogo por vir, mostra "?"), `rotulo`, `chip`, `titulo`, `info` (pílulas) |
| `tabela` | `linhas` [{t, pos, j, sg, pts}], `eu` (destaque), `corte` (linhas acima da linha do Z4), `depois` {em, linhas} para as linhas trocarem de lugar |
| `barras` | `itens` [{t ou rotulo, valor, cor, em}], `selo`, `titulo`, `escudo`, `max`, `sufixo`, `casas` |
| `numero` | `valor`, `de`, `sufixo`, `casas`, `titulo`, `escudo` |
| `jogos` | `lista` [{h, a, quando, p: [casa, empate, fora]}] |
| `escalacao` | `jogadores` [{nome, x, y (% do campo, ataque para cima), num, em, destaque, goleiro}], `camisa`, `goleiro`, `formacao`, `selo`, `titulo`; cada jogador é uma camisa (arte em SVG) que entra na palavra dele, a vaga fica tracejada até lá |
| `fecho` | `texto`, `url` |

Escalação: a camisa tem a **cor do uniforme previsto para o jogo**, não branca. `camisa: 'brasil-azul'` (ou
`brasil-amarela`, `japao-azul`, `japao-branca`, `branca`; goleiro com `goleiro: 'brasil-goleiro'` e `goleiro: true`
no jogador) ou `{ cor, gola, num }` para outro uniforme (kits em `KITS`, no `modelo.html`). Confira qual uniforme o time
usa no jogo (sites oficiais, ge, CBF) e anote no comentário do roteiro. `num` é o número que o jogador veste **naquele
time** (seleção: o da convocação; clube: o da relação oficial): só preencha com número conferido em fonte, nunca de
memória; sem `num`, a camisa fica lisa.

Em títulos, `[corinthians] e ajudou o Timão` põe o escudo no começo da linha. Para outra liga, `zonas` no topo do
roteiro troca as faixas da tabela (Série B: `{ lib: [1, 2], pre: [3, 6], rb: [17, 20] }`, ver `2026-11-15-serie-b-playoffs.js`). Cores aceitas:
`var(--ouro)`, `var(--ok)`, `var(--empate)`, `var(--z-rb)`, `var(--z-pre)`, `var(--z-lib)` ou hexadecimal.

Campos opcionais do topo para legenda e testes: `fala` ([de, até, 'texto'] por trecho, mesma conta dos `cortes`),
`legenda` (`true` ou `{ y: 1030 }`), `fator` e `nivel` (o que este vídeo testa) e `variantes` (ver "Versões e
experimentos").

Tamanho: cabem até 9 linhas de tabela, 5 barras e 4 jogos sem sair da área segura.
Se precisar de mais, divida em duas cenas.

### 3. Gravação

Celular em pé, 30 fps fixo se a câmera deixar, sem editar no app antes. Fale o roteiro inteiro de uma
vez; uma pausa curta antes de cada número ajuda a animação a "cair" na palavra.

### 4. Tempo das palavras (`T`)

- Com legendas automáticas (CapCut, TikTok): exporte o `.srt` e rode
  `python ferramentas/video/legendas.py fala.srt --inicio 2.4`; cole o `T` no roteiro.
- Só com o vídeo da narração (.mov/.mp4): transcreva você mesmo, localmente (veja abaixo). **Não peça
  a transcrição** para quem mandou o vídeo.
- Sem legendas: abra a prévia, carregue a gravação em "voz", toque e aperte **m** em cada momento em
  que uma cena deve entrar; use os tempos marcados direto no `em`.

#### Transcrição local (vídeo → texto com tempos)

Faça a versão mais simples que já dá para ajustar os tempos: segmentos do VAD e uma passada só do
Whisper. Nada de retranscrever trechos recortados nem refinar palavra a palavra, a não ser que peçam.
Tudo roda na sessão, sem API externa.

| peça | o que é |
|---|---|
| ffmpeg | extrai o áudio do vídeo |
| sherpa-onnx v1.12.15 (binários Linux x64) | reconhecimento de fala offline |
| Silero VAD (`silero_vad.onnx`) | acha onde tem fala e corta em segmentos com tempo |
| Whisper small (int8, via sherpa-onnx) | transcreve cada segmento em português |

Rede: pip/PyPI e Hugging Face costumam estar bloqueados na sessão, mas download direto de releases do
GitHub funciona, então tudo vem de lá. Se a sessão estiver sem acesso à internet, nada disso baixa: é
preciso liberar o acesso nas configurações de rede do ambiente e abrir uma sessão nova.

```bash
mkdir -p ~/asr && cd ~/asr
curl -L -O https://github.com/k2-fsa/sherpa-onnx/releases/download/v1.12.15/sherpa-onnx-v1.12.15-linux-x64-shared.tar.bz2
tar xjf sherpa-onnx-v1.12.15-linux-x64-shared.tar.bz2
curl -L -O https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/silero_vad.onnx
curl -L -O https://github.com/k2-fsa/sherpa-onnx/releases/download/asr-models/sherpa-onnx-whisper-small.tar.bz2
tar xjf sherpa-onnx-whisper-small.tar.bz2

# áudio mono 16 kHz (o formato que o Whisper espera)
ffmpeg -y -i bruto.MOV -vn -ac 1 -ar 16000 ~/asr/narr.wav

B=sherpa-onnx-v1.12.15-linux-x64-shared
export LD_LIBRARY_PATH=$PWD/$B/lib:$LD_LIBRARY_PATH
$B/bin/sherpa-onnx-vad-with-offline-asr \
  --silero-vad-model=silero_vad.onnx \
  --silero-vad-min-silence-duration=0.2 \
  --silero-vad-max-speech-duration=8 \
  --whisper-encoder=sherpa-onnx-whisper-small/small-encoder.int8.onnx \
  --whisper-decoder=sherpa-onnx-whisper-small/small-decoder.int8.onnx \
  --tokens=sherpa-onnx-whisper-small/small-tokens.txt \
  --whisper-language=pt --whisper-task=transcribe --num-threads=4 \
  ~/asr/narr.wav 2>&1 | grep -E "^[0-9]" | tee tr.txt
```

- `min-silence-duration=0.2` corta nas pausas curtas (segmentos do tamanho de uma frase);
  `max-speech-duration=8` evita segmento longo demais quando a fala vem sem pausa.
- A saída tem uma linha por segmento: **início -- fim : texto**. Narração longa pode passar do limite
  de tempo de um comando: rode em segundo plano e acompanhe o `tr.txt`.
- Use o **início** do segmento como gatilho da cena (`em` em segundos). Os tempos são da gravação
  bruta: desconte o `inicio` do roteiro. Se a palavra-chave está no fim de um segmento longo, estime
  dentro dele de forma proporcional; o ajuste fino sai na prévia.
- Erro de transcrição em nome de time ou jogador não importa: o que vale é o tempo. Interprete pelo
  contexto.
- Precisão por palavra, só se pedirem: envelope de energia (numpy, passo de ~25 ms), cortar nos vales
  de silêncio (~-31 dB) dentro de cada segmento e transcrever todos os pedaços numa única chamada do
  `sherpa-onnx-offline`, com `--num-threads=2` (com mais threads já travou sem dar erro).

### 5. Prévia

```bash
python serve.py        # http://localhost:8780/ferramentas/video/modelo.html?r=NOME
```

Espaço toca e pausa (com a voz carregada, ela toca junto), ← → andam 1 s, **g** liga a área segura.
Confira: nada fora do tracejado, nenhum texto cortado, avisos em vermelho embaixo do quadro (palavra
do `em` que não existe no `T`).

### 6. Render

```bash
python ferramentas/video/render.py NOME --camera bruto.MOV            # usa o "inicio" do roteiro
python ferramentas/video/render.py NOME --camera bruto.MOV --pular-animacao --vol-trilha 0.08   # só remonta
```

Cor: gravação do iPhone vem em HDR (HLG) e, sem conversão, fica lavada no TikTok. O render detecta e converte
para SDR (bt709) sozinho; se a cor ainda parecer estranha, confira com `sincronia.py diagnostico` (aparece em "vídeo").

Cortes no meio da fala (instrução dada durante a gravação, frase repetida): `cortes: [[de, até], ...]` no topo do
roteiro, em segundos da gravação depois do `inicio`. Som e imagem saem juntos, e T e os `em` continuam no tempo
da gravação (o modelo remapeia). **Ouça a gravação inteira antes de editar** atrás de instruções faladas ("corta
isso", "repete") — se não der para ouvir/transcrever, pergunte em que segundo estão.

Cortes inteligentes, a partir da transcrição: (1) instrução falada para a edição ("corta essa parte", "vou
refazer") sai junto com a tentativa a que ela se refere, e fica a versão refeita; (2) frase repetida: fica a última
versão completa; (2b) palavra ou trecho repetido de propósito, para o editor escolher a melhor ("tá, tá muito aberta", "vou deixar
o Vini Jr., vou deixar o Vini Jr. e o Endrick"): o vídeo final tem o termo **uma vez só**, sem gagueira. Rode
`python ferramentas/video/repeticoes.py transcricao.log` para listar as candidatas, recorte o trecho com
`pedacos.py` e transcreva os pedaços para achar o instante exato de cada ocorrência, e corte a 1ª (do começo dela
até o começo da 2ª) ou a 2ª, o que emendar com mais fluidez: mesma entonação na emenda, sem a palavra cortada
no meio e sem sobrar pausa. Ouça a emenda antes de render e leia os quadros dos dois lados (a boca não pode pular);
(3) tropeço ou recomeço no meio da frase: corte do início do tropeço até a próxima frase limpa,
e se o fim do vídeo se enrolar, emende o endereço do site direto na despedida; (4) pausa acima de ~0,6 s entre
frases encolhe para ~0,3 s. Liste no comentário do roteiro o que saiu e por quê. O render corta pelo número do
quadro (imagem, `select` pelo número do quadro) e da amostra (som), sem o filtro `concat` na imagem, que
atrasava a imagem 2 a 3 quadros depois da primeira emenda. Seleções usam bandeiras redondas (`brasil`, `japao`,
`singapura` em `escudos/`); para outra seleção, desenhe a bandeira em SVG e gere o PNG de 512 px.

Enquadramento da câmera: **o escudo da camisa tem que aparecer inteiro** (camisa chama atenção e atrai público;
"BRASIL" e as estrelas não podem ser cortados). A gravação vertical é 1080×1920 e a metade de baixo do vídeo
mostra só 956 px de altura, então o padrão (centralizado) corta o peito. Antes do render longo, tire um quadro com
o ffmpeg e confira rosto e escudo. Se não couberem juntos, afaste: `--camera-zoom 0.8 --camera-y 0.62` encolhe a
gravação e preenche as laterais com a própria imagem desfocada (parede lisa some no fundo). `--camera-zoom 1.12
--camera-y 0.55` só vale para gravação em que o escudo já está dentro do recorte. Ao gravar, o Jean deve ficar
com o rosto no terço de cima e o peito inteiro em quadro.
Volumes padrão: voz 1,0, efeitos 0,55, trilha 0,16 (com ducking). O fundo fica audível nas emendas e
embaixo da voz, sem competir com ela (ver "Ritmo").
O render nunca desloca o áudio sozinho: o corte (`-ss` antes da câmera) vale para som e imagem, a câmera
é convertida para ritmo constante e o áudio é reamostrado sem ser empurrado.

### 7. Sincronia (sempre, antes de postar)

**Vídeo do `render.py`: use `conferir`.** O render já roda no fim e corrige sozinho (desligue com `--sem-ajuste`).
Ele casa o movimento da câmera (diferença entre quadros, gravação amostrada a 300 fps) e o envelope da voz do final
com a gravação bruta, em até 8 pontos no meio dos trechos mantidos, levando em conta `inicio`, `cortes` e
`velocidade`. Mostra, por ponto, quanto a imagem e quanto a voz andaram e o descasamento (imagem − voz); a mediana
acima de 20 ms vira `corrigir`. Meta: mediana até 15 ms. Para conferir de novo:

```bash
python ferramentas/video/sincronia.py conferir NOME --camera bruto.MOV
```

O `comparar` e o `estimar` abaixo continuam valendo para vídeo sem cortes nem velocidade, ou editado fora daqui.

```bash
python ferramentas/video/sincronia.py diagnostico bruto.MOV
python ferramentas/video/sincronia.py comparar bruto.MOV ferramentas/video/saida/NOME/NOME.mp4 --inicio 2.4
```

O `comparar` mede, em 4 trechos, quanto a voz e quanto a imagem da câmera andaram em relação à
gravação. Até 40 ms está bom. Se for constante e maior, `corrigir --ms X`. Se crescer ao longo do vídeo
é deriva (ritmo variável): refaça com o `render.py`, não adianta deslocar.

Vídeo editado em outro lugar (CapCut etc.) e com o áudio descasado:

1. Peça a gravação original e rode `comparar`: é a medida confiável.
2. Sem a original: `estimar final.mp4` cruza o volume da voz com o movimento da metade de baixo. Confira
   no olho (sílabas com p, b e m fecham a boca) antes de aplicar.
3. `corrigir final.mp4 --ms X` (X positivo = voz atrasada, ela é adiantada). A imagem é copiada sem
   recompressão. Rode `comparar` ou `estimar` de novo no arquivo corrigido.

Causas comuns, que o `diagnostico` aponta: áudio do iPhone começando alguns centésimos depois do vídeo
e algum passo que "zera" o começo de cada um separadamente, ritmo de quadros variável convertido sem
levar o áudio junto, e corte feito só na imagem.

### 8. Versões e experimentos

Cada vídeo testa **um fator** por vez, e a planilha guarda o resultado de todos:
[Tapa na Gaveta · testes dos vídeos](https://claude.ai/artifact/EtyRWuDYTbz4VxAEwuWCN2) (aba Fatores = o que testar,
aba Vídeos = uma linha por vídeo postado, aba Resumo = médias por fator e nível, aba Isake = views por formato).

**Escolher o fator.** Pegue o primeiro fator da aba Fatores com status "testando" (se nenhum, o primeiro "na fila"
vira "testando"). Os níveis estão na própria aba.

**Escolher o nível.** Olhe a aba Resumo para esse fator:
- enquanto algum nível tiver menos de 3 vídeos, use o nível com menos vídeos (empate: sorteie);
- depois disso, sorteie com 2/3 de chance para o nível com maior "assistiu completo" e 1/3 para o outro (continua
  testando, mas aposta mais no que está ganhando);
- com 5 ou mais vídeos em cada nível e a diferença no mesmo sentido em retenção e em assistiu completo, marque
  "concluído" na aba Fatores, escreva a conclusão nas notas e passe o vencedor a padrão nos próximos vídeos.

**Gerar as versões.** No roteiro, o nível escolhido vai no topo e o outro vira variante:

```js
fator: 'Legenda na tela',
nivel: 'não',
variantes: {
  B: { nivel: 'sim', legenda: true },                                  // só muda o vídeo: reaproveita a animação
  C: { nivel: 'número', mudarCenas: { 0: { tipo: 'numero', valor: 2, sufixo: 'gols do Vini' } } },
},
```

Uma variante sobrescreve campos do topo; `mudarCenas` troca campos de uma cena pelo índice. Prévia de uma variante:
`modelo.html?r=NOME&v=B`.

```bash
python ferramentas/video/render.py NOME --camera bruto.MOV --variante todas   # A em saida/NOME/, B em saida/NOME-B/ ...
```

Num vídeo, todas as versões testam o mesmo fator (ex.: `fator: 'Selo e chip'`, `nivel: 'com'` na A e
`B: { nivel: 'sem', semPilulas: true }`); `semPilulas` muda a animação, então a B tem render próprio.

Variante que só muda `legenda`, `fator`, `nivel` ou `nota` reaproveita a animação da versão A (render da A primeiro).
Cada pasta ganha um `experimento.json` com fator e nível. A sincronia é a mesma da A (mesmo corte e mesma montagem).

**Legenda na tela.** Queimada pelo ffmpeg (filtro `ass`) com a fonte de `fontes/` (Archivo extra negrito, licença
OFL): tinta clara, contorno azul-noite, números em dourado, até 4 palavras por vez, na emenda entre a animação e a
câmera (longe da boca e da descrição do TikTok). O texto sai do campo `fala`: rode
`python ferramentas/video/fala.py transcricao.log --inicio X` na saída do sherpa-onnx (`vad-with-offline-asr`),
corrija nomes e números à mão (o Whisper erra "Ancelotti", "Vini Jr.", placares) e tire os trechos dos cortes.
Sem `fala`, a legenda usa o `T`. Para outro vídeo, `--legenda` liga a legenda sem variante e `--legenda-y` muda a altura.

**Postar as versões.** Duas versões do mesmo vídeo não vão no mesmo perfil (o TikTok trata como repetido). Use o par
cruzado: uma versão no perfil de quem gravou e a outra no @tapa.na.gaveta, e no vídeo seguinte inverta qual nível vai
em cada perfil (assim o perfil não decide o teste sozinho). Com uma versão só, poste o nível sorteado nos dois perfis.

**Registrar.** Ao postar, uma linha por perfil na aba Vídeos: data, perfil, nome do roteiro, fator, nível, duração,
assunto, edição ("skill") e link. Os números vêm do TikTok Studio do perfil (Análises → vídeo): views, tempo médio,
assistiu completo, novos seguidores, curtidas, comentários, compartilhamentos, salvos e % do Para Você. Colete **48 a
72 h depois** de postar e anote a data da coleta (antes disso o vídeo ainda está sendo distribuído). Visitas ao site
vêm do Cloudflare (referência tiktok.com) no mesmo período.

**Coletar no Chrome (Claude in Chrome, conta logada @tapa.na.gaveta).** Só leitura: nunca postar, apagar, editar,
comentar nem mexer em configuração; não digitar senha nem criar conta (se pedir login, parar e avisar).
1. Carregar as ferramentas do Chrome numa única ToolSearch, chamar `tabs_context_mcp` e trabalhar numa aba nova; fechar
   a aba no fim.
2. `https://www.tiktok.com/tiktokstudio/content`, esperar 4 s, `get_page_text`. O ID de 19 dígitos de cada vídeo está
   no link da linha (`find` ou `javascript_tool`). Vídeo com menos de 48 h fica de fora.
3. `https://www.tiktok.com/tiktokstudio/analytics/ID?qa_enter_from=analytics`, esperar 4 s e `get_page_text`. Sem a
   espera volta "No text content" (esperar mais 3 s e repetir). A Visão geral traz views, tempo médio, assistiu
   completo, novos seguidores, compartilhamentos, salvos, curtidas, comentários e origem do tráfego (Para você).
   Se o clique na lista não abrir a análise, tirar screenshot e clicar no ícone de análise da linha.
4. Curva de retenção: rolar até "Taxa de retenção". O gráfico vai de 0:00 à duração do vídeo. Passar o mouse
   (`computer`, `hover`) no ponto de cada segundo e dar `zoom` na região: o tooltip mostra "0:10 / 22%". Posição x do
   segundo s = x_inicial + s / duração × (x_final − x_inicial); conferir o segundo no tooltip. Ler aos 2, 5, 10, 20, 40,
   60 e 90 s (os que cabem). "Dados sendo processados" = deixar vazio.
5. Anotar a data e a hora da coleta. Planilhas: a de testes (aba Vídeos) e a de retenção por segundo
   (https://claude.ai/artifact/4BHrwjgCLKQbhsb2FtBonn).

### 9. Antes de postar

- [ ] área segura desligada no render final (`--guia` é só para conferir)
- [ ] números batem com o site e a data está no roteiro
- [ ] sincronia conferida (`comparar` ou `estimar`)
- [ ] movimento leve discreto: nada balançando junto, brilho mais fraco depois do resultado
- [ ] sem voz de IA e sem selo de edição com IA
- [ ] vídeo final 1080×1920, H.264 + AAC (o `render.py` já entrega assim)
- [ ] escudo da camisa inteiro no quadro da câmera (confira um quadro)
- [ ] sem palavra repetida nas emendas (ouvir os cortes)
- [ ] ritmo: nenhuma pausa acima de ~0,15 s, `velocidade: 1.1`, fundo contínuo e uma cena nova a cada 3 a 5 s
- [ ] checklist "O que denuncia IA" passada em um quadro de cada cena
- [ ] legenda (se a versão tiver) conferida em 3 ou 4 quadros: nomes certos, nada sobre a boca
- [ ] posta no perfil de quem gravou e no @tapa.na.gaveta (versões: par cruzado) e registra na planilha

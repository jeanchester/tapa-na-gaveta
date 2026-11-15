---
name: video-tiktok
description: Edita os vídeos de divulgação do Tapa na Gaveta para o TikTok (animação do simulador em cima, câmera embaixo), no estilo dos vídeos do Isake e no padrão visual do site, e confere/corrige áudio descasado. Use para montar, renderizar ou consertar um vídeo do perfil.
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
```

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
| `escalacao` | `jogadores` [{nome, x, y (% do campo, ataque para cima), em, destaque}], `formacao`, `selo`, `titulo`; cada jogador entra na palavra dele, a vaga fica tracejada até lá |
| `fecho` | `texto`, `url` |

Em títulos, `[corinthians] e ajudou o Timão` põe o escudo no começo da linha. Para outra liga, `zonas` no topo do
roteiro troca as faixas da tabela (Série B: `{ lib: [1, 2], pre: [3, 6], rb: [17, 20] }`, ver `2026-11-15-serie-b-playoffs.js`). Cores aceitas:
`var(--ouro)`, `var(--ok)`, `var(--empate)`, `var(--z-rb)`, `var(--z-pre)`, `var(--z-lib)` ou hexadecimal.

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
versão completa; (3) tropeço ou recomeço no meio da frase: corte do início do tropeço até a próxima frase limpa,
e se o fim do vídeo se enrolar, emende o endereço do site direto na despedida; (4) pausa acima de ~0,6 s entre
frases encolhe para ~0,3 s. Liste no comentário do roteiro o que saiu e por quê. O render corta pelo número do
quadro (imagem, `select` pelo número do quadro) e da amostra (som), sem o filtro `concat` na imagem, que
atrasava a imagem 2 a 3 quadros depois da primeira emenda. Seleções usam bandeiras redondas (`brasil`, `japao`,
`singapura` em `escudos/`); para outra seleção, desenhe a bandeira em SVG e gere o PNG de 512 px.

Enquadramento da câmera: `--camera-zoom 1.12 --camera-y 0.55` aproxima e sobe o recorte para o rosto ficar no meio da metade de baixo (confira um quadro antes do render longo).
Volumes padrão: voz 1,0, efeitos 0,55, trilha 0,12. A trilha tem que sumir debaixo da voz.
O render nunca desloca o áudio sozinho: o corte (`-ss` antes da câmera) vale para som e imagem, a câmera
é convertida para ritmo constante e o áudio é reamostrado sem ser empurrado.

### 7. Sincronia (sempre, antes de postar)

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

### 8. Antes de postar

- [ ] área segura desligada no render final (`--guia` é só para conferir)
- [ ] números batem com o site e a data está no roteiro
- [ ] sincronia conferida (`comparar` ou `estimar`)
- [ ] movimento leve discreto: nada balançando junto, brilho mais fraco depois do resultado
- [ ] sem voz de IA e sem selo de edição com IA
- [ ] vídeo final 1080×1920, H.264 + AAC (o `render.py` já entrega assim)
- [ ] posta no perfil de quem gravou e republica no @tapa.na.gaveta

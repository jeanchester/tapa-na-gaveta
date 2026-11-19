/* "Corinthians 4 × 0 Botafogo: a chance de cair caiu pela metade" · gravações IMG_6062/6063/6064 (Jean, 19/11), transcritas na
   sessão (sherpa-onnx + Whisper small). As três são tomadas do mesmo vídeo: a 6062 é um começo de 7 s que parou, a 6063 parou
   aos 89 s e a 6064 é a completa (180 s). Base: 6064. Da 6063 entra só a piada do Tite, que a 6064 não tem.

   Tempos abaixo em segundos da IMG_6064 bruta.
      3,5  O Corinthians teve uma noite praticamente perfeita, reduziu a chance de rebaixamento pela metade.
   [  8,1  "como a gente falou nos outros vídeos, se você ainda não viu, segue aí o perfil" → CORTADO (enrolação no começo) ]
   [ 11,6  "basta uma vitória simples pra reduzir pela metade" → CORTADO (repete a frase de abertura) ]
   [ 15,1  "a gente foi até um pouco conservador..." → CORTADO (frase solta, sem fecho) ]
     18,8  O Diniz formou um time ofensivaço... quem que marca nesse time? Só o Bidon de volante, o Carrillo...
     28,9  Mas o Corinthians foi bem o jogo inteiro, incisivo, pressionou alto.
   + IMG_6063 27,07 a 30,43: "Obrigado, Tite, por armar esse Botafogo tenebroso, né?" (inserida em 33,8 da 6064)
     34,1  Teve várias chances... o Vitinho poderia ter feito o quinto gol na cara do gol e perdeu.
     41,0  Mas o Kaio César teve uma ótima atuação, o Kaio César mágico. Eu te amo, Kaio César. ... sexto jogador a fazer hat-trick.
     49,2  O Memphis teve boa participação... no terceiro gol do Kaio César deu um passe de letra.
   [ 58,8  "ainda assim pesado, querendo muita bola de frente. Mas tudo bem, não vamos reclamar" → CORTADO (encurtar) ]
     64,7  Conseguimos uma vitória importantíssima, era crucial ganhar ontem de qualquer jeito.
   [ 68,8  "ainda conseguiu uma ótima atuação, tem um saldo de confiança" → CORTADO (repete) ]
     72,3  Acho que agora a gente tá embalado aí   [ 73,9 "e pra..." (recomeço) → CORTADO ]   para a sequência das últimas
           três rodadas. Ainda tem um caminho pela frente, precisamos ganhar dois desses três jogos no mínimo.
     81,0  Mas acho que agora o time ganha confiança aí   [ 83,2 "com a volta do" (repetido logo depois) → CORTADO ]
     84,4  Volta do Garro, volta do Yuri, volta do André, dá pra gente ficar mais tranquilo e respirar fundo aliviado.
   [ 92,4  "vamos ver o que os nossos próximos jogos..." → CORTADO (frase largada) ]
     94,6  A rodada foi quase perfeita pro Corinthians. O Coritiba perdeu pro Santos... O Grêmio empatou com o Bahia em casa.
   [106,4  "vamos ver o que os jogos de hoje reservam... o que acontece mais?" → CORTADO (repete o fecho) ]
    114,5  Com os resultados de ontem, as chances de rebaixamento ficaram as seguintes: Corinthians 17%, Mirassol 17,
           Internacional 38%, Vitória 50%, Grêmio 68%... Chapecoense já matematicamente, o Remo precisa de um milagre.
           Coritiba e Botafogo, menos de 10%.   [127,1 pausa de 0,8 s → encolhida]
   [143,2  "mas os dois têm tabelas complicadas... Palmeiras e Flamengo de férias" → CORTADO (desvio longo, 20 s) ]
   [162,9  "Beleza, galera, segue aqui o... comenta aqui o que você achou... é..." (tropeço) → CORTADO ]
    170,4  Comenta aqui o que você achou do jogo de ontem, entra lá no site tapanagaveta.com.br pra simular os próximos jogos.
    176,1  Comenta o que você acha que vai acontecer nos jogos de hoje. Muito obrigado pela atenção novamente. Fui!

   Fatos conferidos (19/11/2026): Corinthians 4 × 0 Botafogo, quarta 18/11, Neo Química Arena, 35ª rodada, três gols de Kaio
   César e um com Memphis no lance (fontes divergem entre gol do Memphis e contra de Gabriel Justino: a tela não diz quem fez o 4º);
   passe do Memphis no 3º gol do Kaio César (DOL); técnico do Corinthians: Fernando Diniz; do Botafogo: Tite; Grêmio 0 × 0 Bahia
   (18/11, Arena); Coritiba 0 × 1 Santos (18/11). Corinthians foi a 40 pontos e 15º, fora do Z4.
   Não conferidos (ficam só na fala, nunca na tela): "sexto jogador a fazer hat-trick", "passe de letra", gol do Santos ser do
   Gabigol, volta de Garro, Yuri Alberto e André (a tela diz "voltam", conferir antes de postar).

   Números do modelo do site: node ferramentas/video/chances.js corinthians ... --placar gremio-bahia=0-0 --n 200000 (retrato
   da ESPN de 19/11 02:22, mais o 0 × 0 de Grêmio e Bahia). Antes do jogo: --desfazer corinthians-botafogo (44,6%).
   Chance de cair: Corinthians 16,6%, Mirassol 16,9%, Inter 38,7%, Vitória 50,3%, Grêmio 67,5%, Coritiba 8,5%, Botafogo 1,4%,
   Remo 99,97%, Chapecoense 100%. Por pontos somados até o fim (--pontos): +3 = 6,5%, +4 = 1,1%, +6 = 0,0%.
   Jogos do Timão (1 X 2 do modelo): Atlético-MG x Corinthians 46/28/26, Corinthians x Grêmio 49/29/22, Remo x Corinthians 39/29/32.
   Jogos de hoje: Vasco x Inter 49/27/23, Vitória x Bragantino 32/30/38. */
ROTEIRO({
  nome: '2026-11-19-corinthians-botafogo',
  estado: 'rodada 35',
  // câmera: montagem.mov = IMG_6064 a partir de 3,0 s (convertida para SDR 1080×1920) com a fala do Tite da IMG_6063
  // inserida em 30,80 s (ver o comentário acima); "inicio" e "cortes" contam nessa montagem
  inicio: 0.42,
  duracao: 179.9,
  cortes: [[4.24, 15.38], [25.04, 25.46], [30.08, 30.38], [33.75, 34.0], [40.69, 40.95], [48.61, 49.13], [53.93, 54.31], [58.41, 64.61], [68.13, 72.19], [73.89, 74.53], [80.55, 80.93], [83.13, 84.29], [91.93, 94.51], [105.5, 114.49], [127.05, 127.83], [142.77, 170.31], [175.71, 176.0]],
  faixa: ['tapa na gaveta', 'corinthians 4 × 0 botafogo', 'chances de rebaixamento', '<b>tapanagaveta.com.br</b>'],
  // câmera: trechos alternam 1,0 e 1,06 de zoom nas emendas; aproximação nos momentos fortes da fala
  punchCortes: 1.06,
  camZoom: [[30.38, 33.75, 1.12], [45.09, 46.85, 1.16]],

  // experimento: fator "Legenda na tela" (primeiro da fila, 0 vídeo em cada nível): A sem legenda, B com a fala legendada
  fator: 'Legenda na tela',
  nivel: 'não',
  variantes: {
    B: { nivel: 'sim', legenda: true },
  },

  T: [],
  fala: [
    [0.04, 4.18, "O Corinthians teve uma noite praticamente perfeita, reduziu a chance de rebaixamento pela metade."],
    [15.4, 23.12, "O Diniz formou um time ofensivaço. Até quando eu vi a escalação eu me assustei e falei: quem que marca nesse time? Só o Bidon de volante, praticamente, o Carrillo ali, que"],
    [23.51, 25.0, "sabemos que geralmente não marca ninguém."],
    [25.49, 30.05, "Mas o Corinthians foi bem o jogo inteiro, incisivo, não deixou o Botafogo pegar na bola. Pressionou alto."],
    [30.43, 33.7, "Obrigado, Tite, por armar esse Botafogo tenebroso, né?"],
    [34.0, 37.54, "Teve várias chances de gol, poderia ter vindo mais. O Vitinho teve uma chance no final ali,"],
    [37.93, 40.65, "poderia ter feito o quinto gol na cara do gol e perdeu."],
    [40.95, 44.71, "Mas o Kaio César teve uma ótima atuação, o Kaio César mágico."],
    [45.09, 48.59, "Eu te amo, Kaio César. Acho que foi o sexto jogador a fazer um hat-trick."],
    [49.17, 50.59, "O Memphis teve boa participação,"],
    [51.0, 53.91, "boas situações de gol, de lance."],
    [54.34, 58.38, "Contribuiu bem pros gols, no terceiro gol do Kaio César deu um passe de letra."],
    [64.65, 68.1, "Conseguimos uma vitória importantíssima, era crucial ganhar ontem de qualquer jeito."],
    [72.22, 73.89, "Acho que agora a gente tá embalado aí"],
    [74.58, 76.55, "para a sequência das últimas três rodadas."],
    [76.69, 80.51, "Ainda tem um caminho pela frente, precisamos ganhar dois desses três jogos no mínimo."],
    [80.96, 83.13, "Mas acho que agora o time ganha confiança aí."],
    [84.33, 87.17, "Volta do Garro, volta do Yuri, volta do André,"],
    [87.74, 88.47, "dá pra gente"],
    [89.12, 91.91, "ficar um pouco mais tranquilo e finalmente respirar fundo aliviado."],
    [94.54, 96.38, "A rodada foi quase perfeita pro Corinthians."],
    [96.76, 100.29, "O Coritiba ainda conseguiu perder pro Santos, ali no último jogo, que o Gabigol fez gol."],
    [100.56, 105.47, "O Grêmio empatou com o Bahia em casa. O Grêmio precisava muito ganhar esse jogo. Tá muito complicado."],
    [114.52, 118.31, "Com os resultados de ontem, as chances de rebaixamento ficaram as seguintes."],
    [118.9, 123.38, "O Corinthians, como a gente comentou aqui, reduziu praticamente pela metade, ficou em 17% agora."],
    [123.8, 125.06, "Mirassol também 17."],
    [125.42, 126.97, "Internacional 38%."],
    [127.94, 131.38, "Vitória 50%, o Grêmio aumentou muito, pra 68%."],
    [131.87, 134.19, "O Grêmio tá numa situação muito complicada, e o Remo…"],
    [134.59, 136.74, "Chapecoense já matematicamente. O Remo"],
    [137.03, 139.0, "ainda não, precisa de um milagre, praticamente rebaixado."],
    [139.37, 142.74, "Coritiba e Botafogo, menos de 10% de chance de cair."],
    [170.34, 175.68, "Comenta aqui o que você achou do jogo de ontem, entra lá no site tapanagaveta.com.br pra simular os próximos jogos."],
    [176.03, 177.73, "Comenta o que você acha que vai acontecer nos jogos de hoje."],
    [177.96, 179.84, "Muito obrigado pela atenção novamente. Fui!"],
  ],
  cenas: [
    {"tipo": "placar", "em": 0, "selo": "quarta, 18/11 · rodada 35", "h": "corinthians", "a": "botafogo", "gh": 4, "ga": 0, "rotulo": "fim de jogo · Neo Química Arena", "chip": "saiu do Z4", "corChip": "var(--ok)", "titulo": ["noite praticamente perfeita"], "som": ["apito", "torcida@0.55"], "impacto": 0.8},
    {"tipo": "numero", "em": 2.04, "de": 44.6, "valor": 16.6, "casas": 0, "sufixo": "%", "duracao": 0.9, "titulo": ["de chance de cair", "antes do jogo eram 45%"]},
    {"tipo": "abertura", "em": 15.38, "selo": "escalação do Diniz", "escudo": "corinthians", "titulo": ["time ofensivaço", "quem que marca?"]},
    {"tipo": "abertura", "em": 25.46, "escudos": ["corinthians", "botafogo"], "titulo": ["o jogo inteiro em cima", "e o Botafogo sem a bola"]},
    {"tipo": "abertura", "em": 30.38, "escudo": "botafogo", "titulo": ["obrigado, Tite,", "Botafogo tenebroso"], "impacto": 0.55},
    {"tipo": "abertura", "em": 34.0, "bolas": 4, "titulo": ["4 a 0", "e ainda perdeu o quinto"]},
    {"tipo": "abertura", "em": 40.95, "selo": "Kaio César", "bolas": 3, "titulo": ["3 gols do Kaio César", "o mágico"], "impacto": 4.14, "som": ["torcida@4.14"]},
    {"tipo": "abertura", "em": 49.13, "selo": "Memphis Depay", "escudo": "corinthians", "titulo": ["participou dos gols", "passe pro 3º do Kaio"]},
    {"tipo": "tabela", "em": 64.61, "titulo": ["vitória importantíssima"], "eu": "corinthians", "corte": 5, "passo": 0.12, "linhas": [{"t": "botafogo", "pos": 12, "j": 34, "sg": -7, "pts": 42}, {"t": "coritiba", "pos": 13, "j": 35, "sg": -12, "pts": 42}, {"t": "mirassol", "pos": 14, "j": 35, "sg": -9, "pts": 41}, {"t": "vitoria", "pos": 15, "j": 34, "sg": -16, "pts": 38}, {"t": "internacional", "pos": 16, "j": 34, "sg": -4, "pts": 38}, {"t": "corinthians", "pos": 17, "j": 34, "sg": -6, "pts": 37}, {"t": "gremio", "pos": 18, "j": 34, "sg": -9, "pts": 37}, {"t": "remo", "pos": 19, "j": 35, "sg": -18, "pts": 32}], "depois": {"em": 66.85, "linhas": [{"t": "botafogo", "pos": 12, "j": 35, "sg": -11, "pts": 42}, {"t": "coritiba", "pos": 13, "j": 35, "sg": -12, "pts": 42}, {"t": "mirassol", "pos": 14, "j": 35, "sg": -9, "pts": 41}, {"t": "corinthians", "pos": 15, "j": 35, "sg": -2, "pts": 40}, {"t": "vitoria", "pos": 16, "j": 34, "sg": -16, "pts": 38}, {"t": "internacional", "pos": 17, "j": 34, "sg": -4, "pts": 38}, {"t": "gremio", "pos": 18, "j": 35, "sg": -9, "pts": 38}, {"t": "remo", "pos": 19, "j": 35, "sg": -18, "pts": 32}]}},
    {"tipo": "jogos", "em": 72.19, "selo": "faltam 3 jogos", "titulo": ["a sequência do Timão"], "lista": [{"h": "atleticomg", "a": "corinthians", "quando": "qua, 25/11", "p": [46, 28, 26]}, {"h": "corinthians", "a": "gremio", "quando": "dom, 29/11", "p": [49, 29, 22]}, {"h": "remo", "a": "corinthians", "quando": "qua, 2/12", "p": [39, 29, 32]}]},
    {"tipo": "barras", "em": 76.69, "selo": "chance de cair por pontos somados", "titulo": ["com 2 vitórias", "a chance de cair zera"], "casas": 1, "max": 10, "itens": [{"rotulo": "+3 · 43 pts", "valor": 6.5, "cor": "var(--z-rb)", "em": 77.55}, {"rotulo": "+4 · 44 pts", "valor": 1.1, "cor": "var(--z-rb)", "em": 78.25}, {"rotulo": "+6 · 46 pts", "valor": 0.0, "cor": "var(--ok)", "em": 78.95}]},
    {"tipo": "abertura", "em": 84.29, "escudo": "corinthians", "titulo": ["a volta de Garro,", "Yuri e André"]},
    {"tipo": "resultados", "em": 94.51, "titulo": ["rodada quase perfeita", "pro Corinthians"], "lista": [{"h": "corinthians", "a": "botafogo", "gh": 4, "ga": 0, "eu": true, "chip": "saiu do Z4", "em": 94.85}, {"h": "coritiba", "a": "santos", "gh": 0, "ga": 1, "chip": "ajudou o Timão", "em": 96.75}, {"h": "gremio", "a": "bahia", "gh": 0, "ga": 0, "chip": "ajudou o Timão", "em": 100.55}]},
    {"tipo": "barras", "em": 114.49, "selo": "chance de cair · depois da rodada 35", "titulo": ["quem ainda pode cair"], "casas": 1, "itens": [{"t": "corinthians", "valor": 16.6, "cor": "var(--ouro)", "em": 118.9}, {"t": "mirassol", "valor": 16.9, "cor": "var(--z-rb)", "em": 123.8}, {"t": "internacional", "valor": 38.7, "cor": "var(--z-rb)", "em": 125.42}, {"t": "vitoria", "valor": 50.3, "cor": "var(--z-rb)", "em": 127.94}, {"t": "gremio", "valor": 67.5, "cor": "var(--z-rb)", "em": 129.55}]},
    {"tipo": "barras", "em": 134.59, "titulo": ["Chapecoense já caiu", "Remo precisa de um milagre"], "casas": 2, "itens": [{"t": "chapecoense", "valor": 100, "casas": 0, "cor": "var(--z-rb)", "em": 134.85}, {"t": "remo", "valor": 99.97, "cor": "var(--z-rb)", "em": 136.75}]},
    {"tipo": "barras", "em": 139.37, "titulo": ["menos de 10%", "de chance de cair"], "casas": 1, "max": 20, "itens": [{"t": "coritiba", "valor": 8.5, "cor": "var(--z-rb)", "em": 139.55}, {"t": "botafogo", "valor": 1.4, "cor": "var(--z-rb)", "em": 140.25}]},
    {"tipo": "fecho", "em": 172.15, "texto": "simule os próximos jogos"},
    {"tipo": "jogos", "em": 176.0, "selo": "quinta, 19/11 · jogos de hoje", "titulo": ["comenta o seu palpite"], "lista": [{"h": "vasco", "a": "internacional", "quando": "19h30", "p": [49, 27, 23]}, {"h": "vitoria", "a": "bragantino", "quando": "19h30", "p": [32, 30, 38]}]},
  ],
});

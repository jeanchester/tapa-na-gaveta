/* "Só dois desses seis vão cair" (rodada 35, jogo a jogo) · gravação IMG_5964.MOV (Jean, 15/11), transcrita na
   sessão (sherpa-onnx + Whisper small). Números do modelo do site (chances.js, retrato de 15/11/2026 16h09,
   100 mil simulações). Tempos = segundos da gravação bruta (inicio 0).

   A gravação foi REMONTADA (campo "ordem"): o Jean gravou Grêmio e Vitória, disse "corta aqui, vamos começar o
   vídeo por 'apenas dois desses seis'", regravou a abertura e seguiu do Corinthians em diante. No vídeo final a
   abertura regravada vem primeiro, depois Grêmio e Vitória da primeira tentativa, depois o resto.

   [   1,6  primeira abertura ("só dois desses seis times vão cair... vamos simular jogo a jogo") → TROCADA pela regravada ]
      15,0  Começando pelo Grêmio, que recebe o Bahia em casa, quarta, 9 e meia. Hoje a chance de cair do Grêmio é
            51,7%. Se vencer, reduz praticamente pela metade, vai para 28%. Se empatar, aumenta bastante, vai para
            59%. Se perder, vai para quase 70% de chance de ser rebaixado.
   [  34,4  "O Vitória pega o Bragantino." + 16 s parado (recomeçado) → CORTADO ]
      52,2  O Vitória recebe o Bragantino em casa, quinta, sete e meia da noite. Hoje a chance de cair do Vitória está
            em 46%, de acordo com o nosso modelo. Se vencer, reduz para 20%; se empatar, 52; e se perder, 63%,
            quase 2/3 das possibilidades, de acordo com o nosso modelo aqui.
   [  71,8  "corta aqui, vamos começar o vídeo por..." (instrução) → CORTADO ]
   [  74,2  "apenas dois dess..." (tropeço) → CORTADO ]
      76,3  Apenas dois desses seis vão cair. Eu vou te mostrar como a próxima rodada pode afetar as probabilidades,
            de acordo com o nosso modelo matemático. Eu estou aqui com o site tapanagaveta.com.br, nós temos um
            modelo matemático para prever as probabilidades de cada resultado no Brasileirão.
   [  91,3  "corta de novo, vou voltar para o Corinthians" (instrução) → CORTADO ]
      93,0  O Corinthians já abordei no outro vídeo, se você não viu. Hoje a chance do Corinthians cair está em 45%.
            Se vencer o Botafogo, cai para a metade, 22%. Se empatar, 52%; se perder, 65%.
   [ 108,9  "Internacional." + 3,4 s parado (recomeçado) → CORTADO ]
     113,3  O Internacional vai a São Januário encontrar o Vasco na quinta-feira. Hoje a chance de cair do Inter está
            em 35%. Se o Inter ganhar, vai para 11%; se empatar, 35%; e se perder, 47%.
   [ 125,9  pausa de 1 s → encolhida ]
     126,6  O Mirassol já jogou na rodada, manteve as suas chances ali em torno de 17%. Está bem posicionado, mas tem
            jogos muito difíceis na tabela.
     133,2  O Coritiba, praticamente sem chance de cair, recebe o Santos quarta, sete e meia. Hoje está em 4% de
            chance de ser rebaixado; se vencer, liquida a fatura, zera a chance. Se empatar, mantém os 4%. Se
            perder, dobra, vai a 8%, mas ainda assim é pouco.
     146,7  Comenta aqui o que você acha que vai acontecer na próxima rodada e como vai ficar o quadro geral. Faz uma
            simulação no site do Tapa na Gaveta, conta pra gente o que tá achando. Muito obrigado pela atenção
            novamente. Fui!

   Modelo (15/11), chance de cair hoje → se vencer · empatar · perder:
     Grêmio 51,7 → 28,6 · 58,4 · 69,9      Vitória 46,4 → 19,6 · 52,7 · 63,5     Corinthians 44,7 → 23,0 · 53,1 · 64,6
     Inter 34,8 → 11,1 · 34,2 · 46,5        Mirassol 17,3 (já jogou)              Coritiba 4,1 → 0,0 · 4,0 · 8,7
   A fala arredonda alguns números (Timão "22" e "52"; Inter "35" no empate); a tela mostra os do modelo.
   Fatos conferidos: Grêmio x Bahia (Arena, qua 18/11 21h30), Coritiba x Santos (qua 18/11 19h30), Corinthians x
   Botafogo (qua 18/11 21h30), Vasco x Inter (São Januário, qui 19/11 19h30), Vitória x Bragantino (Barradão, qui
   19/11 19h30); Mirassol 0 x 0 Atlético-MG (sáb 14/11). Mirassol ainda pega Fluminense, Athletico e Grêmio. */
ROTEIRO({
  nome: '2026-11-15-degola-rodada-35',
  estado: 'degola',
  inicio: 0,
  // trechos da gravação que entram no vídeo, NESTA ordem (o resto sai)
  ordem: [
    [76.15, 89.85],               // abertura regravada
    [14.88, 33.88],               // Grêmio (primeira tentativa)
    [52.03, 69.62],               // Vitória (a segunda vez que ele começou)
    [92.83, 107.58],              // Corinthians
    [113.15, 125.85],             // Inter
    [126.20, 158.40],             // Mirassol, Coritiba e despedida
  ],
  faixa: ['tapa na gaveta', 'degola do brasileirão', '35ª rodada', '<b>tapanagaveta.com.br</b>'],
  T: [],
  cenas: [
    // "Apenas dois desses seis vão cair"
    { tipo: 'abertura', em: 76.2, selo: 'faltam 4 rodadas', titulo: ['só dois desses seis', 'vão cair'],
      escudos: ['coritiba', 'mirassol', 'vitoria', 'internacional', 'corinthians', 'gremio'] },

    // "Eu estou aqui com o site tapanagaveta.com.br, nós temos um modelo matemático"
    { tipo: 'tabela', em: 82.45, titulo: 'como está a parte de baixo', eu: 'corinthians', corte: 5, textoCorte: 'z4',
      linhas: [
        { t: 'botafogo', pos: 12, j: 34, sg: -7, pts: 42 },
        { t: 'coritiba', pos: 13, j: 34, sg: -11, pts: 42 },
        { t: 'mirassol', pos: 14, j: 35, sg: -9, pts: 41 },
        { t: 'vitoria', pos: 15, j: 34, sg: -16, pts: 38 },
        { t: 'internacional', pos: 16, j: 34, sg: -4, pts: 38 },
        { t: 'corinthians', pos: 17, j: 34, sg: -6, pts: 37 },
        { t: 'gremio', pos: 18, j: 34, sg: -9, pts: 37 },
        { t: 'remo', pos: 19, j: 34, sg: -20, pts: 29 },
        { t: 'chapecoense', pos: 20, j: 34, sg: -37, pts: 21 },
      ] },

    // "Começando pelo Grêmio, que recebe o Bahia em casa"
    { tipo: 'placar', em: 14.95, selo: '35ª rodada', h: 'gremio', a: 'bahia', rotulo: 'quarta, 18/11 · 21h30',
      info: ['Grêmio 36%', 'empate 28%', 'Bahia 36%'] },

    // "Hoje a chance de cair do Grêmio é 51,7%. Se vencer ... 28%. Se empatar ... 59%. Se perder ... quase 70%"
    { tipo: 'barras', em: 18.25, escudo: 'gremio', titulo: 'chance do Grêmio cair',
      itens: [
        { rotulo: 'hoje', valor: 51.7, cor: 'var(--z-rb)', em: 20.0 },
        { rotulo: 'se ganhar', valor: 28.6, cor: 'var(--ok)', em: 24.1 },
        { rotulo: 'se empatar', valor: 58.4, cor: 'var(--empate)', em: 27.3 },
        { rotulo: 'se perder', valor: 69.9, cor: 'var(--z-rb)', em: 31.9 },
      ] },

    // "O Vitória recebe o Bragantino em casa, quinta, sete e meia da noite"
    { tipo: 'placar', em: 52.1, selo: '35ª rodada', h: 'vitoria', a: 'bragantino', rotulo: 'quinta, 19/11 · 19h30',
      info: ['Vitória 32%', 'empate 30%', 'Bragantino 39%'] },

    // "Hoje a chance de cair do Vitória está em 46% ... 20% ... 52 ... 63%"
    { tipo: 'barras', em: 56.4, escudo: 'vitoria', titulo: 'chance do Vitória cair',
      itens: [
        { rotulo: 'hoje', valor: 46.4, cor: 'var(--z-rb)', em: 58.0 },
        { rotulo: 'se ganhar', valor: 19.6, cor: 'var(--ok)', em: 61.4 },
        { rotulo: 'se empatar', valor: 52.7, cor: 'var(--empate)', em: 63.5 },
        { rotulo: 'se perder', valor: 63.5, cor: 'var(--z-rb)', em: 64.8 },
      ] },

    // "O Corinthians já abordei no outro vídeo, se você não viu"
    { tipo: 'placar', em: 92.9, selo: 'o jogo do Timão', h: 'corinthians', a: 'botafogo', rotulo: 'quarta, 18/11 · 21h30',
      titulo: ['tem vídeo só dele', 'no perfil'] },

    // "Hoje a chance do Corinthians cair está em 45% ... 22% ... 52% ... 65%"
    { tipo: 'barras', em: 96.6, escudo: 'corinthians', titulo: 'chance do Timão cair',
      itens: [
        { rotulo: 'hoje', valor: 44.7, cor: 'var(--z-rb)', em: 98.6 },
        { rotulo: 'se ganhar', valor: 23.0, cor: 'var(--ok)', em: 102.2 },
        { rotulo: 'se empatar', valor: 53.1, cor: 'var(--empate)', em: 104.2 },
        { rotulo: 'se perder', valor: 64.6, cor: 'var(--z-rb)', em: 106.3 },
      ] },

    // "O Internacional vai a São Januário encontrar o Vasco na quinta-feira"
    { tipo: 'placar', em: 113.2, selo: 'em São Januário', h: 'vasco', a: 'internacional', rotulo: 'quinta, 19/11 · 19h30',
      info: ['Vasco 49%', 'empate 27%', 'Inter 24%'] },

    // "Hoje a chance de cair está em 35%. Se o Inter ganhar, 11%; se empatar, 35%; e se perder, 47%"
    { tipo: 'barras', em: 116.6, escudo: 'internacional', titulo: 'chance do Inter cair',
      itens: [
        { rotulo: 'hoje', valor: 34.8, cor: 'var(--z-rb)', em: 118.9 },
        { rotulo: 'se ganhar', valor: 11.1, cor: 'var(--ok)', em: 121.8 },
        { rotulo: 'se empatar', valor: 34.2, cor: 'var(--empate)', em: 123.3 },
        { rotulo: 'se perder', valor: 46.5, cor: 'var(--z-rb)', em: 124.9 },
      ] },

    // "O Mirassol já jogou na rodada, manteve as suas chances ali em torno de 17%"
    { tipo: 'placar', em: 126.3, emGols: .45, selo: 'já jogou', h: 'mirassol', a: 'atleticomg', gh: 0, ga: 0,
      rotulo: 'sábado, 14/11', chip: 'empate', titulo: ['17% de chance de cair', 'e tabela dura no fim'],
      info: ['Fluminense', 'Athletico', 'Grêmio'] },

    // "O Coritiba, praticamente sem chance de cair, recebe o Santos"
    { tipo: 'placar', em: 133.1, selo: 'quase livre', h: 'coritiba', a: 'santos', rotulo: 'quarta, 18/11 · 19h30',
      info: ['Coritiba 38%', 'empate 28%', 'Santos 35%'] },

    // "Hoje está em 4% ... se vencer, zera ... se empatar, mantém os 4% ... se perder, dobra, vai a 8%"
    { tipo: 'barras', em: 137.7, escudo: 'coritiba', titulo: 'chance do Coritiba cair', max: 20,
      itens: [
        { rotulo: 'hoje', valor: 4.1, cor: 'var(--z-pre)', em: 138.7 },
        { rotulo: 'se ganhar', valor: 0.0, cor: 'var(--ok)', em: 140.6 },
        { rotulo: 'se empatar', valor: 4.0, cor: 'var(--empate)', em: 142.7 },
        { rotulo: 'se perder', valor: 8.7, cor: 'var(--z-rb)', em: 144.3 },
      ] },

    // "Comenta aqui o que você acha que vai acontecer na próxima rodada"
    { tipo: 'jogos', em: 146.6, selo: '35ª rodada', titulo: 'qual o seu palpite?',
      lista: [
        { h: 'gremio', a: 'bahia', quando: 'qua 21h30', p: [36.2, 27.8, 36.0] },
        { h: 'corinthians', a: 'botafogo', quando: 'qua 21h30', p: [40.1, 28.9, 31.0] },
        { h: 'vasco', a: 'internacional', quando: 'qui 19h30', p: [49.1, 27.3, 23.6] },
        { h: 'vitoria', a: 'bragantino', quando: 'qui 19h30', p: [31.5, 30.0, 38.5] },
      ] },

    // "Faz uma simulação no site do Tapa na Gaveta"
    { tipo: 'fecho', em: 151.5, texto: 'simule a rodada você também' },
  ],
});

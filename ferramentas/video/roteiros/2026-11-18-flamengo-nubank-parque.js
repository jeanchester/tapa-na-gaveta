/* "O Flamengo pode ser campeão no Nubank Parque" · gravação IMG_5962.MOV (Jean, 18/11), transcrita na sessão
   (sherpa-onnx + Whisper small). Números do modelo do site (chances.js, retrato de 18/11/2026 02h46, 100 mil
   simulações). Tempos abaixo e nos "em" = segundos da gravação BRUTA; g() desconta o inicio (2,3 s).

   Primeiro vídeo no ritmo do que mais rendeu no perfil ("Será que o Corinthians se salva?", 14/11, 1,2 mil views):
   pausas encolhidas para ~0,15 s, velocidade 1,1× e fundo musical contínuo (ver "Ritmo" na skill).
   99 s de gravação → ~57 s de vídeo.

      2,4  O Flamengo só precisa de duas vitórias para garantir o décimo título brasileiro.
      6,5  Eu estou aqui no site tapanagaveta.com.br, onde você pode simular as probabilidades, ver as chances de
           acordo com cada resultado que você colocar ou mandar simular o resto, a partir de um modelo matemático...
     20,8  Vamos olhar aqui o próximo jogo do Flamengo: pega o Athletico em casa, no Maracanã, na quarta-feira.
   [ 25,8  "Vamos supor que o Flamengo vai ganhar..." até "...casa dos caras" (primeira tentativa) → CORTADO ]
   [ 40,7  "Vou cortar aqui, a manchete tem que ser: o Flamengo pode ser campeão no Nubank Parque" (instrução)
           → CORTADO; a manchete virou o título da abertura ]
     46,3  Hoje a chance de título do Flamengo é 87,8%, de acordo com o nosso modelo matemático...
     53,5  Mesmo que o Palmeiras ganhe do Cruzeiro no Mineirão, que é uma tarefa difícil, se o Flamengo confirmar o
           favoritismo e ganhar do Athletico, é apenas ganhar do Palmeiras no Nubank Parque.
   [ 61,8  ", apenas que..." (tropeço) → CORTADO ]
     63,5  É uma tarefa difícil, mas só precisa de duas vitórias nesses quatro jogos para sacramentar o título.
   [ 68,8  "No caso, mesmo que o Palmeiras ganhe... mesmo que o Flamengo ainda assim..." (tropeço) → CORTADO ]
     76,3  Basta duas vitórias do Flamengo, porque aí ficaria impossível do Palmeiras alcançar o número de vitórias
           e os pontos ao mesmo tempo, e com isso o Flamengo se sagra campeão.
     84,0  Coloca aqui nos comentários o que você acha... Faça as simulações no site... Muito obrigado, fui!
   Pausas acima de 0,25 s entre frases → encolhidas para ~0,15 s.

   Modelo (18/11): Flamengo 1º, 76 pts, título 87,8% (se vencer o Athletico 93,2 · empatar 78,0 · perder 69,9);
   Palmeiras 2º, 73 pts, título 12,2%. Flamengo x Athletico: 69,9 · 20,5 · 9,6.
   Conta da manchete: Flamengo vence Athletico e Palmeiras → 82 pts e 25 vitórias; o Palmeiras, mesmo vencendo o
   Cruzeiro e os outros dois, chega no máximo a 82 pts e 24 vitórias → Flamengo campeão no Nubank Parque.
   ATENÇÃO: "duas vitórias quaisquer" não bastam (se perder para o Palmeiras, o Palmeiras pode chegar a 85); na tela
   o título diz "uma delas no Nubank Parque".
   Fatos conferidos: Flamengo x Athletico-PR, qua 18/11 20h30, Maracanã; Palmeiras x Flamengo, sáb 21/11 16h30,
   Nubank Parque (antigo Allianz Parque); o Flamengo tem 9 Brasileiros (o de 2026 seria o 10º). */
const B = 2.3, g = (s) => +(s - B).toFixed(2);
ROTEIRO({
  nome: '2026-11-18-flamengo-nubank-parque',
  estado: 'simulando',
  inicio: B,
  duracao: g(99.0),
  velocidade: 1.1,
  cortes: [[3.64, 4.06], [14.57, 14.78], [17.95, 18.44], [20.2, 20.31], [23.1, 44.0], [50.83, 51.1], [57.0, 57.27],
    [59.46, 61.18], [62.64, 62.94], [65.8, 73.96], [76.01, 76.51], [81.08, 81.7], [90.6, 90.84], [94.22, 94.49]],
  faixa: ['tapa na gaveta', 'briga pelo título', 'faltam 4 rodadas', '<b>tapanagaveta.com.br</b>'],
  T: [],
  cenas: [
    // "O Flamengo só precisa de duas vitórias para garantir o décimo título" (manchete pedida na gravação)
    { tipo: 'abertura', em: g(2.35), selo: 'o 10º Brasileiro', escudo: 'flamengo',
      titulo: ['o Flamengo pode ser campeão', 'no Nubank Parque'] },

    // "Eu estou aqui no site tapanagaveta.com.br"
    { tipo: 'tabela', em: g(6.45), titulo: 'faltam 4 rodadas', eu: 'flamengo',
      linhas: [
        { t: 'flamengo', pos: 1, j: 34, sg: 42, pts: 76 },
        { t: 'palmeiras', pos: 2, j: 34, sg: 39, pts: 73 },
        { t: 'cruzeiro', pos: 3, j: 34, sg: 7, pts: 60 },
        { t: 'fluminense', pos: 4, j: 34, sg: 13, pts: 57 },
        { t: 'athletico', pos: 5, j: 34, sg: 8, pts: 54 },
      ] },

    // "a partir das estatísticas e as probabilidades dos resultados"
    { tipo: 'barras', em: g(17.15), titulo: 'chance de título hoje',
      itens: [
        { t: 'flamengo', valor: 87.8, cor: 'var(--ouro)', em: g(18.0) },
        { t: 'palmeiras', valor: 12.2, cor: 'var(--ok)', em: g(18.8) },
      ] },

    // "Vamos olhar aqui o próximo jogo do Flamengo: pega o Athletico em casa, no Maracanã"
    { tipo: 'placar', em: g(20.75), h: 'flamengo', a: 'athletico', rotulo: 'hoje, 20h30 · Maracanã',
      info: ['Flamengo 70%', 'empate 21%', 'Athletico 10%'] },

    // "Hoje a chance de título do Flamengo é 87,8%"
    { tipo: 'numero', em: g(46.3), valor: 87.8, casas: 1, sufixo: '%', escudo: 'flamengo',
      titulo: ['chance de título', 'no nosso modelo'] },

    // "Mesmo que o Palmeiras ganhe do Cruzeiro no Mineirão"
    { tipo: 'placar', em: g(53.45), emGols: 1.3, h: 'cruzeiro', a: 'palmeiras', gh: 0, ga: 1,
      rotulo: 'hoje, 20h30 · Mineirão', chip: 'mesmo se o Palmeiras vencer' },

    // "se o Flamengo confirmar o favoritismo e ganhar do Athletico"
    { tipo: 'placar', em: g(56.5), emGols: 1.6, h: 'flamengo', a: 'athletico', gh: 1, ga: 0,
      rotulo: 'hoje, 20h30 · Maracanã', chip: 'vitória', corChip: 'var(--ok)' },

    // "é apenas ganhar do Palmeiras no Nubank Parque"
    { tipo: 'placar', em: g(59.6), emGols: 1.0, h: 'palmeiras', a: 'flamengo', gh: 0, ga: 1,
      rotulo: 'sábado, 21/11 · Nubank Parque', chip: 'campeão', corChip: 'var(--ouro)' },

    // "só precisa de duas vitórias nesses quatro jogos para sacramentar o título"
    { tipo: 'numero', em: g(63.5), de: 0, valor: 2, sufixo: 'vitórias', escudo: 'flamengo',
      titulo: ['duas vitórias', 'uma delas no Nubank Parque'] },

    // "ficaria impossível do Palmeiras alcançar o número de vitórias e os pontos ao mesmo tempo"
    { tipo: 'barras', em: g(77.0), titulo: ['empatou em 82 pontos?', 'desempata nas vitórias'], max: 30, casas: 0,
      sufixo: '',
      itens: [
        { t: 'flamengo', valor: 25, cor: 'var(--ouro)', em: g(79.6) },
        { t: 'palmeiras', valor: 24, cor: 'var(--ok)', em: g(80.6) },
      ] },

    // "Coloca aqui nos comentários o que você acha"
    { tipo: 'placar', em: g(84.0), h: 'palmeiras', a: 'flamengo', rotulo: 'sábado, 21/11 · 16h30',
      titulo: ['qual o seu palpite?', 'deixa nos comentários'] },

    // "Faça as simulações aqui no site"
    { tipo: 'fecho', em: g(88.8), texto: 'simule a reta final você também' },
  ],
});

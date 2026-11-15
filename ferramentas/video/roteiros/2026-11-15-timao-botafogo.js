/* "Corinthians x Botafogo: os três cenários" · gravação IMG_5961.MOV (Jean, 15/11), transcrita na sessão
   (sherpa-onnx + Whisper small). Números do modelo do site (chances.js, retrato de 15/11/2026 16h09, 100 mil
   simulações). Tempos abaixo e nos "em" = segundos da gravação BRUTA; g() desconta o inicio (1,6 s).

      1,9  Pô, Corinthians ganhando do Botafogo na quarta, a chance de cair cai pela metade.
      5,6  Eu estou aqui no site tapanagaveta.com.br, onde você pode conferir as chances de cada cenário, de cada
           objetivo dos times aqui no Brasileirão, nas últimas quatro rodadas.
     14,2  Vamos simular as três opções de resultado do jogo do Corinthians contra o Botafogo, depois da data FIFA,
           quarta-feira, 9 e meia da noite.
     21,5  Começando pelo resultado mais provável, na minha opinião: Corinthians 1 a 0.
     25,3  A chance de cair do Corinthians, que hoje está em 44%, cai para 23%.
     29,7  O Botafogo já está praticamente salvo, liquidado ali, precisa de mais uma vitoriazinha.
   [ 34,2  "É... se perder, a chance de..." + 5,7 s parado (frase recomeçada) → CORTADO ]
     42,9  Se perder, a chance de cair dobra, mas é um dobra mentiroso: hoje a chance é 1%, se perder vai para 2%.
           Vamos combinar que não é tão provável assim, só uma catástrofe pra rebaixar o Botafogo, apesar de ter
           muito torcedor por aí preocupado.
     55,1  Vamos colocar um empatezinho pra ver o que acontece?
   [ 57,1  "Nesse cenário," + pausa (recomeço) → CORTADO ]
     59,9  Nesse cenário vamos considerar que o jogo vai ser 0 a 0. A chance do Corinthians cair vai de 44% pra 53%,
           já começa a ficar mais azedo. Se não ganhar esse jogo em casa, a chance de cair vai aumentar um pouquinho.
   [ 72,2  pausa de 1 s → encolhida ]
     73,0  No caso do Botafogo, se empatar, reduz ainda mais: hoje está em 1%, vai para 0,4. Já vai para 43 pontos,
           fica ali a quase 2 pontos de se salvar matematicamente.
     84,1  No caso da vitória do Botafogo, a chance do Corinthians vai, infelizmente, para 2/3, 64% praticamente.
     91,9  No caso do Botafogo, se ganhar, praticamente liquida as chances de rebaixamento, tal qual foi o Vasco:
           vai pra faixa dos 45 pontos.
     99,7  Comenta aqui o que você acha que vai acontecer, deixa nos comentários seu palpite. Olha lá no site,
           brinca com os cenários, conta pra gente o que acha.   105,7  Muito obrigado pela atenção.

   Modelo (15/11): Corinthians 17º, 37 pts, cair 44,7% → vence 23,0 · empata 53,1 · perde 64,6.
   Botafogo 12º, 42 pts, cair 1,0% → vence 0,0 · empata 0,4 · perde 2,2. Jogo: Timão 40,1 · empate 28,9 · Bota 31,0.
   Fatos conferidos: Corinthians x Botafogo, quarta 18/11, 21h30, Neo Química Arena (35ª rodada, depois da data FIFA);
   Vasco venceu a Chape por 2 a 0 no sábado (14/11) e foi a 44 pontos. */
const B = 1.6, g = (s) => +(s - B).toFixed(2);
ROTEIRO({
  nome: '2026-11-15-timao-botafogo',
  estado: 'simulando',
  inicio: B,
  duracao: g(107.5),
  // trechos que saem do vídeo (som e imagem juntos), em segundos da gravação menos o inicio
  cortes: [
    [g(33.85), g(42.70)],         // "É... se perder, a chance de..." e 5,7 s parado
    [g(57.10), g(59.80)],         // "Nesse cenário," recomeçado
    [g(72.25), g(72.85)],         // pausa de 1 s
  ],
  faixa: ['tapa na gaveta', 'corinthians × botafogo', 'quarta, 21h30', '<b>tapanagaveta.com.br</b>'],
  T: [],
  cenas: [
    // "Corinthians ganhando do Botafogo na quarta, a chance de cair cai pela metade"
    { tipo: 'abertura', em: g(1.75), selo: 'quarta, 21h30', escudos: ['corinthians', 'botafogo'],
      titulo: ['ganhou do Botafogo?', 'risco cai pela metade'] },

    // "Eu estou aqui no site ... nas últimas quatro rodadas"
    { tipo: 'tabela', em: g(5.6), titulo: 'faltam 4 rodadas', eu: 'corinthians', corte: 5, textoCorte: 'z4',
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

    // "Vamos simular as três opções de resultado do jogo do Corinthians contra o Botafogo"
    { tipo: 'placar', em: g(14.2), selo: 'três cenários', h: 'corinthians', a: 'botafogo', rotulo: 'quarta, 18/11 · 21h30',
      titulo: ['três resultados,', 'três cenários'], info: ['Timão 40%', 'empate 29%', 'Botafogo 31%'] },

    // "Começando pelo resultado mais provável, na minha opinião, Corinthians 1 a 0"
    { tipo: 'placar', em: g(21.5), emGols: 2.2, selo: 'cenário 1', h: 'corinthians', a: 'botafogo', gh: 1, ga: 0,
      rotulo: 'o meu palpite', chip: 'vitória do Timão', corChip: 'var(--ok)' },

    // "A chance de cair do Corinthians, que hoje está em 44%, cai para 23%"
    { tipo: 'barras', em: g(25.25), escudo: 'corinthians', titulo: ['chance do Timão cair', 'se ganhar'],
      itens: [
        { rotulo: 'hoje', valor: 44.7, cor: 'var(--z-rb)', em: g(27.1) },
        { rotulo: 'se ganhar', valor: 23.0, cor: 'var(--ok)', em: g(28.5) },
      ] },

    // "O Botafogo já está praticamente salvo"
    { tipo: 'abertura', em: g(29.7), selo: '12º, 42 pontos', escudo: 'botafogo', titulo: ['e o Botafogo?', 'praticamente salvo'] },

    // "Se perder, a chance de cair dobra, mas é um dobra mentiroso: hoje 1%, se perder 2%"
    { tipo: 'barras', em: g(42.85), escudo: 'botafogo', titulo: ['se perder, dobra…', 'mas é um dobro mentiroso'], max: 10,
      itens: [
        { rotulo: 'hoje', valor: 1.0, cor: 'var(--z-pre)', em: g(46.2) },
        { rotulo: 'se perder', valor: 2.2, cor: 'var(--z-rb)', em: g(48.0) },
      ] },

    // "Vamos colocar um empatezinho pra ver o que acontece" ... "o jogo vai ser 0 a 0"
    { tipo: 'placar', em: g(55.1), emGols: 1.4, selo: 'cenário 2', h: 'corinthians', a: 'botafogo', gh: 0, ga: 0,
      rotulo: 'e se der empate?', chip: 'empate' },

    // "a chance do Corinthians cair vai de 44% pra 53%, já começa a ficar mais azedo"
    { tipo: 'barras', em: g(62.2), escudo: 'corinthians', titulo: ['chance do Timão cair', 'se empatar'],
      itens: [
        { rotulo: 'hoje', valor: 44.7, cor: 'var(--z-rb)', em: g(63.7) },
        { rotulo: 'se empatar', valor: 53.1, cor: 'var(--empate)', em: g(64.6) },
      ] },

    // "No caso do Botafogo, se empatar, reduz ainda mais: hoje 1%, vai para 0,4"
    { tipo: 'barras', em: g(72.95), escudo: 'botafogo', titulo: ['Botafogo', 'se empatar'], max: 10,
      itens: [
        { rotulo: 'hoje', valor: 1.0, cor: 'var(--z-pre)', em: g(76.3) },
        { rotulo: 'se empatar', valor: 0.4, cor: 'var(--ok)', em: g(77.4) },
      ] },

    // "Já vai para 43 pontos, fica ali a quase 2 pontos de se salvar"
    { tipo: 'numero', em: g(78.1), de: 42, valor: 43, sufixo: 'pontos', escudo: 'botafogo',
      titulo: ['com o empate', 'o Bota chega a 43'] },

    // "No caso da vitória do Botafogo"
    { tipo: 'placar', em: g(84.1), emGols: .6, selo: 'cenário 3', h: 'corinthians', a: 'botafogo', gh: 0, ga: 1,
      rotulo: 'vitória do Botafogo', chip: 'derrota', corChip: 'var(--z-rb)' },

    // "a chance do Corinthians vai, infelizmente, para 2/3, 64% praticamente"
    { tipo: 'barras', em: g(86.55), escudo: 'corinthians', titulo: ['chance do Timão cair', 'se perder'],
      itens: [
        { rotulo: 'hoje', valor: 44.7, cor: 'var(--z-rb)', em: g(87.3) },
        { rotulo: 'se perder', valor: 64.6, cor: 'var(--z-rb)', em: g(88.9) },
      ] },

    // "No caso do Botafogo, se ganhar, praticamente liquida as chances de rebaixamento"
    { tipo: 'abertura', em: g(91.85), selo: 'se o Botafogo ganhar', escudo: 'botafogo', titulo: ['chance de cair', 'vai a zero'] },

    // "vai pra faixa dos 45 pontos"
    { tipo: 'numero', em: g(96.4), de: 42, valor: 45, sufixo: 'pontos', escudo: 'botafogo',
      titulo: ['tal qual o Vasco', 'praticamente livre'] },

    // "Comenta aqui o que você acha que vai acontecer, deixa nos comentários seu palpite"
    { tipo: 'placar', em: g(99.6), selo: 'e você?', h: 'corinthians', a: 'botafogo', rotulo: 'quarta, 18/11 · 21h30',
      titulo: ['qual o seu palpite?', 'deixa nos comentários'] },

    // "Olha lá no site, brinca com os cenários"
    { tipo: 'fecho', em: g(102.6), texto: 'brinque com os cenários do seu time' },
  ],
});

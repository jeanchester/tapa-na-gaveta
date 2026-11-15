/* "Japão 3 × 2 Brasil" + escalação para Singapura · gravação IMG_5965.MOV (Jean, 15/11), transcrita na sessão
   (sherpa-onnx + Whisper small). Tempos da fala = segundos da gravação bruta; "em" e "cortes" descontam o inicio (3,3 s).

      3,6  O Brasil perdeu hoje 3 a 2 para o Japão em Singapura, apesar de dois golaços do Vini Jr., que eu critiquei
           no primeiro vídeo do nosso perfil. O cara jogou bem nesse jogo, fez dois gols, buscou o empate,
     14,0  mas no último lance do jogo, praticamente, o Japão fez o terceiro gol e acabou ganhando.
     18,8  Mais uma vitória do Japão sobre o Brasil, lembrando que é a segunda na história. A primeira também
     26,7  foi 3 a 2, com aqueles jogos malucos, falha do Hugo, falha do Fabrício Bruno, de virada do Japão. Enfim,
     33,9  o jogo terminou com o Ancelotti e o Raphinha expulsos, dando uma surtada com a arbitragem. Realmente foi
           falta em cima do João Gomes, o japonês bateu várias vezes nele.
   [ 42,3  "que tem um rouba-bola... falta" (frase recomeçada) → CORTADO ]
     44,3  O Japão roubou a bola e fez o terceiro gol nos acréscimos. Tinha razão, porém era um amistoso, não era decisão.
     50,4  Vamos combinar que foi mais pela pressão que o Ancelotti e o Brasil estão sofrendo do que pela importância.
     55,5  Enfim, comenta aqui o seu palpite para o próximo jogo, contra Singapura, terça-feira.
     61,4  E vamos projetar um pouquinho a próxima escalação da seleção. Como eu falei no primeiro vídeo, eu sou adepto
           de colocar 3 zagueiros. Não acho que esses laterais estão funcionando, a linha de 4 não está resolvendo nada,
           vários lances do Japão saíram com buracos atrás. Então mantém o 3-5-2.
     81,5  Pode colocar o Pedro Morisco no gol...   [ 83,9  "está bem? então... e agora o" → CORTADO ]
     85,5  Colocaria Jair, Arthur Dias e Gabriel Magalhães. Bruno Guimarães e Andrey Santos. O Wesley na ala esquerda,
           que está jogando muito bem pela Roma, com o Gasperini. Vanderson na direita, acho que entrou bem.
     97,4  E o Estêvão de 10. E na frente... eu falei na outra vez que era Raphinha, vou trocar essa dupla: vou deixar
           o Vini Jr.   [ 105,0  pausa de 5 s → CORTADA ]   110,0  Bota o Endrick, quero ver como esses dois se combinam
           no ataque da seleção, vamos ver se isso dá mais certo. Acho que o Ancelotti precisa fazer algumas mudanças.
    118,2  Tudo bem que ele testou com três volantes na última vez, mas o André jogou até que bem.
   [ 123,3  "surpreendeu, até que o Corinthians não estava jogando, mas" (fora do assunto) → CORTADO ]
    126,6  Ainda acho que precisa abandonar essa linha de 4, tá muito aberta, tá dando muito espaço. A seleção tá tomando
           muito gol, não está sendo sólida defensivamente.   [ 135,3  "acho que" solto → CORTADO ]
    136,1  Comenta aí o que você acha da discussão do Ancelotti, do surto deles com a arbitragem no fim do jogo.
    141,9  E como você acha que vai ser o jogo contra Singapura, o que você faria? Brinca lá no site, posta aqui essa
           escalação, diz pra gente o que tá achando. Muito obrigado pela atenção. Fui.

   Fatos conferidos (14/11/2026): Japão 3 × 2 Brasil no Estádio Nacional de Singapura; os dois gols do Brasil foram do
   Vini Jr., de fora da área; o 3º gol japonês (Sakamoto) saiu nos acréscimos após reclamação de falta em João Gomes;
   Ancelotti e Raphinha expulsos; 2ª vitória do Japão sobre o Brasil, a 1ª foi 3 × 2 de virada em Tóquio (14/10/2025).
   Brasil × Singapura: terça, 17/11, 7h (Brasília). Todos os nomes da escalação estão na convocação de novembro. */
ROTEIRO({
  nome: '2026-11-15-brasil-japao',
  estado: 'seleção',
  inicio: 3.3,
  duracao: 148.3,
  cortes: [
    [39.03, 40.99],               // frase recomeçada ("que tem um rouba-bola... falta")
    [58.75, 59.30],               // pausa antes do "vamos projetar"
    [80.60, 82.05],               // "está bem? então... e agora o"
    [101.80, 106.45],             // pausa de 5 s antes do Endrick
    [120.04, 123.32],             // comentário fora do assunto
    [132.03, 132.65],             // "acho que" solto antes do "comenta aí"
  ],
  faixa: ['tapa na gaveta', 'seleção brasileira', 'japão 3 × 2 brasil', '<b>tapanagaveta.com.br</b>'],

  // experimento: a versão base (A) sai sem legenda, a B com a fala legendada na tela
  fator: 'Legenda na tela',
  nivel: 'não',
  variantes: {
    B: { nivel: 'sim', legenda: true },
  },

  T: [],
  // fala transcrita (sherpa-onnx + Whisper, texto corrigido à mão), em segundos depois do inicio; os trechos
  // dentro dos cortes ficaram de fora. É o texto que vai na legenda da variante B.
  fala: [
    [0.32, 3.06, 'O Brasil perdeu hoje 3 a 2 para o Japão, em Singapura,'],
    [3.39, 7.89, 'apesar de dois golaços do Vini Jr., que eu critiquei no primeiro vídeo do nosso perfil.'],
    [8.45, 10.42, 'O cara jogou bem nesse jogo, fez dois gols,'],
    [10.69, 15.06, 'buscou o empate para o Brasil, mas no último lance do jogo, praticamente, o Japão fez o terceiro gol'],
    [15.46, 23.09, 'e acabou ganhando o jogo. Mais uma vitória do Japão sobre o Brasil, lembrando que é a segunda na história. A primeira também'],
    [23.36, 27.73, 'foi 3 a 2, com aqueles jogos malucos, falha do Hugo, falha do Fabrício Bruno,'],
    [28.16, 29.11, 'de virada do Japão.'],
    [29.63, 30.26, 'Enfim,'],
    [30.63, 38.87, 'o jogo terminou com o Ancelotti e o Raphinha expulsos, dando uma surtada com a arbitragem. Realmente foi falta em cima do João Gomes, o japonês bateu várias vezes nele.'],
    [41.12, 43.38, 'O Japão roubou a bola e fez o terceiro gol.'],
    [43.75, 46.77, 'Tinha razão, porém era um amistoso, não era decisão.'],
    [47.14, 51.64, 'Vamos combinar que acho que foi mais pela pressão que o Ancelotti e o Brasil estão sofrendo do que pela importância.'],
    [52.23, 57.17, 'Enfim, comenta aqui o seu palpite para o próximo jogo, contra Singapura, terça-feira.'],
    [58.11, 58.71, 'E vamos'],
    [59.43, 66.52, 'projetar um pouquinho qual vai ser a próxima escalação da seleção. Como eu falei no primeiro vídeo do canal, eu sou adepto de colocar 3 zagueiros.'],
    [66.91, 72.37, 'Não acho que esses laterais estão funcionando, a linha de 4 atrás não está resolvendo nada.'],
    [72.71, 75.35, 'Vários lances do Japão saíram com buracos atrás.'],
    [75.71, 78.13, 'Então mantém o 3-5-2.'],
    [78.50, 80.45, 'Pode colocar o Pedro Morisco no gol.'],
    [82.59, 84.92, 'Colocaria Jair, Arthur Dias e Gabriel Magalhães.'],
    [85.28, 86.71, 'Bruno Guimarães e Andrey Santos.'],
    [87.01, 89.75, 'O Wesley na ala esquerda, que está jogando muito bem pela Roma'],
    [90.21, 91.54, 'com o Gasperini.'],
    [91.94, 93.81, 'Vanderson na direita, acho que entrou bem.'],
    [94.34, 97.04, 'E o Estêvão de 10. E na frente...'],
    [97.35, 99.06, 'eu falei na outra vez que era Raphinha.'],
    [99.49, 101.65, 'Vou trocar essa dupla, vou deixar o Vini Jr.'],
    [106.69, 109.62, 'Bota o Endrick. Quero ver'],
    [109.86, 114.39, 'como esses dois se combinam no ataque da seleção, vamos ver se isso dá mais certo. Acho que o Ancelotti precisa fazer algumas mudanças.'],
    [114.85, 117.84, 'Tudo bem que ele testou com três volantes na última vez,'],
    [118.18, 119.86, 'mas o André jogou até que bem.'],
    [123.55, 128.24, 'Ainda acho que precisa abandonar essa linha de 4, tá muito aberta, tá dando muito espaço.'],
    [128.48, 131.90, 'A seleção tá tomando muito gol, não está sendo sólida defensivamente.'],
    [132.77, 134.87, 'Comenta aí o que você acha da discussão do Ancelotti,'],
    [135.07, 137.04, 'do surto deles com a arbitragem'],
    [137.31, 138.39, 'no fim do jogo.'],
    [138.59, 143.54, 'E como você acha que vai ser o jogo contra Singapura, o que você faria? Brinca lá no site,'],
    [143.78, 147.25, 'posta aqui essa escalação, diz pra gente o que tá achando. Muito obrigado pela atenção.'],
  ],
  cenas: [
    { tipo: 'placar', em: 0.25, selo: 'amistoso em Singapura', h: 'japao', a: 'brasil', gh: 3, ga: 2, rotulo: 'fim de jogo · sábado, 14/11',
      chip: 'gol do Japão nos acréscimos', corChip: 'var(--z-rb)', titulo: ['dois golaços do Vini', 'e mesmo assim derrota'] },

    // "O cara jogou bem nesse jogo, fez dois gols"
    { tipo: 'numero', em: 8.45, valor: 2, sufixo: 'gols do Vini', titulo: ['os dois de fora da área', 'e o empate no 2º tempo'] },

    // "Mais uma vitória do Japão sobre o Brasil ... a segunda na história"
    { tipo: 'abertura', em: 15.45, selo: 'freguesia?', titulo: ['2ª vitória do Japão', 'em toda a história'], escudos: ['japao', 'brasil'] },

    // "a primeira também foi 3 a 2 ... falha do Hugo, falha do Fabrício Bruno"
    { tipo: 'placar', em: 23.35, selo: 'a primeira', h: 'japao', a: 'brasil', gh: 3, ga: 2, rotulo: 'Tóquio · 14/10/2025', chip: 'de virada', corChip: 'var(--z-rb)',
      titulo: ['também 3 a 2', 'e também com Ancelotti'], info: ['falha do Hugo Souza', 'falha do Fabrício Bruno'] },

    // "o jogo terminou com o Ancelotti e o Raphinha expulsos"
    { tipo: 'abertura', em: 30.6, selo: 'confusão no fim', cartoes: 2, titulo: ['Ancelotti e Raphinha', 'expulsos'] },

    // "Tinha razão, porém era um amistoso"
    { tipo: 'abertura', em: 43.75, selo: 'falta no João Gomes', titulo: ['teve razão, mas…', 'era só um amistoso'] },

    // "comenta aqui o seu palpite para o próximo jogo, contra Singapura"
    { tipo: 'placar', em: 52.2, selo: 'próximo jogo', h: 'singapura', a: 'brasil', rotulo: 'terça, 17/11 · 7h', titulo: ['qual o seu palpite?'] },

    // "vamos projetar um pouquinho a próxima escalação ... adepto de colocar 3 zagueiros"
    { tipo: 'abertura', em: 58.1, selo: 'próxima escalação', titulo: ['3 zagueiros', 'e chega de linha de 4'] },

    // "Então mantém o 3-5-2"
    { tipo: 'escalacao', em: 75.7, selo: 'minha escalação pra pegar Singapura', formacao: '3-5-2',
      jogadores: [
        { nome: 'Pedro Morisco', x: 50, y: 87, em: 79.0 },
        { nome: 'Gabriel Magalhães', x: 20, y: 67, em: 83.9 },
        { nome: 'Arthur Dias', x: 50, y: 69, em: 83.1 },
        { nome: 'Jair', x: 80, y: 67, em: 82.3 },
        { nome: 'Bruno Guimarães', x: 32, y: 49, em: 85.1 },
        { nome: 'Andrey Santos', x: 68, y: 49, em: 85.7 },
        { nome: 'Wesley', x: 11, y: 36, em: 87.0, destaque: true },
        { nome: 'Vanderson', x: 89, y: 36, em: 91.7, destaque: true },
        { nome: 'Estêvão', x: 50, y: 29, em: 94.9 },
        { nome: 'Vini Jr.', x: 30, y: 9, em: 100.9 },
        { nome: 'Endrick', x: 70, y: 9, em: 106.7, destaque: true },
      ] },

    // "Ainda acho que precisa abandonar essa linha de 4"
    { tipo: 'abertura', em: 123.6, selo: 'o problema', titulo: ['linha de 4 muito aberta', 'e muito gol sofrido'] },

    // "Comenta aí o que você acha da discussão do Ancelotti"
    { tipo: 'abertura', em: 132.77, selo: 'comenta aí', cartoes: 2, titulo: ['o Ancelotti exagerou?', 'e qual seria a sua escalação?'] },

    // "Brinca lá no site, posta aqui essa escalação"
    { tipo: 'fecho', em: 138.6, texto: 'monte a sua escalação' },
  ],
});

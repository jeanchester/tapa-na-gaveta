/* "Mata-mata na Série B, e sem pênalti" · números do modelo do site em 15/11/2026 (retrato da Série B com as 38 rodadas).
   Chance de subir: ida e volta com as probabilidades de placar do modelo; agregado empatado = sobe a melhor campanha.

   Gravação: IMG_5968.mov (Jean, 15/11), transcrita na sessão (sherpa-onnx + Whisper small, ver SKILL.md).
   Tempos da fala abaixo = segundos da gravação bruta. Os "em" e "cortes" do roteiro descontam o "inicio" (1,85 s).

      2,1  A Série B vai ter mata-mata pela primeira vez desde 2002. E não tem pênalti.
      5,9  O Novorizontino foi campeão, finalmente conseguiu garantir o acesso pela primeira vez, e subiu junto com o Juventude.
     11,8  Esses dois já tão na A.
     13,4  Se você não se lembra o formato da Série B esse ano, as outras duas vagas vão sair de um mata-mata
           entre o terceiro e o sexto, o quarto e o quinto.
     21,0  Então deu Vila Nova contra Atlético Goianiense, clássico goiano. O Atlético roubou essa vaga do CRB.
     28,4  E o Fortaleza contra o Criciúma.
     30,1  A ida vai ser no sábado que vem, dia 21, e a volta no dia 28, dia da final da Libertadores.
     35,4  Se o agregado empatar, sobe quem fez a melhor campanha. No caso, o Vila Nova e o Fortaleza vão jogar pelo empate.
     41,8  Rodamos aqui no nosso simulador, tapanagaveta.com.br: o Vila Nova sobe em 58% das simulações,
     47,1  e o Fortaleza é o mais favorito de todos: dois terços das simulações ele sobe.
   [ 51,4  primeira versão do "um em cada cinco"  ·  58,2  "corta essa parte que eu vou refazer"  → CORTADO ]
     60,0  E olha isso: aqui no nosso simulador, em uma em cada cinco simulações o placar vai terminar igual,
           e aí vai pros critérios de desempate, que é o regulamento.
     68,6  Então lá embaixo foi um drama: o Avaí ganhou do América e mesmo assim caiu.
     74,6  O Ceará empatou com o CRB e se salvou por um pontinho, quase que o Ceará cai.
   [ 80,0  primeira versão do "comenta aí" (repetida logo depois)  → CORTADO ]
     83,9  Então comenta aí quem você acha que vai subir, e faz sua simulação no tapanagaveta.com.br.
   [ 87,8  "conta pra gente, você pode fazer de..." e o recomeço até "Série B do ano que vem" (fala tropeçada) → CORTADO ]
     97,7  Valeu demais sua atenção. Fui.
*/
ROTEIRO({
  nome: '2026-11-15-serie-b-playoffs',
  estado: 'série b',
  inicio: 1.85,
  duracao: 97.75,                 // fim da gravação (99,6 s) menos o inicio
  // trechos que saem do vídeo (som e imagem juntos), em segundos da gravação menos o inicio
  cortes: [
    [49.10, 58.10],               // 1ª tentativa do "um em cada cinco" + instrução de cortar
    [71.90, 72.55],               // pausa longa antes do Ceará
    [77.90, 81.90],               // 1º "comenta aí" (refeito em seguida)
    [85.87, 95.75],               // tropeço no fim: vai direto do endereço do site para o "valeu"
  ],
  zonas: { lib: [1, 2], pre: [3, 6], rb: [17, 20] },
  faixa: ['tapa na gaveta', 'série b 2026', 'playoff do acesso', '<b>tapanagaveta.com.br</b>'],
  T: [],
  cenas: [
    { tipo: 'abertura', em: 0, selo: 'primeira vez desde 2002', titulo: ['mata-mata na Série B', 'e sem pênalti'],
      escudos: ['vilanova', 'atleticogo', 'fortaleza', 'criciuma'] },

    // "O Novorizontino foi campeão"
    { tipo: 'abertura', em: 4.0, selo: 'acesso direto', titulo: ['Novorizontino campeão', 'e o Juventude sobe junto'],
      escudos: ['novorizontino', 'juventude'] },

    // "Se você não se lembra o formato"
    { tipo: 'tabela', em: 11.55, titulo: 'como terminou lá em cima', eu: 'novorizontino', corte: 6, textoCorte: 'fora do playoff',
      linhas: [
        { t: 'novorizontino', pos: 1, j: 38, sg: 35, pts: 73 },
        { t: 'juventude', pos: 2, j: 38, sg: 25, pts: 71 },
        { t: 'vilanova', pos: 3, j: 38, sg: 14, pts: 66 },
        { t: 'fortaleza', pos: 4, j: 38, sg: 12, pts: 65 },
        { t: 'criciuma', pos: 5, j: 38, sg: 6, pts: 62 },
        { t: 'atleticogo', pos: 6, j: 38, sg: 11, pts: 61 },
        { t: 'crb', pos: 7, j: 38, sg: 6, pts: 59 },
        { t: 'goias', pos: 8, j: 38, sg: -5, pts: 58 },
      ] },

    // "Então deu Vila Nova contra Atlético Goianiense"
    { tipo: 'jogos', em: 19.1, selo: 'playoff do acesso', titulo: 'ida dia 21, volta dia 28',
      lista: [
        { h: 'atleticogo', a: 'vilanova', quando: 'ida · 21/11', p: [47.1, 30.0, 22.9] },
        { h: 'vilanova', a: 'atleticogo', quando: 'volta · 28/11', p: [45.0, 29.9, 25.0] },
        { h: 'criciuma', a: 'fortaleza', quando: 'ida · 21/11', p: [37.8, 33.3, 28.9] },
        { h: 'fortaleza', a: 'criciuma', quando: 'volta · 28/11', p: [47.3, 30.2, 22.5] },
      ] },

    // "Se o agregado empatar"
    { tipo: 'abertura', em: 33.5, selo: 'a regra', titulo: ['empatou no agregado?', 'sobe a melhor campanha'],
      escudos: ['vilanova', 'fortaleza'] },

    // "Rodamos aqui no nosso simulador"
    { tipo: 'barras', em: 39.95, selo: 'chance de subir', titulo: 'pelo modelo do simulador',
      itens: [
        { t: 'vilanova', valor: 58.3, cor: 'var(--ouro)', em: 42.9 },       // "o Vila Nova sobe 58%"
        { t: 'atleticogo', valor: 41.7, cor: 'var(--z-pre)', em: 43.1 },
        { t: 'fortaleza', valor: 66.4, cor: 'var(--ouro)', em: 45.25 },     // "e o Fortaleza é o mais favorito"
        { t: 'criciuma', valor: 33.6, cor: 'var(--z-pre)', em: 45.45 },
      ] },

    // "E olha isso: ... uma em cada cinco simulações"
    { tipo: 'numero', em: 58.2, valor: 1, sufixo: 'em cada 5', titulo: ['simulações termina empatada', 'e vai pro critério de desempate'] },

    // "Então lá embaixo foi um drama"
    { tipo: 'placar', em: 66.7, selo: 'lá embaixo', h: 'crb', a: 'ceara', gh: 1, ga: 1, rotulo: 'fim de jogo · 38ª rodada', chip: 'Ceará se salva',
      titulo: ['o Avaí venceu', 'e caiu por um ponto'], info: ['Ceará 44 pts', 'Avaí 43 pts'] },

    // "Então comenta aí quem você acha que vai subir, e faz sua simulação no tapanagaveta.com.br" ... "Valeu demais"
    { tipo: 'fecho', em: 82.0, texto: 'quem sobe? comenta aí e faça a sua simulação' },
  ],
});

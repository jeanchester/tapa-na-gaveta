/* "Mata-mata na Série B, e sem pênalti" · números do modelo do site em 15/11/2026 (retrato da Série B com as 38 rodadas).
   Chance de subir: ida e volta com as probabilidades de placar do modelo; agregado empatado = sobe a melhor campanha.

   FALA (cerca de 50 s):
   Pela primeira vez desde 2002, a Série B vai ter mata-mata. E não tem pênalti.
   O Novorizontino foi campeão pela primeira vez e subiu junto com o Juventude. Esses dois já estão na Série A.
   As outras duas vagas saem do playoff: Vila Nova contra Atlético-GO, clássico goiano, e Fortaleza contra Criciúma.
   Ida no sábado, dia 21, volta no dia 28. E o detalhe tá aqui: se o agregado empatar, sobe quem fez a melhor campanha.
   Vila Nova e Fortaleza jogam pelo empate e ainda decidem em casa.
   Rodei no simulador do Tapa na Gaveta: o Vila Nova sobe em 58% das vezes. O Fortaleza é mais favorito, 66%.
   E olha isso: em um de cada cinco confrontos o agregado termina igual. Quer dizer, é o regulamento que decide.
   Lá embaixo foi drama: o Avaí venceu o América e caiu mesmo assim. O Ceará empatou com o CRB com um a menos
   e se salvou por um ponto.
   Quem sobe? Comenta aí. E simula a reta final da Série A no tapanagaveta.com.br.

   Os "em" estão em segundos estimados. Depois de gravar, preencha o T (legendas.py) e troque pelas palavras
   do comentário de cada cena. */
ROTEIRO({
  nome: '2026-11-15-serie-b-playoffs',
  estado: 'série b',
  inicio: 0,
  duracao: 54,
  zonas: { lib: [1, 2], pre: [3, 6], rb: [17, 20] },
  faixa: ['tapa na gaveta', 'série b 2026', 'playoff do acesso', '<b>tapanagaveta.com.br</b>'],
  T: [],
  cenas: [
    // 'primeira'
    { tipo: 'abertura', em: 0, selo: 'primeira vez desde 2002', titulo: ['mata-mata na Série B', 'e sem pênalti'],
      escudos: ['vilanova', 'atleticogo', 'fortaleza', 'criciuma'] },

    // 'Novorizontino'
    { tipo: 'tabela', em: 5, titulo: 'como terminou lá em cima', eu: 'novorizontino', corte: 6, textoCorte: 'fora do playoff',
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

    // 'outras'
    { tipo: 'jogos', em: 12.5, selo: 'playoff do acesso', titulo: 'ida dia 21, volta dia 28',
      lista: [
        { h: 'atleticogo', a: 'vilanova', quando: 'ida · 21/11', p: [47.1, 30.0, 22.9] },
        { h: 'vilanova', a: 'atleticogo', quando: 'volta · 28/11', p: [45.0, 29.9, 25.0] },
        { h: 'criciuma', a: 'fortaleza', quando: 'ida · 21/11', p: [37.8, 33.3, 28.9] },
        { h: 'fortaleza', a: 'criciuma', quando: 'volta · 28/11', p: [47.3, 30.2, 22.5] },
      ] },

    // 'agregado'
    { tipo: 'abertura', em: 21, selo: 'a regra', titulo: ['empatou no agregado?', 'sobe a melhor campanha'],
      escudos: ['vilanova', 'fortaleza'] },

    // 'rodei'
    { tipo: 'barras', em: 29, selo: 'chance de subir', titulo: 'pelo modelo do simulador',
      itens: [
        { t: 'vilanova', valor: 58.3, cor: 'var(--ouro)' },
        { t: 'atleticogo', valor: 41.7, cor: 'var(--z-pre)' },
        { t: 'fortaleza', valor: 66.4, cor: 'var(--ouro)' },
        { t: 'criciuma', valor: 33.6, cor: 'var(--z-pre)' },
      ] },

    // 'cinco'
    { tipo: 'numero', em: 36, valor: 1, sufixo: 'em cada 5', titulo: ['confrontos termina empatado', 'e o regulamento decide'] },

    // 'drama'
    { tipo: 'placar', em: 41, selo: 'lá embaixo', h: 'crb', a: 'ceara', gh: 1, ga: 1, rotulo: 'fim de jogo · 38ª rodada', chip: 'Ceará se salva',
      titulo: ['o Avaí venceu', 'e caiu por um ponto'], info: ['Ceará 44 pts', 'Avaí 43 pts'] },

    // 'comenta'
    { tipo: 'fecho', em: 49.5, texto: 'quem sobe? simule a reta final da Série A' },
  ],
});

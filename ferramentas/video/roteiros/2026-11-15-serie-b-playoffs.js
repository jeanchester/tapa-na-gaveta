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

   Gravação: IMG_5968.mov (Jean, 15/11). O T abaixo foi ESTIMADO pelas pausas da fala (sem transcrição automática):
   as frases foram encaixadas nas pausas e as palavras repartidas por sílaba. Com o .srt do CapCut/TikTok,
   rode legendas.py e troque o T para ficar exato. */
ROTEIRO({
  nome: '2026-11-15-serie-b-playoffs',
  estado: 'série b',
  inicio: 1.6,
  duracao: 98,
  zonas: { lib: [1, 2], pre: [3, 6], rb: [17, 20] },
  faixa: ['tapa na gaveta', 'série b 2026', 'playoff do acesso', '<b>tapanagaveta.com.br</b>'],
  T: [
    ['Pela', 0.49], ['primeira', 0.76], ['vez', 1.17], ['desde', 1.3], ['dois', 1.58], ['mil', 1.71], ['e', 1.85], ['dois', 1.98],
    ['a', 2.12], ['Série', 2.26], ['B', 2.53], ['vai', 2.66], ['ter', 2.8], ['mata-mata', 2.93], ['E', 3.77], ['não', 4.75],
    ['tem', 5.74], ['pênalti', 6.72], ['O', 10.22], ['Novorizontino', 10.33], ['foi', 11.01], ['campeão', 11.12], ['pela', 11.86], ['primeira', 12.09],
    ['vez', 12.42], ['e', 12.53], ['subiu', 12.65], ['junto', 12.87], ['com', 13.1], ['o', 13.21], ['Juventude', 13.32], ['Esses', 14.1],
    ['dois', 14.74], ['já', 15.07], ['estão', 15.39], ['na', 16.03], ['Série', 16.65], ['A', 17.29], ['As', 18.14], ['outras', 18.36],
    ['duas', 19.36], ['vagas', 19.58], ['saem', 20.02], ['do', 20.24], ['playoff', 20.46], ['Vila', 20.9], ['Nova', 21.35], ['contra', 21.79],
    ['Atlético', 22.38], ['Goianiense', 23.67], ['clássico', 24.34], ['goiano', 25.0], ['e', 25.44], ['Fortaleza', 25.66], ['contra', 27.12], ['Criciúma', 27.56],
    ['Ida', 28.5], ['no', 28.98], ['sábado', 29.22], ['dia', 29.94], ['vinte', 30.19], ['e', 30.67], ['um', 30.91], ['volta', 31.15],
    ['no', 31.63], ['dia', 31.88], ['vinte', 32.12], ['e', 32.6], ['oito', 32.84], ['E', 33.78], ['o', 34.0], ['detalhe', 34.21],
    ['tá', 34.86], ['aqui', 35.08], ['se', 35.51], ['o', 35.73], ['agregado', 35.94], ['empatar', 36.81], ['sobe', 37.46], ['quem', 37.89],
    ['fez', 38.11], ['a', 38.33], ['melhor', 38.54], ['campanha', 38.98], ['Vila', 40.22], ['Nova', 40.44], ['e', 40.66], ['Fortaleza', 40.77],
    ['jogam', 41.2], ['pelo', 41.42], ['empate', 41.64], ['e', 41.96], ['ainda', 42.07], ['decidem', 42.29], ['em', 42.62], ['casa', 42.73],
    ['Rodei', 43.37], ['no', 44.0], ['simulador', 44.32], ['do', 45.58], ['Tapa', 45.9], ['na', 46.53], ['Gaveta', 46.84], ['o', 47.79],
    ['Vila', 48.11], ['Nova', 48.74], ['sobe', 50.06], ['em', 50.69], ['cinquenta', 51.01], ['e', 51.96], ['oito', 52.27], ['por', 53.38],
    ['cento', 53.7], ['das', 56.88], ['vezes', 57.19], ['O', 58.46], ['Fortaleza', 58.61], ['é', 59.18], ['mais', 59.32], ['favorito', 59.46],
    ['sessenta', 60.03], ['e', 60.46], ['seis', 60.6], ['por', 60.74], ['cento', 60.88], ['E', 61.43], ['olha', 61.68], ['isso', 62.2],
    ['em', 62.72], ['um', 62.98], ['de', 63.24], ['cada', 63.5], ['cinco', 64.02], ['confrontos', 64.54], ['o', 66.01], ['agregado', 66.97],
    ['termina', 68.01], ['igual', 68.79], ['Quer', 69.46], ['dizer', 69.63], ['é', 69.97], ['o', 70.15], ['regulamento', 70.32], ['que', 71.18],
    ['decide', 71.35], ['Lá', 73.01], ['embaixo', 73.3], ['foi', 74.16], ['drama', 74.44], ['o', 75.02], ['Avaí', 75.3], ['venceu', 75.87],
    ['o', 76.45], ['América', 76.73], ['e', 78.48], ['caiu', 78.76], ['mesmo', 79.05], ['assim', 79.62], ['O', 82.27], ['Ceará', 82.41],
    ['empatou', 82.68], ['com', 83.08], ['o', 83.22], ['CRB', 83.35], ['com', 83.49], ['um', 83.62], ['a', 83.76], ['menos', 83.89],
    ['e', 84.16], ['se', 84.3], ['salvou', 84.44], ['por', 84.71], ['um', 84.84], ['ponto', 84.98], ['Quem', 85.44], ['sobe', 85.81],
    ['Comenta', 86.55], ['aí', 87.67], ['E', 88.67], ['simula', 88.94], ['a', 89.75], ['reta', 90.02], ['final', 90.56], ['da', 91.1],
    ['Série', 91.38], ['A', 91.92], ['no', 92.19], ['tapanagaveta', 92.46], ['ponto', 95.23], ['com', 95.77], ['ponto', 96.49], ['br', 97.03],
  ],
  cenas: [
    { tipo: 'abertura', em: 0, selo: 'primeira vez desde 2002', titulo: ['mata-mata na Série B', 'e sem pênalti'],
      escudos: ['vilanova', 'atleticogo', 'fortaleza', 'criciuma'] },

    { tipo: 'tabela', em: 'Novorizontino', titulo: 'como terminou lá em cima', eu: 'novorizontino', corte: 6, textoCorte: 'fora do playoff',
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

    { tipo: 'jogos', em: 'outras', selo: 'playoff do acesso', titulo: 'ida dia 21, volta dia 28',
      lista: [
        { h: 'atleticogo', a: 'vilanova', quando: 'ida · 21/11', p: [47.1, 30.0, 22.9] },
        { h: 'vilanova', a: 'atleticogo', quando: 'volta · 28/11', p: [45.0, 29.9, 25.0] },
        { h: 'criciuma', a: 'fortaleza', quando: 'ida · 21/11', p: [37.8, 33.3, 28.9] },
        { h: 'fortaleza', a: 'criciuma', quando: 'volta · 28/11', p: [47.3, 30.2, 22.5] },
      ] },

    { tipo: 'abertura', em: 'agregado', selo: 'a regra', titulo: ['empatou no agregado?', 'sobe a melhor campanha'],
      escudos: ['vilanova', 'fortaleza'] },

    { tipo: 'barras', em: 'Rodei', selo: 'chance de subir', titulo: 'pelo modelo do simulador',
      itens: [
        { t: 'vilanova', valor: 58.3, cor: 'var(--ouro)', em: 'cinquenta' },
        { t: 'atleticogo', valor: 41.7, cor: 'var(--z-pre)', em: 'cinquenta' },
        { t: 'fortaleza', valor: 66.4, cor: 'var(--ouro)', em: 'Fortaleza#3' },
        { t: 'criciuma', valor: 33.6, cor: 'var(--z-pre)', em: 'Fortaleza#3' },
      ] },

    { tipo: 'numero', em: 'olha', valor: 1, sufixo: 'em cada 5', titulo: ['confrontos termina empatado', 'e o regulamento decide'] },

    { tipo: 'placar', em: 'drama', selo: 'lá embaixo', h: 'crb', a: 'ceara', gh: 1, ga: 1, rotulo: 'fim de jogo · 38ª rodada', chip: 'Ceará se salva',
      titulo: ['o Avaí venceu', 'e caiu por um ponto'], info: ['Ceará 44 pts', 'Avaí 43 pts'] },

    { tipo: 'fecho', em: 'Quem#2', texto: 'quem sobe? simule a reta final da Série A' },
  ],
});

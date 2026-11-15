/* Exemplo: "Dois desses cinco vão cair" (números do modelo do site em 15/11/2026, depois de Chape 0×2 Vasco).
   Sem voz gravada ainda, então os tempos estão em segundos. Com a voz, preencha T e troque os "em" por palavras.
   Copie este arquivo para roteiros/AAAA-MM-DD-assunto.js e edite. Guia: .claude/skills/video-tiktok/SKILL.md */
ROTEIRO({
  nome: 'exemplo-degola',
  estado: 'degola',              // palavra do canto direito do cabeçalho
  inicio: 0,                     // segundos cortados do começo da gravação (a fala do T conta a partir daqui)
  duracao: 37,
  T: [],                         // [['palavra', segundos], ...] tirado da fala (veja legendas.py)
  cenas: [
    { tipo: 'abertura', em: 0, selo: 'faltam 4 rodadas', titulo: ['dois desses cinco', 'vão cair'],
      escudos: ['gremio', 'vitoria', 'corinthians', 'internacional', 'mirassol'] },

    { tipo: 'tabela', em: 3.2, titulo: 'como está a parte de baixo', eu: 'corinthians', corte: 5, textoCorte: 'z4',
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

    { tipo: 'barras', em: 9.5, selo: 'chance de cair hoje', titulo: 'pelo modelo do simulador',
      itens: [
        { t: 'gremio', valor: 51.7, cor: 'var(--z-rb)' },
        { t: 'vitoria', valor: 46.3, cor: 'var(--z-rb)' },
        { t: 'corinthians', valor: 44.4, cor: 'var(--z-rb)' },
        { t: 'internacional', valor: 35.0, cor: 'var(--z-rb)' },
        { t: 'mirassol', valor: 17.4, cor: 'var(--z-pre)' },
      ] },

    { tipo: 'jogos', em: 17, selo: '35ª rodada', titulo: 'os jogos que decidem',
      lista: [
        { h: 'gremio', a: 'bahia', quando: 'qua 21h30', p: [36.2, 27.8, 36.0] },
        { h: 'corinthians', a: 'botafogo', quando: 'qua 21h30', p: [40.1, 28.9, 31.0] },
        { h: 'vasco', a: 'internacional', quando: 'qui 19h30', p: [49.1, 27.3, 23.6] },
        { h: 'vitoria', a: 'bragantino', quando: 'qui 19h30', p: [31.5, 30.0, 38.5] },
      ] },

    { tipo: 'barras', em: 24.5, escudo: 'corinthians', titulo: ['chance do Timão cair', 'depois de quarta'],
      itens: [
        { rotulo: 'se ganhar', valor: 22.9, cor: 'var(--ok)' },
        { rotulo: 'se empatar', valor: 52.4, cor: 'var(--empate)' },
        { rotulo: 'se perder', valor: 64.5, cor: 'var(--z-rb)' },
      ] },

    { tipo: 'fecho', em: 32, texto: 'simule a reta final do seu time' },
  ],
});

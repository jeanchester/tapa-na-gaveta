/* Elencos para a aba "Monte sua escalação" (dados do Você Escala).
   Fontes (repositório público do Julio, CORS liberado):
     elencos.json            → clubes, por id do time, posições em inglês
     elencos_copa_2026.json  → 48 seleções da Copa de 2026, nomes em inglês, posições em português
   times-voce-escala.json   → nomes, ids e cores dos times (base.json do Você Escala)
   converter() junta tudo num formato compacto. O mesmo código roda no navegador (dados ao vivo) e
   no Node (node tools/elencos.js gera a reserva publicada com o site, dados/elencos-escalacao.json). */
(function (raiz, fabrica) {
  'use strict';
  const api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.TNGElencos = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const URLS = {
    clubes: 'https://raw.githubusercontent.com/jujubs333/futebol-elencos/main/data/elencos.json',
    copa: 'https://raw.githubusercontent.com/jujubs333/futebol-elencos/main/data/elencos_copa_2026.json',
  };
  const POS = { goalkeeper: 'G', goleiro: 'G', defender: 'D', defensor: 'D', midfielder: 'M', meia: 'M', meio: 'M', attacker: 'A', atacante: 'A', forward: 'A' };
  const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  // nome normalizado → arquivo em midia/escudos (só as exceções; o resto é o próprio nome)
  const ESCUDO = {
    saopaulo: 'sp', atleticomineiro: 'atleticomg', athleticoparanaense: 'athletico', vascodagama: 'vasco', americamineiro: 'americamg',
    atleticogoianiense: 'atleticogo', sportrecife: 'sport', operariopr: 'operario', athleticclub: 'athleticbr', athletic: 'athleticbr',
    redbullbragantino: 'bragantino', coreiadosul: 'coreia', arabiasaudita: 'arabia', africadosul: 'africa_do_sul', caboverde: 'cabo_verde',
    costadomarfim: 'marfim', novazelandia: 'nova_zelandia', republicatcheca: 'republica_tcheca', tchequia: 'republica_tcheca',
    bosniaeherzegovina: 'bosnia', chequia: 'republica_tcheca', rdcongo: 'congo', republicademocraticadocongo: 'congo', estadosunidos: 'eua',
  };
  // grupos do seletor (do times.csv do Você Escala)
  const SERIE_A = ['athleticoparanaense', 'atleticomineiro', 'bahia', 'botafogo', 'bragantino', 'chapecoense', 'corinthians', 'coritiba', 'cruzeiro', 'flamengo', 'fluminense', 'gremio', 'internacional', 'mirassol', 'palmeiras', 'remo', 'santos', 'saopaulo', 'vascodagama', 'vitoria'];

  function escudoDe(nome, existentes) {
    const n = norm(nome), k = ESCUDO[n] || n;
    if (!existentes) return k;
    if (existentes[k]) return k;
    const comTraco = nome && norm(nome) && String(nome).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '_');
    return existentes[comTraco] ? comTraco : null;
  }

  // base: times-voce-escala.json; clubes/copa: os JSON do GitHub; existentes: { arquivoDoEscudo: 1 }
  function converter(base, clubes, copa, existentes) {
    const porId = {};
    base.times.forEach((t) => { porId[String(t.id)] = t; });
    const times = [];
    Object.keys((clubes && clubes.elencos) || {}).forEach((id) => {
      const t = porId[id], lista = clubes.elencos[id];
      if (!t || !Array.isArray(lista) || !lista.length) return;
      times.push({
        id: 'c' + id, nome: t.nome, cor: t.cor, cor2: t.corSecundaria, escudo: escudoDe(t.nome, existentes),
        grupo: SERIE_A.indexOf(norm(t.nome)) >= 0 ? 'Série A' : 'Outros clubes',
        jogadores: lista.map((p) => [String(p.nome || '').trim(), POS[norm(p.posicao)] || 'M', p.numero || null]).filter((p) => p[0]),
      });
    });
    // seleções: id do Você Escala → nome em inglês (mapaIdsCopa) → time da lista da FIFA
    const ingles = {};
    Object.keys(base.mapaIdsCopa || {}).forEach((id) => { ingles[norm(base.mapaIdsCopa[id])] = id; });
    ((copa && copa.teams) || []).forEach((sel) => {
      const id = ingles[norm(sel.team)] || ingles[norm(sel.fifa_team_name)];
      const t = id && porId[id];
      if (!t) return;
      times.push({
        id: 's' + id, nome: t.nome, cor: t.cor, cor2: t.corSecundaria, escudo: escudoDe(t.nome, existentes), grupo: 'Copa do Mundo 2026',
        jogadores: (sel.players || []).map((p) => [String(p.name || '').trim(), POS[norm(p.position)] || 'M', p.number || null]).filter((p) => p[0]),
      });
    });
    const ordemGrupo = { 'Série A': 0, 'Copa do Mundo 2026': 1, 'Outros clubes': 2 };
    times.sort((a, b) => (ordemGrupo[a.grupo] - ordemGrupo[b.grupo]) || a.nome.localeCompare(b.nome, 'pt-BR'));
    return { atualizado: (clubes && clubes.ultima_atualizacao) || null, times };
  }

  function comTempo(p, ms) { return Promise.race([p, new Promise((_, f) => setTimeout(() => f(new Error('tempo esgotado')), ms))]); }

  // ao vivo: baixa os dois arquivos e converte (precisa da base e da lista de escudos da reserva)
  function atualizar(base, existentes, opts) {
    const f = (opts && opts.fetch) || ((u) => fetch(u));
    const json = (u) => f(u).then((r) => { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); });
    return comTempo(Promise.all([json(URLS.clubes), json(URLS.copa)]), (opts && opts.tempo) || 10000)
      .then(([clubes, copa]) => converter(base, clubes, copa, existentes));
  }

  return { URLS, converter, atualizar, escudoDe, norm };
});

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

  // ------------------------------------------------------------------ cruzamento com a ESPN
  // Nos clubes da Série A, a lista final sai do elenco da ESPN (dados/elencos-espn.json, baixado
  // pelo robô de dados): quem não está mais no clube some, e quem é da base e nunca jogou o
  // Brasileirão fica de fora (sobra quem jogou, quem já estava no Você Escala com camisa até 35 e
  // pelo menos 3 goleiros). Nome, posição e número vêm da ESPN; o nome do Você Escala só fica
  // quando o da ESPN é longo demais ("Lucas Emanuel Jales Do Nascimento").
  const toks = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/).filter(Boolean);
  function distancia(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 3;
    const d = []; for (let i = 0; i <= a.length; i++) d.push([i]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  // grau de parecença entre o nome do Você Escala e um jogador da ESPN (0 = nada; 3 = idêntico)
  function parecenca(nome, e) {
    const a = toks(nome), b = toks(e.n), c = toks(e.curto);
    if (!a.length || !b.length) return 0;
    const A = a.join(' '), B = b.join(' ');
    if (A === B || A === c.join(' ')) return 3;
    if (A.length >= 6 && distancia(A, B) <= 2) return 2;                       // Mateuzinho / Matheuzinho
    const la = a.filter((x) => x.length > 2), lb = b.filter((x) => x.length > 2);
    if (la.length && la.every((x) => b.indexOf(x) >= 0)) return 1;            // "Danilo" em "Danilo Barbosa"
    if (lb.length && lb.every((x) => a.indexOf(x) >= 0)) return 1;
    if (a[a.length - 1] === b[b.length - 1] && a[a.length - 1].length > 2 && a[0][0] === b[0][0]) return 1;   // "E. Pulgar"
    return 0;
  }
  function cruzarEspn(dados, espn) {
    if (!dados || !espn || !espn.times) return dados;
    dados.times.forEach((t) => {
      const E = t.grupo === 'Série A' && espn.times[t.escudo];
      if (!E || E.length < 18) return;                       // elenco da ESPN incompleto: fica o do Você Escala
      // casa cada jogador do Você Escala com o mais parecido da ESPN (o mais forte primeiro)
      const pares = [];
      t.jogadores.forEach((v, iv) => E.forEach((e, ie) => {
        const g = parecenca(v[0], e);
        if (g) pares.push({ iv, ie, g: g + (v[2] != null && v[2] === e.num ? 0.5 : 0) });
      }));
      pares.sort((x, y) => y.g - x.g);
      const doVE = {}, usadoVE = {};
      pares.forEach((p) => {
        if (doVE[p.ie] != null || usadoVE[p.iv]) return;
        // empate entre dois da ESPN com o mesmo grau: ambíguo, não casa
        if (pares.some((q) => q !== p && q.iv === p.iv && q.g === p.g && doVE[q.ie] == null)) return;
        doVE[p.ie] = p.iv; usadoVE[p.iv] = 1;
      });
      const fica = E.map((e, ie) => ({ e, v: doVE[ie] != null ? t.jogadores[doVE[ie]] : null }))
        .filter((x) => x.e.jogos > 0 || (x.v && x.e.num != null && x.e.num <= 35));
      // pelo menos 3 goleiros: os que já estavam no Você Escala primeiro, depois a camisa mais baixa
      const extras = E.map((e, ie) => ({ e, v: doVE[ie] != null ? t.jogadores[doVE[ie]] : null }))
        .filter((x) => x.e.pos === 'G' && fica.every((f) => f.e !== x.e))
        .sort((x, y) => (y.v ? 1 : 0) - (x.v ? 1 : 0) || (x.e.num == null ? 999 : x.e.num) - (y.e.num == null ? 999 : y.e.num));
      while (fica.filter((x) => x.e.pos === 'G').length < 3 && extras.length) fica.push(extras.shift());
      const ORD = { G: 0, D: 1, M: 2, A: 3 };
      t.jogadores = fica.map((x) => {
        const longo = toks(x.e.n).length >= 4 && x.v && !/[ÃÂ]/.test(x.v[0]);
        return [longo ? x.v[0] : x.e.n, x.e.pos, x.e.num != null ? x.e.num : (x.v ? x.v[2] : null)];
      }).sort((a, b) => ORD[a[1]] - ORD[b[1]]);
      t.fonte = 'espn';
    });
    dados.espn = espn.atualizado || null;
    if (espn.atualizado && espn.atualizado > (dados.atualizado || '')) dados.atualizado = espn.atualizado;
    return dados;
  }

  return { URLS, converter, atualizar, escudoDe, norm, cruzarEspn, parecenca };
});

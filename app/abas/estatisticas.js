/* Aba Estatísticas (primeira versão): tudo calculado a partir dos resultados dos jogos (os mesmos
   dados do simulador: ESPN → cache do aparelho → retrato publicado). Sem fonte nova, sem número
   que não dê para conferir na tabela. */
(function () {
  'use strict';
  const T = window.TNG;
  const { esc, loadJson, KEY } = T;
  const CURTO = { athletico: 'Athletico', atleticomg: 'Atlético-MG', bragantino: 'Bragantino', sp: 'São Paulo', vasco: 'Vasco' };
  const nome = (t) => CURTO[t.slug] || t.nome;
  const crest = (t) => (t.escudo ? '<img class="crest" src="midia/escudos/' + esc(t.escudo) + '.png" alt="" width="24" height="24" loading="lazy">'
    : '<span class="crest disco" aria-hidden="true">' + esc(String(t.abrev || t.nome || '?').slice(0, 3)) + '</span>');
  const pct = (x) => Math.round(x * 100) + '%';
  const dec = (x) => x.toFixed(2).replace('.', ',');

  // competições com dados publicados (as mesmas do simulador)
  let comps = null;
  function carregarComps() {
    if (comps) return Promise.resolve(comps);
    return fetch('shared/competicoes.json').then((r) => r.json()).then((c) => Promise.all(c.lista.map((x) => (x.id === 'seriea' ? true
      : fetch(x.dados, { method: 'HEAD' }).then((r) => r.ok, () => false)))).then((ok) => (comps = c.lista.filter((x, k) => ok[k]))));
  }
  function dados(comp) {
    return Promise.all([T.script('shared/simulador-core.js'), fetch(comp.dados).then((r) => r.json()), fetch(comp.regras).then((r) => r.json())]).then(([, base, regras]) => {
      const cache = loadJson(comp.id === 'seriea' ? KEY.espnCache : KEY.espnCache + '.' + comp.id, null);
      const liga = cache && cache.liga && cache.liga.temporada === base.temporada && cache.liga.baixado_em > base.baixado_em ? cache.liga : base;
      return window.TNGCore.preparar(liga, regras);
    });
  }

  function calcular(L) {
    const n = L.n, feitos = L.jogos.filter((j) => j.feito);
    const s = L.times.map((t) => ({ t, casa: { j: 0, pts: 0, gp: 0, gc: 0 }, fora: { j: 0, pts: 0, gp: 0, gc: 0 }, seq: [] }));
    let gols = 0, vm = 0, emp = 0, maior = null, maisGols = null;
    feitos.forEach((j) => {
      const h = s[j.h], a = s[j.a], ph = j.gh > j.ga ? 3 : j.gh === j.ga ? 1 : 0, pa = j.gh < j.ga ? 3 : j.gh === j.ga ? 1 : 0;
      h.casa.j++; h.casa.pts += ph; h.casa.gp += j.gh; h.casa.gc += j.ga;
      a.fora.j++; a.fora.pts += pa; a.fora.gp += j.ga; a.fora.gc += j.gh;
      h.seq.push(ph === 3 ? 'V' : ph ? 'E' : 'D'); a.seq.push(pa === 3 ? 'V' : pa ? 'E' : 'D');
      if (j.ga === 0) h.limpo = (h.limpo || 0) + 1;
      if (j.gh === 0) a.limpo = (a.limpo || 0) + 1;
      if (j.gh === 0) h.zerado = (h.zerado || 0) + 1;
      if (j.ga === 0) a.zerado = (a.zerado || 0) + 1;
      gols += j.gh + j.ga; if (j.gh > j.ga) vm++; else if (j.gh === j.ga) emp++;
      const dif = Math.abs(j.gh - j.ga), tot = j.gh + j.ga;
      if (!maior || dif > maior.dif || (dif === maior.dif && tot > maior.tot)) maior = { j, dif, tot };
      if (!maisGols || tot > maisGols.tot) maisGols = { j, tot };
    });
    s.forEach((x) => {
      // sequências atuais, do jogo mais recente para trás
      const r = x.seq.slice().reverse();
      const conta = (ok) => { let k = 0; while (k < r.length && ok(r[k])) k++; return k; };
      x.invicto = conta((c) => c !== 'D'); x.semVencer = conta((c) => c !== 'V'); x.vitorias = conta((c) => c === 'V');
      const u5 = x.seq.slice(-5); x.forma5 = u5.reduce((a, c) => a + (c === 'V' ? 3 : c === 'E' ? 1 : 0), 0); x.u5 = u5;
      x.total = { j: x.casa.j + x.fora.j, gp: x.casa.gp + x.fora.gp, gc: x.casa.gc + x.fora.gc };
      x.v = x.seq.filter((c) => c === 'V').length; x.e = x.seq.filter((c) => c === 'E').length; x.d = x.seq.filter((c) => c === 'D').length;
      x.limpo = x.limpo || 0; x.zerado = x.zerado || 0;
    });
    return { s, n: feitos.length, gols, vm, emp, maior, maisGols };
  }

  function placar(L, j) {
    const h = L.times[j.h], a = L.times[j.a];
    return '<span class="pl-jogo">' + crest(h) + esc(nome(h)) + ' <b class="num">' + j.gh + ' × ' + j.ga + '</b> ' + esc(nome(a)) + crest(a) + '</span>';
  }

  // pódio: os três primeiros de um critério (empate no valor fica na mesma posição)
  function podio(titulo, lista, valor, rotulo) {
    const top = lista.slice(0, 3);
    return '<div class="podio"><h3>' + esc(titulo) + '</h3><ol>' + top.map((x, k) =>
      '<li' + (k === 0 ? ' class="um"' : '') + '>' + crest(x.t) + '<span>' + esc(nome(x.t)) + '</span><b class="num">' + valor(x) + '</b></li>').join('') + '</ol>' +
      (rotulo ? '<small>' + esc(rotulo) + '</small>' : '') + '</div>';
  }
  // artilheiros e garçons: 10 primeiros, "ver todos" e filtro por time
  const vj = { time: '', todos: {} };
  function jogadoresHtml(J, L) {
    if (!J) return '';
    const porEscudo = {}, porId = {};
    L.times.forEach((t) => { porEscudo[t.escudo] = t; porId[t.id] = t; });
    const timeDe = (x) => porEscudo[x.escudo] || porId[x.time];
    const lista = (chave, titulo, xs, unid) => {
      xs = (xs || []).slice();
      if (vj.time) {
        xs = xs.filter((x) => { const t = timeDe(x); return t && t.slug === vj.time; });
        // artilharia por time: completa com todos os autores de gol daquele time
        if (chave === 'art' && J.gols_por_jogador) {
          const ja = {};
          xs.forEach((x) => { ja[x.nome] = 1; });
          J.gols_por_jogador.forEach((x) => { const t = timeDe(x); if (t && t.slug === vj.time && !ja[x.nome]) xs.push(x); });
          xs.sort((a, b) => b.n - a.n);
        }
      }
      if (!xs.length) return vj.time ? '<section class="ranking-j"><div class="sec-title"><h2>' + titulo + '</h2></div><p class="nota">Ninguém deste time na lista.</p></section>' : '';
      const todos = vj.todos[chave] || vj.time, mostra = todos ? xs : xs.slice(0, 10);
      let pos = 0, ant = null;
      return '<section class="ranking-j"><div class="sec-title"><h2>' + titulo + '</h2></div><ol>' + mostra.map((x, k) => {
        if (x.n !== ant) { pos = k + 1; ant = x.n; }
        const t = timeDe(x);
        return '<li' + (pos === 1 ? ' class="um"' : '') + '><span class="rk">' + pos + '</span>' + (t ? crest(t) : '<i class="crest"></i>') + '<span class="rk-nome"><b>' + esc(x.nome) + '</b><small>' + esc(t ? nome(t) : '') + '</small></span><b class="num">' + x.n + '</b><small class="rk-u">' + (x.n === 1 ? unid[0] : unid[1]) + '</small></li>';
      }).join('') + '</ol>' + (!vj.time && xs.length > 10 ? '<button class="link-btn mais-j" data-mais="' + chave + '">' + (vj.todos[chave] ? 'Ver só os 10 primeiros' : 'Ver todos (' + xs.length + ')') + '</button>' : '') + '</section>';
    };
    const html = lista('art', 'Artilheiros', J.artilheiros, ['gol', 'gols']) + lista('ass', 'Garçons', J.assistencias, ['assist.', 'assist.']);
    if (!html && !vj.time) return '';
    const opcoes = L.times.slice().sort((a, b) => nome(a).localeCompare(nome(b), 'pt-BR'));
    return '<div id="jogadores"><label class="btn sel-time filtro-j"><select data-jt aria-label="Filtrar por time"><option value="">Todos os times</option>' +
      opcoes.map((t) => '<option value="' + esc(t.slug) + '"' + (vj.time === t.slug ? ' selected' : '') + '>' + esc(nome(t)) + '</option>').join('') + '</select></label>' +
      '<div class="est-cols jogadores">' + html + '</div></div>';
  }

  // Prêmio ESPN Bola de Prata (dados/bola-de-prata.json, preenchido à mão)
  function bolaDePrataHtml(B, L) {
    if (!B || !B.selecao || !B.selecao.length) return '';
    const porEscudo = {};
    L.times.forEach((t) => { porEscudo[t.escudo] = t; });
    const linha = (x) => { const t = porEscudo[x.escudo]; return '<li><span class="bp-pos">' + esc(x.posicao) + '</span>' + (t ? crest(t) : '') + '<b>' + esc(x.nome) + '</b><small>' + esc(t ? nome(t) : (x.clube || '')) + '</small></li>'; };
    const ouro = B.bola_de_ouro;
    return '<div class="sec-title"><h2>Bola de Prata</h2><small>seleção provisória' + (B.apos_rodada ? ' após a ' + B.apos_rodada + 'ª rodada' : '') + ' · ESPN</small></div>' +
      (ouro ? '<div class="bp-ouro">' + (porEscudo[ouro.escudo] ? crest(porEscudo[ouro.escudo]) : '') + '<div><small>Bola de Ouro (líder)</small><b>' + esc(ouro.nome) + '</b>' + (ouro.media ? '<span>nota média ' + esc(String(ouro.media).replace('.', ',')) + '</span>' : '') + '</div></div>' : '') +
      '<ul class="bp-lista">' + B.selecao.map(linha).join('') + (B.tecnico ? linha(Object.assign({ posicao: 'Técnico' }, B.tecnico)) : '') + '</ul>' +
      (B.fonte ? '<p class="nota">Fonte: <a href="' + esc(B.fonte) + '" target="_blank" rel="noopener">Prêmio ESPN Bola de Prata</a></p>' : '');
  }

  function barra(v, max) { return '<i class="bar" style="--w:' + Math.round(100 * v / max) + '%"></i>'; }

  T.aba('estatisticas', {
    titulo: 'Estatísticas do Brasileirão 2026',
    descricao: 'Campanhas em casa e fora, ataque e defesa, sequências e forma dos times do Brasileirão 2026.',
    render(view, params) {
      return carregarComps().then((cs) => {
      const comp = cs.find((c) => c.id === params[0]) || cs[0];
      const ehA = comp.id === 'seriea';
      const J = fetch(comp.jogadores).then((r) => (r.ok ? r.json() : null)).catch(() => null);
      const BP = ehA ? fetch('dados/bola-de-prata.json').then((r) => (r.ok ? r.json() : null)).catch(() => null) : Promise.resolve(null);
      vj.time = ''; vj.todos = {};
      return Promise.all([dados(comp), J, BP]).then(([L, jog, bp]) => {
        document.title = 'Estatísticas · ' + comp.rotulo + ' · Tapa na Gaveta';
        const chips = cs.length > 1 ? '<nav class="comp-sel claro" aria-label="Competição">' + cs.map((c) => '<a href="#/estatisticas' + (c.id === 'seriea' ? '' : '/' + c.id) + '"' + (c.id === comp.id ? ' aria-current="page"' : '') + '>' + esc(c.curto) + '</a>').join('') + '</nav>' : '';
        const rotaSim = '#/simulador' + (ehA ? '' : '/' + comp.id);
        const E = calcular(L);
        const casaFora = E.s.slice().sort((a, b) => (b.casa.pts / Math.max(1, b.casa.j)) - (a.casa.pts / Math.max(1, a.casa.j)));
        const atq = E.s.slice().sort((a, b) => b.total.gp / b.total.j - a.total.gp / a.total.j);
        const forma = E.s.slice().sort((a, b) => b.forma5 - a.forma5 || b.invicto - a.invicto);
        const invicto = E.s.slice().sort((a, b) => b.invicto - a.invicto)[0];
        const jejum = E.s.slice().sort((a, b) => b.semVencer - a.semVencer)[0];
        const maxAt = Math.max.apply(null, E.s.map((x) => x.total.gp / x.total.j)), maxDf = Math.max.apply(null, E.s.map((x) => x.total.gc / x.total.j));
        const F = { V: 'vitória', E: 'empate', D: 'derrota' };
        view.innerHTML =
          '<div class="page-head">' + chips + '<div class="kicker">' + esc(ehA ? 'Brasileirão 2026 · Série A' : comp.rotulo) + '</div><h1>Estatísticas</h1>' +
          '<p>' + E.n + ' jogos disputados. Tudo calculado a partir dos resultados, os mesmos do simulador.</p></div>' +
          '<div class="destaques">' +
          '<div class="dq"><b class="num">' + dec(E.gols / E.n) + '</b><span>gols por jogo</span></div>' +
          '<div class="dq"><b class="num">' + pct(E.vm / E.n) + '</b><span>de vitórias dos mandantes (' + pct(E.emp / E.n) + ' de empates)</span></div>' +
          '<div class="dq"><b class="num">' + invicto.invicto + '</b><span>jogos sem perder: ' + esc(nome(invicto.t)) + ', a maior invencibilidade atual</span></div>' +
          '<div class="dq"><b class="num">' + jejum.semVencer + '</b><span>jogos sem vencer: ' + esc(nome(jejum.t)) + ', o maior jejum atual</span></div></div>' +
          jogadoresHtml(jog, L) + bolaDePrataHtml(bp, L) +
          '<div class="sec-title"><h2>Times em números</h2><small>os três primeiros de cada lista</small></div><div class="podios">' +
          podio('Melhor ataque', E.s.slice().sort((a, b) => b.total.gp - a.total.gp), (x) => x.total.gp, 'gols marcados') +
          podio('Melhor defesa', E.s.slice().sort((a, b) => a.total.gc - b.total.gc), (x) => x.total.gc, 'gols sofridos') +
          podio('Ataque mais fraco', E.s.slice().sort((a, b) => a.total.gp - b.total.gp), (x) => x.total.gp, 'gols marcados') +
          podio('Defesa mais vazada', E.s.slice().sort((a, b) => b.total.gc - a.total.gc), (x) => x.total.gc, 'gols sofridos') +
          podio('Mais vitórias', E.s.slice().sort((a, b) => b.v - a.v), (x) => x.v, 'vitórias') +
          podio('Mais empates', E.s.slice().sort((a, b) => b.e - a.e), (x) => x.e, 'empates') +
          podio('Sem sofrer gol', E.s.slice().sort((a, b) => b.limpo - a.limpo), (x) => x.limpo, 'jogos sem levar gol') +
          podio('Passou em branco', E.s.slice().sort((a, b) => b.zerado - a.zerado), (x) => x.zerado, 'jogos sem marcar') +
          '</div>' +
          '<div class="sec-title"><h2>Jogos que marcaram</h2></div><ul class="marcos"><li><span>Maior goleada</span>' + placar(L, E.maior.j) + '</li><li><span>Jogo com mais gols</span>' + placar(L, E.maisGols.j) + '</li></ul>' +
          '<div class="est-cols"><section><div class="sec-title"><h2>Em casa e fora</h2><small>aproveitamento</small></div><div class="tbl-box"><table class="tbl est"><caption class="sr">Aproveitamento em casa e fora</caption>' +
          '<thead><tr><th class="t" scope="col">Time</th><th scope="col">Casa</th><th scope="col">Fora</th></tr></thead><tbody>' +
          casaFora.map((x) => { const c = x.casa.pts / (3 * Math.max(1, x.casa.j)), f = x.fora.pts / (3 * Math.max(1, x.fora.j)); return '<tr><th scope="row" class="t"><div>' + crest(x.t) + '<span>' + esc(nome(x.t)) + '</span></div></th><td>' + pct(c) + barra(c, 1) + '</td><td>' + pct(f) + barra(f, 1) + '</td></tr>'; }).join('') +
          '</tbody></table></div></section>' +
          '<section><div class="sec-title"><h2>Ataque e defesa</h2><small>gols por jogo</small></div><div class="tbl-box"><table class="tbl est"><caption class="sr">Gols marcados e sofridos por jogo</caption>' +
          '<thead><tr><th class="t" scope="col">Time</th><th scope="col">Marca</th><th scope="col">Sofre</th></tr></thead><tbody>' +
          atq.map((x) => { const a = x.total.gp / x.total.j, d = x.total.gc / x.total.j; return '<tr><th scope="row" class="t"><div>' + crest(x.t) + '<span>' + esc(nome(x.t)) + '</span></div></th><td>' + dec(a) + barra(a, maxAt) + '</td><td class="sofre">' + dec(d) + barra(d, maxDf) + '</td></tr>'; }).join('') +
          '</tbody></table></div></section></div>' +
          '<div class="sec-title"><h2>Quem chega embalado</h2><small>pontos nos últimos 5 jogos</small></div><div class="tbl-box estreita"><table class="tbl est"><caption class="sr">Forma recente</caption>' +
          '<thead><tr><th class="t" scope="col">Time</th><th scope="col">Pontos</th><th scope="col">Últimos</th><th class="hide-s" scope="col">Sem perder</th></tr></thead><tbody>' +
          forma.map((x) => '<tr><th scope="row" class="t"><div>' + crest(x.t) + '<span>' + esc(nome(x.t)) + '</span></div></th><td class="pts">' + x.forma5 + '</td><td><span class="forma" role="img" aria-label="Últimos jogos: ' + x.u5.map((r) => F[r]).join(', ') + '">' + x.u5.map((r) => '<i class="' + r + '"></i>').join('') + '</span></td><td class="hide-s">' + x.invicto + '</td></tr>').join('') +
          '</tbody></table></div>' +
          '<p class="nota">Aproveitamento: pontos ganhos divididos pelos pontos disputados. "Sem perder" conta os jogos seguidos sem derrota, do mais recente para trás.</p>' +
          '<p><a class="btn" href="' + rotaSim + '">Simular os jogos que faltam</a></p>';
        // filtro por time e "ver todos" redesenham só a parte dos jogadores
        const redesenhar = () => { const el = view.querySelector('#jogadores'); if (el) el.outerHTML = jogadoresHtml(jog, L); };
        view.onchange = (e) => { if (e.target.matches('[data-jt]')) { vj.time = e.target.value; redesenhar(); } };
        view.onclick = (e) => { const b = e.target.closest('[data-mais]'); if (b) { vj.todos[b.dataset.mais] = !vj.todos[b.dataset.mais]; redesenhar(); } };
      });
      });
    },
  });
})();

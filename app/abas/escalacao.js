/* Aba Monte sua escalação (a partir do Você Escala: esquemas, times, cores e elencos).
   Toque numa vaga para escolher o jogador (ou escrever um nome); arraste para mudar a posição no
   campo. A escalação atual e as salvas ficam em tng.escalacoes; a imagem sai pelo app/compartilhar.js.
   Elencos: GitHub do Julio ao vivo → cópia no aparelho (tng.elencos.cache) → dados/elencos-escalacao.json;
   nos clubes da Série A, cruzados com o elenco da ESPN (dados/elencos-espn.json; ver shared/elencos.js). */
(function () {
  'use strict';
  const T = window.TNG;
  const { esc, loadJson, saveJson, aviso, KEY } = T;
  const CHAVE_CACHE = 'tng.elencos.cache';           // contrato: não renomear

  // esquemas do Você Escala (ESQUEMAS_TATICOS): [x, y] em frações do campo, do goleiro ao ataque
  const ESQUEMAS = {
    '4-3-3': [[0.5, 0.92], [0.15, 0.75], [0.38, 0.78], [0.62, 0.78], [0.85, 0.75], [0.3, 0.55], [0.5, 0.5], [0.7, 0.55], [0.2, 0.25], [0.5, 0.2], [0.8, 0.25]],
    '4-4-2': [[0.5, 0.92], [0.15, 0.75], [0.38, 0.78], [0.62, 0.78], [0.85, 0.75], [0.15, 0.5], [0.38, 0.5], [0.62, 0.5], [0.85, 0.5], [0.35, 0.25], [0.65, 0.25]],
    '4-2-3-1': [[0.5, 0.92], [0.15, 0.75], [0.38, 0.78], [0.62, 0.78], [0.85, 0.75], [0.35, 0.6], [0.65, 0.6], [0.2, 0.4], [0.5, 0.35], [0.8, 0.4], [0.5, 0.15]],
    '4-1-4-1': [[0.5, 0.92], [0.15, 0.75], [0.38, 0.78], [0.62, 0.78], [0.85, 0.75], [0.5, 0.65], [0.15, 0.45], [0.38, 0.45], [0.62, 0.45], [0.85, 0.45], [0.5, 0.2]],
    '3-5-2': [[0.5, 0.92], [0.3, 0.78], [0.5, 0.8], [0.7, 0.78], [0.1, 0.55], [0.3, 0.55], [0.5, 0.45], [0.7, 0.55], [0.9, 0.55], [0.35, 0.25], [0.65, 0.25]],
    '3-4-3': [[0.5, 0.92], [0.3, 0.78], [0.5, 0.8], [0.7, 0.78], [0.15, 0.5], [0.38, 0.5], [0.62, 0.5], [0.85, 0.5], [0.2, 0.25], [0.5, 0.2], [0.8, 0.25]],
    '5-3-2': [[0.5, 0.92], [0.1, 0.7], [0.3, 0.78], [0.5, 0.8], [0.7, 0.78], [0.9, 0.7], [0.3, 0.5], [0.5, 0.5], [0.7, 0.5], [0.35, 0.25], [0.65, 0.25]],
    '5-4-1': [[0.5, 0.92], [0.1, 0.7], [0.3, 0.78], [0.5, 0.8], [0.7, 0.78], [0.9, 0.7], [0.15, 0.48], [0.38, 0.48], [0.62, 0.48], [0.85, 0.48], [0.5, 0.2]],
  };
  const NOME_POS = { G: 'Goleiros', D: 'Defensores', M: 'Meio-campistas', A: 'Atacantes' };
  const SIGLA = { G: 'GOL', D: 'DEF', M: 'MEI', A: 'ATA' };
  const posDaVaga = (y) => (y >= 0.85 ? 'G' : y >= 0.64 ? 'D' : y >= 0.33 ? 'M' : 'A');

  const st = { dados: null, base: null, time: null, esquema: '4-3-3', jogadores: [], pos: null, vaga: -1, view: null, fonte: 'publicado',
    // mesa tática: dois times no mesmo campo. st.* é sempre o lado que está sendo editado; st.outro é o
    // outro lado; st.casa diz se o lado editado é o mandante (metade de baixo do campo)
    modo: 'time', outro: null, casa: true, cal: null };

  // ------------------------------------------------------------------ dados
  function carregar() {
    if (st.dados) return Promise.resolve();
    return fetch('dados/elencos-escalacao.json').then((r) => { if (!r.ok) throw new Error('elencos ' + r.status); return r.json(); }).then((reserva) => {
      const cache = loadJson(CHAVE_CACHE, null);
      st.dados = cache && cache.times && cache.times.length >= 20 && (!reserva.atualizado || (cache.atualizado || '') >= reserva.atualizado) ? cache : reserva;
      st.fonte = st.dados === cache ? 'guardado' : 'publicado';
      // última escalação de cada time (sai do Actions; sem o arquivo, o botão some)
      fetch('dados/ultimas-escalacoes.json').then((r) => (r.ok ? r.json() : null)).then((u) => { st.ultimas = (u && u.times) || {}; if (st.view) desenharBotaoUltima(); }).catch(() => { st.ultimas = {}; });
      // calendário do Brasileirão: o confronto começa no próximo jogo do time
      fetch('dados/brasileirao-2026.json').then((r) => (r.ok ? r.json() : null)).then((d) => {
        if (!d) return;
        const esc_ = {};
        d.times.forEach((t) => { esc_[t.id] = t.escudo; });
        st.cal = d.jogos.filter((j) => j.status !== 'STATUS_FULL_TIME').map((j) => ({ h: esc_[j.mandante], a: esc_[j.visitante], data: j.data }));
        if (st.view && st.modo === 'confronto') desenharConfronto();
      }).catch(() => {});
      // cartões (amarelos do ciclo, suspensos): sai junto com a artilharia da Série A
      fetch('dados/estatisticas-jogadores.json').then((r) => (r.ok ? r.json() : null)).then((J) => {
        st.cart = {};
        ((J && J.cartoes && J.cartoes.jogadores) || []).forEach((x) => { if (x.escudo) (st.cart[x.escudo] = st.cart[x.escudo] || []).push(Object.assign({ k: normNome(x.nome) }, x)); });
        if (st.view && st.time) { desenharFichas(); const b = st.view.querySelector('[data-e=busca]'); desenharElenco(b ? b.value : ''); }
      }).catch(() => {});
      st.escudos = {};
      (reserva.escudos || []).forEach((e) => { st.escudos[e] = 1; });
      atualizarAoVivo(reserva);
    });
  }
  let jaBuscou = false;
  function atualizarAoVivo() {
    if (jaBuscou || /[?&]offline\b/.test(location.search) || T.ARTIFACT) return;
    jaBuscou = true;
    // a versão ao vivo do Você Escala passa pelo mesmo cruzamento com a ESPN da reserva publicada
    const espn = fetch('dados/elencos-espn.json').then((r) => (r.ok ? r.json() : null)).catch(() => null);
    Promise.all([T.script('shared/elencos.js'), fetch('dados/times-voce-escala.json').then((r) => r.json()), espn]).then(([, base, E]) =>
      window.TNGElencos.atualizar(base, st.escudos).then((novo) => window.TNGElencos.cruzarEspn(novo, E))).then((novo) => {
      if (!novo.times.length) return;
      novo.escudos = Object.keys(st.escudos);
      saveJson(CHAVE_CACHE, novo);
      st.dados = novo; st.fonte = 'ao vivo';
      if (st.time) st.time = st.dados.times.find((t) => t.id === st.time.id) || st.time;
    }).catch((e) => T.reportError(e, 'elencos'));
  }

  // ------------------------------------------------------------------ estado salvo
  function salvarAtual() {
    const todos = loadJson(KEY.escalacoes, {});
    todos.atual = { time: st.time && st.time.id, esquema: st.esquema, jogadores: st.jogadores, pos: st.pos };
    const o = st.outro;
    todos.confronto = { modo: st.modo, casa: st.casa, outro: o ? { time: o.time && o.time.id, esquema: o.esquema, jogadores: o.jogadores, pos: o.pos } : null };
    saveJson(KEY.escalacoes, todos);
  }
  function restaurar() {
    const a = (loadJson(KEY.escalacoes, {}) || {}).atual;
    const timePadrao = st.dados.times.find((t) => /flamengo/i.test(t.nome)) || st.dados.times[0];
    st.time = (a && st.dados.times.find((t) => t.id === a.time)) || timePadrao;
    st.esquema = a && ESQUEMAS[a.esquema] ? a.esquema : '4-3-3';
    st.jogadores = a && Array.isArray(a.jogadores) && a.jogadores.length === 11 ? a.jogadores : new Array(11).fill(null);
    st.pos = a && Array.isArray(a.pos) && a.pos.length === 11 ? a.pos : null;
    st.pediuUltima = !(a && a.jogadores && a.jogadores.some(Boolean));
    const c = (loadJson(KEY.escalacoes, {}) || {}).confronto;
    if (c) {
      st.modo = c.modo === 'confronto' ? 'confronto' : 'time'; st.casa = c.casa !== false;
      const t = c.outro && st.dados.times.find((x) => x.id === c.outro.time);
      st.outro = t ? { time: t, esquema: ESQUEMAS[c.outro.esquema] ? c.outro.esquema : '4-3-3',
        jogadores: Array.isArray(c.outro.jogadores) && c.outro.jogadores.length === 11 ? c.outro.jogadores : new Array(11).fill(null),
        pos: Array.isArray(c.outro.pos) && c.outro.pos.length === 11 ? c.outro.pos : null } : null;
      if (st.modo === 'confronto' && !st.outro) st.modo = 'time';
    }
  }

  // ------------------------------------------------------------------ jogadores criados pelo usuário
  // ficam por time em tng.escalacoes.extras[timeId] = [[nome, pos, num, 'seu']]
  function extras(t) { return ((loadJson(KEY.escalacoes, {}).extras || {})[t.id] || []).filter((x) => Array.isArray(x) && x[0]); }
  function elencoDe(t) { return t.jogadores.concat(extras(t)); }
  function criarJogador(nome, num, pos) {
    const todos = loadJson(KEY.escalacoes, {});
    todos.extras = todos.extras || {};
    const lista = (todos.extras[st.time.id] || []).filter((x) => x[0] !== nome);
    lista.push([nome, pos, num, 'seu']);
    todos.extras[st.time.id] = lista.slice(-40);
    saveJson(KEY.escalacoes, todos);
  }
  function apagarJogador(nome) {
    const todos = loadJson(KEY.escalacoes, {});
    if (!todos.extras || !todos.extras[st.time.id]) return;
    todos.extras[st.time.id] = todos.extras[st.time.id].filter((x) => x[0] !== nome);
    saveJson(KEY.escalacoes, todos);
  }

  // ------------------------------------------------------------------ última escalação (súmula da ESPN)
  const semAc = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  // grupo e lado de uma posição da ESPN: G, LB, CD-L, RB, DM, CM-R, LM, AM, LF, CF, RW...
  function grupoEspn(p) {
    p = String(p || '').toUpperCase();
    if (/^G/.test(p)) return 'G';
    if (/^(CD|CB|LB|RB|D$|LWB|RWB|SW)/.test(p)) return 'D';
    if (/M/.test(p)) return 'M';
    return 'A';
  }
  const ladoEspn = (p) => { p = String(p || '').toUpperCase(); return /^L/.test(p) ? 0 : /-L$/.test(p) ? 1 : /^R/.test(p) ? 4 : /-R$/.test(p) ? 3 : 2; };
  const fundoEspn = (p) => { p = String(p || '').toUpperCase(); return /^DM|^CD|^CB/.test(p) ? 0 : /^AM/.test(p) ? 2 : 1; };
  function contagem(esq) {
    const base = ESQUEMAS[esq], c = { G: 0, D: 0, M: 0, A: 0 };
    base.forEach(([, y]) => { c[posDaVaga(y)]++; });
    return c;
  }
  function aplicarUltima(u) {
    const tit = (u.titulares || []).filter((p) => p && p.n);
    if (tit.length < 11) return false;
    const c = { G: 0, D: 0, M: 0, A: 0 };
    tit.forEach((p) => { p.g = grupoEspn(p.pos); c[p.g]++; });
    // esquema: o da súmula, se a gente tiver; senão o de contagem igual; senão o mais parecido
    const chaves = Object.keys(ESQUEMAS);
    let esq = chaves.find((k) => k === String(u.esquema || '').replace(/\s/g, ''));
    if (!esq) esq = chaves.find((k) => { const x = contagem(k); return x.D === c.D && x.M === c.M && x.A === c.A; });
    if (!esq) esq = chaves.slice().sort((a, b) => { const d = (k) => { const x = contagem(k); return Math.abs(x.D - c.D) + Math.abs(x.M - c.M) + Math.abs(x.A - c.A); }; return d(a) - d(b); })[0];
    const base = ESQUEMAS[esq];
    const elenco = elencoDe(st.time);
    const nomeDo = (p) => {
      // usa o nome do nosso elenco quando o número (ou o sobrenome) bate
      const n = semAc(p.n), ult = n.split(' ').pop();
      const porNum = p.num != null && elenco.find((x) => x[2] === p.num && (semAc(x[0]).includes(ult) || semAc(p.curto || '').includes(semAc(x[0]).split(' ').pop())));
      const porNome = elenco.find((x) => semAc(x[0]) === n || semAc(x[0]) === semAc(p.curto));
      const x = porNum || porNome;
      return x ? { n: x[0], num: x[2] != null ? x[2] : p.num } : { n: p.curto && p.curto.length <= 18 ? p.curto : p.n, num: p.num };
    };
    const vagas = base.map(([x, y], i) => ({ i, x, y, g: posDaVaga(y) }));
    const novos = new Array(11).fill(null), livres = tit.slice();
    ['G', 'D', 'M', 'A'].forEach((g) => {
      // vagas do setor em linhas (alturas parecidas), da mais recuada para a mais avançada
      const vs = vagas.filter((v) => v.g === g).sort((a, b) => b.y - a.y);
      const linhas = [];
      vs.forEach((v) => { const l = linhas[linhas.length - 1]; if (l && Math.abs(l[0].y - v.y) <= 0.08) l.push(v); else linhas.push([v]); });
      const ps = livres.filter((p) => p.g === g).sort((a, b) => fundoEspn(a.pos) - fundoEspn(b.pos));
      // cada linha recebe os próximos mais recuados, da esquerda para a direita
      linhas.forEach((l) => {
        const daLinha = ps.splice(0, l.length).sort((a, b) => ladoEspn(a.pos) - ladoEspn(b.pos));
        l.sort((a, b) => a.x - b.x).forEach((v, k) => { const p = daLinha[k]; if (p) { novos[v.i] = nomeDo(p); livres.splice(livres.indexOf(p), 1); } });
      });
    });
    vagas.forEach((v) => { if (!novos[v.i] && livres.length) novos[v.i] = nomeDo(livres.shift()); });
    st.esquema = esq; st.jogadores = novos; st.pos = null; st.vaga = -1;
    salvarAtual();
    return true;
  }
  function ultimaDoTime() { return st.ultimas && st.time && st.time.escudo ? st.ultimas[st.time.escudo] : null; }
  function desenharBotaoUltima() {
    const lugar = st.view && st.view.querySelector('#ultima');
    if (!lugar) return;
    const u = ultimaDoTime();
    if (u && st.pediuUltima) { st.pediuUltima = false; if (aplicarUltima(u)) { montar(); return; } }
    lugar.innerHTML = u ? '<button class="link-btn" data-e="ultima">Última escalação' + (u.contra ? ' (contra ' + esc(u.contra) + ')' : '') + '</button>' : '';
  }
  const posicoes = () => st.pos || ESQUEMAS[st.esquema];

  // ------------------------------------------------------------------ cores legíveis
  function luz(hex) {
    const m = /^#?([0-9a-f]{6})$/i.exec(hex || '');
    if (!m) return 0.5;
    const n = parseInt(m[1], 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function cores(t) {
    const fundo = t.cor || '#ffffff';
    let tinta = t.cor2 || '#000000';
    const contraste = (a, b) => (Math.max(luz(a), luz(b)) + 0.05) / (Math.min(luz(a), luz(b)) + 0.05);
    if (contraste(fundo, tinta) < 3) tinta = luz(fundo) > 0.4 ? '#111111' : '#ffffff';
    return { fundo, tinta, claro: luz(fundo) > 0.6 };
  }

  // ------------------------------------------------------------------ desenho
  const CAMPO_SVG = '<svg class="campo-linhas" viewBox="0 0 68 100" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="rgba(255,255,255,.5)" stroke-width=".35">' +
    '<rect x="3" y="3" width="62" height="94" rx=".5"/><path d="M3 50h62"/><circle cx="34" cy="50" r="8.5"/>' +
    '<rect x="15" y="3" width="38" height="15"/><rect x="25" y="3" width="18" height="5.5"/><path d="M27.5 18a8 8 0 0 0 13 0"/>' +
    '<rect x="15" y="82" width="38" height="15"/><rect x="25" y="91.5" width="18" height="5.5"/><path d="M27.5 82a8 8 0 0 1 13 0"/></g>' +
    '<circle cx="34" cy="50" r=".7" fill="rgba(255,255,255,.5)"/></svg>';

  const CAMPO_MESA = '<svg class="campo-linhas" viewBox="0 0 68 130" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="rgba(255,255,255,.5)" stroke-width=".35">' +
    '<rect x="3" y="3" width="62" height="124" rx=".5"/><path d="M3 65h62"/><circle cx="34" cy="65" r="8.5"/>' +
    '<rect x="15" y="3" width="38" height="15"/><rect x="25" y="3" width="18" height="5.5"/><path d="M27.5 18a8 8 0 0 0 13 0"/>' +
    '<rect x="15" y="112" width="38" height="15"/><rect x="25" y="121.5" width="18" height="5.5"/><path d="M27.5 112a8 8 0 0 1 13 0"/></g>' +
    '<circle cx="34" cy="65" r=".7" fill="rgba(255,255,255,.5)"/></svg>';

  function montar() {
    const v = st.view, ve = T.app('voce-escala');
    const grupos = {};
    st.dados.times.forEach((t) => { (grupos[t.grupo] = grupos[t.grupo] || []).push(t); });
    v.innerHTML =
      '<div class="page-head"><div class="kicker">Você Escala na web</div><h1>Monte sua escalação</h1>' +
      '<p>Escolha o time e o esquema, toque numa posição para escalar e arraste para ajustar. Depois, compartilhe a imagem.</p></div>' +
      '<div class="esc-modo" role="group" aria-label="Modo"><button data-e="modo" data-m="time" aria-pressed="' + (st.modo === 'time') + '">Um time</button><button data-e="modo" data-m="confronto" aria-pressed="' + (st.modo === 'confronto') + '">Confronto</button></div>' +
      '<div class="esc-layout"><div class="esc-campo-col">' +
      (st.modo === 'confronto' ? '<div id="confronto" class="confronto"></div>' : '') +
      '<div class="esc-ctrl"><label class="btn sel-time">' + (st.time.escudo ? '<img class="crest" src="midia/escudos/' + esc(st.time.escudo) + '.png" alt="" width="22" height="22">' : '') +
      '<select data-e="time" aria-label="Time">' + Object.keys(grupos).map((g) => '<optgroup label="' + esc(g) + '">' + grupos[g].map((t) =>
        '<option value="' + esc(t.id) + '"' + (t.id === st.time.id ? ' selected' : '') + '>' + esc(t.nome) + '</option>').join('') + '</optgroup>').join('') + '</select></label>' +
      '<label class="btn sel-time sel-esq"><select data-e="esquema" aria-label="Esquema tático">' + Object.keys(ESQUEMAS).map((k) => '<option' + (k === st.esquema ? ' selected' : '') + '>' + k + '</option>').join('') + '</select></label></div>' +
      '<div class="campo-box' + (st.modo === 'confronto' ? ' mesa' : '') + '" id="campo" style="' + varsCor() + '">' + (st.modo === 'confronto' ? CAMPO_MESA : CAMPO_SVG) + '<div id="fichas"></div></div>' +
      '<div class="esc-acoes"><button class="btn primario" data-e="partilhar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>Compartilhar a imagem</button>' +
      '<button class="btn" data-e="auto">Escalar automaticamente</button></div>' +
      '<div class="ferr"><span id="ultima"></span><button class="link-btn" data-e="salvas">Salvas</button><button class="link-btn" data-e="salvar">Salvar esta escalação</button><button class="link-btn" data-e="limpar">Limpar</button>' +
      (st.cart && Object.keys(st.cart).length ? '<button class="link-btn" data-e="cartoes" aria-pressed="' + cartoesOn() + '">' + (cartoesOn() ? 'Esconder cartões' : 'Mostrar cartões') + '</button>' : '') +
      (st.pos ? '<button class="link-btn" data-e="realinhar">Voltar às posições do esquema</button>' : '') + '</div>' +
      '</div><aside class="esc-lado"><div id="painel-elenco"></div>' +
      '<div class="cta-app"><img src="midia/icones/voce-escala.png" alt="" width="56" height="56" loading="lazy"><div><b>Monte no celular, salve e compare com os amigos</b>' +
      '<span>O Você Escala tem modo confronto (dois times no mesmo campo), jogadores personalizados e as escalações guardadas no aparelho.</span>' +
      '<a class="play" href="' + esc(T.playUrl(ve.pacote, 'escalacao')) + '" target="_blank" rel="noopener">' + T.ICON.play + '<span><small>Baixe o Você Escala no</small><b>Google Play</b></span></a></div></div></aside></div>';
    desenharConfronto();
    desenharFichas();
    desenharElenco();
    desenharBotaoUltima();
  }
  // nomes de fontes diferentes (elenco do Você Escala × ESPN): sem acento, minúsculo, só palavras
  function normNome(n) { return ' ' + String(n || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim() + ' '; }
  // cartões do jogador no time escolhido: nome igual, ou um nome contido no outro (palavras inteiras)
  // 2 = mesmo nome; 1 = as palavras do nome curto aparecem, em ordem, no longo ("R. Garro" ~ "Rodrigo Garro")
  function casaNome(a, b) {
    if (a === b) return 2;
    const dentro = (p, q) => {
      let i = 0;
      const ig = (x, y) => x === y || (x.length === 1 && y[0] === x) || (y.length === 1 && x[0] === y);
      for (const w of q) { if (i < p.length && ig(p[i], w)) i++; }
      return i === p.length && p.some((w) => w.length > 2);
    };
    const p = a.trim().split(' '), q = b.trim().split(' ');
    return dentro(p, q) || dentro(q, p) ? 1 : 0;
  }
  const CHAVE_CART = 'tng.esc.cartoes';        // '0' = escondidos
  const cartoesOn = () => { try { return localStorage.getItem(CHAVE_CART) !== '0'; } catch (e) { return true; } };
  function cartaoDe(nome, time) {
    time = time || st.time;
    if (!cartoesOn()) return null;
    const lista = st.cart && time && st.cart[time.escudo];
    if (!lista) return null;
    const k = normNome(nome);
    const melhor = (alvo, xs, chave) => {
      const n2 = xs.filter((x) => casaNome(alvo, chave(x)) === 2);
      return n2.length ? n2 : xs.filter((x) => casaNome(alvo, chave(x)) === 1);
    };
    const c = melhor(k, lista, (x) => x.k);
    if (c.length !== 1) return null;                     // ambíguo (dois "Lucas"): melhor não marcar
    // e o caminho de volta: esse jogador da ESPN só pode bater com um nome do elenco ("Hugo" × "Hugo Souza")
    const volta = melhor(c[0].k, elencoDe(time), (x) => normNome(x[0]));
    return volta.length === 1 && normNome(volta[0][0]) === k ? c[0] : null;
  }
  function varsCor(t) { const c = cores(t || st.time); return '--fc:' + c.fundo + ';--ft:' + c.tinta + ';--fb:' + (c.claro ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.75)'); }

  // no confronto, cada time ocupa a sua metade: o mandante embaixo, o visitante em cima e espelhado
  // (o lateral-esquerdo dele fica à direita de quem olha, como na TV)
  // y do esquema (0,15 atacante … 0,92 goleiro) → metade do campo, com folga no meio para os dois ataques
  const mesaY = (y, casa) => (casa ? 0.545 + (y - 0.15) * 0.52 : 0.455 - (y - 0.15) * 0.52);
  const noCampo = (x, y, casa) => (st.modo !== 'confronto' ? [x, y] : [casa ? x : 1 - x, mesaY(y, casa)]);
  const doCampo = (X, Y, casa) => (st.modo !== 'confronto' ? [X, Y] : [casa ? X : 1 - X, Math.min(0.97, Math.max(0.04, (casa ? Y - 0.545 : 0.455 - Y) / 0.52 + 0.15))]);
  function fichasHtml(L, casa, ativo) {
    const P = L.pos || ESQUEMAS[L.esquema], base = ESQUEMAS[L.esquema];
    const attr = ativo ? 'data-i' : 'data-o';
    const cor = ativo ? '' : ';' + varsCor(L.time);
    const html = P.map(([x0, y0], i) => {
      const [x, y] = noCampo(x0, y0, casa);
      const j = L.jogadores[i], vaga = posDaVaga(base[i][1]);
      return '<button class="ficha-j' + (j ? '' : ' vazia') + (ativo && st.vaga === i ? ' sel' : '') + (ativo ? '' : ' outro') + '" ' + attr + '="' + i + '" style="left:' + (x * 100) + '%;top:' + (y * 100) + '%' + cor + '"' +
        ' aria-label="' + (ativo ? '' : esc(L.time.nome) + ': ') + (j ? esc(j.n) + ', ' : 'Vaga vazia, ') + NOME_POS[vaga].replace(/s$/, '').toLowerCase() + (ativo ? '. Toque para escolher' : '. Toque para editar este time') + '">' +
        '<span class="fj-bola">' + (j ? (j.num != null ? esc(j.num) : '') : '+') + (j ? T.cartoes(cartaoDe(j.n, L.time), true) : '') + '</span><span class="fj-nome">' + (j ? esc(curto(j.n)) : SIGLA[vaga]) + '</span></button>';
    });
    return (st.modo === 'confronto' && !casa ? html.reverse() : html).join('');
  }
  function desenharFichas() {
    const box = st.view.querySelector('#fichas');
    box.innerHTML = (st.modo === 'confronto' && st.outro ? fichasHtml(st.outro, !st.casa, false) : '') + fichasHtml(ladoAtual(), st.casa, true);
  }
  const ladoAtual = () => ({ time: st.time, esquema: st.esquema, jogadores: st.jogadores, pos: st.pos });
  // troca o lado em edição (o outro time vira o principal, com seleção, elenco e esquema dele)
  function trocarLado() {
    const o = st.outro, a = ladoAtual();
    st.time = o.time; st.esquema = o.esquema; st.jogadores = o.jogadores; st.pos = o.pos;
    st.outro = a; st.casa = !st.casa; st.vaga = -1;
    salvarAtual();
  }
  // próximo jogo do time no Brasileirão (escudo do adversário e se joga em casa)
  function proximoJogo(t) {
    if (!st.cal || !t || !t.escudo) return null;
    const agora = Date.now() - 3 * 3600e3;
    const j = st.cal.find((x) => (x.h === t.escudo || x.a === t.escudo) && new Date(x.data).getTime() >= agora);
    if (!j) return null;
    const adv = st.dados.times.find((x) => x.escudo === (j.h === t.escudo ? j.a : j.h));
    return adv ? { adv, casa: j.h === t.escudo, data: j.data } : null;
  }
  // monta um lado novo para o time t: última escalação dele ou, sem ela, os titulares prováveis
  function ladoNovo(t) {
    const salvo = ladoAtual(), vaga = st.vaga;
    st.time = t; st.esquema = '4-3-3'; st.jogadores = new Array(11).fill(null); st.pos = null;
    const u = ultimaDoTime();
    if (!(u && aplicarUltima(u))) preencher();
    const novo = ladoAtual();
    st.time = salvo.time; st.esquema = salvo.esquema; st.jogadores = salvo.jogadores; st.pos = salvo.pos; st.vaga = vaga;
    return novo;
  }
  function confrontoProximo(avisar) {
    const p = proximoJogo(st.time);
    if (!p) { if (avisar) aviso('Não achei o próximo jogo de ' + st.time.nome + ' no Brasileirão: escolha o adversário'); return false; }
    st.outro = ladoNovo(p.adv); st.casa = p.casa;
    return true;
  }
  function entrarConfronto() {
    st.modo = 'confronto';
    if (!st.outro && !confrontoProximo(false)) {
      // sem calendário: um adversário do mesmo grupo para começar
      const adv = st.dados.times.find((t) => t.grupo === st.time.grupo && t.id !== st.time.id) || st.dados.times.find((t) => t.id !== st.time.id);
      st.outro = ladoNovo(adv); st.casa = true;
    }
    st.vaga = -1; salvarAtual(); montar();
  }
  // faixa acima do campo: os dois times (toque para editar) e o atalho para o próximo jogo
  function desenharConfronto() {
    const el = st.view && st.view.querySelector('#confronto');
    if (!el || st.modo !== 'confronto' || !st.outro) return;
    const casa = st.casa ? ladoAtual() : st.outro, fora = st.casa ? st.outro : ladoAtual();
    const lado = (L, ehCasa) => {
      const ativo = (ehCasa === st.casa);
      return '<button class="cf-lado' + (ativo ? ' ativo' : '') + '" data-e="lado"' + (ativo ? ' aria-current="true"' : '') + ' aria-label="' + (ativo ? 'Editando ' : 'Editar ') + esc(L.time.nome) + '">' +
        (L.time.escudo ? '<img class="crest" src="midia/escudos/' + esc(L.time.escudo) + '.png" alt="" width="26" height="26">' : '') +
        '<span><b>' + esc(L.time.nome) + '</b><small>' + (ehCasa ? 'mandante' : 'visitante') + ' · ' + esc(L.esquema) + (ativo ? ' · editando' : '') + '</small></span></button>';
    };
    const p = proximoJogo(st.time);
    const ehEsse = p && st.outro.time.id === p.adv.id && p.casa === st.casa;
    el.innerHTML = '<div class="cf-times">' + lado(fora, false) + '<i>×</i>' + lado(casa, true) + '</div>' +
      '<div class="cf-acoes">' + (p && !ehEsse ? '<button class="link-btn" data-e="proximo">Próximo jogo de ' + esc(st.time.nome) + '</button>' : '') +
      (p && ehEsse ? '<span class="cf-data">' + esc(new Date(p.data).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }).replace('.', '')) + ' · próximo jogo</span>' : '') +
      '<button class="link-btn" data-e="mando">Inverter mando</button></div>';
  }
  // "J. C. Neres dos Santos I." → "Neres dos Santos": cabe embaixo da bola sem virar sopa de letras
  function curto(n) {
    const p = String(n).split(/\s+/).filter((x) => !/^[A-Z]\.$/.test(x) && !/^[IV]+\.?$/.test(x));
    const s = p.join(' ') || n;
    return s.length > 16 ? p[p.length - 1] : s;
  }

  function desenharElenco(filtro) {
    const el = st.view.querySelector('#painel-elenco');
    const naVaga = {};
    st.jogadores.forEach((j, i) => { if (j) naVaga[j.n] = i; });
    const vagaPos = st.vaga >= 0 ? posDaVaga(ESQUEMAS[st.esquema][st.vaga][1]) : null;
    const q = (filtro || '').trim().toLowerCase();
    const lista = elencoDe(st.time).filter((p) => !q || p[0].toLowerCase().includes(q));
    const ordem = vagaPos ? [vagaPos].concat(['G', 'D', 'M', 'A'].filter((x) => x !== vagaPos)) : ['G', 'D', 'M', 'A'];
    el.innerHTML = '<div class="sec-title"><h2>' + (st.vaga >= 0 ? 'Escolha o ' + { G: 'goleiro', D: 'defensor', M: 'meio-campista', A: 'atacante' }[vagaPos] : 'Elenco ' + (st.time.grupo === 'Copa do Mundo 2026' ? 'da seleção' : 'do time')) + '</h2>' +
      '<small>' + elencoDe(st.time).length + ' jogadores</small></div>' +
      '<div class="busca"><input type="search" data-e="busca" placeholder="Buscar jogador" aria-label="Buscar jogador" value="' + esc(filtro || '') + '"></div>' +
      (st.vaga >= 0 ? '' : '<p class="nota">Toque numa posição do campo e depois no jogador. Falta alguém? Crie o jogador logo abaixo.</p>') +
      '<form class="nome-livre criar" data-e="livre"><input name="n" maxlength="24" placeholder="Criar jogador: nome" aria-label="Nome do jogador" autocomplete="off">' +
      '<input name="num" class="num-in" inputmode="numeric" pattern="[0-9]*" maxlength="2" placeholder="nº" aria-label="Número da camisa" autocomplete="off">' +
      '<select name="pos" aria-label="Posição">' + ['G', 'D', 'M', 'A'].map((p) => '<option value="' + p + '"' + ((vagaPos || 'M') === p ? ' selected' : '') + '>' + SIGLA[p].toLowerCase() + '</option>').join('') + '</select>' +
      '<button class="btn">' + (st.vaga >= 0 ? 'Pôr na vaga' : 'Criar') + '</button></form>' +
      ordem.map((p) => {
        const js = lista.filter((x) => x[1] === p);
        if (!js.length) return '';
        return '<h3 class="el-grupo">' + NOME_POS[p] + '</h3><ul class="elenco">' + js.map((x) =>
          '<li><button data-e="pegar" data-n="' + esc(x[0]) + '" data-num="' + (x[2] == null ? '' : x[2]) + '"' + (naVaga[x[0]] != null ? ' class="usado"' : '') + '>' +
          '<span class="num">' + (x[2] == null ? '' : x[2]) + '</span><span class="el-nome">' + esc(x[0]) + '</span>' + T.cartoes(cartaoDe(x[0])) + (naVaga[x[0]] != null ? '<em>no campo</em>' : x[3] === 'seu' ? '<em class="seu">criado</em>' : '') + '</button>' +
          (x[3] === 'seu' ? '<button class="el-apagar" data-e="apagar-j" data-n="' + esc(x[0]) + '" aria-label="Apagar ' + esc(x[0]) + '">×</button>' : '') + '</li>').join('') + '</ul>';
      }).join('') + (lista.length ? '' : '<p class="nota">Ninguém com esse nome.</p>');
  }

  // ------------------------------------------------------------------ ações
  function escolherVaga(i) {
    st.vaga = st.vaga === i ? -1 : i;
    desenharFichas();
    desenharElenco();
    if (st.vaga >= 0) {
      const painel = st.view.querySelector('#painel-elenco');
      if (window.matchMedia('(max-width: 899px)').matches) painel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const busca = painel.querySelector('[data-e="busca"]');
      if (busca && window.matchMedia('(min-width: 900px)').matches) busca.focus({ preventScroll: true });
    }
  }
  function porNaVaga(jog) {
    let i = st.vaga;
    if (i < 0) {
      // sem vaga escolhida: primeira vaga vazia da posição do jogador (ou qualquer vazia)
      const pj = jog.pos || (elencoDe(st.time).find((x) => x[0] === jog.n) || [])[1];
      const base = ESQUEMAS[st.esquema];
      i = st.jogadores.findIndex((j, k) => !j && posDaVaga(base[k][1]) === pj);
      if (i < 0) i = st.jogadores.findIndex((j) => !j);
      if (i < 0) { aviso('O time já tem 11: toque numa posição para trocar'); return; }
    }
    const ja = st.jogadores.findIndex((j) => j && j.n === jog.n);
    if (ja >= 0 && ja !== i) st.jogadores[ja] = st.jogadores[i];     // já estava no campo: troca de lugar
    st.jogadores[i] = jog;
    // segue para a próxima vaga vazia, para escalar o time inteiro em sequência
    const prox = st.jogadores.findIndex((j, k) => !j && k > i);
    st.vaga = prox >= 0 ? prox : st.jogadores.findIndex((j) => !j);
    salvarAtual(); desenharFichas(); desenharElenco();
  }
  function autoEscalar() {
    const n = preencher();
    st.vaga = -1;
    salvarAtual(); desenharFichas(); desenharElenco();
    aviso(n ? n + (n === 1 ? ' vaga preenchida' : ' vagas preenchidas') + ': troque à vontade' : 'O time já está completo');
  }
  function preencher() {
    const base = ESQUEMAS[st.esquema], usados = {};
    st.jogadores.forEach((j) => { if (j) usados[j.n] = 1; });
    // camisas de 1 a 11 costumam ser dos titulares: vêm primeiro (depois as outras, em ordem)
    const nota = (x) => (x[2] == null ? 999 : x[2] <= 11 ? x[2] : 100 + x[2]);
    const elenco = elencoDe(st.time).sort((a, b) => nota(a) - nota(b));
    let n = 0;
    base.forEach(([, y], i) => {
      if (st.jogadores[i]) return;
      const p = posDaVaga(y);
      const j = elenco.find((x) => x[1] === p && !usados[x[0]]) || elenco.find((x) => !usados[x[0]]);
      if (!j) return;
      usados[j[0]] = 1; st.jogadores[i] = { n: j[0], num: j[2] }; n++;
    });
    return n;
  }

  // arrastar uma ficha muda a posição dela no campo (toque sem arrastar abre a escolha)
  // delegado pela página: o campo é redesenhado a cada troca de time ou esquema
  function ligarArraste() {
    const v = st.view;
    const campoAtual = () => v.querySelector('#campo');
    let arr = null;
    const onDown = (e) => {
      const f = e.target.closest('.ficha-j');
      if (!f || e.button > 0) return;
      arr = { i: +(f.dataset.i != null ? f.dataset.i : f.dataset.o), outro: f.dataset.o != null, f, x0: e.clientX, y0: e.clientY, moveu: false, id: e.pointerId };
    };
    const onMove = (e) => {
      if (!arr || e.pointerId !== arr.id || arr.outro) return;
      if (!arr.moveu && Math.hypot(e.clientX - arr.x0, e.clientY - arr.y0) < 7) return;
      if (!arr.moveu) { arr.moveu = true; try { arr.f.setPointerCapture(e.pointerId); } catch (x) { /* ok */ } arr.f.classList.add('arrastando'); if (!st.pos) st.pos = ESQUEMAS[st.esquema].map((p) => p.slice()); }
      e.preventDefault();
      const r = campoAtual().getBoundingClientRect();
      const mesa = st.modo === 'confronto';
      const yMin = mesa ? (st.casa ? 0.5 : 0.03) : 0.04, yMax = mesa ? (st.casa ? 0.97 : 0.5) : 0.97;
      const x = Math.min(0.96, Math.max(0.04, (e.clientX - r.left) / r.width)), y = Math.min(yMax, Math.max(yMin, (e.clientY - r.top) / r.height));
      const [px, py] = doCampo(x, y, st.casa);
      st.pos[arr.i] = [Math.round(px * 1000) / 1000, Math.round(py * 1000) / 1000];
      arr.f.style.left = x * 100 + '%'; arr.f.style.top = y * 100 + '%';
    };
    const onUp = (e) => {
      if (!arr || e.pointerId !== arr.id) return;
      const a = arr; arr = null;
      if (a.moveu) {
        a.f.classList.remove('arrastando'); salvarAtual();
        if (!st.view.querySelector('[data-e="realinhar"]')) montar();
      } else if (a.outro) { trocarLado(); montar(); escolherVaga(a.i); }
      else escolherVaga(a.i);
    };
    const onCancel = () => { if (arr) { arr.f.classList.remove('arrastando'); arr = null; } };
    // teclado: Enter/Espaço na ficha abre a escolha (o clique "de verdade" vem do pointerup)
    const onKey = (e) => {
      const f = e.target.closest('.ficha-j');
      if (!f || (e.key !== 'Enter' && e.key !== ' ')) return;
      e.preventDefault();
      if (f.dataset.o != null) { trocarLado(); montar(); escolherVaga(+f.dataset.o); } else escolherVaga(+f.dataset.i);
    };
    v.addEventListener('pointerdown', onDown);
    v.addEventListener('pointermove', onMove);
    v.addEventListener('pointerup', onUp);
    v.addEventListener('pointercancel', onCancel);
    v.addEventListener('keydown', onKey);
    return () => { v.removeEventListener('pointerdown', onDown); v.removeEventListener('pointermove', onMove); v.removeEventListener('pointerup', onUp); v.removeEventListener('pointercancel', onCancel); v.removeEventListener('keydown', onKey); };
  }

  function ligar() {
    const v = st.view;
    const onClick = (e) => {
      const b = e.target.closest('[data-e]');
      if (!b || b.tagName === 'SELECT' || b.tagName === 'INPUT' || b.tagName === 'FORM') return;
      const a = b.dataset.e;
      if (a === 'pegar') porNaVaga({ n: b.dataset.n, num: b.dataset.num === '' ? null : +b.dataset.num });
      else if (a === 'auto') autoEscalar();
      else if (a === 'ultima') { const u = ultimaDoTime(); if (u && aplicarUltima(u)) { montar(); aviso('Escalação do último jogo' + (u.contra ? ', contra ' + u.contra : '') + ': mexa à vontade'); } }
      else if (a === 'apagar-j') { apagarJogador(b.dataset.n); desenharElenco(); }
      else if (a === 'limpar') {
        const antes = { j: st.jogadores.slice(), p: st.pos };
        st.jogadores = new Array(11).fill(null); st.pos = null; st.vaga = -1; salvarAtual(); montar();
        aviso('Escalação limpa', { rotulo: 'Desfazer', acao: () => { st.jogadores = antes.j; st.pos = antes.p; salvarAtual(); montar(); } });
      } else if (a === 'cartoes') {
        try { localStorage.setItem(CHAVE_CART, cartoesOn() ? '0' : '1'); } catch (e) { /* sem armazenamento: vale só até recarregar */ }
        b.textContent = cartoesOn() ? 'Esconder cartões' : 'Mostrar cartões';
        desenharFichas(); const q = st.view.querySelector('[data-e=busca]'); desenharElenco(q ? q.value : '');
      } else if (a === 'modo') {
        if (b.dataset.m === 'confronto' && st.modo !== 'confronto') entrarConfronto();
        else if (b.dataset.m === 'time' && st.modo !== 'time') { st.modo = 'time'; st.vaga = -1; salvarAtual(); montar(); }
      } else if (a === 'lado') { if (!b.classList.contains('ativo')) { trocarLado(); montar(); } }
      else if (a === 'proximo') { if (confrontoProximo(true)) { st.vaga = -1; salvarAtual(); montar(); } }
      else if (a === 'mando') { st.casa = !st.casa; salvarAtual(); montar(); }
      else if (a === 'realinhar') { st.pos = null; salvarAtual(); montar(); }
      else if (a === 'partilhar') imagem();
      else if (a === 'salvar') salvarComo();
      else if (a === 'salvas') abrirSalvas();
    };
    const onChange = (e) => {
      const a = e.target.dataset.e;
      if (a === 'time') {
        st.time = st.dados.times.find((t) => t.id === e.target.value) || st.time;
        st.jogadores = new Array(11).fill(null); st.pos = null; st.vaga = -1;
        const u = ultimaDoTime();
        if (u) aplicarUltima(u);
        salvarAtual(); montar();
      } else if (a === 'esquema') {
        st.esquema = e.target.value; st.pos = null; st.vaga = -1; salvarAtual(); montar();
      }
    };
    const onInput = (e) => { if (e.target.dataset.e === 'busca') { const val = e.target.value; desenharElenco(val); const n = st.view.querySelector('[data-e="busca"]'); n.focus(); n.setSelectionRange(val.length, val.length); } };
    const onSubmit = (e) => {
      if (e.target.dataset.e !== 'livre') return;
      e.preventDefault();
      const f = e.target, n = f.n.value.trim().slice(0, 24);
      if (!n) { f.n.focus(); return; }
      const num = f.num.value.replace(/\D/g, '') === '' ? null : Math.min(99, +f.num.value.replace(/\D/g, ''));
      criarJogador(n, num, f.pos.value);
      if (st.vaga >= 0) porNaVaga({ n, num, pos: f.pos.value });
      else { desenharElenco(); aviso(n + ' entrou no elenco: toque para escalar'); }
    };
    v.addEventListener('click', onClick);
    v.addEventListener('change', onChange);
    v.addEventListener('input', onInput);
    v.addEventListener('submit', onSubmit);
    return () => { v.removeEventListener('click', onClick); v.removeEventListener('change', onChange); v.removeEventListener('input', onInput); v.removeEventListener('submit', onSubmit); };
  }

  // ------------------------------------------------------------------ salvas
  function salvarComo() {
    if (!st.jogadores.some(Boolean)) { aviso('Escale pelo menos um jogador'); return; }
    const todos = loadJson(KEY.escalacoes, {});
    const salvas = Array.isArray(todos.salvas) ? todos.salvas : [];
    salvas.unshift({ nome: st.time.nome + ' · ' + st.esquema, criado: new Date().toISOString(), time: st.time.id, esquema: st.esquema, jogadores: st.jogadores.slice(), pos: st.pos });
    todos.salvas = salvas.slice(0, 30);
    saveJson(KEY.escalacoes, todos);
    aviso('Escalação salva neste aparelho');
  }
  function abrirSalvas() {
    const salvas = (loadJson(KEY.escalacoes, {}).salvas || []).filter((s) => s && s.jogadores);
    const corpo = T.janela('Escalações salvas', salvas.length ? '<ul class="cenarios">' + salvas.map((s, k) => {
      const t = st.dados.times.find((x) => x.id === s.time);
      return '<li>' + (t && t.escudo ? '<img class="crest" src="midia/escudos/' + esc(t.escudo) + '.png" alt="" width="24" height="24">' : '') + '<div class="c-info"><b>' + esc(s.nome) + '</b><span>' + s.jogadores.filter(Boolean).length + ' jogadores · ' + new Date(s.criado).toLocaleDateString('pt-BR') + '</span></div>' +
        '<button class="btn" data-k="' + k + '" data-s="abrir">Abrir</button><button class="icon-btn" data-k="' + k + '" data-s="apagar" aria-label="Apagar ' + esc(s.nome) + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg></button></li>';
    }).join('') + '</ul>' : '<p class="nota">Nenhuma escalação salva ainda. Elas ficam guardadas neste aparelho.</p>');
    corpo.addEventListener('click', (e) => {
      const b = e.target.closest('[data-s]');
      if (!b) return;
      const todos = loadJson(KEY.escalacoes, {}), k = +b.dataset.k, s = (todos.salvas || [])[k];
      if (!s) return;
      if (b.dataset.s === 'abrir') {
        st.time = st.dados.times.find((t) => t.id === s.time) || st.time;
        st.esquema = ESQUEMAS[s.esquema] ? s.esquema : '4-3-3'; st.jogadores = s.jogadores.slice(); st.pos = s.pos || null; st.vaga = -1;
        salvarAtual(); T.fecharJanela(); montar();
      } else {
        todos.salvas.splice(k, 1); saveJson(KEY.escalacoes, todos); abrirSalvas();
      }
    });
  }

  // ------------------------------------------------------------------ imagem
  function imagem() {
    T.script('app/compartilhar.js').then(() => {
      const S = window.TNGCompartilhar;
      const mesa = st.modo === 'confronto' && st.outro;
      const casa = mesa ? (st.casa ? ladoAtual() : st.outro) : ladoAtual(), fora = mesa ? (st.casa ? st.outro : ladoAtual()) : null;
      const esc_ = (L) => (L && L.time.escudo ? S.imagem('midia/escudos/' + L.time.escudo + '.png') : null);
      return Promise.all([S.fontes(), esc_(casa), esc_(fora)]).then(([, escudo, escudo2]) => {
        const W = 1080, H = mesa ? 1920 : 1350, c = S.canvas(W, H), ctx = c.getContext('2d');
        if (mesa) {
          S.moldura(ctx, W, H, 'Mesa tática', casa.time.nome + ' × ' + fora.time.nome, 'Monte a sua em');
          if (escudo) ctx.drawImage(escudo, W - 64 - 210, 160, 96, 96);
          if (escudo2) ctx.drawImage(escudo2, W - 64 - 96, 160, 96, 96);
        } else {
          S.moldura(ctx, W, H, 'Minha escalação', st.time.nome + ' · ' + st.esquema, 'Monte a sua em');
          if (escudo) ctx.drawImage(escudo, W - 64 - 110, 150, 110, 110);
        }
        // campo
        const cx = 140, cy = 320, cw = W - 280, ch = H - 104 - 40 - cy;
        ctx.fillStyle = 'rgba(0,0,0,.16)'; ctx.fillRect(cx, cy, cw, ch);
        ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 3;
        const X = (f) => cx + f * cw, Y = (f) => cy + f * ch;
        ctx.strokeRect(X(0.03), Y(0.02), cw * 0.94, ch * 0.96);
        ctx.beginPath(); ctx.moveTo(X(0.03), Y(0.5)); ctx.lineTo(X(0.97), Y(0.5)); ctx.stroke();
        ctx.beginPath(); ctx.arc(X(0.5), Y(0.5), cw * 0.13, 0, Math.PI * 2); ctx.stroke();
        const ga = mesa ? 0.115 : 0.15, pa = mesa ? 0.042 : 0.055;    // grande e pequena área (o campo da mesa é mais comprido)
        ctx.strokeRect(X(0.22), Y(0.02), cw * 0.56, ch * ga); ctx.strokeRect(X(0.22), Y(0.98 - ga), cw * 0.56, ch * ga);
        ctx.strokeRect(X(0.37), Y(0.02), cw * 0.26, ch * pa); ctx.strokeRect(X(0.37), Y(0.98 - pa), cw * 0.26, ch * pa);
        const R = mesa ? 26 : 34, FN = mesa ? 27 : 34, FT = mesa ? 20 : 25, LH = mesa ? 28 : 34;
        const desenhar = (L, ehCasa) => {
        const cor = cores(L.time);
        (L.pos || ESQUEMAS[L.esquema]).forEach(([x0, y0], i) => {
          const [x, y] = mesa ? [ehCasa ? x0 : 1 - x0, mesaY(y0, ehCasa)] : [x0, y0];
          const j = L.jogadores[i], px = X(x), py = Y(y * 0.94 + 0.02);
          ctx.beginPath(); ctx.arc(px, py, R, 0, Math.PI * 2);
          ctx.fillStyle = j ? cor.fundo : 'rgba(255,255,255,.12)'; ctx.fill();
          ctx.lineWidth = 3; ctx.strokeStyle = j ? (cor.claro ? 'rgba(0,0,0,.4)' : 'rgba(255,255,255,.85)') : 'rgba(255,255,255,.5)'; ctx.stroke();
          ctx.textAlign = 'center';
          if (j && j.num != null) { ctx.fillStyle = cor.tinta; ctx.font = '900 ' + FN + 'px "Archivo Largo"'; ctx.fillText(String(j.num), px, py + FN * 0.35); }
          const nm = j ? curto(j.n) : SIGLA[posDaVaga(ESQUEMAS[L.esquema][i][1])];
          ctx.font = '800 ' + FT + 'px Archivo';
          const larg = Math.min(mesa ? 180 : 220, ctx.measureText(nm).width + 18);
          ctx.fillStyle = 'rgba(8,19,13,.72)';
          ctx.fillRect(px - larg / 2, py + R + 6, larg, LH);
          ctx.fillStyle = '#f4f6fb';
          S.textoCabe(ctx, nm, px, py + R + 6 + LH * 0.72, larg - 14, '800', FT);
        });
        };
        if (mesa) desenhar(fora, false);
        desenhar(casa, true);
        ctx.textAlign = 'left';
        window.TNG_IMAGEM = c;
        const corpo = T.janela('Compartilhar a escalação', '<div class="previa"><img alt="Prévia da imagem" src="' + c.toDataURL('image/png') + '"></div><div class="j-acoes"><button class="btn primario" data-p="enviar">Compartilhar a imagem</button></div>');
        corpo.querySelector('[data-p="enviar"]').onclick = () => S.enviar(c, 'escalacao-' + window.TNGElencosNome(mesa ? casa.time.nome + '-x-' + fora.time.nome : st.time.nome) + '.png', mesa ? 'Mesa tática: ' + casa.time.nome + ' × ' + fora.time.nome + '. Monte a sua:' : 'Minha escalação: ' + st.time.nome + ', no ' + st.esquema + '. Monte a sua:', T.urlBase() + '#/escalacao');
      });
    }).catch((e) => { T.reportError(e, 'imagem'); aviso('Não consegui gerar a imagem'); });
  }
  window.TNGElencosNome = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // ------------------------------------------------------------------ registro
  T.aba('escalacao', {
    titulo: 'Monte sua escalação',
    descricao: 'Monte a escalação do seu time ou da sua seleção em 8 esquemas táticos e compartilhe a imagem no WhatsApp.',
    render(view) {
      return carregar().then(() => {
        st.view = view;
        if (!st.time) restaurar();
        st.vaga = -1;
        montar();
        const soltar = ligarArraste();
        const desligar = ligar();
        window.TNG_ESC = st;
        return () => { desligar(); soltar(); st.view = null; };
      });
    },
  });
})();

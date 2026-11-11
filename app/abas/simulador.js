/* Aba Simulador do Brasileirão.
   Dados: ESPN ao vivo → cache do aparelho → retrato publicado (shared/espn.js).
   Regras e contas: shared/simulador-core.js (o mesmo núcleo testado no Node); Monte Carlo e
   "o que o meu time precisa" num Web Worker (shared/simulador-worker.js).
   Estado salvo (chaves são contrato): tng.placares, tng.cenarios, tng.prefs, tng.espn.cache. */
(function () {
  'use strict';
  const T = window.TNG;
  const { esc, KEY, loadJson, saveJson, aviso } = T;

  // ================================================================== nomes
  const CURTO = { athletico: 'Athletico', atleticomg: 'Atlético-MG', bragantino: 'Bragantino', sp: 'São Paulo', vasco: 'Vasco' };
  const FEMININO = { chapecoense: 1, pontepreta: 1, portuguesa: 1, ferroviaria: 1 };
  const nome = (t) => CURTO[t.slug] || t.nome;
  // cor principal e secundária de cada clube (só no cartão do meu time; nos jogos, só o escudo)
  const CORES = {
    flamengo: ['#c8102e', '#111111'], palmeiras: ['#006437', '#ffffff'], cruzeiro: ['#0038a8', '#ffffff'], fluminense: ['#7a0f2a', '#00613c'],
    athletico: ['#c8102e', '#111111'], bahia: ['#0047ab', '#e30613'], atleticomg: ['#111111', '#ffffff'], bragantino: ['#ffffff', '#e30613'],
    santos: ['#ffffff', '#111111'], sp: ['#e30613', '#111111'], botafogo: ['#111111', '#ffffff'], coritiba: ['#00593c', '#ffffff'],
    vasco: ['#111111', '#ffffff'], mirassol: ['#ffd200', '#00843d'], vitoria: ['#e30613', '#111111'], internacional: ['#e30613', '#ffffff'],
    corinthians: ['#111111', '#ffffff'], gremio: ['#0d80bf', '#111111'], remo: ['#0b1f4b', '#ffffff'], chapecoense: ['#00843d', '#ffffff'],
  };
  const claro = (c) => { const n = parseInt(c.slice(1), 16); return ((n >> 16) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114) > 160; };
  // cor que funciona sobre o azul-noite: a principal, a secundária se a principal for clara demais
  function corDo(t) {
    const c = CORES[t.slug];
    if (!c) return '#2b4bff';
    return claro(c[0]) ? (claro(c[1]) ? '#2b4bff' : c[1]) : c[0];
  }
  const art = (t) => (FEMININO[t.slug] ? 'a' : 'o');
  const o_ = (t) => art(t) + ' ' + nome(t);                       // "o Palmeiras"
  const de_ = (t) => (art(t) === 'a' ? 'da ' : 'do ') + nome(t);
  const com_ = (t) => 'com ' + o_(t);
  const para_ = (t) => (art(t) === 'a' ? 'para a ' : 'para o ') + nome(t);

  const ICON = {
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4l14 8-14 8z"/></svg>',
    escudo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/></svg>',
    olho: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    olhoX: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c5 0 9 4.5 10 7a12 12 0 0 1-2.6 3.6M6.3 6.3C4 7.7 2.6 9.9 2 12c1 2.5 5 7 10 7 1.6 0 3.1-.4 4.4-1.1"/></svg>',
    partilha: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/></svg>',
    pasta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
    lixo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    dado: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r=".6" fill="currentColor"/><circle cx="15" cy="15" r=".6" fill="currentColor"/><circle cx="15" cy="9" r=".6" fill="currentColor"/><circle cx="9" cy="15" r=".6" fill="currentColor"/></svg>',
    revela: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16M7 16V9M12 16V5M17 16v-4"/></svg>',
  };

  // ================================================================== estado
  const st = {
    base: null, liga: null, regras: null, fonte: 'publicado', quando: null,
    comps: null, comp: null,        // competições (shared/competicoes.json) e a escolhida
    L: null, M: null,
    p: {}, sim: {},                 // placares do usuário e quais foram sorteados
    prefs: null, aba: 'jogos', meu: null, soMeus: true,
    compartilhado: null,            // placares vindos de um link (não salvos até "usar")
    chances: null, chancesVersao: -1, versao: 0,
    precisa: null, precisaVersao: '',
    view: null, worker: null, pedidos: {}, nPedido: 0,
  };
  const PREFS_PADRAO = { forma: 5, esconder: false, ordem: 'baixo', revelacao: 'auto', N: 10000, visual: 'lado', visualV: 2 };

  // Série A usa as chaves de sempre; as outras competições ganham um sufixo
  const k_ = (k) => (st.comp && st.comp.id !== 'seriea' ? k + '.' + st.comp.id : k);
  const rotaBase = () => '#/simulador' + (st.comp && st.comp.id !== 'seriea' ? '/' + st.comp.id : '');
  const TITULO = { seriea: 'Simulador do Brasileirão', serieb: 'Simulador da Série B', premier: 'Simulador da Premier League', laliga: 'Simulador da La Liga', italiano: 'Simulador do Italiano', bundesliga: 'Simulador da Bundesliga', frances: 'Simulador do Francês' };
  const ehSerieA = () => !st.comp || st.comp.id === 'seriea';

  function carregarPrefs() {
    st.prefs = Object.assign({}, PREFS_PADRAO, loadJson(KEY.prefs, {}));
    // 'lista' era o padrão antigo (gravado sem a pessoa escolher): passa para o novo padrão, lado a lado
    if (st.prefs.visualV !== 2) { if (st.prefs.visual === 'lista') st.prefs.visual = 'lado'; st.prefs.visualV = 2; }
  }
  // lado a lado: jogos e tabela juntos também no celular; lista: uma coluna com abas; cartões: o formato grande
  const ladoALado = () => st.prefs.visual === 'lado';
  function salvarPrefs() { saveJson(KEY.prefs, st.prefs); }
  function salvarPlacares() {
    if (st.compartilhado) return;            // olhando um cenário de outra pessoa: não grava por cima do seu
    saveJson(k_(KEY.placares), { temporada: st.liga.temporada, p: st.p, sim: st.sim });
  }

  // ================================================================== dados (três camadas)
  function json(url) { return fetch(url).then((r) => { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }); }

  function carregarComps() {
    if (st.comps) return Promise.resolve(st.comps);
    // só aparecem as competições que já têm o retrato publicado (o Actions grava os arquivos)
    return json('shared/competicoes.json').then((c) => Promise.all(c.lista.map((x) => (x.id === 'seriea' ? true
      : fetch(x.dados, { method: 'HEAD' }).then((r) => r.ok, () => false)))).then((ok) => {
      st.todas = c.lista;
      st.comps = c.lista.filter((x, k) => ok[k]);
      return st.todas;
    }));
  }
  function carregarDados(id) {
    const comp = st.todas.find((c) => c.id === id) || st.todas[0];
    if (st.base && st.comp && st.comp.id === comp.id) return Promise.resolve();
    const antes = st.comp;
    return Promise.all([json(comp.dados), json(comp.regras)]).then(([liga, regras]) => {
      if (antes && antes !== comp && st.worker) { st.worker.terminate(); st.worker = null; st.pedidos = {}; }
      st.comp = comp; st.p = {}; st.sim = {}; st.chances = null; st.precisa = null; st.chancesVersao = -1; st.precisaVersao = '';
      st.base = liga; st.regras = regras;
      ultimaBusca = 0;
      const cache = loadJson(k_(KEY.espnCache), null);
      if (cache && cache.liga && cache.liga.temporada === liga.temporada && cache.liga.baixado_em > liga.baixado_em && Array.isArray(cache.liga.jogos) && cache.liga.jogos.length >= liga.jogos.length - 5) {
        st.liga = cache.liga; st.fonte = 'guardado'; st.quando = cache.liga.baixado_em;
      } else {
        st.liga = liga; st.fonte = 'publicado'; st.quando = liga.baixado_em;
      }
      const salvo = loadJson(k_(KEY.placares), {});
      if (salvo && salvo.temporada === liga.temporada) { st.p = salvo.p || {}; st.sim = salvo.sim || {}; }
      recalcular();
      if (ehSerieA()) migrarAntigos();
    });
  }

  // Placares, cenários e preferências da versão antiga em arquivo único (chaves tng-rascunho-v1/v2 e
  // tng-cenarios-v1/v2) passam para as chaves novas uma vez; as antigas só saem depois de gravar.
  const ANTIGAS = ['tng-rascunho-v2', 'tng-rascunho-v1', 'tng-cenarios-v2', 'tng-cenarios-v1'];
  function migrarAntigos() {
    const ler = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
    const v = ANTIGAS.map(ler);
    if (v.every((x) => x == null)) return;
    try {
      const mig = window.TNGCore.migrarAntigos(st.L, { rascunhos: [v[0], v[1]], cenarios: [v[2], v[3]], agora: new Date().toISOString() });
      if (mig.placares && !Object.keys(st.p).length) { st.p = mig.placares.p; st.sim = mig.placares.sim; salvarPlacares(); }
      if (mig.prefs && !loadJson(KEY.prefs, null)) { Object.assign(st.prefs, mig.prefs); salvarPrefs(); }
      if (mig.cenarios.length) {
        const todos = loadJson(KEY.cenarios, { itens: [] });
        todos.itens = todos.itens || [];
        const ja = {};
        todos.itens.forEach((c) => { if (c) ja[c.nome + '|' + c.criado] = 1; });
        todos.itens = todos.itens.concat(mig.cenarios.filter((c) => !ja[c.nome + '|' + c.criado]));
        saveJson(KEY.cenarios, todos);
        const conferido = loadJson(KEY.cenarios, { itens: [] }).itens || [];
        if (conferido.length < todos.itens.length) return;      // não gravou: mantém as chaves antigas
      }
      ANTIGAS.forEach((k) => { try { localStorage.removeItem(k); } catch (e) { /* sem armazenamento */ } });
      st.versao++;
    } catch (e) { T.reportError(e, 'migrar'); }
  }

  let buscandoESPN = false, ultimaBusca = 0;
  function aoVivo() {
    if (/[?&]offline\b/.test(location.search) || T.ARTIFACT || buscandoESPN || Date.now() - ultimaBusca < 5 * 60000 || !window.TNGEspn) return;
    buscandoESPN = true;
    desenharCarimbo();
    const comp = st.comp;
    window.TNGEspn.atualizar(st.liga, { liga: comp.espn }).then((m) => {
      if (st.comp !== comp) { buscandoESPN = false; return; }      // trocou de competição no meio
      ultimaBusca = Date.now();
      delete m.mudou;
      saveJson(k_(KEY.espnCache), { liga: m });
      const mudou = JSON.stringify(m.jogos) !== JSON.stringify(st.liga.jogos);
      st.liga = m; st.fonte = 'ao vivo'; st.quando = m.baixado_em;
      buscandoESPN = false;
      if (mudou) { recalcular(); if (st.view) montar(); } else desenharCarimbo();
    }).catch((e) => { buscandoESPN = false; T.reportError(e, 'espn'); desenharCarimbo(); });
  }

  function paramsModelo() { return Object.assign({}, window.TNGCore.PARAMS_PADRAO, st.prefs.forma === 3 ? window.TNGCore.PARAMS_FORMA3 : {}); }

  function recalcular() {
    const C = window.TNGCore;
    st.L = C.preparar(st.liga, st.regras);
    st.M = C.modelo(st.L, paramsModelo());
    // placares de jogos que já aconteceram saem (vale o resultado real)
    const abertos = {};
    st.L.jogos.forEach((j) => { if (!j.feito) abertos[j.chave] = 1; });
    Object.keys(st.p).forEach((k) => { if (!abertos[k]) { delete st.p[k]; delete st.sim[k]; } });
    st.versao++;
  }

  // ================================================================== ajudantes
  const restantes = () => st.L.jogos.filter((j) => !j.feito);
  const placares = () => st.compartilhado || st.p;
  const alvoPlacares = () => st.compartilhado || st.p;
  const placarDe = (j) => window.TNGCore.placarDe(j, placares());
  const timePorSlug = (s) => st.L.times.find((t) => t.slug === s) || null;
  // sigla de 3 letras (a ESPN às vezes manda 4, como REMO)
  const SIGLA = { remo: 'REM', bragantino: 'RBB', athletico: 'CAP', atleticomg: 'CAM', sp: 'SAO', chapecoense: 'CHA', coritiba: 'CFC' };
  const sig = (t) => esc(SIGLA[t.escudo] || String(t.abrev || nome(t)).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase());
  const crest = (t, cls) => (t.escudo ? '<img class="' + (cls || 'crest') + '" src="midia/escudos/' + esc(t.escudo) + '.png" alt="" width="24" height="24" loading="lazy">'
    : '<span class="' + (cls || 'crest') + ' disco" aria-hidden="true">' + esc((t.abrev || t.nome || '?').slice(0, 3)) + '</span>');
  const pct = (x) => (x == null ? '–' : x <= 0 ? '–' : x < 0.005 ? '<1%' : x > 0.995 && x < 1 ? '>99%' : Math.round(x * 100) + '%');
  const BR = { timeZone: 'America/Sao_Paulo' };
  const fmtDia = (iso) => new Date(iso).toLocaleDateString('pt-BR', Object.assign({ weekday: 'short', day: '2-digit', month: '2-digit' }, BR)).replace('.', '').replace(/^./, (c) => c.toUpperCase());
  const fmtHora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', Object.assign({ hour: '2-digit', minute: '2-digit' }, BR)).replace(':', 'h');
  const sorteio = () => window.TNGCore.rng((Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0);
  function quandoTxt(iso) {
    const d = new Date(iso);
    if (isNaN(d)) return '';
    const hoje = new Date().toDateString() === d.toDateString();
    return (hoje ? 'hoje' : 'em ' + d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })) + ', às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).replace(':', 'h');
  }
  function tabelaAtual() { return window.TNGCore.tabela(st.L, placares()); }
  function tabelaReal() { return window.TNGCore.tabela(st.L, {}); }
  const resultado = (p) => (p[0] > p[1] ? 0 : p[0] === p[1] ? 1 : 2);

  function grupos(lista) {
    const out = [], porChave = {};
    lista.forEach((j) => {
      let k, titulo;
      if (!st.L.rodadasConfiaveis) {
        const d = new Date(j.data);
        const seg = new Date(d); seg.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
        k = 's' + seg.toISOString().slice(0, 10);
        titulo = 'Semana de ' + seg.toLocaleDateString('pt-BR', Object.assign({ day: '2-digit', month: '2-digit' }, BR));
      } else if (j.atrasado) { k = 'atr'; titulo = 'Jogo atrasado'; }
      else { k = 'r' + String(j.rodada).padStart(2, '0'); titulo = 'Rodada ' + j.rodada; }
      if (!porChave[k]) { porChave[k] = { k, titulo, rodada: j.rodada, jogos: [] }; out.push(porChave[k]); }
      porChave[k].jogos.push(j);
    });
    out.sort((a, b) => (a.k === 'atr' ? -1 : b.k === 'atr' ? 1 : a.k < b.k ? -1 : a.k > b.k ? 1 : 0));
    out.forEach((g) => {
      const d2 = new Date(g.jogos[g.jogos.length - 1].data);
      const dia = (iso) => new Date(iso).toLocaleDateString('pt-BR', Object.assign({ day: 'numeric' }, BR));
      const fim = d2.toLocaleDateString('pt-BR', Object.assign({ day: 'numeric', month: 'long' }, BR));
      g.periodo = (dia(g.jogos[0].data) === dia(g.jogos[g.jogos.length - 1].data) ? '' : dia(g.jogos[0].data) + ' a ') + fim;
      if (g.k === 'atr') g.periodo = 'da rodada ' + g.jogos[0].rodada + ' · ' + fim;
    });
    return out;
  }

  // ================================================================== montar a tela
  function montar() {
    const v = st.view;
    if (!v) return;
    const meu = st.meu;
    const faltam = restantes().length;
    const opcoes = st.L.times.slice().sort((a, b) => nome(a).localeCompare(nome(b), 'pt-BR')).map((t) =>
      '<option value="' + esc(t.slug) + '"' + (meu && meu.i === t.i ? ' selected' : '') + '>' + esc(nome(t)) + '</option>').join('');
    v.innerHTML =
      '<div class="sim-topo"><div class="page-head">' + seletorComp() + '<div class="kicker">' + (ehSerieA() ? 'Brasileirão 2026 · Série A' : esc(st.comp.rotulo)) + '</div>' +
      '<h1>' + (meu ? 'Simulador ' + esc(de_(meu)) : esc(TITULO[st.comp.id] || 'Simulador')) + '</h1>' +
      '<p id="sim-frase">' + (faltam ? 'Faltam <b class="num">' + faltam + '</b> jogos. Chute os placares e veja como termina a tabela.' : 'O campeonato terminou. Esta é a tabela final.') + '</p>' +
      '<div class="carimbo" id="carimbo"></div></div><div class="resumo" id="resumo" aria-live="polite"></div></div>' +
      (st.compartilhado ? '<div class="faixa"><div><b>Você está vendo o cenário de outra pessoa.</b><span>Os seus placares continuam guardados.</span></div>' +
        '<div class="faixa-acoes"><button class="btn primario" data-a="revelar">' + ICON.revela + 'Revelar a tabela</button><button class="btn" data-a="usar-comp">Usar e editar</button><button class="link-btn" data-a="sair-comp">Voltar ao meu</button></div></div>' : '') +
      '<div class="acoes sim-acoes">' +
      '<button class="btn primario" data-a="simular">' + ICON.play + (meu ? 'Simular os outros' : 'Simular o resto') + '</button>' +
      '<label class="btn sel-time">' + ICON.escudo + '<select data-a="meu" aria-label="Escolher o meu time"><option value="">Nenhum</option>' + opcoes + '</select></label>' +
      '</div>' +
      '<div class="ferr"><button class="link-btn" data-a="partilhar">' + ICON.partilha + 'Compartilhar</button>' +
      '<button class="link-btn" data-a="cenarios">' + ICON.pasta + 'Cenários</button>' +
      '<button class="link-btn" data-a="limpar">' + ICON.lixo + 'Limpar</button>' +
      '<a class="link-btn so-estreito" href="#/estatisticas">' + ICON.revela + 'Estatísticas</a></div>' +
      '<div class="vis-sel" role="group" aria-label="Como ver os jogos"><span>Ver</span>' +
      [['lado', 'Jogos + tabela'], ['lista', 'Lista'], ['cartoes', 'Cartões']].map(([k, n]) =>
        '<button type="button" data-vis="' + k + '" aria-pressed="' + (st.prefs.visual === k) + '">' + n + '</button>').join('') + '</div>' +
      '<div class="seg seg-cel" role="tablist" aria-label="Partes do simulador">' +
      (!ladoALado() ? [['jogos', 'Jogos'], ['tabela', 'Tabela'], ['chances', meu ? 'Precisa' : 'Chances']]
        : [['jogos', 'Jogos e tabela'], ['chances', meu ? 'O que precisa' : 'Chances']]).map(([k, n]) =>
        '<button role="tab" data-aba="' + k + '" aria-selected="' + (st.aba === k || (k === 'jogos' && st.aba === 'tabela' && ladoALado())) + '">' + n + '</button>').join('') + '</div>' +
      '<div id="meu-topo"></div>' +
      '<div class="sim-cols' + (st.prefs.visual === 'cartoes' ? '' : ' compacto') + (ladoALado() ? ' lado' : '') + '" data-aba="' + st.aba + '">' +
      '<section class="col-jogos" aria-label="Jogos que faltam" id="col-jogos"></section>' +
      '<section class="col-lado" id="col-lado"><div class="seg seg-lado" role="tablist" aria-label="Tabela ou chances">' +
      [['tabela', 'Classificação'], ['chances', meu ? 'O que precisa' : 'Chances']].map(([k, n]) =>
        '<button role="tab" data-aba="' + k + '" aria-selected="' + (st.aba === k || (k === 'tabela' && st.aba === 'jogos')) + '">' + esc(n) + '</button>').join('') +
      '</div><div id="painel-tabela"></div><div id="painel-chances"></div></section></div>' +
      '<div class="barra-revelar" id="barra-revelar" hidden><button class="btn primario" data-a="revelar">' + ICON.revela + 'Revelar a tabela final</button></div>';
    desenharCarimbo();
    desenharResumo();
    desenharJogos();
    desenharTabela();
    desenharChances();
    atualizarBarraRevelar();
  }

  // troca de competição: chips no topo (a Série A é a casa)
  function seletorComp() {
    if (st.comps.length < 2) return '';
    return '<nav class="comp-sel" aria-label="Competição">' + st.comps.map((c) =>
      '<a href="#/simulador' + (c.id === 'seriea' ? '' : '/' + c.id) + '"' + (c.id === st.comp.id ? ' aria-current="page"' : '') + '>' + esc(c.curto) + '</a>').join('') + '</nav>';
  }

  // Letreiro dos próximos jogos (corre sozinho; parado e rolável quando o aparelho pede menos movimento)
  function letreiro() {
    const prox = restantes().slice().sort((x, y) => (x.data < y.data ? -1 : x.data > y.data ? 1 : 0)).slice(0, 12);
    if (prox.length < 3) return '';
    const item = (j) => '<li><span class="lt-dia">' + esc(fmtDia(j.data)) + '</span>' + crest(st.L.times[j.h]) + '<b>' + esc(st.L.times[j.h].abrev || '') + '</b><i>x</i><b>' + esc(st.L.times[j.a].abrev || '') + '</b>' + crest(st.L.times[j.a]) + '</li>';
    const lista = prox.map(item).join('');
    return '<div class="letreiro" role="region" aria-label="Próximos jogos"><ul class="lt-trilho">' + lista + '</ul><ul class="lt-trilho" aria-hidden="true">' + lista + '</ul></div>';
  }

  // Resumo no topo: líder (ou campeão), quem mais vai à Libertadores e quem cai, mudando a cada
  // placar. Com a tabela escondida, não entrega nada.
  let resumoAntes = '';
  function desenharResumo() {
    const el = st.view && st.view.querySelector('#resumo'), frase = st.view && st.view.querySelector('#sim-frase');
    if (!el) return;
    const tot = restantes().length, feitos = restantes().filter((j) => placarDe(j)).length;
    if (st.prefs.esconder) {
      el.innerHTML = '<div class="rs-oculto"><b>?</b><span>Tabela escondida. Sem espiar.</span></div>';
      if (frase) frase.innerHTML = feitos < tot ? 'Faltam <b class="num">' + (tot - feitos) + '</b> placares. Preencha tudo e revele a tabela, time a time.' : 'Tudo preenchido. Hora da revelação!';
      resumoAntes = '';
      return;
    }
    const tab = tabelaAtual(), lider = st.L.times[tab[0].i], fim = !tot || feitos === tot;
    const lib = st.regras.zonas.find((z) => z.id === 'lib'), rb = st.regras.zonas.find((z) => z.id === 'rb');
    const g = tab.slice(1, lib ? lib.ate : 4), z = rb ? tab.slice(rb.de - 1, rb.ate) : [];
    const placa = (x) => '<span class="rs-placa" title="' + esc(nome(st.L.times[x.i])) + '">' + crest(st.L.times[x.i]) + '</span>';
    if (frase) {
      frase.innerHTML = !tot ? 'O campeonato terminou. Esta é a tabela final.'
        : feitos === tot ? 'Na sua simulação, <b>' + esc(o_(lider)) + '</b> é ' + (art(lider) === 'a' ? 'a campeã' : 'o campeão') + '.'
          : feitos ? 'Com os seus palpites, <b>' + esc(o_(lider)) + '</b> lidera. Faltam <b class="num">' + (tot - feitos) + '</b> placares.'
            : 'Faltam <b class="num">' + tot + '</b> jogos. Chute os placares e veja como termina a tabela.';
    }
    el.innerHTML = '<div class="rs-lider"><small>' + (fim && tot ? (art(lider) === 'a' ? 'Campeã' : 'Campeão') + ' na sua simulação' : feitos ? 'Líder com os seus palpites' : 'Líder hoje') + '</small>' +
      '<div class="rs-time"><span class="rs-placa g">' + crest(lider) + '</span><div><b>' + esc(nome(lider)) + '</b><span class="num">' + tab[0].pts + ' pontos</span></div></div></div>' +
      '<div class="rs-grupos"><div><small><i style="background:var(--z-lib)"></i>' + esc(st.regras.rotulo_grupo || 'Também na Libertadores') + '</small><div class="rs-crs">' + g.map(placa).join('') + '</div></div>' +
      '<div><small><i style="background:var(--z-rb)"></i>' + (fim && tot ? 'Rebaixados' : 'Caem') + '</small><div class="rs-crs">' + z.map(placa).join('') + '</div></div></div>';
    const chave = [tab[0].i].concat(g.map((x) => x.i), z.map((x) => x.i)).join();
    if (resumoAntes && chave !== resumoAntes && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && el.animate) {
      el.querySelectorAll('.rs-placa').forEach((c, k) => c.animate([{ transform: 'scale(.6)', opacity: 0.2 }, { transform: 'none', opacity: 1 }], { duration: 380, delay: k * 25, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'backwards' }));
    }
    resumoAntes = chave;
  }

  function desenharCarimbo() {
    const el = st.view && st.view.querySelector('#carimbo');
    if (!el) return;
    const quando = quandoTxt(st.quando);
    // com a ESPN respondendo, nada de carimbo; sem conexão, avisa de quando são os dados
    el.hidden = st.fonte !== 'guardado' || buscandoESPN;
    el.className = 'carimbo';
    el.innerHTML = el.hidden ? '' : '<i></i>' + esc('Dados de ' + quando.replace(/^em /, '') + ' · sem conexão com a ESPN');
  }

  // ---------------------------------------------------------------- jogos
  function desenharJogos() {
    const col = st.view.querySelector('#col-jogos');
    const meu = st.meu;
    let lista = restantes();
    const total = lista.length;
    if (meu && st.soMeus) lista = lista.filter((j) => j.h === meu.i || j.a === meu.i);
    const feitos = restantes().filter((j) => placarDe(j)).length;
    const gs = grupos(lista);
    let html = '<div class="progresso"><div class="prog-txt"><b class="num">' + feitos + '</b> de <span class="num">' + total + '</span> jogos com placar</div>' +
      '<div class="prog-barra" role="progressbar" aria-valuemin="0" aria-valuemax="' + total + '" aria-valuenow="' + feitos + '" aria-label="Jogos preenchidos"><i style="width:' + (total ? (100 * feitos / total) : 100) + '%"></i></div></div>';
    let heroi = '';
    if (meu) {
      // cartão do time na cor do clube, com a situação real de hoje
      const real = tabelaReal().find((x) => x.i === meu.i);
      const jogosMeu = total ? restantes().filter((j) => j.h === meu.i || j.a === meu.i).length : 0;
      const f5 = window.TNGCore.forma(st.L, {}, meu.i, 5);
      const NOME_F = { V: 'vitória', E: 'empate', D: 'derrota' };
      heroi += '<div class="meu-heroi" style="--clube:' + corDo(meu) + '"><span class="rs-placa g">' + crest(meu) + '</span><div class="mh-txt"><b>' + esc(nome(meu)) + '</b>' +
        '<dl><div><dt>Hoje</dt><dd class="num">' + real.pos + 'º</dd></div><div><dt>Pontos</dt><dd class="num">' + real.pts + '</dd></div>' +
        '<div><dt>Faltam</dt><dd class="num">' + jogosMeu + (jogosMeu === 1 ? ' jogo' : ' jogos') + '</dd></div><div><dt>Em disputa</dt><dd class="num">' + (3 * jogosMeu) + ' pts</dd></div>' +
        '<div><dt>Últimos 5</dt><dd><span class="forma" role="img" aria-label="' + f5.map((r) => NOME_F[r]).join(', ') + '">' + f5.map((r) => '<i class="' + r + '"></i>').join('') + '</span></dd></div></dl>' +
        '<span id="meu-resumo"></span></div>' +
        '<div class="meu-acoes"><button class="link-btn" data-a="so-meus">' + (st.soMeus ? 'Ver todos os jogos' : 'Só os jogos ' + esc(de_(meu))) + '</button>' +
        '<a class="link-btn" href="#/simulador">Sair</a></div></div>';
    }
    if (gs.length > 1) {
      html += '<nav class="rodadas" aria-label="Ir para a rodada">' + gs.map((g) => {
        const f = g.jogos.filter((j) => placarDe(j)).length;
        const rot = g.k === 'atr' ? (g.jogos.length > 1 ? 'Atrasados' : 'Atrasado') : g.k[0] === 's' ? g.titulo.replace('Semana de ', '') : g.rodada + 'ª';
        return '<a href="#" data-ir="' + g.k + '" aria-label="' + esc(g.titulo) + ', ' + f + ' de ' + g.jogos.length + ' preenchidos"><b>' + esc(rot) + '</b><small>' + f + '/' + g.jogos.length + '</small><span class="rd-prog"><i style="width:' + (100 * f / g.jogos.length) + '%"></i></span></a>';
      }).join('') + '</nav>';
    }
    st.view.querySelector('#meu-topo').innerHTML = heroi;
    if (!total) html += '<p class="nota">Todos os jogos já foram disputados.</p>';
    gs.forEach((g) => {
      html += '<div class="sec-title" id="g-' + g.k + '"><h2>' + esc(g.titulo) + '</h2><small>' + esc(g.periodo) + '</small></div><ul class="jogos">' + g.jogos.map(cardJogo).join('') + '</ul>';
    });
    html += '<details class="como"><summary>Como as probabilidades são calculadas</summary>' +
      '<p>Cada jogo tem gols esperados para os dois lados, a partir do ataque e da defesa de cada time na temporada (em casa e fora, puxados para a média da liga), da campanha (pontos por jogo) e da forma recente. Os gols seguem uma distribuição de Poisson, com um pequeno ajuste para empates. Os pesos foram escolhidos testando o modelo nos 339 jogos já disputados, sempre só com o que se sabia antes de cada jogo.</p>' +
      '<fieldset class="opc"><legend>Forma recente</legend>' +
      [5, 3].map((n) => '<label><input type="radio" name="forma" value="' + n + '"' + (st.prefs.forma === n ? ' checked' : '') + '> últimos ' + n + ' jogos</label>').join('') +
      '</fieldset><p class="nota">Toque numa das porcentagens de um jogo para preencher o placar mais provável daquele resultado; toque de novo para desfazer.</p></details>';
    col.innerHTML = html;
    atualizarResumoMeu();
  }

  function cardJogo(j) {
    const h = st.L.times[j.h], a = st.L.times[j.a], p = st.M.prob(j.h, j.a), f = placarDe(j);
    const sorteado = f && st.sim[j.chave] && !st.compartilhado;
    const res = f ? resultado(f) : -1;
    const meu = st.meu;
    const ao = (st.liga.jogos.find((x) => String(x.id) === j.id) || {}).ao_vivo;
    const tag = ao ? '<span class="tag vivo">ao vivo ' + ao.gm + '×' + ao.gv + '</span>'
      : j.status === 'STATUS_POSTPONED' ? '<span class="tag">adiado</span>'
        : f ? '<span class="tag' + (sorteado ? ' sorteado' : '') + '">' + (sorteado ? 'sorteado' : 'seu placar') + '</span>' : '';
    const seg = (i, w, cor, txt, rot) => '<button type="button" data-r="' + i + '" style="flex:' + Math.max(w, 0.18).toFixed(3) + ';--c:var(' + cor + ')"' + (res === i ? ' class="pick" aria-pressed="true"' : ' aria-pressed="false"') + ' aria-label="' + esc(rot) + ', ' + pct(w) + '. Preencher o placar mais provável">' + txt + '</button>';
    const time = (t) => '<div class="time' + (meu && meu.i === t.i ? ' meu' : '') + '">' + crest(t) + '<span>' + esc(nome(t)) + '</span><abbr class="sig" title="' + esc(nome(t)) + '">' + sig(t) + '</abbr></div>';
    const quando = j.horario ? fmtDia(j.data) + ' · ' + fmtHora(j.data) : fmtDia(j.data) + ' · horário a definir';
    return '<li class="jogo' + (f ? (sorteado ? ' sorteado' : ' set') : '') + '" data-c="' + j.chave + '">' +
      '<div class="j-meta"><span>' + quando + '</span>' + tag + '<button type="button" class="dado-mini" data-sortear aria-label="Sortear o placar deste jogo">' + ICON.dado + '</button></div>' +
      '<div class="j-linha">' + time(h) +
      '<div class="placar"><input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" data-l="0" aria-label="Gols ' + esc(de_(h)) + '" value="' + (f ? f[0] : '') + '">' +
      '<i aria-hidden="true">×</i><input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" data-l="1" aria-label="Gols ' + esc(de_(a)) + '" value="' + (f ? f[1] : '') + '"></div>' +
      time(a) + '</div>' +
      '<div class="pm" role="group" aria-label="Ajustar o placar">' +
      '<button type="button" data-g="0" data-d="-1" aria-label="Tirar um gol ' + esc(de_(h)) + '">−</button><button type="button" data-g="0" data-d="1" aria-label="Somar um gol ' + esc(de_(h)) + '">+</button>' +
      '<button type="button" class="dado" data-sortear aria-label="Sortear o placar deste jogo">' + ICON.dado + '</button>' +
      '<button type="button" data-g="1" data-d="-1" aria-label="Tirar um gol ' + esc(de_(a)) + '">−</button><button type="button" data-g="1" data-d="1" aria-label="Somar um gol ' + esc(de_(a)) + '">+</button></div>' +
      '<div class="pnum" aria-hidden="true"><span>' + pct(p.ph) + '</span><span data-x="' + pct(p.pd) + '">empate ' + pct(p.pd) + '</span><span>' + pct(p.pa) + '</span></div>' +
      '<div class="prob" style="--ph:' + (100 * p.ph).toFixed(1) + '%;--pd:' + (100 * (p.ph + p.pd)).toFixed(1) + '%">' + seg(0, p.ph, '--p-home', pct(p.ph), 'Vitória ' + de_(h)) + seg(1, p.pd, '--p-draw', '<span class="lbl">empate </span>' + pct(p.pd), 'Empate') + seg(2, p.pa, '--p-away', pct(p.pa), 'Vitória ' + de_(a)) + '</div></li>';
  }

  // atualiza um cartão sem redesenhar a lista (o teclado continua no lugar)
  function atualizarCard(chave) {
    const li = st.view.querySelector('.jogo[data-c="' + chave + '"]');
    const j = st.L.jogos.find((x) => x.chave === chave);
    if (!li || !j) return;
    const f = placarDe(j), sorteado = f && st.sim[chave] && !st.compartilhado;
    li.classList.toggle('set', !!f && !sorteado);
    li.classList.toggle('sorteado', !!sorteado);
    const res = f ? resultado(f) : -1;
    li.querySelectorAll('.prob button').forEach((b) => { const on = +b.dataset.r === res; b.classList.toggle('pick', on); b.setAttribute('aria-pressed', on); });
    const meta = li.querySelector('.j-meta');
    const velha = meta.querySelector('.tag:not(.vivo)');
    if (velha) velha.remove();
    if (f && !meta.querySelector('.vivo')) meta.querySelector('.dado-mini').insertAdjacentHTML('beforebegin', '<span class="tag' + (sorteado ? ' sorteado' : '') + '">' + (sorteado ? 'sorteado' : 'seu placar') + '</span>');
    const ins = li.querySelectorAll('input');
    if (f) {
      if (document.activeElement !== ins[0]) ins[0].value = f[0];
      if (document.activeElement !== ins[1]) ins[1].value = f[1];
    }
  }

  function atualizarProgresso() {
    const el = st.view.querySelector('.progresso');
    if (!el) return;
    // progresso de cada rodada no seletor
    const meu = st.meu;
    let lista = restantes();
    if (meu && st.soMeus) lista = lista.filter((j) => j.h === meu.i || j.a === meu.i);
    grupos(lista).forEach((g) => {
      const a = st.view.querySelector('.rodadas [data-ir="' + g.k + '"]');
      if (!a) return;
      const f = g.jogos.filter((j) => placarDe(j)).length;
      a.querySelector('small').textContent = f + '/' + g.jogos.length;
      a.querySelector('.rd-prog i').style.width = (100 * f / g.jogos.length) + '%';
      a.setAttribute('aria-label', g.titulo + ', ' + f + ' de ' + g.jogos.length + ' preenchidos');
    });
    const tot = restantes().length, feitos = restantes().filter((j) => placarDe(j)).length;
    el.querySelector('.prog-txt b').textContent = feitos;
    const bar = el.querySelector('.prog-barra');
    bar.setAttribute('aria-valuenow', feitos);
    bar.querySelector('i').style.width = (tot ? 100 * feitos / tot : 100) + '%';
  }

  function atualizarResumoMeu() {
    const el = st.view && st.view.querySelector('#meu-resumo');
    if (!el || !st.meu) return;
    const tab = tabelaAtual(), x = tab.find((q) => q.i === st.meu.i);
    const jogos = restantes().filter((j) => j.h === st.meu.i || j.a === st.meu.i);
    const meus = jogos.filter((j) => placarDe(j)).length;
    el.textContent = (st.prefs.esconder || !meus ? '' : 'Com os seus palpites: ' + x.pos + 'º lugar, ' + x.pts + ' pontos · ') + meus + ' de ' + jogos.length + ' jogos preenchidos';
  }

  // ---------------------------------------------------------------- tabela
  function desenharTabela() {
    const el = st.view.querySelector('#painel-tabela');
    const faltam = restantes().filter((j) => !placarDe(j)).length;
    let html = '<div class="sec-title"><h2>Classificação</h2><button class="link-btn" data-a="esconder" aria-pressed="' + st.prefs.esconder + '">' +
      (st.prefs.esconder ? ICON.olho + 'Mostrar' : ICON.olhoX + 'Esconder até o fim') + '</button></div>';
    if (st.prefs.esconder) {
      html += '<div class="capa"><div class="capa-in"><b>A tabela está escondida</b><span>' +
        (faltam ? 'Faltam <b class="num">' + faltam + '</b> placares. Preencha tudo e revele a tabela final, time a time.' : 'Tudo preenchido. Hora da revelação!') + '</span>' +
        '<button class="btn primario" data-a="revelar">' + ICON.revela + (faltam ? 'Sortear o que falta e revelar' : 'Revelar a tabela final') + '</button></div></div>';
    } else {
      html += tabelaHtml(tabelaAtual(), { destaque: st.meu && st.meu.i, delta: true });
    }
    // as linhas que mudam de lugar deslizam até o novo lugar, e os pontos contam (FLIP)
    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const antes = {};
    if (!reduz) el.querySelectorAll('tr[data-i]').forEach((tr) => { antes[tr.dataset.i] = { y: tr.getBoundingClientRect().top, pts: +tr.querySelector('.pts').textContent }; });
    el.innerHTML = html;
    if (reduz || !Object.keys(antes).length) return;
    el.querySelectorAll('tr[data-i]').forEach((tr) => {
      const a = antes[tr.dataset.i];
      if (!a) return;
      const dy = a.y - tr.getBoundingClientRect().top;
      if (Math.abs(dy) > 1 && tr.animate) tr.animate([{ transform: 'translateY(' + dy + 'px)' }, { transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,1.1,.3,1)' });
      const td = tr.querySelector('.pts'), alvo = +td.textContent;
      if (a.pts !== alvo) contarPts(td, a.pts, alvo);
    });
  }
  function contarPts(el, de, ate) {
    const t0 = performance.now(), dur = 520;
    const passo = (agora) => {
      const k = Math.min(1, (agora - t0) / dur);
      el.textContent = Math.round(de + (ate - de) * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  function tabelaHtml(tab, opc) {
    const posReal = {};
    if (opc.delta) tabelaReal().forEach((x) => { posReal[x.i] = x.pos; });
    const NOME_FORMA = { V: 'vitória', E: 'empate', D: 'derrota' };
    const linhas = tab.map((x) => {
      const t = st.L.times[x.i], z = window.TNGCore.zonaDe(st.regras, x.pos);
      const d = opc.delta ? posReal[x.i] - x.pos : 0;
      const fm = window.TNGCore.forma(st.L, placares(), x.i, 5);
      return '<tr data-i="' + x.i + '"' + (opc.destaque === x.i ? ' class="meu"' : '') + '><td class="pos" style="--zc:' + (z ? 'var(--z-' + z + ')' : 'transparent') + '">' + x.pos + '</td>' +
        '<th scope="row" class="t"><div>' + crest(t) + '<span>' + esc(nome(t)) + '</span><abbr class="sig" title="' + esc(nome(t)) + '">' + sig(t) + '</abbr>' +
        (d ? '<em class="delta ' + (d > 0 ? 'sobe' : 'desce') + '" title="' + (d > 0 ? 'sobe ' : 'desce ') + Math.abs(d) + ' em relação à tabela atual">' + (d > 0 ? '▲' : '▼') + Math.abs(d) + '</em>' : '') + '</div></th>' +
        '<td class="pts">' + x.pts + '</td><td>' + x.j + '</td><td class="hide-s">' + x.v + '</td><td class="hide-s">' + x.e + '</td><td class="hide-s">' + x.d + '</td>' +
        '<td class="hide-s">' + x.gp + '</td><td class="hide-s">' + x.gc + '</td><td class="sg">' + (x.sg > 0 ? '+' : '') + x.sg + '</td>' +
        '<td class="hide-s ult"><span class="forma" role="img" aria-label="Últimos jogos: ' + fm.map((r) => NOME_FORMA[r]).join(', ') + '">' + fm.map((r) => '<i class="' + r + '"></i>').join('') + '</span></td></tr>';
    }).join('');
    return '<div class="tbl-box"><table class="tbl"><caption class="sr">Classificação com os seus placares</caption><thead><tr>' +
      '<th class="t" colspan="2" scope="col">Time</th><th scope="col"><abbr title="Pontos">P</abbr></th><th scope="col"><abbr title="Jogos">J</abbr></th>' +
      '<th class="hide-s" scope="col"><abbr title="Vitórias">V</abbr></th><th class="hide-s" scope="col"><abbr title="Empates">E</abbr></th><th class="hide-s" scope="col"><abbr title="Derrotas">D</abbr></th>' +
      '<th class="hide-s" scope="col"><abbr title="Gols pró">GP</abbr></th><th class="hide-s" scope="col"><abbr title="Gols contra">GC</abbr></th>' +
      '<th scope="col"><abbr title="Saldo de gols">SG</abbr></th><th class="hide-s" scope="col">Últimos</th></tr></thead><tbody>' + linhas + '</tbody></table></div>' +
      '<div class="legenda">' + st.regras.zonas.map((z) => '<span style="--zc:var(--z-' + z.id + ')"><i></i>' + esc(z.nome) + '</span>').join('') +
      (st.regras.zonas_provisorias ? '<span><em>as vagas podem mudar com os campeões das copas</em></span>' : '') + '</div>' +
      '<p class="nota">Desempate: vitórias, saldo, gols pró e confronto direto. A ESPN não informa cartões; depois do confronto direto, vale o sorteio. ▲▼: mudança em relação à tabela atual.</p>';
  }

  function atualizarBarraRevelar() {
    const b = st.view && st.view.querySelector('#barra-revelar');
    if (!b) return;
    b.hidden = !(st.prefs.esconder && restantes().length && restantes().every((j) => placarDe(j)));
  }

  // ---------------------------------------------------------------- mudanças de placar
  let tAtualizar = 0;
  function mudou(chave) {
    st.versao++;
    salvarPlacares();
    if (chave) atualizarCard(chave);
    atualizarProgresso();
    atualizarBarraRevelar();
    clearTimeout(tAtualizar);
    tAtualizar = setTimeout(() => {
      if (!st.view) return;
      desenharTabela();
      desenharResumo();
      atualizarResumoMeu();
      if (st.aba === 'chances' || window.matchMedia('(min-width: 900px)').matches) pedirChances();
    }, 160);
  }
  function redesenharTudo() {
    st.versao++; salvarPlacares(); desenharJogos(); desenharTabela(); desenharResumo(); atualizarBarraRevelar();
    if (st.aba === 'chances' || window.matchMedia('(min-width: 900px)').matches) pedirChances();
  }

  function definir(chave, placar, sorteado) {
    const alvo = alvoPlacares();
    if (placar) alvo[chave] = placar; else delete alvo[chave];
    if (sorteado) st.sim[chave] = 1; else delete st.sim[chave];
    mudou(chave);
  }

  function simularResto() {
    const C = window.TNGCore, meu = st.meu;
    const antes = Object.assign({}, placares());
    const filtro = meu ? (j) => j.h !== meu.i && j.a !== meu.i : null;
    const novo = C.simularRestantes(st.L, placares(), st.M, sorteio(), filtro);
    const novas = Object.keys(novo).filter((k) => !antes[k]);
    if (!novas.length) { aviso(meu ? 'Os outros jogos já têm placar' : 'Todos os jogos já têm placar'); return; }
    novas.forEach((k) => { alvoPlacares()[k] = novo[k]; st.sim[k] = 1; });
    redesenharTudo();
    aviso(novas.length + (novas.length === 1 ? ' jogo sorteado' : ' jogos sorteados') + ' pelas probabilidades', { rotulo: 'Desfazer', acao: () => {
      novas.forEach((k) => { delete alvoPlacares()[k]; delete st.sim[k]; });
      redesenharTudo();
    } });
  }

  function limpar() {
    const alvo = alvoPlacares();
    const antes = { p: Object.assign({}, alvo), sim: Object.assign({}, st.sim) };
    const n = Object.keys(alvo).length;
    if (!n) { aviso('Não há placares para limpar'); return; }
    Object.keys(alvo).forEach((k) => delete alvo[k]);
    st.sim = {};
    redesenharTudo();
    aviso(n + (n === 1 ? ' placar apagado' : ' placares apagados'), { rotulo: 'Desfazer', acao: () => {
      Object.assign(alvoPlacares(), antes.p); st.sim = antes.sim;
      redesenharTudo();
    } });
  }

  // ================================================================== Worker
  function worker() {
    if (st.worker) return st.worker;
    try {
      st.worker = new Worker('shared/simulador-worker.js');
      st.worker.onmessage = (ev) => {
        const m = ev.data, ped = st.pedidos[m.id];
        if (!ped) return;
        if (m.progresso != null) { if (ped.progresso) ped.progresso(m.progresso); return; }
        delete st.pedidos[m.id];
        if (m.erro) ped.falha(new Error(m.erro)); else ped.ok(m);
      };
      st.worker.onerror = (e) => { T.reportError(e.message || e, 'worker'); };
    } catch (e) { st.worker = null; }
    return st.worker;
  }
  function pedir(msg, progresso) {
    const w = worker();
    const C = window.TNGCore;
    if (!w) {
      // sem Worker (raro): faz no próprio navegador, com menos simulações, para não travar a página
      return new Promise((ok) => setTimeout(() => {
        const N = Math.min(msg.N, 2000);
        if (msg.tipo === 'chances') { const mc = C.monteCarlo(st.L, msg.placares, st.M, N, msg.seed); ok({ chances: C.chances(st.L, mc), N: mc.N }); }
        else ok({ precisa: null });
      }, 30));
    }
    // um pedido novo do mesmo tipo descarta o anterior (o usuário mudou placares no meio)
    Object.keys(st.pedidos).forEach((id) => { if (st.pedidos[id].tipo === msg.tipo) delete st.pedidos[id]; });
    const id = ++st.nPedido;
    return new Promise((ok, falha) => {
      st.pedidos[id] = { ok, falha, progresso, tipo: msg.tipo };
      w.postMessage(Object.assign({ id, liga: st.liga, regras: st.regras, params: paramsModelo() }, msg));
    });
  }

  // ---------------------------------------------------------------- chances
  let tChances = 0;
  function pedirChances() {
    clearTimeout(tChances);
    tChances = setTimeout(() => {
      if (!st.view) return;
      if (st.meu) { pedirPrecisa(); return; }
      if (st.chancesVersao === st.versao) return;
      const versao = st.versao;
      mostrarProgresso(0);
      pedir({ tipo: 'chances', placares: placares(), N: st.prefs.N, seed: 20261107 }, mostrarProgresso).then((m) => {
        st.chances = m; st.chancesVersao = versao;
        if (st.view) desenharChances();
      }).catch((e) => { T.reportError(e, 'chances'); aviso('Não consegui calcular as chances'); });
    }, 120);
  }
  function mostrarProgresso(p) {
    const el = st.view && st.view.querySelector('#chances-prog');
    if (!el) return;
    el.hidden = false;
    el.querySelector('i').style.width = Math.round(p * 100) + '%';
  }

  function desenharChances() {
    const el = st.view && st.view.querySelector('#painel-chances');
    if (!el) return;
    if (st.meu) { desenharPrecisa(el); return; }
    const N = st.prefs.N;
    const sel = '<select data-a="n" aria-label="Número de simulações">' + [1000, 10000, 50000].map((n) => '<option value="' + n + '"' + (n === N ? ' selected' : '') + '>' + n.toLocaleString('pt-BR') + '</option>').join('') + '</select>';
    let html = '<div class="sec-title"><h2>Chances</h2><small>em ' + sel + ' simulações</small></div>' +
      '<div class="prog-fina" id="chances-prog"' + (st.chancesVersao === st.versao ? ' hidden' : '') + '><i></i></div>';
    if (!st.chances) {
      html += '<p class="nota">Calculando…</p>';
    } else {
      const cs = st.chances.chances.slice().sort((a, b) => a.posMedia - b.posMedia);
      html += '<div class="tbl-box' + (st.chancesVersao !== st.versao ? ' desat' : '') + '"><table class="tbl chances"><caption class="sr">Chances de cada time</caption><thead><tr><th class="t" scope="col">Time</th>' +
        '<th scope="col" title="1º lugar">Título</th>' + colunas().map((k) => '<th scope="col" title="' + esc(k.titulo || '') + '">' + esc(k.rotulo) + '</th>').join('') + '</tr></thead><tbody>' +
        cs.map((c) => {
          const t = st.L.times[c.i];
          return '<tr data-t="' + c.i + '" tabindex="0" aria-expanded="false"><th scope="row" class="t"><div>' + crest(t) + '<span>' + esc(nome(t)) + '</span></div></th>' +
            '<td>' + pct(c.titulo) + '</td>' + colunas().map((k) => '<td' + (k.zonas.indexOf('rb') >= 0 ? ' class="queda"' : '') + '>' + pct(k.zonas.reduce((s, z) => s + (c[z] || 0), 0)) + '</td>').join('') + '</tr>';
        }).join('') + '</tbody></table></div>' +
        '<p class="nota">Cada simulação sorteia os placares que faltam pelas probabilidades, respeitando os que você preencheu. Toque num time para ver em que posições ele costuma terminar.</p>';
    }
    el.innerHTML = html;
  }

  function distribuicaoHtml(c, t) {
    const max = Math.max.apply(null, c.dist);
    return '<div class="dist" role="img" aria-label="Posições finais ' + esc(de_(t)) + ': mais provável ' + (c.dist.indexOf(max) + 1) + 'º"><div class="dist-barras">' + c.dist.map((v, p) => {
      const z = window.TNGCore.zonaDe(st.regras, p + 1);
      return '<div class="db" title="' + (p + 1) + 'º: ' + pct(v) + '"><i style="height:' + (max ? Math.max(v > 0 ? 3 : 0, 100 * v / max) : 0) + '%;--zc:' + (z ? 'var(--z-' + z + ')' : 'var(--ink-3)') + '"></i><span>' + (p + 1) + '</span></div>';
    }).join('') + '</div><p class="nota">Posição final mais provável ' + esc(de_(t)) + ': <b>' + (c.dist.indexOf(max) + 1) + 'º</b> (' + pct(max) + ').</p></div>';
  }

  // ================================================================== o que o meu time precisa
  const VERBO = {
    titulo: ['é campeão', 'não é campeão', 'Título', 'Título'],
    lib: ['vai direto à Libertadores', 'fica fora do G4', 'Libertadores direta (1º a 4º)', 'G4'],
    pre: ['garante ao menos a pré-Libertadores', 'fica fora do G5', 'Libertadores ou pré (1º a 5º)', 'Até a pré-Liberta'],
    sula: ['garante vaga em copa continental', 'fica fora das copas', 'Copa continental (1º a 11º)', 'Vaga em copa'],
    escapar: ['escapa do rebaixamento', 'cai para a Série B', 'Escapar da queda', 'Escapar da queda'],
  };
  // colunas da tabela de chances: as do regulamento (regras.colunas) ou as do Brasileirão
  function colunas() {
    return st.regras.colunas || [{ rotulo: 'Liberta', zonas: ['lib', 'pre'], titulo: '1º ao 5º (fase de grupos ou preliminar)' }, { rotulo: 'Sula', zonas: ['sula'], titulo: '6º ao 11º' }, { rotulo: 'Queda', zonas: ['rb'], titulo: '17º ao 20º' }];
  }
  // frases de cada objetivo: as da competição (zona.verbo / zona.subst) ou as do Brasileirão
  const zonaDoObj = (id) => st.regras.zonas.find((z) => z.id === (id === 'escapar' ? 'rb' : id));
  const verbo = (id) => { const z = zonaDoObj(id); return (z && z.verbo) || VERBO[id] || [id, id, id, id]; };
  const subst = (id) => { const z = zonaDoObj(id); return (z && z.subst) || SUBST[id] || id; };

  function pedirPrecisa() {
    const versao = st.versao + ':' + st.meu.i;
    if (st.precisaVersao === versao) return;
    const objs = window.TNGCore.objetivos(st.regras);
    mostrarProgresso(0);
    pedir({ tipo: 'precisa', placares: placares(), N: 8000, seed: 7, time: st.meu.i, objetivos: objs }, mostrarProgresso).then((m) => {
      st.precisa = { mc: m.precisa, dist: m.dist, versao }; st.precisaVersao = versao;
      if (st.view) desenharChances();
    }).catch((e) => { T.reportError(e, 'precisa'); });
  }

  function desenharPrecisa(el) {
    const C = window.TNGCore, t = st.meu, plac = placares();
    const objs = C.objetivos(st.regras);
    const sit = objs.map((o) => ({ o, s: C.situacao(st.L, plac, t.i, o) }));
    const garantidos = sit.filter((x) => x.s === 'garantido'), impossiveis = sit.filter((x) => x.s === 'impossivel'), abertos = sit.filter((x) => x.s === 'aberto');
    const mc = st.precisa && st.precisa.versao === st.versao + ':' + t.i ? st.precisa.mc : null;
    let html = '<div class="sec-title"><h2>O que ' + esc(o_(t)) + ' precisa</h2><small>' + (mc ? 'pelas regras e em 8.000 simulações' : 'calculando…') + '</small></div>' +
      '<div class="prog-fina" id="chances-prog"' + (mc ? ' hidden' : '') + '><i></i></div>';
    // todos os objetivos de uma vez, com a chance de cada um (tocar leva ao detalhe)
    html += '<div class="obj-chips" role="list">' + sit.map(({ o, s: sx }) => {
      const m = mc && mc.find((x) => x.id === o.id);
      const v = sx === 'garantido' ? '100%' : sx === 'impossivel' ? '0%' : m ? (m.chance <= 0 ? '0%' : pct(m.chance)) : '…';
      const txt = '<span>' + esc(verbo(o.id)[3]) + '</span><b class="num">' + v + '</b>';
      return sx === 'aberto' ? '<a role="listitem" class="obj-chip" href="#" data-obj="' + o.id + '">' + txt + '</a>'
        : '<span role="listitem" class="obj-chip ' + (sx === 'garantido' ? 'sim' : 'nao') + '">' + txt + '</span>';
    }).join('') + '</div>';
    const dist = mc && st.precisa.dist;
    if (dist && restantes().some((j) => !window.TNGCore.placarDe(j, plac))) html += '<p class="c-sub">Onde ' + esc(o_(t)) + ' termina</p>' + distribuicaoHtml({ dist }, t);
    // basta o objetivo mais alto já garantido e o mais modesto já impossível
    if (garantidos.length) html += '<p class="garante sim"><b>Já garantiu</b> ' + esc(subst(garantidos[0].o.id)) + '.</p>';
    if (impossiveis.length) html += '<p class="garante nao"><b>Já não alcança</b> ' + esc(subst(impossiveis[impossiveis.length - 1].o.id)) + '.</p>';
    if (!abertos.length) html += '<p class="nota">Nada mais em jogo para ' + esc(o_(t)) + ' nos objetivos do campeonato.</p>';
    abertos.forEach(({ o }) => {
      const m = mc && mc.find((x) => x.id === o.id);
      html += '<div class="obj" id="obj-' + o.id + '"><div class="obj-topo"><h3>' + esc(verbo(o.id)[2]) + '</h3><b class="num" title="chance nas simulações">' + (m ? pct(m.chance) : '') + '</b></div>';
      // poucos jogos que importam: condições exatas; muitos: o que mais pesa nas simulações
      const rel = jogosDoObjetivo(o, t);
      if (rel.length <= 10) {
        html += '<div class="cond">' + condicoesHtml(o, t, rel, m) + '</div>';
      } else if (m) {
        html += precisaMc(m, t, false);
      } else {
        html += '<p class="nota">Calculando…</p>';
      }
      html += '</div>';
    });
    html += '<p class="nota">As condições valem para quaisquer resultados dos outros jogos (vitória, empate ou derrota em cada um). Os números grandes são a chance em 8.000 simulações.</p>';
    el.innerHTML = html;
  }

  // só os jogos que podem mexer na fronteira daquele objetivo: os do time e os de rivais que podem
  // terminar tanto acima quanto abaixo dele E cuja posição possível alcança a fronteira
  function jogosDoObjetivo(o, t) {
    const C = window.TNGCore, plac = placares();
    const s = C.estatisticas(st.L, plac);
    const resta = new Array(st.L.n).fill(0);
    st.L.jogos.forEach((x) => { if (!x.feito && !C.placarDe(x, plac)) { resta[x.h]++; resta[x.a]++; } });
    const min = (i) => s[i].pts, max = (i) => s[i].pts + 3 * resta[i];
    const melhorPos = (i) => 1 + s.filter((x) => x.i !== i && min(x.i) > max(i)).length;
    const piorPos = (i) => st.L.n - s.filter((x) => x.i !== i && max(x.i) < min(i)).length;
    const rival = (i) => i !== t.i && max(i) >= min(t.i) && min(i) <= max(t.i) && melhorPos(i) <= o.ate && piorPos(i) >= o.ate;
    return C.jogosRelevantes(st.L, plac, t.i).filter((j) => j.h === t.i || j.a === t.i || rival(j.h) || rival(j.a));
  }

  // ---------------------------------------------------------------- condições em linguagem humana
  const SUBST = {
    titulo: 'o título', lib: 'a vaga direta na Libertadores', pre: 'ao menos a pré-Libertadores',
    sula: 'vaga numa copa continental', escapar: 'a permanência na Série A',
  };
  const lista = (xs) => (xs.length <= 1 ? xs.join('') : xs.slice(0, -1).join(', ') + ' e ' + xs[xs.length - 1]);
  function frase(cond, t) {
    const grupos = [], porVerbo = {};
    const outros = [];
    cond.forEach((l) => {
      const j = l.jogo, h = st.L.times[j.h], a = st.L.times[j.a];
      if (j.h === t.i || j.a === t.i) {
        const casa = j.h === t.i, adv = casa ? a : h;
        const mapa = casa ? { 0: 'v', 1: 'e', 2: 'd' } : { 0: 'd', 1: 'e', 2: 'v' };
        const k = l.conj.map((r) => mapa[r]).sort().join('');
        const verbo = { v: 'vencer', e: 'empatar com', d: 'perder para', ev: 'não perder para', de: 'não vencer' }[k];
        if (!porVerbo[verbo]) { porVerbo[verbo] = []; grupos.push(verbo); }
        porVerbo[verbo].push(verbo.endsWith('com') ? o_(adv) : verbo.endsWith('para') ? o_(adv) : o_(adv));
      } else {
        const c = l.conj.join('');
        outros.push({ 0: o_(h) + ' vencer ' + o_(a), 1: nome(h) + ' e ' + nome(a) + ' empatarem', 2: o_(a) + ' vencer ' + o_(h),
          '01': o_(a) + ' não vencer ' + o_(h), '12': o_(h) + ' não vencer ' + o_(a) }[c]);
      }
    });
    const partes = grupos.map((v) => v + ' ' + lista(porVerbo[v])).concat(outros);
    return lista(partes);
  }

  function condicoesHtml(o, t, rel, m) {
    const C = window.TNGCore, plac = placares(), V = verbo(o.id);
    const en = C.enumerar(st.L, plac, t.i, o, rel);
    const pp = C.porPontos(en);
    let html = '';
    const nJ = en.jogosT;
    if (pp.garante != null && pp.garante > 0) {
      html += '<p class="c-pts">Garante ' + esc(subst(o.id)) + ' se somar <b class="num">' + pp.garante + ' ' + (pp.garante === 1 ? 'ponto' : 'pontos') + '</b> ' +
        (nJ === 1 ? 'no jogo que falta' : 'nos ' + nJ + ' jogos que faltam') + ' (de ' + pp.max + ' possíveis).</p>';
    } else if (pp.garante === 0) {
      html += '<p class="c-pts">Já garantido nos resultados que importam.</p>';
    } else if (nJ) {
      html += '<p class="c-pts">Nem vencendo os ' + nJ + ' jogos garante sozinho: depende de outros resultados.</p>';
    }
    if (pp.impossivelAte != null && pp.impossivelAte < pp.max) {
      html += '<p class="c-pts">Se somar ' + (pp.impossivelAte === 0 ? 'nenhum ponto' : 'até ' + pp.impossivelAte + (pp.impossivelAte === 1 ? ' ponto' : ' pontos')) + ', ' + esc(V[1]) + '.</p>';
    }
    const suf = C.condicoes(st.L, t.i, en, 1, 3, 3);
    if (suf.length) {
      html += '<p class="c-sub">' + (pp.garante != null ? 'Antes disso, já ' : '') + esc(V[0]) + ' se:</p><ul class="cond-lista">' +
        suf.map((c) => '<li>' + esc(frase(c, t)) + '</li>').join('') + '</ul>';
    }
    if (Array.prototype.some.call(en.resultados, (r) => r === 2)) html += '<p class="nota">Em alguns cenários, a decisão sai no saldo de gols.</p>';
    if (m) html += precisaMc(m, t, true);
    return html;
  }

  function precisaMc(m, t, exato) {
    let html = '';
    const pts = m.pts.filter((x) => x.vezes >= 40);
    if (pts.length > 1 && !exato) {
      html += '<p class="c-sub">Pelos pontos que ' + esc(o_(t)) + ' fizer até o fim:</p><div class="pts-lista">' +
        pts.map((x) => '<div class="pl"><span class="num">+' + x.pts + '</span><i style="--w:' + Math.round(x.chance * 100) + '%"></i><b class="num">' + pct(x.chance) + '</b></div>').join('') + '</div>';
    }
    const outros = m.impacto.filter((x) => !x.proprio && x.amplitude >= 0.03).slice(0, 3);
    if (outros.length) {
      html += '<p class="c-sub">Para torcer:</p><ul class="torcer">' + outros.map((x) => {
        const h = st.L.times[x.h], a = st.L.times[x.a];
        const txt = x.melhor === 0 ? 'Vitória ' + de_(h) + ' sobre ' + o_(a) : x.melhor === 2 ? 'Vitória ' + de_(a) + ' sobre ' + o_(h) : 'Empate entre ' + nome(h) + ' e ' + nome(a);
        const ganho = x.chance[x.melhor] - m.chance;
        return '<li><span class="par">' + crest(h) + crest(a) + '</span><span>' + esc(txt) + '</span><b class="num">+' + Math.max(1, Math.round(ganho * 100)) + ' p.p.</b></li>';
      }).join('') + '</ul>';
    }
    return html;
  }

  // ================================================================== revelação da tabela
  function revelar() {
    const C = window.TNGCore;
    // o que falta é sorteado antes (mantém o que o usuário preencheu)
    const faltam = restantes().filter((j) => !placarDe(j));
    if (faltam.length) {
      const novo = C.simularRestantes(st.L, placares(), st.M, sorteio());
      Object.keys(novo).forEach((k) => { if (!placares()[k]) { alvoPlacares()[k] = novo[k]; st.sim[k] = 1; } });
      st.versao++; salvarPlacares(); desenharJogos(); atualizarBarraRevelar();
    }
    const tab = tabelaAtual();
    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ov = document.createElement('div');
    ov.className = 'revela';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', 'Revelação da tabela final');
    const linhas = tab.map((x) => {
      const t = st.L.times[x.i], z = C.zonaDe(st.regras, x.pos);
      return '<li class="rv-l' + (x.pos === 1 ? ' campeao' : '') + (z ? ' z-' + z : '') + (st.meu && st.meu.i === x.i ? ' meu' : '') + '" data-pos="' + x.pos + '" style="--zc:' + (z ? 'var(--z-' + z + ')' : 'transparent') + '">' +
        '<span class="rv-pos">' + x.pos + '</span>' + crest(t, 'rv-crest') + '<span class="rv-nome">' + esc(nome(t)) + '</span>' +
        (x.pos === 1 ? '<span class="rv-tag">Campeão</span>' : z === 'rb' ? '<span class="rv-tag rb">Rebaixado</span>' : '') +
        '<span class="rv-pts" data-pts="' + x.pts + '">' + (reduz ? x.pts : 0) + '</span></li>';
    }).join('');
    ov.innerHTML = '<div class="rv-in"><div class="rv-topo"><div><div class="kicker">' + esc(st.comp.rotulo) + '</div><h2>Tabela final</h2></div>' +
      '<button class="icon-btn" data-rv="fechar" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="rv-opcoes"><div class="rv-ordem" role="group" aria-label="Ordem da revelação"><button data-rv="baixo" aria-pressed="' + (st.prefs.ordem !== 'cima') + '">De baixo para cima</button><button data-rv="cima" aria-pressed="' + (st.prefs.ordem === 'cima') + '">De cima para baixo</button></div>' +
      '<div class="rv-ordem" role="group" aria-label="Ritmo da revelação"><button data-rv="auto" aria-pressed="' + (st.prefs.revelacao !== 'manual') + '">Sozinha</button><button data-rv="manual" aria-pressed="' + (st.prefs.revelacao === 'manual') + '">Um a um, eu toco</button></div></div>' +
      '<ol class="rv-lista">' + linhas + '</ol>' +
      '<div class="rv-fim"><button class="btn primario" data-rv="comecar">' + ICON.revela + 'Revelar</button><button class="btn primario" data-rv="proximo" hidden></button><button class="btn" data-rv="pular" hidden>Pular</button><button class="btn primario" data-rv="partilhar" hidden>' + ICON.partilha + 'Compartilhar a tabela</button><button class="btn" data-rv="video" hidden>Gerar vídeo</button><button class="btn" data-rv="denovo" hidden>Ver de novo</button></div></div>';
    document.body.appendChild(ov);
    document.body.classList.add('sem-rolagem');
    const lista = ov.querySelector('.rv-lista');
    const linhasEl = Array.from(lista.children);
    const botao = (k) => ov.querySelector('[data-rv="' + k + '"]');
    let timers = [], ordem = [], passoManual = 0;
    const limparTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const fim = () => {
      limparTimers();
      const jaAcabou = ov.classList.contains('acabou');
      linhasEl.forEach((li) => { li.classList.add('on'); li.querySelector('.rv-pts').textContent = li.querySelector('.rv-pts').dataset.pts; });
      botao('pular').hidden = true; botao('proximo').hidden = true; botao('comecar').hidden = true; botao('partilhar').hidden = false; botao('denovo').hidden = false;
      ov.classList.remove('preparando');
      botao('video').hidden = !Object.keys(placares()).length || !T.criador();
      ov.classList.add('acabou');
      lista.scrollTo({ top: 0, behavior: reduz ? 'auto' : 'smooth' });       // termina mostrando o campeão
      // depois da revelação, a tabela fica à mostra no simulador
      if (st.prefs.esconder) { st.prefs.esconder = false; salvarPrefs(); }
      if (!reduz && !jaAcabou) confete(ov);
    };
    // mostra uma linha: aparece, acende (campeão e rebaixados) e os pontos contam
    function mostrar(li) {
      li.classList.add('on');
      if (+li.dataset.pos === 1 || li.classList.contains('z-rb')) li.classList.add('acende');
      if (reduz) li.querySelector('.rv-pts').textContent = li.querySelector('.rv-pts').dataset.pts; else contar(li.querySelector('.rv-pts'));
      li.scrollIntoView({ block: 'nearest', behavior: reduz ? 'auto' : 'smooth' });
    }
    function rotuloProximo() {
      const b = botao('proximo');
      b.textContent = 'Revelar o próximo (' + (passoManual + 1) + ' de ' + ordem.length + ')';
    }
    function proximo() {
      if (passoManual >= ordem.length) return;
      mostrar(ordem[passoManual++]);
      if (passoManual >= ordem.length) timers.push(setTimeout(fim, reduz ? 0 : 700));
      else rotuloProximo();
    }
    function contar(el) {
      const alvo = +el.dataset.pts, t0 = performance.now(), dur = 420;
      const passo = (agora) => {
        const p = Math.min(1, (agora - t0) / dur);
        el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    }
    // antes de começar: as opções ficam à mostra e nada se mexe até o toque em "Revelar"
    function preparar() {
      limparTimers();
      ov.classList.remove('acabou');
      ov.classList.add('preparando');
      linhasEl.forEach((li) => { li.classList.remove('on', 'acende'); li.querySelector('.rv-pts').textContent = '0'; });
      ['pular', 'proximo', 'partilhar', 'denovo', 'video'].forEach((k) => { botao(k).hidden = true; });
      botao('comecar').hidden = false;
      lista.scrollTop = st.prefs.ordem !== 'cima' ? lista.scrollHeight : 0;
    }
    function tocar() {
      limparTimers();
      ov.classList.remove('acabou', 'preparando');
      botao('comecar').hidden = true;
      linhasEl.forEach((li) => { li.classList.remove('on', 'acende'); li.querySelector('.rv-pts').textContent = '0'; });
      botao('pular').hidden = false; botao('partilhar').hidden = true; botao('denovo').hidden = true; botao('video').hidden = true;
      const debaixo = st.prefs.ordem !== 'cima';
      ordem = debaixo ? linhasEl.slice().reverse() : linhasEl.slice();
      lista.scrollTop = debaixo ? lista.scrollHeight : 0;
      // um a um: cada toque revela a próxima linha (o "Pular" vira "Mostrar o resto")
      const manual = st.prefs.revelacao === 'manual';
      botao('proximo').hidden = !manual;
      botao('pular').textContent = manual ? 'Mostrar o resto' : 'Pular';
      if (manual) { passoManual = 0; rotuloProximo(); botao('proximo').focus({ preventScroll: true }); return; }
      if (reduz) { fim(); return; }
      // ritmo: as fronteiras de zona seguram um pouco; antes do campeão (de baixo para cima), mais
      let tempo = 600;
      ordem.forEach((li, k) => {
        const pos = +li.dataset.pos;
        const fronteira = st.regras.zonas.some((z) => pos === z.de || pos === z.ate);
        if (pos === 1 && debaixo) tempo += 1100;
        timers.push(setTimeout(() => {
          mostrar(li);
          if (k === ordem.length - 1) timers.push(setTimeout(fim, 1000));
        }, tempo));
        tempo += pos === 1 ? 1300 : fronteira ? 560 : 270;
      });
    }
    const fechar = () => {
      limparTimers(); ov.remove(); document.body.classList.remove('sem-rolagem');
      document.removeEventListener('keydown', teclas); st.fecharRevela = null;
      if (st.view) { desenharTabela(); desenharResumo(); atualizarResumoMeu(); }
    };
    // no modo um a um, espaço e seta também revelam o próximo
    const teclas = (e) => {
      if (e.key === 'Escape') fechar();
      else if ((e.key === 'ArrowRight' || e.key === 'ArrowDown') && !botao('proximo').hidden) { e.preventDefault(); proximo(); }
    };
    document.addEventListener('keydown', teclas);
    ov.addEventListener('click', (e) => {
      const b = e.target.closest('[data-rv]');
      if (!b) return;
      const a = b.dataset.rv;
      if (a === 'fechar') fechar();
      else if (a === 'pular') fim();
      else if (a === 'proximo') proximo();
      else if (a === 'denovo') preparar();
      else if (a === 'comecar') tocar();
      else if (a === 'baixo' || a === 'cima' || a === 'auto' || a === 'manual') {
        if (a === 'baixo' || a === 'cima') st.prefs.ordem = a; else st.prefs.revelacao = a;
        salvarPrefs();
        b.parentElement.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x.dataset.rv === a));
        preparar();
      } else if (a === 'partilhar') { fechar(); abrirCompartilhar(); }
      else if (a === 'video') { fechar(); gerarVideo(2); }
    });
    st.fecharRevela = fechar;
    preparar();
    botao('comecar').focus({ preventScroll: true });
    window.TNG_REVELA = { fim, tocar, fechar };          // para o roteiro de capturas
  }

  // vídeo da tabela mudando placar a placar, na ordem das datas dos jogos
  function gerarVideo(vel) {
    const C = window.TNGCore, plac = placares();
    const jogos = restantes().filter((j) => placarDe(j)).sort((x, y) => (x.data < y.data ? -1 : x.data > y.data ? 1 : 0));
    if (!jogos.length) { aviso('Preencha pelo menos um placar para gerar o vídeo'); return; }
    return Promise.all([carregarComp(), T.script('app/video.js')]).then(() => {
      const S = window.TNGCompartilhar;
      return Promise.all(st.L.times.map((t) => S.imagem('midia/escudos/' + t.escudo + '.png'))).then((imgs) => {
        const estados = [C.tabela(st.L, {})], acc = {};
        jogos.forEach((j) => { acc[j.chave] = plac[j.chave]; estados.push(C.tabela(st.L, acc)); });
        const base = {}; estados[0].forEach((x) => { base[x.i] = x.pos; });
        window.TNGVideo.gerar({
          jogos: jogos.map((j) => ({ h: j.h, a: j.a, p: plac[j.chave], sorteado: !!st.sim[j.chave] && !st.compartilhado, rotulo: j.atrasado ? 'jogo atrasado' : j.rodada ? 'rodada ' + j.rodada : fmtDia(j.data) })),
          estados, base, meu: st.meu ? st.meu.i : -1,
          times: st.L.times.map((t, k) => ({ nome: nome(t), img: imgs[k] })),
          zona: (pos) => C.zonaDe(st.regras, pos),
          completo: jogos.length === restantes().length,
          endereco: T.enderecoSite(),
          texto: textoPartilha() + ' ' + linkCenario(),
          vel: vel || 2,
        });
      });
    }).catch((e) => { T.reportError(e, 'video'); aviso('Não consegui gerar o vídeo'); });
  }

  function confete(onde) {
    const box = document.createElement('div');
    box.className = 'confete';
    box.setAttribute('aria-hidden', 'true');
    const cores = ['#ffc23d', '#4f6bff', '#3fcf95', '#ff6b6f', '#ffffff'];
    for (let i = 0; i < 90; i++) {
      const c = document.createElement('i');
      c.style.left = Math.random() * 100 + '%';
      c.style.background = cores[i % cores.length];
      c.style.animationDuration = (1.6 + Math.random() * 1.8) + 's';
      c.style.animationDelay = (Math.random() * 0.6) + 's';
      box.appendChild(c);
    }
    (onde || document.body).appendChild(box);
    setTimeout(() => box.remove(), 4200);
  }

  // ================================================================== cenários (salvos e por link)
  function linkCenario() {
    const cod = window.TNGCore.codificar(st.L, placares());
    const c = Object.keys(placares()).length ? '?c=' + cod : '';
    // no Artifact o link só leva um nome simples: vai a aba (e o time), sem os placares
    if (T.ARTIFACT) return T.urlBase() + '#simulador' + (st.meu ? '-' + st.meu.slug : '');
    // na versão publicada, o link usa as páginas de entrada (título e imagem do time no WhatsApp)
    if (T.RELEASE && ehSerieA()) return T.urlBase().replace(/index\.html$/, '') + (st.meu ? 'simulador/' + st.meu.slug + '/' : '') + c;
    return T.urlBase() + rotaBase() + (st.meu ? '/' + st.meu.slug : '') + c;
  }
  function carregarComp() { return T.script('app/compartilhar.js'); }
  function textoPartilha() {
    const tab = tabelaAtual(), camp = st.L.times[tab[0].i];
    return 'Na minha simulação ' + (ehSerieA() ? 'do Brasileirão 2026' : 'da competição ' + st.comp.rotulo) + ', ' + o_(camp) + ' é ' + (art(camp) === 'a' ? 'a campeã' : 'o campeão') + '. Faça a sua:';
  }

  function abrirCompartilhar() {
    const url = linkCenario();
    const n = Object.keys(placares()).length;
    const corpo = T.janela('Compartilhar', '<p class="nota">' + (n ? 'O link leva os seus ' + n + ' placares: quem abrir vê exatamente este cenário, e pode revelar a tabela.' : 'Você ainda não preencheu nenhum placar. O link abre o simulador do começo.') + '</p>' +
      '<div class="link-linha"><input readonly value="' + esc(url) + '" aria-label="Link do cenário"><button class="btn" data-j="copiar">Copiar</button></div>' +
      '<div class="j-acoes"><a class="btn" href="https://wa.me/?text=' + encodeURIComponent(textoPartilha() + '\n' + url) + '" target="_blank" rel="noopener">Enviar no WhatsApp</a></div>' +
      (T.ARTIFACT && n ? '<p class="nota">Nesta prévia, o link abre o simulador, mas não leva os seus placares. Para mostrar o seu cenário, mande a imagem.</p>' : '') +
      '<h3 class="j-sub">Imagens prontas</h3>' +
      (n ? '<div class="j-acoes"><button class="btn primario" data-j="img-todas">' + ICON.partilha + 'Enviar as duas imagens</button></div>' : '') +
      '<div class="j-acoes"><button class="btn' + (n ? '' : ' primario') + '" data-j="img-tabela">Tabela final (feed)</button><button class="btn" data-j="img-jogos"' + (n ? '' : ' disabled') + '>Os meus placares (stories)</button></div>' +
      '<div class="j-acoes"><button class="btn" data-j="gif">GIF da tabela batendo</button></div>' +
      '<div class="previa" id="previa"></div>' +
      (T.criador() ? '<h3 class="j-sub">Vídeo (modo criador)</h3><p class="nota">A tabela mudando placar a placar. Em 2x fica com cerca de ' + Math.round((1.6 + 4.2 + n * Math.min(1.5, Math.max(0.6, 34 / Math.max(1, n)))) / 2) + ' segundos.</p>' +
        '<div class="j-acoes"><button class="btn primario" data-j="video2"' + (n ? '' : ' disabled') + '>Vídeo 2x</button><button class="btn" data-j="video"' + (n ? '' : ' disabled') + '>Vídeo 1x</button></div>' : ''));
    corpo.addEventListener('click', (e) => {
      const b = e.target.closest('[data-j]');
      if (!b) return;
      const a = b.dataset.j;
      if (a === 'copiar') carregarComp().then(() => window.TNGCompartilhar.copiar(url));
      else if (a === 'whats') carregarComp().then(() => window.TNGCompartilhar.whatsapp(textoPartilha(), url));
      else if (a === 'img-tabela') imagemTabela(corpo.querySelector('#previa'));
      else if (a === 'img-jogos') imagemJogos(corpo.querySelector('#previa'));
      else if (a === 'img-todas') enviarImagens(b);
      else if (a === 'video') gerarVideo(1);
      else if (a === 'video2') gerarVideo(2);
      else if (a === 'gif') gifTabela(corpo.querySelector('#previa'));
    });
  }

  // as duas imagens (tabela e placares) num envio só
  function enviarImagens(botao) {
    if (botao) botao.disabled = true;
    return Promise.all([imagemTabela('so'), imagemJogos('so')]).then((xs) => {
      const lista = xs.filter((x) => x && x.c);
      if (!lista.length) return null;
      return window.TNGCompartilhar.enviarVarias(lista, textoPartilha(), linkCenario());
    }).catch((e) => { T.reportError(e, 'imagens'); aviso('Não consegui gerar as imagens'); }).then(() => { if (botao) botao.disabled = false; });
  }

  function abrirCenarios() {
    const lista = (loadJson(k_(KEY.cenarios), { itens: [] }).itens || []).filter((c) => c && c.p);
    const n = Object.keys(placares()).length;
    const nomePadrao = 'Cenário ' + (lista.length + 1);
    const html = '<form class="salvar"><label for="cen-nome">Salvar os placares atuais (' + n + ')</label><div class="link-linha"><input id="cen-nome" maxlength="40" value="' + esc(nomePadrao) + '"><button class="btn primario"' + (n ? '' : ' disabled') + '>Salvar</button></div></form>' +
      (lista.length ? '<ul class="cenarios">' + lista.map((c, k) => {
        const camp = campeaoDe(c.p);
        return '<li><input type="checkbox" data-cmp="' + k + '" aria-label="Marcar ' + esc(c.nome) + ' para comparar"><div class="c-info"><b>' + esc(c.nome) + '</b><span>' + Object.keys(c.p).length + ' placares · ' + new Date(c.criado).toLocaleDateString('pt-BR') + (camp ? ' · ' + esc(nome(camp)) + (art(camp) === 'a' ? ' campeã' : ' campeão') : '') + '</span></div>' +
          '<button class="btn" data-j="abrir" data-k="' + k + '">Abrir</button><button class="icon-btn" data-j="apagar" data-k="' + k + '" aria-label="Apagar ' + esc(c.nome) + '">' + ICON.lixo + '</button></li>';
      }).join('') + '</ul>' + (lista.length > 1 ? '<button class="btn" data-j="comparar" disabled>Comparar os dois marcados</button>' : '') + '<div id="comparacao"></div>'
        : '<p class="nota">Nenhum cenário salvo ainda. Eles ficam guardados neste aparelho.</p>');
    const corpo = T.janela('Cenários', html);
    corpo.addEventListener('submit', (e) => {
      e.preventDefault();
      const nm = (corpo.querySelector('#cen-nome').value || nomePadrao).trim().slice(0, 40) || nomePadrao;
      const todos = loadJson(k_(KEY.cenarios), { itens: [] });
      todos.itens = (todos.itens || []).concat([{ nome: nm, criado: new Date().toISOString(), temporada: st.liga.temporada, p: Object.assign({}, placares()) }]);
      saveJson(k_(KEY.cenarios), todos);
      aviso('Cenário "' + nm + '" salvo');
      abrirCenarios();
    });
    corpo.addEventListener('change', (e) => {
      if (e.target.dataset.cmp == null) return;
      const b = corpo.querySelector('[data-j="comparar"]');
      if (b) b.disabled = corpo.querySelectorAll('[data-cmp]:checked').length !== 2;
    });
    corpo.addEventListener('click', (e) => {
      const b = e.target.closest('[data-j]');
      if (!b) return;
      const todos = loadJson(k_(KEY.cenarios), { itens: [] }), k = +b.dataset.k;
      todos.itens = (todos.itens || []).filter((c) => c && c.p);
      if (b.dataset.j === 'abrir') {
        const c = todos.itens[k];
        if (!c) return;
        st.compartilhado = null;
        st.p = Object.assign({}, c.p); st.sim = {};
        recalcular(); salvarPlacares();
        T.fecharJanela(); montar();
        aviso('Cenário "' + c.nome + '" aberto');
      } else if (b.dataset.j === 'apagar') {
        const c = todos.itens.splice(k, 1)[0];
        saveJson(k_(KEY.cenarios), todos);
        abrirCenarios();
        aviso('Cenário apagado', { rotulo: 'Desfazer', acao: () => { const t2 = loadJson(k_(KEY.cenarios), { itens: [] }); t2.itens.splice(k, 0, c); saveJson(k_(KEY.cenarios), t2); abrirCenarios(); } });
      } else if (b.dataset.j === 'comparar') {
        const ks = Array.from(corpo.querySelectorAll('[data-cmp]:checked')).map((x) => +x.dataset.cmp);
        corpo.querySelector('#comparacao').innerHTML = comparar(todos.itens[ks[0]], todos.itens[ks[1]]);
      }
    });
  }
  function campeaoDe(p) {
    try { return st.L.times[window.TNGCore.tabela(st.L, p)[0].i]; } catch (e) { return null; }
  }
  function comparar(a, b) {
    const C = window.TNGCore, ta = C.tabela(st.L, a.p), tb = C.tabela(st.L, b.p);
    const posB = {}; tb.forEach((x) => { posB[x.i] = x; });
    return '<div class="tbl-box"><table class="tbl cmp-tbl"><caption class="sr">Comparação dos cenários</caption><thead><tr><th class="t" scope="col">Time</th><th scope="col">' + esc(a.nome) + '</th><th scope="col">' + esc(b.nome) + '</th></tr></thead><tbody>' +
      ta.map((x) => {
        const y = posB[x.i], t = st.L.times[x.i], d = x.pos - y.pos;
        return '<tr><th scope="row" class="t"><div>' + crest(t) + '<span>' + esc(nome(t)) + '</span></div></th><td>' + x.pos + 'º · ' + x.pts + '</td><td>' + y.pos + 'º · ' + y.pts + (d ? ' <em class="delta ' + (d > 0 ? 'sobe' : 'desce') + '">' + (d > 0 ? '▲' : '▼') + Math.abs(d) + '</em>' : '') + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  // ================================================================== imagens para compartilhar
  function imagemTabela(previa) {
    return carregarComp().then(() => {
      const S = window.TNGCompartilhar, C = window.TNGCore;
      const tab = tabelaAtual();
      return Promise.all([S.fontes()].concat(tab.map((x) => S.imagem('midia/escudos/' + st.L.times[x.i].escudo + '.png')))).then((res) => {
        const escudos = res.slice(1);
        const W = 1080, H = 1350, c = S.canvas(W, H), ctx = c.getContext('2d');
        const n = Object.keys(placares()).length;
        S.moldura(ctx, W, H, 'Minha tabela final', st.comp.rotulo + (n ? ' · ' + n + (n === 1 ? ' placar simulado' : ' placares simulados') : ''));
        linhasTabela(ctx, W, tab, escudos);
        return entregar(c, 'tabela-final-' + st.comp.id + '.png', previa);
      });
    }).catch((e) => { T.reportError(e, 'imagem'); aviso('Não consegui gerar a imagem'); });
  }

  // as linhas da tabela final; anim(k) devolve { a: opacidade, s: escala, dy } para o GIF
  function linhasTabela(ctx, W, tab, escudos, anim, brilho) {
    const S = window.TNGCompartilhar, C = window.TNGCore;
    const x0 = 64, y0 = 340, lh = 43;
    ctx.textAlign = 'right'; ctx.font = '700 22px Archivo'; ctx.fillStyle = 'rgba(244,246,251,.6)';
    ctx.fillText('P', W - 300, y0 - 14); ctx.fillText('V', W - 200, y0 - 14); ctx.fillText('SG', W - 80, y0 - 14);
    tab.forEach((x, k) => {
          const y = y0 + k * lh, t = st.L.times[x.i], z = C.zonaDe(st.regras, x.pos);
          const an = anim ? anim(k) : null;
          if (an && an.a <= 0) return;
          ctx.save();
          if (an) {
            ctx.globalAlpha = Math.min(1, an.a);
            ctx.translate(W / 2, y + lh / 2 + (an.dy || 0)); ctx.scale(an.s, an.s); ctx.translate(-W / 2, -(y + lh / 2));
          }
          if (brilho && st.meu && st.meu.i === x.i) { ctx.fillStyle = 'rgba(255,194,61,' + (0.32 + 0.4 * brilho) + ')'; ctx.fillRect(x0 - 16, y, W - 2 * x0 + 32, lh); }
          if (k % 2 === 0) { ctx.fillStyle = 'rgba(255,255,255,.045)'; ctx.fillRect(x0 - 16, y, W - 2 * x0 + 32, lh); }
          if (st.meu && st.meu.i === x.i) { ctx.fillStyle = 'rgba(255,194,61,.32)'; ctx.fillRect(x0 - 16, y, W - 2 * x0 + 32, lh); }
          if (z) { ctx.fillStyle = S.COR.zonas[z]; ctx.fillRect(x0 - 16, y + 7, 6, lh - 14); }
          ctx.textAlign = 'right'; ctx.fillStyle = '#f4f6fb'; ctx.font = '800 25px Archivo';
          ctx.fillText(String(x.pos), x0 + 36, y + 30);
          S.escudoPlaca(ctx, escudos[k], x0 + 56, y + 8, 27);
          ctx.textAlign = 'left';
          S.textoCabe(ctx, nome(t), x0 + 100, y + 30, 520, x.pos === 1 ? '800' : '700', 26);
          ctx.textAlign = 'right'; ctx.font = '800 26px Archivo'; ctx.fillStyle = x.pos === 1 ? S.COR.giz : '#f4f6fb';
          ctx.fillText(String(x.pts), W - 300, y + 30);
          ctx.fillStyle = 'rgba(244,246,251,.82)'; ctx.font = '600 24px Archivo';
          ctx.fillText(String(x.v), W - 200, y + 30);
          ctx.fillText((x.sg > 0 ? '+' : '') + x.sg, W - 80, y + 30);
          ctx.restore();
        });
    ctx.textAlign = 'left';
  }

  // GIF curto: as linhas batendo de baixo para cima (o "tapa") e o seu time piscando no fim
  function gifTabela(previa) {
    return Promise.all([carregarComp(), T.script('app/gif.js')]).then(() => {
      const S = window.TNGCompartilhar;
      const tab = tabelaAtual();
      return Promise.all([S.fontes()].concat(tab.map((x) => S.imagem('midia/escudos/' + st.L.times[x.i].escudo + '.png')))).then((res) => {
        const escudos = res.slice(1);
        const W = 1080, H = 1350, GW = 432, GH = 540;
        const c = S.canvas(W, H), ctx = c.getContext('2d'), p = S.canvas(GW, GH), pc = p.getContext('2d', { willReadFrequently: true });
        const n = Object.keys(placares()).length;
        const sub = st.comp.rotulo + (n ? ' · ' + n + (n === 1 ? ' placar simulado' : ' placares simulados') : '');
        const PASSO = 0.07, BATE = 0.18, FPS = 14, N = tab.length;
        const ini = (k) => 0.25 + (N - 1 - k) * PASSO;                 // de baixo para cima
        const quadros = [];
        const foto = (atraso) => { pc.drawImage(c, 0, 0, GW, GH); quadros.push({ img: pc.getImageData(0, 0, GW, GH), atraso }); };
        const tFim = ini(0) + BATE + 0.1;
        for (let f = 0; f * (1 / FPS) <= tFim; f++) {
          const t = f / FPS;
          S.moldura(ctx, W, H, 'Minha tabela final', sub);
          linhasTabela(ctx, W, tab, escudos, (k) => {
            const u = (t - ini(k)) / BATE;
            if (u <= 0) return { a: 0 };
            if (u >= 1) return { a: 1, s: 1, dy: 0 };
            return { a: u * 1.6, s: 1 + 0.35 * (1 - u) * (1 - u), dy: -18 * (1 - u) };
          });
          foto(Math.round(100 / FPS));
        }
        // seu time pisca duas vezes; depois o quadro final fica parado
        const brilhos = st.meu ? [1, 0, 1, 0.4] : [];
        brilhos.forEach((b) => { S.moldura(ctx, W, H, 'Minha tabela final', sub); linhasTabela(ctx, W, tab, escudos, null, b); foto(18); });
        S.moldura(ctx, W, H, 'Minha tabela final', sub); linhasTabela(ctx, W, tab, escudos);
        foto(260);
        const gif = window.TNGGif.codificar(quadros, quadros[quadros.length - 1].img);
        const nomeArq = 'tabela-final-' + st.comp.id + '.gif';
        if (!previa) return S.enviar(gif, nomeArq, textoPartilha(), linkCenario());
        previa.innerHTML = '<img alt="Prévia do GIF" src="' + URL.createObjectURL(gif) + '"><div class="j-acoes"><button class="btn primario" data-p="enviar">' + ICON.partilha + 'Compartilhar o GIF</button></div>';
        previa.querySelector('[data-p="enviar"]').onclick = () => S.enviar(gif, nomeArq, textoPartilha(), linkCenario());
        window.TNG_GIF = gif;
        return gif;
      });
    }).catch((e) => { T.reportError(e, 'gif'); aviso('Não consegui gerar o GIF'); });
  }

  function imagemJogos(previa) {
    return carregarComp().then(() => {
      const S = window.TNGCompartilhar;
      const lista = restantes().filter((j) => placarDe(j));
      if (!lista.length) { aviso('Preencha alguns placares primeiro'); return null; }
      const ids = Array.from(new Set([].concat.apply([], lista.map((j) => [j.h, j.a]))));
      return Promise.all([S.fontes()].concat(ids.map((i) => S.imagem('midia/escudos/' + st.L.times[i].escudo + '.png')))).then((res) => {
        const img = {}; ids.forEach((i, k) => { img[i] = res[k + 1]; });
        const W = 1080, H = 1920, c = S.canvas(W, H), ctx = c.getContext('2d');
        S.moldura(ctx, W, H, 'Os meus placares', st.comp.rotulo + ' · ' + lista.length + (lista.length === 1 ? ' jogo' : ' jogos'));
        const itens = [];
        grupos(lista).forEach((g) => { itens.push({ titulo: g.titulo }); g.jogos.forEach((j) => itens.push({ j })); });
        // as colunas quebram no começo de uma rodada (nunca no meio dela), o mais perto possível da metade
        let porCol = Math.ceil(itens.length / 2), melhor = Infinity;
        itens.forEach((it, k) => { if (it.titulo && k > 0 && Math.abs(k - itens.length / 2) < melhor) { melhor = Math.abs(k - itens.length / 2); porCol = k; } });
        const top = 340, base = H - 140, lh = Math.min(66, (base - top) / Math.max(porCol, itens.length - porCol));
        const colW = (W - 64 * 2 - 40) / 2;
        itens.forEach((it, k) => {
          const col = k < porCol ? 0 : 1, row = col ? k - porCol : k;
          const x = 64 + col * (colW + 40), y = top + row * lh;
          if (it.titulo) {
            ctx.fillStyle = S.COR.giz; ctx.font = '800 23px Archivo'; ctx.textAlign = 'left';
            ctx.fillText(it.titulo, x + 4, y + lh * 0.66);
            return;
          }
          const j = it.j, p = placarDe(j), h = st.L.times[j.h], a = st.L.times[j.a];
          const cy = y + lh / 2, sz = Math.min(36, lh - 16);
          ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(x, y + 4, colW, lh - 8);
          const ps = Math.round(sz * 0.8);
          S.escudoPlaca(ctx, img[j.h], x + 14 + (sz - ps) / 2, cy - ps / 2, ps);
          S.escudoPlaca(ctx, img[j.a], x + colW - 14 - sz + (sz - ps) / 2, cy - ps / 2, ps);
          ctx.fillStyle = '#f4f6fb';
          ctx.textAlign = 'left'; S.textoCabe(ctx, (h.abrev || nome(h)).toUpperCase(), x + 20 + sz, cy + 8, colW / 2 - sz - 66, '700', 22);
          ctx.textAlign = 'right'; S.textoCabe(ctx, (a.abrev || nome(a)).toUpperCase(), x + colW - 20 - sz, cy + 8, colW / 2 - sz - 66, '700', 22);
          ctx.textAlign = 'center'; ctx.font = '900 34px "Archivo Largo"'; ctx.fillStyle = st.sim[j.chave] ? 'rgba(244,246,251,.85)' : S.COR.giz;
          ctx.fillText(p[0] + ' × ' + p[1], x + colW / 2, cy + 12);
        });
        ctx.textAlign = 'left';
        return entregar(c, 'meus-placares-' + st.comp.id + '.png', previa);
      });
    }).catch((e) => { T.reportError(e, 'imagem'); aviso('Não consegui gerar a imagem'); });
  }

  // mostra a prévia (na janela de compartilhar) com o botão; sem prévia, compartilha direto
  function entregar(c, nomeArq, previa) {
    const S = window.TNGCompartilhar;
    const url = linkCenario(), texto = textoPartilha();
    window.TNG_IMAGEM = c;                       // para o roteiro de capturas
    if (previa === 'so') return { c, nome: nomeArq };   // só a imagem (envio em lote)
    if (!previa) return S.enviar(c, nomeArq, texto, url);
    previa.innerHTML = '<img alt="Prévia da imagem" src="' + c.toDataURL('image/png') + '"><div class="j-acoes"><button class="btn primario" data-p="enviar">' + ICON.partilha + 'Compartilhar a imagem</button></div>';
    previa.querySelector('[data-p="enviar"]').onclick = () => S.enviar(c, nomeArq, texto, url);
    return c;
  }

  // ================================================================== eventos
  // Põe o cartão do próximo jogo no meio da parte visível da tela (descontando o topo fixo e o
  // teclado do celular, que encolhe o visualViewport); repete quando o teclado termina de abrir.
  function enquadrar(li) {
    const vv = window.visualViewport;
    const reduz = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ajustar = (suave) => {
      const fixos = ['.head', '.seg-cel'].map((s) => document.querySelector(s)).filter((x) => x && x.offsetParent);
      const topo = fixos.reduce((m, x) => Math.max(m, x.getBoundingClientRect().bottom), 0);
      const alto = vv ? vv.height + vv.offsetTop : window.innerHeight;
      const r = li.getBoundingClientRect();
      const livre = alto - topo;
      const alvo = topo + Math.max(8, (livre - r.height) / 2);
      const delta = r.top - alvo;
      if (Math.abs(delta) > 6) window.scrollBy({ top: delta, behavior: suave && !reduz ? 'smooth' : 'auto' });
    };
    requestAnimationFrame(() => ajustar(true));
    if (vv) {
      let feito = false;
      const uma = () => { if (feito) return; feito = true; vv.removeEventListener('resize', uma); setTimeout(() => ajustar(false), 60); };
      vv.addEventListener('resize', uma);
      setTimeout(() => vv.removeEventListener('resize', uma), 900);
    }
  }

  function ligar() {
    const v = st.view;
    const onClick = (e) => {
      const chip = e.target.closest('[data-obj]');
      if (chip) { e.preventDefault(); const alvo = v.querySelector('#obj-' + chip.dataset.obj); if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      const ir = e.target.closest('[data-ir]');
      if (ir) { e.preventDefault(); const alvo = v.querySelector('#g-' + ir.dataset.ir); if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      const aba = e.target.closest('button[data-aba]');   // (o contêiner .sim-cols também tem data-aba)
      if (aba) { trocarAba(aba.dataset.aba); return; }
      const vis = e.target.closest('[data-vis]');
      if (vis) {
        st.prefs.visual = vis.dataset.vis; salvarPrefs();
        if (st.aba === 'tabela' && ladoALado()) st.aba = 'jogos';
        montar();
        return;
      }
      const r = e.target.closest('.prob button');
      if (r) {
        const li = r.closest('.jogo'), chave = li.dataset.c, j = st.L.jogos.find((x) => x.chave === chave);
        const p = st.M.prob(j.h, j.a), k = +r.dataset.r, atual = placarDe(j);
        if (atual && resultado(atual) === k && !st.sim[chave]) definir(chave, null);           // tocar de novo desfaz
        else definir(chave, (k === 0 ? p.tipico.h : k === 1 ? p.tipico.d : p.tipico.a).slice(), false);
        return;
      }
      const dado = e.target.closest('[data-sortear]');
      if (dado) {
        const li = dado.closest('.jogo'), chave = li.dataset.c;
        const novo = window.TNGCore.simularRestantes(st.L, {}, st.M, sorteio(), (j) => j.chave === chave);
        if (novo[chave]) definir(chave, novo[chave], true);
        if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && dado.animate) dado.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 420, easing: 'cubic-bezier(.3,1.3,.5,1)' });
        return;
      }
      const pm = e.target.closest('.pm button');
      if (pm) {
        const li = pm.closest('.jogo'), chave = li.dataset.c, j = st.L.jogos.find((x) => x.chave === chave);
        const atual = placarDe(j), g = +pm.dataset.g, d = +pm.dataset.d;
        if (!atual && d < 0) return;
        const novo = atual ? atual.slice() : [0, 0];
        novo[g] = Math.max(0, Math.min(15, novo[g] + (atual || d < 0 ? d : 1)));
        definir(chave, novo, false);
        const inp = li.querySelectorAll('.placar input')[g];
        if (inp && inp.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) inp.animate([{ transform: 'translateY(-5px) scale(1.1)' }, { transform: 'none' }], { duration: 260, easing: 'cubic-bezier(.3,1.6,.5,1)' });
        return;
      }
      const tr = e.target.closest('table.chances tbody tr[data-t]');
      if (tr) { abrirDistribuicao(tr); return; }
      const b = e.target.closest('[data-a]');
      if (!b || b.tagName === 'SELECT') return;
      const a = b.dataset.a;
      if (a === 'simular') simularResto();
      else if (a === 'limpar') limpar();

      else if (a === 'esconder') { st.prefs.esconder = !st.prefs.esconder; salvarPrefs(); desenharTabela(); desenharResumo(); atualizarResumoMeu(); atualizarBarraRevelar(); }
      else if (a === 'revelar') revelar();
      else if (a === 'partilhar') abrirCompartilhar();
      else if (a === 'cenarios') abrirCenarios();
      else if (a === 'so-meus') { st.soMeus = !st.soMeus; desenharJogos(); }
      else if (a === 'usar-comp') {
        st.p = Object.assign({}, st.compartilhado); st.sim = {}; st.compartilhado = null; salvarPlacares();
        history.replaceState(history.state, '', rotaBase() + (st.meu ? '/' + st.meu.slug : ''));
        montar(); aviso('O cenário agora é seu: pode editar');
      } else if (a === 'sair-comp') { st.compartilhado = null; location.hash = rotaBase() + (st.meu ? '/' + st.meu.slug : ''); }
    };
    const onKey = (e) => {
      const tr = e.target.closest && e.target.closest('table.chances tbody tr[data-t]');
      if (tr && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrirDistribuicao(tr); }
    };
    const onInput = (e) => {
      const inp = e.target.closest('.placar input');
      if (!inp) return;
      const limpo = inp.value.replace(/\D/g, '').slice(0, 2);
      if (limpo !== inp.value) inp.value = limpo;
      const li = inp.closest('.jogo'), chave = li.dataset.c;
      const ins = li.querySelectorAll('input');
      const a = ins[0].value, b = ins[1].value;
      if (a !== '' && b !== '') definir(chave, [Math.min(15, +a), Math.min(15, +b)], false);
      else if (placarDe(st.L.jogos.find((x) => x.chave === chave))) definir(chave, null);
      // pula para o próximo campo depois de um dígito
      if (limpo.length === 1) {
        const todos = Array.from(v.querySelectorAll('.placar input'));
        const prox = todos[todos.indexOf(inp) + 1];
        if (prox) {
          const outro = prox.closest('.jogo') !== li;
          prox.focus({ preventScroll: outro });
          if (outro) enquadrar(prox.closest('.jogo'));
        }
      }
    };
    const onFocus = (e) => { const inp = e.target.closest && e.target.closest('.placar input'); if (inp) setTimeout(() => { if (document.activeElement === inp) inp.select(); }, 0); };   // select() atrasado puxaria o foco de volta
    const onChange = (e) => {
      if (e.target.matches('select[data-a="meu"]')) { location.hash = rotaBase() + (e.target.value ? '/' + e.target.value : ''); return; }
      if (e.target.matches('select[data-a="n"]')) { st.prefs.N = +e.target.value; salvarPrefs(); st.chancesVersao = -1; pedirChances(); return; }
      if (e.target.name === 'forma') {
        st.prefs.forma = +e.target.value; salvarPrefs();
        st.M = window.TNGCore.modelo(st.L, paramsModelo()); st.versao++;
        desenharJogos(); aviso('Probabilidades com a forma dos últimos ' + st.prefs.forma + ' jogos');
        if (st.aba === 'chances' || window.matchMedia('(min-width: 900px)').matches) pedirChances();
      }
    };
    v.addEventListener('click', onClick);
    v.addEventListener('keydown', onKey);
    v.addEventListener('input', onInput);
    v.addEventListener('focusin', onFocus);
    v.addEventListener('change', onChange);
    return () => {
      v.removeEventListener('click', onClick); v.removeEventListener('keydown', onKey); v.removeEventListener('input', onInput);
      v.removeEventListener('focusin', onFocus); v.removeEventListener('change', onChange);
    };
  }

  function abrirDistribuicao(tr) {
    const aberto = tr.nextElementSibling && tr.nextElementSibling.classList.contains('dist-linha');
    tr.parentElement.querySelectorAll('.dist-linha').forEach((x) => x.remove());
    tr.parentElement.querySelectorAll('tr[aria-expanded="true"]').forEach((x) => x.setAttribute('aria-expanded', 'false'));
    if (aberto || !st.chances) return;
    const i = +tr.dataset.t, c = st.chances.chances.find((x) => x.i === i);
    tr.setAttribute('aria-expanded', 'true');
    tr.insertAdjacentHTML('afterend', '<tr class="dist-linha"><td colspan="5">' + distribuicaoHtml(c, st.L.times[i]) + '</td></tr>');
  }

  function trocarAba(aba) {
    st.aba = aba;
    st.view.querySelector('.sim-cols').dataset.aba = aba;
    st.view.querySelectorAll('.seg [data-aba]').forEach((b) => {
      const ativo = b.closest('.seg-lado') ? (b.dataset.aba === aba || (aba === 'jogos' && b.dataset.aba === 'tabela')) : b.dataset.aba === aba;
      b.setAttribute('aria-selected', ativo);
    });
    if (aba === 'chances') { desenharChances(); pedirChances(); }
    const seg = st.view.querySelector('.seg-cel');
    if (seg && window.matchMedia('(max-width: 899px)').matches && seg.getBoundingClientRect().top < 0) seg.scrollIntoView({ block: 'start' });
  }

  // ================================================================== registro da aba
  window.TNG.aba('simulador', {
    titulo: 'Simulador do Brasileirão 2026',
    descricao: 'Simule os jogos que faltam do Brasileirão 2026, veja as chances do seu time e compartilhe a tabela final.',
    render(view, params, ctx) {
      return Promise.all([T.script('shared/simulador-core.js'), T.script('shared/espn.js')]).then(() => {
        carregarPrefs();
        return carregarComps();
      }).then((comps) => {
        // #/simulador/<competição>/<time>; sem competição na rota, Série A
        const ehComp = params[0] && comps.some((c) => c.id === params[0]);
        const id = ehComp ? params[0] : 'seriea', timeSlug = ehComp ? params[1] : params[0];
        return carregarDados(id).catch((e) => {
          T.reportError(e, 'competicao');
          if (id === 'seriea') throw e;
          aviso('Essa competição ainda não tem dados: mostrando a Série A');
          return carregarDados('seriea').then(() => null);
        }).then((ok) => (ok === null ? null : timeSlug));
      }).then((timeSlug) => {
        st.view = view;
        st.meu = timeSlug ? timePorSlug(timeSlug) : null;
        if (timeSlug && !st.meu) aviso('Não achei esse time; mostrando o campeonato inteiro');
        st.compartilhado = null;
        if (ctx.c || ctx.cv4) {
          // cv4: link da versão antiga em arquivo único (outra ordem dos pares)
          const dec = ctx.c ? window.TNGCore.decodificar(st.L, ctx.c) : window.TNGCore.decodificarAntigo(st.L, ctx.cv4);
          if (dec) st.compartilhado = dec; else aviso('Esse link de cenário está incompleto');
        }
        if (ctx.aba && /^(jogos|tabela|chances)$/.test(ctx.aba)) st.aba = ctx.aba;
        st.versao++;
        st.chancesVersao = -1;
        document.title = (st.meu ? 'Simulador ' + de_(st.meu) + ' · ' + st.comp.rotulo : (TITULO[st.comp.id] || 'Simulador') + (ehSerieA() ? ' 2026' : ' ' + st.comp.rotulo.replace(/^.* /, ''))) + ' · Tapa na Gaveta';
        montar();
        const desligar = ligar();
        if (st.aba === 'chances' || window.matchMedia('(min-width: 900px)').matches) pedirChances();
        aoVivo();
        if (ctx.revelar != null) setTimeout(revelar, 50);
        window.TNG_SIM = st;                                   // para testes e capturas
        return () => {
          desligar();
          clearTimeout(tAtualizar); clearTimeout(tChances);
          if (st.fecharRevela) { try { st.fecharRevela(); } catch (e) { /* já fechada */ } }
          if (st.worker) { st.worker.terminate(); st.worker = null; st.pedidos = {}; }
          st.view = null;
        };
      });
    },
  });
})();

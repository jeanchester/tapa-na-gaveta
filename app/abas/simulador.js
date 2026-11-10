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
    revela: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16M7 16V9M12 16V5M17 16v-4"/></svg>',
  };

  // ================================================================== estado
  const st = {
    base: null, liga: null, regras: null, fonte: 'publicado', quando: null,
    L: null, M: null,
    p: {}, sim: {},                 // placares do usuário e quais foram sorteados
    prefs: null, aba: 'jogos', meu: null, soMeus: true,
    compartilhado: null,            // placares vindos de um link (não salvos até "usar")
    chances: null, chancesVersao: -1, versao: 0,
    precisa: null, precisaVersao: '',
    view: null, worker: null, pedidos: {}, nPedido: 0,
  };
  const PREFS_PADRAO = { forma: 5, esconder: false, ordem: 'baixo', N: 10000 };

  function carregarPrefs() { st.prefs = Object.assign({}, PREFS_PADRAO, loadJson(KEY.prefs, {})); }
  function salvarPrefs() { saveJson(KEY.prefs, st.prefs); }
  function salvarPlacares() {
    if (st.compartilhado) return;            // olhando um cenário de outra pessoa: não grava por cima do seu
    saveJson(KEY.placares, { temporada: st.liga.temporada, p: st.p, sim: st.sim });
  }

  // ================================================================== dados (três camadas)
  function json(url) { return fetch(url).then((r) => { if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }); }

  function carregarDados() {
    if (st.base) return Promise.resolve();
    return Promise.all([json('dados/brasileirao-2026.json'), json('shared/regras-brasileirao-2026.json')]).then(([liga, regras]) => {
      st.base = liga; st.regras = regras;
      const cache = loadJson(KEY.espnCache, null);
      if (cache && cache.liga && cache.liga.temporada === liga.temporada && cache.liga.baixado_em > liga.baixado_em && Array.isArray(cache.liga.jogos) && cache.liga.jogos.length >= liga.jogos.length - 5) {
        st.liga = cache.liga; st.fonte = 'guardado'; st.quando = cache.liga.baixado_em;
      } else {
        st.liga = liga; st.fonte = 'publicado'; st.quando = liga.baixado_em;
      }
      const salvo = loadJson(KEY.placares, {});
      if (salvo && salvo.temporada === liga.temporada) { st.p = salvo.p || {}; st.sim = salvo.sim || {}; }
      recalcular();
      migrarAntigos();
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
    window.TNGEspn.atualizar(st.liga).then((m) => {
      ultimaBusca = Date.now();
      delete m.mudou;
      saveJson(KEY.espnCache, { liga: m });
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
  const crest = (t, cls) => '<img class="' + (cls || 'crest') + '" src="midia/escudos/' + esc(t.escudo || 'vazio') + '.png" alt="" width="24" height="24" loading="lazy">';
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
      if (!porChave[k]) { porChave[k] = { k, titulo, jogos: [] }; out.push(porChave[k]); }
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
      '<div class="page-head"><div class="kicker">Brasileirão 2026 · Série A</div>' +
      '<h1>' + (meu ? 'Simulador ' + esc(de_(meu)) : 'Simulador do Brasileirão') + '</h1>' +
      '<p>' + (faltam ? 'Faltam <b class="num">' + faltam + '</b> jogos. Chute os placares e veja como termina a tabela.' : 'O campeonato terminou. Esta é a tabela final.') + '</p>' +
      '<div class="carimbo" id="carimbo"></div></div>' +
      (st.compartilhado ? '<div class="faixa"><div><b>Você está vendo o cenário de outra pessoa.</b><span>Os seus placares continuam guardados.</span></div>' +
        '<div class="faixa-acoes"><button class="btn primario" data-a="revelar">' + ICON.revela + 'Revelar a tabela</button><button class="btn" data-a="usar-comp">Usar e editar</button><button class="link-btn" data-a="sair-comp">Voltar ao meu</button></div></div>' : '') +
      '<div class="acoes sim-acoes">' +
      '<button class="btn primario" data-a="simular">' + ICON.play + (meu ? 'Simular os outros' : 'Simular o resto') + '</button>' +
      '<label class="btn sel-time">' + ICON.escudo + '<select data-a="meu" aria-label="Escolher o meu time"><option value="">Meu time</option>' + opcoes + '</select></label>' +
      '</div>' +
      '<div class="ferr"><button class="link-btn" data-a="partilhar">' + ICON.partilha + 'Compartilhar</button>' +
      '<button class="link-btn" data-a="cenarios">' + ICON.pasta + 'Cenários</button>' +
      '<button class="link-btn" data-a="limpar">' + ICON.lixo + 'Limpar</button>' +
      '<a class="link-btn so-estreito" href="#/estatisticas">' + ICON.revela + 'Estatísticas</a></div>' +
      '<div class="seg seg-cel" role="tablist" aria-label="Partes do simulador">' +
      [['jogos', 'Jogos'], ['tabela', 'Tabela'], ['chances', meu ? 'Precisa' : 'Chances']].map(([k, n]) =>
        '<button role="tab" data-aba="' + k + '" aria-selected="' + (st.aba === k) + '">' + n + '</button>').join('') + '</div>' +
      '<div class="sim-cols" data-aba="' + st.aba + '">' +
      '<section class="col-jogos" aria-label="Jogos que faltam" id="col-jogos"></section>' +
      '<section class="col-lado" id="col-lado"><div class="seg seg-lado" role="tablist" aria-label="Tabela ou chances">' +
      [['tabela', 'Classificação'], ['chances', meu ? 'O que precisa' : 'Chances']].map(([k, n]) =>
        '<button role="tab" data-aba="' + k + '" aria-selected="' + (st.aba === k || (k === 'tabela' && st.aba === 'jogos')) + '">' + esc(n) + '</button>').join('') +
      '</div><div id="painel-tabela"></div><div id="painel-chances"></div></section></div>' +
      '<div class="barra-revelar" id="barra-revelar" hidden><button class="btn primario" data-a="revelar">' + ICON.revela + 'Revelar a tabela final</button></div>';
    desenharCarimbo();
    desenharJogos();
    desenharTabela();
    desenharChances();
    atualizarBarraRevelar();
  }

  function desenharCarimbo() {
    const el = st.view && st.view.querySelector('#carimbo');
    if (!el) return;
    const quando = quandoTxt(st.quando);
    const txt = st.fonte === 'ao vivo' ? 'Atualizado ' + quando + ' · ESPN'
      : 'Dados de ' + quando.replace(/^em /, '') + (buscandoESPN ? ' · atualizando…' : st.fonte === 'guardado' ? ' · sem conexão com a ESPN' : '');
    el.className = 'carimbo' + (st.fonte === 'ao vivo' ? ' ao-vivo' : '');
    el.innerHTML = '<i></i>' + esc(txt);
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
    if (meu) {
      html += '<div class="meu-card">' + crest(meu, 'crest-g') + '<div class="meu-txt"><b>' + esc(nome(meu)) + '</b><span id="meu-resumo"></span></div>' +
        '<div class="meu-acoes"><button class="link-btn" data-a="so-meus">' + (st.soMeus ? 'Ver todos os jogos' : 'Só os jogos ' + esc(de_(meu))) + '</button>' +
        '<a class="link-btn" href="#/simulador">Sair</a></div></div>';
    }
    if (gs.length > 1) {
      html += '<nav class="rodadas" aria-label="Ir para a rodada"><span>Ir para</span>' + gs.map((g) => '<a href="#" data-ir="' + g.k + '">' + (g.k === 'atr' ? 'Atrasado' : g.titulo.replace('Rodada ', 'R')) + '</a>').join('') + '</nav>';
    }
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
    const time = (t) => '<div class="time' + (meu && meu.i === t.i ? ' meu' : '') + '">' + crest(t) + '<span>' + esc(nome(t)) + '</span></div>';
    const quando = j.horario ? fmtDia(j.data) + ' · ' + fmtHora(j.data) : fmtDia(j.data) + ' · horário a definir';
    return '<li class="jogo' + (f ? (sorteado ? ' sorteado' : ' set') : '') + '" data-c="' + j.chave + '">' +
      '<div class="j-meta"><span>' + quando + '</span>' + tag + '</div>' +
      '<div class="j-linha">' + time(h) +
      '<div class="placar"><input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" data-l="0" aria-label="Gols ' + esc(de_(h)) + '" value="' + (f ? f[0] : '') + '">' +
      '<i aria-hidden="true">×</i><input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" autocomplete="off" data-l="1" aria-label="Gols ' + esc(de_(a)) + '" value="' + (f ? f[1] : '') + '"></div>' +
      time(a) + '</div>' +
      '<div class="prob">' + seg(0, p.ph, '--p-home', pct(p.ph), 'Vitória ' + de_(h)) + seg(1, p.pd, '--p-draw', '<span class="lbl">empate </span>' + pct(p.pd), 'Empate') + seg(2, p.pa, '--p-away', pct(p.pa), 'Vitória ' + de_(a)) + '</div></li>';
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
    if (f && !meta.querySelector('.vivo')) meta.insertAdjacentHTML('beforeend', '<span class="tag' + (sorteado ? ' sorteado' : '') + '">' + (sorteado ? 'sorteado' : 'seu placar') + '</span>');
    const ins = li.querySelectorAll('input');
    if (f) {
      if (document.activeElement !== ins[0]) ins[0].value = f[0];
      if (document.activeElement !== ins[1]) ins[1].value = f[1];
    }
  }

  function atualizarProgresso() {
    const el = st.view.querySelector('.progresso');
    if (!el) return;
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
    el.textContent = (st.prefs.esconder ? '' : x.pos + 'º lugar, ' + x.pts + ' pontos · ') + meus + ' de ' + jogos.length + ' jogos preenchidos';
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
    el.innerHTML = html;
  }

  function tabelaHtml(tab, opc) {
    const posReal = {};
    if (opc.delta) tabelaReal().forEach((x) => { posReal[x.i] = x.pos; });
    const NOME_FORMA = { V: 'vitória', E: 'empate', D: 'derrota' };
    const linhas = tab.map((x) => {
      const t = st.L.times[x.i], z = window.TNGCore.zonaDe(st.regras, x.pos);
      const d = opc.delta ? posReal[x.i] - x.pos : 0;
      const fm = window.TNGCore.forma(st.L, placares(), x.i, 5);
      return '<tr' + (opc.destaque === x.i ? ' class="meu"' : '') + '><td class="pos" style="--zc:' + (z ? 'var(--z-' + z + ')' : 'transparent') + '">' + x.pos + '</td>' +
        '<th scope="row" class="t"><div>' + crest(t) + '<span>' + esc(nome(t)) + '</span>' +
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
      atualizarResumoMeu();
      if (st.aba === 'chances' || window.matchMedia('(min-width: 900px)').matches) pedirChances();
    }, 160);
  }
  function redesenharTudo() {
    st.versao++; salvarPlacares(); desenharJogos(); desenharTabela(); atualizarBarraRevelar();
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
        '<th scope="col" title="1º lugar">Título</th><th scope="col" title="1º ao 5º (fase de grupos ou preliminar)">Liberta</th><th scope="col" title="6º ao 11º">Sula</th><th scope="col" title="17º ao 20º">Queda</th></tr></thead><tbody>' +
        cs.map((c) => {
          const t = st.L.times[c.i], lib = (c.lib || 0) + (c.pre || 0);
          return '<tr data-t="' + c.i + '" tabindex="0" aria-expanded="false"><th scope="row" class="t"><div>' + crest(t) + '<span>' + esc(nome(t)) + '</span></div></th>' +
            '<td>' + pct(c.titulo) + '</td><td>' + pct(lib) + '</td><td>' + pct(c.sula) + '</td><td class="queda">' + pct(c.rb) + '</td></tr>';
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
    titulo: ['é campeão', 'não é campeão', 'Título'],
    lib: ['vai direto à Libertadores', 'fica fora do G4', 'Libertadores direta (1º a 4º)'],
    pre: ['garante ao menos a pré-Libertadores', 'fica fora do G5', 'Libertadores ou pré (1º a 5º)'],
    sula: ['garante vaga em copa continental', 'fica fora das copas', 'Copa continental (1º a 11º)'],
    escapar: ['escapa do rebaixamento', 'cai para a Série B', 'Escapar da queda'],
  };
  function pedirPrecisa() {
    const versao = st.versao + ':' + st.meu.i;
    if (st.precisaVersao === versao) return;
    const objs = window.TNGCore.objetivos(st.regras);
    mostrarProgresso(0);
    pedir({ tipo: 'precisa', placares: placares(), N: 8000, seed: 7, time: st.meu.i, objetivos: objs }, mostrarProgresso).then((m) => {
      st.precisa = { mc: m.precisa, versao }; st.precisaVersao = versao;
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
    // basta o objetivo mais alto já garantido e o mais modesto já impossível
    if (garantidos.length) html += '<p class="garante sim"><b>Já garantiu</b> ' + esc(SUBST[garantidos[0].o.id]) + '.</p>';
    if (impossiveis.length) html += '<p class="garante nao"><b>Já não alcança</b> ' + esc(SUBST[impossiveis[impossiveis.length - 1].o.id]) + '.</p>';
    if (!abertos.length) html += '<p class="nota">Nada mais em jogo para ' + esc(o_(t)) + ' nos objetivos do campeonato.</p>';
    abertos.forEach(({ o }) => {
      const m = mc && mc.find((x) => x.id === o.id);
      html += '<div class="obj"><div class="obj-topo"><h3>' + esc(VERBO[o.id][2]) + '</h3><b class="num" title="chance nas simulações">' + (m ? pct(m.chance) : '') + '</b></div>';
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
    const C = window.TNGCore, plac = placares(), V = VERBO[o.id];
    const en = C.enumerar(st.L, plac, t.i, o, rel);
    const pp = C.porPontos(en);
    let html = '';
    const nJ = en.jogosT;
    if (pp.garante != null && pp.garante > 0) {
      html += '<p class="c-pts">Garante ' + esc(SUBST[o.id]) + ' se somar <b class="num">' + pp.garante + ' ' + (pp.garante === 1 ? 'ponto' : 'pontos') + '</b> ' +
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
    ov.innerHTML = '<div class="rv-in"><div class="rv-topo"><div><div class="kicker">Brasileirão 2026</div><h2>Tabela final</h2></div>' +
      '<button class="icon-btn" data-rv="fechar" aria-label="Fechar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="rv-ordem" role="group" aria-label="Ordem da revelação"><button data-rv="baixo" aria-pressed="' + (st.prefs.ordem !== 'cima') + '">De baixo para cima</button><button data-rv="cima" aria-pressed="' + (st.prefs.ordem === 'cima') + '">De cima para baixo</button></div>' +
      '<ol class="rv-lista">' + linhas + '</ol>' +
      '<div class="rv-fim"><button class="btn" data-rv="pular">Pular</button><button class="btn primario" data-rv="partilhar" hidden>' + ICON.partilha + 'Compartilhar a tabela</button><button class="btn" data-rv="denovo" hidden>Ver de novo</button></div></div>';
    document.body.appendChild(ov);
    document.body.classList.add('sem-rolagem');
    const lista = ov.querySelector('.rv-lista');
    const linhasEl = Array.from(lista.children);
    const botao = (k) => ov.querySelector('[data-rv="' + k + '"]');
    let timers = [];
    const limparTimers = () => { timers.forEach(clearTimeout); timers = []; };
    const fim = () => {
      limparTimers();
      linhasEl.forEach((li) => { li.classList.add('on'); li.querySelector('.rv-pts').textContent = li.querySelector('.rv-pts').dataset.pts; });
      botao('pular').hidden = true; botao('partilhar').hidden = false; botao('denovo').hidden = false;
      ov.classList.add('acabou');
      lista.scrollTo({ top: 0, behavior: reduz ? 'auto' : 'smooth' });       // termina mostrando o campeão
    };
    function contar(el) {
      const alvo = +el.dataset.pts, t0 = performance.now(), dur = 420;
      const passo = (agora) => {
        const p = Math.min(1, (agora - t0) / dur);
        el.textContent = Math.round(alvo * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    }
    function tocar() {
      limparTimers();
      ov.classList.remove('acabou');
      linhasEl.forEach((li) => { li.classList.remove('on', 'acende'); li.querySelector('.rv-pts').textContent = '0'; });
      botao('pular').hidden = false; botao('partilhar').hidden = true; botao('denovo').hidden = true;
      if (reduz) { fim(); return; }
      const debaixo = st.prefs.ordem !== 'cima';
      lista.scrollTop = debaixo ? lista.scrollHeight : 0;
      const ordem = debaixo ? linhasEl.slice().reverse() : linhasEl.slice();
      // ritmo: as fronteiras de zona seguram um pouco; antes do campeão (de baixo para cima), mais
      let tempo = 600;
      ordem.forEach((li, k) => {
        const pos = +li.dataset.pos;
        const fronteira = st.regras.zonas.some((z) => pos === z.de || pos === z.ate);
        if (pos === 1 && debaixo) tempo += 1100;
        timers.push(setTimeout(() => {
          li.classList.add('on');
          if (pos === 1 || li.classList.contains('z-rb')) li.classList.add('acende');
          contar(li.querySelector('.rv-pts'));
          li.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          if (k === ordem.length - 1) timers.push(setTimeout(fim, 1000));
        }, tempo));
        tempo += pos === 1 ? 1300 : fronteira ? 560 : 270;
      });
    }
    const fechar = () => {
      limparTimers(); ov.remove(); document.body.classList.remove('sem-rolagem');
      document.removeEventListener('keydown', teclas); st.fecharRevela = null;
      if (st.view) { desenharTabela(); atualizarResumoMeu(); }
    };
    const teclas = (e) => { if (e.key === 'Escape') fechar(); };
    document.addEventListener('keydown', teclas);
    ov.addEventListener('click', (e) => {
      const b = e.target.closest('[data-rv]');
      if (!b) return;
      const a = b.dataset.rv;
      if (a === 'fechar') fechar();
      else if (a === 'pular') fim();
      else if (a === 'denovo') tocar();
      else if (a === 'baixo' || a === 'cima') {
        st.prefs.ordem = a; salvarPrefs();
        ov.querySelectorAll('.rv-ordem button').forEach((x) => x.setAttribute('aria-pressed', x.dataset.rv === a));
        tocar();
      } else if (a === 'partilhar') imagemTabela();
    });
    st.fecharRevela = fechar;
    botao('pular').focus({ preventScroll: true });
    tocar();
    window.TNG_REVELA = { fim, tocar, fechar };          // para o roteiro de capturas
  }

  // ================================================================== cenários (salvos e por link)
  function linkCenario() {
    const cod = window.TNGCore.codificar(st.L, placares());
    const c = Object.keys(placares()).length ? '?c=' + cod : '';
    // no Artifact o link só leva um nome simples: vai a aba (e o time), sem os placares
    if (T.ARTIFACT) return T.urlBase() + '#simulador' + (st.meu ? '-' + st.meu.slug : '');
    // na versão publicada, o link usa as páginas de entrada (título e imagem do time no WhatsApp)
    if (T.RELEASE) return T.urlBase().replace(/index\.html$/, '') + (st.meu ? 'simulador/' + st.meu.slug + '/' : '') + c;
    return T.urlBase() + '#/simulador' + (st.meu ? '/' + st.meu.slug : '') + c;
  }
  function carregarComp() { return T.script('app/compartilhar.js'); }
  function textoPartilha() {
    const tab = tabelaAtual(), camp = st.L.times[tab[0].i];
    return 'Na minha simulação do Brasileirão 2026, ' + o_(camp) + ' é ' + (art(camp) === 'a' ? 'a campeã' : 'o campeão') + '. Faça a sua:';
  }

  function abrirCompartilhar() {
    const url = linkCenario();
    const n = Object.keys(placares()).length;
    const corpo = T.janela('Compartilhar', '<p class="nota">' + (n ? 'O link leva os seus ' + n + ' placares: quem abrir vê exatamente este cenário, e pode revelar a tabela.' : 'Você ainda não preencheu nenhum placar. O link abre o simulador do começo.') + '</p>' +
      '<div class="link-linha"><input readonly value="' + esc(url) + '" aria-label="Link do cenário"><button class="btn" data-j="copiar">Copiar</button></div>' +
      '<div class="j-acoes"><a class="btn" href="https://wa.me/?text=' + encodeURIComponent(textoPartilha() + '\n' + url) + '" target="_blank" rel="noopener">Enviar no WhatsApp</a></div>' +
      (T.ARTIFACT && n ? '<p class="nota">Nesta prévia, o link abre o simulador, mas não leva os seus placares. Para mostrar o seu cenário, mande a imagem.</p>' : '') +
      '<h3 class="j-sub">Imagens prontas</h3><div class="j-acoes"><button class="btn primario" data-j="img-tabela">Tabela final (feed)</button><button class="btn" data-j="img-jogos"' + (n ? '' : ' disabled') + '>Os meus placares (stories)</button></div>' +
      '<div class="previa" id="previa"></div>');
    corpo.addEventListener('click', (e) => {
      const b = e.target.closest('[data-j]');
      if (!b) return;
      const a = b.dataset.j;
      if (a === 'copiar') carregarComp().then(() => window.TNGCompartilhar.copiar(url));
      else if (a === 'whats') carregarComp().then(() => window.TNGCompartilhar.whatsapp(textoPartilha(), url));
      else if (a === 'img-tabela') imagemTabela(corpo.querySelector('#previa'));
      else if (a === 'img-jogos') imagemJogos(corpo.querySelector('#previa'));
    });
  }

  function abrirCenarios() {
    const lista = (loadJson(KEY.cenarios, { itens: [] }).itens || []).filter((c) => c && c.p);
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
      const todos = loadJson(KEY.cenarios, { itens: [] });
      todos.itens = (todos.itens || []).concat([{ nome: nm, criado: new Date().toISOString(), temporada: st.liga.temporada, p: Object.assign({}, placares()) }]);
      saveJson(KEY.cenarios, todos);
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
      const todos = loadJson(KEY.cenarios, { itens: [] }), k = +b.dataset.k;
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
        saveJson(KEY.cenarios, todos);
        abrirCenarios();
        aviso('Cenário apagado', { rotulo: 'Desfazer', acao: () => { const t2 = loadJson(KEY.cenarios, { itens: [] }); t2.itens.splice(k, 0, c); saveJson(KEY.cenarios, t2); abrirCenarios(); } });
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
        S.moldura(ctx, W, H, 'Minha tabela final', 'Brasileirão 2026' + (n ? ' · ' + n + (n === 1 ? ' placar simulado' : ' placares simulados') : ''));
        const x0 = 64, y0 = 340, lh = 43;
        ctx.textAlign = 'right'; ctx.font = '700 22px Manrope'; ctx.fillStyle = 'rgba(244,248,242,.6)';
        ctx.fillText('P', W - 300, y0 - 14); ctx.fillText('V', W - 200, y0 - 14); ctx.fillText('SG', W - 80, y0 - 14);
        tab.forEach((x, k) => {
          const y = y0 + k * lh, t = st.L.times[x.i], z = C.zonaDe(st.regras, x.pos);
          if (k % 2 === 0) { ctx.fillStyle = 'rgba(255,255,255,.045)'; ctx.fillRect(x0 - 16, y, W - 2 * x0 + 32, lh); }
          if (st.meu && st.meu.i === x.i) { ctx.fillStyle = 'rgba(232,240,160,.16)'; ctx.fillRect(x0 - 16, y, W - 2 * x0 + 32, lh); }
          if (z) { ctx.fillStyle = S.COR.zonas[z]; ctx.fillRect(x0 - 16, y + 7, 6, lh - 14); }
          ctx.textAlign = 'right'; ctx.fillStyle = '#f4f8f2'; ctx.font = '800 25px Manrope';
          ctx.fillText(String(x.pos), x0 + 36, y + 30);
          if (escudos[k]) ctx.drawImage(escudos[k], x0 + 54, y + 6, 31, 31);
          ctx.textAlign = 'left';
          S.textoCabe(ctx, nome(t), x0 + 100, y + 30, 520, x.pos === 1 ? '800' : '700', 26);
          ctx.textAlign = 'right'; ctx.font = '800 26px Manrope'; ctx.fillStyle = x.pos === 1 ? S.COR.giz : '#f4f8f2';
          ctx.fillText(String(x.pts), W - 300, y + 30);
          ctx.fillStyle = 'rgba(244,248,242,.82)'; ctx.font = '600 24px Manrope';
          ctx.fillText(String(x.v), W - 200, y + 30);
          ctx.fillText((x.sg > 0 ? '+' : '') + x.sg, W - 80, y + 30);
        });
        ctx.textAlign = 'left';
        return entregar(c, 'tabela-final-brasileirao-2026.png', previa);
      });
    }).catch((e) => { T.reportError(e, 'imagem'); aviso('Não consegui gerar a imagem'); });
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
        S.moldura(ctx, W, H, 'Os meus placares', 'Brasileirão 2026 · ' + lista.length + (lista.length === 1 ? ' jogo' : ' jogos'));
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
            ctx.fillStyle = S.COR.giz; ctx.font = '800 23px Manrope'; ctx.textAlign = 'left';
            ctx.fillText(it.titulo.toUpperCase(), x + 4, y + lh * 0.66);
            return;
          }
          const j = it.j, p = placarDe(j), h = st.L.times[j.h], a = st.L.times[j.a];
          const cy = y + lh / 2, sz = Math.min(36, lh - 16);
          ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(x, y + 4, colW, lh - 8);
          if (img[j.h]) ctx.drawImage(img[j.h], x + 12, cy - sz / 2, sz, sz);
          if (img[j.a]) ctx.drawImage(img[j.a], x + colW - 12 - sz, cy - sz / 2, sz, sz);
          ctx.fillStyle = '#f4f8f2';
          ctx.textAlign = 'left'; S.textoCabe(ctx, (h.abrev || nome(h)).toUpperCase(), x + 20 + sz, cy + 8, colW / 2 - sz - 66, '700', 22);
          ctx.textAlign = 'right'; S.textoCabe(ctx, (a.abrev || nome(a)).toUpperCase(), x + colW - 20 - sz, cy + 8, colW / 2 - sz - 66, '700', 22);
          ctx.textAlign = 'center'; ctx.font = '900 34px "Big Shoulders"'; ctx.fillStyle = st.sim[j.chave] ? 'rgba(244,248,242,.85)' : S.COR.giz;
          ctx.fillText(p[0] + ' × ' + p[1], x + colW / 2, cy + 12);
        });
        ctx.textAlign = 'left';
        return entregar(c, 'meus-placares-brasileirao-2026.png', previa);
      });
    }).catch((e) => { T.reportError(e, 'imagem'); aviso('Não consegui gerar a imagem'); });
  }

  // mostra a prévia (na janela de compartilhar) com o botão; sem prévia, compartilha direto
  function entregar(c, nomeArq, previa) {
    const S = window.TNGCompartilhar;
    const url = linkCenario(), texto = textoPartilha();
    window.TNG_IMAGEM = c;                       // para o roteiro de capturas
    if (!previa) return S.enviar(c, nomeArq, texto, url);
    previa.innerHTML = '<img alt="Prévia da imagem" src="' + c.toDataURL('image/png') + '"><div class="j-acoes"><button class="btn primario" data-p="enviar">' + ICON.partilha + 'Compartilhar a imagem</button></div>';
    previa.querySelector('[data-p="enviar"]').onclick = () => S.enviar(c, nomeArq, texto, url);
    return c;
  }

  // ================================================================== eventos
  function ligar() {
    const v = st.view;
    const onClick = (e) => {
      const ir = e.target.closest('[data-ir]');
      if (ir) { e.preventDefault(); const alvo = v.querySelector('#g-' + ir.dataset.ir); if (alvo) alvo.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      const aba = e.target.closest('button[data-aba]');   // (o contêiner .sim-cols também tem data-aba)
      if (aba) { trocarAba(aba.dataset.aba); return; }
      const r = e.target.closest('.prob button');
      if (r) {
        const li = r.closest('.jogo'), chave = li.dataset.c, j = st.L.jogos.find((x) => x.chave === chave);
        const p = st.M.prob(j.h, j.a), k = +r.dataset.r, atual = placarDe(j);
        if (atual && resultado(atual) === k && !st.sim[chave]) definir(chave, null);           // tocar de novo desfaz
        else definir(chave, (k === 0 ? p.tipico.h : k === 1 ? p.tipico.d : p.tipico.a).slice(), false);
        return;
      }
      const tr = e.target.closest('table.chances tbody tr[data-t]');
      if (tr) { abrirDistribuicao(tr); return; }
      const b = e.target.closest('[data-a]');
      if (!b || b.tagName === 'SELECT') return;
      const a = b.dataset.a;
      if (a === 'simular') simularResto();
      else if (a === 'limpar') limpar();
      else if (a === 'esconder') { st.prefs.esconder = !st.prefs.esconder; salvarPrefs(); desenharTabela(); atualizarResumoMeu(); atualizarBarraRevelar(); }
      else if (a === 'revelar') revelar();
      else if (a === 'partilhar') abrirCompartilhar();
      else if (a === 'cenarios') abrirCenarios();
      else if (a === 'so-meus') { st.soMeus = !st.soMeus; desenharJogos(); }
      else if (a === 'usar-comp') {
        st.p = Object.assign({}, st.compartilhado); st.sim = {}; st.compartilhado = null; salvarPlacares();
        history.replaceState(history.state, '', '#/simulador' + (st.meu ? '/' + st.meu.slug : ''));
        montar(); aviso('O cenário agora é seu: pode editar');
      } else if (a === 'sair-comp') { st.compartilhado = null; location.hash = '#/simulador' + (st.meu ? '/' + st.meu.slug : ''); }
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
        if (prox) prox.focus();
      }
    };
    const onFocus = (e) => { const inp = e.target.closest && e.target.closest('.placar input'); if (inp) setTimeout(() => { if (document.activeElement === inp) inp.select(); }, 0); };   // select() atrasado puxaria o foco de volta
    const onChange = (e) => {
      if (e.target.matches('select[data-a="meu"]')) { location.hash = e.target.value ? '#/simulador/' + e.target.value : '#/simulador'; return; }
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
        return carregarDados();
      }).then(() => {
        st.view = view;
        st.meu = params[0] ? timePorSlug(params[0]) : null;
        if (params[0] && !st.meu) aviso('Não achei esse time; mostrando o campeonato inteiro');
        st.compartilhado = null;
        if (ctx.c || ctx.cv4) {
          // cv4: link da versão antiga em arquivo único (outra ordem dos pares)
          const dec = ctx.c ? window.TNGCore.decodificar(st.L, ctx.c) : window.TNGCore.decodificarAntigo(st.L, ctx.cv4);
          if (dec) st.compartilhado = dec; else aviso('Esse link de cenário está incompleto');
        }
        if (ctx.aba && /^(jogos|tabela|chances)$/.test(ctx.aba)) st.aba = ctx.aba;
        st.versao++;
        st.chancesVersao = -1;
        if (st.meu) document.title = 'Simulador ' + de_(st.meu) + ' no Brasileirão 2026 · Tapa na Gaveta';
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

/* Tapa na Gaveta · casca do site: armazenamento, tema, rotas, topo, rodapé e abas sob demanda.
   Cada aba é um módulo em app/abas/<aba>.js que se registra com TNG.aba(nome, { ... }) e só é
   carregado na primeira visita. Modelo: referencias/supercroc/app.js (parse, render, goBack). */
(function () {
  'use strict';

  const RELEASE = !!window.TNG_RELEASE;
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ================================================================== armazenamento protegido
  // As chaves ficam gravadas no aparelho de quem usa: são contrato, NÃO renomear.
  const KEY = {
    tema: 'tng.tema',               // 'auto' | 'light' | 'dark'
    espnCache: 'tng.espn.cache',    // último retrato da ESPN baixado, com a data
    placares: 'tng.placares',       // placares que o usuário preencheu no simulador
    cenarios: 'tng.cenarios',       // cenários salvos com nome
    escalacoes: 'tng.escalacoes',
    prefs: 'tng.prefs',
  };
  const loadJson = (key, def) => {
    try {
      const v = JSON.parse(localStorage.getItem(key) || 'null');
      return v && typeof v === 'object' ? v : def;     // lixo salvo não quebra o site
    } catch (e) { return def; }
  };
  const saveJson = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } };
  const loadStr = (key, def) => { try { const v = localStorage.getItem(key); return v == null ? def : v; } catch (e) { return def; } };
  const saveStr = (key, v) => { try { localStorage.setItem(key, v); } catch (e) { /* sem armazenamento */ } };

  function reportError(e, where) {
    if (!RELEASE) console.error('[' + where + ']', e);
  }
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason, 'promise'));

  // ================================================================== links para a Google Play
  const APPS = [
    { id: 'voce-escala', nome: 'Você Escala', sub: 'Monte e compare escalações', pacote: 'com.julio.escalafutebol' },
    { id: 'milhao-do-futebol', nome: 'Jogo do Milhão', sub: 'Quiz de futebol valendo 1 milhão', pacote: 'com.julio333.ShowMilhaoFutebol' },
    { id: 'football-draft', nome: 'Football Draft', sub: 'Monte o seu XI e jogue a campanha', pacote: 'com.julio333.FootballDraft' },
    { id: 'fast-football', nome: 'Fast Football', sub: 'Partidas relâmpago na arena', pacote: 'com.julio.footballexpress' },
  ];
  // origem medida: utm_medium = aba de onde a pessoa saiu
  const playUrl = (pacote, aba) => 'https://play.google.com/store/apps/details?id=' + pacote +
    '&referrer=' + encodeURIComponent('utm_source=tapanagaveta&utm_medium=' + (aba || 'site'));
  const app = (id) => APPS.find((a) => a.id === id);

  // ================================================================== ícones (traço fino, sem enfeite)
  const ICON = {
    lua: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    sol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#00d7fe" d="M3.6 2.3 13.4 12l-9.8 9.7c-.4-.2-.6-.6-.6-1.1V3.4c0-.5.2-.9.6-1.1z"/><path fill="#32bb4f" d="M16.7 8.7 13.4 12 3.6 2.3c.2-.1.5-.1.8 0z"/><path fill="#ff3a44" d="m16.7 15.3-12.3 6.4c-.3.1-.6.1-.8 0l9.8-9.7z"/><path fill="#ffd400" d="m20.4 10.6-3.7-1.9-3.3 3.3 3.3 3.3 3.7-1.9c.8-.5.8-1.9 0-2.8z"/></svg>',
    obra: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  };

  // ================================================================== logotipo
  // "gaveta" é o ângulo do gol: travessão + trave, rede em traço fino e a bola encaixada no canto
  const LOGO = '<svg class="logo" viewBox="0 0 236 40" role="img" aria-label="Tapa na Gaveta">' +
    '<g fill="none" stroke="currentColor" stroke-linecap="round">' +
    '<path d="M3 6H35V38" stroke-width="4.6"/>' +
    '<path d="M10 6l25 25M19 6l16 16M28 6l7 7M3 14h22M3 22h14" stroke-width="1" opacity=".45"/></g>' +
    '<circle cx="24" cy="17" r="5.5" fill="var(--chalk)"/>' +
    '<text x="49" y="28" transform="skewX(-6)" font-family="\'Archivo Largo\', Archivo, sans-serif" font-weight="900" font-size="19" letter-spacing="-.3" fill="currentColor">tapa na <tspan fill="var(--chalk)">gaveta</tspan></text></svg>';

  // ================================================================== tema
  function temaAtual() { return loadStr(KEY.tema, 'auto'); }
  function escuroAgora() {
    const t = document.documentElement.getAttribute('data-theme');
    return t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function aplicarTema(t) {
    saveStr(KEY.tema, t);
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', escuroAgora() ? '#060b1f' : '#0b1640');
    desenharTopo();
    desenharRodape();
  }

  // ================================================================== aviso rápido
  let avisoT = 0;
  // aviso rápido; com { rotulo, acao } ganha um botão (ex.: "Desfazer") e fica mais tempo
  function aviso(msg, opc) {
    const el = $('#aviso');
    el.innerHTML = '<span>' + esc(msg) + '</span>' + (opc && opc.rotulo ? '<button type="button">' + esc(opc.rotulo) + '</button>' : '');
    el.classList.toggle('com-acao', !!(opc && opc.rotulo));
    const b = el.querySelector('button');
    if (b) b.onclick = () => { el.classList.remove('on'); try { opc.acao(); } catch (e) { reportError(e, 'aviso'); } };
    el.classList.add('on');
    clearTimeout(avisoT);
    avisoT = setTimeout(() => el.classList.remove('on'), opc && opc.rotulo ? 6000 : 1900);
  }

  // ================================================================== versão (cache)
  // Cada publicação tem uma versão (tools/build.js). Tudo que é do site é pedido com ?v=VERSÃO:
  // o navegador guarda à vontade, mas nunca mistura arquivo velho com novo. Sem versão (rodando
  // local), os endereços ficam como estão.
  const VERSAO = window.TNG_V || '';
  const comV = (u) => (VERSAO && typeof u === 'string' && /^(app|shared|dados|textos|jogos|midia)\//.test(u) && u.indexOf('?') < 0 ? u + '?v=' + VERSAO : u);
  if (VERSAO && window.fetch) {
    const fetch0 = window.fetch.bind(window);
    window.fetch = (u, o) => fetch0(comV(u), o);
  }
  // Saiu versão nova com a página aberta (ou o index.html veio do cache do navegador): recarrega uma
  // vez. Os placares, cenários e escalações ficam no aparelho e continuam lá depois de recarregar.
  function conferirVersao() {
    if (!VERSAO || /[?&]offline\b/.test(location.search)) return;
    fetch('versao.json?t=' + Date.now(), { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((j) => {
      if (!j || !j.v || j.v === VERSAO) return;
      let ja = '';
      try { ja = sessionStorage.getItem('tng.recarregou') || ''; sessionStorage.setItem('tng.recarregou', j.v); } catch (e) { return; }
      if (ja === j.v) return;                       // já recarregou para essa versão: não entra em laço
      if (document.visibilityState === 'visible' && document.querySelector('input:focus, textarea:focus, select:focus')) {
        document.addEventListener('focusout', () => setTimeout(() => location.reload(), 300), { once: true });
      } else location.reload();
    }).catch(() => {});
  }
  window.addEventListener('load', conferirVersao);
  // voltou para a aba depois de um tempo (celular com o site aberto desde ontem)
  let escondidaEm = 0;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') escondidaEm = Date.now();
    else if (escondidaEm && Date.now() - escondidaEm > 5 * 60e3) conferirVersao();
  });

  // ================================================================== scripts sob demanda
  const scripts = {};
  function script(src) {
    if (!scripts[src]) {
      scripts[src] = new Promise((ok, falha) => {
        const s = document.createElement('script');
        s.src = comV(src);
        s.onload = () => ok();
        s.onerror = () => { delete scripts[src]; falha(new Error('não carregou ' + src)); };
        document.head.appendChild(s);
      });
    }
    return scripts[src];
  }

  // ================================================================== janela (modal)
  // Usa <dialog>; fecha com Esc, com o X e tocando fora. Devolve o elemento do corpo da janela.
  function janela(titulo, corpoHtml, opc) {
    fecharJanela();
    const d = document.createElement('dialog');
    d.className = 'janela' + (opc && opc.classe ? ' ' + opc.classe : '');
    d.innerHTML = '<div class="jan-topo"><h2>' + esc(titulo) + '</h2><button class="icon-btn jan-x" type="button" aria-label="Fechar">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>' +
      '<div class="jan-corpo">' + corpoHtml + '</div>';
    document.body.appendChild(d);
    d.querySelector('.jan-x').onclick = fecharJanela;
    d.addEventListener('click', (e) => { if (e.target === d) fecharJanela(); });
    d.addEventListener('close', () => { d.remove(); if (opc && opc.aoFechar) opc.aoFechar(); });
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    return d.querySelector('.jan-corpo');
  }
  function fecharJanela() {
    const d = document.querySelector('dialog.janela');
    if (!d) return;
    if (typeof d.close === 'function' && d.open) d.close(); else d.remove();
  }

  // endereço do site para marcas-d'água e links (o domínio definitivo é decisão do Julio)
  function enderecoSite() {
    const h = location.host;
    return /^(localhost|127\.|\[::1\])/.test(h) || !h ? 'tapanagaveta.com.br' : h.replace(/^www\./, '');
  }
  // no Artifact do claude.ai a página roda num quadro com outro endereço: links usam o do Artifact
  const ARTIFACT = !!window.TNG_ARTIFACT;
  function urlBase() { return ARTIFACT && window.TNG_ARTIFACT_URL ? window.TNG_ARTIFACT_URL : location.origin + location.pathname; }
  // no Artifact, a rota visível vira a forma simples (#jogos-milhao), que o endereço do claude.ai leva
  function rotaSimples() {
    if (!ARTIFACT || !/^#\//.test(location.hash) || location.hash.indexOf('?') >= 0) return;
    const simples = '#' + location.hash.slice(2).split('/').filter(Boolean).join('-');
    try { history.replaceState(history.state, '', simples === '#' ? '#simulador' : simples); } catch (e) { /* ok */ }
  }

  // ================================================================== rotas
  // #/                       → simulador (a aba principal)
  // #/simulador/flamengo     → simulador com o time escolhido
  // #/escalacao  #/jogos  #/jogos/draft
  // os 20 clubes de 2026, para os atalhos do rodapé (slug = nome do escudo em midia/escudos)
  const TIMES_RODAPE = [['athletico', 'do Athletico'], ['atleticomg', 'do Atlético-MG'], ['bahia', 'do Bahia'], ['botafogo', 'do Botafogo'], ['chapecoense', 'da Chapecoense'],
    ['corinthians', 'do Corinthians'], ['coritiba', 'do Coritiba'], ['cruzeiro', 'do Cruzeiro'], ['flamengo', 'do Flamengo'], ['fluminense', 'do Fluminense'],
    ['gremio', 'do Grêmio'], ['internacional', 'do Internacional'], ['mirassol', 'do Mirassol'], ['palmeiras', 'do Palmeiras'], ['bragantino', 'do Bragantino'],
    ['remo', 'do Remo'], ['santos', 'do Santos'], ['sp', 'do São Paulo'], ['vasco', 'do Vasco'], ['vitoria', 'do Vitória']];
  const MENU = [['simulador', 'Simulador'], ['escalacao', 'Escalação'], ['jogos', 'Jogos'], ['estatisticas', 'Estatísticas']];
  const ABAS = { inicio: 1, simulador: 1, escalacao: 1, jogos: 1, estatisticas: 1, sobre: 1, privacidade: 1, termos: 1, modelo: 1, desempate: 1, contato: 1 };
  // as páginas de texto (textos/*.html) usam o mesmo módulo
  const MODULO = { sobre: 'textos', privacidade: 'textos', termos: 'textos', modelo: 'textos', desempate: 'textos', contato: 'textos' };
  const INSTITUCIONAL = [['sobre', 'Quem somos'], ['modelo', 'Como funciona'], ['desempate', 'Desempates'], ['contato', 'Contato'], ['privacidade', 'Privacidade'], ['termos', 'Termos de uso']];
  // contato que aparece em Quem somos, Privacidade e Termos: preencha o e-mail quando tiver um
  const CONTATO = { email: 'tapanagaveta2026@gmail.com', github: 'https://github.com/jeanchester/tapa-na-gaveta/issues' };
  const contatoHtml = () => (CONTATO.email ? 'Escreva para <a href="mailto:' + esc(CONTATO.email) + '">' + esc(CONTATO.email) + '</a>.'
    : 'Mande uma mensagem pelo <a href="' + CONTATO.github + '" target="_blank" rel="noopener">GitHub do projeto</a>.');

  // aceita "#/jogos/milhao" e também a forma simples "#jogos-milhao" (a única que um link de
  // Artifact do claude.ai carrega; os slugs dos times e dos jogos não têm hífen)
  // endereços da versão antiga em arquivo único (#simular, #numeros...) continuam abrindo
  const ANTIGAS = { simular: '/simulador', chances: '/simulador?aba=chances', 'meu-time': '/simulador', salvos: '/simulador', numeros: '/estatisticas' };
  function parse(hash) {
    let h = String(hash || '').replace(/^#/, '');
    if (ANTIGAS[h]) h = ANTIGAS[h];
    if (h && h[0] !== '/' && h.indexOf('?') < 0) h = '/' + h.split('-').join('/');
    const [path, query] = (h || '/').split('?');
    const ctx = {};
    (query || '').split('&').forEach((kv) => { const i = kv.indexOf('='); if (kv) ctx[i < 0 ? kv : kv.slice(0, i)] = i < 0 ? '' : decodeURIComponent(kv.slice(i + 1)); });
    const parts = path.split('/').filter(Boolean).map((p) => { try { return decodeURIComponent(p); } catch (e) { return p; } });
    if (!parts.length) parts.push('inicio');
    return { parts, ctx };
  }

  function desenharTopo() {
    const aba = parse(location.hash).parts[0];
    const nav = (cls) => '<nav class="nav ' + cls + '" aria-label="Seções">' + MENU.map(([id, nome]) =>
      '<a href="#/' + id + '"' + (id === aba ? ' aria-current="page"' : '') + (id === 'estatisticas' ? ' class="so-largo"' : '') + '>' + nome + '</a>').join('') + '</nav>';
    const escuro = escuroAgora();
    $('#topo').innerHTML =
      '<div class="wrap head-row"><a class="marca" href="#/" aria-label="Tapa na Gaveta, início">' + LOGO + '</a>' +
      nav('nav-top') + '<span class="sp"></span>' +
      '<button class="icon-btn" data-act="tema" aria-label="' + (escuro ? 'Usar tema claro' : 'Usar tema escuro') + '">' + (escuro ? ICON.sol : ICON.lua) + '</button></div>' +
      '<div class="nav-row"><div class="wrap">' + nav('') + '</div></div>';
  }

  function desenharRodape() {
    const aba = parse(location.hash).parts[0];
    const t = temaAtual();
    const op = (v, n) => '<button data-tema="' + v + '" aria-pressed="' + (t === v) + '">' + n + '</button>';
    // rodapé enxuto: o que interessa é a simulação; aqui só os links obrigatórios e os apps
    $('#rodape').innerHTML = '<div class="wrap">' +
      '<div class="foot-linha"><nav class="foot-inst" aria-label="Sobre o site"><a href="analises/">Análises</a>' + INSTITUCIONAL.map(([id, n]) => '<a href="#/' + id + '">' + n + '</a>').join('') + '</nav>' +
      '<div class="foot-apps" aria-label="Nossos apps">' + APPS.map((a) =>
        '<a href="' + esc(playUrl(a.pacote, aba)) + '" target="_blank" rel="noopener" title="' + esc(a.nome) + ' na Google Play" aria-label="' + esc(a.nome) + ' na Google Play"><img src="midia/icones/' + a.id + '.png" alt="" width="36" height="36" loading="lazy"></a>').join('') + '</div></div>' +
      '<div class="foot-base"><p>Tapa na Gaveta · Resultados e calendário: ESPN (dados não oficiais). As probabilidades são calculadas pelo site e não são palpites de aposta.</p>' +
      '<div class="tema-sel" role="group" aria-label="Tema">' + op('auto', 'Automático') + op('light', 'Claro') + op('dark', 'Escuro') + '</div></div></div>';
  }

  // ---------------------------------------------------------------- módulos das abas
  const modulos = {};
  const carregando = {};
  function aba(nome, def) { modulos[nome] = def; }
  function carregarAba(nome) {
    if (modulos[nome]) return Promise.resolve(modulos[nome]);
    if (!carregando[nome]) {
      carregando[nome] = new Promise((ok, falha) => {
        const s = document.createElement('script');
        s.src = comV('app/abas/' + nome + '.js');
        s.onload = () => (modulos[nome] ? ok(modulos[nome]) : falha(new Error('a aba ' + nome + ' não se registrou')));
        s.onerror = () => { delete carregando[nome]; falha(new Error('não carregou app/abas/' + nome + '.js')); };
        document.head.appendChild(s);
      });
    }
    return carregando[nome];
  }

  function setMeta(titulo, descricao) {
    document.title = titulo ? titulo + ' · Tapa na Gaveta' : 'Tapa na Gaveta';
    const m = $('meta[name="description"]');
    if (m && descricao) m.setAttribute('content', descricao);
  }

  const scrollMemo = {};
  let atual = '';                // última tela desenhada (para lembrar a rolagem)
  let pedido = '';               // última tela pedida (pode ainda estar carregando)
  let voltando = false;
  let saida = null;               // função de limpeza da tela anterior (timers, workers...)

  function render() {
    const hash = location.hash || '#/';
    if (atual) scrollMemo[atual] = window.scrollY;
    pedido = hash;
    const { parts, ctx } = parse(hash);
    desenharTopo();
    desenharRodape();
    if (saida) { try { saida(); } catch (e) { reportError(e, 'saida'); } saida = null; }
    fecharJanela();
    const view = $('#conteudo');
    const alvo = hash;
    if (!ABAS[parts[0]]) {
      setMeta('Página não encontrada');
      view.innerHTML = naoEncontrada();
      return Promise.resolve(fim(alvo));
    }
    view.setAttribute('aria-busy', 'true');
    const nomeMod = MODULO[parts[0]] || parts[0];
    if (!modulos[nomeMod]) view.innerHTML = '<div class="carregando">Carregando…</div>';
    return carregarAba(nomeMod).then((m) => {
      if (alvo !== (location.hash || '#/')) return;             // o usuário já foi para outra tela
      setMeta(m.titulo, m.descricao);
      return Promise.resolve(m.render(view, MODULO[parts[0]] ? parts : parts.slice(1), ctx)).then((limpar) => {
        if (alvo !== (location.hash || '#/')) return;
        if (typeof limpar === 'function') saida = limpar;
        fim(alvo);
      });
    }).catch((e) => {
      reportError(e, 'render');
      if (alvo !== (location.hash || '#/')) return;
      setMeta('Ops');
      view.innerHTML = '<div class="vazio">' + BOLA_FORA + '<h1>Não consegui abrir esta página</h1><p>Confira a conexão e tente de novo.</p><button class="btn primario" data-act="recarregar">Tentar de novo</button></div>';
      fim(alvo);
    });
  }
  function fim(alvo) {
    const view = $('#conteudo');
    view.removeAttribute('aria-busy');
    window.scrollTo(0, voltando ? (scrollMemo[alvo] || 0) : 0);
    voltando = false;
    atual = alvo;
  }

  const BOLA_FORA = '<svg viewBox="0 0 120 80" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M10 70V14h66v56"/><path d="M22 14l54 46M40 14l36 30M10 34h30" stroke-width="1" opacity=".5"/><circle cx="100" cy="22" r="9"/><path d="M84 30l-6 3M86 38l-5 1" opacity=".6"/></svg>';
  function naoEncontrada() {
    return '<div class="vazio">' + BOLA_FORA + '<h1>Essa passou longe da gaveta</h1><p>A página que você procurou não existe ou mudou de endereço.</p><a class="btn primario" href="#/simulador">Ir para o simulador</a></div>';
  }

  window.addEventListener('popstate', () => { voltando = true; });
  // compara com a tela PEDIDA: voltar para uma tela enquanto outra ainda carrega precisa redesenhar
  window.addEventListener('hashchange', () => { rotaSimples(); if ((location.hash || '#/') !== pedido) render(); });

  // ================================================================== cliques globais
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-act], [data-tema]');
    if (!b) return;
    if (b.dataset.tema) { aplicarTema(b.dataset.tema); return; }
    const act = b.dataset.act;
    if (act === 'tema') { const t = escuroAgora() ? 'light' : 'dark'; aplicarTema(t); aviso(t === 'dark' ? 'Tema escuro' : 'Tema claro'); }
    else if (act === 'recarregar') location.reload();
  });
  // se o tema é automático e o sistema troca, o ícone do topo acompanha
  try { window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (temaAtual() === 'auto') desenharTopo(); }); } catch (e) { /* navegador antigo */ }

  // ================================================================== para as abas, testes e capturas
  // modo criador (?criador na URL, ?criador=0 desliga): libera o vídeo, que fica só para a gente
  // fazer conteúdo; o público compartilha imagem e GIF
  try {
    const q = new URLSearchParams(location.search).get('criador');
    if (q !== null) { if (q === '0') localStorage.removeItem('tng.criador'); else localStorage.setItem('tng.criador', '1'); }
  } catch (e) { /* sem armazenamento */ }
  const criador = () => { try { return localStorage.getItem('tng.criador') === '1'; } catch (e) { return false; } };
  // versão de teste: jogos e tabela lado a lado no celular (?duas liga, ?duas=0 desliga)
  try {
    const q = new URLSearchParams(location.search).get('duas');
    if (q !== null) { if (q === '0') localStorage.removeItem('tng.duas'); else localStorage.setItem('tng.duas', '1'); }
    if (localStorage.getItem('tng.duas') === '1') document.documentElement.classList.add('duas-colunas');
  } catch (e) { /* sem armazenamento */ }
  const duas = () => document.documentElement.classList.contains('duas-colunas');

  // escudo que não carrega (arquivo ausente, rede ruim): troca por um disco com as iniciais do clube
  document.addEventListener('error', (e) => {
    const im = e.target;
    if (!im || im.tagName !== 'IMG' || !/midia\/escudos\//.test(im.getAttribute('src') || '') || im.dataset.semEscudo) return;
    // 1ª falha: o navegador pode ter guardado um erro antigo; pede de novo, sem cache
    if (!im.dataset.tentou) { im.dataset.tentou = '1'; im.src = im.getAttribute('src').replace(/\?.*$/, '') + '?r=' + Date.now(); return; }
    im.dataset.semEscudo = '1';
    const f = (im.getAttribute('src').match(/escudos\/([^./]+)/) || [, '?'])[1];
    const d = document.createElement('span');
    d.className = (im.className || 'crest') + ' disco'; d.setAttribute('aria-hidden', 'true');
    d.textContent = (im.dataset.n || f).replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
    if (im.parentNode) im.parentNode.replaceChild(d, im);
  }, true);

  // cartões de um jogador: amarelos do ciclo atual (1, 2 ou 3) ou o vermelho; suspenso ganha o selo
  function cartoes(x, curto) {
    if (!x) return '';
    let ic = '', tit = '';
    const ciclo = x.ciclo != null ? x.ciclo : 0;
    if (x.suspenso) {
      const exp = x.motivo === 'vermelho';
      ic = exp ? '<i class="cartao v"></i>' : '<i class="cartao"></i><i class="cartao"></i><i class="cartao"></i>';
      tit = exp ? 'Suspenso: expulso no último jogo' : 'Suspenso: 3 amarelos';
    } else if (ciclo) {
      ic = new Array(ciclo + 1).join('<i class="cartao"></i>');
      tit = ciclo + (ciclo === 1 ? ' amarelo' : ' amarelos') + (x.pendurado ? ': pendurado' : '');
    } else return '';
    return '<span class="cartoes' + (x.suspenso ? ' susp' : '') + '" title="' + tit + '" aria-label="' + tit + '">' + ic + (x.suspenso && !curto ? '<em>suspenso</em>' : '') + '</span>';
  }

  // Bandeirinha de cada competição (SVG próprio, vale também no Windows, onde o emoji de bandeira não aparece)
  const BANDEIRAS = {
    brasil: '<rect width="20" height="14" fill="#1a9b4b"/><path d="M10 2 18 7 10 12 2 7Z" fill="#ffd23f"/><circle cx="10" cy="7" r="3.1" fill="#1631a8"/>',
    inglaterra: '<rect width="20" height="14" fill="#fff"/><path d="M8.6 0h2.8v14H8.6zM0 5.6h20v2.8H0z" fill="#d52b1e"/>',
    espanha: '<rect width="20" height="14" fill="#c8102e"/><rect y="3.5" width="20" height="7" fill="#ffc400"/>',
    italia: '<rect width="20" height="14" fill="#fff"/><rect width="6.7" height="14" fill="#009246"/><rect x="13.3" width="6.7" height="14" fill="#ce2b37"/>',
    alemanha: '<rect width="20" height="14" fill="#dd0000"/><rect width="20" height="4.7" fill="#111"/><rect y="9.3" width="20" height="4.7" fill="#ffce00"/>',
    franca: '<rect width="20" height="14" fill="#fff"/><rect width="6.7" height="14" fill="#0055a4"/><rect x="13.3" width="6.7" height="14" fill="#ef4135"/>'
  };
  const PAIS = { seriea: 'brasil', serieb: 'brasil', premier: 'inglaterra', laliga: 'espanha', italiano: 'italia', bundesliga: 'alemanha', frances: 'franca' };
  function bandeira(id) {
    const b = BANDEIRAS[PAIS[id]];
    return b ? '<svg class="bdr" viewBox="0 0 20 14" aria-hidden="true" focusable="false">' + b + '</svg>' : '';
  }

  window.TNG = { bandeira, duas, criador, cartoes, comV, VERSAO, CONTATO, contatoHtml, INSTITUCIONAL, MENU, TIMES_RODAPE, ARTIFACT, RELEASE, KEY, loadJson, saveJson, loadStr, saveStr, esc, aviso, aba, render, reportError, APPS, app, playUrl, ICON, parse, script, janela, fecharJanela, enderecoSite, urlBase, LOGO };

  // link de compartilhamento na raiz (site/?c=...): leva o cenário para a rota do simulador
  try {
    const q = new URLSearchParams(location.search);
    const antigo = /^#[a-z-]+$/.test(location.hash) && !/^#(simulador|escalacao|jogos|estatisticas)/.test(location.hash);
    if (q.get('c') && antigo) {
      // link da versão em arquivo único: site/?c=...#simular (r=1: abria com a tabela escondida)
      const c = q.get('c'), rev = q.get('r');
      q.delete('c'); q.delete('r');
      const resto = q.toString();
      history.replaceState(null, '', location.pathname + (resto ? '?' + resto : '') + '#/simulador?cv4=' + encodeURIComponent(c) + (rev ? '&revelar' : ''));
    } else if (q.get('c') && (!location.hash || location.hash === '#/')) {
      q.delete('c');
      const resto = q.toString();
      history.replaceState(null, '', location.pathname + (resto ? '?' + resto : '') + '#/simulador?c=' + encodeURIComponent(new URLSearchParams(location.search).get('c')));
    }
  } catch (e) { /* navegador antigo */ }
  rotaSimples();
  render();
})();

// Dez a Zero: as telas. Cada tela é uma função que monta o HTML de #tela e registra as ações
// (data-acao="..."). A navegação guarda uma pilha para o botão ‹ e o voltar do Android.
(function () {
  'use strict';
  const C = window.DezCore, P = window.DezPartida, D = window.Dez, V = window.DezVisual, CP = window.DezCampinho;
  const t = D.t, esc = V.esc;
  const tela = document.getElementById('tela');
  const modalEl = document.getElementById('modal');
  const toastEl = document.getElementById('toast');

  // ------------------------------------------------------------ navegação
  const pilha = [];
  let atual = null;
  let acoes = {};
  let aoSair = null; // limpeza da tela atual (laço da partida, ouvintes)
  const TELAS = {};
  const TELAS_COM_MUSICA = ['inicio', 'modos', 'formacao', 'loja', 'estadio', 'time', 'recordes', 'config'];
  function ir(nome, params, opts = {}) {
    if (atual && !opts.substituir) pilha.push(atual);
    if (opts.limpar) pilha.length = 0;
    atual = { nome, params: params || {} };
    mostrar();
  }
  function mostrar() {
    if (aoSair) { try { aoSair(); } catch (e) { D.analytics.error(e, 'sair_tela'); } aoSair = null; }
    fecharModal();
    acoes = {};
    tela.scrollTop = 0;
    TELAS[atual.nome](atual.params);
    D.analytics.screen(atual.nome);
    // a música dos menus toca nas telas de menu e some no draft, na campanha e na partida
    if (TELAS_COM_MUSICA.includes(atual.nome)) D.musica.ligar(); else D.musica.desligar();
  }
  function voltar() {
    if (!modalEl.hidden) { if (modalEl.dataset.fixo !== '1') fecharModal(); return; }
    if (atual && atual.nome === 'partida') { if (acoes.pausar) acoes.pausar(); return; }
    if (atual && atual.nome === 'inicio') return 'sair';
    if (atual && atual.nome === 'draft') return void confirmarSairDraft();
    if (pilha.length) { atual = pilha.pop(); mostrar(); return; }
    ir('inicio', null, { substituir: true, limpar: true });
  }
  tela.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-acao]');
    if (!el || !tela.contains(el)) return;
    D.som.iniciar();
    const f = acoes[el.dataset.acao];
    if (f) { if (!el.dataset.mudo) D.som.toque(); f(el.dataset, el, ev); }
  });

  // ------------------------------------------------------------ modal e aviso
  let acoesModal = {};
  function abrirModal(html, acs, opts = {}) {
    acoesModal = acs || {};
    modalEl.innerHTML = `<div class="caixa">${html}</div>`;
    modalEl.hidden = false;
    modalEl.dataset.fixo = opts.fixo ? '1' : '0';
  }
  function fecharModal() { modalEl.hidden = true; modalEl.innerHTML = ''; acoesModal = {}; }
  modalEl.addEventListener('click', (ev) => {
    if (ev.target === modalEl && modalEl.dataset.fixo !== '1') return fecharModal();
    const el = ev.target.closest('[data-acao]');
    if (!el) return;
    D.som.toque();
    const f = acoesModal[el.dataset.acao];
    if (f) f(el.dataset, el, ev);
  });
  let toastTimer = null;
  function toast(msg, ms = 2200) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, ms);
  }
  function confirmar(titulo, texto, sim, nao) {
    return new Promise((resolve) => {
      abrirModal(`<h2>${titulo}</h2><p class="sub">${texto}</p><div class="linha-btns"><button class="btn borda" data-acao="n">${nao || t('geral.cancelar')}</button><button class="btn principal" style="font-size:18px" data-acao="s">${sim}</button></div>`,
        { s: () => { fecharModal(); resolve(true); }, n: () => { fecharModal(); resolve(false); } });
    });
  }

  // ------------------------------------------------------------ pedaços comuns
  const moedasHTML = () => `<span class="moedas" data-acao="loja" data-aba="extras">${V.moedaHTML}<span data-saldo>${V.numFmt(D.moedas.saldo())}</span></span>`;
  document.addEventListener('dez-moedas', () => document.querySelectorAll('[data-saldo]').forEach((el) => { el.textContent = V.numFmt(D.moedas.saldo()); }));
  // títulos longos ("Champions League") encolhem com a largura da tela em vez de cortar
  const topo = (titulo, extra = '', semVoltar) => `<header class="topo">${semVoltar ? '' : `<button class="voltar" data-acao="voltar" aria-label="${t('geral.voltar')}">${V.icone('voltar')}</button>`}<h1${String(titulo).replace(/<[^>]*>/g, '').length > 14 ? ' class="longo"' : ''}>${titulo}</h1>${extra}</header>`;
  const posBadge = (pos) => `<span class="pos ${V.linhaPos(pos)}">${V.posTxt(pos)}</span>`;
  const nota = (n) => `<span class="nota ${V.classeNota(n)}">${Math.round(n)}</span>`;
  const nomeModo = (m) => t('modo.' + m);
  function acoesComuns() {
    acoes.voltar = () => voltar();
    acoes.loja = (d) => ir('loja', { aba: d.aba || 'estadios' });
  }

  // ------------------------------------------------------------ estado salvo
  const DRAFT_KEY = 'dez.draft', CAMP_KEY = 'dez.campanha', REC_KEY = 'dez.recordes', DIA_KEY = 'dez.diario';
  // save de outra versão (ids de times/jogadores de antes dos dados reais): descarta
  const lerSalvo = (key) => {
    const x = D.guarda.json(key, null);
    if (x && x.modo && x.v === C.VERSAO_SAVE) return x;
    if (x) D.guarda.apagar(key);
    return null;
  };
  const draftSalvo = () => lerSalvo(DRAFT_KEY);
  const campSalva = () => lerSalvo(CAMP_KEY);
  const salvarDraft = (d) => (d ? D.guarda.salvar(DRAFT_KEY, d) : D.guarda.apagar(DRAFT_KEY));
  const salvarCamp = (c) => (c ? D.guarda.salvar(CAMP_KEY, c) : D.guarda.apagar(CAMP_KEY));
  const recordes = () => Object.assign({ modos: {}, campanhas: 0, titulos: 0, perfeitos: 0, partidas: 0, vitorias: 0, gols: 0 }, D.guarda.json(REC_KEY));
  const diario = () => D.guarda.json(DIA_KEY);
  const diaHoje = () => diario()[D.hoje()] || null;

  // ------------------------------------------------------------ INÍCIO
  // Abertura animada em camadas (tools/logo.py separou a arte): estádio desfocado com zoom lento,
  // holofotes varrendo, confetes e faíscas (canvas) e o título por cima, com brilho e a bola girando.
  let inicioJaAnimou = false;
  function heroHTML() {
    const L = window.DEZ_LOGO;
    const lang = window.DEZ_WEB ? 'pt' : L && L.idiomas[D.I18N.lang] ? D.I18N.lang : 'en';   // no site só vai a arte em português
    const m = L && L.idiomas[lang];
    if (!m) return `<div class="logo">${V.logoHTML()}<div class="nome">${t('app.nome')}</div><div class="slogan">${t('app.slogan')}</div></div>`;
    const src = `img/logo-${lang}.png`;
    const b = m.bola;
    // a bola: largura 2r (fração da largura do título); a altura em % da altura do título
    const bola = b ? `<img class="t-bola" src="img/logo-bola.png" alt="" style="left:${((b.x - b.r) * 100).toFixed(2)}%;top:${((b.y - b.r * m.w / m.h) * 100).toFixed(2)}%;width:${(b.r * 200).toFixed(2)}%">` : '';
    return `<div class="hero"><div class="hero-fundo"></div><div class="hero-luz l1"></div><div class="hero-luz l2"></div>
      <canvas class="hero-particulas"></canvas><div class="hero-veu"></div>
      <h1 class="titulo-logo" style="aspect-ratio:${m.w}/${m.h}"><img class="t-img" src="${src}" alt="${esc(t('app.nome_texto'))}. ${esc(t('app.slogan'))}">
        <span class="t-brilho" style="-webkit-mask-image:url(${src});mask-image:url(${src})"></span>${bola}</h1></div>`;
  }
  // confetes caindo e faíscas subindo; para quando a tela sai, pausa com o app em segundo plano
  function particulasHero(cv) {
    if (!cv || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return () => {};
    const ctx = cv.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0, H = 0, raf = 0, ultimo = performance.now();
    const ajusta = () => { W = cv.clientWidth; H = cv.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); };
    ajusta();
    const CORES = ['#D4F25C', '#E6C26E', '#EDEBE4', '#6FD6A0', '#D4F25C'];
    const novaParticula = (inicio) => {
      const faisca = Math.random() < 0.45;
      return faisca
        ? { faisca, x: Math.random() * W, y: inicio ? Math.random() * H : H + 10, vy: -(14 + Math.random() * 28), vx: (Math.random() - 0.5) * 8, r: 0.7 + Math.random() * 1.4, vida: 0, dura: 2.5 + Math.random() * 3, cor: Math.random() < 0.7 ? '#D4F25C' : '#E6C26E' }
        : { faisca, x: Math.random() * W, y: inicio ? Math.random() * H : -10, vy: 10 + Math.random() * 22, fase: Math.random() * 6.3, giro: (Math.random() - 0.5) * 6, ang: Math.random() * 6.3, w: 2.5 + Math.random() * 2.5, h: 5 + Math.random() * 4, cor: CORES[Math.floor(Math.random() * CORES.length)] };
    };
    const lista = Array.from({ length: 46 }, () => novaParticula(true));
    function quadro(agora) {
      raf = requestAnimationFrame(quadro);
      const dt = Math.min(0.05, (agora - ultimo) / 1000);
      ultimo = agora;
      if (document.hidden) return;
      if (cv.clientWidth !== W || cv.clientHeight !== H) ajusta();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      lista.forEach((p, i) => {
        if (p.faisca) {
          p.vida += dt; p.x += p.vx * dt; p.y += p.vy * dt;
          const a = Math.sin(Math.PI * Math.min(1, p.vida / p.dura));
          ctx.globalAlpha = a * 0.9;
          ctx.fillStyle = p.cor; ctx.shadowColor = p.cor; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
          if (p.vida > p.dura || p.y < -10) lista[i] = novaParticula(false);
        } else {
          p.fase += dt * 1.6; p.ang += p.giro * dt; p.y += p.vy * dt; p.x += Math.sin(p.fase) * 12 * dt;
          ctx.globalAlpha = 0.75; ctx.shadowBlur = 0;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.ang); ctx.scale(1, Math.abs(Math.cos(p.fase * 1.3)) * 0.8 + 0.2); // vira no ar
          ctx.fillStyle = p.cor; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
          if (p.y > H + 12) lista[i] = novaParticula(false);
        }
      });
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
    raf = requestAnimationFrame(quadro);
    return () => cancelAnimationFrame(raf);
  }
  const quadros =(jogos, pequeno) => `<span class="quadros${pequeno ? ' p' : ''}">${(jogos || []).map((j) => `<i class="${j.res}"></i>`).join('')}</span>`;
  TELAS.inicio = () => {
    const camp = campSalva(), draft = draftSalvo();
    const hoje = D.hoje(), modoDia = C.modoDoDia(hoje), dia = diaHoje();
    let continuar = '';
    if (camp && !camp.fim) {
      continuar = `<button class="cartao toque faixa" data-acao="continuar"><span class="ic-caixa">${V.icone('jogar')}</span>
        <span class="tx"><span class="t">${t('inicio.continuar')}</span><br><span class="sub">${nomeModo(camp.modo)} · ${t('camp.jogo_de', { n: camp.jogos.length + 1, total: C.totalJogos(camp) })}</span></span>${V.icone('voltar', 'seta gira')}</button>`;
    } else if (draft) {
      continuar = `<button class="cartao toque faixa" data-acao="continuarDraft"><span class="ic-caixa">${V.icone('sortear')}</span>
        <span class="tx"><span class="t">${t('inicio.continuar_draft')}</span><br><span class="sub">${nomeModo(draft.modo)} · ${draft.xi.filter(Boolean).length}/11</span></span>${V.icone('voltar', 'seta gira')}</button>`;
    }
    const diaFeito = dia && dia.fim;
    // a primeira vez que o início aparece nesta abertura do app, o título entra com impacto
    const entra = !inicioJaAnimou;
    inicioJaAnimou = true;
    tela.innerHTML = `<div class="inicio${entra ? ' entra' : ''}">
      ${heroHTML()}
      <header class="topo sobre"><span style="flex:1"></span>${moedasHTML()}<button class="voltar" data-acao="config" aria-label="${t('config.titulo')}">${V.icone('ajustes')}</button></header>
      <div class="rola">
        <button class="btn principal" data-acao="jogar">${t('inicio.jogar')}</button>
        ${continuar}
        <button class="cartao toque faixa" data-acao="desafio">
          <span class="ic-caixa">${V.icone('calendario')}</span>
          <span class="tx"><span class="t">${t('inicio.desafio')}</span><br>
          ${diaFeito ? quadros(dia.jogos, true) : `<span class="sub">${nomeModo(modoDia)} · ${t('inicio.desafio_sub')}</span>`}</span>
          ${diaFeito ? `<span class="selo feito">${t('inicio.feito')}</span>` : `<span class="selo">${t('inicio.novo')}</span>`}
        </button>
        <nav class="menu">
          <button data-acao="loja" data-aba="estadios">${V.icone('loja')}${t('menu.loja')}</button>
          <button data-acao="estadio">${V.icone('estadio')}${t('menu.estadio')}</button>
          <button data-acao="time">${V.icone('escudo')}${t('menu.time')}</button>
          <button data-acao="recordes">${V.icone('trofeu')}${t('menu.recordes')}</button>
        </nav>
        <button class="btn borda pequeno" style="margin-top:10px" data-acao="comoJogar">${V.icone('ajuda')}${t('menu.como')}</button>
      </div></div>`;
    const pararParticulas = particulasHero(tela.querySelector('.hero-particulas'));
    aoSair = pararParticulas;
    acoesComuns();
    acoes.jogar = () => { if (temAndamento()) return perguntarAbandono(() => ir('modos')); ir('modos'); };
    acoes.continuar = () => ir('campanha');
    acoes.continuarDraft = () => ir('draft');
    acoes.config = () => ir('config');
    acoes.estadio = () => ir('estadio');
    acoes.time = () => ir('time');
    acoes.recordes = () => ir('recordes');
    acoes.comoJogar = () => comoJogar();
    acoes.desafio = () => {
      const d = diaHoje();
      if (d && d.fim) return mostrarDiaFeito(d);
      if (d && !d.fim) {
        const c = campSalva(), dr = draftSalvo();
        if ((c && c.diario === hoje) || (dr && dr.diario === hoje)) return ir(c && c.diario === hoje ? 'campanha' : 'draft');
        return toast(t('desafio.ja_tentou'));
      }
      const iniciar = () => ir('formacao', { modo: modoDia, diario: hoje });
      if (temAndamento()) return perguntarAbandono(iniciar);
      iniciar();
    };
    if (!D.guarda.num('dez.viuComo', 0)) { D.guarda.salvarNum('dez.viuComo', 1); setTimeout(comoJogar, 400); }
  };
  const temAndamento = () => { const c = campSalva(); return (c && !c.fim) || !!draftSalvo(); };
  function perguntarAbandono(depois) {
    confirmar(t('abandonar.titulo'), t('abandonar.texto'), t('abandonar.sim')).then((ok) => {
      if (!ok) return;
      const c = campSalva(), d = draftSalvo();
      if (c && !c.fim) { D.analytics.event('campaign_abandon', { mode: c.modo, played: c.jogos.length }); if (c.diario) fecharDia(c); }
      if (d && d.diario) marcarDia(d.diario, { fim: true, abandonou: true, jogos: [] });
      salvarCamp(null); salvarDraft(null);
      depois();
    });
  }
  function comoJogar() {
    abrirModal(`<h2>${t('como.titulo')}</h2>
      <div class="passos">${[1, 2, 3, 4, 5].map((i) => `<div class="passo"><span class="n">${i}</span><span class="tx">${t('como.p' + i)}</span></div>`).join('')}</div>
      <button class="btn principal" data-acao="ok">${t('como.ok')}</button>`, { ok: fecharModal });
  }

  // ------------------------------------------------------------ MODOS
  const ORDEM_MODOS = ['copa', 'champions', 'brasileirao', 'premier', 'laliga', 'seriea', 'bundesliga', 'ligue1', 'mistura'];
  TELAS.modos = () => {
    const rec = recordes().modos;
    const cartao = (m, largo) => {
      const r = rec[m];
      const selo = r && r.titulos ? `<span class="rec">${V.icone('trofeu')}${r.titulos}</span>` : '';
      return `<button class="cartao toque modo${largo ? ' largo' : ''}" data-acao="modo" data-m="${m}">${selo}${V.emblemaModo(m)}<span><span class="n">${nomeModo(m)}</span><span class="f" style="display:block">${t('modo.' + m + '.f')}</span></span></button>`;
    };
    tela.innerHTML = topo(t('modos.titulo'), moedasHTML()) + `<div class="rola">
      <p class="sub" style="margin:0 2px 14px">${t('modos.sub')}</p>
      <div class="grade-modos">${cartao('copa', true)}${cartao('champions', true)}${ORDEM_MODOS.slice(2, 8).map((m) => cartao(m)).join('')}${cartao('mistura', true)}</div></div>`;
    acoesComuns();
    acoes.modo = (d) => ir('formacao', { modo: d.m });
  };

  // ------------------------------------------------------------ FORMAÇÃO
  const miniCampo = (f) => `<div class="mini-campo">${C.FORMACOES[f].map((s) => `<i class="p" style="left:${s.x * 100}%;top:${92 - (s.y - 0.03) / 0.73 * 80}%"></i>`).join('')}</div>`;
  const DIFICIL_KEY = 'dez.dificil';
  TELAS.formacao = (p) => {
    let sel = D.guarda.json('dez.ultimaFormacao', { f: '4-3-3' }).f;
    if (!C.FORMACOES[sel]) sel = '4-3-3';
    let dificil = !!D.guarda.num(DIFICIL_KEY, 0);
    const desenha = () => {
      tela.innerHTML = topo(p.diario ? t('inicio.desafio') : nomeModo(p.modo)) + `<div class="rola">
        <p class="sub" style="margin:0 2px 14px">${t('formacao.sub')}</p>
        <div class="grade-form">${Object.keys(C.FORMACOES).map((f) => `<button class="cartao toque form${f === sel ? ' sel' : ''}" data-acao="f" data-f="${f}"><span class="n${f.length > 5 ? ' longa' : ''}">${f}</span>${miniCampo(f)}</button>`).join('')}</div>
        <button class="cartao toque opcao-dificil" data-acao="dificil">${V.icone(dificil ? 'oculto' : 'olho')}<span class="tx"><b>${t('formacao.dificil')}</b><span class="sub">${t('formacao.dificil_x', { n: Math.round((C.PREMIO.dificil - 1) * 100) })}</span></span><span class="chave${dificil ? ' on' : ''}"></span></button>
        ${p.diario ? `<p class="sub centro" style="margin-top:14px">${t('desafio.regras')}</p>` : ''}
        <button class="btn principal" style="margin-top:16px" data-acao="ok">${t('formacao.ok')}</button></div>`;
    };
    desenha();
    acoesComuns();
    acoes.f = (d) => { sel = d.f; desenha(); };
    acoes.dificil = () => { dificil = !dificil; D.guarda.salvarNum(DIFICIL_KEY, dificil ? 1 : 0); desenha(); };
    acoes.ok = () => {
      D.guarda.salvar('dez.ultimaFormacao', { f: sel });
      const seed = p.diario ? 'dia:' + p.diario : 'c' + Math.floor(Math.random() * 1e9).toString(36);
      const d = C.novoDraft(p.modo, sel, seed, { rerolls: p.diario ? 0 : 1 });
      d.diario = p.diario || null;
      d.dificil = dificil;
      d.extras = 0;
      if (p.diario) marcarDia(p.diario, { fim: false });
      salvarDraft(d);
      D.analytics.event('draft_start', { mode: p.modo, formation: sel, daily: !!p.diario, hard: dificil });
      ir('draft', null, { substituir: true });
    };
  };

  // ------------------------------------------------------------ DRAFT
  function confirmarSairDraft() {
    confirmar(t('draft.sair_t'), t('draft.sair_x'), t('draft.sair_s'), t('draft.sair_n')).then((ok) => { if (ok) ir('inicio', null, { substituir: true, limpar: true }); });
  }
  TELAS.draft = () => {
    const d = draftSalvo();
    if (!d) return ir('inicio', null, { substituir: true, limpar: true });
    if (!C.FORMACOES[d.formacao]) d.formacao = '4-3-3';
    let escolhido = null; // jogador tocado esperando a vaga
    let girando = false;
    const oculto = !!d.dificil; // modo difícil: nenhuma nota aparece até o time fechar
    const slots = () => C.FORMACOES[d.formacao];
    const forca = () => C.forcaXI(d.xi, d.formacao);
    const vagaTop = (y) => 88 - (y - 0.03) / 0.73 * 76;

    function desenha() {
      // a lista do elenco não volta ao topo quando a tela é redesenhada
      const rolagem = tela.querySelector('.lista-jog');
      const rolagemTop = rolagem && d.sorteio ? rolagem.scrollTop : 0;
      desenhaTudo();
      const nova = tela.querySelector('.lista-jog');
      if (nova) nova.scrollTop = rolagemTop;
    }
    function desenhaTudo() {
      const f = forca(), n = d.xi.filter(Boolean).length;
      // durante o draft, a média é só de quem já foi escolhido
      const parcial = n ? d.xi.reduce((s, j, i) => s + (j ? C.efetiva(j, slots()[i].pos) : 0), 0) / n + f.ent : 0;
      const jog = escolhido ? C.jogadoresSorteio(d).find((j) => j.id === escolhido) : null;
      const alvos = jog ? C.vagasPara(d, jog) : [];
      const vagas = slots().map((s, i) => {
        const j = d.xi[i];
        const alvo = alvos.find((a) => a.vaga === i);
        const pos = `left:${s.x * 100}%;top:${vagaTop(s.y)}%`;
        if (j) {
          const ef = C.efetiva(j, s.pos);
          return `<div class="vaga cheia${!oculto && ef >= 90 ? ' top' : ''}" style="${pos}"><span class="bola">${oculto ? V.posTxt(s.pos) : ef}</span><span class="nm">${esc(j.curto)}</span></div>`;
        }
        const marca = alvo ? (alvo.pen ? '−' + alvo.pen : '✓') : '';
        return `<button class="vaga${alvo ? ' alvo' : ''}" data-acao="vaga" data-i="${i}" style="${pos}"><span class="bola">${alvo && !oculto ? alvo.forca : V.posTxt(s.pos)}</span>${alvo ? `<span class="fz">${marca}</span>` : ''}</button>`;
      }).join('');
      let painel;
      if (C.draftCompleto(d)) {
        painel = `<div class="sortear-box"><button class="btn principal" data-acao="fim">${t('draft.pronto')}</button></div>`;
      } else if (!d.sorteio) {
        painel = `<div class="sortear-box">${V.icone('dado', 'grande')}<p class="sub centro" style="margin:0">${t('draft.sortear_sub', { n: 11 - n })}</p><button class="btn principal" data-acao="sortear" style="max-width:320px">${t('draft.sortear')}</button></div>`;
      } else {
        const s = d.sorteio, tm = C.time(s.time);
        let elenco = C.jogadoresSorteio(d);
        // no modo difícil a ordem não pode entregar quem é melhor: por posição e número da camisa
        if (oculto) elenco = elenco.slice().sort((a, b) => C.POS.indexOf(a.pos) - C.POS.indexOf(b.pos) || a.num - b.num);
        const lista = elenco.map((j) => {
          const vs = C.vagasPara(d, j);
          const como = vs.length && vs[0].pen ? ' · ' + (oculto ? t('draft.joga_como_oc', { pos: V.posTxt(slots()[vs[0].vaga].pos), n: vs[0].pen }) : t('draft.joga_como', { pos: V.posTxt(slots()[vs[0].vaga].pos), n: vs[0].forca })) : '';
          return `<button class="jog${vs.length ? '' : ' off'}${escolhido === j.id ? ' sel' : ''}" data-acao="jog" data-id="${j.id}">${posBadge(j.pos)}<span class="nm${j.nome.length > 21 ? ' longo' : ''}">${esc(j.nome)}<br><span class="id">${t('draft.idade', { n: j.idade })}${como}</span></span>${oculto ? '<span class="nota oculta">–</span>' : nota(j.forca)}</button>`;
        }).join('');
        const podeAd = !d.diario && d.rerolls === 0 && (d.extras || 0) < D.remote.num('ad_rerolls_max');
        const reroll = d.diario ? '' : `<button class="btn pequeno borda" style="width:auto;padding:0 12px" data-acao="reroll" ${d.rerolls > 0 || podeAd ? '' : 'disabled'}>${V.icone('resortear')}${d.rerolls > 0 ? d.rerolls : podeAd ? '<span class="tag-ad">AD</span>' : '0'}</button>`;
        painel = `<div class="cab">${V.escudo(s.time, 'm')}<div style="flex:1;min-width:0"><div class="n">${esc(V.nomeTime(s.time))}</div><div class="sub">${V.rotulo(s.time, s.ano)} · ${t('draft.escolha')}</div></div>${reroll}</div>
          <div class="lista-jog">${lista}</div>`;
      }
      const chipGeral = oculto ? `<span class="chip acento">${V.icone('oculto')}${t('draft.oculto')}</span>` : `<span class="chip acento">${t('draft.geral')} <b>${n ? parcial.toFixed(1) : '–'}</b></span>`;
      tela.innerHTML = topo(d.diario ? t('inicio.desafio') : nomeModo(d.modo), `<button class="chip" data-acao="formacao"><b>${d.formacao}</b>${V.icone('baixo')}</button>`) + `
        <div class="draft-topo">${chipGeral}<span class="chip">${t('draft.ent_chip')} <b>+${f.ent}</b></span><span class="chip"><b>${n}</b>/11</span></div>
        <div class="campo-draft"><div class="linha-meio"></div><div class="circ"></div><div class="area c"></div><div class="area b"></div>${vagas}</div>
        <div class="painel">${painel}</div>`;
    }
    function colocar(jid, vaga) {
      if (!C.escolher(d, jid, vaga)) return;
      escolhido = null;
      toastEl.hidden = true;
      D.vibrar(15);
      salvarDraft(d);
      desenha();
      if (C.draftCompleto(d)) setTimeout(resumoDraft, 250);
    }
    desenha();
    acoesComuns();
    acoes.voltar = () => confirmarSairDraft();
    acoes.sortear = () => {
      if (girando) return;
      girando = true;
      // "roleta" de nomes antes de revelar o time sorteado
      const pool = C.poolDraft(d.modo);
      const box = tela.querySelector('.sortear-box');
      let k = 0;
      const tic = setInterval(() => {
        const tm = pool[Math.floor(Math.random() * pool.length)];
        box.innerHTML = `${V.escudo(tm.id, '')}<div class="roleta">${esc(V.nomeTime(tm.id))}</div>`;
        D.som.toque();
        if (++k >= 9) {
          clearInterval(tic);
          C.sortear(d);
          girando = false;
          salvarDraft(d);
          desenha();
        }
      }, 85);
      aoSair = () => clearInterval(tic);
    };
    acoes.reroll = () => {
      const refaz = () => { d.sorteio = null; salvarDraft(d); desenha(); acoes.sortear(); };
      if (d.rerolls > 0) { d.rerolls--; return refaz(); }
      D.ads.showRewarded('draft_reroll').then((ok) => { if (ok) { d.extras = (d.extras || 0) + 1; refaz(); } });
    };
    acoes.jog = (ds) => {
      const j = C.jogadoresSorteio(d).find((x) => x.id === ds.id);
      const vs = C.vagasPara(d, j);
      if (!vs.length) return toast(t('draft.sem_vaga'));
      if (vs.length === 1) return colocar(j.id, vs[0].vaga);
      escolhido = escolhido === j.id ? null : j.id;
      desenha();
      if (escolhido) toast(t('draft.escolha_vaga'));
    };
    acoes.vaga = (ds) => { if (escolhido) colocar(escolhido, +ds.i); else if (!d.sorteio) acoes.sortear(); };
    acoes.formacao = () => {
      abrirModal(`<h2>${t('draft.trocar_form')}</h2><div class="grade-form">${Object.keys(C.FORMACOES).map((f) => `<button class="cartao toque form${f === d.formacao ? ' sel' : ''}" data-acao="f" data-f="${f}"><span class="n${f.length > 5 ? ' longa' : ''}">${f}</span>${miniCampo(f)}</button>`).join('')}</div>`, {
        f: (ds) => {
          if (ds.f === d.formacao) return fecharModal();
          if (!C.trocarFormacao(d, ds.f)) return toast(t('draft.form_nao'));
          escolhido = null; fecharModal(); salvarDraft(d); desenha();
        },
      });
    };
    acoes.fim = () => resumoDraft();
    function resumoDraft() {
      const f = forca();
      const barra = (rot, v) => `<span>${rot}</span><span class="barra"><i style="width:${Math.max(4, Math.min(100, (v - 60) / 35 * 100))}%"></i></span><b>${v.toFixed(0)}</b>`;
      // no modo difícil é aqui que as notas aparecem pela primeira vez
      const revelados = oculto ? `<div class="titulo-secao">${t('draft.revelado')}</div><div class="lista-jog" style="padding:0">${d.xi.map((j, i) => `<div class="jog">${posBadge(slots()[i].pos)}<span class="nm">${esc(j.nome)}</span>${nota(C.efetiva(j, slots()[i].pos))}</div>`).join('')}</div>` : '';
      abrirModal(`<h2>${t('draft.time_pronto')}</h2>
        <div style="display:flex;align-items:center;gap:16px;margin:8px 0 18px">${V.escudo('eu', '')}<div><div class="sub">${esc(V.meuTime().nome)} · ${d.formacao}</div><div class="geral-grande">${f.geral.toFixed(1)}</div></div></div>
        <div class="barras">${barra(t('linha.ata'), f.ata)}${barra(t('linha.mei'), f.mei)}${barra(t('linha.def'), f.def)}${barra(t('linha.gol'), f.gol)}</div>
        <p class="sub" style="margin:14px 0">${t('draft.entrosamento', { n: f.ent })}</p>
        ${revelados}
        <button class="btn principal" style="margin-top:14px" data-acao="ok">${t('draft.comecar')}</button>`, {
        ok: () => {
          fecharModal();
          const camp = C.novaCampanha({ modo: d.modo, seed: d.seed, formacao: d.formacao, xi: d.xi, meuTime: { nome: V.meuTime().nome } });
          camp.diario = d.diario || null;
          camp.dificil = !!d.dificil;
          salvarCamp(camp);
          salvarDraft(null);
          D.analytics.event('campaign_start', { mode: d.modo, overall: f.geral, daily: !!d.diario, hard: !!d.dificil });
          ir('campanha', null, { substituir: true, limpar: true });
        },
      });
    }
  };

  window.DezTelas = { ir, voltar, toast, abrirModal, fecharModal, confirmar, TELAS, campSalva, salvarCamp, recordes, diario, emojis: null, acoes: () => acoes, get atual() { return atual; } };

  // ------------------------------------------------------------ utilidades da campanha
  function emojis(jogos) { return (jogos || []).map((j) => (j.res === 'V' ? '🟩' : j.res === 'E' ? '🟨' : '🟥')).join(''); }
  window.DezTelas.emojis = emojis;
  window.DezTelas.quadros = quadros;
  function marcarDia(data, dados) {
    const tudo = diario();
    tudo[data] = Object.assign(tudo[data] || {}, dados);
    // guarda só os últimos 60 dias
    const chaves = Object.keys(tudo).sort();
    while (chaves.length > 60) delete tudo[chaves.shift()];
    D.guarda.salvar(DIA_KEY, tudo);
  }
  function fecharDia(c) {
    const s = C.resumo(c);
    marcarDia(c.diario, { fim: true, jogos: c.jogos.map((j) => ({ res: j.res })), v: s.v, e: s.e, d: s.d, campeao: s.campeao, perfeito: s.perfeito, modo: c.modo, texto: textoResultado(c) });
  }
  function mostrarDiaFeito(d) {
    abrirModal(`<h2>${t('inicio.desafio')}</h2><p class="sub">${nomeModo(d.modo || C.modoDoDia(D.hoje()))} · ${D.hoje().split('-').reverse().join('/')}</p>
      <div style="margin:18px 0 10px">${quadros(d.jogos)}</div><p class="centro display" style="font-size:34px;color:var(--acento);margin:4px 0 14px">${d.abandonou ? t('desafio.abandonou') : esc(d.texto || '')}</p>
      <p class="sub centro">${t('desafio.volte')}</p>
      ${d.abandonou ? '' : `<button class="btn principal" data-acao="share">${V.icone('compartilhar')}${t('final.compartilhar')}</button>`}
      <button class="btn borda" data-acao="ok">${t('geral.ok')}</button>`, {
      ok: fecharModal,
      share: () => compartilharTexto(textoCompartilharDia(d)),
    });
  }
  // "Campeão!", "3º lugar", "Eliminado nas quartas"...
  function textoResultado(c) {
    const s = C.resumo(c);
    if (s.perfeito) return t('final.perfeito');
    if (s.campeao) return t('final.campeao');
    if (c.formato === 'liga') return t('final.posicao', { n: c.posicao });
    if (c.eliminadoEm) return t('final.elim.' + c.eliminadoEm);
    return t('camp.jogo_n', { n: c.jogos.length + 1 });
  }
  window.DezTelas.textoResultado = textoResultado;
  window.DezTelas.comoJogar = comoJogar;
  window.DezTelas.marcarDia = marcarDia;
  window.DezTelas.fecharDia = fecharDia;
  window.DezTelas.nomeModo = nomeModo;
  window.DezTelas.posBadge = posBadge;
  window.DezTelas.nota = nota;
  window.DezTelas.topo = topo;
  window.DezTelas.moedasHTML = moedasHTML;
  window.DezTelas.acoesComuns = acoesComuns;
  window.DezTelas.setAcoes = (o) => Object.assign(acoes, o);
  window.DezTelas.setAoSair = (f) => { aoSair = f; };
  window.DezTelas.salvarRecordes = (r) => D.guarda.salvar(REC_KEY, r);
  window.DezTelas.compartilharTexto = compartilharTexto;
  window.DezTelas.textoCompartilharDia = textoCompartilharDia;
  function textoCompartilharDia(d) {
    return t('compartilhar.dia', { app: t('app.nome_texto'), data: D.hoje().split('-').reverse().slice(0, 2).join('/'), modo: nomeModo(d.modo), grade: emojis(d.jogos), resultado: d.texto || '', v: d.v || 0, e: d.e || 0, d: d.d || 0, link: D.LINK_LOJA });
  }
  async function compartilharTexto(texto) {
    const share = D.nativePlugin('Share');
    try {
      if (share) await share.share({ text: texto });
      else if (navigator.share) await navigator.share({ text: texto });
      else { await navigator.clipboard.writeText(texto); toast(t('compartilhar.copiado')); }
    } catch (e) { /* cancelou */ }
  }
})();

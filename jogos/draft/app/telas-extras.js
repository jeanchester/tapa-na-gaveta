// Dez a Zero: loja, personalização do estádio, meu time, recordes e configurações.
(function () {
  'use strict';
  const C = window.DezCore, D = window.Dez, V = window.DezVisual, CP = window.DezCampinho, T = window.DezTelas;
  const t = D.t, esc = V.esc;
  const tela = document.getElementById('tela');
  const { ir, toast, abrirModal, fecharModal, TELAS } = T;
  const ICONE_PRODUTO = { draft_king: 'trofeu', all_stadiums: 'estadio', all_balls: 'bola', remove_ads: 'anuncio' };

  // ------------------------------------------------------------ LOJA
  const LIGAS_EST = ['todos', 'meus', 'brasil', 'inglaterra', 'espanha', 'italia', 'alemanha', 'franca', 'copa'];
  TELAS.loja = (p) => {
    let aba = p.aba || 'estadios', filtro = p.filtro || 'todos';
    const desenha = () => {
      const abas = ['estadios', 'bolas', 'extras'].map((a) => `<button class="${a === aba ? 'on' : ''}" data-acao="aba" data-a="${a}">${t('loja.aba.' + a)}</button>`).join('');
      let corpo = '';
      const cfg = V.estCfg();
      if (aba === 'estadios') {
        const lista = V.ESTADIOS.filter((e) => filtro === 'todos' || (filtro === 'meus' ? V.temEstadio(e.id) : e.liga === filtro));
        corpo = `<div class="filtros-caixa"><div class="filtros">${LIGAS_EST.map((f) => `<button class="${f === filtro ? 'on' : ''}" data-acao="filtro" data-f="${f}">${t('loja.f.' + f)}</button>`).join('')}</div>
          <button class="filtros-mais" data-acao="filtrosMais" aria-label="${t('loja.mais_filtros')}">${V.icone('voltar', 'gira')}</button></div>
          <div class="grade-est">${lista.map((e) => {
            const tem = V.temEstadio(e.id), sel = cfg.sel === e.id;
            const estado = tem ? `<span class="estado">${sel ? t('loja.em_uso') : t('loja.seu')}</span>` : `<span class="preco">${V.moedaHTML}${V.numFmt(e.preco)}</span>`;
            return `<button class="est toque${sel ? ' sel' : ''}" data-acao="est" data-id="${e.id}"><img loading="lazy" src="../shared/estadios/mini/${e.id}.webp" alt=""><span class="rot">${esc(e.nome)}${estado}</span></button>`;
          }).join('')}</div>`;
      } else if (aba === 'bolas') {
        corpo = `<div class="grade-bolas">${V.BOLAS.map((b) => {
          const tem = V.temBola(b.id), sel = cfg.bola === b.id;
          const info = tem ? `<span class="info ok">${sel ? t('loja.em_uso') : t('loja.seu')}</span>` : `<span class="info" style="color:var(--ouro)">${V.moedaHTML}${V.numFmt(b.preco)}</span>`;
          return `<button class="cartao toque bola-item${sel ? ' sel' : ''}" data-acao="bola" data-id="${b.id}"><canvas width="120" height="120" data-bola="${b.id}"></canvas>${t('bola.' + b.id)}${info}</button>`;
        }).join('')}</div>`;
      } else {
        const restam = D.ads.moedasRestantes();
        const prod = (id, txt) => {
          const tem = D.store.owns(id);
          return `<div class="cartao produto${id === 'draft_king' ? ' destaque' : ''}"><span class="ic-caixa">${V.icone(ICONE_PRODUTO[id])}</span><span class="tx"><b>${t('loja.' + id)}</b><span class="sub">${txt}</span></span><button class="btn ${tem ? 'borda' : 'verde'} pequeno" data-acao="iap" data-id="${id}" ${tem || !D.store.disponivel() ? 'disabled' : ''}>${tem ? V.icone('check') : esc(D.store.price(id))}</button></div>`;
        };
        corpo = `<div class="cartao produto"><span class="ic-caixa">${V.icone('anuncio')}</span><span class="tx"><b>${t('loja.ad_moedas', { n: D.remote.num('ad_coins_reward') })}</b><span class="sub">${t('loja.ad_restam', { n: restam })}</span></span><button class="btn verde pequeno" data-acao="adMoedas" ${restam ? '' : 'disabled'}>+${D.remote.num('ad_coins_reward')} <span class="tag-ad">AD</span></button></div>
          <div class="titulo-secao">${t('loja.compras')}</div>
          ${prod('draft_king', t('loja.draft_king_x', { e: V.ESTADIOS.length, b: V.BOLAS.length }))}
          ${prod('all_stadiums', t('loja.all_stadiums_x', { n: V.ESTADIOS.length }))}
          ${prod('all_balls', t('loja.all_balls_x', { n: V.BOLAS.length }))}
          ${prod('remove_ads', t('loja.remove_ads_x'))}
          ${D.store.disponivel() ? '' : `<p class="sub">${t('loja.indisponivel')}</p>`}
          <button class="btn borda pequeno" style="margin-top:14px" data-acao="restaurar">${t('loja.restaurar')}</button>
          <div class="titulo-secao">${t('loja.como_ganhar')}</div>
          <div class="cartao sub">${t('loja.ganhar_x', { v: C.PREMIO.vitoria, e: C.PREMIO.empate, g: C.PREMIO.gol, t: C.PREMIO.titulo, t2: Math.max(...Object.values(C.PREMIO.tituloModo)), p: C.PREMIO.perfeito, h: Math.round((C.PREMIO.dificil - 1) * 100) })}</div>`;
      }
      tela.innerHTML = T.topo(t('menu.loja'), T.moedasHTML()) + `<div class="abas">${abas}</div><div class="rola">${corpo}</div>`;
      tela.querySelectorAll('canvas[data-bola]').forEach((cv) => { const g = cv.getContext('2d'); V.desenhaBola(g, 60, 60, 48, cv.dataset.bola); });
      ligarFiltros();
    };
    // faixa de filtros: a seta à direita mostra que há mais opções e some quando chega ao fim;
    // a rolagem é mantida quando a tela é redesenhada (ao escolher um filtro)
    let rolagemFiltros = 0;
    const ligarFiltros = () => {
      const caixa = tela.querySelector('.filtros-caixa');
      if (!caixa) return;
      const faixa = caixa.querySelector('.filtros');
      const atualiza = () => {
        rolagemFiltros = faixa.scrollLeft;
        caixa.classList.toggle('fim', faixa.scrollLeft + faixa.clientWidth >= faixa.scrollWidth - 4);
      };
      faixa.scrollLeft = rolagemFiltros;
      faixa.addEventListener('scroll', atualiza, { passive: true });
      // no computador, a rodinha do mouse também rola a faixa para o lado
      faixa.addEventListener('wheel', (ev) => { if (Math.abs(ev.deltaY) > Math.abs(ev.deltaX)) { faixa.scrollLeft += ev.deltaY; ev.preventDefault(); } }, { passive: false });
      atualiza();
    };
    desenha();
    D.billing.carregar();
    T.acoesComuns();
    const atualizar = () => { if (T.atual && T.atual.nome === 'loja') desenha(); };
    document.addEventListener('dez-loja', atualizar);
    T.setAoSair(() => document.removeEventListener('dez-loja', atualizar));
    T.setAcoes({
      aba: (ds) => { aba = ds.a; T.atual.params.aba = aba; desenha(); },
      filtro: (ds) => { filtro = ds.f; T.atual.params.filtro = filtro; desenha(); },
      filtrosMais: () => { const f = tela.querySelector('.filtros'); if (f) f.scrollBy({ left: f.clientWidth * 0.7, behavior: 'smooth' }); },
      est: (ds) => detalheEstadio(ds.id, desenha),
      bola: (ds) => detalheBola(ds.id, desenha),
      adMoedas: () => D.ads.showRewarded('shop_coins').then((ok) => {
        if (!ok) return;
        D.ads.contarMoedas();
        D.moedas.somar(D.remote.num('ad_coins_reward'), 'rewarded_ad');
        toast('+' + D.remote.num('ad_coins_reward'));
        desenha();
      }),
      iap: (ds) => D.store.buy(ds.id, 'shop').then((ok) => { if (ok) { toast(t('loja.comprado')); desenha(); } }),
      restaurar: () => D.store.restore().then((n) => { if (n === null) return; toast(t('loja.restaurado', { n })); desenha(); }),
    });
  };
  function semMoedas(preco) {
    abrirModal(`<div class="ic-topo">${V.icone('moedas')}</div><h2 class="centro">${t('loja.faltam_t')}</h2><p class="sub centro">${t('loja.faltam_x', { n: V.numFmt(preco - D.moedas.saldo()) })}</p>
      <button class="btn principal" style="margin-top:12px" data-acao="extras">${t('loja.ver_extras')}</button><button class="btn borda" data-acao="ok">${t('geral.ok')}</button>`,
    { ok: fecharModal, extras: () => { fecharModal(); ir('loja', { aba: 'extras' }); } });
  }
  function detalheBola(id, depois) {
    const b = V.BOLAS.find((k) => k.id === id), tem = V.temBola(id), cfg = V.estCfg();
    abrirModal(`<div style="display:grid;place-items:center;margin:6px 0 12px"><canvas width="240" height="240" style="width:120px;height:120px" data-grande></canvas></div>
      <h2 class="centro">${t('bola.' + id)}</h2>${b.inspirada ? `<p class="sub centro">${t('bola.' + id + '.x')}</p>` : ''}
      ${tem ? (cfg.bola === id ? `<button class="btn borda" style="margin-top:14px" disabled>${V.icone('check')}${t('loja.em_uso')}</button>` : `<button class="btn principal" style="margin-top:14px" data-acao="usar">${t('loja.usar_bola')}</button>`)
        : `<button class="btn principal" style="margin-top:14px" data-acao="comprar">${t('loja.comprar')} · ${V.numFmt(b.preco)}</button>`}
      <button class="btn borda" data-acao="ok">${t('geral.fechar')}</button>`, {
      ok: fecharModal,
      usar: () => { const c = V.estCfg(); c.bola = id; V.salvarEstCfg(c); fecharModal(); toast(t('loja.bola_ok')); depois && depois(); },
      comprar: () => {
        if (!V.comprarBola(id)) { fecharModal(); return semMoedas(b.preco); }
        const c = V.estCfg(); c.bola = id; V.salvarEstCfg(c);
        D.som.vitoria(); D.analytics.event('ball_buy', { ball: id, price: b.preco });
        fecharModal(); toast(t('loja.comprado')); depois && depois();
      },
    });
    const cv = document.querySelector('#modal canvas[data-grande]');
    if (cv) V.desenhaBola(cv.getContext('2d'), 120, 120, 100, id);
  }
  function detalheEstadio(id, depois) {
    const e = V.estadio(id), tem = V.temEstadio(id), cfg = V.estCfg();
    abrirModal(`<h2>${esc(e.nome)}</h2>
      <div style="border-radius:16px;overflow:hidden;margin:10px auto 14px;max-width:250px;border:1px solid var(--linha)"><img src="../shared/estadios/${e.id}.webp" style="width:100%;display:block" alt=""></div>
      ${tem ? (cfg.sel === id ? `<button class="btn principal" data-acao="pers">${V.icone('pincel')}${t('loja.personalizar')}</button>` : `<button class="btn principal" data-acao="usar">${t('loja.usar')}</button>`)
        : `<button class="btn principal" data-acao="comprar">${t('loja.comprar')} · ${V.numFmt(e.preco)}</button>`}
      <button class="btn borda" data-acao="ok">${t('geral.fechar')}</button>`, {
      ok: fecharModal,
      usar: () => { const c = V.estCfg(); c.sel = id; V.salvarEstCfg(c); fecharModal(); toast(t('loja.est_ok')); depois && depois(); },
      pers: () => { fecharModal(); ir('estadio'); },
      comprar: () => {
        if (!V.comprarEstadio(id)) { fecharModal(); return semMoedas(e.preco); }
        const c = V.estCfg(); c.sel = id; V.salvarEstCfg(c);
        D.som.vitoria(); D.analytics.event('stadium_buy', { stadium: id, price: e.preco });
        fecharModal(); toast(t('loja.comprado')); depois && depois();
      },
    });
  }

  // ------------------------------------------------------------ ESTÁDIO (personalizar)
  TELAS.estadio = () => {
    const cfg = V.estCfg();
    if (!V.temEstadio(cfg.sel)) cfg.sel = 'brinco';
    const desenha = () => {
      const est = V.estadio(cfg.sel);
      const op = (grupo, lista, atual) => `<div class="opcoes">${lista.map((v) => `<button class="${v === atual ? 'on' : ''}" data-acao="op" data-g="${grupo}" data-v="${v}">${t(grupo + '.' + v)}</button>`).join('')}</div>`;
      const bolas = V.BOLAS.filter((b) => V.temBola(b.id)).map((b) => b.id);
      tela.innerHTML = T.topo(t('menu.estadio'), T.moedasHTML()) + `<div class="rola">
        <div class="previa-estadio"><canvas></canvas></div>
        <button class="btn borda pequeno" style="margin-top:12px" data-acao="trocar">${V.icone('estadio')}${esc(est.nome)} · ${t('estadio.trocar')}</button>
        <div class="titulo-secao">${t('estadio.nome')}</div>
        <input class="campo-texto" data-nome maxlength="26" placeholder="${esc(est.nome)}" value="${esc(cfg.nome)}">
        <div class="titulo-secao">${t('estadio.gramado')}</div>${op('gramado', V.GRAMADOS, cfg.gramado)}
        <div class="titulo-secao">${t('estadio.luz')}</div>${op('luz', V.LUZES, cfg.luz)}
        <div class="titulo-secao">${t('estadio.placas')}</div>${op('placas', ['sim', 'nao'], cfg.placas ? 'sim' : 'nao')}
        <div class="titulo-secao">${t('estadio.bola')}</div>${op('bola', bolas, cfg.bola)}
        <button class="btn borda pequeno" style="margin-top:12px" data-acao="loja" data-aba="bolas">${V.icone('loja')}${t('estadio.mais_bolas')}</button>
      </div>`;
      const cv = tela.querySelector('.previa-estadio canvas');
      CP.previa(cv, { estadio: est.id, gramado: cfg.gramado, luz: cfg.luz, placas: cfg.placas, nome: cfg.nome || est.nome, bola: cfg.bola, kits: V.uniformes([V.meuTime().c1, V.meuTime().c2], ['#F1EFE7', '#121614']), margens: { topo: 0, baixo: 0, lado: 0 }, inteiro: true });
      const inp = tela.querySelector('[data-nome]');
      inp.addEventListener('change', () => { cfg.nome = inp.value.trim().slice(0, 26); V.salvarEstCfg(cfg); desenha(); });
    };
    desenha();
    T.acoesComuns();
    T.setAcoes({
      trocar: () => ir('loja', { aba: 'estadios', filtro: 'meus' }),
      op: (ds) => {
        if (ds.g === 'placas') cfg.placas = ds.v === 'sim';
        else cfg[ds.g] = ds.v;
        V.salvarEstCfg(cfg);
        D.analytics.event('stadium_custom', { option: ds.g, value: ds.v });
        desenha();
      },
    });
  };

  // ------------------------------------------------------------ MEU TIME
  TELAS.time = () => {
    const m = V.meuTime();
    const desenha = () => {
      const cores = (k) => `<div class="cores">${V.PALETA.map((c) => `<button class="${m[k] === c ? 'on' : ''}" style="background:${c}" data-acao="cor" data-k="${k}" data-c="${c}" aria-label="${c}"></button>`).join('')}</div>`;
      tela.innerHTML = T.topo(t('menu.time')) + `<div class="rola">
        <div class="time-previa">
          <span class="escudo" style="width:120px;height:124px">${V.escudoSVG(m.c1, m.c2, V.siglaDe(m.nome), m.forma, m.padrao)}</span>
        </div>
        <div class="titulo-secao">${t('time.nome')}</div>
        <input class="campo-texto" data-nome maxlength="22" value="${esc(m.nome)}">
        <div class="titulo-secao">${t('time.escudo')}</div>
        <div class="opcoes escudos">${V.FORMAS.map((f, i) => `<button class="${m.forma === i ? 'on' : ''}" data-acao="forma" data-i="${i}">${V.escudoSVG(m.c1, m.c2, '', i, m.padrao)}</button>`).join('')}</div>
        <div class="titulo-secao">${t('time.padrao_titulo')}</div>
        <div class="opcoes escudos">${V.PADROES.map((f, i) => `<button class="${m.padrao === i ? 'on' : ''}" data-acao="padrao" data-i="${i}">${V.escudoSVG(m.c1, m.c2, '', m.forma, i)}</button>`).join('')}</div>
        <div class="titulo-secao">${t('time.cor1')}</div>${cores('c1')}
        <div class="titulo-secao">${t('time.cor2')}</div>${cores('c2')}
      </div>`;
      const inp = tela.querySelector('[data-nome]');
      inp.addEventListener('change', () => { m.nome = inp.value.trim().slice(0, 22) || t('time.padrao'); V.salvarMeuTime(m); desenha(); });
    };
    desenha();
    T.acoesComuns();
    T.setAcoes({
      cor: (ds) => { m[ds.k] = ds.c; V.salvarMeuTime(m); desenha(); },
      forma: (ds) => { m.forma = +ds.i; V.salvarMeuTime(m); desenha(); },
      padrao: (ds) => { m.padrao = +ds.i; V.salvarMeuTime(m); desenha(); },
    });
  };

  // ------------------------------------------------------------ RECORDES
  TELAS.recordes = () => {
    const r = T.recordes();
    const dia = T.diario();
    // sequência de desafios do dia (dias seguidos terminados, até hoje ou ontem)
    let seq = 0;
    const d0 = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(d0); d.setDate(d0.getDate() - i);
      const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      if (dia[k] && dia[k].fim && !dia[k].abandonou) seq++;
      else if (i > 0) break;
    }
    const modos = ['copa', 'champions', 'brasileirao', 'premier', 'laliga', 'seriea', 'bundesliga', 'ligue1', 'mistura'];
    tela.innerHTML = T.topo(t('menu.recordes')) + `<div class="rola">
      <div class="totais"><div><b>${r.titulos}</b><span>${t('rec.titulos')}</span></div><div><b>${r.perfeitos}</b><span>${t('rec.perfeitos')}</span></div><div><b>${seq}</b><span>${t('rec.sequencia')}</span></div></div>
      <div class="totais" style="margin-top:8px"><div><b>${r.campanhas}</b><span>${t('rec.campanhas')}</span></div><div><b>${r.vitorias}</b><span>${t('rec.vitorias')}</span></div><div><b>${r.gols}</b><span>${t('rec.gols')}</span></div></div>
      <div class="titulo-secao">${t('rec.por_modo')}</div>
      ${modos.map((m) => {
        const x = r.modos[m];
        return `<div class="cartao rec-lin">${V.emblemaModo(m)}<span class="tx"><b>${T.nomeModo(m)}</b><span class="sub">${x && x.melhor ? t('rec.melhor', { texto: esc(x.melhor.texto), v: x.melhor.v, e: x.melhor.e, d: x.melhor.d }) : t('rec.nunca')}</span></span><span class="num">${x ? `<b>${x.titulos}</b><br>${t('rec.jogadas', { n: x.jogadas })}` : ''}</span></div>`;
      }).join('')}
    </div>`;
    T.acoesComuns();
  };

  // ------------------------------------------------------------ CONFIGURAÇÕES
  TELAS.config = () => {
    const desenha = () => {
      const chave = (k, ic) => `<button class="cartao cfg" data-acao="chave" data-k="${k}">${V.icone(ic)}<span class="tx">${t('config.' + k)}</span><span class="chave${D.config[k] ? ' on' : ''}"></span></button>`;
      const item = (acao, ic, txt) => `<button class="cartao cfg toque" data-acao="${acao}">${V.icone(ic)}<span class="tx">${txt}</span>${V.icone('voltar', 'seta gira')}</button>`;
      tela.innerHTML = T.topo(t('config.titulo')) + `<div class="rola">
        ${chave('som', 'som')}${chave('musica', 'musica')}${chave('vibrar', 'vibrar')}${D.notificacoes.api() ? chave('notif', 'sino') : ''}
        ${D.RELEASE ? '' : `<div class="titulo-secao">${t('config.idioma')} (dev)</div><div class="opcoes">${['pt', 'en', 'es'].map((l) => `<button class="${D.I18N.lang === l ? 'on' : ''}" data-acao="lang" data-l="${l}">${l.toUpperCase()}</button>`).join('')}</div>`}
        <div class="titulo-secao">${t('config.mais')}</div>
        ${item('como', 'ajuda', t('menu.como'))}
        ${item('avaliar', 'estrela', t('config.avaliar'))}
        ${item('restaurar', 'loja', t('loja.restaurar'))}
        ${D.PRIVACY_URL ? item('privacidade', 'cadeado', t('config.privacidade')) : ''}
        ${D.admob.privacyOptions ? item('privOpcoes', 'escudo', t('config.priv_opcoes')) : ''}
        ${D.RELEASE ? '' : item('dev', 'teste', 'DEV: +5000')}
        <p class="sub centro" style="margin-top:22px">${t('app.nome')} · v${window.DEZ_VERSAO || '1.0.0'}<br>${t('config.aviso')}</p>
      </div>`;
    };
    desenha();
    T.acoesComuns();
    T.setAcoes({
      chave: async (ds) => {
        const k = ds.k;
        D.config[k] = !D.config[k];
        if (k === 'notif' && D.config.notif) D.config.notif = await D.notificacoes.pedirPermissao();
        D.salvarConfig();
        if (k === 'som') D.som.aplicar();
        if (k === 'musica') D.musica.atualiza();
        if (k === 'notif') D.notificacoes.agendar();
        desenha();
      },
      lang: (ds) => { D.config.lang = ds.l; D.salvarConfig(); location.reload(); },
      como: () => T.comoJogar(),
      avaliar: () => { D.analytics.event('rate_settings'); D.abrirLoja(); },
      restaurar: () => D.store.restore().then((n) => { if (n !== null) toast(t('loja.restaurado', { n })); }),
      privacidade: () => window.open(D.PRIVACY_URL, '_blank'),
      privOpcoes: () => D.admob.showPrivacyOptions(),
      dev: () => { D.moedas.somar(5000, 'dev'); toast('+5000'); },
    });
  };
})();

// Dez a Zero: serviços. Um ponto único para cada coisa de fora do jogo (armazenamento, idioma,
// Firebase, anúncios, compras, avaliação, notificações, compartilhar, som). Tudo é opcional: no
// navegador, sem os plugins nativos, cada serviço tem um caminho degradado e o jogo roda inteiro.
(function () {
  'use strict';

  const RELEASE = !!window.DEZ_RELEASE;
  const DEBUG = /[?&]debug(&|=|$)/.test(location.search);
  const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const nativePlugin = (name) => (NATIVE && window.Capacitor.Plugins && window.Capacitor.Plugins[name]) || null;
  const PLAY_PACKAGE_ID = 'com.julio333.FootballDraft'; // o appId do capacitor.config.json
  const LINK_LOJA = 'https://play.google.com/store/apps/details?id=' + PLAY_PACKAGE_ID;
  const PRIVACY_URL = 'https://sites.google.com/view/cotuba-software/privadicade';

  // ------------------------------------------------------------ armazenamento protegido
  // localStorage lança exceção em janela anônima e em WebView restrita: nunca é chamado cru, e o
  // catch devolve o padrão sensato. As chaves (dez.*) ficam salvas no aparelho: não renomear.
  const guarda = {
    json(key, padrao) {
      try {
        const v = JSON.parse(localStorage.getItem(key) || 'null');
        return v && typeof v === 'object' ? v : (padrao !== undefined ? padrao : {});
      } catch (e) { return padrao !== undefined ? padrao : {}; }
    },
    salvar(key, v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } },
    num(key, padrao = 0) { try { const v = Number(localStorage.getItem(key)); return Number.isFinite(v) && localStorage.getItem(key) !== null ? v : padrao; } catch (e) { return padrao; } },
    salvarNum(key, v) { try { localStorage.setItem(key, String(v)); } catch (e) { /* sem armazenamento */ } },
    apagar(key) { try { localStorage.removeItem(key); } catch (e) { /* sem armazenamento */ } },
  };
  const hoje = () => {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  };

  // ------------------------------------------------------------ idioma
  // Chave faltando num idioma cai no português; chave inexistente aparece como ela mesma.
  const CFG_KEY = 'dez.config';
  const config = Object.assign({ som: true, musica: true, vibrar: true, notif: true, lang: null, velocidade: 1 }, guarda.json(CFG_KEY));
  const salvarConfig = () => guarda.salvar(CFG_KEY, config);
  function idiomaDoAparelho() {
    const l = String((navigator.languages && navigator.languages[0]) || navigator.language || 'pt').toLowerCase();
    return l.startsWith('pt') ? 'pt' : l.startsWith('es') ? 'es' : 'en';
  }
  const I18N = { dicts: window.DEZ_I18N || {}, lang: 'pt' };
  I18N.lang = (!RELEASE && config.lang) || idiomaDoAparelho();
  function t(key, vars) {
    const d = I18N.dicts[I18N.lang], fb = I18N.dicts.pt;
    const str = (d && d[key]) !== undefined ? d[key] : ((fb && fb[key]) !== undefined ? fb[key] : key);
    return vars ? String(str).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : str;
  }
  document.documentElement.lang = I18N.lang === 'pt' ? 'pt-BR' : I18N.lang;

  // ------------------------------------------------------------ Firebase (Remote Config, Analytics, Crashlytics)
  function firebaseCall(plugin, method, arg) {
    const plugins = window.Capacitor && window.Capacitor.Plugins, api = plugins && plugins[plugin];
    if (!api || typeof api[method] !== 'function') return Promise.resolve(null);
    try { return Promise.resolve(api[method](arg)).catch(() => null); } catch (e) { return Promise.resolve(null); }
  }
  // Valores ajustáveis no console do Firebase sem publicar versão nova. REMOTE_DEFAULTS é a fonte
  // da verdade; o console só sobrescreve o que foi configurado lá.
  const REMOTE_KEY = 'dez.remote';
  const REMOTE_DEFAULTS = {
    rate_after_matches: 5, // pedido de avaliação: primeiro depois de N partidas terminadas
    rate_every_matches: 15, // o seguinte só depois de mais N partidas
    rate_max_asks: 4, // no máximo N pedidos na vida do jogador
    ad_interstitial_every: 3, // intersticial a cada N partidas (0 = desligado)
    ad_interstitial_gap_sec: 90, // intervalo mínimo entre dois intersticiais
    ad_interstitial_after_matches: 4, // nenhum intersticial nas primeiras N partidas do jogador
    ad_offer_every: 3, // oferta de "remover anúncios" depois do 1º intersticial e a cada N
    ad_coins_reward: 100, // moedas por anúncio assistido na loja
    ad_coins_daily: 5, // quantos desses anúncios por dia
    ad_rerolls_max: 2, // re-sorteios extras por anúncio em um draft
    notif_hour: 19, // hora do lembrete diário
  };
  const remote = {
    values: Object.assign({}, guarda.json(REMOTE_KEY)),
    get(key) { return key in this.values ? this.values[key] : REMOTE_DEFAULTS[key]; },
    num(key) { const v = Number(this.get(key)); return Number.isFinite(v) ? v : REMOTE_DEFAULTS[key]; },
    bool(key) { const v = this.get(key); return v === true || v === 'true' || v === 1; },
    async fetch() {
      const ok = await firebaseCall('FirebaseRemoteConfig', 'fetchAndActivate');
      if (ok === null) return;
      const fresh = {};
      for (const [key, def] of Object.entries(REMOTE_DEFAULTS)) {
        const method = typeof def === 'boolean' ? 'getBoolean' : typeof def === 'number' ? 'getNumber' : 'getString';
        const res = await firebaseCall('FirebaseRemoteConfig', method, { key });
        if (res && res.source === 'remote') fresh[key] = res.value;
      }
      this.values = fresh;
      guarda.salvar(REMOTE_KEY, fresh);
    },
  };
  // Eventos com os limites do Firebase: nome e parâmetros até 40 caracteres, textos até 100.
  const analytics = {
    log: [],
    record(kind, name, params) {
      this.log.push({ kind, name, params });
      if (this.log.length > 200) this.log.shift();
      if (DEBUG) console.debug('[analytics]', kind, name, params || '');
    },
    event(name, params = {}) {
      const clean = {};
      for (const [k, v] of Object.entries(params)) {
        if (v == null) continue;
        clean[k.slice(0, 40)] = typeof v === 'number' ? Math.round(v * 1000) / 1000 : typeof v === 'boolean' ? Number(v) : String(v).slice(0, 100);
      }
      this.record('event', name, clean);
      firebaseCall('FirebaseAnalytics', 'logEvent', { name, params: clean });
    },
    screen(name) { this.record('screen', name); firebaseCall('FirebaseAnalytics', 'setCurrentScreen', { screenName: name }); },
    userProp(key, value) { this.record('user', key, { value }); firebaseCall('FirebaseAnalytics', 'setUserProperty', { key, value: String(value) }); },
    error(err, where) {
      const message = String((err && (err.stack || err.message)) || err).slice(0, 2000);
      this.record('error', where, { message });
      firebaseCall('FirebaseCrashlytics', 'recordException', { message: '[' + where + '] ' + message });
    },
  };
  window.addEventListener('error', (e) => analytics.error(e.error || e.message, 'window'));
  window.addEventListener('unhandledrejection', (e) => analytics.error(e.reason, 'promise'));

  // ------------------------------------------------------------ moedas
  const MOEDAS_KEY = 'dez.moedas';
  const MOEDAS_INICIAIS = 300;
  const moedas = {
    saldo() { return guarda.num(MOEDAS_KEY, MOEDAS_INICIAIS); },
    somar(n, origem) {
      guarda.salvarNum(MOEDAS_KEY, this.saldo() + n);
      analytics.event('earn_virtual_currency', { virtual_currency_name: 'coins', value: n, source: origem });
      document.dispatchEvent(new CustomEvent('dez-moedas'));
    },
    gastar(n, item) {
      if (this.saldo() < n) return false;
      guarda.salvarNum(MOEDAS_KEY, this.saldo() - n);
      analytics.event('spend_virtual_currency', { virtual_currency_name: 'coins', value: n, item_name: item });
      document.dispatchEvent(new CustomEvent('dez-moedas'));
      return true;
    },
  };

  // ------------------------------------------------------------ compras no app (RevenueCat)
  // id: nome usado no jogo (o que fica salvo); sku: id do produto no Play Console/RevenueCat.
  // Todos são compra única. inclui: o pacote libera também o que os outros liberam (Rei do Draft).
  const PRODUCTS = [
    { id: 'draft_king', sku: 'rei', testPrice: 'R$ 24,90', inclui: ['remove_ads', 'all_stadiums', 'all_balls'] },
    { id: 'all_stadiums', sku: 'estadios', testPrice: 'R$ 14,90' },
    { id: 'all_balls', sku: 'bolas', testPrice: 'R$ 7,90' },
    { id: 'remove_ads', sku: 'remover', testPrice: 'R$ 9,90' },
  ];
  const IAP_KEY = 'dez.iap.owned';
  const product = (id) => PRODUCTS.find((k) => k.id === id);
  const productBySku = (sku) => PRODUCTS.find((k) => k.sku === sku);
  const REVENUECAT_KEY = 'CHAVE_REMOVIDA'; // chave pública do SDK Android do projeto no RevenueCat
  // aviso ao jogador, por mais tempo que o normal: são mensagens de erro, mais longas
  const aviso = (msg) => { if (window.DezTelas) window.DezTelas.toast(msg, 4500); };
  const billing = {
    api() { return REVENUECAT_KEY ? nativePlugin('Purchases') : null; },
    products: {},
    carregando: null,
    init() {
      const rc = this.api();
      if (!rc) return;
      Promise.resolve()
        .then(() => {
          rc.configure({ apiKey: REVENUECAT_KEY });
          rc.addCustomerInfoUpdateListener((info) => this.grantFrom(info));
          return this.carregar();
        })
        .then(() => rc.getCustomerInfo())
        .then(({ customerInfo }) => this.grantFrom(customerInfo))
        .catch((e) => analytics.error(e && (e.message || e.code), 'billing_init'));
      // quem abriu o jogo sem internet: tenta de novo quando a conexão voltar
      window.addEventListener('online', () => this.carregar());
    },
    // carrega os produtos que faltam; nunca rejeita e pode ser chamada de novo a qualquer momento
    carregar() {
      const rc = this.api();
      if (!rc || PRODUCTS.every((k) => this.products[k.id])) return Promise.resolve();
      if (this.carregando) return this.carregando;
      this.carregando = Promise.resolve()
        .then(() => rc.getProducts({ productIdentifiers: PRODUCTS.map((k) => k.sku), type: 'NON_SUBSCRIPTION' }))
        .then(({ products }) => {
          (products || []).forEach((sp) => {
            const k = productBySku(sp.identifier);
            if (!k) return;
            this.products[k.id] = sp;
            store.prices[k.id] = sp.priceString;
          });
          document.dispatchEvent(new CustomEvent('dez-loja'));
          const faltam = PRODUCTS.filter((k) => !this.products[k.id]).map((k) => k.sku);
          if (faltam.length) analytics.error('produtos ausentes: ' + faltam.join(', '), 'billing_products');
        })
        .catch((e) => analytics.error(e && (e.message || e.code), 'billing_products'))
        .then(() => { this.carregando = null; });
      return this.carregando;
    },
    // entrega o que a loja diz que o jogador já comprou (só os que não são consumíveis)
    grantFrom(info) {
      ((info && info.nonSubscriptionTransactions) || []).forEach((tx) => {
        const k = productBySku(tx.productIdentifier);
        if (k && !store.comprou(k.id)) store.grant(k.id);
      });
    },
    // resolve com o resultado: purchased, cancelled, pending, error ou unavailable (produto não carregou)
    order(id) {
      const rc = this.api();
      return this.carregar().then(() => {
        const sp = this.products[id];
        if (!sp) return 'unavailable';
        return rc.purchaseStoreProduct({ product: sp })
          .then(({ customerInfo }) => {
            this.grantFrom(customerInfo);
            if (!store.comprou(id)) store.grant(id);
            return 'purchased';
          })
          .catch((e) => {
            const code = e && String(e.code);
            if (code === '1') return 'cancelled';
            if (code === '20') return 'pending'; // a compra é entregue pelo aviso de atualização quando for paga
            analytics.error(e && (e.message || code), 'billing_buy');
            return 'error';
          });
      });
    },
    restore() { return this.api().restorePurchases().then(({ customerInfo }) => this.grantFrom(customerInfo)); },
  };
  const store = {
    busy: false,
    prices: {},
    owned() { return guarda.json(IAP_KEY); },
    comprou(id) { return !!this.owned()[id]; }, // comprou este produto
    // tem o benefício: comprou o produto ou um pacote que o inclui (Rei do Draft)
    owns(id) { const o = this.owned(); return !!o[id] || PRODUCTS.some((k) => k.inclui && k.inclui.includes(id) && o[k.id]); },
    // preço da Play Store; no teste, o de exemplo; carregando, reticências
    price(id) { return this.prices[id] || (billing.api() ? '…' : product(id).testPrice); },
    // na versão da loja sem cobrança configurada, comprar não pode liberar nada de graça
    disponivel() { return !!billing.api() || !RELEASE; },
    grant(id) {
      const owned = this.owned();
      owned[id] = owned[id] || Date.now();
      guarda.salvar(IAP_KEY, owned);
      analytics.userProp('ads_removed', this.owns('remove_ads'));
      document.dispatchEvent(new CustomEvent('dez-loja', { detail: id }));
    },
    buy(id, placement) {
      const k = product(id);
      if (this.busy || this.owns(id)) return Promise.resolve(this.owns(id));
      if (!this.disponivel()) return Promise.resolve(false);
      this.busy = true;
      analytics.event('iap_begin', { item_id: id, placement });
      const fim = (res) => {
        this.busy = false;
        analytics.event('iap_result', { item_id: id, placement, result: res });
        if (res === 'pending') aviso(t('loja.pendente'));
        else if (res === 'error' || res === 'unavailable') aviso(t('loja.erro_compra'));
        return res === 'purchased';
      };
      if (billing.api()) return billing.order(id).then(fim);
      // teste (navegador / desenvolvimento): tela que simula a compra
      return telaTeste.compra(k, this.price(id)).then((ok) => {
        if (ok) this.grant(id);
        return fim(ok ? 'purchased' : 'cancelled');
      });
    },
    // resolve com quantas compras o jogador tem, ou null se a restauração falhou (o jogador já foi avisado)
    restore() {
      analytics.event('iap_restore');
      const count = () => PRODUCTS.filter((k) => this.comprou(k.id)).length;
      if (!billing.api()) return Promise.resolve(count());
      return billing.restore().then(count, (e) => {
        analytics.error(e && (e.message || e.code), 'billing_restore');
        aviso(t('loja.erro_restaurar'));
        return null;
      });
    },
  };
  const adsRemoved = () => store.owns('remove_ads');

  // ------------------------------------------------------------ telas de teste (sem plugin)
  // Anúncio e compra simulados, para todo o fluxo de monetização ser testável no navegador.
  const telaTeste = {
    camada(html) {
      const el = document.createElement('div');
      el.className = 'anuncio-teste';
      el.innerHTML = html;
      document.getElementById('app').appendChild(el);
      return el;
    },
    anuncio(premiado) {
      return new Promise((resolve) => {
        let n = premiado ? 5 : 3;
        const el = this.camada(`<div class="sub">${t('teste.anuncio')}</div><div class="cont">${n}</div><button class="btn borda pequeno" style="width:auto;padding:0 18px" data-x>${premiado ? t('teste.fechar_sem') : t('teste.fechar')}</button>`);
        const cont = el.querySelector('.cont');
        const timer = setInterval(() => {
          n--;
          cont.textContent = n > 0 ? n : '✓';
          if (n <= 0) { clearInterval(timer); if (premiado) el.querySelector('[data-x]').textContent = t('teste.receber'); }
        }, 1000);
        el.querySelector('[data-x]').onclick = () => { clearInterval(timer); el.remove(); resolve(premiado ? n <= 0 : true); };
      });
    },
    compra(k, preco) {
      return new Promise((resolve) => {
        const el = this.camada(`<h2 class="display" style="margin:0;font-size:34px">${t('loja.' + k.id)}</h2><div class="sub">${t('teste.compra', { preco })}</div><div class="linha-btns" style="width:100%"><button class="btn borda" data-n>${t('geral.cancelar')}</button><button class="btn verde" data-s>${t('teste.comprar')}</button></div>`);
        el.querySelector('[data-n]').onclick = () => { el.remove(); resolve(false); };
        el.querySelector('[data-s]').onclick = () => { el.remove(); resolve(true); };
      });
    },
  };

  // ------------------------------------------------------------ anúncios (AdMob)
  // Fora da versão da loja (RELEASE), o plugin troca os blocos pelos de teste do Google: clicar
  // nos próprios anúncios reais faz o AdMob bloquear a conta. O App ID fica no AndroidManifest.xml.
  const ADMOB = {
    testing: !RELEASE,
    // blocos da conta (app ca-app-pub-1665055635227173~7650738734, App ID no AndroidManifest.xml)
    rewarded: 'ca-app-pub-1665055635227173/4753112653', // premiado
    interstitial: 'ca-app-pub-1665055635227173/1539791806', // intersticial
  };
  const admob = {
    api() { return nativePlugin('AdMob'); },
    ready: Promise.resolve(),
    privacyOptions: false,
    falhou: false, // o último anúncio não carregou ou não abriu (diferente de o jogador fechar sem assistir)
    init() {
      const a = this.api();
      if (!a) return;
      const remember = (info) => { if (info) this.privacyOptions = info.privacyOptionsRequirementStatus === 'REQUIRED'; return info; };
      this.ready = a.initialize({})
        .then(() => a.requestConsentInfo())
        .then(remember)
        .then((info) => (info && info.isConsentFormAvailable && info.status === 'REQUIRED' ? a.showConsentForm().then(remember) : null))
        .catch((e) => analytics.error(e && (e.message || e), 'admob_init'));
    },
    showPrivacyOptions() {
      const a = this.api();
      return a ? a.showPrivacyOptionsForm().catch((e) => analytics.error(e && (e.message || e), 'admob_privacy')) : Promise.resolve();
    },
    show(kind, adId) {
      const a = this.api();
      const ev = kind === 'rewarded'
        ? { reward: 'onRewardedVideoAdReward', closed: 'onRewardedVideoAdDismissed', fail: 'onRewardedVideoAdFailedToShow', failLoad: 'onRewardedVideoAdFailedToLoad' }
        : { closed: 'interstitialAdDismissed', fail: 'interstitialAdFailedToShow', failLoad: 'interstitialAdFailedToLoad' };
      this.falhou = false;
      return this.ready.then(() => new Promise((resolve) => {
        let earned = false, finished = false;
        const handles = [];
        const finish = () => {
          if (finished) return;
          finished = true;
          handles.forEach((h) => Promise.resolve(h).then((x) => x && x.remove()));
          resolve(earned);
        };
        const falha = () => { if (!finished) this.falhou = true; finish(); };
        if (ev.reward) handles.push(a.addListener(ev.reward, () => { earned = true; }));
        handles.push(a.addListener(ev.closed, finish), a.addListener(ev.fail, falha), a.addListener(ev.failLoad, falha));
        const opts = { adId, isTesting: ADMOB.testing };
        const run = kind === 'rewarded' ? a.prepareRewardVideoAd(opts).then(() => a.showRewardVideoAd()) : a.prepareInterstitial(opts).then(() => a.showInterstitial());
        run.catch((e) => { analytics.error(e && (e.message || e), 'admob_' + kind); falha(); });
      }));
    },
  };
  const AD_LAST_KEY = 'dez.ads.lastInterstitial', AD_COUNT_KEY = 'dez.ads.interstitials', AD_COINS_KEY = 'dez.ads.coins';
  const ads = {
    busy: false,
    // anúncio premiado: resolve true só se o jogador ganhou a recompensa
    showRewarded(placement) {
      if (this.busy) return Promise.resolve(false);
      if (adsRemoved()) { analytics.event('ad_rewarded', { placement, result: 'no_ads' }); return Promise.resolve(true); }
      this.busy = true;
      som.segurar(true);
      const run = admob.api() ? admob.show('rewarded', ADMOB.rewarded) : telaTeste.anuncio(true);
      return run.then((ok) => {
        this.busy = false;
        som.segurar(false);
        const falhou = !ok && admob.falhou;
        analytics.event('ad_rewarded', { placement, result: ok ? 'rewarded' : falhou ? 'failed' : 'cancelled' });
        if (falhou) aviso(t('anuncio.erro'));
        return ok;
      });
    },
    // Hora de um intersticial? Nunca nas primeiras partidas, com intervalo mínimo e a cada N.
    interstitialDue() {
      if (adsRemoved() || this.busy) return false;
      const partidas = rate.estado().matches;
      if (partidas <= remote.num('ad_interstitial_after_matches')) return false;
      if (Date.now() - guarda.num(AD_LAST_KEY, 0) < remote.num('ad_interstitial_gap_sec') * 1000) return false;
      const every = remote.num('ad_interstitial_every');
      return every > 0 && partidas % every === 0;
    },
    showInterstitial(placement) {
      if (adsRemoved() || this.busy) return Promise.resolve(false);
      this.busy = true;
      som.segurar(true);
      guarda.salvarNum(AD_LAST_KEY, Date.now());
      const shown = guarda.num(AD_COUNT_KEY, 0) + 1;
      guarda.salvarNum(AD_COUNT_KEY, shown);
      const every = remote.num('ad_offer_every');
      const offer = every > 0 && (shown - 1) % every === 0;
      analytics.event('ad_interstitial', { placement, offer });
      const run = admob.api() ? admob.show('interstitial', ADMOB.interstitial) : telaTeste.anuncio(false);
      return run.then(() => { this.busy = false; som.segurar(false); return offer && store.disponivel() && !adsRemoved(); });
    },
    // moedas por anúncio na loja, com limite por dia
    moedasRestantes() {
      const st = guarda.json(AD_COINS_KEY);
      const usados = st.dia === hoje() ? st.n || 0 : 0;
      return Math.max(0, remote.num('ad_coins_daily') - usados);
    },
    contarMoedas() {
      const st = guarda.json(AD_COINS_KEY), d = hoje();
      guarda.salvar(AD_COINS_KEY, { dia: d, n: (st.dia === d ? st.n || 0 : 0) + 1 });
    },
  };

  // ------------------------------------------------------------ pedido de avaliação (Google Play)
  // API oficial de avaliação no app: sem perguntar nada antes, sem botão, sem nada em troca.
  const RATE_KEY = 'dez.rate';
  const rate = {
    estado() { return Object.assign({ matches: 0, nextAt: remote.num('rate_after_matches'), asks: 0 }, guarda.json(RATE_KEY)); },
    contarPartida() { const st = this.estado(); st.matches += 1; guarda.salvar(RATE_KEY, st); },
    devePedir() { const st = this.estado(); return !!nativePlugin('InAppReview') && st.asks < remote.num('rate_max_asks') && st.matches >= st.nextAt; },
    pedir() {
      const st = this.estado();
      st.asks += 1;
      st.nextAt = st.matches + remote.num('rate_every_matches');
      guarda.salvar(RATE_KEY, st);
      const api = nativePlugin('InAppReview');
      if (!api || typeof api.requestReview !== 'function') return Promise.resolve(false);
      analytics.event('rate_request');
      return Promise.resolve(api.requestReview()).then(() => true).catch((e) => {
        analytics.event('rate_request_error', { msg: String(e && e.message || e).slice(0, 90) });
        return false;
      });
    },
  };
  // "Avaliar o jogo" nas configurações: abre a loja (permitido, porque não é a API)
  function abrirLoja() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (!isAndroid) return void window.open(LINK_LOJA, '_blank');
    let saiu = false;
    const onHide = () => { saiu = true; };
    document.addEventListener('visibilitychange', onHide, { once: true });
    window.location.href = 'market://details?id=' + PLAY_PACKAGE_ID;
    setTimeout(() => {
      document.removeEventListener('visibilitychange', onHide);
      if (!saiu && !document.hidden) window.open(LINK_LOJA, '_blank');
    }, 1500);
  }

  // ------------------------------------------------------------ notificações locais
  // Lembrete diário nos próximos 7 dias, reagendado a cada abertura: quem para de jogar deixa de
  // receber em uma semana. A permissão é pedida depois da primeira campanha, não na abertura.
  const NOTIF_IDS = [101, 102, 103, 104, 105, 106, 107];
  const notificacoes = {
    api() { return nativePlugin('LocalNotifications'); },
    async permitido() {
      const api = this.api();
      if (!api) return false;
      try { const p = await api.checkPermissions(); return p.display === 'granted'; } catch (e) { return false; }
    },
    async pedirPermissao() {
      const api = this.api();
      if (!api) return false;
      try {
        const p = await api.requestPermissions();
        analytics.event('notif_permission', { result: p.display });
        return p.display === 'granted';
      } catch (e) { analytics.error(e, 'notif_perm'); return false; }
    },
    async agendar(opts = {}) {
      const api = this.api();
      if (!api) return;
      try {
        await api.cancel({ notifications: NOTIF_IDS.map((id) => ({ id })) });
        if (!config.notif || !(await this.permitido())) return;
        const hora = remote.num('notif_hour');
        const lista = NOTIF_IDS.map((id, i) => {
          const quando = new Date();
          quando.setDate(quando.getDate() + i + 1);
          quando.setHours(hora, 0, 0, 0);
          const k = opts.campanha && i === 0 ? 'campanha' : 'd' + (i % 5);
          return { id, title: t('notif.' + k + '.t'), body: t('notif.' + k + '.b', opts), schedule: { at: quando, allowWhileIdle: false }, smallIcon: 'ic_stat_dez', iconColor: '#D4F25C' };
        });
        await api.schedule({ notifications: lista });
      } catch (e) { analytics.error(e, 'notif_schedule'); }
    },
  };

  // ------------------------------------------------------------ compartilhar
  // Imagem do resultado + texto com o link da loja. No app: arquivo no cache + menu de
  // compartilhar do Android. No navegador: Web Share com arquivo, ou baixa a imagem e copia o texto.
  async function compartilhar(canvas, texto) {
    const dataUrl = canvas.toDataURL('image/png');
    const share = nativePlugin('Share'), fs = nativePlugin('Filesystem');
    analytics.event('share', { method: share ? 'native' : 'web', content_type: 'result' });
    if (share && fs) {
      try {
        const arq = await fs.writeFile({ path: 'dez-a-zero.png', data: dataUrl.split(',')[1], directory: 'CACHE' });
        await share.share({ text: texto, files: [arq.uri], dialogTitle: t('compartilhar.titulo') });
        return true;
      } catch (e) {
        if (String(e && e.message).toLowerCase().includes('cancel')) return false;
        analytics.error(e, 'share');
        try { await share.share({ text: texto }); return true; } catch (e2) { return false; }
      }
    }
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'dez-a-zero.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: texto }); return true; }
      if (navigator.share) { await navigator.share({ text: texto }); return true; }
    } catch (e) { if (e && e.name === 'AbortError') return false; }
    const a = document.createElement('a');
    a.href = dataUrl; a.download = 'dez-a-zero.png'; a.click();
    try { await navigator.clipboard.writeText(texto); } catch (e) { /* sem área de transferência */ }
    return 'copiado';
  }

  // ------------------------------------------------------------ som (sintetizado, sem arquivos)
  const som = {
    ctx: null, mestre: null, torcida: null, mudo: false, segura: false,
    iniciar() {
      if (this.ctx) return this.ctx;
      try {
        const C = window.AudioContext || window.webkitAudioContext;
        this.ctx = new C();
        this.mestre = this.ctx.createGain();
        this.mestre.connect(this.ctx.destination);
        this.aplicar();
      } catch (e) { this.ctx = null; }
      return this.ctx;
    },
    aplicar() {
      if (this.mestre) this.mestre.gain.value = config.som && !this.mudo && !this.segura ? 0.8 : 0;
      musica.atualiza(); // a música obedece ao segundo plano e aos anúncios do mesmo jeito
    },
    segurar(v) { this.segura = v; this.aplicar(); },
    ruido(seg) {
      const c = this.ctx, buf = c.createBuffer(1, Math.floor(c.sampleRate * seg), c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const s = c.createBufferSource();
      s.buffer = buf;
      return s;
    },
    toque() {
      const c = this.iniciar();
      if (!c || !config.som) return;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle'; o.frequency.value = 660;
      g.gain.setValueAtTime(0.12, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
      o.connect(g); g.connect(this.mestre); o.start(); o.stop(c.currentTime + 0.09);
    },
    apito(longo) {
      const c = this.iniciar();
      if (!c || !config.som) return;
      const vezes = longo ? [0, 0.32, 0.64] : [0];
      vezes.forEach((d, i) => {
        const o = c.createOscillator(), g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
        o.type = 'sine'; o.frequency.value = 2900;
        lfo.frequency.value = 38; lg.gain.value = 140; lfo.connect(lg); lg.connect(o.frequency);
        const t0 = c.currentTime + d, dur = longo && i === 2 ? 0.75 : 0.24;
        g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.09, t0 + 0.02); g.gain.setValueAtTime(0.09, t0 + dur - 0.05); g.gain.linearRampToValueAtTime(0, t0 + dur);
        o.connect(g); g.connect(this.mestre); o.start(t0); lfo.start(t0); o.stop(t0 + dur); lfo.stop(t0 + dur);
      });
    },
    chute() {
      const c = this.iniciar();
      if (!c || !config.som) return;
      const o = c.createOscillator(), g = c.createGain();
      o.frequency.setValueAtTime(140, c.currentTime); o.frequency.exponentialRampToValueAtTime(50, c.currentTime + 0.1);
      g.gain.setValueAtTime(0.35, c.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
      o.connect(g); g.connect(this.mestre); o.start(); o.stop(c.currentTime + 0.13);
    },
    // torcida de fundo durante a partida; "explode" no gol
    torcidaLigar() {
      const c = this.iniciar();
      if (!c || this.torcida) return;
      const s = this.ruido(4); s.loop = true;
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 0.6;
      const g = c.createGain(); g.gain.value = 0.05;
      s.connect(f); f.connect(g); g.connect(this.mestre); s.start();
      this.torcida = { s, g };
    },
    torcidaDesligar() { if (this.torcida) { try { this.torcida.s.stop(); } catch (e) { /* já parou */ } this.torcida = null; } },
    gol(nosso) {
      const c = this.iniciar();
      if (!c || !config.som) return;
      const s = this.ruido(3.2);
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = nosso ? 1100 : 700; f.Q.value = 0.5;
      const g = c.createGain();
      const v = nosso ? 0.5 : 0.18;
      g.gain.setValueAtTime(0.001, c.currentTime); g.gain.exponentialRampToValueAtTime(v, c.currentTime + 0.25); g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 3.1);
      s.connect(f); f.connect(g); g.connect(this.mestre); s.start(); s.stop(c.currentTime + 3.2);
    },
    vitoria() {
      const c = this.iniciar();
      if (!c || !config.som) return;
      [523, 659, 784, 1047].forEach((fq, i) => {
        const o = c.createOscillator(), g = c.createGain(), t0 = c.currentTime + i * 0.13;
        o.type = 'square'; o.frequency.value = fq;
        g.gain.setValueAtTime(0.06, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.35);
        o.connect(g); g.connect(this.mestre); o.start(t0); o.stop(t0 + 0.36);
      });
    },
  };
  // ------------------------------------------------------------ música dos menus
  // Toca nas telas de menu (as telas chamam ligar/desligar), entra e sai com volume suave, para com o
  // app em segundo plano e durante anúncios, e respeita a chave "Música". Navegador sem toque ainda
  // não deixa tocar: tenta de novo no primeiro toque.
  const musica = {
    el: null, quer: false, alvo: 0, timer: null, esperandoToque: false,
    VOLUME: 0.5,
    criar() {
      if (this.el) return this.el;
      try {
        const a = new Audio('../shared/audio/musica_menu.m4a');
        a.loop = true; a.preload = 'auto'; a.volume = 0;
        this.el = a;
      } catch (e) { this.el = null; }
      return this.el;
    },
    ligar() { this.quer = true; this.atualiza(); },
    desligar() { this.quer = false; this.atualiza(); },
    atualiza() {
      if (!this.quer && !this.el) return; // nunca tocou: nem carrega o arquivo
      const a = this.criar();
      if (!a) return;
      const toca = this.quer && config.musica && !som.mudo && !som.segura && !document.hidden;
      this.alvo = toca ? this.VOLUME : 0;
      if (toca && a.paused) {
        const p = a.play();
        if (p && p.catch) p.catch(() => this.tentarNoToque());
      }
      this.fade();
    },
    tentarNoToque() {
      if (this.esperandoToque) return;
      this.esperandoToque = true;
      document.addEventListener('pointerdown', () => { this.esperandoToque = false; this.atualiza(); }, { once: true, capture: true });
    },
    fade() {
      clearInterval(this.timer);
      const a = this.el;
      this.timer = setInterval(() => {
        const d = this.alvo - a.volume;
        if (Math.abs(d) <= 0.025) {
          a.volume = this.alvo;
          clearInterval(this.timer);
          if (this.alvo === 0 && !a.paused) a.pause();
        } else a.volume = Math.min(1, Math.max(0, a.volume + Math.sign(d) * 0.025)); // ~0,8 s de entrada/saída
      }, 40);
    },
  };
  document.addEventListener('visibilitychange', () => musica.atualiza());

  function vibrar(ms) {
    if (!config.vibrar) return;
    const h = nativePlugin('Haptics');
    if (h) h.vibrate({ duration: ms }).catch(() => null);
    else if (navigator.vibrate) try { navigator.vibrate(ms); } catch (e) { /* sem vibração */ }
  }

  // ------------------------------------------------------------ vida nativa do app
  // Barra de status escondida; botão voltar: anúncio/compra de teste ignoram, partida pausa, o
  // início minimiza o app, as outras telas voltam como o botão ‹ delas.
  function vidaNativa(handlers) {
    const bar = nativePlugin('StatusBar');
    if (bar) bar.hide().catch(() => null);
    const app = nativePlugin('App');
    if (!app) return;
    app.addListener('appStateChange', (s) => {
      som.mudo = !s.isActive;
      som.aplicar();
      if (!s.isActive && handlers.pausar) handlers.pausar();
      if (s.isActive && handlers.voltouAoApp) handlers.voltouAoApp();
    });
    app.addListener('backButton', () => {
      if (document.querySelector('.anuncio-teste')) return;
      if (handlers.voltar() === 'sair') app.minimizeApp();
    });
  }

  window.Dez = Object.assign(window.Dez || {}, {
    RELEASE, DEBUG, NATIVE, nativePlugin, PLAY_PACKAGE_ID, LINK_LOJA, PRIVACY_URL, guarda, hoje, config, salvarConfig,
    I18N, t, remote, analytics, moedas, PRODUCTS, product, store, billing, adsRemoved, ads, admob, rate, abrirLoja,
    notificacoes, compartilhar, som, musica, vibrar, vidaNativa, firebaseCall,
  });
})();

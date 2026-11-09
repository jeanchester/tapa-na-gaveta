// Show do Milhão do Futebol — réplica em Phaser/Canvas do app React Native (app/index.tsx), só para
// gravar vídeos de divulgação. Mesmas telas, textos, cores, medidas, sons e regras; sem anúncios,
// compras, Firebase nem avaliação na loja (fica como no app com "remover anúncios" comprado e
// sem anúncio premiado disponível).
//
// Como funciona: a tela é redesenhada inteira a cada quadro a partir do estado (como o React faz),
// em unidades dp do React Native multiplicadas pelo DPR. O relógio de tudo é o do Phaser (delayedCall
// e delta do update), então o gravador do divulgacao-kit controla o tempo quadro a quadro.
// Para automação: window.SMF (estado, tocar(id), forcarPerguntas) e window.smfGame.
(function () {
  'use strict';
  const D = window.SMF_DADOS;
  const PERGUNTAS_DB = {};                       // carregado no preload (app/perguntas.json)

  const COR_ACENTO = '#FBC02D';
  const COR_ERRADA = '#e53935';
  const COR_CERTA = '#43A047';
  const LETRAS = ['1', '2', '3', '4'];
  const PREMIOS = D.PREMIOS;
  const DIFICULDADE_POR_PERGUNTA = D.DIFICULDADE_POR_PERGUNTA;

  const MODOS = [
    { id: 'brasileiro', label: 'Futebol Brasileiro', icon: '🇧🇷' },
    { id: 'europeu', label: 'Futebol Europeu', icon: '🌍' },
    { id: 'copa', label: 'Copa do Mundo', image: 'logo_copa' },
    { id: 'escudos', label: 'Apenas Escudos', icon: '🛡️', exclusivo: true },
  ];
  const AJUDAS = [
    { id: 'cartoes', image: 'sim_cartoes', label: 'CARTÕES' },
    { id: 'var', image: 'sim_var', label: 'VAR' },
    { id: 'torcedores', image: 'sim_torcida', label: 'TORCIDA' },
    { id: 'driblar', image: 'sim_drible', label: 'DRIBLAR' },
  ];
  const TEXTOS_AJUDA = {
    cartoes: 'Elimina até 3 alternativas erradas para facilitar sua escolha!',
    var: 'O árbitro de vídeo revelará qual é a resposta correta da questão!',
    torcedores: 'A torcida dará seus palpites sobre qual é a alternativa certa.',
    driblar: 'Pula a pergunta atual e avança no jogo sem perder dinheiro.',
  };
  const ITENS_ARBITRAGEM = [
    { id: 'cartoes', nome: 'CARTÕES', preco: 100000, img: 'sim_cartoes', desc: 'Elimina 2 alternativas.' },
    { id: 'torcedores', nome: 'AJUDA DA TORCIDA', preco: 200000, img: 'sim_torcida', desc: 'Percentual de palpites.' },
    { id: 'driblar', nome: 'DRIBLES', preco: 200000, img: 'sim_drible', desc: 'Pula a questão sem perder.' },
    { id: 'var', nome: 'USO DO VAR', preco: 500000, img: 'sim_var', desc: 'Dá a resposta correta exata.' },
  ];
  const LIGAS_FILTRO = [
    { id: 'brasileirao', label: 'BRASILEIRÃO' }, { id: 'premier', label: 'PREMIER LEAGUE' },
    { id: 'laliga', label: 'LA LIGA' }, { id: 'seriea', label: 'SERIE A' },
    { id: 'bundesliga', label: 'BUNDESLIGA' }, { id: 'ligue1', label: 'LIGUE 1' },
  ];

  // ---------------------------------------------------------------------------------------------
  // Tela e escala (PLAYBOOK seção 3): canvas na resolução física, desenho em dp
  // ---------------------------------------------------------------------------------------------
  const DPR = Math.min(3, window.devicePixelRatio || 1);
  const PORTRAIT_RATIO = 0.6;
  function viewSize() {
    const el = document.getElementById('game');
    const h = el.clientHeight || window.innerHeight;
    const w = Math.min(window.innerWidth, Math.round(h * PORTRAIT_RATIO));
    el.style.width = w + 'px';
    return { w, h };
  }
  let W = 360, H = 640, isSmallScreen = true;
  function medir() { const v = viewSize(); W = v.w; H = v.h; isSmallScreen = H < 700; return v; }

  // ---------------------------------------------------------------------------------------------
  // Armazenamento (AsyncStorage do app -> localStorage, sempre protegido)
  // ---------------------------------------------------------------------------------------------
  const PREF = 'smf.';
  const store = {
    get(k) { try { return localStorage.getItem(PREF + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(PREF + k, String(v)); } catch (e) { /* sem armazenamento */ } },
  };

  // ---------------------------------------------------------------------------------------------
  // Utilidades de tempo e animação (equivalentes ao Animated do React Native)
  // ---------------------------------------------------------------------------------------------
  let scene = null;          // cena única
  let agora = 0;             // relógio do app em ms (delta acumulado)
  const later = (ms, fn) => scene.time.delayedCall(ms, fn);

  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t, sy = (t) => ((ay * t + by) * t + cy) * t;
    return (x) => {
      let t = x;
      for (let i = 0; i < 8; i++) { const d = sx(t) - x; const dv = (3 * ax * t + 2 * bx) * t + cx; if (Math.abs(d) < 1e-5 || !dv) break; t -= d / dv; }
      return sy(Math.max(0, Math.min(1, t)));
    };
  }
  const ease = bezier(0.42, 0, 1, 1);
  const inOutEase = (t) => (t < 0.5 ? ease(t * 2) / 2 : 1 - ease((1 - t) * 2) / 2);   // Easing.inOut(Easing.ease), padrão do Animated.timing
  const clamp01 = (v) => Math.max(0, Math.min(1, v));

  // Animated.timing(valor, { toValue, duration }) com o easing padrão
  function tween(de, para, dur, easing) {
    return { de, para, t0: agora, dur, easing: easing || inOutEase };
  }
  function valor(tw) {
    if (!tw) return 0;
    const p = tw.dur ? clamp01((agora - tw.t0) / tw.dur) : 1;
    return tw.de + (tw.para - tw.de) * tw.easing(p);
  }
  // Animated.spring({ friction: 4, tension: 40 }) de 0 a 1 (conversão do React Native: rigidez 230,2, amortecimento 13)
  function mola(t0) {
    const t = Math.max(0, (agora - t0) / 1000), k = 230.2, c = 13;
    const w0 = Math.sqrt(k), z = c / (2 * w0), wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
  }
  // sequência do tremor: 10, -10, 10, 0 (40 ms cada)
  function tremor(t0) {
    const pts = [0, 10, -10, 10, 0];
    const t = (agora - t0) / 40;
    if (t <= 0) return 0;
    if (t >= 4) return 0;
    const i = Math.floor(t), f = inOutEase(t - i);
    return pts[i] + (pts[i + 1] - pts[i]) * f;
  }

  // ---------------------------------------------------------------------------------------------
  // Estado do app (mesmos nomes do useState do original)
  // ---------------------------------------------------------------------------------------------
  const S = {
    tela: 'home', dinheiro: 0, jogosJogados: 0,
    modosSelecionados: ['brasileiro'], modalModosVisivel: false,
    audioEnabled: true, configVisivel: false, premiumVisivel: false,
    estadiosComprados: ['campo'], estadioSelecionado: 'campo', filtroLiga: 'brasileirao',
    estadioVisualizacao: null, modalCartaChefaoVisivel: false, chefaoVisto: false,
    comprasArbitragem: [],
    confirmaAnswer: null, confirmarParar: false, showGolAnim: false, showStartScreen: false,
    faseGol: 0, erroAtual: null, showErroAnim: false,
    perguntas: [], perguntaAtual: 0, estadoJogo: 'jogando', estadoResposta: 'aguardando',
    alternativaEliminada: [], respostaSelecionada: null, premioGanho: 0,
    ajudasDisponiveis: [], qtdDriblar: 0, perguntasPuladas: [],
    modalAjudaConfirm: null, modalVarVisivel: false, modalTorcidaVisivel: false, torcidaVotos: [],
    modalCartoesVisivel: false, cartoesOpcoes: [], cartaoRevelado: null, modalMilhaoVisivel: false,
    tempo: 45,
  };
  // sem anúncios nem compras nesta versão
  const hasUnlockedStadiums = false;
  const isRewardedLoaded = false;

  let timerOn = false, timerAcc = 0;
  let fade = tween(1, 1, 0);          // fadeAnim
  let varScan = tween(-300, -300, 0); // varScanX
  let golT0 = 0;                      // início da fase 1 do gol/erro (tremor e mola)
  let perguntasForcadas = null;       // automação: ids escolhidos para a próxima partida

  function carregarDados() {
    const d = store.get('dinheiro'); if (d) S.dinheiro = Number(d);
    const jj = store.get('jogosJogados'); if (jj) S.jogosJogados = Number(jj);
    const m = store.get('modosSelecionados'); if (m) try { S.modosSelecionados = JSON.parse(m); } catch (e) { /* padrão */ }
    const ec = store.get('estadiosComprados'); if (ec) try { S.estadiosComprados = JSON.parse(ec); } catch (e) { /* padrão */ }
    const es = store.get('estadioSelecionado'); if (es) S.estadioSelecionado = es;
    const arb = store.get('comprasArbitragem'); if (arb) try { S.comprasArbitragem = JSON.parse(arb); } catch (e) { /* padrão */ }
    const aud = store.get('audioEnabled'); if (aud !== null) S.audioEnabled = aud === 'true';
    if (store.get('chefaoVisto') === 'true') S.chefaoVisto = true;
  }
  function salvarDados(novoD, novasComprasArb) {
    store.set('dinheiro', novoD);
    store.set('modosSelecionados', JSON.stringify(S.modosSelecionados));
    store.set('estadiosComprados', JSON.stringify(S.estadiosComprados));
    store.set('estadioSelecionado', S.estadioSelecionado);
    if (novasComprasArb !== undefined) store.set('comprasArbitragem', JSON.stringify(novasComprasArb));
  }

  // ---------------------------------------------------------------------------------------------
  // Som (mesma lógica: um som de jogo por vez, música de fundo nas telas de menu, som do "parar")
  // Cada som tocado vai para window.__sons (tempo do relógio do app), para a montagem do vídeo.
  // ---------------------------------------------------------------------------------------------
  window.__sons = [];
  // canais: "jogo" (um som por vez: o novo corta o anterior), "parar" e "musica" (intro em loop)
  let somAtual = null, somParar = null, musica = null;
  const registrar = (ev) => window.__sons.push(Object.assign({ t: Math.round(agora) }, ev));
  function tocar(chave, canal) {
    registrar({ som: chave, canal });
    try { const s = scene.sound.add('som_' + chave); s.play(); return s; } catch (e) { return null; }
  }
  function parar(s) { if (s) { try { s.stop(); s.destroy(); } catch (e) { /* já parou */ } } }
  function tocarSom(chave) {
    if (!S.audioEnabled || !D.SONS[chave]) return;
    parar(somAtual); somAtual = null;
    somAtual = tocar(chave, 'jogo');
  }
  function pararSomAtivo() { if (somParar) registrar({ canal: 'parar', fim: true }); parar(somParar); somParar = null; }
  function tocarSomParar() { parar(somParar); somParar = tocar('parar', 'parar'); }
  function controleIntro() {
    const menu = S.tela === 'home' || S.tela === 'loja_estadios' || S.tela === 'loja_arbitragem';
    if (!S.audioEnabled || !menu) { if (musica) { parar(musica); musica = null; registrar({ canal: 'musica', fim: true }); } return; }
    if (!musica) {
      registrar({ som: 'intro', canal: 'musica', loop: true });
      try { musica = scene.sound.add('som_intro', { loop: true }); musica.play(); } catch (e) { musica = null; }
    }
  }
  function setTela(t) { S.tela = t; if (t === 'home') iniciarChuva(); controleIntro(); }

  // ---------------------------------------------------------------------------------------------
  // Regras do jogo (cópia fiel do original)
  // ---------------------------------------------------------------------------------------------
  const formatarPremio = (v) => Number(v).toLocaleString('pt-BR');
  function embaralharArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const formatTeamName = (name) => D.TEAM_NAMES_MAP[name] || name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const getEscudo = (nome) => D.TIMES[nome] || D.ESCUDOS_SELECOES[nome] || null;
  function getEstadioPreco(chave) {
    if (chave === 'campo') return 0;
    const timeId = chave.replace('estadio_', '');
    if (D.gigantes.includes(timeId)) return 2000000;
    if (D.grandes.includes(timeId)) return 1500000;
    return 1000000;
  }
  function acharPergunta(id) {
    for (const nivel of Object.keys(PERGUNTAS_DB)) { const p = PERGUNTAS_DB[nivel].find((q) => q.id === id); if (p) return p; }
    return null;
  }

  function gerarListaPerguntas(modosSelecionados) {
    const apenasEscudos = modosSelecionados.includes('escudos');
    const modosEfetivos = apenasEscudos ? ['brasileiro', 'europeu', 'copa', 'mix'] : modosSelecionados;
    const usados = new Set();
    const lista = [];
    const UPSETS = {
      facil: { prob: 0.12, niveisAlternos: ['dificil', 'muito_dificil'] },
      medio: { prob: 0.08, niveisAlternos: ['dificil', 'muito_dificil'] },
      dificil: { prob: 0.07, niveisAlternos: ['impossivel'] },
      muito_dificil: { prob: 0.07, niveisAlternos: ['impossivel'] },
    };
    const filtrarPool = (nivel) => (PERGUNTAS_DB[nivel] || []).filter((p) =>
      p.modo.some((m) => modosEfetivos.includes(m)) && !usados.has(p.id) && (!apenasEscudos || p.tipo === 'escudo'));
    for (let i = 0; i < 16; i++) {
      // automação: pergunta escolhida para esta rodada
      const forc = perguntasForcadas && perguntasForcadas[i] != null ? acharPergunta(perguntasForcadas[i]) : null;
      if (forc) { usados.add(forc.id); lista.push(forc); continue; }
      const nivelBase = DIFICULDADE_POR_PERGUNTA[i];
      const upset = UPSETS[nivelBase];
      let pool = [];
      if (upset && Math.random() < upset.prob) {
        const alt = upset.niveisAlternos[Math.floor(Math.random() * upset.niveisAlternos.length)];
        const poolAlt = filtrarPool(alt);
        if (poolAlt.length > 0) pool = poolAlt;
      }
      if (pool.length === 0) pool = filtrarPool(nivelBase);
      if (pool.length === 0) pool = (PERGUNTAS_DB[nivelBase] || []).filter((p) => !usados.has(p.id) && (!apenasEscudos || p.tipo === 'escudo'));
      if (pool.length === 0 && apenasEscudos) {
        for (const nivel2 of Object.keys(PERGUNTAS_DB)) {
          const extra = PERGUNTAS_DB[nivel2].filter((p) => p.tipo === 'escudo' && !usados.has(p.id));
          if (extra.length > 0) { pool = extra; break; }
        }
      }
      if (pool.length > 0) { const escolhida = pool[Math.floor(Math.random() * pool.length)]; usados.add(escolhida.id); lista.push(escolhida); }
    }
    return lista;
  }

  function animarFade() { fade = tween(0, 1, 400); }
  function iniciarTimer() { S.tempo = 45; timerAcc = 0; timerOn = true; }
  function pararTimer() { timerOn = false; }
  const calcularPremioErrar = (idx) => (idx === 0 ? 0 : idx === 15 ? 0 : PREMIOS[idx - 1] / 2);

  function lidarTempoEsgotado() {
    if (S.estadoResposta !== 'aguardando') return;
    S.estadoResposta = 'tempo_esgotado';
    S.premioGanho = calcularPremioErrar(S.perguntaAtual);
    S.modalAjudaConfirm = null; S.modalTorcidaVisivel = false; S.modalCartoesVisivel = false; S.modalVarVisivel = false;
    later(2000, () => setEstadoJogo('fim_derrota'));
  }
  function toggleModo(id) {
    const prev = S.modosSelecionados;
    if (id === 'escudos') { S.modosSelecionados = prev.includes('escudos') ? prev : ['escudos']; return; }
    const semEscudos = prev.filter((m) => m !== 'escudos');
    if (semEscudos.includes(id)) { S.modosSelecionados = semEscudos.length === 1 ? semEscudos : semEscudos.filter((m) => m !== id); return; }
    S.modosSelecionados = [...semEscudos, id];
  }

  function iniciarJogo() {
    const lista = gerarListaPerguntas(S.modosSelecionados.length > 0 ? S.modosSelecionados : ['mix']);
    perguntasForcadas = null;
    Object.assign(S, { perguntas: lista, perguntaAtual: 0, estadoJogo: 'jogando', estadoResposta: 'aguardando',
      alternativaEliminada: [], respostaSelecionada: null, premioGanho: 0, tempo: 45, perguntasPuladas: [] });
    const ajudasBase = ['var', 'torcedores', 'cartoes'];
    const compras = S.comprasArbitragem.filter((a) => a !== 'driblar');
    const dribles = S.comprasArbitragem.filter((a) => a === 'driblar').length;
    S.ajudasDisponiveis = [...ajudasBase, ...compras];
    S.qtdDriblar = 2 + dribles;
    S.comprasArbitragem = [];
    salvarDados(S.dinheiro, []);
    Object.assign(S, { confirmaAnswer: null, confirmarParar: false, erroAtual: null, modalAjudaConfirm: null,
      modalVarVisivel: false, modalTorcidaVisivel: false, modalCartoesVisivel: false, cartoesOpcoes: [],
      cartaoRevelado: null, modalMilhaoVisivel: false });
    setTela('jogo');
    S.modalModosVisivel = false;
    S.showStartScreen = true;
    tocarSom('apito');
    later(2000, () => { S.showStartScreen = false; animarFade(); iniciarTimer(); tocarSom('1000'); });
  }

  function responder(idx) { if (S.estadoResposta !== 'aguardando') return; pararTimer(); S.confirmaAnswer = idx; }

  function efetivarResposta(idx) {
    const pq = S.perguntas[S.perguntaAtual];
    S.respostaSelecionada = idx;
    if (idx === pq.correta) {
      S.estadoResposta = 'correta';
      animarGol();
      later(2000, () => avancar());
    } else {
      S.estadoResposta = 'errada';
      S.premioGanho = calcularPremioErrar(S.perguntaAtual);
      const possiveisErros = [{ tipo: 'trave', msg: 'Na Trave!' }, { tipo: 'pra_fora', msg: 'Pra Fora!' }];
      animarErro(possiveisErros[Math.floor(Math.random() * possiveisErros.length)]);
      later(3000, () => setEstadoJogo('fim_derrota'));
    }
  }
  function animarGol() {
    S.showGolAnim = true; S.faseGol = 0;
    tocarSom('gol');
    later(400, () => { S.faseGol = 1; golT0 = agora; });
    later(2000, () => { S.showGolAnim = false; });
  }
  function animarErro(erro) {
    S.erroAtual = erro; S.showErroAnim = true; S.faseGol = 0;
    tocarSom('errou');
    later(400, () => { S.faseGol = 1; golT0 = agora; });
    later(2000, () => { S.showErroAnim = false; });
  }
  function comprarEstadio(chave, preco) {
    if (S.estadiosComprados.includes(chave)) return;
    if (S.dinheiro >= preco) {
      S.dinheiro -= preco; S.estadiosComprados = [...S.estadiosComprados, chave]; salvarDados(S.dinheiro);
    } else alerta('Saldo insuficiente!');
  }
  function selecionarEstadio(chave) {
    if (S.estadiosComprados.includes(chave) || hasUnlockedStadiums) { S.estadioSelecionado = chave; store.set('estadioSelecionado', chave); }
  }
  function comprarArbitragem(idAjuda, preco) {
    if (S.dinheiro >= preco) {
      S.dinheiro -= preco; S.comprasArbitragem = [...S.comprasArbitragem, idAjuda]; salvarDados(S.dinheiro, S.comprasArbitragem);
    } else alerta('Saldo insuficiente!');
  }
  function avancarPara(proxima) {
    S.alternativaEliminada = []; S.respostaSelecionada = null; S.estadoResposta = 'aguardando';
    S.perguntaAtual = proxima; animarFade(); iniciarTimer(); tocarSom(String(PREMIOS[proxima]));
  }
  function avancar() {
    const proxima = S.perguntaAtual + 1;
    if (proxima >= 16) { S.premioGanho = 1000000; setEstadoJogo('fim_vitoria'); }
    else if (proxima === 15) S.modalMilhaoVisivel = true;
    else avancarPara(proxima);           // no original, 50k -> 100k tem intersticial; aqui não há anúncio
  }
  function desistir() {
    pararTimer();
    S.premioGanho = S.perguntaAtual > 0 ? PREMIOS[S.perguntaAtual - 1] : 0;
    setEstadoJogo('fim_desistencia');
  }
  function finalizarJogo(premioFinal) {
    S.dinheiro += premioFinal; salvarDados(S.dinheiro);
    S.jogosJogados += 1; store.set('jogosJogados', S.jogosJogados);
  }
  function setEstadoJogo(v) {
    if (S.estadoJogo === v) return;
    S.estadoJogo = v;
    if (v === 'fim_vitoria') { finalizarJogo(S.premioGanho); tocarSom('parabens'); tocarSom('grana'); }
    else if (v === 'fim_derrota' || v === 'fim_desistencia') { finalizarJogo(S.premioGanho); tocarSom('grana'); }
  }
  function usarAjuda(id) {
    const contagem = id === 'driblar' ? S.qtdDriblar : S.ajudasDisponiveis.filter((a) => a === id).length;
    if (contagem <= 0) return;
    pararTimer();
    S.modalAjudaConfirm = id;
  }
  function confirmarAjuda(id) {
    S.modalAjudaConfirm = null;
    tocarSom(id);
    if (id === 'driblar') {
      S.qtdDriblar = Math.max(0, S.qtdDriblar - 1);
      const pq = S.perguntas[S.perguntaAtual];
      const puladasAntes = S.perguntasPuladas;
      S.perguntasPuladas = [...puladasAntes, pq.id];
      const novas = [...S.perguntas];
      const nivel = DIFICULDADE_POR_PERGUNTA[S.perguntaAtual];
      const todosUsados = [...novas.map((p) => p.id), ...puladasAntes, pq.id];
      const apenasEscudos = S.modosSelecionados.includes('escudos');
      const modosEfetivos = apenasEscudos ? ['brasileiro', 'europeu', 'copa', 'mix'] : S.modosSelecionados;
      let pool = PERGUNTAS_DB[nivel].filter((p) => p.modo.some((m) => modosEfetivos.includes(m)) && !todosUsados.includes(p.id) && (!apenasEscudos || p.tipo === 'escudo'));
      if (pool.length === 0) pool = PERGUNTAS_DB[nivel].filter((p) => !todosUsados.includes(p.id) && (!apenasEscudos || p.tipo === 'escudo'));
      if (pool.length === 0 && apenasEscudos) {
        for (const nivel2 of Object.keys(PERGUNTAS_DB)) {
          const extra = PERGUNTAS_DB[nivel2].filter((p) => p.tipo === 'escudo' && !todosUsados.includes(p.id));
          if (extra.length > 0) { pool = extra; break; }
        }
      }
      if (pool.length > 0) novas[S.perguntaAtual] = pool[Math.floor(Math.random() * pool.length)];
      S.perguntas = novas;
      S.alternativaEliminada = []; S.respostaSelecionada = null; S.estadoResposta = 'aguardando';
      iniciarTimer();
    }
    if (id === 'cartoes' || id === 'var' || id === 'torcedores') {
      const i = S.ajudasDisponiveis.indexOf(id);
      if (i !== -1) { const a = [...S.ajudasDisponiveis]; a.splice(i, 1); S.ajudasDisponiveis = a; }
      if (id === 'cartoes') { S.cartaoRevelado = null; S.modalCartoesVisivel = true; iniciarTimer(); }
      if (id === 'var') { S.modalVarVisivel = true; varScan = tween(-300, 0, 800); iniciarTimer(); }
      if (id === 'torcedores') {
        const pq = S.perguntas[S.perguntaAtual];
        const errar = Math.random() < 0.25;
        const v = [0, 0, 0, 0];
        if (!errar) {
          v[pq.correta] = 35 + Math.floor(Math.random() * 31);
          const w = [0, 1, 2, 3].filter((x) => x !== pq.correta);
          v[w[0]] = 15 + Math.floor(Math.random() * 15); v[w[1]] = 5 + Math.floor(Math.random() * 15); v[w[2]] = 5 + Math.floor(Math.random() * 10);
        } else {
          const w = embaralharArray([0, 1, 2, 3].filter((x) => x !== pq.correta));
          v[w[0]] = 35 + Math.floor(Math.random() * 10);
          v[pq.correta] = v[w[0]] - (2 + Math.floor(Math.random() * 5));
          const rest = 100 - v[w[0]] - v[pq.correta];
          v[w[1]] = Math.floor(rest * 0.6); v[w[2]] = rest - v[w[1]];
        }
        const total = v.reduce((a, b) => a + b, 0);
        const n = v.map((x) => Math.round((x / total) * 100));
        n[pq.correta] += 100 - n.reduce((a, b) => a + b, 0);
        S.torcidaVotos = n; S.modalTorcidaVisivel = true; iniciarTimer();
      }
    }
  }
  function revelarCartao(i) {
    if (S.cartaoRevelado !== null) return;
    const pq = S.perguntas[S.perguntaAtual];
    const possibilidades = embaralharArray([0, 1, 2, 3]);
    S.cartoesOpcoes = possibilidades;
    const qtd = possibilidades[i];
    S.cartaoRevelado = qtd;
    if (qtd > 0) S.alternativaEliminada = embaralharArray([0, 1, 2, 3].filter((x) => x !== pq.correta)).slice(0, qtd);
  }
  function aceitarMilhao() { S.modalMilhaoVisivel = false; avancarPara(15); }
  function recusarMilhao() { S.modalMilhaoVisivel = false; S.premioGanho = 500000; setEstadoJogo('fim_desistencia'); }

  // alert() do Android: caixa simples com OK
  let alertaTxt = null;
  function alerta(txt) { alertaTxt = txt; }

  // ---------------------------------------------------------------------------------------------
  // Chuva de itens da home (RainAnimation)
  // ---------------------------------------------------------------------------------------------
  let chuva = [];
  function iniciarChuva() {
    const items = ['💸', '🪙', '⚽', '🏆'];
    chuva = Array.from({ length: 20 }).map(() => ({
      emoji: items[Math.floor(Math.random() * items.length)], x: Math.random() * W,
      duration: 3000 + Math.random() * 4000, delay: Math.random() * 5000,
      scale: 0.5 + Math.random() * 1, opacity: 0.1 + Math.random() * 0.3, t0: agora,
    }));
  }
  function desenharChuva() {
    for (const g of chuva) {
      let p = (agora - g.t0 - g.delay) / g.duration;
      if (p >= 1) { g.t0 = agora; g.delay = Math.random() * 2000; p = (agora - g.t0 - g.delay) / g.duration; }
      const y = p <= 0 ? -100 : -100 + (H + 200) * p;
      ctx.save();
      ctx.globalAlpha *= g.opacity;
      const w = 30 * EMO_AV, h = 30 * LH;
      ctx.translate(g.x + w / 2, y + h / 2); ctx.scale(g.scale, g.scale);
      emoji(g.emoji, 30, 0, 0);
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Desenho: texto, caixas, ícones, imagens (unidades dp)
  // ---------------------------------------------------------------------------------------------
  let ctx = null;
  const LH = 1.172, ASC = 0.928;             // métricas do Roboto (altura de linha padrão e ascendente)
  const FAMILIA = 'Roboto, "Segoe UI Symbol", sans-serif';
  // Emojis: desenhados como imagem (Noto, a mesma arte do Android), com as medidas da fonte do
  // Android: avanço de 1,25 em, desenho de 1,17 em, topo 0,93 em acima da linha de base.
  const EMO_RE = /(\p{Regional_Indicator}{2}|\p{Extended_Pictographic}️?)/u;
  const EMO_SPLIT = /(\p{Regional_Indicator}{2}|\p{Extended_Pictographic}️?)/gu;
  const EMO_AV = 1.25, EMO_SZ = 1.17, EMO_TOP = 0.93;
  const codigoEmoji = (e) => [...e].map((c) => c.codePointAt(0)).filter((c) => c !== 0xfe0f).map((c) => c.toString(16)).join('_');
  const imgEmoji = (e) => imagem('emo_' + codigoEmoji(e));
  const partesEmoji = (str) => String(str).split(EMO_SPLIT).filter((p) => p !== '');
  const fonte = (size, peso = 700, italic = false) => `${italic ? 'italic ' : ''}${peso} ${size}px ${FAMILIA}`;
  const IONS = {}, MDI = {};
  // emojis que aparecem no app (arquivos em video/emoji, da Noto Emoji)
  const EMOJIS_USADOS = ['1f4b0', '1f1e7_1f1f7', '1f30d', '1f6e1', '2699', '1f48e', '1f3df', '2696', '2709', '1f389',
    '274c', '1f3c6', '1f3f3', '1f4fa', '23ea', '1f7e8', '1f7e5', '26a0', '1f4b8', '1fa99', '26bd'];

  function prepTexto(o) {
    ctx.font = fonte(o.size || 14, o.w != null ? o.w : 700, o.italic);
    ctx.letterSpacing = (o.ls || 0) + 'px';
  }
  function larg(str, o) {
    if (!EMO_RE.test(str)) { prepTexto(o); return ctx.measureText(str).width; }
    const size = o.size || 14;
    return partesEmoji(str).reduce((a, p) => a + (EMO_RE.test(p) ? size * EMO_AV : (prepTexto(o), ctx.measureText(p).width)), 0);
  }
  // uma linha; y = topo da caixa da linha
  function texto(str, x, y, o) {
    prepTexto(o);
    const size = o.size || 14, lh = o.lh || size * LH;
    ctx.fillStyle = o.color || '#FFF';
    ctx.textAlign = o.align || 'left';
    ctx.textBaseline = 'alphabetic';
    let tx = x;
    // letterSpacing acrescenta espaço depois da última letra: compensa no alinhamento
    if (o.ls && o.align === 'center') tx += o.ls / 2;
    if (o.ls && o.align === 'right') tx += o.ls;
    const base = y + (lh - size * LH) / 2 + size * ASC;
    if (!EMO_RE.test(str)) { ctx.fillText(str, tx, base); ctx.letterSpacing = '0px'; return; }
    // com emoji: desenha pedaço a pedaço a partir da esquerda
    const total = larg(str, o);
    let cx = o.align === 'center' ? tx - total / 2 : o.align === 'right' ? tx - total : tx;
    for (const p of partesEmoji(str)) {
      if (EMO_RE.test(p)) {
        const im = imgEmoji(p), s = size * EMO_SZ;
        if (im) ctx.drawImage(im, cx + (size * EMO_AV - s) / 2, base - size * EMO_TOP, s, s);
        cx += size * EMO_AV;
      } else {
        prepTexto(o); ctx.fillStyle = o.color || '#FFF'; ctx.textAlign = 'left';
        ctx.fillText(p, cx, base); cx += ctx.measureText(p).width;
      }
    }
    ctx.letterSpacing = '0px';
  }
  function quebrar(str, maxW, o) {
    const linhas = [];
    for (const par of String(str).split('\n')) {
      const palavras = par.split(' ');
      let atual = '';
      for (const p of palavras) {
        const teste = atual ? atual + ' ' + p : p;
        if (larg(teste, o) <= maxW || !atual) atual = teste;
        else { linhas.push(atual); atual = p; }
      }
      linhas.push(atual);
    }
    return linhas;
  }
  // bloco de texto quebrado; devolve a altura
  function paragrafo(str, x, y, maxW, o) {
    const lh = o.lh || (o.size || 14) * LH;
    const linhas = quebrar(str, maxW, o);
    linhas.forEach((l, i) => texto(l, o.align === 'center' ? x + maxW / 2 : x, y + i * lh, o));
    return linhas.length * lh;
  }
  const alturaParagrafo = (str, maxW, o) => quebrar(str, maxW, o).length * (o.lh || (o.size || 14) * LH);

  // texto rico: partes [{t, ...estilo}], quebra por palavra, centralizado
  function rico(partes, x, y, maxW, base, desenhar = true) {
    const lh = base.lh || base.size * LH;
    const palavras = [];
    for (const pt of partes) {
      const st = Object.assign({}, base, pt);
      String(pt.t).split(/(\n| )/).forEach((tok) => { if (tok !== '') palavras.push({ t: tok, st }); });
    }
    const linhas = [[]]; let w = 0;
    for (const p of palavras) {
      if (p.t === '\n') { linhas.push([]); w = 0; continue; }
      const pw = larg(p.t, p.st);
      if (p.t !== ' ' && w + pw > maxW && linhas[linhas.length - 1].length) {
        const l = linhas[linhas.length - 1]; while (l.length && l[l.length - 1].t === ' ') l.pop();
        linhas.push([]); w = 0;
      }
      if (p.t === ' ' && linhas[linhas.length - 1].length === 0) continue;
      linhas[linhas.length - 1].push(Object.assign(p, { w: pw })); w += pw;
    }
    if (desenhar) {
      linhas.forEach((l, i) => {
        const tot = l.reduce((a, p) => a + p.w, 0);
        let cx = x + (maxW - tot) / 2;
        for (const p of l) { texto(p.t, cx, y + i * lh, Object.assign({}, p.st, { align: 'left' })); cx += p.w; }
      });
    }
    return linhas.length * lh;
  }

  function rr(x, y, w, h, r) {
    r = Math.max(0, Math.min(r || 0, w / 2, h / 2));
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
  }
  // caixa com fundo e borda por dentro (como no React Native)
  function caixa(x, y, w, h, o) {
    const r = o.r || 0;
    if (o.sombra) {
      ctx.save(); ctx.shadowColor = o.sombra.cor || 'rgba(0,0,0,0.3)'; ctx.shadowBlur = (o.sombra.blur || 3) * DPR;
      ctx.shadowOffsetY = (o.sombra.dy || 2) * DPR; rr(x, y, w, h, r); ctx.fillStyle = o.bg || '#000'; ctx.fill(); ctx.restore();
    }
    if (o.bg) { rr(x, y, w, h, r); ctx.fillStyle = o.bg; ctx.fill(); }
    if (o.bw && o.bc && o.bc !== 'transparent') {
      const b = o.bw;
      rr(x + b / 2, y + b / 2, w - b, h - b, Math.max(0, r - b / 2));
      ctx.lineWidth = b; ctx.strokeStyle = o.bc; ctx.stroke();
    }
  }
  function gradV(x, y, w, h, cores, r) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    cores.forEach((c, i) => g.addColorStop(i / (cores.length - 1), c));
    ctx.fillStyle = g;
    if (r) { rr(x, y, w, h, r); ctx.fill(); } else ctx.fillRect(x, y, w, h);
  }
  function icone(nome, size, cx, cy, cor, familia) {
    const mapa = familia === 'mdi' ? MDI : IONS;
    const cp = mapa[nome];
    if (!cp) return;
    ctx.font = `${size}px ${familia === 'mdi' ? 'MaterialCommunityIcons' : 'Ionicons'}`;
    ctx.fillStyle = cor; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const ch = String.fromCodePoint(cp);
    const m = ctx.measureText(ch);
    // centra o desenho do glifo no ponto (a caixa do ícone no RN é size x size)
    const dy = (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
    const dx = (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2;
    ctx.fillText(ch, cx + dx, cy + dy);
  }
  // emoji/texto de uma linha centrado num ponto
  function emoji(str, size, cx, cy) { texto(str, cx, cy - size * LH / 2, { size, w: 400, align: 'center' }); }

  // imagens: carregadas sob demanda (estádios e escudos são muitos)
  const pedidas = new Set();
  function imagem(chave, url) {
    if (scene.textures.exists(chave)) return scene.textures.get(chave).getSourceImage();
    if (url && !pedidas.has(chave)) { pedidas.add(chave); scene.load.image(chave, url); scene.load.start(); }
    return null;
  }
  function desenharImagem(im, x, y, w, h, modo) {
    if (!im) return;
    const iw = im.width, ih = im.height;
    if (modo === 'stretch') { ctx.drawImage(im, x, y, w, h); return; }
    const k = modo === 'cover' ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
    const dw = iw * k, dh = ih * k;
    if (modo === 'cover') {
      ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
      ctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh); ctx.restore();
    } else ctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }
  const imgAsset = (chave) => imagem(chave);
  const imgEstadio = (chave) => imagem('est_' + chave, D.ESTADIOS[chave]);
  const imgEscudo = (nome) => { const u = getEscudo(nome); return u ? imagem('esc_' + nome, u) : null; };

  // ---------------------------------------------------------------------------------------------
  // Toques: regiões registradas a cada quadro, na ordem de desenho (a última por cima)
  // ---------------------------------------------------------------------------------------------
  let hits = [], hitsQuadro = [];
  let pressionado = null;              // { id, t }
  let soltos = {};                     // id -> instante em que soltou (volta da opacidade)
  let toques = [];                     // indicador de toque opcional (vídeo)
  let mostrarToques = false;
  function toque(id, x, y, w, h, onPress, o = {}) {
    const desab = !!o.disabled;
    hits.push({ id, x, y, w, h, onPress: desab ? null : onPress, tipo: 'toque', clip: clipAtual() });
    // TouchableOpacity: opacidade activeOpacity enquanto pressionado, volta em 150 ms
    const ao = o.ao != null ? o.ao : 0.2;
    if (pressionado && pressionado.id === id && !desab) return ao;
    if (soltos[id] != null) { const p = clamp01((agora - soltos[id]) / 150); if (p >= 1) delete soltos[id]; return ao + (1 - ao) * p; }
    return 1;
  }
  function bloqueio() { hits.push({ id: '__bloqueio', x: -1e4, y: -1e4, w: 3e4, h: 3e4, tipo: 'bloqueio', clip: null }); }
  function comOpacidade(a, fn) { if (a >= 1) { fn(); return; } ctx.save(); ctx.globalAlpha *= a; fn(); ctx.restore(); }

  // recortes ativos (ScrollView): um toque fora do recorte não vale
  const pilhaClip = [];
  const clipAtual = () => (pilhaClip.length ? pilhaClip[pilhaClip.length - 1] : null);

  // ScrollView: arrasto com o dedo; deslocamento guardado por id
  const rolagens = {};                 // id -> { v, max, anim }
  function rolagem(id, x, y, w, h, conteudo, eixo, desenhar) {
    const r = rolagens[id] || (rolagens[id] = { v: 0, max: 0, anim: null });
    r.max = Math.max(0, conteudo - (eixo === 'x' ? w : h));
    if (r.anim) { r.v = valor(r.anim); if (agora - r.anim.t0 >= r.anim.dur) r.anim = null; }
    r.v = Math.max(0, Math.min(r.max, r.v));
    hits.push({ id: 'scroll:' + id, x, y, w, h, tipo: 'rolagem', eixo, clip: clipAtual() });
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const pai = clipAtual();
    const clip = pai ? interseccao(pai, { x, y, w, h }) : { x, y, w, h };
    pilhaClip.push(clip);
    const dx = eixo === 'x' ? -r.v : 0, dy = eixo === 'x' ? 0 : -r.v;
    ctx.translate(dx, dy);
    desenhar(dx, dy);
    ctx.restore();
    pilhaClip.pop();
  }
  function interseccao(a, b) {
    const x = Math.max(a.x, b.x), y = Math.max(a.y, b.y);
    return { x, y, w: Math.max(0, Math.min(a.x + a.w, b.x + b.w) - x), h: Math.max(0, Math.min(a.y + a.h, b.y + b.h) - y) };
  }
  // região de toque dentro de uma rolagem: registra já no sistema da tela
  let deslocRol = { x: 0, y: 0 };
  function toqueRol(id, x, y, w, h, onPress, o) { return toque(id, x + deslocRol.x, y + deslocRol.y, w, h, onPress, o); }

  function dentro(hh, px, py) {
    if (px < hh.x || py < hh.y || px > hh.x + hh.w || py > hh.y + hh.h) return false;
    if (hh.clip && (px < hh.clip.x || py < hh.clip.y || px > hh.clip.x + hh.clip.w || py > hh.clip.y + hh.clip.h)) return false;
    return true;
  }
  let gesto = null;                    // { x0, y0, toque, rolagem, v0, arrastando }
  function aoTocar(px, py) {
    let alvo = null, rol = null;
    for (let i = hitsQuadro.length - 1; i >= 0; i--) {
      const hh = hitsQuadro[i];
      if (!dentro(hh, px, py)) continue;
      if (hh.tipo === 'bloqueio') break;
      if (hh.tipo === 'toque' && !alvo) { alvo = hh; continue; }
      if (hh.tipo === 'rolagem' && !rol) { rol = hh; break; }
    }
    gesto = { x0: px, y0: py, toque: alvo, rolagem: rol, v0: rol ? rolagens[rol.id.slice(7)].v : 0, arrastando: false };
    if (alvo && alvo.onPress) pressionado = { id: alvo.id, t: agora };
    if (mostrarToques) toques.push({ x: px, y: py, t: agora });
  }
  function aoMover(px, py) {
    if (!gesto) return;
    const d = gesto.rolagem && gesto.rolagem.eixo === 'x' ? px - gesto.x0 : py - gesto.y0;
    if (!gesto.arrastando && gesto.rolagem && Math.abs(d) > 8) { gesto.arrastando = true; if (pressionado) { soltos[pressionado.id] = agora; pressionado = null; } }
    if (gesto.arrastando) { const r = rolagens[gesto.rolagem.id.slice(7)]; r.anim = null; r.v = Math.max(0, Math.min(r.max, gesto.v0 - d)); }
  }
  function aoSoltar(px, py) {
    if (!gesto) return;
    const g = gesto; gesto = null;
    if (pressionado) { soltos[pressionado.id] = agora; pressionado = null; }
    if (!g.arrastando && g.toque && g.toque.onPress && dentro(g.toque, px, py)) g.toque.onPress();
  }

  // ---------------------------------------------------------------------------------------------
  // Modais: fade (220 ms) ou slide (300 ms) na entrada e na saída, como o Modal do Android
  // ---------------------------------------------------------------------------------------------
  const modais = {};
  function modal(chave, visivel, tipo, desenhar, comSaida = true) {
    const m = modais[chave] || (modais[chave] = { vis: false, t: -1e9 });
    if (visivel !== m.vis) { m.vis = visivel; m.t = agora; }
    const dur = tipo === 'slide' ? 300 : 220;
    let p = clamp01((agora - m.t) / dur);
    if (!m.vis) { if (!comSaida || p >= 1) return; p = 1 - p; }
    if (m.vis) bloqueio();
    ctx.save();
    if (tipo === 'slide') ctx.translate(0, H * (1 - inOutEase(p)));
    else ctx.globalAlpha *= p;
    desenhar(m.vis);
    ctx.restore();
  }

  // cartão padrão (fimOverlay + fimCard): itens em coluna, centralizados
  // item: { h, mt, mb, draw(x, y, w) }
  function cartao(itens, o = {}) {
    ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 0, W, H);
    const cw = Math.min(W - 40, o.maxW || 350);
    const pad = 30, bw = 2, gap = o.gap || 0;
    const iw = cw - 2 * pad - 2 * bw;
    let h = 2 * pad + 2 * bw;
    itens.forEach((it, i) => { h += (it.mt || 0) + it.h + (it.mb || 0) + (i ? gap : 0); });
    const x = (W - cw) / 2, y = (H - h) / 2;
    caixa(x, y, cw, h, { bg: '#0B5D45', r: 24, bw: 2, bc: COR_ACENTO });
    if (o.clip) { ctx.save(); rr(x, y, cw, h, 24); ctx.clip(); }
    let cy = y + bw + pad;
    itens.forEach((it, i) => { cy += (i ? gap : 0) + (it.mt || 0); it.draw(x + bw + pad, cy, iw); cy += it.h + (it.mb || 0); });
    if (o.clip) ctx.restore();
  }
  // itens prontos
  const itTitulo = (str, iw, o = {}) => {
    const st = Object.assign({ size: 26, align: 'center' }, o);
    const h = alturaParagrafo(str, iw, st);
    return { h, mb: o.mb != null ? o.mb : 10, draw: (x, y, w) => paragrafo(str, x, y, w, st) };
  };
  const itTexto = (str, iw, o) => {
    const st = Object.assign({ align: 'center', w: 400 }, o);
    return { h: alturaParagrafo(str, iw, st), mt: o.mt, mb: o.mb, draw: (x, y, w) => paragrafo(str, x, y, w, st) };
  };
  // botão fimBtnJogarNovamente
  const H_BTN = 16 * 2 + 16 * LH;
  function btnFim(id, x, y, w, rotulo, onPress, o = {}) {
    const a = toque(id, x, y, w, H_BTN, onPress);
    comOpacidade(a, () => {
      caixa(x, y, w, H_BTN, { bg: o.bg || COR_ACENTO, r: 12 });
      texto(rotulo, x + w / 2, y + 16, { size: 16, color: o.color || '#000', align: 'center', ls: 1 });
    });
  }
  const itBotao = (id, rotulo, onPress, o = {}) => ({ h: H_BTN, mt: o.mt, mb: o.mb, draw: (x, y, w) => btnFim(id, x, y, w, rotulo, onPress, o) });
  const itSimNao = (idBase, nao, sim, o = {}) => ({ h: H_BTN, mt: o.mt, draw: (x, y, w) => {
    const bw = (w - 10) / 2;
    btnFim(idBase + '.nao', x, y, bw, 'NÃO', nao, { bg: '#555', color: '#FFF' });
    btnFim(idBase + '.sim', x + bw + 10, y, bw, 'SIM', sim);
  } });
  const larguraCartao = () => Math.min(W - 40, 350) - 64;

  // ---------------------------------------------------------------------------------------------
  // TELA: HOME
  // ---------------------------------------------------------------------------------------------
  function telaHome() {
    gradV(0, 0, W, H, ['#0F3830', '#0a4232', '#0F3830']);
    desenharChuva();

    // pílula de saldo
    {
      const txt = '$ ' + formatarPremio(S.dinheiro);
      const ew = 14 * EMO_AV;
      const tw = larg(txt, { size: 12 });
      const h = 12 + 14 * LH + 2, w = 24 + ew + 5 + tw + 2;
      caixa(15, 20, w, h, { bg: 'rgba(15, 56, 48, 0.9)', r: 20, bw: 1, bc: COR_ACENTO });
      emoji('💰', 14, 15 + 13 + ew / 2, 20 + h / 2);
      texto(txt, 15 + 13 + ew + 5, 20 + (h - 12 * LH) / 2, { size: 12 });
    }
    // configurações e premium
    {
      const pw = 20 + 16 + 4 + larg('PREMIUM', { size: 10 }) + 2, ph = 12 + 16 + 2;
      const colW = Math.max(28, pw), x0 = W - 20 - colW, cx = x0 + colW / 2;
      let a = toque('home.config', cx - 14, 20, 28, 28, () => { S.configVisivel = true; });
      comOpacidade(a, () => icone('settings-sharp', 28, cx, 20 + 14, '#FFF'));
      const py = 20 + 28 + 12;
      a = toque('home.premium', cx - pw / 2, py, pw, ph, () => { S.premiumVisivel = true; });
      comOpacidade(a, () => {
        caixa(cx - pw / 2, py, pw, ph, { bg: 'rgba(251,192,45,0.2)', r: 20, bw: 1, bc: COR_ACENTO });
        icone('diamond-outline', 16, cx - pw / 2 + 11 + 8, py + ph / 2, COR_ACENTO);
        texto('PREMIUM', cx - pw / 2 + 11 + 16 + 4, py + (ph - 10 * LH) / 2, { size: 10, color: COR_ACENTO });
      });
    }
    // bloco central
    const cw = Math.min(W - 40, 400), cx = W / 2, x0 = cx - cw / 2;
    const hBtn = 14 * 2 + 24 + 2, hJogar = 18 * 2 + 24 * LH;
    const total = 220 + 30 + 15 + hBtn + 15 + hBtn + 15 + hBtn + 15 + 20 + hJogar;
    let y = (H - total) / 2;
    desenharImagem(imgAsset('logo'), cx - 170, y, 340, 220, 'contain');
    y += 220 + 30 + 15;
    const botao = (id, ic, fam, rotulo, bg, onPress) => {
      const a = toque(id, x0, y, cw, hBtn, onPress);
      comOpacidade(a, () => {
        caixa(x0, y, cw, hBtn, { bg, r: 12, bw: 1, bc: '#138C61' });
        const tw = larg(rotulo, { size: 16, ls: 1 }) - 1, conteudo = 24 + 10 + tw;
        const sx = cx - conteudo / 2;
        icone(ic, 24, sx + 12, y + hBtn / 2, '#FFF', fam);
        texto(rotulo, sx + 34, y + (hBtn - 16 * LH) / 2, { size: 16, ls: 1 });
      });
      y += hBtn + 15;
    };
    botao('home.temas', 'checkbox-outline', 'ion', 'ESCOLHER TEMAS', '#084f3c', () => { S.modalModosVisivel = true; });
    botao('home.lojaEstadios', 'storefront-outline', 'ion', 'LOJA DE ESTÁDIOS', '#1E403C', () => {
      setTela('loja_estadios');
      if (!S.chefaoVisto) { S.chefaoVisto = true; S.modalCartaChefaoVisivel = true; store.set('chefaoVisto', 'true'); }
    });
    botao('home.lojaArbitragem', 'whistle', 'mdi', 'LOJA DA ARBITRAGEM', '#1E403C', () => setTela('loja_arbitragem'));
    y += 20;
    const a = toque('home.jogar', x0, y, cw, hJogar, iniciarJogo, { ao: 0.8 });
    comOpacidade(a, () => {
      gradV(x0, y, cw, hJogar, ['#FBC02D', '#F57F17'], 30);
      texto('JOGAR', cx, y + 18, { size: 24, color: '#000', align: 'center', ls: 2 });
    });

    modalConfig();
    modalPremium();
    modalModos();
  }

  function modalConfig() {
    modal('config', S.configVisivel, 'fade', () => {
      const iw = larguraCartao();
      const hLin = 15 * 2 + 8 * 2 + 14 * LH + 2;
      cartao([
        itTitulo('⚙️ Configurações', iw),
        { h: hLin, mt: 20, mb: 20, draw: (x, y, w) => {
          caixa(x, y, w, hLin, { bg: 'rgba(0,0,0,0.3)', r: 10, bw: 1, bc: '#555' });
          texto('Som do Jogo', x + 16, y + (hLin - 16 * LH) / 2, { size: 16 });
          const rot = S.audioEnabled ? 'LIGADO' : 'DESLIGADO', tw = larg(rot, { size: 14 });
          const pw = tw + 30, ph = 16 + 14 * LH, px = x + w - 16 - pw, py = y + (hLin - ph) / 2;
          const a = toque('config.som', px, py, pw, ph, () => { S.audioEnabled = !S.audioEnabled; store.set('audioEnabled', S.audioEnabled); controleIntro(); });
          comOpacidade(a, () => {
            caixa(px, py, pw, ph, { bg: S.audioEnabled ? COR_ACENTO : '#555', r: 20 });
            texto(rot, px + 15, py + 8, { size: 14, color: S.audioEnabled ? '#000' : '#FFF' });
          });
        } },
        itBotao('config.fechar', 'FECHAR', () => { S.configVisivel = false; }),
      ]);
    });
  }
  function modalPremium() {
    modal('premium', S.premiumVisivel, 'fade', () => {
      const iw = larguraCartao();
      const hRest = 12 * 2 + 24 + 2;
      cartao([
        itTitulo('💎 Premium', iw),
        { h: hRest, mb: 20, draw: (x, y, w) => {
          const a = toque('premium.restaurar', x, y, w, hRest, () => alerta('Nenhuma compra anterior foi encontrada para restaurar.'));
          comOpacidade(a, () => {
            caixa(x, y, w, hRest, { bg: 'rgba(255,255,255,0.1)', r: 10, bw: 1, bc: '#555' });
            const rot = 'Restaurar Compras', tw = larg(rot, { size: 16 }), c = 24 + 8 + tw, sx = x + (w - c) / 2;
            icone('refresh-circle-outline', 24, sx + 12, y + hRest / 2, '#FFF');
            texto(rot, sx + 32, y + (hRest - 16 * LH) / 2, { size: 16 });
          });
        } },
        itBotao('premium.fechar', 'FECHAR', () => { S.premiumVisivel = false; }),
      ]);
    });
  }

  function alturaModo(modo) {
    const ativo = S.modosSelecionados.includes(modo.id);
    const escudosAtivo = S.modosSelecionados.includes('escudos');
    const desativado = modo.id !== 'escudos' && escudosAtivo;
    const b = (modo.id === 'copa' && !desativado) || modo.id === 'escudos' ? 2 : 1;
    const temSub = (modo.id === 'copa' && !desativado) || modo.id === 'escudos';
    const conteudo = Math.max(modo.image ? 28 : 24 * LH, 16 * LH + (temSub ? 10 * LH : 0), 24);
    return { h: 30 + 2 * b + conteudo, b, ativo, desativado, temSub };
  }
  function modalModos() {
    modal('modos', S.modalModosVisivel, 'slide', () => {
      ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 0, W, H);
      const bw = Math.min((W - 40) * 0.9, 400), pad = 20;
      const iw = bw - 2 * pad - 4;
      const hHead = Math.max(18 * LH + 4 + 12 * LH, 28);
      const itens = MODOS.map(alturaModo);
      const hLista = Math.min(400, itens.reduce((a, it) => a + it.h + 10, 0));
      const hOk = 15 * 2 + 16 * LH;
      const h = 4 + 2 * pad + hHead + 15 + 1 + 15 + hLista + 15 + hOk + 5;
      const x = (W - bw) / 2, y0 = (H - h) / 2;
      caixa(x, y0, bw, h, { bg: '#0F3830', r: 20, bw: 2, bc: COR_ACENTO });
      const ix = x + 2 + pad;
      let y = y0 + 2 + pad;
      texto('MODOS DE JOGO', ix, y + (hHead - (18 * LH + 4 + 12 * LH)) / 2, { size: 18 });
      texto('Escolha um ou mais!', ix, y + (hHead - (18 * LH + 4 + 12 * LH)) / 2 + 18 * LH + 4, { size: 12, color: '#FBC02D', w: 400 });
      const a = toque('modos.fechar', ix + iw - 28, y + (hHead - 28) / 2, 28, 28, () => { S.modalModosVisivel = false; });
      comOpacidade(a, () => icone('close', 28, ix + iw - 14, y + hHead / 2, '#fff'));
      y += hHead + 15;
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(ix, y, iw, 1);
      y += 1 + 15;
      rolagem('modos', ix, y, iw, hLista, itens.reduce((a2, it) => a2 + it.h + 10, 0), 'y', (dx, dy) => {
        deslocRol = { x: dx, y: dy };
        let iy = y;
        MODOS.forEach((modo, i) => {
          const it = itens[i];
          const isCopa = modo.id === 'copa', isEscudos = modo.id === 'escudos';
          const al = toqueRol('modos.item.' + modo.id, ix, iy, iw, it.h, () => toggleModo(modo.id));
          comOpacidade(al * (it.desativado ? 0.35 : 1), () => {
            let bg = 'rgba(255,255,255,0.05)', bc = 'transparent', b = 1;
            if (it.ativo && !it.desativado) { bc = COR_ACENTO; bg = 'rgba(255,215,0,0.2)'; }
            if (isCopa && !it.desativado) { bc = COR_ACENTO; b = 2; bg = 'rgba(251,192,45,0.08)'; }
            if (isEscudos) { bc = '#a78bfa'; b = 2; bg = it.ativo ? 'rgba(167,139,250,0.15)' : 'rgba(167,139,250,0.05)'; }
            caixa(ix, iy, iw, it.h, { bg, r: 10, bw: b, bc });
            const cy = iy + it.h / 2;
            let tx = ix + b + 15;
            if (modo.image) { desenharImagem(imgAsset(modo.image), tx, cy - 14, 28, 28, 'contain'); tx += 28 + 12; }
            else { const ew = 24 * EMO_AV; emoji(modo.icon, 24, tx + ew / 2, cy); tx += ew + 15; }
            const colH = 16 * LH + (it.temSub ? 10 * LH : 0);
            let corLabel = '#FFF';
            if (isCopa && !it.desativado) corLabel = COR_ACENTO;
            if (isEscudos) corLabel = it.ativo ? '#a78bfa' : '#c4b5fd';
            texto(modo.label, tx, cy - colH / 2, { size: 16, color: corLabel });
            if (isCopa && !it.desativado) texto('★ DESTAQUE', tx, cy - colH / 2 + 16 * LH, { size: 10, color: COR_ACENTO });
            if (isEscudos) texto('MODO EXCLUSIVO', tx, cy - colH / 2 + 16 * LH, { size: 10, color: it.ativo ? '#a78bfa' : '#8b7ab0' });
            const tkx = ix + iw - b - 15 - 24, tky = cy - 12;
            let tbg = null, tbc = '#FFF';
            if (it.ativo && !it.desativado) { tbg = COR_ACENTO; tbc = COR_ACENTO; }
            if (isEscudos && it.ativo) { tbg = '#a78bfa'; tbc = '#a78bfa'; }
            caixa(tkx, tky, 24, 24, { bg: tbg, r: 12, bw: 2, bc: tbc });
            if (it.ativo && !it.desativado) icone('checkmark', 18, tkx + 12, tky + 12, '#000');
          });
          iy += it.h + 10;
        });
        deslocRol = { x: 0, y: 0 };
      });
      y += hLista + 15;
      const ao = toque('modos.confirmar', ix, y, iw, hOk, () => { S.modalModosVisivel = false; });
      comOpacidade(ao, () => {
        caixa(ix, y, iw, hOk, { bg: COR_ACENTO, r: 10 });
        texto('CONFIRMAR', ix + iw / 2, y + 15, { size: 16, color: '#000', align: 'center' });
      });
    });
  }

  // ---------------------------------------------------------------------------------------------
  // TELA: LOJA DE ESTÁDIOS
  // ---------------------------------------------------------------------------------------------
  function cabecalho(titulo, corVoltar, extra) {
    const hRow = extra ? 36 : Math.max(18 * LH, 24);
    const y = 20;
    texto(titulo, 20, y + (hRow - 18 * LH) / 2, { size: 18 });
    if (extra) extra(20 + larg(titulo, { size: 18 }) + 10, y, hRow);
    const vw = 24 + 5 + larg('VOLTAR', { size: 14 });
    const vx = W - 20 - vw;
    const a = toque('loja.voltar', vx, y + (hRow - 24) / 2, vw, 24, () => setTela('home'));
    comOpacidade(a, () => {
      icone('arrow-back', 24, vx + 12, y + hRow / 2, corVoltar);
      texto('VOLTAR', vx + 29, y + (hRow - 14 * LH) / 2, { size: 14, color: corVoltar });
    });
    return y + hRow + 15;               // posição da linha de baixo do cabeçalho
  }

  function telaLojaEstadios() {
    gradV(0, 0, W, H, ['#0F3830', '#0a4232', '#0F3830']);
    let y = cabecalho('🏟️ LOJA DE ESTÁDIOS', '#FBC02D', (x, y0, hRow) => {
      const a = toque('estadios.carta', x, y0, 36, 36, () => { S.modalCartaChefaoVisivel = true; });
      comOpacidade(a, () => {
        caixa(x, y0, 36, 36, { bg: 'rgba(0,0,0,0.6)', r: 8, bw: 1, bc: '#FBC02D' });
        icone('mail-open-outline', 18, x + 18, y0 + 18, '#FBC02D');
      });
    });
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(20, y, W - 40, 1);
    y += 1 + 15;
    // chefão
    desenharImagem(imagem('chefao', '../app/assets/chefao.png'), 0, y, W, 200, 'cover');
    ctx.fillStyle = '#FBC02D'; ctx.fillRect(0, y + 197, W, 3);
    y += 200 + 15;
    {
      const txt = 'SALDO: $ ' + formatarPremio(S.dinheiro), tw = larg(txt, { size: 14 });
      const h = 20 + 14 * LH;
      caixa(20, y, tw + 30, h, { bg: '#FBC02D', r: 8 });
      texto(txt, 35, y + 10, { size: 14, color: '#000' });
      y += h + 15;
    }
    // filtro de ligas (rolagem horizontal) + seta
    {
      const ph = 16 + 12 * LH + 2;
      const larguras = LIGAS_FILTRO.map((l) => 32 + larg(l.label, { size: 12 }) + 2);
      const conteudo = larguras.reduce((a, b) => a + b + 10, 0);
      const rw = W - 40 - 5 - 24;
      rolagem('ligas', 20, y, rw, ph, conteudo, 'x', (dx, dy) => {
        deslocRol = { x: dx, y: dy };
        let px = 20;
        LIGAS_FILTRO.forEach((l, i) => {
          const ativo = S.filtroLiga === l.id;
          const a = toqueRol('estadios.liga.' + l.id, px, y, larguras[i], ph, () => { S.filtroLiga = l.id; });
          comOpacidade(a, () => {
            caixa(px, y, larguras[i], ph, { bg: ativo ? '#FBC02D' : 'rgba(0,0,0,0.4)', r: 20, bw: 1, bc: '#FBC02D' });
            texto(l.label, px + 17, y + 9, { size: 12, color: ativo ? '#000' : '#FBC02D' });
          });
          px += larguras[i] + 10;
        });
        deslocRol = { x: 0, y: 0 };
      });
      icone('chevron-forward', 24, W - 20 - 12, y + ph / 2, 'rgba(255,255,255,0.5)');
      y += ph + 15;
    }
    // lista
    const chaves = Object.keys(D.ESTADIOS).filter((chave) => {
      const timeId = chave.replace('estadio_', '');
      const times = D.LEAGUE_TEAMS[S.filtroLiga] || [];
      return times.includes(timeId) || timeId === 'campo';
    });
    const hItem = 30 + 2 + (16.4 + 5 + 5 + 5 + 8 * 2 + 14 * LH);
    const conteudo = chaves.length * (hItem + 10) + 40;
    rolagem('estadios.lista', 0, y, W, H - y, conteudo, 'y', (dx, dy) => {
      deslocRol = { x: dx, y: dy };
      let iy = y;
      for (const chave of chaves) {
        if (iy + dy > H || iy + hItem + dy < y) { iy += hItem + 10; continue; }   // fora da tela
        const timeId = chave.replace('estadio_', '');
        const comprado = S.estadiosComprados.includes(chave) || hasUnlockedStadiums;
        const selecionado = S.estadioSelecionado === chave;
        const preco = getEstadioPreco(chave);
        const nome = timeId === 'campo' ? 'ESTÁDIO PADRÃO' : formatTeamName(timeId).toUpperCase();
        const x = 20, w = W - 40;
        caixa(x, iy, w, hItem, selecionado ? { bg: 'rgba(255,215,0,0.1)', r: 10, bw: 1, bc: '#FBC02D' } : { bg: 'rgba(0,0,0,0.5)', r: 10, bw: 1, bc: '#555' });
        const ty = iy + (hItem - 50) / 2;
        ctx.save(); rr(x + 16, ty, 80, 50, 5); ctx.fillStyle = '#000'; ctx.fill(); ctx.clip();
        desenharImagem(imgEstadio(chave), x + 16, ty, 80, 50, 'cover'); ctx.restore();
        caixa(x + 16, ty, 80, 50, { r: 5, bw: 1, bc: '#333' });
        const rx = x + 16 + 80 + 15, rw = w - 32 - 80 - 15;
        const colH = 16.4 + 5 + 5 + 5 + 16 + 14 * LH;
        let ry = iy + (hItem - colH) / 2;
        texto(nome, rx, ry + (16.4 - 14 * LH) / 2, { size: 14 });
        if (!comprado) texto('$ ' + formatarPremio(preco), rx + rw, ry + (16.4 - 12 * LH) / 2, { size: 12, color: '#FBC02D', align: 'right' });
        ry += 16.4 + 5 + 5 + 5;
        const btn = (id, rot, bg, cor, size, onPress, o = {}) => {
          const tw = larg(rot, { size }) + (o.play ? 19 : 0), bw2 = tw + 24, bh = 16 + 14 * LH;
          const a = toqueRol(id, rx0, ry, bw2, bh, onPress, { disabled: o.disabled });
          comOpacidade(a * (o.op != null ? o.op : 1), () => {
            caixa(rx0, ry, bw2, bh, { bg, r: 5 });
            let tx = rx0 + 12;
            if (o.play) { icone('play', 14, tx + 7, ry + bh / 2, '#FFF'); tx += 19; }
            texto(rot, tx, ry + (bh - size * LH) / 2, { size, color: cor });
          });
          rx0 += bw2 + 10;
        };
        let rx0 = rx;
        if (comprado) {
          btn('estadios.usar.' + chave, selecionado ? '✓ USANDO' : 'USAR', selecionado ? '#555' : '#FBC02D', '#FFF', 14, () => selecionarEstadio(chave), { disabled: selecionado });
          btn('estadios.ver.' + chave, 'VER', '#4A148C', '#FFF', 14, () => { S.estadioVisualizacao = chave; });
        } else {
          btn('estadios.comprar.' + chave, 'COMPRAR', '#FBC02D', '#000', 12, () => comprarEstadio(chave, preco));
          btn('estadios.gratis.' + chave, 'GRÁTIS', '#4A148C', '#FFF', 12, () => {}, { play: true, op: isRewardedLoaded ? 1 : 0.5, disabled: !isRewardedLoaded });
        }
        iy += hItem + 10;
      }
      deslocRol = { x: 0, y: 0 };
    });

    modal('chefao', S.modalCartaChefaoVisivel, 'fade', () => {
      const iw = larguraCartao();
      const frase = '"Opa! Tá cheio da grana hein, empresário? Quer desembolsar esse dinheiro todo pra comprar qual estádio pro seu império de futebol?"';
      cartao([
        { h: 50 * LH, mb: 15, draw: (x, y, w) => emoji('✉️', 50, x + w / 2, y + 50 * LH / 2) },
        itTitulo('CARTA DO CHEFÃO', iw, { mb: 20 }),
        itTexto(frase, iw, { size: 16, italic: true, lh: 24, mb: 25 }),
        itBotao('chefao.fechar', 'FECHAR', () => { S.modalCartaChefaoVisivel = false; }),
      ]);
    });
    modal('verEstadio', !!S.estadioVisualizacao, 'fade', () => {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      if (S.estadioVisualizacao) desenharImagem(imgEstadio(S.estadioVisualizacao), 0, 0, W, H, 'cover');
      const bx = W - 20 - 52, by = 20;
      const a = toque('verEstadio.fechar', bx, by, 52, 52, () => { S.estadioVisualizacao = null; });
      comOpacidade(a, () => { caixa(bx, by, 52, 52, { bg: 'rgba(0,0,0,0.5)', r: 25 }); icone('close', 32, bx + 26, by + 26, '#FFF'); });
    });
  }

  // ---------------------------------------------------------------------------------------------
  // TELA: LOJA DA ARBITRAGEM
  // ---------------------------------------------------------------------------------------------
  function telaLojaArbitragem() {
    gradV(0, 0, W, H, ['#1A0B2E', '#311042', '#1A0B2E']);
    let y = cabecalho('⚖️ LOJA DA ARBITRAGEM', '#E040FB');
    ctx.fillStyle = '#7B1FA2'; ctx.fillRect(20, y, W - 40, 1);
    y += 1 + 15;
    const base = { size: 16, w: 400, italic: true, lh: 24, color: '#FFF' };
    const partes = [{ t: 'Compre vantagens extras com o juiz! Elas serão adicionadas ao seu inventário e ' },
      { t: 'serão válidas SOMENTE para a PRÓXIMA partida que você jogar.', color: '#E040FB', w: 700 }];
    y += rico(partes, 20, y, W - 40, base);
    y += 15;
    {
      const bw = (W - 40 - 10) / 2, bh = 24 + 20;
      caixa(20, y, bw, bh, { bg: '#7B1FA2', r: 10 });
      texto('SALDO: $ ' + formatarPremio(S.dinheiro), 20 + bw / 2, y + (bh - 14 * LH) / 2, { size: 14, align: 'center' });
      const gx = 20 + bw + 10;
      comOpacidade(isRewardedLoaded ? 1 : 0.5, () => {
        caixa(gx, y, bw, bh, { bg: '#4A148C', r: 10, bw: 1, bc: '#E040FB' });
        const rot = 'GANHAR $200K', tw = larg(rot, { size: 14 }), c = 20 + 6 + tw, sx = gx + (bw - c) / 2;
        icone('play-circle', 20, sx + 10, y + bh / 2, '#E040FB');
        texto(rot, sx + 26, y + (bh - 14 * LH) / 2, { size: 14, color: '#E040FB' });
      });
      toque('arbitragem.ganhar', gx, y, bw, bh, () => {}, { disabled: !isRewardedLoaded });
      y += bh + 20;
    }
    const hConteudo = 18 * LH + 2 + 12 * LH + 10 + 16 + 14 * LH;
    const hItem = 30 + 2 + Math.max(60, hConteudo);
    rolagem('arbitragem.lista', 0, y, W, H - y, ITENS_ARBITRAGEM.length * (hItem + 15) + 40, 'y', (dx, dy) => {
      deslocRol = { x: dx, y: dy };
      let iy = y;
      for (const item of ITENS_ARBITRAGEM) {
        const qtd = S.comprasArbitragem.filter((a) => a === item.id).length;
        const x = 20, w = W - 40;
        caixa(x, iy, w, hItem, { bg: 'rgba(0,0,0,0.4)', r: 15, bw: 1, bc: '#7B1FA2' });
        const cy = iy + hItem / 2;
        caixa(x + 16, cy - 30, 60, 60, { bg: '#FFF', r: 30 });
        desenharImagem(imgAsset(item.img), x + 21, cy - 25, 50, 50, 'contain');
        const mx = x + 16 + 60 + 15;
        let my = cy - hConteudo / 2;
        texto('+1 ' + item.nome, mx, my, { size: 18 });
        my += 18 * LH + 2;
        texto(item.desc, mx, my, { size: 12, color: '#AAA', w: 400 });
        my += 12 * LH + 10;
        const rot = qtd > 0 ? 'COMPRADO' : `COMPRAR ($ ${formatarPremio(item.preco)})`;
        const bw = larg(rot, { size: 14 }) + 24, bh = 16 + 14 * LH;
        const a = toqueRol('arbitragem.comprar.' + item.id, mx, my, bw, bh, () => comprarArbitragem(item.id, item.preco), { disabled: qtd > 0 });
        comOpacidade(a, () => {
          caixa(mx, my, bw, bh, { bg: qtd > 0 ? '#555' : '#E040FB', r: 8 });
          texto(rot, mx + 12, my + 8, { size: 14, color: qtd > 0 ? '#AAA' : '#000' });
        });
        if (qtd > 0) {
          const t1 = 'COMPRADOS', bw2 = Math.max(larg(t1, { size: 10 }), larg(qtd + 'x', { size: 24 })) + 20, bh2 = 20 + 10 * LH + 24 * LH;
          const bx = x + w - 16 - bw2;
          caixa(bx, cy - bh2 / 2, bw2, bh2, { bg: '#000', r: 10, bw: 1, bc: '#E040FB' });
          texto(t1, bx + bw2 / 2, cy - bh2 / 2 + 10, { size: 10, color: '#E040FB', align: 'center' });
          texto(qtd + 'x', bx + bw2 / 2, cy - bh2 / 2 + 10 + 10 * LH, { size: 24, align: 'center' });
        }
        iy += hItem + 15;
      }
      deslocRol = { x: 0, y: 0 };
    });
  }

  // ---------------------------------------------------------------------------------------------
  // TELA: JOGO
  // ---------------------------------------------------------------------------------------------
  function telaJogo() {
    if (S.showStartScreen) {
      ctx.fillStyle = '#0F3830'; ctx.fillRect(0, 0, W, H);
      const t1 = { size: 36, color: '#FBC02D', align: 'center', ls: 1 }, t2 = { size: 24, w: 400, italic: true, align: 'center' };
      const h1 = alturaParagrafo('Apita o árbitro, tá valendo!', W - 40, t1), h2 = alturaParagrafo('Será você o próximo milionário?', W - 40, t2);
      let y = (H - (h1 + 30 + h2)) / 2;
      paragrafo('Apita o árbitro, tá valendo!', 20, y, W - 40, t1);
      paragrafo('Será você o próximo milionário?', 20, y + h1 + 30, W - 40, t2);
      return;
    }
    const pq = S.perguntas[S.perguntaAtual];
    if (!pq) return;
    const premioAtual = PREMIOS[S.perguntaAtual];
    const premioParar = S.perguntaAtual > 0 ? PREMIOS[S.perguntaAtual - 1] : 0;
    const premioErrar = calcularPremioErrar(S.perguntaAtual);
    const fimJogo = S.estadoJogo !== 'jogando';
    const temImagem = pq.tipo === 'escudo' && !!pq.escudo;

    // fundo: estádio escolhido + véu verde
    desenharImagem(imgEstadio(S.estadioSelecionado) || imgEstadio('campo'), 0, 0, W, H, 'cover');
    gradV(0, 0, W, H, ['rgba(15,56,48,0.6)', 'rgba(10,66,50,0.7)', 'rgba(8,38,30,0.8)']);

    const op = valor(fade);
    // pergunta
    const qx = 20, qw = W - 40;
    let y = 60 + 5;
    const pad = isSmallScreen ? 15 : 20;
    const tamBase = temImagem && isSmallScreen ? 13 : isSmallScreen ? 15 : 17;
    const txtW = qw - 4 - 2 * pad;
    const enunciado = pq.pergunta.toUpperCase();
    // adjustsFontSizeToFit com numberOfLines 2 e escala mínima 0,6
    let tam = tamBase, lh = 24, linhas;
    for (;;) {
      linhas = quebrar(enunciado, txtW, { size: tam });
      if (linhas.length <= 2 || tam <= tamBase * 0.6) break;
      tam -= 0.5; lh = 24 * tam / tamBase;
    }
    if (linhas.length > 2) { linhas = linhas.slice(0, 2); linhas[1] = linhas[1].replace(/\s*\S*$/, '') + '…'; }
    const imgSz = isSmallScreen ? 50 : 80;
    const hBox = 2 + 25 + (temImagem ? imgSz + 10 : 0) + linhas.length * lh + pad + 2;
    comOpacidade(op, () => {
      caixa(qx, y, qw, hBox, { bg: '#084f3c', r: 12, bw: 2, bc: '#138C61' });
      const cat = (pq.modo || []).map((m) => m.toUpperCase()).join(' - ');
      const cw = larg(cat, { size: 12, ls: 1 }) + 30, ch = 8 + 12 * LH;
      caixa(W / 2 - cw / 2, y - 14, cw, ch, { bg: '#138C61', r: 10 });
      texto(cat, W / 2, y - 14 + 4, { size: 12, align: 'center', ls: 1 });
      let ty = y + 2 + 25;
      if (temImagem) { desenharImagem(imgEscudo(pq.escudo), W / 2 - imgSz / 2, ty, imgSz, imgSz, 'contain'); ty += imgSz + 10; }
      linhas.forEach((l, i) => texto(l, W / 2, ty + i * lh, { size: tam, lh, align: 'center' }));
    });
    // cronômetro (zIndex 10 no original: fica por cima da etiqueta da categoria)
    {
      const cor = S.tempo > 10 ? '#FFF' : '#ff1744';
      const cx = W / 2, cy = 10 + 22.5;
      caixa(cx - 22.5, cy - 22.5, 45, 45, { bg: '#0B3A2C', r: 22.5, bw: 4, bc: cor });
      texto(String(S.tempo), cx, cy - 22 * LH / 2, { size: 22, color: S.tempo <= 10 ? '#ff1744' : '#FFF', align: 'center' });
    }
    y += hBox + 10 + 5;
    // alternativas
    const gapAlt = isSmallScreen ? 5 : 10;
    const getBgColor = (idx) => {
      if (S.alternativaEliminada.includes(idx)) return '#0B3A2C';
      if (S.estadoResposta === 'aguardando') return S.respostaSelecionada === idx ? COR_ACENTO : '#084f3c';
      if (idx === pq.correta) return COR_CERTA;
      if (idx === S.respostaSelecionada && S.estadoResposta === 'errada') return COR_ERRADA;
      return '#084f3c';
    };
    comOpacidade(op, () => {
      pq.alternativas.forEach((alt, idx) => {
        const eliminada = S.alternativaEliminada.includes(idx);
        const sel = S.respostaSelecionada === idx && S.estadoResposta === 'aguardando';
        const tMax = qw - 4 - 48 - 10 - 20;
        const ls = quebrar(alt.toUpperCase(), tMax, { size: 14 });
        const hTxt = ls.length * 14 * LH;
        const hb = Math.max(isSmallScreen ? 40 : 50, 4 + (isSmallScreen ? 12 : 16) + Math.max(48, hTxt));
        const a = toque('alt.' + idx, qx, y, qw, hb, () => !eliminada && responder(idx), { disabled: eliminada || S.estadoResposta !== 'aguardando', ao: 0.8 });
        comOpacidade(a, () => {
          caixa(qx, y, qw, hb, { bg: getBgColor(idx), r: 30, bw: 2, bc: '#0A3B2E', sombra: { dy: 2, blur: 3 } });
          const ccx = qx + 2 + 6 + 18, ccy = y + hb / 2;
          caixa(ccx - 18, ccy - 18, 36, 36, { bg: sel ? '#FFF' : '#138C61', r: 18 });
          texto(LETRAS[idx], ccx, ccy - 16 * LH / 2, { size: 16, color: sel ? '#000' : '#FFF', align: 'center' });
          ls.forEach((l, i) => texto(l, qx + 2 + 48 + 10, ccy - hTxt / 2 + i * 14 * LH, { size: 14, color: eliminada ? '#666' : sel ? '#000' : '#FFF' }));
        });
        y += hb + gapAlt;
      });
    });

    // rodapé: ajudas e prêmios (de baixo para cima)
    const hPremio = 24 + 2 + 12 * LH + 6 + Math.max(16 * LH, 14 * LH);
    const yPremio = H - 10 - (isSmallScreen ? 4 : 15) - hPremio;
    const circ = isSmallScreen ? 38 : 50;
    const contagens = AJUDAS.map((aj) => (aj.id === 'driblar' ? S.qtdDriblar : S.ajudasDisponiveis.filter((a) => a === aj.id).length));
    const hAjudas = circ + 8 + 9 * LH + (contagens.some((c) => c > 0) ? 2 + 10 * LH : 0);
    const yAjudas = yPremio - 10 - hAjudas;
    const colW = (W - 30) / 5;
    const aguardando = S.estadoResposta === 'aguardando';
    AJUDAS.forEach((aj, i) => {
      const contagem = contagens[i];
      const bloqueada = S.perguntaAtual === 15;
      const ativo = contagem > 0 && !bloqueada;
      const cx = 15 + colW * i + colW / 2;
      const a = toque('ajuda.' + aj.id, 15 + colW * i, yAjudas, colW, hAjudas, () => usarAjuda(aj.id), { disabled: !ativo || !aguardando });
      comOpacidade(a * (ativo ? 1 : 0.4), () => {
        caixa(cx - circ / 2, yAjudas, circ, circ, { bg: '#FFF', r: circ / 2, bw: 2, bc: '#138C61' });
        const isz = isSmallScreen ? 22 : 30;
        desenharImagem(imgAsset(aj.image), cx - isz / 2, yAjudas + circ / 2 - isz / 2, isz, isz, 'contain');
        texto(aj.label, cx, yAjudas + circ + 8, { size: 9, align: 'center', ls: 0.5, color: ativo ? '#FFF' : '#666' });
        if (contagem > 0) texto('x' + contagem, cx, yAjudas + circ + 8 + 9 * LH + 2, { size: 10, color: ativo ? COR_ACENTO : '#666', align: 'center' });
      });
    });
    {
      const i = 4, cx = 15 + colW * i + colW / 2, bloq = S.perguntaAtual === 15;
      const a = toque('ajuda.parar', 15 + colW * i, yAjudas, colW, hAjudas, () => { pararTimer(); tocarSomParar(); S.confirmarParar = true; }, { disabled: !aguardando || bloq });
      comOpacidade(a * (bloq ? 0.4 : 1), () => {
        caixa(cx - circ / 2, yAjudas, circ, circ, { r: circ / 2, bw: 2, bc: '#FFF' });
        icone('close', 26, cx, yAjudas + circ / 2, '#FFF');
        texto('PARAR', cx, yAjudas + circ + 8, { size: 9, align: 'center', ls: 0.5 });
      });
    }
    {
      const bw = (W - 30 - 20) / 3;
      [['ERRAR', premioErrar, '#FFF'], ['PARAR', premioParar, '#FFF'], ['ACERTAR', premioAtual, COR_ACENTO]].forEach(([rot, v, cor], i) => {
        const bx = 15 + i * (bw + 10);
        caixa(bx, yPremio, bw, hPremio, { bg: '#072E23', r: 12, bw: 1, bc: 'rgba(255,255,255,0.1)' });
        texto(rot, bx + bw / 2, yPremio + 13, { size: 12, align: 'center', ls: 1 });
        const vt = formatarPremio(v), w1 = larg('$', { size: 16 }), w2 = larg(vt, { size: 14 });
        const rx = bx + bw / 2 - (w1 + 6 + w2) / 2, ry = yPremio + 13 + 12 * LH + 6;
        texto('$', rx, ry, { size: 16, color: cor });
        texto(vt, rx + w1 + 6, ry + (16 * LH - 14 * LH) / 2, { size: 14, color: cor });
      });
    }

    // modais do jogo (mesma ordem do original)
    const iw = larguraCartao();
    modal('parar', S.confirmarParar, 'fade', () => cartao([
      itTitulo('Tem certeza?', iw),
      itTexto(`Você deseja parar agora e garantir $ ${formatarPremio(premioParar)}?`, iw, { size: 16, mb: 20 }),
      itSimNao('parar', () => { pararSomAtivo(); iniciarTimer(); S.confirmarParar = false; }, () => { S.confirmarParar = false; desistir(); }),
    ]), false);
    modal('confirma', S.confirmaAnswer !== null, 'fade', () => {
      if (S.confirmaAnswer === null) return;
      cartao([
        itTitulo('Tem certeza?', iw),
        itTexto('Você escolheu: ' + pq.alternativas[S.confirmaAnswer].toUpperCase(), iw, { size: 18, mb: 20 }),
        itSimNao('confirma', () => { S.confirmaAnswer = null; iniciarTimer(); }, () => { const ans = S.confirmaAnswer; S.confirmaAnswer = null; efetivarResposta(ans); }),
      ]);
    }, false);
    modal('milhao', S.modalMilhaoVisivel, 'fade', () => {
      const iw2 = Math.min(W - 40, 380) - 64;
      const base = { size: 16, w: 400, lh: 24 };
      const partes = [{ t: 'Você deseja parar agora e levar os ' }, { t: '$ 500.000', w: 700, color: '#FBC02D' },
        { t: ' garantidos ou quer arriscar tudo e jogar pelo ' }, { t: 'MILHÃO', w: 700, color: '#FBC02D' },
        { t: '?\n\n⚠️ ATENÇÃO: Se escolher jogar e errar, você perde TUDO e sai com $ 0!' }];
      const hp = rico(partes, 0, 0, iw2, base, false);
      cartao([
        itTitulo('A PERGUNTA DO MILHÃO!', iw2, { color: COR_ACENTO, size: 32 }),
        { h: hp, mb: 25, draw: (x, y, w) => rico(partes, x, y, w, base) },
        { h: H_BTN * 2 + 12, draw: (x, y, w) => {
          btnFim('milhao.parar', x, y, w, 'PARAR COM $ 500.000', recusarMilhao, { bg: '#555', color: '#FFF' });
          btnFim('milhao.jogar', x, y + H_BTN + 12, w, 'JOGAR O MILHÃO!', aceitarMilhao);
        } },
      ], { maxW: 380 });
    }, false);

    // animação do gol / do erro
    const anim = (erro) => {
      bloqueio();
      ctx.fillStyle = 'rgba(0,0,0,0.85)'; ctx.fillRect(0, 0, W, H);
      const f1 = S.faseGol === 1;
      const hTxt = f1 ? 20 + 52 * LH + 8 + 18 * LH : 0;
      const top = (H - (300 + hTxt)) / 2;
      const sh = f1 ? tremor(golT0) : 0;
      let chave = 'bola_antes';
      if (f1) chave = !erro ? 'bola_depois' : S.erroAtual.tipo === 'trave' ? 'bola_trave' : 'bola_fora';
      desenharImagem(imgAsset(chave), W / 2 - 150 + sh, top + sh, 300, 300, 'contain');
      if (f1) {
        const k = mola(golT0);
        ctx.save();
        const cy = top + 300 + hTxt / 2;
        ctx.translate(W / 2, cy); ctx.scale(k, k); ctx.translate(-W / 2, -cy);
        const t1 = erro ? S.erroAtual.msg.toUpperCase() : 'GOL!';
        texto(t1, W / 2, top + 300 + 20, { size: 52, color: erro ? '#ff1744' : '#FBC02D', align: 'center', ls: 2 });
        texto(erro ? '❌ QUESTÃO ERRADA! ❌' : '🎉 QUESTÃO CERTA! 🎉', W / 2, top + 300 + 20 + 52 * LH + 8, { size: 18, w: 400, align: 'center' });
        ctx.restore();
      }
    };
    if (S.showGolAnim) anim(false);
    if (S.showErroAnim && S.erroAtual) anim(true);

    modal('ajudaConfirm', S.modalAjudaConfirm !== null, 'fade', () => {
      if (S.modalAjudaConfirm === null) return;
      const aj = AJUDAS.find((a) => a.id === S.modalAjudaConfirm);
      const rest = aj.id === 'driblar' ? S.qtdDriblar : S.ajudasDisponiveis.filter((a) => a === aj.id).length;
      let nome = aj.label.toLowerCase();
      if (aj.id === 'driblar') nome = rest > 1 ? 'dribles' : 'drible';
      else if (aj.id === 'cartoes') nome = rest > 1 ? 'cartões' : 'cartão';
      else if (aj.id === 'torcedores') nome = 'ajuda da torcida';
      else if (aj.id === 'var') nome = 'uso do VAR';
      const id = aj.id;
      cartao([
        { h: 80, draw: (x, y, w) => { caixa(x + w / 2 - 40, y, 80, 80, { bg: '#FFF', r: 40 }); desenharImagem(imgAsset(aj.image), x + w / 2 - 30, y + 10, 60, 60, 'contain'); } },
        itTitulo('Usar ' + aj.label + '?', iw, { mb: 10 }),
        itTexto(`Você ainda tem: ${rest} ${nome}`, iw, { size: 16, color: '#DDD' }),
        itTexto(`"${TEXTOS_AJUDA[aj.id]}"`, iw - 20, { size: 13, color: '#FBC02D', italic: true, mt: 5 }),
        itSimNao('ajudaConfirm', () => { S.modalAjudaConfirm = null; iniciarTimer(); }, () => confirmarAjuda(id), { mt: 10 }),
      ], { gap: 15 });
    }, false);

    modal('var', S.modalVarVisivel, 'fade', () => {
      const resp = pq.alternativas[pq.correta].toUpperCase();
      const hBox = 6 + 40 + 28 * LH + 5 + 14 * LH;
      cartao([
        { h: hBox, draw: (x, y, w) => {
          const dx = valor(varScan);
          caixa(x + dx, y, w, hBox, { r: 8, bw: 3, bc: '#00BFFF' });
          texto('📺 VAR', x + dx + w / 2, y + 23, { size: 28, color: '#00BFFF', align: 'center', ls: 4 });
          texto('⏪ Analisando lances...', x + dx + w / 2, y + 23 + 28 * LH + 5, { size: 14, color: '#aaa', align: 'center', w: 400 });
        } },
        itTexto('A resposta correta é:', iw, { size: 16, mt: 20 }),
        itTexto(resp, iw, { size: 22, w: 700, color: COR_ACENTO, mt: 8 }),
        itBotao('var.ok', 'ENTENDIDO', () => { S.modalVarVisivel = false; }, { mt: 20 }),
      ], { clip: true });
    });

    modal('torcida', S.modalTorcidaVisivel, 'fade', () => {
      const linhaH = 13 * LH + 4 + 8;
      cartao([
        itTitulo('🏟️ A TORCIDA ACHA...', iw),
        ...pq.alternativas.map((alt, idx) => ({ h: linhaH, mt: 10, draw: (x, y, w) => {
          texto(`${LETRAS[idx]}. ${alt}`, x, y + (16 * LH - 13 * LH) / 2 - 1, { size: 13, w: 400 });
          texto((S.torcidaVotos[idx] || 0) + '%', x + w, y, { size: 14, color: COR_ACENTO, align: 'right' });
          caixa(x, y + 13 * LH + 4, w, 8, { bg: '#073', r: 4 });
          const v = S.torcidaVotos[idx] || 0;
          if (v > 0) caixa(x, y + 13 * LH + 4, w * v / 100, 8, { bg: COR_ACENTO, r: 4 });
        } })),
        itBotao('torcida.fechar', 'FECHAR', () => { S.modalTorcidaVisivel = false; }, { mt: 20 }),
      ]);
    });

    modal('cartoes', S.modalCartoesVisivel, 'fade', () => {
      // 4 cartas de 60 com gap 12, quebrando linha se não couber
      const porLinha = Math.max(1, Math.floor((iw + 12) / 72));
      const nLinhas = Math.ceil(4 / porLinha);
      const hCartas = nLinhas * 90 + (nLinhas - 1) * 12;
      const rev = S.cartaoRevelado;
      const itens = [
        itTitulo('🟨🟥 CARTÕES', iw),
        itTexto('Escolha um cartão para revelar quantas alternativas serão eliminadas', iw, { size: 14, color: '#DDD', w: 400, mb: 15 }),
        { h: hCartas, draw: (x, y, w) => {
          for (let i = 0; i < 4; i++) {
            const li = Math.floor(i / porLinha), na = Math.min(porLinha, 4 - li * porLinha), ci = i - li * porLinha;
            const lw = na * 60 + (na - 1) * 12;
            const cx = x + (w - lw) / 2 + ci * 72, cy = y + li * 102;
            const a = toque('cartao.' + i, cx, cy, 60, 90, () => revelarCartao(i));
            comOpacidade(a, () => {
              const bg = rev === null ? (i < 2 ? '#f5a623' : '#e53935') : (S.cartoesOpcoes[i] === rev ? '#444' : '#222');
              caixa(cx, cy, 60, 90, { bg, r: 8, bw: 2, bc: rev === null ? '#888' : '#333' });
              if (rev !== null) {
                const destaque = S.cartoesOpcoes[i] === rev, sz = destaque ? 28 : 18;
                texto(String(S.cartoesOpcoes[i]), cx + 30, cy + 45 - sz * LH / 2, { size: sz, color: destaque ? '#FFF' : '#666', align: 'center' });
              } else texto('?', cx + 30, cy + 45 - 28 * LH / 2, { size: 28, align: 'center' });
            });
          }
        } },
      ];
      if (rev !== null) {
        const msg = rev === 0 ? 'Nenhuma alternativa eliminada!' : `${rev} alternativa${rev > 1 ? 's' : ''} eliminada${rev > 1 ? 's' : ''}!`;
        itens.push(itTexto(msg, iw, { size: 18, w: 700, color: COR_ACENTO, mt: 15 }));
      }
      itens.push(itBotao('cartoes.fechar', 'FECHAR', () => { S.modalCartoesVisivel = false; }, { mt: 15 }));
      cartao(itens);
    });

    modal('fim', fimJogo, 'fade', () => {
      if (S.estadoJogo === 'jogando') return;
      const ej = S.estadoJogo;
      const titulo = ej === 'fim_vitoria' ? 'MILIONÁRIO!' : ej === 'fim_derrota' ? (S.estadoResposta === 'tempo_esgotado' ? 'TEMPO ESGOTADO!' : 'FIM DE JOGO!') : 'VOCÊ PAROU!';
      const itens = [
        { h: 70 * LH, mb: 15, draw: (x, y, w) => emoji(ej === 'fim_vitoria' ? '🏆' : ej === 'fim_derrota' ? '❌' : '🏳️', 70, x + w / 2, y + 70 * LH / 2) },
        itTitulo(titulo, iw),
      ];
      if (ej === 'fim_derrota' && S.respostaSelecionada !== null && pq.alternativas[pq.correta]) {
        itens.push(itTexto('Certa: ' + pq.alternativas[pq.correta].toUpperCase(), iw, { size: 14, w: 700, color: COR_ACENTO, mb: 20 }));
      }
      itens.push(itTexto('Seu prêmio final:', iw, { size: 14, w: 500, color: '#DDD' }));
      itens.push(itTexto('$ ' + formatarPremio(S.premioGanho), iw, { size: 40, w: 700, color: COR_ACENTO, mb: 30 }));
      itens.push(itBotao('fim.novamente', 'Jogar Novamente', () => { pararSomAtivo(); iniciarJogo(); }));
      itens.push(itBotao('fim.menu', 'Menu Principal', () => { pararSomAtivo(); setTela('home'); }, { bg: '#072a20', color: '#fff', mt: 10 }));
      cartao(itens);
    }, false);
  }

  function desenharAlerta() {
    if (!alertaTxt) return;
    bloqueio();
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, W, H);
    const cw = Math.min(W - 48, 320), iw = cw - 48;
    const st = { size: 16, w: 400, color: '#222' };
    const ht = alturaParagrafo(alertaTxt, iw, st);
    const h = 24 + ht + 24 + 36 + 8;
    const x = (W - cw) / 2, y = (H - h) / 2;
    caixa(x, y, cw, h, { bg: '#FFF', r: 4, sombra: { dy: 4, blur: 12, cor: 'rgba(0,0,0,0.4)' } });
    paragrafo(alertaTxt, x + 24, y + 24, iw, st);
    const a = toque('alerta.ok', x + cw - 16 - 64, y + h - 8 - 36, 64, 36, () => { alertaTxt = null; });
    comOpacidade(a, () => texto('OK', x + cw - 16 - 32, y + h - 8 - 36 + (36 - 14 * LH) / 2, { size: 14, color: '#00796B', align: 'center' }));
  }

  // ---------------------------------------------------------------------------------------------
  // Quadro
  // ---------------------------------------------------------------------------------------------
  function desenharQuadro() {
    ctx = scene.sys.game.context;
    ctx.save();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    hits = [];
    if (S.tela === 'home') telaHome();
    else if (S.tela === 'loja_estadios') telaLojaEstadios();
    else if (S.tela === 'loja_arbitragem') telaLojaArbitragem();
    else if (S.tela === 'jogo') telaJogo();
    desenharAlerta();
    // indicador de toque (só na gravação, se pedido)
    toques = toques.filter((t) => agora - t.t < 450);
    for (const t of toques) {
      const p = (agora - t.t) / 450;
      ctx.save(); ctx.globalAlpha = 0.45 * (1 - p); ctx.fillStyle = '#FFF';
      ctx.beginPath(); ctx.arc(t.x, t.y, 16 + 22 * p, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.restore();
    hitsQuadro = hits;
  }

  function atualizar(delta) {
    const dt = Math.min(delta, 100);
    agora += dt;
    if (timerOn) {
      timerAcc += dt;
      while (timerAcc >= 1000) { timerAcc -= 1000; S.tempo = S.tempo > 0 ? S.tempo - 1 : 0; }
    }
    if (S.tempo === 0 && S.estadoResposta === 'aguardando' && S.estadoJogo === 'jogando' && S.tela === 'jogo' && timerOn) {
      timerOn = false; lidarTempoEsgotado();
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Phaser
  // ---------------------------------------------------------------------------------------------
  class Cena extends Phaser.Scene {
    constructor() { super('app'); }
    preload() {
      scene = this;
      this.load.json('perguntas', '../app/perguntas.json');
      this.load.json('ionicons', 'fonts/Ionicons.json');
      this.load.json('mdi', 'fonts/MaterialCommunityIcons.json');
      this.load.image('logo', '../app/assets/logo.png');
      this.load.image('logo_copa', '../app/assets/logo_copa.png');
      this.load.image('sim_cartoes', '../app/assets/simbolos/cartoes.png');
      this.load.image('sim_var', '../app/assets/simbolos/var.png');
      this.load.image('sim_torcida', '../app/assets/simbolos/torcida.png');
      this.load.image('sim_drible', '../app/assets/simbolos/drible.png');
      this.load.image('bola_antes', '../app/assets/animacoes/bola_antes.png');
      this.load.image('bola_depois', '../app/assets/animacoes/bola_depois.png');
      this.load.image('bola_fora', '../app/assets/animacoes/bola_depois_fora.png');
      this.load.image('bola_trave', '../app/assets/animacoes/bola_depois_trave.png');
      this.load.image('est_campo', D.ESTADIOS.campo);
      for (const c of EMOJIS_USADOS) {
        if (c.includes('1f1e')) this.load.svg('emo_' + c, 'emoji/emoji_u' + c + '.svg', { width: 256, height: 256 });
        else this.load.image('emo_' + c, 'emoji/emoji_u' + c + '.png');
      }
      for (const [k, u] of Object.entries(D.SONS)) this.load.audio('som_' + k, encodeURI(u));
    }
    create() {
      Object.assign(PERGUNTAS_DB, this.cache.json.get('perguntas'));
      Object.assign(IONS, this.cache.json.get('ionicons'));
      Object.assign(MDI, this.cache.json.get('mdi'));
      carregarDados();
      iniciarChuva();
      const est = S.estadioSelecionado;
      if (est !== 'campo') imgEstadio(est);
      this.input.on('pointerdown', (p) => aoTocar(p.x / DPR, p.y / DPR));
      this.input.on('pointermove', (p) => { if (p.isDown) aoMover(p.x / DPR, p.y / DPR); });
      this.input.on('pointerup', (p) => aoSoltar(p.x / DPR, p.y / DPR));
      this.sys.game.events.on('postrender', desenharQuadro);
      // o navegador só libera o áudio depois do primeiro toque
      this.sound.pauseOnBlur = false;
      controleIntro();
      this.input.once('pointerdown', () => { if (this.sound.context && this.sound.context.state === 'suspended') this.sound.context.resume(); });
      window.SMF.pronto = true;
    }
    update(time, delta) { atualizar(delta); }
  }

  // ---------------------------------------------------------------------------------------------
  // Automação (adaptador do divulgacao-kit)
  // ---------------------------------------------------------------------------------------------
  window.SMF = {
    pronto: false,
    S,
    agora: () => agora,
    // regiões tocáveis do último quadro
    alvos: () => hitsQuadro.filter((h) => h.tipo === 'toque' && h.onPress).map((h) => h.id),
    // toca como um dedo: aperta, segura 110 ms e solta (com o efeito de opacidade do botão)
    tocar(id) {
      const h = hitsQuadro.slice().reverse().find((x) => x.id === id && x.tipo === 'toque');
      if (!h) return false;
      const px = h.x + h.w / 2, py = h.y + h.h / 2;
      aoTocar(px, py);
      later(110, () => aoSoltar(px, py));
      return true;
    },
    rolar(id, para, ms = 600) { const r = rolagens[id]; if (!r) return false; r.anim = tween(r.v, Math.max(0, Math.min(r.max, para)), ms); return true; },
    forcarPerguntas(ids) { perguntasForcadas = ids; },
    mostrarToques(v) { mostrarToques = !!v; },
    correta: () => { const p = S.perguntas[S.perguntaAtual]; return p ? p.correta : null; },
  };

  // fontes antes de desenhar a primeira tela
  const fontes = ['700 16px Roboto', '400 16px Roboto', 'italic 400 16px Roboto', '500 16px Roboto', '16px Ionicons', '16px MaterialCommunityIcons'];
  Promise.all(fontes.map((f) => document.fonts.load(f))).catch(() => {}).then(() => {
    medir();
    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: 'game',
      backgroundColor: '#0F3830',
      scale: { mode: Phaser.Scale.NONE, width: Math.round(W * DPR), height: Math.round(H * DPR), zoom: 1 / DPR },
      render: { antialias: true },
      audio: { disableWebAudio: false },
      scene: [Cena],
    });
    window.smfGame = game;
    window.addEventListener('resize', () => { medir(); game.scale.resize(Math.round(W * DPR), Math.round(H * DPR)); });
  });
})();

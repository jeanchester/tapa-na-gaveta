// Você Escala — réplica em Phaser/Canvas do app React Native (app/index.tsx), só para gravar vídeos
// de divulgação. Mesma tela, textos, cores, medidas e comportamento (campo, esquemas, menu, escolha
// de divisão/time/esquema, elenco com busca e teclado do Android, modo confronto, mover jogadores,
// salvar, minhas escalações, jogador personalizado, alertas). Sem anúncios, compras, tutorial nem
// promoção: fica como o app para quem tem o Premium (todos os times liberados).
//
// Como nas réplicas do Show do Milhão e do Rei da Fixa: a tela é redesenhada inteira a cada quadro
// a partir do estado, em dp do React Native × DPR, e o relógio é o do Phaser (o gravador controla o
// tempo). Elencos e lista de times ficam em video/dados (cópia local: a gravação não depende de rede).
// Automação: window.VE (tocar, segurar, digitar, apagar, limpar, rolar, arrastar, fecharTeclado, S).
(function () {
  'use strict';

  // cores do app (styles)
  const FUNDO = '#1a1a2e';            // container, menu, modais
  const BARRA = '#16213e';            // cabeçalho, barra de informações, campos e cartões
  const LINHA = '#0f3460';            // bordas, item selecionado, botão fechar
  const VERDE = '#4CAF50';
  const ACENTO = '#009688';           // colorAccent padrão do Theme.AppCompat (cursor e botões do Alert)

  // ---------------------------------------------------------------------------------------------
  // Tela e escala
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
  let W = 360, H = 640;
  function medir() { const v = viewSize(); W = v.w; H = v.h; return v; }
  const STATUS = 24;                  // barra de status (SafeAreaView edges top): o app começa embaixo dela
  const NAV = 0;                      // navegação por gestos: sem faixa embaixo

  // ---------------------------------------------------------------------------------------------
  // Armazenamento (AsyncStorage -> localStorage, protegido)
  // ---------------------------------------------------------------------------------------------
  const PREF = 've.';
  const store = {
    get(k) { try { return localStorage.getItem(PREF + k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(PREF + k, String(v)); } catch (e) { /* sem armazenamento */ } },
  };

  // ---------------------------------------------------------------------------------------------
  // Tempo e animação
  // ---------------------------------------------------------------------------------------------
  let scene = null;
  let agora = 0;
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
  const suave = bezier(0.4, 0, 0.2, 1);            // curva padrão das animações do Android
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const tween = (de, para, dur, easing) => ({ de, para, t0: agora, dur, easing: easing || suave });
  const valor = (tw) => { if (!tw) return 0; const p = tw.dur ? clamp01((agora - tw.t0) / tw.dur) : 1; return tw.de + (tw.para - tw.de) * tw.easing(p); };

  // ---------------------------------------------------------------------------------------------
  // Dados (cópia local de video/dados: base.json extraído do app, elencos e planilha de times)
  // ---------------------------------------------------------------------------------------------
  let DB_TIMES = [], ESQUEMAS_TATICOS = {}, MAPA_IDS_COPA = {}, ELENCOS = {}, ELENCOS_COPA = [], PLANILHA = '';

  // ---------------------------------------------------------------------------------------------
  // Estado (mesmos nomes do useState do original)
  // ---------------------------------------------------------------------------------------------
  const S = {
    menuVisible: false, elencoVisible: false, divisao: 'Série A', times: [], timeSelecionado: null,
    esquema: '4-3-3', esquemaAdversario: '4-3-3', modoMover: false, modoConfronto: false,
    elenco: [], elencoAdversario: [], buscaTexto: '', loading: false,
    jogadoresCampo: Array(11).fill(null), jogadoresAdversario: Array(11).fill(null),
    indiceSelecionado: null, indiceAdversarioSelecionado: null,
    posicoes: [], posicoesAdversario: [],
    corTime: '#00008B', timeAdversario: null, corTimeAdversario: '#1E90FF',
    showDivisaoModal: false, showTimeModal: false, showTimeAdversarioModal: false,
    showEsquemaModal: false, showEsquemaAdversarioModal: false,
    showAdicionarJogadorModal: false, novoJogadorNome: '', novoJogadorNumero: '',
    modalSalvarVisible: false, modalMinhasEscalacoesVisible: false, nomeEscalacao: '', escalacoesSalvas: [],
    alerta: null,                     // { titulo, msg, botoes: [{ texto, acao }] }
    foco: null,                       // campo com o teclado aberto
    pan: {},                          // arrasto em andamento (modo mover): id -> { dx, dy }
  };
  let personalizados = {};            // { [idDoTime | 'sem_time']: Jogador[] }

  // ---------------------------------------------------------------------------------------------
  // Regras (cópia fiel do original)
  // ---------------------------------------------------------------------------------------------
  const removeAccents = (str) => str.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const traduzirPosicao = (p) => {
    if (!p) return 'Meio-Campo';
    if (p === 'Goalkeeper') return 'Goleiro';
    if (p === 'Defender') return 'Defensor';
    if (p === 'Midfielder') return 'Meio-Campo';
    if (p === 'Attacker') return 'Atacante';
    return p;
  };
  const formatarNomeCurto = (nome) => {
    const partes = nome.trim().split(/\s+/);
    if (partes.length > 1) return `${partes[0][0].toUpperCase()}. ${partes[partes.length - 1]}`.substring(0, 13);
    return nome.substring(0, 12);
  };
  const coresSimilares = (h1, h2) => {
    const rgb = (h) => { const b = parseInt(h.replace('#', ''), 16); return [(b >> 16) & 255, (b >> 8) & 255, b & 255]; };
    const a = rgb(h1), b = rgb(h2);
    return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 120;
  };
  const copiaPos = (lista) => lista.map((p) => [p[0], p[1]]);
  const gerarPosicoesAdversario = (esquema) => ESQUEMAS_TATICOS[esquema].map(([x, y]) => [x, 1 - y]);
  const porNome = (a, b) => a.nome.localeCompare(b.nome);

  function buscarTimesPlanilha(div) {
    if (div === 'Copa do Mundo') {
      const ids = Object.keys(MAPA_IDS_COPA).map((id) => parseInt(id, 10));
      S.times = DB_TIMES.filter((t) => ids.includes(t.id)).sort(porNome);
      return;
    }
    const linhas = PLANILHA.split('\n').map((l) => l.trim()).filter((l) => l);
    const serieA = [], serieB = [];
    for (let i = 1; i < linhas.length; i++) {
      const col = linhas[i].split(',').map((c) => c.trim());
      if (col[0]) serieA.push(col[0]);
      if (col[1]) serieB.push(col[1]);
    }
    const nomes = div === 'Série A' ? serieA : serieB;
    const finais = [];
    for (const n of nomes) {
      const nClean = removeAccents(n.toLowerCase().trim());
      const t = DB_TIMES.find((x) => removeAccents(x.nome.toLowerCase().trim()) === nClean);
      if (t && !finais.find((f) => f.id === t.id)) finais.push(t);
    }
    S.times = (finais.length > 0 ? finais : DB_TIMES.slice(0, 20)).sort(porNome);
  }
  function elencoDoTime(timeId) {
    if (MAPA_IDS_COPA[timeId]) {
      const dados = ELENCOS_COPA.find((t) => t.team === MAPA_IDS_COPA[timeId]);
      if (!dados || !dados.players) return [];
      const pos = { goleiro: 'Goleiro', defensor: 'Defensor', meia: 'Meio-Campo', atacante: 'Atacante' };
      return dados.players.map((j, i) => ({ id: parseInt(`${timeId}${i}`, 10), nome: j.name, posicao: pos[j.position] || j.position, numero: j.number }));
    }
    const bruto = ELENCOS[String(timeId)];
    if (!bruto) return [];
    return bruto.map((j) => ({ id: j.id, nome: j.nome, posicao: traduzirPosicao(j.posicao), numero: j.numero }));
  }
  const comPersonalizados = (chave, jogadores) => {
    const extras = personalizados[String(chave)] || [];
    const ids = new Set(jogadores.map((j) => j.id));
    return [...jogadores, ...extras.filter((j) => !ids.has(j.id))];
  };
  // o app busca o elenco na internet: um instante de "carregando" deixa o vídeo igual ao uso real
  function buscarElenco(timeId, adversario) {
    S.loading = true;
    later(450, () => {
      const lista = comPersonalizados(timeId, elencoDoTime(timeId)).sort(porNome);
      if (adversario) S.elencoAdversario = lista; else S.elenco = lista;
      S.loading = false;
    });
  }
  function recalcularPosicoes() {
    if (S.modoConfronto) {
      const p1 = copiaPos(ESQUEMAS_TATICOS[S.esquema]);
      const p2 = copiaPos(gerarPosicoesAdversario(S.esquemaAdversario));
      p2[0][1] = Math.max(0.05, p2[0][1] - 0.05);
      const DY = 0.09, DX = 0.09;
      for (const azul of p2) {
        for (const vermelho of p1) {
          if (Math.abs(azul[0] - vermelho[0]) < DX && Math.abs(azul[1] - vermelho[1]) < DY) {
            azul[1] = azul[1] <= vermelho[1] ? Math.max(0.02, vermelho[1] - DY) : Math.min(0.98, vermelho[1] + DY);
          }
        }
      }
      S.posicoes = p1; S.posicoesAdversario = p2;
    } else {
      S.posicoes = copiaPos(ESQUEMAS_TATICOS[S.esquema]);
      S.posicoesAdversario = gerarPosicoesAdversario(S.esquemaAdversario);
    }
  }
  function atualizarCores() {
    if (S.timeSelecionado) S.corTime = S.timeSelecionado.cor;
    if (S.timeAdversario) {
      S.corTimeAdversario = (S.modoConfronto && S.timeSelecionado && coresSimilares(S.timeSelecionado.cor, S.timeAdversario.cor))
        ? S.timeAdversario.corSecundaria : S.timeAdversario.cor;
    } else S.corTimeAdversario = '#1E90FF';
  }
  function mudarEsquema(e) { S.esquema = e; S.posicoes = copiaPos(ESQUEMAS_TATICOS[e]); recalcularPosicoes(); }
  function mudarEsquemaAdversario(e) { S.esquemaAdversario = e; S.posicoesAdversario = gerarPosicoesAdversario(e); recalcularPosicoes(); }
  function mudarDivisao(d) {
    S.divisao = d; buscarTimesPlanilha(d);
    S.timeSelecionado = null; S.timeAdversario = null;
    S.elenco = comPersonalizados('sem_time', []); S.elencoAdversario = [];
    S.jogadoresCampo = Array(11).fill(null); S.jogadoresAdversario = Array(11).fill(null);
    atualizarCores();
  }
  function selecionarTime(t) {
    S.timeSelecionado = t; S.jogadoresCampo = Array(11).fill(null); S.indiceSelecionado = null;
    buscarElenco(t.id, false); S.showTimeModal = false; atualizarCores();
  }
  function selecionarTimeAdversario(t) {
    S.timeAdversario = t; S.jogadoresAdversario = Array(11).fill(null); S.indiceAdversarioSelecionado = null;
    buscarElenco(t.id, true); S.showTimeAdversarioModal = false; atualizarCores();
  }
  function selecionarSlot(i) { if (S.modoMover) return; S.indiceSelecionado = i; S.indiceAdversarioSelecionado = null; abrirElenco(); }
  function selecionarSlotAdversario(i) { if (S.modoMover) return; S.indiceAdversarioSelecionado = i; S.indiceSelecionado = null; abrirElenco(); }
  function abrirElenco() { S.elencoVisible = true; }
  function fecharElenco() { desfocar(); S.elencoVisible = false; }
  function escalarJogador(j) {
    if (S.indiceAdversarioSelecionado !== null) {
      if (S.jogadoresAdversario.some((x) => x && x.id === j.id)) { alerta('Erro', `${j.nome} já está escalado no time adversário!`); return; }
      const novo = [...S.jogadoresAdversario]; novo[S.indiceAdversarioSelecionado] = j;
      S.jogadoresAdversario = novo; S.indiceAdversarioSelecionado = null; fecharElenco();
      return;
    }
    if (S.indiceSelecionado === null) { alerta('Atenção', 'Selecione uma posição no campo primeiro!'); return; }
    if (S.jogadoresCampo.some((x) => x && x.id === j.id)) { alerta('Erro', `${j.nome} já está escalado!`); return; }
    const novo = [...S.jogadoresCampo]; novo[S.indiceSelecionado] = j;
    S.jogadoresCampo = novo; S.indiceSelecionado = null; fecharElenco();
  }
  function removerJogador(i) { const n = [...S.jogadoresCampo]; n[i] = null; S.jogadoresCampo = n; S.indiceSelecionado = null; }
  function removerJogadorAdversario(i) { const n = [...S.jogadoresAdversario]; n[i] = null; S.jogadoresAdversario = n; S.indiceAdversarioSelecionado = null; }
  function desselecionarTudo() { S.indiceSelecionado = null; S.indiceAdversarioSelecionado = null; }
  function adicionarJogadorCustomizado() {
    if (!S.novoJogadorNome.trim()) { alerta('Erro', 'Digite o nome do jogador'); return; }
    const numero = S.novoJogadorNumero.trim() ? parseInt(S.novoJogadorNumero, 10) : null;
    const novo = { id: Date.now(), nome: S.novoJogadorNome.trim(), posicao: 'Personalizado', numero };
    const time = S.indiceAdversarioSelecionado !== null ? S.timeAdversario : S.timeSelecionado;
    const chave = String(time ? time.id : 'sem_time');
    personalizados[chave] = [...(personalizados[chave] || []), novo];
    store.set('personalizados', JSON.stringify(personalizados));
    if (S.indiceAdversarioSelecionado !== null) S.elencoAdversario = [...S.elencoAdversario, novo].sort(porNome);
    else S.elenco = [...S.elenco, novo].sort(porNome);
    S.novoJogadorNome = ''; S.novoJogadorNumero = ''; desfocar(); S.showAdicionarJogadorModal = false;
    alerta('Sucesso', `${novo.nome} foi adicionado ao elenco!`);
  }
  function limparCampo() {
    alerta('Limpar Campo', S.modoConfronto ? 'Deseja remover todos os jogadores de ambos os times?' : 'Deseja remover todos os jogadores do campo?', [
      { texto: 'Cancelar' },
      { texto: 'Limpar', acao: () => { S.jogadoresCampo = Array(11).fill(null); S.jogadoresAdversario = Array(11).fill(null); desselecionarTudo(); } },
    ]);
  }
  function prepararSalvar() {
    if (!S.timeSelecionado && !S.modoConfronto) { alerta('Vazio', 'Selecione um time ou monte um confronto para salvar.'); return; }
    S.nomeEscalacao = S.modoConfronto
      ? `${(S.timeSelecionado && S.timeSelecionado.nome) || 'Time A'} x ${(S.timeAdversario && S.timeAdversario.nome) || 'Time B'}`
      : `${(S.timeSelecionado && S.timeSelecionado.nome) || 'Meu Time'} (${S.esquema})`;
    S.modalSalvarVisible = true;
    later(60, () => focar('nomeEscalacao'));               // autoFocus
  }
  function confirmarSalvar() {
    if (!S.nomeEscalacao.trim()) { alerta('Erro', 'O nome não pode ficar vazio.'); return; }
    const nova = {
      id: Date.now(), nome: S.nomeEscalacao, data: new Date().toLocaleDateString('pt-BR'),
      modoConfronto: S.modoConfronto, divisao: S.divisao, timeSelecionado: S.timeSelecionado, timeAdversario: S.timeAdversario,
      esquema: S.esquema, esquemaAdversario: S.esquemaAdversario, jogadoresCampo: S.jogadoresCampo, jogadoresAdversario: S.jogadoresAdversario,
      posicoes: S.posicoes, posicoesAdversario: S.posicoesAdversario, corTime: S.corTime, corTimeAdversario: S.corTimeAdversario,
    };
    S.escalacoesSalvas = [nova, ...S.escalacoesSalvas];
    store.set('escalacoes', JSON.stringify(S.escalacoesSalvas));
    desfocar(); S.modalSalvarVisible = false;
    alerta('Sucesso', 'Escalação salva!');
  }
  function carregarEscalacao(item) {
    alerta('Carregar', `Substituir a tela atual por "${item.nome}"?`, [
      { texto: 'Cancelar' },
      { texto: 'Sim', acao: () => {
        S.divisao = item.divisao || 'Série A'; buscarTimesPlanilha(S.divisao);
        S.modoConfronto = item.modoConfronto;
        S.timeSelecionado = item.timeSelecionado; if (item.timeSelecionado) buscarElenco(item.timeSelecionado.id, false);
        S.timeAdversario = item.timeAdversario; if (item.timeAdversario) buscarElenco(item.timeAdversario.id, true);
        S.esquema = item.esquema; S.esquemaAdversario = item.esquemaAdversario;
        S.jogadoresCampo = item.jogadoresCampo; S.jogadoresAdversario = item.jogadoresAdversario;
        S.posicoes = item.posicoes; S.posicoesAdversario = item.posicoesAdversario;
        S.corTime = item.corTime; S.corTimeAdversario = item.corTimeAdversario;
        S.modalMinhasEscalacoesVisible = false; S.menuVisible = false;
      } },
    ]);
  }
  function deletarEscalacao(id) {
    alerta('Excluir', 'Tem certeza?', [
      { texto: 'Não' },
      { texto: 'Sim', acao: () => { S.escalacoesSalvas = S.escalacoesSalvas.filter((i) => i.id !== id); store.set('escalacoes', JSON.stringify(S.escalacoesSalvas)); } },
    ]);
  }
  function alternarConfronto() { S.modoConfronto = !S.modoConfronto; recalcularPosicoes(); atualizarCores(); }
  function elencoFiltrado(adversario) {
    const base = adversario ? S.elencoAdversario : S.elenco;
    if (S.buscaTexto.trim() === '') return base;
    const busca = removeAccents(S.buscaTexto.toLowerCase());
    return base.filter((j) => removeAccents(j.nome.toLowerCase()).includes(busca));
  }

  // Alert.alert do Android: título, mensagem e botões de texto à direita
  function alerta(titulo, msg, botoes) { S.alerta = { titulo, msg, botoes: botoes || [{ texto: 'OK' }], t: agora }; }

  // ---------------------------------------------------------------------------------------------
  // Campos de texto e teclado do Android (Gboard claro)
  // ---------------------------------------------------------------------------------------------
  const CAMPOS = {
    busca: { tipo: 'texto', estado: 'buscaTexto', ph: 'Pesquisar jogador...' },
    novoNome: { tipo: 'texto', estado: 'novoJogadorNome', ph: 'Ex: Neymar Jr', max: 30 },
    novoNumero: { tipo: 'numero', estado: 'novoJogadorNumero', ph: 'Ex: 10', max: 3 },
    nomeEscalacao: { tipo: 'texto', estado: 'nomeEscalacao', ph: 'Ex: Time Ideal' },
  };
  let teclado = { tipo: null, tw: tween(0, 0, 0), maius: false };  // tw: 0 fechado .. 1 aberto
  let focoT0 = 0;
  let teclaApertada = null;
  const ALT_NUM = 236, ALT_TXT = 280;
  const alturaTeclado = () => valor(teclado.tw) * (teclado.tipo === 'texto' ? ALT_TXT : ALT_NUM);
  function focar(id) {
    const tipo = CAMPOS[id].tipo === 'texto' ? 'texto' : 'numero';
    const aberto = S.foco && teclado.tipo === tipo;
    S.foco = id; focoT0 = agora;
    if (!aberto) { teclado.tipo = tipo; teclado.tw = tween(valor(teclado.tw), 1, 220); }
    teclado.maius = tipo === 'texto' && !S[CAMPOS[id].estado];  // Gboard começa em maiúscula num campo vazio
  }
  function desfocar() {
    if (!S.foco) return;
    S.foco = null;
    teclado.tw = tween(valor(teclado.tw), 0, 180);
  }
  function aplicarTecla(ch) {
    const id = S.foco; if (!id) return;
    const c = CAMPOS[id];
    let v = String(S[c.estado] == null ? '' : S[c.estado]);
    if (ch === '\b') v = v.slice(0, -1);
    else if (ch === '\n') { desfocar(); return; }
    else v += ch;
    if (c.tipo === 'numero') v = v.replace(/[^0-9]/g, '');
    if (c.max) v = v.slice(0, c.max);
    S[c.estado] = v;
  }
  let teclas = {};
  function rotuloTecla(ch) {
    if (ch === '\b') return 'apagar';
    if (ch === '\n') return 'enter';
    if (ch === ' ') return 'espaco';
    const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    if (teclado.tipo === 'texto' && /[0-9]/.test(base)) return 'qwertyuiop'['1234567890'.indexOf(base)];
    return base;
  }
  function desenharTeclado() {
    const h = alturaTeclado();
    teclas = {};
    if (h <= 0.5) return;
    const y0 = H - h;
    ctx.fillStyle = '#e8eaed'; ctx.fillRect(0, y0, W, H - y0);
    const tecla = (id, x, y, w, hh, rot, esp) => {
      teclas[id] = { x, y, w, h: hh };
      const ap = teclaApertada && teclaApertada.id === id && agora - teclaApertada.t < 110;
      caixa(x, y, w, hh, { bg: ap ? '#c5c9ce' : (esp ? '#d3d7dc' : '#ffffff'), r: 7, sombra: { dy: 1, blur: 0.5, cor: 'rgba(0,0,0,0.25)' } });
      if (rot) texto(rot, x + w / 2, y + (hh - 22 * LH) / 2, { size: esp ? 17 : 22, w: 400, color: '#202124', align: 'center' });
      toque('tecla.' + id, x, y, w, hh, () => apertar(id));
    };
    if (teclado.tipo === 'numero') {
      const gx = 6, gy = 8, kh = 46, cols = 4;
      const kw = (W - gx * (cols + 1)) / cols;
      const linhas = [['1', '2', '3', '-'], ['4', '5', '6', ' '], ['7', '8', '9', '\b'], [',', '0', '.', '\n']];
      linhas.forEach((ln, r) => ln.forEach((ch, c) => {
        const rot = { '\b': '⌫', ' ': '␣', '\n': '↵' }[ch] || ch;
        tecla(rotuloTecla(ch), gx + c * (kw + gx), y0 + gy + r * (kh + gy), kw, kh, rot, c === 3);
      }));
    } else {
      const top = y0 + 44, gx = 4, gy = 10, kh = 44;
      const kw = (W - gx * 11) / 10;
      const up = teclado.maius;
      const L = (s) => (up ? s.toUpperCase() : s);
      'qwertyuiop'.split('').forEach((ch, i) => tecla(ch, gx + i * (kw + gx), top, kw, kh, L(ch)));
      'asdfghjkl'.split('').forEach((ch, i) => tecla(ch, gx + kw / 2 + gx / 2 + i * (kw + gx), top + kh + gy, kw, kh, L(ch)));
      const r3 = top + 2 * (kh + gy), largEsp = kw * 1.5 + gx / 2;
      tecla('shift', gx, r3, largEsp, kh, '⇧', true);
      'zxcvbnm'.split('').forEach((ch, i) => tecla(ch, gx + largEsp + gx + i * (kw + gx), r3, kw, kh, L(ch)));
      tecla('apagar', W - gx - largEsp, r3, largEsp, kh, '⌫', true);
      const r4 = top + 3 * (kh + gy);
      tecla('num', gx, r4, largEsp, kh, '?123', true);
      tecla(',', gx + largEsp + gx, r4, kw, kh, ',', true);
      tecla('espaco', gx + largEsp + 2 * gx + kw, r4, W - 2 * (largEsp + kw) - 6 * gx - kw, kh, '', false);
      tecla('.', W - gx - largEsp - gx - kw * 2 - gx, r4, kw, kh, '.', true);
      tecla('enter', W - gx - largEsp - kw, r4, largEsp + kw, kh, '↵', true);
    }
  }
  function apertar(id) {
    teclaApertada = { id, t: agora };
    const mapa = { apagar: '\b', enter: '\n', espaco: ' ' };
    if (id === 'shift' || id === 'num') { teclado.maius = !teclado.maius; return; }
    let ch = mapa[id] != null ? mapa[id] : id;
    if (teclado.tipo === 'texto' && teclado.maius && ch.length === 1) { ch = ch.toUpperCase(); teclado.maius = false; }
    aplicarTecla(ch);
  }

  // ---------------------------------------------------------------------------------------------
  // Desenho: texto, caixas, emoji, imagens
  // ---------------------------------------------------------------------------------------------
  let ctx = null;
  const LH = 1.172, ASC = 0.928;
  const FAMILIA = 'Roboto, "Segoe UI Symbol", sans-serif';
  const fonte = (size, peso = 700, italic = false) => `${italic ? 'italic ' : ''}${peso} ${size}px ${FAMILIA}`;
  const EMO_RE = /((?![©®™✓✕])\p{Extended_Pictographic}️?)/u;
  const EMO_SPLIT = /((?![©®™✓✕])\p{Extended_Pictographic}️?)/gu;
  const EMO_AV = 1.25, EMO_SZ = 1.17, EMO_TOP = 0.93;
  const EMOJIS_USADOS = ['1f4be', '1f5d1', '1f4c2', '1f3c6', '26bd'];
  const codigoEmoji = (e) => [...e].map((c) => c.codePointAt(0)).filter((c) => c !== 0xfe0f).map((c) => c.toString(16)).join('_');
  const partesEmoji = (s) => String(s).split(EMO_SPLIT).filter((p) => p !== '');
  function prep(o) { ctx.font = fonte(o.size || 14, o.w != null ? o.w : 400, o.italic); ctx.letterSpacing = (o.ls || 0) + 'px'; }
  function larg(str, o) {
    if (!EMO_RE.test(str)) { prep(o); return ctx.measureText(str).width; }
    const size = o.size || 14;
    return partesEmoji(str).reduce((a, p) => a + (EMO_RE.test(p) ? size * EMO_AV : (prep(o), ctx.measureText(p).width)), 0);
  }
  function texto(str, x, y, o) {
    prep(o);
    const size = o.size || 14, lh = o.lh || size * LH;
    ctx.fillStyle = o.color || '#000'; ctx.textAlign = o.align || 'left'; ctx.textBaseline = 'alphabetic';
    const base = y + (lh - size * LH) / 2 + size * ASC;
    if (o.sombra) { ctx.save(); ctx.shadowColor = o.sombra.cor; ctx.shadowBlur = o.sombra.blur * DPR; ctx.shadowOffsetX = o.sombra.dx * DPR; ctx.shadowOffsetY = o.sombra.dy * DPR; }
    if (!EMO_RE.test(str)) ctx.fillText(str, x, base);
    else {
      const total = larg(str, o);
      let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
      for (const p of partesEmoji(str)) {
        if (EMO_RE.test(p)) {
          const im = imagem('emo_' + codigoEmoji(p)), s = size * EMO_SZ;
          if (im) ctx.drawImage(im, cx + (size * EMO_AV - s) / 2, base - size * EMO_TOP, s, s);
          cx += size * EMO_AV;
        } else { prep(o); ctx.fillStyle = o.color || '#000'; ctx.textAlign = 'left'; ctx.fillText(p, cx, base); cx += ctx.measureText(p).width; }
      }
    }
    if (o.sombra) ctx.restore();
    ctx.letterSpacing = '0px';
  }
  // numberOfLines={1}: corta com reticências
  function cortar(str, maxW, o) {
    if (larg(str, o) <= maxW) return str;
    let s = str;
    while (s.length > 1 && larg(s + '…', o) > maxW) s = s.slice(0, -1);
    return s + '…';
  }
  function quebrar(str, maxW, o) {
    const linhas = [];
    for (const par of String(str).split('\n')) {
      let atual = '';
      for (const p of par.split(' ')) {
        const t = atual ? atual + ' ' + p : p;
        if (larg(t, o) <= maxW || !atual) atual = t; else { linhas.push(atual); atual = p; }
      }
      linhas.push(atual);
    }
    return linhas;
  }
  function paragrafo(str, x, y, maxW, o) {
    const lh = o.lh || (o.size || 14) * LH, ls = quebrar(str, maxW, o);
    ls.forEach((l, i) => texto(l, o.align === 'center' ? x + maxW / 2 : x, y + i * lh, o));
    return ls.length * lh;
  }
  const alturaParagrafo = (str, maxW, o) => quebrar(str, maxW, o).length * (o.lh || (o.size || 14) * LH);
  function rr(x, y, w, h, r) { r = Math.max(0, Math.min(r || 0, w / 2, h / 2)); ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function caixa(x, y, w, h, o) {
    const r = o.r || 0;
    if (o.sombra) {
      ctx.save(); ctx.shadowColor = o.sombra.cor || 'rgba(0,0,0,0.18)'; ctx.shadowBlur = (o.sombra.blur || 4) * DPR;
      ctx.shadowOffsetY = (o.sombra.dy || 2) * DPR; rr(x, y, w, h, r); ctx.fillStyle = o.bg || '#fff'; ctx.fill(); ctx.restore();
    }
    if (o.bg) { rr(x, y, w, h, r); ctx.fillStyle = o.bg; ctx.fill(); }
    if (o.bw && o.bc) { const b = o.bw; rr(x + b / 2, y + b / 2, w - b, h - b, Math.max(0, r - b / 2)); ctx.lineWidth = b; ctx.strokeStyle = o.bc; ctx.stroke(); }
  }
  const pedidas = new Set();
  function imagem(chave, url) {
    if (scene.textures.exists(chave)) return scene.textures.get(chave).getSourceImage();
    if (url && !pedidas.has(chave)) { pedidas.add(chave); scene.load.image(chave, url); scene.load.start(); }
    return null;
  }
  function contain(im, x, y, w, h) {
    if (!im) return;
    const k = Math.min(w / im.width, h / im.height), dw = im.width * k, dh = im.height * k;
    ctx.drawImage(im, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  }
  // tintColor do Image do React Native: a silhueta da imagem pintada de uma cor só
  const tingidas = {};
  function tingida(chave, cor) {
    const k = chave + cor;
    if (tingidas[k]) return tingidas[k];
    const im = imagem(chave); if (!im) return null;
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
    const g = c.getContext('2d'); g.drawImage(im, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = cor; g.fillRect(0, 0, c.width, c.height);
    return (tingidas[k] = c);
  }

  // ---------------------------------------------------------------------------------------------
  // Toques (regiões por quadro), rolagem, toque longo e arrasto (modo "Mover Jogadores")
  // ---------------------------------------------------------------------------------------------
  let hits = [], hitsQuadro = [];
  let pressionado = null, soltos = {}, toques = [], mostrarToques = false;
  const pilhaClip = [];
  const clipAtual = () => (pilhaClip.length ? pilhaClip[pilhaClip.length - 1] : null);
  let desl = { x: 0, y: 0 };
  function toque(id, x, y, w, h, onPress, o = {}) {
    hits.push({ id, x: x + desl.x, y: y + desl.y, w, h, onPress: o.disabled ? null : onPress, onLong: o.onLong || null,
      arrastar: o.arrastar || null, tipo: 'toque', clip: clipAtual(), ehCampo: !!o.campo });
    const ao = o.ao != null ? o.ao : 0.2;
    if (pressionado && pressionado.id === id) return ao;
    if (soltos[id] != null) { const p = clamp01((agora - soltos[id]) / 150); if (p >= 1) delete soltos[id]; return ao + (1 - ao) * p; }
    return 1;
  }
  function bloqueio(onPress) { hits.push({ id: '__bloqueio', x: -1e4, y: -1e4, w: 3e4, h: 3e4, tipo: 'bloqueio', onPress: onPress || null }); }
  const comAlfa = (a, fn) => { if (a >= 1) { fn(); return; } ctx.save(); ctx.globalAlpha *= a; fn(); ctx.restore(); };
  const rolagens = {};
  function rolagem(id, x, y, w, h, conteudo, desenhar) {
    const r = rolagens[id] || (rolagens[id] = { v: 0, max: 0, anim: null, y, h });
    r.max = Math.max(0, conteudo - h); r.y = y + desl.y; r.h = h;
    if (r.anim) { r.v = valor(r.anim); if (agora - r.anim.t0 >= r.anim.dur) r.anim = null; }
    r.v = Math.max(0, Math.min(r.max, r.v));
    hits.push({ id: 'scroll:' + id, x: x + desl.x, y: y + desl.y, w, h, tipo: 'rolagem', clip: clipAtual() });
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    pilhaClip.push({ x: x + desl.x, y: y + desl.y, w, h });
    ctx.translate(0, -r.v);
    const antes = desl; desl = { x: antes.x, y: antes.y - r.v };
    desenhar(r);
    desl = antes;
    ctx.restore(); pilhaClip.pop();
  }
  function dentro(hh, px, py) {
    if (px < hh.x || py < hh.y || px > hh.x + hh.w || py > hh.y + hh.h) return false;
    if (hh.clip && (px < hh.clip.x || py < hh.clip.y || px > hh.clip.x + hh.clip.w || py > hh.clip.y + hh.clip.h)) return false;
    return true;
  }
  let gesto = null;
  function aoTocar(px, py) {
    let alvo = null, rol = null, bloq = null;
    for (let i = hitsQuadro.length - 1; i >= 0; i--) {
      const hh = hitsQuadro[i];
      if (!dentro(hh, px, py)) continue;
      if (hh.tipo === 'bloqueio') { bloq = hh; break; }
      if (hh.tipo === 'toque' && !alvo) { alvo = hh; continue; }
      if (hh.tipo === 'rolagem' && !rol) { rol = hh; break; }
    }
    gesto = { x0: px, y0: py, t0: agora, toque: alvo, rolagem: rol, bloq: !alvo ? bloq : null, v0: rol ? rolagens[rol.id.slice(7)].v : 0,
      arrastando: false, longo: false, arrasto: alvo && alvo.arrastar ? alvo : null };
    if (alvo && (alvo.onPress || alvo.onLong) && !gesto.arrasto) pressionado = { id: alvo.id, t: agora };
    if (mostrarToques) toques.push({ x: px, y: py, t: agora });
  }
  function aoMover(px, py) {
    if (!gesto) return;
    if (gesto.arrasto) { S.pan[gesto.arrasto.id] = { dx: px - gesto.x0, dy: py - gesto.y0 }; return; }
    const d = py - gesto.y0;
    if (!gesto.arrastando && gesto.rolagem && Math.abs(d) > 8) { gesto.arrastando = true; if (pressionado) { soltos[pressionado.id] = agora; pressionado = null; } }
    if (gesto.arrastando) { const r = rolagens[gesto.rolagem.id.slice(7)]; r.anim = null; r.v = Math.max(0, Math.min(r.max, gesto.v0 - d)); }
  }
  function aoSoltar(px, py) {
    if (!gesto) return;
    const g = gesto; gesto = null;
    if (g.arrasto) { g.arrasto.arrastar(px - g.x0, py - g.y0); delete S.pan[g.arrasto.id]; return; }
    if (pressionado) { soltos[pressionado.id] = agora; pressionado = null; }
    if (g.arrastando || g.longo) return;
    if (g.bloq && g.bloq.onPress) { g.bloq.onPress(); return; }
    if (!g.toque || !dentro(g.toque, px, py)) return;
    // FlatList com keyboardShouldPersistTaps padrão: com o teclado aberto, o 1º toque na lista só fecha o teclado
    if (S.foco && g.toque.clip && !g.toque.ehCampo && !g.toque.id.startsWith('tecla.')) { desfocar(); return; }
    if (g.toque.onPress) g.toque.onPress();
  }
  function verificarLongo() {
    if (gesto && !gesto.arrastando && !gesto.longo && !gesto.arrasto && gesto.toque && gesto.toque.onLong && agora - gesto.t0 >= 500) {
      gesto.longo = true;
      if (pressionado) { soltos[pressionado.id] = agora; pressionado = null; }
      gesto.toque.onLong();
    }
  }
  // Modal do React Native: fade ou slide (de baixo para cima), na entrada e na saída
  const modais = {};
  function modal(chave, visivel, tipo, desenhar) {
    const m = modais[chave] || (modais[chave] = { vis: false, t: -1e9 });
    if (visivel !== m.vis) {
      m.vis = visivel; m.t = agora;
      if (visivel && rolagens[chave]) { rolagens[chave].v = 0; rolagens[chave].anim = null; }   // lista reaberta volta ao topo
    }
    const dur = tipo === 'slide' ? 300 : 220;
    let p = clamp01((agora - m.t) / dur);
    if (!m.vis) { if (p >= 1) return; p = 1 - p; }
    ctx.save();
    const antes = desl, n = hits.length;
    if (tipo === 'slide') { const dy = H * (1 - suave(p)); ctx.translate(0, dy); desl = { x: antes.x, y: antes.y + dy }; } else ctx.globalAlpha *= p;
    desenhar(m.vis);
    desl = antes;
    if (!m.vis) hits.length = n;                 // modal saindo: já não recebe toques
    ctx.restore();
  }
  const centroV = (size, y, h) => y + (h - size * LH) / 2;

  // ---------------------------------------------------------------------------------------------
  // TELA PRINCIPAL: cabeçalho, campo e barra de informações
  // ---------------------------------------------------------------------------------------------
  const H_CABECALHO = 12 + 48 + 12 + 1;        // paddingVertical 12 + botão do elenco (48) + borda
  function cabecalho() {
    const y = STATUS, cy = y + 12 + 24;
    ctx.fillStyle = BARRA; ctx.fillRect(0, y, W, H_CABECALHO - 1);
    ctx.fillStyle = LINHA; ctx.fillRect(0, y + H_CABECALHO - 1, W, 1);
    // menu (três linhas)
    const mh = 8 + 3 * 7 + 8, my = cy - mh / 2;
    let a = toque('menu', 16, my, 40, mh, () => { S.menuVisible = true; });
    comAlfa(a, () => { for (let i = 0; i < 3; i++) caixa(16 + 8, my + 8 + 2 + i * 7, 24, 3, { bg: '#fff', r: 2 }); });
    // logo branco no meio (200 x 70, contain)
    const lg = tingida('logo', '#ffffff');
    if (lg) contain(lg, W / 2 - 100, cy - 35, 200, 70);
    // à direita: "?" (tutorial) e a camisa (elenco)
    const ex = W - 16 - 40, hx = ex - 15 - 28;
    a = toque('ajuda', hx, cy - 14, 28, 28, () => {});
    comAlfa(a, () => { caixa(hx, cy - 14, 28, 28, { bg: VERDE, r: 14 }); texto('?', hx + 14, centroV(14, cy - 14, 28), { size: 14, w: 700, color: '#fff', align: 'center' }); });
    a = toque('elenco', ex, cy - 24, 40, 48, abrirElenco);
    comAlfa(a, () => camiseta(ex + 4, cy - 16));
  }
  function camiseta(x, y) {            // ícone de camisa 32x32 feito de bordas (styles.camiseta*)
    ctx.save();
    ctx.lineWidth = 1.5; ctx.strokeStyle = '#fff';
    rr(x + 6 + 0.75, y + 8 + 0.75, 20 - 1.5, 20 - 1.5, 3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 2 + 8, y + 8 + 0.75); ctx.lineTo(x + 2 + 0.75 + 5, y + 8 + 0.75);
    ctx.arcTo(x + 2 + 0.75, y + 8 + 0.75, x + 2 + 0.75, y + 8 + 6, 5); ctx.lineTo(x + 2 + 0.75, y + 20 - 0.75 - 2);
    ctx.arcTo(x + 2 + 0.75, y + 20 - 0.75, x + 2 + 3, y + 20 - 0.75, 2.5); ctx.lineTo(x + 10, y + 20 - 0.75); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 22, y + 8 + 0.75); ctx.lineTo(x + 30 - 0.75 - 5, y + 8 + 0.75);
    ctx.arcTo(x + 30 - 0.75, y + 8 + 0.75, x + 30 - 0.75, y + 8 + 6, 5); ctx.lineTo(x + 30 - 0.75, y + 20 - 0.75 - 2);
    ctx.arcTo(x + 30 - 0.75, y + 20 - 0.75, x + 30 - 3, y + 20 - 0.75, 2.5); ctx.lineTo(x + 22, y + 20 - 0.75); ctx.stroke();
    ctx.fillStyle = FUNDO; ctx.beginPath(); ctx.moveTo(x + 13, y + 8); ctx.lineTo(x + 19, y + 8); ctx.lineTo(x + 16, y + 14); ctx.closePath(); ctx.fill();
    ctx.restore();
    texto('10', x + 16, y + 14, { size: 10, w: 700, color: '#fff', align: 'center' });
  }
  let campoRect = { x: 8, y: 0, w: 344, h: 400 };
  function campo(y0, y1) {
    const x = 8, y = y0 + 8, w = W - 16, h = y1 - y0 - 8 - 30;
    campoRect = { x, y, w, h };
    toque('campo', x, y, w, h, desselecionarTudo, { ao: 1 });      // tocar no gramado tira a seleção
    ctx.save(); rr(x, y, w, h, 8); ctx.clip();
    for (let i = 0; i < 10; i++) { ctx.fillStyle = i % 2 === 0 ? '#3cb371' : '#2E8B57'; ctx.fillRect(x, y + (h / 10) * i, w, h / 10 + 0.5); }
    const branco = '#fff';
    const contorno = (bx, by, bw, bh) => { ctx.strokeStyle = branco; ctx.lineWidth = 2; ctx.strokeRect(x + bx + 1, y + by + 1, bw - 2, bh - 2); };
    ctx.fillStyle = branco; ctx.fillRect(x + 5, y + h / 2 - 1, w - 10, 2);                    // linha do meio
    const raioMl = w * 0.09;
    ctx.strokeStyle = branco; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, raioMl - 1, 0, Math.PI * 2); ctx.stroke();   // círculo central
    ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, 4, 0, Math.PI * 2); ctx.fill();              // ponto central
    contorno(5, 5, w - 10, h - 10);                                                             // borda do campo
    const wGa = w * 0.6, hGa = h * 0.16, wPa = w * 0.25, hPa = h * 0.06;
    contorno(w / 2 - wGa / 2, 5, wGa, hGa); contorno(w / 2 - wGa / 2, h - 5 - hGa, wGa, hGa);   // grandes áreas
    contorno(w / 2 - wPa / 2, 5, wPa, hPa); contorno(w / 2 - wPa / 2, h - 5 - hPa, wPa, hPa);   // pequenas áreas
    ctx.beginPath(); ctx.arc(x + w / 2, y + 5 + hGa * 0.7 + 4, 4, 0, Math.PI * 2); ctx.fill();   // pênaltis
    ctx.beginPath(); ctx.arc(x + w / 2, y + h - 5 - hGa * 0.7 - 4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + w / 2, y + 5 + hGa - 2, raioMl - 1, 0, Math.PI); ctx.stroke();  // meias-luas
    ctx.beginPath(); ctx.arc(x + w / 2, y + h - 5 - hGa + 2, raioMl - 1, Math.PI, Math.PI * 2); ctx.stroke();
    const gol = (gy) => { ctx.fillStyle = branco; ctx.fillRect(x + w / 2 - w * 0.08, gy, w * 0.16, 5); ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.strokeRect(x + w / 2 - w * 0.08 + 0.5, gy + 0.5, w * 0.16 - 1, 4); };
    gol(y); gol(y + h - 5);
    ctx.restore();
    const raio = Math.max(20, Math.min(w, h) * 0.05);
    S.posicoes.forEach((pos, i) => jogadorNoCampo(i, pos, false, raio));
    if (S.modoConfronto) S.posicoesAdversario.forEach((pos, i) => jogadorNoCampo(i, pos, true, raio));
  }
  const UNIFORMES_DIVIDIDOS = { 'São Paulo': ['#FFFFFF', '#C8102E', '#000000'], 'Grêmio': ['#0097D7', '#000000', '#FFFFFF'], 'Fluminense': ['#00913E', '#8A1538', '#FFFFFF'] };
  function jogadorNoCampo(i, pos, adv, raio) {
    const { x, y, w, h } = campoRect;
    const id = (adv ? 'slotAdv.' : 'slot.') + i;
    const pan = S.pan[id] || { dx: 0, dy: 0 };
    const cx = x + w * pos[0] + pan.dx, cy = y + h * pos[1] + pan.dy;
    const jogador = adv ? S.jogadoresAdversario[i] : S.jogadoresCampo[i];
    const time = adv ? S.timeAdversario : S.timeSelecionado;
    const cor = adv ? S.corTimeAdversario : S.corTime;
    const selecionado = (adv ? S.indiceAdversarioSelecionado : S.indiceSelecionado) === i;
    let corFundo = jogador ? cor : (adv ? '#87CEEB' : (S.modoConfronto ? '#FF6B6B' : '#BBBBBB'));
    let corTexto = jogador ? (time ? time.corSecundaria : 'white') : 'white';
    let dividido = null;
    if (jogador && time && UNIFORMES_DIVIDIDOS[time.nome]) { dividido = UNIFORMES_DIVIDIDOS[time.nome]; corTexto = dividido[2]; }
    if (adv && jogador && time && !dividido && cor === time.corSecundaria) corTexto = time.cor;   // uniforme alternativo
    const soltar = (dx, dy) => {
      const lista = adv ? S.posicoesAdversario : S.posicoes;
      const nx = Math.max(0.05, Math.min(0.95, lista[i][0] + dx / w)), ny = Math.max(0.05, Math.min(0.95, lista[i][1] + dy / h));
      const nova = copiaPos(lista); nova[i] = [nx, ny];
      if (adv) S.posicoesAdversario = nova; else S.posicoes = nova;
    };
    const a = toque(id, cx - raio, cy - raio, raio * 2, raio * 2, () => { if (!S.modoMover) { if (adv) selecionarSlotAdversario(i); else selecionarSlot(i); } },
      { ao: 0.8, arrastar: S.modoMover ? soltar : null });
    if (selecionado) { ctx.strokeStyle = '#FFFF00'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, raio + 2.5, 0, Math.PI * 2); ctx.stroke(); }
    comAlfa(a, () => {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.3)'; ctx.shadowBlur = 3 * DPR; ctx.shadowOffsetY = 2 * DPR;
      ctx.beginPath(); ctx.arc(cx, cy, raio, 0, Math.PI * 2); ctx.fillStyle = dividido ? dividido[0] : corFundo; ctx.fill();
      ctx.restore();
      if (dividido) { ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, raio, 0, Math.PI * 2); ctx.clip(); ctx.fillStyle = dividido[1]; ctx.fillRect(cx - raio, cy, raio * 2, raio); ctx.restore(); }
      ctx.strokeStyle = selecionado ? '#FFFF00' : '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, raio - 1, 0, Math.PI * 2); ctx.stroke();
      if (jogador) texto(String(jogador.numero || '?'), cx, centroV(raio * 0.7, cy - raio, raio * 2), { size: raio * 0.7, w: 700, color: corTexto, align: 'center' });
      else if (!S.modoMover) texto('+', cx, centroV(raio * 1.2, cy - raio, raio * 2), { size: raio * 1.2, w: 700, color: corTexto, align: 'center' });
    });
    if (jogador) {
      const st = { size: 11, w: 700, color: '#fff', align: 'center', sombra: { cor: 'rgba(0,0,0,0.8)', dx: 1, dy: 1, blur: 2 } };
      texto(cortar(formatarNomeCurto(jogador.nome), 80, st), cx, cy + raio + 18 - 11 * LH, st);
    }
    if (selecionado && jogador && !S.modoMover) {
      const bx = cx + raio + 8 - 20, by = cy - raio - 8;
      const ar = toque((adv ? 'removerAdv.' : 'remover.') + i, bx, by, 20, 20, () => { if (adv) removerJogadorAdversario(i); else removerJogador(i); });
      comAlfa(ar, () => { caixa(bx, by, 20, 20, { bg: 'red', r: 10, bw: 1, bc: '#fff' }); texto('X', bx + 10, centroV(12, by, 20), { size: 12, w: 700, color: '#fff', align: 'center' }); });
    }
  }
  function alturaBarra() {
    const txt = textoBarra();
    const linhas = txt ? Math.min(2, quebrar(txt, larguraTextoBarra(), { size: 14 }).length) : 1;
    return 16 + Math.max(16 + 12 * LH, linhas * 14 * LH);
  }
  const textoBarra = () => (S.modoConfronto
    ? (S.timeSelecionado && S.timeAdversario ? `${S.timeSelecionado.nome} x ${S.timeAdversario.nome}` : '')
    : (S.timeSelecionado ? `${S.timeSelecionado.nome} • ${S.esquema}` : ''));
  const ROT_SALVAR = '💾 Salvar', ROT_LIMPAR = '🗑️ Limpar';
  const larguraBotoes = () => larg(ROT_SALVAR, { size: 12, w: 700 }) + 24 + 8 + 40 + 8 + larg(ROT_LIMPAR, { size: 12, w: 700 }) + 24;
  const larguraTextoBarra = () => W - 32 - larguraBotoes() - 10;
  function barraInfo() {
    const hb = alturaBarra(), y = H - NAV - hb;
    ctx.fillStyle = BARRA; ctx.fillRect(0, y, W, hb);
    const txt = textoBarra();
    if (txt) {
      const st = { size: 14, color: '#fff' };
      const ls = quebrar(txt, larguraTextoBarra(), st).slice(0, 2);
      const th = ls.length * 14 * LH;
      ls.forEach((l, k) => texto(k === 1 ? cortar(l, larguraTextoBarra(), st) : l, 16, y + (hb - th) / 2 + k * 14 * LH, st));
    }
    const bh = 16 + 12 * LH, by = y + (hb - bh) / 2;
    let bx = W - 16 - larguraBotoes();
    const botao = (id, rot, bg, bw, onPress, desenho) => {
      const a = toque(id, bx, by, bw, bh, onPress);
      const x0 = bx;
      comAlfa(a, () => { caixa(x0, by, bw, bh, { bg, r: 6 }); if (rot) texto(rot, x0 + bw / 2, by + 8, { size: 12, w: 700, color: '#fff', align: 'center' }); else desenho(x0, by); });
      bx += bw + 8;
    };
    botao('salvar', ROT_SALVAR, VERDE, larg(ROT_SALVAR, { size: 12, w: 700 }) + 24, prepararSalvar);
    botao('compartilhar', null, VERDE, 40, () => {}, (x0, y0) => iconeCompartilhar(x0 + 12, y0 + (bh - 16) / 2));
    botao('limpar', ROT_LIMPAR, '#FF6B6B', larg(ROT_LIMPAR, { size: 12, w: 700 }) + 24, limparCampo);
    return y;
  }
  function iconeCompartilhar(x, y) {          // Ionicons "share-social", 16 px
    const p = [[x + 12.3, y + 3.2], [x + 3.7, y + 8], [x + 12.3, y + 12.8]];
    ctx.save(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(...p[0]); ctx.lineTo(...p[1]); ctx.lineTo(...p[2]); ctx.stroke();
    ctx.fillStyle = '#fff'; for (const [a, b] of p) { ctx.beginPath(); ctx.arc(a, b, 2.6, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  function telaPrincipal() {
    ctx.fillStyle = FUNDO; ctx.fillRect(0, 0, W, H);
    cabecalho();
    const yBarra = barraInfo();
    campo(STATUS + H_CABECALHO, yBarra);
  }

  // ---------------------------------------------------------------------------------------------
  // MODAIS
  // ---------------------------------------------------------------------------------------------
  function menuItem(id, y, x, w, rotulo, valorTxt, toggle, onPress, o = {}) {
    const stR = { size: 16, color: o.corRotulo || '#fff', w: o.peso || 400 };
    const livre = w - (valorTxt != null ? larg(String(valorTxt), { size: 14 }) + 10 : 0);   // tela estreita: o rótulo quebra
    const hr = alturaParagrafo(rotulo, livre, stR);
    const hc = Math.max(hr, toggle != null ? 12 + 12 * LH : 16 * LH);
    const h = 32 + hc;
    const a = toque(id, x, y, w, h, onPress);
    comAlfa(a, () => {
      paragrafo(rotulo, x, y + (h - hr) / 2, livre, stR);
      if (toggle != null) {
        const tt = toggle ? 'ON' : 'OFF', tw = larg(tt, { size: 12, w: 700 }) + 24;
        caixa(x + w - tw, y + 16, tw, hc, { bg: toggle ? '#FFA500' : '#555', r: 15 });
        texto(tt, x + w - tw / 2, y + 16 + 6, { size: 12, w: 700, color: '#fff', align: 'center' });
      } else if (valorTxt != null) texto(String(valorTxt), x + w, centroV(14, y, h), { size: 14, color: VERDE, align: 'right' });
    });
    ctx.fillStyle = LINHA; ctx.fillRect(x, y + h, w, 1);
    return h + 1;
  }
  function modalMenu() {
    modal('menu', S.menuVisible, 'slide', (vis) => {
      if (vis) bloqueio(() => { S.menuVisible = false; });             // tocar fora do painel fecha
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, W, H);
      const pw = W * 0.75;
      if (vis) toque('menu.painel', 0, 0, pw, H, null);                  // o painel em si não fecha
      ctx.fillStyle = FUNDO; ctx.fillRect(0, 0, pw, H);
      const x = 20, w = pw - 40;
      let y = 50;
      texto('Configurações', x, y, { size: 24, w: 700, color: '#fff' });
      y += 24 * LH + 15; ctx.fillStyle = LINHA; ctx.fillRect(x, y, w, 1); y += 1 + 30;
      y += menuItem('menu.escalacoes', y, x, w, '📂 Minhas Escalações', S.escalacoesSalvas.length, null, () => { S.modalMinhasEscalacoesVisible = true; });
      y += menuItem('menu.milhao', y, x, w, '🏆 Jogo do Milhão do Futebol', 'Jogar', null, () => {});
      y += menuItem('menu.divisao', y, x, w, 'Divisão', S.divisao, null, () => { S.showDivisaoModal = true; });
      const nomeT = (t) => (t && t.nome) || 'Selecione';
      if (!S.modoConfronto) {
        y += menuItem('menu.time', y, x, w, 'Time', nomeT(S.timeSelecionado), null, () => { S.showTimeModal = true; });
      } else {
        y += menuItem('menu.time', y, x, w, 'Time 1 (Vermelho)', nomeT(S.timeSelecionado), null, () => { S.showTimeModal = true; });
        y += menuItem('menu.timeAdv', y, x, w, 'Time 2 (Azul)', nomeT(S.timeAdversario), null, () => { S.showTimeAdversarioModal = true; });
      }
      if (!S.modoConfronto) {
        y += menuItem('menu.esquema', y, x, w, 'Esquema Tático', S.esquema, null, () => { S.showEsquemaModal = true; });
      } else {
        y += menuItem('menu.esquema', y, x, w, 'Esquema Time 1', S.esquema, null, () => { S.showEsquemaModal = true; });
        y += menuItem('menu.esquemaAdv', y, x, w, 'Esquema Time 2', S.esquemaAdversario, null, () => { S.showEsquemaAdversarioModal = true; });
      }
      y += menuItem('menu.mover', y, x, w, 'Mover Jogadores', null, S.modoMover, () => { S.modoMover = !S.modoMover; });
      y += menuItem('menu.confronto', y, x, w, 'Modo Confronto', null, S.modoConfronto, alternarConfronto);
      y += 30;
      const fh = 28 + 16 * LH;
      const a = toque('menu.fechar', x, y, w, fh, () => { S.menuVisible = false; });
      comAlfa(a, () => { caixa(x, y, w, fh, { bg: LINHA, r: 8 }); texto('Fechar', x + w / 2, y + 14, { size: 16, w: 700, color: '#fff', align: 'center' }); });
    });
  }
  // Modal transparente sem statusBarTranslucent: no Android a janela começa embaixo da barra de status
  function fundoModal(vis, fechar) {
    if (vis) bloqueio(fechar);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, STATUS, W, H - STATUS);
  }
  const H_ITEM = 24 + 16 * LH;
  function seletor(chave, visivel, titulo, itens, grande, fechar) {
    modal(chave, visivel, 'fade', (vis) => {
      fundoModal(vis, fechar);
      const mx = grande ? 20 : 30, x = mx, w = W - 2 * mx, iw = w - 40;
      const y = STATUS + (grande ? 80 : 100);
      const hTit = 18 * LH + 15;
      const alturaItens = itens.reduce((s, it) => s + (it.mt || 0) + Math.max(H_ITEM, it.cor ? 24 + 20 : 0) + 5, 0);
      const hLista = grande ? Math.min(alturaItens, H * 0.5) : alturaItens;
      caixa(x, y, w, 20 + hTit + hLista + 20 - (grande ? 0 : 5), { bg: FUNDO, r: 12 });
      texto(titulo, x + w / 2, y + 20, { size: 18, w: 700, color: '#fff', align: 'center' });
      const desenharItens = (iy) => {
        for (const it of itens) {
          iy += it.mt || 0;
          const ih = Math.max(H_ITEM, it.cor ? 44 : 0), ix = x + 20;
          const a = toque(it.id, ix, iy, iw, ih, it.onPress);
          comAlfa(a, () => {
            if (it.copa) caixa(ix, iy, iw, ih, { bg: it.sel ? '#D4AF37' : '#2a2a40', r: 8, bw: 1, bc: '#D4AF37' });
            else if (it.sel) caixa(ix, iy, iw, ih, { bg: LINHA, r: 8 });
            const st = { size: 16, color: it.sel ? VERDE : '#fff', w: it.sel ? 700 : 400 };
            if (it.copa) {
              const stc = { size: 16, w: 700, color: it.sel ? '#000' : '#D4AF37' };
              const tw = 24 + 8 + larg(it.rotulo, stc), tx = ix + (iw - tw) / 2;
              contain(imagem('logo_copa'), tx, iy + (ih - 24) / 2, 24, 24);
              texto(it.rotulo, tx + 32, centroV(16, iy, ih), stc);
            } else if (it.cor) {
              ctx.beginPath(); ctx.arc(ix + 10 + 10, iy + ih / 2, 10, 0, Math.PI * 2); ctx.fillStyle = it.cor; ctx.fill();
              ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ix + 20, iy + ih / 2, 9.5, 0, Math.PI * 2); ctx.stroke();
              texto(it.rotulo, ix + 10 + 20 + 12, centroV(16, iy, ih), st);
            } else texto(it.rotulo, ix + 10, centroV(16, iy, ih), st);
          });
          iy += ih + 5;
        }
      };
      const ly = y + 20 + hTit;
      if (grande) rolagem(chave, x, ly, w, hLista, alturaItens, () => desenharItens(ly));
      else desenharItens(ly);
    });
  }
  function modaisSeletores() {
    seletor('divisao', S.showDivisaoModal, 'Selecione a Divisão', ['Série A', 'Série B', 'Copa do Mundo'].map((d) => ({
      id: 'divisao.' + d, rotulo: d, sel: S.divisao === d, copa: d === 'Copa do Mundo', mt: d === 'Copa do Mundo' ? 15 : 0,
      onPress: () => { mudarDivisao(d); S.showDivisaoModal = false; },
    })), false, () => { S.showDivisaoModal = false; });
    seletor('time', S.showTimeModal, S.modoConfronto ? 'Selecione Time 1 (Vermelho)' : 'Selecione o Time', S.times.map((t) => ({
      id: 'time.' + t.nome, rotulo: t.nome, cor: t.cor, sel: !!S.timeSelecionado && S.timeSelecionado.id === t.id, onPress: () => selecionarTime(t),
    })), true, () => { S.showTimeModal = false; });
    seletor('timeAdv', S.showTimeAdversarioModal, 'Selecione Time 2 (Azul)', S.times.map((t) => ({
      id: 'timeAdv.' + t.nome, rotulo: t.nome, cor: t.cor, sel: !!S.timeAdversario && S.timeAdversario.id === t.id, onPress: () => selecionarTimeAdversario(t),
    })), true, () => { S.showTimeAdversarioModal = false; });
    seletor('esquema', S.showEsquemaModal, S.modoConfronto ? 'Esquema Time 1 (Vermelho)' : 'Selecione o Esquema', Object.keys(ESQUEMAS_TATICOS).map((e) => ({
      id: 'esquema.' + e, rotulo: e, sel: S.esquema === e, onPress: () => { mudarEsquema(e); S.showEsquemaModal = false; },
    })), false, () => { S.showEsquemaModal = false; });
    seletor('esquemaAdv', S.showEsquemaAdversarioModal, 'Esquema Time 2 (Azul)', Object.keys(ESQUEMAS_TATICOS).map((e) => ({
      id: 'esquemaAdv.' + e, rotulo: e, sel: S.esquemaAdversario === e, onPress: () => { mudarEsquemaAdversario(e); S.showEsquemaAdversarioModal = false; },
    })), false, () => { S.showEsquemaAdversarioModal = false; });
  }
  // folha de baixo (elencoModal: marginTop 50, cantos de cima arredondados), com cabeçalho e "✕"
  function folha(titulo, idFechar, fechar) {
    const y = STATUS + 50;
    rr(0, y, W, H - y + 20, 20); ctx.fillStyle = FUNDO; ctx.fill();
    toque('folha.' + idFechar, 0, y, W, H - y, null);
    const hh = 16 + 36 + 16;
    texto(titulo, 16, centroV(20, y, hh), { size: 20, w: 700, color: '#fff' });
    const a = toque(idFechar, W - 16 - 36, y + 16, 36, 36, fechar);
    comAlfa(a, () => { caixa(W - 16 - 36, y + 16, 36, 36, { bg: LINHA, r: 18 }); texto('✕', W - 16 - 18, centroV(18, y + 16, 36), { size: 18, color: '#fff', align: 'center' }); });
    ctx.fillStyle = LINHA; ctx.fillRect(0, y + hh, W, 1);
    return y + hh + 1;
  }
  function campoTexto(idCampo, x, y, w, h, o = {}) {
    const c = CAMPOS[idCampo];
    toque('campo.' + idCampo, x, y, w, h, () => focar(idCampo), { campo: true, ao: 1 });
    caixa(x, y, w, h, { bg: BARRA, r: 10, bw: o.borda ? 1 : 0, bc: LINHA });
    const v = String(S[c.estado] || '');
    const ty = centroV(16, y, h);
    ctx.save(); rr(x + 1, y + 1, w - 2, h - 2, 9); ctx.clip();
    if (v) texto(v, x + 16, ty, { size: 16, color: '#fff' }); else texto(c.ph, x + 16, ty, { size: 16, color: '#888' });
    if (S.foco === idCampo && Math.floor((agora - focoT0) / 530) % 2 === 0) {
      ctx.fillStyle = ACENTO; ctx.fillRect(x + 16 + (v ? larg(v, { size: 16 }) : 0) + 1, ty + 1, 2, 16 * LH - 2);
    }
    ctx.restore();
  }
  const H_CARTAO = 24 + 40;
  function modalElenco() {
    modal('elenco', S.elencoVisible, 'slide', (vis) => {
      if (vis) bloqueio();
      const adv = S.indiceAdversarioSelecionado !== null;
      const nomeTime = adv ? ((S.timeAdversario && S.timeAdversario.nome) || 'Time 2') : ((S.timeSelecionado && S.timeSelecionado.nome) || 'Time 1');
      let y = folha('Elenco ' + nomeTime, 'elenco.fechar', fecharElenco);
      const hInp = 24 + 16 * LH;
      y += 10; campoTexto('busca', 16, y, W - 32, hInp); y += hInp + 10;
      const hAd = 24 + 14 * LH;
      const a = toque('elenco.adicionar', 16, y, W - 32, hAd, () => { S.showAdicionarJogadorModal = true; });
      comAlfa(a, () => { caixa(16, y, W - 32, hAd, { bg: '#FFA500', r: 10 }); texto('+ Adicionar Jogador Personalizado', W / 2, y + 12, { size: 14, w: 700, color: '#fff', align: 'center' }); });
      y += hAd + 10;
      if (S.loading) { spinner(W / 2, y + 40 + 18, 16, VERDE); return; }
      const lista = elencoFiltrado(adv);
      if (lista.length === 0) {
        const base = adv ? S.elencoAdversario : S.elenco;
        texto(base.length === 0 ? 'Selecione um time para ver o elenco' : 'Nenhum jogador encontrado', W / 2, y + 40, { size: 16, color: '#888', align: 'center' });
        return;
      }
      const escalados = adv ? S.jogadoresAdversario : S.jogadoresCampo;
      const hl = H - NAV - alturaTeclado() - y;
      rolagem('elenco', 0, y, W, hl, lista.length * (H_CARTAO + 8), () => {
        let iy = y;
        const vistos = {};
        lista.forEach((j) => {
          const ja = escalados.some((p) => p && p.id === j.id);
          const x = 16, w = W - 32;
          ctx.save(); if (ja) ctx.globalAlpha *= 0.5;
          caixa(x, iy, w, H_CARTAO, { bg: ja ? '#0f172a' : BARRA, r: 10 });
          texto(String(j.numero || '-'), x + 12 + 17.5, centroV(18, iy, H_CARTAO), { size: 18, w: 700, color: ja ? '#888' : VERDE, align: 'center' });
          const dx = x + 12 + 35 + 10, dw = w - 12 - 35 - 10 - 40 - 12;
          const hd = 15 * LH + 2 + 12 * LH, dy = iy + (H_CARTAO - hd) / 2;
          texto(cortar(j.nome, dw, { size: 15, w: 500 }), dx, dy, { size: 15, w: 500, color: ja ? '#aaa' : '#fff' });
          texto(((j.posicao || '?').substring(0, 3).toUpperCase()) + (ja ? ' • SELECIONADO' : ''), dx, dy + 15 * LH + 2, { size: 12, color: '#888' });
          ctx.restore();
          // id pelo nome (repetido ganha #2, #3...): "escalar.Gabriel Barbosa"
          vistos[j.nome] = (vistos[j.nome] || 0) + 1;
          const id = 'escalar.' + j.nome + (vistos[j.nome] > 1 ? '#' + vistos[j.nome] : '');
          const bx = x + w - 12 - 40, by = iy + 12;
          const ab = toque(id, bx, by, 40, 40, () => escalarJogador(j), { disabled: ja });
          comAlfa(ja ? 1 : ab, () => {
            ctx.save(); if (ja) ctx.globalAlpha *= 0.5;
            caixa(bx, by, 40, 40, { bg: ja ? '#444' : VERDE, r: 20 });
            texto(ja ? '✓' : '+', bx + 20, centroV(24, by, 40), { size: 24, w: 700, color: ja ? '#888' : '#fff', align: 'center' });
            ctx.restore();
          });
          iy += H_CARTAO + 8;
        });
      });
    });
  }
  // modal pequeno com campos (adicionarJogadorModal: marginTop 150, marginHorizontal 30)
  function modalFormulario(chave, visivel, titulo, campos, botoes, fechar) {
    modal(chave, visivel, 'fade', (vis) => {
      fundoModal(vis, fechar);
      const x = 30, w = W - 60, iw = w - 40, y = STATUS + 150;
      const hInp = 24 + 16 * LH + 2, hB = 24 + 16 * LH;
      const h = 20 + 18 * LH + 20 + campos.length * (10 + 14 * LH + 8 + hInp) + 20 + hB + 20;
      if (vis) toque(chave + '.caixa', x, y, w, h, null);
      caixa(x, y, w, h, { bg: FUNDO, r: 12 });
      let cy = y + 20;
      texto(titulo, x + w / 2, cy, { size: 18, w: 700, color: '#fff', align: 'center' });
      cy += 18 * LH + 20;
      for (const c of campos) {
        cy += 10; texto(c.rotulo, x + 20, cy, { size: 14, color: '#fff' }); cy += 14 * LH + 8;
        campoTexto(c.id, x + 20, cy, iw, hInp, { borda: true }); cy += hInp;
      }
      cy += 20;
      const bw = (iw - 10) / 2;
      botoes.forEach((b, i) => {
        const bx = x + 20 + i * (bw + 10);
        const a = toque(b.id, bx, cy, bw, hB, b.onPress);
        comAlfa(a, () => { caixa(bx, cy, bw, hB, { bg: b.bg, r: 8 }); texto(b.texto, bx + bw / 2, cy + 12, { size: 16, w: 700, color: '#fff', align: 'center' }); });
      });
    });
  }
  function modaisFormularios() {
    const fecharAdicionar = () => { desfocar(); S.showAdicionarJogadorModal = false; };
    modalFormulario('adicionar', S.showAdicionarJogadorModal, 'Adicionar Jogador Personalizado',
      [{ id: 'novoNome', rotulo: 'Nome do Jogador:' }, { id: 'novoNumero', rotulo: 'Número da Camisa (opcional):' }],
      [{ id: 'adicionar.cancelar', texto: 'Cancelar', bg: '#555', onPress: () => { S.novoJogadorNome = ''; S.novoJogadorNumero = ''; fecharAdicionar(); } },
        { id: 'adicionar.ok', texto: 'Adicionar', bg: VERDE, onPress: adicionarJogadorCustomizado }], fecharAdicionar);
    const fecharSalvar = () => { desfocar(); S.modalSalvarVisible = false; };
    modalFormulario('salvar', S.modalSalvarVisible, 'Salvar Escalação', [{ id: 'nomeEscalacao', rotulo: 'Nome:' }],
      [{ id: 'salvar.cancelar', texto: 'Cancelar', bg: '#555', onPress: fecharSalvar }, { id: 'salvar.ok', texto: 'Salvar', bg: VERDE, onPress: confirmarSalvar }], fecharSalvar);
  }
  function modalMinhasEscalacoes() {
    modal('escalacoes', S.modalMinhasEscalacoesVisible, 'slide', (vis) => {
      if (vis) bloqueio();
      const y = folha('Minhas Escalações', 'escalacoes.fechar', () => { S.modalMinhasEscalacoesVisible = false; });
      const lista = S.escalacoesSalvas;
      if (!lista.length) { texto('Nenhuma escalação salva.', W / 2, y + 40, { size: 16, color: '#888', align: 'center' }); return; }
      const hc = 24 + 16 * LH + 2 + 12 * LH;
      rolagem('escalacoes', 0, y, W, H - NAV - y, lista.length * (hc + 8), () => {
        let iy = y;
        lista.forEach((item, i) => {
          const x = 16, w = W - 32;
          caixa(x, iy, w, hc, { bg: BARRA, r: 10 });
          const a = toque('escalacao.' + i, x, iy, w - 40, hc, () => carregarEscalacao(item));
          comAlfa(a, () => {
            texto(cortar(item.nome, w - 70, { size: 16, w: 500 }), x + 12, iy + 12, { size: 16, w: 500, color: VERDE });
            texto(`${item.data} • ${item.modoConfronto ? 'Confronto' : 'Simples'}`, x + 12, iy + 12 + 16 * LH + 2, { size: 12, color: '#888' });
          });
          const bx = x + w - 12 - 20, by = iy + (hc - 20) / 2;
          const ar = toque('excluir.' + i, bx, by, 20, 20, () => deletarEscalacao(item.id));
          comAlfa(ar, () => { caixa(bx, by, 20, 20, { bg: '#FF6B6B', r: 10, bw: 1, bc: '#fff' }); texto('X', bx + 10, centroV(12, by, 20), { size: 12, w: 700, color: '#fff', align: 'center' }); });
          iy += hc + 8;
        });
      });
    });
  }
  function desenharAlerta() {
    modal('alerta', !!S.alerta, 'fade', (vis) => {
      const al = S.alerta || desenharAlerta.ultimo; if (!al) return; if (S.alerta) desenharAlerta.ultimo = S.alerta;
      if (vis) bloqueio();
      ctx.fillStyle = 'rgba(0,0,0,0.32)'; ctx.fillRect(0, 0, W, H);
      const cw = Math.min(W - 48, 312), iw = cw - 48;
      const stT = { size: 20, w: 500, color: '#212121' }, stM = { size: 16, color: '#757575', lh: 22 };
      const hT = alturaParagrafo(al.titulo, iw, stT), hM = alturaParagrafo(al.msg, iw, stM);
      const h = 24 + hT + 12 + hM + 20 + 36 + 8;
      const x = (W - cw) / 2, y = (H - h) / 2;
      caixa(x, y, cw, h, { bg: '#fff', r: 2, sombra: { dy: 6, blur: 16, cor: 'rgba(0,0,0,0.35)' } });
      paragrafo(al.titulo, x + 24, y + 24, iw, stT);
      paragrafo(al.msg, x + 24, y + 24 + hT + 12, iw, stM);
      let bx = x + cw - 8;
      const by = y + h - 8 - 36;
      [...al.botoes].reverse().forEach((b, i) => {
        const rot = b.texto.toUpperCase(), bw = larg(rot, { size: 14, w: 500, ls: 0.5 }) + 16;
        bx -= bw;
        const a = toque('alerta.' + (al.botoes.length - 1 - i), bx, by, bw, 36, () => { S.alerta = null; if (b.acao) b.acao(); });
        comAlfa(a, () => texto(rot, bx + bw / 2, by + (36 - 14 * LH) / 2, { size: 14, w: 500, color: ACENTO, align: 'center', ls: 0.5 }));
        bx -= 8;
      });
    });
  }
  function spinner(cx, cy, r, cor) {
    ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
    const a0 = (agora / 1000) * Math.PI * 2 * 1.1, arco = Math.PI * (0.6 + 0.5 * Math.sin(agora / 380));
    ctx.beginPath(); ctx.arc(cx, cy, r, a0, a0 + arco); ctx.stroke(); ctx.restore();
  }

  // ---------------------------------------------------------------------------------------------
  // Quadro
  // ---------------------------------------------------------------------------------------------
  function desenharQuadro() {
    ctx = scene.sys.game.context;
    ctx.save(); ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    hits = [];
    telaPrincipal();
    modalMenu();
    modaisSeletores();
    modalElenco();
    modalMinhasEscalacoes();
    modaisFormularios();
    desenharTeclado();
    desenharAlerta();
    toques = toques.filter((t) => agora - t.t < 450);
    for (const t of toques) {
      const p = (agora - t.t) / 450;
      ctx.save(); ctx.globalAlpha = 0.4 * (1 - p); ctx.fillStyle = '#ddd';
      ctx.beginPath(); ctx.arc(t.x, t.y, 14 + 20 * p, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    ctx.restore();
    hitsQuadro = hits;
  }

  class Cena extends Phaser.Scene {
    constructor() { super('app'); }
    preload() {
      scene = this;
      this.load.image('logo', '../app/assets/logo.png');
      this.load.image('logo_copa', '../app/assets/logo_copa.png');
      for (const c of EMOJIS_USADOS) this.load.image('emo_' + c, 'emoji/emoji_u' + c + '.png');
    }
    create() {
      try { S.escalacoesSalvas = JSON.parse(store.get('escalacoes') || '[]'); } catch (e) { S.escalacoesSalvas = []; }
      try { personalizados = JSON.parse(store.get('personalizados') || '{}'); } catch (e) { personalizados = {}; }
      S.elenco = personalizados.sem_time || [];
      buscarTimesPlanilha('Série A');
      recalcularPosicoes();
      this.input.on('pointerdown', (p) => aoTocar(p.x / DPR, p.y / DPR));
      this.input.on('pointermove', (p) => { if (p.isDown) aoMover(p.x / DPR, p.y / DPR); });
      this.input.on('pointerup', (p) => aoSoltar(p.x / DPR, p.y / DPR));
      this.sys.game.events.on('postrender', desenharQuadro);
      window.VE.pronto = true;
    }
    update(time, delta) { agora += Math.min(delta, 100); verificarLongo(); }
  }

  // ---------------------------------------------------------------------------------------------
  // Automação (adaptador do divulgacao-kit)
  // ---------------------------------------------------------------------------------------------
  const acharHit = (id) => hitsQuadro.slice().reverse().find((x) => x.id === id && x.tipo === 'toque');
  window.VE = {
    pronto: false, S,
    agora: () => agora,
    alvos: () => hitsQuadro.filter((h) => h.tipo === 'toque' && (h.onPress || h.onLong || h.arrastar)).map((h) => h.id),
    // toca como um dedo: aperta, segura 110 ms e solta
    tocar(id) {
      const h = acharHit(id); if (!h) return false;
      const px = h.x + h.w / 2, py = h.y + h.h / 2;
      aoTocar(px, py); later(110, () => aoSoltar(px, py));
      return true;
    },
    segurar(id, ms = 700) {
      const h = acharHit(id); if (!h) return false;
      const px = h.x + h.w / 2, py = h.y + h.h / 2;
      aoTocar(px, py); later(ms, () => aoSoltar(px, py));
      return true;
    },
    // digita no campo pelas teclas do teclado desenhado (cada tecla realçada), uma a cada `intervalo` ms
    digitar(campo, str, intervalo = 130) {
      if (S.foco !== campo) { if (!this.tocar('campo.' + campo)) return false; }
      const inicio = S.foco === campo ? 0 : 450;                // espera o teclado subir
      [...str].forEach((ch, i) => later(inicio + i * intervalo, () => {
        if (!S.foco) return;
        teclaApertada = { id: rotuloTecla(ch), t: agora };
        if (teclado.maius && ch.length === 1 && ch !== ch.toUpperCase()) teclado.maius = false;
        aplicarTecla(ch);
      }));
      return inicio + str.length * intervalo;
    },
    apagar(campo, n, intervalo = 90) { return this.digitar(campo, '\b'.repeat(n), intervalo); },
    limpar(campo, intervalo = 70) { const v = String(S[CAMPOS[campo].estado] || ''); return this.digitar(campo, '\b'.repeat(v.length), intervalo); },
    fecharTeclado() { desfocar(); },
    // rolagem de uma lista ("elenco", "time", "timeAdv", "escalacoes"): px, 'topo', 'fim' ou o id de um item
    rolar(lista, alvo, ms = 600) {
      const r = rolagens[lista]; if (!r) return false;
      let v = alvo;
      if (alvo === 'topo') v = 0;
      else if (alvo === 'fim') v = r.max;
      else if (typeof alvo === 'string') { const h = hitsQuadro.find((x) => x.id === alvo); if (!h) return false; v = r.v + (h.y - r.y) - 8; }
      r.anim = tween(r.v, Math.max(0, Math.min(r.max, v)), ms);
      return true;
    },
    // arrasta um jogador no modo "Mover Jogadores": id "slot.N"/"slotAdv.N", deslocamento em dp, duração
    arrastar(id, dx, dy, ms = 700) {
      const h = acharHit(id); if (!h || !h.arrastar) return false;
      const px = h.x + h.w / 2, py = h.y + h.h / 2, passos = Math.max(2, Math.round(ms / 33));
      aoTocar(px, py);
      for (let k = 1; k <= passos; k++) {
        const p = suave(k / passos);
        later((ms * k) / passos, () => { if (k < passos) aoMover(px + dx * p, py + dy * p); else aoSoltar(px + dx, py + dy); });
      }
      return true;
    },
    mostrarToques(v) { mostrarToques = !!v; },
  };

  const carregarJson = (arq) => fetch('dados/' + arq).then((r) => r.json());
  Promise.all([
    carregarJson('base.json'), carregarJson('elencos.json'), carregarJson('elencos_copa_2026.json'),
    fetch('dados/times.csv').then((r) => r.text()),
    ...['700 16px Roboto', '400 16px Roboto', '500 16px Roboto'].map((f) => document.fonts.load(f).catch(() => {})),
  ]).then(([base, elencos, copa, csv]) => {
    DB_TIMES = base.times; ESQUEMAS_TATICOS = base.esquemas; MAPA_IDS_COPA = base.mapaIdsCopa;
    ELENCOS = elencos.elencos; ELENCOS_COPA = copa.teams; PLANILHA = csv;
    medir();
    const game = new Phaser.Game({
      type: Phaser.CANVAS, parent: 'game', backgroundColor: FUNDO,
      scale: { mode: Phaser.Scale.NONE, width: Math.round(W * DPR), height: Math.round(H * DPR), zoom: 1 / DPR },
      scene: [Cena],
    });
    window.veGame = game;
    window.addEventListener('resize', () => { medir(); game.scale.resize(Math.round(W * DPR), Math.round(H * DPR)); });
  });
})();

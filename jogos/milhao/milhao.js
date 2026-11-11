/* Jogo do Milhão do Futebol (versão web, na identidade do Tapa na Gaveta).
   Regras em milhao-core.js; aqui só telas, tempo, sons e o que fica salvo (tng.milhao.*). */
(function () {
  'use strict';
  const M = window.MilhaoCore;
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PLAY = 'https://play.google.com/store/apps/details?id=com.julio333.ShowMilhaoFutebol&referrer=' + encodeURIComponent('utm_source=tapanagaveta&utm_medium=jogos');

  // armazenamento protegido (chaves são contrato)
  const KEY = { recorde: 'tng.milhao.recorde', som: 'tng.milhao.som', modos: 'tng.milhao.modos', partidas: 'tng.milhao.partidas' };
  const ler = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } };

  // ------------------------------------------------------------------ sons (carregados só quando tocam)
  const ARQ = { 1000: 'mil', 2000: '2mil', 3000: '3mil', 4000: '4mil', 5000: '5mil', 10000: '10mil', 20000: '20mil', 30000: '30mil', 40000: '40mil', 50000: '50mil', 100000: '100mil', 200000: '200mil', 300000: '300mil', 400000: '400mil', 500000: '500mil', 1000000: '1milhao',
    gol: 'gol', errou: 'errou', parar: 'parar', parabens: 'parabens', grana: 'grana', cartoes: 'cartao', var: 'var', torcida: 'torcida', driblar: 'finta', apito: 'apito' };
  const audios = {};
  function som(k) {
    if (!ler(KEY.som, true) || !ARQ[k]) return;
    try {
      const a = audios[k] || (audios[k] = new Audio('sons/' + ARQ[k] + '.mp3'));
      a.currentTime = 0;
      const p = a.play();
      if (p && p.catch) p.catch(() => null);                 // navegador sem permissão de som: segue mudo
    } catch (e) { /* sem som */ }
  }
  function calarTudo() { Object.keys(audios).forEach((k) => { try { audios[k].pause(); } catch (e) { /* ok */ } }); }

  // ------------------------------------------------------------------ ícones (traço próprio, sem emojis)
  const IC = {
    cartoes: '<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="7" width="12" height="17" rx="2" transform="rotate(-10 11 15)" fill="#f2c94c"/><rect x="14" y="7" width="12" height="17" rx="2" transform="rotate(8 20 15)" fill="#e5533d"/></svg>',
    var: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="4" y="6" width="24" height="16" rx="2"/><path d="M12 26h8M16 22v4"/><path d="M9 14l3 3 4-6 3 4 4-3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    torcida: '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><circle cx="9" cy="11" r="3"/><circle cx="16" cy="9" r="3.4"/><circle cx="23" cy="11" r="3"/><path d="M3 24c0-4 3-7 6-7s6 3 6 7zM10 24c0-5 3-9 6-9s6 4 6 9zM17 24c0-4 3-7 6-7s6 3 6 7z" opacity=".85"/></svg>',
    driblar: '<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 22c4 0 5-12 11-12s6 8 11 8"/><path d="M23 14l4 4-4 4"/><circle cx="7" cy="9" r="2.5" fill="currentColor" stroke="none"/></svg>',
    som: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/></svg>',
    mudo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
  };
  const AJUDAS = [
    ['cartoes', 'Cartões', 'Escolha um dos quatro cartões: ele elimina de zero a três alternativas erradas.'],
    ['var', 'VAR', 'O árbitro de vídeo mostra qual é a resposta certa.'],
    ['torcida', 'Torcida', 'A torcida dá os palpites dela. Costuma acertar, mas não sempre.'],
    ['driblar', 'Driblar', 'Pula a pergunta e traz outra do mesmo valor, sem perder nada.'],
  ];

  // ------------------------------------------------------------------ estado
  let banco = null;
  const st = { tela: 'inicio', modos: ler(KEY.modos, ['brasileiro']), lista: [], i: 0, usados: [], ajudas: {}, dribles: 0,
    eliminadas: [], escolha: -1, fase: 'pergunta', tempo: M.TEMPO, timer: 0, votos: null, var: false, premio: 0, fim: '' };

  function carregar() {
    return fetch('perguntas.json').then((r) => { if (!r.ok) throw new Error('perguntas ' + r.status); return r.json(); }).then((b) => { banco = b; });
  }

  // ------------------------------------------------------------------ tempo
  function iniciarTempo() {
    pararTempo();
    st.tempo = M.TEMPO;
    let ultimo = performance.now();
    st.timer = setInterval(() => {
      if (document.hidden || $('#janela').hidden === false) { ultimo = performance.now(); return; }   // aba escondida ou janela aberta: pausa
      const agora = performance.now();
      st.tempo -= Math.min(1.5, (agora - ultimo) / 1000);           // um travamento não "come" o tempo
      ultimo = agora;
      desenharTempo();
      if (st.tempo <= 0) { pararTempo(); tempoEsgotado(); }
    }, 200);
  }
  function pararTempo() { clearInterval(st.timer); st.timer = 0; }
  function desenharTempo() {
    const el = $('#relogio');
    if (!el) return;
    const t = Math.max(0, Math.ceil(st.tempo)), f = Math.max(0, st.tempo) / M.TEMPO;
    el.querySelector('b').textContent = t;
    el.querySelector('circle.anda').style.strokeDashoffset = String(113.1 * (1 - f));
    el.classList.toggle('pouco', t <= 10);
  }

  // ------------------------------------------------------------------ telas
  function inicio() {
    pararTempo();
    st.tela = 'inicio';
    const rec = ler(KEY.recorde, 0);
    $('#jogo').innerHTML =
      '<div class="inicio"><div class="marca"><span class="m-pre">Jogo do</span><span class="m-milhao">Milhão</span><span class="m-pos">do futebol</span></div>' +
      '<p class="lead">16 perguntas, de R$ 1 mil a R$ 1 milhão. 45 segundos para cada uma, quatro ajudas e a coragem de parar na hora certa.</p>' +
      '<fieldset class="modos"><legend>Sobre o que você quer jogar?</legend>' + M.MODOS.map((m) =>
        '<label class="modo"><input type="checkbox" value="' + m.id + '"' + (st.modos.indexOf(m.id) >= 0 ? ' checked' : '') + '><span>' + esc(m.nome) + '</span></label>').join('') + '</fieldset>' +
      '<button class="btn grande" data-a="comecar">Começar</button>' +
      (rec ? '<p class="recorde">Seu recorde: <b>' + M.moeda(rec) + '</b></p>' : '') +
      '<details class="regras"><summary>Como funciona</summary><ul>' +
      '<li>Acertou, sobe um degrau. Pode parar a qualquer momento e levar o que já ganhou.</li>' +
      '<li>Errou ou o tempo acabou: leva a metade do que levaria se tivesse parado.</li>' +
      '<li>Na pergunta do milhão, errar leva a zero. Dá para desistir com R$ 500 mil.</li>' +
      AJUDAS.map((a) => '<li><b>' + a[1] + ':</b> ' + esc(a[2]) + (a[0] === 'driblar' ? ' Vale duas vezes por partida.' : ' Vale uma vez por partida.') + '</li>').join('') +
      '</ul></details>' +
      '<a class="app" href="' + PLAY + '" target="_blank" rel="noopener"><img src="../../midia/icones/milhao-do-futebol.png" alt="" width="44" height="44"><span><b>Jogo do Milhão no celular</b><small>Presente diário, pergunta do dia e loja da arbitragem. Baixe no Google Play</small></span></a></div>' +
      barraSom();
  }
  function barraSom() {
    const ligado = ler(KEY.som, true);
    return '<button class="som" data-a="som" aria-label="' + (ligado ? 'Desligar o som' : 'Ligar o som') + '" aria-pressed="' + !ligado + '">' + (ligado ? IC.som : IC.mudo) + '</button>';
  }

  function comecar() {
    const marcados = Array.from(document.querySelectorAll('.modos input:checked')).map((x) => x.value);
    st.modos = marcados.length ? marcados : ['brasileiro'];
    if (st.modos.indexOf('escudos') >= 0) st.modos = ['escudos'];
    gravar(KEY.modos, st.modos);
    st.lista = M.gerarLista(banco, st.modos);
    st.usados = st.lista.map((p) => p.id);
    st.i = 0;
    st.ajudas = { cartoes: 1, var: 1, torcida: 1 };
    st.dribles = M.DRIBLES;
    st.tela = 'jogo';
    gravar(KEY.partidas, ler(KEY.partidas, 0) + 1);
    som('apito');
    novaPergunta();
  }

  function novaPergunta() {
    st.eliminadas = []; st.escolha = -1; st.fase = 'pergunta'; st.votos = null; st.var = false;
    desenharJogo();
    som(String(M.PREMIOS[st.i]));
    iniciarTempo();
  }

  function desenharJogo() {
    const p = st.lista[st.i];
    const fim = st.fase === 'certa' || st.fase === 'errada' || st.fase === 'tempo';
    $('#jogo').innerHTML =
      '<div class="palco"><aside class="escada" aria-label="Prêmios"><ol>' + M.PREMIOS.slice().reverse().map((v, k) => {
        const idx = 15 - k;
        return '<li class="' + (idx === st.i ? 'atual' : idx < st.i ? 'feita' : '') + (idx === 15 ? ' milhao' : '') + '"><span>' + (idx + 1) + '</span>' + M.moeda(v) + '</li>';
      }).join('') + '</ol></aside>' +
      '<section class="mesa"><div class="topo"><div class="degrau"><span>Pergunta ' + (st.i + 1) + ' de 16</span><b>Valendo ' + M.moeda(M.PREMIOS[st.i]) + '</b></div>' +
      '<div class="relogio" id="relogio" role="timer" aria-label="Tempo restante"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="18"/><circle class="anda" cx="20" cy="20" r="18"/></svg><b>' + Math.ceil(st.tempo) + '</b></div></div>' +
      '<div class="trilha" aria-hidden="true">' + M.PREMIOS.map((v, k) => '<i class="' + (k < st.i ? 'feita' : k === st.i ? 'atual' : '') + '"></i>').join('') + '</div>' +
      '<div class="pergunta">' + (p.tipo === 'escudo' ? '<img class="escudo" src="../../midia/escudos/' + esc(p.escudo) + '.png" alt="Escudo">' : '') + '<h1>' + esc(p.pergunta) + '</h1></div>' +
      '<ol class="alternativas">' + p.alternativas.map((a, k) => {
        let cls = '';
        if (st.eliminadas.indexOf(k) >= 0) cls = 'fora';
        if (st.escolha === k) cls += ' escolhida';
        if (fim && k === p.correta) cls += ' certa';
        if (st.fase === 'errada' && k === st.escolha) cls += ' errada';
        if (st.var && k === p.correta) cls += ' var';
        const voto = st.votos ? '<i class="voto" style="--v:' + st.votos[k] + '%"></i>' : '';
        return '<li><button class="alt ' + cls + '" data-alt="' + k + '"' + (st.votos ? ' data-voto="' + st.votos[k] + '%"' : '') + '' + (st.eliminadas.indexOf(k) >= 0 || fim ? ' disabled' : '') + '><span class="n">' + (k + 1) + '</span><span class="t">' + esc(a) + '</span>' + voto + '</button></li>';
      }).join('') + '</ol>' +
      (st.fase === 'confirmar' ? '<div class="confirma"><span>Está certo disso?</span><button class="btn" data-a="nao">Não</button><button class="btn sim" data-a="sim">Sim, é a ' + (st.escolha + 1) + '</button></div>' : '') +
      '<div class="dinheiro"><button class="btn parar" data-a="parar"' + (fim ? ' disabled' : '') + '>Parar<small>leva ' + M.moeda(M.premioParar(st.i)) + '</small></button>' +
      '<div class="d-info"><span>Acertar <b>' + M.moeda(M.premioAcertar(st.i)) + '</b></span><span>Errar <b>' + M.moeda(M.premioErrar(st.i)) + '</b></span></div></div>' +
      '<div class="ajudas">' + AJUDAS.map(([id, nome]) => {
        const n = id === 'driblar' ? st.dribles : st.ajudas[id] || 0;
        return '<button class="ajuda" data-ajuda="' + id + '"' + (!n || fim ? ' disabled' : '') + ' aria-label="' + nome + (n ? '' : ' (usada)') + '">' + IC[id] + '<span>' + nome + '</span>' + (id === 'driblar' ? '<em>' + n + '</em>' : '') + '</button>';
      }).join('') + '</div></section></div>' + barraSom();
    desenharTempo();
  }

  function responder(k) {
    if (st.fase !== 'pergunta' && st.fase !== 'confirmar') return;
    st.escolha = k; st.fase = 'confirmar';
    desenharJogo();
  }
  function confirmar() {
    const p = st.lista[st.i];
    pararTempo();
    if (st.escolha === p.correta) {
      st.fase = 'certa';
      som('gol');
      desenharJogo();
      setTimeout(() => {
        if (st.tela !== 'jogo') return;
        if (st.i === 15) { terminar('vitoria', 1000000); return; }
        st.i++;
        if (st.i === 15) { perguntaDoMilhao(); return; }
        novaPergunta();
      }, 1500);
    } else {
      st.fase = 'errada';
      som('errou');
      desenharJogo();
      setTimeout(() => terminar('errou', M.premioErrar(st.i)), 2200);
    }
  }
  function tempoEsgotado() {
    if (st.tela !== 'jogo' || !(st.fase === 'pergunta' || st.fase === 'confirmar')) return;
    st.fase = 'tempo';
    som('errou');
    desenharJogo();
    setTimeout(() => terminar('tempo', M.premioErrar(st.i)), 2200);
  }

  function perguntaDoMilhao() {
    abrirJanela('<h2>A pergunta do milhão</h2><p>Se acertar, leva <b>R$ 1 milhão</b>. Se errar, sai com <b>nada</b>. Se parar agora, leva <b>R$ 500 mil</b>.</p>' +
      '<div class="j-botoes"><button class="btn" data-j="parar500">Parar com R$ 500 mil</button><button class="btn sim" data-j="arriscar">Arriscar</button></div>', (a) => {
      if (a === 'parar500') { som('parar'); terminar('parou', 500000); } else novaPergunta();
    }, true);
  }

  function parar() {
    const v = M.premioParar(st.i);
    abrirJanela('<h2>Parar agora?</h2><p>Você sai com <b>' + M.moeda(v) + '</b>.</p><div class="j-botoes"><button class="btn" data-j="nao">Continuar jogando</button><button class="btn sim" data-j="sim">Parar</button></div>', (a) => {
      if (a === 'sim') { pararTempo(); som('parar'); terminar('parou', v); }
    });
  }

  // ------------------------------------------------------------------ ajudas
  function ajuda(id) {
    const n = id === 'driblar' ? st.dribles : st.ajudas[id];
    if (!n || !(st.fase === 'pergunta' || st.fase === 'confirmar')) return;
    const txt = AJUDAS.find((a) => a[0] === id);
    abrirJanela('<div class="j-ic">' + IC[id] + '</div><h2>' + txt[1] + '</h2><p>' + esc(txt[2]) + '</p><div class="j-botoes"><button class="btn" data-j="nao">Agora não</button><button class="btn sim" data-j="sim">Usar</button></div>', (a) => {
      if (a !== 'sim') return;
      som(id);
      const p = st.lista[st.i];
      if (id === 'driblar') {
        st.dribles--;
        const nova = M.substituta(banco, st.modos, st.i, st.usados);
        if (nova) { st.lista[st.i] = nova; st.usados.push(nova.id); }
        novaPergunta();
        return;
      }
      st.ajudas[id] = 0;
      if (id === 'var') { st.var = true; desenharJogo(); }
      else if (id === 'torcida') { st.votos = M.torcida(p.correta); desenharJogo(); }
      else if (id === 'cartoes') cartoes(p);
    });
  }
  function cartoes(p) {
    abrirJanela('<h2>Escolha um cartão</h2><p>Ele diz quantas alternativas erradas vão sair.</p><div class="cartas">' + [0, 1, 2, 3].map((k) =>
      '<button class="carta ' + (k < 2 ? 'amarela' : 'vermelha') + '" data-j="c' + k + '" aria-label="Cartão ' + (k + 1) + '">?</button>').join('') + '</div>', (a, el) => {
      const k = +a.slice(1), r = M.cartoes(p.correta, k);
      el.querySelectorAll('.carta').forEach((b, q) => { b.textContent = r.valores[q]; b.disabled = true; b.classList.toggle('virada', q === k); });
      el.querySelector('p').innerHTML = r.qtd ? 'Saem <b>' + r.qtd + (r.qtd === 1 ? ' alternativa errada' : ' alternativas erradas') + '</b>.' : 'Que azar: <b>nenhuma</b> alternativa sai.';
      st.eliminadas = r.eliminadas;
      if (st.eliminadas.indexOf(st.escolha) >= 0) { st.escolha = -1; st.fase = 'pergunta'; }
      setTimeout(() => { fecharJanela(); desenharJogo(); }, 1500);
      return true;                                  // mantém a janela aberta para mostrar os cartões virados
    });
  }

  // ------------------------------------------------------------------ fim
  function terminar(tipo, premio) {
    pararTempo();
    fecharJanela();
    st.tela = 'fim'; st.premio = premio; st.fim = tipo;
    const rec = ler(KEY.recorde, 0), novoRec = premio > rec;
    if (novoRec) gravar(KEY.recorde, premio);
    if (tipo === 'vitoria') { som('parabens'); setTimeout(() => som('grana'), 600); } else if (premio > 0) setTimeout(() => som('grana'), 300);
    const titulo = { vitoria: 'Você é milionário!', parou: 'Parou na hora certa?', errou: 'Bola na trave', tempo: 'O tempo acabou' }[tipo];
    const p = st.lista[st.i];
    const sub = tipo === 'vitoria' ? 'Acertou as 16 perguntas.'
      : tipo === 'parou' ? 'Você parou na pergunta ' + (st.i + 1) + '.'
        : 'A resposta certa era <b>' + esc(p.alternativas[p.correta]) + '</b>.';
    $('#jogo').innerHTML = '<div class="fim ' + tipo + '"><span class="f-tit">' + titulo + '</span><span class="f-valor">' + M.moeda(premio) + '</span>' +
      '<p>' + sub + (novoRec && premio ? ' <b>Novo recorde!</b>' : '') + '</p>' +
      '<div class="j-botoes"><button class="btn sim" data-a="denovo">Jogar de novo</button><button class="btn" data-a="partilhar">Desafiar amigos</button></div>' +
      '<button class="btn link" data-a="inicio">Mudar os temas</button>' +
      '<a class="app" href="' + PLAY + '" target="_blank" rel="noopener"><img src="../../midia/icones/milhao-do-futebol.png" alt="" width="44" height="44"><span><b>Tem mais no app</b><small>Presente diário, pergunta do dia e segunda chance. Baixe o Jogo do Milhão no Google Play</small></span></a></div>' + barraSom();
  }
  function partilhar() {
    const url = (window.parent !== window ? window.parent.location.origin + window.parent.location.pathname : location.origin + '/') + '#/jogos/milhao';
    const txt = 'Fiz ' + M.moeda(st.premio) + ' no Jogo do Milhão do Futebol. Consegue mais?';
    if (navigator.share) { navigator.share({ text: txt + '\n' + url }).catch(() => null); return; }
    window.open('https://wa.me/?text=' + encodeURIComponent(txt + '\n' + url), '_blank', 'noopener');
  }

  // ------------------------------------------------------------------ janela
  let aoEscolher = null;
  function abrirJanela(html, cb, fixa) {
    const j = $('#janela');
    j.innerHTML = '<div class="j-caixa" role="dialog" aria-modal="true">' + html + '</div>';
    j.hidden = false;
    j.dataset.fixa = fixa ? '1' : '';
    aoEscolher = cb;
    const b = j.querySelector('.sim, button');
    if (b) b.focus();
  }
  function fecharJanela() { const j = $('#janela'); j.hidden = true; j.innerHTML = ''; aoEscolher = null; }
  $('#janela').addEventListener('click', (e) => {
    const j = $('#janela');
    if (e.target === j && !j.dataset.fixa) { fecharJanela(); return; }
    const b = e.target.closest('[data-j]');
    if (!b) return;
    const cb = aoEscolher;
    const manter = cb && cb(b.dataset.j, j);
    if (!manter && aoEscolher === cb) fecharJanela();
  });

  // ------------------------------------------------------------------ eventos
  document.addEventListener('click', (e) => {
    const alt = e.target.closest('[data-alt]');
    if (alt) { responder(+alt.dataset.alt); return; }
    const aj = e.target.closest('[data-ajuda]');
    if (aj) { ajuda(aj.dataset.ajuda); return; }
    const b = e.target.closest('[data-a]');
    if (!b) return;
    const a = b.dataset.a;
    if (a === 'comecar') comecar();
    else if (a === 'sim') confirmar();
    else if (a === 'nao') { st.escolha = -1; st.fase = 'pergunta'; desenharJogo(); }
    else if (a === 'parar') parar();
    else if (a === 'denovo') comecar();
    else if (a === 'inicio') inicio();
    else if (a === 'partilhar') partilhar();
    else if (a === 'som') {
      gravar(KEY.som, !ler(KEY.som, true));
      if (!ler(KEY.som, true)) calarTudo();
      b.outerHTML = barraSom();
    }
  });
  document.addEventListener('change', (e) => {
    // "Só escudos" é exclusivo: marcar ele desmarca os outros, e vice-versa
    if (!e.target.closest('.modos')) return;
    const todos = Array.from(document.querySelectorAll('.modos input'));
    if (e.target.value === 'escudos' && e.target.checked) todos.forEach((x) => { if (x.value !== 'escudos') x.checked = false; });
    else if (e.target.checked) todos.forEach((x) => { if (x.value === 'escudos') x.checked = false; });
  });
  // teclado: 1 a 4 escolhem, Enter confirma, Esc fecha a janela
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#janela').hidden && !$('#janela').dataset.fixa) { fecharJanela(); return; }
    if (st.tela !== 'jogo' || !$('#janela').hidden) return;
    if (/^[1-4]$/.test(e.key)) { const k = +e.key - 1; if (st.eliminadas.indexOf(k) < 0) responder(k); }
    else if (e.key === 'Enter' && st.fase === 'confirmar') confirmar();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) calarTudo(); });

  window.MILHAO = st;                   // para testes
  carregar().then(inicio).catch(() => {
    $('#jogo').innerHTML = '<div class="inicio"><p class="lead">Não consegui carregar as perguntas. Confira a conexão e tente de novo.</p><button class="btn grande" onclick="location.reload()">Tentar de novo</button></div>';
  });
})();

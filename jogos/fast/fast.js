/* Fast Football (versão web, na identidade do Tapa na Gaveta).
   Física: Matter.js local, com as MESMAS constantes do app (apps/fast-football/app-original-index.tsx,
   setupWorld): arena de raio 200 num campo lógico de 450x800, barra giratória, dois goleiros que
   oscilam, bola com restituição 1,2 e velocidade máxima 16, timeScale 0,42.
   Modos: assistir (a barra sorteia velocidade e sentido a cada 2 s) e jogar (você gira a barra com
   ← → ou tocando nos lados da tela). Partida avulsa ou campeonato em mata-mata de 16 times. */
(function () {
  'use strict';
  const { Engine, Bodies, Body, Composite, Events, Constraint } = window.Matter;
  const DADOS = window.FF_TIMES;
  const $ = (s, el) => (el || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PLAY = 'https://play.google.com/store/apps/details?id=com.julio.footballexpress&referrer=' + encodeURIComponent('utm_source=tapanagaveta&utm_medium=jogos');
  const nome = (t) => DADOS.nomes[t] || t;
  const escudo = (t) => '../../midia/escudos/' + t + '.png';

  // armazenamento protegido (chaves são contrato)
  const KEY = { config: 'tng.fast.config', camp: 'tng.fast.campeonato' };
  const ler = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v && typeof v === 'object' ? v : d; } catch (e) { return d; } };
  const gravar = (k, v) => { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } };

  const cfg = Object.assign({ modo: 'assistir', liga: 'brasileirao', a: 'flamengo', b: 'palmeiras', duracao: 40, velocidade: 1, som: true }, ler(KEY.config, {}));
  const salvarCfg = () => gravar(KEY.config, cfg);
  const liga = () => DADOS.ligas.find((l) => l.id === cfg.liga) || DADOS.ligas[0];

  // sons
  const sons = {};
  function som(k) {
    if (!cfg.som) return;
    try { const a = sons[k] || (sons[k] = new Audio(k + '.mp3')); a.currentTime = 0; const p = a.play(); if (p && p.catch) p.catch(() => null); } catch (e) { /* sem som */ }
  }

  // cor de cada time tirada do próprio escudo (a média dos pixels mais saturados): veste o goleiro
  const imgs = {}, cores = {};
  // estádio do mandante (as mesmas imagens do Football Draft); seleção joga numa sede da Copa
  const ESTADIOS_BR = { athletico: 1, atleticomg: 1, bahia: 1, botafogo: 1, bragantino: 1, chapecoense: 1, corinthians: 'curintia', coritiba: 1, cruzeiro: 1, flamengo: 1, fluminense: 1, gremio: 1, internacional: 1, mirassol: 1, palmeiras: 1, remo: 1, santos: 1, sp: 1, vasco: 1, vitoria: 1 };
  const SEDES = ['atlanta', 'boston', 'dallas', 'bc_place'];
  const estadios = {};
  function estadioDe(t) {
    const br = ESTADIOS_BR[t];
    const id = br ? (br === 1 ? t : br) : SEDES[Array.from(String(t)).reduce((s, c) => s + c.charCodeAt(0), 0) % SEDES.length];
    if (!estadios[id]) { estadios[id] = new Image(); estadios[id].src = '../draft/shared/estadios/' + id + '.webp'; }
    return estadios[id];
  }
  function imagem(t) {
    if (!imgs[t]) {
      imgs[t] = new Image();
      imgs[t].onload = () => { cores[t] = corDoEscudo(imgs[t]); };
      imgs[t].src = escudo(t);
    }
    return imgs[t];
  }
  function corDoEscudo(im) {
    try {
      const c = document.createElement('canvas'); c.width = c.height = 32;
      const x = c.getContext('2d'); x.drawImage(im, 0, 0, 32, 32);
      const d = x.getImageData(0, 0, 32, 32).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 200) continue;
        const mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]);
        if (mx - mn < 60) continue;                                     // ignora branco, preto e cinza
        r += d[i]; g += d[i + 1]; b += d[i + 2]; n++;
      }
      return n > 20 ? 'rgb(' + Math.round(r / n) + ',' + Math.round(g / n) + ',' + Math.round(b / n) + ')' : null;
    } catch (e) { return null; }
  }

  // ================================================================== menu
  let tela = 'menu';
  function menu() {
    pararPartida();
    tela = 'menu';
    const L = liga();
    if (L.times.indexOf(cfg.a) < 0) cfg.a = L.times[0];
    if (L.times.indexOf(cfg.b) < 0 || cfg.b === cfg.a) cfg.b = L.times.find((t) => t !== cfg.a);
    const camp = ler(KEY.camp, null);
    const grade = (lado) => '<div class="grade" role="radiogroup" aria-label="' + (lado === 'a' ? 'Seu time' : 'Adversário') + '">' + L.times.map((t) =>
      '<button role="radio" aria-checked="' + (cfg[lado] === t) + '" data-time="' + t + '" data-lado="' + lado + '"' + (lado === 'b' && t === cfg.a ? ' disabled' : '') + ' title="' + esc(nome(t)) + '"><img src="' + escudo(t) + '" alt="" loading="lazy"><span>' + esc(nome(t)) + '</span></button>').join('') + '</div>';
    $('#app').innerHTML =
      '<div class="menu"><div class="marca"><span>Fast</span><span>Football</span></div>' +
      '<p class="lead">Partida relâmpago numa arena redonda. A barra do meio gira, a bola quica e os goleiros não param.</p>' +
      '<div class="seg" role="radiogroup" aria-label="Modo">' + [['assistir', 'Assistir'], ['jogar', 'Jogar']].map(([k, n]) => '<button role="radio" aria-checked="' + (cfg.modo === k) + '" data-modo="' + k + '">' + n + '</button>').join('') + '</div>' +
      '<p class="dica">' + (cfg.modo === 'jogar' ? 'Você gira a barra com ← e → (ou tocando nos lados da arena). Seu time ataca o gol de cima no primeiro tempo.' : 'A barra gira sozinha: é só escolher os times e torcer.') + '</p>' +
      '<h2>Competição</h2><div class="ligas">' + DADOS.ligas.map((l) => '<button aria-pressed="' + (l.id === cfg.liga) + '" data-liga="' + l.id + '">' + esc(l.nome) + '</button>').join('') + '</div>' +
      '<h2>Seu time</h2>' + grade('a') + '<h2>Adversário <button class="sortear" data-a="sortear">Sortear</button></h2>' + grade('b') +
      '<div class="acoes"><button class="btn sim" data-a="partida">Jogar a partida</button><button class="btn" data-a="campeonato">Campeonato (mata-mata)</button>' +
      (camp ? '<button class="btn" data-a="retomar">Continuar o campeonato</button>' : '') + '</div>' +
      '<div class="ajustes"><label>Duração <select data-cfg="duracao">' + [20, 30, 40, 60, 90, 120].map((d) => '<option value="' + d + '"' + (cfg.duracao === d ? ' selected' : '') + '>' + d + ' s</option>').join('') + '</select></label>' +
      '<label>Velocidade <select data-cfg="velocidade">' + [[0.5, 'Muito lenta'], [0.75, 'Lenta'], [1, 'Normal'], [1.25, 'Rápida'], [1.5, 'Muito rápida']].map(([v, n]) => '<option value="' + v + '"' + (cfg.velocidade === v ? ' selected' : '') + '>' + n + '</option>').join('') + '</select></label>' +
      '<label class="chk"><input type="checkbox" data-cfg="som"' + (cfg.som ? ' checked' : '') + '> Som</label></div>' +
      '<a class="app" href="' + PLAY + '" target="_blank" rel="noopener"><img src="../../midia/icones/fast-football.png" alt="" width="44" height="44"><span><b>Fast Football no celular</b><small>Com controle do goleiro e campeonato salvo. Baixe no Google Play</small></span></a></div>';
    const sel = $('.grade [aria-checked="true"]');
    if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'center' });
  }

  // ================================================================== partida
  const W = 450, H = 800, CX = W / 2, CY = H / 2, RAIO = 200, GOL_L = 100;
  let P = null;           // partida em andamento

  function partida(a, b, opc) {
    pararPartida();
    tela = 'jogo';
    imagem(a); imagem(b);
    $('#app').innerHTML =
      '<div class="jogo"><div class="placar"><button class="sair" data-a="sair" aria-label="Sair da partida"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg></button>' +
      '<div class="lado"><img src="' + escudo(a) + '" alt=""><span>' + esc(nome(a)) + '</span></div><div class="gols"><b id="ga">0</b><i>×</i><b id="gb">0</b><small id="relogio">0\'</small></div>' +
      '<div class="lado"><img src="' + escudo(b) + '" alt=""><span>' + esc(nome(b)) + '</span></div><span class="sair-esp"></span></div>' +
      '<div class="arena"><canvas id="tela" aria-label="Arena da partida"></canvas><div class="aviso-gol" id="aviso" aria-live="assertive"></div>' +
      (cfg.modo === 'jogar' ? '<button class="ctrl esq" data-giro="1" aria-label="Girar a barra para a esquerda"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M15 5l-7 7 7 7"/></svg></button><button class="ctrl dir" data-giro="-1" aria-label="Girar a barra para a direita"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M9 5l7 7-7 7"/></svg></button>' : '') +
      '</div></div>';
    P = criarMundo(a, b, opc || {});
    P.estadio = estadioDe(a);
    ajustarTela();
    som('apito');
    P.raf = requestAnimationFrame(laco);
  }

  function criarMundo(a, b, opc) {
    const engine = Engine.create();
    engine.world.gravity.y = 0; engine.world.gravity.x = 0;
    engine.timing.timeScale = 0.42;
    for (let i = 0; i < 60; i++) {
      const ang = (i / 60) * Math.PI * 2;
      if (Math.abs(Math.sin(ang)) < 0.95) Composite.add(engine.world, Bodies.rectangle(CX + Math.cos(ang) * RAIO, CY + Math.sin(ang) * RAIO, 40, 15, { isStatic: true, angle: ang + Math.PI / 2, label: 'wall' }));
    }
    const poste = { isStatic: true, label: 'post' };
    Composite.add(engine.world, [
      Bodies.rectangle(CX - GOL_L / 2 - 5, CY - RAIO - 40, 10, 80, poste), Bodies.rectangle(CX + GOL_L / 2 + 5, CY - RAIO - 40, 10, 80, poste), Bodies.rectangle(CX, CY - RAIO - 80, GOL_L + 20, 10, poste),
      Bodies.rectangle(CX - GOL_L / 2 - 5, CY + RAIO + 40, 10, 80, poste), Bodies.rectangle(CX + GOL_L / 2 + 5, CY + RAIO + 40, 10, 80, poste), Bodies.rectangle(CX, CY + RAIO + 80, GOL_L + 20, 10, poste),
    ]);
    const arco = (sa, ea) => [0, 1, 2].map((i) => { const ang = sa + (ea - sa) * (i / 3); return Bodies.rectangle(CX + Math.cos(ang) * (RAIO - 10), CY + Math.sin(ang) * (RAIO - 10), 2, 1, { isStatic: true, angle: ang + Math.PI / 2, label: 'arc' }); });
    Composite.add(engine.world, [].concat(arco(Math.PI * 1.3, Math.PI * 1.45), arco(Math.PI * 1.55, Math.PI * 1.7), arco(Math.PI * 0.55, Math.PI * 0.7), arco(Math.PI * 0.3, Math.PI * 0.45)));
    const barra = Bodies.rectangle(CX, CY, 220, 15, { density: 100, label: 'spinner', frictionAir: 0.01 });
    Composite.add(engine.world, [barra, Constraint.create({ pointA: { x: CX, y: CY }, bodyB: barra, length: 0, stiffness: 1 })]);
    const goleiro = (x, y, label) => {
      const cab = Bodies.circle(x, y - 8, 8, { isStatic: true });
      const corpo = Bodies.rectangle(x, y + 8, 22, 22, { isStatic: true, chamfer: { radius: 4 } });
      const g = Body.create({ parts: [cab, corpo], isStatic: true, label, restitution: 1.0 });
      Body.setPosition(g, { x, y });
      return g;
    };
    const golCima = goleiro(CX, CY - RAIO + 25, 'keeperTop'), golBaixo = goleiro(CX, CY + RAIO - 25, 'keeperBot');
    Composite.add(engine.world, [golCima, golBaixo,
      Bodies.rectangle(CX, CY - RAIO - 20, GOL_L, 30, { isStatic: true, isSensor: true, label: 'sensorTop' }),
      Bodies.rectangle(CX, CY + RAIO + 20, GOL_L, 30, { isStatic: true, isSensor: true, label: 'sensorBot' })]);
    const p = { engine, barra, golCima, golBaixo, bola: null, a, b, ga: 0, gb: 0, estado: 'PRIMEIRO', bEmCima: true,
      inicio: performance.now(), pausado: 0, pausaDesde: 0, minuto: 0, ultimo: performance.now(), velSorteada: 0.05, sentido: 1, sorteio: -1,
      parada: 0, ouro: !!opc.ouro, aoFim: opc.aoFim, giro: 0 };
    p.soltarBola = () => {
      if (p.bola) Composite.remove(engine.world, p.bola);
      p.bola = Bodies.circle(CX, CY - 40, 12, { restitution: 1.2, friction: 0, frictionAir: 0, label: 'ball' });
      Composite.add(engine.world, p.bola);
      Body.setVelocity(p.bola, { x: (Math.random() - 0.5) * 7, y: (Math.random() - 0.5) * 7 });
    };
    p.soltarBola();
    Events.on(engine, 'collisionStart', (ev) => {
      if (p.estado === 'FIM') return;
      ev.pairs.forEach((par) => {
        const l = [par.bodyA.label, par.bodyB.label];
        if (l.indexOf('sensorTop') >= 0) gol(p, 'cima');
        if (l.indexOf('sensorBot') >= 0) gol(p, 'baixo');
      });
    });
    return p;
  }

  // time B começa em cima: o time A ataca o gol de cima no 1º tempo (como no app)
  function gol(p, onde) {
    if (!p.bola || p.estado === 'FIM' || p.estado === 'INTERVALO') return;
    const marcouA = p.bEmCima ? onde === 'cima' : onde === 'baixo';
    if (marcouA) p.ga++; else p.gb++;
    $('#ga').textContent = p.ga; $('#gb').textContent = p.gb;
    som('gol');
    Composite.remove(p.engine.world, p.bola); p.bola = null;
    avisar('<img src="' + escudo(marcouA ? p.a : p.b) + '" alt=""><b>Gol!</b>', 1500);
    if (p.estado === 'OURO') { encerrar(p); return; }
    setTimeout(() => { if (P === p && p.estado !== 'FIM' && p.estado !== 'INTERVALO' && !p.bola) { p.soltarBola(); som('apito'); } }, 1500);
  }

  function avisar(html, ms) {
    const el = $('#aviso');
    if (!el) return;
    el.innerHTML = html; el.classList.add('on');
    clearTimeout(avisar.t);
    if (ms) avisar.t = setTimeout(() => el.classList.remove('on'), ms);
  }

  function laco(agora) {
    const p = P;
    if (!p) return;
    if (document.hidden) { p.raf = requestAnimationFrame(laco); return; }
    const delta = Math.min(agora - p.ultimo, 100);         // um quadro travado não "pula" o jogo
    p.ultimo = agora;
    if (p.estado !== 'FIM' && p.estado !== 'PAUSA') {
      const tempo = p.engine.timing.timestamp;
      if (cfg.modo === 'assistir') {
        // a cada 2 s sorteia nova velocidade e às vezes inverte; aproxima aos poucos (freada e arrancada)
        const s = Math.floor(tempo / 2000);
        if (s !== p.sorteio) {
          p.sorteio = s;
          if (s > 0 && Math.random() < 0.3) p.sentido *= -1;
          p.velSorteada = p.sentido * (0.14 + Math.random() * 0.15) * cfg.velocidade;
        }
        Body.setAngularVelocity(p.barra, p.barra.angularVelocity + (p.velSorteada - p.barra.angularVelocity) * 0.08);
      } else {
        Body.setAngularVelocity(p.barra, p.barra.angularVelocity * 0.98);
      }
      Body.setPosition(p.golCima, { x: CX + Math.sin(tempo * 0.0065) * 45, y: p.golCima.position.y });
      Body.setPosition(p.golBaixo, { x: CX + Math.cos(tempo * 0.006) * 45, y: p.golBaixo.position.y });
      if (p.bola) {
        const v = p.bola.speed;
        if (v > 16) Body.setVelocity(p.bola, { x: p.bola.velocity.x * 16 / v, y: p.bola.velocity.y * 16 / v });
        // bola parada por 2 s volta ao centro
        if (v < 0.5) { if (!p.parada) p.parada = agora; else if (agora - p.parada > 2000) { p.soltarBola(); p.parada = 0; } } else p.parada = 0;
      }
      relogio(p, agora);
      if (p.estado !== 'FIM' && p.estado !== 'INTERVALO') Engine.update(p.engine, delta);
    }
    desenhar(p);
    p.raf = requestAnimationFrame(laco);
  }

  function relogio(p, agora) {
    if (p.estado === 'INTERVALO' || p.estado === 'OURO') return;
    const meio = cfg.duracao / 2 * 1000;
    let min = ((agora - p.inicio - p.pausado) / meio) * 45;
    if (p.estado === 'PRIMEIRO' && min >= 45) {
      p.estado = 'INTERVALO'; min = 45;
      if (p.bola) { Composite.remove(p.engine.world, p.bola); p.bola = null; }
      avisar('<b>Intervalo</b>', 2000);
      setTimeout(() => {
        if (P !== p) return;
        p.inicio = performance.now() - meio; p.pausado = 0;
        p.bEmCima = !p.bEmCima; p.estado = 'SEGUNDO';
        p.soltarBola(); som('apito');
      }, 2000);
    } else if (p.estado === 'SEGUNDO' && min >= 90) {
      min = 90;
      if (p.ouro && p.ga === p.gb) { p.estado = 'OURO'; som('apito'); avisar('<b>Gol de ouro</b><small>quem marcar primeiro passa</small>', 2200); }
      else encerrar(p);
    }
    p.minuto = Math.min(90, Math.floor(min));
    const el = $('#relogio');
    if (el) el.textContent = p.estado === 'OURO' ? 'gol de ouro' : p.estado === 'INTERVALO' ? 'intervalo' : p.minuto + "'";
  }

  function encerrar(p) {
    p.estado = 'FIM';
    if (p.bola) { Composite.remove(p.engine.world, p.bola); p.bola = null; }
    som('apito');
    setTimeout(() => { if (P === p) fimDaPartida(p); }, 900);
  }

  function pararPartida() {
    if (!P) return;
    cancelAnimationFrame(P.raf);
    Events.off(P.engine);
    Engine.clear(P.engine);
    P = null;
  }

  // ---------------------------------------------------------------- desenho (Canvas)
  let ctx = null, escala = 1;
  function ajustarTela() {
    const c = $('#tela');
    if (!c) return;
    const area = c.parentElement.getBoundingClientRect();
    escala = Math.min(area.width / W, area.height / H);
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    c.style.width = W * escala + 'px'; c.style.height = H * escala + 'px';
    c.width = Math.round(W * escala * dpr); c.height = Math.round(H * escala * dpr);
    ctx = c.getContext('2d');
    ctx.setTransform(escala * dpr, 0, 0, escala * dpr, 0, 0);
  }
  function desenhar(p) {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    // estádio do mandante ao fundo (cobre a tela, um pouco escurecido para a arena aparecer)
    const est = p.estadio;
    if (est && est.complete && est.naturalWidth) {
      const s = Math.max(W / est.naturalWidth, H / est.naturalHeight), ew = est.naturalWidth * s, eh = est.naturalHeight * s;
      ctx.drawImage(est, (W - ew) / 2, (H - eh) / 2, ew, eh);
      ctx.fillStyle = 'rgba(4,10,28,.38)'; ctx.fillRect(0, 0, W, H);
    }
    // gramado listrado dentro da arena
    ctx.save();
    ctx.beginPath(); ctx.arc(CX, CY, RAIO + 8, 0, Math.PI * 2); ctx.clip();
    ctx.globalAlpha = est && est.naturalWidth ? 0.88 : 1;
    for (let k = -6; k < 6; k++) { ctx.fillStyle = k % 2 ? '#14512f' : '#175c36'; ctx.fillRect(0, CY + k * 40, W, 40); }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,.28)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(CX - RAIO, CY); ctx.lineTo(CX + RAIO, CY); ctx.stroke();
    ctx.beginPath(); ctx.arc(CX, CY, 50, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
    // gols: rede, traves e o escudo de quem defende
    [[-1, p.bEmCima ? p.b : p.a], [1, p.bEmCima ? p.a : p.b]].forEach(([s, time]) => {
      const y0 = CY + s * RAIO, y1 = CY + s * (RAIO + 80);
      ctx.fillStyle = 'rgba(255,255,255,.06)';
      ctx.fillRect(CX - GOL_L / 2, Math.min(y0, y1), GOL_L, 80);
      ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1;
      for (let x = CX - GOL_L / 2; x <= CX + GOL_L / 2; x += 10) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke(); }
      for (let k = 0; k <= 80; k += 10) { ctx.beginPath(); ctx.moveTo(CX - GOL_L / 2, y0 + s * k); ctx.lineTo(CX + GOL_L / 2, y0 + s * k); ctx.stroke(); }
      ctx.fillStyle = '#f1f5f2';
      ctx.fillRect(CX - GOL_L / 2 - 10, Math.min(y0, y1), 10, 80); ctx.fillRect(CX + GOL_L / 2, Math.min(y0, y1), 10, 80);
      ctx.fillRect(CX - GOL_L / 2 - 10, s < 0 ? y1 - 5 : y1 - 5, GOL_L + 20, 10);
      const im = imgs[time];
      if (im && im.complete && im.naturalWidth) { ctx.globalAlpha = 0.9; ctx.drawImage(im, CX - 30, CY + s * (RAIO + 40) - 30, 60, 60); ctx.globalAlpha = 1; }
    });
    // paredes da arena (os 60 blocos, com a abertura dos gols)
    ctx.fillStyle = 'rgba(255,255,255,.14)'; ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 1;
    for (let i = 0; i < 60; i++) {
      const ang = (i / 60) * Math.PI * 2;
      if (Math.abs(Math.sin(ang)) >= 0.95) continue;
      ctx.save(); ctx.translate(CX + Math.cos(ang) * RAIO, CY + Math.sin(ang) * RAIO); ctx.rotate(ang + Math.PI / 2);
      ctx.fillRect(-20, -7.5, 40, 15); ctx.strokeRect(-20, -7.5, 40, 15); ctx.restore();
    }
    // goleiros com a cor do escudo do time que defende cada gol
    const corDe = (t, alt) => cores[t] || alt;
    goleiroDesenho(p.golCima.position, corDe(p.bEmCima ? p.b : p.a, '#e8f0a0'));
    goleiroDesenho(p.golBaixo.position, corDe(p.bEmCima ? p.a : p.b, '#ffffff'));
    // barra
    ctx.save(); ctx.translate(p.barra.position.x, p.barra.position.y); ctx.rotate(p.barra.angle);
    ctx.fillStyle = '#e8f0a0'; arred(ctx, -110, -7.5, 220, 15, 7.5); ctx.fill();
    ctx.fillStyle = '#0f2219'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // bola
    if (p.bola) {
      const b = p.bola.position;
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.arc(b.x + 2, b.y + 3, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(b.x, b.y, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#16251c';
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(p.bola.angle);
      ctx.beginPath(); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 5; ctx[k ? 'lineTo' : 'moveTo'](Math.cos(a) * 4.5, Math.sin(a) * 4.5); } ctx.fill();
      ctx.restore();
    }
    if (cfg.modo === 'assistir') {          // marca-d'água: quem gravar a tela divulga o site
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = '800 15px Manrope, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('tapa na gaveta', CX, H - 18); ctx.textAlign = 'left';
    }
  }
  function goleiroDesenho(pos, cor) {
    ctx.fillStyle = cor;
    arred(ctx, pos.x - 11, pos.y - 3, 22, 22, 4); ctx.fill();
    ctx.beginPath(); ctx.arc(pos.x, pos.y - 8, 8, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1.5; ctx.stroke();
  }
  function arred(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

  // ---------------------------------------------------------------- controles (jogar)
  function girar(lado) {
    if (!P || cfg.modo !== 'jogar' || P.estado === 'FIM') return;
    // impulso do app: 0,20 × velocidade; positivo gira para a esquerda (sentido anti-horário na tela)
    Body.setAngularVelocity(P.barra, P.barra.angularVelocity + lado * 0.20 * cfg.velocidade);
  }

  // ================================================================== fim da partida e campeonato
  function fimDaPartida(p) {
    const venceu = p.ga > p.gb ? p.a : p.gb > p.ga ? p.b : null;
    if (p.aoFim) { p.aoFim(p.ga, p.gb); return; }
    const arena = $('.arena');
    arena.insertAdjacentHTML('beforeend', '<div class="fim">' + (venceu ? '<img src="' + escudo(venceu) + '" alt="">' : '') +
      '<b>' + (venceu ? esc(nome(venceu)) + ' venceu' : 'Empate') + '</b><span>' + esc(nome(p.a)) + ' ' + p.ga + ' × ' + p.gb + ' ' + esc(nome(p.b)) + '</span>' +
      '<div class="acoes"><button class="btn sim" data-a="denovo">Jogar de novo</button><button class="btn" data-a="partilhar">Compartilhar</button><button class="btn" data-a="menu">Menu</button></div></div>');
    fimDaPartida.ultimo = { a: p.a, b: p.b, ga: p.ga, gb: p.gb };
  }

  const FASES = ['Oitavas de final', 'Quartas de final', 'Semifinal', 'Final'];
  function novoCampeonato() {
    const L = liga();
    const outros = L.times.filter((t) => t !== cfg.a).sort(() => Math.random() - 0.5).slice(0, 15);
    const times = [cfg.a].concat(outros).sort(() => Math.random() - 0.5);
    const c = { liga: L.id, meu: cfg.a, fase: 0, rodadas: [paresDe(times)], eliminado: false, campeao: null };
    gravar(KEY.camp, c);
    chave(c);
  }
  function paresDe(lista) { const out = []; for (let k = 0; k < lista.length; k += 2) out.push({ a: lista[k], b: lista[k + 1], ga: null, gb: null, ouro: false }); return out; }
  // jogo dos outros: placar sorteado (como uma partida rápida); empate se decide no gol de ouro
  function simular(j) {
    const pois = (l) => { let k = 0, p = Math.exp(-l), s = p; const u = Math.random(); while (u > s && k < 8) { k++; p *= l / k; s += p; } return k; };
    j.ga = pois(1.6); j.gb = pois(1.6);
    if (j.ga === j.gb) { j.ouro = true; if (Math.random() < 0.5) j.ga++; else j.gb++; }
  }
  const vencedor = (j) => (j.ga > j.gb ? j.a : j.b);

  function chave(c) {
    pararPartida();
    tela = 'chave';
    const r = c.rodadas[c.fase];
    const meuJogo = r.find((j) => j.a === c.meu || j.b === c.meu);
    const pendente = !c.campeao && meuJogo && meuJogo.ga == null && !c.eliminado;
    $('#app').innerHTML = '<div class="menu chave"><div class="marca pequena"><span>Campeonato</span><span>' + esc((DADOS.ligas.find((l) => l.id === c.liga) || {}).nome || '') + '</span></div>' +
      (c.campeao ? '<div class="campeao"><img src="' + escudo(c.campeao) + '" alt=""><b>' + esc(nome(c.campeao)) + '</b><span>' + (c.campeao === c.meu ? 'Campeão! Você venceu os quatro jogos.' : 'é o campeão.' + (c.eliminado ? ' Você caiu ' + ['nas oitavas', 'nas quartas', 'na semifinal', 'na final'][c.saiu] + '.' : '')) + '</span>' +
        '<div class="acoes"><button class="btn sim" data-a="campeonato">Novo campeonato</button><button class="btn" data-a="partilhar-camp">Compartilhar</button><button class="btn" data-a="menu">Menu</button></div></div>' : '') +
      c.rodadas.map((rod, f) => '<h2>' + FASES[f + 4 - Math.log2(c.rodadas[0].length * 2)] + '</h2><ul class="jogos">' + rod.map((j) =>
        '<li class="' + (j.a === c.meu || j.b === c.meu ? 'meu' : '') + '">' + linhaTime(j.a, j.ga, j.ga != null && j.ga > j.gb) + linhaTime(j.b, j.gb, j.ga != null && j.gb > j.ga) + (j.ouro ? '<em>gol de ouro</em>' : '') + '</li>').join('') + '</ul>').reverse().join('') +
      (pendente ? '<div class="acoes fixo"><button class="btn sim" data-a="jogar-fase">' + (cfg.modo === 'jogar' ? 'Jogar' : 'Assistir') + ' ' + FASES[c.fase + 4 - Math.log2(c.rodadas[0].length * 2)].toLowerCase() + '</button><button class="btn" data-a="menu">Menu</button></div>' : '') + '</div>';
  }
  function linhaTime(t, g, ganhou) { return '<span class="lt' + (ganhou ? ' ganhou' : '') + '"><img src="' + escudo(t) + '" alt="" loading="lazy">' + esc(nome(t)) + '<b>' + (g == null ? '' : g) + '</b></span>'; }

  function jogarFase() {
    const c = ler(KEY.camp, null);
    if (!c) { menu(); return; }
    const r = c.rodadas[c.fase];
    const j = r.find((x) => x.a === c.meu || x.b === c.meu);
    const eu = j.a === c.meu ? 'a' : 'b';
    partida(c.meu, eu === 'a' ? j.b : j.a, { ouro: true, aoFim: (gMeu, gDele) => {
      j.ga = eu === 'a' ? gMeu : gDele; j.gb = eu === 'a' ? gDele : gMeu;
      r.forEach((x) => { if (x !== j && x.ga == null) simular(x); });
      if (vencedor(j) !== c.meu) { c.eliminado = true; c.saiu = c.fase; }
      avancar(c);
      gravar(KEY.camp, c.campeao ? null : c);
      if (c.campeao) gravar(KEY.camp + '.ultimo', c);
      chave(c);
    } });
  }
  // fecha a fase; se o usuário caiu, o resto do campeonato é simulado até o campeão
  function avancar(c) {
    for (;;) {
      const r = c.rodadas[c.fase];
      if (r.length === 1) { c.campeao = vencedor(r[0]); return; }
      const prox = paresDe(r.map(vencedor));
      c.rodadas.push(prox); c.fase++;
      if (!c.eliminado) return;
      prox.forEach(simular);
    }
  }

  function partilhar(txt) {
    const url = (window.parent !== window ? window.parent.location.origin + window.parent.location.pathname : location.origin + '/') + '#/jogos/fast';
    if (navigator.share) { navigator.share({ text: txt + '\n' + url }).catch(() => null); return; }
    window.open('https://wa.me/?text=' + encodeURIComponent(txt + '\n' + url), '_blank', 'noopener');
  }

  // ================================================================== eventos
  document.addEventListener('click', (e) => {
    const g = e.target.closest('[data-giro]');
    if (g) return;                                    // o giro vai pelo pointerdown (resposta imediata)
    const t = e.target.closest('[data-time]');
    if (t) { cfg[t.dataset.lado] = t.dataset.time; if (cfg.b === cfg.a) cfg.b = liga().times.find((x) => x !== cfg.a); salvarCfg(); menu(); return; }
    const l = e.target.closest('[data-liga]');
    if (l) { cfg.liga = l.dataset.liga; salvarCfg(); menu(); return; }
    const m = e.target.closest('[data-modo]');
    if (m) { cfg.modo = m.dataset.modo; salvarCfg(); menu(); return; }
    const b = e.target.closest('[data-a]');
    if (!b) return;
    const a = b.dataset.a;
    if (a === 'partida') partida(cfg.a, cfg.b);
    else if (a === 'sortear') { const L = liga().times.filter((x) => x !== cfg.a); cfg.b = L[Math.floor(Math.random() * L.length)]; salvarCfg(); menu(); }
    else if (a === 'campeonato') novoCampeonato();
    else if (a === 'retomar') chave(ler(KEY.camp, null));
    else if (a === 'jogar-fase') jogarFase();
    else if (a === 'menu' || a === 'sair') menu();
    else if (a === 'denovo') { const u = fimDaPartida.ultimo; partida(u.a, u.b); }
    else if (a === 'partilhar') { const u = fimDaPartida.ultimo; partilhar('Fast Football: ' + nome(u.a) + ' ' + u.ga + ' × ' + u.gb + ' ' + nome(u.b) + '. Jogue também:'); }
    else if (a === 'partilhar-camp') { const c = ler(KEY.camp + '.ultimo', null); if (c) partilhar(nome(c.campeao) + ' é campeão no meu Fast Football. Monte o seu campeonato:'); }
  });
  document.addEventListener('pointerdown', (e) => {
    const g = e.target.closest('[data-giro]');
    if (g) { e.preventDefault(); girar(+g.dataset.giro); }
  });
  document.addEventListener('change', (e) => {
    const k = e.target.dataset.cfg;
    if (!k) return;
    cfg[k] = k === 'som' ? e.target.checked : +e.target.value;
    salvarCfg();
  });
  document.addEventListener('keydown', (e) => {
    if (tela !== 'jogo') return;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); girar(1); }
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); girar(-1); }
    else if (e.key === 'Escape') menu();
  });
  window.addEventListener('resize', () => { if (tela === 'jogo') ajustarTela(); });
  // aba escondida: o relógio da partida não anda
  document.addEventListener('visibilitychange', () => {
    if (!P) return;
    if (document.hidden) P.pausaDesde = performance.now();
    else if (P.pausaDesde) { P.pausado += performance.now() - P.pausaDesde; P.pausaDesde = 0; P.ultimo = performance.now(); }
  });

  window.FF = { cfg, get atual() { return P; }, menu, partida, novoCampeonato };    // para testes
  menu();
})();

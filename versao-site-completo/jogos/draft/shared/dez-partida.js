// Dez a Zero: o campinho. Conduz os 22 jogadores e a bola para que a partida mostre exatamente o
// resultado já sorteado pelo núcleo (dez-core.js): cada lance do resultado (gol, defesa, chute para
// fora, escanteio, bloqueio) vira um ataque que termina nele, e entre um lance e outro há trocas de
// passe e desarmes. Não desenha nada: a tela lê `estado()` e desenha.
//
// Coordenadas em metros: x de 0 a 68 (largura), y de 0 a 105 (comprimento, 0 = gol de cima).
// No 1º tempo o time 'a' (o do jogador) ataca para cima; no 2º tempo os lados trocam.
(function (root) {
  'use strict';
  const Core = (typeof module !== 'undefined' && module.exports) ? require('./dez-core.js') : root.DezCore;

  const W = 68, L = 105, CX = W / 2, CY = L / 2;
  const TRAVE = 3.66; // meia largura do gol
  const PASSO = 1 / 60; // a física anda em passos fixos (mesmo resultado em qualquer aparelho)
  const RITMO = 90 / 55; // minutos de jogo por segundo real (1x): a partida inteira dura ~1min30 a 1x
  const ANTECEDENCIA = 9; // minutos antes de um lance em que o ataque dele começa (a encenação leva alguns segundos)

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // minuto do jogo como se mostra na TV: 1º tempo 1'..45'+acréscimos, 2º tempo 46'..90'+acréscimos
  function textoMinuto(tempo, m) {
    if (tempo === 1) return m > 45 ? '45+' + (m - 45) + "'" : m + "'";
    return m > 45 ? '90+' + (m - 45) + "'" : (45 + m) + "'";
  }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const lerp = (a, b, t) => a + (b - a) * t;

  function criar(cfg) {
    const r = Core.rng(cfg.seed + ':campinho');
    const res = cfg.resultado;
    const times = { a: cfg.A, b: cfg.B };
    const outro = (lado) => (lado === 'a' ? 'b' : 'a');

    // ------------------------------------------------------------ linha do tempo
    // Cada lance do resultado vira um ponto na linha do tempo (T = minuto absoluto, com espaço para
    // acréscimos: o 2º tempo começa em 50).
    // Todos os gols aparecem; das chances, no máximo CHANCES por time (cada lance vira um ataque de
    // alguns segundos, e a partida precisa caber em pouco mais de um minuto).
    const CHANCES = 2;
    const chancesMostradas = new Set();
    ['a', 'b'].forEach((lado) => {
      const cs = res.eventos.filter((e) => e.lado === lado && e.tipo !== 'gol');
      r.shuffle(cs).slice(0, CHANCES).forEach((e) => chancesMostradas.add(e));
    });
    const lances = res.eventos.filter((e) => e.tipo === 'gol' || chancesMostradas.has(e))
      .map((e) => Object.assign({}, e, { T: (e.tempo - 1) * 50 + e.min, feito: false }));
    const fimTempo = (t) => {
      const ult = lances.filter((e) => e.tempo === t).reduce((m, e) => Math.max(m, e.min), 0);
      return Math.max(45, ult) + 0.6;
    };
    const FIM = [fimTempo(1), fimTempo(2)];

    // ------------------------------------------------------------ jogadores
    const agentes = [];
    ['a', 'b'].forEach((lado) => {
      const T = times[lado];
      const slots = Core.FORMACOES[T.formacao];
      // números únicos em campo (há elencos com número repetido entre titular e reserva): o repetido
      // fica com o número padrão da vaga ou com o primeiro livre
      const usados = new Set();
      const padrao = Core.NUMEROS_VAGA[T.formacao] || [];
      slots.forEach((s, i) => {
        let j = T.xi[i] || { nome: '?', curto: '?', num: i + 1, forca: 60, pos: s.pos };
        if (!j.num || usados.has(j.num)) {
          let n = padrao[i] && !usados.has(padrao[i]) ? padrao[i] : 1;
          while (usados.has(n)) n++;
          j = Object.assign({}, j, { num: n });
        }
        usados.add(j.num);
        agentes.push({
          lado, idx: i, slot: s, j, x: CX, y: CY, vx: 0, vy: 0, ang: 0,
          vmax: 6.1 + (clamp(j.forca, 50, 95) - 70) * 0.05, fase: r() * 6.28, forcado: null, rapido: false,
        });
      });
    });
    const doTime = (lado) => agentes.filter((a) => a.lado === lado);
    const goleiro = (lado) => agentes.find((a) => a.lado === lado && a.slot.pos === 'GK');
    const agente = (lado, idx) => agentes.find((a) => a.lado === lado && a.idx === idx);

    // ------------------------------------------------------------ estado
    const st = {
      tempo: 1, relogio: 0, taxa: RITMO, placar: { a: 0, b: 0 }, pen: null,
      fase: 'pre', // pre | jogo | gol | intervalo | fim | penaltis | acabou
      posse: 'a', aviso: null, avisoAte: 0, t: 0,
    };
    const bola = { x: CX, y: CY, h: 0, dono: null, voo: null };
    const fila = []; // eventos para a tela (apito, gol, chance...)
    const emite = (e) => fila.push(Object.assign({ relogio: textoRelogio() }, e));

    // direção de ataque: -1 = para cima (y diminui), +1 = para baixo
    const dir = (lado) => ((lado === 'a') === (st.tempo === 1) ? -1 : 1);
    const golAlvoY = (lado) => (dir(lado) < 0 ? 0 : L);
    const golProprioY = (lado) => (dir(lado) < 0 ? L : 0);
    // posição relativa do time: fx 0..1 (esquerda→direita olhando para o ataque), fy 0..1 (próprio gol → gol adversário)
    const mundo = (lado, fx, fy) => (dir(lado) < 0 ? { x: fx * W, y: L - fy * L } : { x: W - fx * W, y: fy * L });
    const prog = (lado, y) => (dir(lado) < 0 ? (L - y) / L : y / L);
    const relX = (lado, x) => (dir(lado) < 0 ? x / W : (W - x) / W);
    const dentro = (p) => ({ x: clamp(p.x, 1.2, W - 1.2), y: clamp(p.y, 1.2, L - 1.2) });

    const textoRelogio = () => textoMinuto(st.tempo, Math.floor(st.relogio) + 1);

    // ------------------------------------------------------------ posições de formação
    function linhaAdversaria(lado) { // o penúltimo defensor adversário (linha do impedimento), em fy do atacante
      const ys = doTime(outro(lado)).map((a) => prog(lado, a.y)).sort((p, q) => q - p);
      return ys[1] || 0.9;
    }
    function alvoFormacao(ag) {
      const lado = ag.lado, s = ag.slot, ataca = st.posse === lado;
      const bp = prog(lado, bola.y), bfx = relX(lado, bola.x);
      if (s.pos === 'GK') {
        if (ataca) return mundo(lado, 0.5 + (bfx - 0.5) * 0.15, clamp(bp * 0.25, 0.02, 0.16));
        // entre a bola e o centro do gol, mais perto da linha quando a bola está longe
        const g = { x: CX, y: golProprioY(lado) };
        const d = dist(bola, g);
        const k = clamp(d * 0.07, 0.8, 5.5) / Math.max(1, d);
        return { x: clamp(g.x + (bola.x - g.x) * k, CX - TRAVE + 0.3, CX + TRAVE - 0.3), y: g.y + (bola.y - g.y) * k };
      }
      let fundo, comp;
      if (ataca) { fundo = clamp(bp - 0.36, 0.12, 0.52); comp = 0.5; } else { fundo = clamp(bp - 0.24, 0.05, 0.4); comp = 0.34; }
      const rel = clamp((s.y - 0.19) / 0.55, -0.1, 1.1);
      let fy = fundo + rel * comp;
      // atacando, o time abre o campo (pontas e laterais bem abertos); defendendo, fecha o meio
      const largo = ['RW', 'LW', 'RB', 'LB'].includes(s.pos);
      let fx = 0.5 + (s.x - 0.5) * (ataca ? (largo ? 1.14 : 0.95) : 0.78) + (bfx - 0.5) * (ataca ? 0.22 : 0.42);
      // o lateral do lado da bola sobe para apoiar
      if (ataca && (s.pos === 'RB' || s.pos === 'LB') && (bfx - 0.5) * (s.x - 0.5) > 0 && bp > 0.42) fy += 0.13;
      if (ataca && bp > 0.5 && ['ST', 'RW', 'LW', 'AM'].includes(s.pos)) fy = Math.max(fy, Math.min(0.9, bp + 0.08));
      if (ataca && s.pos !== 'GK') fy = Math.min(fy, Math.max(linhaAdversaria(lado), bp) - 0.005); // impedimento
      fx += 0.018 * Math.sin(st.t * 0.6 + ag.fase);
      fy += 0.012 * Math.sin(st.t * 0.45 + ag.fase * 1.7);
      return mundo(lado, clamp(fx, 0.04, 0.96), clamp(fy, 0.03, 0.96));
    }
    // posições de saída de bola (cada time no seu campo)
    function posInicial(ag, sai) {
      const s = ag.slot;
      if (s.pos === 'GK') return mundo(ag.lado, 0.5, 0.02);
      let fy = 0.06 + s.y * 0.52;
      if (sai && s.pos === 'ST') fy = 0.495;
      return mundo(ag.lado, s.x, Math.min(fy, 0.47 + (sai && s.pos === 'ST' ? 0.03 : 0)));
    }
    function posicionarSaida(lado) {
      agentes.forEach((a) => { const p = posInicial(a, a.lado === lado); a.x = p.x; a.y = p.y; a.vx = a.vy = 0; a.forcado = null; });
      const batedor = doTime(lado).filter((a) => a.slot.pos === 'ST')[0] || doTime(lado).find((a) => a.slot.pos === 'AM') || doTime(lado)[10];
      batedor.x = CX + 0.4; batedor.y = CY;
      bola.x = CX; bola.y = CY; bola.h = 0; bola.voo = null;
      darBola(batedor);
      st.posse = lado;
      st.saida = true;
      return batedor;
    }

    // ------------------------------------------------------------ marcação
    let pressao = [], apoio = [], pressaoAte = 0;
    function atualizaPressao() {
      if (st.t < pressaoAte) return;
      pressaoAte = st.t + 0.4;
      const def = doTime(outro(st.posse)).filter((a) => a.slot.pos !== 'GK');
      const ref = bola.voo ? { x: bola.voo.x1, y: bola.voo.y1 } : bola;
      def.sort((p, q) => dist(p, ref) - dist(q, ref));
      pressao = def.slice(0, 2);
      // os dois companheiros mais perto de quem tem a bola viram opção de passe
      const dono = bola.dono;
      apoio = dono ? doTime(dono.lado).filter((a) => a !== dono && a.slot.pos !== 'GK' && !a.forcado)
        .sort((p, q) => dist(p, dono) - dist(q, dono)).slice(0, 2) : [];
    }
    // linha de passe: um na diagonal à frente (do lado com mais espaço), outro atrás, de segurança
    function alvoApoio(ag) {
      const base = alvoFormacao(ag), dono = bola.dono;
      if (!dono) return base;
      const i = apoio.indexOf(ag), frente = dir(ag.lado);
      const lado = ag.x >= dono.x ? 1 : -1;
      const off = i === 0 ? { lx: lado * 11, fw: 9 } : { lx: -lado * 8, fw: -7 };
      const p = { x: dono.x + off.lx, y: dono.y + frente * off.fw };
      return dentro({ x: lerp(base.x, p.x, 0.6), y: lerp(base.y, p.y, 0.6) });
    }
    function alvoDefensor(ag) {
      const base = alvoFormacao(ag);
      const i = pressao.indexOf(ag);
      const ref = bola.voo ? { x: bola.voo.x1, y: bola.voo.y1 } : bola;
      const gy = golProprioY(ag.lado);
      if (i === 0) { // aperta quem está com a bola, pelo lado do gol
        const d = Math.max(1, Math.hypot(CX - ref.x, gy - ref.y));
        return { x: ref.x + (CX - ref.x) / d * 1.3, y: ref.y + (gy - ref.y) / d * 1.3, rapido: true };
      }
      if (i === 1) return { x: lerp(ref.x, CX, 0.3), y: lerp(ref.y, gy, 0.22) };
      // marca o atacante mais perto da sua zona
      let perto = null, md = 13;
      doTime(st.posse).forEach((at) => { const d = dist(at, base); if (d < md) { md = d; perto = at; } });
      if (perto) return { x: lerp(base.x, perto.x, 0.35), y: lerp(base.y, lerp(perto.y, gy, 0.08), 0.35) };
      return base;
    }

    // ------------------------------------------------------------ movimento
    function mover(ag, dt) {
      let alvo;
      if (ag.forcado) alvo = ag.forcado;
      else if (bola.dono === ag) alvo = ag.conducao || ag;
      else if (ag.lado !== st.posse && st.fase === 'jogo') alvo = alvoDefensor(ag);
      else if (st.fase === 'jogo' && apoio.includes(ag)) alvo = alvoApoio(ag);
      else alvo = alvoFormacao(ag);
      const dx = alvo.x - ag.x, dy = alvo.y - ag.y, d = Math.hypot(dx, dy);
      let vmax = ag.vmax * (alvo.rapido || ag.rapido ? 1.18 : 1) * (bola.dono === ag ? 0.82 : 1);
      if (st.fase !== 'jogo' && st.fase !== 'penaltis') vmax *= 0.7;
      // longe do lance o jogador trota: só quem está envolvido corre de verdade
      const envolvido = ag.forcado || bola.dono === ag || pressao.includes(ag) || apoio.includes(ag);
      if (!envolvido && dist(ag, bola) > 28) vmax *= 0.7;
      const sp = d < 0.25 ? 0 : vmax * Math.min(1, d / 3.2);
      const vdx = d > 0 ? dx / d * sp : 0, vdy = d > 0 ? dy / d * sp : 0;
      const acc = 7.5 * dt;
      let ax = vdx - ag.vx, ay = vdy - ag.vy;
      const an = Math.hypot(ax, ay);
      if (an > acc) { ax = ax / an * acc; ay = ay / an * acc; }
      ag.vx += ax; ag.vy += ay;
      ag.x = clamp(ag.x + ag.vx * dt, -3, W + 3);
      ag.y = clamp(ag.y + ag.vy * dt, -2.5, L + 2.5);
      const v = Math.hypot(ag.vx, ag.vy);
      const angAlvo = v > 0.6 ? Math.atan2(ag.vy, ag.vx) : Math.atan2(bola.y - ag.y, bola.x - ag.x);
      let da = angAlvo - ag.ang;
      while (da > Math.PI) da -= 2 * Math.PI;
      while (da < -Math.PI) da += 2 * Math.PI;
      ag.ang += da * Math.min(1, dt * 8);
    }
    // jogadores não se atravessam: empurrão suave entre vizinhos
    function separar() {
      for (let i = 0; i < agentes.length; i++) {
        for (let k = i + 1; k < agentes.length; k++) {
          const p = agentes[i], q = agentes[k];
          const dx = q.x - p.x, dy = q.y - p.y, d = Math.hypot(dx, dy);
          if (d > 0.01 && d < 1.3) {
            const e = (1.3 - d) / 2 / d;
            p.x -= dx * e; p.y -= dy * e; q.x += dx * e; q.y += dy * e;
          }
        }
      }
    }

    // ------------------------------------------------------------ bola
    function darBola(ag) {
      bola.dono = ag;
      bola.voo = null;
      bola.h = 0;
      st.posse = ag.lado;
      ag.conducao = null;
    }
    function lancar(destino, opts) {
      const d = Math.hypot(destino.x - bola.x, destino.y - bola.y);
      const alto = opts.alto != null ? opts.alto : (d > 30 ? 2 + d * 0.07 : 0);
      const vel = opts.vel || (alto ? 20 : 15.5);
      bola.voo = { x0: bola.x, y0: bola.y, x1: destino.x, y1: destino.y, T: d / vel + 0.15, t: 0, H: alto, fim: opts.fim };
      bola.dono = null;
    }
    function atualizaBola(dt) {
      if (bola.dono) {
        const a = bola.dono;
        const px = a.x + Math.cos(a.ang) * 0.65, py = a.y + Math.sin(a.ang) * 0.65;
        const d = Math.hypot(px - bola.x, py - bola.y), maxi = 30 * dt; // nunca pula: no máximo 30 m/s até o pé
        if (d > maxi) { bola.x += (px - bola.x) / d * maxi; bola.y += (py - bola.y) / d * maxi; } else { bola.x = px; bola.y = py; }
        bola.h = 0;
        return;
      }
      if (bola.voo) {
        const v = bola.voo;
        v.t += dt;
        const k = clamp(v.t / v.T, 0, 1);
        const ke = v.H ? k : 1 - Math.pow(1 - k, 1.5); // a bola rasteira perde velocidade no gramado
        bola.x = lerp(v.x0, v.x1, ke);
        bola.y = lerp(v.y0, v.y1, ke);
        bola.h = v.H * 4 * k * (1 - k);
        if (k >= 1) {
          const fim = v.fim;
          bola.voo = null;
          if (fim) fim();
        }
      }
    }

    // ------------------------------------------------------------ roteiro dos lances
    // Um "plano" é uma lista de passos executados em ordem. Cada passo termina sozinho (tempo,
    // chegada da bola) e chama o seguinte.
    let plano = [], passo = null, passoAte = 0, lanceAtual = null;

    function proximoPasso() {
      passo = plano.shift() || null;
      if (!passo) return novaJogada();
      passo.ini = st.t;
      passo.exec();
    }
    const espera = (seg, depois) => ({ exec() { passoAte = st.t + seg; }, tick() { if (st.t >= passoAte) { if (depois) depois(); proximoPasso(); } } });
    const ate = (cond, seg, depois) => ({ exec() { passoAte = st.t + seg; }, tick() { if (cond() || st.t >= passoAte) { if (depois) depois(); proximoPasso(); } } });

    // escolhe para quem passar: progride, está livre, distância razoável
    // Pressionado, o jogador toca curto e seguro; com tempo, procura progredir. De vez em quando
    // inverte o jogo com um lançamento para o outro lado do campo.
    function escolheReceptor(dono, evitar) {
      const lado = dono.lado;
      const cands = doTime(lado).filter((a) => a !== dono && a.slot.pos !== 'GK' && !(evitar || []).includes(a));
      const pressionado = pressao[0] && dist(pressao[0], dono) < 4.5;
      const inverte = !pressionado && r() < 0.14;
      let melhor = null, mv = -1e9;
      cands.forEach((a) => {
        const d = dist(a, dono);
        const ganho = prog(lado, a.y) - prog(lado, dono.y);
        let livre = 9;
        doTime(outro(lado)).forEach((o) => { livre = Math.min(livre, dist(o, a)); });
        let v = ganho * (pressionado ? 1 : 4) + livre / 9 * (pressionado ? 3 : 1.6)
          - Math.abs(d - (pressionado ? 11 : 17)) / 14 - (d > 42 ? 3 : 0) + r() * 0.9;
        if (inverte && Math.abs(a.x - dono.x) > 24) v += 3;
        if (v > mv) { mv = v; melhor = a; }
      });
      return melhor;
    }
    function pontoAFrente(ag, m) {
      const p = mundo(ag.lado, relX(ag.lado, ag.x), clamp(prog(ag.lado, ag.y) + m / L, 0.02, 0.97));
      return dentro(p);
    }

    // conduz por alguns instantes na direção do gol, desviando de quem aperta
    function conduzir(seg) {
      return {
        exec() {
          passoAte = st.t + seg;
          const a = bola.dono;
          if (a) a.conducao = pontoAFrente(a, 9);
        },
        tick() {
          const a = bola.dono;
          if (!a) return proximoPasso();
          if (st.t % 0.5 < PASSO) {
            const alvo = pontoAFrente(a, 9);
            const p = pressao[0];
            if (p && dist(p, a) < 5) { // desvia para o lado oposto de quem aperta
              const lx = a.x - p.x;
              alvo.x = clamp(alvo.x + Math.sign(lx || 1) * 5, 3, W - 3);
            }
            if (prog(a.lado, a.y) > 0.72) alvo.x = lerp(alvo.x, CX, 0.4);
            a.conducao = alvo;
          }
          if (st.t >= passoAte) proximoPasso();
        },
      };
    }
    // passe para um companheiro (ou para `para`), que corre para onde a bola vai chegar
    function passar(para, opts = {}) {
      return {
        exec() {
          const dono = bola.dono;
          if (!dono) return proximoPasso();
          const rec = para ? para() : escolheReceptor(dono);
          if (!rec || rec === dono) return proximoPasso();
          // mira onde o companheiro vai estar quando a bola chegar (tempo de voo estimado)
          const voo = dist(dono, rec) / (opts.alto ? 20 : 15.5) + 0.15;
          let destino = opts.no ? opts.no(rec) : dentro({ x: rec.x + rec.vx * voo, y: rec.y + rec.vy * voo });
          if (opts.interceptar) {
            // o defensor mais perto da linha do passe chega antes
            const def = doTime(outro(dono.lado)).filter((a) => a.slot.pos !== 'GK');
            let melhor = null, mt = 0.6, md = 1e9;
            def.forEach((o) => {
              for (let t = 0.35; t <= 0.85; t += 0.1) {
                const p = { x: lerp(dono.x, destino.x, t), y: lerp(dono.y, destino.y, t) };
                const d = dist(o, p);
                if (d < md) { md = d; melhor = o; mt = t; }
              }
            });
            destino = { x: lerp(dono.x, destino.x, mt), y: lerp(dono.y, destino.y, mt) };
            melhor.forcado = destino; melhor.rapido = true;
            const D = dist(dono, destino);
            lancar(destino, { alto: 0, vel: clamp(D / Math.max(0.5, md / (melhor.vmax * 1.15)), 8, 15), fim: receber(melhor, () => fimDaJogada('desarme', melhor)) });
            return;
          }
          rec.forcado = destino; rec.rapido = true;
          lancar(destino, { alto: opts.alto, fim: receber(rec, proximoPasso) });
        },
        tick() { if (!recepcao && st.t - passo.ini > 8) { passo = null; novaJogada(); } }, // segurança
      };
    }
    function liberar(ag) { if (ag) { ag.forcado = null; ag.rapido = false; } }
    // A bola chegou ao destino: quem vai dominar só fica com ela quando chega perto (nunca à distância).
    // Enquanto não chega, a bola segue rolando devagar até ele e ele corre até ela.
    let recepcao = null;
    function receber(ag, depois) {
      return () => {
        if (!ag) { recepcao = null; return depois && depois(); }
        if (dist(ag, bola) <= 1.0) { liberar(ag); darBola(ag); return depois && depois(); }
        ag.forcado = { x: bola.x, y: bola.y }; ag.rapido = true;
        recepcao = { ag, depois, ate: st.t + 4 };
      };
    }
    function tickRecepcao() {
      if (!recepcao) return false;
      const { ag, depois } = recepcao;
      // a bola segue rolando devagar na direção de quem vai dominar (encontro no meio do caminho)
      const d = dist(ag, bola);
      if (d > 0.5) { const passo = Math.min(d - 0.5, 5.5 * PASSO); bola.x += (ag.x - bola.x) / d * passo; bola.y += (ag.y - bola.y) / d * passo; }
      ag.forcado = { x: bola.x, y: bola.y };
      if (dist(ag, bola) <= 1.0 || st.t >= recepcao.ate) {
        recepcao = null;
        liberar(ag); darBola(ag);
        if (depois) depois();
      }
      return true;
    }

    // desarme: quem está marcando vai para cima de quem conduz e toma a bola no corpo a corpo
    function desarmar() {
      let def = null;
      return {
        exec() {
          const dono = bola.dono;
          if (!dono) return proximoPasso();
          def = doTime(outro(dono.lado)).filter((a) => a.slot.pos !== 'GK').sort((p, q) => dist(p, dono) - dist(q, dono))[0];
          def.rapido = true;
          dono.conducao = pontoAFrente(dono, 8);
        },
        tick() {
          const dono = bola.dono;
          if (!dono || !def) return proximoPasso();
          def.forcado = { x: dono.x, y: dono.y };
          if (st.t - passo.ini > 3) dono.conducao = { x: dono.x, y: dono.y }; // segurou demais: é alcançado
          if (dist(def, dono) < 1.2 || st.t - passo.ini > 8) {
            liberar(def);
            darBola(def);
            def.ang = Math.atan2(golAlvoY(def.lado) - def.y, 0); // sai jogando para o ataque
            fimDaJogada('desarme', def);
          }
        },
      };
    }
    // passe que sai pela lateral: arremesso para o outro time, cobrado de onde a bola saiu
    function passarParaFora() {
      return {
        exec() {
          const dono = bola.dono;
          if (!dono) return proximoPasso();
          const rec = escolheReceptor(dono);
          const ladoX = (rec ? rec.x : dono.x) < CX ? -1.2 : W + 1.2;
          const ponto = { x: ladoX, y: clamp((rec ? rec.y : dono.y) + (r() - 0.5) * 8, 6, L - 6) };
          lancar(ponto, { alto: 0, vel: 14, fim: () => arremessoLateral(outro(dono.lado), ponto) });
        },
        tick() {},
      };
    }
    function arremessoLateral(lado, ponto) {
      const naLinha = { x: ponto.x < CX ? 0.2 : W - 0.2, y: ponto.y };
      const quem = doTime(lado).filter((a) => a.slot.pos !== 'GK').sort((p, q) => dist(p, naLinha) - dist(q, naLinha))[0];
      plano = [
        espera(0.4, () => { quem.forcado = naLinha; quem.rapido = true; st.posse = lado; }),
        espera(1.3, () => {
          liberar(quem);
          quem.x = naLinha.x; quem.y = naLinha.y;
          quem.ang = ponto.x < CX ? 0 : Math.PI;
          darBola(quem);
        }),
        espera(0.35),
        passar(() => doTime(lado).filter((a) => a !== quem && a.slot.pos !== 'GK').sort((p, q) => dist(p, quem) - dist(q, quem))[0], { alto: 1.6 }),
      ];
      passo = null;
      lanceAtual = null;
      proximoPasso();
    }

    // chute: o desfecho decide o alvo; o goleiro reage
    function chutar(desfecho, opts = {}) {
      return {
        exec() {
          const atac = bola.dono;
          if (!atac) return proximoPasso();
          const lado = atac.lado, gy = golAlvoY(lado), sinal = gy === 0 ? -1 : 1;
          const gk = goleiro(outro(lado));
          const canto = r() < 0.5 ? -1 : 1;
          if (lanceAtual) st.relogio = Math.max(st.relogio, lanceAtual.min - 0.2); // o relógio chega ao minuto do lance
          let alvo, H = opts.cabeca ? 0.8 : r() * 1.3, vel = opts.cabeca ? 17 : 25;
          if (desfecho === 'gol') {
            alvo = { x: CX + canto * (1.4 + r() * 1.8), y: gy + sinal * 1.3 };
            gk.forcado = { x: CX - canto * 0.6 + canto * r() * 0.8, y: gy - sinal * 0.6 }; gk.rapido = true;
          } else if (desfecho === 'defesa') {
            alvo = { x: CX + canto * (0.3 + r() * 2), y: gy - sinal * 0.5 };
            gk.forcado = { x: alvo.x, y: alvo.y }; gk.rapido = true; vel = 19;
          } else if (desfecho === 'fora') {
            const alto = r() < 0.35;
            alvo = alto ? { x: CX + canto * r() * 3, y: gy + sinal * 3 } : { x: CX + canto * (TRAVE + 0.8 + r() * 4), y: gy + sinal * 3 };
            H = alto ? 3.4 : H;
          } else if (desfecho === 'escanteio') {
            alvo = { x: CX + canto * (TRAVE + 0.5 + r() * 1.5), y: gy + sinal * 1.5 };
            gk.forcado = { x: CX + canto * (TRAVE - 0.5), y: gy - sinal * 0.6 }; gk.rapido = true;
          } else { // bloqueio
            const def = doTime(outro(lado)).filter((a) => a.slot.pos !== 'GK').sort((p, q) => dist(p, atac) - dist(q, atac))[0];
            const d = Math.max(1, Math.hypot(CX - atac.x, gy - atac.y));
            alvo = { x: atac.x + (CX - atac.x) / d * 4.5, y: atac.y + (gy - atac.y) / d * 4.5 };
            def.forcado = alvo; def.rapido = true;
            lancar(alvo, { alto: 0.3, vel: 22, fim: () => { emiteChance(lado, 'bloqueio', atac); receber(def, () => fimDaJogada('desarme', def))(); } });
            return;
          }
          lancar(alvo, {
            alto: H, vel,
            fim: () => {
              liberar(gk);
              if (desfecho === 'gol') return golFeito(lado, atac);
              emiteChance(lado, desfecho, atac);
              if (desfecho === 'defesa') return receber(gk, () => fimDaJogada('defesa', gk))();
              if (desfecho === 'fora') return fimDaJogada('tiro_de_meta', gk);
              return fimDaJogada('escanteio', atac);
            },
          });
        },
        tick() {},
      };
    }
    function emiteChance(lado, tipo, atac) {
      if (lanceAtual && !lanceAtual.feito && lanceAtual.tipo !== 'gol' && lanceAtual.lado === lado) lanceAtual.feito = true;
      emite({ tipo: 'chance', lado, resultado: tipo, autor: atac ? atac.idx : -1 });
    }
    function golFeito(lado, atac) {
      st.placar[lado]++;
      const e = lanceAtual && lanceAtual.tipo === 'gol' ? lanceAtual : lances.find((x) => !x.feito && x.tipo === 'gol' && x.lado === lado);
      if (e) { e.feito = true; st.relogio = Math.max(st.relogio, e.min - 0.1); }
      emite({ tipo: 'gol', lado, autor: atac.idx, assist: e ? e.assist : -1, placar: Object.assign({}, st.placar), relogio: e ? textoMinuto(e.tempo, e.min) : textoRelogio() });
      st.fase = 'gol';
      aviso('GOL', 3.2);
      // comemoração: o autor corre para a bandeirinha, os companheiros vão atrás
      const canto = { x: atac.x < CX ? 2 : W - 2, y: golAlvoY(lado) + (golAlvoY(lado) === 0 ? 3 : -3) };
      atac.forcado = canto;
      doTime(lado).forEach((a) => { if (a !== atac && a.slot.pos !== 'GK') a.forcado = { x: canto.x + (r() - 0.5) * 5, y: canto.y + (r() - 0.5) * 5 }; });
      doTime(outro(lado)).forEach((a) => { a.forcado = posInicial(a, false); });
      bola.dono = null; bola.voo = null;
      // depois da festa, todos voltam andando para as posições de saída; o que faltar é acertado no apito
      plano = [
        espera(2.2, () => { agentes.forEach((a) => { a.forcado = posInicial(a, a.lado !== lado); a.rapido = false; }); }),
        espera(2.0, () => { posicionarSaida(outro(lado)); st.fase = 'jogo'; }),
      ];
      passo = null;
      proximoPasso();
    }

    // depois de um lance: decide como recomeça
    function fimDaJogada(tipo, ag) {
      recepcao = null;
      plano = [];
      passo = null;
      agentes.forEach((a) => { if (a !== ag) liberar(a); });
      if (tipo === 'desarme' || tipo === 'defesa') {
        plano = [espera(tipo === 'defesa' ? 0.9 : 0.25)];
        lanceAtual = null;
        return proximoPasso();
      }
      if (tipo === 'tiro_de_meta') {
        const lado = ag.lado, gy = golProprioY(lado), s = gy === 0 ? 1 : -1;
        const ponto = { x: CX + (r() < 0.5 ? -9 : 9), y: gy + s * 5.5 };
        plano = [
          espera(0.9, () => { bola.x = ponto.x; bola.y = ponto.y; bola.h = 0; ag.forcado = { x: ponto.x, y: ponto.y - s * 0.7 }; }),
          ate(() => dist(ag, ponto) < 1.0, 3, () => { liberar(ag); ag.ang = Math.atan2(s, 0); darBola(ag); }),
          espera(0.6),
          passar(() => doTime(lado).filter((a) => ['CM', 'DM', 'AM', 'ST'].includes(a.slot.pos)).sort((p, q) => prog(lado, q.y) - prog(lado, p.y))[0], { alto: 6 }),
        ];
        lanceAtual = null;
        return proximoPasso();
      }
      if (tipo === 'escanteio') return cobrarEscanteio(ag.lado);
    }

    function cobrarEscanteio(lado) {
      const gy = golAlvoY(lado), s = gy === 0 ? 1 : -1;
      const ladoX = r() < 0.5 ? 0.6 : W - 0.6;
      const atac = doTime(lado), def = doTime(outro(lado));
      const bandeira = { x: ladoX, y: gy };
      const batedor = atac.filter((a) => !['GK', 'CB'].includes(a.slot.pos)).sort((p, q) => dist(p, bandeira) - dist(q, bandeira))[0];
      // quem cabeceia: o autor do gol de escanteio, se for o lance; senão um zagueiro ou centroavante
      let cabeca = null;
      if (lanceAtual && lanceAtual.tipo === 'gol' && lanceAtual.lado === lado) cabeca = agente(lado, lanceAtual.autor);
      if (!cabeca || cabeca === batedor) cabeca = atac.filter((a) => ['CB', 'ST'].includes(a.slot.pos) && a !== batedor)[0];
      const area = atac.filter((a) => a !== batedor && a.slot.pos !== 'GK').sort((p, q) => q.slot.y - p.slot.y).slice(0, 6);
      if (!area.includes(cabeca)) area[0] = cabeca;
      const ponto = (i) => ({ x: CX - 9 + (i * 3.6) + (r() - 0.5) * 1.5, y: gy + s * (6 + (i % 3) * 2.5 + r() * 2) });
      const posBatedor = { x: ladoX + (ladoX < CX ? -0.5 : 0.5), y: gy + s * 0.2 };
      plano = [
        espera(0.6, () => { bola.x = ladoX; bola.y = gy + s * 0.6; bola.h = 0; bola.voo = null; batedor.forcado = posBatedor; batedor.rapido = true; }),
        ate(() => dist(batedor, posBatedor) < 1.0, 4, () => {
          liberar(batedor); batedor.ang = Math.atan2(s, ladoX < CX ? 1 : -1); darBola(batedor);
          area.forEach((a, i) => { a.forcado = ponto(i); });
          def.filter((a) => a.slot.pos !== 'GK').slice(0, 7).forEach((d, i) => { const alvo = area[i % area.length]; d.forcado = { x: alvo.forcado.x + 0.8, y: alvo.forcado.y - s * 1 }; });
          goleiro(outro(lado)).forcado = { x: CX, y: gy + s * 1 };
        }),
        espera(1.2),
        {
          exec() {
            const alvo = cabeca.forcado || cabeca;
            lancar(alvo, { alto: 4.5, vel: 19, fim: receber(cabeca, proximoPasso) });
          },
          tick() {},
        },
      ];
      // o que acontece com o cabeceio
      if (lanceAtual && lanceAtual.tipo === 'gol' && lanceAtual.lado === lado) plano.push(chutar('gol', { cabeca: true }));
      else plano.push(chutar(r() < 0.5 ? 'fora' : 'defesa', { cabeca: true }));
      if (lanceAtual && lanceAtual.tipo === 'escanteio') lanceAtual.feito = true;
      passo = null;
      proximoPasso();
    }

    // ------------------------------------------------------------ a próxima jogada
    function proximoLance() {
      // chance que ficou muito para trás no relógio é deixada de lado (gol nunca)
      lances.forEach((e) => { if (!e.feito && e.tipo !== 'gol' && e.tempo === st.tempo && e.min < st.relogio - 2.5) e.feito = true; });
      return lances.find((e) => !e.feito && e.tempo === st.tempo) || null;
    }
    function novaJogada() {
      if (st.fase !== 'jogo') return;
      const dono = bola.dono;
      if (!dono) { plano = [espera(0.3)]; return proximoPasso(); }
      const lado = dono.lado;
      const e = proximoLance();
      lanceAtual = null;
      plano = [];
      // fim do tempo?
      if (!e && st.relogio >= FIM[st.tempo - 1]) return fimDoTempo();
      // saída de bola: o primeiro toque vai para trás, para um meio-campista
      if (st.saida) {
        st.saida = false;
        plano.push(espera(0.6), passar(() => doTime(lado).filter((a) => a !== dono && ['CM', 'DM', 'AM'].includes(a.slot.pos))
          .sort((p, q) => dist(p, dono) - dist(q, dono))[0]));
      }
      const perto = e && st.relogio >= e.min - ANTECEDENCIA;
      if (perto && e.lado === lado) {
        // ataque que termina no lance
        lanceAtual = e;
        const autor = agente(lado, e.autor) || doTime(lado).find((a) => a.slot.pos === 'ST');
        const assist = e.assist != null && e.assist >= 0 ? agente(lado, e.assist) : null;
        const fora = e.jogada === 'fora_area';
        // o autor corre para a zona de chute
        const zona = () => mundo(lado, clamp(0.5 + (autor.slot.x - 0.5) * 0.45 + (r() - 0.5) * 0.12, 0.3, 0.7), fora ? 0.79 : 0.87 + r() * 0.03);
        autor.forcado = null;
        const n = r() < 0.3 ? 1 : 0;
        for (let i = 0; i < n; i++) plano.push(conduzir(0.5 + r() * 0.7), passar(null));
        if (assist && assist !== autor) plano.push(conduzir(0.5), passar(() => assist, { no: (rec) => dentro(mundo(lado, relX(lado, rec.x), Math.max(prog(lado, rec.y), 0.7))) }));
        plano.push(conduzir(0.4 + r() * 0.4), passar(() => autor, { no: () => zona() }), conduzir(0.35));
        const desfecho = e.tipo === 'gol' ? (e.jogada === 'escanteio' ? 'escanteio' : 'gol') : e.tipo;
        plano.push(chutar(desfecho));
        // o relógio anda no ritmo certo para o lance acontecer no minuto dele
        const dur = n * 1.8 + (assist ? 1.6 : 0) + 2.3;
        st.taxa = clamp((e.min - st.relogio) / dur, RITMO * 0.8, RITMO * 2.5);
      } else {
        // troca de passes que termina com a posse mudando de lado: passe interceptado, desarme
        // no corpo a corpo ou bola pela lateral
        const n = perto ? 0 : r.int(4);
        for (let i = 0; i < n; i++) plano.push(conduzir(0.4 + r() * 1.1), passar(null));
        const perda = perto ? 'intercepta' : r.weighted(['intercepta', 'desarme', 'lateral'], (x) => ({ intercepta: 5, desarme: 3.2, lateral: 1.6 }[x]));
        if (perda === 'desarme') plano.push(desarmar());
        else if (perda === 'lateral') plano.push(conduzir(0.3 + r() * 0.6), passarParaFora());
        else plano.push(conduzir(0.3 + r() * 0.8), passar(null, { interceptar: true }));
        st.taxa = RITMO;
      }
      proximoPasso();
    }

    function fimDoTempo() {
      if (st.tempo === 1) {
        st.fase = 'intervalo';
        emite({ tipo: 'apito', qual: 'intervalo' });
        aviso('INTERVALO', 2.4);
        bola.dono = null;
        plano = [espera(2.4, () => {
          st.tempo = 2; st.relogio = 0;
          posicionarSaida('b');
          st.fase = 'jogo';
          emite({ tipo: 'apito', qual: 'inicio2' });
        })];
        passo = null;
        return proximoPasso();
      }
      st.fase = 'fim';
      emite({ tipo: 'apito', qual: 'fim' });
      bola.dono = null;
      if (res.penaltis) {
        aviso('PENALTIS', 2.2);
        plano = [espera(2.2, iniciarPenaltis)];
      } else {
        aviso('FIM', 2.5);
        plano = [espera(2.5, () => { st.fase = 'acabou'; })];
      }
      passo = null;
      return proximoPasso();
    }

    // ------------------------------------------------------------ pênaltis (no gol de cima)
    function iniciarPenaltis() {
      st.fase = 'penaltis';
      st.pen = { a: 0, b: 0, k: 0, lista: res.penaltis.cobrancas };
      // todos no círculo central, os goleiros perto do gol
      agentes.forEach((a, i) => {
        if (a.slot.pos === 'GK') { a.forcado = { x: a.lado === 'a' ? CX - 6 : CX + 6, y: 14 }; return; }
        const ang = (i / agentes.length) * Math.PI * 2;
        a.forcado = { x: CX + Math.cos(ang) * 7 + (a.lado === 'a' ? -2 : 2), y: CY + Math.sin(ang) * 5 };
      });
      plano = [espera(1.2)];
      montaCobranca(); // quem chamou (o fim de uma espera) segue para o próximo passo
    }
    function montaCobranca() {
      const c = st.pen.lista[st.pen.k];
      if (!c) { plano.push(espera(2.2, () => { st.fase = 'acabou'; })); return; }
      const bat = agente(c.lado, c.autor), gk = goleiro(outro(c.lado));
      const canto = r() < 0.5 ? -1 : 1;
      const posGk = { x: CX, y: 0.6 }, posBat = { x: CX + 0.3, y: 13.5 };
      plano.push(
        // goleiro e batedor vão até seus lugares (não aparecem lá); o árbitro põe a bola na marca
        espera(0.3, () => {
          agentes.forEach((a) => { if (a.slot.pos === 'GK' && a !== gk) a.forcado = { x: a.lado === 'a' ? CX - 8 : CX + 8, y: 14 }; });
          gk.forcado = posGk; gk.rapido = true; bat.forcado = posBat; bat.rapido = true;
        }),
        ate(() => dist(gk, posGk) < 0.8 && dist(bat, posBat) < 0.8, 3.5, () => {
          bola.x = CX; bola.y = 11; bola.h = 0; bola.dono = null; bola.voo = null;
          gk.rapido = false; bat.rapido = false;
        }),
        espera(0.4),
        espera(0.7, () => { bat.forcado = { x: CX, y: 11.6 }; }),
        {
          exec() {
            const gkVai = c.gol ? -canto * (r() < 0.5 ? 1 : 0.2) : canto;
            gk.forcado = { x: CX + gkVai * 2.6, y: 0.8 }; gk.rapido = true;
            const alvo = c.gol ? { x: CX + canto * (1.6 + r() * 1.5), y: -1.2 } : (r() < 0.6 ? { x: CX + canto * 2.4, y: 0.9 } : { x: CX + canto * (TRAVE + 1 + r() * 2), y: -3 });
            lancar(alvo, {
              alto: r() * 1.2, vel: 24,
              fim: () => {
                if (c.gol) st.pen[c.lado]++;
                emite({ tipo: 'penalti', lado: c.lado, autor: c.autor, gol: c.gol, pen: { a: st.pen.a, b: st.pen.b } });
                aviso(c.gol ? 'PEN_GOL' : 'PEN_PERDEU', 1.1);
                liberar(gk);
                proximoPasso();
              },
            });
          },
          tick() {},
        },
        espera(1.1, () => { st.pen.k++; montaCobranca(); }),
      );
    }

    function aviso(txt, seg) { st.aviso = txt; st.avisoAte = st.t + seg; }

    // ------------------------------------------------------------ laço
    let iniciado = false;
    function iniciar() {
      iniciado = true;
      posicionarSaida('a');
      st.fase = 'jogo';
      emite({ tipo: 'apito', qual: 'inicio' });
      plano = [espera(0.9)];
      proximoPasso();
    }
    function tick(dt) {
      st.t += dt;
      if (st.fase === 'jogo') {
        st.relogio = Math.min(st.relogio + st.taxa * dt, FIM[st.tempo - 1] + 1.5);
        // o relógio nunca passa do minuto do próximo lance ainda não mostrado: espera por ele
        const prox = lances.find((e) => !e.feito && e.tempo === st.tempo);
        if (prox) st.relogio = Math.min(st.relogio, prox.min - 0.3);
      }
      if (st.aviso && st.t >= st.avisoAte) st.aviso = null;
      if (st.fase === 'jogo') atualizaPressao();
      agentes.forEach((a) => mover(a, dt));
      separar();
      atualizaBola(dt);
      if (tickRecepcao()) return;
      if (passo && passo.tick) passo.tick();
      else if (!passo && st.fase === 'jogo') novaJogada();
    }
    let sobra = 0;
    function avancar(segundos) {
      if (!iniciado) iniciar();
      sobra += Math.min(segundos, 0.6); // um quadro travado não "pula" o jogo (0,6 s cobre a velocidade máxima)
      while (sobra >= PASSO) { sobra -= PASSO; if (st.fase !== 'acabou') tick(PASSO); }
    }

    return {
      avancar,
      // tudo o que a tela precisa para desenhar um quadro
      estado() {
        return {
          agentes, bola, fase: st.fase, placar: st.placar, pen: st.pen, relogio: textoRelogio(), tempo: st.tempo,
          aviso: st.aviso, posse: st.posse, dono: bola.dono, recebendo: !!recepcao,
        };
      },
      eventos() { return fila.splice(0); },
      acabou() { return st.fase === 'acabou'; },
      // pular: o resultado final já é conhecido
      pular() { st.placar = { a: res.ga, b: res.gb }; st.fase = 'acabou'; if (res.penaltis) st.pen = { a: res.penaltis.a, b: res.penaltis.b, k: 99, lista: [] }; },
      W, L,
    };
  }

  const Partida = { criar, W, L };
  if (typeof module !== 'undefined' && module.exports) module.exports = Partida;
  else root.DezPartida = Partida;
})(typeof window !== 'undefined' ? window : this);

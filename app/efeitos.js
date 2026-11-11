/* Efeitos de movimento do site (sem dependências).
   - campo de pontos animado atrás do topo do simulador (canvas 2D, meio-campo e áreas desenhados
     com pontos mais fortes, uma onda lenta passando e o cursor afastando os pontos)
   - topo que encolhe e ganha vidro ao rolar
   - blocos que sobem suavemente quando entram na tela
   - brilho que acompanha o cursor nos cartões dos jogos
   - números de destaque que contam quando aparecem
   Tudo desliga com prefers-reduced-motion: a página fica igual, só parada. */
(function () {
  'use strict';
  const reduz = window.matchMedia('(prefers-reduced-motion: reduce)');
  const parado = () => reduz.matches;

  // ---------------------------------------------------------------- topo que encolhe ao rolar
  let rolou = null;
  function aoRolar() {
    const r = window.scrollY > 24;
    if (r === rolou) return;
    rolou = r;
    document.body.classList.toggle('rolou', r);
  }
  window.addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  // quanto do topo fica grudado na tela (no celular só a linha das abas): o que for grudado
  // abaixo dele (as abas Jogos/Tabela do simulador) usa --topo-fixo para não ficar escondido
  function medirTopo() {
    const head = document.querySelector('.head');
    if (!head) return;
    const topo = parseFloat(getComputedStyle(head).top) || 0;
    document.documentElement.style.setProperty('--topo-fixo', Math.max(0, head.offsetHeight + topo) + 'px');
  }
  window.addEventListener('resize', medirTopo);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(medirTopo);
  medirTopo();

  // ---------------------------------------------------------------- campo de pontos
  function campo(host) {
    if (host.querySelector('canvas.campo-pontos')) return;
    const cv = document.createElement('canvas');
    cv.className = 'campo-pontos';
    cv.setAttribute('aria-hidden', 'true');
    host.prepend(cv);
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    let W = 0, H = 0, dpr = 1, pontos = [], visivel = true, raf = 0, ultimo = 0;
    const mouse = { x: -9999, y: -9999 };
    const PASSO = 16;

    // linhas do campo, em coordenadas 0..1 (meio-campo, círculo, grandes áreas, marcas do pênalti)
    function naLinha(u, v, asp) {
      const d = 0.012;
      const cx = (u - 0.5) * asp, cy = v - 0.5;
      if (Math.abs(u - 0.5) < d / asp * 1.2) return 1;                                   // meio-campo
      if (Math.abs(Math.hypot(cx, cy) - 0.28) < d * 1.4) return 1;                        // círculo central
      if (Math.abs(u - 0.5) * asp < 0.012 && Math.abs(cy) < 0.012) return 1;              // centro
      for (const lado of [0, 1]) {
        const x0 = lado ? 1 - 0.13 : 0.13;                                                // linha da grande área
        if (Math.abs(u - x0) < d / asp * 1.2 && Math.abs(cy) < 0.32) return 1;
        if (Math.abs(cy) - 0.32 < d && Math.abs(cy) - 0.32 > -d && (lado ? u > x0 : u < x0)) return 1;
      }
      return 0;
    }
    function medir() {
      const r = host.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
      cv.width = W * dpr; cv.height = H * dpr;
      cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pontos = [];
      const asp = W / H;
      for (let y = PASSO / 2; y < H; y += PASSO) {
        for (let x = PASSO / 2; x < W; x += PASSO) {
          const u = x / W, v = y / H;
          pontos.push({ x, y, l: naLinha(u, v, asp), s: (x * 7 + y * 13) % 97 });
        }
      }
      desenhar(performance.now());
    }
    function desenhar(t) {
      ctx.clearRect(0, 0, W, H);
      const tt = t / 1000;
      for (let i = 0; i < pontos.length; i++) {
        const p = pontos[i];
        // onda lenta que atravessa o campo na diagonal
        const onda = 0.5 + 0.5 * Math.sin(p.x * 0.012 + p.y * 0.006 - tt * 1.1);
        let r = p.l ? 1.5 + onda * 0.9 : 0.6 + onda * 0.75;
        let dx = 0, dy = 0;
        const mx = p.x - mouse.x, my = p.y - mouse.y, d2 = mx * mx + my * my;
        if (d2 < 14400) {                         // até 120 px do cursor: os pontos se afastam e crescem
          const f = 1 - Math.sqrt(d2) / 120;
          dx = mx * f * 0.22; dy = my * f * 0.22; r += f * 1.4;
        }
        const ouro = p.l && p.s < 9;              // alguns pontos das linhas em dourado
        ctx.fillStyle = ouro ? 'rgba(255,194,61,' + (0.35 + onda * 0.45) + ')' : 'rgba(174,184,218,' + (p.l ? 0.28 + onda * 0.3 : 0.07 + onda * 0.12) + ')';
        ctx.beginPath(); ctx.arc(p.x + dx, p.y + dy, r, 0, 6.2832); ctx.fill();
      }
    }
    function quadro(t) {
      raf = 0;
      if (!visivel || document.hidden || parado() || !host.isConnected) return;
      if (t - ultimo > 33) { ultimo = t; desenhar(t); }          // ~30 quadros por segundo bastam
      raf = requestAnimationFrame(quadro);
    }
    const ligar = () => { if (!raf && !parado()) raf = requestAnimationFrame(quadro); };
    new ResizeObserver(medir).observe(host);
    new IntersectionObserver((es) => { visivel = es[0].isIntersecting; if (visivel) ligar(); }).observe(host);
    document.addEventListener('visibilitychange', ligar);
    host.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; if (parado()) desenhar(0); });
    host.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; if (parado()) desenhar(0); });
    medir();
    ligar();
  }

  // ---------------------------------------------------------------- entrada suave dos blocos
  const ALVOS = '.sim-cols .jogo, .rodadas, .sec-title, .painel-lado > *, .destaques .dq, .marcos li, .est-cols section, .jogo-card, .escala-grid > *, .foot-col, .foot-marca';
  let io = null;
  function preparar(raiz) {
    if (parado() || !('IntersectionObserver' in window)) return;
    if (!io) {
      io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        // irmãos que entram juntos sobem em sequência curta
        const irmaos = el.parentElement ? [...el.parentElement.children].filter((x) => x.classList.contains('entra') && !x.classList.contains('visto')) : [];
        el.style.transitionDelay = Math.min(6, Math.max(0, irmaos.indexOf(el))) * 45 + 'ms';
        el.classList.add('visto');
        io.unobserve(el);
        contarSeNumero(el);
      }), { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });
    }
    raiz.querySelectorAll(ALVOS).forEach((el) => {
      if (el.classList.contains('entra')) return;
      // o que já está na tela ao abrir não pisca: só anima o que vem depois, rolando
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92) return;
      el.classList.add('entra');
      io.observe(el);
    });
  }

  // ---------------------------------------------------------------- números que contam
  function contarSeNumero(el) {
    const b = el.matches && el.matches('.dq') ? el.querySelector('b.num') : null;
    if (!b || b.dataset.contou) return;
    b.dataset.contou = '1';
    const txt = b.textContent.trim(), m = /^(\d+)(?:,(\d+))?(%?)$/.exec(txt);
    if (!m) return;
    const casas = m[2] ? m[2].length : 0, alvo = parseFloat(m[1] + '.' + (m[2] || '0'));
    const t0 = performance.now(), dur = 900;
    const passo = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      b.textContent = (alvo * e).toFixed(casas).replace('.', ',') + m[3];
      if (k < 1) requestAnimationFrame(passo); else b.textContent = txt;
    };
    requestAnimationFrame(passo);
  }

  // ---------------------------------------------------------------- brilho que segue o cursor
  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const c = e.target.closest && e.target.closest('.jogo, .jogo-card, .btn.primario');
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  // ---------------------------------------------------------------- liga tudo a cada tela nova
  function aplicar() {
    const topo = document.querySelector('.sim-topo');
    if (topo) campo(topo);
    preparar(document);
  }
  const conteudo = document.getElementById('conteudo');
  let agendado = 0;
  const agendar = () => { if (!agendado) agendado = requestAnimationFrame(() => { agendado = 0; aplicar(); }); };
  if (conteudo) new MutationObserver(agendar).observe(conteudo, { childList: true, subtree: true });
  const rodape = document.getElementById('rodape');
  if (rodape) new MutationObserver(agendar).observe(rodape, { childList: true });
  agendar();
  window.TNGEfeitos = { aplicar };
})();

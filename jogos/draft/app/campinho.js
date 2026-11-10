// Dez a Zero: desenho do campinho em Canvas 2D. Lê o estado de DezPartida e desenha um quadro.
// O estádio escolhido é o fundo; o retângulo das linhas do gramado (shared/estadios.js) diz onde
// fica o campo na imagem, e os metros da partida (68 x 105) são convertidos para esse retângulo.
(function () {
  'use strict';
  const V = window.DezVisual;
  const DPR = Math.min(3, window.devicePixelRatio || 1);
  const MW = 68, ML = 105;

  // cfg: { estadio, gramado, luz, placas, nome, bola, kits: {a:{c1,c2,gk}, b:{...}}, margens: {topo, baixo} }
  function criar(canvas, cfg) {
    const ctx = canvas.getContext('2d');
    const fundo = document.createElement('canvas');
    const est = V.estadio(cfg.estadio);
    const img = V.imagemEstadio(est.id);
    let L = null; // layout atual

    function layout() {
      const w = canvas.clientWidth || 360, h = canvas.clientHeight || 640;
      canvas.width = Math.round(w * DPR);
      canvas.height = Math.round(h * DPR);
      const m = cfg.margens || { topo: 0, baixo: 0, lado: 0 };
      const iw = est.w, ih = est.h;
      const [x0, y0, x1, y1] = est.campo;
      const pw = (x1 - x0) * iw, ph = (y1 - y0) * ih;
      const dispW = (w - 2 * (m.lado || 0)) * DPR, dispH = (h - m.topo - m.baixo) * DPR;
      // inteiro: o estádio todo cabe na tela (prévia); senão, o gramado ocupa o máximo possível
      const s = cfg.inteiro ? Math.min(dispW / iw, dispH / ih) : Math.min(dispW / pw, dispH / ph);
      const PW = pw * s, PH = ph * s;
      let px = (canvas.width - PW) / 2, py = m.topo * DPR + (dispH - PH) / 2;
      if (cfg.inteiro) { // centraliza a imagem inteira, não o gramado
        px = (canvas.width - iw * s) / 2 + x0 * iw * s;
        py = m.topo * DPR + (dispH - ih * s) / 2 + y0 * ih * s;
      }
      L = { s, PW, PH, px, py, ix: px - x0 * iw * s, iy: py - y0 * ih * s, iw: iw * s, ih: ih * s, kx: PW / MW, ky: PH / ML };
      L.r = Math.max(7 * DPR, 1.55 * L.kx); // um pouco maior que o real, para ler o número no celular
      montarFundo();
    }
    const X = (x) => L.px + x * L.kx;
    const Y = (y) => L.py + y * L.ky;

    // camada fixa: estádio + gramado + luz + placas (refeita só quando muda o tamanho)
    function montarFundo() {
      fundo.width = canvas.width; fundo.height = canvas.height;
      const g = fundo.getContext('2d');
      g.fillStyle = '#031009';
      g.fillRect(0, 0, fundo.width, fundo.height);
      if (!img.complete || !img.naturalWidth) { img.addEventListener('load', montarFundo, { once: true }); return; }
      g.drawImage(img, L.ix, L.iy, L.iw, L.ih);
      padraoGramado(g);
      if (cfg.placas !== false) placas(g);
      iluminacao(g);
    }
    function clipGramado(g) {
      const mx = 2.2 * L.kx, my = 2.2 * L.ky;
      g.beginPath();
      g.rect(L.px - mx, L.py - my, L.PW + 2 * mx, L.PH + 2 * my);
      g.clip();
    }
    function padraoGramado(g) {
      const tipo = cfg.gramado || 'original';
      if (tipo === 'original') return;
      g.save();
      clipGramado(g);
      const claro = 'rgba(255,255,255,0.075)', escuro = 'rgba(0,30,0,0.10)';
      const x0 = L.px - 3 * L.kx, y0 = L.py - 3 * L.ky, w = L.PW + 6 * L.kx, h = L.PH + 6 * L.ky;
      if (tipo === 'listras') {
        const n = 14, bh = h / n;
        for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? claro : escuro; g.fillRect(x0, y0 + i * bh, w, bh); }
      } else if (tipo === 'xadrez') {
        const nx = 8, ny = 12, bw = w / nx, bh = h / ny;
        for (let i = 0; i < nx; i++) for (let k = 0; k < ny; k++) { g.fillStyle = (i + k) % 2 ? claro : escuro; g.fillRect(x0 + i * bw, y0 + k * bh, bw, bh); }
      } else if (tipo === 'diagonal') {
        g.translate(L.px + L.PW / 2, L.py + L.PH / 2);
        g.rotate(Math.PI / 4);
        const d = Math.hypot(w, h), bw = d / 16;
        for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? claro : escuro; g.fillRect(-d / 2 + i * bw, -d / 2, bw, d); }
      } else if (tipo === 'losangos') {
        const n = 7, bw = w / n, bh = bw * 1.2;
        for (let i = -1; i <= n; i++) {
          for (let k = -1; k * bh < h + bh; k++) {
            const cx = x0 + i * bw + (k % 2 ? bw / 2 : 0), cy = y0 + k * bh;
            g.fillStyle = (i + k) % 2 ? claro : escuro;
            g.beginPath(); g.moveTo(cx, cy - bh / 2); g.lineTo(cx + bw / 2, cy); g.lineTo(cx, cy + bh / 2); g.lineTo(cx - bw / 2, cy); g.closePath(); g.fill();
          }
        }
      }
      g.restore();
    }
    // placas de LED nas laterais, com o nome do estádio
    function placas(g) {
      const nome = (cfg.nome || est.nome).toUpperCase();
      const cor = (cfg.kits && cfg.kits.a.c1) || '#FFD23F';
      const larg = 1.1 * L.kx, dist = 2.4 * L.kx;
      [L.px - dist - larg, L.px + L.PW + dist].forEach((x, lado) => {
        const y = L.py + L.PH * 0.12, h = L.PH * 0.76;
        g.save();
        g.fillStyle = '#0a0a0a'; g.fillRect(x - 1, y - 1, larg + 2, h + 2);
        g.fillStyle = cor; g.fillRect(x, y, larg, h);
        g.beginPath(); g.rect(x, y, larg, h); g.clip();
        g.translate(x + larg / 2, y + h / 2);
        g.rotate(lado ? Math.PI / 2 : -Math.PI / 2);
        g.fillStyle = V.contraste(cor);
        g.font = `900 ${Math.max(8 * DPR, larg * 0.9)}px 'Big Shoulders Display', Impact, sans-serif`;
        g.textAlign = 'center'; g.textBaseline = 'middle';
        const passo = g.measureText(nome + '   •   ').width;
        for (let k = -h / 2; k < h / 2 + passo; k += passo) g.fillText(nome + '   •', k, 0);
        g.restore();
      });
    }
    function iluminacao(g) {
      const luz = cfg.luz || 'dia';
      if (luz === 'dia') return;
      if (luz === 'tarde') {
        g.save();
        g.globalCompositeOperation = 'soft-light';
        g.fillStyle = 'rgba(255,120,30,0.55)';
        g.fillRect(0, 0, fundo.width, fundo.height);
        g.globalCompositeOperation = 'source-over';
        const gr = g.createLinearGradient(0, 0, fundo.width, fundo.height);
        gr.addColorStop(0, 'rgba(255,170,60,0.18)'); gr.addColorStop(1, 'rgba(60,20,80,0.22)');
        g.fillStyle = gr; g.fillRect(0, 0, fundo.width, fundo.height);
        g.restore();
        return;
      }
      // noite: tudo escuro, o gramado iluminado pelos refletores
      g.save();
      g.fillStyle = 'rgba(2,6,24,0.66)';
      g.fillRect(0, 0, fundo.width, fundo.height);
      g.beginPath();
      g.rect(L.px - 3 * L.kx, L.py - 3 * L.ky, L.PW + 6 * L.kx, L.PH + 6 * L.ky);
      g.clip();
      g.globalAlpha = 0.72;
      g.drawImage(img, L.ix, L.iy, L.iw, L.ih);
      g.globalAlpha = 1;
      padraoGramado(g);
      g.restore();
      g.save();
      g.globalCompositeOperation = 'screen';
      [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([a, b]) => {
        const cx = L.px + a * L.PW, cy = L.py + b * L.PH;
        const gr = g.createRadialGradient(cx, cy, 0, cx, cy, L.PW * 0.9);
        gr.addColorStop(0, 'rgba(255,250,220,0.22)'); gr.addColorStop(1, 'rgba(255,250,220,0)');
        g.fillStyle = gr; g.fillRect(0, 0, fundo.width, fundo.height);
      });
      g.restore();
    }

    // um jogador visto de cima: disco na cor da camisa, número no meio (legível no celular) e uma
    // marca na borda apontando para onde ele olha
    function jogador(a, kit, destaque) {
      const x = X(a.x), y = Y(a.y), r = L.r;
      const gk = a.slot.pos === 'GK';
      const c1 = gk ? kit.gk : kit.c1, c2 = gk ? '#111111' : kit.c2;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(x + r * 0.3, y + r * 0.4, r * 1.02, r * 0.85, 0, 0, Math.PI * 2); ctx.fill();
      if (destaque) {
        ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 1.8 * DPR;
        ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, Math.PI * 2); ctx.stroke();
      }
      // marca de direção: triângulo na cor secundária, na frente do disco
      const ca = Math.cos(a.ang), sa = Math.sin(a.ang);
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.moveTo(x + ca * r * 1.45, y + sa * r * 1.45);
      ctx.lineTo(x + Math.cos(a.ang + 0.75) * r * 0.9, y + Math.sin(a.ang + 0.75) * r * 0.9);
      ctx.lineTo(x + Math.cos(a.ang - 0.75) * r * 0.9, y + Math.sin(a.ang - 0.75) * r * 0.9);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = c1;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = Math.max(1.2 * DPR, 0.17 * r); ctx.strokeStyle = c2; ctx.stroke();
      ctx.fillStyle = V.contraste(c1);
      ctx.font = `800 ${Math.round(r * 1.05)}px Manrope, system-ui, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(a.j.num), x, y + r * 0.06);
    }
    function nome(a) {
      const x = X(a.x), y = Y(a.y) - L.r * 2.1;
      const txt = a.j.curto;
      ctx.font = `700 ${Math.round(10.5 * DPR)}px Manrope, system-ui, sans-serif`;
      const w = ctx.measureText(txt).width + 8 * DPR, h = 15 * DPR;
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x - w / 2, y - h / 2, w, h, 4 * DPR) : ctx.rect(x - w / 2, y - h / 2, w, h); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(txt, x, y + 0.5 * DPR);
    }
    function bola(b) {
      const x = X(b.x), y = Y(b.y), r = Math.max(3.2 * DPR, 0.55 * L.kx);
      const sombra = b.h * L.ky * 0.5;
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath(); ctx.ellipse(x + sombra * 0.4, y + sombra * 0.2, r * (1 + b.h * 0.02), r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
      V.desenhaBola(ctx, x, y - b.h * L.ky * 0.55, r * (1 + b.h * 0.07), cfg.bola);
    }

    function desenhar(e) {
      if (!L) layout();
      ctx.drawImage(fundo, 0, 0);
      if (!e) return;
      const kits = cfg.kits;
      // de cima para baixo, para quem está mais embaixo ficar por cima
      const ordem = e.agentes.slice().sort((p, q) => p.y - q.y);
      ordem.forEach((a) => jogador(a, kits[a.lado], e.dono === a));
      if (e.dono && e.fase === 'jogo') nome(e.dono);
      bola(e.bola);
    }

    layout();
    return { desenhar, layout, metrosParaTela: (x, y) => ({ x: X(x) / DPR, y: Y(y) / DPR }) };
  }

  // Prévia estática para a tela de personalização: o estádio com os dois times perfilados.
  function previa(canvas, cfg) {
    const Core = window.DezCore;
    const r = criar(canvas, cfg);
    const agentes = [];
    ['a', 'b'].forEach((lado) => {
      Core.FORMACOES['4-3-3'].forEach((s, i) => {
        const fy = 0.04 + s.y * 0.43;
        const x = lado === 'a' ? s.x * MW : MW - s.x * MW;
        const y = lado === 'a' ? ML - fy * ML : fy * ML;
        agentes.push({ lado, slot: s, j: { num: Core.NUMEROS_VAGA['4-3-3'][i], curto: '' }, x, y, ang: lado === 'a' ? -Math.PI / 2 : Math.PI / 2 });
      });
    });
    const desenha = () => r.desenhar({ agentes, bola: { x: MW / 2, y: ML / 2, h: 0 }, fase: 'pre', dono: null });
    desenha();
    const img = V.imagemEstadio(cfg.estadio);
    if (!img.complete) img.addEventListener('load', () => { r.layout(); desenha(); }, { once: true });
    return { desenha };
  }

  window.DezCampinho = { criar, previa, DPR };
})();

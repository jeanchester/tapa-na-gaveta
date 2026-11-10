/* Vídeo da tabela mudando placar a placar (720x1280, para stories e WhatsApp).
   Desenhado em canvas e gravado com MediaRecorder, em tempo real: MP4 onde o navegador grava MP4,
   WebM no resto. Sem MediaRecorder, a animação toca na tela e a pessoa pode gravar a tela.
   Carregado sob demanda pelo simulador: window.TNGVideo.gerar({ ... }). */
(function () {
  'use strict';
  const T = window.TNG;
  const VW = 720, VH = 1280;
  const COR = { noite: '#0b1640', ouro: '#ffc23d', ouroClaro: '#ffe3a3', papel: '#eef0f4', tinta2: '#4a5675', tinta3: '#8a93ab', lado: '#aeb8da' };
  const ZONA = { lib: '#2b4bff', pre: '#8fb0ff', sula: '#12a26b', rb: '#e5484d' };

  function tipo() {
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) return null;
    return ['video/mp4;codecs=avc1.42E01E', 'video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
      .find((m) => { try { return MediaRecorder.isTypeSupported(m); } catch (e) { return false; } }) || null;
  }
  // o vídeo só faz sentido onde dá para gravar (ou ao menos tocar a animação)
  function disponivel() { return !!document.createElement('canvas').getContext; }

  const ease = (k) => (k < 0 ? 0 : k > 1 ? 1 : 1 - Math.pow(1 - k, 3));
  function rr(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  // escudo sempre numa placa branca (legível em qualquer fundo)
  function escudo(x, img, cx, cy, r, placa) {
    if (placa) { x.fillStyle = '#fff'; rr(x, cx - r - 5, cy - r - 5, 2 * r + 10, 2 * r + 10, Math.max(6, r * 0.45)); x.fill(); }
    if (img) x.drawImage(img, cx - r, cy - r, 2 * r, 2 * r);
  }

  // d: { jogos: [{ h, a, p: [gh, ga], rotulo }], estados: [tabela antes, depois de cada jogo],
  //      base: {i: posição real}, times: [{ nome, img }], zona(pos), meu, completo, endereco }
  function roteiro(d) {
    const n = d.jogos.length;
    const mapas = d.estados.map((tab) => { const m = {}; tab.forEach((x) => { m[x.i] = x; }); return m; });
    const dur = Math.min(1.5, Math.max(0.6, 34 / Math.max(1, n)));
    const conf = Array.from({ length: 70 }, (_, i) => ({ x: (i * 97) % VW, v: 260 + ((i * 53) % 240), o: (i * 131) % VH, c: [COR.ouro, '#2b4bff', '#12a26b', '#e5484d', '#fff'][i % 5], r: i * 0.7 }));
    return Object.assign({}, d, { n, mapas, dur, intro: 1.6, total: 1.6 + n * dur + 4.2, conf });
  }

  function quadro(x, V, t) {
    const { jogos, mapas, dur, intro, n } = V;
    let g = -1, fr = 0;
    const acabou = t >= intro + n * dur;
    if (t >= intro && !acabou) { g = Math.min(n - 1, Math.floor((t - intro) / dur)); fr = (t - intro - g * dur) / dur; }
    const A = acabou ? mapas[n] : mapas[Math.max(0, g)], B = acabou ? mapas[n] : mapas[g + 1 < 0 ? 0 : g + 1];
    const e = g < 0 || acabou ? 1 : ease((fr - 0.3) / 0.5);
    x.textBaseline = 'alphabetic';
    x.fillStyle = COR.papel; x.fillRect(0, 0, VW, VH);
    // topo azul-noite com as linhas de campo
    x.fillStyle = COR.noite; x.fillRect(0, 0, VW, 132);
    x.strokeStyle = 'rgba(255,255,255,.08)'; x.lineWidth = 2;
    x.beginPath(); x.arc(VW / 2, 132, 96, Math.PI, 0); x.stroke(); x.beginPath(); x.moveTo(VW / 2, 0); x.lineTo(VW / 2, 132); x.stroke();
    x.fillStyle = COR.ouro; x.beginPath(); x.arc(46, 60, 8, 0, 7); x.fill();
    x.fillStyle = '#fff'; x.font = 'italic 900 28px "Archivo Largo"'; x.textAlign = 'left'; x.fillText('tapa na gaveta', 64, 70);
    x.font = '600 18px Archivo'; x.fillStyle = COR.lado;
    x.fillText(V.completo ? 'Como termina o Brasileirão 2026 na minha simulação' : 'O Brasileirão 2026 com os meus palpites', 40, 106);
    // cartão do jogo da vez (ou a abertura e o fecho)
    const cy = 222;
    if (g >= 0) {
      const j = jogos[g], pop = fr < 0.18 ? 0.6 + 0.4 * ease(fr / 0.18) : 1;
      x.fillStyle = '#fff'; rr(x, 30, 150, 660, 150, 18); x.fill();
      x.font = '700 15px Archivo'; x.fillStyle = COR.tinta3; x.textAlign = 'center';
      x.fillText(j.rotulo + ' · jogo ' + (g + 1) + ' de ' + n, VW / 2, 176);
      escudo(x, V.times[j.h].img, 86, cy + 10, 34, false); escudo(x, V.times[j.a].img, VW - 86, cy + 10, 34, false);
      x.fillStyle = COR.noite; x.font = '800 22px Archivo';
      x.textAlign = 'left'; x.fillText(V.times[j.h].nome, 134, cy + 18);
      x.textAlign = 'right'; x.fillText(V.times[j.a].nome, VW - 134, cy + 18);
      [[0, VW / 2 - 62], [1, VW / 2 + 6]].forEach(([k, bx]) => {
        const w = 56 * pop, hh = 68 * pop;
        x.fillStyle = j.sorteado ? '#e4e8f0' : COR.ouro; rr(x, bx + 28 - w / 2, cy + 10 - hh / 2, w, hh, 12); x.fill();
        x.fillStyle = COR.noite; x.font = '900 ' + Math.round(42 * pop) + 'px "Archivo Largo"'; x.textAlign = 'center'; x.fillText(String(j.p[k]), bx + 28, cy + 10 + 15 * pop);
      });
    } else if (acabou) {
      const L1 = Object.keys(mapas[n]).map((k) => mapas[n][k]).find((r) => r.pos === 1), k = ease((t - intro - n * dur) / 0.6);
      x.fillStyle = COR.noite; rr(x, 30, 150, 660, 150, 18); x.fill();
      x.fillStyle = '#fff'; rr(x, 56, cy - 36, 92, 92, 18); x.fill();
      escudo(x, V.times[L1.i].img, 102, cy + 10, 36 * (0.7 + 0.3 * k), false);
      x.fillStyle = COR.ouro; x.font = '900 40px "Archivo Largo"'; x.textAlign = 'left'; x.fillText(V.times[L1.i].nome, 172, cy + 8);
      x.fillStyle = '#fff'; x.font = '700 22px Archivo';
      x.fillText((V.completo ? 'campeão com ' : 'na frente com ') + L1.pts + ' pontos', 172, cy + 42);
    } else {
      x.fillStyle = '#fff'; rr(x, 30, 150, 660, 150, 18); x.fill();
      x.fillStyle = COR.noite; x.font = '900 38px "Archivo Largo"'; x.textAlign = 'left'; x.fillText('A tabela de hoje', 56, cy + 2);
      x.font = '600 22px Archivo'; x.fillStyle = COR.tinta2;
      x.fillText('Agora, ' + n + (n === 1 ? ' jogo' : ' jogos') + ' com os meus placares.', 56, cy + 40);
    }
    // a tabela: as linhas deslizam para o novo lugar e os pontos contam
    const y0 = 322, rh = 44.5, emJogo = g >= 0 ? [jogos[g].h, jogos[g].a] : [];
    x.fillStyle = '#fff'; rr(x, 30, y0 - 8, 660, rh * 20 + 16, 18); x.fill();
    const ids = Object.keys(A).map(Number).sort((p, q) => (emJogo.indexOf(p) >= 0 ? 1 : 0) - (emJogo.indexOf(q) >= 0 ? 1 : 0));
    ids.forEach((i) => {
      const a = A[i], b = B[i], pos = a.pos + (b.pos - a.pos) * e, y = y0 + (pos - 1) * rh;
      const pts = Math.round(a.pts + (b.pts - a.pts) * e), rk = Math.round(pos), dentro = emJogo.indexOf(i) >= 0;
      if (dentro || i === V.meu || (acabou && rk === 1)) {
        x.fillStyle = dentro ? COR.ouroClaro : acabou && rk === 1 ? COR.ouro : 'rgba(255,194,61,.22)'; rr(x, 38, y + 2, 644, rh - 4, 10); x.fill();
      } else if (b.pos !== a.pos && e < 1) { x.fillStyle = '#fff'; rr(x, 38, y + 2, 644, rh - 4, 10); x.fill(); }
      const z = V.zona(rk);
      if (z) { x.fillStyle = ZONA[z] || '#c5cbd8'; rr(x, 46, y + 9, 5, rh - 18, 3); x.fill(); }
      x.fillStyle = COR.noite; x.font = '900 20px "Archivo Largo"'; x.textAlign = 'center'; x.fillText(String(rk), 76, y + 30);
      escudo(x, V.times[i].img, 116, y + rh / 2, 15, false);
      x.font = '700 21px Archivo'; x.textAlign = 'left'; x.fillText(V.times[i].nome, 144, y + 30);
      const d = V.base[i] - rk;
      if (d) { const w = x.measureText(V.times[i].nome).width; x.font = '800 14px Archivo'; x.fillStyle = d > 0 ? '#12a26b' : '#e5484d'; x.fillText((d > 0 ? '▲' : '▼') + Math.abs(d), 154 + w, y + 29); }
      x.fillStyle = COR.noite; x.font = '900 24px "Archivo Largo"'; x.textAlign = 'center'; x.fillText(String(pts), 640, y + 31);
    });
    // rodapé com o endereço
    x.fillStyle = COR.ouro; x.fillRect(0, VH - 52, VW, 52);
    x.fillStyle = COR.noite; x.font = '900 20px "Archivo Largo"'; x.textAlign = 'left'; x.fillText('Simule você também: ' + V.endereco, 40, VH - 19);
    if (acabou) {
      const tt = t - intro - n * dur;
      V.conf.forEach((c) => { const yy = ((tt * c.v + c.o) % (VH + 40)) - 20; x.save(); x.translate(c.x, yy); x.rotate(tt * 3 + c.r); x.fillStyle = c.c; x.fillRect(-5, -8, 10, 16); x.restore(); });
    }
    x.textAlign = 'left';
  }

  let atual = null;
  function gerar(d) {
    if (atual) atual.cancelar = true;
    const corpo = T.janela('A tabela em vídeo', '<p class="nota" id="vid-status">Preparando…</p><div class="vid-palco" id="vid-palco"></div>' +
      '<div class="j-acoes"><button class="btn primario" data-v="enviar" disabled>Enviar o vídeo</button><button class="btn" data-v="baixar" disabled>Baixar</button><button class="btn" data-v="denovo" disabled>Ver de novo</button></div>',
      { aoFechar: () => { if (atual) atual.cancelar = true; } });
    const status = corpo.querySelector('#vid-status'), palco = corpo.querySelector('#vid-palco');
    const bt = (k) => corpo.querySelector('[data-v="' + k + '"]');
    const eu = atual = { cancelar: false, blob: null, ext: 'webm' };
    corpo.addEventListener('click', (e) => {
      const b = e.target.closest('[data-v]');
      if (!b || b.disabled) return;
      if (b.dataset.v === 'denovo') gerar(d);
      else if (b.dataset.v === 'baixar') baixar(eu);
      else if (b.dataset.v === 'enviar') enviar(eu, d.texto);
    });
    const fontes = document.fonts && document.fonts.load ? Promise.all(['900 40px "Archivo Largo"', 'italic 900 28px "Archivo Largo"', '700 20px Archivo'].map((f) => document.fonts.load(f).catch(() => null))) : Promise.resolve();
    return fontes.then(() => {
      if (eu.cancelar) return;
      const c = document.createElement('canvas'); c.width = VW; c.height = VH;
      const x = c.getContext('2d');
      palco.innerHTML = ''; palco.appendChild(c);
      const V = roteiro(d), mime = tipo();
      eu.ext = mime && mime.indexOf('mp4') >= 0 ? 'mp4' : 'webm';
      let rec = null; const partes = [];
      quadro(x, V, 0);
      if (mime) {
        try {
          rec = new MediaRecorder(c.captureStream(30), { mimeType: mime, videoBitsPerSecond: 5e6 });
          rec.ondataavailable = (ev) => { if (ev.data && ev.data.size) partes.push(ev.data); };
          rec.start(250);
        } catch (e) { rec = null; }
      }
      const t0 = performance.now();
      return new Promise((fim) => {
        const passo = () => {
          if (eu.cancelar) { fim(); return; }
          const t = (performance.now() - t0) / 1000;
          quadro(x, V, Math.min(t, V.total));
          status.textContent = rec ? 'Gravando: ' + Math.min(Math.round(t), Math.round(V.total)) + ' de ' + Math.round(V.total) + ' segundos. Deixe esta janela aberta.'
            : 'Este navegador não grava vídeo. A animação toca aqui e você pode gravar a tela.';
          if (t < V.total) requestAnimationFrame(passo); else fim();
        };
        requestAnimationFrame(passo);
      }).then(() => (rec ? new Promise((ok) => { rec.onstop = ok; try { rec.stop(); } catch (e) { ok(); } }) : null)).then(() => {
        if (eu.cancelar) return;
        bt('denovo').disabled = false;
        if (rec && partes.length) {
          eu.blob = new Blob(partes, { type: mime.split(';')[0] });
          const v = document.createElement('video');
          v.controls = true; v.loop = true; v.muted = true; v.playsInline = true; v.setAttribute('playsinline', '');
          v.src = URL.createObjectURL(eu.blob);
          palco.innerHTML = ''; palco.appendChild(v);
          v.play().catch(() => null);
          status.textContent = 'Vídeo pronto: ' + Math.round(V.total) + ' segundos.' + (eu.ext === 'webm' ? ' Se o WhatsApp recusar, mande como documento ou grave a tela.' : '') +
            (T.ARTIFACT ? ' Nesta prévia, para salvar, toque e segure o vídeo.' : '');
          bt('enviar').disabled = !!T.ARTIFACT; bt('baixar').disabled = !!T.ARTIFACT;
        } else {
          status.textContent = 'Este navegador não grava vídeo. Toque em Ver de novo e grave a tela do celular.';
        }
      });
    });
  }

  function baixar(eu) {
    if (!eu.blob) return Promise.resolve();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(eu.blob); a.download = 'tapa-na-gaveta.' + eu.ext;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    T.aviso('Vídeo baixado. Agora é só anexar no WhatsApp.');
    return Promise.resolve();
  }
  function enviar(eu, texto) {
    if (!eu.blob) return Promise.resolve();
    try {
      const f = new File([eu.blob], 'tapa-na-gaveta.' + eu.ext, { type: eu.blob.type });
      if (navigator.canShare && navigator.canShare({ files: [f] })) {
        return navigator.share({ files: [f], text: texto || '' }).catch((e) => (e && e.name === 'AbortError' ? null : baixar(eu)));
      }
    } catch (e) { /* sem compartilhar arquivos: baixa */ }
    return baixar(eu);
  }

  window.TNGVideo = { disponivel, gerar, roteiro, quadro, VW, VH };
})();

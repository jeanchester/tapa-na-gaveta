/* Imagens para compartilhar (canvas) e o envio: navigator.share com arquivo; sem suporte, baixa a
   imagem e abre o WhatsApp com o texto e o link. Usado pelo simulador e pela escalação.
   Modelo: apps/football-draft/app/servicos.js (toDataURL + navigator.share). */
(function () {
  'use strict';
  const T = window.TNG;

  const COR = { fundo: '#0f5132', fundo2: '#0b3d26', papel: '#f3f5f1', tinta: '#0f2219', tinta2: '#4d6157', giz: '#e8f0a0', linha: 'rgba(255,255,255,.14)',
    zonas: { lib: '#2563b0', pre: '#86a9dc', sula: '#e2b23a', rb: '#ff6b5c' } };

  const imagens = {};
  function imagem(src) {
    if (!imagens[src]) {
      imagens[src] = new Promise((ok) => {
        const im = new Image();
        im.onload = () => ok(im);
        im.onerror = () => ok(null);                  // escudo que não carrega: desenha sem ele
        im.src = src;
      });
    }
    return imagens[src];
  }

  function fontes() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all(['800 40px Manrope', '700 40px Manrope', '600 40px Manrope', '900 40px "Big Shoulders"'].map((f) => document.fonts.load(f).catch(() => null)));
  }

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }

  // marca desenhada (o mesmo traço do logotipo do site)
  function marca(ctx, x, y, esc, cor) {
    ctx.save();
    ctx.translate(x, y); ctx.scale(esc, esc);
    ctx.strokeStyle = cor; ctx.lineCap = 'round';
    ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(3, 6); ctx.lineTo(35, 6); ctx.lineTo(35, 38); ctx.stroke();
    ctx.globalAlpha = 0.45; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(10, 6); ctx.lineTo(35, 31); ctx.moveTo(19, 6); ctx.lineTo(35, 22); ctx.moveTo(28, 6); ctx.lineTo(35, 13);
    ctx.moveTo(3, 14); ctx.lineTo(25, 14); ctx.moveTo(3, 22); ctx.lineTo(17, 22);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = COR.giz;
    ctx.beginPath(); ctx.arc(24, 17, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // cabeçalho e rodapé padrão das imagens (fundo verde com listras de gramado)
  function moldura(ctx, w, h, titulo, sub, chamada) {
    ctx.fillStyle = COR.fundo;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,.035)';
    for (let x = 0; x < w; x += 144) ctx.fillRect(x, 0, 72, h);
    marca(ctx, 64, 58, 2.1, '#f4f8f2');
    ctx.fillStyle = '#f4f8f2';
    ctx.font = '800 40px Manrope';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('tapa na gaveta', 160, 112);
    ctx.font = '800 64px Manrope';
    ctx.fillText(titulo, 64, 232);
    if (sub) { ctx.font = '600 32px Manrope'; ctx.fillStyle = 'rgba(244,248,242,.75)'; ctx.fillText(sub, 64, 284); }
    // rodapé com o endereço (marca-d'água)
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.fillRect(0, h - 104, w, 104);
    ctx.fillStyle = '#f4f8f2';
    ctx.font = '700 30px Manrope';
    const cham = chamada || 'Simule o seu em';
    ctx.fillText(cham, 64, h - 42);
    const ini = 64 + ctx.measureText(cham + ' ').width;
    ctx.fillStyle = COR.giz;
    ctx.font = '800 30px Manrope';
    ctx.fillText(T.enderecoSite(), ini, h - 42);
  }

  function blob(c) {
    return new Promise((ok) => {
      if (c.toBlob) c.toBlob((b) => ok(b), 'image/png');
      else ok(null);
    });
  }

  // compartilha a imagem; sem suporte a arquivos, baixa e abre o WhatsApp com o texto
  function enviar(c, nome, texto, url) {
    // no Artifact do claude.ai, baixar arquivo e o menu de compartilhar do sistema são bloqueados:
    // a imagem fica na tela, e a pessoa salva tocando e segurando (ou com o botão direito)
    if (T.ARTIFACT) { T.aviso('Para salvar, toque e segure a imagem (no computador, botão direito)'); return Promise.resolve('artifact'); }
    return blob(c).then((b) => {
      const arquivo = b && typeof File !== 'undefined' ? new File([b], nome, { type: 'image/png' }) : null;
      if (arquivo && navigator.canShare && navigator.canShare({ files: [arquivo] })) {
        return navigator.share({ files: [arquivo], text: texto + (url ? '\n' + url : '') }).then(() => 'compartilhado').catch((e) => (e && e.name === 'AbortError' ? 'cancelado' : baixar(c, b, nome, texto, url)));
      }
      return baixar(c, b, nome, texto, url);
    });
  }
  function baixar(c, b, nome, texto, url) {
    const a = document.createElement('a');
    a.download = nome;
    a.href = b ? URL.createObjectURL(b) : c.toDataURL('image/png');
    document.body.appendChild(a); a.click(); a.remove();
    if (b) setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    T.aviso('Imagem baixada. Agora é só anexar no WhatsApp.');
    return 'baixado';
  }
  function whatsapp(texto, url) {
    window.open('https://wa.me/?text=' + encodeURIComponent(texto + (url ? '\n' + url : '')), '_blank', 'noopener');
  }
  function copiar(txt) {
    const ok = () => T.aviso('Link copiado');
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt).then(ok).catch(() => copiaVelha(txt, ok));
    return Promise.resolve(copiaVelha(txt, ok));
  }
  function copiaVelha(txt, ok) {
    const t = document.createElement('textarea');
    t.value = txt; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); ok(); } catch (e) { T.aviso('Não consegui copiar: selecione o link e copie'); }
    t.remove();
  }

  // texto que cabe numa largura (encolhe a fonte até caber, depois corta com reticências)
  function textoCabe(ctx, txt, x, y, larg, peso, tam, min) {
    let t = tam;
    ctx.font = peso + ' ' + t + 'px Manrope';
    while (ctx.measureText(txt).width > larg && t > (min || tam * 0.7)) { t--; ctx.font = peso + ' ' + t + 'px Manrope'; }
    let s = txt;
    while (ctx.measureText(s).width > larg && s.length > 2) s = s.slice(0, -2) + '…';
    ctx.fillText(s, x, y);
  }

  window.TNGCompartilhar = { COR, imagem, fontes, canvas, marca, moldura, enviar, whatsapp, copiar, textoCabe, blob };
})();

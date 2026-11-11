/* Imagens para compartilhar (canvas) e o envio: navigator.share com arquivo; sem suporte, baixa a
   imagem e abre o WhatsApp com o texto e o link. Usado pelo simulador e pela escalação.
   Modelo: apps/football-draft/app/servicos.js (toDataURL + navigator.share). */
(function () {
  'use strict';
  const T = window.TNG;

  const COR = { fundo: '#0b1640', fundo2: '#070d26', papel: '#eef0f4', tinta: '#0b1640', tinta2: '#4a5675', giz: '#ffc23d', linha: 'rgba(255,255,255,.14)',
    zonas: { lib: '#4f6bff', pre: '#8fb0ff', sula: '#3fcf95', rb: '#ff6b6f' } };

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
    return Promise.all(['800 40px Archivo', '700 40px Archivo', '600 40px Archivo', '900 40px "Archivo Largo"'].map((f) => document.fonts.load(f).catch(() => null)));
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
    // linhas de campo bem apagadas: meio-campo e círculo central
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke();
    ctx.beginPath(); ctx.arc(w / 2, h / 2, 190, 0, Math.PI * 2); ctx.stroke();
    marca(ctx, 64, 58, 2.1, '#f4f6fb');
    ctx.fillStyle = '#f4f6fb';
    ctx.font = 'italic 900 36px "Archivo Largo"';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('tapa na gaveta', 160, 112);
    ctx.font = '900 60px "Archivo Largo"';
    ctx.fillText(titulo, 64, 232);
    if (sub) { ctx.font = '600 32px Archivo'; ctx.fillStyle = 'rgba(244,246,251,.75)'; ctx.fillText(sub, 64, 284); }
    // rodapé com o endereço (marca-d'água)
    ctx.fillStyle = 'rgba(0,0,0,.22)';
    ctx.fillRect(0, h - 104, w, 104);
    ctx.fillStyle = '#f4f6fb';
    ctx.font = '700 30px Archivo';
    const cham = chamada || 'Simule o seu em';
    ctx.fillText(cham, 64, h - 42);
    const ini = 64 + ctx.measureText(cham + ' ').width;
    ctx.fillStyle = COR.giz;
    ctx.font = '800 30px Archivo';
    ctx.fillText(T.enderecoSite(), ini, h - 42);
  }

  function blob(c) {
    return new Promise((ok) => {
      if (c.toBlob) c.toBlob((b) => ok(b), 'image/png');
      else ok(null);
    });
  }

  // Todo compartilhamento leva um textinho com o link do site. Alguns apps (o WhatsApp no
  // iPhone, por exemplo) descartam o texto quando vão arquivos junto: por isso ele também vai
  // para a área de transferência, para colar na legenda.
  function legenda(texto, url) { return (texto || 'Simule o Brasileirão:') + (url ? '\n' + url : ''); }
  function copiarCalado(txt) {
    try { if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt).then(() => true, () => false); } catch (e) { /* sem permissão */ }
    return Promise.resolve(false);
  }

  // compartilha a imagem; sem suporte a arquivos, baixa e abre o WhatsApp com o texto
  function enviar(c, nome, texto, url) {
    url = url || T.enderecoSite();
    const txt = legenda(texto, url), copiou = copiarCalado(txt);
    // no Artifact do claude.ai, baixar arquivo e o menu de compartilhar do sistema são bloqueados:
    // a imagem fica na tela, e a pessoa salva tocando e segurando (ou com o botão direito)
    if (T.ARTIFACT) { T.aviso('Para salvar, toque e segure a imagem (no computador, botão direito)'); return Promise.resolve('artifact'); }
    return blob(c).then((b) => {
      const arquivo = b && typeof File !== 'undefined' ? new File([b], nome, { type: 'image/png' }) : null;
      if (arquivo && navigator.canShare && navigator.canShare({ files: [arquivo] })) {
        return navigator.share({ files: [arquivo], text: txt }).then(() => 'compartilhado').catch((e) => (e && e.name === 'AbortError' ? 'cancelado' : baixar(c, b, nome, copiou)));
      }
      return baixar(c, b, nome, copiou);
    });
  }
  function baixar(c, b, nome, copiou) {
    const a = document.createElement('a');
    a.download = nome;
    a.href = b ? URL.createObjectURL(b) : c.toDataURL('image/png');
    document.body.appendChild(a); a.click(); a.remove();
    if (b) setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    Promise.resolve(copiou).then((ok) => T.aviso(ok ? 'Imagem baixada e texto com o link copiado: é só colar no WhatsApp' : 'Imagem baixada. Agora é só anexar no WhatsApp.'));
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
    ctx.font = peso + ' ' + t + 'px Archivo';
    while (ctx.measureText(txt).width > larg && t > (min || tam * 0.7)) { t--; ctx.font = peso + ' ' + t + 'px Archivo'; }
    let s = txt;
    while (ctx.measureText(s).width > larg && s.length > 2) s = s.slice(0, -2) + '…';
    ctx.fillText(s, x, y);
  }

  // escudo numa placa branca de cantos arredondados: legível no fundo azul-noite das imagens
  function escudoPlaca(ctx, img, x, y, s) {
    const pad = Math.round(s * 0.14), r = Math.round(s * 0.24), X = x - pad, Y = y - pad, W = s + 2 * pad;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(X + r, Y); ctx.arcTo(X + W, Y, X + W, Y + W, r); ctx.arcTo(X + W, Y + W, X, Y + W, r); ctx.arcTo(X, Y + W, X, Y, r); ctx.arcTo(X, Y, X + W, Y, r); ctx.closePath(); ctx.fill();
    if (img) ctx.drawImage(img, x, y, s, s);
  }

  // várias imagens de uma vez: o menu de compartilhar do celular leva todas juntas;
  // sem suporte, baixa uma por uma e abre o WhatsApp com o texto
  function enviarVarias(lista, texto, url) {
    if (T.ARTIFACT) { T.aviso('Para salvar, toque e segure cada imagem (no computador, botão direito)'); return Promise.resolve('artifact'); }
    url = url || T.enderecoSite();
    const txt = legenda(texto, url), copiou = copiarCalado(txt);
    return Promise.all(lista.map((x) => blob(x.c))).then((bs) => {
      const arquivos = typeof File === 'undefined' ? [] : bs.map((b, k) => (b ? new File([b], lista[k].nome, { type: 'image/png' }) : null)).filter(Boolean);
      if (arquivos.length === lista.length && navigator.canShare && navigator.canShare({ files: arquivos })) {
        return navigator.share({ files: arquivos, text: txt }).then(() => 'compartilhado')
          .catch((e) => (e && e.name === 'AbortError' ? 'cancelado' : baixarTodas(lista, bs, copiou)));
      }
      return baixarTodas(lista, bs, copiou);
    });
  }
  function baixarTodas(lista, bs, copiou) {
    lista.forEach((x, k) => {
      const a = document.createElement('a');
      a.download = x.nome;
      a.href = bs[k] ? URL.createObjectURL(bs[k]) : x.c.toDataURL('image/png');
      document.body.appendChild(a); a.click(); a.remove();
      if (bs[k]) setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    });
    Promise.resolve(copiou).then((ok) => T.aviso((lista.length > 1 ? 'Imagens baixadas' : 'Imagem baixada') + (ok ? ' e texto com o link copiado: é só colar no WhatsApp' : '. Agora é só anexar no WhatsApp.')));
    return 'baixado';
  }

  window.TNGCompartilhar = { legenda, copiarCalado, COR, imagem, fontes, canvas, marca, moldura, enviar, enviarVarias, whatsapp, copiar, textoCabe, blob, escudoPlaca };
})();

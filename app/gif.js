/* GIF animado sem dependências: paleta única de até 256 cores (as mais usadas no quadro mais
   cheio, cada cor reduzida a 5 bits por canal) e compressão LZW. Bom para as imagens do site,
   que têm poucas cores; os escudos ficam um pouco mais "chapados", sem prejuízo de leitura. */
(function () {
  'use strict';

  function paleta(ref) {
    const conta = new Map(), d = ref.data;
    for (let i = 0; i < d.length; i += 4) {
      const k = ((d[i] >> 3) << 10) | ((d[i + 1] >> 3) << 5) | (d[i + 2] >> 3);
      conta.set(k, (conta.get(k) || 0) + 1);
    }
    const top = Array.from(conta.entries()).sort((a, b) => b[1] - a[1]).slice(0, 256).map((e) => e[0]);
    const rgb = top.map((k) => [((k >> 10) & 31) * 8 + 4, ((k >> 5) & 31) * 8 + 4, (k & 31) * 8 + 4]);
    while (rgb.length < 256) rgb.push([0, 0, 0]);
    return { rgb, mapa: new Int16Array(32768).fill(-1) };
  }

  function indice(P, r, g, b) {
    const k = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3);
    let v = P.mapa[k];
    if (v >= 0) return v;
    const R = ((k >> 10) & 31) * 8 + 4, G = ((k >> 5) & 31) * 8 + 4, B = (k & 31) * 8 + 4;
    let melhor = 0, dist = 1e9;
    for (let i = 0; i < 256; i++) {
      const c = P.rgb[i], dr = c[0] - R, dg = c[1] - G, db = c[2] - B;
      const x = dr * dr * 3 + dg * dg * 4 + db * db * 2;
      if (x < dist) { dist = x; melhor = i; if (!x) break; }
    }
    P.mapa[k] = melhor;
    return melhor;
  }

  // LZW do GIF (tamanho mínimo de código 8), já em sub-blocos de até 255 bytes
  function lzw(px, out) {
    const MIN = 8, CLEAR = 256, FIM = 257;
    out.push(MIN);
    let tam = MIN + 1, prox = 258, dic = new Map();
    let acc = 0, nb = 0;
    const bloco = [];
    const emitir = (c) => {
      acc |= c << nb; nb += tam;
      while (nb >= 8) { bloco.push(acc & 255); acc >>>= 8; nb -= 8; if (bloco.length === 255) { out.push(255); for (const b of bloco) out.push(b); bloco.length = 0; } }
    };
    emitir(CLEAR);
    let w = px[0];
    for (let i = 1; i < px.length; i++) {
      const c = px[i], k = w * 4096 + c, achou = dic.get(k);
      if (achou !== undefined) { w = achou; continue; }
      emitir(w);
      if (prox < 4096) {
        dic.set(k, prox++);
        if (prox > (1 << tam) && tam < 12) tam++;
      } else { emitir(CLEAR); dic = new Map(); prox = 258; tam = MIN + 1; }
      w = c;
    }
    emitir(w); emitir(FIM);
    if (nb > 0) bloco.push(acc & 255);
    if (bloco.length) { out.push(bloco.length); for (const b of bloco) out.push(b); }
    out.push(0);
  }

  // quadros: [{ img: ImageData, atraso: centésimos }]; ref: o quadro que define a paleta
  function codificar(quadros, ref) {
    const w = quadros[0].img.width, h = quadros[0].img.height, P = paleta(ref || quadros[quadros.length - 1].img);
    const out = [];
    const txt = (s) => { for (let i = 0; i < s.length; i++) out.push(s.charCodeAt(i)); };
    const u16 = (v) => { out.push(v & 255, (v >> 8) & 255); };
    txt('GIF89a'); u16(w); u16(h);
    out.push(0xF7, 0, 0);                                   // paleta global de 256 cores
    P.rgb.forEach((c) => out.push(c[0], c[1], c[2]));
    out.push(0x21, 0xFF, 11); txt('NETSCAPE2.0'); out.push(3, 1, 0, 0, 0);   // repete para sempre
    const px = new Uint8Array(w * h);
    quadros.forEach((q) => {
      const d = q.img.data;
      for (let i = 0, j = 0; i < px.length; i++, j += 4) px[i] = indice(P, d[j], d[j + 1], d[j + 2]);
      out.push(0x21, 0xF9, 4, 0x04); u16(q.atraso || 8); out.push(0, 0);   // controle: atraso
      out.push(0x2C); u16(0); u16(0); u16(w); u16(h); out.push(0);
      lzw(px, out);
    });
    out.push(0x3B);
    return new Blob([new Uint8Array(out)], { type: 'image/gif' });
  }

  window.TNGGif = { codificar };
})();

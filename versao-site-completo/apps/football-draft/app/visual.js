// Dez a Zero: peças visuais compartilhadas pelas telas: marca, ícones, bandeiras, escudos, bolas,
// cores e estádios. Tudo desenhado aqui (SVG/Canvas), sem emojis: fica igual em qualquer aparelho.
(function () {
  'use strict';
  const C = window.DezCore, D = window.Dez, t = D.t;
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ------------------------------------------------------------ marca
  // Trocar o nome do jogo: aqui (marca curta do logo) e em 'app.nome' nos textos (shared/i18n).
  const MARCA = { curto: '10a0' };
  // as letras minúsculas da marca saem menores e em outra cor (o "a" de 10a0)
  const logoHTML = (cls) => `<span class="marca ${cls || ''}">${MARCA.curto.split('').map((ch) => (/[a-z]/.test(ch) ? `<i>${ch}</i>` : ch)).join('')}</span>`;

  // ------------------------------------------------------------ ícones (traço fino, 24 x 24)
  const P = {
    voltar: '<path d="M15 5l-7 7 7 7"/>',
    ajustes: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    loja: '<path d="M5 8h14l-1.2 12H6.2L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    estadio: '<ellipse cx="12" cy="12" rx="9.5" ry="6.5"/><rect x="7.5" y="9" width="9" height="6" rx=".5"/><path d="M12 9v6"/>',
    escudo: '<path d="M12 3l7.5 3v6c0 4.6-3.2 7.6-7.5 9-4.3-1.4-7.5-4.4-7.5-9V6L12 3z"/>',
    trofeu: '<path d="M8 4h8v5a4 4 0 0 1-8 0V4z"/><path d="M8 6H5.5a2.5 2.5 0 0 0 2.6 3.6M16 6h2.5a2.5 2.5 0 0 1-2.6 3.6M12 13v4M9 20.5h6M10 17h4"/>',
    ajuda: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.4"/><circle cx="12" cy="16.8" r=".6" fill="currentColor"/>',
    calendario: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/><rect x="13" y="13.5" width="3" height="3" rx=".5"/>',
    jogar: '<path d="M8 5.5v13l10.5-6.5z"/>',
    sortear: '<path d="M4 7h2.5c4.5 0 6.5 10 11 10H20M17.5 14l2.5 3-2.5 3M4 17h2.5c1.6 0 2.8-1.3 3.9-3M13.6 10c1.1-1.7 2.3-3 3.9-3H20M17.5 4l2.5 3-2.5 3"/>',
    resortear: '<path d="M19.5 11A7.5 7.5 0 0 0 6 6.5M4.5 4v4h4M4.5 13A7.5 7.5 0 0 0 18 17.5M19.5 20v-4h-4"/>',
    compartilhar: '<path d="M12 3.5v11M7.5 8L12 3.5 16.5 8M5 13v6.5h14V13"/>',
    inicio: '<path d="M4 11l8-7 8 7v9h-5.5v-6h-5v6H4z"/>',
    som: '<path d="M4 9.5h3.5L12 6v12l-4.5-3.5H4z"/><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5M18 7a7 7 0 0 1 0 10"/>',
    musica: '<path d="M9 17.5V6l10-2v11.5"/><circle cx="6.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="15.5" r="2.5"/><path d="M9 9.5l10-2"/>',
    vibrar: '<rect x="8" y="3.5" width="8" height="17" rx="2"/><path d="M4.5 9v6M19.5 9v6"/>',
    sino: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    estrela: '<path d="M12 3.8l2.5 5.2 5.6.7-4.1 3.9 1 5.6L12 16.5l-5 2.7 1-5.6-4.1-3.9 5.6-.7z"/>',
    cadeado: '<rect x="5.5" y="10.5" width="13" height="10" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
    globo: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
    bola: '<circle cx="12" cy="12" r="9"/><path d="M12 8.2l3.3 2.4-1.3 3.9H10l-1.3-3.9z"/><path d="M12 8.2V3.4M15.3 10.6l4.5-1.4M14 14.5l2.8 3.9M10 14.5l-2.8 3.9M8.7 10.6L4.2 9.2"/>',
    lista: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="5" cy="6.5" r="1"/><circle cx="5" cy="12" r="1"/><circle cx="5" cy="17.5" r="1"/>',
    pular: '<path d="M5 5.5l8.5 6.5L5 18.5z"/><path d="M17.5 5.5v13"/>',
    pausa: '<path d="M8.5 5.5v13M15.5 5.5v13"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
    anuncio: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M10.5 9.5v5l4-2.5z"/>',
    moedas: '<ellipse cx="12" cy="7" rx="7" ry="2.8"/><path d="M5 7v5c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V7M5 12v5c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-5"/>',
    baixo: '<path d="M6 9.5l6 6 6-6"/>',
    campo: '<rect x="5" y="3.5" width="14" height="17" rx="1.5"/><path d="M5 12h14"/><circle cx="12" cy="12" r="2.6"/><path d="M9 3.5v2.5h6V3.5M9 20.5V18h6v2.5"/>',
    oculto: '<path d="M3.5 3.5l17 17"/><path d="M10.4 6.2A9.6 9.6 0 0 1 12 6c5 0 9 6 9 6a16 16 0 0 1-2.8 3.4M6.7 7.7C4.4 9.3 3 12 3 12s4 6 9 6c1.6 0 3.1-.4 4.4-1.1"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
    olho: '<path d="M3 12s4-6 9-6 9 6 9 6-4 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="3"/>',
    raio: '<path d="M13 3L5.5 13.5H12L11 21l7.5-10.5H12z"/>',
    pincel: '<path d="M14.5 4.5l5 5-8 8-5-5z"/><path d="M6.5 12.5c-2 0-3 1.5-3 3.5 0 1.5-.5 2.5-1 3 2.5.5 6 .5 7.5-1.5"/>',
    teste: '<path d="M9.5 3.5h5M10.5 3.5v6L5 19a1.3 1.3 0 0 0 1.1 2h11.8A1.3 1.3 0 0 0 19 19l-5.5-9.5v-6"/>',
    dado: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="8.5" cy="8.5" r="1" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  };
  const icone = (nome, cls) => `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[nome] || ''}</svg>`;

  // emblemas das competições: troféu, estrela, globo e um selo com a sigla do país para as ligas
  const SIGLA_LIGA = { brasileirao: 'BRA', premier: 'ENG', laliga: 'ESP', seriea: 'ITA', bundesliga: 'GER', ligue1: 'FRA' };
  function emblemaModo(modo) {
    if (modo === 'copa') return icone('trofeu', 'emb');
    if (modo === 'champions') return `<svg class="ic emb" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 6.8l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z"/></svg>`;
    if (modo === 'mistura') return icone('globo', 'emb');
    return `<span class="emb selo-liga">${SIGLA_LIGA[modo] || ''}</span>`;
  }

  // ------------------------------------------------------------ cores
  function rgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const luz = (hex) => { const [r, g, b] = rgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255; };
  const contraste = (hex) => (luz(hex) > 0.6 ? '#111111' : '#FFFFFF');
  function distCor(a, b) {
    const [r1, g1, b1] = rgb(a), [r2, g2, b2] = rgb(b);
    return Math.sqrt((r1 - r2) ** 2 * 2 + (g1 - g2) ** 2 * 4 + (b1 - b2) ** 2 * 3);
  }
  // Uniformes da partida: se o adversário tem a camisa parecida com a nossa, usa o 2º uniforme.
  function uniformes(coresA, coresB) {
    let b = coresB.slice();
    if (distCor(coresA[0], b[0]) < 190) b = [coresB[1], coresB[0]];
    if (distCor(coresA[0], b[0]) < 190) b = distCor(coresA[0], '#FFFFFF') > 200 ? ['#FFFFFF', '#222222'] : ['#1A1A1A', '#FFFFFF'];
    // goleiro: a cor mais diferente das duas camisas (e da do outro goleiro)
    const gk = (outra) => ['#1E1E1E', '#C6FF00', '#FF8A00', '#7B2FF7', '#00E5FF', '#FF4081']
      .filter((c) => c !== outra)
      .map((c) => ({ c, d: Math.min(distCor(c, coresA[0]), distCor(c, b[0]), outra ? distCor(c, outra) : 999) }))
      .sort((x, y) => y.d - x.d)[0].c;
    const gkA = gk(), gkB = gk(gkA);
    return { a: { c1: coresA[0], c2: coresA[1], gk: gkA }, b: { c1: b[0], c2: b[1], gk: gkB } };
  }
  // Paleta para "Meu time"
  const PALETA = ['#E9C46A', '#F4A261', '#E76F51', '#C1121F', '#8E2C48', '#6A4C93', '#2B4C9B', '#3A86C8',
    '#2A9D8F', '#1F7A4D', '#8AB17D', '#7F5539', '#F1EFE7', '#9AA39C', '#33413B', '#121614'];

  // ------------------------------------------------------------ meu time
  const TIME_KEY = 'dez.time';
  const meuTime = () => Object.assign({ nome: t('time.padrao'), c1: '#E9C46A', c2: '#2B4C9B', forma: 0, padrao: 1 }, D.guarda.json(TIME_KEY));
  const salvarMeuTime = (v) => D.guarda.salvar(TIME_KEY, v);
  const siglaDe = (nome) => {
    const p = String(nome || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().split(/[^A-Z0-9]+/).filter(Boolean);
    if (!p.length) return 'FC';
    if (p.length === 1) return p[0].slice(0, 3);
    return p.slice(0, 3).map((x) => x[0]).join('');
  };

  // ------------------------------------------------------------ escudos
  // Formatos e padrões: os índices ficam salvos no "Meu time": só acrescentar no fim.
  const FORMAS = [
    'M50 4 L92 16 L92 52 C92 76 72 92 50 100 C28 92 8 76 8 52 L8 16 Z', // clássico
    'M50 4 A48 48 0 1 1 49.9 4 Z', // redondo
    'M12 6 L88 6 L88 56 C88 80 70 94 50 100 C30 94 12 80 12 56 Z', // reto
    'M50 2 L96 34 L80 98 L20 98 L4 34 Z', // pentágono
    'M50 3 L92 27 L92 77 L50 101 L8 77 L8 27 Z', // hexágono
    'M50 2 L96 52 L50 102 L4 52 Z', // losango
    'M10 6 Q50 16 90 6 L90 54 C90 80 70 94 50 101 C30 94 10 80 10 54 Z', // francês
    'M50 3 C78 3 92 26 92 52 C92 78 78 101 50 101 C22 101 8 78 8 52 C8 26 22 3 50 3 Z', // oval
    'M8 6 H22 V14 H36 V6 H64 V14 H78 V6 H92 V56 C92 80 72 94 50 101 C28 94 8 80 8 56 Z', // castelo
    'M32 3 H68 L95 30 V74 L68 101 H32 L5 74 V30 Z', // octógono
    'M50 2 C70 22 92 42 92 64 C92 86 72 102 50 102 C28 102 8 86 8 64 C8 42 30 22 50 2 Z', // gota
    'M10 4 H90 V96 L50 80 L10 96 Z', // flâmula
  ];
  // padrões internos: liso, faixa, listras, diagonal, metades, chevron
  const PADROES = [
    () => '',
    (c2) => `<rect y="40" width="100" height="22" fill="${c2}"/>`,
    (c2) => [18, 42, 66].map((x) => `<rect x="${x}" width="12" height="104" fill="${c2}"/>`).join(''),
    (c2) => `<path d="M-10 70 L70 -10 L100 -10 L100 10 L10 104 L-10 104 Z" fill="${c2}"/>`,
    (c2) => `<rect x="50" width="50" height="104" fill="${c2}"/>`,
    (c2) => `<path d="M0 34 L50 62 L100 34 L100 54 L50 82 L0 54 Z" fill="${c2}"/>`,
  ];
  let nClip = 0;
  // opts.semTexto: sem a sigla (o cartão de compartilhar escreve por cima com a fonte do jogo)
  function escudoSVG(c1, c2, sigla, forma, padrao, opts = {}) {
    const d = FORMAS[forma % FORMAS.length];
    const pad = PADROES[(padrao == null ? 1 : padrao) % PADROES.length](c2);
    const id = 'ec' + (nClip++);
    const tam = sigla.length > 3 ? 24 : 30;
    const dentro = 'transform="translate(50 52) scale(.86) translate(-50 -52)"';
    // a sigla vai sobre uma "placa" na cor 2, para ser legível sobre qualquer padrão
    const txt = !sigla || opts.semTexto ? '' : `<rect x="22" y="${52 - tam * 0.42}" width="56" height="${tam * 0.84}" rx="3" fill="${c2}"/>`
      + `<text x="50" y="${52 + tam * 0.3}" text-anchor="middle" font-family="'Big Shoulders Display', Impact, sans-serif" font-weight="900" font-size="${tam}" letter-spacing="1" fill="${contraste(c2)}">${esc(sigla)}</text>`;
    return `<svg viewBox="0 0 100 104" aria-hidden="true"><defs><clipPath id="${id}"><path d="${d}" ${dentro}/></clipPath></defs>`
      + `<path d="${d}" fill="${c2}"/>`
      + `<g clip-path="url(#${id})"><rect width="100" height="104" fill="${c1}"/>${pad}</g>`
      + `<path d="${d}" ${dentro} fill="none" stroke="${contraste(c2) === '#FFFFFF' ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.18)'}" stroke-width="1.5"/>`
      + txt + '</svg>';
  }

  // ------------------------------------------------------------ bandeiras (redondas, desenhadas)
  // Formas simples e reconhecíveis em tamanho pequeno; ficam iguais em qualquer aparelho.
  const faixasH = (cores, pesos) => {
    const p = pesos || cores.map(() => 1), tot = p.reduce((s, x) => s + x, 0);
    let y = 0;
    return cores.map((c, i) => { const h = 32 * p[i] / tot; const r = `<rect y="${y.toFixed(2)}" width="32" height="${(h + 0.3).toFixed(2)}" fill="${c}"/>`; y += h; return r; }).join('');
  };
  const faixasV = (cores, pesos) => {
    const p = pesos || cores.map(() => 1), tot = p.reduce((s, x) => s + x, 0);
    let x = 0;
    return cores.map((c, i) => { const w = 32 * p[i] / tot; const r = `<rect x="${x.toFixed(2)}" width="${(w + 0.3).toFixed(2)}" height="32" fill="${c}"/>`; x += w; return r; }).join('');
  };
  function estrelaD(cx, cy, r) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(2) + ' ' + (cy + Math.sin(a) * rr).toFixed(2);
    }
    return d + 'Z';
  }
  const estrela = (cx, cy, r, cor) => `<path d="${estrelaD(cx, cy, r)}" fill="${cor}"/>`;
  const fundo = (cor) => `<rect width="32" height="32" fill="${cor}"/>`;
  const cruzNordica = (bg, cruz, dentro) => fundo(bg) + `<rect x="9" width="7" height="32" fill="${cruz}"/><rect y="12.5" width="32" height="7" fill="${cruz}"/>`
    + (dentro ? `<rect x="10.8" width="3.4" height="32" fill="${dentro}"/><rect y="14.3" width="32" height="3.4" fill="${dentro}"/>` : '');
  const BANDEIRAS = {
    brasil: () => fundo('#009C3B') + '<path d="M16 5 L29 16 L16 27 L3 16 Z" fill="#FFDF00"/><circle cx="16" cy="16" r="5.6" fill="#002776"/><path d="M10.6 15.2 Q16 13.6 21.4 16.6" stroke="#fff" stroke-width=".9" fill="none"/>',
    argentina: () => faixasH(['#74ACDF', '#fff', '#74ACDF']) + '<circle cx="16" cy="16" r="2.6" fill="#F6B40E"/>',
    uruguai: () => faixasH(['#fff', '#0038A8', '#fff', '#0038A8', '#fff', '#0038A8', '#fff']) + '<rect width="14" height="14" fill="#fff"/><circle cx="7.5" cy="7.5" r="3.2" fill="#FCD116"/>',
    alemanha: () => faixasH(['#111', '#DD0000', '#FFCE00']),
    italia: () => faixasV(['#009246', '#fff', '#CE2B37']),
    franca: () => faixasV(['#0055A4', '#fff', '#EF4135']),
    inglaterra: () => fundo('#fff') + '<rect x="13.5" width="5" height="32" fill="#CE1124"/><rect y="13.5" width="32" height="5" fill="#CE1124"/>',
    espanha: () => faixasH(['#AA151B', '#F1BF00', '#AA151B'], [1, 2, 1]),
    holanda: () => faixasH(['#AE1C28', '#fff', '#21468B']),
    portugal: () => faixasV(['#006600', '#FF0000'], [2, 3]) + '<circle cx="12.8" cy="16" r="4.4" fill="none" stroke="#FFCC00" stroke-width="1.6"/>',
    belgica: () => faixasV(['#111', '#FAE042', '#ED2939']),
    croacia: () => faixasH(['#FF0000', '#fff', '#171796']) + '<rect x="12" y="11" width="8" height="9" fill="#fff"/><path d="M12 11h2.7v3H12zM17.3 11H20v3h-2.7zM14.7 14h2.6v3h-2.6zM12 17h2.7v3H12zM17.3 17H20v3h-2.7z" fill="#FF0000"/>',
    mexico: () => faixasV(['#006847', '#fff', '#CE1126']) + '<circle cx="16" cy="16" r="2.6" fill="#8C6239"/>',
    eua: () => faixasH(['#B22234', '#fff', '#B22234', '#fff', '#B22234', '#fff', '#B22234']) + '<rect width="15" height="15" fill="#3C3B6E"/>'
      + [[4, 4], [8, 4], [12, 4], [6, 8], [10, 8], [4, 12], [8, 12], [12, 12]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#fff"/>`).join(''),
    canada: () => faixasV(['#D80621', '#fff', '#D80621'], [1, 2, 1]) + estrela(16, 16.5, 5, '#D80621'),
    colombia: () => faixasH(['#FCD116', '#003893', '#CE1126'], [2, 1, 1]),
    chile: () => faixasH(['#fff', '#D52B1E']) + '<rect width="13" height="16" fill="#0039A6"/>' + estrela(6.5, 8, 3.2, '#fff'),
    peru: () => faixasV(['#D91023', '#fff', '#D91023']),
    paraguai: () => faixasH(['#D52B1E', '#fff', '#0038A8']) + '<circle cx="16" cy="16" r="2.2" fill="none" stroke="#2F6B2F" stroke-width=".9"/>',
    equador: () => faixasH(['#FFDD00', '#034EA2', '#ED1C24'], [2, 1, 1]) + '<circle cx="16" cy="15" r="2.4" fill="#8C6239"/>',
    japao: () => fundo('#fff') + '<circle cx="16" cy="16" r="6.4" fill="#BC002D"/>',
    coreia: () => fundo('#fff') + '<path d="M9.6 16a6.4 6.4 0 0 1 12.8 0z" fill="#CD2E3A"/><path d="M9.6 16a6.4 6.4 0 0 0 12.8 0z" fill="#0047A0"/>'
      + '<path d="M5 8.5l3 -2.5M5.8 9.5l3-2.5M23 6l3 2.5M22.2 7l3 2.5M5 23.5l3 2.5M5.8 22.5l3 2.5M23 26l3-2.5M22.2 25l3-2.5" stroke="#111" stroke-width="1"/>',
    australia: () => fundo('#012169') + '<rect width="15" height="15" fill="#012169"/><path d="M0 0L15 15M15 0L0 15" stroke="#fff" stroke-width="2.4"/><rect x="6" width="3" height="15" fill="#fff"/><rect y="6" width="15" height="3" fill="#fff"/><rect x="6.7" width="1.6" height="15" fill="#C8102E"/><rect y="6.7" width="15" height="1.6" fill="#C8102E"/>'
      + estrela(8, 23, 3, '#fff') + estrela(23, 9, 1.8, '#fff') + estrela(26, 16, 1.8, '#fff') + estrela(22, 24, 1.8, '#fff'),
    arabia: () => fundo('#006C35') + '<path d="M8 12.5h16M9 14.5h14" stroke="#fff" stroke-width="1" opacity=".9"/><path d="M8 20h15l1.5-1" stroke="#fff" stroke-width="1.2" fill="none"/>',
    ira: () => faixasH(['#239F40', '#fff', '#DA0000']) + '<circle cx="16" cy="16" r="2.2" fill="none" stroke="#DA0000" stroke-width="1"/>',
    marrocos: () => fundo('#C1272D') + `<path d="${estrelaD(16, 16.6, 6.5)}" fill="none" stroke="#006233" stroke-width="1.3"/>`,
    senegal: () => faixasV(['#00853F', '#FDEF42', '#E31B23']) + estrela(16, 16.5, 3.6, '#00853F'),
    gana: () => faixasH(['#CE1126', '#FCD116', '#006B3F']) + estrela(16, 16.6, 3.6, '#111'),
    nigeria: () => faixasV(['#008751', '#fff', '#008751']),
    camaroes: () => faixasV(['#007A5E', '#CE1126', '#FCD116']) + estrela(16, 16.5, 3.4, '#FCD116'),
    marfim: () => faixasV(['#F77F00', '#fff', '#009E60']),
    egito: () => faixasH(['#CE1126', '#fff', '#111']) + '<circle cx="16" cy="16" r="2" fill="#C09300"/>',
    tunisia: () => fundo('#E70013') + '<circle cx="16" cy="16" r="6.5" fill="#fff"/><circle cx="16.4" cy="16" r="4.6" fill="#E70013"/><circle cx="17.8" cy="16" r="3.8" fill="#fff"/>' + estrela(18.2, 16, 2.2, '#E70013'),
    argelia: () => faixasV(['#006233', '#fff']) + '<circle cx="16" cy="16" r="5.6" fill="#D21034"/><circle cx="17.6" cy="16" r="4.6" fill="#fff"/>' + estrela(19, 16, 2.4, '#D21034'),
    suica: () => fundo('#DA291C') + '<rect x="13.8" y="7.5" width="4.4" height="17" fill="#fff"/><rect x="7.5" y="13.8" width="17" height="4.4" fill="#fff"/>',
    suecia: () => cruzNordica('#006AA7', '#FECC00'),
    dinamarca: () => cruzNordica('#C8102E', '#fff'),
    noruega: () => cruzNordica('#BA0C2F', '#fff', '#00205B'),
    polonia: () => faixasH(['#fff', '#DC143C']),
    servia: () => faixasH(['#C6363C', '#0C4076', '#fff']),
    austria: () => faixasH(['#ED2939', '#fff', '#ED2939']),
    escocia: () => fundo('#0065BD') + '<path d="M0 0L32 32M32 0L0 32" stroke="#fff" stroke-width="4.5"/>',
    turquia: () => fundo('#E30A17') + '<circle cx="13" cy="16" r="6.6" fill="#fff"/><circle cx="14.7" cy="16" r="5.3" fill="#E30A17"/>' + estrela(21, 16, 2.6, '#fff'),
    tcheca: () => faixasH(['#fff', '#D7141A']) + '<path d="M0 0L16 16L0 32Z" fill="#11457E"/>',
    hungria: () => faixasH(['#CE2939', '#fff', '#477050']),
    ucrania: () => faixasH(['#0057B7', '#FFD700']),
    costa_rica: () => faixasH(['#002B7F', '#fff', '#CE1126', '#fff', '#002B7F'], [1, 1, 2, 1, 1]),
    africa_do_sul: () => faixasH(['#E03C31', '#fff', '#007749', '#fff', '#001489'], [3, 1, 3, 1, 3]) + '<path d="M0 0L14 16L0 32Z" fill="#FFB81C"/><path d="M0 4L10.5 16L0 28Z" fill="#000"/>',
    bosnia: () => fundo('#002395') + '<path d="M9 0H27V20Z" fill="#FECB00"/>' + [[8, 4], [12, 9], [16, 14], [20, 19]].map(([x, y]) => estrela(x, y, 1.5, '#fff')).join(''),
    cabo_verde: () => fundo('#003893') + '<rect y="17" width="32" height="2.5" fill="#fff"/><rect y="19.5" width="32" height="2.5" fill="#CF2027"/><rect y="22" width="32" height="2.5" fill="#fff"/><circle cx="12" cy="20" r="6" fill="none" stroke="#F7D116" stroke-width="1.2" stroke-dasharray="1.2 2"/>',
    catar: () => fundo('#8A1538') + '<path d="M0 0H11L14 2L11 4L14 6L11 8L14 10L11 12L14 14L11 16L14 18L11 20L14 22L11 24L14 26L11 28L14 30L11 32H0Z" fill="#fff"/>',
    curacao: () => fundo('#002B7F') + '<rect y="20" width="32" height="4" fill="#F9E814"/>' + estrela(7, 7, 2.2, '#fff') + estrela(12, 11, 3, '#fff'),
    haiti: () => faixasH(['#00209F', '#D21034']) + '<rect x="11" y="12" width="10" height="8" fill="#fff"/>',
    iraque: () => faixasH(['#CE1126', '#fff', '#000']) + '<path d="M11 17.5h10" stroke="#007A3D" stroke-width="1.6"/>',
    jordania: () => faixasH(['#000', '#fff', '#007A3D']) + '<path d="M0 0L16 16L0 32Z" fill="#CE1126"/>' + estrela(5.5, 16, 2, '#fff'),
    panama: () => fundo('#fff') + '<rect x="16" width="16" height="16" fill="#DA121A"/><rect y="16" width="16" height="16" fill="#072357"/>' + estrela(8, 8, 3, '#072357') + estrela(24, 24, 3, '#DA121A'),
    uzbequistao: () => faixasH(['#0099B5', '#CE1126', '#fff', '#CE1126', '#1EB53A'], [10, 1, 10, 1, 10]) + '<circle cx="7" cy="5.5" r="3" fill="#fff"/><circle cx="8.3" cy="5.5" r="2.6" fill="#0099B5"/>',
    congo: () => fundo('#007FFF') + '<path d="M-2 30L30 -2" stroke="#F7D618" stroke-width="11"/><path d="M-2 30L30 -2" stroke="#CE1021" stroke-width="7"/>' + estrela(8, 8, 4, '#F7D618'),
    nova_zelandia: () => fundo('#00247D') + '<path d="M0 0L15 15M15 0L0 15" stroke="#fff" stroke-width="2.4"/><rect x="6" width="3" height="15" fill="#fff"/><rect y="6" width="15" height="3" fill="#fff"/><rect x="6.7" width="1.6" height="15" fill="#C8102E"/><rect y="6.7" width="15" height="1.6" fill="#C8102E"/>'
      + [[23, 9], [26, 16], [20, 17], [23, 25]].map(([x, y]) => `<path d="${estrelaD(x, y, 2)}" fill="#CC142B" stroke="#fff" stroke-width=".5"/>`).join(''),
  };
  function bandeiraSVG(id) {
    const f = BANDEIRAS[id];
    const cid = 'bf' + (nClip++);
    return `<svg viewBox="0 0 32 32" aria-hidden="true"><defs><clipPath id="${cid}"><circle cx="16" cy="16" r="16"/></clipPath></defs>`
      + `<g clip-path="url(#${cid})">${f ? f() : fundo('#888')}</g><circle cx="16" cy="16" r="15.4" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="1.2"/></svg>`;
  }

  // escudo de um time do jogo (seleção = bandeira), de um participante ou do meu time
  function escudo(timeId, tam) {
    const cls = 'escudo' + (tam ? ' ' + tam : '');
    if (timeId === 'eu') {
      const m = meuTime();
      return `<span class="${cls}">${escudoSVG(m.c1, m.c2, siglaDe(m.nome), m.forma, m.padrao)}</span>`;
    }
    const tm = C.time(timeId);
    if (!tm) return `<span class="${cls}"></span>`;
    // escudo real em PNG; se a imagem falhar, troca pelo desenhado (falhaEscudo)
    if (tm.img) return `<span class="${cls}" data-time="${tm.id}"><img src="${srcEscudo(tm.id)}" alt="" onerror="DezVisual.falhaEscudo(this)"></span>`;
    return escudoDesenhado(tm, cls);
  }
  const srcEscudo = (id) => 'img/escudos/' + id + '.png';
  // fallback: seleção = bandeira desenhada; clube = escudo SVG com as cores e a sigla
  function escudoDesenhado(tm, cls) {
    if (tm.tipo === 'selecao') return `<span class="${cls} bandeira">${bandeiraSVG(tm.id)}</span>`;
    const h = C.hash(tm.id);
    return `<span class="${cls}">${escudoSVG(tm.cores[0], tm.cores[1], tm.sigla, h % FORMAS.length, (h >>> 4) % PADROES.length)}</span>`;
  }
  function falhaEscudo(img) {
    const span = img.parentNode, tm = span && C.time(span.dataset.time);
    if (!tm) return;
    const novo = document.createElement('span');
    novo.innerHTML = escudoDesenhado(tm, span.className);
    span.replaceWith(novo.firstChild);
  }
  // Para desenhar em canvas: a imagem do escudo já carregada (ou null se falhar). Com cache.
  const imgsEscudo = {};
  function imagemEscudo(timeId) {
    const tm = C.time(timeId);
    if (!tm || !tm.img) return Promise.resolve(null);
    if (!imgsEscudo[timeId]) {
      imgsEscudo[timeId] = new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = srcEscudo(timeId); });
    }
    return imgsEscudo[timeId];
  }

  // ------------------------------------------------------------ nomes
  const siglaTime = (timeId) => {
    if (timeId === 'eu') return siglaDe(meuTime().nome);
    const tm = C.time(timeId);
    return tm.sigla || siglaDe(C.nomeTime(tm, 'pt'));
  };
  const nomeTime =(timeId) => (timeId === 'eu' ? meuTime().nome : C.nomeTime(C.time(timeId), D.I18N.lang));
  const rotulo = (timeId, ano) => (timeId === 'eu' ? '' : C.rotuloAno(C.time(timeId), ano, D.I18N.lang));
  // participante de campanha: "Brasil 1970"
  function nomePart(c, id) {
    if (id === 'eu') return meuTime().nome;
    const p = c.times[id];
    return nomeTime(p.time) + ' ' + rotulo(p.time, p.ano);
  }
  const coresDe = (timeId) => {
    if (timeId === 'eu') { const m = meuTime(); return [m.c1, m.c2]; }
    return C.time(timeId).cores;
  };
  const linhaPos = (pos) => C.LINHA[pos];
  const posTxt = (pos) => t('pos.' + pos);
  const classeNota = (n) => (n >= 90 ? 'n90' : n >= 85 ? 'n85' : n >= 80 ? 'n80' : '');
  const numFmt = (n) => Number(n).toLocaleString(D.I18N.lang === 'en' ? 'en-US' : D.I18N.lang === 'es' ? 'es-ES' : 'pt-BR');
  const moedaHTML = '<span class="moeda"></span>';

  // ------------------------------------------------------------ bolas
  // ids salvos no aparelho (compradas/selecionada): não renomear. As "inspiradas" lembram bolas
  // marcantes de finais e Copas, sem usar nome nem marca de ninguém.
  const BOLAS = [
    { id: 'classica', preco: 0, estilo: 'pentagonos', cor: '#FAFAF7', det: '#1D1D1D' },
    { id: 'estrelada', preco: 1200, estilo: 'estrelas', cor: '#FAFAF7', det: '#14214D', inspirada: true },
    { id: 'estrelada_ouro', preco: 1500, estilo: 'estrelas', cor: '#161616', det: '#E6C26E', inspirada: true },
    { id: 'triade', preco: 700, estilo: 'triade', cor: '#FAFAF7', det: '#151515', inspirada: true },
    { id: 'asteca', preco: 800, estilo: 'triade', cor: '#FAFAF7', det: '#151515', det2: '#2E7D32', inspirada: true },
    { id: 'chama', preco: 900, estilo: 'chama', cor: '#F4EFE2', det: '#E2B23C', det2: '#C8102E', inspirada: true },
    { id: 'onze', preco: 1000, estilo: 'manchas', cor: '#FAFAF7', cores: ['#F2C200', '#2E9D4F', '#2A6FDB', '#E0403A'], inspirada: true },
    { id: 'helice', preco: 900, estilo: 'helice', cor: '#FAFAF7', cores: ['#1F5FD1', '#F28C28', '#2EA44F'], inspirada: true },
    { id: 'pixel', preco: 800, estilo: 'pixel', cor: '#FAFAF7', det: '#2B2B2B', inspirada: true },
    { id: 'jornada', preco: 1100, estilo: 'asas', cor: '#F5F5F0', cores: ['#E64A8C', '#2E86DE', '#F5C518'], inspirada: true },
    { id: 'retro', preco: 400, estilo: 'gomos', cor: '#9A6232', det: '#5E3A1A' },
    { id: 'dourada', preco: 900, estilo: 'pentagonos', cor: '#E6C26E', det: '#8A6A1E' },
    { id: 'neon', preco: 500, estilo: 'pentagonos', cor: '#D4F25C', det: '#1A1A1A' },
    { id: 'rubra', preco: 400, estilo: 'pentagonos', cor: '#D64541', det: '#FAFAF7' },
    { id: 'galaxia', preco: 700, estilo: 'pentagonos', cor: '#3B2A7A', det: '#9AD9FF' },
    { id: 'tricolor', preco: 600, estilo: 'pentagonos', cor: '#FAFAF7', det: '#2B6CC4', det2: '#D64541' },
    { id: 'noturna', preco: 600, estilo: 'pentagonos', cor: '#141414', det: '#D4F25C' },
    // segunda leva (30 no total)
    { id: 'etrusca', preco: 1000, estilo: 'triade', cor: '#FAFAF7', det: '#151515', det2: '#8C6239', inspirada: true },
    { id: 'orbita', preco: 1000, estilo: 'triade', cor: '#FAFAF7', det: '#1F4FA0', det2: '#151515', inspirada: true },
    { id: 'tricolor98', preco: 1100, estilo: 'triade', cor: '#FAFAF7', det: '#1B3F8B', det2: '#C8102E', inspirada: true },
    { id: 'gira', preco: 1100, estilo: 'helice', cor: '#FAFAF7', cores: ['#151515', '#C9A227', '#151515'], inspirada: true },
    { id: 'triplice', preco: 1500, estilo: 'ondas', cor: '#FAFAF7', cores: ['#D7263D', '#1F5FD1', '#1E9E5A'], inspirada: true },
    { id: 'listrada', preco: 500, estilo: 'listras', cor: '#FAFAF7', det: '#D64541' },
    { id: 'xadrez', preco: 700, estilo: 'xadrez', cor: '#FAFAF7', det: '#151515' },
    { id: 'carbono', preco: 1400, estilo: 'xadrez', cor: '#2A2D2C', det: '#111312' },
    { id: 'oceano', preco: 900, estilo: 'ondas', cor: '#E8F4FA', cores: ['#0B4F8A', '#2E86DE', '#7FC8F8'] },
    { id: 'relampago', preco: 1200, estilo: 'raios', cor: '#161616', det: '#F5C518' },
    { id: 'espiral', preco: 1000, estilo: 'espiral', cor: '#FAFAF7', det: '#6A4C93', det2: '#F28C28' },
    { id: 'arco_iris', preco: 1300, estilo: 'manchas', cor: '#FAFAF7', cores: ['#E0403A', '#F2C200', '#2E9D4F', '#6A4C93'] },
    { id: 'diamante', preco: 2000, estilo: 'estrelas', cor: '#F2F4F7', det: '#9AA4B2' },
  ];
  const poligono = (ctx, cx, cy, rr, n, rot) => {
    ctx.beginPath();
    for (let i = 0; i < n; i++) { const a = rot + i * Math.PI * 2 / n; ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
    ctx.closePath();
  };
  const estrelaCtx = (ctx, cx, cy, rr, rot) => {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, q = i % 2 ? rr * 0.42 : rr; ctx[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * q, cy + Math.sin(a) * q); }
    ctx.closePath();
  };
  // desenho de cada estilo, dentro do círculo da bola (já recortado)
  const ESTILOS = {
    pentagonos(ctx, x, y, r, b) {
      ctx.fillStyle = b.det;
      poligono(ctx, x, y, r * 0.36, 5, -Math.PI / 2); ctx.fill();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 5 + Math.PI / 5;
        ctx.fillStyle = b.det2 && i % 2 ? b.det2 : b.det;
        poligono(ctx, x + Math.cos(a) * r * 0.95, y + Math.sin(a) * r * 0.95, r * 0.33, 5, a + Math.PI / 2); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(0,0,0,.14)'; ctx.lineWidth = Math.max(0.6, r * 0.03);
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r * 0.36, y + Math.sin(a) * r * 0.36); ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.stroke(); }
    },
    estrelas(ctx, x, y, r, b) {
      ctx.fillStyle = b.det;
      estrelaCtx(ctx, x, y, r * 0.42, -Math.PI / 2); ctx.fill();
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5 + Math.PI / 5; estrelaCtx(ctx, x + Math.cos(a) * r * 0.92, y + Math.sin(a) * r * 0.92, r * 0.36, a); ctx.fill(); }
    },
    triade(ctx, x, y, r, b) {
      ctx.lineWidth = r * 0.2; ctx.strokeStyle = b.det;
      for (let k = 0; k < 3; k++) {
        const a = -Math.PI / 2 + k * Math.PI * 2 / 3;
        ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.98, y + Math.sin(a) * r * 0.98, r * 0.6, 0, Math.PI * 2); ctx.stroke();
        if (b.det2) { // detalhes geométricos entre as tríades
          ctx.fillStyle = b.det2;
          const m = a + Math.PI / 3;
          poligono(ctx, x + Math.cos(m) * r * 0.5, y + Math.sin(m) * r * 0.5, r * 0.12, 3, m); ctx.fill();
        }
      }
      ctx.fillStyle = b.det; ctx.beginPath(); ctx.arc(x, y, r * 0.1, 0, Math.PI * 2); ctx.fill();
    },
    chama(ctx, x, y, r, b) {
      for (let k = 0; k < 3; k++) {
        const a = -Math.PI / 2 + k * Math.PI * 2 / 3;
        const cx = x + Math.cos(a) * r * 0.5, cy = y + Math.sin(a) * r * 0.5;
        ctx.fillStyle = b.det;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a - 0.5) * r * 0.15, y + Math.sin(a - 0.5) * r * 0.15);
        ctx.quadraticCurveTo(cx + Math.cos(a + 1.4) * r * 0.5, cy + Math.sin(a + 1.4) * r * 0.5, x + Math.cos(a) * r * 1.05, y + Math.sin(a) * r * 1.05);
        ctx.quadraticCurveTo(cx + Math.cos(a - 1.4) * r * 0.2, cy + Math.sin(a - 1.4) * r * 0.2, x + Math.cos(a - 0.5) * r * 0.15, y + Math.sin(a - 0.5) * r * 0.15);
        ctx.fill();
        ctx.fillStyle = b.det2;
        poligono(ctx, x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.62, r * 0.13, 3, a); ctx.fill();
      }
    },
    manchas(ctx, x, y, r, b) {
      b.cores.forEach((c, k) => {
        const a = -Math.PI / 4 + k * Math.PI / 2;
        ctx.fillStyle = c;
        ctx.save(); ctx.translate(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(-r * 0.35, -r * 0.12); ctx.lineTo(r * 0.3, -r * 0.3); ctx.lineTo(r * 0.12, r * 0.32); ctx.closePath(); ctx.fill();
        ctx.restore();
      });
    },
    helice(ctx, x, y, r, b) {
      ctx.lineWidth = r * 0.11; ctx.lineCap = 'round';
      for (let k = 0; k < 6; k++) {
        const a = k * Math.PI / 3;
        ctx.strokeStyle = b.cores[k % b.cores.length];
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * r * 0.2, y + Math.sin(a) * r * 0.2);
        ctx.bezierCurveTo(x + Math.cos(a + 0.6) * r * 0.6, y + Math.sin(a + 0.6) * r * 0.6, x + Math.cos(a - 0.3) * r * 0.8, y + Math.sin(a - 0.3) * r * 0.8, x + Math.cos(a + 0.2) * r * 1.05, y + Math.sin(a + 0.2) * r * 1.05);
        ctx.stroke();
      }
    },
    pixel(ctx, x, y, r, b) {
      const q = r * 0.2;
      ctx.fillStyle = b.det;
      for (let i = -5; i <= 5; i++) {
        for (let k = -5; k <= 5; k++) {
          const h = (i * 7 + k * 13 + i * k * 3) & 7; // padrão fixo (sem sorteio: igual em todo quadro)
          if (h < 2) ctx.fillRect(x + i * q - q / 2, y + k * q - q / 2, q * 0.92, q * 0.92);
        }
      }
    },
    asas(ctx, x, y, r, b) {
      ctx.lineWidth = r * 0.16; ctx.lineCap = 'round';
      b.cores.forEach((c, k) => {
        const a = -Math.PI / 2 + k * Math.PI * 2 / 3;
        ctx.strokeStyle = c;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(a) * r * 1.1, y + Math.sin(a) * r * 1.1);
        ctx.quadraticCurveTo(x + Math.cos(a + 1.2) * r * 0.2, y + Math.sin(a + 1.2) * r * 0.2, x + Math.cos(a + 2.1) * r * 1.1, y + Math.sin(a + 2.1) * r * 1.1);
        ctx.stroke();
      });
    },
    listras(ctx, x, y, r, b) {
      ctx.fillStyle = b.det;
      for (let i = -3; i <= 3; i += 2) ctx.fillRect(x + i * r * 0.28 - r * 0.12, y - r, r * 0.24, r * 2);
    },
    xadrez(ctx, x, y, r, b) {
      const q = r * 0.5;
      ctx.fillStyle = b.det;
      for (let i = -2; i < 2; i++) for (let k = -2; k < 2; k++) if ((i + k) & 1) ctx.fillRect(x + i * q, y + k * q, q, q);
    },
    ondas(ctx, x, y, r, b) {
      ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
      b.cores.forEach((c, k) => {
        ctx.strokeStyle = c;
        const yy = y + (k - 1) * r * 0.55;
        ctx.beginPath();
        for (let i = 0; i <= 16; i++) { const xx = x - r + (2 * r * i) / 16; const yv = yy + Math.sin(i / 16 * Math.PI * 2 + k) * r * 0.16; ctx[i ? 'lineTo' : 'moveTo'](xx, yv); }
        ctx.stroke();
      });
    },
    raios(ctx, x, y, r, b) {
      ctx.fillStyle = b.det;
      for (let k = 0; k < 3; k++) {
        const a = -Math.PI / 2 + k * Math.PI * 2 / 3;
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        ctx.beginPath(); ctx.moveTo(r * 0.1, -r * 0.08); ctx.lineTo(r * 0.62, -r * 0.2); ctx.lineTo(r * 0.5, 0); ctx.lineTo(r * 1.05, -r * 0.02); ctx.lineTo(r * 0.42, r * 0.18); ctx.lineTo(r * 0.52, 0.02 * r); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    },
    espiral(ctx, x, y, r, b) {
      ctx.lineWidth = r * 0.16; ctx.lineCap = 'round';
      [b.det, b.det2].forEach((c, k) => {
        ctx.strokeStyle = c;
        ctx.beginPath();
        for (let i = 0; i <= 40; i++) { const t = i / 40, a = t * Math.PI * 3 + k * Math.PI, rr = t * r * 1.05; ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
        ctx.stroke();
      });
    },
    gomos(ctx, x, y, r, b) {
      ctx.strokeStyle = b.det; ctx.lineWidth = Math.max(0.8, r * 0.07);
      [-0.45, 0, 0.45].forEach((k) => { ctx.beginPath(); ctx.ellipse(x + k * r, y, r * 0.2, r * 1.05, 0, 0, Math.PI * 2); ctx.stroke(); });
      ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.stroke();
    },
  };
  // r em pixels; em tamanho pequeno (a bola no campinho) só as cores principais aparecem
  function desenhaBola(ctx, x, y, r, skin) {
    const b = BOLAS.find((k) => k.id === skin) || BOLAS[0];
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = b.cor; ctx.fill();
    ctx.clip();
    if (r >= 7) ESTILOS[b.estilo](ctx, x, y, r, b);
    else {
      ctx.fillStyle = b.cores ? b.cores[0] : b.det;
      ctx.beginPath(); ctx.arc(x - r * 0.25, y - r * 0.1, r * 0.45, 0, Math.PI * 2); ctx.fill();
      if (b.det2 || b.cores) { ctx.fillStyle = b.det2 || b.cores[1]; ctx.beginPath(); ctx.arc(x + r * 0.35, y + r * 0.3, r * 0.32, 0, Math.PI * 2); ctx.fill(); }
    }
    // volume: luz de cima à esquerda, sombra embaixo à direita
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.05);
    g.addColorStop(0, 'rgba(255,255,255,0.38)'); g.addColorStop(0.55, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,0.32)');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.lineWidth = Math.max(0.8, r * 0.06); ctx.strokeStyle = 'rgba(0,0,0,.45)'; ctx.stroke();
  }

  // ------------------------------------------------------------ estádios
  // Os campos do Jogo do Milhão e do Fast Football (shared/estadios.js, gerado por tools/estadios.py).
  const GRATIS = ['brinco', 'mexico_city'];
  const ESTADIOS = (window.DEZ_ESTADIOS || []).map((e) => Object.assign({}, e, {
    preco: GRATIS.includes(e.id) ? 0 : e.liga === 'copa' ? 1500 : 800 + (C.hash('preco:' + e.id) % 5) * 200,
  })).sort((a, b) => (a.preco === 0 ? -1 : 0) - (b.preco === 0 ? -1 : 0) || a.nome.localeCompare(b.nome));
  const estadio = (id) => ESTADIOS.find((e) => e.id === id) || ESTADIOS[0];
  const EST_KEY = 'dez.estadios', EST_CFG_KEY = 'dez.estadio', BOLAS_KEY = 'dez.bolas';
  const listaSalva = (key) => { const v = D.guarda.json(key, []); return Array.isArray(v) ? v : []; };
  const temEstadio = (id) => GRATIS.includes(id) || D.store.owns('all_stadiums') || listaSalva(EST_KEY).includes(id);
  const temBola = (id) => !!BOLAS.find((b) => b.id === id && b.preco === 0) || D.store.owns('all_balls') || listaSalva(BOLAS_KEY).includes(id);
  // configuração do estádio (personalização): qual estádio, nome, gramado, luz, placas
  const estCfg = () => Object.assign({ sel: 'brinco', nome: '', gramado: 'original', luz: 'dia', placas: true, bola: 'classica' }, D.guarda.json(EST_CFG_KEY));
  const salvarEstCfg = (v) => D.guarda.salvar(EST_CFG_KEY, v);
  function comprarEstadio(id) {
    const e = estadio(id);
    if (temEstadio(id)) return true;
    if (!D.moedas.gastar(e.preco, 'estadio_' + id)) return false;
    D.guarda.salvar(EST_KEY, listaSalva(EST_KEY).concat(id));
    return true;
  }
  function comprarBola(id) {
    const b = BOLAS.find((k) => k.id === id);
    if (temBola(id)) return true;
    if (!D.moedas.gastar(b.preco, 'bola_' + id)) return false;
    D.guarda.salvar(BOLAS_KEY, listaSalva(BOLAS_KEY).concat(id));
    return true;
  }
  const GRAMADOS = ['original', 'listras', 'xadrez', 'diagonal', 'losangos'];
  const LUZES = ['dia', 'tarde', 'noite'];

  // imagens dos estádios: carregadas uma vez
  const imgs = {};
  function imagemEstadio(id, mini) {
    const key = (mini ? 'm:' : '') + id;
    if (!imgs[key]) {
      const im = new Image();
      im.src = '../shared/estadios/' + (mini ? 'mini/' : '') + id + '.jpg';
      imgs[key] = im;
    }
    return imgs[key];
  }

  window.DezVisual = {
    MARCA, logoHTML, icone, emblemaModo, bandeiraSVG, siglaTime,
    rgb, luz, contraste, distCor, uniformes, PALETA, meuTime, salvarMeuTime, siglaDe, escudo, escudoSVG, falhaEscudo, imagemEscudo, FORMAS, PADROES, esc,
    nomeTime, rotulo, nomePart, coresDe, linhaPos, posTxt, classeNota, numFmt, moedaHTML, BOLAS, desenhaBola,
    ESTADIOS, estadio, temEstadio, temBola, estCfg, salvarEstCfg, comprarEstadio, comprarBola, GRAMADOS, LUZES, imagemEstadio, GRATIS,
  };
})();

/* Contas pesadas do simulador fora da tela (Web Worker), com o mesmo núcleo do site e do Node.
   Mensagens: { tipo: 'chances' | 'precisa', id, liga, regras, placares, params, N, seed, time, objetivos } */
/* global importScripts, TNGCore */
'use strict';
importScripts('simulador-core.js');

let cacheChave = '', cacheL = null;
function ligaDe(msg) {
  const chave = msg.liga.baixado_em + ':' + msg.liga.jogos.length + ':' + msg.liga.jogos.filter((j) => /FULL|FINAL/.test(j.status)).length;
  if (chave !== cacheChave) { cacheL = TNGCore.preparar(msg.liga, msg.regras); cacheChave = chave; }
  return cacheL;
}

self.onmessage = function (ev) {
  const msg = ev.data;
  try {
    const L = ligaDe(msg);
    const M = TNGCore.modelo(L, msg.params);
    if (msg.tipo === 'chances') {
      const mc = TNGCore.monteCarlo(L, msg.placares, M, msg.N, msg.seed, (feitas) => self.postMessage({ id: msg.id, progresso: feitas / msg.N }));
      self.postMessage({ id: msg.id, fim: true, chances: TNGCore.chances(L, mc), N: mc.N });
    } else if (msg.tipo === 'precisa') {
      self.postMessage({ id: msg.id, fim: true, precisa: precisa(L, M, msg) });
    }
  } catch (e) {
    self.postMessage({ id: msg.id, erro: String((e && e.message) || e) });
  }
};

// Para o time escolhido e cada objetivo em aberto: chance atual, chance por pontos que o time
// fizer, e os jogos de outros times que mais mudam a chance ("torça por").
function precisa(L, M, msg) {
  const C = TNGCore, t = msg.time, N = msg.N, r = C.rng(msg.seed || 7);
  const objs = msg.objetivos;
  const livres = L.jogos.filter((j) => !j.feito && !C.placarDe(j, msg.placares));
  const probs = livres.map((j) => M.prob(j.h, j.a));
  const base = C.estatisticas(L, msg.placares);
  const P = L.regras.pontos;
  const s = base.map((x) => Object.assign({}, x));
  const sorteio = new Float64Array(L.n);
  // cont[o][g][res] = [vezes, vezes com o objetivo]; porPts[o][pts] = [vezes, com objetivo]
  const cont = objs.map(() => livres.map(() => [[0, 0], [0, 0], [0, 0]]));
  const porPts = objs.map(() => ({}));
  const sim = objs.map(() => 0);
  const res = new Uint8Array(livres.length);
  const plac = {};
  for (let it = 0; it < N; it++) {
    for (let i = 0; i < L.n; i++) { const b = base[i], x = s[i]; x.pts = b.pts; x.j = b.j; x.v = b.v; x.e = b.e; x.d = b.d; x.gp = b.gp; x.gc = b.gc; sorteio[i] = r(); }
    let ptsT = 0;
    for (let g = 0; g < livres.length; g++) {
      const j = livres[g], p = C.amostrar(probs[g], r);
      plac[j.chave] = p;
      res[g] = p[0] > p[1] ? 0 : p[0] === p[1] ? 1 : 2;
      if (j.h === t) ptsT += p[0] > p[1] ? 3 : p[0] === p[1] ? 1 : 0;
      if (j.a === t) ptsT += p[1] > p[0] ? 3 : p[0] === p[1] ? 1 : 0;
      somarSimples(s[j.h], s[j.a], p[0], p[1], P);
    }
    const tab = C.ordenar(L, s, Object.assign({}, msg.placares, plac), sorteio);
    let pos = 0;
    for (let q = 0; q < tab.length; q++) if (tab[q].i === t) { pos = q + 1; break; }
    for (let o = 0; o < objs.length; o++) {
      const ok = pos >= objs[o].de && pos <= objs[o].ate ? 1 : 0;
      sim[o] += ok;
      const pp = porPts[o][ptsT] || (porPts[o][ptsT] = [0, 0]);
      pp[0]++; pp[1] += ok;
      const c = cont[o];
      for (let g = 0; g < livres.length; g++) { const k = c[g][res[g]]; k[0]++; k[1] += ok; }
    }
    if ((it + 1) % 500 === 0) self.postMessage({ id: msg.id, progresso: (it + 1) / N });
  }
  return objs.map((obj, o) => {
    const impacto = livres.map((j, g) => {
      const c = cont[o][g];
      const chance = c.map((k) => (k[0] ? k[1] / k[0] : null));
      const validas = chance.filter((x) => x != null);
      const melhor = chance.indexOf(Math.max.apply(null, validas));
      return { chave: j.chave, h: j.h, a: j.a, proprio: j.h === t || j.a === t, chance, melhor, amplitude: Math.max.apply(null, validas) - Math.min.apply(null, validas) };
    }).sort((x, y) => y.amplitude - x.amplitude);
    const pts = Object.keys(porPts[o]).map(Number).sort((a, b) => b - a).map((p) => ({ pts: p, vezes: porPts[o][p][0], chance: porPts[o][p][1] / porPts[o][p][0] }));
    return { id: obj.id, chance: sim[o] / N, impacto: impacto.slice(0, 12), pts };
  });
}

function somarSimples(A, B, gh, ga, P) {
  A.j++; B.j++; A.gp += gh; A.gc += ga; B.gp += ga; B.gc += gh;
  if (gh > ga) { A.v++; B.d++; A.pts += P.vitoria; B.pts += P.derrota; }
  else if (gh < ga) { B.v++; A.d++; B.pts += P.vitoria; A.pts += P.derrota; }
  else { A.e++; B.e++; A.pts += P.empate; B.pts += P.empate; }
}

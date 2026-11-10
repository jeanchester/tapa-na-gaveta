// Calibração do modelo: node tools/calibrar.js
// Para cada jogo já disputado (depois das primeiras rodadas), ajusta o modelo SÓ com os jogos de
// datas anteriores e mede o erro da previsão (Brier score de 3 resultados; menor é melhor).
// Busca em grade pelos pesos e imprime os melhores, comparados com dois modelos de referência.
const fs = require('fs');
const path = require('path');
const C = require('../shared/simulador-core.js');

const raiz = path.resolve(__dirname, '..');
const liga = JSON.parse(fs.readFileSync(path.join(raiz, 'dados/brasileirao-2026.json'), 'utf8'));
const regras = JSON.parse(fs.readFileSync(path.join(raiz, 'shared/regras-brasileirao-2026.json'), 'utf8'));
const L = C.preparar(liga, regras);

const feitos = L.jogos.filter((j) => j.feito);
const AQUECIMENTO = 50;                       // os primeiros 50 jogos (≈ 5 rodadas) só alimentam o modelo
const avaliados = feitos.slice(AQUECIMENTO);
const dia = (j) => j.data.slice(0, 10);

function brier(p, j) {
  const o = j.gh > j.ga ? [1, 0, 0] : j.gh === j.ga ? [0, 1, 0] : [0, 0, 1];
  return (p[0] - o[0]) ** 2 + (p[1] - o[1]) ** 2 + (p[2] - o[2]) ** 2;
}
function logloss(p, j) {
  const k = j.gh > j.ga ? 0 : j.gh === j.ga ? 1 : 2;
  return -Math.log(Math.max(1e-9, p[k]));
}

function avaliar(params) {
  const modelos = {};
  let b = 0, ll = 0;
  for (const j of avaliados) {
    const d = dia(j);
    const M = modelos[d] || (modelos[d] = C.modelo(L, params, d));
    const p = M.prob(j.h, j.a);
    const v = [p.ph, p.pd, p.pa];
    b += brier(v, j); ll += logloss(v, j);
  }
  return { brier: b / avaliados.length, logloss: ll / avaliados.length };
}

// referências: (1) frequências da liga até a véspera; (2) "só mando" igual para todos
function referencia() {
  let b = 0;
  for (const j of avaliados) {
    const antes = feitos.filter((x) => dia(x) < dia(j));
    const h = antes.filter((x) => x.gh > x.ga).length, d = antes.filter((x) => x.gh === x.ga).length;
    b += brier([h / antes.length, d / antes.length, 1 - (h + d) / antes.length], j);
  }
  return b / avaliados.length;
}

const t0 = Date.now();
const grade = [];
for (const k of [4, 8, 12, 16, 24, 32, 48])
  for (const nForma of [3, 5])
    for (const wForma of [0, 0.15, 0.3, 0.45, 0.6])
      for (const wPPG of [0, 0.3, 0.6, 0.9, 1.2, 1.6])
        for (const rho of [0, -0.05, -0.1])
          grade.push({ k, nForma, wForma, wPPG, rho });

const res = grade.map((p) => Object.assign({ p }, avaliar(p))).sort((a, b) => a.brier - b.brier);
const ref = referencia();
const fmt = (r) => `Brier ${r.brier.toFixed(4)} · log-loss ${r.logloss.toFixed(4)} · ${JSON.stringify(r.p)}`;
console.log(`${avaliados.length} jogos avaliados (de ${feitos.length}), ${grade.length} combinações, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
console.log(`referência (frequências da liga): Brier ${ref.toFixed(4)}`);
console.log('\nmelhores:');
res.slice(0, 8).forEach((r) => console.log('  ' + fmt(r)));
console.log('\nmelhor com forma de 3 jogos:  ' + fmt(res.find((r) => r.p.nForma === 3)));
console.log('melhor com forma de 5 jogos:  ' + fmt(res.find((r) => r.p.nForma === 5)));
console.log('sem forma nem pontos por jogo: ' + fmt(res.find((r) => r.p.wForma === 0 && r.p.wPPG === 0)));
console.log('pior: ' + fmt(res[res.length - 1]));

// calibração por faixas: quando o modelo diz 50–60% de vitória do mandante, acontece quanto?
const melhor = res[0].p;
const faixas = {};
const modelos = {};
for (const j of avaliados) {
  const d = dia(j), M = modelos[d] || (modelos[d] = C.modelo(L, melhor, d)), p = M.prob(j.h, j.a);
  [[p.ph, j.gh > j.ga], [p.pd, j.gh === j.ga], [p.pa, j.gh < j.ga]].forEach(([q, aconteceu]) => {
    const f = Math.min(9, Math.floor(q * 10));
    const x = faixas[f] || (faixas[f] = { n: 0, soma: 0, sim: 0 });
    x.n++; x.soma += q; x.sim += aconteceu ? 1 : 0;
  });
}
console.log('\ncalibração (previsto → aconteceu):');
Object.keys(faixas).sort((a, b) => a - b).forEach((f) => {
  const x = faixas[f];
  console.log(`  ${(f * 10).toString().padStart(2)}–${f * 10 + 10}%: previsto ${(100 * x.soma / x.n).toFixed(1)}%, aconteceu ${(100 * x.sim / x.n).toFixed(1)}% (${x.n})`);
});
if (process.argv.includes('--json')) console.log(JSON.stringify(melhor));

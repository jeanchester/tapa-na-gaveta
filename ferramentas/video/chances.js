// Números do modelo do site para os vídeos: chance de título, de vaga e de queda, e como cada uma muda
// conforme o resultado do próximo jogo de cada time.
//
//   node ferramentas/video/chances.js corinthians gremio vitoria internacional
//   node ferramentas/video/chances.js flamengo palmeiras --n 200000
//   node ferramentas/video/chances.js corinthians --placar chapecoense-vasco=0-2     (jogo que o retrato ainda não tem)
//   node ferramentas/video/chances.js --comp champions real_madrid liverpool          (outra competição de shared/competicoes.json)
//   node ferramentas/video/chances.js --comp champions --times                        (lista os apelidos dos times)
//   node ferramentas/video/chances.js corinthians --pontos                            (chance de cada faixa por pontos somados até o fim)
//   node ferramentas/video/chances.js corinthians --desfazer corinthians-botafogo      (como estava antes de um jogo já jogado)
//   CASAS=3 node ferramentas/video/chances.js remo                                     (mais casas decimais nas porcentagens)
//
// Usa o retrato dados/brasileirao-2026.json (atualize antes com: python ferramentas/baixar_espn.py) e o mesmo
// núcleo do simulador (shared/simulador-core.js), então os números batem com os do site.
'use strict';
const path = require('path');
const C = require('../../shared/simulador-core.js');
const raiz = path.resolve(__dirname, '../..');
const args = process.argv.slice(2);
let N = 100000, compId = 'seriea', listar = false, porPontos = false;
const alvos = [], placares = [], desfazer = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--n') N = +args[++i];
  else if (args[i] === '--placar') placares.push(args[++i]);
  else if (args[i] === '--comp') compId = args[++i];
  else if (args[i] === '--times') listar = true;
  else if (args[i] === '--pontos') porPontos = true;
  else if (args[i] === '--desfazer') desfazer.push(args[++i]);
  else alvos.push(args[i]);
}
const ler = (f) => JSON.parse(require('fs').readFileSync(path.join(raiz, f), 'utf8'));
const comp = ler('shared/competicoes.json').lista.find((c) => c.id === compId);
if (!comp) throw new Error('competição desconhecida: ' + compId);
const liga = ler(comp.dados), regras = ler(comp.regras);

const Lp = C.preparar(liga, regras);
const slug = (i) => Lp.times[i].slug, idDe = (s) => { const t = Lp.times.find((x) => x.slug === s); if (!t) throw new Error('time desconhecido: ' + s); return t.id; };
// --placar mandante-visitante=gh-ga: grava o resultado no retrato (jogo terminado que a reserva ainda não tem)
placares.forEach((p) => {
  const [par, pl] = p.split('='), [h, a] = par.split('-'), [gh, ga] = pl.split('-').map(Number);
  const j = liga.jogos.find((x) => x.mandante === idDe(h) && x.visitante === idDe(a));
  if (!j) throw new Error('jogo não achado: ' + par);
  Object.assign(j, { status: 'STATUS_FULL_TIME', gols_mandante: gh, gols_visitante: ga, ao_vivo: null });
});
// --desfazer mandante-visitante: volta um jogo terminado para "por jogar" (o retrato de antes daquele jogo)
desfazer.forEach((par) => {
  const [h, a] = par.split('-'), j = liga.jogos.find((x) => x.mandante === idDe(h) && x.visitante === idDe(a));
  if (!j) throw new Error('jogo não achado: ' + par);
  Object.assign(j, { status: 'STATUS_SCHEDULED', gols_mandante: null, gols_visitante: null, ao_vivo: null });
});
const L = C.preparar(liga, regras), M = C.modelo(L, {});
if (listar) { console.log(L.times.map((t) => t.slug + ' (' + t.nome + ')').join('\n')); process.exit(0); }
const times = (alvos.length ? alvos : L.times.map((t) => t.slug)).map((s) => L.times.find((t) => t.slug === s).i);
const livres = L.jogos.filter((j) => !j.feito);
const probs = livres.map((j) => M.prob(j.h, j.a));
const prox = {};
times.forEach((t) => { const g = livres.map((j, k) => [j, k]).filter(([j]) => j.h === t || j.a === t).sort((a, b) => (a[0].data < b[0].data ? -1 : 1))[0]; prox[t] = g ? g[1] : -1; });

// nomes das faixas: os do regulamento (Champions: 1º, oitavas, playoff, fora e "vivo" = 1º a 24º)
const zonas = {};
zonas[regras.primeiro ? '1º' : 'titulo'] = [1, 1];
regras.zonas.forEach((z) => { zonas[regras.primeiro ? z.curto.toLowerCase() : z.id] = [z.de, z.ate]; });
const rb = regras.zonas.find((z) => z.id === 'rb');
if (regras.primeiro && rb) zonas['mata-mata'] = [1, rb.de - 1];
const nomes = Object.keys(zonas);
const r = C.rng(20261115), base = C.estatisticas(L, {}), s = base.map((x) => Object.assign({}, x)), sorteio = new Float64Array(L.n);
const cont = {}; times.forEach((t) => { cont[t] = { z: nomes.map(() => 0), r: [0, 1, 2].map(() => ({ n: 0, z: nomes.map(() => 0) })), p: {} }; });
for (let it = 0; it < N; it++) {
  for (let i = 0; i < L.n; i++) { const b = base[i], x = s[i]; x.pts = b.pts; x.j = b.j; x.v = b.v; x.e = b.e; x.d = b.d; x.gp = b.gp; x.gc = b.gc; x.gf = b.gf; x.vf = b.vf; delete x.criterio; sorteio[i] = r(); }
  const sim = {}, res = new Int8Array(livres.length);
  for (let k = 0; k < livres.length; k++) {
    const j = livres[k], p = C.amostrar(probs[k], r); sim[j.chave] = p;
    const A = s[j.h], B = s[j.a]; A.j++; B.j++; A.gp += p[0]; A.gc += p[1]; B.gp += p[1]; B.gc += p[0]; B.gf += p[1];
    if (p[0] > p[1]) { A.v++; B.d++; A.pts += 3; res[k] = 0; } else if (p[0] < p[1]) { B.v++; B.vf++; A.d++; B.pts += 3; res[k] = 2; } else { A.e++; B.e++; A.pts += 1; B.pts += 1; res[k] = 1; }
  }
  const tab = C.ordenar(L, s, sim, sorteio), pos = {}; tab.forEach((x, q) => { pos[x.i] = q + 1; });
  times.forEach((t) => {
    const c = cont[t], k = prox[t];
    let o = -1; if (k >= 0) { o = res[k]; if (livres[k].a === t) o = 2 - o; }
    nomes.forEach((z, q) => { const ok = pos[t] >= zonas[z][0] && pos[t] <= zonas[z][1] ? 1 : 0; c.z[q] += ok; if (o >= 0) c.r[o].z[q] += ok; });
    if (o >= 0) c.r[o].n++;
    const g = s[t].pts - base[t].pts, cp = c.p[g] || (c.p[g] = { n: 0, z: nomes.map(() => 0) });     // pontos somados até o fim
    cp.n++; nomes.forEach((z, q) => { if (pos[t] >= zonas[z][0] && pos[t] <= zonas[z][1]) cp.z[q]++; });
  });
}
const CASAS = +(process.env.CASAS || 1);
const pc = (v, n) => (n ? (100 * v / n).toFixed(CASAS).replace('.', ',') + '%' : '–');
const tab0 = C.tabela(L, {});
console.log(`${comp.nome} · modelo do site · ${N} simulações · retrato ${liga.baixado_em} · ${livres.length} jogos restantes`);
times.forEach((t) => {
  const x = tab0.find((y) => y.i === t), c = cont[t], k = prox[t];
  console.log(`\n${slug(t)}: ${x.pos}º, ${x.pts} pts, ${x.j} jogos`);
  console.log('  hoje:      ' + nomes.map((z, q) => `${z} ${pc(c.z[q], N)}`).join(' · '));
  if (porPontos) {
    console.log('  por pontos somados até o fim (pontos finais · quantas simulações · faixas):');
    Object.keys(c.p).map(Number).sort((u, v) => u - v).forEach((g) => {
      const cp = c.p[g];
      console.log(`    +${g} (${x.pts + g} pts) · ${pc(cp.n, N)} das simulações · ` + nomes.map((z, q) => `${z} ${pc(cp.z[q], cp.n)}`).join(' · '));
    });
  }
  if (k < 0) return;
  const j = livres[k], pr = probs[k]; let h = 0, d = 0, a = 0; const G1 = pr.G + 1;
  pr.m.forEach((v, q) => { const gh = Math.floor(q / G1), ga = q % G1; if (gh > ga) h += v; else if (gh === ga) d += v; else a += v; });
  const p3 = j.h === t ? [h, d, a] : [a, d, h];
  console.log(`  próximo:   ${slug(j.h)} x ${slug(j.a)} (${j.data}) · vence ${pc(p3[0], 1)} · empata ${pc(p3[1], 1)} · perde ${pc(p3[2], 1)}`);
  ['se vencer', 'se empatar', 'se perder'].forEach((rot, o) => {
    console.log(`  ${rot.padEnd(10)} ` + nomes.map((z, q) => `${z} ${pc(c.r[o].z[q], c.r[o].n)}`).join(' · '));
  });
});

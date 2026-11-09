// Testes do núcleo do simulador: node tools/testar-core.js
const fs = require('fs');
const path = require('path');
const C = require('../shared/simulador-core.js');

const raiz = path.resolve(__dirname, '..');
const liga = JSON.parse(fs.readFileSync(path.join(raiz, 'dados/brasileirao-2026.json'), 'utf8'));
const regras = JSON.parse(fs.readFileSync(path.join(raiz, 'shared/regras-brasileirao-2026.json'), 'utf8'));

let falhas = 0, total = 0;
function ok(cond, msg) { total++; if (!cond) { falhas++; console.log('  FALHOU: ' + msg); } }
function perto(a, b, tol, msg) { ok(Math.abs(a - b) <= tol, msg + ` (${a} ≈ ${b})`); }
function grupo(nome, fn) { console.log(nome); fn(); }

const L = C.preparar(liga, regras);

grupo('classificação bate com a da ESPN', () => {
  const tab = C.tabela(L, {});
  const porId = {}; tab.forEach((x) => { porId[L.times[x.i].id] = x; });
  liga.classificacao.forEach((c) => {
    const x = porId[c.time], nome = L.times[x.i].nome;
    ok(x.pts === c.pts && x.j === c.j && x.v === c.v && x.e === c.e && x.d === c.d && x.gp === c.gp && x.gc === c.gc, nome + ': números');
    ok(x.pos === c.pos, `${nome}: posição ${x.pos} (ESPN ${c.pos})`);
  });
});

grupo('rodadas deduzidas', () => {
  const rest = L.jogos.filter((j) => !j.feito);
  ok(rest.length === 41, '41 jogos restantes');
  ok(L.rodadasConfiaveis, 'nenhum time duas vezes na mesma rodada');
  const porR = {};
  rest.forEach((j) => { const k = j.atrasado ? 'atr' : j.rodada; porR[k] = (porR[k] || 0) + 1; });
  ok(porR[35] === 10 && porR[36] === 10 && porR[37] === 10 && porR[38] === 10 && porR.atr === 1, 'rodadas 35–38 com 10 jogos e 1 atrasado: ' + JSON.stringify(porR));
  const atr = rest.find((j) => j.atrasado);
  ok(L.times[atr.h].slug === 'chapecoense' && L.times[atr.a].slug === 'vasco', 'o atrasado é Chapecoense x Vasco');
});

// mini liga para os critérios de desempate
function mini(jogos, extra) {
  const times = ['A', 'B', 'C', 'D'].map((n) => ({ id: n, nome: n, escudo: n.toLowerCase() }));
  const js = jogos.map((j, k) => ({ id: String(k), data: '2026-01-' + String(10 + k).padStart(2, '0') + 'T20:00Z', status: j[2] == null ? 'STATUS_SCHEDULED' : 'STATUS_FULL_TIME', mandante: j[0], visitante: j[1], gols_mandante: j[2], gols_visitante: j[3] }));
  return C.preparar(Object.assign({ times, jogos: js }, extra || {}), regras);
}
const ordem = (M, plac) => C.tabela(M, plac || {}).map((x) => M.times[x.i].nome).join('');

grupo('critérios de desempate', () => {
  // A e B com 4 pontos; A tem mais vitórias? A: V,D,E...  montamos casos isolados
  let M = mini([['A', 'C', 1, 0], ['B', 'D', 0, 0], ['B', 'C', 0, 0], ['A', 'D', 0, 1], ['B', 'D', 0, 0], ['B', 'C', 1, 1]]);
  // A: 3 pts (1V); B: 4 pts. Só pontos.
  ok(ordem(M).indexOf('B') < ordem(M).indexOf('A'), 'pontos: B (4) à frente de A (3)');
  // vitórias: A 1V+1E+... = 4 pts com 1 vitória; B 4 empates = 4 pts, 0 vitória
  M = mini([['A', 'C', 1, 0], ['A', 'D', 1, 1], ['B', 'C', 0, 0], ['B', 'D', 0, 0], ['B', 'C', 2, 2], ['B', 'D', 3, 3], ['A', 'C', 0, 1]]);
  ok(ordem(M).indexOf('A') < ordem(M).indexOf('B'), 'vitórias: A (1V, 4 pts) à frente de B (0V, 4 pts): ' + ordem(M));
  // saldo: A e B 3 pts, 1V cada; A ganhou de 3x0, B de 1x0
  M = mini([['A', 'C', 3, 0], ['B', 'D', 1, 0]]);
  ok(ordem(M).startsWith('AB'), 'saldo: A (+3) à frente de B (+1): ' + ordem(M));
  // gols pró: A 3x1 (+2), B 2x0 (+2)
  M = mini([['A', 'C', 3, 1], ['B', 'D', 2, 0]]);
  ok(ordem(M).startsWith('AB'), 'gols pró: A (3) à frente de B (2): ' + ordem(M));
  // confronto direto entre dois: A e B iguais em tudo, B venceu o confronto
  M = mini([['A', 'B', 0, 1], ['A', 'C', 1, 0], ['B', 'D', 0, 1], ['C', 'D', 0, 0]]);
  const t = C.tabela(M, {});
  const nomes = t.map((x) => M.times[x.i].nome).join('');
  ok(nomes.indexOf('B') < nomes.indexOf('A'), 'confronto direto: B venceu A e fica à frente: ' + nomes + ' ' + t.map((x) => x.pts + '/' + x.v + '/' + x.sg + '/' + x.gp).join(' '));
  // três empatados em tudo: confronto direto não vale, cai no sorteio
  M = mini([['A', 'B', 1, 0], ['B', 'C', 1, 0], ['C', 'A', 1, 0]]);
  const t3 = C.tabela(M, {});
  ok(t3.slice(0, 3).every((x) => x.criterio === 'sorteio'), 'três empatados: critério vira sorteio');
  const s1 = C.tabela(M, {}, [2, 1, 0, 3]).map((x) => M.times[x.i].nome).join('');
  ok(s1.startsWith('CBA'), 'sorteio respeita as chaves: ' + s1);
});

grupo('placares do usuário entram na tabela', () => {
  const j = L.jogos.find((x) => !x.feito);
  const antes = C.tabela(L, {}).find((x) => x.i === j.h).pts;
  const depois = C.tabela(L, { [j.chave]: [2, 0] }).find((x) => x.i === j.h).pts;
  ok(depois === antes + 3, 'vitória do mandante soma 3 pontos');
});

grupo('modelo de probabilidade', () => {
  const M = C.modelo(L, {});
  let somaH = 0, somaA = 0, k = 0;
  L.jogos.filter((x) => !x.feito).forEach((j) => {
    const p = M.prob(j.h, j.a);
    perto(p.ph + p.pd + p.pa, 1, 1e-9, 'probabilidades somam 1');
    ok(p.tipico.h[0] > p.tipico.h[1] && p.tipico.d[0] === p.tipico.d[1] && p.tipico.a[0] < p.tipico.a[1], 'placar típico coerente com o resultado');
    somaH += p.ph; somaA += p.pa; k++;
  });
  ok(somaH / k > somaA / k, 'mando de campo: vitória do mandante mais provável em média');
  const pr = M.prob(0, 1), r = C.rng(7);
  let g = 0; const N = 20000;
  for (let i = 0; i < N; i++) g += C.amostrar(pr, r)[0];
  perto(g / N, pr.lh, 0.05, 'média de gols sorteados ≈ gols esperados');
});

grupo('Monte Carlo', () => {
  const M = C.modelo(L, {});
  const mc = C.monteCarlo(L, {}, M, 2000, 1);
  ok(mc.N === 2000, '2000 temporadas');
  mc.pos.forEach((c) => ok(c.reduce((a, b) => a + b, 0) === 2000, 'cada time termina numa posição em toda simulação'));
  const ch = C.chances(L, mc);
  perto(ch.reduce((a, x) => a + x.titulo, 0), 1, 1e-9, 'um campeão por temporada');
  perto(ch.reduce((a, x) => a + x.rb, 0), 4, 1e-9, 'quatro rebaixados por temporada');
  const fla = ch.find((x) => L.times[x.i].slug === 'flamengo'), cha = ch.find((x) => L.times[x.i].slug === 'chapecoense');
  ok(fla.titulo > 0.5, 'Flamengo favorito ao título: ' + (fla.titulo * 100).toFixed(1) + '%');
  ok(cha.rb > 0.99, 'Chapecoense praticamente rebaixada: ' + (cha.rb * 100).toFixed(1) + '%');
  // com todos os jogos fixados, o resultado é sempre o mesmo
  const tudo = C.simularRestantes(L, {}, M, C.rng(3));
  const mc2 = C.monteCarlo(L, tudo, M, 50, 2);
  const tab = C.tabela(L, tudo);
  ok(mc2.pos[tab[0].i][0] === 50 || tab[0].criterio === 'sorteio', 'tudo fixado: o campeão é sempre o mesmo');
  // a mesma semente dá o mesmo resultado
  const a = C.monteCarlo(L, {}, M, 300, 99), b = C.monteCarlo(L, {}, M, 300, 99);
  ok(a.pos.every((c, i) => c.every((v, p) => v === b.pos[i][p])), 'mesma semente, mesmo resultado');
});

grupo('cenário no link', () => {
  const M = C.modelo(L, {});
  const plac = C.simularRestantes(L, {}, M, C.rng(5));
  const cod = C.codificar(L, plac);
  ok(cod.length <= 130, 'link curto: ' + cod.length + ' caracteres');
  const volta = C.decodificar(L, cod);
  ok(Object.keys(plac).every((k) => volta[k] && volta[k][0] === plac[k][0] && volta[k][1] === plac[k][1]), 'ida e volta sem perda');
  const parcial = { [L.jogos.find((j) => !j.feito).chave]: [3, 2] };
  ok(JSON.stringify(C.decodificar(L, C.codificar(L, parcial))) === JSON.stringify(parcial), 'cenário com um jogo só');
  ok(C.decodificar(L, '!!lixo') === null && C.decodificar(L, '') === null, 'link quebrado não quebra o site');
});

grupo('o que o meu time precisa', () => {
  const t = (slug) => L.times.find((x) => x.slug === slug).i;
  const obj = C.objetivos(regras);
  const titulo = obj.find((o) => o.id === 'titulo'), escapar = obj.find((o) => o.id === 'escapar');
  ok(C.situacao(L, {}, t('chapecoense'), titulo) === 'impossivel', 'Chapecoense não pode mais ser campeã');
  ok(C.situacao(L, {}, t('flamengo'), escapar) === 'garantido', 'Flamengo já escapou do rebaixamento');
  ok(C.situacao(L, {}, t('flamengo'), titulo) === 'aberto', 'título do Flamengo ainda aberto');
  // título: só jogos de Flamengo e Palmeiras importam (7 jogos: o confronto é um só)
  const rel = C.jogosRelevantes(L, {}, t('flamengo')).filter((j) => [j.h, j.a].some((i) => L.times[i].slug === 'flamengo' || L.times[i].slug === 'palmeiras'));
  ok(rel.length === 7, 'Flamengo x Palmeiras: 7 jogos decidem o título: ' + rel.length);
  const en = C.enumerar(L, {}, t('flamengo'), titulo, rel);
  ok(en.total === 2187, '3^7 combinações');
  const arv = C.resumir(L, t('flamengo'), en, 3);
  ok(arv.tipo === 'jogo', 'há condições a descrever');
  // fixando 4 vitórias do Flamengo, ele é campeão
  const plac = {};
  L.jogos.filter((j) => !j.feito && (L.times[j.h].slug === 'flamengo' || L.times[j.a].slug === 'flamengo')).forEach((j) => { plac[j.chave] = L.times[j.h].slug === 'flamengo' ? [2, 0] : [0, 2]; });
  ok(C.situacao(L, plac, t('flamengo'), titulo) === 'garantido', 'vencendo os 4 jogos, o Flamengo é campeão');
  const pp = C.porPontos(en);
  ok(pp.max === 12 && pp.garante != null && pp.garante <= 12, 'há uma pontuação que garante o título: ' + JSON.stringify(pp));
  const suf = C.condicoes(L, t('flamengo'), en, 1, 3, 4);
  ok(suf.length > 0 && suf.every((c) => c.length <= 3), 'condições suficientes curtas: ' + suf.length);
  // cada condição suficiente garante mesmo o título: fixa os jogos dela e confere que nenhum cenário falha
  suf.forEach((cond) => {
    const falha = Array.from(en.resultados).some((r, c) => r !== 1 && cond.every((l) => l.conj.indexOf(Math.floor(c / Math.pow(3, en.relevantes.indexOf(l.jogo))) % 3) >= 0));
    ok(!falha, 'condição suficiente sem contraexemplo');
  });
});

grupo('dados da ESPN: conversão e mescla', () => {
  const E = require('../shared/espn.js');
  const ev = (id, st, h, a, gh, ga, data) => ({ id, date: data || '2026-11-14T21:30Z', competitions: [{ timeValid: true, status: { type: { name: st } }, competitors: [{ homeAway: 'home', team: { id: h }, score: String(gh) }, { homeAway: 'away', team: { id: a }, score: String(ga) }] }] });
  const rest = liga.jogos.filter((j) => j.status !== 'STATUS_FULL_TIME');
  const j1 = rest[0], j2 = rest[1];
  const novos = E.converter({ events: [
    ev('999', 'STATUS_FULL_TIME', j1.mandante, j1.visitante, 3, 1),         // jogo terminou
    ev('998', 'STATUS_POSTPONED', j2.mandante, j2.visitante, 0, 0),         // adiado: não apaga o marcado
    ev('997', 'STATUS_FULL_TIME', '1', '2', 1, 0),                          // times fora da liga
    { id: 'x' },                                                            // evento quebrado
  ] });
  ok(novos.length === 3, 'converter ignora evento quebrado');
  const m = E.mesclar(liga, novos);
  const a1 = m.jogos.find((j) => j.mandante === j1.mandante && j.visitante === j1.visitante);
  ok(a1.status === 'STATUS_FULL_TIME' && a1.gols_mandante === 3, 'jogo terminado entra com o placar');
  const a2 = m.jogos.find((j) => j.mandante === j2.mandante && j.visitante === j2.visitante);
  ok(a2.status === 'STATUS_SCHEDULED', 'adiado não substitui o jogo marcado');
  ok(m.jogos.length === 380, 'continua com 380 jogos');
  ok(JSON.stringify(E.mesesAbertos(liga)) === '["202611","202612"]', 'meses abertos: nov e dez');
  const L2 = C.preparar(m, regras);
  ok(L2.jogos.filter((j) => !j.feito).length === 40, 'um jogo a menos para simular');
});

console.log(`\n${total - falhas}/${total} conferências passaram`);
process.exit(falhas ? 1 : 0);

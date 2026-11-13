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

grupo('dados das versões antigas (arquivo único)', () => {
  const chave = (h, a) => { const j = L.jogos.find((x) => !x.feito && L.times[x.h].abrev === h && L.times[x.a].abrev === a); return j && j.chave; };
  ok(chave('FLA', 'CAP') === 'flamengo-athletico', 'FLA-CAP vira flamengo-athletico');
  // v4: chaves por siglas; jogo já disputado, sigla desconhecida e lixo ficam de fora; gols até 15
  const v4 = C.placaresAntigos(L, { 'FLA-CAP': [2, 1], 'CHA-VAS': [20, 0], 'FLA-GRE': [1, 0], 'XXX-FLA': [1, 1], 'PAL-FLA': ['a', 1], 'CRU-PAL': [0, 0, 1] }, { 'CHA-VAS': true });
  ok(JSON.stringify(v4.p) === JSON.stringify({ 'flamengo-athletico': [2, 1], 'chapecoense-vasco': [15, 0] }), 'v4: só jogos em aberto e placares válidos: ' + JSON.stringify(v4.p));
  ok(JSON.stringify(v4.sim) === JSON.stringify({ 'chapecoense-vasco': 1 }), 'v4: sorteados continuam marcados');
  // v3: chave é o índice na lista fixa (0 = Vitória x Fluminense, já disputado; 6 = Flamengo x Athletico)
  ok(C.LEGADO_V3.length === 42 && C.LEGADO_V3[6] === 'FLA-CAP', 'lista da v3 com 42 jogos');
  const v3 = C.placaresAntigos(L, { 0: [1, 1], 6: [3, 0], 41: [2, 2] }, {});
  ok(JSON.stringify(v3.p) === JSON.stringify({ 'flamengo-athletico': [3, 0], 'vasco-vitoria': [2, 2] }), 'v3: índices viram chaves novas: ' + JSON.stringify(v3.p));
  // migração completa: o rascunho da v4 vale mais que o da v3; cenários das duas, sem repetir
  const mig = C.migrarAntigos(L, {
    agora: '2026-11-09T12:00:00Z',
    rascunhos: [{ picks: { 'FLA-CAP': [1, 0] }, auto: {}, prefs: { formaN: 3, ordem: 'cima', n: 50000, modoRev: 'manual' } }, { picks: { 6: [0, 3] } }],
    cenarios: [
      [{ nome: 'Fla tropeça', quando: Date.UTC(2026, 10, 9), picks: { 'FLA-CAP': [0, 1] } }, { nome: 'Fla tropeça', quando: Date.UTC(2026, 10, 9), picks: {} }],
      [{ nome: 'Velho', quando: Date.UTC(2026, 10, 6), picks: { 6: [2, 2] } }, null, { nome: 'sem placares' }],
    ],
  });
  ok(JSON.stringify(mig.placares.p) === JSON.stringify({ 'flamengo-athletico': [1, 0] }), 'rascunho da v4 tem prioridade');
  ok(JSON.stringify(mig.prefs) === JSON.stringify({ forma: 3, ordem: 'cima', N: 50000, revelacao: 'manual' }), 'preferências convertidas: ' + JSON.stringify(mig.prefs));
  ok(mig.cenarios.length === 2 && mig.cenarios[0].nome === 'Fla tropeça' && mig.cenarios[1].p['flamengo-athletico'][0] === 2, 'cenários da v4 e da v3, sem repetir: ' + mig.cenarios.map((c) => c.nome).join(', '));
  ok(mig.cenarios.every((c) => c.criado && c.temporada === L.temporada && c.migrado), 'cenários no formato novo');
  const vazio = C.migrarAntigos(L, { rascunhos: [null, 'lixo'], cenarios: [{}, 'x'] });
  ok(vazio.placares === null && vazio.prefs === null && vazio.cenarios.length === 0, 'nada salvo, nada migrado');
  // link da v4: mesmo formato de bytes, pares em ordem alfabética das siglas (codificador copiado da v4)
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const IDS_ALFA = L.times.map((x) => x.abrev).sort();
  const FIX = L.jogos.filter((j) => !j.feito).map((j) => ({ k: L.times[j.h].abrev + '-' + L.times[j.a].abrev, h: L.times[j.h].abrev, a: L.times[j.a].abrev, chave: j.chave }));
  function codificarV4(picks) {
    const n = IDS_ALFA.length, bits = new Uint8Array(Math.ceil(n * n / 8)), pares = [];
    for (const f of FIX) { const p = picks[f.k]; if (!p) continue; pares.push([IDS_ALFA.indexOf(f.h) * n + IDS_ALFA.indexOf(f.a), p]); }
    pares.sort((a, b) => a[0] - b[0]);
    const bytes = [1, ...bits]; for (const [i, p] of pares) { bytes[1 + (i >> 3)] |= 1 << (i & 7); bytes.push(Math.min(15, p[0]) * 16 + Math.min(15, p[1])); }
    let s = ''; for (let i = 0; i < bytes.length; i += 3) { const a = bytes[i], b = bytes[i + 1], c = bytes[i + 2]; s += B64[a >> 2] + B64[((a & 3) << 4) | ((b || 0) >> 4)]; if (i + 1 < bytes.length) s += B64[((b & 15) << 2) | ((c || 0) >> 6)]; if (i + 2 < bytes.length) s += B64[c & 63]; }
    return s;
  }
  const M = C.modelo(L, {});
  const novo = C.simularRestantes(L, {}, M, C.rng(9));
  const picksV4 = {}; FIX.forEach((f) => { picksV4[f.k] = novo[f.chave]; });
  const lido = C.decodificarAntigo(L, codificarV4(picksV4));
  ok(lido && Object.keys(novo).every((k) => lido[k] && lido[k][0] === novo[k][0] && lido[k][1] === novo[k][1]), 'link da v4 abre com os mesmos placares');
  ok(C.decodificarAntigo(L, '!!') === null, 'link antigo quebrado não quebra o site');
});

grupo('vagas: Copa do Brasil e campeões continentais', () => {
  const fs2 = require('fs'), path2 = require('path');
  const liga = JSON.parse(fs2.readFileSync(path2.join(__dirname, '../dados/brasileirao-2026.json'), 'utf8'));
  const base = JSON.parse(fs2.readFileSync(path2.join(__dirname, '../shared/regras-brasileirao-2026.json'), 'utf8'));
  const zonas = (camp, mover) => {
    const r = JSON.parse(JSON.stringify(base)); r.campeoes = camp || {};
    const L = C.preparar(liga, r); const tab = C.tabela(L, {}).slice();
    if (mover) { const i = L.times.findIndex((t) => t.abrev === mover[0]), k = tab.findIndex((x) => x.i === i); const x = tab.splice(k, 1)[0]; tab.splice(mover[1] - 1, 0, x); }
    const zs = C.zonasTab(L, tab); const m = {}; tab.forEach((x, k) => { m[L.times[x.i].abrev] = zs[k]; });
    return { zs, m, n: zs.filter((z) => z === 'lib' || z === 'pre').length };
  };
  ok(zonas().n === 7, 'Grêmio no Z4: 7 vagas (5 grupos + 2 pré)');
  ok(zonas(null, ['GRE', 10]).n === 7 && zonas(null, ['GRE', 10]).m.GRE === 'lib', 'Grêmio 10º: leva a vaga da Copa e a tabela fica com 6');
  const pal = zonas({ libertadores: 'PAL' });
  ok(pal.n === 8 && pal.m.BAH === 'lib', 'Palmeiras campeão da Libertadores: mais uma vaga na tabela');
  ok(zonas({ libertadores: 'PAL', sula: 'CAM' }).n === 9, 'G9: Palmeiras e Atlético-MG campeões, Grêmio rebaixado');
  const cam12 = zonas({ sula: 'CAM' }, ['CAM', 12]);
  ok(cam12.n === 8 && cam12.m.CAM === 'lib', 'Galo campeão da Sul-Americana fora da zona: entra, mas não abre vaga para os outros');
});

grupo('elencos: cruzamento com a ESPN', () => {
  const EL = require('../shared/elencos.js');
  ok(EL.parecenca('E. Pulgar', { n: 'Erick Pulgar', curto: 'E. Pulgar' }) === 3, 'nome abreviado igual ao curto da ESPN');
  ok(EL.parecenca('Matheuzinho', { n: 'Mateuzinho' }) > 0, 'grafia parecida casa');
  ok(EL.parecenca('Allan', { n: 'Vitor Roque' }) === 0, 'nomes diferentes não casam');
  const espn = { atualizado: '2026-11-12T00:00:00', times: { tst: [] } };
  const E = espn.times.tst;
  for (let k = 1; k <= 18; k++) E.push({ n: 'Titular ' + 'abcdefghijklmnopqr'[k - 1] + 'son', num: k, pos: k === 1 ? 'G' : k < 8 ? 'D' : k < 14 ? 'M' : 'A', jogos: 10 });
  E.push({ n: 'Goleiro Reserva', num: 12, pos: 'G', jogos: 0 }, { n: 'Terceiro Goleiro', num: 40, pos: 'G', jogos: 0 }, { n: 'Quarto Goleiro', num: 90, pos: 'G', jogos: 0 });
  E.push({ n: 'Menino Da Base', num: 88, pos: 'M', jogos: 0 }, { n: 'Contratado Novo', num: 20, pos: 'A', jogos: 2 });
  const dados = { atualizado: '2026-11-01', times: [{ id: 'c1', grupo: 'Série A', escudo: 'tst', jogadores: [
    ['Titular Ason', 'G', 1], ['Ex Jogador Que Saiu', 'M', 5], ['Menino Da Base', 'M', 88], ['Goleiro Reserva', 'G', 12]] }] };
  EL.cruzarEspn(dados, espn);
  const nomes = dados.times[0].jogadores.map((j) => j[0]);
  ok(nomes.indexOf('Ex Jogador Que Saiu') < 0, 'quem não está na ESPN sai');
  ok(nomes.indexOf('Menino Da Base') < 0, 'base sem jogos e camisa alta sai');
  ok(nomes.indexOf('Contratado Novo') >= 0, 'quem jogou e faltava entra');
  ok(nomes.indexOf('Goleiro Reserva') >= 0 && nomes.indexOf('Terceiro Goleiro') >= 0 && nomes.indexOf('Quarto Goleiro') < 0, 'fica com 3 goleiros');
  ok(dados.atualizado === espn.atualizado, 'data da reserva passa a ser a da ESPN');
  const curto = { times: [{ id: 'c2', grupo: 'Série A', escudo: 'tst', jogadores: [['X', 'M', 1]] }] };
  EL.cruzarEspn(curto, { times: { tst: E.slice(0, 10) } });
  ok(curto.times[0].jogadores.length === 1, 'elenco da ESPN incompleto: não mexe');
});

console.log(`\n${total - falhas}/${total} conferências passaram`);
process.exit(falhas ? 1 : 0);

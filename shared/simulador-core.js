/* Tapa na Gaveta · núcleo do simulador (regras puras: sem DOM, sem rede).
   Roda no navegador (window.TNGCore), no Web Worker (importScripts) e no Node (require).
   Testes: node tools/testar-core.js · Calibração do modelo: node tools/calibrar.js

   Formato "liga" plugável: preparar() recebe o retrato (dados/brasileirao-2026.json) e as regras
   (shared/regras-*.json). Grupos e mata-mata entram como outros formatos (docs/ELIMINATORIAS.md). */
(function (raiz, fabrica) {
  'use strict';
  const api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.TNGCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const FEITO = /FULL_TIME|FINAL/;

  // ================================================================== sorteio com semente
  // mulberry32: rápido, determinístico (o mesmo cenário simulado sai igual com a mesma semente)
  function rng(seed) {
    let a = (seed >>> 0) || 0x9e3779b9;
    return function () {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ================================================================== preparar a liga
  // Times viram índices 0..n-1; jogos ganham o par (mandante, visitante), que é único num turno e
  // returno e não muda quando a ESPN remarca um jogo com outro id: é a chave dos cenários e links.
  function preparar(liga, regras) {
    const times = liga.times.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map((t, i) => ({
      i, id: String(t.id), nome: t.nome, abrev: t.abrev, escudo: t.escudo, slug: t.escudo || String(t.id),
    }));
    const idx = {};
    times.forEach((t) => { idx[t.id] = t.i; });
    const jogos = liga.jogos.filter((j) => idx[j.mandante] != null && idx[j.visitante] != null).map((j) => {
      const feito = FEITO.test(j.status) && j.gols_mandante != null && j.gols_visitante != null;
      return {
        id: String(j.id), data: j.data, status: j.status, h: idx[j.mandante], a: idx[j.visitante],
        gh: feito ? +j.gols_mandante : null, ga: feito ? +j.gols_visitante : null, feito,
        horario: j.horario_definido !== false,
      };
    }).sort((x, y) => (x.data < y.data ? -1 : x.data > y.data ? 1 : x.h - y.h));
    const n = times.length;
    // chave estável: índice do par no calendário completo (mandante, visitante) por nome
    jogos.forEach((j) => { j.par = j.h * n + j.a; j.chave = times[j.h].slug + '-' + times[j.a].slug; });
    const L = { times, idx, jogos, regras, n, temporada: liga.temporada, baixado: liga.baixado_em };
    deduzirRodadas(L);
    return L;
  }

  // A ESPN não informa a rodada. Cada time joga uma vez por rodada: o k-ésimo jogo restante de um
  // time (em ordem de data) é a rodada jogos_feitos + k. Se os dois lados discordarem, vale a maior
  // (o jogo adiado de um deles). Jogo com rodada <= a menor rodada já completa de todos é "atrasado".
  function deduzirRodadas(L) {
    const feitos = new Array(L.n).fill(0);
    L.jogos.forEach((j) => { if (j.feito) { feitos[j.h]++; feitos[j.a]++; } });
    const prox = new Array(L.n).fill(0);
    const maxFeitos = Math.max.apply(null, feitos);
    L.jogos.forEach((j) => {
      if (j.feito) { j.rodada = null; return; }
      const r1 = feitos[j.h] + (++prox[j.h]), r2 = feitos[j.a] + (++prox[j.a]);
      j.rodada = Math.max(r1, r2);
      j.atrasado = j.rodada <= maxFeitos;
    });
    // conferência: nenhuma rodada futura pode ter o mesmo time duas vezes
    const vistos = {};
    L.rodadasConfiaveis = L.jogos.every((j) => {
      if (j.feito || j.atrasado) return true;
      const k1 = j.rodada + ':' + j.h, k2 = j.rodada + ':' + j.a;
      if (vistos[k1] || vistos[k2]) return false;
      vistos[k1] = vistos[k2] = 1;
      return true;
    });
    L.ultimaRodadaCompleta = Math.min.apply(null, feitos);
  }

  // ================================================================== classificação
  // placares: { [chave do jogo]: [gols mandante, gols visitante] } (só jogos ainda não feitos)
  function placarDe(j, placares) {
    if (j.feito) return [j.gh, j.ga];
    const p = placares && placares[j.chave];
    return p && p[0] != null && p[1] != null ? p : null;
  }

  function estatisticas(L, placares) {
    const P = L.regras.pontos;
    const s = L.times.map((t) => ({ i: t.i, pts: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0 }));
    L.jogos.forEach((j) => {
      const p = placarDe(j, placares);
      if (!p) return;
      somar(s[j.h], s[j.a], p[0], p[1], P);
    });
    return s;
  }
  function somar(A, B, gh, ga, P) {
    A.j++; B.j++; A.gp += gh; A.gc += ga; B.gp += ga; B.gc += gh;
    if (gh > ga) { A.v++; B.d++; A.pts += P.vitoria; B.pts += P.derrota; }
    else if (gh < ga) { B.v++; A.d++; B.pts += P.vitoria; A.pts += P.derrota; }
    else { A.e++; B.e++; A.pts += P.empate; B.pts += P.empate; }
  }

  // pontos de "a" contra "b" nos jogos entre os dois (confronto direto)
  function confronto(L, placares, a, b) {
    let pa = 0, pb = 0;
    L.jogos.forEach((j) => {
      if (!((j.h === a && j.a === b) || (j.h === b && j.a === a))) return;
      const p = placarDe(j, placares);
      if (!p) return;
      const ga = j.h === a ? p[0] : p[1], gb = j.h === a ? p[1] : p[0];
      if (ga > gb) pa += 3; else if (gb > ga) pb += 3; else { pa++; pb++; }
    });
    return pa - pb;
  }

  // ordena pelos critérios do regulamento. sorteio: chave por time (menor primeiro); sem ela,
  // ordem alfabética (estável para a tela; o Monte Carlo passa chaves sorteadas).
  // Critérios simples do regulamento (o resto, como cartões, a ESPN não informa: pula)
  const CRIT = { pontos: (x) => x.pts, vitorias: (x) => x.v, saldo: (x) => x.gp - x.gc, gols_pro: (x) => x.gp, gols_fora: (x) => x.gf || 0 };
  const BRASIL = ['pontos', 'vitorias', 'saldo', 'gols_pro', 'confronto_direto'];
  // mini-tabela só com os jogos entre os clubes empatados: [pontos, saldo, gols] de cada um
  function miniTabela(L, placares, ids) {
    const dentro = {}, r = {};
    ids.forEach((i) => { dentro[i] = 1; r[i] = [0, 0, 0]; });
    L.jogos.forEach((j) => {
      if (!dentro[j.h] || !dentro[j.a]) return;
      const p = placarDe(j, placares);
      if (!p) return;
      const H = r[j.h], A = r[j.a];
      H[1] += p[0] - p[1]; A[1] += p[1] - p[0]; H[2] += p[0]; A[2] += p[1];
      if (p[0] > p[1]) H[0] += 3; else if (p[0] < p[1]) A[0] += 3; else { H[0]++; A[0]++; }
    });
    return r;
  }
  function ordenar(L, s, placares, sorteio) {
    const lista = (L.regras && L.regras.desempate) || BRASIL;
    const ehBrasil = lista.slice(0, 5).join() === BRASIL.join() && !(L.regras && L.regras.confronto_so_dois === false);
    if (!ehBrasil) return ordenarGeral(L, s, placares, sorteio, lista);
    const base = (x, y) => (y.pts - x.pts) || (y.v - x.v) || ((y.gp - y.gc) - (x.gp - x.gc)) || (y.gp - x.gp);
    const sorteioDe = (x) => (sorteio ? sorteio[x.i] : x.i);
    const out = s.slice().sort((x, y) => base(x, y) || (sorteioDe(x) - sorteioDe(y)));
    // confronto direto: só quando exatamente DOIS clubes empatam em tudo acima
    for (let k = 0; k < out.length;) {
      let f = k + 1;
      while (f < out.length && base(out[k], out[f]) === 0) f++;
      if (f - k === 2) {
        const cd = confronto(L, placares, out[k].i, out[k + 1].i);
        if (cd < 0) { const t = out[k]; out[k] = out[k + 1]; out[k + 1] = t; }
        out[k].criterio = out[k + 1].criterio = cd !== 0 ? 'confronto_direto' : 'sorteio';
      } else if (f - k > 2) {
        for (let q = k; q < f; q++) out[q].criterio = 'sorteio';
      }
      k = f;
    }
    out.forEach((x, p) => { x.pos = p + 1; x.sg = x.gp - x.gc; });
    return out;
  }

  // Ordem genérica (ligas europeias e outras): critérios na ordem do regulamento; o confronto
  // direto vale para qualquer número de empatados (mini-tabela: pontos, saldo e gols entre eles),
  // a não ser que confronto_so_dois seja true.
  function ordenarGeral(L, s, placares, sorteio, lista) {
    const crit = lista.filter((c) => CRIT[c] || c === 'confronto_direto');
    const soDois = !!(L.regras && L.regras.confronto_so_dois);
    const sorteioDe = (x) => (sorteio ? sorteio[x.i] : x.i);
    const cmpVet = (a, b) => (b[0] - a[0]) || (b[1] - a[1]) || (b[2] - a[2]);
    function grupo(xs, k) {
      if (xs.length <= 1) return xs;
      if (k >= crit.length) { xs.forEach((x) => { x.criterio = x.criterio || 'sorteio'; }); return xs.slice().sort((a, b) => sorteioDe(a) - sorteioDe(b)); }
      const c = crit[k];
      let chave;
      if (c === 'confronto_direto') {
        if (soDois && xs.length !== 2) return grupo(xs, k + 1);
        const mt = miniTabela(L, placares, xs.map((x) => x.i));
        chave = (x) => mt[x.i];
        const ord = xs.slice().sort((a, b) => cmpVet(chave(a), chave(b)));
        const out = [];
        for (let a = 0; a < ord.length;) {
          let b = a + 1;
          while (b < ord.length && cmpVet(chave(ord[a]), chave(ord[b])) === 0) b++;
          const g = ord.slice(a, b);
          if (g.length < ord.length) ord.forEach((x) => { if (!x.criterio) x.criterio = 'confronto_direto'; });
          out.push.apply(out, grupo(g, k + 1));
          a = b;
        }
        return out;
      }
      const f = CRIT[c];
      const ord = xs.slice().sort((a, b) => f(b) - f(a));
      const out = [];
      for (let a = 0; a < ord.length;) {
        let b = a + 1;
        while (b < ord.length && f(ord[b]) === f(ord[a])) b++;
        out.push.apply(out, grupo(ord.slice(a, b), k + 1));
        a = b;
      }
      return out;
    }
    s.forEach((x) => { delete x.criterio; });
    const out = grupo(s.slice(), 0);
    out.forEach((x, p) => { x.pos = p + 1; x.sg = x.gp - x.gc; });
    return out;
  }

  function tabela(L, placares, sorteio) {
    return ordenar(L, estatisticas(L, placares), placares, sorteio);
  }

  function zonaDe(regras, pos) {
    const z = regras.zonas.find((q) => pos >= q.de && pos <= q.ate);
    return z ? z.id : null;
  }

  // Zonas de cada posição de UMA tabela. Em regra são as faixas fixas; com regras.copa (um finalista da
  // Copa do Brasil que depende da tabela) as faixas se ajustam: o finalista leva a vaga da Copa (fase de
  // grupos) se estiver na Série A; rebaixado, a vaga dele volta para a tabela. Sempre são 5 vagas de fase
  // de grupos (4 da tabela + Copa) e 2 de pré; o finalista elegível ocupa uma de grupos e os demais
  // seguem a ordem da tabela sem ele. A Sul-Americana também pula o finalista.
  function zonasTab(L, tab) {
    if (tab.zs) return tab.zs;
    const R = L.regras, zs = [];
    for (let p = 1; p <= tab.length; p++) zs.push(zonaDe(R, p));
    const cp = R.copa, gi = cp ? L.times.findIndex((t) => t.abrev === cp.time) : -1;
    const lib = R.zonas.find((z) => z.id === 'lib'), pre = R.zonas.find((z) => z.id === 'pre');
    const sula = R.zonas.find((z) => z.id === 'sula'), rb = R.zonas.find((z) => z.id === 'rb');
    if (gi >= 0 && lib && pre && sula && rb) {
      const g = tab.findIndex((x) => x.i === gi) + 1, elegivel = g < rb.de;
      const nLib = lib.ate - lib.de + 1 + (elegivel ? 0 : 1), nPre = pre.ate - pre.de + 1, nSula = sula.ate - sula.de + 1;
      for (let p = 1; p <= tab.length; p++) zs[p - 1] = null;
      if (elegivel) zs[g - 1] = 'lib';
      let k = 0;
      for (let p = 1; p < rb.de; p++) {
        if (elegivel && p === g) continue;
        zs[p - 1] = k < nLib ? 'lib' : k < nLib + nPre ? 'pre' : k < nLib + nPre + nSula ? 'sula' : null;
        k++;
      }
      for (let p = rb.de; p <= rb.ate; p++) zs[p - 1] = 'rb';
    }
    tab.zs = zs;
    return zs;
  }

  // forma: últimos n jogos de cada time (V/E/D), na ordem do mais antigo para o mais recente
  function forma(L, placares, t, nJogos, ate) {
    const r = [];
    for (let k = L.jogos.length - 1; k >= 0 && r.length < nJogos; k--) {
      const j = L.jogos[k];
      if (j.h !== t && j.a !== t) continue;
      if (ate && j.data >= ate) continue;
      const p = placarDe(j, placares);
      if (!p) continue;
      const gp = j.h === t ? p[0] : p[1], gc = j.h === t ? p[1] : p[0];
      r.unshift(gp > gc ? 'V' : gp === gc ? 'E' : 'D');
    }
    return r;
  }

  // ================================================================== modelo de probabilidade
  // 1. força de ataque e defesa por time, em casa e fora, encolhida para a média da liga (k jogos)
  // 2. ajuste pela forma recente (últimos nForma jogos) e pelos pontos por jogo, pesos pequenos
  // 3. gols esperados → Poisson com correção de Dixon-Coles (rho) nos placares baixos
  // Pesos escolhidos por calibração (tools/calibrar.js, Brier score nos jogos já disputados).
  // recalibrado em 11/11/2026 com 289 jogos (Brier 0,6036; antes 0,6042; referência pelas
  // frequências da liga: 0,632). Testados e descartados por não melhorarem a previsão: reforço de
  // empates (empate) e peso menor para jogos antigos (meiaVida, em dias); ficam desligados.
  const PARAMS_PADRAO = { k: 48, nForma: 5, wForma: 0.3, wPPG: 2.0, rho: -0.1, maxGols: 10, empate: 0, meiaVida: Infinity, manterTotal: 1 };
  // o usuário pode trocar a forma recente para os últimos 3 jogos (melhor peso para 3 jogos: 0,15)
  const PARAMS_FORMA3 = { nForma: 3, wForma: 0.15 };

  function modelo(L, params, ate) {
    const P = Object.assign({}, PARAMS_PADRAO, params || {});
    const n = L.n;
    const hf = new Float64Array(n), ha = new Float64Array(n), hn = new Float64Array(n);
    const af = new Float64Array(n), aa = new Float64Array(n), an = new Float64Array(n);
    const pts = new Float64Array(n), jg = new Float64Array(n);
    const hist = []; for (let i = 0; i < n; i++) hist.push([]);
    let gH = 0, gA = 0, nJ = 0;
    // jogos antigos pesam menos: peso 1/2 a cada "meiaVida" dias antes do último jogo conhecido
    let ref = 0;
    if (isFinite(P.meiaVida)) for (const j of L.jogos) { if (j.feito && !(ate && j.data >= ate)) { const t = Date.parse(j.data); if (t > ref) ref = t; } }
    for (const j of L.jogos) {
      if (!j.feito) continue;
      if (ate && j.data >= ate) continue;              // só o que se sabia antes da data
      const w = isFinite(P.meiaVida) ? Math.pow(0.5, (ref - Date.parse(j.data)) / 864e5 / P.meiaVida) : 1;
      hf[j.h] += w * j.gh; ha[j.h] += w * j.ga; hn[j.h] += w;
      af[j.a] += w * j.ga; aa[j.a] += w * j.gh; an[j.a] += w;
      gH += w * j.gh; gA += w * j.ga; nJ += w;
      const ph = j.gh > j.ga ? 3 : j.gh === j.ga ? 1 : 0, pa = j.gh < j.ga ? 3 : j.gh === j.ga ? 1 : 0;
      pts[j.h] += w * ph; pts[j.a] += w * pa; jg[j.h] += w; jg[j.a] += w;
      hist[j.h].push(ph); hist[j.a].push(pa);
    }
    const mH = nJ ? gH / nJ : 1.45, mA = nJ ? gA / nJ : 1.05;
    const enc = (g, q, m) => (g + P.k * m) / (q + P.k) / m;
    const ataqueCasa = [], defesaCasa = [], ataqueFora = [], defesaFora = [], ppg = [], formaRel = [];
    const ppgLiga = nJ ? (pts.reduce((a, b) => a + b, 0) / jg.reduce((a, b) => a + b, 0)) : 1.35;
    for (let i = 0; i < n; i++) {
      ataqueCasa[i] = enc(hf[i], hn[i], mH);
      defesaCasa[i] = enc(ha[i], hn[i], mA);            // gols sofridos em casa (alto = defesa fraca)
      ataqueFora[i] = enc(af[i], an[i], mA);
      defesaFora[i] = enc(aa[i], an[i], mH);
      // pontos por jogo encolhidos para a média, e forma recente relativa à própria média
      ppg[i] = (pts[i] + P.k * ppgLiga) / (jg[i] + P.k);
      const ult = hist[i].slice(-P.nForma);
      formaRel[i] = ult.length ? (ult.reduce((a, b) => a + b, 0) / ult.length - ppg[i]) * (ult.length / P.nForma) : 0;
    }
    const cache = {};
    function prob(h, a) {
      const ch = h * 1000 + a;
      if (cache[ch]) return cache[ch];
      let lh = mH * ataqueCasa[h] * defesaFora[a];
      let la = mA * ataqueFora[a] * defesaCasa[h];
      const ajuste = P.wForma * (formaRel[h] - formaRel[a]) / 3 + P.wPPG * (ppg[h] - ppg[a]) / 3;
      const tot = lh + la;
      lh *= Math.exp(ajuste); la *= Math.exp(-ajuste);
      // o ajuste muda quem é favorito, não quantos gols o jogo tem (senão o favorito faz 7×0)
      if (P.manterTotal) { const f = Math.pow(tot / (lh + la), P.manterTotal); lh *= f; la *= f; }
      cache[ch] = matriz(lh, la, P.rho, P.maxGols, P.empate);
      return cache[ch];
    }
    return { prob, params: P, mH, mA, ppg, formaRel, nJogos: nJ };
  }

  function poisson(l, k) { let p = Math.exp(-l); for (let i = 1; i <= k; i++) p *= l / i; return p; }

  function matriz(lh, la, rho, G, empate) {
    const m = new Float64Array((G + 1) * (G + 1));
    const ph = [], pa = [];
    for (let x = 0; x <= G; x++) { ph[x] = poisson(lh, x); pa[x] = poisson(la, x); }
    let s = 0;
    for (let x = 0; x <= G; x++) for (let y = 0; y <= G; y++) {
      let tau = 1;
      if (x === 0 && y === 0) tau = 1 - lh * la * rho;
      else if (x === 0 && y === 1) tau = 1 + lh * rho;
      else if (x === 1 && y === 0) tau = 1 + la * rho;
      else if (x === 1 && y === 1) tau = 1 - rho;
      // empates a mais do que a Poisson prevê (o Brasileirão empata muito): reforço na diagonal
      const v = Math.max(0, ph[x] * pa[y] * tau) * (x === y && empate ? 1 + empate : 1);
      m[x * (G + 1) + y] = v; s += v;
    }
    let pH = 0, pD = 0, pA = 0;
    const melhor = { h: [0, 1, 0], d: [0, 0, 0], a: [0, 0, 1] };
    const acum = new Float64Array(m.length);
    let c = 0;
    for (let x = 0; x <= G; x++) for (let y = 0; y <= G; y++) {
      const k = x * (G + 1) + y, v = m[k] / s;
      m[k] = v; c += v; acum[k] = c;
      const r = x > y ? 'h' : x === y ? 'd' : 'a';
      if (r === 'h') pH += v; else if (r === 'd') pD += v; else pA += v;
      if (v > melhor[r][0]) melhor[r] = [v, x, y];
    }
    let mais = [0, 0, 0];
    for (let x = 0; x <= G; x++) for (let y = 0; y <= G; y++) { const v = m[x * (G + 1) + y]; if (v > mais[0]) mais = [v, x, y]; }
    return {
      lh, la, ph: pH, pd: pD, pa: pA, G, m, acum,
      tipico: { h: [melhor.h[1], melhor.h[2]], d: [melhor.d[1], melhor.d[2]], a: [melhor.a[1], melhor.a[2]] },
      provavel: [mais[1], mais[2]],
    };
  }

  // sorteia um placar inteiro (não só o resultado) pela matriz de Poisson
  function amostrar(pr, r) {
    const u = r() * pr.acum[pr.acum.length - 1];
    const ac = pr.acum;
    let lo = 0, hi = ac.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (ac[mid] < u) lo = mid + 1; else hi = mid; }
    const G1 = pr.G + 1;
    return [Math.floor(lo / G1), lo % G1];
  }

  // placar para mostrar: sorteia de novo se algum time passar de 4 gols (7×0 é possível, mas
  // tira a credibilidade; na vida real só 1,5% dos jogos têm um time com 5 ou mais).
  // As probabilidades (Monte Carlo) continuam com a distribuição inteira.
  const MAX_MOSTRAR = 4;
  function amostrarCrivel(pr, r) {
    for (let i = 0; i < 40; i++) { const s = amostrar(pr, r); if (s[0] <= MAX_MOSTRAR && s[1] <= MAX_MOSTRAR) return s; }
    return [Math.min(pr.provavel[0], MAX_MOSTRAR), Math.min(pr.provavel[1], MAX_MOSTRAR)];
  }

  // Avaliação do modelo no passado: cada jogo já disputado é previsto só com os jogos antes dele.
  // Acerto = o resultado mais provável (vitória, empate ou derrota) foi o que aconteceu.
  function avaliar(L, params, desde) {
    const feitos = L.jogos.filter((j) => j.feito).sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0));
    const ini = desde == null ? Math.round(L.n * 5) : desde;          // pula as ~10 primeiras rodadas
    const cache = {};
    const out = { n: 0, acertos: 0, mandante: 0, conf: { n: 0, acertos: 0 }, desde: null, jogos: {} };
    feitos.slice(ini).forEach((j) => {
      const dia = j.data.slice(0, 10);
      const M = cache[dia] || (cache[dia] = modelo(L, params, dia));
      const p = M.prob(j.h, j.a), ps = [p.ph, p.pd, p.pa];
      const real = j.gh > j.ga ? 0 : j.gh === j.ga ? 1 : 2;
      const max = Math.max(ps[0], ps[1], ps[2]), fav = ps.indexOf(max), ok = fav === real;
      if (!out.desde) out.desde = j.data;
      out.n++; if (ok) out.acertos++; if (real === 0) out.mandante++;
      if (max >= 0.6) { out.conf.n++; if (ok) out.conf.acertos++; }
      out.jogos[j.chave] = { fav, ok, p: max };
    });
    return out;
  }

  // preenche os jogos sem placar com placares sorteados (devolve um objeto novo)
  function simularRestantes(L, placares, M, r, filtro) {
    const out = Object.assign({}, placares);
    L.jogos.forEach((j) => {
      if (j.feito || placarDe(j, placares)) return;
      if (filtro && !filtro(j)) return;
      out[j.chave] = amostrarCrivel(M.prob(j.h, j.a), r);
    });
    return out;
  }

  // ================================================================== Monte Carlo
  // N temporadas a partir do estado atual (placares fixados pelo usuário são respeitados).
  // Devolve, por time, a contagem de cada posição final. onProgresso(feitas) a cada lote.
  function monteCarlo(L, placares, M, N, seed, onProgresso, condicao) {
    const r = rng(seed == null ? 12345 : seed);
    const n = L.n;
    const base = estatisticas(L, placares);
    const livres = L.jogos.filter((j) => !j.feito && !placarDe(j, placares));
    const probs = livres.map((j) => M.prob(j.h, j.a));
    const pos = []; for (let i = 0; i < n; i++) pos.push(new Uint32Array(n));
    const P = L.regras.pontos;
    const s = base.map((x) => Object.assign({}, x));
    const sim = {};
    const sorteio = new Float64Array(n);
    const zIds = L.regras.zonas.map((z) => z.id), zc = L.regras.copa ? L.times.map(() => new Float64Array(zIds.length)) : null;
    let validas = 0;
    const condCont = condicao ? { sim: 0 } : null;
    for (let it = 0; it < N; it++) {
      for (let i = 0; i < n; i++) { const b = base[i], x = s[i]; x.pts = b.pts; x.j = b.j; x.v = b.v; x.e = b.e; x.d = b.d; x.gp = b.gp; x.gc = b.gc; delete x.criterio; sorteio[i] = r(); }
      for (let g = 0; g < livres.length; g++) {
        const j = livres[g], p = amostrar(probs[g], r);
        sim[j.chave] = p;
        somar(s[j.h], s[j.a], p[0], p[1], P);
      }
      // confronto direto precisa dos placares sorteados: junta fixos + sorteados
      const todos = Object.assign({}, placares, sim);
      const tab = ordenar(L, s, todos, sorteio);
      if (condicao && !condicao(tab, todos)) continue;
      validas++;
      for (let q = 0; q < n; q++) pos[tab[q].i][q]++;
      if (zc) { const zs = zonasTab(L, tab); for (let q = 0; q < n; q++) { const k = zIds.indexOf(zs[q]); if (k >= 0) zc[tab[q].i][k]++; } }
      if (onProgresso && (it + 1) % 500 === 0) onProgresso(it + 1);
    }
    if (condCont) condCont.sim = validas;
    return { pos, N: validas, pedidas: N, zc };
  }

  // resume as contagens em chances por zona (título = 1º)
  function chances(L, mc) {
    const zonas = L.regras.zonas;
    return L.times.map((t) => {
      const c = mc.pos[t.i], out = { i: t.i, titulo: c[0] / mc.N, dist: Array.from(c, (v) => v / mc.N) };
      zonas.forEach((z, k) => { let s = 0; if (mc.zc) s = mc.zc[t.i][k]; else for (let p = z.de; p <= z.ate; p++) s += c[p - 1]; out[z.id] = s / mc.N; });
      let m = 0; for (let p = 0; p < L.n; p++) m += (p + 1) * c[p]; out.posMedia = m / mc.N;
      return out;
    });
  }

  // ================================================================== cenário no link
  // v1: 1 byte de versão + mapa de bits dos n*n pares (mandante, visitante) + 1 byte por placar
  // (gols do mandante * 16 + gols do visitante, até 15 cada) → base64url. 41 jogos ≈ 120 caracteres.
  function codificar(L, placares) {
    const n = L.n, nb = Math.ceil(n * n / 8);
    const bits = new Uint8Array(nb), gols = [];
    L.jogos.slice().sort((x, y) => x.par - y.par).forEach((j) => {
      if (j.feito) return;
      const p = placares[j.chave];
      if (!p || p[0] == null || p[1] == null) return;
      bits[j.par >> 3] |= 1 << (j.par & 7);
      gols.push(Math.min(15, p[0]) * 16 + Math.min(15, p[1]));
    });
    const bytes = [1].concat(Array.from(bits), gols);
    return b64url(bytes);
  }
  function decodificar(L, cod) {
    const bytes = deB64url(cod);
    if (!bytes || bytes[0] !== 1) return null;
    const n = L.n, nb = Math.ceil(n * n / 8);
    if (bytes.length < 1 + nb) return null;
    const porPar = {};
    L.jogos.forEach((j) => { porPar[j.par] = j; });
    const out = {};
    let g = 1 + nb;
    for (let par = 0; par < n * n; par++) {
      if (!(bytes[1 + (par >> 3)] & (1 << (par & 7)))) continue;
      if (g >= bytes.length) return null;
      const b = bytes[g++], j = porPar[par];
      if (j && !j.feito) out[j.chave] = [b >> 4, b & 15];   // jogo que já aconteceu: vale o placar real
    }
    return out;
  }
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  function b64url(bytes) {
    let s = '';
    for (let i = 0; i < bytes.length; i += 3) {
      const a = bytes[i], b = bytes[i + 1], c = bytes[i + 2];
      const v = (a << 16) | ((b || 0) << 8) | (c || 0);
      s += B64[(v >> 18) & 63] + B64[(v >> 12) & 63] + (b == null ? '' : B64[(v >> 6) & 63]) + (c == null ? '' : B64[v & 63]);
    }
    return s;
  }
  function deB64url(s) {
    const out = [];
    let buf = 0, nbits = 0;
    for (const ch of String(s || '')) {
      const v = B64.indexOf(ch);
      if (v < 0) return null;
      buf = (buf << 6) | v; nbits += 6;
      if (nbits >= 8) { nbits -= 8; out.push((buf >> nbits) & 255); }
    }
    return out;
  }

  // ================================================================== "o que o meu time precisa"
  // Objetivos: título (1º), cada zona do regulamento e "fugir do rebaixamento".
  function objetivos(regras) {
    const lista = [{ id: 'titulo', nome: 'Título', de: 1, ate: 1, bom: true }];
    regras.zonas.forEach((z) => {
      if (z.id === 'rb') lista.push({ id: 'escapar', nome: 'Escapar do rebaixamento', de: 1, ate: z.de - 1, bom: true });
      else lista.push({ id: z.id, nome: z.nome, de: 1, ate: z.ate, bom: true });
    });
    return lista;
  }

  // Situação matemática pelos pontos (critérios de desempate tratados com folga):
  // garantido: nem com o time perdendo tudo mais de (ate-1) rivais podem passá-lo;
  // impossível: mesmo vencendo tudo, ao menos "ate" rivais já estão garantidamente acima.
  function situacao(L, placares, t, obj) {
    const s = estatisticas(L, placares);
    const resta = new Array(L.n).fill(0);
    L.jogos.forEach((j) => { if (!j.feito && !placarDe(j, placares)) { resta[j.h]++; resta[j.a]++; } });
    const min = s.map((x) => x.pts), max = s.map((x, i) => x.pts + 3 * resta[i]);
    let podemPassar = 0, jaAcima = 0;
    for (let i = 0; i < L.n; i++) {
      if (i === t) continue;
      if (max[i] >= min[t]) podemPassar++;       // empate em pontos conta como "pode passar"
      if (min[i] > max[t]) jaAcima++;
    }
    if (podemPassar <= obj.ate - 1) return 'garantido';
    if (jaAcima >= obj.ate) return 'impossivel';
    return 'aberto';
  }

  // Jogos que ainda importam para o time t no objetivo: os dele e os de rivais que podem terminar
  // tanto acima quanto abaixo dele.
  function jogosRelevantes(L, placares, t) {
    const s = estatisticas(L, placares);
    const resta = new Array(L.n).fill(0);
    const livres = L.jogos.filter((j) => !j.feito && !placarDe(j, placares));
    livres.forEach((j) => { resta[j.h]++; resta[j.a]++; });
    const min = s.map((x) => x.pts), max = s.map((x, i) => x.pts + 3 * resta[i]);
    const rival = (i) => i !== t && max[i] >= min[t] && min[i] <= max[t];
    return livres.filter((j) => j.h === t || j.a === t || rival(j.h) || rival(j.a));
  }

  // Enumeração exata (vitória/empate/derrota de cada jogo relevante, com placar típico 1x0, 1x1,
  // 0x1, e os jogos não relevantes com 0x0). Desempate por saldo vira "depende do saldo".
  // Devolve as combinações com o desfecho: 'sim', 'nao' ou 'saldo'.
  function enumerar(L, placares, t, obj, relevantes) {
    const k = relevantes.length;
    const total = Math.pow(3, k);
    const resultados = new Uint8Array(total);            // 0 não, 1 sim, 2 depende do saldo
    const pontosT = new Uint8Array(total);               // pontos que t soma nos jogos relevantes
    const PLAC = [[1, 0], [1, 1], [0, 1]];
    const fixos = Object.assign({}, placares);
    L.jogos.forEach((j) => { if (!j.feito && !placarDe(j, placares) && relevantes.indexOf(j) < 0) fixos[j.chave] = [0, 0]; });
    const s0 = estatisticas(L, fixos);
    const P = L.regras.pontos;
    const s = s0.map((x) => Object.assign({}, x));
    for (let c = 0; c < total; c++) {
      for (let i = 0; i < L.n; i++) { const b = s0[i], x = s[i]; x.pts = b.pts; x.v = b.v; x.e = b.e; x.d = b.d; x.j = b.j; x.gp = b.gp; x.gc = b.gc; }
      let q = c;
      for (let g = 0; g < k; g++) {
        const res = q % 3; q = (q - res) / 3;
        const j = relevantes[g], p = PLAC[res];
        somar(s[j.h], s[j.a], p[0], p[1], P);
        if (j.h === t) pontosT[c] += res === 0 ? 3 : res === 1 ? 1 : 0;
        else if (j.a === t) pontosT[c] += res === 2 ? 3 : res === 1 ? 1 : 0;
      }
      // posição de t considerando só pontos e vitórias (os critérios que o resultado define)
      let acima = 0, empatados = 0;
      for (let i = 0; i < L.n; i++) {
        if (i === t) continue;
        const d = (s[i].pts - s[t].pts) || (s[i].v - s[t].v);
        if (d > 0) acima++; else if (d === 0) empatados++;
      }
      const melhor = acima + 1, pior = acima + 1 + empatados;
      resultados[c] = pior <= obj.ate ? 1 : melhor > obj.ate ? 0 : 2;
    }
    const jogosT = relevantes.filter((j) => j.h === t || j.a === t).length;
    return { relevantes, resultados, pontosT, jogosT, total };
  }

  // Resume a enumeração numa árvore de condições em linguagem humana, escolhendo primeiro os jogos
  // que mais separam os desfechos (os do próprio time têm preferência no empate).
  function resumir(L, t, en, maxProf) {
    const { relevantes, resultados } = en;
    const k = relevantes.length;
    function no(fixo, prof) {
      // fixo: array k com -1 (livre) ou 0/1/2
      let sim = 0, nao = 0, saldo = 0, tot = 0;
      const cont = [];
      for (let g = 0; g < k; g++) cont.push([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
      for (let c = 0; c < en.total; c++) {
        let q = c, ok = true; const res = [];
        for (let g = 0; g < k; g++) { const r = q % 3; q = (q - r) / 3; res.push(r); if (fixo[g] >= 0 && fixo[g] !== r) { ok = false; break; } }
        if (!ok) continue;
        const o = resultados[c]; tot++;
        if (o === 1) sim++; else if (o === 0) nao++; else saldo++;
        for (let g = 0; g < k; g++) cont[g][res[g]][o === 1 ? 0 : o === 0 ? 1 : 2]++;
      }
      if (!tot) return { tipo: 'nao' };
      if (sim === tot) return { tipo: 'sim' };
      if (nao === tot) return { tipo: 'nao' };
      if (saldo === tot) return { tipo: 'saldo' };
      if (prof >= maxProf) return { tipo: 'depende', p: (sim + saldo / 2) / tot };
      // melhor jogo para separar: o que deixa os ramos mais "puros"
      let melhor = -1, nota = -1;
      for (let g = 0; g < k; g++) {
        if (fixo[g] >= 0) continue;
        let pureza = 0;
        for (let r = 0; r < 3; r++) { const [a, b, c2] = cont[g][r], s2 = a + b + c2; if (s2) pureza += Math.max(a, b, c2); }
        const proprio = relevantes[g].h === t || relevantes[g].a === t ? 0.5 : 0;
        if (pureza + proprio > nota) { nota = pureza + proprio; melhor = g; }
      }
      const filhos = [0, 1, 2].map((r) => { const f = fixo.slice(); f[melhor] = r; return no(f, prof + 1); });
      return { tipo: 'jogo', jogo: relevantes[melhor], filhos };
    }
    return no(new Array(k).fill(-1), 0);
  }

  // Pontos: com quantos pontos (nos jogos que faltam) o objetivo fica garantido, e até quantos ele
  // fica impossível, quaisquer que sejam os outros resultados. null = não existe esse número.
  function porPontos(en) {
    const max = 3 * en.jogosT;
    let garante = null, impossivelAte = null;
    for (let P = 0; P <= max; P++) {
      let todosSim = true, existe = false;
      for (let c = 0; c < en.total; c++) if (en.pontosT[c] >= P) { existe = true; if (en.resultados[c] !== 1) { todosSim = false; break; } }
      if (existe && todosSim) { garante = P; break; }
    }
    for (let P = max; P >= 0; P--) {
      let todosNao = true, existe = false;
      for (let c = 0; c < en.total; c++) if (en.pontosT[c] <= P) { existe = true; if (en.resultados[c] !== 0) { todosNao = false; break; } }
      if (existe && todosNao) { impossivelAte = P; break; }
    }
    return { garante, impossivelAte, max };
  }

  // Condições suficientes mais curtas: conjunções de até maxLit "literais" (um jogo com um conjunto de
  // resultados: vitória do mandante, empate, vitória do visitante, ou as uniões "não perde"/"não
  // vence") que garantem o desfecho alvo (1 = consegue, 0 = não consegue) em TODAS as combinações
  // dos outros jogos. Bitsets sobre as 3^k combinações deixam a busca rápida.
  const CONJ = [[0], [1], [2], [0, 1], [1, 2]];
  function condicoes(L, t, en, alvo, maxLit, maxRes) {
    const { relevantes, resultados, total } = en;
    const k = relevantes.length, W = Math.ceil(total / 32);
    const bitsAlvoNao = new Uint32Array(W);          // combinações que NÃO dão o alvo
    for (let c = 0; c < total; c++) if (resultados[c] !== alvo) bitsAlvoNao[c >> 5] |= 1 << (c & 31);
    // literais: bitset das combinações em que o jogo g termina dentro do conjunto
    const lits = [];
    for (let g = 0; g < k; g++) {
      CONJ.forEach((conj) => {
        const b = new Uint32Array(W);
        for (let c = 0; c < total; c++) {
          const r = Math.floor(c / Math.pow(3, g)) % 3;
          if (conj.indexOf(r) >= 0) b[c >> 5] |= 1 << (c & 31);
        }
        lits.push({ g, conj, b, proprio: relevantes[g].h === t || relevantes[g].a === t });
      });
    }
    const achadas = [];
    const ok = (bits) => {
      let algum = false;
      for (let w = 0; w < W; w++) { if (bits[w] & bitsAlvoNao[w]) return false; if (bits[w]) algum = true; }
      return algum;
    };
    const contem = (a, b) => b.every((y) => a.some((x) => x.g === y.g && y.conj.every((r) => x.conj.indexOf(r) >= 0)));
    // mais fraca primeiro: a condição "não perde" vale mais que "vence" (é mais fácil de cumprir)
    const peso = (lst) => lst.reduce((s, x) => s + (x.proprio ? 0 : 0.3) - x.conj.length * 0.1, lst.length * 10);
    function busca(ini, atual, bits, lim) {
      if (atual.length && ok(bits)) {
        // descarta se já existe uma condição mais curta/fraca contida nesta
        if (!achadas.some((a) => contem(atual, a))) achadas.push(atual.slice());
        return;
      }
      if (atual.length >= lim) return;
      for (let q = ini; q < lits.length; q++) {
        const l = lits[q];
        if (atual.some((x) => x.g === l.g)) continue;
        const nb = new Uint32Array(W);
        let algum = false;
        for (let w = 0; w < W; w++) { nb[w] = (atual.length ? bits[w] : 0xffffffff) & l.b[w]; if (nb[w]) algum = true; }
        if (!algum) continue;
        atual.push(l); busca(q + 1, atual, nb, lim); atual.pop();
      }
    }
    for (let tam = 1; tam <= maxLit && achadas.length < maxRes; tam++) {
      const antes = achadas.length;
      busca(0, [], null, tam);
      if (achadas.length > antes && tam >= 2) break;    // já há condições curtas: não precisa das longas
    }
    // fica só com as mínimas (nenhuma contém outra) e ordena: menos literais, mais do próprio time
    const minimas = achadas.filter((a, i) => !achadas.some((b, j) => j !== i && b.length < a.length && contem(a, b)));
    minimas.sort((a, b) => peso(a) - peso(b));
    return minimas.slice(0, maxRes).map((lst) => lst.slice().sort((x, y) => (y.proprio - x.proprio) || (x.g - y.g)).map((x) => ({ jogo: relevantes[x.g], conj: x.conj })));
  }

  // ================================================================== dados das versões antigas
  // Antes da unificação o simulador era um arquivo único (index.html na raiz). Ele guardava os
  // placares com outras chaves: v3 pelo índice do jogo numa lista fixa (LEGADO_V3), v4 pelo par de
  // siglas da ESPN ("FLA-PAL"). Aqui eles viram as chaves deste núcleo ("flamengo-palmeiras").
  const LEGADO_V3 = ['VIT-FLU', 'CHA-VAS', 'MIR-CAM', 'CFC-SAN', 'REMO-CHA', 'CRU-PAL', 'FLA-CAP', 'COR-BOT', 'GRE-BAH', 'VAS-INT',
    'VIT-BRA', 'SAO-FLU', 'PAL-FLA', 'BAH-CFC', 'CHA-CRU', 'CAP-REMO', 'FLU-MIR', 'BRA-VAS', 'INT-VIT', 'BOT-SAO', 'SAN-GRE',
    'CAM-COR', 'CAM-VAS', 'BOT-BAH', 'CHA-PAL', 'COR-GRE', 'CFC-FLA', 'FLU-CRU', 'INT-BRA', 'MIR-CAP', 'SAO-REMO', 'VIT-SAN',
    'CAP-SAO', 'BAH-CAM', 'CRU-INT', 'FLA-CHA', 'GRE-MIR', 'PAL-CFC', 'BRA-FLU', 'REMO-COR', 'SAN-BOT', 'VAS-VIT'];

  function porSiglas(L) {
    const ab = {}, par = {};
    L.times.forEach((t) => { if (t.abrev) ab[t.abrev] = t.i; });
    L.jogos.forEach((j) => { if (!j.feito) par[j.h + ':' + j.a] = j; });
    return (k) => {
      const m = /^([A-Z]{2,5})-([A-Z]{2,5})$/.exec(k || '');
      if (!m || ab[m[1]] == null || ab[m[2]] == null) return null;
      return par[ab[m[1]] + ':' + ab[m[2]]] || null;
    };
  }

  // placares antigos → { p, sim } com as chaves novas. Jogo que já aconteceu (ou que não existe
  // mais) fica de fora: vale o resultado real.
  function placaresAntigos(L, picks, auto) {
    const achar = porSiglas(L), p = {}, sim = {};
    Object.keys(picks || {}).forEach((k) => {
      const v = picks[k];
      if (!Array.isArray(v) || v.length !== 2) return;
      const x = Math.floor(+v[0]), y = Math.floor(+v[1]);
      if (!(x >= 0) || !(y >= 0)) return;
      const j = achar(/^\d+$/.test(k) ? LEGADO_V3[+k] : k);
      if (!j) return;
      p[j.chave] = [Math.min(15, x), Math.min(15, y)];
      if (auto && auto[k]) sim[j.chave] = 1;
    });
    return { p, sim };
  }

  // antigos: { rascunhos: [v4, v3], cenarios: [lista v4, lista v3], agora: ISO }
  // devolve o que gravar nas chaves novas (null quando não havia nada)
  function migrarAntigos(L, antigos) {
    const out = { placares: null, prefs: null, cenarios: [] };
    (antigos.rascunhos || []).some((r) => {
      if (!r || typeof r !== 'object' || !r.picks) return false;
      const pl = placaresAntigos(L, r.picks, r.auto);
      out.placares = pl;
      const pr = r.prefs || {};
      const prefs = {};
      if (pr.formaN === 3 || pr.formaN === 5) prefs.forma = pr.formaN;
      if (pr.ordem === 'cima' || pr.ordem === 'baixo') prefs.ordem = pr.ordem;
      if ([2000, 10000, 50000].indexOf(pr.n) >= 0) prefs.N = pr.n;
      if (pr.modoRev === 'manual' || pr.modoRev === 'auto') prefs.revelacao = pr.modoRev;
      if (Object.keys(prefs).length) out.prefs = prefs;
      return true;
    });
    const vistos = {};
    (antigos.cenarios || []).forEach((lista) => {
      if (!Array.isArray(lista)) return;
      lista.forEach((c) => {
        if (!c || typeof c !== 'object' || !c.picks) return;
        const nome = String(c.nome || 'Cenário').slice(0, 40);
        const criado = new Date(typeof c.quando === 'number' ? c.quando : Date.parse(antigos.agora || '') || 0).toISOString();
        const id = nome + '|' + criado;
        if (vistos[id]) return;
        vistos[id] = 1;
        out.cenarios.push({ nome, criado, temporada: L.temporada, p: placaresAntigos(L, c.picks, null).p, migrado: true });
      });
    });
    return out;
  }

  // link de cenário da v4 (?c=...#simular): mesmo formato do codificar(), mas os pares seguem a
  // ordem alfabética das siglas da ESPN, e não a dos nomes
  function decodificarAntigo(L, cod) {
    const bytes = deB64url(cod);
    const siglas = L.times.map((t) => t.abrev).filter(Boolean).sort();
    const n = siglas.length, nb = Math.ceil(n * n / 8);
    if (!bytes || bytes[0] !== 1 || n !== L.n || bytes.length < 1 + nb) return null;
    const achar = porSiglas(L), out = {};
    let g = 1 + nb;
    for (let par = 0; par < n * n; par++) {
      if (!(bytes[1 + (par >> 3)] & (1 << (par & 7)))) continue;
      if (g >= bytes.length) return null;
      const b = bytes[g++], j = achar(siglas[Math.floor(par / n)] + '-' + siglas[par % n]);
      if (j) out[j.chave] = [b >> 4, b & 15];
    }
    return out;
  }

  return {
    rng, preparar, condicoes, porPontos, deduzirRodadas, placarDe, estatisticas, tabela, ordenar, confronto, zonaDe, zonasTab, forma,
    PARAMS_PADRAO, PARAMS_FORMA3, modelo, matriz, amostrar, amostrarCrivel, avaliar, MAX_MOSTRAR, simularRestantes, monteCarlo, chances,
    codificar, decodificar, decodificarAntigo, placaresAntigos, migrarAntigos, LEGADO_V3, objetivos, situacao, jogosRelevantes, enumerar, resumir,
  };
});

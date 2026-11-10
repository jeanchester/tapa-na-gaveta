// Dez a Zero: regras do jogo, sem tela. Não conhece DOM, Canvas nem Capacitor: recebe números e
// objetos simples e devolve números e objetos simples (dá para testar no Node: tools/balancear.js).
//
// Todo sorteio passa por rng(semente): a mesma semente dá sempre o mesmo resultado. É isso que faz o
// Desafio do Dia ser igual para todo mundo e que permite guardar a campanha só com as escolhas.
(function (root) {
  'use strict';
  const DADOS = (typeof module !== 'undefined' && module.exports) ? require('./dez-dados.js') : root.DEZ_DADOS;

  // ------------------------------------------------------------ sorteio com semente
  function hash(str) {
    let h = 2166136261;
    str = String(str);
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return h >>> 0;
  }
  function rng(seed) { // mulberry32
    let a = (typeof seed === 'number' ? seed : hash(seed)) >>> 0;
    const f = () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.int = (n) => Math.floor(f() * n);
    f.pick = (arr) => arr[Math.floor(f() * arr.length)];
    f.gauss = () => { let s = 0; for (let i = 0; i < 6; i++) s += f(); return (s - 3) / 0.7071; }; // ~N(0,1)
    f.shuffle = (arr) => { const a2 = arr.slice(); for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; } return a2; };
    f.weighted = (arr, wf) => { const ws = arr.map(wf), tot = ws.reduce((s, x) => s + x, 0); let x = f() * tot; for (let i = 0; i < arr.length; i++) { x -= ws[i]; if (x <= 0) return arr[i]; } return arr[arr.length - 1]; };
    return f;
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const round1 = (v) => Math.round(v * 10) / 10;

  // ------------------------------------------------------------ posições e formações
  // Ids das posições ficam salvos (campanha em andamento): não renomear.
  const POS = ['GK', 'RB', 'CB', 'LB', 'DM', 'CM', 'AM', 'RW', 'LW', 'ST'];
  const LINHA = { GK: 'gol', RB: 'def', CB: 'def', LB: 'def', DM: 'mei', CM: 'mei', AM: 'mei', RW: 'ata', LW: 'ata', ST: 'ata' };
  // Quanto o jogador perde jogando fora da posição: ALT[vaga][posição do jogador]. Sem entrada = não pode.
  const ALT = {
    GK: {},
    RB: { LB: 3, CB: 4, RW: 4, DM: 6 },
    LB: { RB: 3, CB: 4, LW: 4, DM: 6 },
    CB: { DM: 3, RB: 5, LB: 5, CM: 6 },
    DM: { CM: 2, CB: 4, AM: 6 },
    CM: { DM: 2, AM: 2, RW: 6, LW: 6 },
    AM: { CM: 2, RW: 4, LW: 4, ST: 4 },
    RW: { LW: 3, AM: 4, ST: 4, RB: 6 },
    LW: { RW: 3, AM: 4, ST: 4, LB: 6 },
    ST: { AM: 4, RW: 4, LW: 4 },
  };
  function penalidade(vaga, pos) {
    if (vaga === pos) return 0;
    const p = ALT[vaga] && ALT[vaga][pos];
    return p === undefined ? null : p;
  }

  // x: 0 = esquerda, 1 = direita (olhando para o gol adversário); y: 0 = linha do próprio gol, 1 = do adversário.
  const F = (pos, x, y) => ({ pos, x, y });
  const FORMACOES = {
    '4-3-3': [F('GK', .5, .03), F('RB', .86, .24), F('CB', .63, .19), F('CB', .37, .19), F('LB', .14, .24), F('DM', .5, .36), F('CM', .7, .46), F('CM', .3, .46), F('RW', .84, .68), F('ST', .5, .74), F('LW', .16, .68)],
    '4-4-2': [F('GK', .5, .03), F('RB', .86, .23), F('CB', .63, .19), F('CB', .37, .19), F('LB', .14, .23), F('RW', .86, .48), F('CM', .62, .42), F('DM', .38, .40), F('LW', .14, .48), F('ST', .62, .72), F('ST', .38, .72)],
    '4-2-3-1': [F('GK', .5, .03), F('RB', .86, .24), F('CB', .63, .19), F('CB', .37, .19), F('LB', .14, .24), F('DM', .62, .36), F('CM', .38, .38), F('RW', .84, .6), F('AM', .5, .58), F('LW', .16, .6), F('ST', .5, .76)],
    '3-5-2': [F('GK', .5, .03), F('CB', .74, .2), F('CB', .5, .17), F('CB', .26, .2), F('RB', .9, .44), F('CM', .67, .48), F('DM', .5, .36), F('CM', .33, .48), F('LB', .1, .44), F('ST', .62, .73), F('ST', .38, .73)],
    // os quatro de cima são os que os adversários usam (formacaoDoTime): novos esquemas entram abaixo
    '4-1-4-1': [F('GK', .5, .03), F('RB', .86, .24), F('CB', .63, .19), F('CB', .37, .19), F('LB', .14, .24), F('DM', .5, .34), F('RW', .86, .55), F('CM', .64, .5), F('CM', .36, .5), F('LW', .14, .55), F('ST', .5, .76)],
    '4-1-2-1-2': [F('GK', .5, .03), F('RB', .86, .24), F('CB', .63, .19), F('CB', .37, .19), F('LB', .14, .24), F('DM', .5, .34), F('CM', .7, .46), F('CM', .3, .46), F('AM', .5, .58), F('ST', .62, .75), F('ST', .38, .75)],
    '3-4-3': [F('GK', .5, .03), F('CB', .74, .2), F('CB', .5, .17), F('CB', .26, .2), F('RB', .9, .45), F('CM', .62, .42), F('DM', .38, .4), F('LB', .1, .45), F('RW', .82, .7), F('ST', .5, .76), F('LW', .18, .7)],
    '5-3-2': [F('GK', .5, .03), F('RB', .9, .3), F('CB', .7, .18), F('CB', .5, .16), F('CB', .3, .18), F('LB', .1, .3), F('CM', .68, .46), F('DM', .5, .38), F('CM', .32, .46), F('ST', .62, .73), F('ST', .38, .73)],
    '4-5-1': [F('GK', .5, .03), F('RB', .86, .24), F('CB', .63, .19), F('CB', .37, .19), F('LB', .14, .24), F('RW', .86, .52), F('CM', .66, .46), F('DM', .5, .38), F('CM', .34, .46), F('LW', .14, .52), F('ST', .5, .76)],
  };

  // Números das camisas do time montado no draft, por vaga (os jogadores vêm de times diferentes,
  // e os números originais repetiriam).
  const NUMEROS_VAGA = {
    '4-3-3': [1, 2, 4, 3, 6, 5, 8, 10, 7, 9, 11],
    '4-4-2': [1, 2, 4, 3, 6, 7, 8, 5, 11, 9, 10],
    '4-2-3-1': [1, 2, 4, 3, 6, 5, 8, 7, 10, 11, 9],
    '3-5-2': [1, 4, 3, 6, 2, 8, 5, 10, 11, 9, 7],
    '4-1-4-1': [1, 2, 4, 3, 6, 5, 7, 8, 10, 11, 9],
    '4-1-2-1-2': [1, 2, 4, 3, 6, 5, 8, 7, 10, 9, 11],
    '3-4-3': [1, 4, 5, 6, 2, 8, 10, 3, 7, 9, 11],
    '5-3-2': [1, 2, 4, 5, 6, 3, 7, 8, 10, 9, 11],
    '4-5-1': [1, 2, 4, 3, 6, 7, 8, 5, 10, 11, 9],
  };
  const numerar = (xi, formacao) => xi.map((j, i) => (j ? Object.assign({}, j, { num: NUMEROS_VAGA[formacao][i] }) : j));

  // ------------------------------------------------------------ times
  const SELECOES = DADOS.selecoes;
  const LIGAS = DADOS.ligas;
  const TIMES = {};
  SELECOES.forEach((t) => { TIMES[t.id] = t; });
  LIGAS.forEach((lg) => lg.clubes.forEach((t) => { TIMES[t.id] = t; }));
  const time = (id) => TIMES[id];
  const nomeTime = (t, lang) => (t ? (t.nome[lang] || t.nome.pt) : '');

  const ANO_ATUAL = 2026;
  // Cada time tem um conjunto fechado de temporadas: só os anos que existem nos dados.
  const temReal = (t) => !!(DADOS.anos[t.id] && DADOS.anos[t.id].length);
  const anosDe = (t) => DADOS.anos[t.id] || [];
  // Rótulo do ano: clubes europeus "2025/26", Brasileirão e seleções só o ano. Elencos de uma
  // antecessora (Zaire, Tchecoslováquia...) levam o nome dela: "1974 (Zaire)".
  function rotuloAno(t, ano, lang) {
    if (!t) return String(ano);
    const e = DADOS.elencos[t.id + '@' + ano];
    const ap = e && e.apelido ? ' (' + (e.apelido[lang] || e.apelido.pt) + ')' : '';
    if (t.tipo === 'selecao' || t.liga === 'brasileirao') return String(ano) + ap;
    return ano + '/' + String((ano + 1) % 100).padStart(2, '0') + ap;
  }
  // Força do time num ano: média do melhor XI daquele elenco (calculada mais abaixo, em t.forcas).
  const forcaNoAno = (t, ano) => (t.forcas && t.forcas[ano] != null ? t.forcas[ano] : t.forca);

  // ------------------------------------------------------------ elencos
  // Lidos de DEZ_DADOS.elencos (shared/dados/*.js). Id estável do jogador: "<timeId>@<ano>:<n>".
  const elencoCache = {};
  function elenco(timeId, ano) {
    const key = timeId + '@' + ano;
    if (elencoCache[key]) return elencoCache[key];
    const real = DADOS.elencos[key];
    const lista = real ? real.jogadores.map((j, n) => ({
      id: key + ':' + n, nome: j.nome, curto: j.curto, pos: j.pos, num: j.num, forca: j.forca, idade: j.idade, time: timeId, ano, origem: j.origem,
    })) : []; // ano que não existe nos dados (save antigo)
    lista.sort((a, b) => POS.indexOf(a.pos) - POS.indexOf(b.pos) || b.forca - a.forca);
    elencoCache[key] = lista;
    return lista;
  }

  // Melhor XI de um elenco numa formação: primeiro os pares (vaga, jogador) de maior força efetiva
  // (cada um tende a ir para a sua posição), depois trocas que aumentem a soma (dois titulares
  // trocando de vaga, ou um reserva entrando no lugar de um titular).
  function melhorXI(lista, formacao) {
    const slots = FORMACOES[formacao];
    const xi = new Array(slots.length).fill(null);
    const val = (i, j) => { const p = penalidade(slots[i].pos, j.pos); return p === null ? -Infinity : j.forca - p; };
    const pares = [];
    slots.forEach((s, i) => lista.forEach((j, k) => { const v = val(i, j); if (v > -Infinity) pares.push([v, i, k]); }));
    pares.sort((a, b) => b[0] - a[0] || a[1] - b[1] || a[2] - b[2]);
    const usado = new Array(lista.length).fill(false);
    for (const [, i, k] of pares) {
      if (xi[i] || usado[k]) continue;
      xi[i] = lista[k]; usado[k] = true;
    }
    for (let volta = 0, mudou = true; mudou && volta < 6; volta++) {
      mudou = false;
      for (let a = 0; a < slots.length; a++) {
        for (let b = a + 1; b < slots.length; b++) {
          const ja = xi[a], jb = xi[b];
          const antes = (ja ? val(a, ja) : 0) + (jb ? val(b, jb) : 0);
          const depois = (jb ? val(a, jb) : 0) + (ja ? val(b, ja) : 0);
          if (depois > antes + 1e-9 && (ja || jb)) { xi[a] = jb; xi[b] = ja; mudou = true; }
        }
        lista.forEach((j, k) => {
          if (usado[k]) return;
          const atual = xi[a] ? val(a, xi[a]) : -Infinity;
          if (val(a, j) > atual + 1e-9) {
            if (xi[a]) usado[lista.indexOf(xi[a])] = false;
            xi[a] = j; usado[k] = true; mudou = true;
          }
        });
      }
    }
    return xi;
  }
  const FORM_ADV = Object.keys(FORMACOES).slice(0, 4);
  function formacaoDoTime(timeId, ano) {
    const e = DADOS.elencos[timeId + '@' + ano];
    return e && FORM_ADV.includes(e.formacao) ? e.formacao : FORM_ADV[hash('form:' + timeId) % 4];
  }

  // ------------------------------------------------------------ força de um XI
  // xi: array alinhado com as vagas da formação (jogador ou null).
  function efetiva(j, vagaPos) {
    if (!j) return 40;
    const p = penalidade(vagaPos, j.pos);
    return j.forca - (p === null ? 15 : p);
  }
  function entrosamento(xi) {
    const porTimeAno = {}, porTime = {};
    xi.forEach((j) => {
      if (!j) return;
      porTimeAno[j.time + '@' + j.ano] = (porTimeAno[j.time + '@' + j.ano] || 0) + 1;
      porTime[j.time] = (porTime[j.time] || 0) + 1;
    });
    let b = 0;
    Object.values(porTimeAno).forEach((n) => { if (n > 1) b += (n - 1) * 0.6; });
    Object.values(porTime).forEach((n) => { if (n > 1) b += (n - 1) * 0.25; });
    return round1(Math.min(3, b));
  }
  // O entrosamento é uma mecânica do draft (juntar jogadores do mesmo time): os adversários, que
  // jogam com o elenco inteiro do mesmo time e ano, não ganham o bônus (opts.semEntrosamento).
  function forcaXI(xi, formacao, opts = {}) {
    const slots = FORMACOES[formacao];
    const soma = { gol: [], def: [], mei: [], ata: [] };
    const ef = slots.map((s, i) => efetiva(xi[i], s.pos));
    slots.forEach((s, i) => soma[LINHA[s.pos]].push(ef[i]));
    const med = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 40);
    const ent = opts.semEntrosamento ? 0 : entrosamento(xi);
    const gol = med(soma.gol), def = med(soma.def), mei = med(soma.mei), ata = med(soma.ata);
    const geral = med(ef) + ent;
    return {
      geral: round1(geral), gol: round1(gol), def: round1(def), mei: round1(mei), ata: round1(ata), ent,
      ataque: round1(0.58 * ata + 0.32 * mei + 0.1 * def + ent),
      defesa: round1(0.47 * def + 0.25 * mei + 0.28 * gol + ent),
    };
  }

  // Força de cada time: média do melhor XI (sem entrosamento) em cada ano, e a média dos anos
  // (usada no peso do sorteio e na escolha dos adversários).
  Object.values(TIMES).forEach((t) => {
    if (!temReal(t)) { t.forca = 70; return; }
    t.forcas = {};
    DADOS.anos[t.id].forEach((ano) => {
      const f = formacaoDoTime(t.id, ano);
      t.forcas[ano] = round1(forcaXI(melhorXI(elenco(t.id, ano), f), f, { semEntrosamento: true }).geral);
    });
    const v = Object.values(t.forcas);
    t.forca = round1(v.reduce((x, y) => x + y, 0) / v.length);
  });

  // ------------------------------------------------------------ resultado de uma partida
  // Gols por Poisson, com média que cresce com (ataque - defesa adversária). Os números foram
  // calibrados em tools/balancear.js.
  const MODELO = { base: 1.12, k: 0.16, kOutros: 0.11, sat: 9, min: 0.12, max: 5.5 };
  function poisson(r, l) {
    const L = Math.exp(-l);
    let k = 0, p = 1;
    do { k++; p *= r(); } while (p > L);
    return k - 1;
  }
  // A diferença satura (tanh): um time muito mais forte não ganha "sempre", como no futebol de verdade.
  // k: quanto a diferença de força pesa. Os jogos entre adversários (sem o jogador) usam kOutros, um pouco
  // menor: os gigantes não disparam na tabela e a campanha depende mais dos jogos do jogador.
  const mediaGols = (fa, fb, k = MODELO.k) => {
    const d = MODELO.sat * Math.tanh((fa.ataque - fb.defesa) / MODELO.sat);
    return clamp(MODELO.base * Math.exp(k * d), MODELO.min, MODELO.max);
  };
  function placar(fa, fb, r, k) { return [poisson(r, mediaGols(fa, fb, k)), poisson(r, mediaGols(fb, fa, k))]; }

  // Peso de cada vaga para marcar e para dar a assistência.
  const PESO_GOL = { GK: 0, RB: 0.35, LB: 0.35, CB: 0.45, DM: 0.5, CM: 1, AM: 2.2, RW: 2.6, LW: 2.6, ST: 4.5 };
  const PESO_ASS = { GK: 0.05, RB: 0.8, LB: 0.8, CB: 0.25, DM: 0.8, CM: 1.6, AM: 2.6, RW: 2.2, LW: 2.2, ST: 1.2 };
  function escolheJogador(r, xi, slots, pesos, exceto) {
    const idx = slots.map((s, i) => i).filter((i) => i !== exceto && xi[i]);
    return r.weighted(idx, (i) => pesos[slots[i].pos] * Math.pow(Math.max(40, xi[i].forca) / 80, 3));
  }

  // Partida completa (placar, gols com minuto/autor/assistência, chances, pênaltis no mata-mata).
  // lado 'a' = mandante da tela (o jogador), 'b' = adversário.
  function simularPartida(A, B, seed, opts = {}) {
    const r = rng(seed);
    const [ga, gb] = placar(A.forca, B.forca, r);
    const sa = FORMACOES[A.formacao], sb = FORMACOES[B.formacao];
    const eventos = [];
    const minuto = () => {
      const tempo = r() < 0.5 ? 1 : 2;
      let m = 1 + r.int(45);
      if (r() < 0.07) m = 45 + 1 + r.int(tempo === 2 ? 5 : 3); // acréscimos
      return { tempo, min: m };
    };
    const gol = (lado) => {
      const xi = lado === 'a' ? A.xi : B.xi, slots = lado === 'a' ? sa : sb;
      const autor = escolheJogador(r, xi, slots, PESO_GOL, -1);
      const assist = r() < 0.72 ? escolheJogador(r, xi, slots, PESO_ASS, autor) : -1;
      const tipo = slots[autor].pos === 'CB' && r() < 0.7 ? 'escanteio' : r() < 0.12 ? 'escanteio' : r() < 0.18 ? 'fora_area' : 'jogada';
      eventos.push(Object.assign(minuto(), { lado, tipo: 'gol', jogada: tipo, autor, assist }));
    };
    for (let i = 0; i < ga; i++) gol('a');
    for (let i = 0; i < gb; i++) gol('b');
    // chances que não viram gol (o campinho mostra estas também)
    ['a', 'b'].forEach((lado) => {
      const fa = lado === 'a' ? A.forca : B.forca, fb = lado === 'a' ? B.forca : A.forca;
      const n = poisson(r, 2.2 + mediaGols(fa, fb) * 1.6);
      const xi = lado === 'a' ? A.xi : B.xi, slots = lado === 'a' ? sa : sb;
      for (let i = 0; i < n; i++) {
        const tipo = r.weighted(['defesa', 'fora', 'escanteio', 'bloqueio'], (x) => ({ defesa: 3, fora: 3.2, escanteio: 1.6, bloqueio: 1.4 }[x]));
        eventos.push(Object.assign(minuto(), { lado, tipo, autor: escolheJogador(r, xi, slots, PESO_GOL, -1) }));
      }
    });
    eventos.sort((x, y) => x.tempo - y.tempo || x.min - y.min);
    let penaltis = null;
    if (opts.mataMata && ga === gb) penaltis = disputaPenaltis(A, B, r);
    return { ga, gb, eventos, penaltis };
  }

  function disputaPenaltis(A, B, r) {
    const batedores = (T) => {
      const slots = FORMACOES[T.formacao];
      return slots.map((s, i) => i).filter((i) => T.xi[i] && slots[i].pos !== 'GK')
        .sort((i, j) => (PESO_GOL[slots[j].pos] + T.xi[j].forca / 20) - (PESO_GOL[slots[i].pos] + T.xi[i].forca / 20));
    };
    const goleiro = (T) => T.xi[FORMACOES[T.formacao].findIndex((s) => s.pos === 'GK')];
    const ba = batedores(A), bb = batedores(B), gka = goleiro(A), gkb = goleiro(B);
    const cobrancas = [];
    let a = 0, b = 0, ka = 0, kb = 0;
    while (ka + kb < 40) {
      const lado = ka === kb ? 'a' : 'b';
      const k = lado === 'a' ? ka : kb;
      const lista = lado === 'a' ? ba : bb;
      const autor = lista[k % lista.length];
      const bat = (lado === 'a' ? A : B).xi[autor], gk = lado === 'a' ? gkb : gka;
      const p = clamp(0.76 + ((bat ? bat.forca : 70) - (gk ? gk.forca : 70)) * 0.006, 0.55, 0.92);
      const ok = r() < p;
      if (lado === 'a') { ka++; if (ok) a++; } else { kb++; if (ok) b++; }
      cobrancas.push({ lado, autor, gol: ok });
      if (ka <= 5 && kb <= 5) {
        if (a > b + (5 - kb) || b > a + (5 - ka)) break; // não dá mais para alcançar
      } else if (ka === kb && a !== b) break; // alternadas
    }
    return { cobrancas, a, b };
  }

  // ------------------------------------------------------------ modos
  // Ids dos modos ficam salvos (recordes, campanha): não renomear.
  const LIGA_IDS = LIGAS.map((l) => l.id);
  // Formatos: Copa e Mistura como a Copa de 2026 (12 grupos de 4, passam os 2 primeiros e os 8
  // melhores terceiros, mata-mata desde os 16-avos: 8 jogos); Champions com fase de liga de 6 jogos
  // e mata-mata desde as oitavas (10 jogos); ligas em pontos corridos, 10 rodadas.
  const MODOS = {
    copa: { formato: 'grupos' },
    champions: { formato: 'suico' },
    brasileirao: { formato: 'liga', liga: 'brasileirao' },
    premier: { formato: 'liga', liga: 'premier' },
    laliga: { formato: 'liga', liga: 'laliga' },
    seriea: { formato: 'liga', liga: 'seriea' },
    bundesliga: { formato: 'liga', liga: 'bundesliga' },
    ligue1: { formato: 'liga', liga: 'ligue1' },
    mistura: { formato: 'grupos' },
  };
  const JOGOS_FORMATO = { grupos: 8, suico: 10, liga: 10 };
  // total de jogos de uma campanha completa (aceita o id do modo ou a campanha)
  const totalJogos = (x) => JOGOS_FORMATO[typeof x === 'string' ? MODOS[x].formato : x.formato];
  const FASES_MATA = { grupos: ['r32', 'r16', 'qf', 'sf', 'f'], suico: ['r16', 'qf', 'sf', 'f'], liga: [] };
  const RODADAS_INICIAIS = { grupos: 3, suico: 6, liga: 10 };

  const clubesEuropa = () => LIGAS.filter((l) => l.id !== 'brasileirao').flatMap((l) => l.clubes);
  const todosClubes = () => LIGAS.flatMap((l) => l.clubes);
  // Times que podem sair no sorteio do draft de cada modo.
  function poolDraft(modo) {
    const m = MODOS[modo];
    if (modo === 'copa') return SELECOES;
    if (modo === 'champions') return clubesEuropa();
    if (m.liga) return LIGAS.find((l) => l.id === m.liga).clubes;
    return SELECOES.concat(todosClubes());
  }

  // ------------------------------------------------------------ draft
  // Sorteia time + ano. Times já sorteados neste draft não voltam.
  // Versão do draft/campanha salvos no aparelho: sobe quando os ids de times ou jogadores mudam
  // (2 = dados reais). Save de outra versão é descartado ao abrir.
  const VERSAO_SAVE = 2;
  // Pesos por força (base^(força - 70)): no sorteio do draft (times fortes saem mais, todos podem sair) e na
  // escolha dos adversários da Champions e da Mistura. Calibrados em tools/balancear.js.
  const SORTEIO_PESO = { draft: 1.18, champions: 1.06, mistura: 1.0 };
  function novoDraft(modo, formacao, seed, opts = {}) {
    return { v: VERSAO_SAVE, modo, formacao, seed, n: 0, xi: new Array(11).fill(null), usados: [], sorteio: null, rerolls: opts.rerolls == null ? 1 : opts.rerolls };
  }
  function sortear(d) {
    const r = rng(d.seed + ':sorteio:' + d.n);
    d.n++;
    let pool = poolDraft(d.modo).filter((t) => !d.usados.includes(t.id));
    if (!pool.length) { d.usados = []; pool = poolDraft(d.modo); } // segurança: liga pequena e muitos re-sorteios
    // times mais fortes saem um pouco mais (mais graça), mas todos podem sair
    const t = r.weighted(pool, (x) => Math.pow(SORTEIO_PESO.draft, x.forca - 70));
    const ano = r.pick(anosDe(t));
    d.usados.push(t.id);
    // só vale o sorteio se algum jogador cabe numa vaga livre; senão, sorteia de novo (sem custo)
    const s = { time: t.id, ano };
    d.sorteio = s;
    if (!jogadoresSorteio(d).some((j) => vagasPara(d, j).length)) return sortear(d);
    return s;
  }
  const jogadoresSorteio = (d) => (d.sorteio ? elenco(d.sorteio.time, d.sorteio.ano) : []);
  // Vagas livres em que o jogador pode jogar, com a força que ele teria em cada uma.
  function vagasPara(d, j) {
    const slots = FORMACOES[d.formacao];
    const res = [];
    slots.forEach((s, i) => {
      if (d.xi[i]) return;
      const p = penalidade(s.pos, j.pos);
      if (p !== null) res.push({ vaga: i, forca: j.forca - p, pen: p });
    });
    return res.sort((a, b) => a.pen - b.pen);
  }
  function escolher(d, jogadorId, vaga) {
    const j = jogadoresSorteio(d).find((x) => x.id === jogadorId);
    if (!j || d.xi[vaga] || penalidade(FORMACOES[d.formacao][vaga].pos, j.pos) === null) return false;
    d.xi[vaga] = j;
    d.sorteio = null;
    return true;
  }
  const draftCompleto = (d) => d.xi.every(Boolean);
  // Troca de formação no meio do draft: os jogadores escolhidos vão para as vagas compatíveis.
  function trocarFormacao(d, formacao) {
    const antigos = d.xi.filter(Boolean);
    const slots = FORMACOES[formacao];
    const novo = new Array(slots.length).fill(null);
    const sobra = [];
    // primeiro quem tem vaga exata, depois as vizinhas
    for (const passo of [0, 1]) {
      for (const j of (passo === 0 ? antigos : sobra.splice(0))) {
        let alvo = -1, melhorPen = 99;
        slots.forEach((s, i) => {
          if (novo[i]) return;
          const p = penalidade(s.pos, j.pos);
          if (p === null || (passo === 0 && p > 0)) return;
          if (p < melhorPen) { melhorPen = p; alvo = i; }
        });
        if (alvo >= 0) novo[alvo] = j; else if (passo === 0) sobra.push(j);
      }
    }
    const fora = antigos.filter((j) => !novo.includes(j));
    if (fora.length) return false; // alguém ficaria sem vaga: não troca
    d.formacao = formacao;
    d.xi = novo;
    return true;
  }

  // ------------------------------------------------------------ campanha
  // Participante de torneio: { id, time, ano, forca, formacao } (o XI é recalculado quando precisa).
  function participante(timeId, ano) {
    const formacao = formacaoDoTime(timeId, ano);
    const xi = melhorXI(elenco(timeId, ano), formacao);
    return { id: timeId + '@' + ano, time: timeId, ano, formacao, forca: forcaXI(xi, formacao, { semEntrosamento: true }) };
  }
  function xiDe(p) { return p.time === 'eu' ? null : melhorXI(elenco(p.time, p.ano), p.formacao); }

  function escolhePorForca(r, lista, n, peso) {
    const resto = lista.slice(), out = [];
    while (out.length < n && resto.length) {
      const x = r.weighted(resto, peso);
      out.push(x);
      resto.splice(resto.indexOf(x), 1);
    }
    return out;
  }

  function novaCampanha({ modo, seed, formacao, xi, meuTime }) {
    const m = MODOS[modo];
    const r = rng(seed + ':torneio');
    const eu = { id: 'eu', time: 'eu', ano: ANO_ATUAL, formacao, forca: forcaXI(xi, formacao) };
    const camp = {
      v: VERSAO_SAVE, modo, seed, formacao, xi, meuTime, eu, total: JOGOS_FORMATO[m.formato],
      formato: m.formato, times: { eu }, jogos: [], fase: null, rodada: 0, fim: false, campeao: false,
      eliminadoEm: null, posicao: null, tabela: {}, grupos: null, jogados: [], chave: null, faseMata: 0,
    };
    const add = (t, ano) => { const p = participante(t.id, ano); camp.times[p.id] = p; return p.id; };
    const anoAleatorio = (t) => r.pick(anosDe(t));
    if (m.formato === 'grupos') {
      // Copa: as outras 47 seleções; Mistura: 47 times de qualquer competição (os fortes saem mais)
      const outras = modo === 'copa' ? r.shuffle(SELECOES) : escolhePorForca(r, SELECOES.concat(todosClubes()), 47, (t) => Math.pow(SORTEIO_PESO.mistura, t.forca - 70));
      const ids = r.shuffle(outras.slice(0, 47)).map((t) => add(t, anoAleatorio(t)));
      const todos = ['eu'].concat(ids);
      camp.grupos = [];
      for (let g = 0; g < 12; g++) camp.grupos.push(todos.slice(g * 4, g * 4 + 4));
      camp.fase = 'grupos';
      camp.rodadas = camp.grupos.map((g) => bergerRodadas(g));
    } else if (m.formato === 'suico') {
      const escolhidos = escolhePorForca(r, clubesEuropa(), 35, (t) => Math.pow(SORTEIO_PESO.champions, t.forca - 70));
      escolhidos.forEach((t) => add(t, anoAleatorio(t)));
      camp.fase = 'liga';
    } else {
      const liga = LIGAS.find((l) => l.id === m.liga);
      // 20 times (o jogador + 19); ligas de 18 clubes (Bundesliga, Ligue 1) ficam com 18 (o jogador + 17):
      // número par, para todos jogarem toda rodada
      let n = Math.min(19, liga.clubes.length);
      if ((n + 1) % 2) n--;
      const escolhidos = r.shuffle(liga.clubes).slice(0, n);
      escolhidos.forEach((t) => add(t, anoAleatorio(t)));
      camp.fase = 'liga';
    }
    camp.nRodadas = RODADAS_INICIAIS[m.formato];
    Object.keys(camp.times).forEach((id) => { camp.tabela[id] = { j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, pts: 0 }; });
    if (m.formato !== 'grupos') camp.rodadas = suicoRodadas(Object.keys(camp.times), camp.nRodadas, rng(seed + ':pareamento'));
    return camp;
  }

  // Rodízio clássico (cada um contra todos uma vez): n-1 rodadas de n/2 jogos.
  function bergerRodadas(ids) {
    const n = ids.length, lista = ids.slice(), rodadas = [];
    for (let k = 0; k < n - 1; k++) {
      const jogos = [];
      for (let i = 0; i < n / 2; i++) jogos.push([lista[i], lista[n - 1 - i]]);
      rodadas.push(jogos);
      lista.splice(1, 0, lista.pop());
    }
    return rodadas;
  }
  // Pareamento sem repetir adversário (tipo "sistema suíço" sorteado).
  function suicoRodadas(ids, n, r) {
    const ja = new Set();
    const par = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
    const rodadas = [];
    for (let k = 0; k < n; k++) {
      let jogos = null;
      for (let tent = 0; tent < 300 && !jogos; tent++) {
        const resto = r.shuffle(ids), out = [];
        let ok = true;
        while (resto.length) {
          const a = resto.shift();
          const idx = resto.findIndex((b) => !ja.has(par(a, b)));
          if (idx < 0) { ok = false; break; }
          out.push([a, resto.splice(idx, 1)[0]]);
        }
        if (ok) jogos = out;
      }
      if (!jogos) { const s = r.shuffle(ids); jogos = []; for (let i = 0; i < s.length; i += 2) jogos.push([s[i], s[i + 1]]); }
      jogos.forEach(([a, b]) => ja.add(par(a, b)));
      rodadas.push(jogos);
    }
    return rodadas;
  }

  // O próximo jogo do jogador: { adv, fase, rodada, mataMata } ou null se a campanha acabou.
  function proximoJogo(c) {
    if (c.fim) return null;
    if (c.fase === 'grupos' || c.fase === 'liga') {
      const rodada = c.formato === 'grupos' ? c.rodadas[0][c.rodada] : c.rodadas[c.rodada];
      const jogo = rodada.find(([a, b]) => a === 'eu' || b === 'eu');
      return { adv: jogo[0] === 'eu' ? jogo[1] : jogo[0], fase: c.fase, rodada: c.rodada, mataMata: false };
    }
    const confronto = c.chave.find(([a, b]) => a === 'eu' || b === 'eu');
    return { adv: confronto[0] === 'eu' ? confronto[1] : confronto[0], fase: FASES_MATA[c.formato][c.faseMata], rodada: c.faseMata, mataMata: true };
  }

  // Equipe pronta para simular: { forca, xi, formacao }.
  function equipe(c, id) {
    const p = c.times[id];
    if (id === 'eu') return { forca: p.forca, xi: numerar(c.xi, c.formacao), formacao: c.formacao };
    return { forca: p.forca, xi: xiDe(p), formacao: p.formacao };
  }
  const semente = (c, extra) => c.seed + ':' + c.fase + ':' + c.rodada + ':' + c.faseMata + ':' + extra;
  // Simula o próximo jogo do jogador (não grava nada; registrar() grava).
  function jogarProximo(c) {
    const pj = proximoJogo(c);
    if (!pj) return null;
    const res = simularPartida(equipe(c, 'eu'), equipe(c, pj.adv), semente(c, 'meu'), { mataMata: pj.mataMata });
    return Object.assign({ adv: pj.adv, fase: pj.fase, rodada: pj.rodada, mataMata: pj.mataMata }, res);
  }

  function anotar(tab, a, b, ga, gb) {
    const ta = tab[a], tb = tab[b];
    ta.j++; tb.j++; ta.gp += ga; ta.gc += gb; tb.gp += gb; tb.gc += ga;
    if (ga > gb) { ta.v++; tb.d++; ta.pts += 3; } else if (ga < gb) { tb.v++; ta.d++; tb.pts += 3; } else { ta.e++; tb.e++; ta.pts++; tb.pts++; }
  }
  function classificacao(c, ids) {
    return ids.slice().sort((x, y) => {
      const a = c.tabela[x], b = c.tabela[y];
      return b.pts - a.pts || b.v - a.v || (b.gp - b.gc) - (a.gp - a.gc) || b.gp - a.gp || c.times[y].forca.geral - c.times[x].forca.geral;
    });
  }
  // Vencedor de um jogo de mata-mata entre outros times (pênaltis: um pouco a favor do mais forte).
  function vencedorRapido(c, a, b, r) {
    const [ga, gb] = placar(c.times[a].forca, c.times[b].forca, r, MODELO.kOutros);
    if (ga !== gb) return { venc: ga > gb ? a : b, ga, gb };
    const pa = 0.5 + (c.times[a].forca.geral - c.times[b].forca.geral) * 0.01;
    return { venc: r() < pa ? a : b, ga, gb, pen: true };
  }

  // Grava o resultado do jogo do jogador, simula os outros jogos da rodada e avança a campanha.
  function registrar(c, res) {
    const r = rng(semente(c, 'outros'));
    const pen = res.penaltis;
    const venceu = res.ga > res.gb || (pen && pen.a > pen.b);
    const empatou = res.ga === res.gb && !pen;
    c.jogos.push({ adv: res.adv, fase: res.fase, ga: res.ga, gb: res.gb, pen: pen ? [pen.a, pen.b] : null, res: venceu ? 'V' : empatou ? 'E' : 'D' });
    if (c.fase === 'grupos' || c.fase === 'liga') {
      const rodadas = c.formato === 'grupos' ? c.rodadas.map((g) => g[c.rodada]) : [c.rodadas[c.rodada]];
      rodadas.flat().forEach(([a, b]) => {
        if (a === 'eu' || b === 'eu') {
          const meuA = a === 'eu';
          anotar(c.tabela, a, b, meuA ? res.ga : res.gb, meuA ? res.gb : res.ga);
        } else {
          const [ga, gb] = placar(c.times[a].forca, c.times[b].forca, r, MODELO.kOutros);
          anotar(c.tabela, a, b, ga, gb);
          c.jogados.push({ a, b, ga, gb, fase: c.fase, rodada: c.rodada });
        }
      });
      c.rodada++;
      if (c.rodada >= c.nRodadas) fimDaFaseInicial(c);
    } else {
      // mata-mata: simula os outros confrontos da fase e monta a próxima
      const vencedores = c.chave.map(([a, b]) => {
        if (a === 'eu' || b === 'eu') return venceu ? 'eu' : (a === 'eu' ? b : a);
        const v = vencedorRapido(c, a, b, r);
        c.jogados.push({ a, b, ga: v.ga, gb: v.gb, pen: !!v.pen, venc: v.venc, fase: FASES_MATA[c.formato][c.faseMata] });
        return v.venc;
      });
      if (!venceu) { c.fim = true; c.eliminadoEm = FASES_MATA[c.formato][c.faseMata]; return c; }
      c.faseMata++;
      if (c.faseMata >= FASES_MATA[c.formato].length) { c.fim = true; c.campeao = true; return c; }
      c.chave = [];
      for (let i = 0; i < vencedores.length; i += 2) c.chave.push([vencedores[i], vencedores[i + 1]]);
    }
    return c;
  }

  function fimDaFaseInicial(c) {
    if (c.formato === 'liga') {
      const ordem = classificacao(c, Object.keys(c.times));
      c.posicao = ordem.indexOf('eu') + 1;
      c.campeao = c.posicao === 1;
      c.fim = true;
      return;
    }
    if (c.formato === 'grupos') {
      // 12 grupos de 4: passam os 2 primeiros e os 8 melhores terceiros (32). Os 32 viram cabeças de
      // chave (1ºs, depois 2ºs, depois 3ºs; desempate pela campanha) e a chave é a tradicional
      // (1 x 32, 16 x 17...), evitando dois times do mesmo grupo logo nos 16-avos.
      const ordens = c.grupos.map((g) => classificacao(c, g));
      const grupoDe = {};
      ordens.forEach((o, g) => o.forEach((id) => { grupoDe[id] = g; }));
      const campanha = (a, b) => {
        const x = c.tabela[a], y = c.tabela[b];
        return y.pts - x.pts || (y.gp - y.gc) - (x.gp - x.gc) || y.gp - x.gp || c.times[b].forca.geral - c.times[a].forca.geral;
      };
      const terceiros = ordens.map((o) => o[2]).sort(campanha).slice(0, 8);
      const classificados = [0, 1].flatMap((pos) => ordens.map((o) => o[pos]).sort(campanha)).concat(terceiros);
      c.posicao = ordens[0].indexOf('eu') + 1;
      if (!classificados.includes('eu')) { c.fim = true; c.eliminadoEm = 'grupos'; return; }
      const ordem = ordemChave(32);
      const jogos = [];
      for (let i = 0; i < 32; i += 2) jogos.push([classificados[ordem[i] - 1], classificados[ordem[i + 1] - 1]]);
      for (let i = 0; i < jogos.length; i++) { // mesmo grupo: troca o adversário com o do jogo vizinho
        if (grupoDe[jogos[i][0]] !== grupoDe[jogos[i][1]]) continue;
        const k = i % 2 === 0 ? i + 1 : i - 1;
        [jogos[i][1], jogos[k][1]] = [jogos[k][1], jogos[i][1]];
      }
      c.chave = jogos;
    } else {
      // fase de liga com 36: passam 16, cruzamento 1x16, 8x9... na ordem da chave
      const ordem = classificacao(c, Object.keys(c.times));
      c.posicao = ordem.indexOf('eu') + 1;
      if (c.posicao > 16) { c.fim = true; c.eliminadoEm = 'liga'; return; }
      const s = (n) => ordem[n - 1];
      c.chave = [[s(1), s(16)], [s(8), s(9)], [s(5), s(12)], [s(4), s(13)], [s(3), s(14)], [s(6), s(11)], [s(7), s(10)], [s(2), s(15)]];
    }
    c.fase = 'mata';
    c.faseMata = 0;
  }
  // Ordem tradicional da chave: para 8, [1, 8, 4, 5, 2, 7, 3, 6] (os cabeças só se cruzam na final).
  function ordemChave(n) {
    if (n === 1) return [1];
    return ordemChave(n / 2).flatMap((s) => [s, n + 1 - s]);
  }

  // Resumo para a tela final e para os recordes.
  function resumo(c) {
    const v = c.jogos.filter((j) => j.res === 'V').length;
    const e = c.jogos.filter((j) => j.res === 'E').length;
    const d = c.jogos.filter((j) => j.res === 'D').length;
    const gp = c.jogos.reduce((s, j) => s + j.ga, 0), gc = c.jogos.reduce((s, j) => s + j.gb, 0);
    const total = totalJogos(c);
    const perfeito = c.jogos.length === total && v === total;
    return { v, e, d, gp, gc, jogos: c.jogos.length, perfeito, campeao: c.campeao, posicao: c.posicao, eliminadoEm: c.eliminadoEm, fim: c.fim };
  }
  // Moedas ganhas na campanha.
  // Título (e passar da fase inicial) vale mais nos modos em que é mais difícil ganhar (Champions League ~8%, Mistura ~12%,
  // Copa ~15%, ligas 18-33%: tools/balancear.js), para nenhum modo render menos que os outros.
  const PREMIO = { vitoria: 30, empate: 10, gol: 3, titulo: 300, tituloModo: { champions: 700, mistura: 500, copa: 450 }, classificou: { champions: 150, mistura: 60, copa: 60 }, perfeito: 700, vice: 120, desafio: 80, dificil: 1.5 };
  function premio(c, opts = {}) {
    const s = resumo(c);
    let m = s.v * PREMIO.vitoria + s.e * PREMIO.empate + s.gp * PREMIO.gol;
    if (s.campeao) m += PREMIO.tituloModo[c.modo] || PREMIO.titulo;
    if (c.nRodadas && c.jogos.length > c.nRodadas) m += PREMIO.classificou[c.modo] || 0; // passou da fase inicial
    if (s.perfeito) m += PREMIO.perfeito;
    if (!s.campeao && (c.eliminadoEm === 'f' || (c.formato === 'liga' && c.posicao === 2))) m += PREMIO.vice;
    if (opts.desafio) m += PREMIO.desafio;
    if (opts.dificil) m = Math.round(m * PREMIO.dificil); // modo difícil: notas escondidas no draft
    return m;
  }

  // ------------------------------------------------------------ Desafio do Dia
  // Mesmo sorteio para todo mundo no mesmo dia (data local do aparelho, AAAA-MM-DD).
  const ORDEM_DIARIA = ['copa', 'brasileirao', 'champions', 'premier', 'laliga', 'mistura', 'seriea', 'bundesliga', 'ligue1'];
  function diaNumero(dataStr) { return Math.floor(Date.UTC(+dataStr.slice(0, 4), +dataStr.slice(5, 7) - 1, +dataStr.slice(8, 10)) / 86400000); }
  const modoDoDia = (dataStr) => ORDEM_DIARIA[diaNumero(dataStr) % ORDEM_DIARIA.length];
  const sementeDoDia = (dataStr) => hash('desafio:' + dataStr);

  const Core = {
    hash, rng, clamp, POS, LINHA, FORMACOES, NUMEROS_VAGA, numerar, penalidade, TIMES, time, nomeTime, SELECOES, LIGAS, LIGA_IDS,
    anosDe, temReal, rotuloAno, forcaNoAno, elenco, melhorXI, formacaoDoTime, forcaXI, efetiva,
    entrosamento, MODELO, mediaGols, placar, simularPartida, MODOS, JOGOS_FORMATO, totalJogos, FASES_MATA, poolDraft, novoDraft,
    sortear, jogadoresSorteio, vagasPara, escolher, draftCompleto, trocarFormacao, participante, xiDe,
    novaCampanha, proximoJogo, equipe, jogarProximo, registrar, classificacao, resumo, PREMIO, premio,
    modoDoDia, sementeDoDia, ANO_ATUAL, VERSAO_SAVE, SORTEIO_PESO,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
  else root.DezCore = Core;
})(typeof window !== 'undefined' ? window : this);

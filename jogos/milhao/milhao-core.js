/* Jogo do Milhão do Futebol · regras puras (sem DOM), iguais às do app original
   (apps/milhao-do-futebol/app-original-index.tsx). Testes: node tools/testar-milhao.js */
(function (raiz, fabrica) {
  'use strict';
  const api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.MilhaoCore = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PREMIOS = [1000, 2000, 3000, 4000, 5000, 10000, 20000, 30000, 40000, 50000, 100000, 200000, 300000, 400000, 500000, 1000000];
  const NIVEL = ['facil', 'facil', 'facil', 'facil', 'medio', 'medio', 'medio', 'medio', 'dificil', 'dificil', 'dificil', 'muito_dificil', 'muito_dificil', 'muito_dificil', 'impossivel', 'impossivel'];
  // "zebra": de vez em quando uma pergunta mais difícil cai numa rodada fácil (como no app)
  const ZEBRAS = {
    facil: { prob: 0.12, niveis: ['dificil', 'muito_dificil'] },
    medio: { prob: 0.08, niveis: ['dificil', 'muito_dificil'] },
    dificil: { prob: 0.07, niveis: ['impossivel'] },
    muito_dificil: { prob: 0.07, niveis: ['impossivel'] },
  };
  const MODOS = [
    { id: 'brasileiro', nome: 'Futebol brasileiro' },
    { id: 'europeu', nome: 'Futebol europeu' },
    { id: 'copa', nome: 'Copa do Mundo' },
    { id: 'escudos', nome: 'Só escudos', exclusivo: true },
  ];
  const TEMPO = 45;
  const DRIBLES = 2;

  function embaralhar(arr, r) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  function filtro(modos) {
    const soEscudos = modos.indexOf('escudos') >= 0;
    const efetivos = soEscudos ? ['brasileiro', 'europeu', 'copa', 'mix'] : (modos.length ? modos : ['mix']);
    return (p) => p.modo.some((m) => efetivos.indexOf(m) >= 0) && (!soEscudos || p.tipo === 'escudo');
  }

  // 16 perguntas, uma por degrau, sem repetir
  function gerarLista(banco, modos, r) {
    r = r || Math.random;
    const ok = filtro(modos), usados = {};
    const lista = [];
    for (let i = 0; i < 16; i++) {
      const base = NIVEL[i], z = ZEBRAS[base];
      let nivel = base;
      if (z && r() < z.prob) nivel = z.niveis[Math.floor(r() * z.niveis.length)];
      let pool = (banco[nivel] || []).filter((p) => ok(p) && !usados[p.id]);
      if (!pool.length) pool = (banco[base] || []).filter((p) => ok(p) && !usados[p.id]);
      if (!pool.length) pool = Object.keys(banco).reduce((a, k) => a.concat(banco[k].filter((p) => ok(p) && !usados[p.id])), []);
      if (!pool.length) pool = (banco[base] || []).filter((p) => !usados[p.id]);
      const p = pool[Math.floor(r() * pool.length)];
      usados[p.id] = 1;
      lista.push(p);
    }
    return lista;
  }

  // driblar: outra pergunta do mesmo nível, nunca uma já usada ou pulada
  function substituta(banco, modos, nivelIdx, jaUsados, r) {
    r = r || Math.random;
    const ok = filtro(modos), nivel = NIVEL[nivelIdx];
    let pool = (banco[nivel] || []).filter((p) => ok(p) && jaUsados.indexOf(p.id) < 0);
    if (!pool.length) pool = Object.keys(banco).reduce((a, k) => a.concat(banco[k].filter((p) => ok(p) && jaUsados.indexOf(p.id) < 0)), []);
    return pool.length ? pool[Math.floor(r() * pool.length)] : null;
  }

  // valores de cada degrau i (0 a 15)
  const premioAcertar = (i) => PREMIOS[i];
  const premioParar = (i) => (i > 0 ? PREMIOS[i - 1] : 0);
  // errou: leva metade do que levaria se parasse; no milhão, perde tudo
  const premioErrar = (i) => (i === 0 || i === 15 ? 0 : PREMIOS[i - 1] / 2);

  // cartões: quatro cartões virados com 0, 1, 2 e 3; o escolhido diz quantas erradas saem
  function cartoes(correta, escolhido, r) {
    r = r || Math.random;
    const valores = embaralhar([0, 1, 2, 3], r);
    const qtd = valores[escolhido];
    const erradas = embaralhar([0, 1, 2, 3].filter((x) => x !== correta), r).slice(0, qtd);
    return { valores, qtd, eliminadas: erradas };
  }

  // torcida: acerta em 75% das vezes (a certa com 35% a 65%); quando erra, a errada lidera por
  // pouco (2 a 6 pontos). Os votos somam 100.
  function torcida(correta, r) {
    r = r || Math.random;
    const v = [0, 0, 0, 0];
    const erradas = embaralhar([0, 1, 2, 3].filter((x) => x !== correta), r);
    if (r() >= 0.25) {
      v[correta] = 35 + Math.floor(r() * 31);
      v[erradas[0]] = 15 + Math.floor(r() * 15);
      v[erradas[1]] = 5 + Math.floor(r() * 15);
      v[erradas[2]] = 5 + Math.floor(r() * 10);
    } else {
      v[erradas[0]] = 35 + Math.floor(r() * 10);
      v[correta] = v[erradas[0]] - (2 + Math.floor(r() * 5));
      v[erradas[1]] = 5 + Math.floor(r() * 15);
      v[erradas[2]] = 5 + Math.floor(r() * 10);
    }
    // normaliza para 100 sem mudar quem lidera
    const s = v.reduce((a, b) => a + b, 0);
    const n = v.map((x) => Math.round(x * 100 / s));
    const dif = 100 - n.reduce((a, b) => a + b, 0);
    n[n.indexOf(Math.max.apply(null, n))] += dif;
    return n;
  }

  function moeda(v) {
    if (v >= 1000000) return 'R$ 1 milhão';
    if (v >= 1000) return 'R$ ' + (v / 1000).toLocaleString('pt-BR') + ' mil';
    return 'R$ ' + v.toLocaleString('pt-BR');
  }

  return { PREMIOS, NIVEL, MODOS, TEMPO, DRIBLES, embaralhar, gerarLista, substituta, premioAcertar, premioParar, premioErrar, cartoes, torcida, moeda, filtro };
});

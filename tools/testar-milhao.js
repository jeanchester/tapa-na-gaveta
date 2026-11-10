// Testes das regras do Jogo do Milhão: node tools/testar-milhao.js
const path = require('path');
const M = require('../jogos/milhao/milhao-core.js');
const banco = require(path.join(__dirname, '../jogos/milhao/perguntas.json'));

let falhas = 0, total = 0;
const ok = (c, m) => { total++; if (!c) { falhas++; console.log('  FALHOU: ' + m); } };
let semente = 1;
const r = () => { semente = (semente * 16807) % 2147483647; return (semente - 1) / 2147483646; };

ok(M.PREMIOS.length === 16 && M.PREMIOS[15] === 1000000, '16 degraus até o milhão');
ok(M.premioErrar(0) === 0 && M.premioErrar(1) === 500 && M.premioErrar(10) === 25000 && M.premioErrar(15) === 0, 'errar: metade do que levaria ao parar; no milhão, nada');
ok(M.premioParar(0) === 0 && M.premioParar(15) === 500000, 'parar leva o degrau anterior');
ok(M.moeda(3000) === 'R$ 3 mil' && M.moeda(1000000) === 'R$ 1 milhão' && M.moeda(500) === 'R$ 500', 'valores por extenso');

for (const modos of [['brasileiro'], ['europeu'], ['copa'], ['escudos'], ['brasileiro', 'copa'], []]) {
  for (let k = 0; k < 200; k++) {
    const l = M.gerarLista(banco, modos, r);
    ok(l.length === 16 && new Set(l.map((p) => p.id)).size === 16, 'lista sem repetição (' + modos + ')');
    if (modos[0] === 'escudos') ok(l.every((p) => p.tipo === 'escudo'), 'modo escudos só tem escudos');
    else if (modos.length) ok(l.every((p) => p.modo.some((m) => modos.indexOf(m) >= 0)), 'perguntas do modo escolhido (' + modos + ')');
  }
}

let acertos = 0;
for (let k = 0; k < 4000; k++) {
  const correta = k % 4, v = M.torcida(correta, r);
  ok(v.reduce((a, b) => a + b, 0) === 100, 'votos da torcida somam 100');
  if (v.indexOf(Math.max.apply(null, v)) === correta) acertos++;
}
ok(acertos / 4000 > 0.7 && acertos / 4000 < 0.8, 'torcida acerta perto de 75% das vezes: ' + (acertos / 40).toFixed(1) + '%');

for (let k = 0; k < 500; k++) {
  const correta = k % 4, c = M.cartoes(correta, k % 4, r);
  ok(c.eliminadas.length === c.qtd && c.eliminadas.indexOf(correta) < 0, 'cartões nunca eliminam a certa');
  ok(c.valores.slice().sort().join() === '0,1,2,3', 'os quatro cartões têm 0, 1, 2 e 3');
}
const l = M.gerarLista(banco, ['brasileiro'], r);
const s = M.substituta(banco, ['brasileiro'], 3, l.map((p) => p.id), r);
ok(s && l.every((p) => p.id !== s.id), 'driblar traz uma pergunta inédita');
// toda pergunta tem 4 alternativas e a certa existe; escudos têm arquivo
const fs = require('fs');
Object.keys(banco).forEach((n) => banco[n].forEach((p) => {
  ok(p.alternativas.length === 4 && p.correta >= 0 && p.correta < 4, 'pergunta ' + p.id + ' bem formada');
  if (p.tipo === 'escudo') ok(fs.existsSync(path.join(__dirname, '../midia/escudos/' + p.escudo + '.png')), 'escudo da pergunta ' + p.id + ' existe: ' + p.escudo);
}));

console.log(`${total - falhas}/${total} conferências passaram`);
process.exit(falhas ? 1 : 0);

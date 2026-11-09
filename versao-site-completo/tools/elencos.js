// Gera a reserva publicada dos elencos: node tools/elencos.js
// Entrada: dados/times-voce-escala.json + dados/elencos.json + dados/elencos_copa_2026.json
// (atualize os dois últimos baixando do GitHub do Julio; ver shared/elencos.js, URLS)
// Saída: dados/elencos-escalacao.json (o que a aba "Monte sua escalação" usa sem rede)
const fs = require('fs');
const path = require('path');
const E = require('../shared/elencos.js');

const raiz = path.resolve(__dirname, '..');
const ler = (f) => JSON.parse(fs.readFileSync(path.join(raiz, f), 'utf8'));
const existentes = {};
fs.readdirSync(path.join(raiz, 'midia/escudos')).forEach((f) => { existentes[f.replace(/\.png$/, '')] = 1; });
const out = E.converter(ler('dados/times-voce-escala.json'), ler('dados/elencos.json'), ler('dados/elencos_copa_2026.json'), existentes);
out.escudos = Object.keys(existentes);
fs.writeFileSync(path.join(raiz, 'dados/elencos-escalacao.json'), JSON.stringify(out));
const semEscudo = out.times.filter((t) => !t.escudo).map((t) => t.nome);
const porGrupo = {};
out.times.forEach((t) => { porGrupo[t.grupo] = (porGrupo[t.grupo] || 0) + 1; });
console.log(`dados/elencos-escalacao.json: ${out.times.length} times ${JSON.stringify(porGrupo)}, ${(fs.statSync(path.join(raiz, 'dados/elencos-escalacao.json')).size / 1024).toFixed(0)} KB`);
console.log('sem escudo:', semEscudo.join(', ') || 'nenhum');
const poucos = out.times.filter((t) => ['G', 'D', 'M', 'A'].some((p) => !t.jogadores.some((j) => j[1] === p))).map((t) => t.nome);
if (poucos.length) console.log('sem alguma posição:', poucos.join(', '));

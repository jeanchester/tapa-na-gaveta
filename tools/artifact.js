// Monta dist-artifact/: o site em forma de Artifact do claude.ai (prévia para mostrar a outras pessoas).
// Uso: node tools/build.js --release && node tools/artifact.js [https://claude.ai/artifact/ID]
// Diferenças em relação ao site publicado (todas porque o Artifact roda num quadro fechado):
// - index.html sem <html>/<head>/<body> (o Artifact põe os seus) e com TNG_ARTIFACT, que liga o
//   modo "sem rede de fora": reservas em vez da ESPN e do GitHub, rotas simples (#jogos-milhao),
//   imagem salva pela própria tela (download e menu de compartilhar são bloqueados lá);
// - sem imagens de prévia, páginas de entrada e sitemap (não servem dentro do Artifact);
// - Draft com uma seleção de estádios (limite de 511 arquivos por versão do Artifact).
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..');
const dist = path.join(raiz, 'dist');
const saida = path.join(raiz, 'dist-artifact');
const url = process.argv[2] || '';
if (!fs.existsSync(path.join(dist, 'index.html'))) throw new Error('rode antes: node tools/build.js --release');

fs.rmSync(saida, { recursive: true, force: true });
const FORA = ['midia/og', 'simulador', 'escalacao', 'jogar', 'estatisticas', 'jogos/index.html', 'sitemap.xml', 'robots.txt'];
fs.cpSync(dist, saida, { recursive: true, filter: (src) => !FORA.some((f) => path.relative(dist, src).split(path.sep).join('/') === f) });

// estádios do Draft: todos os do Brasil e da Copa, 8 de cada liga europeia e os gratuitos
const arqEst = path.join(saida, 'jogos/draft/shared/estadios.js');
const fonte = fs.readFileSync(arqEst, 'utf8');
const ctx = {}; new Function('window', fonte)(ctx);
const GRATIS = ['brinco', 'mexico_city'];
const porLiga = {};
const ficam = ctx.DEZ_ESTADIOS.filter((e) => {
  if (GRATIS.includes(e.id) || e.liga === 'brasil' || e.liga === 'copa') return true;
  porLiga[e.liga] = (porLiga[e.liga] || 0) + 1;
  return porLiga[e.liga] <= 8;
});
const ids = new Set(ficam.map((e) => e.id));
fs.writeFileSync(arqEst, '// Seleção para o Artifact (tools/artifact.js).\nwindow.DEZ_ESTADIOS = ' + JSON.stringify(ficam) + ';\n');
for (const sub of ['', 'mini']) {
  const pasta = path.join(saida, 'jogos/draft/shared/estadios', sub);
  fs.readdirSync(pasta).forEach((f) => { if (f.endsWith('.webp') && !ids.has(f.replace('.webp', ''))) fs.rmSync(path.join(pasta, f)); });
}

// o Artifact não serve .m4a: o mesmo arquivo (contêiner MP4) vai como .mp4
const audio = path.join(saida, 'jogos/draft/shared/audio');
fs.renameSync(path.join(audio, 'musica_menu.m4a'), path.join(audio, 'musica_menu.mp4'));
const serv = path.join(saida, 'jogos/draft/app/servicos.js');
const sv = fs.readFileSync(serv, 'utf8');
if (!sv.includes("'../shared/audio/musica_menu.m4a'")) throw new Error('servicos.js do Draft mudou: não achei a música do menu');
fs.writeFileSync(serv, sv.replace("'../shared/audio/musica_menu.m4a'", "'../shared/audio/musica_menu.mp4'"));

// página: sem as tags de documento, com o nome do Artifact e o modo Artifact ligado
let html = fs.readFileSync(path.join(saida, 'index.html'), 'utf8');
const corpo = html.slice(html.indexOf('<body>') + 6, html.lastIndexOf('</body>'));
const cabeca = html.slice(html.indexOf('<head>') + 6, html.indexOf('</head>'))
  .replace(/<title>[^<]*<\/title>/, '')
  .replace(/\s*<meta (name="viewport"|charset|property="og|name="twitter|name="description")[^>]*>/g, '')
  .replace(/\s*<link rel="canonical"[^>]*>/g, '');
html = '<title>Tapa na Gaveta</title>\n' + cabeca.trim() + '\n<script>window.TNG_ARTIFACT = true;' + (url ? ' window.TNG_ARTIFACT_URL = ' + JSON.stringify(url) + ';' : '') + '</script>\n' + corpo.trim() + '\n';
if (/<\/?(html|head|body)\b/i.test(html)) throw new Error('sobrou tag de documento no index.html do Artifact');
fs.writeFileSync(path.join(saida, 'index.html'), html);

const lista = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else lista.push(path.relative(saida, p).split(path.sep).join('/'));
});
walk(saida);
const outros = lista.filter((f) => f !== 'index.html').sort();
fs.writeFileSync(path.join(saida, '..', 'tools', 'saida', 'artifact-arquivos.json'), JSON.stringify(outros));
const bytes = lista.reduce((s, f) => s + fs.statSync(path.join(saida, f)).size, 0);
console.log(`dist-artifact/: ${lista.length} arquivos (limite 511), ${(bytes / 1048576).toFixed(1)} MB, ${ficam.length} estádios do Draft${url ? ', link ' + url : ''}`);
if (lista.length > 511) throw new Error('arquivos demais para um Artifact');

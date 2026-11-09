// Monta dist/ (o que vai para o ar).
//   node tools/build.js                                   desenvolvimento (faixa de erro ligada)
//   node tools/build.js --release --site https://dominio  versão publicada
// --release grava TNG_RELEASE (site, Milhão, Fast) e DEZ_RELEASE (Draft): some a faixa de erro.
// --site    endereço definitivo: Open Graph com URL absoluta, sitemap.xml e robots.txt.
// Páginas de entrada (tools/paginas.json + uma por time): título, descrição e imagem certos para o
// WhatsApp, e um redirecionamento para a rota do site (os parâmetros do link vão junto).
// Material de consulta (referencias/, apps/, ferramentas/, tapa-na-gaveta-midia/, docs/, tools/) não é publicado.
const fs = require('fs');
const path = require('path');

const raiz = path.resolve(__dirname, '..');
const dist = path.join(raiz, 'dist');
const args = process.argv.slice(2);
const release = args.includes('--release');
const iSite = args.indexOf('--site');
const site = iSite >= 0 ? String(args[iSite + 1] || '').replace(/\/+$/, '') + '/' : '';
if (iSite >= 0 && !/^https:\/\//.test(site)) throw new Error('--site precisa de um endereço https://');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
const PUBLICAR = [
  'index.html', 'app', 'shared',
  'dados/brasileirao-2026.json', 'dados/elencos-escalacao.json', 'dados/times-voce-escala.json',
  'midia/escudos', 'midia/icones', 'midia/og', 'jogos',
];
for (const item of PUBLICAR) {
  const de = path.join(raiz, item);
  if (!fs.existsSync(de)) throw new Error('falta ' + item);
  fs.cpSync(de, path.join(dist, item), { recursive: true });
}
// JSON publicados sem espaços (o retrato da ESPN é gravado indentado para ser legível no repositório)
for (const f of ['dados/brasileirao-2026.json', 'dados/elencos-escalacao.json', 'dados/times-voce-escala.json', 'shared/regras-brasileirao-2026.json', 'jogos/milhao/perguntas.json']) {
  const p = path.join(dist, f);
  fs.writeFileSync(p, JSON.stringify(JSON.parse(fs.readFileSync(p, 'utf8'))));
}
const ler = (f) => fs.readFileSync(path.join(dist, f), 'utf8');
const gravar = (f, s) => { fs.mkdirSync(path.dirname(path.join(dist, f)), { recursive: true }); fs.writeFileSync(path.join(dist, f), s); };
function marcar(f, antes, marca) {
  const html = ler(f);
  if (!html.includes(antes)) throw new Error(f + ' mudou: não achei onde marcar a versão publicada');
  gravar(f, html.replace(antes, '<script>' + marca + '</script>\n  ' + antes));
}
if (release) {
  marcar('index.html', '<script src="app/app.js">', 'window.TNG_RELEASE = true;');
  marcar('jogos/milhao/index.html', '<script src="milhao-core.js">', 'window.TNG_RELEASE = true;');
  marcar('jogos/fast/index.html', '<script src="../../shared/vendor/', 'window.TNG_RELEASE = true;');
  marcar('jogos/draft/app/index.html', '<script src="web.js">', 'window.DEZ_RELEASE = true;');
}

// ------------------------------------------------------------------ Open Graph e páginas de entrada
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const abs = (p) => (site ? site + p : p);
const { paginas } = JSON.parse(fs.readFileSync(path.join(raiz, 'tools/paginas.json'), 'utf8'));
const liga = JSON.parse(fs.readFileSync(path.join(raiz, 'dados/brasileirao-2026.json'), 'utf8'));
const CURTO = { athletico: 'Athletico', atleticomg: 'Atlético-MG', bragantino: 'Bragantino', sp: 'São Paulo', vasco: 'Vasco' };
liga.times.filter((t) => t.escudo).forEach((t) => {
  const nome = CURTO[t.escudo] || t.nome, de = t.escudo === 'chapecoense' ? 'da' : 'do';
  paginas.push({ caminho: 'simulador/' + t.escudo + '/', rota: '#/simulador/' + t.escudo, og: 'simulador-' + t.escudo,
    titulo: 'Simulador ' + de + ' ' + nome + ' no Brasileirão 2026',
    descricao: 'O que falta para ' + (de === 'da' ? 'a ' : 'o ') + nome + ': chute os placares, veja as chances de título, Libertadores e rebaixamento e o que o time precisa.' });
});

function meta(p) {
  const img = abs('midia/og/' + p.og + '.png'), url = abs(p.caminho);
  return '<title>' + esc(p.titulo) + ' · Tapa na Gaveta</title>\n' +
    '  <meta name="description" content="' + esc(p.descricao) + '">\n' +
    (site ? '  <link rel="canonical" href="' + esc(url) + '">\n' : '') +
    '  <meta property="og:type" content="website">\n  <meta property="og:site_name" content="Tapa na Gaveta">\n  <meta property="og:locale" content="pt_BR">\n' +
    '  <meta property="og:title" content="' + esc(p.titulo) + '">\n  <meta property="og:description" content="' + esc(p.descricao) + '">\n' +
    (site ? '  <meta property="og:url" content="' + esc(url) + '">\n' : '') +
    '  <meta property="og:image" content="' + esc(img) + '">\n  <meta property="og:image:width" content="1200">\n  <meta property="og:image:height" content="630">\n' +
    '  <meta name="twitter:card" content="summary_large_image">';
}

// página inicial: troca o bloco de título/descrição/og pelo gerado
const inicio = paginas.find((p) => p.caminho === '');
let html = ler('index.html');
const ini = html.indexOf('<title>'), fim = html.indexOf('<meta property="og:locale"');
if (ini < 0 || fim < 0) throw new Error('index.html mudou: não achei o bloco de título e Open Graph');
html = html.slice(0, ini) + meta(inicio) + html.slice(html.indexOf('\n', fim) + 1);
gravar('index.html', html);

let n = 0;
paginas.filter((p) => p.caminho).forEach((p) => {
  const nivel = p.caminho.split('/').filter(Boolean).length;
  const volta = '../'.repeat(nivel);
  gravar(p.caminho + 'index.html', '<!doctype html>\n<html lang="pt-BR">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1">\n  ' +
    meta(p) + '\n  <meta name="theme-color" content="#0f5132">\n  <meta http-equiv="refresh" content="0; url=' + volta + p.rota + '">\n' +
    '  <script>location.replace("' + volta + '" + "' + p.rota + '" + (location.search ? "?" + location.search.slice(1) : ""));</script>\n' +
    '</head>\n<body style="background:#0f5132;color:#f4f8f2;font:16px system-ui;padding:24px"><a href="' + volta + p.rota + '" style="color:#e8f0a0">Abrir o Tapa na Gaveta</a></body>\n</html>\n');
  n++;
});

// ------------------------------------------------------------------ sitemap e robots
if (site) {
  const hoje = new Date().toISOString().slice(0, 10);
  gravar('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    paginas.map((p) => '  <url><loc>' + esc(abs(p.caminho)) + '</loc><lastmod>' + hoje + '</lastmod></url>').join('\n') + '\n</urlset>\n');
  gravar('robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + site + 'sitemap.xml\n');
} else {
  gravar('robots.txt', 'User-agent: *\nAllow: /\n');
}

// ------------------------------------------------------------------ conferências
let bytes = 0;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else bytes += fs.statSync(p).size;
});
walk(dist);
let pagina = 0, gz = 0;
const zlib = require('zlib');
for (const f of ['index.html', 'app/app.css', 'app/app.js', 'app/abas/simulador.js', 'shared/simulador-core.js', 'shared/espn.js', 'shared/regras-brasileirao-2026.json', 'dados/brasileirao-2026.json',
  'shared/fonts/manrope-latin-500-normal.woff2', 'shared/fonts/manrope-latin-600-normal.woff2', 'shared/fonts/manrope-latin-700-normal.woff2', 'shared/fonts/manrope-latin-800-normal.woff2', 'shared/fonts/big-shoulders-display-latin-900-normal.woff2']) {
  pagina += fs.statSync(path.join(dist, f)).size;
  gz += zlib.gzipSync(fs.readFileSync(path.join(dist, f))).length;
}
if (JSON.stringify(fs.readdirSync(dist)).includes('CHAVE')) throw new Error('algo com "CHAVE" no nome foi para o ar');
console.log(`dist/ pronto: ${(bytes / 1048576).toFixed(1)} MB, ${n} páginas de entrada, página inicial (sem imagens) ${(pagina / 1024).toFixed(0)} KB, ${(gz / 1024).toFixed(0)} KB com gzip · ` +
  `${release ? 'versão publicada' : 'desenvolvimento'}${site ? ' · ' + site : ' · sem --site (Open Graph com endereço relativo)'}`);

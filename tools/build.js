// Monta dist/ (o que vai para o ar).
//   node tools/build.js                                   desenvolvimento (faixa de erro ligada)
//   node tools/build.js --release --site https://dominio  versão publicada
// --release grava TNG_RELEASE (site, Milhão, Fast) e DEZ_RELEASE (Draft): some a faixa de erro.
// --site    endereço definitivo: Open Graph com URL absoluta, sitemap.xml e robots.txt.
// --adsense ca-pub-XXXXXXXXXXXXXXXX (opcional; vazio = sem anúncios): põe o código do AdSense e a
//           meta de verificação em todas as páginas do site (não nos jogos) e gera o ads.txt.
// Páginas de entrada (tools/paginas.json): título, descrição e imagem certos para o WhatsApp.
// As de cada time (simulador/<time>/) e de cada jogo (jogar/<jogo>/) saem com texto (tools/paginas-texto.js).
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
const iAds = args.indexOf('--adsense');
const adsense = iAds >= 0 ? String(args[iAds + 1] || '').trim() : '';
if (adsense && !/^ca-pub-\d{10,20}$/.test(adsense)) throw new Error('--adsense precisa do ID no formato ca-pub-1234567890123456');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
const PUBLICAR = [
  'index.html', 'app', 'shared',
  'dados/brasileirao-2026.json', 'dados/elencos-escalacao.json', 'dados/times-voce-escala.json',
  'midia/escudos', 'midia/icones', 'midia/og', 'midia/campo.svg', 'midia/campo-v.svg', 'jogos', 'textos',
];
for (const item of PUBLICAR) {
  const de = path.join(raiz, item);
  if (!fs.existsSync(de)) throw new Error('falta ' + item);
  fs.cpSync(de, path.join(dist, item), { recursive: true });
}
// dados opcionais (saem do Actions; o site funciona sem eles)
const COMPETICOES = JSON.parse(fs.readFileSync(path.join(raiz, 'shared/competicoes.json'), 'utf8')).lista;
for (const f of ['dados/ultimas-escalacoes.json', 'dados/estatisticas-jogadores.json', 'dados/bola-de-prata.json'].concat(COMPETICOES.map((c) => c.dados), COMPETICOES.map((c) => c.jogadores))) {
  if (fs.existsSync(path.join(raiz, f))) fs.cpSync(path.join(raiz, f), path.join(dist, f));
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
// as páginas de cada time entram pelo tools/paginas-texto.js (abaixo)

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

// Só redirecionam as páginas sem texto próprio (simulador/, escalacao/, jogos/, estatisticas/):
// ficam fora do sitemap e com noindex. As de cada time e de cada jogo têm conteúdo (abaixo).
const COM_TEXTO = /^(simulador\/[^/]+|jogar\/[^/]+)\/$/;
let n = 0;
paginas.filter((p) => p.caminho && !COM_TEXTO.test(p.caminho)).forEach((p) => {
  const nivel = p.caminho.split('/').filter(Boolean).length;
  const volta = '../'.repeat(nivel);
  gravar(p.caminho + 'index.html', '<!doctype html>\n<html lang="pt-BR">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1">\n  ' +
    meta(p) + '\n  <meta name="robots" content="noindex, follow">\n  <meta name="theme-color" content="#0b1640">\n  <meta http-equiv="refresh" content="0; url=' + volta + p.rota + '">\n' +
    '  <script>location.replace("' + volta + '" + "' + p.rota + '" + (location.search ? "?" + location.search.slice(1) : ""));</script>\n' +
    '</head>\n<body style="background:#0b1640;color:#f4f6fb;font:16px system-ui;padding:24px"><a href="' + volta + p.rota + '" style="color:#ffc23d">Abrir o Tapa na Gaveta</a></body>\n</html>\n');
  p.semIndice = true;
  n++;
});

// ------------------------------------------------------------------ páginas de texto estáticas
// HTML de verdade, sem redirecionar: é o que o Google e a revisão do AdSense leem sem rodar
// JavaScript. Os textos fixos moram em textos/*.html (os mesmos que o site mostra em #/sobre...);
// as páginas de cada time, do campeonato e dos jogos saem de tools/paginas-texto.js.
const TEXTOS = [
  { id: 'sobre', caminho: 'sobre/', titulo: 'Quem somos', curto: 'Quem somos', descricao: 'Quem faz o Tapa na Gaveta, o simulador do Brasileirão feito por torcedores, e de onde vêm os dados.' },
  { id: 'modelo', caminho: 'como-funciona/', titulo: 'Como funciona o simulador', curto: 'Como funciona', descricao: 'Como o Tapa na Gaveta calcula as chances de cada jogo e de título, Libertadores e rebaixamento: Poisson, forma recente, mando de campo e Monte Carlo.' },
  { id: 'desempate', caminho: 'criterios-de-desempate/', titulo: 'Critérios de desempate e vagas do Brasileirão 2026', curto: 'Desempates', descricao: 'A ordem dos critérios de desempate do Brasileirão 2026, as vagas para Libertadores e Sul-Americana, o rebaixamento e como o simulador trata cada um.' },
  { id: 'contato', caminho: 'contato/', titulo: 'Contato', curto: 'Contato', descricao: 'Fale com o Tapa na Gaveta: erros nos dados, ideias, problemas no site e parcerias.' },
  { id: 'privacidade', caminho: 'privacidade/', titulo: 'Política de privacidade', curto: 'Privacidade', descricao: 'Quais dados o Tapa na Gaveta usa, cookies, publicidade e como controlar os seus dados.' },
  { id: 'termos', caminho: 'termos/', titulo: 'Termos de uso', curto: 'Termos de uso', descricao: 'Termos de uso do Tapa na Gaveta, simulador do Brasileirão.' },
];
const appSrc = fs.readFileSync(path.join(raiz, 'app/app.js'), 'utf8');
const mEmail = /CONTATO = \{ email: '([^']*)', github: '([^']*)'/.exec(appSrc);
const contato = mEmail && mEmail[1] ? 'Escreva para <a href="mailto:' + mEmail[1] + '">' + mEmail[1] + '</a>.' : 'Mande uma mensagem pelo <a href="' + (mEmail ? mEmail[2] : '#') + '">GitHub do projeto</a>.';

// casca comum: topo com a marca e um botão para o site, o texto e a navegação entre as páginas
// cta.redirecionarComParametros: um link de cenário (?c=...) vai direto para o simulador
function casca(p, corpo, volta, cta) {
  cta = cta || { href: volta + '#/simulador', rotulo: 'Simular' };
  const ir = cta.redirecionarComParametros
    ? '  <script>if (location.search) location.replace("' + volta + cta.redirecionarComParametros + '?" + location.search.slice(1));</script>\n' : '';
  const nav = [['brasileirao-2026/', 'Brasileirão 2026']].concat(TEXTOS.map((x) => [x.caminho, x.curto]), [['jogar/draft/', 'Football Draft'], ['jogar/milhao/', 'Jogo do Milhão'], ['jogar/fast/', 'Fast Football']]);
  return '<!doctype html>\n<html lang="pt-BR">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width,initial-scale=1">\n' + ir + '  ' + meta(p) +
    '\n  <meta name="theme-color" content="#0b1640">\n  <link rel="icon" href="' + volta + 'app/icones/favicon.svg" type="image/svg+xml">\n  <link rel="stylesheet" href="' + volta + 'app/app.css">\n</head>\n<body>\n' +
    '  <header class="head"><div class="wrap head-row"><a class="marca" href="' + volta + '" aria-label="Tapa na Gaveta, início"><b style="font:italic 900 19px var(--f-num);color:#fff;white-space:nowrap">tapa na gaveta</b></a><span class="sp"></span>' +
    '<a class="btn primario" style="background:var(--gold);border-color:var(--gold);color:#0b1640;white-space:nowrap" href="' + esc(cta.href) + '">' + esc(cta.rotulo) + '</a></div></header>\n' +
    '  <main class="wrap"><article class="texto">' + corpo + '<nav class="texto-nav" aria-label="Mais do Tapa na Gaveta">' +
    nav.map(([c, nome]) => '<a href="' + volta + c + '"' + (c === p.caminho ? ' aria-current="page"' : '') + '>' + nome + '</a>').join('') +
    '<a href="' + volta + '">Início</a></nav></article></main>\n</body>\n</html>\n';
}

TEXTOS.forEach((t) => {
  const corpo = fs.readFileSync(path.join(raiz, 'textos', t.id + '.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<span data-contato><\/span>/g, contato)
    .replace(/href="#\/(sobre|modelo|privacidade|termos|desempate|contato)"/g, (m, k) => 'href="../' + TEXTOS.find((x) => x.id === k).caminho + '"')
    .replace(/href="#\//g, 'href="../#/')
    .replace(/href="(brasileirao-2026|jogar|simulador)\//g, 'href="../$1/');
  const p = { caminho: t.caminho, og: 'simulador', titulo: t.titulo, descricao: t.descricao };
  gravar(t.caminho + 'index.html', casca(p, corpo, '../'));
  paginas.push(p);
});
const geradas = require('./paginas-texto.js')({ raiz, gravar, casca, esc });
// troca as entradas antigas (só redirecionamento) pelas páginas com texto
geradas.forEach((g) => {
  const k = paginas.findIndex((p) => p.caminho === g.caminho);
  if (k >= 0) paginas[k] = g; else paginas.push(g);
});

// ------------------------------------------------------------------ sitemap e robots
if (site) {
  const hoje = new Date().toISOString().slice(0, 10);
  gravar('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    paginas.filter((p) => !p.semIndice).map((p) => '  <url><loc>' + esc(abs(p.caminho)) + '</loc><lastmod>' + hoje + '</lastmod></url>').join('\n') + '\n</urlset>\n');
  gravar('robots.txt', 'User-agent: *\nAllow: /\nSitemap: ' + site + 'sitemap.xml\n');
} else {
  gravar('robots.txt', 'User-agent: *\nAllow: /\n');
}

// ------------------------------------------------------------------ AdSense
// Código do AdSense (anúncios automáticos) e meta de verificação nas páginas do site; os jogos
// ficam de fora (abrem num iframe). ads.txt na raiz: só vale com domínio próprio.
if (adsense) {
  const tag = '<meta name="google-adsense-account" content="' + adsense + '">\n  ' +
    '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + adsense + '" crossorigin="anonymous"></script>\n';
  let k = 0;
  const varrer = (d) => fs.readdirSync(path.join(dist, d), { withFileTypes: true }).forEach((e) => {
    const rel = d ? d + '/' + e.name : e.name;
    if (e.isDirectory()) { if (!/^(jogos|app|shared|dados|midia|textos)$/.test(rel)) varrer(rel); return; }
    if (e.name !== 'index.html') return;
    const h = ler(rel);
    if (h.includes('name="robots" content="noindex')) return;   // só redireciona
    if (!h.includes('</head>')) throw new Error(rel + ': sem </head> para o AdSense');
    gravar(rel, h.replace('</head>', '  ' + tag + '</head>')); k++;
  });
  varrer('');
  gravar('ads.txt', 'google.com, ' + adsense.replace(/^ca-/, '') + ', DIRECT, f08c47fec0942fa0\n');
  console.log('AdSense ' + adsense + ' em ' + k + ' páginas, ads.txt gravado');
}

// ------------------------------------------------------------------ versão (cache)
// O GitHub Pages manda o navegador guardar tudo por 10 min, sempre no mesmo endereço: depois de
// publicar, o celular podia juntar app.js novo com app.css velho (ou o contrário). Agora cada
// publicação tem uma versão (resumo do conteúdo) e os arquivos são pedidos como app.js?v=VERSÃO:
// mudou um byte, muda o endereço e o navegador baixa de novo; não mudou, usa o que já tem.
// versao.json (pedido sem cache) avisa a página aberta que saiu uma versão nova.
const crypto = require('crypto');
const VERSAO = (() => {
  const h = crypto.createHash('sha1');
  const ir = (d) => fs.readdirSync(path.join(dist, d), { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1)).forEach((e) => {
    const rel = d ? d + '/' + e.name : e.name;
    if (e.isDirectory()) return ir(rel);
    if (/\.(html|xml|txt)$/.test(e.name)) return;           // as páginas apontam para a versão; não entram nela
    h.update(rel); h.update(fs.readFileSync(path.join(dist, rel)));
  });
  ir('');
  return h.digest('hex').slice(0, 10);
})();
{
  let k = 0;
  const comV = (s) => s.replace(/((?:\.\.\/)*app\/(?:app\.css|app\.js|efeitos\.js))(["'])/g, '$1?v=' + VERSAO + '$2');
  const varrer = (d) => fs.readdirSync(path.join(dist, d), { withFileTypes: true }).forEach((e) => {
    const rel = d ? d + '/' + e.name : e.name;
    if (e.isDirectory()) { if (!/^(jogos|app|shared|dados|midia|textos)$/.test(rel)) varrer(rel); return; }
    if (!e.name.endsWith('.html')) return;
    let h = ler(rel);
    const novo = comV(h).replace(/(<script src="(?:\.\.\/)*app\/app\.js)/, '<script>window.TNG_V = "' + VERSAO + '";</script>\n  $1');
    if (novo !== h) { gravar(rel, novo); k++; }
  });
  varrer('');
  // o worker carrega o modelo por conta própria
  const w = ler('shared/simulador-worker.js');
  if (!w.includes("importScripts('simulador-core.js')")) throw new Error('simulador-worker.js mudou: não achei o importScripts');
  gravar('shared/simulador-worker.js', w.replace("importScripts('simulador-core.js')", "importScripts('simulador-core.js?v=" + VERSAO + "')"));
  if (!ler('index.html').includes('window.TNG_V')) throw new Error('index.html sem a versão');
  gravar('versao.json', JSON.stringify({ v: VERSAO, em: new Date().toISOString() }));
  console.log('versão ' + VERSAO + ' em ' + k + ' páginas');
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
  'shared/fonts/archivo-latin-variable.woff2']) {
  pagina += fs.statSync(path.join(dist, f)).size;
  gz += zlib.gzipSync(fs.readFileSync(path.join(dist, f))).length;
}
if (JSON.stringify(fs.readdirSync(dist)).includes('CHAVE')) throw new Error('algo com "CHAVE" no nome foi para o ar');
console.log(`dist/ pronto: ${(bytes / 1048576).toFixed(1)} MB, ${n} páginas de entrada, ${paginas.filter((p) => !p.semIndice && p.caminho).length} páginas com texto, página inicial (sem imagens) ${(pagina / 1024).toFixed(0)} KB, ${(gz / 1024).toFixed(0)} KB com gzip · ` +
  `${release ? 'versão publicada' : 'desenvolvimento'}${site ? ' · ' + site : ' · sem --site (Open Graph com endereço relativo)'}`);

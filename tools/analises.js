// Análises: textos escritos pelo grupo, com quadros de dados que se atualizam sozinhos a cada build.
//   analises/<slug>.md  →  analises/<slug>/index.html   (e a lista em analises/index.html)
// O texto é Markdown simples (veja analises/LEIA-ME.md). Os quadros entram com uma linha {{...}}:
//   {{tabela 15-20}}          classificação de hoje, do 15º ao 20º (zonas com a regra da Copa do Brasil)
//   {{chances rb}}            chance de cada time terminar na zona (rb, lib, pre, sula ou titulo)
//   {{rodada 35}}             jogos da rodada com as chances de cada resultado e o placar mais provável
//   {{time COR}}              ficha do time: posição, pontos, jogos que faltam e chances
//   {{simular COR}}           botão para simular os jogos do time no site
// rascunho: sim  →  a página sai no ar com aviso de rascunho, sem índice no Google, fora da lista,
// do sitemap e sem anúncios. Para publicar, troque para "rascunho: não".
'use strict';
const fs = require('fs');
const path = require('path');
const C = require('../shared/simulador-core.js');

const N_SIM = 20000, SEMENTE = 2026;
const CURTO = { athletico: 'Athletico', atleticomg: 'Atlético-MG', bragantino: 'Bragantino', sp: 'São Paulo', vasco: 'Vasco' };
const ZNOME = { titulo: 'título', lib: 'Libertadores (fase de grupos)', pre: 'pré-Libertadores', sula: 'Sul-Americana', rb: 'rebaixamento' };

function lerArtigo(arq) {
  const bruto = fs.readFileSync(arq, 'utf8').replace(/\r\n/g, '\n');
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(bruto);
  if (!m) throw new Error(arq + ': falta o cabeçalho entre --- e ---');
  const meta = {};
  m[1].split('\n').forEach((l) => { const k = l.indexOf(':'); if (k > 0) meta[l.slice(0, k).trim()] = l.slice(k + 1).trim(); });
  ['titulo', 'descricao', 'data', 'autor'].forEach((c) => { if (!meta[c]) throw new Error(arq + ': falta "' + c + '" no cabeçalho'); });
  meta.rascunho = /^(sim|s|true|1)$/i.test(meta.rascunho || 'sim');
  return { meta, corpo: m[2] };
}

function gerar(o) {
  const { raiz, gravar, casca, esc } = o;
  const pasta = path.join(raiz, 'analises');
  if (!fs.existsSync(pasta)) return [];
  const arqs = fs.readdirSync(pasta).filter((f) => f.endsWith('.md') && !/^LEIA-ME/i.test(f)).sort();
  if (!arqs.length) return [];

  const liga = JSON.parse(fs.readFileSync(path.join(raiz, 'dados/brasileirao-2026.json'), 'utf8'));
  const regras = JSON.parse(fs.readFileSync(path.join(raiz, 'shared/regras-brasileirao-2026.json'), 'utf8'));
  const L = C.preparar(liga, regras);
  const M = C.modelo(L, C.PARAMS_PADRAO);
  const tab = C.tabela(L, {});
  const zs = C.zonasTab(L, tab);
  const ch = C.chances(L, C.monteCarlo(L, {}, M, N_SIM, SEMENTE));
  const nome = (i) => CURTO[L.times[i].slug] || L.times[i].nome;
  const porSigla = (s) => { const i = L.times.findIndex((t) => t.abrev.toUpperCase() === String(s).toUpperCase() || t.slug === String(s).toLowerCase()); if (i < 0) throw new Error('time desconhecido: ' + s); return i; };
  const posDe = []; tab.forEach((x, k) => { posDe[x.i] = k + 1; });
  const pct = (p) => (p <= 0 ? '0%' : p >= 1 ? '100%' : p < 0.005 ? '<1%' : p > 0.995 ? '>99%' : Math.round(p * 100) + '%');
  const quando = new Date(liga.baixado_em.length <= 19 ? liga.baixado_em + '-03:00' : liga.baixado_em);
  const fData = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: 'numeric', month: 'long', year: 'numeric' });
  const fHora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  const fJogo = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'short', day: '2-digit', month: '2-digit' });
  const dataDados = fData.format(quando) + ', às ' + fHora.format(quando).replace(':', 'h');
  const dataTxt = (iso) => fData.format(new Date(iso + 'T12:00:00-03:00'));

  function quadros(volta) {
    const escudo = (i, t) => L.times[i].escudo ? '<img class="crest" src="' + volta + 'midia/escudos/' + esc(L.times[i].escudo) + '.png" alt="" width="' + t + '" height="' + t + '" loading="lazy">' : '';
    const link = (i) => '<a href="' + volta + 'simulador/' + L.times[i].slug + '/">' + esc(nome(i)) + '</a>';
    const nota = '<p class="fonte">Dados de ' + esc(dataDados) + ', atualizados a cada rodada. Chances em ' + N_SIM.toLocaleString('pt-BR') + ' simulações do <a href="' + volta + 'como-funciona/">modelo do Tapa na Gaveta</a>.</p>';
    return {
      tabela(arg) {
        const [de, ate] = (arg || '1-20').split('-').map(Number);
        return '<div class="tabela-rola"><table class="tab"><thead><tr><th>#</th><th class="esq">Time</th><th>P</th><th>J</th><th>V</th><th>SG</th><th>GP</th></tr></thead><tbody>' +
          tab.slice(de - 1, ate).map((x, k) => { const p = de + k, z = zs[p - 1]; return '<tr class="' + (z ? 'z-' + z : '') + '"><td>' + p + '</td><td class="esq">' + escudo(x.i, 20) + link(x.i) + '</td><td><b>' + x.pts + '</b></td><td>' + x.j + '</td><td>' + x.v + '</td><td>' + (x.sg > 0 ? '+' : '') + x.sg + '</td><td>' + x.gp + '</td></tr>'; }).join('') +
          '</tbody></table></div>' + nota;
      },
      chances(arg) {
        const z = (arg || 'rb').trim();
        if (!ZNOME[z]) throw new Error('{{chances ' + z + '}}: use titulo, lib, pre, sula ou rb');
        const lista = ch.filter((c) => c[z] >= 0.005).sort((a, b) => b[z] - a[z]);
        return '<div class="tabela-rola"><table class="tab"><caption>Chance de ' + esc(ZNOME[z]) + '</caption><tbody>' +
          lista.map((c) => '<tr><td class="esq">' + escudo(c.i, 20) + link(c.i) + ' <small>(' + posDe[c.i] + 'º)</small></td><td class="barra-td"><span class="barra-pct" style="width:' + Math.max(2, Math.round(c[z] * 100)) + '%"></span></td><td><b>' + pct(c[z]) + '</b></td></tr>').join('') +
          '</tbody></table></div>' + nota;
      },
      rodada(arg) {
        const r = Number(arg);
        const js = L.jogos.filter((j) => j.rodada === r).sort((a, b) => (a.data < b.data ? -1 : 1));
        if (!js.length) throw new Error('{{rodada ' + arg + '}}: rodada sem jogos');
        return '<div class="tabela-rola"><table class="tab tab-jogos"><caption>Rodada ' + r + '</caption><thead><tr><th class="esq">Data</th><th class="esq">Jogo</th><th>Casa</th><th>Empate</th><th>Fora</th><th>Provável</th></tr></thead><tbody>' +
          js.map((j) => {
            const d = new Date(j.data), dia = fJogo.format(d).replace('.', '').replace(',', '');
            if (j.feito) return '<tr><td class="esq">' + esc(dia) + '</td><td class="esq">' + escudo(j.h, 18) + link(j.h) + ' <b>' + j.gh + ' x ' + j.ga + '</b> ' + escudo(j.a, 18) + link(j.a) + '</td><td colspan="4"><small>encerrado</small></td></tr>';
            const p = M.prob(j.h, j.a);
            return '<tr><td class="esq">' + esc(dia) + '</td><td class="esq">' + escudo(j.h, 18) + link(j.h) + ' x ' + escudo(j.a, 18) + link(j.a) + '</td><td>' + pct(p.ph) + '</td><td>' + pct(p.pd) + '</td><td>' + pct(p.pa) + '</td><td>' + p.provavel[0] + ' x ' + p.provavel[1] + '</td></tr>';
          }).join('') + '</tbody></table></div>' + nota;
      },
      time(arg) {
        const i = porSigla(arg.trim()), x = tab[posDe[i] - 1], c = ch[i];
        const resta = L.jogos.filter((j) => !j.feito && (j.h === i || j.a === i));
        return '<div class="ficha">' + escudo(i, 44) + '<div><b>' + link(i) + '</b><span>' + posDe[i] + 'º · ' + x.pts + ' pontos · faltam ' + resta.length + ' jogos (até ' + (x.pts + 3 * resta.length) + ' pontos)</span>' +
          '<span>Título ' + pct(c.titulo) + ' · Libertadores ' + pct((c.lib || 0) + (c.pre || 0)) + ' · Sul-Americana ' + pct(c.sula || 0) + ' · rebaixamento ' + pct(c.rb) + '</span></div></div>';
      },
      simular(arg) {
        const i = porSigla(arg.trim());
        return '<p class="cta-simular"><a class="btn primario" href="' + volta + '#/simulador/' + L.times[i].slug + '">Simular os jogos ' + (L.times[i].slug === 'chapecoense' ? 'da ' : 'do ') + esc(nome(i)) + '</a></p>';
      },
    };
  }

  // Markdown simples: ## título, parágrafos, - listas, > citação, **negrito**, *itálico*, [link](url)
  function md(txt, Q, arq) {
    const inline = (s) => esc(s).replace(/&quot;/g, '"').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>')
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => '<a href="' + u.replace(/"/g, '%22') + '">' + t + '</a>');
    const out = [];
    txt.replace(/<!--[\s\S]*?-->/g, '').split(/\n{2,}/).forEach((bloco) => {
      const b = bloco.trim(); if (!b) return;
      const q = /^\{\{\s*(\w+)\s*([^}]*)\}\}$/.exec(b);
      if (q) { if (!Q[q[1]]) throw new Error(arq + ': quadro desconhecido {{' + q[1] + '}}'); out.push(Q[q[1]](q[2].trim())); return; }
      if (/^#{2,3} /.test(b)) { const n = /^(#+)/.exec(b)[1].length; out.push('<h' + n + '>' + inline(b.replace(/^#+ /, '')) + '</h' + n + '>'); return; }
      if (/^[-*] /.test(b)) { out.push('<ul>' + b.split('\n').map((l) => '<li>' + inline(l.replace(/^[-*] /, '')) + '</li>').join('') + '</ul>'); return; }
      if (/^> /.test(b)) { out.push('<blockquote>' + inline(b.replace(/^> ?/gm, '')) + '</blockquote>'); return; }
      out.push('<p>' + inline(b).replace(/\n/g, ' ') + '</p>');
    });
    return out.join('\n');
  }

  const paginas = [], publicadas = [];
  arqs.forEach((f) => {
    const slug = f.replace(/\.md$/, ''), arq = path.join('analises', f);
    const { meta, corpo } = lerArtigo(path.join(pasta, f));
    const volta = '../../', Q = quadros(volta);
    let html = '<p class="kicker">Análise' + (meta.rodada ? ' · rodada ' + esc(meta.rodada) : '') + '</p>' +
      '<h1>' + esc(meta.titulo) + '</h1>' +
      '<p class="assinatura">Por <b>' + esc(meta.autor) + '</b> · ' + esc(dataTxt(meta.data)) + (meta.atualizado ? ' · atualizado em ' + esc(dataTxt(meta.atualizado)) : '') + '</p>' +
      md(corpo, Q, arq) +
      '<p class="fonte">O texto é a opinião de quem assina. Os quadros saem dos dados oficiais da rodada e do <a href="' + volta + 'como-funciona/">modelo do simulador</a>; não são dicas de aposta.</p>';
    if (meta.rascunho) html = '<p class="aviso-rascunho">Rascunho: esta página ainda não foi publicada (não aparece no Google nem na lista de análises).</p>' + html;
    const p = { caminho: 'analises/' + slug + '/', og: meta.og || 'simulador', titulo: meta.titulo, descricao: meta.descricao, data: meta.data, autor: meta.autor };
    const ld = '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: meta.titulo, description: meta.descricao, datePublished: meta.data, dateModified: meta.atualizado || meta.data, author: { '@type': 'Person', name: meta.autor }, publisher: { '@type': 'Organization', name: 'Tapa na Gaveta' } }).replace(/</g, '\\u003c') + '</script>';
    let pagina = casca(p, html, volta, { href: volta + '#/simulador', rotulo: 'Simular' }).replace('</head>', '  ' + ld + '\n</head>');
    if (meta.rascunho) { pagina = pagina.replace('</head>', '  <meta name="robots" content="noindex, nofollow">\n</head>'); p.semIndice = true; }
    else publicadas.push(p);
    gravar(p.caminho + 'index.html', pagina);
    paginas.push(p);
  });

  // lista de análises (só as publicadas, da mais nova para a mais antiga)
  publicadas.sort((a, b) => (a.data < b.data ? 1 : -1));
  const lista = '<h1>Análises</h1><p class="lead">A reta final do Brasileirão 2026 contada por quem faz o simulador: o que cada time precisa, as contas da Libertadores e da zona de rebaixamento, sempre com os números da rodada.</p>' +
    (publicadas.length ? '<ul class="lista-analises">' + publicadas.map((p) => '<li><a href="../' + p.caminho + '">' + esc(p.titulo) + '</a><span>' + esc(p.descricao) + '</span><small>' + esc(p.autor) + ' · ' + esc(dataTxt(p.data)) + '</small></li>').join('') + '</ul>' : '<p>As primeiras análises saem nos próximos dias.</p>');
  const idx = { caminho: 'analises/', og: 'simulador', titulo: 'Análises do Brasileirão 2026', descricao: 'Análises da reta final do Brasileirão 2026: o que cada time precisa, Libertadores, rebaixamento e as contas da rodada.' };
  if (!publicadas.length) idx.semIndice = true;
  let pIdx = casca(idx, lista, '../');
  if (!publicadas.length) pIdx = pIdx.replace('</head>', '  <meta name="robots" content="noindex, follow">\n</head>');
  gravar('analises/index.html', pIdx);
  paginas.push(idx);
  return paginas;
}

module.exports = gerar;

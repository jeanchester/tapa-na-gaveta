// Páginas com texto de verdade, geradas no build a partir dos dados (sem JavaScript no navegador):
//   brasileirao-2026/         panorama: tabela, chances de cada time e jogos que faltam
//   simulador/<time>/         uma por time: situação, chances, jogos que faltam e campanha
//   jogar/draft|milhao|fast/  uma por jogo: como jogar (texto em textos/jogos/*.html)
// São o que o Google e a revisão do AdSense leem. Um link de cenário compartilhado
// (simulador/<time>/?c=...) continua indo direto para o simulador, com os placares.
// Chamado por tools/build.js; dá para conferir sozinho: node tools/paginas-texto.js
'use strict';
const fs = require('fs');
const path = require('path');
const C = require('../shared/simulador-core.js');

const N_SIM = 20000, SEMENTE = 2026;
// nome curto (o da ESPN é longo demais para frase) e artigo
const CURTO = { athletico: 'Athletico', atleticomg: 'Atlético-MG', bragantino: 'Bragantino', sp: 'São Paulo', vasco: 'Vasco' };
const FEMININO = { chapecoense: 1 };

function gerar(o) {
  const { raiz, gravar, casca, esc } = o;
  const liga = JSON.parse(fs.readFileSync(path.join(raiz, 'dados/brasileirao-2026.json'), 'utf8'));
  const regras = JSON.parse(fs.readFileSync(path.join(raiz, 'shared/regras-brasileirao-2026.json'), 'utf8'));
  const L = C.preparar(liga, regras);
  const M = C.modelo(L, C.PARAMS_PADRAO);
  const tab = C.tabela(L, {});
  const ch = C.chances(L, C.monteCarlo(L, {}, M, N_SIM, SEMENTE));
  const objs = C.objetivos(regras);
  const sit = (t, id) => C.situacao(L, {}, t, objs.find((x) => x.id === id));

  // ---------------------------------------------------------------- textos auxiliares
  const T = L.times.map((t) => {
    const nome = CURTO[t.slug] || t.nome, f = !!FEMININO[t.slug];
    return { nome, o: f ? 'a' : 'o', O: f ? 'A' : 'O', do: f ? 'da' : 'do', no: f ? 'na' : 'no', ao: f ? 'à' : 'ao', pelo: f ? 'pela' : 'pelo', com: f ? 'com a' : 'com o', sobre: f ? 'sobre a' : 'sobre o', slug: t.slug };
  });
  const posDe = []; tab.forEach((x, k) => { posDe[x.i] = k + 1; });
  const linha = []; tab.forEach((x) => { linha[x.i] = x; });
  const resta = new Array(L.n).fill(0);
  L.jogos.forEach((j) => { if (!j.feito) { resta[j.h]++; resta[j.a]++; } });
  const faltam = L.jogos.filter((j) => !j.feito).length;
  const zona = (pos) => regras.zonas.find((z) => pos >= z.de && pos <= z.ate);
  const Z = {}; regras.zonas.forEach((z) => { Z[z.id] = z; });
  const ultLib = Z.lib.ate, ultPre = Z.pre ? Z.pre.ate : Z.lib.ate, ultSula = Z.sula ? Z.sula.ate : ultPre, primRb = Z.rb.de;

  const quando = new Date(liga.baixado_em.length <= 19 ? liga.baixado_em + '-03:00' : liga.baixado_em);
  const fData = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: 'numeric', month: 'long', year: 'numeric' });
  const fHora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' });
  const fJogo = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'short', day: '2-digit', month: '2-digit' });
  const dataDados = fData.format(quando) + ', às ' + fHora.format(quando).replace(':', 'h');
  const diaJogo = (j) => {
    const d = new Date(j.data);
    return fJogo.format(d).replace('.', '').replace(',', '') + (j.horario ? ' · ' + fHora.format(d).replace(':', 'h') : '');
  };
  const num = (n) => n.toLocaleString('pt-BR');
  const pts = (n) => n + (n === 1 ? ' ponto' : ' pontos');
  const jogosTxt = (n) => n + (n === 1 ? ' jogo' : ' jogos');
  // probabilidade em texto: nunca "0%" nem "100%" quando a matemática ainda permite
  const pct = (p) => (p <= 0 ? '0%' : p >= 1 ? '100%' : p < 0.005 ? 'menos de 1%' : p > 0.995 ? 'mais de 99%' : Math.round(p * 100) + '%');
  // chance que a matemática permite mas não saiu em nenhuma simulação
  const chanceTxt = (p, sufixo) => (p <= 0 ? 'ainda possível na matemática, mas não aconteceu em nenhuma das ' + num(N_SIM) + ' simulações' : pct(p) + ' de chance' + (sufixo || ''));
  const pctCurto = (p) => (p <= 0 ? '0' : p >= 1 ? '100' : p < 0.005 ? '<1' : p > 0.995 ? '>99' : String(Math.round(p * 100))) + '%';
  const linkTime = (i, volta) => '<a href="' + volta + 'simulador/' + T[i].slug + '/">' + esc(T[i].nome) + '</a>';
  const ordinal = (n) => n + 'º';

  // resultado de um jogo do ponto de vista do time t
  const ladoDe = (j, t) => (j.h === t ? 'casa' : 'fora');
  const probTime = (j, t) => { const p = M.prob(j.h, j.a); return j.h === t ? { v: p.ph, e: p.pd, d: p.pa, pl: p.provavel } : { v: p.pa, e: p.pd, d: p.ph, pl: [p.provavel[1], p.provavel[0]] }; };

  // ---------------------------------------------------------------- tabelas em HTML
  function tabelaClassif(volta, destacar) {
    return '<div class="tabela-rola"><table class="tab"><caption>Classificação em ' + esc(dataDados) + '</caption><thead><tr><th>#</th><th class="esq">Time</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th></tr></thead><tbody>' +
      tab.map((x, k) => {
        const z = zona(k + 1);
        return '<tr class="' + (z ? 'z-' + z.id : '') + (x.i === destacar ? ' eu' : '') + '"><td>' + (k + 1) + '</td><td class="esq">' + escudoRel(x.i, 20, volta) + linkTime(x.i, volta) + '</td><td><b>' + x.pts + '</b></td><td>' + x.j + '</td><td>' + x.v + '</td><td>' + x.e + '</td><td>' + x.d + '</td><td>' + x.gp + '</td><td>' + x.gc + '</td><td>' + (x.gp - x.gc > 0 ? '+' : '') + (x.gp - x.gc) + '</td></tr>';
      }).join('') + '</tbody></table></div>' +
      '<p class="legenda">' + regras.zonas.map((z) => '<span class="z-' + z.id + '">' + esc(z.nome) + ': ' + (z.de === z.ate ? ordinal(z.de) : ordinal(z.de) + ' ao ' + ordinal(z.ate)) + '</span>').join('') + '</p>';
  }
  function escudoRel(i, tam, volta) {
    return L.times[i].escudo ? '<img class="crest" src="' + volta + 'midia/escudos/' + esc(L.times[i].escudo) + '.png" alt="" width="' + tam + '" height="' + tam + '" loading="lazy">' : '';
  }

  const paginas = [];
  const nota = '<p class="nota-dados">Dados da ESPN (não oficiais) de ' + esc(dataDados) + '. As chances são calculadas pelo Tapa na Gaveta, simulando ' + num(N_SIM) +
    ' vezes o que falta do campeonato, e mudam a cada rodada. Não são palpites de aposta.</p>';

  // ================================================================ uma página por time
  L.times.forEach((t) => {
    if (!t.escudo) return;
    const i = t.i, nm = T[i], pos = posDe[i], x = linha[i], c = ch[i], volta = '../../';
    const lider = tab[0].i, seg = tab[1].i;
    const max = x.pts + 3 * resta[i];
    const ptsEm = (p) => linha[tab[p - 1].i].pts, timeEm = (p) => tab[p - 1].i;

    // --- lead
    let lead;
    if (pos === 1) {
      const dif = x.pts - ptsEm(2);
      lead = nm.O + ' ' + esc(nm.nome) + ' lidera o Brasileirão 2026 com ' + pts(x.pts) + ' em ' + jogosTxt(x.j) + ', ' +
        (dif ? pts(dif) + ' à frente ' + T[seg].do + ' ' + esc(T[seg].nome) : 'empatado em pontos com ' + T[seg].o + ' ' + esc(T[seg].nome) + ' e à frente nos critérios de desempate') + '.';
    } else {
      lead = nm.O + ' ' + esc(nm.nome) + ' é ' + nm.o + ' ' + ordinal(pos) + ' colocad' + nm.o + ' do Brasileirão 2026, com ' + pts(x.pts) + ' em ' + jogosTxt(x.j) + ', ' +
        (x.pts === ptsEm(1) ? 'empatado em pontos com ' + T[lider].o + ' líder, ' + esc(T[lider].nome) : pts(ptsEm(1) - x.pts) + ' atrás do líder, ' + T[lider].o + ' ' + esc(T[lider].nome)) + '.';
    }
    lead += resta[i] ? ' Ainda tem ' + jogosTxt(resta[i]) + ' pela frente e pode chegar a ' + pts(max) + '.' : ' Já fez todos os jogos.';

    // --- situação na tabela
    const z = zona(pos);
    const ondeEsta = !z ? 'no meio da tabela, fora das vagas para competições e da zona de rebaixamento'
      : z.id === 'lib' ? 'na zona de classificação direta para a Libertadores (do ' + ordinal(Z.lib.de) + ' ao ' + ordinal(Z.lib.ate) + ')'
      : z.id === 'pre' ? 'na vaga da fase preliminar da Libertadores (' + ordinal(Z.pre.de) + ')'
      : z.id === 'sula' ? 'na zona da Sul-Americana (do ' + ordinal(Z.sula.de) + ' ao ' + ordinal(Z.sula.ate) + ')'
      : 'na zona de rebaixamento (do ' + ordinal(Z.rb.de) + ' ao ' + ordinal(Z.rb.ate) + ')';
    const dist = [];
    if (pos === 1) dist.push('tem ' + pts(x.pts - ptsEm(2)) + ' de vantagem sobre ' + T[timeEm(2)].o + ' ' + linkTime(timeEm(2), volta) + ', o vice-líder');
    if (pos > 1 && pos <= ultLib) dist.push('tem ' + pts(x.pts - ptsEm(ultLib + 1)) + ' de vantagem sobre ' + T[timeEm(ultLib + 1)].o + ' ' + linkTime(timeEm(ultLib + 1), volta) + ', o primeiro fora do G' + ultLib);
    if (pos > ultLib && pos < primRb) dist.push('está a ' + pts(ptsEm(ultLib) - x.pts) + ' do G' + ultLib + ' (' + T[timeEm(ultLib)].o + ' ' + linkTime(timeEm(ultLib), volta) + ', ' + ordinal(ultLib) + ', tem ' + ptsEm(ultLib) + ')');
    if (pos > ultSula && pos < primRb) dist.push('a ' + pts(ptsEm(ultSula) - x.pts) + ' da última vaga da Sul-Americana');
    const folgaZ4 = x.pts - ptsEm(primRb);
    if (pos < primRb && (pos > ultSula || folgaZ4 <= 3 * resta[i])) dist.push('tem ' + pts(x.pts - ptsEm(primRb)) + ' de vantagem sobre ' + T[timeEm(primRb)].o + ' ' + linkTime(timeEm(primRb), volta) + ', o primeiro da zona de rebaixamento');
    if (pos >= primRb) dist.push(sit(i, 'escapar') === 'impossivel'
      ? 'já não alcança mais ' + T[timeEm(primRb - 1)].o + ' ' + linkTime(timeEm(primRb - 1), volta) + ', o ' + ordinal(primRb - 1) + ', que tem ' + pts(ptsEm(primRb - 1))
      : 'precisa tirar ' + pts(ptsEm(primRb - 1) - x.pts) + ' de diferença para ' + T[timeEm(primRb - 1)].o + ' ' + linkTime(timeEm(primRb - 1), volta) + ', o ' + ordinal(primRb - 1) + ', para sair da zona');
    if (pos <= ultLib && pos > 1) dist.unshift('está a ' + pts(ptsEm(1) - x.pts) + ' da liderança');
    const vizinhos = tab.slice(Math.max(0, pos - 3), Math.min(L.n, pos + 2));
    const situacaoHtml = '<p>' + nm.O + ' ' + esc(nm.nome) + ' está ' + ondeEsta + '. Na briga por posição, ' + dist.join('; ') + '.</p>' +
      '<p>Quem está por perto: ' + vizinhos.filter((v) => v.i !== i).map((v) => linkTime(v.i, volta) + ' (' + ordinal(posDe[v.i]) + ', ' + pts(v.pts) + ')').join(', ') + '.</p>';

    // --- chances
    const sTit = sit(i, 'titulo'), sLib = sit(i, 'lib'), sEsc = sit(i, 'escapar'), sSula = sit(i, 'sula');
    const itens = [];
    itens.push('<li><b>Título:</b> ' + (sTit === 'garantido' ? 'já é campeão, matematicamente' : sTit === 'impossivel' ? 'não pode mais ser campeão' : chanceTxt(c.titulo)) + '.</li>');
    const pLib = c.lib + (c.pre || 0);
    itens.push('<li><b>Libertadores</b> (até o ' + ordinal(ultPre) + '): ' + (sLib === 'garantido' ? 'vaga direta garantida' : sit(i, 'pre') === 'impossivel' ? 'não alcança mais' : pLib > 0 && c.lib > 0 && c.lib < pLib ? pct(pLib) + ' de chance, sendo ' + pct(c.lib) + ' de vaga direta' : chanceTxt(pLib)) + '.</li>');
    if (Z.sula && sit(i, 'pre') !== 'garantido') itens.push('<li><b>Sul-Americana</b> (do ' + ordinal(Z.sula.de) + ' ao ' + ordinal(Z.sula.ate) + '): ' + (sSula === 'impossivel' ? 'não alcança mais' : chanceTxt(c.sula, ' de terminar nessa faixa')) + '.</li>');
    itens.push('<li><b>Rebaixamento:</b> ' + (sEsc === 'garantido' ? 'já está livre' : sEsc === 'impossivel' ? 'já está rebaixad' + nm.o : c.rb <= 0 ? 'ainda não está livre na matemática, mas não caiu em nenhuma das ' + num(N_SIM) + ' simulações' : pct(c.rb) + ' de chance') + '.</li>');
    let maisProv = 0; c.dist.forEach((p, k) => { if (p > c.dist[maisProv]) maisProv = k; });
    const chancesHtml = '<p>Simulando ' + num(N_SIM) + ' vezes os ' + jogosTxt(faltam) + ' que faltam no campeonato, com as probabilidades de cada partida, ' + nm.o + ' ' + esc(nm.nome) +
      ' termina mais vezes em ' + ordinal(maisProv + 1) + ' lugar (' + pct(c.dist[maisProv]) + ' das simulações). A posição média é ' + c.posMedia.toFixed(1).replace('.', ',') + '.</p><ul>' + itens.join('') + '</ul>' +
      (regras.zonas_provisorias ? '<p>As vagas da Libertadores e da Sul-Americana podem mudar com os campeões da Copa do Brasil e da própria Libertadores; veja os <a href="' + volta + 'criterios-de-desempate/">critérios e as vagas</a>.</p>' : '');

    // --- jogos que faltam
    const meus = L.jogos.filter((j) => !j.feito && (j.h === i || j.a === i));
    let jogosHtml;
    if (!meus.length) jogosHtml = '<p>' + nm.O + ' ' + esc(nm.nome) + ' já fez todos os jogos do campeonato.</p>';
    else {
      const ps = meus.map((j) => ({ j, adv: j.h === i ? j.a : j.h, p: probTime(j, i) }));
      const esp = ps.reduce((s, q) => s + 3 * q.p.v + q.p.e, 0);
      const dificil = ps.slice().sort((a, b) => a.p.v - b.p.v)[0], facil = ps.slice().sort((a, b) => b.p.v - a.p.v)[0];
      jogosHtml = '<div class="tabela-rola"><table class="tab tab-jogos"><thead><tr><th class="esq">Rodada</th><th class="esq">Data</th><th class="esq">Adversário</th><th>Vitória</th><th>Empate</th><th>Derrota</th><th>Placar provável</th></tr></thead><tbody>' +
        ps.map((q) => '<tr><td class="esq">' + (q.j.atrasado ? 'atrasado' : q.j.rodada ? ordinal(q.j.rodada) : '') + '</td><td class="esq">' + esc(diaJogo(q.j)) + '</td><td class="esq">' + (ladoDe(q.j, i) === 'casa' ? '' : '<small>fora · </small>') +
          escudoRel(q.adv, 18, volta) + linkTime(q.adv, volta) + ' <small>(' + ordinal(posDe[q.adv]) + ')</small></td><td>' + pctCurto(q.p.v) + '</td><td>' + pctCurto(q.p.e) + '</td><td>' + pctCurto(q.p.d) + '</td><td>' + q.p.pl[0] + ' x ' + q.p.pl[1] + '</td></tr>').join('') +
        '</tbody></table></div>' +
        '<p>' + (ps.length > 1 ? 'Pelas contas do modelo, o jogo mais difícil é ' + (ladoDe(dificil.j, i) === 'casa' ? 'em casa' : 'fora') + ' contra ' + T[dificil.adv].o + ' ' + linkTime(dificil.adv, volta) +
          ', com ' + pct(dificil.p.v) + ' de chance de vitória; o mais favorável é contra ' + T[facil.adv].o + ' ' + linkTime(facil.adv, volta) + ' (' + pct(facil.p.v) + '). ' : '') +
        'Somando as probabilidades, a expectativa é de cerca de ' + num(Math.round(esp * 10) / 10) + ' dos ' + 3 * ps.length + ' pontos em disputa, o que levaria ' + nm.o + ' ' + esc(nm.nome) + ' a uns ' + Math.round(x.pts + esp) + ' pontos no fim.</p>' +
        '<p>O placar provável é o mais frequente na distribuição de gols do modelo, não uma previsão de resultado. No simulador dá para chutar cada placar e ver a tabela mudar na hora.</p>';
    }

    // --- campanha
    const feitos = L.jogos.filter((j) => j.feito && (j.h === i || j.a === i));
    const casa = { v: 0, e: 0, d: 0 }, fora = { v: 0, e: 0, d: 0 };
    let maior = null, pior = null;
    feitos.forEach((j) => {
      const gp = j.h === i ? j.gh : j.ga, gc = j.h === i ? j.ga : j.gh, r = gp > gc ? 'v' : gp === gc ? 'e' : 'd';
      (j.h === i ? casa : fora)[r]++;
      if (!maior || gp - gc > maior.s) maior = { s: gp - gc, j, gp, gc };
      if (!pior || gp - gc < pior.s) pior = { s: gp - gc, j, gp, gc };
    });
    const ptsDe = (q) => 3 * q.v + q.e, jgDe = (q) => q.v + q.e + q.d;
    const aprov = (q) => (jgDe(q) ? Math.round(100 * ptsDe(q) / (3 * jgDe(q))) + '%' : '-');
    const descr = (q) => q.v + (q.v === 1 ? ' vitória, ' : ' vitórias, ') + q.e + (q.e === 1 ? ' empate e ' : ' empates e ') + q.d + (q.d === 1 ? ' derrota' : ' derrotas');
    const ult = feitos.slice(-5);
    const frase = (j) => {
      const adv = j.h === i ? j.a : j.h, gp = j.h === i ? j.gh : j.ga, gc = j.h === i ? j.ga : j.gh;
      return (gp > gc ? 'vitória ' + T[adv].sobre : gp === gc ? 'empate ' + T[adv].com : 'derrota para ' + T[adv].o) + ' ' + esc(T[adv].nome) + ' (' + gp + ' x ' + gc + (j.h === i ? ', em casa' : ', fora') + ')';
    };
    let seq = 0, semPerder = 0;
    for (let k = feitos.length - 1; k >= 0; k--) { const j = feitos[k], gp = j.h === i ? j.gh : j.ga, gc = j.h === i ? j.ga : j.gh; if (gp >= gc) semPerder++; else break; }
    const tipo = (j) => { const gp = j.h === i ? j.gh : j.ga, gc = j.h === i ? j.ga : j.gh; return gp > gc ? 'v' : gp === gc ? 'e' : 'd'; };
    if (feitos.length) { const r0 = tipo(feitos[feitos.length - 1]); for (let k = feitos.length - 1; k >= 0 && tipo(feitos[k]) === r0; k--) seq++; }
    const r0 = feitos.length ? tipo(feitos[feitos.length - 1]) : null;
    const seqTxt = seq >= 3 ? ' Vem de ' + seq + (r0 === 'v' ? ' vitórias' : r0 === 'e' ? ' empates' : ' derrotas') + ' seguidas.' : semPerder >= 4 ? ' Está há ' + semPerder + ' jogos sem perder.' : '';
    const advDe = (j) => (j.h === i ? j.a : j.h);
    const campanhaHtml = '<p>Em ' + jogosTxt(x.j) + ', foram ' + descr({ v: x.v, e: x.e, d: x.d }) + ', com ' + x.gp + ' gols marcados e ' + x.gc + ' sofridos (saldo de ' + (x.gp - x.gc > 0 ? '+' : '') + (x.gp - x.gc) + '). O aproveitamento é de ' + aprov({ v: x.v, e: x.e, d: x.d }) + ' dos pontos disputados.</p>' +
      '<p>Em casa: ' + descr(casa) + ' (' + aprov(casa) + ' de aproveitamento). Fora: ' + descr(fora) + ' (' + aprov(fora) + ').' +
      (jgDe(casa) && jgDe(fora) ? (ptsDe(casa) / jgDe(casa) > ptsDe(fora) / jgDe(fora) + 0.6 ? ' O mando de campo pesa: o time rende bem mais em casa.' : ptsDe(fora) / jgDe(fora) >= ptsDe(casa) / jgDe(casa) ? ' Curiosamente, rende tanto ou mais fora de casa.' : '') : '') + '</p>' +
      (ult.length ? '<p>Nos últimos ' + ult.length + ' jogos: ' + ult.map(frase).join('; ') + '.' + seqTxt + '</p>' : '') +
      (maior && maior.s > 0 ? '<p>A maior vitória foi ' + maior.gp + ' x ' + maior.gc + ' ' + (maior.j.h === i ? 'em casa' : 'fora') + ' contra ' + T[advDe(maior.j)].o + ' ' + esc(T[advDe(maior.j)].nome) +
        (pior && pior.s < 0 ? '; a maior derrota, ' + pior.gp + ' x ' + pior.gc + ' para ' + T[advDe(pior.j)].o + ' ' + esc(T[advDe(pior.j)].nome) : '') + '.</p>' : '');

    const outros = L.times.filter((u) => u.escudo && u.i !== i).sort((a, b) => posDe[a.i] - posDe[b.i]);
    const corpo = '<p class="kicker">Brasileirão 2026 · Série A</p>' +
      '<h1 class="h1-time">' + escudoRel(i, 48, volta) + '<span>' + esc(nm.nome) + ' no Brasileirão 2026</span></h1>' +
      '<p class="lead">' + lead + '</p>' +
      '<p class="cta"><a class="btn primario" href="' + volta + '#/simulador/' + t.slug + '">Simular os jogos ' + nm.do + ' ' + esc(nm.nome) + '</a></p>' +
      '<h2>Situação na tabela</h2>' + situacaoHtml +
      '<h2>As chances até o fim</h2>' + chancesHtml +
      '<h2>' + (meus.length === 1 ? 'O jogo que falta' : 'Os ' + meus.length + ' jogos que faltam') + '</h2>' + jogosHtml +
      '<h2>A campanha até aqui</h2>' + campanhaHtml +
      '<h2>Classificação completa</h2>' + tabelaClassif(volta, i) +
      '<h2>Como ler estes números</h2><p>As probabilidades de cada jogo vêm de um modelo que olha a força de ataque e de defesa de cada time em casa e fora, a campanha e a forma recente. Ele foi calibrado com os jogos já disputados do campeonato. Os detalhes estão em <a href="' + volta + 'como-funciona/">como funciona o simulador</a>; os desempates, em <a href="' + volta + 'criterios-de-desempate/">critérios de desempate</a>. O panorama de todos os times está em <a href="' + volta + 'brasileirao-2026/">Brasileirão 2026: tabela e chances</a>.</p>' +
      nota +
      '<h2>Os outros times</h2><ul class="times-lista">' + outros.map((u) => '<li>' + escudoRel(u.i, 20, volta) + linkTime(u.i, volta) + '</li>').join('') + '</ul>';
    const p = { caminho: 'simulador/' + t.slug + '/', og: 'simulador-' + t.slug, titulo: nm.nome + ' no Brasileirão 2026: chances e jogos que faltam',
      descricao: (sTit === 'garantido' ? nm.O + ' ' + nm.nome + ' é campeão. ' : '') + 'Chances ' + nm.do + ' ' + nm.nome + ' de título, Libertadores e rebaixamento, os jogos que faltam com as probabilidades e a campanha no Brasileirão 2026.' };
    gravar(p.caminho + 'index.html', casca(p, corpo, volta, { href: volta + '#/simulador/' + t.slug, rotulo: 'Simular', redirecionarComParametros: '#/simulador/' + t.slug }));
    paginas.push(p);
  });

  // ================================================================ panorama do campeonato
  {
    const volta = '../';
    const lider = tab[0];
    const comChance = ch.filter((c) => c.titulo >= 0.005).sort((a, b) => b.titulo - a.titulo);
    const emRisco = ch.filter((c) => c.rb >= 0.005 && c.rb <= 0.995).sort((a, b) => b.rb - a.rb);
    const caidos = L.times.filter((t) => sit(t.i, 'escapar') === 'impossivel');
    const livres = ch.filter((c) => c.rb < 0.005).length;
    const tituloTxt = comChance.length === 1 && comChance[0].titulo > 0.995
      ? (sit(comChance[0].i, 'titulo') === 'garantido' ? T[comChance[0].i].O + ' ' + linkTime(comChance[0].i, volta) + ' já é campeão.' : T[comChance[0].i].O + ' ' + linkTime(comChance[0].i, volta) + ' está praticamente com a mão na taça: é campeão em ' + pct(comChance[0].titulo) + ' das simulações.')
      : (comChance.length === 2 ? 'Só dois times ainda disputam a taça: ' : 'Ainda disputam o título: ') + comChance.map((c) => linkTime(c.i, volta) + ' (' + pct(c.titulo) + ')').join(', ').replace(/, ([^,]*)$/, ' e $1') + '.';
    const quase = ch.filter((c) => c.rb > 0.995 && sit(c.i, 'escapar') !== 'impossivel');
    const rbTxt = (caidos.length ? (caidos.length === 1 ? T[caidos[0].i].O + ' ' + linkTime(caidos[0].i, volta) + ' já está rebaixad' + T[caidos[0].i].o + '. ' : caidos.map((t) => linkTime(t.i, volta)).join(', ').replace(/, ([^,]*)$/, ' e $1') + ' já estão rebaixados. ') : '') +
      (quase.length ? (quase.length === 1 ? T[quase[0].i].O + ' ' + linkTime(quase[0].i, volta) + ' ainda não caiu na matemática, mas cai em mais de 99% das simulações. ' : quase.map((c) => linkTime(c.i, volta)).join(', ').replace(/, ([^,]*)$/, ' e $1') + ' ainda não caíram na matemática, mas caem em mais de 99% das simulações. ') : '') +
      (emRisco.length ? 'Ainda correm risco de cair: ' + emRisco.map((c) => linkTime(c.i, volta) + ' (' + pct(c.rb) + ')').join(', ').replace(/, ([^,]*)$/, ' e $1') + '. ' : '') +
      'Os outros ' + livres + ' times caem em menos de 1% das simulações.';
    const porRodada = {};
    L.jogos.filter((j) => !j.feito).forEach((j) => { const k = j.atrasado ? 'Jogos atrasados' : j.rodada ? 'Rodada ' + j.rodada : 'Sem rodada definida'; (porRodada[k] = porRodada[k] || []).push(j); });
    const ordemRod = (k) => (k === 'Jogos atrasados' ? 0 : +(k.match(/\d+/) || [999])[0]);
    const jogosHtml = Object.keys(porRodada).sort((a, b) => ordemRod(a) - ordemRod(b)).map((k) => '<h3>' + esc(k) + '</h3><div class="tabela-rola"><table class="tab tab-jogos"><thead><tr><th class="esq">Data</th><th class="esq">Jogo</th><th>Mandante</th><th>Empate</th><th>Visitante</th></tr></thead><tbody>' +
      porRodada[k].map((j) => { const p = M.prob(j.h, j.a); return '<tr><td class="esq">' + esc(diaJogo(j)) + '</td><td class="esq">' + linkTime(j.h, volta) + ' x ' + linkTime(j.a, volta) + '</td><td>' + pctCurto(p.ph) + '</td><td>' + pctCurto(p.pd) + '</td><td>' + pctCurto(p.pa) + '</td></tr>'; }).join('') +
      '</tbody></table></div>').join('');
    const chancesHtml = '<div class="tabela-rola"><table class="tab"><thead><tr><th>#</th><th class="esq">Time</th><th>Título</th><th>Libertadores</th><th>Sul-Americana</th><th>Rebaixamento</th></tr></thead><tbody>' +
      tab.map((x, k) => { const c = ch[x.i]; return '<tr><td>' + (k + 1) + '</td><td class="esq">' + escudoRel(x.i, 20, volta) + linkTime(x.i, volta) + '</td><td>' + pctCurto(c.titulo) + '</td><td>' + pctCurto(c.lib + (c.pre || 0)) + '</td><td>' + pctCurto(c.sula || 0) + '</td><td>' + pctCurto(c.rb) + '</td></tr>'; }).join('') +
      '</tbody></table></div><p class="legenda">Libertadores inclui a vaga da fase preliminar (até o ' + ordinal(ultPre) + '). Sul-Americana: terminar entre o ' + ordinal(Z.sula ? Z.sula.de : 0) + ' e o ' + ordinal(ultSula) + '.</p>';
    const corpo = '<p class="kicker">Série A · reta final</p><h1>Brasileirão 2026: tabela, jogos que faltam e chances</h1>' +
      '<p class="lead">Faltam ' + jogosTxt(faltam) + ' para o fim do Brasileirão 2026. ' + T[lider.i].O + ' ' + linkTime(lider.i, volta) + ' lidera com ' + pts(lider.pts) + ', ' +
      (lider.pts - tab[1].pts ? pts(lider.pts - tab[1].pts) + ' à frente ' + T[tab[1].i].do + ' ' + linkTime(tab[1].i, volta) : 'empatado em pontos com ' + T[tab[1].i].o + ' ' + linkTime(tab[1].i, volta)) + '.</p>' +
      '<p class="cta"><a class="btn primario" href="' + volta + '#/simulador">Simular o que falta</a></p>' +
      '<h2>A briga pelo título</h2><p>' + tituloTxt + '</p>' +
      '<h2>A luta contra o rebaixamento</h2><p>' + rbTxt + '</p>' +
      '<h2>Classificação</h2>' + tabelaClassif(volta, -1) +
      '<h2>Chances de cada time</h2><p>Resultado de ' + num(N_SIM) + ' simulações do que falta, cada placar sorteado pelas probabilidades do jogo e a tabela final montada com os <a href="' + volta + 'criterios-de-desempate/">critérios de desempate</a> do campeonato.</p>' + chancesHtml +
      '<h2>Os jogos que faltam</h2><p>Probabilidade de vitória do mandante, de empate e de vitória do visitante em cada partida, segundo o modelo explicado em <a href="' + volta + 'como-funciona/">como funciona</a>.</p>' + jogosHtml +
      nota;
    const p = { caminho: 'brasileirao-2026/', og: 'simulador', titulo: 'Brasileirão 2026: tabela, jogos que faltam e chances de cada time',
      descricao: 'Classificação do Brasileirão 2026, os jogos que faltam com as probabilidades e as chances de título, Libertadores, Sul-Americana e rebaixamento de cada time.' };
    gravar(p.caminho + 'index.html', casca(p, corpo, volta, { href: volta + '#/simulador', rotulo: 'Simular' }));
    paginas.push(p);
  }

  // ================================================================ jogos
  const JOGOS = [
    { id: 'draft', rota: '#/jogos/draft', og: 'draft', titulo: 'Football Draft: monte o seu XI e tente a campanha perfeita', descricao: 'Como jogar o Football Draft: sorteie times de várias épocas, escolha um jogador de cada e dispute Copa, Champions ou ligas. Grátis no computador e no Android.' },
    { id: 'milhao', rota: '#/jogos/milhao', og: 'milhao', titulo: 'Jogo do Milhão do Futebol: quiz com 16 perguntas valendo R$ 1 milhão', descricao: 'Como jogar o Jogo do Milhão do Futebol: 16 perguntas, quatro ajudas e mais de mil perguntas sobre futebol brasileiro, europeu e Copa do Mundo. Grátis no computador e no Android.' },
    { id: 'fast', rota: '#/jogos/fast', og: 'fast', titulo: 'Fast Football: partidas relâmpago numa arena redonda', descricao: 'Como jogar o Fast Football: partidas rápidas numa arena redonda com uma barra giratória, partida avulsa ou campeonato em mata-mata. Grátis no computador e no Android.' },
  ];
  JOGOS.forEach((g) => {
    const volta = '../../';
    const corpo = fs.readFileSync(path.join(raiz, 'textos/jogos', g.id + '.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '')
      .replace(/href="#\//g, 'href="' + volta + '#/').replace(/src="midia\//g, 'src="' + volta + 'midia/').replace(/href="(como-funciona|criterios-de-desempate|brasileirao-2026|jogar)\//g, 'href="' + volta + '$1/');
    const p = { caminho: 'jogar/' + g.id + '/', og: g.og, titulo: g.titulo, descricao: g.descricao };
    gravar(p.caminho + 'index.html', casca(p, corpo, volta, { href: volta + g.rota, rotulo: 'Jogar' }));
    paginas.push(p);
  });

  return paginas;
}

module.exports = gerar;

// conferência avulsa: gera numa pasta temporária e mostra o tamanho do texto de cada página
if (require.main === module) {
  const os = require('os');
  const raiz = path.resolve(__dirname, '..');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tng-paginas-'));
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const saidas = {};
  const gravar = (f, s) => { fs.mkdirSync(path.dirname(path.join(tmp, f)), { recursive: true }); fs.writeFileSync(path.join(tmp, f), s); saidas[f] = s; };
  const casca = (p, corpo) => '<title>' + esc(p.titulo) + '</title>' + corpo;
  const t0 = Date.now();
  const ps = gerar({ raiz, gravar, casca, esc });
  for (const f of Object.keys(saidas)) {
    const txt = saidas[f].replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    console.log(String(txt.split(/\s+/).filter(Boolean).length).padStart(5) + ' palavras  ' + f);
  }
  console.log(ps.length + ' páginas em ' + (Date.now() - t0) + ' ms → ' + tmp);
}

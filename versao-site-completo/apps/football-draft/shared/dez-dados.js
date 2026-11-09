// Football Draft: agregador dos dados (times, escudos, elencos reais). Cada competição fica num
// arquivo em shared/dados/ (selecoes.js, brasileirao.js, premier.js...), que no navegador entra por
// <script> antes deste e no Node é lido por require. O núcleo (dez-core.js) só lê DEZ_DADOS.
// Os ids (seleções, clubes, ligas) ficam salvos no aparelho (recordes, campanha): não renomear à toa.
//
// Formato de cada arquivo de competição:
//   times:   id|nome pt|nome en|nome es|SIGLA|cor1|cor2|escudo   (en/es vazios = repete o anterior;
//            escudo: "png" = app/img/escudos/<id>.png, vazio = desenhado: bandeira ou escudo SVG)
//   elencos: "= <timeId> <ano> [formação] [| nome da antecessora pt | en | es]" e um jogador por linha:
//            nome|curto|pos|num|força|idade|origem   (curto vazio = sobrenome)
(function (root) {
  'use strict';
  const NODE = typeof module !== 'undefined' && module.exports;
  // ordem fixa (não depende da ordem de carga dos scripts)
  const ARQUIVOS = ['selecoes', 'brasileirao', 'premier', 'laliga', 'seriea', 'bundesliga', 'ligue1'];
  const brutos = NODE ? ARQUIVOS.map((a) => require('./dados/' + a + '.js')) : (root.DEZ_BRUTO || []);
  const porId = {};
  brutos.forEach((b) => { porId[b.id] = b; });

  const POS = ['GK', 'RB', 'CB', 'LB', 'DM', 'CM', 'AM', 'RW', 'LW', 'ST'];
  const linhas = (txt) => String(txt || '').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('//'));
  // curto padrão: o sobrenome, com partícula (van Dijk, De Bruyne, dos Santos)
  const PARTICULAS = /^(van|von|de|der|den|da|das|do|dos|di|del|della|le|la|ter|ten|mac|st\.?)$/i;
  function curtoPadrao(nome) {
    const p = nome.split(/\s+/);
    if (p.length === 1) return nome;
    let k = p.length - 1;
    while (k > 1 && PARTICULAS.test(p[k - 1])) k--;
    return p.slice(k).join(' ');
  }
  function lerTimes(b, extra) {
    return linhas(b.times).map((l) => {
      const [id, pt, en, es, sigla, c1, c2, img] = l.split('|').map((s) => (s || '').trim());
      return Object.assign({ id, nome: { pt, en: en || pt, es: es || en || pt }, sigla, cores: [c1, c2], img: img === 'png' }, extra);
    });
  }
  const elencos = {}; // 'timeId@ano' -> { formacao, jogadores: [{ nome, curto, pos, num, forca, idade, origem }] }
  const erros = [];
  function lerElencos(b) {
    let atual = null;
    linhas(b.elencos).forEach((l) => {
      if (l.startsWith('=')) {
        // "= alemanha 1974 4-3-3 | Alemanha Ocidental | West Germany | Alemania Occidental"
        const [cab, pt, en, es] = l.slice(1).split('|').map((s) => s.trim());
        const [timeId, ano, formacao] = cab.split(/\s+/);
        const key = timeId + '@' + ano;
        if (elencos[key]) erros.push('elenco repetido: ' + key);
        atual = elencos[key] = { time: timeId, ano: +ano, formacao: formacao || null, jogadores: [] };
        if (pt) atual.apelido = { pt, en: en || pt, es: es || en || pt };
        return;
      }
      if (!atual) { erros.push(b.id + ': jogador fora de elenco: ' + l); return; }
      const [nome, curto, pos, num, forca, idade, origem] = l.split('|').map((s) => (s || '').trim());
      if (!POS.includes(pos)) erros.push(atual.time + '@' + atual.ano + ': posição inválida em "' + l + '"');
      atual.jogadores.push({ nome, curto: curto || curtoPadrao(nome), pos, num: +num || 0, forca: +forca, idade: +idade || 0, origem: origem || '' });
    });
  }
  brutos.forEach(lerElencos);

  const sel = porId.selecoes || { times: '' };
  const selecoes = lerTimes(sel, { tipo: 'selecao', origem: sel.origem || 'en' });
  const ligas = ARQUIVOS.filter((a) => a !== 'selecoes' && porId[a]).map((a) => {
    const b = porId[a];
    const lg = { id: b.id, origem: b.origem };
    lg.clubes = lerTimes(b, { tipo: 'clube', liga: b.id, origem: b.origem });
    return lg;
  });
  // anos de cada time que existem nos dados
  const anos = {};
  Object.values(elencos).forEach((e) => { (anos[e.time] = anos[e.time] || []).push(e.ano); });
  Object.values(anos).forEach((l) => l.sort((x, y) => x - y));

  const DADOS = { selecoes, ligas, elencos, anos, erros, curtoPadrao };
  if (NODE) module.exports = DADOS;
  else root.DEZ_DADOS = DADOS;
})(typeof window !== 'undefined' ? window : this);

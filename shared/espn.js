/* Tapa na Gaveta · dados da ESPN (API pública não oficial, sem chave, CORS liberado).
   Camadas: ESPN ao vivo → último retrato guardado no aparelho (tng.espn.cache) → retrato publicado
   com o site (dados/brasileirao-2026.json). O site nunca abre vazio.
   As funções converter() e mesclar() são puras (testadas no Node); carregar() usa fetch.
   Regras conferidas em 07/11/2026 (ver ferramentas/baixar_espn.py): só o formato de mês AAAAMM
   funciona; a ESPN não informa a rodada; o jogo adiado continua listado como STATUS_POSTPONED e a
   remarcação vem com outro id. */
(function (raiz, fabrica) {
  'use strict';
  const api = fabrica();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else raiz.TNGEspn = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const BASE = 'https://site.api.espn.com/apis/site/v2/sports/soccer/';
  const FEITO = /FULL_TIME|FINAL/;

  // eventos do scoreboard → jogos no formato do retrato
  function converter(sb) {
    const out = [];
    ((sb && sb.events) || []).forEach((ev) => {
      try {
        const c = ev.competitions[0];
        const st = c.status.type.name;
        const casa = c.competitors.find((x) => x.homeAway === 'home'), fora = c.competitors.find((x) => x.homeAway === 'away');
        if (!casa || !fora) return;
        const feito = FEITO.test(st);
        out.push({
          id: String(ev.id), data: ev.date, horario_definido: c.timeValid !== false, status: st,
          mandante: String(casa.team.id), visitante: String(fora.team.id),
          gols_mandante: feito ? parseInt(casa.score, 10) : null, gols_visitante: feito ? parseInt(fora.score, 10) : null,
          forma_mandante: casa.form || null, forma_visitante: fora.form || null,
          ao_vivo: /IN_PROGRESS|HALFTIME|FIRST_HALF|SECOND_HALF/.test(st) ? { gm: parseInt(casa.score, 10) || 0, gv: parseInt(fora.score, 10) || 0, relogio: (c.status.displayClock || '') } : null,
        });
      } catch (e) { /* evento num formato inesperado: ignora só ele */ }
    });
    return out;
  }

  // prioridade de um jogo para o mesmo confronto (mandante, visitante): terminado > marcado > adiado
  const peso = (j) => (FEITO.test(j.status) ? 3 : j.status === 'STATUS_POSTPONED' ? 1 : 2);

  // junta os jogos novos ao retrato. O confronto (mandante, visitante) é único no turno e returno:
  // é a chave, e não o id (a remarcação de um adiado vem com outro id).
  function mesclar(retrato, novos) {
    const times = {};
    retrato.times.forEach((t) => { times[t.id] = 1; });
    const porPar = {};
    retrato.jogos.forEach((j) => { porPar[j.mandante + '>' + j.visitante] = j; });
    let mudou = 0;
    novos.forEach((n) => {
      if (!times[n.mandante] || !times[n.visitante]) return;      // time fora da liga: ignora
      const k = n.mandante + '>' + n.visitante, v = porPar[k];
      if (!v) { porPar[k] = n; mudou++; return; }
      if (peso(n) > peso(v) || (peso(n) === peso(v) && (n.status !== v.status || n.data !== v.data || n.gols_mandante !== v.gols_mandante || n.gols_visitante !== v.gols_visitante || !!n.ao_vivo !== !!v.ao_vivo))) {
        porPar[k] = n; mudou++;
      }
    });
    const jogos = Object.keys(porPar).map((k) => porPar[k]).sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : 0));
    return Object.assign({}, retrato, { jogos, mudou });
  }

  // meses que ainda importam: do mês do primeiro jogo não terminado até o mês do último jogo
  function mesesAbertos(retrato) {
    const abertos = retrato.jogos.filter((j) => !FEITO.test(j.status));
    if (!abertos.length) return [];
    const ini = abertos[0].data.slice(0, 7), fim = abertos[abertos.length - 1].data.slice(0, 7);
    const out = [];
    let [a, m] = ini.split('-').map(Number);
    const [af, mf] = fim.split('-').map(Number);
    while (a < af || (a === af && m <= mf)) { out.push(a + String(m).padStart(2, '0')); m++; if (m > 12) { m = 1; a++; } }
    return out;
  }

  function comTempo(p, ms) {
    return Promise.race([p, new Promise((_, falha) => setTimeout(() => falha(new Error('tempo esgotado')), ms))]);
  }

  // busca os meses abertos na ESPN e mescla. Falha → rejeita (quem chama cai para o cache/retrato).
  function atualizar(retrato, opts) {
    const o = Object.assign({ liga: 'bra.1', tempo: 8000, fetch: (typeof fetch !== 'undefined' ? (u) => fetch(u) : null) }, opts || {});  // fetch solto perde o this (Illegal invocation)
    if (!o.fetch) return Promise.reject(new Error('sem fetch'));
    const meses = mesesAbertos(retrato);
    if (!meses.length) return Promise.resolve(Object.assign({}, retrato, { mudou: 0 }));
    return comTempo(Promise.all(meses.map((mes) =>
      o.fetch(BASE + o.liga + '/scoreboard?dates=' + mes + '&limit=300').then((r) => {
        if (!r.ok) throw new Error('ESPN ' + r.status);
        return r.json();
      }))), o.tempo).then((lista) => {
      const novos = [].concat.apply([], lista.map(converter));
      if (!novos.length) throw new Error('ESPN sem jogos');
      return Object.assign(mesclar(retrato, novos), { baixado_em: new Date().toISOString(), fonte_ao_vivo: true });
    });
  }

  return { converter, mesclar, mesesAbertos, atualizar };
});

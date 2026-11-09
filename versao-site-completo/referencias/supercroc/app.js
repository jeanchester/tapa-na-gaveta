/* SuperCroc · Vestibulares Resolvidos
 * App de página única, sem build: o mesmo arquivo roda no navegador e dentro do Capacitor.
 * Seções: base · armazenamento · conteúdo · texto rico · ícones e mascote · telas · rotas · início
 */
(function () {
  'use strict';

  // ================================================================== base
  const RELEASE = !!window.SUPERCROC_RELEASE;
  const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  const nativePlugin = (name) => (NATIVE && window.Capacitor.Plugins && window.Capacitor.Plugins[name]) || null;
  const CONTENT = '../shared/content/';
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ================================================================== armazenamento (nunca derruba o app)
  // As chaves ficam salvas no aparelho: não renomear (renomear apaga o progresso de quem já usa).
  const KEY = { answers: 'supercroc.respostas', favs: 'supercroc.favoritos', last: 'supercroc.ultima', theme: 'supercroc.tema', filtro: 'supercroc.filtro', drafts: 'supercroc.rascunhos', plano: 'supercroc.plano', revisao: 'supercroc.revisao', registro: 'supercroc.registro' };
  const loadJson = (key) => {
    try {
      const v = JSON.parse(localStorage.getItem(key) || 'null');
      return v && typeof v === 'object' ? v : {};
    } catch (e) { return {}; }
  };
  const saveJson = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } };
  const loadStr = (key, def) => { try { const v = localStorage.getItem(key); return v == null ? def : v; } catch (e) { return def; } };
  const saveStr = (key, v) => { try { localStorage.setItem(key, v); } catch (e) { /* sem armazenamento */ } };

  const answers = loadJson(KEY.answers);           // { 'fuvest-2021-1f/9': { l: 'A', ok: true, t: 1690000000000 } }
  const qkey = (provaId, n) => provaId + '/' + n;
  function setAnswer(provaId, n, letter, ok) {
    answers[qkey(provaId, n)] = { l: letter, ok: !!ok, t: Date.now() };
    saveJson(KEY.answers, answers);
    revisar(qkey(provaId, n), ok);
  }
  // revisão das erradas: a questão errada volta em 3 dias; acertando quando ela volta, volta de novo
  // em 10 e depois em 30, e sai da revisão. Errou de novo, recomeça. Acertar antes da hora não adianta.
  const DIA = 86400000, REV_DIAS = [3, 10, 30];
  const revisao = loadJson(KEY.revisao);          // { 'fuvest-2021-1f/9': { s: 0, due: 1690000000000 } } (s = voltas acertadas)
  function revisar(k, ok) {
    const r = revisao[k], agora = Date.now();
    if (!ok) revisao[k] = { s: 0, due: agora + REV_DIAS[0] * DIA };
    else if (r && agora >= r.due - DIA / 2) {
      if (r.s + 1 >= REV_DIAS.length) delete revisao[k];
      else revisao[k] = { s: r.s + 1, due: agora + REV_DIAS[r.s + 1] * DIA };
    } else return;
    saveJson(KEY.revisao, revisao);
  }
  function clearAnswer(provaId, n) {
    delete answers[qkey(provaId, n)];
    saveJson(KEY.answers, answers);
  }
  const correctCount = () => Object.values(answers).filter((a) => a && a.ok).length;

  // ================================================================== conteúdo
  const cache = {};
  function getJson(path) {
    if (!cache[path]) {
      cache[path] = fetch(CONTENT + path).then((r) => {
        if (!r.ok) throw new Error(path + ': HTTP ' + r.status);
        return r.json();
      }).catch((e) => { delete cache[path]; throw e; });
    }
    return cache[path];
  }
  const svgCache = {};
  function getSvg(path) {
    if (!svgCache[path]) {
      svgCache[path] = fetch(CONTENT + path).then((r) => (r.ok ? r.text() : '')).catch(() => '');
    }
    return svgCache[path];
  }

  let TAX = null;               // taxonomia
  let EXAMS = [];               // índice das provas
  const examData = {};          // id -> prova.json
  const materia = (id) => (TAX && TAX.materias.find((m) => m.id === id)) || { id, nome: id, sigla: '?', cor: '#888', assuntos: [] };
  const assunto = (mid, aid) => (materia(mid).assuntos.find((a) => a.id === aid) || { nome: aid }).nome;
  // questões discursivas (2ª fase): o aluno se autoavalia em cada item ('ok', 'meio', 'erro').
  // A questão conta como acerto só quando todos os itens foram avaliados como 'ok'.
  const discursiva = (q) => q.tipo === 'discursiva' || q.tipo === 'redacao';
  function setItemGrade(provaId, n, q, letra, nota) {
    const k = qkey(provaId, n), prev = answers[k] && answers[k].it ? answers[k].it : {};
    const it = Object.assign({}, prev, { [letra]: nota });
    const todos = (q.itens || []).every((x) => it[x.letra]);
    answers[k] = { l: '', it, ok: todos && (q.itens || []).every((x) => it[x.letra] === 'ok'), t: Date.now() };
    saveJson(KEY.answers, answers);
    if (todos) revisar(k, answers[k].ok);
  }
  // marca da questão no grade da prova: ✓ tudo certo, ✕ algum item errado, ½ o resto
  function markOf(a) {
    if (!a) return '';
    if (!a.it) return a.ok ? 'ok' : 'bad';
    const v = Object.values(a.it);
    return a.ok ? 'ok' : v.indexOf('erro') >= 0 ? 'bad' : 'mid';
  }
  const MARK_TXT = { ok: '✓', bad: '✕', mid: '½' };
  const drafts = loadJson(KEY.drafts);           // { 'fuvest-2026-2f-d1/1/a': 'texto do aluno' }
  let draftTimer = 0;
  function saveDraft(key, txt) {
    if (txt) drafts[key] = txt; else delete drafts[key];
    clearTimeout(draftTimer);
    draftTimer = setTimeout(() => saveJson(KEY.drafts, drafts), 400);
  }

  // matérias da questão: a principal e, só nas realmente interdisciplinares, as de "materias_extra"
  const pares = (q) => [{ materia: q.materia, assunto: q.assunto }].concat(q.materias_extra || []);
  const temMateria = (q, mid) => pares(q).some((x) => x.materia === mid);

  function loadExam(id) {
    if (examData[id]) return Promise.resolve(examData[id]);
    const meta = EXAMS.find((e) => e.id === id);
    if (!meta) return Promise.reject(new Error('Prova não encontrada: ' + id));
    return getJson('provas/' + meta.arquivo).then((p) => {
      p.base = 'provas/' + meta.arquivo.replace(/[^/]+$/, '');
      p.byN = {};
      p.questoes.forEach((q) => { p.byN[q.n] = q; q.prova = p; });
      p.resolved = p.questoes.map((q) => q.n).sort((a, b) => a - b);
      p.inicio = p.inicio || 1;                  // ENEM dia 2 começa na 91
      p.fim = p.inicio + p.total - 1;
      p.extras = p.questoes.filter((q) => q.n > p.fim);   // variantes (ex.: questões 1–5 em espanhol, n = 1001–1005)
      examData[id] = p;
      return p;
    });
  }
  const loadAllExams = () => Promise.all(EXAMS.map((e) => loadExam(e.id).catch(() => null)));
  function subjectOf(p, n) {
    if (p.byN[n]) return p.byN[n].materia;
    const f = (p.faixas || []).find((x) => n >= x.de && n <= x.ate);
    return f ? f.materia : null;
  }
  const examTitle = (p) => p.vestibular + ' ' + p.ano + ' · ' + p.fase;
  const rotulo = (q) => q.rotulo || String(q.n);
  const tituloQ = (q) => q.tipo === 'redacao' ? 'Redação' : 'Questão ' + rotulo(q) + (q.variante ? ' · ' + q.variante : '');

  // ================================================================== texto rico
  // $...$ = fórmula (KaTeX), **negrito**, *itálico*, __sublinhado__. O resto é escapado.
  // \mathrm{A + B \to C} vira \mathrm{A} + \mathrm{B} \to \mathrm{C}: o KaTeX só quebra a linha no nível de fora,
  // e assim a equação química longa pode quebrar depois do + e da seta (o desenho fica igual)
  const OPS_QUEBRA = /^(\+|=|\\to|\\rightarrow|\\longrightarrow|\\rightleftharpoons|\\leftrightarrows|\\leftrightarrow)(?![a-zA-Z])/;
  function quebravel(tex) {
    let out = '', i = 0;
    while (i < tex.length) {
      const k = tex.indexOf('\\mathrm{', i);
      if (k < 0) { out += tex.slice(i); break; }
      let j = k + 8, nivel = 1;
      while (j < tex.length && nivel) { if (tex[j] === '{') nivel++; else if (tex[j] === '}') nivel--; j++; }
      if (nivel) { out += tex.slice(i); break; }
      const dentro = tex.slice(k + 8, j - 1), partes = [];
      let ini = 0, d = 0;
      for (let c = 0; c < dentro.length; c++) {
        const ch = dentro[c];
        if (ch === '{') d++; else if (ch === '}') d--;
        else if (ch === '\\' && dentro[c + 1] !== '\\' && !OPS_QUEBRA.test(dentro.slice(c))) c++;
        else if (!d && (ch === '+' || ch === '=' || ch === '\\')) {
          const op = OPS_QUEBRA.exec(dentro.slice(c));
          const antes = dentro.slice(0, c).trimEnd();
          // o + de carga (H^+, ^{2+}) e o que vem logo depois de ^ ou _ não são operadores
          if (op && antes && !/[\^_]$/.test(antes) && (ch !== '+' || /\s/.test(dentro[c - 1] || ''))) {
            partes.push(dentro.slice(ini, c), op[0]);
            ini = c + op[0].length; c = ini - 1;
          }
        }
      }
      partes.push(dentro.slice(ini));
      out += tex.slice(i, k) + (partes.length < 3 ? tex.slice(k, j)
        : partes.map((p, n) => (n % 2 ? ' ' + p + ' ' : p.trim() ? '\\mathrm{' + p.trim() + '}' : '')).join(''));
      i = j;
    }
    return out;
  }
  function katexHtml(tex, display) {
    if (!display && tex.includes('\\mathrm{')) tex = quebravel(tex);
    try { return window.katex.renderToString(tex, { displayMode: !!display, throwOnError: false, strict: false }); }
    catch (e) { return '<code>' + esc(tex) + '</code>'; }
  }
  function rich(s) {
    // a pontuação colada na fórmula vai junto com ela (senão o ponto final quebra sozinho para a linha de baixo)
    // (e o parêntese ou aspas de abertura colados antes dela também)
    const parts = String(s == null ? '' : s).split(/([(\[“]?\$[^$]+\$[.,;:!?)\]”]*)/g);
    return parts.map((part) => {
      const m = /^([(\[“]?)\$([^$]+)\$([.,;:!?)\]”]*)$/.exec(part);
      if (m) return '<span class="nw">' + esc(m[1]) + katexHtml(m[2], false) + esc(m[3]) + '</span>';
      return esc(part).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/__(.+?)__/g, '<u>$1</u>');
    }).join('');
  }

  // blocos de conteúdo (enunciado e resolução); figuras SVG entram depois, por fetch
  function blocks(list, base) {
    return (list || []).map((b) => block(b, base)).join('');
  }
  function block(b, base) {
    const width = (b.w ? ' style="max-width:' + Math.round(b.w * 100) + '%"' : '');
    if (b.p != null) return '<p>' + rich(b.p) + '</p>';
    if (b.eq != null) return '<div class="eq">' + katexHtml(b.eq, true) + '</div>';
    if (b.img) return '<div class="paper"' + width + '><img src="' + esc(CONTENT + base + b.img) + '" alt="' + esc(b.alt) + '"></div>' + (b.legenda ? '<div class="figcap">' + rich(b.legenda) + '</div>' : '');
    if (b.fig) return '<div class="figure"' + width + '><div class="svg-slot" data-src="' + esc(base + b.fig) + '" role="img" aria-label="' + esc(b.alt) + '"></div>' + (b.legenda ? '<div class="figcap">' + rich(b.legenda) + '</div>' : '') + '</div>';
    if (b.lista) return '<ul>' + b.lista.map((x) => '<li>' + rich(x) + '</li>').join('') + '</ul>';
    if (b.tabela) {
      return '<div class="tbl' + (b.tabela.larga ? ' larga' : '') + (b.tabela.cab.length >= 8 ? ' compacta' : '') + '"><table><thead><tr>' + b.tabela.cab.map((c) => '<th>' + rich(c) + '</th>').join('') + '</tr></thead><tbody>' +
        b.tabela.linhas.map((l) => '<tr>' + l.map((c, i) => '<td data-label="' + esc(b.tabela.cab[i] || '') + '">' + rich(c) + '</td>').join('') + '</tr>').join('') + '</tbody></table></div>';
    }
    if (b.nota) return '<div class="nota"><b>Note e adote</b>' + String(b.nota).split(/\n/).map((l) => '<div>' + rich(l) + '</div>').join('') + '</div>';
    // texto de terceiros protegido por direito autoral: o app traz só a referência e um resumo próprio
    if (b.texto_base) return '<div class="texto-base"><b>Texto-base</b><div class="tb-ref">' + rich(b.fonte || '') + '</div><p>' + rich(b.texto_base) + '</p>' +
      '<small>O texto completo não é reproduzido aqui por direitos autorais. Leia na prova original' + (b.pagina ? ', página ' + esc(b.pagina) : '') + '.</small></div>';
    if (b.citacao) return '<blockquote>' + String(b.citacao).split(/\n/).map(rich).join('<br>') + (b.fonte ? '<footer>' + rich(b.fonte) + '</footer>' : '') + '</blockquote>';
    if (b.passo) return '<div class="card step"><h3>' + rich(b.passo) + '</h3>' + blocks(b.c, base) + '</div>';
    if (b.dica) return '<div class="callout tip">' + ICON.tip + '<div><b>Pulo do croc</b>' + rich(b.dica) + '</div></div>';
    if (b.polemica) return '<div class="callout warn polemica">' + ICON.warn + '<div><b>Gabarito polêmico</b>' + rich(b.polemica) + '</div></div>';
    if (b.alerta) return '<div class="callout warn">' + ICON.warn + '<div><b>Cuidado</b>' + rich(b.alerta) + '</div></div>';
    return '';
  }
  function hydrateSvgs(root) {
    $$('.svg-slot', root).forEach((el) => {
      getSvg(el.dataset.src).then((txt) => { if (txt) el.innerHTML = txt; });
    });
  }

  // ================================================================== ícones e mascote
  // mascote (shared/images/croc/*.webp). Poses: cabeca, em-pe, tres-quartos, desafio, lousa, comemora, animo, topo
  const CROC = (pose) => '<img class="croc croc-' + pose + '" src="../shared/images/croc/' + pose + '.webp" alt="" draggable="false">';
  const ICON = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M3 5h18l-7 8v5l-4 2v-7z"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
    starOn: '<svg viewBox="0 0 24 24" fill="#f2b632" stroke="#f2b632" stroke-width="2" stroke-linejoin="round"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/></svg>',
    redo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    pen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    tip: '<svg class="ic" viewBox="0 0 34 34"><circle cx="17" cy="17" r="16" fill="#f2b632"/><path d="M17 8a6.5 6.5 0 00-3.8 11.8c.6.5.9 1.1.9 1.9V23h5.8v-1.3c0-.8.3-1.4.9-1.9A6.5 6.5 0 0017 8z" fill="#fff"/><rect x="14" y="24.5" width="6" height="2.4" rx="1.2" fill="#fff"/></svg>',
    warn: '<svg class="ic" viewBox="0 0 34 34"><circle cx="17" cy="17" r="16" fill="#e0533d"/><rect x="15.3" y="8" width="3.4" height="12" rx="1.7" fill="#fff"/><circle cx="17" cy="25" r="2.1" fill="#fff"/></svg>',
  };
  const vidIcon = '<svg class="vid" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';

  // níveis do croc: "torne-se o topo da cadeia vestibular"
  const LEVELS = [
    { min: 0, nome: 'Ovo de croc', sub: 'Acerte a primeira questão para chocar.' },
    { min: 1, nome: 'Filhote', sub: 'Já saiu da casca.' },
    { min: 5, nome: 'Croc do brejo', sub: 'Começando a morder.' },
    { min: 15, nome: 'Croc do rio', sub: 'Ninguém atravessa o seu rio.' },
    { min: 40, nome: 'Croc-de-água-salgada', sub: 'O maior réptil vivo do planeta.' },
    { min: 100, nome: 'Topo da cadeia', sub: 'Topo da cadeia vestibular.' },
  ];
  function levelInfo(n) {
    let i = 0;
    while (i + 1 < LEVELS.length && n >= LEVELS[i + 1].min) i++;
    const cur = LEVELS[i], next = LEVELS[i + 1];
    const pct = next ? (n - cur.min) / (next.min - cur.min) : 1;
    return { cur, next, pct, i };
  }

  // ================================================================== topo
  function topbar(opts) {
    const tb = $('#topbar');
    const themeBtn = '<button class="tb-btn" data-act="theme" aria-label="Trocar tema">' + ICON.moon + '</button>';
    if (opts.home) {
      const seq = diasSeguidos();
      tb.innerHTML = '<div class="tb"><div class="tb-brand">' + CROC('cabeca') + '<b>Super<span>Croc</span></b></div>' +
        '<button class="tb-seq' + (seq ? '' : ' apagado') + '" data-go="#/sequencia" aria-label="' + plural(seq, 'dia seguido', 'dias seguidos') + '">' + ICON_FOGO + '<b>' + seq + '</b></button>' +
        '<button class="tb-btn" data-go="#/filtrar" aria-label="Filtrar questões">' + ICON.filter + '</button>' + themeBtn + '</div>';
    } else {
      tb.innerHTML = '<div class="tb"><div class="tb-nav"><button class="tb-btn" data-act="back" aria-label="Voltar">' + ICON.back + '</button>' +
        '<button class="tb-btn" data-act="home" aria-label="Ir para o início">' + ICON.home + '</button></div>' +
        '<div class="tb-title">' + esc(opts.title) + (opts.sub ? '<small>' + esc(opts.sub) + '</small>' : '') + '</div>' +
        (opts.right || '') + themeBtn + '</div>';
    }
  }
  function applyTheme() {
    const t = loadStr(KEY.theme, 'auto');
    if (t === 'auto') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', t);
  }
  function cycleTheme() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark' ||
      (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    saveStr(KEY.theme, dark ? 'light' : 'dark');
    applyTheme();
    toast(dark ? 'Tema claro' : 'Tema escuro');
  }
  let toastTimer = 0;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('on'), 1600);
  }

  // ================================================================== tela: início
  function viewHome() {
    topbar({ home: true });
    return loadAllExams().then(() => {
      const n = correctCount();
      const lv = levelInfo(n);
      const last = loadJson(KEY.last);
      const lastQ = last.prova && examData[last.prova] && examData[last.prova].byN[last.n];
      let html = '<section class="hero"><div class="hero-in">' + CROC('topo') +
        '<div><h1>Super<span>Croc</span></h1><p>Vestibulares resolvidos, passo a passo.</p><p class="slogan">Torne-se o topo da cadeia vestibular.</p></div></div></section>';

      html += '<div class="card level"><div class="level-badge">' + CROC('cabeca') + '</div><div class="level-info">' +
        '<div class="level-name">' + esc(lv.cur.nome) + '</div><div class="level-sub">' +
        (lv.next ? n + ' acerto' + (n === 1 ? '' : 's') + ' · faltam ' + (lv.next.min - n) + ' para ' + esc(lv.next.nome) : esc(lv.cur.sub)) +
        '</div><div class="bar"><i style="width:' + Math.round(lv.pct * 100) + '%"></i></div></div></div>';

      html += cartaoPlano();

      if (lastQ) {
        html += '<div class="section-title"><h2>Continuar</h2></div>' +
          '<button class="card continue tap" data-go="#/q/' + lastQ.prova.id + '/' + lastQ.n + '"><span class="play">' + ICON.play + '</span>' +
          '<span class="grow"><b>' + esc(examTitle(lastQ.prova)) + ' · ' + esc(tituloQ(lastQ)) + '</b><small>' + esc(materia(lastQ.materia).nome + ' · ' + assunto(lastQ.materia, lastQ.assunto)) + '</small></span>' + ICON.chev + '</button>';
      }

      const nf = filtradas().length;
      html += '<button class="card filter-cta tap" data-go="#/filtrar"><span class="play">' + ICON.filter + '</span><span class="grow"><b>Filtrar questões</b><small>' +
        (filtroAtivo() ? nf + ' quest' + (nf === 1 ? 'ão' : 'ões') + ' no seu filtro' : 'Escolha matérias, vestibulares, anos, dificuldade...') + '</small></span>' + ICON.chev + '</button>';

      html += '<div class="section-title"><h2>Provas</h2></div><div class="grid-2">';
      EXAMS.forEach((e) => {
        const p = examData[e.id];
        const done = p ? p.resolved.filter((k) => answers[qkey(p.id, k)]).length : 0;
        const res = p ? p.resolved.length : 0;
        html += '<button class="card exam-card tap" data-go="#/prova/' + e.id + '"><span class="exam-logo">' + esc(e.vestibular) + '<b>' + String(e.ano).slice(2) + '</b></span>' +
          '<span class="grow"><h3>' + esc(e.vestibular + ' ' + e.ano) + '</h3><span class="exam-meta">' + esc(e.fase) + ' · ' + res + ' de ' + e.total + ' resolvidas · ' + done + ' feitas</span>' +
          '<div class="bar"><i style="width:' + (res ? Math.round(done / res * 100) : 0) + '%"></i></div></span>' + ICON.chev + '</button>';
      });
      html += '</div>';

      html += '<div class="section-title"><h2>Estudar por matéria</h2></div><div class="subjects">';
      TAX.materias.forEach((m) => {
        const count = allResolved().filter((q) => temMateria(q, m.id)).length;
        html += '<button class="card subject tap' + (count ? '' : ' empty') + '" data-go="#/materia/' + m.id + '"><span class="sig" style="background:' + m.cor + '">' + esc(m.sigla) + '</span>' +
          '<span><b>' + esc(m.nome) + '</b><small>' + (count ? count + ' resolvida' + (count === 1 ? '' : 's') : 'em breve') + '</small></span></button>';
      });
      html += '</div><div class="foot">SuperCroc · versão de teste' + (RELEASE ? '' : ' (desenvolvimento)') + '</div>';
      return html;
    });
  }

  // ================================================================== tela: início nova (em teste desde 2026-11-03)
  // Aprovada pelo autor em 2026-11-03. A antiga (viewHome, acima) continua no código: INICIO_NOVO = false a traz de volta.
  const INICIO_NOVO = true;
  function cartaoProva(e) {
    const p = examData[e.id];
    const done = p ? p.resolved.filter((k) => answers[qkey(p.id, k)]).length : 0, res = p ? p.resolved.length : 0;
    return '<button class="card exam-card tap" data-go="#/prova/' + e.id + '"><span class="exam-logo">' + esc(e.vestibular) + '<b>' + String(e.ano).slice(2) + '</b></span>' +
      '<span class="grow"><h3>' + esc(e.vestibular + ' ' + e.ano) + '</h3><span class="exam-meta">' + esc(e.fase) + ' · ' + res + ' de ' + e.total + ' resolvidas · ' + done + ' feitas</span>' +
      '<div class="bar"><i style="width:' + (res ? Math.round(done / res * 100) : 0) + '%"></i></div></span>' + ICON.chev + '</button>';
  }
  function viewHomeNova() {
    fecharDias();
    topbar({ home: true });
    return loadAllExams().then(() => {
      const n = correctCount(), lv = levelInfo(n), all = allResolved();
      const feitas = all.filter((q) => answers[chave(q)]).length;
      const last = loadJson(KEY.last);
      const lastQ = last.prova && examData[last.prova] && examData[last.prova].byN[last.n];
      // topo: marca, slogan e o nível do croc juntos
      let html = '<section class="hero in-hero"><div class="hero-in">' + CROC('topo') + '<div class="grow"><h1>Super<span>Croc</span></h1><p class="slogan">Torne-se o topo da cadeia vestibular.</p>' +
        '<div class="in-placas">' + cartaoSequencia() + '<div class="in-nivel"><div class="in-nivel-top"><b>' + esc(lv.cur.nome) + '</b><span>' + plural(n, 'acerto', 'acertos') + (feitas ? ' · ' + Math.round(n / feitas * 100) + '%' : '') + '</span></div>' +
        '<div class="bar"><i style="width:' + Math.round(lv.pct * 100) + '%"></i></div><small>' + (lv.next ? 'Faltam ' + (lv.next.min - n) + ' para ' + esc(lv.next.nome) : esc(lv.cur.sub)) + '</small></div></div></div></div></section>';

      // para hoje: a contagem regressiva (se o plano tem vestibular), o plano e a última questão
      html += '<div class="section-title"><h2>Para hoje</h2></div>' + contagemHtml() + '<div class="grid-2 in-hoje">' + cartaoPlano().replace('plan-card', 'plan-card in-card');
      if (lastQ) {
        html += '<button class="card continue in-card tap" data-go="#/q/' + lastQ.prova.id + '/' + lastQ.n + '"><span class="play">' + ICON.play + '</span>' +
          '<span class="grow"><b>Continuar: ' + esc(examTitle(lastQ.prova)) + ' · ' + esc(tituloQ(lastQ)) + '</b><small>' + esc(materia(lastQ.materia).nome + ' · ' + assunto(lastQ.materia, lastQ.assunto)) + '</small></span>' + ICON.chev + '</button>';
      }
      html += '</div>';

      // atalhos: o filtro e três filtros prontos
      const favs = Object.keys(loadJson(KEY.favs)).length;
      const erradas = all.filter((q) => valores(q, 'sit').indexOf('errei') >= 0).length, videos = all.filter((q) => q.video).length;
      const atalho = (attrs, icon, cor, titulo, sub) => '<button class="card in-atalho tap" ' + attrs + '><span class="in-ic" style="background:' + cor + '">' + icon + '</span><b>' + titulo + '</b><small>' + sub + '</small></button>';
      html += '<div class="in-atalhos">' +
        atalho('data-go="#/filtrar"', ICON.filter, 'var(--brand-deep)', 'Filtrar', filtroAtivo() ? plural(filtradas().length, 'questão', 'questões') : 'do seu jeito') +
        atalho('data-act="atalho" data-g="sit" data-v="errei"', ICON.redo, 'var(--bad)', 'Erradas', plural(erradas, 'questão', 'questões')) +
        atalho('data-act="atalho" data-g="sit" data-v="favorita"', ICON.starOn.replace(/#f2b632/g, '#fff'), 'var(--amber)', 'Favoritas', plural(favs, 'questão', 'questões')) +
        atalho('data-act="atalho" data-g="extra" data-v="video"', ICON.video, '#e0533d', 'Com vídeo', plural(videos, 'questão', 'questões')) + '</div>';

      html += '<div class="section-title"><h2>Estudar por matéria</h2></div><div class="subjects">';
      TAX.materias.forEach((m) => {
        const count = all.filter((q) => temMateria(q, m.id)).length;
        if (!count) return;
        html += '<button class="card subject tap" data-go="#/materia/' + m.id + '"><span class="sig" style="background:' + m.cor + '">' + esc(m.sigla) + '</span>' +
          '<span><b>' + esc(m.nome) + '</b><small>' + plural(count, 'questão', 'questões') + '</small></span></button>';
      });
      html += '</div>';

      // provas agrupadas por vestibular (a lista de cada um abre numa tela própria)
      html += '<div class="section-title"><h2>Provas por vestibular</h2></div><div class="in-vests">';
      VESTS().forEach((v) => {
        const es = EXAMS.filter((e) => e.vestibular === v), anos = es.map((e) => e.ano);
        const qs = all.filter((q) => q.prova.vestibular === v), f = qs.filter((q) => answers[chave(q)]).length;
        html += '<button class="card in-vest tap" data-go="#/vestibular/' + encodeURIComponent(v) + '"><span class="exam-logo">' + esc(v) + '</span><span class="grow"><h3>' + esc(v) + '</h3>' +
          '<span class="exam-meta">' + plural(es.length, 'prova', 'provas') + ' · ' + Math.min.apply(null, anos) + ' a ' + Math.max.apply(null, anos) + ' · ' + qs.length + ' questões' + (f ? ' · ' + plural(f, 'feita', 'feitas') : '') + '</span>' +
          '<div class="bar"><i style="width:' + (qs.length ? Math.round(f / qs.length * 100) : 0) + '%"></i></div></span>' + ICON.chev + '</button>';
      });
      html += '</div>';

      html += '<button class="card in-assine tap" data-go="#/assinar">' + CROC('comemora') + '<span class="grow"><b>Vá além com o Plus e o Pro</b><small>Todos os vídeos, a 2ª fase completa, os planos com data e um tutor de IA para tirar dúvidas.</small><span class="in-assine-btn">Ver as assinaturas</span></span></button>';
      return html + '<div class="foot">SuperCroc · versão de teste' + (RELEASE ? '' : ' (desenvolvimento)') + '</div>';
    });
  }
  // provas de um vestibular, por ano (a mais nova primeiro)
  function viewVestibular(v) {
    return loadAllExams().then(() => {
      const es = EXAMS.filter((e) => e.vestibular === v);
      if (!es.length) return notFound('Vestibular não encontrado.');
      const qs = allResolved().filter((q) => q.prova.vestibular === v);
      topbar({ title: v, sub: plural(es.length, 'prova', 'provas') + ' · ' + qs.length + ' questões' });
      const anos = es.map((e) => e.ano).filter((a, i, l) => l.indexOf(a) === i).sort((a, b) => b - a);
      let html = '<div class="page-head"><h1>' + esc(v) + '</h1><p>' + plural(es.length, 'prova resolvida', 'provas resolvidas') + ', de ' + anos[anos.length - 1] + ' a ' + anos[0] + '</p></div>';
      html += botaoRaioX(v);
      anos.forEach((a) => { html += '<div class="assunto">' + a + '</div><div class="grid-2">' + es.filter((e) => e.ano === a).map(cartaoProva).join('') + '</div>'; });
      return html;
    });
  }

  // ================================================================== raio-x do vestibular
  // O que mais cai, tirado das questões resolvidas: o peso de cada matéria, os assuntos mais cobrados
  // (e em quantas edições caíram), os que caem em toda edição e a "cara" do vestibular (assuntos que
  // caem nele bem mais que nos outros). 1ª e 2ª fase ficam separadas: a 2ª é discursiva e muda tudo.
  const doDa = (v) => (AO[v] ? 'do ' : 'da ') + v;
  const ICON_RAIO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8V5a1 1 0 011-1h3M16 4h3a1 1 0 011 1v3M20 16v3a1 1 0 01-1 1h-3M8 20H5a1 1 0 01-1-1v-3"/><path d="M7 15l3-4 3 2 4-5"/></svg>';
  const botaoRaioX = (v) => '<button class="card plan-card raiox-card tap" data-go="#/raiox/' + encodeURIComponent(v) + '"><span class="play">' + ICON_RAIO + '</span><span class="grow"><b>Raio-X ' + esc(doDa(v)) + '</b>' +
    '<small>O que mais cai, matéria por matéria, e os assuntos que são a cara ' + esc(doDa(v)) + '.</small></span>' + ICON.chev + '</button>';
  function viewRaioX(v, ctx) {
    return loadAllExams().then(() => {
      const conta = (q, seg) => !q.variante && q.tipo !== 'redacao' && q.gabarito !== 'ANULADA' && (q.prova.tipo === 'discursiva') === seg;
      const todas = allResolved(), deV = todas.filter((q) => q.prova.vestibular === v);
      const tem1 = deV.some((q) => conta(q, false)), tem2 = deV.some((q) => conta(q, true));
      if (!tem1 && !tem2) return notFound('Vestibular não encontrado.');
      const seg = ctx.f === '2' ? tem2 : !tem1, fase = seg ? '2ª fase' : v === 'ENEM' ? 'prova' : '1ª fase';
      const qs = deV.filter((q) => conta(q, seg)), outros = todas.filter((q) => q.prova.vestibular !== v && conta(q, seg));
      const anos = qs.map((q) => q.prova.ano).filter((a, i, l) => l.indexOf(a) === i).sort();
      const feitas = qs.filter((q) => answers[chave(q)]), certas = feitas.filter((q) => answers[chave(q)].ok).length;
      topbar({ title: 'Raio-X ' + doDa(v), sub: (v === 'ENEM' ? 'ENEM' : fase) + ' · ' + plural(anos.length, 'edição', 'edições') });
      let html = '<div class="page-head"><h1>Raio-X ' + esc(doDa(v)) + '</h1><p>' + qs.length + (seg ? ' questões discursivas' : ' questões') + ' de ' + plural(anos.length, 'edição', 'edições') + ' (' + anos[0] + ' a ' + anos[anos.length - 1] + ')' +
        (feitas.length ? '. Você já fez ' + feitas.length + ', com ' + Math.round(certas / feitas.length * 100) + '% de acerto.' : '.') + '</p></div>';
      if (tem1 && tem2) {
        html += '<div class="chips rx-fases">' + [['', '1ª fase', !seg], ['?f=2', '2ª fase', seg]].map(([q, nome, on]) =>
          '<button class="chip' + (on ? ' on' : '') + '" data-go="#/raiox/' + encodeURIComponent(v) + q + '" data-replace>' + nome + '</button>').join('') + '</div>';
      }

      // peso das matérias
      const porMat = {};
      qs.forEach((q) => { porMat[q.materia] = (porMat[q.materia] || 0) + 1; });
      const mats = Object.keys(porMat).sort((a, b) => porMat[b] - porMat[a]), maxMat = porMat[mats[0]];
      html += '<div class="section-title"><h2>Peso das matérias</h2></div><div class="card rx-mats">' + mats.map((mid) => {
        const m = materia(mid), pct = Math.round(porMat[mid] / qs.length * 100);
        return '<div class="rx-mat"><span class="rx-nome"><i style="background:' + m.cor + '"></i>' + esc(m.nome) + '</span><span class="rx-barra"><i style="width:' + Math.round(porMat[mid] / maxMat * 100) + '%;background:' + m.cor + '"></i></span><b>' + pct + '%</b></div>';
      }).join('') + '</div>';

      // assuntos mais cobrados (tocar abre as questões daquele assunto)
      const porAss = {}, porOutros = {};
      qs.forEach((q) => { const k = q.materia + '/' + q.assunto, o = porAss[k] = porAss[k] || { k, m: q.materia, a: q.assunto, n: 0, anos: {} }; o.n++; o.anos[q.prova.ano] = 1; });
      outros.forEach((q) => { const k = q.materia + '/' + q.assunto; porOutros[k] = (porOutros[k] || 0) + 1; });
      const lista = Object.keys(porAss).map((k) => porAss[k]).sort((a, b) => b.n - a.n || Object.keys(b.anos).length - Object.keys(a.anos).length);
      const linha = (o, txt) => {
        const m = materia(o.m);
        return '<button class="card qrow rx-ass tap" data-act="raiox-filtro" data-vest="' + esc(v) + '" data-mat="' + esc(o.m) + '" data-ass="' + esc(o.a) + '"><span class="num" style="background:' + m.cor + '">' + esc(m.sigla) + '</span>' +
          '<span class="grow"><b>' + esc(assunto(o.m, o.a)) + '</b><small>' + esc(txt) + '</small></span>' + ICON.chev + '</button>';
      };
      html += '<div class="section-title"><h2>O que mais cai</h2></div>' + lista.slice(0, 12).map((o) =>
        linha(o, plural(o.n, 'questão', 'questões') + ' · caiu em ' + Object.keys(o.anos).length + ' de ' + plural(anos.length, 'edição', 'edições'))).join('');

      // caem em toda edição
      const sempre = anos.length >= 3 ? lista.filter((o) => Object.keys(o.anos).length === anos.length) : [];
      if (sempre.length) {
        html += '<div class="section-title"><h2>Cai em toda edição</h2></div><p class="plan-nota">Estes assuntos apareceram em todas as ' + anos.length + ' edições resolvidas.</p><div class="rx-chips">' +
          sempre.map((o) => '<button class="chip" data-act="raiox-filtro" data-vest="' + esc(v) + '" data-mat="' + esc(o.m) + '" data-ass="' + esc(o.a) + '"><i style="background:' + materia(o.m).cor + '"></i>' + esc(assunto(o.m, o.a)) + '</button>').join('') + '</div>';
      }

      // a cara do vestibular: proporção no vestibular comparada com a dos outros
      const cara = lista.filter((o) => o.n >= 4 && Object.keys(o.anos).length >= 2)
        .map((o) => ({ o, r: (o.n / qs.length) / (((porOutros[o.k] || 0) + 1) / (outros.length + 1)) }))
        .filter((x) => x.r >= 2).sort((a, b) => b.r - a.r).slice(0, 5);
      if (cara.length) {
        html += '<div class="section-title"><h2>A cara ' + esc(doDa(v)) + '</h2></div><p class="plan-nota">Assuntos que caem ' + esc(doDa(v).replace(/^d/, 'n')) + ' bem mais que nos outros vestibulares do app.</p>' +
          cara.map((x) => linha(x.o, (porOutros[x.o.k] ? 'cai ' + (x.r >= 10 ? Math.round(x.r) : x.r.toFixed(1).replace('.', ',')) + ' vezes mais que nos outros' : 'quase não cai nos outros') + ' · ' + plural(x.o.n, 'questão', 'questões'))).join('');
      }

      // dificuldade comparada com a dos outros vestibulares
      const dif = (lst) => [1, 2, 3].map((d) => lst.length ? Math.round(lst.filter((q) => q.dificuldade === d).length / lst.length * 100) : 0);
      const barraDif = (nome, ps) => '<div class="rx-dif"><span>' + esc(nome) + '</span><span class="rx-pilha">' + ps.map((x, i) => x ? '<i class="d' + (i + 1) + '" style="width:' + x + '%">' + (x >= 12 ? x + '%' : '') + '</i>' : '').join('') + '</span></div>';
      if (outros.length) {
        html += '<div class="section-title"><h2>Dificuldade</h2></div><div class="card rx-difs">' + barraDif(v, dif(qs)) + barraDif('Os outros', dif(outros)) +
          '<p class="rx-leg"><span><i class="d1"></i>fácil</span><span><i class="d2"></i>média</span><span><i class="d3"></i>difícil</span></p></div>';
      }
      return html + '<p class="plan-nota">Contas feitas com as questões resolvidas no app' + (seg ? '' : ' (sem as anuladas)') + '. Toque num assunto para ver as questões dele.</p>';
    });
  }

  // ================================================================== assinaturas (vitrine, ainda sem cobrança)
  // Preços e itens são proposta para o autor decidir (docs/ASSINATURAS.md). breve = ainda não existe no app.
  const ASSINATURAS = [
    { id: 'gratis', nome: 'Grátis', desc: '**Comece agora**: todas as provas resolvidas passo a passo, sem pagar nada.', mes: 0, ano: 0,
      grupos: [
        { t: 'Questões', itens: ['Todas as questões de 1ª fase resolvidas passo a passo', 'Análise de cada alternativa nas questões de leitura', 'Desenhos e figuras próprios', 'Filtros por matéria, assunto, vestibular, ano e dificuldade', 'Favoritas e o seu histórico de acertos'] },
        { t: 'Plano de estudos', itens: ['Croc do dia: 5 questões por dia', 'Revisão das questões que você errou'] },
        { t: 'Raio-X do vestibular', itens: ['O que mais cai em cada vestibular, matéria por matéria', 'Os assuntos que caem em toda edição e os que são a cara de cada prova'] },
        { t: 'Vídeos', itens: ['1 resolução em vídeo por dia'] },
      ] },
    { id: 'plus', nome: 'Plus', desc: 'Tenha **acesso ampliado**: a 2ª fase completa, todos os vídeos e os planos com data.', mes: 14.9, ano: 119.9, base: 'Grátis',
      grupos: [
        { t: '2ª fase', itens: ['Todas as questões discursivas, com resposta esperada e autoavaliação', 'Redação com orientação e contador de linhas'] },
        { t: 'Vídeos', itens: ['Todas as resoluções em vídeo, sem limite'] },
        { t: 'Plano de estudos', itens: ['Rumo ao vestibular, com reta final e 2ª fase', 'Reforço dos pontos fracos, com diagnóstico'] },
      ] },
    { id: 'pro', nome: 'Pro', selo: 'Inclui o tutor de IA', desc: 'Aproveite o **acesso completo**: tire dúvidas de cada questão com o tutor de IA e treine com simulados.', mes: 29.9, ano: 239.9, base: 'Plus',
      grupos: [
        { t: 'Tutor de IA', breve: true, itens: ['Pergunte sobre qualquer questão e receba a explicação na hora', 'Dicas sem entregar a resposta, para você tentar de novo', 'Explicações no mesmo caminho da resolução do app'] },
        { t: 'Simulados', breve: true, itens: ['Provas inteiras com cronômetro', 'Resultado por matéria no fim'] },
        { t: 'Desempenho', breve: true, itens: ['Relatório de acertos por matéria e assunto'] },
      ] },
  ];
  let assinaturaAnual = false;
  const reais = (v) => v.toFixed(2).replace('.', ',');
  const ICON_OK = '<svg class="as-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICON_BRILHO = '<svg class="as-brilho" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.6 5.4 4.6 9.4 10 10-5.4.6-9.4 4.6-10 10-.6-5.4-4.6-9.4-10-10 5.4-.6 9.4-4.6 10-10z"/></svg>';
  const ICON_MAIS = '<svg class="as-mais" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.2l2.7 2.7L16 9.6"/></svg>';
  function viewAssinar() {
    topbar({ title: 'Assinaturas' });
    let html = '<div class="page-head as-head"><h1>Escolha como estudar</h1><p>Comece grátis e assine quando quiser ir além.</p></div>' +
      '<div class="as-periodo" role="tablist"><button class="chip' + (assinaturaAnual ? '' : ' on') + '" data-act="periodo" data-anual="">Mensal</button>' +
      '<button class="chip' + (assinaturaAnual ? ' on' : '') + '" data-act="periodo" data-anual="1">Anual <small>2 meses grátis</small></button></div><div class="as-cards">';
    ASSINATURAS.forEach((a) => {
      const pago = a.mes > 0, preco = !pago ? 0 : assinaturaAnual ? a.ano / 12 : a.mes;
      html += '<div class="card as-card as-' + a.id + '">' + (a.selo ? '<div class="as-selo">' + esc(a.selo) + '</div>' : '<div class="as-selo vazio"></div>') +
        '<h2>SuperCroc ' + esc(a.nome) + '</h2><p class="as-desc">' + rich(a.desc) + '</p>' +
        '<div class="as-preco"><sup>R$</sup><b>' + (pago ? reais(preco) : '0') + '</b><span>/ mês</span></div>' +
        '<p class="as-nota">' + (!pago ? 'Para sempre, sem cartão.' : assinaturaAnual ? 'R$ ' + reais(a.ano) + ' cobrados uma vez por ano.' : 'Ou R$ ' + reais(a.ano) + ' por ano (2 meses grátis).') + '</p>' +
        (pago ? '<button class="btn primary as-btn" data-act="assinar" data-plano="' + a.id + '">Assinar o ' + esc(a.nome) + '</button>' : '<button class="btn ghost as-btn" disabled>Seu plano atual</button>') +
        (a.base ? '<div class="as-base">' + ICON_MAIS + '<span>Tudo do <b>' + esc(a.base) + '</b> e mais:</span></div>' : '<div class="as-base vazio"></div>');
      a.grupos.forEach((g) => {
        html += '<div class="as-grupo"><div class="as-gt">' + ICON_BRILHO + '<b>' + esc(g.t) + '</b>' + (g.breve ? '<span class="as-breve">em breve</span>' : '') + '</div>' +
          g.itens.map((x) => '<div class="as-item">' + ICON_OK + '<span>' + esc(x) + '</span></div>').join('') + '</div>';
      });
      html += '</div>';
    });
    return html + '</div><p class="plan-nota as-rodape">Cancele quando quiser. Os itens marcados "em breve" entram na assinatura assim que ficarem prontos, sem custo a mais.</p>';
  }
  function allResolved() {
    const out = [];
    EXAMS.forEach((e) => { const p = examData[e.id]; if (p) p.questoes.forEach((q) => out.push(q)); });
    return out;
  }

  // ================================================================== filtros (caixas de seleção)
  // Dentro de um grupo vale qualquer opção marcada (OU); entre grupos, todas as condições (E).
  // Grupo sem nada marcado não filtra. As chaves dos grupos ficam salvas: não renomear.
  const GRUPOS = ['vest', 'ano', 'mat', 'ass', 'dif', 'sit', 'extra'];
  function loadFiltro() {
    const f = loadJson(KEY.filtro), out = {};
    GRUPOS.forEach((k) => { out[k] = Array.isArray(f[k]) ? f[k].map(String) : []; });
    return out;
  }
  let filtro = loadFiltro();
  let filtroLimite = 40;
  const filtroAbertos = { mat: true };
  const filtroAtivo = () => GRUPOS.some((k) => filtro[k].length);
  const temDesenho = (q) => JSON.stringify([q.resolucao, q.itens]).indexOf('"fig"') >= 0;
  const markHtml = (a) => { const mk = markOf(a); return mk ? '<b class="rowmark ' + mk + '">' + MARK_TXT[mk] + '</b>' : ''; };
  // favoritas lidas uma vez (o botão de favoritar atualiza esta cópia)
  let favsCache = null;
  const favsAtuais = () => favsCache || (favsCache = loadJson(KEY.favs));
  // Os valores que não mudam (tudo menos "Situação") ficam guardados na questão: o filtro passa pelas
  // 4.200 questões a cada toque, e refazê-los toda vez (o "com desenho" lê a resolução inteira) travava o celular.
  function valoresFixos(q) {
    if (!q._v) {
      const uniq = (l) => l.filter((v, i) => l.indexOf(v) === i);
      q._v = {
        vest: [q.prova.vestibular], ano: [String(q.prova.ano)], dif: [String(q.dificuldade)],
        mat: uniq(pares(q).map((x) => x.materia)), ass: uniq(pares(q).map((x) => x.materia + '/' + x.assunto)),
        extra: [q.video ? 'video' : '', temDesenho(q) ? 'desenho' : ''].filter(Boolean),
      };
    }
    return q._v;
  }
  function valores(q, k) {
    if (k === 'sit') {
      const fk = qkey(q.prova.id, q.n), a = answers[fk], out = [a ? (a.ok ? 'acertei' : 'errei') : 'nao-feita'];
      if (favsAtuais()[fk]) out.push('favorita');
      return out;
    }
    return valoresFixos(q)[k] || [];
  }
  // ignorar: grupo que não entra na conta (para mostrar quantas questões cada opção daria)
  function atende(q, f, ignorar) {
    return GRUPOS.every((k) => {
      if (k === ignorar || !f[k].length) return true;
      // assunto refina só a sua matéria: Matemática + Física com "Geometria plana" mantém toda a Física
      // (questão interdisciplinar: basta um dos seus pares matéria/assunto atender)
      if (k === 'ass') {
        const mats = ignorar === 'mat' ? [] : f.mat;
        return pares(q).some((x) => {
          if (mats.length && mats.indexOf(x.materia) < 0) return false;
          const daMateria = f.ass.filter((a) => a.split('/')[0] === x.materia);
          return !daMateria.length || daMateria.indexOf(x.materia + '/' + x.assunto) >= 0;
        });
      }
      return valores(q, k).some((v) => f[k].indexOf(v) >= 0);
    });
  }
  const filtradas = () => allResolved().filter((q) => atende(q, filtro));

  function viewFilter() {
    return loadAllExams().then(() => {
      const all = allResolved();
      const res = all.filter((q) => atende(q, filtro));
      topbar({ title: 'Filtrar questões', sub: res.length + ' de ' + all.length + ' questões' });
      const uniq = (arr) => arr.filter((v, i) => arr.indexOf(v) === i);
      const matsSel = filtro.mat.length ? filtro.mat : [];
      const grupos = [
        { k: 'mat', titulo: 'Matéria', opcoes: TAX.materias.map((m) => ({ v: m.id, nome: m.nome, cor: m.cor })) },
        { k: 'ass', titulo: 'Assunto', opcoes: matsSel.length ? [].concat.apply([], matsSel.map((mid) => materia(mid).assuntos.map((a) => ({ v: mid + '/' + a.id, nome: a.nome, cor: materia(mid).cor })))) : [], vazio: 'Marque uma ou mais matérias para escolher os assuntos.' },
        { k: 'vest', titulo: 'Vestibular', opcoes: uniq(EXAMS.map((e) => e.vestibular)).map((v) => ({ v, nome: v })) },
        { k: 'ano', titulo: 'Ano', opcoes: uniq(EXAMS.map((e) => String(e.ano))).sort().reverse().map((v) => ({ v, nome: v })) },
        { k: 'dif', titulo: 'Dificuldade', opcoes: [{ v: '1', nome: 'Fácil' }, { v: '2', nome: 'Média' }, { v: '3', nome: 'Difícil' }] },
        { k: 'sit', titulo: 'Situação', opcoes: [{ v: 'nao-feita', nome: 'Não feitas' }, { v: 'acertei', nome: 'Acertei' }, { v: 'errei', nome: 'Errei' }, { v: 'favorita', nome: 'Favoritas' }] },
        { k: 'extra', titulo: 'Recursos', opcoes: [{ v: 'video', nome: 'Com vídeo' }, { v: 'desenho', nome: 'Com desenho' }] },
      ];
      // quantas questões cada opção daria: para cada grupo, as questões que passam nos outros grupos
      const contagem = {};
      grupos.forEach((g) => {
        const c = contagem[g.k] = {};
        all.forEach((q) => { if (atende(q, filtro, g.k)) valores(q, g.k).forEach((v) => { c[v] = (c[v] || 0) + 1; }); });
      });
      let html = '<div class="filter-layout"><div class="filter-panel">';
      grupos.forEach((g) => {
        const sel = filtro[g.k];
        const nomes = g.opcoes.filter((o) => sel.indexOf(o.v) >= 0).map((o) => o.nome);
        html += '<details class="card fgroup" data-fgroup="' + g.k + '"' + (filtroAbertos[g.k] ? ' open' : '') + '><summary><b>' + esc(g.titulo) + '</b><span class="fsel">' +
          (nomes.length ? esc(nomes.slice(0, 2).join(', ') + (nomes.length > 2 ? ' +' + (nomes.length - 2) : '')) : 'todos') + '</span></summary><div class="checks">';
        if (!g.opcoes.length) html += '<p class="fvazio">' + esc(g.vazio || 'Nenhuma opção.') + '</p>';
        g.opcoes.forEach((o) => {
          const on = sel.indexOf(o.v) >= 0;
          const n = contagem[g.k][o.v] || 0;
          if (g.k === 'ass' && !n && !on) return;          // assunto sem questão nenhuma: nem aparece
          html += '<label class="check' + (!n && !on ? ' off' : '') + '"><input type="checkbox" data-fk="' + g.k + '" value="' + esc(o.v) + '"' + (on ? ' checked' : '') + (!n && !on ? ' disabled' : '') + '>' +
            (o.cor ? '<i style="background:' + o.cor + '"></i>' : '') + '<span>' + esc(o.nome) + '</span><small>' + n + '</small></label>';
        });
        html += '</div></details>';
      });
      html += '</div><div class="filter-results"><div class="fhead"><b>' + res.length + ' quest' + (res.length === 1 ? 'ão' : 'ões') + '</b>' +
        (filtroAtivo() ? '<button class="btn ghost" data-act="limpar-filtro">Limpar filtros</button>' : '') + '</div>';
      if (!res.length) html += '<div class="empty-state">' + CROC('desafio') + '<b>Nenhuma questão com esses filtros.</b><br>Desmarque alguma opção.</div>';
      res.slice(0, filtroLimite).forEach((q) => {
        const m = materia(q.materia), a = answers[qkey(q.prova.id, q.n)];
        html += '<button class="card qrow tap" data-go="#/q/' + q.prova.id + '/' + q.n + '?f=1"><span class="num" style="background:' + m.cor + '">' + esc(rotulo(q)) + '</span>' +
          '<span class="grow"><b>' + esc(q.prova.vestibular + ' ' + q.prova.ano + ' · ' + m.nome) + '</b><small>' + esc(assunto(q.materia, q.assunto) + ' · ' + q.topicos.join(' · ')) + '</small></span>' +
          markHtml(a) + ICON.chev + '</button>';
      });
      if (res.length > filtroLimite) html += '<div class="q-actions"><button class="btn ghost" data-act="mais-filtro">Mostrar mais ' + Math.min(40, res.length - filtroLimite) + '</button></div>';
      html += '</div></div><button class="fver" data-act="ver-resultados">Ver ' + res.length + ' quest' + (res.length === 1 ? 'ão' : 'ões') + '</button>';
      return html;
    });
  }

  // ================================================================== plano de estudos
  // Três formas (docs/PLANOS-DE-ESTUDO.md): "leve" (Croc do dia), "rumo" (rumo ao vestibular, que vira
  // reta final nas últimas 6 semanas) e "reforco" (pontos fracos, depois de um diagnóstico).
  // A lista do dia é montada uma vez por dia e guardada; o resto sai das respostas. Dia perdido não
  // vira dívida: a lista de ontem some e a de hoje é montada com o que falta.
  let plano = loadJson(KEY.plano);   // { tipo, criado, vest, outros, prova, prova2, dias, min, diag, cont, n, dia: { d, itens: [{ k, r, g, i }] }, hist }
  const MIN_POR_Q = 6;               // minutos de uma objetiva: resolver e ler a resolução (a discursiva vale 2,5)
  const pad = (x) => (x < 10 ? '0' : '') + x;
  const diaStr = (t) => { const d = new Date(t); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  const inicioDia = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const dataLonga = (s) => { const [y, m, d] = s.split('-').map(Number); return (d === 1 ? '1º' : d) + ' de ' + MESES[m - 1] + ' de ' + y; };
  const SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const chave = (q) => qkey(q.prova.id, q.n);
  function qDe(k) { const i = k.lastIndexOf('/'), p = examData[k.slice(0, i)]; return (p && p.byN[k.slice(i + 1)]) || null; }
  const completa = (a, q) => !!a && (!a.it || (q.itens || []).every((x) => a.it[x.letra]));
  const noPlano = (q) => q.tipo !== 'redacao' && !q.variante && q.gabarito !== 'ANULADA';
  const novas = () => allResolved().filter((q) => noPlano(q) && !answers[chave(q)]);
  const objetivas = (qs) => qs.filter((q) => !discursiva(q));
  const estudaEm = (diaSemana) => !plano.dias || plano.dias.indexOf(diaSemana) >= 0;
  function diasDeEstudo(de, ate) {
    let n = 0;
    for (let t = de + DIA / 2; t < ate; t += DIA) if (estudaEm(new Date(t).getDay())) n++;
    return n;
  }
  // sorteio com semente: a mesma lista para o mesmo dia
  function sorteio(seed) {
    let s = 2166136261;
    for (let i = 0; i < seed.length; i++) s = Math.imul(s ^ seed.charCodeAt(i), 16777619);
    return () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function embaralhar(arr, rnd) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  // mais perto da dificuldade-alvo primeiro; no plano com prazo, os anos mais antigos antes
  const porDif = (alvo, porAno) => (a, b) => Math.abs(a.dificuldade - alvo) - Math.abs(b.dificuldade - alvo) || (porAno ? a.prova.ano - b.prova.ano : 0);
  function agrupar(qs, grupo, ordem) {
    const g = {};
    qs.forEach((q) => { const k = grupo(q); (g[k] = g[k] || []).push(q); });
    Object.keys(g).forEach((k) => g[k].sort(ordem));
    return g;
  }
  // rodízio: a próxima questão vem do grupo (matéria ou assunto) mais atrasado em relação ao seu peso
  // (o tamanho do grupo), contando o que já saiu nos dias anteriores (cont); no máximo maxPor por dia
  function rodizio(grupos, n, cont, maxPor) {
    const ks = Object.keys(grupos), tot = ks.reduce((s, k) => s + grupos[k].length, 0), hoje = {}, out = [];
    let usados = ks.reduce((s, k) => s + (cont[k] || 0), 0);
    while (out.length < n) {
      let best = null, bv = -Infinity;
      ks.forEach((k) => {
        if (!grupos[k].length || (hoje[k] || 0) >= maxPor) return;
        const v = grupos[k].length / tot * (usados + 1) - (cont[k] || 0);
        if (v > bv) { bv = v; best = k; }
      });
      if (!best) break;
      out.push(grupos[best].shift());
      hoje[best] = (hoje[best] || 0) + 1; cont[best] = (cont[best] || 0) + 1; usados++;
    }
    return out;
  }
  const item = (q, extra) => Object.assign({ k: chave(q) }, discursiva(q) ? { i: q.itens.length } : {}, extra || {});
  // feita hoje (a revisão tem resposta antiga: só conta a de hoje); a do diagnóstico vale em qualquer dia
  function feita(it, d) {
    const a = answers[it.k];
    if (!a || (!it.g && a.t < inicioDia(d))) return false;
    return !a.it || Object.keys(a.it).length >= (it.i || 1);
  }

  // as erradas de antes do plano também entram na revisão
  function semearRevisao() {
    if (revisao._semeado) return;
    allResolved().forEach((q) => {
      const k = chave(q), a = answers[k];
      if (a && !a.ok && completa(a, q) && !revisao[k]) revisao[k] = { s: 0, due: a.t + REV_DIAS[0] * DIA };
    });
    revisao._semeado = 1;
    saveJson(KEY.revisao, revisao);
  }
  // revisões vencidas, das mais atrasadas para as mais novas. Na reta final entram todas as erradas
  // (menos as respondidas nos últimos 3 dias)
  function vencidas(todas) {
    const agora = Date.now();
    return Object.keys(revisao).filter((k) => {
      if (k[0] === '_' || !qDe(k)) return false;
      const a = answers[k];
      return revisao[k].due <= agora || (todas && (!a || a.t < agora - REV_DIAS[0] * DIA));
    }).sort((a, b) => revisao[a].due - revisao[b].due).map(qDe);
  }

  // rumo: em que fase está (1, 2 ou 0 = a prova já passou), quantos dias faltam, se é reta final
  function situacao() {
    const hoje = inicioDia(diaStr(Date.now()));
    if (plano.tipo !== 'rumo') return { fase: 1, hoje };
    const d1 = inicioDia(plano.prova), d2 = plano.prova2 ? inicioDia(plano.prova2) : 0;
    const fase = hoje <= d1 ? 1 : d2 && hoje <= d2 ? 2 : 0;
    const alvo = fase === 2 ? d2 : d1, faltam = Math.round((alvo - hoje) / DIA);
    return { fase, hoje, alvo, faltam, reta: fase === 1 && faltam <= 42, dias: fase ? diasDeEstudo(hoje, alvo) : 0 };
  }
  // simulado do fim: a prova (1ª fase) mais recente do vestibular principal fica guardada inteira
  function provasSimulado() {
    const ps = EXAMS.map((e) => examData[e.id]).filter((p) => p && p.vestibular === plano.vest && p.tipo !== 'discursiva');
    const ano = Math.max.apply(null, ps.map((p) => p.ano));
    return ps.filter((p) => p.ano === ano);
  }

  // Croc do dia: matéria sorteada (uma questão de cada matéria) ou escolhida (rodízio pelos assuntos dela)
  function diaLeve(rnd, n) {
    n = n || 5;
    const daMat = (q) => !plano.mat || q.materia === plano.mat;
    const rev = objetivas(vencidas(false)).filter(daMat).slice(0, Math.min(2, n));
    const alvo = Object.keys(answers).length < 30 ? 1 : 2;
    const pool = embaralhar(objetivas(novas()).filter(daMat), rnd);
    let nov;
    if (plano.mat) {
      const g = agrupar(pool, (q) => q.assunto, porDif(alvo, false));
      plano.contA = plano.contA || {};
      nov = rodizio(g, n - rev.length, plano.contA, Math.max(2, Math.ceil(n / Math.max(1, Object.keys(g).length))));
    } else nov = rodizio(agrupar(pool, (q) => q.materia, porDif(alvo, false)), n - rev.length, plano.cont, 1);
    return rev.map((q) => item(q, { r: 1 })).concat(nov.map((q) => item(q)));
  }
  // troca a matéria do Croc do dia: as feitas ficam, as outras são sorteadas de novo
  function trocarMateria(mat) {
    plano.mat = mat;
    const d = diaStr(Date.now());
    if (!plano.dia || plano.dia.d !== d) { saveJson(KEY.plano, plano); return; }
    const feitas = plano.dia.itens.filter((x) => feita(x, d));
    plano.dia.itens = feitas;
    gerarDia(true, feitas.length >= 5 ? 5 : 5 - feitas.length);
  }
  function diaRumo(rnd) {
    const st = situacao(), orc = Math.round(plano.min / MIN_POR_Q);
    if (!st.fase) return [];
    const sim = provasSimulado().map((p) => p.id);
    const todas = embaralhar(novas(), rnd);
    const doVest = todas.filter((q) => q.prova.vestibular === plano.vest && sim.indexOf(q.prova.id) < 0);
    const rev = vencidas(st.reta).filter((q) => (st.fase === 2) === discursiva(q));
    const itens = rev.slice(0, Math.floor(orc * (st.reta ? 0.6 : 0.4))).map((q) => item(q, { r: 1 }));
    let resta = orc - itens.length;
    const disc = agrupar(doVest.filter(discursiva), (q) => q.materia, porDif(2, true));
    if (st.fase === 2) return itens.concat(rodizio(disc, Math.max(1, Math.floor(resta / 2.5)), plano.cont, 1).map((q) => item(q)));
    // 2ª fase aos poucos: uma discursiva a cada 3 dias (menos na reta final)
    if (!st.reta && plano.n % 3 === 0 && resta >= 3) {
      const q = rodizio(disc, 1, plano.cont, 1)[0];
      if (q) { itens.push(item(q)); resta -= 2.5; }
    }
    let obj = objetivas(doVest);
    if (st.reta) {           // reta final: os 2 anos mais recentes (fora o do simulado), médias e difíceis
      const anoMax = Math.max.apply(null, obj.map((q) => q.prova.ano));
      const recentes = obj.filter((q) => q.prova.ano >= anoMax - 1 && q.dificuldade >= 2);
      obj = recentes.length ? recentes : obj.filter((q) => q.dificuldade >= 2);
    }
    const outros = (plano.outros || []).length ? objetivas(todas.filter((q) => plano.outros.indexOf(q.prova.vestibular) >= 0)) : [];
    const nOut = outros.length ? Math.round(resta * 0.3) : 0, nPri = Math.max(0, Math.floor(resta) - nOut);
    const f = Math.min(1, Math.max(0, (Date.now() - plano.criado) / Math.max(DIA, st.alvo - plano.criado)));
    const alvo = st.reta ? 3 : f < 0.35 ? 1 : f < 0.7 ? 2 : 3;
    const pri = rodizio(agrupar(obj, (q) => q.materia, porDif(alvo, true)), nPri, plano.cont, Math.max(2, Math.ceil(nPri / 3)));
    // dos outros vestibulares, primeiro os assuntos que o principal não tem
    const noPrincipal = {};
    allResolved().forEach((q) => { if (q.prova.vestibular === plano.vest) noPrincipal[q.materia + '/' + q.assunto] = 1; });
    const tem = (q) => noPrincipal[q.materia + '/' + q.assunto] || 0;
    plano.contO = plano.contO || {};
    const out = rodizio(agrupar(outros, (q) => q.materia, (a, b) => tem(a) - tem(b) || porDif(alvo, true)(a, b)), nOut, plano.contO, 1);
    return itens.concat(pri.concat(out).map((q) => item(q)));
  }

  // reforço: taxa de acerto por assunto (todas as respostas completas, de qualquer vestibular)
  function desempenho() {
    const por = {};
    allResolved().forEach((q) => {
      const a = answers[chave(q)];
      if (!noPlano(q) || !completa(a, q)) return;
      const id = q.materia + '/' + q.assunto, x = por[id] || (por[id] = { id, m: q.materia, a: q.assunto, n: 0, ok: 0 });
      x.n++;
      if (a.ok) x.ok++;
    });
    return Object.values(por);
  }
  // assunto fraco: pelo menos 2 respondidas e menos de 70% de acerto; os 5 piores
  const fracos = () => desempenho().filter((x) => x.n >= 2 && x.ok / x.n < 0.7).sort((a, b) => a.ok / a.n - b.ok / b.n || b.n - a.n).slice(0, 5);
  // diagnóstico: 30 objetivas fáceis e médias do vestibular, 2 ou 3 por matéria (menos o que o aluno já fez)
  function montarDiagnostico() {
    const doVest = (q) => !plano.vest || q.prova.vestibular === plano.vest;
    const ja = allResolved().filter((q) => doVest(q) && noPlano(q) && completa(answers[chave(q)], q)).length;
    if (ja >= 30) return [];
    const pool = embaralhar(objetivas(novas()).filter((q) => doVest(q) && q.dificuldade <= 2), sorteio('diag' + plano.criado));
    const g = agrupar(pool, (q) => q.materia, () => 0);
    return rodizio(g, 30 - ja, {}, Math.max(2, Math.ceil((30 - ja) / Math.max(1, Object.keys(g).length)))).map(chave);
  }
  const diagPendente = () => (plano.diag || []).filter((k) => { const q = qDe(k); return q && !completa(answers[k], q); });
  function diaReforco(rnd) {
    const pend = diagPendente();
    if (pend.length) return pend.map((k) => ({ k, g: 1 }));
    const orc = Math.round(plano.min / MIN_POR_Q), fr = fracos(), ids = fr.map((x) => x.id);
    const doAss = (q) => q.materia + '/' + q.assunto;
    const todas = embaralhar(objetivas(novas()), rnd);
    const doVest = plano.vest ? todas.filter((q) => q.prova.vestibular === plano.vest) : todas;
    // 60% dos assuntos fracos (do vestibular escolhido primeiro, depois de qualquer um), 40% de manutenção
    const nFr = fr.length ? Math.round(orc * 0.6) : 0;
    const pref = (a, b) => (a.prova.vestibular === plano.vest ? 0 : 1) - (b.prova.vestibular === plano.vest ? 0 : 1) || a.dificuldade - b.dificuldade;
    plano.contA = plano.contA || {};
    const fra = rodizio(agrupar(todas.filter((q) => ids.indexOf(doAss(q)) >= 0), doAss, pref), nFr, plano.contA, Math.max(1, Math.ceil(nFr / Math.max(1, fr.length))));
    const rev = objetivas(vencidas(false)).slice(0, Math.floor(orc * 0.2));
    const man = rodizio(agrupar(doVest.filter((q) => ids.indexOf(doAss(q)) < 0), (q) => q.materia, porDif(2, false)), orc - fra.length - rev.length, plano.cont, 1);
    return rev.map((q) => item(q, { r: 1 })).concat(fra.concat(man).map((q) => item(q)));
  }

  // lista do dia: montada na primeira visita do dia; "mais" acrescenta outra leva no mesmo dia
  function gerarDia(mais, quantos) {
    semearRevisao();
    const d = diaStr(Date.now()), deHoje = plano.dia && plano.dia.d === d;
    // terminou o diagnóstico hoje: a lista do dia passa a ser a do reforço
    const fimDiag = deHoje && plano.dia.itens.some((x) => x.g) && !diagPendente().length;
    if (deHoje && !mais && !fimDiag) return plano.dia;
    if (!deHoje && !mais && !estudaEm(new Date().getDay())) return null;       // folga
    plano.cont = plano.cont || {};
    plano.n = plano.n || 0;
    const rnd = sorteio(d + '/' + plano.criado + '/' + plano.n);
    const novos = plano.tipo === 'leve' ? diaLeve(rnd, quantos) :plano.tipo === 'rumo' ? diaRumo(rnd) : diaReforco(rnd);
    const antes = deHoje && !fimDiag ? plano.dia.itens : [];
    plano.dia = { d, itens: antes.concat(novos.filter((x) => !antes.some((y) => y.k === x.k))) };
    plano.n++;
    saveJson(KEY.plano, plano);
    return plano.dia;
  }
  // depois de cada resposta: o dia foi cumprido?
  function conferirDia() {
    const dia = plano.tipo && plano.dia;
    if (!dia || dia.d !== diaStr(Date.now()) || !dia.itens.length) return false;
    plano.hist = plano.hist || {};
    if (plano.hist[dia.d] || !dia.itens.every((x) => feita(x, dia.d))) return false;
    plano.hist[dia.d] = 1;
    saveJson(KEY.plano, plano);
    toast('Plano de hoje cumprido!');
    return true;
  }
  // revisão aberta pelo plano: a resposta antiga sai, para o aluno responder de novo
  function prepararRevisao(fk) {
    const dia = plano.dia, it = dia && dia.d === diaStr(Date.now()) && dia.itens.find((x) => x.k === fk && x.r);
    const a = answers[fk];
    if (!it || !a || a.t >= inicioDia(dia.d)) return;
    delete answers[fk];
    saveJson(KEY.answers, answers);
    revealed[fk] = false;
    Object.keys(itemOpen).forEach((x) => { if (x.indexOf(fk + '/') === 0) delete itemOpen[x]; });
  }

  const AO = { ENEM: 'ao', ITA: 'ao', IME: 'ao' };
  function nomePlano() {
    if (plano.tipo === 'leve') return 'Croc do dia' + (plano.mat ? ': ' + materia(plano.mat).nome : '');
    if (plano.tipo === 'reforco') return 'Reforço dos pontos fracos';
    return situacao().reta ? 'Reta final: ' + plano.vest : 'Rumo ' + (AO[plano.vest] || 'à') + ' ' + plano.vest;
  }
  const plural = (n, um, varios) => n + ' ' + (n === 1 ? um : varios);
  function resumoPlano(st) {
    if (plano.tipo === 'leve') return '5 questões por dia, ' + (plano.mat ? 'de ' + materia(plano.mat).nome : 'de matérias sorteadas') + ', de todos os vestibulares, sem prazo';
    if (plano.tipo === 'reforco') return (plano.vest || 'Todos os vestibulares') + ' · ' + plano.min + ' min por dia';
    if (!st.fase) return 'A prova foi em ' + dataLonga(plano.prova2 || plano.prova);
    return (st.fase === 2 ? '2ª fase em ' : 'Prova em ') + dataLonga(st.fase === 2 ? plano.prova2 : plano.prova) + ' · faltam ' + plural(st.faltam, 'dia', 'dias') + ' · ' +
      (plano.dias.length === 7 ? 'todos os dias' : plural(plano.dias.length, 'dia', 'dias') + ' por semana') + ' · ' + plano.min + ' min por dia' +
      ((plano.outros || []).length ? ' · também ' + plano.outros.join(', ') : '');
  }
  function cartaoPlano() {
    if (!plano.tipo) {
      return '<button class="card plan-card tap" data-go="#/plano"><span class="play">' + ICON.cal + '</span><span class="grow"><b>Monte seu plano de estudos</b>' +
        '<small>O app separa as questões de cada dia e traz de volta as que você errou.</small></span>' + ICON.chev + '</button>';
    }
    const st = situacao(), dia = st.fase ? gerarDia(false) : null;
    let txt;
    if (!st.fase) txt = 'A prova já passou. Monte um plano novo.';
    else if (!dia) txt = 'Hoje é folga no seu plano.';
    else if (dia.itens.some((x) => x.g)) txt = 'Diagnóstico: ' + (plano.diag.length - diagPendente().length) + ' de ' + plano.diag.length + ' feitas';
    else {
      const n = dia.itens.length, f = dia.itens.filter((x) => feita(x, dia.d)).length, r = dia.itens.filter((x) => x.r).length;
      txt = !n ? 'Nada novo para hoje.' : f >= n ? 'Plano de hoje cumprido!' : 'Hoje: ' + f + ' de ' + n + ' feitas' + (r ? ' · ' + r + ' de revisão' : '');
    }
    return '<button class="card plan-card tap" data-go="#/plano"><span class="play">' + ICON.cal + '</span><span class="grow"><span class="plan-rotulo">Seu plano de estudos</span><b>' + esc(nomePlano()) + '</b><small>' + esc(txt) + '</small></span>' + ICON.chev + '</button>';
  }

  function viewPlano(parts) {
    return loadAllExams().then(() => {
      if (parts[1] === 'novo' && parts[2]) return formPlano(parts[2]);
      if (parts[1] === 'novo' || !plano.tipo) return escolherPlano();
      return telaPlano();
    });
  }
  const TIPOS = [
    { id: 'leve', pose: 'em-pe', nome: 'Croc do dia', txt: '5 questões por dia, da matéria que você escolher ou sorteadas, sem prazo. Bom para criar o hábito.' },
    { id: 'rumo', pose: 'desafio', nome: 'Rumo ao vestibular', txt: 'Você diz a prova e a data, e o app divide as questões dela pelos dias que faltam. Nas últimas 6 semanas, vira reta final.' },
    { id: 'reforco', pose: 'lousa', nome: 'Reforço dos pontos fracos', txt: 'Um diagnóstico de 30 questões mostra onde você mais erra. Depois, cada dia ataca esses assuntos.' },
  ];
  function escolherPlano() {
    topbar({ title: 'Plano de estudos' });
    let html = '<div class="page-head"><h1>Plano de estudos</h1><p>Escolha um jeito de estudar. Dá para trocar quando quiser.</p></div>';
    TIPOS.forEach((t) => {
      html += '<button class="card plan-tipo tap" data-go="#/plano/novo/' + t.id + '">' + CROC(t.pose) + '<span class="grow"><b>' + esc(t.nome) + '</b><small>' + esc(t.txt) + '</small></span>' + ICON.chev + '</button>';
    });
    return html + '<p class="plan-nota">Em todos, a questão que você errar volta depois de 3 dias. Se acertar, volta depois de 10 e depois de 30.</p>';
  }
  const VESTS = () => EXAMS.map((e) => e.vestibular).filter((v, i, a) => a.indexOf(v) === i);
  // datas sugeridas: as da última prova, um ano depois (o aluno confere no edital)
  function sugerirDatas(vest) {
    const ps = EXAMS.map((e) => examData[e.id]).filter((p) => p && p.vestibular === vest && p.data);
    // a primeira data da última edição, no primeiro ano em que ela cai depois de "depois"
    const prox = (lista, depois) => {
      if (!lista.length || !depois) return '';
      const ano = Math.max.apply(null, lista.map((p) => p.ano)), d = lista.filter((p) => p.ano === ano).map((p) => p.data).sort()[0];
      const [, m, dd] = d.split('-').map(Number);
      let y = Number(depois.slice(0, 4));
      while (y + '-' + pad(m) + '-' + pad(dd) <= depois) y++;
      return y + '-' + pad(m) + '-' + pad(dd);
    };
    const d1 = prox(ps.filter((p) => p.tipo !== 'discursiva'), diaStr(Date.now()));
    return { d1, d2: prox(ps.filter((p) => p.tipo === 'discursiva'), d1) };
  }
  // matérias que o Croc do dia pode trazer (com questões objetivas no plano)
  const matsLeve = () => TAX.materias.map((m) => ({ id: m.id, nome: m.nome, cor: m.cor, n: allResolved().filter((q) => q.materia === m.id && noPlano(q) && !discursiva(q)).length })).filter((m) => m.n);
  function formPlano(tipo) {
    const t = TIPOS.find((x) => x.id === tipo);
    if (!t) return notFound();
    topbar({ title: t.nome, sub: 'Plano de estudos' });
    const opcao = (tp, name, v, nome, on) => '<label class="check"><input type="' + tp + '" name="' + name + '" value="' + esc(v) + '"' + (on ? ' checked' : '') + '><span>' + esc(nome) + '</span></label>';
    const total = (v) => allResolved().filter((q) => q.prova.vestibular === v && noPlano(q)).length;
    let html = '<div class="page-head"><h1>' + esc(t.nome) + '</h1><p>' + esc(t.txt) + '</p></div>';
    if (tipo === 'leve') {
      html += '<div class="card pf"><b>Qual matéria?</b><small>Dá para trocar a qualquer momento na tela do plano.</small><div class="checks">' + opcao('radio', 'mat', '', 'Sorteadas: uma questão de cada matéria', true) +
        matsLeve().map((m) => opcao('radio', 'mat', m.id, m.nome + ' · ' + m.n + ' questões', false)).join('') + '</div></div>';
    } else {
      html += '<div class="card pf"><b>' + (tipo === 'rumo' ? 'Qual vestibular você vai prestar?' : 'Em qual vestibular quer se testar?') + '</b><div class="checks">' +
        (tipo === 'reforco' ? opcao('radio', 'vest', '', 'Todos', true) : '') +
        VESTS().map((v, i) => opcao('radio', 'vest', v, v + ' · ' + total(v) + ' questões', tipo === 'rumo' && i === 0)).join('') + '</div></div>';
    }
    if (tipo === 'rumo') {
      const sug = sugerirDatas(VESTS()[0]);
      html += '<div class="card pf"><b>Outros vestibulares (opcional)</b><small>Eles ficam com 30% do tempo, com os assuntos que o principal não tem primeiro.</small><div class="checks">' +
        VESTS().map((v) => opcao('checkbox', 'outros', v, v, false)).join('') + '</div></div>' +
        '<div class="card pf"><b>Data da prova (1ª fase)</b><small>Sugerimos a do ano passado, um ano depois. Confira no edital.</small><input class="pf-in" type="date" name="prova" value="' + sug.d1 + '"></div>' +
        '<div class="card pf"><b>Data da 2ª fase (se tiver)</b><small>Depois da 1ª fase, o plano passa a ser só de questões discursivas até ela.</small><input class="pf-in" type="date" name="prova2" value="' + sug.d2 + '"></div>' +
        '<div class="card pf"><b>Dias de estudo</b><div class="pf-dias">' + [1, 2, 3, 4, 5, 6, 0].map((d) =>
          '<label class="pf-dia"><input type="checkbox" name="dias" value="' + d + '"' + (d >= 1 && d <= 5 ? ' checked' : '') + '><span>' + SEMANA[d] + '</span></label>').join('') + '</div></div>';
    }
    if (tipo !== 'leve') {
      html += '<div class="card pf"><b>Tempo por dia</b><div class="checks">' + [[20, '20 minutos · umas 3 questões'], [40, '40 minutos · umas 7 questões'], [60, '1 hora · umas 10 questões']].map(([v, n]) =>
        opcao('radio', 'min', v, n, v === 40)).join('') + '</div></div>';
    }
    return html + '<div class="q-actions"><button class="btn primary" data-act="criar-plano" data-tipo="' + tipo + '">' + (plano.tipo ? 'Trocar pelo plano novo' : 'Começar o plano') + '</button></div>';
  }
  function criarPlano(tipo) {
    const marcado = (name) => { const el = $('#view input[name="' + name + '"]:checked'); return el ? el.value : ''; };
    const marcados = (name) => $$('#view input[name="' + name + '"]:checked').map((el) => el.value);
    const campo = (name) => { const el = $('#view input[name="' + name + '"]'); return el ? el.value : ''; };
    const novo = { tipo, criado: Date.now(), min: tipo === 'leve' ? 30 : parseInt(marcado('min'), 10) || 40 };
    if (tipo !== 'leve') novo.vest = marcado('vest');
    if (tipo === 'leve' && marcado('mat')) novo.mat = marcado('mat');
    if (tipo === 'rumo') {
      const hoje = diaStr(Date.now());
      Object.assign(novo, { outros: marcados('outros').filter((x) => x !== novo.vest), prova: campo('prova'), dias: marcados('dias').map(Number) });
      if (campo('prova2')) novo.prova2 = campo('prova2');
      if (!novo.vest) return toast('Escolha o vestibular');
      if (!novo.prova || novo.prova <= hoje) return toast('Escolha a data da prova, depois de hoje');
      if (novo.prova2 && novo.prova2 <= novo.prova) return toast('A 2ª fase tem de ser depois da 1ª');
      if (!novo.dias.length) return toast('Marque pelo menos um dia de estudo');
    }
    plano = novo;
    if (tipo === 'reforco') plano.diag = montarDiagnostico();
    saveJson(KEY.plano, plano);
    irParaPlano();
  }
  function avisosRumo(st) {
    let html = '';
    if (st.reta) html += '<div class="callout tip plan-aviso">' + ICON.tip + '<div><b>Reta final</b>Faltam ' + plural(st.faltam, 'dia', 'dias') + ': agora entram só os anos mais recentes, as questões médias e difíceis e a revisão de tudo o que você errou.</div></div>';
    if (st.fase === 2) html += '<div class="callout tip plan-aviso">' + ICON.tip + '<div><b>2ª fase</b>Até ' + dataLonga(plano.prova2) + ', o plano traz só questões discursivas.</div></div>';
    if (st.fase !== 1) return html;
    const sim = provasSimulado(), simIds = sim.map((p) => p.id), fator = (plano.outros || []).length ? 0.7 : 1;
    if (!st.reta && st.dias) {
      const falta = allResolved().filter((q) => q.prova.vestibular === plano.vest && noPlano(q) && !answers[chave(q)] && simIds.indexOf(q.prova.id) < 0)
        .reduce((s, q) => s + (discursiva(q) ? 2.5 : 1), 0);
      const cabe = st.dias * Math.round(plano.min / MIN_POR_Q) * fator;
      if (falta > cabe) {
        const min = Math.ceil(falta / st.dias / fator * MIN_POR_Q / 10) * 10;
        html += '<div class="callout warn plan-aviso">' + ICON.warn + '<div><b>Não cabe tudo</b>No ritmo atual, o plano cobre ' + Math.round(cabe / falta * 100) + '% das questões da ' + esc(plano.vest) +
          ' até a prova. Para cobrir todas, seriam uns ' + min + ' minutos por dia. Sem problema: o plano vai pelas matérias de mais peso.</div></div>';
      }
    }
    if (sim.length && st.faltam <= 14) {
      html += '<div class="section-title"><h2>Simulado</h2></div>' + sim.map((p) => '<button class="card continue tap" data-go="#/prova/' + p.id + '"><span class="play">' + ICON.play + '</span><span class="grow"><b>Faça a ' + esc(examTitle(p)) +
        ' inteira</b><small>De uma vez, cronometrando, como no dia da prova.</small></span>' + ICON.chev + '</button>').join('');
    } else if (sim.length) {
      html += '<p class="plan-nota">A ' + esc(sim.map(examTitle).join(' e a ')) + ' fica guardada para um simulado nas 2 últimas semanas.</p>';
    }
    return html;
  }
  function telaPlano() {
    const st = situacao();
    topbar({ title: 'Plano de estudos', sub: nomePlano() });
    let html = '<div class="page-head plan-head"><div class="grow"><h1>' + esc(nomePlano()) + '</h1><p>' + esc(resumoPlano(st)) + '</p></div>' +
      '<button class="btn ghost plan-trocar" data-go="#/plano/novo">Trocar de plano</button></div>';
    const acoes = '<div class="q-actions plan-acoes"><button class="btn ghost" data-go="#/plano/novo">Trocar de plano</button><button class="btn ghost" data-act="plano-encerrar">Encerrar plano</button></div>';
    if (!st.fase) {
      return html + '<div class="empty-state">' + CROC('comemora') + '<b>A prova já passou. Boa sorte no resultado!</b><br>Monte um plano novo para a próxima etapa.<br><br>' +
        '<button class="btn primary" data-go="#/plano/novo">Montar plano novo</button></div>';
    }
    const dia = gerarDia(false), seq = diasSeguidos(), nRev = vencidas(false).length;
    const diag = dia && dia.itens.some((x) => x.g);
    html += '<div class="stats"><div class="stat"><b>' + seq + '</b><span>' + (seq === 1 ? 'dia seguido' : 'dias seguidos') + '</span></div>' +
      '<div class="stat"><b>' + (dia ? dia.itens.filter((x) => feita(x, dia.d)).length + '/' + dia.itens.length : '–') + '</b><span>' + (diag ? 'diagnóstico' : 'hoje') + '</span></div>' +
      '<div class="stat"><b>' + nRev + '</b><span>para revisar</span></div></div>';
    if (plano.tipo === 'rumo') html += avisosRumo(st);
    if (plano.tipo === 'leve') {
      html += '<div class="chips plan-mats" aria-label="Matéria do Croc do dia"><button class="chip' + (plano.mat ? '' : ' on') + '" data-act="plano-mat" data-mat="">Sorteadas</button>' +
        matsLeve().map((m) => '<button class="chip' + (plano.mat === m.id ? ' on' : '') + '" data-act="plano-mat" data-mat="' + m.id + '"><i style="background:' + m.cor + '"></i>' + esc(m.nome) + '</button>').join('') + '</div>';
    }
    html += '<div class="section-title"><h2>' + (diag ? 'Diagnóstico' : 'Hoje') + '</h2></div>';
    if (!dia) {
      html += '<div class="empty-state">' + CROC('em-pe') + '<b>Hoje é folga no seu plano.</b><br>Descanse, ou estude assim mesmo.<br><br><button class="btn primary" data-act="plano-hoje">Quero estudar hoje</button></div>';
    } else {
      if (diag) html += '<p class="plan-nota">Responda sem pressa e sem consultar nada: as respostas mostram onde você precisa de reforço. Pode fazer aos poucos, em vários dias. Depois dele, cada dia ataca os seus pontos fracos.</p>';
      dia.itens.forEach((x) => {
        const q = qDe(x.k);
        if (!q) return;
        const m = materia(q.materia), ok = feita(x, dia.d);
        html += '<button class="card qrow tap' + (ok ? ' feita' : '') + '" data-go="#/q/' + x.k + '?p=1"><span class="num" style="background:' + m.cor + '">' + esc(rotulo(q)) + '</span>' +
          '<span class="grow"><b>' + esc(examTitle(q.prova) + ' · ' + m.nome) + '</b><small>' + esc(assunto(q.materia, q.assunto) + (x.r ? ' · revisão' : '') + (discursiva(q) ? ' · discursiva' : '')) + '</small></span>' +
          (ok ? markHtml(answers[x.k]) : '') + ICON.chev + '</button>';
      });
      if (!dia.itens.length) html += '<p class="plan-nota">Não sobrou questão nova para este plano. Que tal trocar de plano?</p>';
      else if (dia.itens.every((x) => feita(x, dia.d))) {
        html += '<div class="verdict ok">' + CROC('comemora') + '<div>Plano de hoje cumprido!<small>Amanhã tem mais. Se quiser continuar agora, peça mais questões.</small></div></div>' +
          '<div class="q-actions"><button class="btn ghost" data-act="plano-mais">Mais questões</button></div>';
      }
    }
    if (plano.tipo === 'reforco' && !diag) {
      const fr = fracos();
      html += '<div class="section-title"><h2>Seus pontos fracos</h2></div>';
      html += !fr.length ? '<p class="plan-nota">Nenhum assunto fraco por enquanto. Um assunto entra aqui quando tem pelo menos 2 respostas e menos de 70% de acerto.</p>'
        : '<div class="card fracos">' + fr.map((x) => '<div class="fraco"><div><b>' + esc(assunto(x.m, x.a)) + '</b><small>' + esc(materia(x.m).nome) + ' · ' + x.ok + ' de ' + x.n + ' certas</small></div>' +
          '<div class="bar"><i style="width:' + Math.round(x.ok / x.n * 100) + '%"></i></div></div>').join('') + '</div>';
    }
    if (plano.vest) html += botaoRaioX(plano.vest);
    return html + acoes;
  }

  // ================================================================== sequência, meta do dia e lembrete
  // Como no Duolingo: o dia em que o aluno bate a meta (3 questões, por padrão) soma um dia à sequência.
  // Hoje sem a meta ainda não quebra. Dia de folga do plano e dia salvo por um protetor seguram a
  // sequência sem somar. O aluno ganha um protetor a cada 7 dias seguidos (no máximo 2), e ele é gasto
  // sozinho no primeiro dia em que a meta não sai.
  const METAS = [[1, 'Leve'], [3, 'Normal'], [5, 'Puxada'], [10, 'Intensa']];
  const registro = loadJson(KEY.registro);   // { d: { dia: feitas }, ok: { dia: 1 }, usado: { dia: 1 }, meta, prot, recorde, fechado, lembrete: { on, h } }
  ['d', 'ok', 'usado'].forEach((k) => { registro[k] = registro[k] || {}; });
  const metaDia = () => registro.meta || 3;
  const hojeStr = () => diaStr(Date.now());
  const LETRA_DIA = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];             // segunda a domingo
  const ICON_FOGO = '<svg class="fogo" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.6 2c.9 3.4-1.4 5.1-1.4 7.4 0 1.2.8 2.2 1.9 2.4-.2-2 1-3.5 2.3-4.5.7 3 3.1 4.6 3.1 8.2A6.5 6.5 0 0112 22a6.5 6.5 0 01-6.5-6.5C5.5 10.6 10.3 8 12.6 2z"/></svg>';
  const ICON_ESCUDO = '<svg class="escudo" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.5l7.5 3v6c0 4.6-3.2 8.3-7.5 10-4.3-1.7-7.5-5.4-7.5-10v-6z"/></svg>';
  const ICON_SINO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9a6 6 0 0112 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9z"/><path d="M10 20a2 2 0 004 0"/></svg>';

  // a sequência começa com o histórico de antes: cada resposta conta no dia em que foi dada
  function semearRegistro() {
    if (registro._semeado) return;
    Object.keys(answers).forEach((k) => { const a = answers[k]; if (a && a.t) { const d = diaStr(a.t); registro.d[d] = (registro.d[d] || 0) + 1; } });
    Object.keys(registro.d).forEach((d) => { if (registro.d[d] >= metaDia()) registro.ok[d] = 1; });
    registro._semeado = 1;
    registro.fechado = diaStr(Date.now() - DIA);
    registro.recorde = Math.max(registro.recorde || 0, diasSeguidos());
    saveJson(KEY.registro, registro);
  }
  // como ficou o dia: 'meta', 'prot' (protetor gasto), 'folga' (dia sem estudo no plano) ou '' (não fez)
  function estadoDia(d) {
    if (registro.ok[d]) return 'meta';
    if (registro.usado[d]) return 'prot';
    if (plano.tipo && plano.dias && inicioDia(d) >= inicioDia(diaStr(plano.criado || 0)) && !estudaEm(new Date(inicioDia(d)).getDay())) return 'folga';
    return '';
  }
  // dias seguidos até "ate" (hoje, se não disser)
  function diasSeguidos(ate) {
    const hoje = hojeStr();
    let n = 0, t = inicioDia(ate || hoje) + DIA / 2;
    if (diaStr(t) === hoje && estadoDia(hoje) !== 'meta') t -= DIA;
    for (let i = 0; i < 4000; i++, t -= DIA) {
      const e = estadoDia(diaStr(t));
      if (e === 'meta') n++;
      else if (!e) break;
    }
    return n;
  }
  // os dias que já passaram sem a meta gastam protetor (só se havia sequência para salvar)
  function fecharDias() {
    const ontem = diaStr(Date.now() - DIA);
    if (!registro.fechado || registro.fechado >= ontem) return;
    for (let t = inicioDia(registro.fechado) + DIA * 1.5; diaStr(t) <= ontem; t += DIA) {
      const d = diaStr(t);
      if (!estadoDia(d) && registro.prot > 0 && diasSeguidos(diaStr(t - DIA)) > 0) { registro.prot--; registro.usado[d] = 1; }
    }
    registro.fechado = ontem;
    saveJson(KEY.registro, registro);
  }
  // uma questão feita (objetiva respondida ou discursiva com todos os itens avaliados)
  function contarFeita() {
    const d = hojeStr(), n = (registro.d[d] || 0) + 1;
    registro.d[d] = n;
    const r = { bateu: !registro.ok[d] && n >= metaDia(), ganhou: false };
    if (r.bateu) {
      registro.ok[d] = 1;
      const seq = diasSeguidos();
      registro.recorde = Math.max(registro.recorde || 0, seq);
      if (seq % 7 === 0 && (registro.prot || 0) < 2) { registro.prot = (registro.prot || 0) + 1; r.ganhou = true; }
    }
    saveJson(KEY.registro, registro);
    agendarLembretes();
    return r;
  }
  function trocarMeta(m) {
    registro.meta = m;
    const d = hojeStr();
    if ((registro.d[d] || 0) >= m) registro.ok[d] = 1;
    saveJson(KEY.registro, registro);
    agendarLembretes();
  }
  // a semana de segunda a domingo, com o estado de cada dia
  function semanaHtml() {
    const hoje = hojeStr(), seg = inicioDia(hoje) + DIA / 2 - ((new Date().getDay() + 6) % 7) * DIA;
    let html = '<div class="seq-semana">';
    for (let i = 0; i < 7; i++) {
      const d = diaStr(seg + i * DIA), e = d > hoje ? 'futuro' : estadoDia(d) || (d === hoje ? 'hoje' : 'perdido');
      html += '<span class="seq-d ' + e + (d === hoje ? ' agora' : '') + '"><i>' + (e === 'meta' ? ICON_FOGO : e === 'prot' ? ICON_ESCUDO : '') + '</i><small>' + LETRA_DIA[i] + '</small></span>';
    }
    return html + '</div>';
  }
  const textoHoje = () => {
    const f = registro.d[hojeStr()] || 0, m = metaDia();
    return registro.ok[hojeStr()] ? 'Meta de hoje cumprida: ' + plural(f, 'questão', 'questões') : 'Hoje: ' + Math.min(f, m) + ' de ' + plural(m, 'questão', 'questões');
  };
  // quadro da sequência no topo da tela inicial
  function cartaoSequencia() {
    const seq = diasSeguidos(), f = registro.d[hojeStr()] || 0, m = metaDia();
    return '<button class="in-seq tap" data-go="#/sequencia"><span class="in-seq-top"><span class="in-fogo' + (seq ? '' : ' apagado') + '">' + ICON_FOGO + '<b>' + seq + '</b></span>' +
      '<span class="grow">' + (seq === 1 ? 'dia seguido' : 'dias seguidos') + '</span>' + (registro.prot ? '<span class="in-prot" title="Protetores de sequência">' + ICON_ESCUDO + registro.prot + '</span>' : '') + '</span>' +
      semanaHtml() + '<span class="bar"><i style="width:' + (registro.ok[hojeStr()] ? 100 : Math.round(Math.min(1, f / m) * 100)) + '%"></i></span><small>' + esc(textoHoje()) + '</small></button>';
  }

  // comemoração da meta do dia (uma vez por dia)
  function festejar(r) {
    const seq = diasSeguidos();
    fecharFesta();
    clearTimeout(toastTimer); $('#toast').classList.remove('on');   // o aviso da questão anterior sai da frente
    const box = document.createElement('div');
    box.className = 'festa';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Meta do dia cumprida');
    box.innerHTML = '<div class="festa-in">' + CROC('comemora') + '<div class="festa-fogo">' + ICON_FOGO + '<b>' + seq + '</b></div>' +
      '<h2>' + (seq === 1 ? 'Sequência começou!' : seq + ' dias seguidos!') + '</h2><p>Meta de hoje cumprida: ' + plural(metaDia(), 'questão', 'questões') + '.' +
      (r.ganhou ? ' <b>Você ganhou um protetor:</b> se um dia a meta não sair, ele segura a sequência.' : seq === registro.recorde && seq > 1 ? ' É o seu recorde!' : ' Volte amanhã para continuar.') + '</p>' +
      semanaHtml() + '<button class="btn primary" data-act="festa-ok">Continuar</button></div>';
    document.body.appendChild(box);
  }
  function fecharFesta() { const b = $('.festa'); if (b) b.remove(); }
  // depois de cada questão feita: a meta saiu agora? (senão, um aviso discreto do quanto falta)
  function aposFeita(planoCumprido) {
    const r = contarFeita();
    if (r.bateu) return () => festejar(r);
    if (!planoCumprido && !registro.ok[hojeStr()]) toast('Meta do dia: ' + (registro.d[hojeStr()] || 0) + ' de ' + metaDia());
    return () => null;
  }

  // lembrete: no app instalado, notificação do aparelho (LocalNotifications do Capacitor), agendada para
  // os próximos 7 dias e refeita a cada questão (no dia da meta cumprida, não toca). No navegador, só
  // toca com a página aberta.
  const LEMBRETE_IDS = [7001, 7002, 7003, 7004, 7005, 7006, 7007];
  const lembrete = () => registro.lembrete || { on: false, h: '19:00' };
  let lembreteTimer = 0, agendaTimer = 0;
  function proximosLembretes() {
    const L = lembrete(), [hh, mm] = L.h.split(':').map(Number), hoje = hojeStr(), seq = diasSeguidos(), out = [];
    for (let i = 0; i < 7; i++) {
      const d = diaStr(inicioDia(hoje) + DIA / 2 + i * DIA), [y, m, dd] = d.split('-').map(Number), at = new Date(y, m - 1, dd, hh, mm, 0);
      if (at.getTime() <= Date.now() + 60000 || (i === 0 && registro.ok[hoje])) continue;
      // só o de hoje sabe o número certo (os outros são refeitos a cada vez que o app abre)
      const falta = i === 0 ? metaDia() - (registro.d[hoje] || 0) : metaDia();
      const texto = i === 0 && seq > 0 ? 'Sua sequência de ' + plural(seq, 'dia', 'dias') + ' está te esperando: ' + plural(falta, 'questão', 'questões') + ' e ela continua.'
        : seq > 0 || registro.ok[hoje] ? 'Não deixe a sua sequência esfriar: ' + plural(falta, 'questão', 'questões') + ' e ela continua.'
          : ['Uns minutos hoje? ' + plural(falta, 'questão', 'questões') + ' e a sua sequência começa.', 'O croc está com fome de questão. Bora?', 'Que tal uma questão de vestibular agora?'][i % 3];
      out.push({ id: LEMBRETE_IDS[i], at, titulo: 'Hora do SuperCroc 🐊', texto });
    }
    return out;
  }
  function agendarLembretes() {
    clearTimeout(agendaTimer);
    agendaTimer = setTimeout(() => {
      const L = lembrete(), lista = L.on ? proximosLembretes() : [], ln = nativePlugin('LocalNotifications');
      if (ln) {
        Promise.resolve(ln.cancel({ notifications: LEMBRETE_IDS.map((id) => ({ id })) })).catch(() => null)
          .then(() => lista.length && ln.schedule({ notifications: lista.map((x) => ({ id: x.id, title: x.titulo, body: x.texto, schedule: { at: x.at, allowWhileIdle: true } })) }))
          .catch((e) => reportError(e, 'lembrete'));
        return;
      }
      clearTimeout(lembreteTimer);
      const prox = lista[0];
      if (!prox || !('Notification' in window) || Notification.permission !== 'granted' || prox.at - Date.now() > 2147483000) return;
      lembreteTimer = setTimeout(() => {
        try { new Notification(prox.titulo, { body: prox.texto, icon: '../shared/images/croc/cabeca.webp' }); } catch (e) { /* o navegador não deixou */ }
        agendarLembretes();
      }, prox.at - Date.now());
    }, 300);
  }
  // ligar o lembrete pede a permissão de notificação (no aparelho ou no navegador)
  function ligarLembrete(on) {
    const salvar = (v) => { registro.lembrete = Object.assign(lembrete(), { on: v }); saveJson(KEY.registro, registro); agendarLembretes(); render(true); };
    if (!on) return salvar(false);
    const ln = nativePlugin('LocalNotifications');
    const pedir = ln ? Promise.resolve(ln.requestPermissions()).then((r) => r && r.display === 'granted')
      : 'Notification' in window ? Promise.resolve(Notification.requestPermission()).then((r) => r === 'granted') : Promise.resolve(false);
    pedir.catch(() => false).then((ok) => {
      if (ok) { salvar(true); toast('Lembrete ligado'); }
      else toast(ln || 'Notification' in window ? 'Permita as notificações para o SuperCroc nas configurações' : 'Este navegador não mostra lembretes');
    });
  }

  // tela da sequência: os números, o calendário, a meta do dia e o lembrete
  function viewSequencia() {
    fecharDias();
    topbar({ title: 'Sua sequência', sub: textoHoje() });
    const seq = diasSeguidos(), hoje = hojeStr(), L = lembrete();
    let html = '<div class="seq-topo card"><div class="festa-fogo' + (seq ? '' : ' apagado') + '">' + ICON_FOGO + '<b>' + seq + '</b></div><div class="grow"><h1>' + (seq === 1 ? '1 dia seguido' : seq + ' dias seguidos') + '</h1>' +
      '<p>' + (registro.ok[hoje] ? 'Meta de hoje cumprida. Volte amanhã para continuar.' : seq ? 'Faça a meta de hoje para a sequência continuar.' : 'Faça a meta de hoje para começar uma sequência.') + '</p></div></div>';
    const semana = [0, 1, 2, 3, 4, 5, 6].reduce((s, i) => s + (registro.d[diaStr(Date.now() - i * DIA)] || 0), 0);
    html += '<div class="stats"><div class="stat"><b>' + (registro.recorde || seq) + '</b><span>recorde</span></div><div class="stat"><b>' + semana + '</b><span>questões em 7 dias</span></div>' +
      '<div class="stat"><b>' + (registro.prot || 0) + '/2</b><span>protetores</span></div></div>';

    // as últimas 5 semanas, de segunda a domingo
    const seg = inicioDia(hoje) + DIA / 2 - ((new Date().getDay() + 6) % 7) * DIA - 28 * DIA;
    html += '<div class="section-title"><h2>Últimas semanas</h2></div><div class="card seq-cal">' + LETRA_DIA.map((l) => '<small>' + l + '</small>').join('');
    for (let i = 0; i < 35; i++) {
      const d = diaStr(seg + i * DIA), e = d > hoje ? 'futuro' : estadoDia(d) || (d === hoje ? 'hoje' : 'perdido'), n = registro.d[d] || 0;
      html += '<span class="seq-c ' + e + (d === hoje ? ' agora' : '') + '" title="' + esc(dataLonga(d) + ': ' + plural(n, 'questão', 'questões')) + '">' + (e === 'meta' ? ICON_FOGO : e === 'prot' ? ICON_ESCUDO : '<b>' + Number(d.slice(8)) + '</b>') + '</span>';
    }
    html += '</div><p class="plan-nota seq-legenda"><span>' + ICON_FOGO + ' meta cumprida</span><span>' + ICON_ESCUDO + ' salvo por um protetor</span><span><i class="seq-folga"></i> folga do plano</span></p>';

    html += '<div class="section-title"><h2>Meta do dia</h2></div><div class="chips seq-metas">' + METAS.map(([m, nome]) =>
      '<button class="chip' + (m === metaDia() ? ' on' : '') + '" data-act="meta" data-meta="' + m + '">' + nome + ' · ' + plural(m, 'questão', 'questões') + '</button>').join('') + '</div>' +
      '<p class="plan-nota">Questões de revisão e as do plano de estudos também contam. A cada 7 dias seguidos você ganha um protetor (até 2): ele segura a sequência num dia em que a meta não sair.</p>';

    const nativo = !!nativePlugin('LocalNotifications');
    html += '<div class="section-title"><h2>Lembrete</h2></div><div class="card seq-lembrete"><span class="in-ic">' + ICON_SINO + '</span><div class="grow"><b>Lembrete diário</b><small>' +
      (L.on ? 'Ligado. Não toca no dia em que a meta já saiu.' : 'Um aviso no horário que você escolher, para não perder a sequência.') + '</small>' +
      '<label class="seq-hora">Horário <input type="time" name="lembrete-hora" value="' + esc(L.h) + '"></label></div>' +
      '<button class="btn ' + (L.on ? 'ghost' : 'primary') + '" data-act="lembrete" data-on="' + (L.on ? '' : '1') + '">' + (L.on ? 'Desligar' : 'Ligar') + '</button></div>' +
      (nativo ? '' : '<p class="plan-nota">No app instalado no celular, o lembrete chega mesmo com o app fechado. No navegador, ele só aparece com esta página aberta.</p>');
    return html;
  }

  // contagem regressiva: só para quem escolheu vestibular no plano. No Rumo, as datas do plano; nos
  // outros vestibulares dele e no Reforço, a data prevista (a da última edição, um ano depois).
  function contagens() {
    if (!plano.tipo || !plano.vest) return [];
    const out = [], hoje = inicioDia(hojeStr());
    const add = (v, fase, d, prevista) => {
      const n = d ? Math.round((inicioDia(d) - hoje) / DIA) : -1;
      if (n >= 0) out.push({ v, fase: v === 'ENEM' && fase === '1ª fase' ? 'prova' : fase, d, n, prevista });
    };
    if (plano.tipo === 'rumo') {
      add(plano.vest, '1ª fase', plano.prova, false);
      if (plano.prova2) add(plano.vest, '2ª fase', plano.prova2, false);
      (plano.outros || []).forEach((v) => add(v, '1ª fase', sugerirDatas(v).d1, true));
    } else add(plano.vest, '1ª fase', sugerirDatas(plano.vest).d1, true);
    return out;
  }
  function contagemHtml() {
    const cs = contagens();
    if (!cs.length) return '';
    return '<div class="in-contagem">' + cs.map((c) => '<button class="card in-cd tap" data-go="#/plano"><b>' + (c.n === 0 ? 'Hoje' : c.n) + '</b><span>' + (c.n === 0 ? '' : c.n === 1 ? 'dia' : 'dias') + '</span>' +
      '<small><strong>' + esc(c.v) + ' · ' + c.fase + '</strong>' + esc(dataLonga(c.d)) + (c.prevista ? ' · prevista' : '') + '</small></button>').join('') + '</div>';
  }

  // ================================================================== tela: prova
  let examFilter = '';
  function viewExam(id) {
    return loadExam(id).then((p) => {
      topbar({ title: examTitle(p), sub: p.resolved.length + ' de ' + p.total + ' questões resolvidas' });
      const done = p.resolved.filter((n) => answers[qkey(p.id, n)]);
      const ok = done.filter((n) => answers[qkey(p.id, n)].ok).length;
      const subjects = [];
      for (let n = p.inicio; n <= p.fim; n++) { const s = subjectOf(p, n); if (s && !subjects.includes(s)) subjects.push(s); }
      let html = '<div class="page-head"><h1>' + esc(p.vestibular + ' ' + p.ano) + '</h1><p>' + esc(p.fase) + ' · ' + p.total + ' questões</p></div>' +
        '<div class="stats"><div class="stat"><b>' + p.resolved.length + '</b><span>resolvidas</span></div><div class="stat"><b>' + done.length + '</b><span>feitas por você</span></div>' +
        '<div class="stat"><b>' + (done.length ? Math.round(ok / done.length * 100) + '%' : '–') + '</b><span>acertos</span></div></div>';
      html += '<div class="chips" role="tablist"><button class="chip' + (examFilter ? '' : ' on') + '" data-filter="">Todas</button>' +
        subjects.map((s) => '<button class="chip' + (examFilter === s ? ' on' : '') + '" data-filter="' + s + '"><i style="background:' + materia(s).cor + '"></i>' + esc(materia(s).nome) + '</button>').join('') + '</div>';
      html += '<div class="qgrid">';
      for (let n = p.inicio; n <= p.fim; n++) {
        const s = subjectOf(p, n);
        if (examFilter && s !== examFilter) continue;
        const q = p.byN[n], m = materia(s), a = answers[qkey(p.id, n)];
        if (q) {
          const mk = markOf(a);
          html += '<button class="qcell tap" style="--c:' + m.cor + '" data-go="#/q/' + p.id + '/' + n + '" aria-label="' + esc(tituloQ(q)) + ', ' + esc(m.nome) + '">' + esc(q.rotulo_curto || n) +
            '<small>' + esc(m.sigla) + '</small>' + (mk ? '<span class="mark ' + mk + '">' + MARK_TXT[mk] + '</span>' : '') + (q.video ? vidIcon : '') + '</button>';
        } else {
          html += '<div class="qcell soon" style="--c:' + m.cor + '" aria-label="Questão ' + n + ', ainda sem resolução">' + n + '<small>em breve</small></div>';
        }
      }
      html += '</div>';
      if (p.extras.length) {
        html += '<div class="assunto">Outras versões</div><div class="qgrid">' + p.extras.filter((q) => !examFilter || q.materia === examFilter).map((q) => {
          const m = materia(q.materia), a = answers[qkey(p.id, q.n)];
          return '<button class="qcell tap" style="--c:' + m.cor + '" data-go="#/q/' + p.id + '/' + q.n + '" aria-label="' + esc(tituloQ(q)) + '">' + esc(rotulo(q)) +
            '<small>' + esc(m.sigla) + '</small>' + (a ? '<span class="mark ' + (a.ok ? 'ok">✓' : 'bad">✕') + '</span>' : '') + '</button>';
        }).join('') + '</div>';
      }
      html += '<div class="legend"><span>' + vidIcon.replace('class="vid"', 'width="14" height="14" style="color:var(--ink-2)"') + 'tem vídeo</span><span><b style="color:var(--ok)">✓</b> você acertou</span>' +
        (p.tipo === 'discursiva' ? '<span><b style="color:var(--amber)">½</b> acertou em parte</span>' : '') + '<span><b style="color:var(--bad)">✕</b> você errou</span><span>tracejado: em breve</span></div>';
      return html;
    });
  }

  // ================================================================== tela: questão
  const revealed = {};            // resolução aberta sem responder (só nesta sessão)
  function viewQuestion(provaId, n, ctx) {
    return loadExam(provaId).then((p) => {
      const q = p.byN[n];
      if (!q) return notFound('Esta questão ainda não foi resolvida.');
      saveJson(KEY.last, { prova: p.id, n });
      const m = materia(q.materia);
      const favs = loadJson(KEY.favs);
      const fk = qkey(p.id, n);
      if (ctx.p) prepararRevisao(fk);
      topbar({
        title: tituloQ(q), sub: examTitle(p),
        right: '<button class="tb-btn" data-act="fav" aria-label="Favoritar">' + (favs[fk] ? ICON.starOn : ICON.star) + '</button>',
      });
      const a = answers[fk];
      const anulada = q.gabarito === 'ANULADA';
      const open = anulada || !!a || revealed[fk];

      let left = '<div class="q-tags"><span class="tag subj" style="background:' + m.cor + '">' + esc(m.nome) + '</span><span class="tag">' + esc(assunto(q.materia, q.assunto)) + '</span>' +
        (q.materias_extra || []).map((x) => '<span class="tag subj" style="background:' + materia(x.materia).cor + '">' + esc(materia(x.materia).nome) + '</span><span class="tag">' + esc(assunto(x.materia, x.assunto)) + '</span>').join('') +
        '<span class="diff" title="Dificuldade">' + [1, 2, 3].map((k) => '<i class="' + (k <= q.dificuldade ? 'on' : '') + '"></i>').join('') + ' ' + ['', 'fácil', 'média', 'difícil'][q.dificuldade] + '</span></div>';
      if (q.enunciado.length) left += '<div class="card statement">' + blocks(q.enunciado, p.base) + '</div>';   // discursiva pode começar direto no item a)
      if (discursiva(q)) {
        return '<div class="q-layout disc"><div class="q-left">' + left + '</div><div class="q-right">' + discursivaHtml(p, q, fk) + '<div class="irmas-slot" data-k="' + fk + '"></div>' + navHtml(p, fk, ctx) + '</div></div>';
      }
      left += '<div class="alts">' + LETTERS.filter((L) => q.alternativas[L] != null).map((L) => {
        let cls = '';
        if (open) cls = anulada ? 'dim' : L === q.gabarito ? 'right' : (a && a.l === L ? 'wrong' : 'dim');
        return '<button class="alt' + (cls ? ' ' + cls : '') + '" data-ans="' + L + '"' + (open ? ' disabled' : '') + '><span class="L">' + L + '</span><span class="T">' + rich(q.alternativas[L]) + '</span></button>';
      }).join('') + '</div>';
      if (!open) {
        left += '<div class="q-actions"><button class="btn ghost" data-act="reveal">' + ICON.eye + 'Ver resolução sem responder</button></div>';
      } else if (a) {
        left += '<div class="q-actions"><button class="btn ghost" data-act="redo">' + ICON.redo + 'Refazer</button></div>';
      }

      let right = '';
      if (anulada) {
        right += '<div class="verdict anulada">' + CROC('desafio') + '<div>Questão anulada pela banca.<small>' + rich(q.motivo_anulacao || 'Ela não conta pontos, mas vale como estudo.') + '</small></div></div>';
      } else if (a) {
        right += a.ok
          ? '<div class="verdict ok">' + CROC('comemora') + '<div>Mandou bem! Alternativa ' + a.l + '.<small>Confira a resolução para fixar o caminho.</small></div></div>'
          : '<div class="verdict bad">' + CROC('animo') + '<div>Quase! Você marcou ' + a.l + '; a correta é ' + q.gabarito + '.<small>' + (q.comentarios ? 'Veja abaixo onde está a pegadinha da ' + a.l + '.' : 'Acompanhe a resolução abaixo e refaça a conta.') + '</small></div></div>';
      }
      if (open) {
        right += '<section class="sol"><h2>Resolução <span class="pill">' + (anulada ? 'Anulada' : 'Resposta: ' + q.gabarito) + '</span></h2>';
        if (q.resumo) right += '<div class="oneline"><b>Em uma frase</b>' + rich(q.resumo) + '</div>';
        const pol = q.resolucao.find((b) => b.polemica);
        if (pol) right += block(pol, p.base);
        if (q.video) {
          right += '<div class="card video-card"><div class="vhead"><span class="vicon">' + ICON.video + '</span><div><b>Resolução em vídeo</b></div></div>' +
            '<video controls playsinline preload="none" controlslist="nodownload" oncontextmenu="return false" poster="' + esc(CONTENT + p.base + q.video.poster) + '" src="' + esc(CONTENT + p.base + q.video.src) + '"></video></div>';
        }
        const steps = q.resolucao.filter((b) => b.passo);
        const extra = q.resolucao.filter((b) => !b.passo && !b.polemica);
        right += '<div class="steps">' + blocks(steps, p.base) + blocks(extra, p.base) + '</div></section>';
        if (q.comentarios) {
          right += '<section class="why"><h2>Análise das alternativas</h2>' + LETTERS.filter((L) => q.comentarios[L]).map((L) =>
            '<div class="why-item' + (L === q.gabarito ? ' right' : '') + (a && a.l === L && L !== q.gabarito ? ' mine' : '') + '"><span class="L">' + L + '</span><div class="T">' +
            (a && a.l === L ? '<span class="you">sua resposta</span>' : '') + '<em class="alt-txt">' + rich(q.alternativas[L]) + '</em>' + rich(q.comentarios[L]) + '</div></div>').join('') + '</section>';
        }
        right += '<div class="irmas-slot" data-k="' + fk + '"></div>';
      } else {
        right += '<div class="locked">' + CROC('desafio') + '<b>Tente primeiro!</b><br>Escolha uma alternativa para ver a resolução completa' + (q.video ? ', com vídeo' : '') + '.</div>';
      }

      right += navHtml(p, fk, ctx);

      return '<div class="q-layout"><div class="q-left">' + left + '</div><div class="q-right">' + right + '</div></div>';
    });
  }

  // ================================================================== questões irmãs
  // No fim da resolução: até 3 questões de outras provas com o mesmo assunto, as que dividem mais
  // tópicos primeiro e, quando dá, de vestibulares diferentes. Entram depois de a tela aparecer.
  const semAcento = (t) => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  function irmas(q, n) {
    const tops = (q.topicos || []).map(semAcento);
    const cands = allResolved().filter((x) => x.prova.id !== q.prova.id && x.materia === q.materia && x.assunto === q.assunto && !x.variante && x.tipo !== 'redacao')
      .map((x) => {
        const comuns = (x.topicos || []).filter((t) => tops.indexOf(semAcento(t)) >= 0);
        return { x, comuns, s: comuns.length * 3 + (x.prova.vestibular !== q.prova.vestibular ? 1 : 0) + (discursiva(x) === discursiva(q) ? 0.5 : 0) - Math.abs(x.dificuldade - q.dificuldade) * 0.3 };
      }).sort((a, b) => b.s - a.s || b.x.prova.ano - a.x.prova.ano);
    const out = [], melhor = cands.length ? cands[0].comuns.length : 0;
    // primeiro uma por vestibular, entre as mais parecidas; depois completa com as que sobrarem
    cands.forEach((c) => { if (out.length < n && c.comuns.length >= melhor - 1 && !out.some((o) => o.x.prova.vestibular === c.x.prova.vestibular)) out.push(c); });
    cands.forEach((c) => { if (out.length < n && out.indexOf(c) < 0) out.push(c); });
    return out.sort((a, b) => b.s - a.s);
  }
  function hidratarIrmas(root) {
    const slot = $('.irmas-slot', root);
    if (!slot) return;
    loadAllExams().then(() => {
      const q = qDe(slot.dataset.k), lista = q && slot.isConnected ? irmas(q, 3) : [];
      if (!lista.length) return;
      slot.innerHTML = '<section class="irmas"><h2>Questões irmãs</h2><p>A mesma ideia em outras provas.</p>' + lista.map(({ x, comuns }) => {
        const m = materia(x.materia), k = chave(x);
        return '<button class="card qrow tap" data-go="#/q/' + k + '"><span class="num" style="background:' + m.cor + '">' + esc(rotulo(x)) + '</span><span class="grow"><b>' + esc(examTitle(x.prova)) + '</b>' +
          '<small>' + esc((comuns.length ? 'Em comum: ' + comuns.join(', ') : assunto(x.materia, x.assunto)) + (discursiva(x) ? ' · discursiva' : '')) + '</small></span>' + markHtml(answers[k]) + ICON.chev + '</button>';
      }).join('') + '</section>';
    }).catch((e) => reportError(e, 'irmas'));
  }

  // navegação: dentro da prova, ou dentro da matéria (ou do filtro, ou do plano do dia) quando veio de lá
  function navHtml(p, fk, ctx) {
    if (ctx.p) {
      const lista = plano.dia ? plano.dia.itens.map((x) => x.k) : [], i = lista.indexOf(fk);
      const ant = i > 0 ? lista[i - 1] : null, prox = i >= 0 && i + 1 < lista.length ? lista[i + 1] : null;
      return '<div class="q-nav"><button class="btn ghost" ' + (ant ? 'data-go="#/q/' + ant + '?p=1" data-replace' : 'disabled') + '>' + ICON.back + 'Anterior</button>' +
        (prox ? '<button class="btn primary" data-go="#/q/' + prox + '?p=1" data-replace>Próxima' + ICON.chev.replace('class="chev"', '') + '</button>'
          : '<button class="btn primary" data-act="back">Voltar ao plano</button>') + '</div>';
    }
    const list = ctx.f ? filtradas().map((x) => x.prova.id + '/' + x.n)
      : ctx.m ? allResolved().filter((x) => temMateria(x, ctx.m)).map((x) => x.prova.id + '/' + x.n) : p.resolved.map((k) => p.id + '/' + k);
    const suffix = ctx.f ? '?f=1' : ctx.m ? '?m=' + ctx.m : '';
    // a questão pode ter saído do filtro (ex.: "não feitas" logo depois de responder): os vizinhos
    // são procurados pela ordem geral, então "Próxima" continua funcionando
    const ordem = allResolved().map((x) => x.prova.id + '/' + x.n);
    const pos = (k) => ordem.indexOf(k), aqui = pos(fk);
    const antes = list.filter((k) => pos(k) < aqui), depois = list.filter((k) => pos(k) > aqui);
    const prev = antes.length ? antes[antes.length - 1] : null, next = depois.length ? depois[0] : null;
    return '<div class="q-nav"><button class="btn ghost" ' + (prev ? 'data-go="#/q/' + prev + suffix + '" data-replace' : 'disabled') + '>' + ICON.back + 'Anterior</button>' +
      '<button class="btn primary" ' + (next ? 'data-go="#/q/' + next + suffix + '" data-replace' : 'disabled') + '>Próxima' + ICON.chev.replace('class="chev"', '') + '</button></div>';
  }

  // ================================================================== questão discursiva (2ª fase)
  // Cada item (a, b, c) é um cartão: o aluno escreve a resposta dele (fica só no aparelho), abre a
  // resposta esperada com a explicação e se autoavalia. A redação tem uma área de escrita e uma orientação.
  const itemOpen = {};           // itens abertos nesta sessão
  const NOTAS = [['ok', 'Acertei'], ['meio', 'Em parte'], ['erro', 'Errei']];
  function discursivaHtml(p, q, fk) {
    const a = answers[fk], it = (a && a.it) || {};
    let html = '';
    if (q.tipo === 'redacao') {
      const dk = fk + '/redacao', aberta = itemOpen[dk];
      html += '<div class="card item redacao"><div class="item-head"><span class="L">' + ICON.pen + '</span><div class="T"><b>Sua redação</b><small>Escreva seguindo as instruções da proposta. O texto fica salvo só neste aparelho.</small></div></div>' +
        '<textarea class="draft big" data-draft="' + esc(dk) + '" rows="14" placeholder="Título (se a prova pedir) e texto...">' + esc(drafts[dk] || '') + '</textarea>' +
        '<div class="draft-count" data-count="' + esc(dk) + '">' + contaLinhas(drafts[dk]) + '</div>' +
        (aberta ? '' : '<div class="q-actions"><button class="btn primary" data-act="ver-item" data-item="redacao">' + ICON.eye + 'Ver orientação da redação</button></div>') + '</div>';
      if (aberta) html += '<section class="sol"><h2>Como fazer esta redação</h2>' + (q.resumo ? '<div class="oneline"><b>Em uma frase</b>' + rich(q.resumo) + '</div>' : '') +
        '<div class="steps">' + blocks(q.resolucao, p.base) + '</div></section>';
      return html;
    }
    const nAbertos = q.itens.filter((x) => itemOpen[fk + '/' + x.letra] || it[x.letra]).length;
    q.itens.forEach((x) => {
      const ik = fk + '/' + x.letra, aberto = itemOpen[ik] || !!it[x.letra];
      html += '<div class="card item' + (aberto ? ' open' : '') + '">' + (x.contexto ? '<div class="item-ctx">' + blocks(x.contexto, p.base) + '</div>' : '') + '<div class="item-head"><span class="L">' + (x.letra === '*' ? ICON.pen : esc(x.letra)) + '</span><div class="T">' + rich(x.pergunta) + (x.pontos ? '<small class="pts">Vale ' + x.pontos + ' ponto' + (x.pontos > 1 ? 's' : '') + '</small>' : '') + '</div></div>' +
        (x.enunciado ? '<div class="item-enun">' + blocks(x.enunciado, p.base) + '</div>' : '') +
        '<textarea class="draft" data-draft="' + esc(ik) + '" rows="4" placeholder="Escreva sua resposta (fica salva só neste aparelho)">' + esc(drafts[ik] || '') + '</textarea>';
      if (!aberto) {
        html += '<div class="q-actions"><button class="btn primary" data-act="ver-item" data-item="' + esc(x.letra) + '">' + ICON.eye + 'Ver resposta esperada</button></div>';
      } else {
        html += '<div class="resp"><b>Resposta esperada</b>' + blocks(x.resposta, p.base) + '</div>';
        if (x.resolucao && x.resolucao.length) html += '<div class="item-sol"><b class="item-sol-t">Como chegar lá</b><div class="steps">' + blocks(x.resolucao, p.base) + '</div></div>';
        html += '<div class="selfgrade"><span>Comparando com a sua resposta:</span><div class="sg-btns">' + NOTAS.map(([v, t]) =>
          '<button class="sg ' + v + (it[x.letra] === v ? ' on' : '') + '" data-act="nota-item" data-item="' + esc(x.letra) + '" data-nota="' + v + '">' + t + '</button>').join('') + '</div></div>';
      }
      html += '</div>';
    });
    if (nAbertos === q.itens.length) {
      const fecho = q.resolucao || [];
      html += '<section class="sol fecho">' + (q.resumo ? '<div class="oneline"><b>Em uma frase</b>' + rich(q.resumo) + '</div>' : '') +
        (fecho.length ? '<div class="steps">' + blocks(fecho, p.base) + '</div>' : '') + '</section>';
      if (a && a.it && Object.keys(a.it).length === q.itens.length) {
        html += a.ok ? '<div class="verdict ok">' + CROC('comemora') + '<div>Mandou bem! Todos os itens certos.<small>Releia a resposta esperada para fixar o jeito de escrever.</small></div></div>'
          : '<div class="verdict mid">' + CROC('animo') + '<div>Quase lá!<small>Compare de novo os itens em que você não acertou tudo e tente reescrever.</small></div></div>';
        html += '<div class="q-actions"><button class="btn ghost" data-act="redo">' + ICON.redo + 'Refazer</button></div>';
      }
    }
    return html;
  }
  // a FUVEST dá cerca de 30 linhas para a redação: uma linha manuscrita tem ~ 70 caracteres
  function contaLinhas(txt) {
    const t = String(txt || '').trim();
    if (!t) return '';
    const pal = t.split(/\s+/).length, lin = t.split(/\n/).reduce((s, l) => s + Math.max(1, Math.ceil(l.length / 70)), 0);
    return pal + ' palavras · cerca de ' + lin + ' linhas manuscritas';
  }

  // ================================================================== tela: matéria
  function viewSubject(mid) {
    return loadAllExams().then(() => {
      const m = materia(mid);
      const qs = allResolved().filter((q) => temMateria(q, mid));
      topbar({ title: m.nome, sub: qs.length + ' questão' + (qs.length === 1 ? '' : 'ões') + ' resolvida' + (qs.length === 1 ? '' : 's') });
      if (!qs.length) return '<div class="empty-state">' + CROC('lousa') + '<b>Ainda não tem questões de ' + esc(m.nome) + '.</b><br>Estamos resolvendo: volte em breve!</div>';
      let html = '<div class="page-head"><h1>' + esc(m.nome) + '</h1><p>Questões organizadas por assunto</p></div>';
      m.assuntos.forEach((as) => {
        const group = qs.filter((q) => pares(q).some((x) => x.materia === mid && x.assunto === as.id));
        if (!group.length) return;
        html += '<div class="assunto">' + esc(as.nome) + '</div>';
        group.forEach((q) => {
          const a = answers[qkey(q.prova.id, q.n)];
          html += '<button class="card qrow tap" data-go="#/q/' + q.prova.id + '/' + q.n + '?m=' + mid + '"><span class="num" style="background:' + m.cor + '">' + esc(rotulo(q)) + '</span>' +
            '<span class="grow"><b>' + esc(examTitle(q.prova)) + (q.video ? ' · vídeo' : '') + '</b><small>' + esc(q.topicos.join(' · ')) + '</small></span>' +
            markHtml(a) + ICON.chev + '</button>';
        });
      });
      return html;
    });
  }

  function notFound(msg) {
    topbar({ title: 'Ops' });
    return '<div class="empty-state">' + CROC('animo') + '<b>' + esc(msg || 'Página não encontrada.') + '</b><br><br><button class="btn primary" data-go="#/">Ir para o início</button></div>';
  }

  // ================================================================== rotas
  const scrollMemo = {};
  let current = '';
  function parse(hash) {
    const [path, query] = (hash.replace(/^#/, '') || '/').split('?');
    const ctx = {};
    (query || '').split('&').forEach((kv) => { const [k, v] = kv.split('='); if (k) ctx[k] = decodeURIComponent(v || ''); });
    return { parts: path.split('/').filter(Boolean), ctx };
  }
  function render(keepScroll) {
    fecharFesta();                                     // a comemoração não fica por cima de outra tela
    const hash = location.hash || '#/';
    if (current) scrollMemo[current] = window.scrollY;
    const { parts, ctx } = parse(hash);
    let job;
    if (!parts.length) job = INICIO_NOVO ? viewHomeNova() : viewHome();
    else if (parts[0] === 'vestibular' && parts[1]) job = viewVestibular(decodeURIComponent(parts[1]));
    else if (parts[0] === 'raiox' && parts[1]) job = viewRaioX(decodeURIComponent(parts[1]), ctx);
    else if (parts[0] === 'assinar') job = loadAllExams().then(viewAssinar);
    else if (parts[0] === 'prova' && parts[1]) job = viewExam(parts[1]);
    else if (parts[0] === 'q' && parts[1] && parts[2]) job = viewQuestion(parts[1], parseInt(parts[2], 10), ctx);
    else if (parts[0] === 'materia' && parts[1]) job = viewSubject(parts[1]);
    else if (parts[0] === 'filtrar') job = viewFilter();
    else if (parts[0] === 'plano') job = viewPlano(parts);
    else if (parts[0] === 'sequencia') job = Promise.resolve(viewSequencia());
    else job = Promise.resolve(notFound());
    const target = hash;
    return job.catch((e) => {
      reportError(e, 'render');
      topbar({ title: 'Ops' });
      return '<div class="empty-state">' + CROC('animo') + '<b>Não consegui carregar esta página.</b><br>Confira a conexão e tente de novo.<br><br><button class="btn primary" data-act="retry">Tentar de novo</button></div>';
    }).then((html) => {
      if (target !== (location.hash || '#/')) return;      // o usuário já foi para outra tela
      const view = $('#view');
      view.innerHTML = html;
      hydrateSvgs(view);
      hidratarIrmas(view);
      window.scrollTo(0, keepScroll ? (scrollMemo[target] || 0) : (navBack ? (scrollMemo[target] || 0) : 0));
      navBack = false;
      current = target;
      hideSplash();
    });
  }
  let navBack = false;
  function goBack() {
    const { parts, ctx } = parse(location.hash || '#/');
    if (!parts.length) {
      const app = nativePlugin('App');
      if (app && app.minimizeApp) app.minimizeApp();
      return;
    }
    navBack = true;
    if (history.state && history.state.app === 1) { history.back(); return; }
    // abriu direto num endereço (link, recarga): volta para a tela "mãe"
    const parent = parts[0] === 'q' ? (ctx.p ? '#/plano' : ctx.m ? '#/materia/' + ctx.m : '#/prova/' + parts[1]) : parts[0] === 'plano' && parts.length > 1 ? '#/plano' : '#/';
    history.replaceState({ app: 0, d: 0 }, '', parent);
    render();
  }

  // quantas telas do app estão empilhadas acima da primeira (para voltar ao início de uma vez)
  function depth() { return (history.state && history.state.d) || 0; }
  let pendingHome = false;
  function goHome() {
    const d = depth();
    navBack = true;
    if (d > 0) { pendingHome = true; history.go(-d); return; }
    history.replaceState({ app: 0, d: 0 }, '', '#/');
    render();
  }
  // plano criado: a pilha fica "início → plano" (voltar do plano não cai no questionário)
  let pendingPlano = false;
  function irParaPlano() {
    const d = depth();
    if (d > 0) { pendingPlano = true; history.go(-d); return; }
    history.replaceState({ app: 0, d: 0 }, '', '#/plano');
    render();
  }

  // ================================================================== imagem ampliada
  function openZoom(img) {
    closeZoom();
    const box = document.createElement('div');
    box.className = 'zoom';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Imagem ampliada. Toque para fechar.');
    box.innerHTML = '<img src="' + esc(img.getAttribute('src')) + '" alt="' + esc(img.getAttribute('alt') || '') + '"><span class="zoom-x" aria-hidden="true">✕</span>';
    document.body.appendChild(box);
    document.body.classList.add('zooming');
  }
  function closeZoom() {
    const box = document.querySelector('.zoom');
    if (box) box.remove();
    document.body.classList.remove('zooming');
  }
  document.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { closeZoom(); fecharFesta(); } });
  window.addEventListener('hashchange', closeZoom);

  // ================================================================== eventos
  document.addEventListener('click', (ev) => {
    const go = ev.target.closest('[data-go]');
    if (go && !go.disabled) {
      const to = go.dataset.go;
      if (to === location.hash) render(true);
      // Anterior/Próxima trocam a tela no lugar: o "voltar" leva de volta à lista, não questão por questão
      else if (go.hasAttribute('data-replace')) { history.replaceState(history.state, '', to); render(); }
      else { history.pushState({ app: 1, d: depth() + 1 }, '', to); render(); }
      return;
    }
    const f = ev.target.closest('[data-filter]');
    if (f) { examFilter = f.dataset.filter; render(true); return; }
    // imagem da prova: abre ampliada (mapas, gráficos e charges ficam pequenos no celular)
    const zoomImg = ev.target.closest('.paper img');
    if (zoomImg) return openZoom(zoomImg);
    if (ev.target.closest('.zoom')) return closeZoom();
    if (ev.target.classList && ev.target.classList.contains('festa')) return fecharFesta();
    if (ev.target.closest('.fgroup summary') || ev.target.closest('.check')) return;
    const ans = ev.target.closest('[data-ans]');
    if (ans && !ans.disabled) return answer(ans.dataset.ans);
    const act = ev.target.closest('[data-act]');
    if (!act) return;
    const { parts } = parse(location.hash);
    const k = act.dataset.act;
    if (k === 'back') goBack();
    else if (k === 'home') goHome();
    else if (k === 'theme') cycleTheme();
    else if (k === 'retry') render(true);
    else if (k === 'limpar-filtro') { GRUPOS.forEach((g) => { filtro[g] = []; }); saveJson(KEY.filtro, filtro); filtroLimite = 40; render(true); }
    else if (k === 'mais-filtro') { filtroLimite += 40; render(true); }
    else if (k === 'ver-resultados') { const r = $('.filter-results'); if (r) r.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (k === 'reveal') { revealed[qkey(parts[1], parts[2])] = true; render(true); }
    else if (k === 'redo') {
      const fk = qkey(parts[1], parts[2]);
      clearAnswer(parts[1], parseInt(parts[2], 10)); revealed[fk] = false;
      Object.keys(itemOpen).forEach((x) => { if (x.indexOf(fk + '/') === 0) delete itemOpen[x]; });
      render(true);
    }
    else if (k === 'ver-item') { itemOpen[qkey(parts[1], parts[2]) + '/' + act.dataset.item] = true; render(true); }
    else if (k === 'nota-item') {
      const p = examData[parts[1]], n = parseInt(parts[2], 10), q = p && p.byN[n];
      if (q) {
        const antes = completa(answers[qkey(p.id, n)], q);
        setItemGrade(p.id, n, q, act.dataset.item, act.dataset.nota);
        const pc = conferirDia(), depois = !antes && completa(answers[qkey(p.id, n)], q) ? aposFeita(pc) : () => null;
        render(true).then(depois);
      }
    }
    else if (k === 'criar-plano') criarPlano(act.dataset.tipo);
    else if (k === 'plano-hoje' || k === 'plano-mais') { gerarDia(true); render(true); }
    else if (k === 'plano-mat') { trocarMateria(act.dataset.mat); render(true); }
    else if (k === 'atalho') {            // filtro pronto da tela inicial: troca o filtro salvo por ele
      GRUPOS.forEach((g) => { filtro[g] = []; });
      filtro[act.dataset.g] = [act.dataset.v];
      saveJson(KEY.filtro, filtro); filtroLimite = 40;
      history.pushState({ app: 1, d: depth() + 1 }, '', '#/filtrar'); render();
    }
    else if (k === 'periodo') { assinaturaAnual = !!act.dataset.anual; render(true); }
    else if (k === 'raiox-filtro') {      // assunto do Raio-X: abre as questões dele naquele vestibular
      GRUPOS.forEach((g) => { filtro[g] = []; });
      Object.assign(filtro, { vest: [act.dataset.vest], mat: [act.dataset.mat], ass: [act.dataset.mat + '/' + act.dataset.ass] });
      saveJson(KEY.filtro, filtro); filtroLimite = 40;
      history.pushState({ app: 1, d: depth() + 1 }, '', '#/filtrar'); render();
    }
    else if (k === 'festa-ok') fecharFesta();
    else if (k === 'meta') { trocarMeta(parseInt(act.dataset.meta, 10)); render(true); }
    else if (k === 'lembrete') ligarLembrete(!!act.dataset.on);
    else if (k === 'assinar') toast('As assinaturas abrem em breve.');
    else if (k === 'plano-encerrar') {
      if (window.confirm('Encerrar o plano? Suas respostas continuam salvas.')) { plano = {}; saveJson(KEY.plano, plano); render(); }
    }
    else if (k === 'fav') {
      const favs = loadJson(KEY.favs), key = qkey(parts[1], parts[2]);
      if (favs[key]) delete favs[key]; else favs[key] = Date.now();
      saveJson(KEY.favs, favs);
      favsCache = favs;
      toast(favs[key] ? 'Salva nos favoritos' : 'Removida dos favoritos');
      render(true);
    }
  });
  // caixas de seleção do filtro: cada marcação salva e redesenha a tela no mesmo lugar
  document.addEventListener('change', (ev) => {
    // questionário do plano: trocou o vestibular, troca as datas sugeridas
    if (ev.target.name === 'vest' && $('#view input[name="prova"]')) {
      const s = sugerirDatas(ev.target.value);
      $('#view input[name="prova"]').value = s.d1;
      $('#view input[name="prova2"]').value = s.d2;
      return;
    }
    if (ev.target.name === 'lembrete-hora') {
      if (!ev.target.value) return;
      registro.lembrete = Object.assign(lembrete(), { h: ev.target.value });
      saveJson(KEY.registro, registro);
      agendarLembretes();
      toast('Lembrete às ' + ev.target.value);
      return;
    }
    const box = ev.target.closest('input[data-fk]');
    if (!box) return;
    const k = box.dataset.fk, lista = filtro[k], i = lista.indexOf(box.value);
    if (box.checked && i < 0) lista.push(box.value);
    if (!box.checked && i >= 0) lista.splice(i, 1);
    if (k === 'mat') {                    // desmarcou matéria: some com os assuntos dela
      filtro.ass = filtro.ass.filter((a) => filtro.mat.indexOf(a.split('/')[0]) >= 0);
    }
    filtroLimite = 40;
    saveJson(KEY.filtro, filtro);
    render(true);
  });
  // rascunhos das questões discursivas: salvos enquanto o aluno digita (sem redesenhar a tela)
  document.addEventListener('input', (ev) => {
    const ta = ev.target.closest('textarea[data-draft]');
    if (!ta) return;
    saveDraft(ta.dataset.draft, ta.value);
    const c = $('[data-count="' + ta.dataset.draft + '"]');
    if (c) c.textContent = contaLinhas(ta.value);
  });
  // lembra quais grupos estão abertos (o redesenho não pode fechá-los)
  document.addEventListener('toggle', (ev) => {
    const d = ev.target;
    if (d && d.dataset && d.dataset.fgroup) filtroAbertos[d.dataset.fgroup] = d.open;
  }, true);
  function answer(letter) {
    const { parts } = parse(location.hash);
    const p = examData[parts[1]], n = parseInt(parts[2], 10);
    const q = p && p.byN[n];
    if (!q || answers[qkey(p.id, n)]) return;       // trava: toque duplo não responde duas vezes
    setAnswer(p.id, n, letter, letter === q.gabarito);
    const depois = aposFeita(conferirDia());
    render(true).then(() => {
      const target = $('.verdict');
      if (target && window.matchMedia('(max-width: 959px)').matches) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      depois();
    });
  }
  window.addEventListener('popstate', () => {
    navBack = true;
    // a primeira tela da pilha pode não ser o início (abriu por link): troca por ele
    if (pendingHome) { pendingHome = false; if ((location.hash || '#/') !== '#/') history.replaceState({ app: 0, d: 0 }, '', '#/'); }
    if (pendingPlano) {
      pendingPlano = false; navBack = false;
      history.replaceState({ app: 0, d: 0 }, '', '#/');
      history.pushState({ app: 1, d: 1 }, '', '#/plano');
    }
    render();
  });
  window.addEventListener('hashchange', () => { if ((location.hash || '#/') !== current) render(); });

  function reportError(e, where) {
    if (!RELEASE) console.error('[' + where + ']', e);
  }
  window.addEventListener('unhandledrejection', (e) => reportError(e.reason, 'promise'));

  // ================================================================== vida nativa
  function setupNative() {
    const app = nativePlugin('App');
    if (app && app.addListener) app.addListener('backButton', () => goBack());
    if (app && app.addListener) app.addListener('appStateChange', (st) => {
      if (!st || !st.isActive) return;
      fecharDias();
      agendarLembretes();
      if (!parse(location.hash || '#/').parts.length) render(true);
    });
    const bar = nativePlugin('StatusBar');
    if (bar && bar.setBackgroundColor) Promise.resolve(bar.setBackgroundColor({ color: '#0f3d2a' })).catch(() => null);
  }

  // ================================================================== início
  let splashT0 = Date.now();
  function hideSplash() {
    const s = $('#splash');
    if (!s || s.classList.contains('out')) return;
    setTimeout(() => { s.classList.add('out'); setTimeout(() => s.remove(), 400); }, Math.max(0, 700 - (Date.now() - splashT0)));
  }
  function boot() {
    applyTheme();
    $('#splash-croc').innerHTML = CROC('cabeca');
    setupNative();
    Promise.all([getJson('taxonomia.json'), getJson('provas/index.json')]).then(([tax, idx]) => {
      TAX = tax;
      EXAMS = idx.provas;
      semearRegistro();
      fecharDias();
      agendarLembretes();
      if (!history.state) history.replaceState({ app: 0, d: 0 }, '', location.hash || '#/');
      return render();
    }).catch((e) => {
      reportError(e, 'boot');
      hideSplash();
      $('#view').innerHTML = '<div class="empty-state">' + CROC('animo') + '<b>Não consegui abrir o conteúdo.</b><br><br><button class="btn primary" onclick="location.reload()">Tentar de novo</button></div>';
    });
  }
  // para testes automatizados e gravação de vídeos de divulgação
  window.SuperCroc = { examData, answers, render, materia, plano: () => plano, revisao, registro };
  boot();
})();

// Dez a Zero: telas da campanha, da partida e do fim da campanha (com o cartão para compartilhar).
(function () {
  'use strict';
  const C = window.DezCore, P = window.DezPartida, D = window.Dez, V = window.DezVisual, CP = window.DezCampinho, T = window.DezTelas;
  const t = D.t, esc = V.esc;
  const tela = document.getElementById('tela');
  const { ir, toast, abrirModal, fecharModal, TELAS } = T;
  // velocidades da partida: o 1x já é ágil (uma partida leva ~55 s; o 2x ~36 s e o 3x ~24 s)
  const VELOCIDADES = { 1: 2.4, 2: 3.6, 3: 5.4 };

  // ------------------------------------------------------------ CAMPANHA
  function faseTexto(c, pj) {
    if (pj.mataMata) return t('fase.' + pj.fase);
    if (c.formato === 'grupos') return t('fase.grupos_r', { n: pj.rodada + 1 });
    if (c.formato === 'suico') return t('fase.liga_r', { n: pj.rodada + 1 });
    return t('fase.rodada', { n: pj.rodada + 1 });
  }
  function progresso(c, agora) {
    let h = '';
    for (let i = 0; i < C.totalJogos(c); i++) {
      const j = c.jogos[i];
      h += j ? `<i class="${j.res}">${t('res.' + j.res)}</i>` : `<i class="${i === c.jogos.length && agora ? 'agora' : ''}"></i>`;
    }
    return `<div class="progresso">${h}</div>`;
  }
  function tabela(c, ids, corte, max) {
    const ordem = C.classificacao(c, ids);
    const meu = ordem.indexOf('eu');
    let linhas = ordem.map((id, i) => ({ id, i }));
    if (max && linhas.length > max) linhas = linhas.filter((l) => l.i < max - 2 || Math.abs(l.i - meu) <= 1);
    let ant = -1;
    const corpo = linhas.map(({ id, i }) => {
      const r = c.tabela[id];
      const pulo = ant >= 0 && i > ant + 1 ? '<tr><td colspan="6" style="color:var(--fraco)">···</td></tr>' : '';
      ant = i;
      const p = c.times[id];
      return pulo + `<tr class="${id === 'eu' ? 'eu' : ''}${corte && i === corte ? ' corte' : ''}"><td>${i + 1}</td><td class="t">${V.escudo(p.time, 'p')}${esc(V.nomePart(c, id))}</td><td>${r.j}</td><td>${r.v}</td><td>${r.gp - r.gc > 0 ? '+' : ''}${r.gp - r.gc}</td><td class="pts">${r.pts}</td></tr>`;
    }).join('');
    return `<table class="tab"><tr><th>#</th><th style="text-align:left">${t('tab.time')}</th><th>${t('tab.j')}</th><th>${t('tab.v')}</th><th>${t('tab.sg')}</th><th>${t('tab.pts')}</th></tr>${corpo}</table>`;
  }
  function chave(c) {
    const fase = C.FASES_MATA[c.formato][c.faseMata];
    const linhas = c.chave.map(([a, b]) => {
      const nosso = a === 'eu' || b === 'eu';
      return `<div class="jogo-lin${nosso ? ' nosso' : ''}">${V.escudo(c.times[a].time, 'p')}<span class="adv">${esc(V.nomePart(c, a))}</span><span class="sub">×</span><span class="adv" style="text-align:right">${esc(V.nomePart(c, b))}</span>${V.escudo(c.times[b].time, 'p')}</div>`;
    }).join('');
    return `<div class="titulo-secao">${t('fase.' + fase)}</div><div class="cartao timeline">${linhas}</div>`;
  }
  const linhaJogo = (c, j) => `<div class="jogo-lin"><span class="r ${j.res}">${t('res.' + j.res)}</span><span class="adv">${esc(V.nomePart(c, j.adv))}</span><span class="pl">${j.ga}–${j.gb}${j.pen ? ` <span class="sub">(${j.pen[0]}-${j.pen[1]})</span>` : ''}</span></div>`;
  function meusJogos(c) {
    if (!c.jogos.length) return '';
    return `<div class="titulo-secao">${t('camp.jogos')}</div><div class="cartao timeline">${c.jogos.map((j) => linhaJogo(c, j)).join('')}</div>`;
  }
  function meuXI(c) {
    const slots = C.FORMACOES[c.formacao];
    abrirModal(`<h2>${esc(V.meuTime().nome)}</h2><p class="sub">${c.formacao} · ${t('draft.geral')} ${c.eu.forca.geral.toFixed(1)} · ${t('draft.ent_chip')} +${c.eu.forca.ent}</p>
      <div class="lista-jog" style="padding:0;margin-top:8px">${c.xi.map((j, i) => `<div class="jog">${T.posBadge(slots[i].pos)}<span class="nm">${esc(j.nome)}<br><span class="id">${esc(V.nomeTime(j.time))} ${V.rotulo(j.time, j.ano)}</span></span>${T.nota(C.efetiva(j, slots[i].pos))}</div>`).join('')}</div>
      <button class="btn borda" style="margin-top:14px" data-acao="ok">${t('geral.ok')}</button>`, { ok: fecharModal });
  }

  TELAS.campanha = () => {
    const c = T.campSalva();
    if (!c) return ir('inicio', null, { substituir: true, limpar: true });
    if (c.fim) return ir('final', null, { substituir: true, limpar: true });
    const pj = C.proximoJogo(c);
    const adv = c.times[pj.adv];
    const cfg = V.estCfg();
    let quadro = '';
    if (c.fase === 'mata') quadro = chave(c);
    else if (c.formato === 'grupos') quadro = `<div class="titulo-secao">${t('camp.grupo')}</div><div class="cartao">${tabela(c, c.grupos[0], 2)}<p class="sub" style="margin:10px 0 0">${t('camp.grupo_regra')}</p></div>`;
    else if (c.formato === 'suico') quadro = `<div class="titulo-secao">${t('camp.fase_liga')}</div><div class="cartao">${tabela(c, Object.keys(c.times), 16, 18)}<p class="sub" style="margin:10px 0 0">${t('camp.liga_regra')}</p></div>`;
    else quadro = `<div class="titulo-secao">${t('camp.tabela')}</div><div class="cartao">${tabela(c, Object.keys(c.times), 0, 12)}<p class="sub" style="margin:10px 0 0">${t('camp.pontos_regra', { n: c.nRodadas })}</p></div>`;
    tela.innerHTML = T.topo(c.diario ? t('inicio.desafio') : T.nomeModo(c.modo), T.moedasHTML()) + `<div class="rola">
      ${progresso(c, true)}
      <div class="cartao" style="margin-top:14px;padding:20px 16px 16px">
        <div class="fase-txt">${t('camp.jogo_de', { n: c.jogos.length + 1, total: C.totalJogos(c) })} · ${faseTexto(c, pj)}${c.dificil ? ' · ' + t('formacao.dificil') : ''}</div>
        <div class="versus">
          <div class="lado">${V.escudo('eu', '')}<span class="n">${esc(V.meuTime().nome)}</span><span class="forca-tag">${c.eu.forca.geral.toFixed(1)}</span></div>
          <div class="x">×</div>
          <div class="lado">${V.escudo(adv.time, '')}<span class="n">${esc(V.nomeTime(adv.time))}</span><span class="a">${V.rotulo(adv.time, adv.ano)}</span><span class="forca-tag" style="color:var(--suave)">${adv.forca.geral.toFixed(1)}</span></div>
        </div>
        <p class="sub centro" style="margin:16px 0 4px;display:flex;justify-content:center;gap:6px;align-items:center">${V.icone('estadio')}${esc(cfg.nome || V.estadio(cfg.sel).nome)}</p>
        <button class="btn principal" style="margin-top:12px" data-acao="jogar">${t('camp.jogar')}</button>
        <button class="btn borda pequeno" style="margin-top:10px" data-acao="xi">${V.icone('lista')}${t('camp.meu_xi')}</button>
      </div>
      ${quadro}
      ${meusJogos(c)}
    </div>`;
    T.acoesComuns();
    T.setAcoes({
      jogar: () => ir('partida'),
      xi: () => meuXI(c),
      voltar: () => ir('inicio', null, { substituir: true, limpar: true }),
    });
  };

  // ------------------------------------------------------------ PARTIDA
  TELAS.partida = () => {
    const c = T.campSalva();
    if (!c || c.fim) return ir('inicio', null, { substituir: true, limpar: true });
    const pj = C.proximoJogo(c);
    const res = C.jogarProximo(c); // resultado já decidido (o mesmo se a partida for aberta de novo)
    const advP = c.times[pj.adv];
    const A = C.equipe(c, 'eu'), B = C.equipe(c, pj.adv);
    const m = V.meuTime();
    const kits = V.uniformes([m.c1, m.c2], V.coresDe(advP.time));
    const cfg = V.estCfg();
    const est = V.estadio(V.temEstadio(cfg.sel) ? cfg.sel : 'brinco');
    if (!VELOCIDADES[D.config.velocidade]) D.config.velocidade = 1;
    tela.innerHTML = `<div class="partida">
      <canvas></canvas>
      <div class="placar">
        <div class="eq"><span class="kit" style="background:${kits.a.c1}"></span>${V.escudo('eu', 'p')}<span class="sg">${esc(V.siglaDe(m.nome))}</span></div>
        <div class="meio"><div class="gols" data-gols>0–0</div><div class="rel" data-rel>1'</div><div class="pen" data-pen></div></div>
        <div class="eq b"><span class="kit" style="background:${kits.b.c1}"></span>${V.escudo(advP.time, 'p')}<span class="sg">${esc(V.siglaTime(advP.time))}</span></div>
      </div>
      <div class="estadio-nome">${esc(cfg.nome || est.nome)} · ${faseTexto(c, pj)}</div>
      <div class="lances" data-lances></div>
      <div data-aviso></div>
      <div class="controles">
        <div class="vel">${[1, 2, 3].map((v) => `<button data-acao="vel" data-v="${v}" class="${D.config.velocidade === v ? 'on' : ''}">${v}x</button>`).join('')}</div>
        <button class="btn-pular" data-acao="pular">${V.icone('pular')}${t('partida.pular')}</button>
      </div>
    </div>`;
    const canvas = tela.querySelector('canvas');
    const render = CP.criar(canvas, { estadio: est.id, gramado: cfg.gramado, luz: cfg.luz, placas: cfg.placas, nome: cfg.nome || est.nome, bola: V.temBola(cfg.bola) ? cfg.bola : 'classica', kits, margens: { topo: 82, baixo: 66, lado: 20 } });
    const partida = P.criar({ A, B, resultado: res, seed: c.seed + ':vis:' + c.jogos.length });
    const $ = (s) => tela.querySelector(s);
    const lancesEl = $('[data-lances]'), avisoEl = $('[data-aviso]');
    let pausado = false, terminou = false, raf = 0, ultimo = performance.now(), avisoAtual = null;
    const nomeJog = (lado, idx) => { const xi = lado === 'a' ? A.xi : B.xi; return xi[idx] ? xi[idx].curto : '?'; };
    function lance(html, cls) {
      const el = document.createElement('div');
      el.className = 'lance ' + (cls || '');
      el.innerHTML = html;
      lancesEl.appendChild(el);
      while (lancesEl.children.length > 3) lancesEl.firstChild.remove();
      setTimeout(() => el.remove(), 6500);
    }
    function aviso(txt, sub, branco) {
      avisoEl.innerHTML = `<div class="aviso${branco ? ' branco' : ''}">${txt}${sub ? `<small>${sub}</small>` : ''}</div>`;
    }
    function eventos() {
      partida.eventos().forEach((e) => {
        if (e.tipo === 'apito') { D.som.apito(e.qual === 'fim' || e.qual === 'intervalo'); return; }
        if (e.tipo === 'gol') {
          const nosso = e.lado === 'a';
          $('[data-gols]').textContent = e.placar.a + '–' + e.placar.b;
          const ass = e.assist >= 0 ? ` <span style="opacity:.65">· ${esc(nomeJog(e.lado, e.assist))}</span>` : '';
          lance(`<span class="min">${e.relogio}</span>${t('partida.gol_de', { n: esc(nomeJog(e.lado, e.autor)) })}${ass}`, 'gol' + (nosso ? '' : ' b'));
          aviso(t('partida.gol'), esc(nomeJog(e.lado, e.autor)), !nosso);
          avisoAtual = 'GOL';
          D.som.gol(nosso);
          D.vibrar(nosso ? 120 : 40);
          return;
        }
        if (e.tipo === 'chance') { lance(`<span class="min">${e.relogio}</span>${t('chance.' + e.resultado, { n: esc(nomeJog(e.lado, e.autor)) })}`); D.som.chute(); return; }
        if (e.tipo === 'penalti') {
          $('[data-pen]').textContent = t('partida.pen_placar', { a: e.pen.a, b: e.pen.b });
          lance(`${e.gol ? t('partida.pen_gol') : t('partida.pen_perdeu')} · ${esc(nomeJog(e.lado, e.autor))}`, e.gol && e.lado === 'a' ? 'gol' : '');
          D.som.chute();
        }
      });
    }
    function quadro(agora) {
      raf = requestAnimationFrame(quadro);
      const dt = Math.min(0.1, (agora - ultimo) / 1000); // um quadro travado não "pula" o jogo
      ultimo = agora;
      if (pausado || terminou) return;
      partida.avancar(dt * VELOCIDADES[D.config.velocidade]);
      eventos();
      const e = partida.estado();
      $('[data-rel]').textContent = e.fase === 'penaltis' ? t('partida.penaltis') : e.relogio;
      if (e.aviso !== avisoAtual) {
        avisoAtual = e.aviso;
        if (!e.aviso) avisoEl.innerHTML = '';
        else if (e.aviso === 'INTERVALO') aviso(t('partida.intervalo'), null, true);
        else if (e.aviso === 'FIM') aviso(t('partida.fim'), null, true);
        else if (e.aviso === 'PENALTIS') aviso(t('partida.penaltis'), null, true);
        else if (e.aviso === 'PEN_GOL') aviso(t('partida.pen_gol'), null, true);
        else if (e.aviso === 'PEN_PERDEU') aviso(t('partida.pen_perdeu'), null, true);
      }
      render.desenhar(e);
      if (partida.acabou()) fim();
    }
    const minuto = (e) => (e.tempo === 1 ? (e.min > 45 ? '45+' + (e.min - 45) : e.min) : (e.min > 45 ? '90+' + (e.min - 45) : 45 + e.min)) + "'";
    function fim() {
      if (terminou) return;
      terminou = true;
      D.som.torcidaDesligar();
      const ganhou = res.ga > res.gb || (res.penaltis && res.penaltis.a > res.penaltis.b);
      const empate = res.ga === res.gb && !res.penaltis;
      const r = ganhou ? 'V' : empate ? 'E' : 'D';
      const gols = (lado) => res.eventos.filter((e) => e.tipo === 'gol' && e.lado === lado).map((e) => `<div>${minuto(e)} ${esc(nomeJog(lado, e.autor))}</div>`).join('');
      $('[data-gols]').textContent = res.ga + '–' + res.gb;
      $('[data-rel]').textContent = t('partida.encerrado');
      if (res.penaltis) $('[data-pen]').textContent = t('partida.pen_placar', { a: res.penaltis.a, b: res.penaltis.b });
      avisoEl.innerHTML = '';
      const painel = document.createElement('div');
      painel.className = 'fim-partida';
      painel.innerHTML = `<div class="res ${r}">${t(r === 'V' ? 'partida.vitoria' : r === 'E' ? 'partida.empate' : 'partida.derrota')}</div>
        <div class="versus" style="margin:14px 0 6px">
          <div class="lado">${V.escudo('eu', 'm')}<span class="n" style="font-size:16px">${esc(m.nome)}</span></div>
          <div class="grande">${res.ga}–${res.gb}${res.penaltis ? `<div class="sub" style="font-family:var(--corpo);font-size:12px">${t('partida.pen_placar', { a: res.penaltis.a, b: res.penaltis.b })}</div>` : ''}</div>
          <div class="lado">${V.escudo(advP.time, 'm')}<span class="n" style="font-size:16px">${esc(V.nomeTime(advP.time))}</span></div>
        </div>
        <div class="autores"><div>${gols('a')}</div><div>${gols('b')}</div></div>
        <button class="btn principal" style="margin-top:16px" data-acao="seguir">${t('partida.continuar')}</button>`;
      tela.querySelector('.partida').appendChild(painel);
      if (ganhou) D.som.vitoria();
    }
    function concluir() {
      cancelAnimationFrame(raf);
      const cc = T.campSalva();
      // proteção: só grava se a campanha ainda está neste jogo (toque duplo, tela reaberta)
      if (cc && cc.jogos.length === c.jogos.length && !cc.fim) {
        C.registrar(cc, res);
        T.salvarCamp(cc);
        D.rate.contarPartida();
        const rec = T.recordes();
        rec.partidas++; rec.gols += res.ga;
        const ganhou = res.ga > res.gb || (res.penaltis && res.penaltis.a > res.penaltis.b);
        if (ganhou) rec.vitorias++;
        T.salvarRecordes(rec);
        D.analytics.event('match_end', { mode: cc.modo, game: cc.jogos.length, result: cc.jogos[cc.jogos.length - 1].res, gf: res.ga, ga: res.gb, speed: D.config.velocidade });
      }
      const fimCamp = T.campSalva() && T.campSalva().fim;
      const seguir = () => ir(fimCamp ? 'final' : 'campanha', null, { substituir: true, limpar: true });
      if (!fimCamp && D.ads.interstitialDue()) D.ads.showInterstitial('after_match').then((oferta) => (oferta ? ofertaRemover(seguir) : seguir()));
      else seguir();
    }
    function pausar() {
      if (terminou) return;
      pausado = true;
      abrirModal(`<h2>${t('partida.pausa')}</h2><p class="sub">${t('partida.pausa_x')}</p>
        <button class="btn principal" style="margin-top:14px" data-acao="cont">${V.icone('jogar')}${t('partida.voltar')}</button>
        <button class="btn borda" data-acao="pular">${V.icone('pular')}${t('partida.pular_fim')}</button>
        <button class="btn borda" data-acao="sair">${V.icone('inicio')}${t('partida.sair')}</button>`, {
        cont: () => { fecharModal(); pausado = false; ultimo = performance.now(); },
        pular: () => { fecharModal(); pausado = false; partida.pular(); },
        sair: () => { fecharModal(); ir('inicio', null, { substituir: true, limpar: true }); },
      }, { fixo: true });
    }
    T.setAcoes({
      vel: (ds) => { D.config.velocidade = +ds.v; D.salvarConfig(); tela.querySelectorAll('[data-acao="vel"]').forEach((b) => b.classList.toggle('on', b.dataset.v === ds.v)); },
      pular: () => { partida.pular(); },
      seguir: concluir,
      pausar,
    });
    D.som.torcidaLigar();
    const onResize = () => { render.layout(); };
    window.addEventListener('resize', onResize);
    const onHidden = () => { if (document.hidden) pausar(); };
    document.addEventListener('visibilitychange', onHidden);
    T.setAoSair(() => { cancelAnimationFrame(raf); D.som.torcidaDesligar(); window.removeEventListener('resize', onResize); document.removeEventListener('visibilitychange', onHidden); });
    window.dezPartidaAtual = partida; // para o roteiro de testes e o gravador de vídeos
    raf = requestAnimationFrame(quadro);
  };
  function ofertaRemover(depois) {
    abrirModal(`<div class="ic-topo">${V.icone('anuncio')}</div><h2 class="centro">${t('oferta.titulo')}</h2><p class="sub centro">${t('oferta.texto')}</p>
      <button class="btn principal" style="margin-top:12px" data-acao="comprar">${t('oferta.comprar', { preco: D.store.price('remove_ads') })}</button>
      <button class="btn borda" data-acao="nao">${t('oferta.agora_nao')}</button>`, {
      comprar: () => D.store.buy('remove_ads', 'after_interstitial').then(() => { fecharModal(); depois(); }),
      nao: () => { fecharModal(); depois(); },
    }, { fixo: true });
  }

  // ------------------------------------------------------------ FINAL
  TELAS.final = () => {
    const c = T.campSalva();
    if (!c || !c.fim) return ir('inicio', null, { substituir: true, limpar: true });
    const s = C.resumo(c);
    const primeiraVez = !c.premiado;
    if (primeiraVez) {
      const premio = C.premio(c, { desafio: !!c.diario, dificil: !!c.dificil });
      D.moedas.somar(premio, 'campaign');
      c.premiado = premio;
      const rec = T.recordes();
      rec.campanhas++;
      if (s.campeao) rec.titulos++;
      if (s.perfeito) rec.perfeitos++;
      const rm = rec.modos[c.modo] || { jogadas: 0, titulos: 0, perfeitos: 0, melhor: null };
      rm.jogadas++;
      if (s.campeao) rm.titulos++;
      if (s.perfeito) rm.perfeitos++;
      const pontos = s.v * 3 + s.e + (s.campeao ? 100 : 0);
      if (!rm.melhor || pontos > rm.melhor.pontos) rm.melhor = { pontos, v: s.v, e: s.e, d: s.d, texto: T.textoResultado(c) };
      rec.modos[c.modo] = rm;
      T.salvarRecordes(rec);
      if (c.diario) T.fecharDia(c);
      T.salvarCamp(c);
      D.analytics.event('campaign_end', { mode: c.modo, wins: s.v, draws: s.e, losses: s.d, champion: s.campeao, perfect: s.perfeito, coins: premio, daily: !!c.diario, hard: !!c.dificil });
      D.analytics.userProp('titles', rec.titulos);
    }
    const destaque = s.campeao || s.perfeito;
    const desenha = () => {
      tela.innerHTML = T.topo(c.diario ? t('inicio.desafio') : T.nomeModo(c.modo), T.moedasHTML()) + `<div class="rola">
        <div class="final-icone"${destaque ? '' : ' style="color:var(--suave)"'}>${V.icone(destaque ? 'trofeu' : 'bola')}</div>
        <div class="resultado-final${destaque ? '' : ' neutro'}">${esc(T.textoResultado(c))}</div>
        <div>${T.quadros(c.jogos)}</div>
        <p class="sub centro" style="margin:12px 0 0">${t('final.campanha', { v: s.v, e: s.e, d: s.d, gp: s.gp, gc: s.gc })}</p>
        <div class="ganho">+${V.numFmt(c.premiado * (c.dobrou ? 2 : 1))} ${V.moedaHTML}${c.dificil ? `<small>${t('final.bonus_dificil')}</small>` : ''}</div>
        ${c.dobrou ? '' : `<button class="btn verde" data-acao="dobrar">${t('final.dobrar')} <span class="tag-ad">AD</span></button>`}
        <button class="btn principal" style="margin-top:12px" data-acao="share">${V.icone('compartilhar')}${t('final.compartilhar')}</button>
        <div class="linha-btns" style="margin-top:10px"><button class="btn borda" data-acao="denovo">${V.icone('resortear')}${t('final.de_novo')}</button><button class="btn borda" data-acao="inicio">${V.icone('inicio')}${t('final.inicio')}</button></div>
        <div class="titulo-secao">${t('camp.jogos')}</div>
        <div class="cartao timeline">${c.jogos.map((j) => linhaJogo(c, j)).join('')}</div>
      </div>`;
    };
    desenha();
    T.acoesComuns();
    T.setAcoes({
      voltar: () => ir('inicio', null, { substituir: true, limpar: true }),
      inicio: () => ir('inicio', null, { substituir: true, limpar: true }),
      denovo: () => ir('modos', null, { substituir: true, limpar: true }),
      dobrar: () => D.ads.showRewarded('double_coins').then((ok) => {
        if (!ok) return;
        const cc = T.campSalva();
        if (!cc || cc.dobrou) return;
        cc.dobrou = true; c.dobrou = true;
        T.salvarCamp(cc);
        D.moedas.somar(cc.premiado, 'double_ad');
        desenha();
      }),
      share: () => compartilhar(c),
    });
    if (primeiraVez && destaque) D.som.vitoria();
    // momento bom: pedido de avaliação (API oficial) ou, uma vez, o convite para as notificações
    if (primeiraVez) {
      setTimeout(() => {
        if (!T.atual || T.atual.nome !== 'final' || !document.getElementById('modal').hidden || D.ads.busy) return;
        if ((s.campeao || s.v >= 7) && D.rate.devePedir()) return void D.rate.pedir();
        if (!D.guarda.num('dez.notif.perguntou', 0) && D.notificacoes.api()) convidarNotificacoes();
      }, 1800);
    }
  };
  function convidarNotificacoes() {
    D.guarda.salvarNum('dez.notif.perguntou', 1);
    abrirModal(`<div class="ic-topo">${V.icone('sino')}</div><h2 class="centro">${t('notif.convite_t')}</h2><p class="sub centro">${t('notif.convite_x')}</p>
      <button class="btn principal" style="margin-top:12px" data-acao="sim">${t('notif.convite_sim')}</button><button class="btn borda" data-acao="nao">${t('oferta.agora_nao')}</button>`, {
      sim: () => { fecharModal(); D.notificacoes.pedirPermissao().then((ok) => { D.config.notif = ok; D.salvarConfig(); D.notificacoes.agendar(); }); },
      nao: () => { fecharModal(); D.config.notif = false; D.salvarConfig(); },
    });
  }

  // ------------------------------------------------------------ compartilhar: cartão do resultado
  // Sem notas: só os nomes. Quem rendeu 85 ou mais na vaga ganha um ponto verde-limão discreto.
  const DESTAQUE = 85;
  const carregarImagem = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  async function cartao(c) {
    try { await Promise.all([document.fonts.load('900 60px "Big Shoulders Display"'), document.fonts.load('800 30px Manrope')]); } catch (e) { /* segue com a fonte do sistema */ }
    const W = 1080, H = 1350;
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d');
    const s = C.resumo(c);
    const COR = { fundo: '#0C1210', texto: '#EDEBE4', suave: '#8E9A93', acento: '#D4F25C', linha: 'rgba(237,235,228,0.10)' };
    const disp = (px, w) => `${w || 900} ${px}px "Big Shoulders Display", Impact, sans-serif`;
    const corpo = (px, w) => `${w || 700} ${px}px Manrope, system-ui, sans-serif`;
    const caber = (txt, px, max, fonte) => { let p = px; g.font = fonte(p); while (g.measureText(txt).width > max && p > 20) { p -= 2; g.font = fonte(p); } };
    g.fillStyle = COR.fundo; g.fillRect(0, 0, W, H);
    const brilho = g.createRadialGradient(W / 2, 0, 0, W / 2, 0, 760);
    brilho.addColorStop(0, 'rgba(212,242,92,0.09)'); brilho.addColorStop(1, 'rgba(212,242,92,0)');
    g.fillStyle = brilho; g.fillRect(0, 0, W, H);
    g.textAlign = 'center'; g.textBaseline = 'alphabetic';
    // o título do jogo (a arte do logo, no idioma do jogador); sem a arte, a marca em texto
    const L = window.DEZ_LOGO, lang = L && L.idiomas[D.I18N.lang] ? D.I18N.lang : 'en', ml = L && L.idiomas[lang];
    const logo = ml ? await carregarImagem(`img/logo-${lang}.png`) : null;
    if (logo) {
      const lw = 640, lh = lw * logo.naturalHeight / logo.naturalWidth;
      g.drawImage(logo, (W - lw) / 2, 44, lw, lh);
    } else {
      g.fillStyle = COR.acento; g.font = disp(130); g.fillText(t('app.nome'), W / 2, 220);
    }
    g.fillStyle = COR.suave; g.font = corpo(30);
    g.fillText(((c.diario ? t('inicio.desafio') + ' · ' + c.diario.split('-').reverse().slice(0, 2).join('/') + ' · ' : '') + T.nomeModo(c.modo)).toUpperCase(), W / 2, 384);
    const destaque = s.campeao || s.perfeito;
    g.fillStyle = destaque ? COR.acento : COR.texto;
    caber(T.textoResultado(c).toUpperCase(), 116, W - 140, disp); g.fillText(T.textoResultado(c).toUpperCase(), W / 2, 500);
    // a campanha em quadradinhos
    const total = C.totalJogos(c), q = 62, gap = 12, x0 = (W - (total * q + (total - 1) * gap)) / 2;
    for (let i = 0; i < total; i++) {
      const j = c.jogos[i];
      g.fillStyle = !j ? COR.linha : j.res === 'V' ? '#D4F25C' : j.res === 'E' ? '#D8C38A' : '#EF6A5B';
      g.beginPath(); g.roundRect ? g.roundRect(x0 + i * (q + gap), 536, q, q, 14) : g.rect(x0 + i * (q + gap), 536, q, q); g.fill();
    }
    g.fillStyle = COR.texto; g.font = corpo(34, 800);
    g.fillText(t('final.campanha_curta', { v: s.v, e: s.e, d: s.d, gp: s.gp }), W / 2, 652);
    // o time
    g.strokeStyle = COR.linha; g.lineWidth = 2;
    g.beginPath(); g.roundRect ? g.roundRect(70, 690, W - 140, 520, 34) : g.rect(70, 690, W - 140, 520); g.stroke();
    const m = V.meuTime();
    const svg = V.escudoSVG(m.c1, m.c2, V.siglaDe(m.nome), m.forma, m.padrao, { semTexto: true }).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="208" ');
    const img = await carregarImagem('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg));
    if (img) {
      g.drawImage(img, 108, 714, 104, 108);
      g.fillStyle = m.c2; g.fillRect(108 + 104 * 0.22, 714 + 108 * 0.5 - 15, 104 * 0.56, 30);
      g.fillStyle = V.contraste(m.c2); g.font = disp(28); g.fillText(V.siglaDe(m.nome), 108 + 52, 714 + 108 * 0.5 + 10);
    }
    g.textAlign = 'left';
    g.fillStyle = COR.texto; caber(m.nome.toUpperCase(), 64, W - 400, (p) => disp(p, 800)); g.fillText(m.nome.toUpperCase(), 240, 779);
    g.fillStyle = COR.suave; g.font = corpo(28);
    g.fillText(c.formacao + (c.dificil ? ' · ' + t('formacao.dificil') : ''), 240, 820);
    const slots = C.FORMACOES[c.formacao];
    const corPos = { gol: '#E9B44C', def: '#6FB1F2', mei: '#6FD6A0', ata: '#F08A7E' };
    c.xi.forEach((j, i) => {
      const col = i < 6 ? 0 : 1, lin = i < 6 ? i : i - 6;
      const bx = 110 + col * 440, by = 900 + lin * 50;
      const cor = corPos[C.LINHA[slots[i].pos]];
      g.strokeStyle = cor; g.lineWidth = 2;
      g.beginPath(); g.roundRect ? g.roundRect(bx, by - 30, 66, 38, 8) : g.rect(bx, by - 30, 66, 38); g.stroke();
      g.fillStyle = cor; g.font = corpo(20, 800); g.textAlign = 'center'; g.fillText(V.posTxt(slots[i].pos), bx + 33, by - 4);
      g.textAlign = 'left';
      const top = C.efetiva(j, slots[i].pos) >= DESTAQUE;
      let nm = j.curto;
      g.font = corpo(30, top ? 800 : 600);
      while (g.measureText(nm).width > 300 && nm.length > 3) nm = nm.slice(0, -2) + '…';
      g.fillStyle = top ? COR.texto : '#B7BDB5';
      g.fillText(nm, bx + 84, by - 2);
      if (top) { g.fillStyle = COR.acento; g.beginPath(); g.arc(bx + 84 + g.measureText(nm).width + 16, by - 12, 6, 0, Math.PI * 2); g.fill(); }
    });
    g.textAlign = 'center'; g.fillStyle = COR.texto; g.font = corpo(32, 800);
    g.fillText(t('compartilhar.rodape'), W / 2, 1262);
    g.fillStyle = COR.suave; g.font = corpo(26);
    g.fillText('Google Play · ' + t('app.nome_texto'), W / 2, 1302);
    return cv;
  }
  async function compartilhar(c) {
    const s = C.resumo(c);
    const texto = c.diario
      ? T.textoCompartilharDia({ modo: c.modo, jogos: c.jogos, texto: T.textoResultado(c), v: s.v, e: s.e, d: s.d })
      : t('compartilhar.texto', { app: t('app.nome_texto'), modo: T.nomeModo(c.modo), resultado: T.textoResultado(c), grade: T.emojis(c.jogos), v: s.v, e: s.e, d: s.d, gp: s.gp, link: D.LINK_LOJA });
    const cv = await cartao(c);
    const r = await D.compartilhar(cv, texto);
    if (r === 'copiado') toast(t('compartilhar.copiado'));
  }
  window.DezTelas.cartaoResultado = cartao;
})();

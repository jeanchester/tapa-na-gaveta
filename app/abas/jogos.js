/* Aba Jogos: as fichas e, em #/jogos/<id>, o jogo aberto num <iframe> (cada jogo mora na sua pasta,
   com o seu index.html: o CSS e as variáveis de um não vazam para o site nem para os outros). */
(function () {
  'use strict';
  const { esc, app, playUrl, ICON } = window.TNG;

  const JOGOS = [
    { rota: 'draft', app: 'football-draft', soApp: true, nome: 'Football Draft', src: 'jogos/draft/app/index.html', meta: 'Draft · campanha de 8 a 10 jogos',
      texto: 'Sorteie times de várias épocas, pegue um jogador de cada um até fechar o seu XI e tente a campanha perfeita, assistindo a cada partida no campinho.' },
    { rota: 'milhao', app: 'milhao-do-futebol', soApp: true, nome: 'Jogo do Milhão do Futebol', src: 'jogos/milhao/index.html', meta: 'Quiz · 16 perguntas · 45 segundos cada',
      texto: 'De R$ 1 mil a R$ 1 milhão, com quatro ajudas: Cartões, VAR, Torcida e Driblar. Mais de mil perguntas sobre o Brasileirão, a Europa e as Copas, e um modo só com escudos.' },
    { rota: 'fast', app: 'fast-football', soApp: true, nome: 'Fast Football', src: 'jogos/fast/index.html', meta: 'Arcade · partida avulsa ou mata-mata de 16 times',
      texto: 'Partida relâmpago numa arena redonda: a bola quica, os goleiros se mexem e você gira a barra do meio para defender e atacar. Se preferir, só assista e torça.' },
  ];

  const SETA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>';
  const CHEIA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';

  // no celular, Milhão e Fast Football são jogados no app: o site manda para a Google Play
  const celular = () => /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 900);
  const android = () => /Android/i.test(navigator.userAgent);
  const noApp = (j) => j.soApp && celular();
  const PLAY_BTN = (a, rotulo) => '<a class="play" href="' + esc(playUrl(a.pacote, 'jogos')) + '" target="_blank" rel="noopener">' + ICON.play + '<span><small>' + (rotulo || 'Baixe no') + '</small><b>Google Play</b></span></a>';

  function soNoApp(view, j) {
    const a = app(j.app);
    view.innerHTML = '<div class="so-app"><img src="midia/icones/' + a.id + '.png" alt="" width="112" height="112"><h1>' + esc(j.nome) + ' é no app</h1>' +
      '<p>' + (android() ? 'No celular, o jogo roda melhor no app (e tem coisas que o site não tem). Estamos te levando para a Google Play.' : 'No celular, o jogo é só no app para Android. No computador, dá para jogar aqui no site.') + '</p>' +
      '<div class="acoes">' + PLAY_BTN(a, 'Jogue grátis no') + '<a class="btn" href="#/jogos">Ver os outros jogos</a></div></div>';
    if (android()) {
      const t = setTimeout(() => { location.href = playUrl(a.pacote, 'jogos'); }, 900);
      return () => clearTimeout(t);
    }
    return null;
  }

  function lista(view) {
    view.innerHTML =
      '<div class="page-head"><div class="kicker">Para jogar no intervalo</div><h1>Jogos</h1>' +
      '<p>Os nossos jogos de futebol para Android, também no navegador. Sem cadastro e sem anúncios.</p></div>' +
      '<ul class="fichas">' + JOGOS.map((j) => {
        const a = app(j.app);
        return '<li class="ficha" id="' + j.rota + '"><img src="midia/icones/' + a.id + '.png" alt="" width="88" height="88" loading="lazy">' +
          '<div><h2>' + esc(j.nome) + '</h2><div class="meta">' + esc(j.meta) + '</div><p>' + esc(j.texto) + '</p>' +
          (window.TNG.ARTIFACT ? '' : '<a class="link-btn como-jogar" href="jogar/' + j.rota + '/">Como jogar</a>') + '</div>' +
          '<div class="acoes">' + (noApp(j) ? PLAY_BTN(a, 'Jogue grátis no') + '<span class="so-app-nota">No celular, só no app</span>'
            : '<a class="btn primario" href="#/jogos/' + j.rota + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M7 4l13 8-13 8z"/></svg>Jogar aqui</a>' + PLAY_BTN(a)) + '</div></li>';
      }).join('') + '</ul>';
  }

  function jogo(view, j) {
    const a = app(j.app);
    document.body.classList.add('modo-jogo');
    view.innerHTML = '<div class="jogo-barra"><a class="link-btn" href="#/jogos">' + SETA + 'Jogos</a><b>' + esc(j.nome) + '</b>' +
      '<button class="link-btn" data-cheia>' + CHEIA + '<span>Tela cheia</span></button>' +
      '<a class="link-btn baixar" href="' + esc(playUrl(a.pacote, 'jogos')) + '" target="_blank" rel="noopener">' + ICON.play + '<span>No Android</span></a></div>' +
      '<div class="jogo-quadro"><iframe src="' + j.src + '" title="' + esc(j.nome) + '" allow="fullscreen; autoplay" allowfullscreen></iframe></div>';
    const quadro = view.querySelector('iframe');
    const onClick = (e) => {
      if (!e.target.closest('[data-cheia]')) return;
      const el = view.querySelector('.jogo-quadro');
      const pedir = el.requestFullscreen || el.webkitRequestFullscreen;
      if (!pedir) return;
      const r = pedir.call(el);
      if (r && r.catch) r.catch(() => null);
    };
    view.addEventListener('click', onClick);
    quadro.addEventListener('load', () => { try { quadro.contentWindow.focus(); } catch (e) { /* outro domínio: não acontece aqui */ } });
    return () => { view.removeEventListener('click', onClick); document.body.classList.remove('modo-jogo'); };
  }

  window.TNG.aba('jogos', {
    titulo: 'Jogos de futebol',
    descricao: 'Football Draft, Jogo do Milhão do Futebol e Fast Football: jogue no navegador ou baixe no Android.',
    render(view, params) {
      const j = JOGOS.find((x) => x.rota === params[0]);
      if (j) { document.title = j.nome + ' · Tapa na Gaveta'; return noApp(j) ? soNoApp(view, j) : jogo(view, j); }
      lista(view);
      return null;
    },
  });
})();

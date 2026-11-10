// Dez a Zero: inicialização. Liga os serviços (cada um com caminho degradado), abre a primeira
// tela e esconde a abertura.
(function () {
  'use strict';
  const D = window.Dez, T = window.DezTelas;
  window.DEZ_VERSAO = '1.0.4';

  // Some com a abertura depois do primeiro quadro, deixando-a pelo menos 900 ms (para não piscar).
  const SPLASH_MIN_MS = 900;
  function esconderAbertura() {
    const el = document.getElementById('splash');
    if (!el) return void document.body.classList.add('aberto');
    setTimeout(() => {
      document.body.classList.add('aberto'); // libera a animação de entrada da tela inicial
      el.classList.add('some');
      setTimeout(() => el.remove(), 500);
      const sp = D.nativePlugin('SplashScreen');
      if (sp) sp.hide().catch(() => null);
    }, Math.max(0, SPLASH_MIN_MS - performance.now()));
  }

  function iniciar() {
    D.vidaNativa({
      voltar: () => T.voltar(),
      pausar: () => { const a = T.acoes(); if (T.atual && T.atual.nome === 'partida' && a.pausar) a.pausar(); },
      voltouAoApp: () => D.notificacoes.agendar(),
    });
    D.remote.fetch().catch(() => null);
    D.billing.init();
    D.admob.init();
    D.analytics.userProp('lang', D.I18N.lang);
    // lembretes: reagenda a cada abertura (e lembra a campanha em andamento, se houver)
    const c = T.campSalva();
    D.notificacoes.agendar(c && !c.fim ? { campanha: true, n: c.jogos.length + 1 } : {});
    T.ir('inicio');
    requestAnimationFrame(esconderAbertura);
    // O núcleo e o jogo ficam acessíveis para o roteiro de testes e o gravador de vídeos.
    window.dezApp = { ir: T.ir, telas: T, servicos: D };
  }

  if (document.fonts && document.fonts.load) {
    Promise.race([Promise.all([document.fonts.load('900 40px "Big Shoulders Display"'), document.fonts.load('700 16px Manrope')]), new Promise((r) => setTimeout(r, 800))]).then(iniciar, iniciar);
  } else iniciar();
})();

/* Tela inicial: o que é o site (no começo), atalhos para as seções e para o simulador de cada
   time, e o "quem somos" no fim. */
(function () {
  'use strict';
  const T = window.TNG;
  const { esc } = T;
  const SETA = '<svg class="seta" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13m-5-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const SECOES = [
    { id: 'simulador', n: '01', t: 'Simulador', p: 'Chute os placares que faltam, veja a tabela mudar na hora e revele a classificação final time a time.' },
    { id: 'escalacao', n: '02', t: 'Escalação', p: 'Comece pela escalação do último jogo, mexa no time, crie jogadores e mande a imagem pro grupo.' },
    { id: 'estatisticas', n: '03', t: 'Estatísticas', p: 'Artilheiros, ataques e defesas, casa e fora e quem chega embalado na reta final.' },
    { id: 'jogos', n: '04', t: 'Jogos', p: 'Jogo do Milhão, Football Draft e Fast Football, os nossos jogos de futebol.' },
  ];

  T.aba('inicio', {
    titulo: 'Simulador do Brasileirão 2026',
    descricao: 'Simule os jogos que faltam do Brasileirão 2026, veja as chances de título, Libertadores e rebaixamento do seu time e compartilhe a tabela final.',
    render(view) {
      view.innerHTML =
        '<section class="sim-topo ini-topo"><div class="page-head"><div class="kicker">Brasileirão 2026 · reta final</div>' +
        '<h1>A tabela do jeito que você acha que vai terminar</h1>' +
        '<p>O Tapa na Gaveta é um simulador feito por torcedores, pra torcedores: você chuta os jogos que faltam e descobre onde o seu time termina, com as regras de desempate de verdade.</p>' +
        '<div class="ini-cta"><a class="btn primario" href="#/simulador">Simular agora' + SETA + '</a><a class="link-btn claro" href="#/modelo">Como funciona</a></div></div></section>' +
        '<div class="sec-title"><h2>Simule pelo seu time</h2><small>o que falta para cada um</small></div>' +
        '<div class="ini-times">' + T.TIMES_RODAPE.map(([slug, n]) =>
          '<a href="#/simulador/' + slug + '" aria-label="Simulador ' + esc(n) + '"><img src="midia/escudos/' + slug + '.png" alt="" width="40" height="40" loading="lazy"><span>' + esc(n.replace(/^d[oa] /, '')) + '</span></a>').join('') + '</div>' +
        '<div class="sec-title"><h2>O que tem aqui</h2></div>' +
        '<ul class="ini-secoes">' + SECOES.map((s) =>
          '<li><a href="#/' + s.id + '"><span class="ini-n">' + s.n + '</span><b>' + s.t + '</b><p>' + s.p + '</p>' + SETA + '</a></li>').join('') + '</ul>' +
        '<section class="ini-sobre"><div class="ini-sobre-in"><div class="kicker">Quem somos</div>' +
        '<h2>Seis amigos, uma calculadora e muita reta final</h2>' +
        '<p>Somos seis amigos, engenheiros civis formados na USP. A gente passava as últimas rodadas fazendo conta no guardanapo: quantos pontos faltam, quem pega quem, o que precisa acontecer. Montamos o simulador que queríamos usar, com dados atualizados todo dia e um modelo de probabilidades aberto.</p>' +
        '<p class="ini-links"><a href="#/sobre">Leia mais sobre o projeto</a><a href="#/modelo">Como as chances são calculadas</a></p></div></section>';
      return null;
    },
  });
})();

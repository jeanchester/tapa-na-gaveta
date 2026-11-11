/* Páginas de texto: Quem somos, Como funciona, Desempates, Contato, Privacidade e Termos. O texto mora em textos/*.html
   (o mesmo arquivo vira página estática no build, para o Google e o AdSense lerem sem JavaScript). */
(function () {
  'use strict';
  const T = window.TNG;
  const TITULOS = { sobre: 'Quem somos', modelo: 'Como funciona o simulador', desempate: 'Critérios de desempate', contato: 'Contato', privacidade: 'Política de privacidade', termos: 'Termos de uso' };
  const cache = {};

  T.aba('textos', {
    titulo: '',
    descricao: '',
    render(view, parts) {
      const id = parts[0];
      const pedir = cache[id] ? Promise.resolve(cache[id]) : fetch('textos/' + id + '.html').then((r) => { if (!r.ok) throw new Error('texto ' + id + ' ' + r.status); return r.text(); }).then((h) => (cache[id] = h));
      return pedir.then((html) => {
        document.title = TITULOS[id] + ' · Tapa na Gaveta';
        view.innerHTML = '<article class="texto">' + html + '<nav class="texto-nav" aria-label="Sobre o site">' +
          T.INSTITUCIONAL.map(([k, n]) => '<a href="#/' + k + '"' + (k === id ? ' aria-current="page"' : '') + '>' + n + '</a>').join('') + '</nav></article>';
        view.querySelectorAll('[data-contato]').forEach((el) => { el.innerHTML = T.contatoHtml(); });
        return null;
      });
    },
  });
})();

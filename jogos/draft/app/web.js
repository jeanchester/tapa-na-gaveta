// Versão web do Football Draft no site Tapa na Gaveta (gerado por tools/portar_draft.py).
window.DEZ_WEB = true;
// o site é em português: o jogo também (os textos em en/es continuam no código)
try { var c = JSON.parse(localStorage.getItem('dez.config') || '{}'); if (!c.idioma) { c.idioma = 'pt'; localStorage.setItem('dez.config', JSON.stringify(c)); } } catch (e) { /* sem armazenamento */ }

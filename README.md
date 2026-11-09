# tapa na gaveta

simulador do brasileirão série a 2026 (masculino). site estático: `index.html` + pasta `escudos/`.

- abre direto no navegador, sem build e sem dependências (só google fonts)
- dados: snapshot embutido da ESPN; a camada `Fonte` já aceita um proxy via `window.TNG_PROXY`
- modelo: poisson (ataque/defesa, pontos por jogo, forma recente, mando), monte carlo e enumeração exata na reta final

escudos são marcas dos clubes, usados só para identificar os times.

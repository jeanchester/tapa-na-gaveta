# Unificação das duas versões

Este repositório guarda, lado a lado, as duas versões do Tapa na Gaveta. O objetivo é juntar as
funções das duas em **um site só**. Este arquivo é o mapa para quem (pessoa ou Claude) for fazer isso.

## Onde está cada versão

| | Versão A: simulador em arquivo único | Versão B: site completo |
|---|---|---|
| Pasta | raiz do repositório (`index.html`, `escudos/`) | `versao-site-completo/` |
| Formato | um `index.html` de 86 KB com CSS e JS embutidos | `index.html` + `app/`, `shared/`, `jogos/`, `dados/`, `midia/`, `tools/` |
| Abas | Simular, Chances, Meu time, Cenários salvos | Simulador, Escalação, Jogos, Estatísticas |
| Visual | topo azul-noite com dourado, fonte Archivo (Google Fonts) | verde, tema claro e escuro, Manrope e Big Shoulders locais |
| Documentação | `README.md` da raiz | `versao-site-completo/README.md`, `docs/PLANO.md`, `INSTRUCOES.md` |

Nenhum arquivo da versão A foi alterado. A versão B foi copiada como estava, e os caminhos dela são
relativos, então as duas abrem do mesmo checkout:

```bash
python -m http.server 8000
```

- versão A: `http://localhost:8000/`
- versão B: `http://localhost:8000/versao-site-completo/` (acrescente `?offline` para usar só os dados de reserva)

Testes da versão B, rodados dentro de `versao-site-completo/` (passando no momento do envio:
186/186 e 8.424/8.424 conferências):

```bash
node tools/testar-core.js
```

```bash
node tools/testar-milhao.js
```

## O que cada versão tem

### Só na versão B

- **Escalação** (`app/abas/escalacao.js`): monta o time por esquema e compartilha a imagem.
- **Jogos** (`jogos/draft`, `jogos/milhao`, `jogos/fast`): cada jogo isolado, aberto num `<iframe>`.
- **Estatísticas** (`app/abas/estatisticas.js`).
- **Núcleo de regras testável** (`shared/simulador-core.js`), usado pelo navegador, por um Web Worker
  (`shared/simulador-worker.js`) e pelo Node.
- **Dados em camadas** (`shared/espn.js`): ESPN ao vivo → cache do aparelho → `dados/brasileirao-2026.json`.
- **Regras em arquivo** (`shared/regras-brasileirao-2026.json`): desempates e zonas.
- **Cenário compartilhado por link**, tema claro/escuro, fontes locais (sem CDN).
- **Build e publicação** (`tools/build.js`): gera `dist/` com páginas de entrada por time e imagens
  de compartilhamento (`midia/og/`).
- **Modelo calibrado** (`tools/calibrar.js`, resultado em `docs/PLANO.md`, seção 3).

### Só na versão A (ou feito de outro jeito nela)

- **Resumo no topo**: "Faltam N jogos", líder do momento, quem vai à Libertadores e quem cai.
- **Placar por toque**: tocar soma gol; a barra de probabilidades escolhe o resultado.
- **Seletor de rodadas** com progresso por rodada ("Pendentes", "35ª", ..., "Todos").
- **"Sem espiar"**: cortina sobre a tabela, revelação do líder para baixo ou do lanterna para cima,
  botão de pular a animação e confete.
- **Aba Meu time**: objetivo do time, "O caminho até o fim", "Jogo a jogo", "Torça por" e
  "Todos os cenários" (enumeração exata na reta final).
- **Janela "Manda pro grupo"**: duas imagens, com Enviar, WhatsApp, Copiar imagem e Baixar.
- **Proxy de dados**: a camada `Fonte` aceita `window.TNG_PROXY`.

### Nas duas (comparar e ficar com a melhor)

Preencher placares, probabilidades por jogo (Poisson), sortear o resto, Monte Carlo de chances,
esconder e revelar a tabela, simular só o meu time, "o que o meu time precisa", cenários salvos e
imagens para compartilhar. Os nomes acima vieram de uma leitura rápida dos dois códigos: confira
cada item no código antes de decidir qual implementação fica.

## Pontos de atrito conhecidos

| Tema | Versão A | Versão B |
|---|---|---|
| Cenários salvos | chave `tng-cenarios-v1` | chave `tng.cenarios` (as chaves `tng.*` são contrato, ver README da B) |
| Escudos | `escudos/FLA.webp` (20 arquivos, sigla de 3 letras) | `midia/escudos/<chave>.png` (207 arquivos, chave no campo `escudo` do JSON) |
| Dados | retrato da ESPN embutido no HTML (6/11) | `dados/brasileirao-2026.json` (7/11) + ESPN ao vivo |
| Fontes | Google Fonts | arquivos locais em `shared/fonts/` |
| Publicação | estático na raiz (`.nojekyll`) | `tools/build.js` → `dist/` |

Os dois retratos de dados são de dias diferentes, então as tabelas das duas versões não batem
(pontos e número de jogos restantes). Isso é diferença de data, não erro de cálculo.

## Sugestão de caminho

1. Usar a **versão B como base** da estrutura: ela já tem as quatro abas, o núcleo testado, o build
   e os dados em camadas.
2. Levar para o simulador da B o que a versão A tem a mais ou faz melhor (lista acima), mantendo as
   regras em `shared/simulador-core.js` e cobrindo com `tools/testar-core.js`.
3. Migrar os cenários salvos de `tng-cenarios-v1` para `tng.cenarios` na primeira abertura, para
   ninguém perder o que já salvou.
4. No fim, o site unificado sobe para a raiz do repositório e as duas versões antigas saem.

## Decisões que são de vocês dois (não do Claude)

- Qual identidade visual fica: azul-noite e dourado (A), verde (B) ou uma mistura.
- Quais funções repetidas ficam com a implementação de A e quais com a de B.
- Como publicar: estático na raiz ou `dist/` gerado pelo build.
- Se o proxy de dados (`TNG_PROXY`) continua necessário, já que a B chama a ESPN direto do navegador.

## O que ficou de fora do repositório

Seguindo o `.gitignore` da própria versão B:

- `dist/` e `dist-artifact/`: saída do build. Recriar com `node tools/build.js --release`.
- `tools/saida/`: capturas de tela geradas por `tools/capturas.py`.
- `tapa-na-gaveta-midia/`: kit de mídia pesada de consulta (37 MB). O que o site usa já está em `jogos/`.

Os workflows em `versao-site-completo/.github/workflows/` **não rodam** enquanto estiverem na
subpasta: o GitHub só executa os de `.github/workflows/` na raiz. Movê-los faz parte da unificação.

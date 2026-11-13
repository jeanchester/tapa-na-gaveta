# Como escrever uma análise

Cada análise é um arquivo `.md` nesta pasta. O nome do arquivo vira o endereço:
`rodada-35-o-que-cada-time-precisa.md` → tapanagaveta.com.br/analises/rodada-35-o-que-cada-time-precisa/

## Cabeçalho (obrigatório)

```
---
titulo: O que cada time precisa na 35ª rodada
descricao: Uma frase de até ~150 caracteres. É o que aparece no Google e no WhatsApp.
data: 2026-11-14
autor: Nome de quem escreveu
rodada: 35
rascunho: sim
---
```

- `rascunho: sim` → a página vai para o ar só para vocês revisarem: aparece um aviso de rascunho,
  não entra no Google, na lista de análises nem no sitemap, e não tem anúncio.
  Para publicar, troque para `rascunho: não` e faça o commit.
- `atualizado: 2026-11-20` (opcional) → mostra "atualizado em" embaixo do título.

## Texto

Markdown simples:

- `## Título de seção`
- parágrafos separados por uma linha em branco
- `- item` para listas
- `> frase` para destacar uma frase
- `**negrito**`, `*itálico*`, `[texto do link](https://...)`
- `<!-- comentário -->` some do site (use para anotações)

## Quadros com dados (atualizam sozinhos a cada rodada)

Uma linha sozinha, entre linhas em branco:

- `{{tabela 15-20}}` classificação de hoje, do 15º ao 20º (as faixas já seguem a regra da Copa do Brasil)
- `{{chances rb}}` chance de cada time cair (troque por `titulo`, `libertadores`, `lib`, `pre` ou `sula`)
- `{{rodada 35}}` jogos da rodada com as chances e o placar mais provável
- `{{time COR}}` ficha do time (use a sigla: FLA, PAL, COR, GRE, MIR, VIT, REMO, CHA...)
- `{{simular COR}}` botão para simular os jogos do time no site

Cuidado: os quadros mudam a cada rodada, o texto não. Escreva o texto pensando no dia da data
do cabeçalho ("nesta rodada", "hoje o Corinthians é 17º") e deixe os números exatos para os quadros.

## O que faz uma análise ajudar no AdSense e no Google

- Texto de vocês, com opinião e contexto que o simulador não dá: desfalques, calendário,
  confronto direto, o que o torcedor está sentindo. Umas 700 a 1.200 palavras.
- Título que responde uma pergunta que alguém busca ("quem cai", "o que o Vasco precisa").
- Nada copiado de outros sites e nada de "dica de aposta".

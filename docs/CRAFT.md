# Craft e cuidado nos detalhes

Regra da casa desde 18/11/2026, inspirada no texto "Impermanence", do Thiago Costa
(tcosta.com/impermanence): quando fazer software fica fácil, o que diferencia é o que a pessoa sente
usando. Vale para toda mudança de interface neste repositório.

## Antes de mexer

Responda em três linhas: qual é a primeira coisa que o torcedor faz nessa tela, qual é o momento
memorável e como a tela termina. No simulador: dar o primeiro palpite, ver a tabela batendo linha a
linha, mandar a imagem no grupo.

## Seis princípios

1. **O primeiro minuto é o pitch.** O primeiro jogo cabe inteiro na primeira tela do celular
   (390 × 844), com ou sem time escolhido. O `tools/auditar.py` confere.
2. **A página é a fase.** Revelação, imagem e vídeo usam as mesmas linhas, escudos e cores da tabela.
3. **Cada toque tem consequência visível.** A linha anda na tabela, os pontos contam, a frase do topo
   muda ("o Flamengo lidera").
4. **Castigo às claras, ajuda em segredo.** Rebaixado é dito com todas as letras e não ganha confete.
   Ajuda não se anuncia: o foco pula para o próximo placar, a barra 1-X-2 preenche o placar mais
   provável, "Desfazer" no lugar de "tem certeza?", vibração de 8 ms ao marcar um palpite no Android.
5. **Ninguém espera parado.** O Monte Carlo mostra o progresso; um toque na lista acelera a revelação.
6. **O fim é uma volta de honra.** A revelação termina parada na linha do time do torcedor (ou no
   campeão), marcada em dourado, com "Compartilhar a tabela" à mão. Nada cobre o texto.

## Tokens (app/app.css)

| Token | Valor | Uso |
|---|---|---|
| `--r-sm`, `--r`, `--r-lg` | 4, 10, 14 px | os únicos raios, além da pílula (999px) e do círculo. Dentro de um cartão: raio de fora menos o respiro (`calc(var(--r-lg) - 6px)`) |
| `--ease-out` | `cubic-bezier(.23, 1, .32, 1)` | tudo que entra ou responde a um toque |
| `--ease-in-out` | `cubic-bezier(.77, 0, .175, 1)` | algo que já está na tela e muda de lugar |
| `--t-toque`, `--t-ui` | 140 ms, 200 ms | aperto e mudanças de estado |

## Acabamento

- Toque: tudo que se aperta afunda (`scale(.97)`, linhas e cartões `.985`); a barra 1-X-2 escurece
  em vez de encolher porque é uma peça só.
- Movimento só quando responde a uma ação. O campo de pontos do topo fica parado e só reage ao cursor.
  Interface abaixo de 300 ms. Nunca `ease-in`, `scale(0)`, `transition: all` ou quique.
- Números que mudam com `tabular-nums`. Títulos com `text-wrap: balance`, texto com `pretty`.
- Sem degradê decorativo, sem reflexo varrendo botão, sem brilho seguindo o cursor, sem rótulo em
  caixa alta, sem "01, 02, 03" numerando seções, sem ponto no meio juntando dados (use vírgula ou "às").
- Um nome por ação no site inteiro ("Simular o que falta" no celular e no computador).
- Escudos grandes (revelação, cartão do time, imagens e vídeo) vêm de `midia/escudos/hd/` (256 px,
  WebP). Se faltar um, o site cai para o PNG de 128 px sozinho.

## Escudos em alta

`ferramentas/baixar_escudos_hd.py` baixa o escudo de 500 px da ESPN de cada time em `dados/*.json`,
recorta a sobra, centraliza com o mesmo respiro e grava `midia/escudos/hd/<slug>.webp`. Roda no
GitHub Actions (fluxo "Escudos em alta") quando o script muda ou à mão. Quando o escudo da ESPN não
bate com o nosso (estrelas, coroa, versão antiga), o time entra em `MANTER` e o HD sai de
`ferramentas/escudos-fonte/` ou do PNG de 128 px.

## Como conferir

`python tools/auditar.py` mede o que dá para medir (primeiro jogo na primeira tela, raios, curvas,
rótulos). O que nenhum teste mede é se ficou gostoso: abrir no celular, jogar uma rodada inteira,
revelar a tabela e cortar o que sobrar.

Referências: Make Interfaces Feel Better (github.com/jakubkrehel/make-interfaces-feel-better), Emil
Kowalski (github.com/emilkowalski/skills) e Impeccable (impeccable.style).

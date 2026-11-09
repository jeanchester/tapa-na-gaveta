# Dez a Zero (10a0, nome provisório): plano do projeto

Jogo de draft de futebol inspirado no 7a0: o jogador sorteia times, monta um XI pegando um
jogador de cada time sorteado e disputa uma campanha (8 jogos na Copa e na Mistura, 10 na Champions
e nas ligas). O objetivo é a campanha perfeita: vencer todos os jogos.

## Decisões (e por quê)

| Tema | Decisão | Motivo |
|---|---|---|
| Nome | **Football Draft** ("Can you win?"), appId `com.julio333.FootballDraft`, prefixo salvo `dez.` (interno, fica) | Nome escolhido em out/2026 (antes era "Dez a Zero"). O appId só pode mudar até o primeiro envio à Play Store. |
| Stack | Capacitor + JavaScript puro, **sem Phaser**: telas em HTML/CSS e partida em Canvas 2D | O jogo é 90% menus, listas e cartas (draft, loja, tabelas). HTML faz rolagem, texto nítido e ajuste de fonte de graça. A partida, que precisa de desenho rápido, fica num `<canvas>`. Todo o resto do playbook vale igual: núcleo puro em `shared/`, `build_www.js`, marca de release, pontos únicos para serviços nativos, `try/catch` no armazenamento, três idiomas. |
| Dados | Times, escudos e jogadores **reais** (out/2026), em `shared/dados/`: seleções da Copa 2026 e históricas, Brasileirão 2026 e 5 grandes ligas 2025/26, mais temporadas marcantes | A v1 usava dados fictícios; a troca manteve o contrato de `elenco(timeId, ano)`. Notas numa escala única para todas as eras, validadas por `tools/validar_dados.js`. |
| Anos | Cada time tem um conjunto fechado de temporadas (só as que existem nos dados) | Não dá para ter todos os anos de todos os times com dados confiáveis. |
| Sorteio | Cada sorteio traz time + ano ("Brasil 1970", "Barcelona 2010/11") | Como no 7a0: o mesmo time muda de elenco com o tempo, com gerações de ouro. |

## Modos

| Modo | Formato |
|---|---|
| Copa do Mundo | Como a Copa de 2026: 48 seleções em 12 grupos de 4 (3 jogos; passam os 2 primeiros e os 8 melhores terceiros) + 16-avos, oitavas, quartas, semi e final: **8 jogos** |
| Champions | Fase de liga com 36 times (6 jogos, passam 16) + oitavas, quartas, semi e final: **10 jogos** |
| Brasileirão, Premier, La Liga, Serie A, Bundesliga, Ligue 1 | Liga de 20 times (18 na Bundesliga e na Ligue 1) em 10 rodadas (todos jogam toda rodada, sem repetir adversário); campeão é o 1º: **10 jogos** |
| Mistura Geral | Seleções e clubes de todas as competições; formato da Copa: **8 jogos** |
| Desafio do Dia | Mesmo sorteio para todo mundo no dia, sem re-sorteio; resultado compartilhável em grade de emojis |

Mata-mata empatado vai para os pênaltis, mostrados no campinho.

## Draft

1. Escolhe o esquema: 4-3-3, 4-4-2, 4-2-3-1, 3-5-2, 4-1-4-1, 4-1-2-1-2 (losango), 3-4-3, 5-3-2 e 4-5-1.
   **Modo difícil** (opcional): as notas ficam escondidas até o time fechar (+50% de moedas).
2. Sorteia um time + ano; vê o elenco e escolhe **um** jogador para uma vaga livre.
3. Jogador fora da posição pode jogar em posição vizinha, com perda de força (mostrada na hora).
4. 1 re-sorteio grátis por draft, +1 por anúncio premiado.
5. Entrosamento: jogadores do mesmo time e ano dão um pequeno bônus.

## Partida no campinho

- Resultado decidido por um modelo estatístico (força de ataque × defesa, gols por Poisson).
- O campinho é um **diretor de jogadas**: divide os 90 minutos em ataques e conduz os 22 jogadores
  e a bola para que cada ataque termine no desfecho sorteado (gol, defesa do goleiro, chute para
  fora, escanteio, desarme). Os jogadores seguem a formação, que se desloca com a bola: a defesa
  aperta quem conduz, os atacantes buscam espaço, o goleiro acompanha a bola.
- Bola com passes rasteiros e lançamentos com altura (sombra e tamanho), comemoração de gol,
  intervalo com troca de lado, velocidades 1x/2x/3x e "pular".
- Movimentação: linhas de passe (dois companheiros se oferecem ao lado de quem tem a bola), amplitude
  no ataque (pontas abertos, lateral do lado da bola sobe), passes conforme a pressão (curto quando
  apertado, inversão de jogo às vezes), perda de bola por interceptação, desarme ou bola pela lateral
  (com arremesso), saída de bola com toque para trás e volta caminhando depois do gol.
- Sincronia: o relógio nunca passa do minuto do próximo lance; cada gol aparece no minuto sorteado.
- Fundo: o estádio escolhido. O retângulo do gramado de cada uma das 133 imagens é detectado por
  script (`tools/estadios.py`) e conferido numa folha de contato.

## Loja e personalização

- **Moedas** ganhas jogando (vitória, título, campanha perfeita, bônus do modo difícil) e por anúncio premiado (com limite diário).
- **Estádios**: os 133 campos do Jogo do Milhão e do Fast Football; 2 grátis, o resto comprável.
- **Personalizar o estádio**: nome, padrão do gramado (listras, xadrez, diagonal, círculos) e
  iluminação (dia, pôr do sol, noite).
- **Bolas**: 30 modelos desenhados, entre eles inspirados em bolas marcantes de Copas e finais europeias (sem nomes nem marcas reais).
- **Meu time**: nome, cores, 12 formatos e 6 padrões de escudo (grátis).
- Compras reais (RevenueCat), todas de compra única: Rei do Draft (tudo: bolas, estádios e sem anúncios), todos os estádios, todas as bolas, remover anúncios. Sem pacote de moedas.
- Economia: uma campanha rende ~400 moedas (o dobro com o anúncio); título e classificação valem mais nos modos difíceis (Champions League, Mistura, Copa), para todo modo render parecido. Bola custa 400–2.000 e estádio 800–1.500.

## Engajamento

- **Compartilhar**: imagem do resultado (XI só com os nomes, destaque discreto para quem rendeu 85+, campanha em quadradinhos) + texto com link da Play Store.
- **Avaliação**: API oficial de avaliação no app, depois de um bom momento (título ou 7+
  vitórias), com as regras do playbook (seção 8b).
- **Notificações locais**: lembrete diário às 19h ("o Desafio do Dia chegou") nos próximos 7 dias,
  reagendado a cada abertura (quem para de jogar deixa de receber em uma semana). A permissão é
  pedida depois da primeira campanha, não na abertura.

## Ordem de execução

1. Esqueleto do projeto (pastas, `serve.py`, `build_www.js`, `index.html` com área segura).
2. Estádios: copiar, reduzir, detectar o gramado, gerar miniaturas e `shared/estadios.js`.
3. Núcleo (`shared/dez-core.js`): times, elencos, draft, força, resultados, torneios.
4. Balanceamento por simulação Monte Carlo (`tools/balancear.js`).
5. Motor do campinho (`shared/dez-partida.js`), testável no Node.
6. Telas (`app/`): menu, modos, formação, draft, campanha, partida, final, loja, estádio, time,
   configurações, estatísticas, como jogar.
7. Serviços: armazenamento, analytics, anúncios, compras, compartilhar, avaliação, notificações.
8. Ícone, splash, i18n pt/en/es completos.
9. Capacitor Android, plugins, build do APK.
10. Testes em vários tamanhos de tela (roteiro automatizado), ficha da loja, política de privacidade.

## Identidade visual (rodada 2)

- Fontes locais (OFL): **Big Shoulders Display** (títulos, placares, números: lembra placar de
  estádio e número de camisa) e **Manrope** (texto).
- Cores: fundo verde-quase-preto `#0C1210`, texto cor de giz `#EDEBE4`, um único acento
  verde-limão `#D4F25C` (a cal das linhas do campo); vitória, empate e derrota em limão, areia e coral.
- Sem emojis na interface: ícones de traço fino próprios (app/visual.js), selos com a sigla do país para as ligas.
- Escudos reais em PNG (`app/img/escudos/`); bandeiras desenhadas e escudos SVG ficam como fallback.

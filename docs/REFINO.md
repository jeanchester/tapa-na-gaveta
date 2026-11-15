# Refino do site: o pente fino periódico

Uma rotina agendada passa pelo site a cada poucos dias, testa tudo o que dá para tocar, conserta o que
está claramente errado e deixa as ideias de melhoria por escrito. Este documento é o roteiro dessa
rotina (e serve também para rodar à mão).

## O que a rotina faz, em ordem

1. **Preparar.** Clonar o repositório, `python serve.py` em segundo plano (porta 8780), `pip install playwright`
   e `playwright install chromium` se faltar.
2. **Testes do núcleo.** `node tools/testar-core.js` e `node tools/testar-milhao.js`. Falha aqui trava a
   publicação (o workflow roda os dois), então é a primeira coisa a consertar.
3. **Auditoria completa.** `python tools/auditar.py` (celular 390 px e computador 1280 px, todas as
   competições, todos os times). O relatório sai em `tools/saida/auditoria.md`. Ela confere console,
   requisições, layout, colunas das tabelas, zonas do regulamento, preencher, sortear, revelar,
   compartilhar (imagens em branco), links do topo e rodapé e o voltar do navegador.
4. **Olhar de gente.** A auditoria só pega o que dá para medir. Depois dela, abrir de verdade, em 390 px e
   em modo claro e escuro (`python tools/capturas.py site` e `simulador`), e ler as telas como um torcedor:
   - **Faz sentido?** Texto, rótulo e número dizem a verdade para a situação de hoje? (Exemplos de coisa que
     já saiu errada: Série B com a liga encerrada mostrando "Playoff" para o 2º colocado; coluna de chances
     com os títulos fora do lugar; nomes de time sumidos no celular.)
   - **Está no momento certo?** O que o torcedor quer hoje está no alto da tela? Calendário de referência:
     Série A, rodadas 35 a 38 (até 02/12); playoff da Série B, ida 21/11 e volta 28/11; depois disso o
     simulador da Série B volta a ser tabela final e o da Série A vira resumo da temporada.
   - **Cabe no polegar?** Alvos de toque com menos de 40 px, texto apertado, tela com rolagem demais.
5. **Dados.** Conferir se `dados/*.json` está atualizado (campo `baixado_em`), se o workflow
   `atualizar-dados.yml` está rodando e se algum jogo terminou e ainda aparece como em aberto.
6. **Consertar o que é seguro.** Defeito claro, correção pequena: corrigir numa branch `refino-AAAA-MM-DD`,
   rodar os testes e a auditoria de novo, abrir PR (nunca mergear sozinho). Mudança de visual grande,
   texto de análise e qualquer coisa que mude regra do campeonato ficam como ideia, não como correção.
7. **Relatório.** Escrever `docs/refino/AAAA-MM-DD.md` com: o que foi testado, defeitos achados e o que foi
   corrigido (com o PR), defeitos que ficaram, e **de 3 a 5 ideias de melhoria** ordenadas por valor para o
   torcedor (cada uma com o porquê em uma frase). Incluir no mesmo PR.

## Regras do jogo

- Seguir o `CLAUDE.md` e as decisões já tomadas (identidade azul-noite e dourado, português do Brasil,
  texto curto, sem cara de IA nem de template, mobile primeiro).
- Nunca editar o texto das análises assinadas pelo Jean sem ele pedir; apontar problema no relatório.
- Não mexer em `main` direto, não apagar dados, não mexer no domínio nem no AdSense.
- Se a auditoria quebrar por causa do próprio script (e não do site), consertar o script.
- Defeito que se repete duas vezes seguidas vira teste em `tools/auditar.py`.

## Histórico

Cada rodada deixa um arquivo em `docs/refino/`. O primeiro (15/11/2026) foi feito à mão e achou:
tabela de Chances sem nomes de time no celular, colunas da Chances desalinhadas no celular, página da
Série B ainda tratando a liga como se faltassem jogos (agora ela é o playoff do acesso), e o workflow de
publicação travado por um teste que dependia de um jogo em aberto.

# 0001 · Organização do projeto para crescer

**Situação:** proposta em 15/11/2026, por Matheus. A Fase 0 entra no mesmo PR que esta nota; as
outras fases esperam o grupo concordar. A proposta completa, com o desenho das camadas e a situação
de cada fase, está em [docs/ARQUITETURA.md](../ARQUITETURA.md).

## Contexto

O site cresceu rápido: 7 ligas, 3 jogos, análises, páginas por time e vídeos. O que trava o próximo
passo é organização, não tecnologia:

- `app/abas/simulador.js` tem 1.866 linhas (128 KB) e quase toda mudança passa por ele.
- `shared/simulador-core.js` junta liga, modelo, Monte Carlo, playoff, link e migração antiga.
- Cores, nomes e siglas dos times estão no código; "2026" aparece em 21 arquivos de código.
- Os testes só rodavam na publicação, depois do merge.
- Há duas pastas de ferramentas (`tools/` e `ferramentas/`) e fontes duplicadas nos jogos.
- Erros do site publicado não chegavam a ninguém.

## Decisão

Manter o site sem build e sem framework, organizado em camadas: `nucleo/` (regras puras),
`servicos/` (ESPN, armazenamento, compartilhar), `app/` (casca), `telas/` + `ui/`, e `config/` +
`dados/` (o que muda por temporada). Tudo que vai para o ar fica em `site/`; ferramentas, conteúdo e
documentos ficam fora. Módulos ES nativos no lugar de IIFE + `window.*`. Migração em fases:

| Fase | O quê | Quando |
|---|---|---|
| 0 | `package.json` com atalhos, `.nvmrc`, `requirements.txt`, workflow **Checar PR**, `CONTRIBUTING.md`, esta pasta, `PLANO.md` corrigido, erros de produção no GA4 | agora (não mexe nas telas) |
| 1 | Pastas novas, sem reescrever código | depois de 02/12 (fim da Série A) |
| 2 | `config/times.json` e temporada como pasta (`regras/2026/`, `dados/2026/`) | dezembro |
| 3 | Núcleo em módulos ES, testes com `node:test` | dezembro |
| 4 | Telas em módulos, peças comuns em `ui/`, import map com a versão no build | antes da temporada 2027 |
| 5 | Copa do Brasil 2027 (mata-mata) já na estrutura nova | 2027 |

Em nenhuma fase mudam as chaves `tng.*` e `dez.*`, os links de cenário e os endereços públicos.

## Consequências

- Mais fácil: virar a temporada, entrar formato novo de competição, várias pessoas mexendo ao mesmo
  tempo, achar onde cada coisa mora.
- Mais difícil: as fases 1 a 4 mexem em muitos caminhos de uma vez (build, workflows, skill de vídeo,
  prévia no Artifact) e pedem conferência com auditoria e capturas antes do merge.
- Fica de fora por enquanto: framework, backend próprio, ferramentas de monorepo.

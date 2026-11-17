# Como trabalhar no Tapa na Gaveta

Guia curto para quem chega (gente ou Claude). O que o site é e como ele está montado: [README.md](README.md).
Por que as coisas são como são: [docs/PLANO.md](docs/PLANO.md) e [docs/decisoes/](docs/decisoes/).
Para onde a estrutura vai, fase a fase: [docs/ARQUITETURA.md](docs/ARQUITETURA.md).

## Preparar a máquina (uma vez)

```bash
brew install node                                  # Node 22 ou mais novo (ver .nvmrc)
python3 -m pip install -r requirements.txt         # só para capturas, auditoria, imagens og e vídeos
python3 -m playwright install chromium
git config --global user.name "Seu Nome"
git config --global user.email "voce@exemplo.com"
gh auth login                                      # para abrir PRs pelo terminal
```

O site em si não tem dependências: não existe `npm install`. O `package.json` só guarda atalhos.

## Comandos do dia a dia

| Comando | O que faz |
|---|---|
| `npm run dev` | sobe o site em http://localhost:8780/ (`?offline` usa só os dados do repositório) |
| `npm test` | testes do núcleo do simulador e do Jogo do Milhão |
| `npm run build` | gera `dist/` como vai para o ar |
| `npm run auditar` | percorre o site inteiro no Chromium e escreve `tools/saida/auditoria.md` (servidor no ar) |
| `npm run capturas` | todas as telas em 320, 390 e 1280 px, claro e escuro (servidor no ar) |
| `npm run calibrar` | recalibra o modelo de probabilidade (Brier nos jogos já disputados) |

## Fluxo de uma mudança

1. Parta da `main` atualizada: `git switch main && git pull`.
2. Crie uma branch com nome que diga o que é: `git switch -c simulador-filtro-rodada`.
3. Faça a mudança. Editar e apertar F5 é o ciclo inteiro: não há etapa de compilação.
4. Rode `npm test` antes de cada commit. Mexeu em tela? Abra em 390 px (celular) e em modo claro e escuro.
5. Abra o PR para a `main`. O workflow **Checar PR** roda os testes e o build; com ele vermelho, não tem merge.
6. Outra pessoa do grupo revisa e faz o merge. A publicação no GitHub Pages é automática.

Nunca faça commit direto na `main`: o robô de dados grava nela duas vezes por dia e o site é publicado a
cada push.

## Regras que não mudam

- **As chaves salvas no aparelho são contrato:** `tng.*` (e `dez.*` no Draft). Não renomeie; se precisar
  mudar o formato, leia a antiga, converta e apague, como `migrarAntigos` faz.
- **Links compartilhados continuam abrindo:** cenários (`?c=`, `?po=`), rotas (`#/simulador/flamengo`) e
  as páginas públicas (`/simulador/flamengo/`).
- **Regras puras ficam no núcleo** (`shared/simulador-core.js`): sem DOM e sem rede, com teste em
  `tools/testar-core.js`. A tela só desenha.
- **Texto em português do Brasil**, curto, em frase normal (sem rótulo em caixa alta), pensado primeiro
  para o celular. Identidade azul-noite (`#0b1640`) e dourado (`#ffc23d`).
- **Análises assinadas** (`analises/*.md`) só mudam com o pedido de quem assinou.
- **Arquivos com quebra de linha CRLF** (ex.: `app/app.js`, `docs/PLANO.md`) continuam CRLF. Ao editar por
  script em Python, use `newline=''`.

## Decisões

Decisão que muda o jeito de trabalhar (formato de dados, estrutura de pastas, biblioteca nova) ganha uma
nota curta em [docs/decisoes/](docs/decisoes/), no mesmo PR que a coloca em prática.

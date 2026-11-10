# Competições eliminatórias: desenho para a próxima versão

O simulador de hoje é do formato **liga** (Brasileirão). O núcleo (`shared/simulador-core.js`) foi
escrito para que outros formatos entrem sem mexer no que existe. Este documento diz como.

## 1. O que já serve para qualquer formato

| Peça | Onde | Serve para |
|---|---|---|
| `modelo(L, params)` → `prob(h, a)` com a matriz de placares | núcleo | qualquer jogo entre dois times |
| `amostrar(prob, rng)` | núcleo | sortear um placar inteiro |
| `rng(seed)` | núcleo | simulações reproduzíveis |
| `codificar` / `decodificar` (pares mandante × visitante) | núcleo | cenário por link (o par é único também num mata-mata de ida e volta) |
| Worker, revelação, imagem para compartilhar | `app/` | reaproveitados como estão |

## 2. Formatos novos

Cada competição ganha um arquivo de regras (como `shared/regras-brasileirao-2026.json`) com um
campo `formato` e as fases:

```jsonc
{
  "competicao": "Copa do Brasil 2027",
  "formato": "mata-mata",
  "fases": [
    { "id": "oitavas", "jogos": "ida-e-volta", "desempate": ["gols_agregado", "penaltis"] },
    { "id": "final",   "jogos": "ida-e-volta", "desempate": ["gols_agregado", "penaltis"] }
  ]
}
```

| Formato | Classificação | Simulação |
|---|---|---|
| `liga` (pronto) | `tabela()` com os critérios do regulamento | todos contra todos |
| `grupos` | uma `tabela()` por grupo + regra de quem passa (2 primeiros, melhores terceiros) | grupos e depois `mata-mata` |
| `mata-mata` | chave (quem enfrenta quem), agregado da ida e da volta | jogo único ou ida e volta; empate vai para os **pênaltis** |

**Pênaltis:** 50% para cada lado é honesto e simples; uma alternativa é dar 55% ao time mais forte
pelo modelo. A escolha fica anotada no arquivo de regras (`"penaltis": 0.5`).

Funções novas no núcleo (puras, testáveis no Node, como as de hoje):

- `chave(L, regras, placares)` → as fases com quem já passou, quem pode passar e os confrontos;
- `simularMataMata(L, regras, placares, M, rng)` → campeão e caminho de cada time;
- `monteCarlo` ganha um modo "mata-mata" que conta chegadas por fase (oitavas, quartas, semi,
  final, título), em vez de posições.

Na tela, o que muda é só a parte do meio: no lugar da tabela, uma chave que se preenche (e se
revela) fase a fase. Jogos, probabilidades, cenários, link e imagem continuam iguais.

## 3. Dados

A ESPN tem o mesmo formato de `scoreboard` para outras competições. Endpoints a conferir antes de
começar: `bra.copa_do_brazil` (Copa do Brasil) e `conmebol.libertadores` (Libertadores), com
`?dates=AAAAMM`. As fases e os pares de ida e volta precisam vir da própria resposta (o campo
`season.slug` ou as notas do jogo); se não vierem, a chave é montada à mão no arquivo de regras.

## 4. Proposta de próxima competição

**Copa do Brasil 2027**, por três motivos: é só mata-mata (exercita o formato novo sem a parte de
grupos), mexe com as torcidas de todos os estados e as fases finais coincidem com o meio do
Brasileirão, quando o simulador da liga está menos movimentado. A Libertadores 2027 vem depois,
reaproveitando `grupos` + `mata-mata`.

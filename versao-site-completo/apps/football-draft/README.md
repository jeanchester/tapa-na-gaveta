# Dez a Zero (10a0)

Jogo de draft de futebol para Android, inspirado no 7a0. O jogador sorteia times (seleções e
clubes de vários anos), escolhe um jogador de cada time sorteado até fechar o XI e disputa uma
campanha (8 jogos na Copa e na Mistura, 10 na Champions e nas ligas), assistindo a cada partida num
campinho visto de cima, com os 22 jogadores e a bola. O sonho é a campanha perfeita.

**Nome:** Football Draft ("Can you win?"). Textos em `app.nome`, `app.nome_texto` e `app.slogan`
(`shared/i18n/*.js`), `appName` em `capacitor.config.json` e `app_name` em
`android/app/src/main/res/values/strings.xml`.

**Logo e abertura animada:** a arte do logo (imagem gerada por IA) é separada em camadas por
`tools/logo.py`: o título em PNG transparente (`app/img/logo-<idioma>.png`), a bola (que gira) e o
estádio desfocado do fundo. Para pôr a versão de outro idioma:

```bash
python tools/logo.py caminho/da/imagem.jpg pt
```

(`--fundo` regera também o estádio do fundo). Enquanto um idioma não tem a sua versão, vale a inglesa.
O ícone e a abertura nativa saem de outra arte, `assets/arte/logo_draft.jpg` (bola na frente de três cartas):
`python tools/icones.py` e `npm run icons` refazem os dois (conferência em `tools/saida/icone_conferir.jpg`).

Feito seguindo o `PLAYBOOK.md` (Capacitor + JavaScript sem build). Decisões e formatos dos
torneios: [docs/PLANO.md](docs/PLANO.md).

## Rodar

```bash
python serve.py
```

Abra http://localhost:8766/app/ (celular na mesma rede: pelo IP do PC). `?debug` mostra os
eventos de analytics no console.

## Estrutura

| Pasta/arquivo | O que tem |
|---|---|
| `shared/dados/` | Times, escudos e elencos reais, um arquivo por competição (`selecoes.js`, `brasileirao.js`, `premier.js`, `laliga.js`, `seriea.js`, `bundesliga.js`, `ligue1.js`). |
| `shared/dez-dados.js` | Agregador dos arquivos de `shared/dados/` (formato documentado no topo). |
| `app/img/escudos/` | Escudos em PNG (128 px), copiados do Fast Football por `tools/escudos.py`. |
| `shared/dez-core.js` | Regras puras: elencos por ano, draft, força do time, resultado das partidas, Copa/Champions/ligas, prêmios, Desafio do Dia. |
| `shared/dez-partida.js` | O campinho: conduz os 22 jogadores e a bola para mostrar exatamente o resultado sorteado. |
| `shared/estadios.js` + `shared/estadios/` | Os 133 campos do Jogo do Milhão e do Fast Football, com o retângulo do gramado de cada um (gerado por `tools/estadios.py`). |
| `shared/i18n/` | Textos em pt, en e es. |
| `app/` | Página do jogo: `servicos.js` (armazenamento, Firebase, anúncios, compras, avaliação, notificações, compartilhar, som), `visual.js`, `campinho.js` (desenho), `telas*.js`, `main.js`. |
| `tools/` | Scripts: `validar_dados.js` (integridade e balanceamento dos elencos), `ajustar_notas.py`, `espalhar_notas.js` e `remapear_notas.js` (ajustes de notas), `calibrar.js` e `balancear.js` (Monte Carlo da dificuldade), `testar_partida.js` (o campinho mostra o placar certo?), `roteiro.js` (Chrome invisível que percorre as telas e tira capturas), `vitrine.js` (screenshots da loja com legenda), `trailer.js` e `trailer.py` (trailer de lançamento), `estadios.py`, `icones.py`, `build_www.js`. |
| `docs/` | Plano, ficha da loja (pt/en/es), política de privacidade. |

## Testes

```bash
npm test
```

Roda 100 partidas no campinho (confere placar, pênaltis, tempo e que ninguém sai do campo) e a
simulação de balanceamento. Para as telas (servidor no ar):

```bash
node tools/roteiro.js telas 390x844 pt
```

Cenários: `telas`, `partida`, `campanha` (MODO=copa|champions|mistura|...), `desafio`, `dificil`, `loja`; capturas em `tools/saida/roteiro/`.

## Gerar o app

- APK de teste: `npm run apk` → `android/app/build/outputs/apk/debug/app-debug.apk`
- No celular com depuração USB: `npm run android`
- Versão da loja: `npm run aab` → `android/app/build/outputs/bundle/release/app-release.aab`

O `npm run aab` **recusa** gerar a versão da loja enquanto houver valor de teste (blocos e App ID
do AdMob de teste, política de privacidade vazia). É de propósito.

## O que falta para publicar (fora do código)

1. **appId**: `com.julio333.FootballDraft`. Só pode mudar até o primeiro envio à Play Store.
2. **AdMob**: feito no código (App ID `ca-app-pub-1665055635227173~7650738734` no AndroidManifest,
   blocos premiado e intersticial em `ADMOB`, `app/servicos.js`; fora da versão da loja o plugin usa
   anúncios de teste). Falta no painel: mensagens de consentimento (Europa e estados dos EUA),
   `app-ads.txt` e o celular cadastrado como dispositivo de teste.
3. **Política de privacidade**: publicar `docs/privacidade.html` (por exemplo no GitHub Pages) e
   preencher `PRIVACY_URL` em `app/servicos.js`.
4. **Compras (RevenueCat)**: `REVENUECAT_KEY` já preenchida. Os produtos (todos de compra única) têm
   os ids `rei` (todas as bolas, todos os estádios e sem anúncios), `estadios`, `bolas` e `remover`:
   precisam existir com esses ids no Play Console e no RevenueCat, que precisa estar ligado ao Google
   Play. Sem chave, a versão da loja mostra a loja de compras como indisponível (nunca libera de graça).
5. **Firebase** (opcional, mas recomendado): `google-services.json` já está em `android/app/`; falta
   `npm install @capacitor-firebase/analytics @capacitor-firebase/crashlytics @capacitor-firebase/remote-config`
   e `npm run sync`. O código já chama tudo por um ponto único; sem os plugins, nada acontece.
6. **Chave de assinatura** (uma vez, dentro de `android/app/`):
   `keytool -genkeypair -v -keystore upload-key.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000`
   e `android/keystore.properties` com `storeFile=upload-key.keystore`, `storePassword`,
   `keyAlias=upload`, `keyPassword`. **Guarde uma cópia da chave fora do projeto.**
7. **Ficha da loja**: textos em `docs/loja/`, ícone `docs/loja/icone-512.png`, screenshots com legenda
   (1080x1920, pt/en/es) em `docs/loja/screenshots/`, refeitas com `node tools/vitrine.js` (servidor no ar).
   Trailer (1920x1080, ~43 s, pt/en/es) em `docs/loja/trailer/`: `node tools/trailer.js todos` grava as cenas
   e `python tools/trailer.py todos` monta o vídeo com a música do jogo (precisa do ffmpeg).
8. A cada envio: subir `versionCode` em `android/app/build.gradle`.

## Ajustes sem publicar versão (Remote Config)

`REMOTE_DEFAULTS` em `app/servicos.js`: quando pedir avaliação, frequência dos intersticiais,
moedas por anúncio, re-sorteios por anúncio e a hora do lembrete diário.

## Dados (times, elencos e notas)

Os elencos são reais: as 48 seleções da Copa 2026 (convocações oficiais) e Copas históricas, os clubes do
Brasileirão 2026 e das 5 grandes ligas em 2025/26 e em temporadas marcantes. Cada time tem um conjunto fechado
de anos (`anosDe`), e a força do time é a média do melhor XI. Ficam em `shared/dados/<competição>.js`, um jogador
por linha (`nome|curto|pos|num|força|idade|origem`), com o formato explicado no topo de `shared/dez-dados.js`.
O histórico do trabalho e as escolhas de temporadas estão em `docs/DADOS_REAIS_PROGRESSO.md`.

Para mexer nos dados:

```bash
node tools/validar_dados.js
```

confere integridade (posições, tamanho dos elencos, melhor XI sem buraco, escudos), a regra de notas de cada
elenco, o histograma contra as metas e simula drafts em todos os modos. Ajustes em lote:
`python tools/ajustar_notas.py <arquivo>` (linhas `time@ano | nome | campo=valor`). Depois de mudar notas,
`node tools/balancear.js` mostra as taxas de título (metas: Copa ~15%, Champions 7-10%, ligas 16-38%).
Escudos novos: PNG em `FootballExpress` e `python tools/escudos.py`; time sem PNG usa a bandeira ou o escudo
desenhado. Mudou id de time ou jogador: subir `VERSAO_SAVE` em `shared/dez-core.js`.
Os ids de times e modos ficam salvos no aparelho: não renomear à toa.

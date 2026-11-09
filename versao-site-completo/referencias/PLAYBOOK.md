# Playbook: jogo/app Android com Phaser + Capacitor

Como refazer, do zero, um projeto do tipo "Linhas de Nazca: Corrida Alien": um jogo em
JavaScript puro que roda no navegador durante o desenvolvimento e vira um app Android
publicável, com anúncios, compras no app e Firebase.

Este arquivo é a memória técnica do que funcionou. Quem for começar um projeto novo lê este
documento inteiro antes da primeira linha de código: ele traz as decisões, os padrões de
robustez e os detalhes que só aparecem quando o app vai para a Play Store.

## Como usar este documento

- **Ordem de execução:** siga a seção 13, que é a sequência de montagem. As seções 3 a 12
  explicam o porquê de cada peça e trazem o código pronto para copiar.
- **Troque os nomes do projeto antigo.** Os trechos vêm do Linhas de Nazca e carregam nomes
  dele. Escolha um prefixo para o projeto novo logo no começo e aplique em tudo:

  | Do Nazca | No projeto novo |
  |---|---|
  | `window.NAZCA_RELEASE` | `window.<PREFIXO>_RELEASE` |
  | `shared/nazca-core.js` | `shared/<projeto>-core.js` |
  | chaves salvas `nazcagp.*` | `<prefixo>.*` |
  | `com.julio333.NazcaLines` | o `appId` novo |

  O prefixo das chaves salvas **não muda depois**: ele fica gravado no aparelho de quem joga.
- **O código não é pseudocódigo.** É o que está rodando em produção; pode ser copiado como
  está, trocando só os nomes acima.
- **Versões que este playbook pressupõe** (em setembro de 2026, funcionando juntas):

  | Peça | Versão |
  |---|---|
  | Node.js | LTS |
  | JDK | 21 |
  | Android SDK | `compileSdk` 36, `targetSdk` 36, `minSdk` 24 |
  | Capacitor | 8.5.x (`@capacitor/core`, `/cli`, `/android`) |
  | Phaser | 3.80.1, arquivo local em `shared/vendor/` |
  | Plugins nativos | `@capacitor/app`, `/status-bar`, `/splash-screen` |
  | Anúncios | `@capacitor-community/admob` 8.x |
  | Compras | `@revenuecat/purchases-capacitor` 13.x |
  | Avaliação | `@capacitor-community/in-app-review` 8.x |
  | Firebase | `@capacitor-firebase/analytics`, `/crashlytics`, `/remote-config` 8.x (+ `firebase` 12.x) e o plugin Gradle `firebase-crashlytics-gradle` 3.x |
  | Ícones (dev) | `@capacitor/assets` 3.x |

  Versões mais novas provavelmente servem; se alguma quebrar, o playbook continua válido —
  o que muda é o número, não a estrutura.

---

## 1. A escolha da stack

| Camada | Escolha | Por quê |
|---|---|---|
| Jogo | **Phaser 3** (arquivo `.min.js` local, sem npm no runtime) | Desenho, física simples, cenas e entrada de toque prontos. |
| Empacotamento | **Capacitor** (Android) | Põe uma WebView em volta do HTML e dá acesso a plugins nativos. |
| Build | **Nenhum** (sem webpack, sem Vite, sem TypeScript) | O navegador carrega `game.js` direto. Editar e apertar F5 é o ciclo inteiro. |
| Idioma do código | JavaScript ES2020, IIFE, `'use strict'` | Sem transpilação, sem `import`, sem CORS de módulos. |

**Comparação com React Native:** o que no RN é `__DEV__`, `app.json`, Metro e
`react-native-google-mobile-ads`, aqui é uma marca gravada no HTML, `capacitor.config.json`,
um script de cópia de 40 linhas e `@capacitor-community/admob`. A diferença prática é que
**não existe etapa de compilação do JavaScript**: o mesmo arquivo que roda no navegador é o
que vai dentro do app.

**Quando esta stack é a certa:** jogos 2D, apps gráficos, protótipos que precisam virar APK.
**Quando não é:** app com muitas telas de formulário e navegação nativa (aí RN/Flutter ganham).

---

## 2. Estrutura de pastas

```
projeto/
  phaser/            # a versão que vira app
    index.html       # única página; CSS da moldura, fontes, splash
    game.js          # todo o jogo (cenas, UI, anúncios, compras, analytics)
    icons/           # favicon, splash
  shared/            # código e mídia sem engine, usados por qualquer front-end
    nazca-core.js    # regras do jogo puras (pistas, física, IA, recordes)
    i18n/pt.json en.json es.json
    images/ audio/ fonts/ vendor/phaser-3.80.1.min.js
  html/              # front-end alternativo em Canvas puro (mesmo núcleo)
  tools/             # scripts Node/Python de apoio (build_www.js, importadores)
  docs/              # textos da ficha da Play Store, pesquisas
  assets/            # icon.png e splash.png de origem, para gerar os ícones nativos
  android/           # projeto Android gerado pelo Capacitor
  www/               # GERADA a cada build; nunca editar
  serve.py           # servidor local sem cache
  package.json  capacitor.config.json  README.md
```

**Regra de ouro da separação:** `shared/nazca-core.js` não conhece Phaser, não conhece DOM e
não conhece Capacitor. Ele recebe números e devolve números. Isso permitiu manter duas versões
do jogo (Canvas puro em `html/` e Phaser em `phaser/`) com as mesmas regras, e permite testar a
lógica sem abrir tela.

**`www/` é descartável.** É montada por `tools/build_www.js` copiando `phaser/` e `shared/`.
Fica no `.gitignore` junto com `node_modules/`.

---

## 3. Tamanho de tela: o sistema de escala

Este foi o ponto que mais rendeu qualidade percebida. São cinco mecanismos juntos.

### 3.1 Tudo em pixels reais do aparelho (DPR)

```js
const DPR = Math.min(3, window.devicePixelRatio || 1);
const px = (v) => Math.round(v * DPR);
```

O canvas é criado na **resolução física** da tela e exibido no tamanho CSS:

```js
scale: {
  mode: Phaser.Scale.NONE,
  width: Math.round(viewSize().w * DPR),
  height: Math.round(viewSize().h * DPR),
  zoom: 1 / DPR,   // canvas nativo, exibido no tamanho certo
}
```

Resultado: texto e traços nítidos em telas 2x/3x, sem borrão de ampliação. O teto de 3 evita
gastar memória à toa em aparelhos 4x.

**Consequência para todo o código:** nenhum número mágico solto. Toda medida passa por
`px(...)`: `px(74)` de altura de botão, `px(18)` de raio, `size: 16` de fonte (convertido com
`px` dentro do helper `label`).

### 3.2 Coluna em formato de celular

O jogo é feito para retrato. Em tela larga (PC, celular deitado, tablet) ele não estica: ocupa
uma coluna central com proporção de celular e o resto vira moldura.

```js
const PORTRAIT_RATIO = 0.6;           // largura máxima = 60% da altura
function viewSize() {
  const el = document.getElementById('game');
  const h = el.clientHeight || window.innerHeight;
  const w = Math.min(window.innerWidth, Math.round(h * PORTRAIT_RATIO));
  el.style.width = w + 'px';
  return { w, h };
}
window.addEventListener('resize', () => {
  const v = viewSize();
  game.scale.resize(Math.round(v.w * DPR), Math.round(v.h * DPR));
});
```

No Android, `android:screenOrientation="portrait"` no `AndroidManifest.xml` trava a rotação.

### 3.3 Layout relativo dentro das cenas

Nenhuma cena guarda posições fixas. Todas começam com:

```js
const W = this.scale.width, H = this.scale.height;
```

e posicionam por fração de `W`/`H` mais margens em `px()`. As cenas que precisam reagir a
redimensionamento assinam o evento e **cancelam na saída** (senão vaza listener entre cenas):

```js
this.scale.on('resize', onResize);
this.events.once('shutdown', () => this.scale.off('resize', onResize));
```

### 3.4 Texto que se ajusta sozinho

Com três idiomas, o mesmo botão recebe "Correr", "Race" e "Correr" — mas também
"Remover anúncios" e "Quitar los anuncios". O helper de botão encolhe a fonte até caber:

```js
for (let fs = (opts.size || 16) - 1; t.width > w - px(14) && fs >= 9; fs--) t.setFontSize(px(fs));
```

Isso elimina a classe inteira de defeitos "texto vaza do botão em espanhol num celular estreito".

### 3.5 Barras do sistema (o que faltou e depois foi corrigido)

A WebView ocupa a tela toda, inclusive atrás da barra de status e da barra de navegação por
gestos. A correção é CSS, com `viewport-fit=cover` no viewport e `env(safe-area-inset-*)` nos
elementos fixos:

```html
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
```

```css
#game   { position: fixed; top: env(safe-area-inset-top, 0); bottom: env(safe-area-inset-bottom, 0); }
#splash { position: fixed; top: env(safe-area-inset-top, 0); bottom: env(safe-area-inset-bottom, 0); }
```

**Lição:** fazer isso na primeira versão do `index.html`, não depois. Testar num aparelho com
navegação por gestos e num com botões: o recorte de baixo muda.

### 3.6 Como testar tamanhos

Rodar o mesmo roteiro automatizado em 320x568, 390x844 e 1280x800 e olhar as capturas. Os
defeitos que aparecem são sempre os mesmos: rodapé colado no fundo da tela, título com duas
linhas onde só cabia uma, cartão que sai da área visível quando a lista rola.

---

## 4. Robustez a erros: as camadas

O princípio: **nada que falhe fora do jogo pode derrubar o jogo.** Armazenamento, rede, plugin
nativo, loja, arquivo de imagem: tudo é opcional e tem caminho degradado.

### 4.1 Armazenamento sempre protegido

`localStorage` lança exceção em janela anônima, com cookies bloqueados e em WebView com dados
restritos. Nunca é chamado cru:

```js
const loadJson = (key) => {
  try {
    const v = JSON.parse(localStorage.getItem(key) || 'null');
    return v && typeof v === 'object' ? v : {};      // lixo salvo não quebra o jogo
  } catch (e) { return {}; }
};
const saveJson = (key, v) => { try { localStorage.setItem(key, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } };
const settingOn = (key) => { try { return localStorage.getItem(key) !== '0'; } catch (e) { return true; } };
```

Note o padrão: **o `catch` devolve o padrão sensato**, não `null`. Quem chama nunca precisa
verificar. Há mais de vinte blocos `try/catch` no `game.js` e quase todos são isto.

**Chaves são contrato.** `nazcagp.iap.owned`, `nazcagp.stats`, ids de produto, de conquista e de
tábua ficam salvos no aparelho: renomear qualquer um apaga o progresso de quem já joga. O código
diz isso em comentário, exatamente onde a tentação de renomear aparece.

### 4.2 Plugin nativo: existe ou não existe

```js
const NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
const nativePlugin = (name) => (NATIVE && window.Capacitor.Plugins && window.Capacitor.Plugins[name]) || null;
```

Toda integração começa com `const api = nativePlugin('X'); if (!api) return;`. No navegador, o
jogo roda inteiro; no app, ganha o recurso. **Nunca** há um `if (isAndroid)` espalhado pelo
código: há um ponto único por serviço (`admob`, `billing`, `analytics`, `remote`).

Para o Firebase, o ponto único engole até a ausência do método:

```js
function firebaseCall(plugin, method, arg) {
  const plugins = window.Capacitor && window.Capacitor.Plugins, api = plugins && plugins[plugin];
  if (!api || typeof api[method] !== 'function') return Promise.resolve(null);
  try { return Promise.resolve(api[method](arg)).catch(() => null); } catch (e) { return Promise.resolve(null); }
}
```

Isso deixou o jogo publicável **antes** de os plugins do Firebase existirem no projeto: as
chamadas simplesmente não fazem nada.

**O outro lado disso:** o silêncio vale também para o app publicado. O Linhas de Nazca e o
Football Draft foram para a Play Store com o `google-services.json` e com todas as chamadas de
analytics no código, mas sem os plugins `@capacitor-firebase/*` instalados: nenhum erro, nenhum
aviso e o console do Firebase vazio por semanas. Ponto único que engole erro exige uma conferência
explícita antes de publicar (seção 8, "Confere").

### 4.3 Degradação com tela de teste

Sem plugin de cobrança, comprar abre uma cena `purchase` que simula a compra e libera o conteúdo.
Sem AdMob, o "anúncio" é uma cena com contagem regressiva. Assim, **todo o fluxo de monetização é
testável no navegador**, inclusive a oferta que aparece depois do anúncio.

```js
if (billing.api()) return billing.order(id).then(...);                // real
scene.scene.launch('purchase', { product: product(id), done: ... });  // teste
```

### 4.4 Erros viram evento, não tela branca

```js
window.addEventListener('error', (e) => analytics.error(e.error || e.message, 'window'));
window.addEventListener('unhandledrejection', (e) => analytics.error(e.reason, 'promise'));
```

e `analytics.error` manda para o Crashlytics com a origem (`'billing_init'`, `'admob_init'`,
`'window'`). Cada `.catch()` do código passa por ali, com um rótulo dizendo onde foi.

Durante o desenvolvimento, o `index.html` ainda mostra o erro na tela (faixa vermelha com
mensagem e pilha), desligada na versão publicada:

```js
window.onerror = function (message, source, lineno, colno, error) {
  if (window.NAZCA_RELEASE) return false;
  /* ...faixa vermelha com message / lineno / stack... */
};
```

### 4.5 Recursos que podem não carregar

Foto grande baixada sob demanda: se falhar, o jogo segue sem ela e **não tenta de novo na mesma
sessão**.

```js
const onError = (file) => {
  if (file.key !== key) return;
  scene.cache.json.get('real-photos')[fig.id] = null;  // marca como indisponível
  finish(false);
};
scene.load.once('filecomplete-image-' + key, onLoad);
scene.load.on('loaderror', onError);
```

Os dois listeners são removidos no fim (`finish`), sempre, em sucesso ou falha.

### 4.6 Travas de reentrância

Toque duplo, botão apertado duas vezes, anúncio pedido durante outro anúncio: cada serviço tem
`busy`.

```js
buy(scene, id, placement) {
  if (this.busy || this.owns(id)) return Promise.resolve(this.owns(id));
  this.busy = true;
  ...
}
```

E a interface tem `tapOk()`, que ignora o toque se o dedo arrastou (rolagem) ou se começou no
cabeçalho fixo:

```js
tapOk() { return !this.dragMoved && (this.downY == null || this.downY > this.headerH); }
```

### 4.7 Tempo e quadros

Quadro travado não pode "pular" o jogo nem o anúncio:

```js
this.elapsed += Math.min(delta, 100);
```

E o app em segundo plano pausa a corrida e silencia o som:

```js
app.addListener('appStateChange', (state) => {
  if (!state.isActive) game.sound.mute = true;
  else applySoundSetting(game);
});
const onHidden = () => this.pause();   // visibilitychange
```

### 4.8 Idioma com rede de segurança

```js
function t(key, vars) {
  const d = I18N.dicts[I18N.lang], fb = I18N.dicts.pt;
  const str = (d && d.ui[key]) !== undefined ? d.ui[key] : ((fb && fb.ui[key]) !== undefined ? fb.ui[key] : key);
  return vars ? str.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : str;
}
```

Chave faltando num idioma cai no português; chave inexistente aparece como a própria chave
(visível no teste, nunca "undefined" na tela do jogador).

---

## 5. Versão de desenvolvimento x versão publicada

Equivale ao `__DEV__` do React Native. O build de release **grava uma marca no HTML**. Este é o
`tools/build_www.js` inteiro — é o único arquivo de infraestrutura que precisa ser recriado
igual, e tem 30 linhas:

```js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const www = path.join(root, 'www');

fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(www, { recursive: true });
const release = process.argv.includes('--release');
for (const dir of ['phaser', 'shared']) {
  fs.cpSync(path.join(root, dir), path.join(www, dir), { recursive: true });
}
if (release) {
  const page = path.join(www, 'phaser', 'index.html');
  const html = fs.readFileSync(page, 'utf8');
  const tag = '<script src="../shared/vendor/';
  if (!html.includes(tag)) throw new Error('phaser/index.html mudou: não achei onde marcar a versão release');
  fs.writeFileSync(page, html.replace(tag, '<script>window.NAZCA_RELEASE = true;</script>\n  ' + tag));
}
fs.writeFileSync(path.join(www, 'index.html'), `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;height:100%;background:#000}</style>
<script>location.replace('phaser/index.html' + location.search);</script>
</head><body></body></html>
`);

let bytes = 0;
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else bytes += fs.statSync(p).size;
});
walk(www);
console.log(`www/ pronto (${(bytes / 1048576).toFixed(1)} MB, ${release ? 'versão da Play Store: anúncios reais' : 'desenvolvimento: anúncios de teste'})`);
```

O trecho que importa é a marca:

```js
if (release) {
  const tag = '<script src="../shared/vendor/';
  if (!html.includes(tag)) throw new Error('phaser/index.html mudou: não achei onde marcar a versão release');
  fs.writeFileSync(page, html.replace(tag, '<script>window.NAZCA_RELEASE = true;</script>\n  ' + tag));
}
```

e o jogo lê:

```js
const RELEASE = !!window.NAZCA_RELEASE;
const LANGUAGE_PICKER = !RELEASE;           // seletor de idioma só no desenvolvimento
const ADMOB = { testing: !RELEASE, ... };   // anúncios de teste fora da versão publicada
if (!RELEASE) y = this.devSwitch(W / 2, y); // chave que destrava tudo, só no desenvolvimento
```

**Por que gravar no HTML e não num arquivo de configuração:** não há bundler para substituir
constantes, e a marca precisa existir antes de o `game.js` rodar. A troca falha ruidosamente
(`throw`) se o `index.html` mudar de forma inesperada, o que é melhor do que publicar sem a marca.

Regra: **nenhuma constante de publicação deve depender de o humano lembrar de trocar.**

---

## 6. Anúncios (AdMob)

Plugin: `@capacitor-community/admob`. App ID no `AndroidManifest.xml`, blocos no `game.js`.

```js
const ADMOB = {
  testing: !RELEASE,
  rewardedPhoto: 'ca-app-pub-XXXX/YYYY',
  rewardedDiamonds: 'ca-app-pub-XXXX/YYYY',
  interstitial: 'ca-app-pub-XXXX/ZZZZ',
};
```

Com `testing: true`, o plugin troca o bloco pelo de teste do Google: é o que protege a conta de
cliques próprios. Um bloco premiado pode servir a dois lugares; separar só se quiser medir receita
por lugar.

### Política de exibição: fora do código, no Remote Config

Todo número que define *quando* mostrar anúncio é um parâmetro ajustável sem publicar versão:

```js
ad_interstitial_boss: true,       // ao vencer um chefão
ad_interstitial_every: 0,         // a cada N corridas (0 = desligado)
ad_interstitial_gap_sec: 180,     // intervalo mínimo entre dois
ad_interstitial_after_races: 3,   // nenhum nas primeiras N corridas do jogador
ad_offer_every: 2,                // oferta de "remover anúncios" depois do anúncio
ad_diamonds_reward: 50,
ad_diamonds_daily: 5,
```

A decisão vira uma função só:

```js
interstitialDue({ bossWin }) {
  if (adsRemoved() || this.busy) return false;
  if (races <= remote.num('ad_interstitial_after_races')) return false;
  if (Date.now() - last < remote.num('ad_interstitial_gap_sec') * 1000) return false;
  if (bossWin && remote.bool('ad_interstitial_boss')) return true;
  const every = remote.num('ad_interstitial_every');
  return every > 0 && races % every === 0;
}
```

Boas práticas embutidas: quem comprou "remover anúncios" nunca vê; o jogador novo joga várias
corridas antes do primeiro; a música abaixa (`music.hold`) enquanto o anúncio toca.

### Consentimento (UMP)

O plugin traz o SDK de consentimento. O fluxo completo é:

```js
this.ready = a.initialize({})
  .then(() => a.requestConsentInfo())
  .then(remember)                                   // guarda privacyOptionsRequirementStatus
  .then((info) => (info && info.isConsentFormAvailable && info.status === 'REQUIRED'
    ? a.showConsentForm().then(remember) : null))
  .catch((e) => analytics.error(e && (e.message || e), 'admob_init'));
```

E, onde a lei exige, as Configurações ganham um botão que reabre o formulário
(`showPrivacyOptionsForm`): exigência do Google, fácil de esquecer.

No painel do AdMob, fora do código: mensagem de regulamentações europeias (com "Não consentir"
ligado em todos os países), mensagem de estados dos EUA, `app-ads.txt` e cadastro do próprio
celular como dispositivo de teste.

---

## 7. Compras no app (RevenueCat)

Plugin: `@revenuecat/purchases-capacitor`. A chave **pública** do SDK vai no código (é feita para
isso); a secreta, nunca.

### Id interno x SKU da loja

O id usado no código e no que fica salvo raramente é o que se quer na loja. Em vez de renomear
tudo, cada produto carrega os dois:

```js
const PRODUCTS = [
  { id: 'world_6',              sku: 'liberar_mundo',       icon: '🌋', testPrice: 'R$ 7,90' },
  { id: 'bundle_skins_tablets', sku: 'combo',               icon: '🎁', grants: ['all_skins', 'all_tablets'] },
  { id: 'all_skins',            sku: 'liberar_personagens',  icon: '🛸' },
  { id: 'remove_ads',           sku: 'remover_anuncios',     icon: '🚫' },
];
const productBySku = (sku) => PRODUCTS.find((k) => k.sku === sku);
```

A tradução acontece em dois lugares só: ao pedir os produtos (`map(k => k.sku)`) e ao receber uma
transação (`productBySku(tx.productIdentifier)`).

### O que o código precisa fazer certo

1. **Preço vem da loja**, já formatado na moeda do jogador (`sp.priceString`). Enquanto não chega,
   mostrar reticências; sem cobrança (navegador), mostrar o preço de exemplo.
2. **Entregar pelo que a loja diz**, não pelo que o app acha. `grantFrom(customerInfo)` roda na
   inicialização, depois da compra e num listener, o que faz pagamento lento (boleto) e
   reinstalação funcionarem sem código extra.
3. **Pacote que contém outros produtos** libera as partes (`grants`) e some da loja quando o
   jogador já tem qualquer parte (`available`).
4. **Cancelamento não é erro.** Códigos `1` (cancelou) e `20` (pendente) não vão para o
   Crashlytics; o resto vai.
5. **Restaurar compras** é botão obrigatório nas lojas.

### Fora do código

Produtos criados no Play Console com os mesmos SKUs, conta de serviço ligando o RevenueCat ao
Google Play, app enviado ao **teste interno** e e-mail cadastrado em *Testes de licença*. Compra
real só funciona em app instalado pela Play Store; pelo cabo, continua na tela de teste.

---

## 8. Firebase

Três produtos, um ponto de integração (`firebaseCall`), tudo opcional:

- **Analytics:** `analytics.event/screen/userProp`, com os limites do Firebase aplicados no próprio
  helper (nome e parâmetro até 40 caracteres, valor até 100). Cada cena vira um `screen_view`
  automaticamente:

  ```js
  game.events.once('ready', () => game.scene.scenes.forEach((sc) => {
    if (['boot', 'hud', 'ad', 'purchase', 'howto'].includes(sc.scene.key)) return;
    sc.events.on('create', () => analytics.screen(sc.scene.key));
  }));
  ```

- **Crashlytics:** destino de `analytics.error`, com rótulo de origem.
- **Remote Config:** `REMOTE_DEFAULTS` no código é a fonte da verdade; o console só sobrescreve o
  que foi realmente configurado (`res.source === 'remote'`), e os valores ficam guardados no
  aparelho para valerem na abertura seguinte, mesmo sem internet.

**Instalação nativa:** as instruções de Gradle que o console do Firebase mostra
(`build.gradle.kts`, bloco `plugins`) **não se aplicam aqui** — elas supõem um projeto Android
comum, em Kotlin DSL, enquanto o Capacitor usa Groovy e já deixa tudo pronto:
`android/build.gradle` já traz `classpath 'com.google.gms:google-services'`, e
`android/app/build.gradle` aplica o plugin sozinho **se** o arquivo existir. Mas esse plugin
(`google-services`) só lê o arquivo de configuração: **quem envia os dados é o SDK do Firebase, e
ele só entra no app pelos plugins do npm.** Os quatro passos são obrigatórios:

1. `google-services.json` em `android/app/` (na raiz do projeto ele não faz nada);
2. instalar os plugins (o pacote `firebase` é a dependência que eles pedem):

   ```bash
   npm install @capacitor-firebase/analytics @capacitor-firebase/crashlytics @capacitor-firebase/remote-config firebase
   ```

3. **só para o Crashlytics**, o plugin Gradle dele, que o Capacitor não traz. Em
   `android/build.gradle`, no `buildscript { dependencies { } }`, ao lado do `google-services`:

   ```gradle
   classpath 'com.google.firebase:firebase-crashlytics-gradle:3.0.8'
   ```

   e em `android/app/build.gradle`, dentro do mesmo `if` que aplica o `google-services` no fim do
   arquivo (assim o projeto continua compilando sem o `google-services.json`):

   ```gradle
   if (servicesJSON.text) {
       apply plugin: 'com.google.gms.google-services'
       apply plugin: 'com.google.firebase.crashlytics'
   }
   ```

   Sem isso o build quebra ou o Crashlytics não recebe nada; quem não quiser o Crashlytics deixa
   o plugin dele fora do `npm install`;
4. `npm run sync`.

*Confere (antes de todo envio para a loja, não só no primeiro):*

- `android/capacitor.settings.gradle` lista `:capacitor-firebase-analytics` (e os outros dois);
- no celular pelo cabo, ligue o modo de depuração do Analytics e abra o jogo; os eventos aparecem
  em **DebugView** no console do Firebase em segundos:

  ```bash
  adb shell setprop debug.firebase.analytics.app <appId>
  adb logcat -s FA FA-SVC
  ```

  (`setprop debug.firebase.analytics.app .none.` desliga depois);
- no AAB gerado, o SDK está dentro: o arquivo `base/manifest/AndroidManifest.xml` do `.aab` (é um
  zip) contém `FirebaseInitProvider`. Só o `google-services.json` ou só o AdMob não colocam isso lá.

**Limite de projetos:** a conta gratuita permite poucos projetos do Firebase. Dá para pedir aumento
(formulário do Google, resposta em 1 ou 2 dias) ou colocar vários apps no mesmo projeto. No mesmo
projeto, Crashlytics e fluxos do Analytics ficam separados por app, mas os relatórios padrão somam
e os parâmetros do Remote Config são do projeto inteiro.

---

## 8b. Pedido de avaliação (Google Play)

As primeiras avaliações pesam muito na posição do jogo na loja, e quem avalia espontaneamente
quase sempre é quem teve problema. Por isso o jogo **pede** a avaliação num momento bom, usando a
**API oficial de avaliação no app** do Google Play (In-App Review): o cartão de estrelas abre por
cima do jogo e a pessoa avalia sem sair dele, o que rende muito mais avaliações do que mandar
para a loja.

**Regras do Google (seguir à risca):**

- **Não perguntar nada antes** ("Está curtindo?", "Dê 5 estrelas") nem durante o cartão. O
  cartão é chamado direto, sem janela própria na frente.
- **Não ligar a API a um botão.** O Google tem uma cota e às vezes decide não mostrar o cartão;
  um botão que "não faz nada" parece defeito. (Para quem quer avaliar por conta própria, veja o
  item "Avaliar o jogo" nas configurações, mais abaixo.)
- **Nada em troca** (diamantes, vidas, fases): a Play proíbe incentivo e pode remover o app.
- O app **não fica sabendo** se o cartão apareceu nem se a pessoa avaliou; a API só diz que o
  fluxo terminou.

**Nossas regras de quando pedir:**

- Só depois de algumas partidas (padrão: **5 terminadas**), nunca na primeira sessão.
- Só **logo depois de um momento bom** (no Nazca, corrida terminada com estrela), com ~1,8 s
  para o jogador ver o resultado, e nunca por cima de anúncio ou de outra janela.
- Depois de pedir, só volta a pedir **N partidas depois** (padrão: 15), no máximo **4 vezes** na
  vida do jogador. A cota do Google também filtra; o nosso limite evita chamar à toa.
- Os três números ficam no **Remote Config** (seção 8), ajustáveis sem publicar versão nova.

**Instalação:**

```bash
npm install @capacitor-community/in-app-review@8
npm run sync
```

(Usa `com.google.android.play:review`; a versão pode ser fixada em `android/variables.gradle`
com `googleAndroidPlayReviewVersion`. No iOS o mesmo plugin usa o `SKStoreReviewController`.)

**Remote Config** (junto com os outros valores padrão):

```js
const REMOTE_DEFAULTS = {
  rate_after_races: 5,   // primeiro pedido depois de N partidas terminadas
  rate_every_races: 15,  // pedido seguinte só depois de mais N partidas
  rate_max_asks: 4,      // no máximo N pedidos na vida do jogador
  // ...
};
```

**Ponto único e estado** (`<prefixo>.rate` no armazenamento protegido da seção 4.1):

```js
const PLAY_PACKAGE_ID = 'com.julio333.NazcaLines'; // o appId do projeto
const RATE = {
  get afterRaces() { return remote.num('rate_after_races'); },
  get everyRaces() { return remote.num('rate_every_races'); },
  get maxAsks() { return remote.num('rate_max_asks'); },
};
const RATE_KEY = 'nazcagp.rate';
function rateState() {
  let st = null;
  try { st = JSON.parse(localStorage.getItem(RATE_KEY) || 'null'); } catch (e) { /* sem armazenamento */ }
  return Object.assign({ races: 0, nextAt: RATE.afterRaces, asks: 0 }, st || {});
}
const saveRateState = (st) => { try { localStorage.setItem(RATE_KEY, JSON.stringify(st)); } catch (e) { /* sem armazenamento */ } };
function countFinishedRace() {           // chamar no fim de cada partida terminada
  const st = rateState();
  st.races += 1;
  saveRateState(st);
}
const shouldAskRating = () => {
  const st = rateState();
  return !!nativePlugin('InAppReview') && st.asks < RATE.maxAsks && st.races >= st.nextAt;
};
// cartão oficial do Google Play; no navegador (sem o plugin) não faz nada
function askRating() {
  const st = rateState();
  st.asks += 1;
  st.nextAt = st.races + RATE.everyRaces;
  saveRateState(st);
  const api = nativePlugin('InAppReview');
  if (!api || typeof api.requestReview !== 'function') return Promise.resolve(false);
  analytics.event('rate_request');
  return Promise.resolve(api.requestReview()).then(() => true).catch((e) => {
    analytics.event('rate_request_error', { msg: String(e && e.message || e).slice(0, 90) });
    return false;
  });
}
```

**Onde chamar** — `countFinishedRace()` no evento de fim de partida; na tela de resultado:

```js
if (res.stars > 0 && shouldAskRating()) {         // o "momento bom" do seu jogo
  this.time.delayedCall(1800, () => { if (!this.photoModal && !ads.busy) askRating(); });
}
```

**"Avaliar o jogo" nas configurações** (para quem quer avaliar por conta própria; aqui é
permitido abrir a loja, porque não é a API): no Android, `market://` abre direto o app da Play
Store; se nada acontecer em 1,5 s (navegador comum), abre o endereço da web.

```js
function openPlayStore() {
  const web = 'https://play.google.com/store/apps/details?id=' + PLAY_PACKAGE_ID;
  const isAndroid = /Android/i.test(navigator.userAgent);
  if (!isAndroid) return void window.open(web, '_blank');
  let left = false;
  const onHide = () => { left = true; };
  document.addEventListener('visibilitychange', onHide, { once: true });
  window.location.href = 'market://details?id=' + PLAY_PACKAGE_ID;
  setTimeout(() => {
    document.removeEventListener('visibilitychange', onHide);
    if (!left && !document.hidden) window.open(web, '_blank');
  }, 1500);
}
```

Texto do item: `settings.rate` = "Avaliar o jogo" / "Rate the game" / "Valorar el juego".

*Confere:*
- no navegador nada acontece e nada quebra (`shouldAskRating()` é falso sem o plugin);
- o cartão **só aparece em app instalado pela Play Store** (teste interno ou compartilhamento
  interno de apps), com uma conta Google que ainda não avaliou; pelo `adb install` não aparece;
- depois de aparecer uma vez, pode não aparecer de novo por um tempo (cota do Google): é normal;
- no Analytics, `rate_request` conta os pedidos; as avaliações em si aparecem no Play Console.

---

## 9. Vida nativa do app (Capacitor)

Um lugar só, `setupNativeShell(game)`:

- **Barra de status escondida** (`StatusBar.hide()`), tela cheia.
- **Botão voltar do Android** com hierarquia explícita: anúncio, compra e instruções ignoram;
  corrida pausa e retoma; menu minimiza o app (`app.minimizeApp()`); outras telas usam o mesmo
  `goBack()` do botão da própria tela.
- **Splash:** a imagem fica no `index.html` com `z-index` alto e some quando o menu aparece, com um
  mínimo de 900 ms para não piscar.

Plugins usados: `@capacitor/app`, `@capacitor/status-bar`, `@capacitor/splash-screen`.

---

## 10. Build, assinatura e publicação

`package.json`:

```json
"web":     "python serve.py",
"build":   "node tools/build_www.js",
"sync":    "node tools/build_www.js && npx cap sync android",
"android": "node tools/build_www.js && npx cap run android",
"icons":   "npx @capacitor/assets generate --android",
"aab":     "node tools/build_www.js --release && npx cap sync android && cd android && gradlew.bat bundleRelease"
```

**Sempre passar pelo script**, nunca `npx cap run android` direto: o `build_www.js` é o que copia a
versão nova do jogo para dentro do app.

**Assinatura** por arquivo de propriedades, lida pelo Gradle só se existir:

```gradle
def keystorePropsFile = rootProject.file('keystore.properties')
if (keystorePropsFile.exists()) { /* signingConfigs.release ... */ }
```

A chave de upload é criada uma vez. **O caminho do comando é relativo à pasta onde ele é
rodado**, e é isso que decide onde o arquivo vai parar; no Nazca ele acabou em
`android/app/upload-key.keystore`. Para repetir exatamente, rode de dentro de `android/app/`:

```bash
keytool -genkeypair -v -keystore upload-key.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000
```

Com alias `upload`, o `android/keystore.properties` aponta para ela:

```properties
storeFile=upload-key.keystore
storePassword=...
keyAlias=upload
keyPassword=...
```

`storeFile` relativo é resolvido a partir da pasta do módulo (`android/app/`), porque o
`file()` que o lê está no `build.gradle` de lá; caminho absoluto também funciona.

**Os dois arquivos ficam fora do controle de versão** (`.gitignore`: `*.keystore`, `*.jks`,
`android/keystore.properties`), porque o `keystore.properties` guarda as senhas em texto puro.
A chave precisa de uma cópia de segurança fora da pasta do projeto: perdê-la impede atualizar
o app para sempre, e só resta publicar um app novo.

**Saídas:**

- `android/app/build/outputs/bundle/release/app-release.aab` → Play Store
- `android/app/build/outputs/apk/debug/app-debug.apk` → teste manual

A cada envio, subir `versionCode` (inteiro) e `versionName` em `android/app/build.gradle`.

---

## 11. Como testar

1. **Navegador, o tempo todo:** `python serve.py` (sem cache) em `http://localhost:8765/phaser/`.
   Celular na mesma rede abre pelo IP do PC.
2. **Roteiro automatizado:** um driver por CDP (Chrome headless, cerca de 80 linhas, sem
   dependências) que abre a página, roda passos (`eval`, toque, arrasto, captura) e imprime o
   estado do jogo. Com ele dá para jogar uma corrida inteira em piloto automático, medir tempos,
   tirar capturas em vários tamanhos de tela, simular o idioma do aparelho (`acceptLanguage`) e
   conferir que uma tela abriu sem exceção.
3. **`?debug`** liga o log de eventos de analytics no console e a chave DEV.
4. **No aparelho:** `npm run android` com depuração USB; `adb logcat` para erros nativos.

O driver é um investimento pequeno que paga em toda mudança de interface: ele pega regressão de
layout que passa despercebida no olho.

---

## 12. Convenções de código que valeram a pena

- **Um arquivo grande e organizado** (`game.js`, cerca de 7 mil linhas) com seções marcadas por
  comentários. Sem bundler, arquivo único evita problema de ordem de scripts.
- **Comentário explica o porquê, não o quê.** `// 1 = cancelou, 20 = pagamento pendente`,
  `// um quadro travado não "pula" o anúncio`, `// os ids ficam salvos: não renomear`.
- **Helpers de UI** (`label`, `button`, `panel`) usados por todas as telas: mudança de estilo
  acontece num lugar só.
- **Três idiomas ao mesmo tempo.** Texto novo entra em `pt.json`, `en.json` e `es.json` na mesma
  edição; nunca "depois eu traduzo".
- **Nada de dependência de CDN.** Phaser e fontes ficam em `shared/vendor` e `shared/fonts`: o app
  funciona sem internet e não quebra se um CDN sair do ar.
- **Ids estáveis** para tudo que é salvo; renomear é migração, não renomeação.

---

## 13. Sequência para começar um projeto novo

**Pré-requisitos na máquina:** Node.js LTS, JDK 21, Android SDK e Python 3. O Android Studio
não é necessário: o SDK pode vir do pacote *command line tools* (`sdkmanager "platform-tools"
"platforms;android-36" "build-tools;36.0.0"`), com `ANDROID_HOME` e `JAVA_HOME` definidos.

Cada passo traz como conferir que deu certo antes de seguir para o próximo.

1. **Projeto e dependências:**

   ```bash
   npm init -y
   npm install @capacitor/core @capacitor/cli @capacitor/android
   npm install @capacitor/app @capacitor/status-bar @capacitor/splash-screen
   npm install --save-dev @capacitor/assets
   ```

   *Confere:* `node -e "require('@capacitor/core')"` não dá erro.

2. **`phaser/index.html`** já com `viewport-fit=cover`, `env(safe-area-inset-*)` nos elementos
   fixos, `overflow:hidden`, `touch-action:none`, a fonte local e a faixa de erro de
   desenvolvimento (seções 3.5 e 4.4).
   *Confere:* abre no navegador com fundo certo e sem erro no console.

3. **`shared/`** com o Phaser local (`shared/vendor/phaser-3.80.1.min.js`), o núcleo de regras
   puras e `i18n/pt.json en.json es.json`, mesmo que com poucas chaves.
   *Confere:* `node --check shared/<projeto>-core.js`.

4. **`tools/build_www.js`** (o código completo está na seção 5) e os scripts do `package.json`
   (seção 10).
   *Confere:* `node tools/build_www.js` imprime `www/ pronto (X MB, desenvolvimento: anúncios
   de teste)` e a pasta `www/` aparece.

5. **`npx cap init "<Nome>" <appId> --web-dir=www`** com o `appId` definitivo: mudar depois
   significa app novo na loja, sem os usuários do antigo.
   *Confere:* `capacitor.config.json` criado com o `appId` certo.

6. **`npx cap add android`**; no `AndroidManifest.xml`, acrescentar
   `android:screenOrientation="portrait"` na `activity` e, quando houver anúncios, o
   `meta-data` com o App ID do AdMob.
   *Confere:* `npm run android` instala e abre no celular com depuração USB ligada.

7. **O jogo.** Monetização, Firebase, pedido de avaliação e loja entram por último, cada um atrás
   do seu ponto único (seções 6 a 8b) e com caminho degradado, para o jogo seguir rodando no navegador.
   *Confere:* tudo funciona com `python serve.py`, sem nenhum plugin nativo presente.

   O Firebase é um passo à parte, porque o ponto único esconde a falta dele: crie o app no console,
   ponha o `google-services.json` em `android/app/`, instale os plugins `@capacitor-firebase/*`, o
   plugin Gradle do Crashlytics e rode `npm run sync` (seção 8).
   *Confere:* os eventos aparecem no DebugView do Firebase com o celular no cabo (seção 8).

8. **Antes de publicar:** ícones (`npm run icons`), política de privacidade publicada, ficha da
   loja nos três idiomas, chave de assinatura (seção 10) e envio ao teste interno.
   *Confere:* `npm run aab` gera `android/app/build/outputs/bundle/release/app-release.aab`, e
   o arquivo está assinado (`jarsigner -verify` responde `jar verified`) e traz o Firebase
   (`FirebaseInitProvider` no manifesto do `.aab`, seção 8).

---

## 13b. Gravável desde o primeiro dia

Os vídeos de divulgação são gravados pelo `divulgacao-kit` (pasta ao lado deste playbook), que
roda o jogo num Chrome invisível e avança o relógio quadro a quadro. Para um jogo novo ficar
gravável sem trabalho extra:

- **Exponha o jogo em `window`** (`window.<prefixo>Game = game`) e o núcleo de regras
  (`window.<Projeto>Core`). O Nazca já faz isso, e é o que o adaptador usa.
- **Toda fase deve poder ser aberta direto** por `scene.start('<cena>', { ...parâmetros })`,
  sem depender de clique no menu.
- **O estado da partida fica legível:** estado (contagem, correndo, terminou), posição do
  jogador, tempo. É o que vira os eventos de corte (largada, chegada, saída de pista).
- **Nada de `Date.now()` na lógica de jogo:** use o `delta` do quadro. Com relógio controlado,
  tudo o que depende de tempo real sai errado na gravação.
- **Sorteio só por `Math.random`:** o gravador semeia ele, e a mesma tomada sai igual em todos os
  idiomas.

Com isso, o adaptador (`apps/<app>/adaptador.js` no kit) tem umas 60 linhas copiadas do Nazca.

---

## 14. Armadilhas já pagas (não repetir)

- **Barras do sistema:** sem `viewport-fit=cover` e `safe-area-inset`, a interface fica debaixo da
  barra de status e da barra de gestos. Resolver no primeiro dia.
- **`google-services.json` na raiz** não faz nada: o lugar é `android/app/`.
- **`google-services.json` sem os plugins `@capacitor-firebase/*`** também não faz nada, e sem
  erro: o app compila, publica e o console do Firebase fica vazio. Aconteceu no Linhas de Nazca e
  no Football Draft (descoberto em outubro de 2026). Conferir no DebugView antes de publicar.
- **SKU da loja não é o id interno.** Planejar o mapeamento antes de criar os produtos.
- **Anúncio real em teste bloqueia a conta.** A troca teste/real precisa ser automática.
- **Espaço em disco:** o Gradle guarda vários GB em `~/.gradle/caches`, uma pasta por versão. As
  antigas podem ser apagadas, porque são recriadas sozinhas.
- **`npx cap run android` sem o build** instala a versão anterior do jogo e faz perder tempo
  procurando defeito que já estava corrigido.
- **Renomear id salvo** apaga progresso de quem já joga.
- **Um projeto do Firebase por app** esbarra no limite da conta gratuita mais cedo do que parece.

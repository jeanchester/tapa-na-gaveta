# Versão para vídeo (Phaser/Canvas)

Réplica do app React Native (`app/index.tsx`) só para gravar vídeos de divulgação com o
`divulgacao-kit` (app `show-milhao`). Mesmas telas, textos, cores, medidas, sons e regras; **sem
anúncios, compras, Firebase nem pedido de avaliação** (fica como o app com anúncios removidos e sem
anúncio premiado disponível). Não vai para a loja.

- Rodar: `python video/serve.py` e abrir http://127.0.0.1:8766/video/ (usa as imagens, sons e
  perguntas direto de `app/`, sem cópia).
- `dados.js` é GERADO de `app/index.tsx`: `python video/tools/extrair_dados.py` depois de mudar
  escudos, estádios, sons, ligas ou nomes de times no app.
- Fontes: Roboto e os ícones Ionicons/MaterialCommunityIcons em `fonts/`; emojis como imagens da
  Noto Emoji em `emoji/` (acrescente o PNG em `emoji/` e o código em `EMOJIS_USADOS` se o app ganhar
  um emoji novo).
- Automação: `window.SMF` — `alvos()` lista os ids tocáveis da tela, `tocar(id)`, `rolar(id, px)`,
  `forcarPerguntas([ids])`, `S` (estado). O adaptador do kit usa isso para rodar roteiros de toques.
- Se o app original mudar de visual, atualize `game.js` na mesma função da tela (telaHome,
  telaLojaEstadios, telaLojaArbitragem, telaJogo): as medidas estão em dp, iguais ao StyleSheet.

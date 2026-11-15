# Motion Launcher real — Android TV / HY300por

Este é o APK do Motion Launcher verdadeiro, com a interface cinematográfica React do projeto. Não é o launcher provisório baseado em TV Launcher, que usava outro pacote Android.

## Componentes
- UI: apps/tv-preview e packages/motion-ui
- APK verdadeiro: apps/motion-android (pacote pro.creativezone.motionlauncher)
- Launcher antigo/arquivado: apps/projector-launcher, não utilizar para publicar o Motion Launcher
- A tela inicial Android (HOME) é um invólucro Android com WebView, não um port completamente nativo Kotlin.
- App lista e abre os aplicativos instalados por uma ponte JavaScript nativa controlada.
- Ajustes de projeção são abertos no firmware HTC original (action.htcsettings.prjsettings), sem alterar parâmetros por ADB.
- O cache da interface mantém uma cópia da prévia. Catálogos online requerem internet.
- Wallpapers rotacionam a cada 30 segundos por padrão; o intervalo pode ser modificado em Ajustes.

## Compilação reproduzível
A partir da raiz do repositório:
1. npm install --no-audit --no-fund
2. npm run typecheck && npm test -- --run
3. npm run build:tv
4. node apps/motion-android/scripts/prepare-snapshot.cjs
5. cd apps/motion-android && ./gradlew :app:assembleDebug

A release assinada requer variáveis de ambiente SIGNING_STORE_FILE, SIGNING_STORE_PASSWORD, SIGNING_KEY_ALIAS e SIGNING_KEY_PASSWORD. Nunca envie a chave privada ao GitHub. Uma APK debug não atualiza uma instalação release assinada.

O snapshot converte CSS moderno para o WebView 83 do HY300por; sua geração é obrigatória antes da build Android. O launcher HTC original do firmware deve continuar instalado para recuperação.

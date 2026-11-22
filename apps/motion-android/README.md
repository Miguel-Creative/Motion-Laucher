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

## Fones de ouvido Bluetooth (Android)

No Motion Launcher 1.0.35 ou superior: **Ajustes → Áudio e Mídia → Conectar fone Bluetooth → Procurar fones**. O botão usa o bridge nativo `MotionNative.openBluetoothAudioSettings()` para abrir as configurações oficiais de Bluetooth do projetor, sem pedir permissões de localização, scan ou API privada. Ative o modo de pareamento no fone, escolha-o na lista do Android e confirme a conexão.

Quando o firmware não reconhecer a ação direta, o app tenta Configurações de rede e, por último, Configurações gerais. O botão não promete áudio A2DP se o hardware/firmware do projetor não oferecer o perfil de saída Bluetooth. O app não acessa chaves de pareamento. Esta alteração **exige atualizar o APK**; atualizar somente o site não adiciona o método do bridge à instalação antiga.

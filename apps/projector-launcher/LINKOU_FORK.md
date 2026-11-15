# Linkou Home HY300 — fonte editavel

Derivado de wiiguy/lightweight_androidtv_launcher, commit upstream 7a7fe0d (licenca GPL-3.0-or-later).
Versao inicial Linkou 1.6.2-linkou.1. Mantida a licenca GPL original e as atribuicoes.

Mudancas:
- Pacote Android independente: pro.creativezone.hy300launcher
- Titulo: Linkou Home HY300
- Paleta escura com detalhes cobre/laranja
- Variante F-Droid sem WorkManager/auto-update para reduzir dependencias e consumo.

Compativel no projeto com Android SDK 21+; alvo HY300por (Android 11, armeabi-v7a). O APK release nao inclui o agente Linkou ou qualquer processo IA no projetor.

## Build na VPS
Requisitos: JDK17, Android SDK platform 34, build-tools 34.0.0, Gradle 8.5.
Execute ./gradlew assembleFdroidRelease apos configurar ANDROID_HOME.
Use assinatura de release propria, nunca inclua chaves no Git.

## Reversao
No Samsung/Termux, via Linkou Agent Android:
bash ~/linkou-hy300por.sh home-original
bash ~/linkou-hy300por.sh home

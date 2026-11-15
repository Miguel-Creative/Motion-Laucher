# Orçamento de desempenho e proteção do hardware

## Aparelho-alvo
HY300por, Android 11, ARMv7 32-bit, RAM física ~960 MiB e ZRAM ativa ~845 MiB. A ZRAM é RAM comprimida, não nova memória física.

## Orçamentos iniciais (metas, não medições)
- Launcher em perfil Lite: **PSS em repouso ≤ 50 MiB**; ideal ≤ 35 MiB.
- Nenhum decoder de vídeo ou webview sempre ativo no projetor.
- Primeira tela pronta em ≤ 2 segundos em hardware limitado, a ser medido.
- Wallpape​r em Lite: JPEG/WebP, long edge ≤1280 px, downsampling por resolução, um bitmap visível por vez e preload apenas do próximo se houver folga.
- Cache de wallpapers em disco 100 MiB por padrão, configurável e com política LRU; cache de RAM restrito à miniatura mais próxima.
- Pré-carregamento e animação só se o dispositivo não apresentar pressão de memória; respeitar Battery Saver e modo offline.
- Rotação de fundo ajustável pelo usuário; OFF por padrão em Lite. Evitar chamadas de API em loop e sync permanente.
- Não mexer na partição de sistema, swap no armazenamento nem kernel; priorizar medição e remoções reversíveis.

## Métricas por build
`adb shell dumpsys meminfo <pacote>` (PSS), `dumpsys gfxinfo` (jank), `top`, `/proc/meminfo`, inicialização fria, tempo entre teclas, temperatura e estabilidade 20 minutos. Testar HDR/codec/HDMI só onde pertinente.

A compactação do APK (R8, shrinkResources, WebP) diminui **tamanho no disco**, mas não garante menor RAM. Medir depois de compilar e executar.

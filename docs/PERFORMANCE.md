# Desempenho e HY300por

HY300por: Android 11, arquitetura `armeabi-v7a` 32 bits, RAM física aproximada de 960 MiB; ZRAM já ativa (~845 MiB no diagnóstico anterior), **não é RAM física adicional**.

## Metas (não medições)
- Launcher Android em perfil Leve: PSS em repouso ≤ 50 MiB, ideal ≤ 35 MiB; medir no dispositivo.
- HOME pronta em até 2 segundos como objetivo de otimização, não promessa.
- Wallpaper estático em 1280x720 ou menor, cache LRU e baixa quantidade de bitmaps carregados.
- Evitar WebView, React, Node.js, video wallpaper, blur contínuo e serviços de IA residentes no projetor.
- Animações de 150–250ms apenas em eventos de usuário; desligar sob pressão de memória ou reduzir movimento.
- Não modificar swap/kernel ou desativar componentes críticos sem ensaio, backup e caminho de retorno.

## Medição
`adb shell dumpsys meminfo <pacote>`, `dumpsys gfxinfo`, tempo de inicialização, `/proc/meminfo`, RAM/ZRAM, CPU, queda de quadros e estabilidade sob reprodução. Repetir testes antes/depois no mesmo estado do aparelho.

Os builds web servem para revisar layout e funcionalidades do PWA. **Compactação de APK ≠ otimização de RAM.**

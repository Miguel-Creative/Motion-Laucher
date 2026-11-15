# Linkou × Projetor HY300por — Wi-Fi / ADB

Este pack usa o **Linkou Agent no Samsung (Termux)** como ponte para ADB Wi-Fi no projetor HY300por. Nao ha daemon Linkou residente no projetor.

## Dados de compatibilidade
- Modelo: HY300por; Android 11, API 30, CPU `armeabi-v7a` (32 bits)
- RAM fisica: ~960908 kB; ZRAM ativa ~864812 kB (~845 MiB), **nao e RAM fisica extra**
- Wi-Fi/ADB local: `192.168.77.4:5555` (IP pode mudar pelo DHCP).
- Linkou Android agent: smartphone Samsung. ADB depende do celular online e autorizacao do projetor.
- Launcher OEM: `com.htc.htclauncherhighenglishd08/com.htc.activity.HomeActivity`
- Launcher open source em desenvolvimento: `pro.creativezone.hy300launcher/com.tvlauncher.MainActivity`
- Telemetria OEM `com.htc.eventuploadservice`: desativada por usuario em 2026-11-15, reversivel.
- **Nunca** desative SystemUI, Play Services, WebView, rede, componentes de atualizacao OTA e video sem investigacao.

## Snapshot e rollback
Snapshot antes das alteracoes:
- Smartphone: `~/hy300por-audit-20261115/`
- Backup VPS: `/home/linkou/backups/hy300por/2026-11-15/`
- SHA256SUMS calculados no telefone.

Para reverter o servico de eventos:
```bash
bash ~/linkou-hy300por.sh restore-telemetry
```
Para voltar ao launcher de fabrica:
```bash
bash ~/linkou-hy300por.sh home-original
bash ~/linkou-hy300por.sh home
```
O APK do launcher do fabricante foi preservado. Nada foi apagado de `/system`.

## Comandos operacionais
No Samsung, dentro do Termux:
```bash
bash ~/linkou-hy300por.sh status
bash ~/linkou-hy300por.sh memory
bash ~/linkou-hy300por.sh apps
bash ~/linkou-hy300por.sh home
bash ~/linkou-hy300por.sh back
bash ~/linkou-hy300por.sh up
bash ~/linkou-hy300por.sh down
bash ~/linkou-hy300por.sh left
bash ~/linkou-hy300por.sh right
bash ~/linkou-hy300por.sh ok
bash ~/linkou-hy300por.sh volume-up
bash ~/linkou-hy300por.sh volume-down
bash ~/linkou-hy300por.sh mute
bash ~/linkou-hy300por.sh play-pause
bash ~/linkou-hy300por.sh launch com.netflix.mediaclient
bash ~/linkou-hy300por.sh open-settings
bash ~/linkou-hy300por.sh inventory
```
Os comandos podem ser acionados atraves do plugin Linkou MCP Remoto com dispositivo `Android` e ferramenta `execute_command`.

## Segurança e confiabilidade
- ADB 5555 somente na rede Wi-Fi confiavel, sem port forwarding e sem exposicao publica.
- Evite deixar depuracao ativa permanentemente apos sessoes de manutencao, conforme sua necessidade de controle remoto.
- Nao use `pm uninstall --user 0` em pacotes de sistema sem snapshot e rollback testado.
- Nao altere tamanho da ZRAM ou crie swap no flash com esse hardware sem benchmark.
- Nao use cron/monitoramento agressivo no projetor; consultas sob demanda no celular.
- Este script e apoio operacional e nao substitui um agente embutido no projetor.
- Licenca do launcher base: GPL-3.0-or-later, preservada no subprojeto de codigo-fonte.

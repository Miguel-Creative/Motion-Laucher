# Comandos ADB para HY300por (uso local e reversível)

O script `controls.sh` é usado no **Termux do celular**, com ADB instalado e autorizado na rede, não na VPS. Configurar IP do projetor se mudar:

```bash
export HY300_ADB_TARGET=192.168.77.4:5555
bash tools/hy300por-adb/controls.sh status
bash tools/hy300por-adb/controls.sh memory
bash tools/hy300por-adb/controls.sh apps
bash tools/hy300por-adb/controls.sh inventory
```

Também oferece botões de controle, capturas, `home-original` e restauração do serviço `com.htc.eventuploadservice`. Preservar snapshots locais, confirmar o dispositivo ADB autorizado antes de qualquer alteração. Sem root e sem remoção de firmware.

O arquivo `skill.json` anteriormente criado para o executor Linkou foi **intencionalmente excluído** deste projeto: o Motion Laucher não depende da Linkou para funcionar.

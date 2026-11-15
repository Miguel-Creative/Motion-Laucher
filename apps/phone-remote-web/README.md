# CreativeScreen Remote — MVP funcional no celular
Servidor Node.js sem dependências externas, escutando **somente 127.0.0.1:8765** no Termux do Samsung; com ADB Wi-Fi autorizado até o projetor. Nenhum agente pesado roda no HY300por.

## Executar
```bash
pkg install nodejs android-tools
adb connect 192.168.77.4:5555
node apps/phone-remote-web/server.mjs
```
Abra no **mesmo celular**: http://127.0.0.1:8765

Disponível agora: D-pad, HOME, voltar, menu, volume, mídia, abrir configurações, teclado ASCII e gestos/tap na tela por ADB.

**Limitações intencionais:** o touchpad emula gestos, não é cursor de mouse físico. Unicode/PT-BR completo precisa de um IME Android compatível. O projeto final prevê aplicativo Android nativo, Bluetooth HID e gerenciamento de apps; este protótipo já permite uso real sem instalar nada no projetor.

Para IP variável de rede: `CREATIVE_ADB_TARGET=192.168.1.50:5555 node server.mjs`. Não abrir porta 8765 para rede nem expor ADB 5555 à Internet. Apenas comandos restritos são aceitos.

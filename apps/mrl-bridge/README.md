# Ponte local experimental do MRL (sem VPS)
Este servidor leve roda **somente no celular Android, via Termux**, em `127.0.0.1:8765`, e envia comandos para um dispositivo autorizado por ADB Wi-Fi. Não roda no projetor, não é um serviço de nuvem, e **a PWA principal ainda não o utiliza diretamente**.

```bash
pkg install nodejs android-tools
adb connect 192.168.77.4:5555  # use o IP atual do seu aparelho
MRL_ADB_TARGET=192.168.77.4:5555 node apps/mrl-bridge/server.mjs
```
Abra `http://127.0.0.1:8765` no navegador do **mesmo celular** para usar esta interface experimental do bridge (distinta da PWA). A PWA independente é compilada em `apps/mrl-pwa` e utiliza simulação por enquanto.

**Limites:** teclado simples ASCII, gestos como `adb input tap/swipe` e sem mouse HID real. Servidor só aceita ações pré-aprovadas e não tem terminal arbitrário. Mantenha a porta 5555 restrita à rede confiável, sem port-forwarding. Produção futura deverá ter pareamento/autenticação local.

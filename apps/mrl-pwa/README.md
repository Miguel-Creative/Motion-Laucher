# Motion Laucher Remoto — MRL

**PWA independente para celular.** Design próprio, abas Controle, Mouse, Teclado, Apps, Arquivos, Automações, Administração e Ajustes. Reutiliza somente os componentes de design e o modelo de demonstração do `packages/motion-ui`, não a homepage da TV.

```bash
npm install
npm run dev:mrl
npm run build:mrl
```

Execução local em `http://localhost:5174` e build estático em `dist/mrl-pwa/`. Para instalação PWA distribuída, hospede o build sob HTTPS com fallback de navegação para `index.html`. Manifest e service worker são gerados pela compilação, sem VPS.

**Segurança:** a interface atualmente usa adapter de **demonstração** e não envia ADB/HID real. Uma PWA comum não possui privilégios para comandos Android ou cursor HID; a etapa seguinte é integrar uma ponte Android local autorizada, com autenticação, pareamento e confirmação de ações destrutivas. Não exponha portas ADB na Internet.

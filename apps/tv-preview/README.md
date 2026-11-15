# Prévia de design para TV (Motion Laucher)

Esta é a interface **web** separada do **launcher Android nativo**, que fica em `../projector-launcher`. O protótipo demonstra experiência visual, biblioteca, wallpapers e 23 categorias de ajustes, mas não é um APK HOME.

```bash
npm install
npm run dev:tv
npm run build:tv
```

Prévia em `http://localhost:5173`. Compilação estática em `dist/tv-preview/`. Recomendado 1280×720 e navegação por setas/Enter/Escape. A HOME deve caber em uma tela 16:9 sem carrosséis inferiores. Não apresenta botões remotos do MRL.

A UI, os catálogos e os controles de sistema são demonstrativos; não executam ADB nem iniciam aplicativos Android reais.

# Arquitetura — Motion Laucher e MRL

## Limites dos dois produtos
**Motion Laucher (projetor/TV):** Android nativo, app HOME, interface 16:9 e wallpaper nítido + atalhos de apps. O protótipo visual em `apps/tv-preview` permite trabalhar a arte sem instalar React/WebView no aparelho de 1 GB de RAM.

**Motion Laucher Remoto (celular):** PWA independente em `apps/mrl-pwa` com abas Controle, Mouse, Teclado, Apps, Arquivos, Automações, Admin e Ajustes. Não reutiliza a homepage da TV, apenas componentes de design e estados demonstrativos. A PWA **não tem poderes ADB/HID** sozinha.

**Ponte local opcional:** um aplicativo Android com permissões explícitas (futuro) ou ADB autorizado pelo Termux no celular (experimento) comunicará comandos pela LAN. O bridge experimental atual é em localhost, **não** é backend remoto/produção nem deve ter porta exposta na Internet.

## Pastas
```text
apps/
  projector-launcher/   # Kotlin/Java, launcher real do Android
  tv-preview/           # Build web independente, demonstrativo
  mrl-pwa/              # Build PWA independente para smartphone
  mrl-bridge/           # Bridge ADB no celular, experimental/opcional
packages/
  motion-ui/src/        # Componentes, temas, imagens e demos compartilhados
tools/
  hy300por-adb/         # Diagnóstico/manutenção local, reversível
upstream/               # Projetos de referência em submódulos Git
```

## Compilação e hospedagem
- `npm run build:tv`: produz `dist/tv-preview/` com a prévia da TV.
- `npm run build:mrl`: produz `dist/mrl-pwa/` com PWA instalável sob HTTPS.
- `apps/projector-launcher/./gradlew assembleFdroidRelease`: APK Android independente da web.
- GitHub Actions faz builds e publica artefatos por execução; um servidor VPS não é necessário.
- A integração futura portará o layout da TV para Android nativo, respeitando licenças e comportamento HOME.

## Segurança e limites
- Pareamento explícito, chaves/segredos somente locais, sem senha pública ou porta ADB exposta.
- Ações administrativas potencialmente destrutivas requerem confirmação, snapshot e restauração.
- Apps de sistema críticos e firmware intactos até avaliação específica.
- APIs externas opcionais e obras protegidas jamais empacotadas sem autorização.
- UI de demonstração nunca deve indicar falsamente que controlou Android real.
- Arquivos gerados e node_modules ficam fora do Git e da VPS.

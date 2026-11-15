# Motion Laucher 🎮📺

Launcher Android para projetores/TV Box com companion **Motion Laucher Remoto (MRL)** para celular. Código-fonte aberto, sem dependência de VPS ou Linkou para execução. Idioma da interface: **português brasileiro**.

## Estrutura independente
| Componente | Pasta | Estado atual |
|---|---|---|
| **Launcher Android nativo** | [apps/projector-launcher](apps/projector-launcher) | Base leve Kotlin/Java compilável (derivada do TV Launcher GPL); interface gamer do protótipo **ainda não portada** para Android |
| **Prévia TV / tema gamer** | [apps/tv-preview](apps/tv-preview) | Aplicação web própria, viewport 16:9, HOME de tela única, biblioteca, wallpapers, ajustes |
| **MRL — PWA** | [apps/mrl-pwa](apps/mrl-pwa) | Aplicação separada, interface mobile e service worker para uso offline da interface; controles Android **ainda simulados** |
| **Componentes compartilhados** | [packages/motion-ui](packages/motion-ui) | Tema, artes, componentes visuais, dados de demonstração e motor de preferências |
| **Ponte local ADB experimental** | [apps/mrl-bridge](apps/mrl-bridge) | Servidor opcional executado **no celular** (localhost); ainda não integrado ao PWA final |
| **Ferramentas de administração** | [tools/hy300por-adb](tools/hy300por-adb) | Scripts locais para ADB Wi-Fi com autorização; sem root |
| **Biblioteca de referências** | [upstream](upstream) | Submódulos Git fixados; **não** são incorporados automaticamente aos binários |

O controle do projetor pela Linkou pode ser usado para tarefas de desenvolvimento, mas **Linkou não é uma dependência deste projeto**. Não há backend VPS obrigatório.

## Desenvolvimento (Node.js >=22)
```bash
npm install
npm run dev:tv       # prévia TV em localhost:5173
npm run dev:mrl      # MRL em localhost:5174 (separado da TV)
npm run typecheck
npm test
npm run build:web    # dist/tv-preview e dist/mrl-pwa
```

Cada build gera um frontend independente. O MRL precisa de HTTPS (ou localhost) para instalação PWA. Para disponibilizar rotas client-side em produção, configure fallback de navegação para `index.html` no provedor estático.

## Launcher Android
```bash
cd apps/projector-launcher
./gradlew assembleFdroidRelease
```
Exige JDK/Android SDK e uma assinatura adequada para distribuição/atualizações. A compilação é feita opcionalmente no GitHub Actions; não é necessário manter SDK, clones ou processos em uma VPS. Não substitua o launcher OEM sem testar a recuperação.

## Design
- HOME de TV em tela única, wallpaper luminoso sem sobreposição preta excessiva, dock compacto e navegação por controle físico.
- Catálogos de **Jogos, Filmes, Séries, Animes** e outras categorias nas páginas Biblioteca e Wallpapers.
- MRL é um aplicativo **distinto**, com teclado, mouse/touchpad, controles e ferramentas administrativas.
- Perfis Leve, Equilibrado e Cinematográfico para adequar animações e imagens ao aparelho.
- Acessos a IMDB/TMDB/RAWG/IGDB/SteamGridDB só por integrações oficiais e com credenciais e direitos adequados; dados atuais explicitamente demonstrativos.

## Documentação
- [Arquitetura e builds](docs/ARCHITECTURE.md)
- [Plano de integração](docs/INTEGRATION_PLAN.md)
- [Licenças e fontes externas](docs/UPSTREAMS_AND_LICENSES.md)
- [Desempenho do HY300por](docs/PERFORMANCE.md)
- [Design visual](design/MOTION_DESIGN_SPEC.md)

Este repositório substitui a organização anterior chamada CreativeScreen. O repositório de exportação `motion-laucher-studio` permanece como arquivo de segurança, mas **não é necessário para compilar ou executar** os aplicativos deste repositório.

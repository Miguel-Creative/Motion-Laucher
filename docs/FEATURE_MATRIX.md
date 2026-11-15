# Matriz de funcionalidades do Motion Laucher

| Recurso | TV Preview | Android Nativo | MRL PWA |
|---|---|---|---|
| HOME 16:9 com wallpaper e favoritos | Implementado como demonstração | Base leve (UI gamer pendente) | Não se aplica |
| Biblioteca, Jogos, Filmes, Séries, Animes | Simulação com imagens locais | Port pendente | Gerenciamento remoto em demonstração |
| Animações e perfis de desempenho | Protótipo web | Port/benchmark pendente | Interface mobile própria |
| Configurações avançadas (23 grupos) | Simulação persistida | Apenas ajustes da base existente | Subconjunto e painel de administração demo |
| Wallpaper automático/categorias | Simulação web | Motor simples legado; integração pendente | Personalização demo |
| Controle direcional/volume/mídia | Controle físico por DPAD no navegador | Sistema Android | Demonstração em tela mobile |
| Teclado Unicode/mouse HID | Não se aplica | A integrar | UI demo; requer bridge e IME real |
| Inventário, arquivos, instalação de APK | Não se aplica | Admin externo com ADB autorizado | UI demo sem ações reais |
| Cache offline | Opcional estático | Native Android | Worker PWA gerado no build |
| Independência de VPS | Sim | Sim | Sim |

Um recurso só é considerado plenamente integrado após build, teste no dispositivo e validação de comportamento. O código-fonte externo em submódulo **não equivale a uma integração funcional**.

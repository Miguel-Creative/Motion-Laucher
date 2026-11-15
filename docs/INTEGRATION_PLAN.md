# Integração: etapas técnicas e limites

## Etapa concluída — separação dos frontends
- Exportação web migrada para `packages/motion-ui` (componentes/dados/arquivos), com dois builds independentes: `apps/tv-preview` e `apps/mrl-pwa`.
- HOME da TV restrita a uma tela 16:9, sem fileiras permanentes de categorias; bibliotecas ficam em páginas próprias.
- PWA MRL com layout mobile distinto, service worker e simulações.
- Android nativo existente preservado em `apps/projector-launcher`, com rebranding pt-BR.

## Etapa seguinte — integração nativa
1. Portar experiência gamer TV para Kotlin/Java sem WebView residente no HY300por.
2. Criar companion/bridge Android no celular para comandos ADB, teclado Unicode/IME e mouse HID Bluetooth onde suportado.
3. Conectar o MRL via protocolo local autenticado, com pareamento, autorização, logs, confirmações e rollback.
4. Criar provedores oficiais para TMDB, RAWG, IGDB e SteamGridDB, com licenças/atribuições, cache e credenciais sob controle do usuário.
5. Instrumentar performance (PSS, CPU, fps, energia e estabilidade) nos perfis Leve/Equilibrado/Cinematográfico.

## Fontes de pesquisa fixadas (submódulos)
Plume, Glass Launcher, TV Home, ADB Remote, Android BT HID, AltRemote, Webmote, Web TV Remote e TvToolsPro são referências independentes; seus códigos não entram automaticamente nos builds.

**TvToolsPro:** repositório público sem licença explícita identificada; utilizá-lo para pesquisa e definição de funcionalidades, mas não copiar código para o produto sem licença/autorização. Código compatível GPL/MIT deve manter avisos e atribuições.

O desenvolvimento utiliza GitHub Actions e, se necessário, um ambiente temporário de compilação. Nunca exige manutenção de VPS ligada para executar o produto.

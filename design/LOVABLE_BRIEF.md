# BRIEF PRINCIPAL PARA LOVABLE — CreativeScreen OS + CreativeScreen Remote PWA

## Objetivo e entregáveis

Crie **dois produtos visualmente integrados e completos no mesmo projeto de frontend**, com navegação funcional, protótipos responsivos, estados de interface reais e design system compartilhado:

1. **CreativeScreen OS — Launcher Gamer / Cinema para Android TV, TV Box e projetores.** O Lovable entregará o **frontend/protótipo navegável** para posteriormente ser implementado em Android nativo (Kotlin/Java). **Não** trate o projeto React como APK/launcher Android pronto.
2. **CreativeScreen Remote — aplicativo PWA mobile** para controlar e administrar um dispositivo Android na mesma rede. O Lovable pode entregar o frontend web real e instalável como PWA, mas o transporte ADB, teclado remoto Unicode, HID Bluetooth e gerenciamento avançado exigem **bridge Android local autenticada**, implementada fora da PWA. Simule essas operações no frontend com um adaptador mock e substitua por APIs reais na etapa de integração.

**Essencial:** os dois produtos devem parecer partes do MESMO ecossistema, não duas interfaces sem relação visual. Uma biblioteca compartilhada de componentes, tipografia, tokens, ícones, animações e perfis deve permitir adaptação consistente. Todo texto inicialmente em **português brasileiro**, arquitetura preparada para i18n.

## Direção de arte — experiência viva e gamer

Quero uma experiência premium e original: atmosfera gamer, jogos, consoles, cinema e séries, com hierarquia visual cinematográfica, sem reproduzir a interface de Netflix/Google TV/PlayStation/Xbox. Escuro refinado, espaço negativo, profundidade sutil, contrastes fortes e foco extremamente nítido. Evite uma aparência de dashboard administrativo genérico.

Temas personalizáveis: **Obsidian / Amber**, **Cyber Neon**, **Aurora**, **Retro Arcade**, **Minimal OLED** e criação de paletas personalizadas. Cada wallpaper poderá sugerir cor de destaque — desativável. Efeitos: brilho sutil no item focado, hover/foco por DPAD, transições leves, blur pré-calculado quando viável; todas animações podem ser reduzidas/desligadas.

Projetar para **TV 1280×720 (referência do HY300por), 1920×1080 e 4K**, com margens de segurança de TV (overscan), tipografia legível de longe e **controle remoto físico/teclado/DPAD/OK/Voltar**. Para PWA, projetar primeiro para Android 360–430 px, retrato e paisagem, com touch targets grandes, uso com uma mão, haptics opcionais, acessibilidade e instalação na tela inicial.

## Produto A — CreativeScreen OS Launcher (prototipar todas as telas)

1. **Onboarding inteligente:** boas-vindas; detectar características simuladas da TV/projetor; modo Lite/Balanced/Cinematic; escolher tema, idioma e tipo de conteúdo; preservar launcher original e ensinar restauração.
2. **Home imersiva:** wallpaper/hero, hora, clima opcional, rede, apps favoritos, retomar, jogos, streaming, filmes/séries, atalhos HDMI/fontes, busca, biblioteca, ajustes rápidos, perfil ativo. Mostrar estados vazio, offline, carregando e sem aplicativos.
3. **Biblioteca de apps e jogos:** grade/lista, categorias, ordenar, favorito, pin, ocultar, acesso a informações, filtro, busca e gerenciamento de apps de usuário/sistema em áreas separadas.
4. **Central de wallpapers** com biblioteca organizada por **Jogos / Filmes / Séries / Misto / Meus arquivos / Favoritos**. Miniaturas grandes, visualização antes de aplicar, selecionar conjunto(s) a usar e alternar as categorias depois.
5. **Motor visual de wallpapers (somente mock no Lovable):** alternância automática com intervalos configuráveis (desligado, 5/15/30/60 min, diário), escolha de gênero(s), agenda por horário, transição personalizável, cache/offline, pausa durante app, modo economia, favoritos e botão "próximo wallpaper". Aplicativo final fará decodificação otimizada no Android.
6. **Configurações completas:** aparência, wallpapers, desempenho, rede, entrada/controle, áudio, projeção e tela (somente opções que a API Android do dispositivo realmente expuser), acessibilidade, idiomas, privacidade, atualizações assinadas, backups/restore, perfis, logs e informações do sistema.
7. **Administração e diagnóstico:** apps instalados, detalhes de permissões, desativação reversível por usuário, armazenamento, RAM física, ZRAM (não confundir com RAM física extra), CPU, processos, serviços, logcat, macros, arquivos, instalação APK, informações do firmware, histórico e rollback. Ações de risco exigem diálogo de confirmação e mostram limitações sem root.
8. **Perfis:** Gamer / Cinema / Família / Minimalista / Personalizado, com ordenação dos apps, favoritos, wallpapers, tema e modo de desempenho por perfil.
9. **Tela de erro, recuperação e modo seguro visual:** launcher não responde, sem Wi-Fi, controle não pareado, aplicativo indisponível, voltar ao launcher original.

## Produto B — CreativeScreen Remote PWA (frontend completo e utilizável como demonstração)

1. **Tela principal de controle:** D-pad com navegação contínua opcional, OK, Home, Voltar, Menu, Power (se suportado), volume, mudo, play/pause, anterior/próximo, pesquisa, lista de aplicativos, atalhos personalizáveis, status e latência.
2. **Teclado completo:** campo de digitação usando o teclado nativo do celular, português/acentos/Unicode, enter/backspace, colar, limpar e enviar; avisar que Unicode remoto dependerá de uma IME/bridge Android. Incluir demonstração de texto enviado.
3. **Mouse e touchpad:** área grande com toque, arrastar, clique, clique longo, duplo clique, rolagem com dois dedos, velocidade/sensibilidade, botões esquerdo/direito; **separar visualmente "gestos ADB" do modo "cursor real Bluetooth HID"**, pois nem todo aparelho suporta HID.
4. **Gerenciar dispositivos:** descoberta na rede, lista, QR/pareamento, autenticação, apelidos, troca de projetor/TV Box, permissões, status online/offline, reconexão e último contato; mostrar qual protocolo está ativo (ADB Wi-Fi / Android TV Remote v2 / HID Bluetooth).
5. **Gerenciador completo de aplicativos:** abrir, fixar, parar, ver uso, instalar APK, backup de pacote quando permitido, limpar cache quando suportado, desativar/remover por usuário com análise de risco, snapshot, confirmação e botão de reverter.
6. **Arquivos e mídia:** navegador de arquivos permitido pelo Android, envio do celular para a TV, downloads, fotos, vídeos, URLs, compartilhar link, reprodução/controles e armazenamento.
7. **Painel administrativo:** RAM/ZRAM, processos, armazenamento, temperatura quando disponível, CPU, Wi-Fi, bateria se houver, logs, serviços, permissões, comandos seguros e diagnóstico; nunca fingir que dados mockados são reais.
8. **Macros e automações:** gravar sequência de controles, criar atalhos, rotinas com agenda local no celular, importar/exportar configurações, editar/reordenar, logs de execução e confirmação para ações destrutivas.
9. **Personalização do launcher à distância:** editar temas, wallpaper, categorias Jogos/Filmes/Séries/Misto, intervalos, favoritos, atalhos e perfis do CreativeScreen OS diretamente no celular, com preview e botão aplicar.
10. **Configurações PWA:** instalação PWA, tema claro/escuro conforme design system, acessibilidade, idioma, toque/haptics, segurança, pareamento, gerenciamento de dados/cache offline e modo demo.
11. **Estados essenciais:** primeira instalação, sem dispositivos encontrados, Wi-Fi desconectado, depuração não autorizada, erro de ADB, protocolo indisponível, falha no envio, confirmação de sucesso, firmware sem suporte ao recurso e modo offline.
12. **Navegação real no protótipo:** abas Controle / Mouse / Teclado / Apps / Arquivos / Automação / Admin / Configurações, menu de dispositivos e fluxo de pareamento que funciona com **dados mock** sem depender de backend.

## Modelos de interação e requisitos de engenharia

- Criar **componentes compartilhados e documentados** (TV e PWA), ícones, escalas tipográficas, cores/tokens exportáveis, estados de foco DPAD, padrões de modal e feedback.
- O **launcher de produção será nativo**: não instalar WebView, Node.js, backend pesado ou IA residente no projetor. O HY300por tem ~1 GB RAM e Android 11 ARMv7 32 bits. Testar perfil Lite com **wallpaper estático WebP/JPEG, sem blur contínuo, sem vídeos no fundo**, transições discretas e sem pré-carregamento agressivo.
- O **PWA não deve exigir VPS nem conta na nuvem**; a interface pode ter cache offline. Para realmente enviar comandos, precisará de **serviço/bridge local autorizado no Android do celular** ou API local autenticada do projetor quando disponível. Não alegar que o navegador comum executa ADB nativamente.
- Sem Supabase, login cloud obrigatório, pagamentos, telemetria padrão, serviços de streaming piratas ou APIs externas obrigatórias. Mock data legível, organizado e claramente identificado como demonstração.
- Organização sugerida: `design/lovable-prototype/launcher`, `design/lovable-prototype/remote-pwa`, `design/tokens`, `design/exports`. Código final do PWA poderá ser migrado para `apps/phone-remote-pwa/`; código do launcher será portado para `apps/projector-launcher/`.
- Se for usar imagens de jogos, filmes e séries: use **placeholders, artes originais ou imagens licenciadas**. Preparar adaptadores para catálogo externo (ex.: serviços de metadados com termos/atribuição verificados) e biblioteca de imagens fornecidas pelo usuário; não embutir milhares de artes protegidas no APK.
- Construir UI **completa, navegável e responsiva**, sem páginas vazias ou botões decorativos. Ações que dependem de dispositivo real devem usar interface de mock determinística, não falsas ações de produção.

## Entregas exigidas do Lovable

1. **Protótipo completo do Launcher TV gamer** com telas e navegação DPAD/teclado.
2. **Protótipo PWA mobile completo**, visualmente no mesmo ecossistema e instalável em celular, com navegação/touchpad/teclado demo.
3. **Biblioteca compartilhada de componentes e design tokens** exportáveis em JSON/CSS com guia de port para Kotlin/Java.
4. **Biblioteca de wallpapers demo** organizada por gênero com indicação de licenciamento/origem, favoritos e modo automático simulado.
5. **Fluxos de onboarding, perfis, rede, pareamento, administração, backup, erros e recuperação** prototipados em ambos.
6. **Mocks documentados**, contratos de interface para futura bridge local (por exemplo: `sendKey`, `sendText`, `pointerEvent`, `listApps`, `getSystemStats`, `applyTheme`, `setWallpaperSchedule`).
7. **Especificação de performance** por Lite/Balanced/Cinematic e lista de efeitos para desligar em dispositivos fracos.

**Critério de aceitação:** deveremos conseguir navegar e demonstrar tanto o launcher quanto a PWA, personalizar tema e categorias de wallpaper, simular controle/teclado/mouse e administração sem servidor, e extrair estilos/componentes para implementação real. Não apresentar o design como APK integrado, nem a PWA demo como controle remoto ADB pronto.

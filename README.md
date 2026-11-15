# CreativeScreen OS 🎮📺

**Sistema de tela inicial e controle remoto para projetores Android, TV Box e Android TV.** Este é um projeto independente; a Linkou MCP Remoto pode operar como ferramenta externa de automação, mas não é parte do runtime nem do repositório.

## Visão de produto
- **CreativeScreen Launcher:** interface gamer/cinema nativa, favoritos, busca, biblioteca, perfis, painéis de configuração, widgets opcionais e wallpapers alternados entre **Jogos**, **Filmes**, **Séries** e **Misto**.
- **CreativeScreen Remote (celular):** controle direcional, teclado Unicode, touchpad/mouse, atalhos, áudio, gestão de apps e arquivos, diagnósticos, macros e ADB autenticado. Modo Bluetooth HID e Android TV Remote v2 quando compatíveis.
- **CreativeScreen Studio:** protótipo visual em Lovable exportado como referência; implementação de produção Android nativa para preservar RAM.
- **Modo adaptativo:** *Lite / Balanced / Cinematic*, escolhidos com base em memória real, resolução, disponibilidade da rede e opção do usuário.

**Primeiro alvo de validação:** HY300por, Android 11 / ARMv7 32-bit / ~1 GiB RAM. Nenhuma promessa de compatibilidade universal sem teste de hardware.

## Estado atual
- Repositórios de referência registrados como **submódulos Git**, com commits fixados e licença documentada.
- Código completo do launcher HY300por migrado para `apps/projector-launcher/`, e APK independente compilado com sucesso. Backup de código em `archives/legacy-launcher-source.tar.gz`. Os submódulos externos ainda não estão integrados em um único APK.
- Recursos administrativos do TvToolsPro estão especificados para implementação, mas o projeto original não informa licença de reutilização; seu código permanece uma **referência externa não incorporada ao produto** até obtermos permissão/licença.
- Sem acesso root, sem remoções irreversíveis e sem serviços pesados rodando no projetor.

## Começar
```bash
git clone --recurse-submodules https://github.com/Miguel-Creative/CreativeScreen-OS.git
cd CreativeScreen-OS
cd apps/projector-launcher && ./gradlew assembleFdroidRelease
```

Veja [Arquitetura](docs/ARCHITECTURE.md), [Plano de integração](docs/INTEGRATION_PLAN.md), [Fontes e licenças](docs/UPSTREAMS_AND_LICENSES.md), [Brief para Lovable](design/LOVABLE_BRIEF.md) e [Orçamento de desempenho](docs/PERFORMANCE.md).

## Licenciamento e atribuições
Licença geral GPL-3.0, respeitando arquivos LICENSE/NOTICE de cada fonte. Projetos MIT podem servir de base; qualquer código com licença não identificada fica excluído dos binários até esclarecimento. Wallpapers, logos e pôsteres de franquias pertencem aos respectivos titulares; não incluímos acervos sem direitos definidos.

## Controle do celular
O MVP `apps/phone-remote-web/` utiliza Node.js no Termux do próprio celular e comandos ADB autorizados por Wi-Fi. Não é o aplicativo Android nativo definitivo.

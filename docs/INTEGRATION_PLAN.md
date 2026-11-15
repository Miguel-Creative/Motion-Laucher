# Plano de integração — status real

Este documento diferencia **código disponível**, **recurso integrado** e **funcionamento validado**.

| Fonte | Destino | Status | Ações |
|---|---|---|---|
| Plume Launcher (GPL-3) | Launcher gamer/cinema | Fonte vinculada, **não integrada** | Catalogar telas, migrar grid/foco/wallpaper e medir PSS |
| Glass Launcher (MIT) | Efeitos e tiles | Fonte vinculada, **não integrada** | Adaptar Java nativo sem blur contínuo |
| TV Home (MIT) | Dock, configuração e navegação | Fonte vinculada, **não integrada** | Integrar navegação remota e categorias |
| ADB Remote (GPL-3) | Remote Wi-Fi + mouse + teclado | Fonte vinculada, **não integrada** | Portar comandos ADB, Unicode, captura e arquivos |
| Android BT Remote (GPL-3) | Mouse/teclado Bluetooth HID | Fonte vinculada, **não integrada** | Validar suporte Android HID e pareamento |
| AltRemote (MIT) | Protocolo TV Remote v2 | Fonte vinculada, **não integrada** | Fallback para aparelhos sem ADB |
| Webmote (MIT) | HTTP controle local | Fonte vinculada, **não integrada** | Analisar autenticacão e receptor ultraleve opcional |
| tv-remote (MIT) | Controle web | Fonte vinculada, **não integrada** | Prototipar touchpad e interface do celular |
| TvToolsPro (licença não publicada) | Administração completa | **Somente referência**, código não incorporado | Implementar equivalente próprio ou obter autorização para reutilização |
| Legacy Linkou Home (GPL-3) | Launcher original testado | Arquivo de migração; ainda não integrado como release | Extrair, compilar, medir e refatorar no monorepo |

## Trilha de implementação
1. Importar e compilar o launcher funcional anterior em projeto próprio, documentando a mudança de nome.
2. Separar contratos de controle e implementar o app remoto Android com ADB + IME/Unicode + mouse/touchpad.
3. Implementar gerenciamento com inventário e reversão, inspirado nos fluxos do TvToolsPro sem copiar código sem licença.
4. Integrar visual gamer nativo com tokens/export do Lovable.
5. Criar gerenciador de wallpapers legalmente licenciados, categorias e rotação agendada com cache e modo offline.
6. Medir RAM PSS, CPU, tempo HOME e fluidez por perfil antes de habilitar qualquer efeito.
7. Distribuição assinada, atualizações verificadas, matriz de compatibilidade e CI.

Critério de conclusão: uma funcionalidade só é chamada **integrada** depois de possuir código próprio, build válido e teste real no dispositivo.

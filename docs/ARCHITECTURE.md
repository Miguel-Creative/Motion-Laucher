# Arquitetura do CreativeScreen OS

## Estrutura
```
apps/projector-launcher/    Android (Kotlin/Java, nativo e leve)
apps/phone-remote/          Android (controle, teclado e mouse; em implementação)
apps/companion-input/      IME pequeno opcional para Unicode; em planejamento
design/                    Design system / Lovable Studio / tokens
docs/                      Requisitos, licença, segurança e desempenho
scripts/                   Migração, build e validação
archives/                  Snapshot do launcher funcional, para migração
upstream/                  Fontes abertas fixadas como submódulos
```

## Processos
**Projetor:** um processo HOME com tiles, cache de thumbnails e gerenciador de wallpapers. Não inserir WebView permanente, backend Node.js, IA local nem serviço de scan de rede em loop. Componentes opcionais somente sob demanda.

**Celular:** aplicativo de controle com descoberta e pareamento, canais alternativos ADB/TCP Wi-Fi, Android TV Remote v2 e Bluetooth HID. Sensores/touchpad e teclado rodam aqui; operações administrativas apresentam simulação, confirmação, auditoria e reversão.

**Integração:** módulos inspirados por upstream são portados/adaptados, com um contrato único de mensagens e testes; a presença de um submódulo NÃO faz suas funções rodarem no produto. Evitar mesclar nove aplicativos independentes no mesmo processo.

## Camadas previstas
1. `core-device`: descoberta, capacidades e conexão autenticada.
2. `core-input`: keyevents, pointer/touch, teclado Unicode e clipboard com permissão.
3. `core-management`: pacotes, arquivos, permissões, logs, RAM/Swap/ZRAM, backup e rollback.
4. `core-wallpaper`: catálogo local + remoto opcional, direitos, seleção de gêneros, cache pequeno, crossfade leve.
5. `core-home`: layouts, perfis, foco por DPAD, widgets e efeitos degradáveis.
6. `core-automation`: macros verificáveis, rotinas locais e cron opcional no celular, nunca em hardware fraco sem consentimento.

## Perfis
- **Lite** (≤1,5 GB RAM): estático por padrão, 720p máximo para wallpapers, transições discretas, sem blur em tempo real, cache em disco limitado, nenhum vídeo como fundo.
- **Balanced**: imagens até resolução do dispositivo, fade leve, widgets opcionais.
- **Cinematic** (hardware mais potente): parallax, animações e prévias, desabilitados automaticamente sob pressão de memória.

## Modelo de segurança
Pareamento explícito; ADB não exposto à Internet. Autenticação para controle web; mascarar ou criptografar tokens localmente. Ações como exclusão de aplicativo exigem pré-visualização e backup de reversão. Nenhum root é necessário para o MVP.

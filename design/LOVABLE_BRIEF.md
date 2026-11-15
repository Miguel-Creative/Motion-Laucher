# BRIEF PARA LOVABLE — CreativeScreen Gamer OS

Crie um **protótipo web navegável de design system** para o produto CreativeScreen OS; ele será usado como referência de implementação **Android TV nativa**. Não faça de conta que o protótipo React será um launcher Android instalável. Não gere back-end, autenticação online obrigatória, bibliotecas de streaming clandestino nem uma galeria de artes protegidas sem licença.

## Identidade
- Visual cinematográfico gamer: imersivo, sofisticado, escuro, imponente, sem aparência de painel corporativo ou TV genérica.
- Cores variáveis em temas (Cyber Neon, Obsidian/Amber, Aurora, Retro Arcade, Minimal Dark). Foco visível por DPAD, cantos amplos, tipografia legível a 3 m, contraste AA.
- Interface viva: transições discretas e focadas em ação; oferecer modo sem animações e Perfil Lite para 1 GB RAM.
- Design responsivo para 1280×720, 1920×1080, 4K e modo telefone.

## Telas e navegação
1. **Home gamer:** hero/banner dinâmico com wallpaper de jogo ou cinema, carrossel de aplicativos favoritos, jogos, streaming, atalhos, hora/clima opcional.
2. **Biblioteca de Apps & Jogos:** grid com pin, filtros, busca, categorias, ocultar/ordenar e detalhes.
3. **Central de Wallpapers:** tabs **Jogos**, **Filmes**, **Séries**, **Misto**, **Meus Arquivos**; imagens com previews, tema, favoritos, origens/licenças e seleção manual.
4. **Rotação de wallpapers:** escolher gêneros, alternância temporizada, fade opcional, agendamento diurno/noturno, prefetch limitado, cache local, pausar em jogo/app, modo offline.
5. **Configurações:** perfis Lite/Balanced/Cinematic, aparência, acessibilidade, foco por controle, som, atalhos, rede, privacidade, backups e versão.
6. **Administração:** aplicativos instalados (usuário/sistema), detalhes/permissões, sugerir desativação com rollback, RAM/ZRAM/armazenamento, CPU, logs, agendador/macro e diagnóstico; operações perigosas com confirmação explícita.
7. **Controle pelo celular:** layout touch para D-pad, teclado Unicode, mouse/trackpad com scroll, volume, reprodução, perfis, macro, descoberta/pareamento, troca de launcher e busca por voz opcional.
8. **Onboarding e recuperação:** selecionar launcher padrão e restaurar OEM, testes de controle, pareamento e fallback quando dispositivo não oferece ADB.

## Conteúdo de demonstração
Use ilustrações abstratas, placeholders e imagens autorizadas/licenciadas. Não copie capas ou screenshots de franquias como banco de imagens incorporado. Os provedores reais de metadata/artwork serão plug-ins opcionais com termos, cache e atribuições respeitados.

## Saída obrigatória
Entregar telas desktop-TV e mobile, estados vazios/erro/loading, kit de componentes, tokens (JSON de cores, radius, tipo, spacing), fluxos de foco DPAD, microinterações documentadas, screenshots exportáveis e páginas técnicas de desempenho.
Exportar o projeto web para pasta `design/lovable-prototype` ou repositório temporário, mantendo **CreativeScreen-OS como origem oficial**. Não criar Supabase ou banco de dados por padrão.

## Critérios de aceitação
Ações não são botões inertes, navegação por teclado completa, wallpaper separado da UI e nenhuma chamada de API real por padrão. Animações devem ser desativáveis. Projeto de frontend não é evidência de desempenho Android; a equipe adaptará para Kotlin/Java.

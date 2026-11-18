# Streaming — primeira versão

Cinco canais HLS públicos (3 brasileiros, 2 estrangeiros) responderam com #EXTM3U na verificação de 17/11/2026. Isso não certifica reprodução em todos os aparelhos ou regiões. Fontes: [iptv-org](https://github.com/iptv-org/iptv) e os sinais oficiais de cada emissora. Os vídeos sob demanda são obras abertas e curtas do [Blender Studio](https://studio.blender.org/films/), servidas pelo [PeerTube oficial](https://video.blender.org). Não há filmes comerciais recentes nem séries pagas liberadas. Não incluímos links de origem desconhecida, bypass de DRM, torrents ou retransmissão. A disponibilidade é controlada pelas fontes.

O Android usa Media3 HLS/MP4, limite preferencial 720p, buffer limitado e um player ativo por vez. Retoma posição de VOD localmente. A prévia web abre o endereço oficial. Gerenciador de apps usa APIs nativas e a confirmação padrão do Android. Apps de sistema são gerenciados na tela oficial, sem privilégios elevados. O launcher não permite desinstalar a si mesmo pelo próprio painel. Próximos passos: EPG, fontes VOD licenciadas adicionais, validação física e publicação assinada.

## Versão 1.0.30
- Adiciona TV Cultura, Record News e Rede Brasil, cujas playlists responderam com #EXTM3U em teste de rede; não equivale a ensaio de vídeo no projetor.
- Filmes: Sita Sings the Blues (longa liberado pela autora: https://www.sitasingstheblues.com/watch.html), WING IT! e Singularity (2026, Blender Studio). Singularity tem fonte MP4 1080p no PeerTube oficial: preferir qualidade reduzida quando existir.
- Abas Lançamentos (obras recentes realmente disponíveis) e Continuar assistindo (progresso local nativo).
- Gerenciador acessível em Ajustes e Biblioteca; tamanho de APK medido, ações de cache/desativação nos detalhes oficiais do Android. Não simula sucesso. Nenhum acesso elevado.

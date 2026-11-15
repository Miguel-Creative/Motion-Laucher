## Curadoria internacional e backdrops para TV (2026)

- Filmes e séries: seleção com prioridade aos serviços disponíveis na região BR, mantendo produções internacionais.
- O filtro deste projetor exclui produções brasileiras, chinesas e tailandesas, inclusive originais nessas línguas, mas mantém conteúdo japonês e coreano.
- Anime: destaques One Piece, Solo Leveling, Jujutsu Kaisen, Demon Slayer, Dragon Ball Super/Z, Chainsaw Man, Bleach e Naruto a partir do TMDB e animes populares no BR.
- Até doze imagens horizontais alternativas por destaque, escolhidas por proporção e resolução. A seleção pode mudar na rotação automática.
- O TMDB serve imagens oficiais remotamente. Nenhuma arte de terceiros é copiada ou republicada em GitHub/Cloudflare.
- A curadoria prioriza imagens horizontais; Kitsu/AniList ficam como fontes alternativas quando faltam backdrops.
- Os números dependem da disponibilidade atual das APIs e de seus termos. A fonte segue visível no estúdio, mas foi retirada da Home.

# Motion Laucher — seleção dinâmica de wallpapers reais

O launcher busca títulos, notas, datas de estreia e imagens nos serviços de origem. A versão web utiliza **Cloudflare Workers**, com endpoint `/api/catalog`, e não precisa de VPS. O frontend permite escolher o critério editorial em **Estúdio de Wallpapers**.

## Critérios disponíveis

| Filtro na interface | Filmes (TMDB) | Séries (TMDB) | Jogos (RAWG) | Animes (Kitsu/AniList) |
|---|---|---|---|---|
| Destaques (padrão) | Tendências + próximos filmes + melhores recentes | Tendências + séries futuras + bem avaliadas + em exibição | Próximos + jogos recentes + notas + franquias de interesse | Novas temporadas identificáveis + próximos + bem avaliados do ano + atuais |
| Em alta | Trending da semana | Trending da semana | Popularidade dos últimos 15 meses | Exibições recentes / popularidade |
| Em breve | Movie upcoming (BR) | Discover TV: primeira exibição futura | Datas entre hoje e próximos 18 meses | Status **upcoming**, priorizando interesse do público |
| Mais bem avaliados | Discover de últimos 36 meses, votos suficientes e nota alta | Mesmo critério | Metacritic 80+ de até 36 meses atrás | Melhores avaliados do ano atual, por `filter[seasonYear]` |
| Novas temporadas | — | Séries em exibição com detalhes de episódio recente/próximo em temporada 2+ | — | Estreias marcadas explicitamente como Season 2, 3rd Season, Part 2 etc. |

**Critérios são consultas dinâmicas, não uma lista estática de nomes.** Datas de hoje são calculadas pelo Worker; lançamentos mudam conforme os provedores atualizam seus registros. O Kitsu foi testado contra registros atuais de estreias e notas. A API do AniList continua como reserva, pois conexões da Cloudflare podem receber HTTP 403.

**Exemplos de franquias acompanhadas nos jogos:** buscas direcionadas a *Grand Theft Auto VI* e *Assassin's Creed* ajudam a achar artes/entradas recentes, quando o RAWG as disponibilizar. Não substituímos datas verificadas por suposições e não mostramos títulos inventados caso a busca não tenha retorno válido.

## Fontes de imagens

- **TMDB:** `backdrop_path` (imagens horizontais, priorizadas), `poster_path` (alternativas) e `/{movie|tv}/{id}/images` ao abrir a galeria do título.
- **RAWG:** `background_image` e `/games/{id}/screenshots` sob demanda.
- **SteamGridDB (opcional):** `search/autocomplete` + `heroes/game/{id}`. Priorizamos imagens horizontais e buscamos até seis alternativas apenas quando o usuário abre o jogo. A escolha exige correspondência do nome, evitando associar artes ao jogo errado.
- **Kitsu/AniList:** capas e banners fornecidos nos registros, priorizando imagem horizontal quando existir. Algumas séries só disponibilizam cartaz vertical: não classificá-lo falsamente como wallpaper widescreen.

## Credenciais na Cloudflare

No dashboard, em **Workers & Pages → motion-laucher → Settings → Variables and Secrets**, salve como **Secrets**, nunca no frontend público ou no GitHub:

- `TMDB_READ_TOKEN`: token de leitura do TMDB, para filmes e séries.
- `RAWG_API_KEY`: chave da API RAWG, para jogos.
- `STEAMGRIDDB_API_KEY` (opcional): API do SteamGridDB, apenas para ampliar as opções de imagens de jogos.

Animes pelo Kitsu podem funcionar sem credenciais. Não colocar chaves em campos de `VITE_*`, URL de acesso público ou arquivos `.env` commitados.

## Endpoints para testar (quando a nova versão for publicada)

- `/api/catalog?kind=Animes&feed=em-breve`
- `/api/catalog?kind=Animes&feed=novas-temporadas`
- `/api/catalog?kind=Animes&feed=melhores`
- `/api/catalog?kind=Filmes&feed=em-breve`
- `/api/catalog?kind=S%C3%A9ries&feed=novas-temporadas`
- `/api/catalog?kind=Jogos&feed=em-breve`
- `/api/catalog?kind=Jogos&feed=destaques`
- `/api/catalog?kind=Jogos&imageId=rawg-<id>` (substituir pelo ID retornado pela API)

O cache do Worker expira em até **seis horas**. A interface atualiza a lista ao abrir e periodicamente enquanto estiver ativa. **A rotação automática de wallpapers** é um ajuste separado e não força consultas a cada transição.

## Repositórios GitHub úteis avaliados

- [SteamGridDB/node-steamgriddb](https://github.com/SteamGridDB/node-steamgriddb) — wrapper JavaScript oficial do SteamGridDB, licença MIT; útil para possível integração futura mais profunda.
- [SteamGridDB/decky-steamgriddb](https://github.com/SteamGridDB/decky-steamgriddb) — exemplo de fluxo de seleção/aplicação de artes; licença não claramente identificada pelo GitHub, **não copiar código** sem revisão.
- [twitchtv/igdb-api-node](https://github.com/twitchtv/igdb-api-node) — cliente IGDB para rankings de jogos e lançamentos, MIT; a API exige OAuth Twitch, por isso não é necessária nesta primeira fase.
- [tanukiapp/tanuki-app](https://github.com/tanukiapp/tanuki-app) — calendário semanal de anime baseado em Kitsu; GPL-3.0, utilizar como referência e preservar os termos se algum código for reutilizado.
- [KangieDanie/AniCalendar](https://github.com/KangieDanie/AniCalendar) — interface de calendário/histórico de anime, MIT; referência de UX, não uma fonte oficial de imagens.

Os projetos externos acima **não foram incorporados integralmente**. Usamos REST/GraphQL oficiais sem depender de bancos de dados comunitários sem manutenção.

## Direitos e atribuições

- O Motion Laucher é gratuito e aberto, **mas as artes oficiais e os posters não se tornam domínio público**.
- Sempre apresentar a fonte e créditos relevantes (TMDB, RAWG, SteamGridDB, Kitsu/AniList), obedecer às políticas de exibição e não redistribuir arquivos de terceiros no GitHub.
- O uso da API TMDB requer atribuição e as condições de uso permitidas pelo serviço. RAWG exige link de retorno visível nos locais onde seus dados são usados.
- Dados de ranking são indicadores das plataformas; "popular" não é sinônimo de alta avaliação. Novas temporadas são rotuladas apenas quando existem sinais explícitos de sequência/temporada, não pela simples idade da série.
- A API e a interface web estão separadas do APK Android. A integração de wallpapers e cache no **launcher nativo** permanece uma etapa posterior, com monitoramento de RAM e cache adequado ao projetor.

## Fontes técnicas

- [TMDB API](https://developer.themoviedb.org/docs/getting-started), [popularidade/trending](https://developer.themoviedb.org/docs/popularity-and-trending)
- [RAWG API](https://rawg.io/apidocs)
- [AniList media](https://docs.anilist.co/reference/object/media)
- [Kitsu JSON:API](https://hummingbird-me.github.io/api-docs/)
- [IGDB API](https://api-docs.igdb.com/)
- [SteamGridDB API](https://www.steamgriddb.com/api/v2)

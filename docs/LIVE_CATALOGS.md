# Motion Laucher — Catálogos reais e atualização automática

O Motion Laucher usa a Cloudflare como **ponte de metadados e imagens**, sem VPS. A implementação está em `apps/catalog-worker/index.ts`, e a interface usa o endpoint `/api/catalog`. As imagens são exibidas diretamente das URLs oficiais retornadas pelos provedores, sem empacotar os catálogos no APK.

| Categoria | Origem | Credenciais | Atualização |
|---|---|---|---|
| Filmes | TMDB — tendências da semana | `TMDB_READ_TOKEN` | A cada expiração do cache (até 6 horas) |
| Séries | TMDB — tendências da semana | `TMDB_READ_TOKEN` | Idem |
| Jogos | RAWG — jogos populares | `RAWG_API_KEY` | Idem |
| Animes | AniList; Kitsu como alternativa | Sem credenciais de leitura pública | Idem |

O Worker prioriza AniList, mas seus servidores podem recusar conexões da Cloudflare (HTTP 403); nesse caso consulta o **Kitsu**, que retorna títulos e imagens reais. Não usar Jikan público como alternativa: sua API pública foi descontinuada em outubro de 2026.

## Ativar Filmes, Séries e Jogos na conta Cloudflare
1. Entre no [TMDB](https://www.themoviedb.org/) e crie uma conta, se necessário.
2. Em Configurações de conta → API, solicite uma chave para uso **não comercial** e copie o **API Read Access Token**.
3. Entre no [RAWG](https://rawg.io/apidocs) e obtenha uma chave de API gratuita, observando termos e limites.
4. No painel Cloudflare, abra **Workers & Pages → motion-laucher → Settings → Variables and Secrets**. Adicione os valores como **Secrets**, não como variáveis públicas.
   - `TMDB_READ_TOKEN` = token de leitura do TMDB.
   - `RAWG_API_KEY` = chave pessoal do RAWG.
5. Reimplante o Worker, se necessário. Teste:
   - `https://motion-laucher.contato-creativezone.workers.dev/api/catalog?kind=Filmes`
   - `https://motion-laucher.contato-creativezone.workers.dev/api/catalog?kind=S%C3%A9ries`
   - `https://motion-laucher.contato-creativezone.workers.dev/api/catalog?kind=Jogos`
   - `https://motion-laucher.contato-creativezone.workers.dev/api/catalog?kind=Animes`

**Nunca compartilhe as chaves neste chat, no GitHub ou em um arquivo do frontend.** O Worker as utiliza internamente; a interface recebe apenas os dados normalizados e URLs de imagens.

### Imagens alternativas

Para filmes/séries e jogos é possível abrir o detalhe no Estúdio de Wallpapers: o Worker consulta imagens oficiais alternativas do título selecionado **sob demanda**, sem baixar todos os arquivos de uma vez.

### Atualização automática

As listas são consultadas ao abrir o launcher e atualizadas periodicamente com a interface aberta. O Worker possui cache de até **6 horas** para reduzir requisições e custos; após a expiração, passa a apresentar os destaques fornecidos pela API naquele momento. A troca automática de wallpaper segue o intervalo que o usuário escolher e não depende da recompilação do APK.

**Limites:** a versão atual integra os catálogos com a prévia web. Para ter esses wallpapers no **launcher Android nativo**, ainda será necessário portar o módulo de consulta e cache para Android. A prévia também mantém as artes antigas marcadas como demonstração se nenhum catálogo real estiver disponível. Não há garantia de tradução para pt-BR de todos os títulos ou de várias imagens por item.

### Créditos e licenciamento

- [TMDB](https://developer.themoviedb.org/docs/faq): atribuição obrigatória e uso gratuito não comercial; exibir créditos oficiais na interface.
- [RAWG](https://rawg.io/apidocs): atribuição com link ativo em telas que usam seus dados; respeitar limites.
- [AniList](https://docs.anilist.co/guide/terms-of-use): termos e limite de chamadas; não replicar a base em massa.
- [Kitsu](https://kitsu.docs.apiary.io/): créditos e condições de uso do serviço.
- Imagens de jogos, filmes, séries e animes podem ter direitos de seus respectivos titulares. Gratuidade e código aberto do launcher **não significam que essas imagens sejam de domínio público**; manter os termos e acesso conforme cada provedor autoriza.

### Ícones de aplicativos Android

O APK nativo utiliza `PackageManager.getInstalledApplications`, `getApplicationLabel` e `getApplicationIcon`, carregando os nomes e ícones reais dos apps instalados. A prévia web possui ícones genéricos de demonstração porque um navegador não pode consultar diretamente os aplicativos instalados no projetor.

### Observação de segurança

A busca de credenciais no navegador existente em algumas telas herdadas do protótipo será substituída pela gestão no painel Cloudflare ou em configurações seguras nativas. O sistema de catálogo vivo **não lê chaves do localStorage**; não cole tokens privados nos campos de texto da prévia.

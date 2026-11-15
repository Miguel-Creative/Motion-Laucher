# Hospedagem Cloudflare Pages — Motion Laucher

**Objetivo atual:** publicar apenas a **prévia web do Motion Laucher para projetores/TVs**, para avaliação visual e ajustes sem precisar reinstalar um APK a cada alteração. A publicação do MRL vem depois da aprovação do visual.

## Como criar a primeira prévia no Cloudflare Pages

Acesse [Cloudflare Dashboard → Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages) → **Criar aplicação → Pages → Conectar ao Git**.

Selecione **GitHub**, autorize a instalação do Cloudflare Workers and Pages se necessário, e escolha o repositório **`Miguel-Creative/Motion-Laucher`**. Cada projeto usa a mesma branch `main` e a **raiz do repositório** porque os componentes são compartilhados via `packages/motion-ui`.

### Projeto 1 — Motion Laucher TV (publicar agora)

| Campo Cloudflare Pages | Configuração |
|---|---|
| Nome sugerido | `motion-laucher-tv` (se disponível) |
| Repositório | `Miguel-Creative/Motion-Laucher` |
| Branch de produção | `main` |
| Framework preset | `None` (ou Vite, com os campos sobrescritos) |
| Diretório raiz (Root directory) | **`/` (repositório inteiro)** |
| Build command | `pnpm install --no-frozen-lockfile --config.strict-peer-dependencies=false && pnpm run build:tv` |
| Output directory | **`dist/tv-preview`** |
| Variáveis de ambiente de Build | `NODE_VERSION=22.16.0`, `PNPM_VERSION=10.11.1`, **`SKIP_DEPENDENCY_INSTALL=1`** |

**Por que SKIP_DEPENDENCY_INSTALL?** Na migração o `npm install` padrão do runner do GitHub falhou antes de compilar (`Cannot read properties of null (reading 'edgesOut')`). O projeto passou nos testes usando **pnpm 10**, cuja instalação é executada explicitamente no Build command. O arquivo `.node-version` também fixa Node 22.16.0.

**Importante:** a pasta `apps/tv-preview` NÃO é o Root directory de build; ela só define a aplicação TV. Os imports relativos apontam para `packages/motion-ui` a partir da raiz.

Depois de salvar e iniciar a implantação, a Cloudflare atribui um endereço público `*.pages.dev`. **Não presuma que um domínio com o nome sugerido já foi criado.** Copie o endereço real mostrado no dashboard ao concluir a publicação.

### Testes básicos após publicar
- `/` — HOME da TV em composição paisagem (16:9), wallpaper, menu e dock.
- `/launcher` — mesma HOME TV.
- `/wallpapers` — coleções de Jogos, Filmes, Séries, Animes etc.
- `/library` — aplicativos/jogos de demonstração.
- `/settings` — configurações do launcher.

O Cloudflare Pages assume o comportamento SPA automaticamente quando o site não inclui um `404.html` de nível superior. O build web atual NÃO gera esse arquivo, então URLs de navegação profunda são tratadas pelo roteador React.

## Projeto 2 — MRL PWA (somente quando formos desenvolvê-lo)

Crie um **segundo projeto Pages** no mesmo repositório, com outro nome, por exemplo `motion-laucher-remoto`. Repita as mesmas configurações acima, alterando exclusivamente:

| Campo | MRL |
|---|---|
| Build command | `pnpm install --no-frozen-lockfile --config.strict-peer-dependencies=false && pnpm run build:mrl` |
| Output directory | `dist/mrl-pwa` |

O serviço MRL é uma interface de controle web independente e é instalável em celulares por HTTPS. O PWA tem cache offline de interface. **A ponte de controle real do projetor por ADB/HID continua uma integração separada e precisa de autorização/autenticação local.** Não expor ADB via internet.

## Conversão do launcher em APK

A prévia em Pages **não substitui o APK**. O Android nativo atual está em `apps/projector-launcher`; a interface gamer web será gradualmente portada para componentes Android nativos, mantendo o consumo baixo no HY300por (~1GB RAM). APKs podem ser compilados pelo GitHub Actions. Nem a TV nem o celular exigem VPS permanente.

## Depuração do primeiro deploy
- **Falha na instalação:** confirmar `SKIP_DEPENDENCY_INSTALL=1` e Build command com `pnpm install --no-frozen-lockfile ...`.
- **Falha por Node antigo:** configurar `NODE_VERSION=22.16.0`.
- **Página 404:** conferir Output directory `dist/tv-preview`, e se há `index.html` gerado; não apontar para `apps/tv-preview`.
- **Página em branco:** verificar Console do navegador; conferir os arquivos gerados e logs do Pages.
- **Prévia muito estreita:** testar na aba de desenvolvedor em 1280×720; visualização pelo celular na vertical comprime a proporção, não representa o projetor.
- **Imagens escuras:** use o preset `Projetor` e ajuste a opacidade do overlay em Configurações.

## Fonte oficial
- Cloudflare Pages — [Git integration](https://developers.cloudflare.com/pages/configuration/git-integration/)
- Cloudflare Pages — [Monorepos](https://developers.cloudflare.com/pages/configuration/monorepos/)
- Cloudflare Pages — [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- Cloudflare Pages — [Serving Pages / SPA](https://developers.cloudflare.com/pages/configuration/serving-pages/)

A criação do projeto na conta Cloudflare exige autorização do titular da conta; este documento não cria um projeto Cloudflare sozinho.

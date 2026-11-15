# Publicação do Motion Laucher

A hospedagem da **prévia web de TV já foi iniciada como Cloudflare Workers com assets estáticos**; o MRL poderá ser publicado depois como um projeto independente. O mesmo repositório atende às duas aplicações. Primeiro publicar **Motion Laucher TV** e validar o visual; depois **Motion Laucher Remoto (MRL)**.

➡️ **[Configurações exatas e passo a passo para Cloudflare Pages](CLOUDFLARE_PAGES.md)**

**Status:** as compilações e os testes de TV, MRL e launcher Android passaram no GitHub Actions. Publicação Cloudflare exige criar/conectar um projeto Pages na conta Cloudflare; ainda não existe uma URL `*.pages.dev` confirmada. Sem VPS.

Compilações locais (Node >=22):

```bash
pnpm install --no-frozen-lockfile --config.strict-peer-dependencies=false
pnpm run build:tv     # dist/tv-preview
pnpm run build:mrl    # dist/mrl-pwa
```

TV é a referência de design; o launcher definitivo será APK Android nativo em `apps/projector-launcher`. MRL é PWA com controle de demonstração, até conectarmos uma ponte local autorizada.

## Erro Cloudflare Worker "assets.directory does not exist"
Se o Worker `motion-laucher` executar apenas `npx wrangler deploy`, o Vite não foi compilado e `dist/tv-preview` não existe. No painel **Workers & Pages → motion-laucher → Settings → Builds** configure **Build command = `bun run build:tv`** e mantenha **Deploy command = `npx wrangler deploy`**. Consulte [instruções completas](CLOUDFLARE_PAGES.md).

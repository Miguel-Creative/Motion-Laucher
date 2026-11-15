# Publicação do Motion Laucher

A hospedagem principal das **prévias web** é **Cloudflare Pages**: um único repositório e duas aplicações independentes. Primeiro publicar **Motion Laucher TV** e validar o visual; depois **Motion Laucher Remoto (MRL)**.

➡️ **[Configurações exatas e passo a passo para Cloudflare Pages](CLOUDFLARE_PAGES.md)**

**Status:** as compilações e os testes de TV, MRL e launcher Android passaram no GitHub Actions. Publicação Cloudflare exige criar/conectar um projeto Pages na conta Cloudflare; ainda não existe uma URL `*.pages.dev` confirmada. Sem VPS.

Compilações locais (Node >=22):

```bash
pnpm install --no-frozen-lockfile --config.strict-peer-dependencies=false
pnpm run build:tv     # dist/tv-preview
pnpm run build:mrl    # dist/mrl-pwa
```

TV é a referência de design; o launcher definitivo será APK Android nativo em `apps/projector-launcher`. MRL é PWA com controle de demonstração, até conectarmos uma ponte local autorizada.

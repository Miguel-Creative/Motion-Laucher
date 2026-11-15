# Publicar os dois frontends sem VPS

O Motion Laucher possui **dois builds web independentes**. É possível publicá-los em serviços estáticos como Vercel, Netlify ou Cloudflare Pages, mantendo o código e a compilação no GitHub.

## Configuração recomendada no Vercel
Crie **dois projetos diferentes ligados ao MESMO** repositório `Miguel-Creative/Motion-Laucher`, com diretório raiz do projeto **`.` (raiz do repositório)**. Não defina a raiz como `apps/mrl-pwa` ou `apps/tv-preview`, pois as duas aplicações importam componentes de `packages/motion-ui`.

| Configuração | Motion Laucher TV (prévia) | Motion Laucher Remoto — MRL |
|---|---|---|
| Git repository | `Miguel-Creative/Motion-Laucher` | `Miguel-Creative/Motion-Laucher` |
| Framework | Vite | Vite |
| Root Directory | `.` | `.` |
| Node.js | 22.x | 22.x |
| Install command | `npx pnpm@10 install --no-frozen-lockfile --config.strict-peer-dependencies=false` | igual |
| Build command | `npx pnpm@10 run build:tv` | `npx pnpm@10 run build:mrl` |
| Output directory | `dist/tv-preview` | `dist/mrl-pwa` |

O arquivo `vercel.json` na raiz define fallback para as rotas de navegação SPA. Não crie funções serverless, banco de dados ou cron desnecessários.

## Instalar MRL no celular
Publicar o MRL por HTTPS, abrir no navegador do celular e escolher **Adicionar à tela inicial / Instalar aplicativo**. O service worker armazena somente o shell e assets do PWA, não comandos remotos pendentes.

## Importante
- **MRL web ≠ controle Android real.** A versão atual é uma demonstração e precisa da bridge local autenticada para enviar comandos.
- **TV Preview ≠ APK Android HOME.** A experiência web serve para desenvolvimento visual; o Android nativo está em `apps/projector-launcher`.
- Não empacotar chaves de APIs comerciais nem credenciais de pareamento no JavaScript público.
- O deploy estático não exige VPS; o GitHub Actions também gera ZIPs dos dois produtos em cada build aprovado.

As configurações acima são instruções de publicação. **Nenhum projeto de hospedagem é criado automaticamente por este arquivo.**

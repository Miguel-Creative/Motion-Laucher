# Motion Laucher: enquadramento inteligente + SteamGridDB

## 1. Objetivo
Preservar o conteúdo de pôsteres verticais e imagens sem proporção de TV, sem esticar rostos, logotipos, personagens nem perder partes importantes no recorte.

## 2. Implementação atual (frontend TV)
- `packages/motion-ui/src/lib/image/smart-framing.ts`: decide pelo aspecto real do arquivo (`naturalWidth/naturalHeight`) se a arte pode ocupar a tela ou deve usar composição.
- `Artwork.tsx`: imagem panorâmica usa `object-fit:cover` e `object-position` do provedor; vertical/quadrada usa `object-fit:contain`, preservando a arte inteira, com laterais harmonizadas.
- A composição usa a **própria imagem como preenchimento secundário**; não gera personagens, informações ou novos cenários. O modo `leve` desliga a camada de desfoque para poupar a RAM do HY300por.
- Recurso automático sem instalação de modelo de IA, sem processamento pesado constante, sem envio de imagens para um serviço externo de IA.
- Detectar proporções localmente é mais robusto do que modelos generativos para títulos protegidos. Caso seja desejado um recurso futuro de expansão generativa (*outpainting*), deverá ser opcional, acionado **apenas quando uma imagem não possuir alternativa panorâmica**, com aprovação do titular quando necessária e custo controlado. Nunca alterar o original salvo.

A Cloudflare Images também dispõe de enquadramento por saliência `gravity=auto` em transformações de imagem, mas requer habilitar o serviço na conta/zone e verificar custos/termos de cada imagem. Não está ativado no Worker atual.

## 3. SteamGridDB integrado
O Worker `apps/catalog-worker/index.ts` usa REST diretamente, sem biblioteca Node residente:
1. `RAWG_API_KEY` alimenta os títulos e informações dos jogos.
2. Quando o usuário abre a galeria de um jogo, a fonte RAWG fornece o nome real.
3. Se `STEAMGRIDDB_API_KEY` estiver configurada, o Worker procura uma **correspondência exata do nome** no SteamGridDB e solicita até 6 artes `hero` horizontais, sem baixar todo o catálogo.
4. Se a busca falhar ou a chave faltar, as imagens RAWG permanecem disponíveis; a UI não pode anunciar SteamGridDB como ativo quando não houver imagens dessa fonte.

**Chaves necessárias** em Cloudflare → Workers & Pages → motion-laucher → Settings → Variables and Secrets → Secrets:
- `RAWG_API_KEY` — [RAWG](https://rawg.io/apidocs)
- `STEAMGRIDDB_API_KEY` — [SteamGridDB API](https://www.steamgriddb.com/api/v2)
- `TMDB_READ_TOKEN` — [TMDB](https://developer.themoviedb.org/docs/getting-started)

Não enviar chaves para o GitHub, neste chat ou nas variáveis `VITE_*`. A integração preserva links e créditos dos provedores.

O cliente oficial MIT está fixado em `upstream/research-steamgriddb-client` apenas como **referência opcional**, não como dependência do APK nem do Worker. O pacote não deve ser carregado no HY300por.

## 4. Hospedagem
- O APK Android continua independente da Cloudflare e não usa VPS; a adaptação de wallpapers deverá ser portada para ele posteriormente.
- A prévia da TV e a API de catálogos usam o Worker `motion-laucher`.
- A implantação Cloudflare via Git está conectada, **mas commits recentes apresentaram status de Workers Builds failure**. Build GitHub Actions verde ≠ deploy Cloudflare publicado.
- Existe workflow alternativo `.github/workflows/deploy-cloudflare.yml` preparado para publicar com GitHub Actions caso o usuário configure os secrets de implantação (separados dos de catálogo). Ele não pode implantar até as credenciais serem configuradas.

## 5. Referências
- Cloudflare [transformações de imagem](https://developers.cloudflare.com/images/optimization/features/) — `gravity=auto`, `cover`, `contain`, `pad`.
- Cloudflare [Workers Builds](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/) — Build + Deploy como etapas distintas.
- SteamGridDB [node-steamgriddb MIT](https://github.com/SteamGridDB/node-steamgriddb) — API wrapper oficial.

# Fontes, commits e licenças

Fontes externas estão vinculadas por `git submodule`, fixadas em commits específicos para reproduzibilidade. O código dos submódulos não entra nos builds automaticamente. Auditar LICENSE/NOTICE em cada atualização.

| Fonte | Licença constatada | Papel | Commit fixado |
|---|---|---|---|
| [Plume](https://github.com/aradhyas8/Plume_Launcher) | GPL-3.0 | Launcher visual | `33e93b2` |
| [Glass Launcher](https://github.com/B0redDev/glass-launcher) | MIT | UI vidro | `c86e377` |
| [TV Home](https://github.com/Deepu-mohan/tv-home-launcher) | MIT | UI/dock | `aa72240` |
| [ADB Remote](https://github.com/joonshakya/adb-remote) | GPL-3.0 | ADB/remoto | `7e8e713` |
| [Android BT Remote](https://github.com/jqssun/android-bt-remote) | GPL-3.0 | Bluetooth HID | `035a3af` |
| [AltRemote](https://github.com/soupfly/AltRemote) | MIT | Android TV Remote v2 | `85394f5` |
| [Webmote](https://github.com/maxhayim/webmote) | MIT | Controle local leve | `8f17fec` |
| [TV Remote Web](https://github.com/Legvan/tv-remote) | MIT | Frontend remoto | `5a9df87` |
| [TvToolsPro](https://github.com/deekshith0509/TvToolsPro) | **Nenhuma licença explícita encontrada** | Pesquisa técnica | `4ed602c` |

**TvToolsPro:** a publicação como repositório público e a palavra "open-source" no README não concedem, sozinhas, autorização para copiar e redistribuir código. Submódulo em `upstream/research-tvtoolspro` exclusivamente como apontador para estudo, excluído de builds. Contatar mantenedor para esclarecer a licença; como alternativa, reimplementar comportamentos com código próprio.

**Licenças GPL:** o uso de módulos GPL exige manter avisos, incluir código-fonte correspondente quando distribuído, e verificar se a versão é compatível. Não importar ADBKeyBoard GPL-2.0-only em um único binário GPL-3.0 antes de parecer/licença compatível; podemos desenvolver IME próprio ou avaliar como app separado.

**Imagens:** artes comerciais de jogos, filmes e séries não são automaticamente licenciadas para redistribuição. Catálogo inicial com placeholders e imagens fornecidas/autorizadas; provedores opcionais sujeitos a termos e atribuições.

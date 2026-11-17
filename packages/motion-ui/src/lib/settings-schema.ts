import {
  Palette, Sparkles, Image, Projector, Gauge, LayoutGrid, Gamepad2, Clapperboard, Tv2,
  Keyboard, Volume2, Wifi, Users, Accessibility, Bell, HardDrive, ShieldCheck, Terminal,
  Workflow, Plug, LifeBuoy, RefreshCw, Info, type LucideIcon,
} from "lucide-react";

export type SettingValue = string | number | boolean | string[];

/**
 * local       → works fully inside this frontend prototype
 * demo        → simulated, clearly labeled "Demonstração"
 * ponte       → requires the native Android companion bridge (not present)
 * indisponivel→ not available on this device/protocol
 */
export type Availability = "local" | "demo" | "ponte" | "indisponivel";

export type SettingType = "toggle" | "slider" | "select" | "segmented" | "multi" | "text" | "action";

export interface SettingOption {
  value: string;
  label: string;
}

export interface SettingDef {
  id: string;
  label: string;
  description: string;
  type: SettingType;
  default?: SettingValue;
  options?: SettingOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  availability?: Availability;
  action?: string;
  actionLabel?: string;
  destructive?: boolean;
  secret?: boolean;
  placeholder?: string;
}

export type SectionPreview = "theme" | "motion" | "wallpaper" | "projector" | "performance" | "profile" | "remote" | "none";

export interface SettingSection {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  preview?: SectionPreview;
  items: SettingDef[];
}

const o = (...pairs: [string, string][]): SettingOption[] => pairs.map(([value, label]) => ({ value, label }));

export const THEME_OPTIONS = o(
  ["obsidian-amber", "Obsidian Amber"],
  ["cyber-neon", "Cyber Neon"],
  ["aurora", "Aurora"],
  ["retro-arcade", "Retro Arcade"],
  ["minimal-oled", "Minimal OLED"],
);

export const VISUAL_MODE_OPTIONS = o(["leve", "Leve"], ["equilibrado", "Equilibrado"], ["cinematografico", "Cinematográfico"]);

export const ROTATION_OPTIONS = o(
  ["off", "Desligado"], ["10s", "10 segundos"], ["30s", "30 segundos"], ["1m", "1 min"], ["5m", "5 min"], ["15m", "15 min"], ["30m", "30 min"],
  ["1h", "1 hora"], ["daily", "Diário"], ["custom", "Personalizado"],
);

export const WALLPAPER_KINDS = ["Jogos", "Filmes", "Séries", "Anime", "Misto", "Meus Wallpapers"] as const;

export const SETTINGS_SECTIONS: SettingSection[] = [
  {
    id: "appearance", label: "Aparência e Temas", icon: Palette, preview: "theme",
    description: "Tema, cor de destaque, escala da interface e elementos da tela inicial.",
    items: [
      { id: "appearance.theme", label: "Tema", description: "Paleta completa da interface da TV e do MRL.", type: "select", default: "obsidian-amber", options: THEME_OPTIONS },
      { id: "appearance.accent", label: "Cor de destaque", description: "Sobrepõe a cor principal do tema. \"Do tema\" mantém a original.", type: "segmented", default: "theme", options: o(["theme", "Do tema"], ["amber", "Âmbar"], ["cyan", "Ciano"], ["indigo", "Índigo"], ["gold", "Ouro"]) },
      { id: "appearance.uiScale", label: "Escala da interface", description: "Tamanho geral de textos e cartões na TV. Útil para projeções grandes ou distantes.", type: "slider", default: 100, min: 80, max: 130, step: 5, unit: "%" },
      { id: "appearance.cardSize", label: "Tamanho dos cartões", description: "Densidade das fileiras na tela inicial.", type: "segmented", default: "medio", options: o(["compacto", "Compacto"], ["medio", "Médio"], ["grande", "Grande"]) },
      { id: "appearance.clockFormat", label: "Formato do relógio", description: "Exibição da hora na barra superior.", type: "segmented", default: "24h", options: o(["24h", "24 horas"], ["12h", "12 horas"]) },
      { id: "appearance.showSeconds", label: "Mostrar segundos", description: "Adiciona segundos ao relógio (consome um pouco mais de renderização).", type: "toggle", default: false },
      { id: "appearance.showWeather", label: "Mostrar clima", description: "Widget de clima na barra superior. Sem chave de API, exibe dados de demonstração.", type: "toggle", default: true, availability: "demo" },
      { id: "appearance.heroStyle", label: "Estilo do destaque", description: "Como o painel principal apresenta o conteúdo em foco.", type: "segmented", default: "cinema", options: o(["cinema", "Cinema"], ["compacto", "Compacto"], ["oculto", "Oculto"]) },
      { id: "appearance.showLabels", label: "Nomes abaixo dos apps", description: "Mostra o nome de cada app sob o ícone.", type: "toggle", default: true },
    ],
  },
  {
    id: "motion", label: "Movimento e Animações", icon: Sparkles, preview: "motion",
    description: "Transições, foco animado, parallax e partículas.",
    items: [
      { id: "motion.speed", label: "Velocidade das animações", description: "Multiplicador global da duração das transições.", type: "slider", default: 1, min: 0.5, max: 2, step: 0.1, unit: "×" },
      { id: "motion.focusEffect", label: "Efeito de foco", description: "Como o item selecionado pelo controle é destacado.", type: "segmented", default: "glow", options: o(["glow", "Brilho"], ["escala", "Escala"], ["borda", "Borda"]) },
      { id: "motion.heroFollowsFocus", label: "Destaque segue o foco", description: "A arte de fundo acompanha o cartão selecionado.", type: "toggle", default: true },
      { id: "motion.parallax", label: "Parallax espacial", description: "Leve deslocamento de profundidade no fundo conforme o foco se move.", type: "toggle", default: true },
      { id: "motion.particles", label: "Partículas de luz", description: "Partículas sutis sobre o fundo (desativadas no modo Leve).", type: "toggle", default: true },
      { id: "motion.cardTilt", label: "Inclinação dos cartões", description: "Profundidade 3D ao focar cartões de jogos e filmes.", type: "toggle", default: true },
      { id: "motion.pageTransition", label: "Transição entre telas", description: "Animação ao trocar de seção.", type: "segmented", default: "deslizar", options: o(["deslizar", "Deslizar"], ["esmaecer", "Esmaecer"], ["nenhuma", "Nenhuma"]) },
      { id: "motion.reduce", label: "Reduzir movimento", description: "Remove animações contínuas e efeitos de profundidade.", type: "toggle", default: false },
    ],
  },
  {
    id: "wallpaper", label: "Wallpapers", icon: Image, preview: "wallpaper",
    description: "Rotação automática, mistura de categorias, transições e cache.",
    items: [
      { id: "wallpaper.rotation", label: "Rotação automática", description: "Intervalo para trocar o wallpaper.", type: "select", default: "10s", options: ROTATION_OPTIONS },
      { id: "wallpaper.customSeconds", label: "Tempo personalizado", description: "Quando Personalizado estiver selecionado: 10 segundos a 60 minutos.", type: "slider", default: 30, min: 10, max: 3600, step: 5, unit: " s" },
      { id: "wallpaper.order", label: "Ordem", description: "Sequencial segue o catálogo; aleatória sorteia o próximo.", type: "segmented", default: "random", options: o(["random", "Aleatória"], ["sequential", "Sequencial"]) },
      { id: "wallpaper.mix", label: "Mistura de categorias", description: "Categorias que entram na rotação.", type: "multi", default: ["Jogos", "Filmes", "Séries", "Anime"], options: WALLPAPER_KINDS.map((k) => ({ value: k, label: k })) },
      { id: "wallpaper.transition", label: "Estilo de transição", description: "Animação ao trocar de wallpaper.", type: "segmented", default: "fade", options: o(["fade", "Esmaecer"], ["zoom", "Zoom"], ["slide", "Deslizar"], ["blur", "Desfoque"], ["none", "Nenhuma"]) },
      { id: "wallpaper.kenBurns", label: "Movimento lento (Ken Burns)", description: "Zoom suave contínuo sobre a arte. Desligado no modo Leve.", type: "toggle", default: true },
      { id: "wallpaper.pauseOnPlayback", label: "Pausar durante reprodução", description: "Congela a rotação quando um vídeo ou jogo está em execução.", type: "toggle", default: true },
      { id: "wallpaper.maxResolution", label: "Resolução máxima", description: "Limita o tamanho decodificado da imagem para economizar memória.", type: "segmented", default: "auto", options: o(["auto", "Automática"], ["720p", "720p"], ["1080p", "1080p"], ["4k", "4K"]) },
      { id: "wallpaper.cacheMb", label: "Cache de wallpapers", description: "Espaço máximo para imagens em cache local.", type: "slider", default: 48, min: 16, max: 256, step: 16, unit: " MB" },
      { id: "wallpaper.openStudio", label: "Estúdio de Wallpapers", description: "Catálogo completo, galerias alternativas e ajustes do projetor.", type: "action", action: "open-wallpapers", actionLabel: "Abrir estúdio" },
    ],
  },
  {
    id: "display", label: "Tela e Projeção", icon: Projector, preview: "projector",
    description: "Correção física da projeção (Zoom, posição e Keystone) e ajustes visuais dos wallpapers.",
    items: [
      { id: "display.keystone", label: "Correção da tela: Zoom e Keystone", description: "Abre os ajustes originais do HY300por para corrigir tamanho, orientação e os quatro cantos da projeção. Não é o aplicativo Kodi.", type: "action", action: "open-projector-settings", actionLabel: "Corrigir projeção" },
      { id: "projector.enabled", label: "Preset Projetor", description: "Aplica correção de imagem às artes. É processamento no app: não aumenta os lúmens reais do aparelho.", type: "toggle", default: true },
      { id: "projector.brightness", label: "Brilho da arte", description: "Clareia as imagens de fundo e cartões.", type: "slider", default: 112, min: 50, max: 180, step: 1, unit: "%" },
      { id: "projector.gamma", label: "Gama", description: "Valores acima de 1 clareiam os tons médios sem estourar os claros.", type: "slider", default: 1.2, min: 0.6, max: 2.2, step: 0.05 },
      { id: "projector.contrast", label: "Contraste", description: "Separação entre tons claros e escuros.", type: "slider", default: 104, min: 50, max: 160, step: 1, unit: "%" },
      { id: "projector.saturation", label: "Saturação", description: "Intensidade geral das cores.", type: "slider", default: 118, min: 40, max: 200, step: 1, unit: "%" },
      { id: "projector.vibrance", label: "Vibração", description: "Realça cores pouco saturadas (aproximação por filtro).", type: "slider", default: 30, min: 0, max: 100, step: 1, unit: "%" },
      { id: "projector.shadowDetail", label: "Detalhe de sombras", description: "Levanta as áreas escuras para revelar personagens em projeção.", type: "slider", default: 35, min: 0, max: 100, step: 1, unit: "%" },
      { id: "projector.overlay", label: "Força do véu de texto", description: "Escurecimento localizado apenas atrás dos textos. Nunca cobre a arte inteira.", type: "slider", default: 55, min: 0, max: 100, step: 1, unit: "%" },
      { id: "projector.blur", label: "Desfoque do fundo", description: "Desfoque aplicado à arte de fundo (0 = nítido).", type: "slider", default: 0, min: 0, max: 20, step: 1, unit: " px" },
      { id: "display.resolution", label: "Resolução de saída", description: "Lida pelo sistema Android. Alterar exige a ponte nativa.", type: "segmented", default: "720p", options: o(["720p", "1280×720"], ["1080p", "1920×1080"], ["4k", "3840×2160"]), availability: "ponte" },
      { id: "display.overscan", label: "Margem de segurança (overscan)", description: "Afasta a interface das bordas da projeção.", type: "slider", default: 0, min: 0, max: 8, step: 1, unit: "%" },
      { id: "display.hardwareBrightness", label: "Brilho do projetor (hardware)", description: "Intensidade real da lâmpada/LED. Só pela ponte e se o firmware expuser a função.", type: "slider", default: 80, min: 0, max: 100, step: 1, unit: "%", availability: "ponte" },
    ],
  },
  {
    id: "performance", label: "Desempenho", icon: Gauge, preview: "performance",
    description: "Modos Leve, Equilibrado e Cinematográfico para hardware modesto.",
    items: [
      { id: "performance.visualMode", label: "Modo visual", description: "Leve: sem desfoque, partículas ou loops; imagem estática reduzida. Cinematográfico: todos os efeitos.", type: "segmented", default: "equilibrado", options: VISUAL_MODE_OPTIONS },
      { id: "performance.lazyRows", label: "Renderização sob demanda", description: "Carrega imagens das fileiras somente quando ficam visíveis.", type: "toggle", default: true },
      { id: "performance.pauseHidden", label: "Pausar quando oculto", description: "Suspende animações e rotação quando a tela não está visível.", type: "toggle", default: true },
      { id: "performance.imageCache", label: "Cache de imagens em memória", description: "Quantidade de artes mantidas decodificadas.", type: "slider", default: 12, min: 4, max: 40, step: 2, unit: " imagens" },
      { id: "performance.fpsCap", label: "Limite de quadros das animações", description: "Indicativo para a versão nativa; no navegador o limite é do sistema.", type: "segmented", default: "60", options: o(["30", "30 fps"], ["60", "60 fps"]), availability: "demo" },
      { id: "performance.killBackground", label: "Encerrar apps em segundo plano", description: "Libera RAM ao voltar à tela inicial. Requer permissões via ponte.", type: "toggle", default: false, availability: "ponte" },
      { id: "performance.note", label: "Sobre medições", description: "O tamanho do pacote JavaScript não equivale ao consumo de RAM, e este protótipo web não comprova o desempenho da versão Android nativa.", type: "action", action: "perf-info", actionLabel: "Entendi" },
    ],
  },
  {
    id: "apps", label: "Aplicativos", icon: LayoutGrid,
    description: "Fixar, ordenar, ocultar e categorizar apps.",
    items: [
      { id: "apps.sort", label: "Ordenação da grade", description: "Critério padrão da lista de apps.", type: "segmented", default: "custom", options: o(["custom", "Personalizada"], ["name", "Nome"], ["recent", "Recentes"]) },
      { id: "apps.showSystem", label: "Mostrar apps de sistema", description: "Inclui apps do sistema na biblioteca.", type: "toggle", default: false },
      { id: "apps.showHidden", label: "Mostrar apps ocultos", description: "Exibe temporariamente os apps ocultos (com marcação).", type: "toggle", default: false },
      { id: "apps.categories", label: "Categorias exibidas", description: "Categorias com fileira própria na tela inicial.", type: "multi", default: ["Streaming", "Jogos", "Música", "Utilitários"], options: o(["Streaming", "Streaming"], ["Jogos", "Jogos"], ["Música", "Música"], ["Mídia", "Mídia"], ["Utilitários", "Utilitários"], ["Sistema", "Sistema"]) },
      { id: "apps.confirmLaunch", label: "Tela de abertura animada", description: "Mostra uma transição ao abrir um app.", type: "toggle", default: true },
      { id: "apps.resetLayout", label: "Restaurar layout de apps", description: "Desfaz fixações, ordem e ocultações.", type: "action", action: "reset-apps", actionLabel: "Restaurar", destructive: true },
    ],
  },
  {
    id: "games", label: "Jogos", icon: Gamepad2,
    description: "Biblioteca, emuladores e controles de jogo.",
    items: [
      { id: "games.showLibrary", label: "Fileira da biblioteca", description: "Mostra a biblioteca de jogos na tela inicial.", type: "toggle", default: true },
      { id: "games.gameMode", label: "Modo jogo", description: "Ao abrir um jogo: desativa rotação, partículas e notificações.", type: "toggle", default: true },
      { id: "games.controllerHints", label: "Dicas de botões do controle", description: "Mostra legendas A/B/X/Y nas telas.", type: "toggle", default: true },
      { id: "games.gamepadLayout", label: "Layout do gamepad", description: "Rótulos de botões exibidos.", type: "segmented", default: "xbox", options: o(["xbox", "Xbox"], ["playstation", "PlayStation"], ["nintendo", "Nintendo"]) },
      { id: "games.retroScan", label: "Procurar ROMs em pastas locais", description: "Indexação de pastas exige permissão de armazenamento via app nativo.", type: "toggle", default: false, availability: "ponte" },
      { id: "games.artSource", label: "Fonte de capas de jogos", description: "Provedor usado quando houver chave configurada.", type: "segmented", default: "rawg", options: o(["rawg", "RAWG"], ["igdb", "IGDB"], ["steamgriddb", "SteamGridDB"]) },
    ],
  },
  {
    id: "media", label: "Filmes e Séries", icon: Clapperboard,
    description: "Atalhos de streaming e metadados de catálogo.",
    items: [
      { id: "media.showRow", label: "Fileira de filmes e séries", description: "Exibe destaques na tela inicial.", type: "toggle", default: true },
      { id: "media.continueWatching", label: "Continuar assistindo", description: "Mostra progresso de títulos recentes (dados de demonstração).", type: "toggle", default: true, availability: "demo" },
      { id: "media.region", label: "Região do catálogo", description: "Usada para disponibilidade e classificação indicativa.", type: "select", default: "BR", options: o(["BR", "Brasil"], ["PT", "Portugal"], ["US", "Estados Unidos"]) },
      { id: "media.ageRating", label: "Classificação máxima", description: "Oculta títulos acima da classificação escolhida.", type: "segmented", default: "18", options: o(["L", "Livre"], ["12", "12"], ["16", "16"], ["18", "18"]) },
      { id: "media.metaLanguage", label: "Idioma dos metadados", description: "Idioma preferido para títulos e sinopses.", type: "select", default: "pt-BR", options: o(["pt-BR", "Português (Brasil)"], ["en-US", "Inglês"], ["es-ES", "Espanhol"]) },
    ],
  },
  {
    id: "remote", label: "Controle Remoto", icon: Tv2, preview: "remote",
    description: "MRL, pareamento e comportamento do D-pad.",
    items: [
      { id: "remote.repeatDelay", label: "Atraso de repetição", description: "Tempo antes de repetir uma seta pressionada.", type: "slider", default: 350, min: 150, max: 800, step: 25, unit: " ms" },
      { id: "remote.wrapNavigation", label: "Navegação circular nas fileiras", description: "Ao chegar ao fim de uma fileira, volta ao início.", type: "toggle", default: false },
      { id: "remote.longPressMenu", label: "Pressão longa abre menu", description: "Segurar OK abre opções do item.", type: "toggle", default: true },
      { id: "remote.haptics", label: "Vibração no celular", description: "Feedback tátil no MRL (quando o navegador suporta).", type: "toggle", default: true },
      { id: "remote.sounds", label: "Sons de clique", description: "Som curto ao tocar nos botões do MRL.", type: "toggle", default: false },
      { id: "remote.pairing", label: "Parear dispositivo", description: "Pareamento simulado nesta demonstração; o real exige a ponte Android.", type: "action", action: "open-remote", actionLabel: "Abrir MRL", availability: "demo" },
      { id: "remote.cec", label: "HDMI-CEC", description: "Controle via cabo HDMI depende do hardware e da ponte.", type: "toggle", default: false, availability: "ponte" },
    ],
  },
  {
    id: "input", label: "Teclado e Mouse", icon: Keyboard,
    description: "Entrada de texto, ponteiro e trackpad.",
    items: [
      { id: "input.pointerSpeed", label: "Velocidade do ponteiro", description: "Sensibilidade do trackpad do MRL.", type: "slider", default: 1.4, min: 0.4, max: 3, step: 0.1, unit: "×" },
      { id: "input.acceleration", label: "Aceleração do ponteiro", description: "Movimentos rápidos percorrem distâncias maiores.", type: "toggle", default: true },
      { id: "input.naturalScroll", label: "Rolagem natural", description: "Inverte a direção da rolagem com dois dedos.", type: "toggle", default: true },
      { id: "input.tapToClick", label: "Tocar para clicar", description: "Toque rápido no trackpad equivale a clique.", type: "toggle", default: true },
      { id: "input.pointerMode", label: "Modo de ponteiro", description: "Trackpad usa serviço de acessibilidade via ponte; HID Bluetooth emula um mouse real e exige app nativo.", type: "segmented", default: "trackpad", options: o(["trackpad", "Trackpad (ponte)"], ["hid", "HID Bluetooth"]), availability: "ponte" },
      { id: "input.textMode", label: "Envio de texto", description: "IME do Motion Laucher suporta acentos e Unicode; \"input text\" via ADB não suporta Unicode de forma confiável.", type: "segmented", default: "ime", options: o(["ime", "IME (Unicode)"], ["adb", "ADB input text"]), availability: "ponte" },
      { id: "input.keyboardLayout", label: "Layout do teclado físico", description: "Para teclados USB/Bluetooth conectados ao projetor.", type: "select", default: "abnt2", options: o(["abnt2", "ABNT2 (Brasil)"], ["us-intl", "EUA Internacional"], ["pt", "Portugal"]) },
    ],
  },
  {
    id: "audio", label: "Áudio e Mídia", icon: Volume2,
    description: "Sons da interface, volume e saída de áudio.",
    items: [
      { id: "audio.uiSounds", label: "Sons da interface", description: "Efeitos curtos ao navegar.", type: "toggle", default: false },
      { id: "audio.uiVolume", label: "Volume dos efeitos", description: "Volume dos sons de navegação.", type: "slider", default: 40, min: 0, max: 100, step: 5, unit: "%" },
      { id: "audio.ambient", label: "Trilha ambiente na tela inicial", description: "Música suave em loop (desativada no modo Leve).", type: "toggle", default: false },
      { id: "audio.output", label: "Saída de áudio", description: "Selecionar saída exige a ponte Android.", type: "select", default: "speaker", options: o(["speaker", "Alto-falante interno"], ["hdmi", "HDMI ARC"], ["bt", "Bluetooth"]), availability: "ponte" },
      { id: "audio.normalize", label: "Normalizar volume entre apps", description: "Requer serviço de áudio nativo.", type: "toggle", default: false, availability: "indisponivel" },
    ],
  },
  {
    id: "network", label: "Rede e Conectividade", icon: Wifi,
    description: "Estado da rede, ponte do MRL e modo offline.",
    items: [
      { id: "network.offlineMode", label: "Modo offline", description: "Usa apenas catálogo de demonstração e imagens locais.", type: "toggle", default: false },
      { id: "network.bridgePort", label: "Porta da ponte", description: "Porta local da ponte do MRL na rede doméstica.", type: "text", default: "8765", placeholder: "8765" },
      { id: "network.discovery", label: "Descoberta automática (mDNS)", description: "Encontrar o projetor na rede local. Requer a ponte nativa.", type: "toggle", default: true, availability: "ponte" },
      { id: "network.adbWifi", label: "Depuração ADB por Wi-Fi", description: "Ativada nas opções de desenvolvedor do Android, nunca por este app.", type: "toggle", default: false, availability: "indisponivel" },
      { id: "network.testConnection", label: "Testar conectividade", description: "Verifica se o navegador está online.", type: "action", action: "test-network", actionLabel: "Testar" },
    ],
  },
  {
    id: "profiles", label: "Perfis de Usuário", icon: Users, preview: "profile",
    description: "Estilos da interface, separados da identidade do usuário Google.",
    items: [
      { id: "profiles.active", label: "Estilo da tela", description: "Define a ordem das fileiras e o destaque visual; não representa uma conta Google.", type: "segmented", default: "hibrido", options: o(["gamer", "Gamer"], ["cinema", "Cinema"], ["hibrido", "Híbrido"], ["minimalista", "Minimalista"], ["personalizado", "Personalizado"]) },
      { id: "profiles.name", label: "Nome local de exibição", description: "Usado na prévia web. A conta Google do projetor exigirá login autorizado no aplicativo Android.", type: "text", default: "", placeholder: "Seu nome (opcional)" },
      { id: "profiles.customRows", label: "Fileiras do perfil Personalizado", description: "Seções exibidas quando o perfil Personalizado está ativo.", type: "multi", default: ["favoritos", "jogos", "filmes", "apps", "acoes"], options: o(["favoritos", "Favoritos"], ["recentes", "Recentes"], ["jogos", "Jogos"], ["filmes", "Filmes e Séries"], ["streaming", "Streaming"], ["apps", "Categorias de apps"], ["hdmi", "Entradas HDMI"], ["acoes", "Ações rápidas"], ["dispositivo", "Dispositivo"]) },
      { id: "profiles.pin", label: "PIN para trocar de perfil", description: "Protege perfis com PIN local de 4 dígitos.", type: "toggle", default: false },
      { id: "profiles.kids", label: "Modo infantil", description: "Oculta títulos acima de 12 anos e apps de sistema.", type: "toggle", default: false },
    ],
  },
  {
    id: "accessibility", label: "Acessibilidade", icon: Accessibility,
    description: "Leitura, contraste e tamanho de texto.",
    items: [
      { id: "a11y.largeText", label: "Texto ampliado", description: "Aumenta textos de descrição.", type: "toggle", default: false },
      { id: "a11y.highContrast", label: "Alto contraste nos textos", description: "Reforça o véu atrás dos textos e as bordas de foco.", type: "toggle", default: false },
      { id: "a11y.focusSound", label: "Som ao mudar foco", description: "Bip curto ao navegar com o D-pad.", type: "toggle", default: false },
      { id: "a11y.screenReaderHints", label: "Dicas para leitor de tela", description: "Rótulos extras de acessibilidade em cartões.", type: "toggle", default: true },
      { id: "a11y.colorFilter", label: "Filtro de cor", description: "Simulação para daltonismo aplicada às artes.", type: "select", default: "none", options: o(["none", "Nenhum"], ["protan", "Protanopia"], ["deutan", "Deuteranopia"], ["tritan", "Tritanopia"]), availability: "demo" },
    ],
  },
  {
    id: "notifications", label: "Notificações", icon: Bell,
    description: "Avisos do launcher e do MRL.",
    items: [
      { id: "notify.enabled", label: "Notificações do launcher", description: "Avisos de atualização, catálogo e ponte.", type: "toggle", default: true },
      { id: "notify.position", label: "Posição", description: "Canto da tela para avisos.", type: "segmented", default: "top-right", options: o(["top-right", "Superior direito"], ["bottom-right", "Inferior direito"], ["top-center", "Centro superior"]) },
      { id: "notify.duration", label: "Duração", description: "Tempo de exibição de cada aviso.", type: "slider", default: 4, min: 2, max: 12, step: 1, unit: " s" },
      { id: "notify.doNotDisturb", label: "Não perturbe em reprodução", description: "Silencia avisos durante vídeos e jogos.", type: "toggle", default: true },
      { id: "notify.android", label: "Espelhar notificações do Android", description: "Exige permissão de acesso a notificações via app nativo.", type: "toggle", default: false, availability: "ponte" },
      { id: "notify.test", label: "Enviar aviso de teste", description: "Mostra um aviso agora com as configurações atuais.", type: "action", action: "test-notification", actionLabel: "Testar" },
    ],
  },
  {
    id: "storage", label: "Armazenamento e Cache", icon: HardDrive,
    description: "Uso de espaço local, cache e uploads.",
    items: [
      { id: "storage.uploadQuality", label: "Qualidade de imagens enviadas", description: "Wallpapers enviados são reduzidos para economizar espaço.", type: "segmented", default: "1280", options: o(["960", "960 px"], ["1280", "1280 px"], ["1920", "1920 px"]) },
      { id: "storage.maxUploads", label: "Limite de wallpapers próprios", description: "Máximo armazenado localmente neste navegador.", type: "slider", default: 6, min: 2, max: 12, step: 1, unit: " imagens" },
      { id: "storage.autoClean", label: "Limpeza automática", description: "Remove cache antigo ao atingir o limite.", type: "toggle", default: true },
      { id: "storage.usage", label: "Uso do armazenamento local", description: "Calcula o espaço usado pelas preferências e imagens deste protótipo.", type: "action", action: "storage-usage", actionLabel: "Calcular" },
      { id: "storage.clearCache", label: "Limpar cache", description: "Apaga wallpapers próprios e histórico recente.", type: "action", action: "clear-cache", actionLabel: "Limpar", destructive: true },
    ],
  },
  {
    id: "privacy", label: "Privacidade e Segurança", icon: ShieldCheck,
    description: "Dados locais, chaves de API e permissões.",
    items: [
      { id: "privacy.localOnly", label: "Tudo local", description: "Nenhuma conta, nuvem ou servidor: preferências ficam neste dispositivo.", type: "toggle", default: true },
      { id: "privacy.history", label: "Guardar histórico de uso", description: "Usado para \"Recentes\".", type: "toggle", default: true },
      { id: "privacy.lockSettings", label: "Bloquear ajustes com PIN", description: "Pede PIN local para alterar configurações avançadas.", type: "toggle", default: false },
      { id: "privacy.confirmAdmin", label: "Confirmar ações administrativas", description: "Sempre pedir confirmação e mostrar o plano de reversão.", type: "toggle", default: true },
      { id: "privacy.clearHistory", label: "Apagar histórico", description: "Remove a lista de apps recentes.", type: "action", action: "clear-history", actionLabel: "Apagar", destructive: true },
    ],
  },
  {
    id: "admin", label: "Administração Avançada", icon: Terminal,
    description: "Funções de sistema que dependem da ponte Android.",
    items: [
      { id: "admin.devMode", label: "Modo desenvolvedor do launcher", description: "Mostra registros de comandos e IDs internos.", type: "toggle", default: false },
      { id: "admin.showCommands", label: "Mostrar comando equivalente", description: "Exibe o comando que a ponte executaria (ex.: pm disable-user).", type: "toggle", default: true },
      { id: "admin.defaultLauncher", label: "Definir como launcher padrão", description: "O Android exige que o usuário escolha em Configurações > Apps > App de início.", type: "action", action: "open-recovery", actionLabel: "Ver instruções", availability: "ponte" },
      { id: "admin.zram", label: "Ajustar ZRAM", description: "Tamanho do ZRAM é definido pelo kernel/firmware e exige root.", type: "slider", default: 512, min: 256, max: 1024, step: 128, unit: " MB", availability: "indisponivel" },
      { id: "admin.openDashboard", label: "Painel do sistema", description: "RAM física vs ZRAM, processos e registros no MRL.", type: "action", action: "open-remote", actionLabel: "Abrir no MRL" },
    ],
  },
  {
    id: "automations", label: "Automações", icon: Workflow,
    description: "Macros, gatilhos e agendamentos.",
    items: [
      { id: "auto.enabled", label: "Automações ativas", description: "Permite que macros agendadas sejam executadas.", type: "toggle", default: true },
      { id: "auto.onBoot", label: "Executar ao ligar", description: "Rodar a macro \"Ao ligar\" quando o launcher iniciar.", type: "toggle", default: false, availability: "demo" },
      { id: "auto.nightMode", label: "Modo noite automático", description: "Aplica Minimal OLED e reduz brilho da arte após 22h.", type: "toggle", default: false },
      { id: "auto.stepDelay", label: "Intervalo padrão entre passos", description: "Tempo entre comandos de uma macro.", type: "slider", default: 400, min: 100, max: 2000, step: 50, unit: " ms" },
      { id: "auto.editor", label: "Editor de macros", description: "Crie sequências de teclas, apps e temas.", type: "action", action: "open-remote", actionLabel: "Abrir editor" },
    ],
  },
  {
    id: "integrations", label: "Integrações e Catálogos", icon: Plug,
    description: "Chaves próprias para TMDB, RAWG, IGDB e SteamGridDB.",
    items: [
      { id: "integrations.tmdbKey", label: "TMDB — token de leitura (v4)", description: "Filmes e séries pela API oficial do TMDB. Guardado só neste dispositivo.", type: "text", default: "", secret: true, placeholder: "Cole seu token" },
      { id: "integrations.rawgKey", label: "RAWG — chave de API", description: "Jogos e capas via API RAWG (exige atribuição).", type: "text", default: "", secret: true, placeholder: "Cole sua chave" },
      { id: "integrations.igdbClient", label: "IGDB — Client ID (Twitch)", description: "IGDB exige client secret e não permite chamadas diretas do navegador: requer a ponte.", type: "text", default: "", secret: true, placeholder: "Client ID", availability: "ponte" },
      { id: "integrations.sgdbKey", label: "SteamGridDB — chave de API", description: "Grades e heróis de jogos. Sem CORS para navegador: requer a ponte.", type: "text", default: "", secret: true, placeholder: "Cole sua chave", availability: "ponte" },
      { id: "integrations.imdbLinks", label: "Exibir IDs do IMDb", description: "Apenas IDs/links fornecidos pelo TMDB. Nada é extraído do site do IMDb.", type: "toggle", default: true },
      { id: "integrations.test", label: "Testar provedores", description: "Faz uma requisição real apenas para provedores com chave configurada.", type: "action", action: "test-providers", actionLabel: "Testar" },
    ],
  },
  {
    id: "backup", label: "Backup e Recuperação", icon: LifeBuoy,
    description: "Exportar, importar e restaurar.",
    items: [
      { id: "backup.export", label: "Exportar configurações", description: "Baixa um arquivo JSON com tudo que está salvo neste dispositivo.", type: "action", action: "export-backup", actionLabel: "Exportar" },
      { id: "backup.import", label: "Importar configurações", description: "Restaura a partir de um arquivo JSON exportado.", type: "action", action: "import-backup", actionLabel: "Importar" },
      { id: "backup.onboarding", label: "Refazer configuração inicial", description: "Abre o assistente de boas-vindas.", type: "action", action: "rerun-onboarding", actionLabel: "Abrir" },
      { id: "backup.recovery", label: "Recuperação e launcher original", description: "Restaurar o launcher do fabricante, modo seguro e diagnósticos.", type: "action", action: "open-recovery", actionLabel: "Abrir" },
      { id: "backup.resetAll", label: "Restaurar padrões de fábrica", description: "Apaga todas as preferências do Motion Laucher neste dispositivo.", type: "action", action: "reset-all", actionLabel: "Restaurar tudo", destructive: true },
    ],
  },
  {
    id: "updates", label: "Atualizações", icon: RefreshCw,
    description: "Canal e verificação de versões.",
    items: [
      { id: "updates.channel", label: "Canal", description: "Estável recebe versões testadas; Beta recebe novidades antes.", type: "segmented", default: "estavel", options: o(["estavel", "Estável"], ["beta", "Beta"]) },
      { id: "updates.auto", label: "Atualizar automaticamente", description: "No Android, a instalação de APK sempre pede confirmação do usuário.", type: "toggle", default: true, availability: "ponte" },
      { id: "updates.check", label: "Procurar atualizações", description: "Consulta o repositório oficial no GitHub (somente leitura).", type: "action", action: "check-updates", actionLabel: "Procurar" },
    ],
  },
  {
    id: "about", label: "Sobre", icon: Info,
    description: "Versão, licenças e créditos.",
    items: [
      { id: "about.version", label: "Motion Laucher — protótipo web 0.1.0", description: "Interface de referência. A versão de produção será nativa (Kotlin/Java) para Android 11 ARMv7.", type: "action", action: "about", actionLabel: "Detalhes" },
      { id: "about.repo", label: "Projeto oficial", description: "github.com/Miguel-Creative/Motion-Laucher", type: "action", action: "open-repo", actionLabel: "Abrir" },
      { id: "about.attribution", label: "Atribuições e artes", description: "Artes de demonstração geradas para este protótipo. Catálogos reais exibem a atribuição de cada provedor.", type: "action", action: "attribution", actionLabel: "Ver" },
    ],
  },
];

export const ALL_SETTINGS: SettingDef[] = SETTINGS_SECTIONS.flatMap((s) => s.items);

export const SETTING_DEFAULTS: Record<string, SettingValue> = Object.fromEntries(
  ALL_SETTINGS.filter((d) => d.type !== "action" && d.default !== undefined).map((d) => [d.id, d.default as SettingValue]),
);

export function findSetting(id: string): SettingDef | undefined {
  return ALL_SETTINGS.find((d) => d.id === id);
}

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  local: "Funciona",
  demo: "Em breve",
  ponte: "Em breve · integração Android",
  indisponivel: "Indisponível neste aparelho",
};

/** Availability is an implementation classification, not a hardware certification.
 * The TV has no /remote route; phone-only settings must not look operational here. */
export function settingStatus(def: SettingDef, tv = false) {
  const implemented = def.type === "action" || def.id.startsWith("projector.") || ["appearance.theme", "appearance.accent", "motion.speed", "motion.focusEffect", "motion.reduce", "performance.visualMode", "performance.pauseHidden", "wallpaper.rotation", "wallpaper.customSeconds", "wallpaper.order", "wallpaper.mix", "wallpaper.pauseOnPlayback", "wallpaper.maxResolution", "profiles.active", "profiles.name", "privacy.history", "storage.uploadQuality", "storage.maxUploads", "input.pointerSpeed", "a11y.highContrast", "notify.duration"].includes(def.id);
  const availability = tv && (def.action === "open-remote" || def.id === "input.pointerSpeed")
      ? "demo" : def.availability ?? (implemented ? "local" : "demo");
  const label = def.secret ? "Em breve · integração de API" : AVAILABILITY_LABEL[availability];
  return { availability, label, ready: !def.secret && availability === "local" };
}

export const SPEC_ROTATION_MS: Record<string, number> = {
  "10s": 10_000, "30s": 30_000, "1m": 60_000, "5m": 300_000, "15m": 900_000, "30m": 1_800_000, "1h": 3_600_000, daily: 86_400_000,
};

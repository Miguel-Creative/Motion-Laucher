import type { ArtId } from "./art";

export type LibraryType = "jogo" | "filme" | "serie";

export interface LibraryItem {
  id: string;
  title: string;
  type: LibraryType;
  art: ArtId;
  genres: string[];
  year: number;
  rating: string;
  /** app id used to "open" the item (simulated) */
  appId: string;
  platform: string;
  progress?: number;
  tagline: string;
  description: string;
  meta: string;
  gallery: ArtId[];
}

// Original fictional demo titles — no real catalog data is presented as live.
export const LIBRARY: LibraryItem[] = [
  { id: "lamina-ambar", title: "Lâmina de Âmbar", type: "jogo", art: "ember", genres: ["RPG", "Ação", "Mundo Aberto"], year: 2025, rating: "14", appId: "steamlink", platform: "PC · Steam Link", progress: 62, tagline: "O reino desperta ao amanhecer.", description: "Uma cavaleira empunha a última espada de âmbar para unir cidades suspensas sobre cachoeiras douradas. Combate fluido, mundo aberto vertical e dragões ancestrais.", meta: "48 h jogadas", gallery: ["ember", "dragon", "sky"] },
  { id: "neon-drift", title: "Neon Drift 2099", type: "jogo", art: "neon", genres: ["Corrida", "Cyberpunk", "Ação"], year: 2024, rating: "12", appId: "xcloud", platform: "Nuvem", progress: 30, tagline: "A cidade nunca para de acelerar.", description: "Corridas a 400 km/h em avenidas suspensas de uma megacidade neon. Rivais, hologramas e trilha synthwave.", meta: "12 h jogadas", gallery: ["neon", "retro", "rally"] },
  { id: "ecos-dragao", title: "Ecos do Dragão", type: "jogo", art: "dragon", genres: ["Aventura", "Fantasia", "RPG"], year: 2023, rating: "10", appId: "retroarch", platform: "Retrô · RetroArch", tagline: "Voe sobre o vale escarlate.", description: "Monte um dragão de escamas iridescentes e explore lagos turquesa, florestas de outono e templos nas montanhas.", meta: "Novo", gallery: ["dragon", "ember", "sky"] },
  { id: "rally-costa", title: "Rally Costa Dourada", type: "jogo", art: "rally", genres: ["Corrida", "Esportes", "Simulação"], year: 2025, rating: "L", appId: "steamlink", platform: "PC · Steam Link", progress: 85, tagline: "Curvas entre o mar e o penhasco.", description: "Drift em estradas costeiras ao pôr do sol, com física realista e clima dinâmico.", meta: "31 h jogadas", gallery: ["rally", "neon", "retro"] },
  { id: "arcade-horizonte", title: "Arcade Horizonte", type: "jogo", art: "retro", genres: ["Retrô", "Ritmo", "Corrida"], year: 1987, rating: "L", appId: "retroarch", platform: "Retrô · RetroArch", tagline: "O sol nunca se põe em 1987.", description: "Corrida de ritmo na grade neon, com fliperama clássico remasterizado.", meta: "Fliperama", gallery: ["retro", "neon"] },
  { id: "mansao-luar", title: "Mansão do Luar", type: "jogo", art: "moon", genres: ["Terror", "Mistério", "Stealth"], year: 2024, rating: "16", appId: "steamlink", platform: "PC · Steam Link", tagline: "Uma lanterna. Um castelo. Nenhuma saída.", description: "Investigue o castelo sobre o lago enevoado. Puzzles ambientais e suspense psicológico.", meta: "6 h jogadas", progress: 18, gallery: ["moon", "ember"] },
  { id: "ilhas-ceu", title: "Ilhas do Céu", type: "jogo", art: "sky", genres: ["Plataforma", "Aventura", "Cooperativo"], year: 2025, rating: "L", appId: "ppsspp", platform: "Portátil · PPSSPP", tagline: "Cada nuvem é um novo caminho.", description: "Plataforma cooperativa entre ilhas flutuantes e cachoeiras que caem no céu.", meta: "Novo", gallery: ["sky", "dragon"] },
  { id: "odisseia-tactics", title: "Odisseia Estelar: Tactics", type: "jogo", art: "nebula", genres: ["Estratégia", "Ficção Científica", "Tático"], year: 2026, rating: "12", appId: "xcloud", platform: "Nuvem", tagline: "Comande a frota além da nebulosa.", description: "Estratégia por turnos em escala galáctica, com frotas personalizáveis.", meta: "Pré-lançamento", gallery: ["nebula", "neon"] },
  { id: "f-odisseia", title: "Odisseia da Nebulosa", type: "filme", art: "nebula", genres: ["Ficção Científica", "Aventura", "Space Opera"], year: 2025, rating: "12", appId: "netflix", platform: "Streaming", progress: 40, tagline: "Além da última estrela.", description: "Uma astronauta solitária encontra uma nave lendária à deriva em uma nebulosa viva.", meta: "2 h 18 min", gallery: ["nebula", "neon", "sky"] },
  { id: "f-cavaleira", title: "A Última Cavaleira", type: "filme", art: "ember", genres: ["Fantasia", "Ação", "Aventura"], year: 2024, rating: "14", appId: "primevideo", platform: "Streaming", tagline: "Lendas não envelhecem.", description: "Épico de fantasia sobre honra, sacrifício e uma espada forjada na luz do sol.", meta: "2 h 31 min", gallery: ["ember", "dragon"] },
  { id: "f-velocidade", title: "Velocidade Solar", type: "filme", art: "rally", genres: ["Ação", "Esporte"], year: 2023, rating: "12", appId: "netflix", platform: "Streaming", tagline: "Cada curva é uma decisão.", description: "Pilotos rivais disputam a corrida costeira mais perigosa do mundo.", meta: "1 h 52 min", gallery: ["rally", "retro"] },
  { id: "f-asas", title: "Asas de Esmeralda", type: "filme", art: "dragon", genres: ["Animação", "Família", "Fantasia"], year: 2025, rating: "L", appId: "disney", platform: "Streaming", tagline: "Toda lenda começa com um voo.", description: "Uma jovem e um dragão filhote atravessam o vale para salvar a floresta escarlate.", meta: "1 h 41 min", gallery: ["dragon", "sky"] },
  { id: "s-cronicas", title: "Crônicas do Luar", type: "serie", art: "moon", genres: ["Mistério", "Suspense", "Noir"], year: 2024, rating: "16", appId: "globoplay", platform: "Streaming", progress: 55, tagline: "Todo castelo guarda um segredo.", description: "Uma detetive investiga desaparecimentos em um castelo à beira do lago. 2 temporadas.", meta: "T2 · E5", gallery: ["moon", "ember"] },
  { id: "s-distrito", title: "Distrito Neon", type: "serie", art: "neon", genres: ["Ficção Científica", "Crime", "Ação"], year: 2025, rating: "16", appId: "primevideo", platform: "Streaming", tagline: "Na cidade do futuro, todos têm um preço.", description: "Entregadores de alta velocidade descobrem uma conspiração corporativa.", meta: "T1 · E3", progress: 25, gallery: ["neon", "retro"] },
  { id: "s-retrovisor", title: "Retrovisor 85", type: "serie", art: "retro", genres: ["Comédia", "Drama"], year: 2023, rating: "12", appId: "netflix", platform: "Streaming", tagline: "O verão em que tudo mudou.", description: "Amigos de fliperama vivem o último verão dos anos 80.", meta: "T3 · E1", gallery: ["retro", "rally"] },
  { id: "s-ceu", title: "Céu de Valéria", type: "serie", art: "sky", genres: ["Anime", "Aventura", "Fantasia"], year: 2026, rating: "10", appId: "youtube", platform: "Streaming", tagline: "Uma aventureira, mil ilhas.", description: "Anime de aventura sobre uma cartógrafa que mapeia ilhas flutuantes.", meta: "T1 · E8", progress: 70, gallery: ["sky", "dragon"] },
];

export function getLibraryItem(id: string) {
  return LIBRARY.find((i) => i.id === id);
}

export const TYPE_LABEL: Record<LibraryType, string> = { jogo: "Jogo", filme: "Filme", serie: "Série" };

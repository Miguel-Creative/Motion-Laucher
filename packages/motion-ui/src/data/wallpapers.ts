import { ART, type ArtId, type ArtQuality } from "./art";
import type { UploadedWallpaper } from "@/lib/store";

export type WallpaperKind = "Jogos" | "Filmes" | "Séries" | "Anime" | "Misto" | "Meus Wallpapers";

export interface ArtVariant {
  art?: ArtId;
  src?: string;
  label: string;
  focal?: string;
  /** Demo-only CSS grading to illustrate alternative artwork selection */
  grade?: string;
}

export interface Wallpaper {
  id: string;
  title: string;
  subtitle: string;
  kind: WallpaperKind;
  genres: string[];
  platforms: string[];
  year: number;
  provider: "demo" | "upload" | "tmdb" | "rawg" | "igdb" | "steamgriddb" | "anilist";
  sourceUrl?: string;
  externalIds?: { tmdb?: string; imdb?: string; rawg?: string };
  variants: ArtVariant[];
  uploadSrc?: string;
  popularity: number;
}

const v = (art: ArtId, extra: ArtVariant[] = []): ArtVariant[] => [
  { art, label: "Arte principal" },
  { art, label: "Recorte panorâmico", focal: "20% 50%" },
  { art, label: "Variante crepúsculo", grade: "hue-rotate(-18deg) saturate(1.15)" },
  ...extra,
];

export const DEMO_WALLPAPERS: Wallpaper[] = [
  { id: "g-ember", title: "Lâmina de Âmbar", subtitle: "Key art · Amanhecer", kind: "Jogos", genres: ["RPG", "Ação", "Mundo Aberto", "Fantasia"], platforms: ["PC", "PlayStation 5", "Xbox Series"], year: 2025, provider: "demo", variants: v("ember", [{ art: "dragon", label: "Arte do bestiário" }]), popularity: 98 },
  { id: "g-neon", title: "Neon Drift 2099", subtitle: "Avenida suspensa", kind: "Jogos", genres: ["Corrida", "Cyberpunk", "Ação"], platforms: ["PC", "Xbox Series"], year: 2024, provider: "demo", variants: v("neon", [{ art: "retro", label: "Pôster retrô" }]), popularity: 91 },
  { id: "g-rally", title: "Rally Costa Dourada", subtitle: "Curva do penhasco", kind: "Jogos", genres: ["Corrida", "Esportes", "Simulação"], platforms: ["PC", "PlayStation 5"], year: 2025, provider: "demo", variants: v("rally"), popularity: 84 },
  { id: "g-dragon", title: "Ecos do Dragão", subtitle: "Vale escarlate", kind: "Jogos", genres: ["Aventura", "RPG", "Fantasia"], platforms: ["Nintendo Switch", "PC"], year: 2023, provider: "demo", variants: v("dragon", [{ art: "ember", label: "Cavaleira guardiã" }]), popularity: 88 },
  { id: "g-retro", title: "Arcade Horizonte", subtitle: "Grade infinita", kind: "Jogos", genres: ["Retrô", "Ritmo", "Corrida"], platforms: ["Retrô", "Android"], year: 1987, provider: "demo", variants: v("retro"), popularity: 79 },
  { id: "g-moon", title: "Mansão do Luar", subtitle: "Lanterna no lago", kind: "Jogos", genres: ["Terror", "Mistério", "Stealth", "Sobrevivência"], platforms: ["PC", "PlayStation 5"], year: 2024, provider: "demo", variants: v("moon"), popularity: 76 },
  { id: "g-sky", title: "Ilhas do Céu", subtitle: "Cachoeiras no ar", kind: "Jogos", genres: ["Plataforma", "Aventura", "Cooperativo"], platforms: ["Nintendo Switch", "Android"], year: 2025, provider: "demo", variants: v("sky"), popularity: 82 },
  { id: "g-nebula", title: "Odisseia Estelar: Tactics", subtitle: "Frota na nebulosa", kind: "Jogos", genres: ["Estratégia", "Tático", "Ficção Científica"], platforms: ["PC"], year: 2026, provider: "demo", variants: v("nebula"), popularity: 73 },
  { id: "f-nebula", title: "Odisseia da Nebulosa", subtitle: "Pôster de cinema", kind: "Filmes", genres: ["Ficção Científica", "Aventura", "Space Opera"], platforms: ["Cinema", "Streaming"], year: 2025, provider: "demo", variants: v("nebula", [{ art: "sky", label: "Arte do planeta" }]), popularity: 95 },
  { id: "f-ember", title: "A Última Cavaleira", subtitle: "Pôster principal", kind: "Filmes", genres: ["Fantasia", "Ação", "Aventura"], platforms: ["Cinema"], year: 2024, provider: "demo", variants: v("ember"), popularity: 87 },
  { id: "f-rally", title: "Velocidade Solar", subtitle: "Cena da costa", kind: "Filmes", genres: ["Ação", "Esporte"], platforms: ["Streaming"], year: 2023, provider: "demo", variants: v("rally"), popularity: 71 },
  { id: "f-dragon", title: "Asas de Esmeralda", subtitle: "Voo inaugural", kind: "Filmes", genres: ["Animação", "Família", "Fantasia"], platforms: ["Cinema", "Streaming"], year: 2025, provider: "demo", variants: v("dragon"), popularity: 90 },
  { id: "f-moon", title: "O Lago Silencioso", subtitle: "Noir gótico", kind: "Filmes", genres: ["Terror", "Suspense", "Noir"], platforms: ["Cinema"], year: 2022, provider: "demo", variants: v("moon"), popularity: 66 },
  { id: "s-moon", title: "Crônicas do Luar", subtitle: "Temporada 2", kind: "Séries", genres: ["Mistério", "Suspense", "Noir"], platforms: ["Streaming"], year: 2024, provider: "demo", variants: v("moon", [{ art: "ember", label: "Arte do episódio" }]), popularity: 86 },
  { id: "s-neon", title: "Distrito Neon", subtitle: "Temporada 1", kind: "Séries", genres: ["Ficção Científica", "Crime", "Ação"], platforms: ["Streaming"], year: 2025, provider: "demo", variants: v("neon"), popularity: 83 },
  { id: "s-retro", title: "Retrovisor 85", subtitle: "Verão final", kind: "Séries", genres: ["Comédia", "Drama"], platforms: ["Streaming"], year: 2023, provider: "demo", variants: v("retro"), popularity: 74 },
  { id: "s-rally", title: "Box 7", subtitle: "Bastidores da equipe", kind: "Séries", genres: ["Documentário", "Esporte"], platforms: ["Streaming"], year: 2025, provider: "demo", variants: v("rally"), popularity: 62 },
  { id: "a-sky", title: "Céu de Valéria", subtitle: "Abertura do anime", kind: "Anime", genres: ["Anime", "Aventura", "Fantasia"], platforms: ["Streaming"], year: 2026, provider: "demo", variants: v("sky", [{ art: "dragon", label: "Arte do arco 2" }]), popularity: 97 },
  { id: "a-neon", title: "Pilotos do Amanhã", subtitle: "Arte promocional", kind: "Anime", genres: ["Anime", "Ficção Científica", "Ação"], platforms: ["Streaming"], year: 2025, provider: "demo", variants: v("neon"), popularity: 80 },
  { id: "a-dragon", title: "Guardiões de Esmeralda", subtitle: "Visual principal", kind: "Anime", genres: ["Anime", "Fantasia"], platforms: ["Streaming"], year: 2024, provider: "demo", variants: v("dragon"), popularity: 77 },
  { id: "m-retro", title: "Sintonia Retrô", subtitle: "Coleção mista", kind: "Misto", genres: ["Retrô", "Musical"], platforms: ["Retrô"], year: 2024, provider: "demo", variants: v("retro", [{ art: "neon", label: "Remix neon" }]), popularity: 69 },
  { id: "m-nebula", title: "Cosmos Vivo", subtitle: "Abstrato espacial", kind: "Misto", genres: ["Space Opera", "Ficção Científica"], platforms: ["Cinema"], year: 2025, provider: "demo", variants: v("nebula"), popularity: 72 },
  { id: "m-sky", title: "Manhã Azul", subtitle: "Paisagem clara", kind: "Misto", genres: ["Fantasia", "Família"], platforms: ["Streaming"], year: 2025, provider: "demo", variants: v("sky"), popularity: 70 },
];

export function uploadsToWallpapers(uploads: UploadedWallpaper[]): Wallpaper[] {
  return uploads.map((u) => ({
    id: u.id, title: u.name, subtitle: "Imagem local", kind: "Meus Wallpapers", genres: [], platforms: [],
    year: new Date(u.createdAt).getFullYear(), provider: "upload", variants: [{ art: "ember", label: "Original" }],
    uploadSrc: u.dataUrl, popularity: 0,
  }));
}

export function wallpaperSrc(wp: Wallpaper, quality: ArtQuality, variantIndex = 0): { src: string; focal: string; grade?: string } {
  if (wp.uploadSrc) return { src: wp.uploadSrc, focal: "50% 50%" };
  const variant = wp.variants[variantIndex] ?? wp.variants[0] ?? { art: "ember", label: "Original" };
  const art = ART[variant.art ?? "ember"];
  const remote = variant.src?.startsWith("https://") ? variant.src : null;
  return { src: remote ?? art[quality], focal: variant.focal ?? art.focal, ...(variant.grade ? { grade: variant.grade } : {}) };
}

export const PROVIDER_LABEL: Record<Wallpaper["provider"], string> = {
  demo: "Demonstração", upload: "Local", tmdb: "TMDB", rawg: "RAWG", igdb: "IGDB", steamgriddb: "SteamGridDB", anilist: "AniList",
};

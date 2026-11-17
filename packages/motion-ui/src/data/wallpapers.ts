import type { ArtId, ArtQuality } from "./art";
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
  /** Verified ISO date for this content's original release/premiere, when provider supplies full day/month/year. */
  releaseDate?: string;
  provider: "demo" | "upload" | "tmdb" | "rawg" | "igdb" | "steamgriddb" | "anilist" | "kitsu";
  sourceUrl?: string;
  externalIds?: { tmdb?: string; imdb?: string; rawg?: string };
  variants: ArtVariant[];
  uploadSrc?: string;
  popularity: number;
}

/** Kept for compatibility with the retired demo provider; never supplies art. */
export const DEMO_WALLPAPERS: Wallpaper[] = [];

export const EMPTY_WALLPAPER: Wallpaper = {
 id:"",title:"Motion Laucher",subtitle:"Aguardando wallpapers",kind:"Misto",
 genres:[],platforms:[],year:0,provider:"demo",variants:[],popularity:0,
};

export function uploadsToWallpapers(uploads: UploadedWallpaper[]): Wallpaper[] {
  return uploads.map((u) => ({
    id: u.id, title: u.name, subtitle: "Imagem local", kind: "Meus Wallpapers", genres: [], platforms: [],
    year: new Date(u.createdAt).getFullYear(), provider: "upload", variants: [{ label: "Original" }],
    uploadSrc: u.dataUrl, popularity: 0,
  }));
}

export function wallpaperSrc(wp: Wallpaper, _quality: ArtQuality, variantIndex = 0): { src: string; focal: string; grade?: string } {
  if (wp.uploadSrc) return { src: wp.uploadSrc, focal: "50% 50%" };
  const variant = wp.variants[variantIndex] ?? wp.variants[0];
  const remote = variant?.src?.startsWith("https://") ? variant.src : "";
  return { src: remote, focal: variant?.focal ?? "50% 50%", ...(variant?.grade ? { grade: variant.grade } : {}) };
}

export const PROVIDER_LABEL: Record<Wallpaper["provider"], string> = {
  demo: "Demonstração", upload: "Local", tmdb: "TMDB", rawg: "RAWG", igdb: "IGDB", steamgriddb: "SteamGridDB", anilist: "AniList", kitsu: "Kitsu",
};

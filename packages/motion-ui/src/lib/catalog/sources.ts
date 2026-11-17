/**
 * Wallpaper/catalog source adapters.
 * - Only official APIs with the user's own keys. No scraping of IMDb or any website.
 * - Without credentials or connectivity no fictional artwork is shown.
 * - Never redistribute provider artwork; display with attribution per provider terms.
 */
import type { Wallpaper } from "@/data/wallpapers";
import { DEMO_WALLPAPERS } from "@/data/wallpapers";

export type SourceStatus = "demo" | "sem-credenciais" | "pronto" | "requer-ponte";

export interface CatalogSource {
  id: "demo" | "tmdb" | "rawg" | "igdb" | "steamgriddb";
  name: string;
  kinds: string[];
  settingKey?: string;
  browserCapable: boolean;
  attribution: string;
  terms: string;
  docsUrl: string;
  status(key: string | undefined): SourceStatus;
  /** Real network test; only called when a key is configured. */
  test?(key: string): Promise<{ ok: boolean; message: string }>;
  search(query: string, key?: string): Promise<Wallpaper[]>;
}

export const demoSource: CatalogSource = {
  id: "demo",
  name: "Catálogo de demonstração desativado",
  kinds: ["Jogos", "Filmes", "Séries", "Anime", "Misto"],
  browserCapable: true,
  attribution: "Artes originais geradas para este protótipo. Títulos fictícios.",
  terms: "Uso livre dentro do protótipo.",
  docsUrl: "https://github.com/Miguel-Creative/Motion-Laucher",
  status: () => "demo",
  async search(query) {
    const q = query.trim().toLowerCase();
    return DEMO_WALLPAPERS.filter((w) => !q || w.title.toLowerCase().includes(q));
  },
};

export const tmdbSource: CatalogSource = {
  id: "tmdb",
  name: "TMDB (The Movie Database)",
  kinds: ["Filmes", "Séries", "Anime"],
  settingKey: "integrations.tmdbKey",
  browserCapable: true,
  attribution: "Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.",
  terms: "Requer token de leitura próprio e exibição do logotipo/atribuição TMDB. IDs do IMDb apenas via campo external_ids.",
  docsUrl: "https://developer.themoviedb.org/docs",
  status: (key) => (key ? "pronto" : "sem-credenciais"),
  async test(key) {
    const res = await fetch("https://api.themoviedb.org/3/configuration", { headers: { Authorization: `Bearer ${key}` } });
    return { ok: res.ok, message: res.ok ? "TMDB respondeu com sucesso." : `TMDB recusou o token (HTTP ${res.status}).` };
  },
  async search(query, key) {
    if (!key) return [];
    const res = await fetch(`https://api.themoviedb.org/3/search/multi?language=pt-BR&query=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${key}` } });
    if (!res.ok) throw new Error(`TMDB HTTP ${res.status}`);
    // Mapping to Wallpaper (backdrop_path → image.tmdb.org) is implemented in the follow-up integration step.
    return [];
  },
};

export const rawgSource: CatalogSource = {
  id: "rawg",
  name: "RAWG Video Games Database",
  kinds: ["Jogos"],
  settingKey: "integrations.rawgKey",
  browserCapable: true,
  attribution: "Dados de jogos fornecidos por RAWG (rawg.io) — link de atribuição obrigatório.",
  terms: "Chave gratuita para uso não comercial; atribuição com link ativo para RAWG.",
  docsUrl: "https://rawg.io/apidocs",
  status: (key) => (key ? "pronto" : "sem-credenciais"),
  async test(key) {
    const res = await fetch(`https://api.rawg.io/api/genres?key=${encodeURIComponent(key)}&page_size=1`);
    return { ok: res.ok, message: res.ok ? "RAWG respondeu com sucesso." : `RAWG recusou a chave (HTTP ${res.status}).` };
  },
  async search(query, key) {
    if (!key) return [];
    const res = await fetch(`https://api.rawg.io/api/games?key=${encodeURIComponent(key)}&search=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`RAWG HTTP ${res.status}`);
    return [];
  },
};

export const igdbSource: CatalogSource = {
  id: "igdb",
  name: "IGDB (Twitch)",
  kinds: ["Jogos"],
  settingKey: "integrations.igdbClient",
  browserCapable: false,
  attribution: "Dados de jogos por IGDB.com.",
  terms: "Exige Client ID + Client Secret (OAuth Twitch). O segredo nunca deve ficar no navegador: use a ponte Android.",
  docsUrl: "https://api-docs.igdb.com/",
  status: () => "requer-ponte",
  async search() {
    return [];
  },
};

export const steamGridSource: CatalogSource = {
  id: "steamgriddb",
  name: "SteamGridDB",
  kinds: ["Jogos"],
  settingKey: "integrations.sgdbKey",
  browserCapable: false,
  attribution: "Artes enviadas pela comunidade SteamGridDB; respeite os créditos de cada autor.",
  terms: "API sem CORS para navegador; chamadas devem passar pela ponte Android.",
  docsUrl: "https://www.steamgriddb.com/api/v2",
  status: () => "requer-ponte",
  async search() {
    return [];
  },
};

export const CATALOG_SOURCES: CatalogSource[] = [demoSource, tmdbSource, rawgSource, igdbSource, steamGridSource];

export const SOURCE_STATUS_LABEL: Record<SourceStatus, string> = {
  demo: "Demonstração ativa",
  "sem-credenciais": "Sem credenciais",
  pronto: "Chave configurada",
  "requer-ponte": "Requer ponte Android",
};

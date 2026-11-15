export const GAME_GENRES = [
  "RPG", "FPS", "Terror", "Corrida", "Aventura", "Ação", "Mundo Aberto", "Plataforma", "Luta", "Estratégia",
  "Simulação", "Esportes", "Soulslike", "Roguelike", "Metroidvania", "Ritmo", "Puzzle", "Sobrevivência",
  "MOBA", "Battle Royale", "Stealth", "Hack and Slash", "Visual Novel", "Sandbox", "Tático", "Retrô",
  "Cyberpunk", "Ficção Científica", "Fantasia", "Cooperativo",
] as const;

export const FILM_GENRES = [
  "Ação", "Aventura", "Comédia", "Drama", "Ficção Científica", "Fantasia", "Terror", "Suspense", "Romance",
  "Animação", "Documentário", "Crime", "Mistério", "Guerra", "Faroeste", "Musical", "Família", "Histórico",
  "Super-heróis", "Thriller Psicológico", "Noir", "Esporte", "Space Opera", "Anime",
] as const;

export const ALL_GENRES = Array.from(new Set<string>([...GAME_GENRES, ...FILM_GENRES])).sort((a, b) => a.localeCompare(b, "pt-BR"));

export const PLATFORMS = ["PC", "PlayStation 5", "Xbox Series", "Nintendo Switch", "Android", "Retrô", "Cinema", "Streaming"] as const;

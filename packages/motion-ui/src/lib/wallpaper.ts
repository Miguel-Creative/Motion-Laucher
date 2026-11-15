import { useMemo } from "react";
import { DEMO_WALLPAPERS, uploadsToWallpapers, wallpaperSrc, type Wallpaper } from "@/data/wallpapers";
import type { ArtQuality } from "@/data/art";
import { getState, readSetting, setState, useAppState } from "./store";

export function useAllWallpapers(): Wallpaper[] {
  const uploads = useAppState((s) => s.uploads);
  return useMemo(() => [...uploadsToWallpapers(uploads), ...DEMO_WALLPAPERS], [uploads]);
}

export function findWallpaper(id: string): Wallpaper | undefined {
  return DEMO_WALLPAPERS.find((w) => w.id === id) ?? uploadsToWallpapers(getState().uploads).find((w) => w.id === id);
}

export function useArtQuality(): ArtQuality {
  const perf = useAppState((s) => readSetting<string>("performance.visualMode", s));
  const max = useAppState((s) => readSetting<string>("wallpaper.maxResolution", s));
  if (perf === "leve" || max === "720p") return "md";
  return "lg";
}

export function useCurrentWallpaper() {
  const id = useAppState((s) => s.currentWallpaper);
  const altIndex = useAppState((s) => s.wallpaperAlt[s.currentWallpaper] ?? 0);
  const all = useAllWallpapers();
  const quality = useArtQuality();
  const wp = all.find((w) => w.id === id) ?? DEMO_WALLPAPERS[0];
  if (!wp) throw new Error("Nenhuma arte disponível.");
  return { wallpaper: wp, ...wallpaperSrc(wp, quality, altIndex) };
}

export function rotationPool(): Wallpaper[] {
  const s = getState();
  const mix = readSetting<string[]>("wallpaper.mix");
  const all = [...uploadsToWallpapers(s.uploads), ...DEMO_WALLPAPERS];
  const pool = all.filter((w) => mix.includes(w.kind));
  return pool.length ? pool : DEMO_WALLPAPERS;
}

export function stepWallpaper(dir: 1 | -1, order?: "random" | "sequential") {
  const pool = rotationPool();
  const s = getState();
  const mode = order ?? readSetting<string>("wallpaper.order");
  const idx = pool.findIndex((w) => w.id === s.currentWallpaper);
  let next: Wallpaper | undefined;
  if (mode === "random" && pool.length > 1) {
    do next = pool[Math.floor(Math.random() * pool.length)];
    while (next?.id === s.currentWallpaper);
  } else {
    next = pool[(idx + dir + pool.length) % pool.length];
  }
  if (!next) return;
  setState({ currentWallpaper: next.id });
  return next;
}

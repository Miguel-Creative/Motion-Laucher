import { useMemo } from "react";
import { EMPTY_WALLPAPER, uploadsToWallpapers, wallpaperSrc, type Wallpaper } from "@/data/wallpapers";
import type { ArtQuality } from "@/data/art";
import { getLiveCatalog, useLiveCatalog } from "./catalog/live";
import { getState, readSetting, setState, useAppState } from "./store";

export function useAllWallpapers(): Wallpaper[] {
  const uploads = useAppState((s) => s.uploads);
  const live = useLiveCatalog();
  return useMemo(() => [...uploadsToWallpapers(uploads), ...live], [uploads, live]);
}

export function findWallpaper(id: string): Wallpaper | undefined {
  return getLiveCatalog().find((w) => w.id === id) ?? uploadsToWallpapers(getState().uploads).find((w) => w.id === id);
}

export function useArtQuality(): ArtQuality {
  const perf = useAppState((s) => readSetting<string>("performance.visualMode", s));
  const max = useAppState((s) => readSetting<string>("wallpaper.maxResolution", s));
  if (perf === "leve" || max === "720p") return "md";
  return "lg";
}

export function useCurrentWallpaper() {
  const id = useAppState((s) => s.currentWallpaper);
  const altMap = useAppState((s) => s.wallpaperAlt);
  const all = useAllWallpapers();
  const quality = useArtQuality();
  const wp = all.find((w) => w.id === id) ?? all[0] ?? EMPTY_WALLPAPER;
  return { wallpaper: wp, ...wallpaperSrc(wp, quality, altMap[wp.id] ?? 0) };
}

export function rotationPool(): Wallpaper[] {
  const s = getState();
  const mix = readSetting<string[]>("wallpaper.mix");
  const live = getLiveCatalog();
  const all = [...uploadsToWallpapers(s.uploads), ...live];
  const pool = all.filter((w) => mix.includes(w.kind));
  return pool.length ? pool : all;
}

export function stepWallpaper(dir: 1 | -1, order?: "random" | "sequential") {
  const pool = rotationPool();
  if (!pool.length) return;
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
  // Rotate different *horizontal* artwork variants of the same anime/game on revisits.
  // Each source variant is vetted by the provider for the cinematic gallery.
  const variants=next.variants.length;
  const prior=s.wallpaperAlt[next.id] ?? 0;
  const alternate=variants>1 ? (prior+1+Math.floor(Math.random()*(variants-1)))%variants : 0;
  setState({ currentWallpaper: next.id, wallpaperAlt: { ...s.wallpaperAlt, [next.id]: alternate } });
  return next;
}

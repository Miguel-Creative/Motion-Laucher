import type { Wallpaper } from "@/data/wallpapers";
import { wallpaperSrc } from "@/data/wallpapers";
import { artFilter, useProjector } from "@/lib/projector";
import { useArtQuality } from "@/lib/wallpaper";
import { useAppState } from "@/lib/store";
export function Artwork({ wallpaper, className = "", original = false, thumbnail = false }: { wallpaper: Wallpaper; className?: string; original?: boolean; thumbnail?: boolean }) {
  const p = useProjector(); const quality = useArtQuality(); const alt = useAppState(s => s.wallpaperAlt[wallpaper.id] ?? 0); const art = wallpaperSrc(wallpaper, thumbnail ? "sm" : quality, alt);
  return <img src={art.src} alt={wallpaper.title} loading={thumbnail ? "lazy" : "eager"} className={`object-cover ${className}`} style={{ objectPosition: art.focal, filter: original ? "none" : artFilter(p, art.grade) }} />;
}
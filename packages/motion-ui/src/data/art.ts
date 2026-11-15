import emberLg from "@/assets/wallpapers/ember-knight.jpg";
import emberMd from "@/assets/wallpapers/md/ember-knight.jpg";
import emberSm from "@/assets/wallpapers/sm/ember-knight.jpg";
import neonLg from "@/assets/wallpapers/neon-drift.jpg";
import neonMd from "@/assets/wallpapers/md/neon-drift.jpg";
import neonSm from "@/assets/wallpapers/sm/neon-drift.jpg";
import nebulaLg from "@/assets/wallpapers/nebula-odyssey.jpg";
import nebulaMd from "@/assets/wallpapers/md/nebula-odyssey.jpg";
import nebulaSm from "@/assets/wallpapers/sm/nebula-odyssey.jpg";
import skyLg from "@/assets/wallpapers/sky-islands.jpg";
import skyMd from "@/assets/wallpapers/md/sky-islands.jpg";
import skySm from "@/assets/wallpapers/sm/sky-islands.jpg";
import dragonLg from "@/assets/wallpapers/dragon-valley.jpg";
import dragonMd from "@/assets/wallpapers/md/dragon-valley.jpg";
import dragonSm from "@/assets/wallpapers/sm/dragon-valley.jpg";
import retroLg from "@/assets/wallpapers/retro-sunset.jpg";
import retroMd from "@/assets/wallpapers/md/retro-sunset.jpg";
import retroSm from "@/assets/wallpapers/sm/retro-sunset.jpg";
import rallyLg from "@/assets/wallpapers/coastal-rally.jpg";
import rallyMd from "@/assets/wallpapers/md/coastal-rally.jpg";
import rallySm from "@/assets/wallpapers/sm/coastal-rally.jpg";
import moonLg from "@/assets/wallpapers/moon-manor.jpg";
import moonMd from "@/assets/wallpapers/md/moon-manor.jpg";
import moonSm from "@/assets/wallpapers/sm/moon-manor.jpg";

export type ArtQuality = "sm" | "md" | "lg";

export interface Art {
  sm: string;
  md: string;
  lg: string;
  /** Default focal point used for object-position */
  focal: string;
}

export const ART = {
  ember: { sm: emberSm, md: emberMd, lg: emberLg, focal: "70% 40%" },
  neon: { sm: neonSm, md: neonMd, lg: neonLg, focal: "35% 50%" },
  nebula: { sm: nebulaSm, md: nebulaMd, lg: nebulaLg, focal: "50% 45%" },
  sky: { sm: skySm, md: skyMd, lg: skyLg, focal: "70% 40%" },
  dragon: { sm: dragonSm, md: dragonMd, lg: dragonLg, focal: "40% 35%" },
  retro: { sm: retroSm, md: retroMd, lg: retroLg, focal: "50% 50%" },
  rally: { sm: rallySm, md: rallyMd, lg: rallyLg, focal: "45% 55%" },
  moon: { sm: moonSm, md: moonMd, lg: moonLg, focal: "40% 40%" },
} satisfies Record<string, Art>;

export type ArtId = keyof typeof ART;
export const ART_IDS = Object.keys(ART) as ArtId[];

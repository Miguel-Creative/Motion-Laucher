import {
  Play, Clapperboard, Tv, Film, Music2, Radio, Gamepad2, Joystick, Cloud, Folder, Globe, Settings,
  Download, Camera, MonitorPlay, Podcast, Store, Wrench, Cast, type LucideIcon,
} from "lucide-react";

export type AppCategory = "Streaming" | "Jogos" | "Música" | "Mídia" | "Utilitários" | "Sistema";

export interface LauncherApp {
  id: string;
  name: string;
  pkg: string;
  category: AppCategory;
  system: boolean;
  icon: LucideIcon;
  /** index into the art-tone palette used for the tile gradient */
  tone: number;
  sizeMb: number;
  version: string;
}

export const APPS: LauncherApp[] = [
  { id: "youtube", name: "YouTube", pkg: "com.google.android.youtube.tv", category: "Streaming", system: false, icon: Play, tone: 0, sizeMb: 92, version: "4.40.303" },
  { id: "netflix", name: "Netflix", pkg: "com.netflix.mediaclient", category: "Streaming", system: false, icon: Clapperboard, tone: 0, sizeMb: 118, version: "11.2.1" },
  { id: "primevideo", name: "Prime Video", pkg: "com.amazon.amazonvideo.livingroom", category: "Streaming", system: false, icon: Film, tone: 4, sizeMb: 104, version: "6.9.2" },
  { id: "disney", name: "Disney+", pkg: "com.disney.disneyplus", category: "Streaming", system: false, icon: Tv, tone: 3, sizeMb: 96, version: "3.1.0" },
  { id: "globoplay", name: "Globoplay", pkg: "com.globo.globotv", category: "Streaming", system: false, icon: MonitorPlay, tone: 1, sizeMb: 74, version: "5.12" },
  { id: "twitch", name: "Twitch", pkg: "tv.twitch.android.app", category: "Streaming", system: false, icon: Cast, tone: 3, sizeMb: 81, version: "18.0" },
  { id: "spotify", name: "Spotify", pkg: "com.spotify.tv.android", category: "Música", system: false, icon: Music2, tone: 2, sizeMb: 66, version: "1.98" },
  { id: "radio", name: "Rádio FM Online", pkg: "br.demo.radio", category: "Música", system: false, icon: Radio, tone: 1, sizeMb: 22, version: "2.3" },
  { id: "podcasts", name: "Podcasts", pkg: "br.demo.podcasts", category: "Música", system: false, icon: Podcast, tone: 5, sizeMb: 31, version: "1.7" },
  { id: "retroarch", name: "RetroArch", pkg: "com.retroarch", category: "Jogos", system: false, icon: Joystick, tone: 3, sizeMb: 140, version: "1.19.1" },
  { id: "steamlink", name: "Steam Link", pkg: "com.valvesoftware.steamlink", category: "Jogos", system: false, icon: Gamepad2, tone: 4, sizeMb: 48, version: "1.3.9" },
  { id: "xcloud", name: "Jogos na Nuvem", pkg: "br.demo.cloudgaming", category: "Jogos", system: false, icon: Cloud, tone: 2, sizeMb: 58, version: "2405" },
  { id: "ppsspp", name: "PPSSPP", pkg: "org.ppsspp.ppsspp", category: "Jogos", system: false, icon: Gamepad2, tone: 1, sizeMb: 39, version: "1.17" },
  { id: "kodi", name: "Kodi", pkg: "org.xbmc.kodi", category: "Mídia", system: false, icon: MonitorPlay, tone: 4, sizeMb: 210, version: "21.0" },
  { id: "vlc", name: "VLC", pkg: "org.videolan.vlc", category: "Mídia", system: false, icon: Play, tone: 1, sizeMb: 44, version: "3.6" },
  { id: "photos", name: "Galeria", pkg: "br.demo.gallery", category: "Mídia", system: false, icon: Camera, tone: 5, sizeMb: 18, version: "1.2" },
  { id: "browser", name: "Navegador", pkg: "br.demo.browser", category: "Utilitários", system: false, icon: Globe, tone: 4, sizeMb: 88, version: "126" },
  { id: "files", name: "Arquivos", pkg: "br.demo.files", category: "Utilitários", system: false, icon: Folder, tone: 1, sizeMb: 12, version: "3.0" },
  { id: "downloader", name: "Downloader", pkg: "br.demo.downloader", category: "Utilitários", system: false, icon: Download, tone: 2, sizeMb: 9, version: "1.5" },
  { id: "store", name: "Loja de Apps", pkg: "com.android.vending", category: "Sistema", system: true, icon: Store, tone: 2, sizeMb: 64, version: "41.1" },
  { id: "android-settings", name: "Configurações do Android", pkg: "com.android.tv.settings", category: "Sistema", system: true, icon: Settings, tone: 5, sizeMb: 28, version: "11" },
  { id: "oem-launcher", name: "Launcher original", pkg: "com.hy.launcher (exemplo)", category: "Sistema", system: true, icon: Tv, tone: 5, sizeMb: 35, version: "1.0" },
  { id: "keystone", name: "Ajuste de imagem", pkg: "com.hy.projector (exemplo)", category: "Sistema", system: true, icon: Wrench, tone: 0, sizeMb: 6, version: "1.0" },
];

export const APP_TONES = ["tile-tone-0", "tile-tone-1", "tile-tone-2", "tile-tone-3", "tile-tone-4", "tile-tone-5"];

export function getApp(id: string) {
  return APPS.find((a) => a.id === id);
}

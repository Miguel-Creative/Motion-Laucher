import { useEffect } from "react";
import { useSetting, useAppState } from "@/lib/store";
import { SPEC_ROTATION_MS } from "@/lib/settings-schema";
import { stepWallpaper } from "@/lib/wallpaper";
export function WallpaperRotation(){const rotation=useSetting<string>("wallpaper.rotation");const minutes=useSetting<number>("wallpaper.customMinutes");const pause=useSetting<boolean>("wallpaper.pauseOnPlayback");const playing=useAppState(s=>s.playbackActive);useEffect(()=>{const ms=rotation==="custom"?minutes*60_000:SPEC_ROTATION_MS[rotation];if(!ms||pause&&playing)return;const id=setInterval(()=>{if(document.visibilityState==="visible")stepWallpaper(1);},ms);return()=>clearInterval(id);},[rotation,minutes,pause,playing]);return null;}
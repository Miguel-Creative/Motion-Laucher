import { useEffect } from "react";
import { useSetting, useAppState } from "@/lib/store";
import { SPEC_ROTATION_MS } from "@/lib/settings-schema";
import { stepWallpaper } from "@/lib/wallpaper";
export function WallpaperRotation(){
 const rotation=useSetting<string>("wallpaper.rotation");
 const seconds=useSetting<number>("wallpaper.customSeconds");
 const pause=useSetting<boolean>("wallpaper.pauseOnPlayback");
 const playing=useAppState(s=>s.playbackActive);
 useEffect(()=>{
   const ms=rotation==="custom"?Math.max(10,Math.min(3600,seconds))*1000:SPEC_ROTATION_MS[rotation];
   if(!ms || (pause && playing))return;
   const id=window.setInterval(()=>{if(document.visibilityState==="visible")stepWallpaper(1);},ms);
   return ()=>window.clearInterval(id);
 },[rotation,seconds,pause,playing]);
 return null;
}

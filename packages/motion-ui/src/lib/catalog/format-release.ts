import type { Wallpaper } from "@/data/wallpapers";

/** The date is about the media's original premiere, NOT the wallpaper upload. */
export function formatReleaseDate(wallpaper:Pick<Wallpaper,"kind"|"releaseDate"|"year">,today=new Date()):string {
 const noun=wallpaper.kind==="Jogos"?"Lançamento":"Estreia";
 const raw=wallpaper.releaseDate;
 if(raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)){
   const parts=raw.split("-").map(Number);
   const value=new Date(Date.UTC(parts[0],parts[1]-1,parts[2]));
   if(value.getUTCFullYear()===parts[0] && value.getUTCMonth()===parts[1]-1 && value.getUTCDate()===parts[2]){
     const future=value.getTime()>today.getTime();
     return (future? noun+" prevista":noun)+": "+parts[2].toString().padStart(2,"0")+"/"+
       parts[1].toString().padStart(2,"0")+"/"+parts[0];
   }
 }
 // Some APIs only publish the year; keep the precision honest.
 return wallpaper.year>=1900 && wallpaper.year<=2100 ? noun+": "+wallpaper.year : noun+": a confirmar";
}

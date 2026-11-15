import { useState } from "react";
import type { SyntheticEvent } from "react";
import type { Wallpaper } from "@/data/wallpapers";
import { wallpaperSrc } from "@/data/wallpapers";
import { artFilter, useProjector } from "@/lib/projector";
import { useArtQuality } from "@/lib/wallpaper";
import { useAppState, useSetting } from "@/lib/store";
import { chooseWallpaperLayout } from "@/lib/image/smart-framing";

/**
 * Mini enquadrador inteligente e local (sem inferência IA pesada).
 * - Identifica proporção original quando a imagem carrega;
 * - Banner horizontal: cover com posição focal do provedor;
 * - Pôster vertical/quadrado: preserve 100% da arte, não corte nem estique;
 * - Laterais: iluminação com a mesma imagem desfocada apenas fora do modo Leve;
 * - Reprodução e trocas não processam pixels nem geram arquivos/novos personagens.
 */
export function Artwork({
 wallpaper, className="", original=false, thumbnail=false
}: {wallpaper:Wallpaper;className?:string;original?:boolean;thumbnail?:boolean}) {
 const p=useProjector();
 const quality=useArtQuality();
 const perf=useSetting<string>("performance.visualMode");
 const alt=useAppState(s=>s.wallpaperAlt[wallpaper.id]??0);
 const fitMode=useSetting<string>("wallpaper.fitMode") || "preserve";
 const focusX=useSetting<number>("wallpaper.focusX") ?? 50;
 const focusY=useSetting<number>("wallpaper.focusY") ?? 50;
 const art=wallpaperSrc(wallpaper,thumbnail?"sm":quality,alt);
 const [dimensions,setDimensions]=useState({src:"",width:0,height:0});
 const smart=fitMode==="fill" ? "cover" : fitMode==="auto" ?
    chooseWallpaperLayout(dimensions.src===art.src?dimensions.width:0,dimensions.src===art.src?dimensions.height:0) : "composite";
 const imageFocal=fitMode==="fill" ? String(focusX)+"% "+String(focusY)+"%" : art.focal;
 const filters=original?"none":artFilter(p,art.grade);
 const onLoad=(event:SyntheticEvent<HTMLImageElement>)=>{
  const im=event.currentTarget;
  setDimensions({src:art.src,width:im.naturalWidth,height:im.naturalHeight});
 };
 if(thumbnail) return <img src={art.src} alt={wallpaper.title} loading="lazy" decoding="async"
   className={`object-cover ${className}`} style={{objectPosition:imageFocal,filter:filters}}/>;
 return <div className={`smart-artwork ${smart==="composite"?"smart-artwork--composite":"smart-artwork--cover"} ${className}`}
    data-art-layout={smart} data-perf-mode={perf} role="img" aria-label={wallpaper.title}>
    {smart==="composite"&&<img className="smart-artwork-backdrop" alt="" aria-hidden="true"
      src={art.src} loading="eager" decoding="async"/>}
    <img src={art.src} alt="" aria-hidden="true" loading="eager" decoding="async" onLoad={onLoad}
      className="smart-artwork-primary" style={{objectPosition:imageFocal,filter:filters}}/>
    {smart==="composite"&&<span aria-hidden="true" className="smart-artwork-halo"/>}
 </div>;
}

import { useEffect,useState } from "react";
import { Tv,Play,ExternalLink } from "lucide-react";
import { Shell } from "./Shell";
import { MEDIA,type MediaEntry } from "@/lib/streaming";
import { setState } from "@/lib/store";
import { TVSearchButton } from "./TVSearchButton";
import { toast } from "sonner";
export function StreamingPage(){
 const [query,setQuery]=useState("");
 const native=typeof window.MotionNative?.playMedia==="function";
 useEffect(()=>{const close=()=>setState({playbackActive:false});window.addEventListener("motion-media-closed",close);return()=>{window.removeEventListener("motion-media-closed",close);close();};},[]);
 const play=(m:MediaEntry)=>{if(native){if(m.src)setState({playbackActive:true});window.MotionNative!.playMedia!(m.id);}else{window.open(m.official,"_blank","noopener,noreferrer");toast.info("Abrindo o canal na fonte oficial.");}};
 const items=MEDIA.filter(m=>m.title.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
 return <Shell title="TV ao vivo" subtitle="Canais brasileiros" variant="media"><div className="motion-media-body">
 <div className="motion-media-tabs"><TVSearchButton label="Buscar canal" value={query} onChange={setQuery}/></div>
 <div className="motion-media-scroll"><div className="motion-media-grid">{items.map(m=><button type="button" data-nav key={m.id} className="motion-media-card" onClick={()=>play(m)}><Tv size={24}/><strong>{m.title}</strong><small>{m.info}</small><small>{m.src?<><Play size={12}/> Assistir no player</>:<><ExternalLink size={12}/> Abrir transmissão oficial</>}</small></button>)}</div>{!items.length&&<p>Nenhum canal encontrado.</p>}</div>
 <p className="motion-media-note">Sinais diretos quando disponíveis. Os demais abrem a emissora; cadastro ou região podem ser exigidos.</p>
 </div></Shell>;
}

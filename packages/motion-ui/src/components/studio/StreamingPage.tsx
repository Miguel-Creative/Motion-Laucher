import { useEffect,useState } from "react";
import { Tv,Play } from "lucide-react";
import { Shell } from "./Shell";
import { Button } from "@/components/ui/button";
import { MEDIA_TABS,mediaFor,type MediaKind,type MediaEntry } from "@/lib/streaming";
import { setState } from "@/lib/store";
import { TVSearchButton } from "./TVSearchButton";
import { toast } from "sonner";
export function StreamingPage(){
 const [tab,setTab]=useState<MediaKind>("br");
 const [query,setQuery]=useState("");
 const native=typeof window.MotionNative?.playMedia==="function";
 useEffect(()=>{const close=()=>setState({playbackActive:false});window.addEventListener("motion-media-closed",close);return()=>{window.removeEventListener("motion-media-closed",close);close();};},[]);
 const play=(m:MediaEntry)=>{if(native){setState({playbackActive:true});window.MotionNative!.playMedia!(m.id);}else{window.open(m.official,"_blank","noopener,noreferrer");toast.info("Na prévia web, a fonte oficial abre em nova página.");}};
 const items=mediaFor(tab).filter(m=>m.title.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")));
 return <Shell title="Streaming" subtitle="TV ao vivo e vídeos de fontes oficiais." variant="media"><div className="motion-media-body">
  <div className="motion-media-tabs">{MEDIA_TABS.map(t=><Button key={t.id} data-nav data-nav-default={t.id===tab?"":undefined} aria-pressed={t.id===tab} variant={t.id===tab?"default":"outline"} onClick={()=>{setTab(t.id);setQuery("");}}>{t.label}</Button>)}<TVSearchButton label="Buscar" value={query} onChange={setQuery}/></div>
  <div className="motion-media-scroll"><div className="motion-media-grid">{items.map(m=><button type="button" data-nav key={m.id} className="motion-media-card" onClick={()=>play(m)}>{m.poster?<img src={m.poster} alt="" loading="lazy"/>:<Tv size={24}/>}<strong>{m.title}</strong><small>{m.info}</small><small><Play size={12} style={{display:"inline"}}/> {m.kind==="br"||m.kind==="international"?"Assistir ao vivo":"Reproduzir"}</small></button>)}</div>{!items.length&&<p>Nenhum resultado.</p>}</div>
  <p className="motion-media-note">{tab==="movie"||tab==="series"?"Acervo inicial de obras abertas do Blender Studio · sem catálogo comercial de lançamentos.":"Sinais públicos. A disponibilidade depende da emissora e da conexão."} {native?"Voltar encerra a reprodução.":"Prévia web: fontes oficiais."}</p>
 </div></Shell>;
}

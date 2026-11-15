import { useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { Shell } from "./Shell";
import { SettingControl } from "./SettingControl";
import { Artwork } from "./Artwork";
import { SETTINGS_SECTIONS } from "@/lib/settings-schema";
import { resetSection } from "@/lib/store";
import { useCurrentWallpaper } from "@/lib/wallpaper";
import { Button } from "@/components/ui/button";
import { useSpatialNav } from "@/hooks/use-spatial-nav";
import { toast } from "sonner";
export function SettingsPage() {
 const [section,setSection]=useState("appearance"); const [query,setQuery]=useState(""); const {wallpaper}=useCurrentWallpaper();useSpatialNav();
 const active=SETTINGS_SECTIONS.find(s=>s.id===section);const filtered=query?SETTINGS_SECTIONS.filter(s=>`${s.label} ${s.items.map(i=>`${i.label} ${i.description}`).join(" ")}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))):active?[active]:[];
 return <Shell title="Ajustes" subtitle="Seu espaço, do seu jeito."><div className="settings-layout"><aside className="settings-sidebar"><label className="search-field"><Search size={16}/><input data-nav aria-label="Buscar ajustes" placeholder="Buscar ajustes" value={query} onChange={e=>setQuery(e.target.value)}/></label><nav aria-label="Categorias de ajustes">{SETTINGS_SECTIONS.map((s,i)=><Button key={s.id} data-nav variant={section===s.id&&!query?"secondary":"ghost"} className="w-full justify-start text-xs" onClick={()=>{setSection(s.id);setQuery("");}}><s.icon/><span className="min-w-0 whitespace-normal text-left">{s.label}</span><span className="ml-auto text-muted-foreground">{String(i+1).padStart(2,"0")}</span></Button>)}</nav></aside><div className="min-w-0"><div className="settings-preview"><Artwork wallpaper={wallpaper} className="h-full w-full"/><span className="art-caption"><strong>Prévia da sua tela</strong><small>{wallpaper.title}</small></span></div>{filtered.map(s=><section key={s.id} className="mt-6"><div className="flex items-start justify-between gap-3 border-b border-border pb-4"><div><h2 className="font-display text-xl font-semibold">{s.label}</h2><p className="mt-1 text-xs text-muted-foreground">{s.description}</p></div><Button data-nav variant="ghost" size="icon" aria-label={`Restaurar ${s.label}`} onClick={()=>{resetSection(s.id);toast.success("Categoria restaurada.");}}><RotateCcw/></Button></div>{s.items.filter(i=>!query||`${s.label} ${i.label} ${i.description}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))).map(def=><SettingControl key={def.id} def={def}/>)}</section>)}{!filtered.length&&<p className="py-10 text-muted-foreground">Nenhum ajuste encontrado.</p>}</div></div></Shell>;
}
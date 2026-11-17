import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Shell } from "./Shell";
import { TVSearchButton } from "./TVSearchButton";
import { SettingControl } from "./SettingControl";
import { Artwork } from "./Artwork";
import { SETTINGS_SECTIONS } from "@/lib/settings-schema";
import { resetSection } from "@/lib/store";
import { useCurrentWallpaper } from "@/lib/wallpaper";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function SettingsPage() {
 const [section,setSection]=useState("display");
 const [query,setQuery]=useState("");
 const {wallpaper}=useCurrentWallpaper();
 const options=useRef<HTMLDivElement>(null);
 const active=SETTINGS_SECTIONS.find(s=>s.id===section);
 const needle=query.trim().toLocaleLowerCase("pt-BR");
 const filtered=needle?SETTINGS_SECTIONS.filter(s=>`${s.label} ${s.items.map(i=>`${i.label} ${i.description}`).join(" ")}`.toLocaleLowerCase("pt-BR").includes(needle)):active?[active]:[];
 useEffect(()=>{if(options.current)options.current.scrollTop=0;},[section,needle]);
 return <Shell title="Ajustes" subtitle="Personalize sua experiência na TV." variant="settings">
  <div className="settings-layout settings-tv">
   <aside className="settings-sidebar" aria-label="Categorias">
    <div className="settings-search" data-settings-zone="categories"><TVSearchButton label="Buscar ajustes" value={query} onChange={setQuery}/></div>
    <div className="settings-side-heading">CATEGORIAS <span>{SETTINGS_SECTIONS.length}</span></div>
    <nav className="settings-categories" aria-label="Categorias de ajustes" data-settings-zone="categories">
     {SETTINGS_SECTIONS.map(s=><Button key={s.id} data-nav data-nav-default={section===s.id&&!needle?"":undefined} data-setting-category={s.id} aria-pressed={section===s.id&&!needle} variant="ghost" className="settings-category" onFocus={()=>{if(!needle)setSection(s.id);}} onClick={()=>{setSection(s.id);setQuery("");}}><s.icon/><span>{s.label}</span></Button>)}
    </nav>
    <div className="settings-side-help">↑ ↓ Categorias · → Opções</div>
   </aside>
   <div className="settings-panel">
    <div className="settings-panel-top">
     <div className="settings-panel-title"><span className="settings-kicker">{needle?"RESULTADOS DA BUSCA":"PERSONALIZAÇÃO"}</span><h2>{needle?"Buscar ajustes":active?.label}</h2><p>{needle?`Resultados para “${query}”`:active?.description}</p></div>
     <div className="settings-preview"><Artwork wallpaper={wallpaper} className="settings-preview-image"/><span className="settings-preview-caption">Prévia da tela</span></div>
    </div>
    <div ref={options} className="settings-options" data-settings-zone="options">
     {filtered.map(s=><section key={s.id} className="settings-section">
      {needle&&<h3 className="settings-result-heading">{s.label}</h3>}
      {s.items.filter(i=>!needle||`${s.label} ${i.label} ${i.description}`.toLocaleLowerCase("pt-BR").includes(needle)).map(def=><SettingControl key={def.id} def={def}/>)}
      <Button data-nav variant="outline" className="settings-reset" aria-label={`Restaurar ${s.label}`} onClick={()=>{resetSection(s.id);toast.success("Categoria restaurada.");}}><RotateCcw/>Restaurar categoria</Button>
     </section>)}
     {!filtered.length&&<p className="settings-empty">Nenhum ajuste encontrado.</p>}
    </div>
    <div className="settings-panel-help">← Categorias · ↑ ↓ Navegar · OK Selecionar · ← → Ajustar controles deslizantes</div>
   </div>
  </div>
 </Shell>;
}

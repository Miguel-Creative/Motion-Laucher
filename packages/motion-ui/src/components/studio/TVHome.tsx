import { useEffect, useState } from "react";
import { analyzeWallpaperTextSide, type TextSide } from "@/lib/image/text-safe-zone";
import { Link } from "@tanstack/react-router";
import { Play, Plus, ChevronRight, ChevronLeft, Wifi, Volume2, Search, Power, SlidersHorizontal, Gamepad2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Brand, Navigation } from "./Shell";
import { Artwork } from "./Artwork";
import { APPS, APP_TONES } from "@/data/apps";
import { availableLauncherApps, isNativeLauncher } from "@/lib/device/native-android";
import { useAllWallpapers } from "@/lib/wallpaper";
import { useCatalogHealth } from "@/lib/catalog/live";
import { useCurrentWallpaper, stepWallpaper } from "@/lib/wallpaper";
import { useAppState, useSetting, setSetting, PROFILE_PRESETS, type ProfileId } from "@/lib/store";
import { launchApp } from "@/lib/actions";
import { device } from "@/lib/device/simulated";
import { onBridge } from "@/lib/device/bridge-channel";
import { useNow, useOnline } from "@/hooks/use-env";
import { useSpatialNav } from "@/hooks/use-spatial-nav";

export function TVHome() {
 const { wallpaper, src: backgroundSrc } = useCurrentWallpaper(); const wallpapers = useAllWallpapers(); const catalogHealth=useCatalogHealth(); const pinned = useAppState(s => s.pinned); const profile = useSetting<string>("profiles.active"); const name = useSetting<string>("profiles.name"); const now = useNow(1000); const online = useOnline(); const [query,setQuery] = useState(""); const [copySide,setCopySide] = useState<TextSide>("left");
 const performance = useSetting<string>("performance.visualMode");
 const apps=availableLauncherApps();
 const favoriteCandidates = pinned.map(id=>apps.find(a=>a.id===id)).filter((v): v is (typeof apps)[number] => !!v);
 const favoriteApps = isNativeLauncher() && !favoriteCandidates.length ? apps.slice(0,6) : favoriteCandidates;
 const displayName = name.trim();
 const welcome = displayName ? `Olá, ${displayName}` : "Bem-vindo";
 useEffect(() => {
   let active = true;
   setCopySide("left");
   if (performance !== "leve") void analyzeWallpaperTextSide(backgroundSrc).then(side => {
     if (active) setCopySide(side);
   });
   return () => { active = false; };
 }, [backgroundSrc, performance]);
 useSpatialNav(() => { setQuery(""); toast.info("Você está no início."); });
 useEffect(() => onBridge(msg => { if(msg.type === "key") { const map: Record<string,string> = { DPAD_UP:"ArrowUp", DPAD_DOWN:"ArrowDown", DPAD_LEFT:"ArrowLeft", DPAD_RIGHT:"ArrowRight", BACK:"Escape" }; if(msg.key === "DPAD_CENTER" || msg.key === "ENTER") { if(document.activeElement instanceof HTMLElement) document.activeElement.click(); } else if(msg.key === "HOME") window.scrollTo({top:0}); else if(map[msg.key]) window.dispatchEvent(new KeyboardEvent("keydown", { key:map[msg.key] ?? "", bubbles:true })); } if(msg.type === "launch") toast.success(`Abrindo ${APPS.find(a=>a.id===msg.appId)?.name ?? msg.appId} · Demonstração`); if(msg.type === "text") setQuery(msg.text); }), []);
 return <div className="tv-home" data-copy-side={copySide}><div className="tv-scene"><Artwork key={wallpaper.id} wallpaper={wallpaper} className="tv-wallpaper tv-wallpaper-enter"/><div className="tv-local-scrim"/><div className="tv-bottom-fade"/></div>
 <header className="tv-header"><Link to="/" aria-label="Motion Laucher início"><Brand /></Link><Navigation/><div className="flex items-center gap-4"><span className="hidden lg:flex items-center gap-2 text-xs text-on-art"><Wifi size={16}/>{online ? "Conectado" : "Sem internet"}</span><div className="text-right text-on-art"><strong className="font-display text-2xl">{now?.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"}) ?? "--:--"}</strong><p className="text-[10px] capitalize">{now?.toLocaleDateString("pt-BR",{weekday:"short",day:"numeric",month:"short"}) ?? "Motion Laucher"}</p></div></div></header>
 <main><section className="tv-hero"><div className="hero-copy"><div className="flex items-center gap-2"><span className="demo-pill">{wallpaper.provider === "demo" ? "Demonstração" : wallpaper.provider.toUpperCase()}</span><span className="text-xs text-on-art">SEU UNIVERSO. SEU MOVIMENTO.</span></div><p className="mt-6 text-sm text-primary font-semibold flex items-center gap-2"><Gamepad2 size={16}/>{wallpaper.kind} · Em destaque</p><h1 key={wallpaper.id} className="hero-title tv-title-enter">{wallpaper.title}</h1><p className="mt-3 text-sm text-on-art/90">{wallpaper.genres.join(" · ")}<span className="ml-3">{wallpaper.year}</span></p><div className="mt-6 flex flex-wrap gap-3"><Button data-nav data-nav-default asChild size="lg" className="tv-focusable"><Link to="/wallpapers"><Play fill="currentColor"/>Explorar agora</Link></Button><Button asChild size="lg" variant="secondary" className="tv-focusable"><Link data-nav to="/wallpapers"><Plus/>Personalizar tela</Link></Button></div><div className="mt-6 flex items-center gap-3"><Button data-nav variant="ghost" size="icon" aria-label="Wallpaper anterior" onClick={()=>stepWallpaper(-1,"sequential")}><ChevronLeft/></Button><span className="text-xs text-on-art">{String(Math.max(1,wallpapers.findIndex(w=>w.id===wallpaper.id)+1)).padStart(2,"0")} / {wallpapers.length}</span><Button data-nav variant="ghost" size="icon" aria-label="Próximo wallpaper" onClick={()=>stepWallpaper(1,"sequential")}><ChevronRight/></Button><span className="h-px w-12 bg-primary"/></div></div><div className="hero-profile"><div className="hero-greeting"><Sparkles size={15} className="text-primary"/><span>{welcome}</span></div><label className="hero-style-picker"><span>Estilo da tela</span><select data-nav aria-label="Estilo da tela" value={profile} onChange={e=>setSetting("profiles.active",e.target.value)}>{Object.entries(PROFILE_PRESETS).map(([id,p])=><option key={id} value={id}>{p.label}</option>)}</select></label></div></section>
 <section className="tv-content"><div className="rail-heading"><h2>Seus favoritos</h2><Button asChild variant="ghost" size="sm"><Link data-nav to="/library">Todos os apps<ChevronRight/></Link></Button></div><div className="favorite-row">{favoriteApps.map(app=>{const id=app.id;return <Button key={id} data-nav variant="secondary" className={ "app-tile tv-focusable " + (APP_TONES[app.tone] ?? "") } onClick={()=>{launchApp(id);if(!isNativeLauncher())toast.success(app.name+" · Abertura simulada");}}><app.icon className="app-icon"/><span>{app.name}</span></Button>;})}<Button asChild variant="outline" className="app-tile tv-focusable"><Link data-nav to="/library"><Plus/><span>Adicionar</span></Link></Button></div>
 <div className="quick-strip"><label className="flex items-center gap-2"><Search size={16}/><input data-nav aria-label="Buscar apps e títulos" placeholder="Buscar no seu universo" value={query} onChange={e=>setQuery(e.target.value)}/></label><Button asChild variant="ghost" size="sm"><Link data-nav to="/settings"><SlidersHorizontal/>Ajustes rápidos</Link></Button><Button data-nav variant="ghost" size="icon" aria-label="Volume" onClick={()=>{void device.sendKey("VOLUME_UP");toast.info("Volume + · Demonstração");}}><Volume2/></Button><Button data-nav variant="ghost" size="icon" aria-label="Suspender demonstração" onClick={()=>toast.info("Suspensão simulada; nenhum aparelho foi desligado.")}><Power/></Button></div>
 {query && <div className="mb-6 flex flex-wrap gap-2">{apps.filter(a=>a.name.toLowerCase().includes(query.toLowerCase())).map(a=><Button key={a.id} onClick={()=>{launchApp(a.id);toast.info(`Abrir ${a.name} · Demonstração`);}}>{a.name}</Button>)}<span className="text-muted-foreground">{wallpapers.filter(w=>w.title.toLowerCase().includes(query.toLowerCase())).length} títulos encontrados</span></div>}
 <footer className="flex flex-wrap justify-between gap-3 border-t border-border py-6 text-xs text-muted-foreground"><span>Motion Laucher · {wallpaper.provider==="demo"?"Conteúdo de demonstração":("Imagens reais · "+wallpaper.provider.toUpperCase())}{catalogHealth.loading?" · Atualizando...":""}{wallpaper.sourceUrl?<a href={wallpaper.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-2 underline">Fonte original</a>:null}</span><div className="flex gap-5"><Link to="/welcome">Boas-vindas</Link><Link to="/recovery">Recuperação</Link><span>{isNativeLauncher()?"HY300por · Motion Launcher Android":"HY300por · Protótipo web"}</span></div></footer></section></main></div>;
}
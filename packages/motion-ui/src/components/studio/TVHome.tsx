import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Gamepad2, Maximize, Flame } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FIREPLACES, nextFireplace } from "@/lib/ambient";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Brand, Navigation } from "./Shell";
import { Artwork } from "./Artwork";
import { APP_TONES } from "@/data/apps";
import { availableLauncherApps, isNativeLauncher } from "@/lib/device/native-android";
import { useCurrentWallpaper, stepWallpaper } from "@/lib/wallpaper";
import { EMPTY_WALLPAPER, type Wallpaper, type wallpaperSrc } from "@/data/wallpapers";
import { formatReleaseDate } from "@/lib/catalog/format-release";
import { useAppState } from "@/lib/store";
import { launchApp } from "@/lib/actions";
import { onBridge } from "@/lib/device/bridge-channel";
import { useNetworkClock } from "@/hooks/use-env";

/** Preserve the last genuinely loaded artwork across Home ⇄ Wallpapers navigation.
 * Without this, a slow/failed image request leaves the screen as a dark blank
 * rectangle while the title already changes every 10 seconds. */
type ReadyHero = { wallpaper: Wallpaper; art: ReturnType<typeof wallpaperSrc> };
let lastReadyHero: ReadyHero | null = null;
let consecutiveArtFailures = 0;

/**
 * TV home is ONE fixed 16:9 screen. No vertical scrolling and no offscreen apps.
 * The same structure is used in the browser preview and the projector APK.
 */
export function TVHome() {
  const { wallpaper: requestedWallpaper, ...requestedArt } = useCurrentWallpaper();
  const requestedSrc = requestedArt.src;
  const [ambient, setAmbient] = useState<"wallpapers" | "fire" | null>(null);
  const [fireDialog, setFireDialog] = useState(false);
  const [fireIndex,setFireIndex]=useState(0);
  const [nativeFire,setNativeFire]=useState(false);
  const [readyHero, setReadyHero] = useState<ReadyHero | null>(() => lastReadyHero);

  useEffect(() => {
    if (ambient === "fire" || !requestedSrc || requestedWallpaper.provider === "demo") return;
    if (lastReadyHero?.art.src === requestedSrc && lastReadyHero.wallpaper.id === requestedWallpaper.id) {
      setReadyHero(lastReadyHero);
      return;
    }
    let cancelled = false;
    let completed = false;
    const probe = new window.Image();
    const advance = () => {
      if (completed || cancelled) return;
      completed = true;
      // Do not spin forever when the TV is offline. Keep the last good image.
      if (++consecutiveArtFailures <= 5) stepWallpaper(1, "sequential");
    };
    const timeout = window.setTimeout(advance, 8000);
    probe.onload = () => {
      if (cancelled || completed) return;
      completed = true;
      window.clearTimeout(timeout);
      const accepted = { wallpaper: requestedWallpaper, art: requestedArt };
      lastReadyHero = accepted;
      consecutiveArtFailures = 0;
      setReadyHero(accepted);
    };
    probe.onerror = () => { window.clearTimeout(timeout); advance(); };
    probe.src = requestedSrc;
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      probe.onload = null;
      probe.onerror = null;
    };
  }, [requestedWallpaper.id, requestedSrc, ambient === "fire"]);

  const wallpaper = readyHero?.wallpaper ?? EMPTY_WALLPAPER;
  const pinned = useAppState(s => s.pinned);
  const now = useNetworkClock(1_000);
  const apps = availableLauncherApps();
  const native = isNativeLauncher();
  const pinnedApps = pinned.map(id => apps.find(app => app.id === id)).filter((app): app is (typeof apps)[number] => Boolean(app) && app?.pkg !== "org.xbmc.kodi");
  const favorites = native && pinnedApps.length === 0 ? apps.slice(0, 5) : pinnedApps;

  const exitAmbient = () => {
    setAmbient(null);setNativeFire(false);
    window.requestAnimationFrame(()=>document.querySelector<HTMLElement>('[data-ambient-launch="wallpapers"]')?.focus());
  };
  const startFire = (index:number) => {
    setFireIndex(index);setFireDialog(false);setAmbient("fire");
    const bridge=(window as unknown as {MotionNative?:{openFireplace?:(index:number)=>void}}).MotionNative;
    const isNative=typeof bridge?.openFireplace==="function";
    setNativeFire(isNative);
    if(isNative)bridge!.openFireplace!(index);
  };
  useEffect(()=>{
    const closed=()=>exitAmbient();
    window.addEventListener("motion-fireplace-closed",closed);
    return ()=>window.removeEventListener("motion-fireplace-closed",closed);
  },[]);
  useEffect(()=>{
    if(!ambient)return;
    const handle=(e:KeyboardEvent)=>{
      if(e.key==="Escape"||e.key==="BrowserBack"||e.key==="GoBack"||e.key==="Backspace"||e.key==="Enter"||e.key===" "){
        e.preventDefault();e.stopImmediatePropagation();exitAmbient();
      }else if(e.key==="ArrowLeft"||e.key==="ArrowRight"){
        e.preventDefault();e.stopImmediatePropagation();
        const delta=e.key==="ArrowLeft"?-1:1;
        if(ambient==="wallpapers")stepWallpaper(delta,"sequential");
        else if(!nativeFire)setFireIndex(i=>nextFireplace(i,delta));
      }
    };
    window.addEventListener("keydown",handle,true);
    return ()=>window.removeEventListener("keydown",handle,true);
  },[ambient,nativeFire]);
  useEffect(() => onBridge(message => {
    if (message.type !== "key") return;
    if(ambient){const keys:Record<string,string>={DPAD_CENTER:"Enter",ENTER:"Enter",BACK:"Escape",DPAD_LEFT:"ArrowLeft",DPAD_RIGHT:"ArrowRight"};if(keys[message.key])window.dispatchEvent(new KeyboardEvent("keydown",{key:keys[message.key],bubbles:true}));return;}
    const map: Record<string, string> = { DPAD_UP: "ArrowUp", DPAD_DOWN: "ArrowDown", DPAD_LEFT: "ArrowLeft", DPAD_RIGHT: "ArrowRight", BACK: "Escape" };
    if (message.key === "DPAD_CENTER" || message.key === "ENTER") {
      if (document.activeElement instanceof HTMLElement) document.activeElement.click();
    } else if (map[message.key]) {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: map[message.key], bubbles: true }));
    }
  }), [ambient]);

  if(ambient==="fire")return <div className="ambient-fire-screen" data-ambient-active="fire" onClick={exitAmbient}>{!nativeFire&&<video key={fireIndex} src={FIREPLACES[fireIndex].src} autoPlay loop muted playsInline preload="auto" onError={()=>{toast.error("Não foi possível reproduzir a lareira.");exitAmbient();}}/>}</div>;
  return <div className={"tv-home"+(ambient==="wallpapers"?" tv-ambient-wallpapers":"")} data-ambient-active={ambient??undefined} data-copy-side="left" onClick={ambient==="wallpapers"?exitAmbient:undefined}>
    <div className="tv-scene">
      {readyHero && <Artwork key={readyHero.art.src} wallpaper={wallpaper} sourceOverride={readyHero.art} className="tv-wallpaper tv-wallpaper-enter" />}
      {!ambient&&<><div className="tv-local-scrim" /><div className="tv-bottom-fade" /></>}
    </div>

    {!ambient&&<><header className="tv-header">
      <Link className="tv-brand-link" to="/" aria-label="Motion Laucher início"><Brand /></Link>
      <div className="tv-clock" aria-label="Hora atual">
        <strong>{now?.toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"}) ?? "--:--"}</strong>
        <small>{now?.toLocaleDateString("pt-BR", {weekday:"short", day:"numeric", month:"short"}) ?? ""}</small>
      </div>
    </header>

    <main className="tv-main">
      <section className="tv-hero">
        <div className="hero-copy">
          <p className="hero-category"><Gamepad2 size={16}/>{readyHero ? wallpaper.kind + " · Em destaque" : "Wallpapers"}</p>
          <h1 key={wallpaper.id} className="hero-title tv-title-enter" title={wallpaper.title}>{wallpaper.title}</h1>
          {wallpaper.genres.length > 0 && <p className="hero-details">{wallpaper.genres.slice(0, 2).join(" · ")}</p>}
          <p className="hero-release-date" aria-label={readyHero?"Data de lançamento":"Status dos wallpapers"}>{readyHero?formatReleaseDate(wallpaper):"Aguardando artes do catálogo"}</p>
        </div>
      </section>
      <section className="tv-content" aria-label="Aplicativos favoritos">
        <div className="rail-heading">
          <h2>Seus favoritos</h2>
        </div>
        <div className="favorite-row">
          {favorites.slice(0, 7).map((app, index) => <Button
            key={app.pkg} data-nav data-nav-default={index===0 ? "" : undefined} variant="secondary"
            className={"app-tile tv-focusable " + (app.nativeIcon ? "app-tile-native " : APP_TONES[app.tone] ?? "")}
            onClick={() => launchApp(app.id)}
          >{app.nativeIcon
              ? <img className="app-original-icon" src={app.nativeIcon} alt="" width={52} height={52}/>
              : <app.icon className="app-icon" />}
            <span>{app.name}</span>
          </Button>)}
          <Button asChild variant="outline" className="app-tile app-tile-add tv-focusable">
            <Link data-nav data-nav-default={favorites.length===0 ? "" : undefined} to="/library"><Plus/><span>Adicionar</span></Link>
          </Button>
        </div>
      </section>
      <div className="tv-nav-dock" aria-label="Menu inferior"><Navigation actions={<>
        <Button data-nav data-ambient-launch="wallpapers" variant="ghost" className="tv-focusable ambient-nav-button ambient-nav-first" title="Wallpapers em tela cheia" aria-label="Wallpapers em tela cheia" onClick={()=>{setAmbient("wallpapers");toast.dismiss();}}><Maximize/><span>Tela cheia</span></Button>
        <Button data-nav data-ambient-launch="fire" variant="ghost" className="tv-focusable ambient-nav-button" title="Lareira virtual" aria-label="Lareira virtual" onClick={()=>setFireDialog(true)}><Flame/><span>Lareira</span></Button>
      </>}/></div>
    </main>
    <Dialog open={fireDialog} onOpenChange={setFireDialog}>
      <DialogContent className="ambient-picker">
        <DialogTitle>Lareira virtual</DialogTitle>
        <DialogDescription>Escolha uma cena. Voltar ou OK encerra a reprodução; as setas laterais alternam as lareiras.</DialogDescription>
        <div className="ambient-picker-grid">{FIREPLACES.map((f,i)=><button type="button" data-nav key={f.id} className="ambient-pick" onClick={()=>startFire(i)}><img src={f.poster} alt=""/><strong>{f.title}</strong><small>{f.author} · {f.license}</small></button>)}</div>
        <p className="ambient-picker-credit">Vídeos do Wikimedia Commons, adaptados para MP4 480p sem áudio. Créditos e licenças no repositório.</p>
        <Button data-nav variant="outline" onClick={()=>setFireDialog(false)}>Voltar</Button>
      </DialogContent>
    </Dialog>
    </>}
  </div>;
}

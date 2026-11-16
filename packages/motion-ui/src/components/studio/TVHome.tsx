import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Plus, Gamepad2, SlidersHorizontal, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand, Navigation } from "./Shell";
import { Artwork } from "./Artwork";
import { APP_TONES } from "@/data/apps";
import { availableLauncherApps, isNativeLauncher } from "@/lib/device/native-android";
import { useCurrentWallpaper } from "@/lib/wallpaper";
import { formatReleaseDate } from "@/lib/catalog/format-release";
import { useAppState } from "@/lib/store";
import { launchApp } from "@/lib/actions";
import { onBridge } from "@/lib/device/bridge-channel";
import { useNetworkClock } from "@/hooks/use-env";

/**
 * TV home is ONE fixed 16:9 screen. No vertical scrolling and no offscreen apps.
 * The same structure is used in the browser preview and the projector APK.
 */
export function TVHome() {
  const { wallpaper } = useCurrentWallpaper();
  const pinned = useAppState(s => s.pinned);
  const now = useNetworkClock(1_000);
  const apps = availableLauncherApps();
  const native = isNativeLauncher();
  const pinnedApps = pinned.map(id => apps.find(app => app.id === id)).filter((app): app is (typeof apps)[number] => Boolean(app) && app?.pkg !== "org.xbmc.kodi");
  const favorites = native && pinnedApps.length === 0 ? apps.slice(0, 5) : pinnedApps;

  useEffect(() => onBridge(message => {
    if (message.type !== "key") return;
    const map: Record<string, string> = { DPAD_UP: "ArrowUp", DPAD_DOWN: "ArrowDown", DPAD_LEFT: "ArrowLeft", DPAD_RIGHT: "ArrowRight", BACK: "Escape" };
    if (message.key === "DPAD_CENTER" || message.key === "ENTER") {
      if (document.activeElement instanceof HTMLElement) document.activeElement.click();
    } else if (map[message.key]) {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: map[message.key], bubbles: true }));
    }
  }), []);

  return <div className="tv-home" data-copy-side="left">
    <div className="tv-scene">
      <Artwork key={wallpaper.id} wallpaper={wallpaper} className="tv-wallpaper tv-wallpaper-enter" />
      <div className="tv-local-scrim" />
      <div className="tv-bottom-fade" />
    </div>

    <header className="tv-header">
      <Link className="tv-brand-link" to="/" aria-label="Motion Laucher início"><Brand /></Link>
      <div className="tv-clock" aria-label="Hora atual">
        <strong>{now?.toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"}) ?? "--:--"}</strong>
        <small>{now?.toLocaleDateString("pt-BR", {weekday:"short", day:"numeric", month:"short"}) ?? ""}</small>
      </div>
    </header>

    <main className="tv-main">
      <section className="tv-hero">
        <div className="hero-copy">
          <p className="hero-category"><Gamepad2 size={16}/>{wallpaper.kind} · Em destaque</p>
          <h1 key={wallpaper.id} className="hero-title tv-title-enter" title={wallpaper.title}>{wallpaper.title}</h1>
          {wallpaper.genres.length > 0 && <p className="hero-details">{wallpaper.genres.slice(0, 2).join(" · ")}</p>}
          <p className="hero-release-date" aria-label="Data de lançamento">{formatReleaseDate(wallpaper)}</p>
          <Button data-nav data-nav-default asChild className="tv-personalize tv-focusable" size="lg">
            <Link to="/wallpapers"><SlidersHorizontal size={18}/>Personalizar tela</Link>
          </Button>
        </div>
      </section>
      <div className="tv-nav-dock"><Navigation /></div>

      <section className="tv-content" aria-label="Aplicativos favoritos">
        <div className="rail-heading">
          <h2>Seus favoritos</h2>
          <Button asChild variant="ghost" size="sm"><Link data-nav to="/library">Todos os apps<ChevronRight size={16}/></Link></Button>
        </div>
        <div className="favorite-row">
          {favorites.slice(0, 7).map(app => <Button
            key={app.pkg} data-nav variant="secondary"
            className={"app-tile tv-focusable " + (app.nativeIcon ? "app-tile-native " : APP_TONES[app.tone] ?? "")}
            onClick={() => launchApp(app.id)}
          >{app.nativeIcon
              ? <img className="app-original-icon" src={app.nativeIcon} alt="" width={52} height={52}/>
              : <app.icon className="app-icon" />}
            <span>{app.name}</span>
          </Button>)}
          <Button asChild variant="outline" className="app-tile app-tile-add tv-focusable">
            <Link data-nav to="/library"><Plus/><span>Adicionar</span></Link>
          </Button>
        </div>
      </section>
    </main>
  </div>;
}

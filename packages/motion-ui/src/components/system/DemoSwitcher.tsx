import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Tv, Smartphone, LayoutGrid, Image, Settings, Library, Sparkles, LifeBuoy, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

const SCREENS = [
  { to: "/launcher", label: "TV · Início", icon: Tv },
  { to: "/library", label: "TV · Biblioteca", icon: Library },
  { to: "/wallpapers", label: "TV · Wallpapers", icon: Image },
  { to: "/settings", label: "TV · Ajustes", icon: Settings },
  { to: "/onboarding", label: "TV · Boas-vindas", icon: Sparkles },
  { to: "/recovery", label: "TV · Recuperação", icon: LifeBuoy },
  { to: "/remote", label: "MRL · Controle remoto", icon: Smartphone },
] as const;

/** Floating switch between the TV launcher and the MRL companion. Excluded from DPAD navigation. */
export function DemoSwitcher() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const onRemote = path.startsWith("/remote");

  return (
    <div data-nav-ignore className={cn("fixed z-[60] flex flex-col items-end gap-2", onRemote ? "bottom-24 right-3 lg:bottom-6 lg:right-6" : "bottom-4 right-4")}>
      {open && (
        <nav aria-label="Todas as telas do protótipo" className="glass-strong w-60 rounded-2xl p-2 text-sm shadow-elevated">
          <p className="px-2 pb-1 pt-1 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">Telas do protótipo</p>
          {SCREENS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-foreground hover:bg-secondary"
              activeProps={{ className: "bg-primary/15 text-primary" }}
            >
              <s.icon className="size-4" aria-hidden />
              {s.label}
            </Link>
          ))}
        </nav>
      )}
      <div className="glass-strong flex items-center gap-1 rounded-full p-1 shadow-elevated">
        <Link
          to={onRemote ? "/launcher" : "/remote"}
          className="flex items-center gap-2 rounded-full bg-brand px-3 py-1.5 text-xs font-bold text-primary-foreground"
        >
          {onRemote ? <Tv className="size-4" aria-hidden /> : <Smartphone className="size-4" aria-hidden />}
          {onRemote ? "Ver TV" : "Ver MRL (celular)"}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Fechar lista de telas" : "Abrir lista de telas"}
          className="grid size-8 place-items-center rounded-full text-foreground hover:bg-secondary"
        >
          {open ? <X className="size-4" /> : <LayoutGrid className="size-4" />}
          <span className="sr-only">
            <ChevronUp />
          </span>
        </button>
      </div>
    </div>
  );
}

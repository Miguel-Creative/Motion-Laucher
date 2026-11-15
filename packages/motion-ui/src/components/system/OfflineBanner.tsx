import { WifiOff } from "lucide-react";
import { useOnline } from "@/hooks/use-env";
import { useSetting } from "@/lib/store";

export function OfflineBanner() {
  const online = useOnline();
  const forced = useSetting<boolean>("network.offlineMode");
  if (online && !forced) return null;
  return (
    <div role="status" className="fixed left-1/2 top-3 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full border border-warning/40 bg-card px-4 py-1.5 text-xs font-semibold text-warning shadow-elevated">
      <WifiOff className="size-4" aria-hidden />
      {online ? "Modo offline ativado nos ajustes — usando catálogo local" : "Sem internet — tudo continua funcionando com dados locais"}
    </div>
  );
}

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { registerRemoteOffline } from "@/lib/pwa";

export function RemoteConnectivity() {
  const [online, setOnline] = useState(true);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let mounted = true;
    const sync = () => setOnline(navigator.onLine);
    sync();
    void registerRemoteOffline().then(value => { if (mounted) setReady(value); }).catch(() => undefined);
    window.addEventListener("online", sync); window.addEventListener("offline", sync);
    return () => { mounted = false; window.removeEventListener("online", sync); window.removeEventListener("offline", sync); };
  }, []);
  return <section className="mb-4 border-b border-border pb-3 text-xs">
    <p className="flex items-center gap-2 text-warning" role="status">{!online && <WifiOff size={16} />}{online ? "Ponte Android desconectada · Demonstração local" : "Sem internet · Ponte desconectada · Demonstração local"}</p>
    {!online && <p className="mt-2 leading-relaxed text-muted-foreground">Os controles simulam ações apenas neste navegador. Nenhum comando será guardado para envio ao aparelho.</p>}
    <p className="mt-2 text-muted-foreground">{ready ? "MRL preparado para abrir offline" : "Offline disponível após abrir no endereço publicado"}</p>
  </section>;
}
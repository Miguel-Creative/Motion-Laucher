import { toast } from "sonner";
import { getApp } from "@/data/apps";
import { device } from "@/lib/device/simulated";
import { CATALOG_SOURCES } from "@/lib/catalog/sources";
import {
  exportState, getState, importState, pushRecent, readSetting, resetAll, setState, DEFAULT_STATE,
} from "./store";

export const LAUNCH_EVENT = "ml-launch";

/** Opens an app (simulated). The TV shows a launch transition; nothing real is started. */
export function launchApp(appId: string) {
  pushRecent(appId);
  void device.launchApp(appId);
  window.dispatchEvent(new CustomEvent(LAUNCH_EVENT, { detail: appId }));
}

export function appName(id: string) {
  return getApp(id)?.name ?? id;
}

type Navigate = (to: string) => void;

function download(name: string, content: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function runSettingAction(action: string, navigate: Navigate) {
  switch (action) {
    case "open-wallpapers":
      return navigate("/wallpapers");
    case "open-remote":
      return navigate("/remote");
    case "open-recovery":
      return navigate("/recovery");
    case "rerun-onboarding":
      setState({ onboarded: false });
      return navigate("/welcome");
    case "reset-apps":
      setState({ pinned: DEFAULT_STATE.pinned, hidden: [], order: [] });
      return toast.success("Layout de apps restaurado.");
    case "reset-all":
      resetAll();
      return toast.success("Padrões de fábrica restaurados neste dispositivo.");
    case "export-backup":
      download(`motion-laucher-backup-${new Date().toISOString().slice(0, 10)}.json`, exportState());
      return toast.success("Backup exportado.", { description: "Arquivo JSON salvo pelo navegador." });
    case "import-backup": {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const ok = importState(await file.text());
        if (ok) toast.success("Configurações importadas.");
        else toast.error("Arquivo inválido", { description: "Use um backup exportado pelo Motion Laucher." });
      };
      input.click();
      return;
    }
    case "clear-cache":
      setState({ uploads: [], recents: [] });
      return toast.success("Cache limpo.", { description: "Wallpapers próprios e recentes removidos." });
    case "clear-history":
      setState({ recents: [] });
      return toast.success("Histórico apagado.");
    case "storage-usage": {
      const bytes = new Blob([localStorage.getItem("motion-laucher:v1") ?? ""]).size;
      let quota = "";
      if (navigator.storage?.estimate) {
        const est = await navigator.storage.estimate();
        if (est.quota) quota = ` · cota do navegador ≈ ${(est.quota / 1024 / 1024).toFixed(0)} MB`;
      }
      return toast.info(`Preferências e imagens: ${(bytes / 1024).toFixed(1)} KB${quota}`, { description: `${getState().uploads.length} wallpaper(s) próprio(s).` });
    }
    case "test-network": {
      const start = performance.now();
      try {
        await fetch(`/favicon.png?t=${Date.now()}`, { cache: "no-store" });
        const ms = Math.round(performance.now() - start);
        return toast.success(navigator.onLine ? `Online · resposta local em ${ms} ms` : "Sem internet, mas o app local responde.");
      } catch {
        return toast.error("Sem resposta da rede.");
      }
    }
    case "test-notification":
      return toast("Motion Laucher", { description: "Este é um aviso de teste com as configurações atuais.", duration: readSetting<number>("notify.duration") * 1000 });
    case "check-updates": {
      try {
        const res = await fetch("https://api.github.com/repos/Miguel-Creative/Motion-Laucher/releases/latest");
        if (res.status === 404) return toast.info("Nenhuma versão publicada ainda no repositório oficial.", { description: "Consulta somente leitura ao GitHub." });
        if (!res.ok) return toast.error(`GitHub respondeu HTTP ${res.status}.`);
        const data = (await res.json()) as { tag_name?: string; name?: string };
        return toast.success(`Última versão publicada: ${data.tag_name ?? data.name ?? "desconhecida"}`, { description: "A instalação no Android sempre exige confirmação." });
      } catch {
        return toast.error("Não foi possível consultar o GitHub (offline?).");
      }
    }
    case "test-providers": {
      let tested = 0;
      for (const src of CATALOG_SOURCES) {
        if (!src.settingKey || !src.test || !src.browserCapable) continue;
        const key = readSetting<string>(src.settingKey);
        if (!key) continue;
        tested++;
        try {
          const r = await src.test(key);
          if (r.ok) toast.success(r.message);
          else toast.error(r.message);
        } catch {
          toast.error(`${src.name}: falha de rede ou CORS.`);
        }
      }
      if (!tested) toast.info("Nenhuma chave configurada", { description: "O catálogo continua em modo Demonstração." });
      return;
    }
    case "open-repo":
      window.open("https://github.com/Miguel-Creative/Motion-Laucher", "_blank", "noopener");
      return;
    case "about":
      return toast.info("Motion Laucher 0.1.0 (protótipo web)", { description: "Referência visual e de interação. Produção: Android nativo (Kotlin/Java), sem WebView permanente." });
    case "attribution":
      return toast.info("Atribuições", { description: "Artes de demonstração originais. Provedores reais (TMDB, RAWG, IGDB, SteamGridDB) exibem créditos próprios." });
    case "perf-info":
      return toast.info("Medições honestas", { description: "Tamanho do bundle ≠ uso de RAM. Desempenho real só pode ser medido no app nativo." });
    default:
      return toast.error(`Ação desconhecida: ${action}`);
  }
}

import { APPS, getApp } from "@/data/apps";
import { setSetting, setState } from "@/lib/store";
import { postBridge } from "./bridge-channel";
import {
  ANDROID_KEYCODES, type AndroidKey, type AppAction, type CommandResult, type DeviceAdapter, type DeviceInfo,
  type FileEntry, type InstalledApp, type LogLine, type PointerEvent, type ProcessInfo, type SystemStats,
} from "./types";

export const SIMULATED_DEVICES: DeviceInfo[] = [
  { id: "hy300-sala", name: "Projetor da Sala", model: "HY300por", android: "Android 11", abi: "armeabi-v7a (32-bit)", address: "192.168.0.42 (exemplo)", simulated: true },
  { id: "tvbox-quarto", name: "TV Box do Quarto", model: "Android TV Box genérico", android: "Android 10", abi: "arm64-v8a", address: "192.168.0.57 (exemplo)", simulated: true },
];

export interface CommandLogEntry {
  id: number;
  at: number;
  label: string;
  equivalent?: string;
}

let log: CommandLogEntry[] = [];
let nextId = 1;
const logListeners = new Set<() => void>();

export const commandLog = {
  get: () => log,
  subscribe: (l: () => void) => {
    logListeners.add(l);
    return () => logListeners.delete(l);
  },
};

function record(label: string, equivalent?: string): CommandResult {
  log = [{ id: nextId++, at: Date.now(), label, ...(equivalent ? { equivalent } : {}) }, ...log].slice(0, 60);
  logListeners.forEach((l) => l());
  return { ok: true, simulated: true, message: `${label} (simulado)`, ...(equivalent ? { equivalent } : {}) };
}

// ---- Simulated stats: plausible ranges for a 1 GB ARMv7 device, always labeled DEMO ----
let ramUsed = 690;
let zramUsed = 180;
let t = 0;
const BASE_PROCS: Omit<ProcessInfo, "rssMb" | "cpu">[] = [
  { pid: 812, name: "motion.laucher", pkg: "com.miguelcreative.motionlaucher", state: "foreground" },
  { pid: 421, name: "system_server", pkg: "android", state: "service" },
  { pid: 977, name: "surfaceflinger", pkg: "surfaceflinger", state: "service" },
  { pid: 1204, name: "com.android.systemui", pkg: "com.android.systemui", state: "visible" },
  { pid: 1530, name: "mrl.bridge", pkg: "com.miguelcreative.mrl.bridge", state: "service" },
  { pid: 1688, name: "com.google.android.youtube.tv", pkg: "com.google.android.youtube.tv", state: "cached" },
  { pid: 1712, name: "org.xbmc.kodi", pkg: "org.xbmc.kodi", state: "cached" },
  { pid: 1801, name: "com.android.vending", pkg: "com.android.vending", state: "cached" },
  { pid: 1920, name: "media.codec", pkg: "media.codec", state: "service" },
];
const procMem = new Map<number, number>([[812, 118], [421, 162], [977, 38], [1204, 74], [1530, 22], [1688, 96], [1712, 88], [1801, 54], [1920, 19]]);
const killed = new Set<number>();
const bootAt = Date.now() - 1000 * 60 * 47;

function jitter(v: number, amt: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v + (Math.random() - 0.5) * amt));
}

function demoStats(): SystemStats {
  t++;
  ramUsed = jitter(ramUsed, 30, 560, 860);
  zramUsed = jitter(zramUsed, 14, 90, 360);
  const cores = [0, 1, 2, 3].map((i) => Math.round(jitter(25 + 20 * Math.sin((t + i * 3) / 4), 30, 3, 98)));
  const processes = BASE_PROCS.filter((p) => !killed.has(p.pid)).map((p) => {
    const m = jitter(procMem.get(p.pid) ?? 40, 6, 10, 240);
    procMem.set(p.pid, m);
    return { ...p, rssMb: Math.round(m), cpu: Math.round(p.state === "foreground" ? jitter(18, 14, 2, 60) : jitter(2, 3, 0, 12)) };
  });
  return {
    source: "demo",
    timestamp: Date.now(),
    ram: { totalMb: 1024, usedMb: Math.round(ramUsed), availableMb: Math.round(1024 - ramUsed) },
    zram: { totalMb: 512, usedMb: Math.round(zramUsed), compressedMb: Math.round(zramUsed / 2.8) },
    cpu: { arch: "ARMv7 (Cortex-A7, 4 núcleos)", cores, maxFreqMhz: 1500 },
    temperatureC: Math.round(jitter(54, 4, 46, 68)),
    storage: { totalGb: 8, usedGb: 5.4 },
    uptimeSec: Math.round((Date.now() - bootAt) / 1000),
    processes,
  };
}

const appEnabled = new Map<string, boolean>();

const FS: Record<string, FileEntry[]> = {
  "/sdcard": [
    { name: "Download", path: "/sdcard/Download", type: "dir", modified: "hoje" },
    { name: "Movies", path: "/sdcard/Movies", type: "dir", modified: "ontem" },
    { name: "Pictures", path: "/sdcard/Pictures", type: "dir", modified: "12/11" },
    { name: "Music", path: "/sdcard/Music", type: "dir", modified: "02/11" },
    { name: "ROMs", path: "/sdcard/ROMs", type: "dir", modified: "28/10" },
    { name: "Android", path: "/sdcard/Android", type: "dir", modified: "—" },
  ],
  "/sdcard/Download": [
    { name: "motion-laucher-0.1.0.apk", path: "/sdcard/Download/motion-laucher-0.1.0.apk", type: "file", sizeKb: 8420, modified: "hoje" },
    { name: "wallpaper-sala.jpg", path: "/sdcard/Download/wallpaper-sala.jpg", type: "file", sizeKb: 612, modified: "hoje" },
    { name: "manual-hy300.pdf", path: "/sdcard/Download/manual-hy300.pdf", type: "file", sizeKb: 2310, modified: "10/11" },
  ],
  "/sdcard/Movies": [
    { name: "trailer-demo.mp4", path: "/sdcard/Movies/trailer-demo.mp4", type: "file", sizeKb: 48210, modified: "ontem" },
    { name: "férias-2026.mkv", path: "/sdcard/Movies/férias-2026.mkv", type: "file", sizeKb: 912000, modified: "05/11" },
  ],
  "/sdcard/Pictures": [
    { name: "Screenshots", path: "/sdcard/Pictures/Screenshots", type: "dir", modified: "12/11" },
    { name: "capa-sessão.png", path: "/sdcard/Pictures/capa-sessão.png", type: "file", sizeKb: 1220, modified: "12/11" },
  ],
  "/sdcard/Pictures/Screenshots": [
    { name: "launcher-home.png", path: "/sdcard/Pictures/Screenshots/launcher-home.png", type: "file", sizeKb: 840, modified: "12/11" },
  ],
  "/sdcard/Music": [{ name: "trilha-ambiente.ogg", path: "/sdcard/Music/trilha-ambiente.ogg", type: "file", sizeKb: 5320, modified: "02/11" }],
  "/sdcard/ROMs": [
    { name: "arcade-horizonte.zip", path: "/sdcard/ROMs/arcade-horizonte.zip", type: "file", sizeKb: 2048, modified: "28/10" },
    { name: "ilhas-do-ceu.iso", path: "/sdcard/ROMs/ilhas-do-ceu.iso", type: "file", sizeKb: 640000, modified: "28/10" },
  ],
  "/sdcard/Android": [],
};

const TAGS = ["ActivityManager", "MotionLaucher", "MRLBridge", "WindowManager", "lowmemorykiller", "Wallpaper", "InputDispatcher"];
const MSGS = [
  "Start proc com.google.android.youtube.tv (demo)",
  "Focus moved to card:lamina-ambar",
  "Wallpaper decoded 1280x720 RGB_565 (demo)",
  "Bridge heartbeat ok (simulado)",
  "Trim memory level=RUNNING_LOW (demo)",
  "Key DPAD_RIGHT dispatched (simulado)",
  "Killing 1801:com.android.vending (adj 906) — exemplo",
];

export class SimulatedDeviceAdapter implements DeviceAdapter {
  readonly kind = "simulated" as const;

  async getSystemStats() {
    return demoStats();
  }

  async sendKey(key: AndroidKey) {
    postBridge({ type: "key", key });
    return record(`Tecla ${key}`, `input keyevent ${ANDROID_KEYCODES[key]}`);
  }

  async sendText(text: string, via: "ime" | "adb") {
    postBridge({ type: "text", text });
    const equivalent = via === "ime"
      ? `IME MotionLaucher.commitText("${text}")`
      : `input text "${text.replace(/ /g, "%s")}"  # sem suporte confiável a Unicode`;
    return record(`Texto (${[...text].length} caracteres)`, equivalent);
  }

  async pointerEvent(evt: PointerEvent) {
    postBridge({ type: "pointer", evt });
    if (evt.kind === "move") return { ok: true, simulated: true, message: "move" };
    const label = evt.kind === "click" ? `Clique ${evt.button === "left" ? "esquerdo" : "direito"}` : evt.kind === "scroll" ? "Rolagem" : `Arrastar (${evt.phase})`;
    return record(label, "AccessibilityService.dispatchGesture(...)");
  }

  async listApps(): Promise<InstalledApp[]> {
    return APPS.map((a) => ({ pkg: a.pkg, label: a.name, system: a.system, enabled: appEnabled.get(a.pkg) ?? true, versionName: a.version, sizeMb: a.sizeMb }));
  }

  async launchApp(appId: string) {
    const app = getApp(appId);
    postBridge({ type: "launch", appId });
    return record(`Abrir ${app?.name ?? appId}`, `monkey -p ${app?.pkg ?? appId} -c android.intent.category.LEANBACK_LAUNCHER 1`);
  }

  async appAction(pkg: string, action: AppAction) {
    const map: Record<AppAction, { cmd: string; label: string; rollback?: AppAction }> = {
      launch: { cmd: `monkey -p ${pkg} 1`, label: "Abrir" },
      "force-stop": { cmd: `am force-stop ${pkg}`, label: "Forçar parada" },
      "clear-cache": { cmd: `pm trim-caches (por app exige root) — ${pkg}`, label: "Limpar cache" },
      disable: { cmd: `pm disable-user --user 0 ${pkg}`, label: "Desativar", rollback: "enable" },
      enable: { cmd: `pm enable ${pkg}`, label: "Reativar", rollback: "disable" },
      uninstall: { cmd: `pm uninstall --user 0 ${pkg}`, label: "Desinstalar (usuário 0)", rollback: "enable" },
      hide: { cmd: `launcher.hide(${pkg})`, label: "Ocultar no launcher", rollback: "enable" },
    };
    const m = map[action];
    if (action === "disable" || action === "uninstall") appEnabled.set(pkg, false);
    if (action === "enable") appEnabled.set(pkg, true);
    return { ...record(`${m.label}: ${pkg}`, m.cmd), ...(m.rollback ? { rollback: m.rollback } : {}) };
  }

  async changeWallpaper(wallpaperId: string) {
    setState({ currentWallpaper: wallpaperId });
    return record(`Wallpaper → ${wallpaperId}`, `launcher.setWallpaper("${wallpaperId}")`);
  }

  async applyTheme(themeId: string) {
    setSetting("appearance.theme", themeId);
    return record(`Tema → ${themeId}`, `launcher.applyTheme("${themeId}")`);
  }

  async listFiles(path: string) {
    return FS[path] ?? [];
  }

  async getLogs(): Promise<LogLine[]> {
    const now = new Date();
    return Array.from({ length: 4 }, (_, i) => ({
      ts: new Date(now.getTime() - i * 900).toLocaleTimeString("pt-BR"),
      level: (["I", "D", "W", "I", "E"] as const)[Math.floor(Math.random() * 5)] ?? "I",
      tag: TAGS[Math.floor(Math.random() * TAGS.length)] ?? "MotionLaucher",
      msg: MSGS[Math.floor(Math.random() * MSGS.length)] ?? "Simulação ativa",
    }));
  }

  killProcess(pid: number) {
    killed.add(pid);
    return record(`Encerrar processo ${pid}`, `am kill / kill ${pid} (exige permissões)`);
  }
}

export const device = new SimulatedDeviceAdapter();

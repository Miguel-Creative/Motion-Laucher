import { Grid2X2 } from "lucide-react";
import { APPS, type LauncherApp } from "@/data/apps";

export interface MotionNativeBridge {
  isNative(): boolean;
  getInstalledApps(): string;
  launchPackage(pkg: string): void;
  openProjectorSettings(): void;
  openAndroidSettings(): void;
  reload(): void;
}
declare global {
  interface Window { MotionNative?: MotionNativeBridge }
}

interface NativeEntry { pkg: string; name: string; system: boolean }
export function isNativeLauncher(): boolean {
  return typeof window !== "undefined" && !!window.MotionNative?.isNative?.();
}
export function availableLauncherApps(): LauncherApp[] {
  if (!isNativeLauncher()) return APPS;
  try {
    const parsed: NativeEntry[] = JSON.parse(window.MotionNative!.getInstalledApps());
    return parsed.filter(item => item.pkg && item.name).map((item, i) => {
      const known = APPS.find(a => a.pkg === item.pkg);
      return known ? { ...known, name: item.name } : {
        id: "native:" + item.pkg,
        name: item.name,
        pkg: item.pkg,
        category: item.system ? "Sistema" as const : "Utilitários" as const,
        system: !!item.system,
        icon: Grid2X2,
        tone: i % 6,
        sizeMb: 0,
        version: "",
      };
    }).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  } catch { return []; }
}
export function launchNativeApp(id: string): boolean {
  if (!isNativeLauncher()) return false;
  const native = window.MotionNative!;
  const app = availableLauncherApps().find(item => item.id === id);
  if (!app) return false;
  native.launchPackage(app.pkg);
  return true;
}

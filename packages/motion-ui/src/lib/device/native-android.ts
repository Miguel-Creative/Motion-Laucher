import { Grid2X2 } from "lucide-react";
import { APPS, type LauncherApp } from "@/data/apps";

export interface MotionNativeBridge {
  isNative(): boolean;
  getInstalledApps(): string;
  launchPackage(pkg: string): void;
  openProjectorSettings(): void;
  openAndroidSettings(): void;
  reload(): void;
  getManagedApps?(): string;
  openAppDetails?(pkg:string): void;
  requestUninstall?(pkg:string): void;
  playMedia?(id:string): void;
  getResumeMedia?():string;
}
declare global {
  interface Window { MotionNative?: MotionNativeBridge }
}

interface NativeEntry { pkg: string; name: string; system: boolean; icon?: string }
let cachedNativeApps: LauncherApp[] | null = null;
if(typeof window!=="undefined")window.addEventListener("motion-apps-changed",()=>{cachedNativeApps=null;});
export interface ManagedApp {pkg:string;name:string;enabled:boolean;system:boolean;version:string;launchable:boolean;self:boolean;apkBytes?:number}
export function getManagedApps():ManagedApp[]{try{const items=JSON.parse(window.MotionNative?.getManagedApps?.()??"[]");return Array.isArray(items)?items.filter((x:ManagedApp)=>x.pkg&&x.name):[];}catch{return [];}}
export function isNativeLauncher(): boolean {
  return typeof window !== "undefined" && !!window.MotionNative?.isNative?.();
}
export function availableLauncherApps(): LauncherApp[] {
  if (!isNativeLauncher()) return APPS;
  if (cachedNativeApps) return cachedNativeApps;
  try {
    const parsed: NativeEntry[] = JSON.parse(window.MotionNative!.getInstalledApps());
    const resolved = parsed.filter(item => item.pkg && item.name && item.pkg !== "com.htc.htcsettings").map((item, i) => {
      const known = APPS.find(a => a.pkg === item.pkg);
      return known ? { ...known, name: item.name, nativeIcon: item.icon } : {
        id: "native:" + item.pkg,
        name: item.name,
        nativeIcon: item.icon,
        pkg: item.pkg,
        category: item.system ? "Sistema" as const : "Utilitários" as const,
        system: !!item.system,
        icon: Grid2X2,
        tone: i % 6,
        sizeMb: 0,
        version: "",
      };
    }).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    cachedNativeApps = resolved;
    return resolved;
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

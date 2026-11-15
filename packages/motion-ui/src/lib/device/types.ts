/**
 * Device adapter contract shared by Motion Laucher (TV) and MRL (remote).
 *
 * IMPORTANT: a browser/PWA cannot speak ADB, inject Android key events or act as a
 * Bluetooth HID device by itself. A real implementation needs the native Android
 * companion bridge (IME + accessibility service + local socket) running on the
 * projector. This prototype ships only `SimulatedDeviceAdapter`.
 */

export type AndroidKey =
  | "DPAD_UP" | "DPAD_DOWN" | "DPAD_LEFT" | "DPAD_RIGHT" | "DPAD_CENTER"
  | "BACK" | "HOME" | "MENU" | "SETTINGS" | "SEARCH" | "POWER"
  | "VOLUME_UP" | "VOLUME_DOWN" | "VOLUME_MUTE"
  | "MEDIA_PLAY_PAUSE" | "MEDIA_NEXT" | "MEDIA_PREVIOUS" | "MEDIA_REWIND" | "MEDIA_FAST_FORWARD"
  | "ENTER" | "DEL" | "TAB" | "ESCAPE";

/** Android KeyEvent keycodes (android.view.KeyEvent) */
export const ANDROID_KEYCODES: Record<AndroidKey, number> = {
  DPAD_UP: 19, DPAD_DOWN: 20, DPAD_LEFT: 21, DPAD_RIGHT: 22, DPAD_CENTER: 23,
  BACK: 4, HOME: 3, MENU: 82, SETTINGS: 176, SEARCH: 84, POWER: 26,
  VOLUME_UP: 24, VOLUME_DOWN: 25, VOLUME_MUTE: 164,
  MEDIA_PLAY_PAUSE: 85, MEDIA_NEXT: 87, MEDIA_PREVIOUS: 88, MEDIA_REWIND: 89, MEDIA_FAST_FORWARD: 90,
  ENTER: 66, DEL: 67, TAB: 61, ESCAPE: 111,
};

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";

export interface DeviceInfo {
  id: string;
  name: string;
  model: string;
  android: string;
  abi: string;
  address: string;
  simulated: true;
}

export interface CommandResult {
  ok: boolean;
  /** Always true in this prototype */
  simulated: boolean;
  message: string;
  /** What the native bridge would execute, for transparency */
  equivalent?: string;
}

export type PointerEvent =
  | { kind: "move"; dx: number; dy: number }
  | { kind: "click"; button: "left" | "right" }
  | { kind: "scroll"; dx: number; dy: number }
  | { kind: "drag"; phase: "start" | "end" };

export interface ProcessInfo {
  pid: number;
  name: string;
  pkg: string;
  rssMb: number;
  cpu: number;
  state: "foreground" | "visible" | "service" | "cached";
}

export interface SystemStats {
  source: "demo" | "bridge";
  timestamp: number;
  ram: { totalMb: number; usedMb: number; availableMb: number };
  zram: { totalMb: number; usedMb: number; compressedMb: number };
  cpu: { arch: string; cores: number[]; maxFreqMhz: number };
  temperatureC: number | null;
  storage: { totalGb: number; usedGb: number };
  uptimeSec: number;
  processes: ProcessInfo[];
}

export interface InstalledApp {
  pkg: string;
  label: string;
  system: boolean;
  enabled: boolean;
  versionName: string;
  sizeMb: number;
}

export type AppAction = "launch" | "force-stop" | "clear-cache" | "disable" | "enable" | "uninstall" | "hide";

export interface FileEntry {
  name: string;
  path: string;
  type: "dir" | "file";
  sizeKb?: number;
  modified: string;
}

export interface LogLine {
  ts: string;
  level: "V" | "D" | "I" | "W" | "E";
  tag: string;
  msg: string;
}

export interface DeviceAdapter {
  readonly kind: "simulated" | "bridge";
  getSystemStats(): Promise<SystemStats>;
  sendKey(key: AndroidKey): Promise<CommandResult>;
  sendText(text: string, via: "ime" | "adb"): Promise<CommandResult>;
  pointerEvent(evt: PointerEvent): Promise<CommandResult>;
  listApps(): Promise<InstalledApp[]>;
  launchApp(appId: string): Promise<CommandResult>;
  appAction(pkg: string, action: AppAction): Promise<CommandResult & { rollback?: AppAction }>;
  changeWallpaper(wallpaperId: string): Promise<CommandResult>;
  applyTheme(themeId: string): Promise<CommandResult>;
  listFiles(path: string): Promise<FileEntry[]>;
  getLogs(): Promise<LogLine[]>;
}

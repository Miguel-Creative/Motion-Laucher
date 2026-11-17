import { useSyncExternalStore } from "react";
import { SETTING_DEFAULTS, SETTINGS_SECTIONS, type SettingValue } from "./settings-schema";

export type ProfileId = "gamer" | "cinema" | "hibrido" | "minimalista" | "personalizado";

export interface UploadedWallpaper {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: number;
}

export interface Collection {
  id: string;
  name: string;
  items: string[];
}

export type MacroStep =
  | { kind: "key"; key: string }
  | { kind: "wait"; ms: number }
  | { kind: "launch"; appId: string }
  | { kind: "text"; text: string }
  | { kind: "wallpaper"; wallpaperId: string }
  | { kind: "theme"; themeId: string };

export interface Macro {
  id: string;
  name: string;
  category: string;
  trigger: "manual" | "schedule" | "boot";
  time: string;
  days: number[];
  enabled: boolean;
  steps: MacroStep[];
}

export interface PersistedState {
  v: 1;
  settings: Record<string, SettingValue>;
  pinned: string[];
  hidden: string[];
  order: string[];
  recents: string[];
  favWallpapers: string[];
  collections: Collection[];
  uploads: UploadedWallpaper[];
  currentWallpaper: string;
  wallpaperAlt: Record<string, number>;
  onboarded: boolean;
  playbackActive: boolean;
  macros: Macro[];
}

const KEY = "motion-laucher:v1";

export const DEFAULT_MACROS: Macro[] = [
  {
    id: "m-cinema", name: "Sessão de cinema", category: "Cinema", trigger: "manual", time: "20:00", days: [5, 6], enabled: true,
    steps: [
      { kind: "theme", themeId: "minimal-oled" },
      { kind: "wait", ms: 600 },
      { kind: "launch", appId: "netflix" },
    ],
  },
  {
    id: "m-gamer", name: "Noite gamer", category: "Jogos", trigger: "schedule", time: "21:30", days: [5], enabled: true,
    steps: [
      { kind: "theme", themeId: "cyber-neon" },
      { kind: "launch", appId: "retroarch" },
    ],
  },
  {
    id: "m-boot", name: "Ao ligar", category: "Sistema", trigger: "boot", time: "08:00", days: [], enabled: false,
    steps: [
      { kind: "key", key: "HOME" },
      { kind: "wait", ms: 400 },
      { kind: "key", key: "DPAD_DOWN" },
    ],
  },
];

export const DEFAULT_STATE: PersistedState = {
  v: 1,
  settings: {},
  pinned: ["youtube", "netflix", "retroarch", "spotify", "steamlink"],
  hidden: [],
  order: [],
  recents: ["youtube", "retroarch", "kodi", "vlc"],
  favWallpapers: [],
  collections: [],
  uploads: [],
  currentWallpaper: "",
  wallpaperAlt: {},
  onboarded: false,
  playbackActive: false,
  macros: DEFAULT_MACROS,
};

const ROTATION_10S_MIGRATION_KEY = "motion-laucher:rotation10s:v115";

function load(): PersistedState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) as Partial<PersistedState> : {};
    const settings = { ...(parsed.settings ?? {}) };
    // First upgrade: older installations may have explicitly persisted the
    // previous 30s default. Switch those to the newly requested 10s once.
    // A user who chose a different interval keeps it, and can select 30s again.
    if (!window.localStorage.getItem(ROTATION_10S_MIGRATION_KEY)) {
      if (settings["wallpaper.rotation"] === "30s") {
        settings["wallpaper.rotation"] = "10s";
        window.localStorage.setItem(KEY, JSON.stringify({ ...DEFAULT_STATE, ...parsed, settings }));
      }
      window.localStorage.setItem(ROTATION_10S_MIGRATION_KEY, "1");
    }
    const retired=(id:string)=>/^[afsmg]-/.test(id);
    const loaded={...DEFAULT_STATE,...parsed,settings};
    return {...loaded,currentWallpaper:retired(loaded.currentWallpaper)?"":loaded.currentWallpaper,
      favWallpapers:loaded.favWallpapers.filter(id=>!retired(id)),
      collections:loaded.collections.map(x=>({...x,items:x.items.filter(id=>!retired(id))})),
      wallpaperAlt:Object.fromEntries(Object.entries(loaded.wallpaperAlt).filter(([id])=>!retired(id))) };
  } catch {
    return DEFAULT_STATE;
  }
}

let state: PersistedState = DEFAULT_STATE;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Quota exceeded: drop uploads first, then retry once.
    try {
      state = { ...state, uploads: state.uploads.slice(-2) };
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* give up silently; state stays in memory */
    }
  }
}

export function initializeStore() {
  if (typeof window === "undefined") return () => {};
  state = load();
  emit();
  // Cross-tab sync: the MRL tab and the TV tab share one local state.
  const handler = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = load();
      emit();
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

export function getState() {
  return state;
}

export function setState(patch: Partial<PersistedState> | ((s: PersistedState) => Partial<PersistedState>)) {
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  persist();
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

const serverSnapshot = () => DEFAULT_STATE;

export function useAppState<T>(selector: (s: PersistedState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(serverSnapshot()),
  );
}

export function readSetting<T extends SettingValue>(id: string, s: PersistedState = state): T {
  return (s.settings[id] ?? SETTING_DEFAULTS[id]) as T;
}

export function useSetting<T extends SettingValue>(id: string): T {
  return useAppState((s) => readSetting<T>(id, s));
}

export function setSetting(id: string, value: SettingValue) {
  setState((s) => ({ settings: { ...s.settings, [id]: value } }));
}

export function setSettings(values: Record<string, SettingValue>) {
  setState((s) => ({ settings: { ...s.settings, ...values } }));
}

export function resetSection(sectionId: string) {
  const section = SETTINGS_SECTIONS.find((s) => s.id === sectionId);
  if (!section) return;
  const ids = new Set(section.items.map((i) => i.id));
  setState((s) => ({
    settings: Object.fromEntries(Object.entries(s.settings).filter(([k]) => !ids.has(k))),
  }));
}

export function resetAll() {
  state = { ...DEFAULT_STATE, onboarded: true };
  persist();
  emit();
}

export function exportState(): string {
  return JSON.stringify({ app: "Motion Laucher", exportedAt: new Date().toISOString(), state }, null, 2);
}

export function importState(json: string): boolean {
  try {
    const parsed = JSON.parse(json) as { state?: Partial<PersistedState> };
    if (!parsed.state || parsed.state.v !== 1) return false;
    state = { ...DEFAULT_STATE, ...parsed.state };
    persist();
    emit();
    return true;
  } catch {
    return false;
  }
}

export function toggleInList(key: "pinned" | "hidden" | "favWallpapers", id: string) {
  setState((s) => {
    const list = s[key];
    return { [key]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] } as Partial<PersistedState>;
  });
}

export function pushRecent(appId: string) {
  if (!readSetting<boolean>("privacy.history")) return;
  setState((s) => ({ recents: [appId, ...s.recents.filter((x) => x !== appId)].slice(0, 10) }));
}

export function movePinned(appId: string, delta: -1 | 1) {
  setState((s) => {
    const list = [...s.pinned];
    const i = list.indexOf(appId);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= list.length) return {};
    const a = list[i]; const b = list[j];
    if (!a || !b) return {};
    [list[i], list[j]] = [b, a];
    return { pinned: list };
  });
}

export const PROFILE_PRESETS: Record<ProfileId, { label: string; description: string; rows: string[] }> = {
  gamer: { label: "Gamer", description: "Jogos em primeiro lugar, tema neon e foco em desempenho.", rows: ["favoritos", "jogos", "recentes", "apps", "acoes", "hdmi", "dispositivo"] },
  cinema: { label: "Cinema", description: "Filmes, séries e streaming com destaque cinematográfico.", rows: ["filmes", "streaming", "favoritos", "recentes", "apps", "acoes"] },
  hibrido: { label: "Híbrido", description: "Equilíbrio entre jogos, filmes e apps.", rows: ["favoritos", "recentes", "jogos", "filmes", "streaming", "apps", "acoes", "hdmi", "dispositivo"] },
  minimalista: { label: "Minimalista", description: "Somente favoritos e ações essenciais, sem distrações.", rows: ["favoritos", "acoes"] },
  personalizado: { label: "Personalizado", description: "Você escolhe as fileiras em Ajustes > Perfis.", rows: [] },
};

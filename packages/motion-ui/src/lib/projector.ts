import { useAppState, readSetting } from "./store";

export interface ProjectorParams {
  enabled: boolean;
  brightness: number;
  gamma: number;
  contrast: number;
  saturation: number;
  vibrance: number;
  shadowDetail: number;
  overlay: number;
  blur: number;
}

export function useProjector(): ProjectorParams {
  return {
    enabled: useAppState((s) => readSetting<boolean>("projector.enabled", s)),
    brightness: useAppState((s) => readSetting<number>("projector.brightness", s)),
    gamma: useAppState((s) => readSetting<number>("projector.gamma", s)),
    contrast: useAppState((s) => readSetting<number>("projector.contrast", s)),
    saturation: useAppState((s) => readSetting<number>("projector.saturation", s)),
    vibrance: useAppState((s) => readSetting<number>("projector.vibrance", s)),
    shadowDetail: useAppState((s) => readSetting<number>("projector.shadowDetail", s)),
    overlay: useAppState((s) => readSetting<number>("projector.overlay", s)),
    blur: useAppState((s) => readSetting<number>("projector.blur", s)),
  };
}

/** Tone curve: gamma on midtones + shadow lift that preserves highlights. */
export function toneTable(gamma: number, shadow: number, samples = 24) {
  const lift = shadow / 100;
  const values: string[] = [];
  for (let i = 0; i < samples; i++) {
    const x = i / (samples - 1);
    let y = Math.pow(x, 1 / gamma);
    y = y + lift * 0.38 * Math.pow(1 - y, 2.2) * (1 - Math.pow(1 - x, 12) * 0.25);
    values.push(Math.min(1, Math.max(0, y)).toFixed(4));
  }
  return values.join(" ");
}

/** CSS filter string for artwork. Uses the SVG filter #ml-projector for gamma/shadows/vibrance. */
export function artFilter(p: ProjectorParams, extra?: string) {
  const parts: string[] = [];
  if (p.enabled) {
    parts.push("url(#ml-projector)");
    parts.push(`brightness(${p.brightness / 100})`);
    parts.push(`contrast(${p.contrast / 100})`);
    parts.push(`saturate(${p.saturation / 100})`);
  }
  if (p.blur > 0) parts.push(`blur(${p.blur}px)`);
  if (extra) parts.push(extra);
  return parts.length ? parts.join(" ") : "none";
}

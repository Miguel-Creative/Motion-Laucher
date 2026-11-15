import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { readSetting, useAppState } from "@/lib/store";
import { usePageVisible } from "@/hooks/use-env";

/** Pushes theme/performance settings onto <html> so pure CSS can react everywhere. */
export function ThemeApplier({ children }: { children: ReactNode }) {
  const theme = useAppState((s) => readSetting<string>("appearance.theme", s));
  const accent = useAppState((s) => readSetting<string>("appearance.accent", s));
  const perf = useAppState((s) => readSetting<string>("performance.visualMode", s));
  const focus = useAppState((s) => readSetting<string>("motion.focusEffect", s));
  const reduce = useAppState((s) => readSetting<boolean>("motion.reduce", s));
  const speed = useAppState((s) => readSetting<number>("motion.speed", s));
  const overlay = useAppState((s) => readSetting<number>("projector.overlay", s));
  const highContrast = useAppState((s) => readSetting<boolean>("a11y.highContrast", s));
  const scale = useAppState((s) => readSetting<number>("appearance.uiScale", s));
  const pauseHidden = useAppState((s) => readSetting<boolean>("performance.pauseHidden", s));
  const visible = usePageVisible();

  useEffect(() => {
    const h = document.documentElement;
    h.dataset["theme"] = theme;
    if (accent === "theme") delete h.dataset["accent"];
    else h.dataset["accent"] = accent;
    h.dataset["perf"] = perf;
    h.dataset["focus"] = focus;
    h.dataset["reduceMotion"] = String(reduce);
    h.dataset["hidden"] = String(pauseHidden && !visible);
    h.lang = "pt-BR";
    h.style.setProperty("--overlay", String(Math.min(1, overlay / 100 + (highContrast ? 0.25 : 0))));
    h.style.setProperty("--ui-scale", String(scale / 100));
    h.style.setProperty("--motion-speed", String(speed));
  }, [theme, accent, perf, focus, reduce, overlay, highContrast, scale, speed, visible, pauseHidden]);

  const reduced = reduce || perf === "leve";
  return (
    <MotionConfig reducedMotion={reduced ? "always" : "user"} transition={{ duration: 0.45 / speed, ease: [0.2, 0.8, 0.2, 1] }}>
      {children}
    </MotionConfig>
  );
}

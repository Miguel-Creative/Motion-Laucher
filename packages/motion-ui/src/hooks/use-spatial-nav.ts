import { useEffect } from "react";

type Dir = "up" | "down" | "left" | "right";
const KEY_DIR: Record<string, Dir> = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };

function isEditable(el: Element) {
  const tag = el.tagName;
  if (tag === "TEXTAREA") return true;
  if (tag === "INPUT") {
    const type = (el as HTMLInputElement).type;
    return !["checkbox", "radio", "button", "submit", "range"].includes(type);
  }
  return (el as HTMLElement).isContentEditable;
}

function visible(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return false;
  const style = getComputedStyle(el);
  return style.visibility !== "hidden" && style.display !== "none";
}

function scope(): ParentNode {
  const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [data-nav-scope]');
  return dialogs[dialogs.length - 1] ?? document;
}

export function getNavCandidates(): HTMLElement[] {
  return Array.from(scope().querySelectorAll<HTMLElement>("[data-nav]")).filter(
    (el) => !el.hasAttribute("disabled") && !el.closest("[data-nav-ignore]") && visible(el),
  );
}

function findNext(from: HTMLElement, list: HTMLElement[], dir: Dir) {
  const a = from.getBoundingClientRect();
  const acx = a.left + a.width / 2;
  const acy = a.top + a.height / 2;
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  for (const el of list) {
    if (el === from) continue;
    const b = el.getBoundingClientRect();
    const bcx = b.left + b.width / 2;
    const bcy = b.top + b.height / 2;
    let primary: number;
    let secondary: number;
    if (dir === "right" || dir === "left") {
      primary = dir === "right" ? b.left - a.right : a.left - b.right;
      if ((dir === "right" ? bcx - acx : acx - bcx) <= 1) continue;
      const overlap = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      secondary = overlap > 0 ? 0 : Math.abs(bcy - acy);
    } else {
      primary = dir === "down" ? b.top - a.bottom : a.top - b.bottom;
      if ((dir === "down" ? bcy - acy : acy - bcy) <= 1) continue;
      const overlap = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      secondary = overlap > 0 ? Math.abs(bcx - acx) * 0.15 : Math.abs(bcx - acx);
    }
    const score = Math.max(primary, -8) + secondary * 2.2;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  return best;
}

export function focusFirst() {
  const list = getNavCandidates();
  const target = list.find((el) => el.hasAttribute("data-nav-default")) ?? list[0];
  target?.focus({ preventScroll: true });
  target?.scrollIntoView({ block: "nearest", inline: "nearest" });
}

/**
 * Geometry-based DPAD navigation for every element marked with `data-nav`.
 * Enter activates (native for buttons/links); Escape/Backspace/BrowserBack triggers `onBack`.
 */
export function useSpatialNav(onBack?: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const active = document.activeElement as HTMLElement | null;
      const inEditable = !!active && isEditable(active);

      if (e.key === "Escape" || e.key === "BrowserBack" || e.key === "GoBack" || (e.key === "Backspace" && !inEditable)) {
        // Radix overlays close themselves on Escape.
        if (document.querySelector('[role="dialog"][data-state="open"], [role="listbox"], [role="menu"]')) return;
        if (onBack) {
          e.preventDefault();
          onBack();
        }
        return;
      }

      const dir = KEY_DIR[e.key];
      if (!dir) return;
      if (active?.closest('[role="listbox"], [role="menu"]')) return;
      // Let Android's IME own its arrow keys after the user explicitly opened search.
      if (inEditable) return;
      if (active?.getAttribute("role") === "slider" && (dir === "left" || dir === "right")) return;

      const list = getNavCandidates();
      if (!active || active === document.body || !active.matches("[data-nav]") || !list.includes(active)) {
        e.preventDefault();
        e.stopPropagation();
        focusFirst();
        return;
      }
      const zone = active.closest("[data-settings-zone]")?.getAttribute("data-settings-zone");
      const settings = active.closest(".settings-tv");
      let next: HTMLElement | null = null;
      if (settings && zone) {
        const within = list.filter(el => settings.contains(el));
        const categories = within.filter(el => el.closest('[data-settings-zone="categories"]'));
        const options = within.filter(el => el.closest('[data-settings-zone="options"]'));
        const currentCategory = categories.find(el => el.getAttribute("aria-pressed") === "true") ?? categories.find(el => el.hasAttribute("data-setting-category"));
        if (zone === "categories") {
          if (dir === "right") next = options[0] ?? null;
          else if (dir === "up") next = categories[categories.indexOf(active)-1] ?? findNext(active,list.filter(el=>!settings.contains(el)),dir);
          else if (dir === "down") next = categories[categories.indexOf(active)+1] ?? null;
        } else {
          const row = active.closest(".setting-row");
          const peers = row ? options.filter(el=>el.closest(".setting-row")===row) : [active];
          const index = options.indexOf(active);
          if (dir === "left") next = peers[peers.indexOf(active)-1] ?? currentCategory ?? null;
          else if (dir === "right") next = peers[peers.indexOf(active)+1] ?? null;
          else {
            const rest = dir === "down" ? options.slice(index+1) : options.slice(0,index).reverse();
            const first = rest.find(el=>!row || el.closest(".setting-row")!==row);
            if(first){
              const nextRow=first.closest(".setting-row");
              const controls=nextRow?options.filter(el=>el.closest(".setting-row")===nextRow):[first];
              next=controls[Math.min(Math.max(peers.indexOf(active),0),controls.length-1)] ?? first;
            } else if(dir==="up") next=findNext(active,list.filter(el=>!settings.contains(el)),dir);
          }
        }
        if (!next) { e.preventDefault(); e.stopPropagation(); return; }
      } else next = findNext(active, list, dir);
      if (next) {
        e.preventDefault();
        e.stopPropagation();
        next.focus({ preventScroll: true });
        next.scrollIntoView({ block: "nearest", inline: "nearest", behavior: document.documentElement.dataset["perf"] === "leve" ? "auto" : "smooth" });
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [onBack]);
}

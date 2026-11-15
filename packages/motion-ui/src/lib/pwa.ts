import { refuseOfflineWorker } from "./pwa-policy";

export async function registerRemoteOffline(): Promise<boolean> {
  if (!("serviceWorker" in navigator)) return false;
  if (refuseOfflineWorker(window.location.hostname, import.meta.env.PROD, window.self !== window.top, window.location.search)) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.filter(r => [r.active, r.waiting, r.installing].some(w => w && new URL(w.scriptURL).pathname === "/sw.js")).map(r => r.unregister()));
    return false;
  }
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  await navigator.serviceWorker.ready;
  // The first remote visit is warmed after activation, so a later offline launch
  // has the actual SSR document, not just an informational fallback page.
  if (!navigator.serviceWorker.controller) {
    await new Promise<void>(resolve => {
      const done = () => { clearTimeout(timer); navigator.serviceWorker.removeEventListener("controllerchange", done); resolve(); };
      const timer = window.setTimeout(done, 5000);
      navigator.serviceWorker.addEventListener("controllerchange", done, { once: true });
    });
  }
  if (navigator.serviceWorker.controller) {
    await fetch("/remote?__mrl_shell=1", { credentials: "omit" }).catch(() => undefined);
  }
  void registration.update().catch(() => undefined);
  return Boolean(navigator.serviceWorker.controller);
}
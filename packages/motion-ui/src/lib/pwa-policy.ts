// Only app-shell workers are owned here; messaging workers are left untouched.
export function refuseOfflineWorker(hostname: string, production: boolean, framed: boolean, search: string, delegatedHost = "") {
  const host = hostname.toLowerCase();
  return !production || framed || new URLSearchParams(search).get("sw") === "off" ||
    (Boolean(delegatedHost) && host === delegatedHost.toLowerCase()) ||
    /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+\.(?:lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(host) ||
    /^project--.+-dev\.(?:lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(host) ||
    /(^|\.)(?:lovableproject\.com|lovableproject-dev\.com|beta\.lovable\.dev)$/.test(host);
}

export function isRemoteNavigation({ url, request, sameOrigin }: { url: URL; request: { mode: string }; sameOrigin: boolean }) {
  return sameOrigin && url.pathname === "/remote" && (request.mode === "navigate" || url.searchParams.get("__mrl_shell") === "1");
}
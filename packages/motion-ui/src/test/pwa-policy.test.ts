import { describe, expect, it } from "vitest";
import { refuseOfflineWorker, isRemoteNavigation } from "@/lib/pwa-policy";

describe("MRL offline safety", () => {
  it.each(["id-preview--abc.lovable.app", "preview-v2--abc.gpt-eng.com", "project--abc-dev.lovable.app", "x.lovableproject.com", "x.lovableproject-dev.com", "beta.lovable.dev"])("never registers on preview %s", host => expect(refuseOfflineWorker(host, true, false, "")).toBe(true));
  it("never registers during development", () => expect(refuseOfflineWorker("localhost", false, false, "")).toBe(true));
  it("never registers inside an iframe", () => expect(refuseOfflineWorker("mrl.example.com", true, true, "")).toBe(true));
  it("supports the explicit kill switch", () => expect(refuseOfflineWorker("mrl.example.com", true, false, "?sw=off")).toBe(true));
  it("allows published custom domains", () => expect(refuseOfflineWorker("preview-v2--shop.example.com", true, false, "")).toBe(false));
  it("guards exact delegated previews", () => expect(refuseOfflineWorker("studio.example.com", true, false, "", "studio.example.com")).toBe(true));
  it("caches only remote navigation, not API or OAuth routes", () => {
    const origin = "https://mrl.example.com";
    const match = (path: string, mode = "navigate", sameOrigin = true) => isRemoteNavigation({ url: new URL(origin + path), request: { mode }, sameOrigin });
    expect(match("/remote")).toBe(true);
    expect(match("/remote?__mrl_shell=1", "cors")).toBe(true);
    expect(match("/remote", "cors")).toBe(false);
    for (const path of ["/api/control", "/~oauth", "/settings"]) expect(match(path)).toBe(false);
    expect(match("/remote", "navigate", false)).toBe(false);
  });
});
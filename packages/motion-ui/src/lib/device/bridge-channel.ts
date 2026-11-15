/**
 * Local demo bridge: BroadcastChannel between browser tabs/iframes on the SAME browser.
 * This only lets the MRL tab drive the TV tab inside this prototype — it is not ADB.
 */
import type { AndroidKey, PointerEvent } from "./types";

export type BridgeMessage =
  | { type: "key"; key: AndroidKey }
  | { type: "text"; text: string }
  | { type: "pointer"; evt: PointerEvent }
  | { type: "launch"; appId: string }
  | { type: "navigate"; to: string };

const NAME = "motion-laucher-demo-bridge";
let channel: BroadcastChannel | null = null;

function getChannel() {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!channel) channel = new BroadcastChannel(NAME);
  return channel;
}

export function postBridge(msg: BridgeMessage) {
  getChannel()?.postMessage(msg);
}

export function onBridge(cb: (msg: BridgeMessage) => void) {
  const ch = getChannel();
  if (!ch) return () => {};
  const handler = (e: MessageEvent<BridgeMessage>) => cb(e.data);
  ch.addEventListener("message", handler);
  return () => ch.removeEventListener("message", handler);
}

import { useSyncExternalStore } from "react";
import { commandLog } from "./simulated";

const empty: ReturnType<typeof commandLog.get> = [];

export function useCommandLog() {
  return useSyncExternalStore(commandLog.subscribe, commandLog.get, () => empty);
}

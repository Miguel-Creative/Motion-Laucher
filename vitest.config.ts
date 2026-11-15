import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
export default defineConfig({
 plugins:[react()],
 resolve:{alias:{"@":fileURLToPath(new URL("./packages/motion-ui/src/",import.meta.url))}},
 test:{environment:"jsdom",setupFiles:["./packages/motion-ui/src/test/setup.ts"],include:["packages/motion-ui/src/test/*.{test,spec}.{ts,tsx}"],clearMocks:true},
});

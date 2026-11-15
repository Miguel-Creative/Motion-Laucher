import { describe, expect, it } from "vitest";
import { tvRouter } from "../../../../apps/tv-preview/src/router";
import { mrlRouter } from "../../../../apps/mrl-pwa/src/router";
describe("Aplicativos independentes",()=>{
 it.each(["/","/launcher","/wallpapers","/settings","/library","/welcome","/recovery"])("TV tem página %s",p=>expect(tvRouter.matchRoutes(p).at(-1)?.routeId).toBe(p));
 it.each(["/","/remote"])("MRL tem página %s",p=>expect(mrlRouter.matchRoutes(p).at(-1)?.routeId).toBe(p));
 it("TV não oferece tela de controle remoto",()=>expect(tvRouter.matchRoutes("/remote").at(-1)?.routeId).not.toBe("/remote"));
 it("MRL não incorpora galeria TV",()=>expect(mrlRouter.matchRoutes("/wallpapers").at(-1)?.routeId).not.toBe("/wallpapers"));
});

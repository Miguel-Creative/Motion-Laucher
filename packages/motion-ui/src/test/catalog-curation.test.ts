import { describe, expect, it } from "vitest";
import catalogWorker,{ isInternationalForBR } from "../../../../apps/catalog-worker/index";
import { chooseWallpaperLayout } from "@/lib/image/smart-framing";

describe("catálogo internacional para o público brasileiro", () => {
  const sample={backdrop_path:"/wide.jpg",adult:false,origin_country:["US"],original_language:"en"};
  it("accepts English, Korean and Japanese productions available in the region", () => {
    expect(isInternationalForBR(sample)).toBe(true);
    expect(isInternationalForBR({...sample,origin_country:["KR"],original_language:"ko"})).toBe(true);
    expect(isInternationalForBR({...sample,origin_country:["JP"],original_language:"ja"})).toBe(true);
  });
  it("respects the requested origin and language filters", () => {
    for (const [country,language] of [["BR","pt"],["CN","zh"],["TH","th"]]) {
      expect(isInternationalForBR({...sample,origin_country:[country],original_language:language})).toBe(false);
    }
    expect(isInternationalForBR({...sample,origin_country:["BR"],original_language:"en"})).toBe(false);
    expect(isInternationalForBR({...sample,origin_country:["US"],original_language:"th"})).toBe(false);
  });
  it("ignores material without a landscape backdrop",()=>{
    expect(isInternationalForBR({...sample,backdrop_path:null})).toBe(false);
  });
});
describe("wallpapers de TV sem distorção",()=>{
 it("fills normal 16:9 backdrops and keeps narrow artwork complete",()=>{
  expect(chooseWallpaperLayout(1920,1080)).toBe("cover");
  expect(chooseWallpaperLayout(1280,720)).toBe("cover");
  expect(chooseWallpaperLayout(700,1050)).toBe("composite");
  expect(chooseWallpaperLayout(1600,400)).toBe("composite");
 });
});

describe("network-synchronized clock API",()=>{
 it("serves uncached UTC epoch when the projector connects",async()=>{
  const before=Date.now();
  const response=await catalogWorker.fetch(new Request("https://launcher.invalid/api/time"),{} as never,{} as never);
  const payload=await response.json() as {nowMs:number};
  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toContain("no-store");
  expect(payload.nowMs).toBeGreaterThanOrEqual(before);
  expect(payload.nowMs).toBeLessThanOrEqual(Date.now());
 });
});

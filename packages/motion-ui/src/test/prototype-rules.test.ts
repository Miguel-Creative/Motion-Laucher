import { describe, expect, it, beforeEach } from "vitest";
import { SETTINGS_SECTIONS, SPEC_ROTATION_MS } from "@/lib/settings-schema";
import { device } from "@/lib/device/simulated";
import { DEMO_WALLPAPERS, EMPTY_WALLPAPER, wallpaperSrc, type Wallpaper } from "@/data/wallpapers";
import { demoSource } from "@/lib/catalog/sources";
import { setState, getState, DEFAULT_STATE, initializeStore, setSetting, readSetting } from "@/lib/store";
import { stepWallpaper, rotationPool } from "@/lib/wallpaper";

describe("Local prototype rules", () => {
 beforeEach(() => { localStorage.clear(); setState({...DEFAULT_STATE, settings:{}}); });
 it("provides all 23 settings categories", () => { expect(SETTINGS_SECTIONS).toHaveLength(23); });
 it("keeps physical RAM separate from ZRAM on HY300por", async () => {const stats=await device.getSystemStats();expect(stats.ram.totalMb).toBe(1024);expect(stats.zram.totalMb).toBe(512);expect(stats.source).toBe("demo");});
 it("does not pretend a key command controls real Android", async () => {const result=await device.sendKey("HOME");expect(result.simulated).toBe(true);expect(device.kind).toBe("simulated");});
 it("does not bundle fictional artwork", () => {expect(DEMO_WALLPAPERS).toEqual([]);expect(wallpaperSrc(EMPTY_WALLPAPER,"md").src).toBe("");});
 it("the retired demo provider returns no artwork", async () => {expect(await demoSource.search("")).toEqual([]);});
 it("never rotates to demo artwork when no real artwork is available", () => {expect(rotationPool()).toEqual([]);expect(stepWallpaper(1)).toBeUndefined();expect(getState().currentWallpaper).toBe("");});
 it("persists the real selection locally while dropping retired demo IDs", () => {localStorage.setItem("motion-laucher:v1",JSON.stringify({...DEFAULT_STATE,currentWallpaper:"tmdb-movie-123",favWallpapers:["g-ember","tmdb-movie-123"],pinned:["netflix"]}));const cleanup=initializeStore();expect(getState().currentWallpaper).toBe("tmdb-movie-123");expect(getState().favWallpapers).toEqual(["tmdb-movie-123"]);expect(getState().pinned).toEqual(["netflix"]);cleanup();});
 it("persists reversible demo app disablement", () => {setSetting("demo.disabledApps",["youtube"]);expect(readSetting("demo.disabledApps")).toEqual(["youtube"]);setSetting("demo.disabledApps",[]);expect(readSetting("demo.disabledApps")).toEqual([]);expect(JSON.parse(localStorage.getItem("motion-laucher:v1") ?? "{}").settings["demo.disabledApps"]).toEqual([]);});
 it("rotates every 10 seconds by default while keeping 30 seconds optional",()=>{
   const controls=SETTINGS_SECTIONS.find(s=>s.id==="wallpaper")!.items;
   const rotation=controls.find(s=>s.id==="wallpaper.rotation");
   expect(rotation?.default).toBe("10s");
   expect(rotation?.options?.some(x=>x.value==="10s")).toBe(true);
   expect(SPEC_ROTATION_MS["10s"]).toBe(10_000);
   expect(SPEC_ROTATION_MS["30s"]).toBe(30_000);
   expect(controls.find(s=>s.id==="wallpaper.customSeconds")?.min).toBe(10);
 });
 it("migrates the old saved 30-second default only once without clearing favorites",()=>{
   localStorage.clear();
   const old={...DEFAULT_STATE,pinned:["netflix"],settings:{"wallpaper.rotation":"30s"}};
   localStorage.setItem("motion-laucher:v1",JSON.stringify(old));
   const stop=initializeStore();
   expect(readSetting("wallpaper.rotation")).toBe("10s");
   expect(getState().pinned).toEqual(["netflix"]);
   stop();
   setSetting("wallpaper.rotation","30s");
   const stop2=initializeStore();
   expect(readSetting("wallpaper.rotation")).toBe("30s");
   stop2();
 });
 it("respects previously selected intervals other than the old default",()=>{
   localStorage.clear();
   localStorage.setItem("motion-laucher:v1",JSON.stringify({...DEFAULT_STATE,settings:{"wallpaper.rotation":"5m"}}));
   const stop=initializeStore();
   expect(readSetting("wallpaper.rotation")).toBe("5m");
   stop();
 });
 it("daily rotation lasts 24 hours", () => {expect(SPEC_ROTATION_MS['daily']).toBe(86_400_000);});
 it("falls back safely for invalid art variant selection", () => {const wp:Wallpaper={...EMPTY_WALLPAPER,id:"tmdb-movie-1",provider:"tmdb",variants:[{label:"Real",src:"https://image.tmdb.org/t/p/w1280/example.jpg"}]};expect(wallpaperSrc(wp,"md",999).src).toBe(wallpaperSrc(wp,"md",0).src);});
});
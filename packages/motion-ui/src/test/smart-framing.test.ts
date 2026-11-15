import {describe,expect,it} from "vitest";
import {chooseWallpaperLayout} from "@/lib/image/smart-framing";
describe("Wallpapers sem distorção",()=>{
 it("preserva pôster vertical por composição",()=>{
  expect(chooseWallpaperLayout(720,1080)).toBe("composite");
  expect(chooseWallpaperLayout(1000,1000)).toBe("composite");
 });
 it("preserva foto horizontal widescreen",()=>{
  expect(chooseWallpaperLayout(1920,1080)).toBe("cover");
  expect(chooseWallpaperLayout(1280,720)).toBe("cover");
  expect(chooseWallpaperLayout(2560,1080)).toBe("composite");
 });
 it("não confunde dimensões desconhecidas",()=>expect(chooseWallpaperLayout(0,0)).toBe("cover"));
});

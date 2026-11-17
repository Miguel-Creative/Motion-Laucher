import { describe, expect, it } from "vitest";
import { FIREPLACES, nextFireplace } from "@/lib/ambient";
describe("modo ambiente",()=>{
 it("usa três vídeos locais distintos e navegação circular",()=>{
  expect(FIREPLACES).toHaveLength(3);
  expect(new Set(FIREPLACES.map(f=>f.src)).size).toBe(3);
  expect(FIREPLACES.every(f=>f.src.startsWith("/ambient/")&&f.src.endsWith(".mp4"))).toBe(true);
  expect(nextFireplace(0,-1)).toBe(2);
  expect(nextFireplace(2,1)).toBe(0);
 });
});

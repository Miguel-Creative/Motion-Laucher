import { describe,it,expect } from "vitest";
import { MEDIA,mediaFor,entriesForTab,MEDIA_TABS } from "@/lib/streaming";
describe("TV brasileira",()=>{
 it("prioriza emissoras populares e não confunde sites oficiais com sinais diretos",()=>{
 expect(MEDIA.slice(0,5).map(m=>m.id)).toEqual(["globo","sbt","record","band","redetv"]);
 expect(MEDIA.every(m=>m.official.startsWith("https://")&&(!m.src||m.src.startsWith("https://")))).toBe(true);
 expect(MEDIA.filter(m=>m.src).length).toBeGreaterThan(0);
 expect(new Set(MEDIA.map(m=>m.id)).size).toBe(MEDIA.length);
 expect(MEDIA_TABS.map(m=>m.id)).toEqual(["br"]);
 });
 it("retira o catálogo que foi rejeitado",()=>{for(const k of ["international","movie","series"] as const)expect(mediaFor(k)).toEqual([]);expect(entriesForTab("recent")).toEqual([]);});
});

import { describe, expect, it } from "vitest";
import { ALL_SETTINGS, findSetting, settingStatus } from "@/lib/settings-schema";
describe("Disponibilidade dos ajustes da TV",()=>{
 const status=(id:string)=>settingStatus(findSetting(id)!,true);
 it("preserva todas as opções e identifica as pendentes",()=>{
  expect(ALL_SETTINGS).toHaveLength(141);
  expect(status("wallpaper.rotation").ready).toBe(true);
  expect(status("display.keystone").ready).toBe(true);
  expect(status("profiles.kids")).toMatchObject({ready:false,label:"Em breve"});
  expect(status("privacy.lockSettings").ready).toBe(false);
  expect(status("audio.uiSounds").ready).toBe(false);
  expect(status("display.hardwareBrightness")).toMatchObject({ready:false,label:"Em breve · integração Android"});
  expect(status("admin.zram")).toMatchObject({ready:false,label:"Indisponível neste aparelho"});
  expect(status("integrations.tmdbKey")).toMatchObject({ready:false,label:"Em breve · integração de API"});
 });
 it("não apresenta atalhos sem rota da TV como funcionais",()=>{
  for(const id of ["remote.pairing","admin.openDashboard","auto.editor","input.pointerSpeed"]) expect(status(id).ready).toBe(false);
 });
});

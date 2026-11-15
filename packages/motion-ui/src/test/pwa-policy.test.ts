import { describe, expect, it } from "vitest";
import { refuseOfflineWorker, isRemoteNavigation } from "@/lib/pwa-policy";
describe("MRL offline: segurança e independência",()=>{
 it("não registra worker em desenvolvimento",()=>expect(refuseOfflineWorker("localhost",false,false,"")).toBe(true));
 it("não registra dentro de iframe",()=>expect(refuseOfflineWorker("mrl.example.com",true,true,"")).toBe(true));
 it("respeita kill switch",()=>expect(refuseOfflineWorker("mrl.example.com",true,false,"?sw=off")).toBe(true));
 it("funciona em endereço HTTPS publicado",()=>expect(refuseOfflineWorker("mrl.example.com",true,false,"")).toBe(false));
 it("não registra no host delegado bloqueado",()=>expect(refuseOfflineWorker("editor.example.com",true,false,"","editor.example.com")).toBe(true));
 it("apenas navegação de MRL entra no cache",()=>{
  const origin="https://mrl.example.com";
  const match=(path:string,mode="navigate",sameOrigin=true)=>isRemoteNavigation({url:new URL(origin+path),request:{mode},sameOrigin});
  expect(match("/")).toBe(true);expect(match("/remote")).toBe(true);
  expect(match("/remote?__mrl_shell=1","cors")).toBe(true);
  expect(match("/remote","cors")).toBe(false);
  for(const p of ["/api/control","/~oauth","/settings"])expect(match(p)).toBe(false);
  expect(match("/remote","navigate",false)).toBe(false);
 });
});

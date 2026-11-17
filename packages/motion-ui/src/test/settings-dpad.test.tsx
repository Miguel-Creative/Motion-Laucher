import { render, renderHook, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useSpatialNav } from "@/hooks/use-spatial-nav";
afterEach(()=>{cleanup();vi.restoreAllMocks();});
describe("Navegação TV de Ajustes",()=>{
 it("mantém foco nas linhas, atravessa painéis e ignora controles desabilitados",()=>{
  vi.spyOn(HTMLElement.prototype,"getBoundingClientRect").mockImplementation(()=>({x:0,y:0,width:30,height:30,top:0,left:0,right:30,bottom:30,toJSON(){return {};}}));
  Object.defineProperty(HTMLElement.prototype,"scrollIntoView",{configurable:true,value:()=>{}});
  const {getByText}=render(<div className="settings-tv"><aside data-settings-zone="categories"><button data-nav data-setting-category="display" aria-pressed="true">Tela</button><button data-nav data-setting-category="motion">Movimento</button></aside><div data-settings-zone="options"><div className="setting-row"><button data-nav>Menos</button><button data-nav>Mais</button></div><div className="setting-row"><button data-nav disabled>Desativado</button></div><div className="setting-row"><button data-nav>Alternar</button></div></div></div>);
  renderHook(()=>useSpatialNav());
  const press=(key:string)=>fireEvent.keyDown(window,{key});
  getByText("Tela").focus();press("ArrowRight");expect(getByText("Menos")).toHaveFocus();
  press("ArrowRight");expect(getByText("Mais")).toHaveFocus();
  press("ArrowDown");expect(getByText("Alternar")).toHaveFocus();
  press("ArrowLeft");expect(getByText("Tela")).toHaveFocus();
  press("ArrowDown");expect(getByText("Movimento")).toHaveFocus();
 });
});

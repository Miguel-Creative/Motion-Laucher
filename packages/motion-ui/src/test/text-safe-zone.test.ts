import {describe,expect,it} from "vitest";
import {chooseTextSide} from "@/lib/image/text-safe-zone";
function sample(busy: "left" | "right" | "none") {
 const width=80, height=45, pixels=new Uint8ClampedArray(width*height*4);
 for(let y=0;y<height;y++)for(let x=0;x<width;x++) {
  const p=(y*width+x)*4;
  const v=busy==="none" ? 100 :
   (busy==="left" ? x<35 : x>45) ? ((x+y)%2)*255 : 100;
  pixels[p]=pixels[p+1]=pixels[p+2]=v; pixels[p+3]=255;
 }
 return chooseTextSide(pixels,width,height);
}
describe("Posicionamento da legenda sem cobrir arte detalhada",()=>{
 it("leva o texto para a direita quando a esquerda tem mais detalhes",()=>expect(sample("left")).toBe("right"));
 it("leva o texto para a esquerda quando a direita tem mais detalhes",()=>expect(sample("right")).toBe("left"));
 it("usa lado padrão em imagem uniforme",()=>expect(sample("none")).toBe("left"));
});

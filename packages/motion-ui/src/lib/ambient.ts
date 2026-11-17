export const FIREPLACES = [
  {id:"classic",title:"Lareira clássica",src:"/ambient/classic.mp4",poster:"/ambient/classic.jpg",author:"Larvis",license:"CC BY-SA 4.0"},
  {id:"cozy",title:"Lareira rústica",src:"/ambient/cozy.mp4",poster:"/ambient/cozy.jpg",author:"BrillLyle",license:"CC0 1.0"},
  {id:"logs",title:"Brasas e chamas",src:"/ambient/logs.mp4",poster:"/ambient/logs.jpg",author:"F ASTILY",license:"CC BY-SA 4.0"},
] as const;
export function nextFireplace(index:number,delta:-1|1){return (index+delta+FIREPLACES.length)%FIREPLACES.length;}

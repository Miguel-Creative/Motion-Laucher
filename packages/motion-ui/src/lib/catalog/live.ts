
/** Live catalogs: read-only client for the same-origin Cloudflare Worker.
 * The browser never receives the provider secrets. Only real provider artwork is used; retain cached catalog metadata during refresh.
 */
import { useSyncExternalStore } from "react";
import type { Wallpaper, WallpaperKind, ArtVariant } from "@/data/wallpapers";
import { getState, setState } from "@/lib/store";

const kinds = ["Animes","Filmes","Séries","Jogos"] as const;
export const FEED_OPTIONS = [
 {id:"destaques",label:"Destaques"},
 {id:"em-alta",label:"Em alta"},
 {id:"em-breve",label:"Em breve"},
 {id:"melhores",label:"Mais bem avaliados"},
 {id:"novas-temporadas",label:"Novas temporadas"}
] as const;
export type EditorialFeed=typeof FEED_OPTIONS[number]["id"];
const FEED_KEY="motion-laucher:editorial-feed";
const CACHE_KEY="motion-laucher:real-catalog:v1";
let selectedFeed:EditorialFeed="destaques";
let requestVersion=0;
export const getSelectedFeed=()=>{
 if(typeof window!=="undefined"){
  try{
   const saved=window.localStorage.getItem(FEED_KEY);
   if(FEED_OPTIONS.some(o=>o.id===saved))selectedFeed=saved as EditorialFeed;
  }catch{}
 }
 return selectedFeed;
};
export function setSelectedFeed(next:EditorialFeed){
 if(selectedFeed===next)return;
 selectedFeed=next;
 try{window.localStorage.setItem(FEED_KEY,next);}catch{}
 void refreshLiveCatalog();
}
type KindRequest = typeof kinds[number];
export type CatalogHealth = { loading:boolean; live:number; errors:Record<string,string>; updatedAt:number; feed:EditorialFeed };
let entries:Wallpaper[]=[];
let health:CatalogHealth={loading:false,live:0,errors:{},updatedAt:0,feed:"destaques"};
const listeners=new Set<()=>void>();
const notify=()=>listeners.forEach(l=>l());
const subscribe=(l:()=>void)=>{listeners.add(l);return ()=>listeners.delete(l);};
const snap=()=>entries;
const healthSnap=()=>health;
const unavailable=(cause:string)=>cause.includes("não configurad")?"Aguardando chave de integração":cause;
const allowedProvider=new Set(["tmdb","rawg","anilist","kitsu"]);
function normalize(raw:unknown):Wallpaper|null {
 if(!raw||typeof raw!=="object")return null;
 const r=raw as Record<string,any>;
 if(typeof r.id!=="string"||!/^((tmdb-(movie|tv)|rawg|anilist|kitsu)-[0-9]{1,9})$/.test(r.id))return null;
 const kind=r.kind as WallpaperKind;
 if(!["Filmes","Séries","Jogos","Anime"].includes(kind)||!allowedProvider.has(r.provider))return null;
 const variants=(Array.isArray(r.variants)?r.variants:[]).slice(0,16).filter((v:any)=>typeof v?.src==="string"&&v.src.startsWith("https://"))
  .map((v:any)=>({src:v.src,label:String(v.label||"Imagem oficial"),focal:typeof v.focal==="string"?v.focal:undefined}));
 if(!variants.length||!String(r.title||"").trim())return null;
 return {id:r.id,title:String(r.title).slice(0,160),subtitle:String(r.subtitle||"Catálogo real"),kind,
  genres:Array.isArray(r.genres)?r.genres.map(String).slice(0,8):[],
  platforms:Array.isArray(r.platforms)?r.platforms.map(String).slice(0,6):[],
  year:Number(r.year)||0,
  releaseDate:typeof r.releaseDate==="string" && /^\d{4}-\d{2}-\d{2}$/.test(r.releaseDate) &&
    !Number.isNaN(Date.parse(r.releaseDate)) ? r.releaseDate : undefined,
  provider:r.provider,popularity:Number(r.popularity)||0,
  sourceUrl:typeof r.sourceUrl==="string"&&r.sourceUrl.startsWith("https://")?r.sourceUrl:undefined,
  variants};
}
function restoreCatalog(){
 try{
  const cached=JSON.parse(window.localStorage.getItem(CACHE_KEY)||"null");
  if(!cached||cached.feed!==selectedFeed||!Array.isArray(cached.entries))return;
  entries=cached.entries.slice(0,500).map(normalize).filter(Boolean) as Wallpaper[];
  health={...health,live:entries.length,feed:selectedFeed,updatedAt:Number(cached.updatedAt)||0};notify();
 }catch{}
}
function persistCatalog(){
 try{window.localStorage.setItem(CACHE_KEY,JSON.stringify({feed:selectedFeed,updatedAt:health.updatedAt,entries:entries.slice(0,500)}));}catch{}
}
export const getLiveCatalog=()=>entries;
export const getCatalogHealth=()=>health;
export const useLiveCatalog=()=>useSyncExternalStore(subscribe,snap,()=>[]);
export const useCatalogHealth=()=>useSyncExternalStore(subscribe,healthSnap,()=>health);
export async function refreshLiveCatalog(){
 if(typeof window==="undefined")return;
 const version=++requestVersion;
 const feed=selectedFeed;
 health={...health,loading:true,feed};notify();
 const activeKinds=feed==="novas-temporadas"?kinds.filter(k=>k==="Animes"||k==="Séries"):kinds;
 const results=await Promise.all(activeKinds.map(async kind=>{
  try{
   const res=await fetch("/api/catalog?kind="+encodeURIComponent(kind)+"&feed="+encodeURIComponent(feed),{headers:{Accept:"application/json"}});
   const data=await res.json();
   if(!res.ok)throw Error(String(data.error||"HTTP "+res.status));
   return {kind,items:(Array.isArray(data.items)?data.items:[]).map(normalize).filter(Boolean) as Wallpaper[],error:""};
  }catch(error){return {kind,items:[] as Wallpaper[],error:unavailable(error instanceof Error?error.message:"Fonte indisponível")};}
 }));
 if(version!==requestVersion)return;
 const old=entries;
 const merged=results.flatMap(r=>r.items.length?r.items:old.filter(w=>w.kind===(r.kind==="Animes"?"Anime":r.kind)));
 const dedup=new Map(merged.map(x=>[x.id,x]));
 entries=[...dedup.values()];
 const errors:Record<string,string>=Object.fromEntries(results.filter(r=>r.error).map(r=>[r.kind,r.error]));
 health={loading:false,live:entries.length,errors,updatedAt:Date.now(),feed};
 notify();
 if(entries.length){
  persistCatalog();
  const current=getState().currentWallpaper;
  if(!current||/^[afsmg]-/.test(current))setState({currentWallpaper:entries[0].id});
 }
}
let started=false;
export function startLiveCatalog(){
 if(typeof window==="undefined")return ()=>{};
 if(started)return ()=>{};
 started=true;
 try{
  const saved=window.localStorage.getItem(FEED_KEY);
  if(FEED_OPTIONS.some(o=>o.id===saved))selectedFeed=saved as EditorialFeed;
 }catch{}
 restoreCatalog();
 void refreshLiveCatalog();
 const timer=window.setInterval(()=>{if(document.visibilityState==="visible")void refreshLiveCatalog();},60*60*1000);
 const online=()=>void refreshLiveCatalog();
 window.addEventListener("online",online);
 return ()=>{window.clearInterval(timer);window.removeEventListener("online",online);started=false;};
}
/** Fetch alternative official artwork for the selected title, no full catalogue download. */
export async function loadArtVariants(w:Wallpaper){
 if(!["tmdb","rawg"].includes(w.provider))return w.variants;
 const res=await fetch("/api/catalog?kind="+encodeURIComponent(w.kind==="Anime"?"Animes":w.kind)+"&imageId="+encodeURIComponent(w.id));
 if(!res.ok)throw Error("Não foi possível consultar as imagens alternativas");
 const body=await res.json() as {variants?:ArtVariant[]};
 const extra=(body.variants||[]).filter(v=>typeof v.src==="string"&&v.src.startsWith("https://")).slice(0,16);
 if(extra.length){
  entries=entries.map(item=>item.id!==w.id?item:{...item,variants:[...item.variants,...extra]});
  notify();
 }
 return extra;
}

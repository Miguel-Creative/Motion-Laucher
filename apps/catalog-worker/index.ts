
/** Motion Laucher: catálogo vivo via Cloudflare, sem expor secrets no navegador. */
type Kind="Filmes"|"Séries"|"Jogos"|"Anime";
type Env={ ASSETS:{fetch(request:Request):Promise<Response>},TMDB_READ_TOKEN?:string,RAWG_API_KEY?:string};
type Context={waitUntil(promise:Promise<unknown>):void};

/** Editorial feeds: mixed by default, always date-relative rather than static title IDs. */
type Feed="destaques"|"em-alta"|"em-breve"|"melhores"|"novas-temporadas";
const validFeeds=new Set<Feed>(["destaques","em-alta","em-breve","melhores","novas-temporadas"]);
const iso=(d:Date)=>d.toISOString().slice(0,10);
const shift=(months:number)=>{const d=new Date();d.setUTCMonth(d.getUTCMonth()+months);return iso(d);};
const yearNow=()=>new Date().getUTCFullYear();
function unique(items:any[],count=24){
 const map=new Map<string,any>();
 for(const item of items)if(item && !map.has(item.id))map.set(item.id,item);
 return [...map.values()].slice(0,count);
}
function mix(groups:any[][],parts:number[]=[],limit=24){
 const out:any[]=[];const seen=new Set<string>();
 for(let i=0;i<groups.length;i++)for(const item of groups[i].slice(0,parts[i]||6)){
  if(item&&!seen.has(item.id)){seen.add(item.id);out.push(item);}
 }
 for(const group of groups)for(const item of group){
  if(out.length>=limit)break;
  if(item&&!seen.has(item.id)){seen.add(item.id);out.push(item);}
 }
 return out.slice(0,limit);
}
function settled<T>(values:PromiseSettledResult<T>[],index:number,fallback:T):T{
 return values[index]?.status==="fulfilled"?(values[index] as PromiseFulfilledResult<T>).value:fallback;
}

const sources:Record<string,Kind>={filmes:"Filmes",series:"Séries",jogos:"Jogos",animes:"Anime"};
const img=(p:any,size="w1280")=>typeof p==="string"&&/^\/[a-zA-Z0-9/_\-.]+$/.test(p)?"https://image.tmdb.org/t/p/"+size+p:null;
const response=(data:unknown,status=200,cache=false)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","X-Content-Type-Options":"nosniff","Cache-Control":cache?"public,max-age=300,s-maxage=21600":"no-store"}});
async function json(url:string,init:RequestInit={}):Promise<any>{
 const r=await fetch(url,{...init,signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw new Error("Origem HTTP "+r.status);
 return r.json();
}

function tmdbMap(list:any[],kind:Kind,category:string) {
 const media=kind==="Filmes"?"movie":"tv";
 return list.flatMap((v:any)=>{
  const wide=img(v.backdrop_path),poster=img(v.poster_path,"w780");
  if(!wide||!v.id)return [];
  const year=Number(String(v.release_date||v.first_air_date||"").slice(0,4))||0;
  return [{id:"tmdb-"+media+"-"+v.id,kind,title:String(v.title||v.name||""),
   subtitle:category+" · TMDB",genres:[],platforms:[],year,provider:"tmdb",
   sourceUrl:"https://www.themoviedb.org/"+media+"/"+v.id,popularity:Number(v.popularity)||0,
   variants:[{src:wide,label:"Imagem panorâmica oficial"},...(poster?[{src:poster,label:"Pôster oficial",focal:"50% 25%"}]:[])]}];
 });
}
async function tmdb(kind:Kind,token:string|undefined,feed:Feed){
 if(!token)throw Error("TMDB_READ_TOKEN não configurado");
 const media=kind==="Filmes"?"movie":"tv";
 const base="https://api.themoviedb.org/3/";
 const lang="?language=pt-BR&page=1";
 const headers={"Authorization":"Bearer "+token};
 const trending=()=>json(base+"trending/"+media+"/week"+lang,{headers}).then(d=>tmdbMap(d.results||[],kind,"Em alta"));
 const upcoming=()=>json(base+(kind==="Filmes"?"movie/upcoming":"discover/tv")+(kind==="Filmes"?lang+"&region=BR":
  "?language=pt-BR&sort_by=popularity.desc&first_air_date.gte="+iso(new Date())+"&first_air_date.lte="+shift(12)),{headers}).then(d=>tmdbMap(d.results||[],kind,"Próximo lançamento"));
 const top=()=>json(base+"discover/"+media+"?language=pt-BR&sort_by=vote_average.desc&vote_count.gte=100&"+
  (kind==="Filmes"?"primary_release_date.gte=":"first_air_date.gte=")+shift(-36)+"&page=1",{headers})
  .then(d=>tmdbMap((d.results||[]).filter((x:any)=>(Number(x.vote_average)||0)>=7),kind,"Mais bem avaliados"));
 const onAir=()=>json(base+"tv/on_the_air"+lang,{headers}).then(d=>tmdbMap(d.results||[],kind,"Em exibição"));
 if(feed==="em-alta")return trending();
 if(feed==="em-breve")return upcoming();
 if(feed==="melhores")return top();
 // The on-the-air list includes continuations but not every show is a newly announced season.
 if(feed==="novas-temporadas"&&kind==="Séries")return onAir();
 if(feed==="novas-temporadas")return [];
 const tasks=kind==="Séries"?[trending(),upcoming(),top(),onAir()]:[trending(),upcoming(),top()];
 const results=await Promise.allSettled(tasks);
 const lists=results.map((r:any)=>r.status==="fulfilled"?r.value:[]);
 if(!lists.some(x=>x.length))throw Error("TMDB indisponível");
 return mix(lists,kind==="Séries"?[8,7,7,4]:[9,9,8],26);
}
async function tmdbImages(kind:Kind,id:string,token?:string){
 if(!token)throw new Error("TMDB_READ_TOKEN não configurado");
 const m=/^tmdb-(movie|tv)-(\d{1,9})$/.exec(id);
 if(!m||(m[1]==="movie")!==(kind==="Filmes"))throw new Error("Título inválido");
 const data=await json("https://api.themoviedb.org/3/"+m[1]+"/"+m[2]+"/images?include_image_language=pt,en,null",{headers:{"Authorization":"Bearer "+token}});
 const backs=(data.backdrops||[]).filter((x:any)=>Number(x.aspect_ratio)>1.3).slice(0,12).map((x:any,i:number)=>({src:img(x.file_path),label:"Cena "+(i+1)}));
 const posters=(data.posters||[]).slice(0,4).map((x:any,i:number)=>({src:img(x.file_path,"w780"),label:"Pôster "+(i+1),focal:"50% 25%"}));
 return [...backs,...posters].filter(x=>x.src);
}

function rawgMap(list:any[],tag:string){
 return list.flatMap((v:any)=>{
  if(!v.id||typeof v.background_image!=="string"||!v.background_image.startsWith("https://"))return [];
  const year=Number(String(v.released||"").slice(0,4))||0;
  return [{id:"rawg-"+v.id,kind:"Jogos",title:String(v.name||""),subtitle:tag+" · RAWG",
   genres:(v.genres||[]).map((g:any)=>String(g.name)).slice(0,5),
   platforms:(v.platforms||[]).map((p:any)=>String(p.platform?.name||"")).filter(Boolean).slice(0,4),
   year,provider:"rawg",sourceUrl:"https://rawg.io/games/"+encodeURIComponent(String(v.slug||v.id)),
   popularity:Number(v.added)||0,variants:[{src:v.background_image,label:"Arte do jogo"}]}];
 });
}
async function rawg(key:string|undefined,feed:Feed){
 if(!key)throw Error("RAWG_API_KEY não configurada");
 const base="https://api.rawg.io/api/games?key="+encodeURIComponent(key)+"&page_size=20";
 const upcoming=()=>json(base+"&dates="+iso(new Date())+","+shift(18)+"&ordering=-added")
  .then(d=>rawgMap(d.results||[],"Mais aguardados").filter(x=>x.year>=yearNow()));
 const recent=()=>json(base+"&dates="+shift(-15)+","+iso(new Date())+"&ordering=-added")
  .then(d=>rawgMap(d.results||[],"Populares recentes"));
 const top=()=>json(base+"&dates="+shift(-36)+","+iso(new Date())+"&ordering=-metacritic")
  .then(d=>rawgMap((d.results||[]).filter((x:any)=>(Number(x.metacritic)||0)>=80),"Mais bem avaliados"));
 const franchise=async(query:string,valid:RegExp)=>{
  const d=await json(base+"&search="+encodeURIComponent(query)+"&ordering=-released");
  return rawgMap((d.results||[]).filter((x:any)=>valid.test(String(x.name||"")))
   .sort((a:any,b:any)=>b.year-a.year).slice(0,2),"Franquias em destaque");
 };
 if(feed==="em-breve")return upcoming();
 if(feed==="melhores")return top();
 if(feed==="em-alta")return recent();
 if(feed==="novas-temporadas")return [];
 const results=await Promise.allSettled([
  upcoming(),recent(),top(),
  franchise("Grand Theft Auto VI",/grand theft auto\s*(vi|6)/i),
  franchise("Assassin's Creed",/assassin.?s creed/i)
 ]);
 const lists=results.map((r:any)=>r.status==="fulfilled"?r.value:[]);
 if(!lists.some(x=>x.length))throw Error("RAWG indisponível");
 return mix([lists[3],lists[4],lists[0],lists[1],lists[2]],[2,2,9,8,7],27);
}
async function rawgImages(id:string,key?:string){
 if(!key)throw new Error("RAWG_API_KEY não configurada");
 const m=/^rawg-(\d{1,9})$/.exec(id);if(!m)throw new Error("Jogo inválido");
 const data=await json("https://api.rawg.io/api/games/"+m[1]+"/screenshots?key="+encodeURIComponent(key)+"&page_size=12");
 return (data.results||[]).filter((v:any)=>typeof v.image==="string"&&v.image.startsWith("https://"))
  .slice(0,12).map((v:any,i:number)=>({src:v.image,label:"Captura "+(i+1)}));
}

/** Public Kitsu anime catalogue, fallback if AniList rejects Cloudflare egress. */

function kitsuMap(list:any[],tag:string){
 const current=yearNow();
 return list.flatMap((v:any)=>{
  const a=v.attributes||{};
  if(a.ageRating==="R18" || a.nsfw===true)return [];
  const wide=a.coverImage?.original||a.coverImage?.large||"";
  const poster=a.posterImage?.original||a.posterImage?.large||"";
  const variants=[...(typeof wide==="string"&&wide.startsWith("https://")?[{src:wide,label:"Arte panorâmica"}]:[]),
    ...(typeof poster==="string"&&poster.startsWith("https://")?[{src:poster,label:"Pôster",focal:"50% 25%"}]:[])];
  if(!variants.length||! /^\d{1,9}$/.test(String(v.id||""))||!a.canonicalTitle)return [];
  const year=Number(String(a.startDate||"").slice(0,4))||0;
  if(!year||year<current-2||year>current+3)return [];
  const title=String(a.titles?.en||a.canonicalTitle);
  return [{id:"kitsu-"+v.id,kind:"Anime",title,subtitle:tag+" · Kitsu",genres:[],platforms:["Anime"],
   year,provider:"kitsu",sourceUrl:"https://kitsu.app/anime/"+encodeURIComponent(String(a.slug||v.id)),
   popularity:Number(a.userCount)||0,variants}];
 });
}
async function kitsu(feed:Feed){
 const base="https://kitsu.io/api/edge/anime?";
 const suffix="&page%5Blimit%5D=20";
 const get=(s:string,tag:string)=>json(base+s+suffix,{headers:{"Accept":"application/vnd.api+json"}})
  .then(d=>kitsuMap(Array.isArray(d.data)?d.data:[],tag));
 // Kitsu supports seasonYear (confirmed against real responses) and upcoming/current status.
 const upcoming=()=>get("filter%5Bstatus%5D=upcoming&sort=-userCount","Próximo lançamento");
 const rated=()=>get("filter%5BseasonYear%5D="+yearNow()+"&sort=-averageRating","Melhores do ano")
  .then(x=>x.filter(v=>v.popularity>=0));
 const current=()=>get("filter%5Bstatus%5D=current&sort=-userCount","Em exibição");
 const nextSeason=async()=>{
  const future=await upcoming();
  // Only describe a work as a sequel when its title clearly declares a season/part number.
  return future.filter(x=>/(\b(?:2nd|3rd|4th|5th|6th|7th|8th)\s+season\b|\bseason\s*[2-9]\b|\b(?:part|cour)\s*[2-9]\b|\b[2-9](?:nd|rd|th)\s+part\b|\b(?:segunda|terceira|quarta)\s+temporada\b)/i.test(x.title))
   .map(x=>({...x,subtitle:"Nova temporada anunciada · Kitsu"}));
 };
 if(feed==="em-breve")return upcoming();
 if(feed==="melhores")return rated();
 if(feed==="novas-temporadas")return nextSeason();
 if(feed==="em-alta")return current();
 const results=await Promise.allSettled([nextSeason(),upcoming(),rated(),current()]);
 const lists=results.map((r:any)=>r.status==="fulfilled"?r.value:[]);
 if(!lists.some(x=>x.length))throw Error("Kitsu indisponível");
 return mix(lists,[7,9,7,6],27);
}
async function anime(){
 const query="query { Page(page:1,perPage:18) { media(type:ANIME,sort:TRENDING_DESC,isAdult:false) { id title { romaji english native } coverImage { extraLarge large } bannerImage genres seasonYear popularity isAdult } } }";
 const data=await json("https://graphql.anilist.co",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query})});
 return (data?.data?.Page?.media||[]).flatMap((v:any)=>{
  if(!v.id||v.isAdult)return [];
  const variants=[...(typeof v.bannerImage==="string"&&v.bannerImage.startsWith("https://")?[{src:v.bannerImage,label:"Banner do anime"}]:[]),
    ...(typeof (v.coverImage?.extraLarge||v.coverImage?.large)==="string"?[{src:v.coverImage.extraLarge||v.coverImage.large,label:"Capa oficial",focal:"50% 25%"}]:[])];
  if(!variants.length)return [];
  return [{id:"anilist-"+v.id,kind:"Anime",title:String(v.title?.english||v.title?.romaji||v.title?.native||""),subtitle:"Anime em alta · AniList",
    genres:v.genres||[],platforms:["Anime"],year:Number(v.seasonYear)||0,provider:"anilist",
    sourceUrl:"https://anilist.co/anime/"+v.id,popularity:Number(v.popularity)||0,variants}];
 }).slice(0,18);
}
async function catalog(request:Request,env:Env,ctx:Context){
 if(request.method!=="GET")return response({error:"Método não permitido"},405);
 const url=new URL(request.url);
 const kind=sources[(url.searchParams.get("kind")||"").toLowerCase()];
 const feedInput=(url.searchParams.get("feed")||"destaques").toLowerCase() as Feed;
 const feed:Feed=validFeeds.has(feedInput)?feedInput:"destaques";
 if(!kind)return response({error:"Categoria inválida"},400);
 const imageId=url.searchParams.get("imageId");
 if(imageId&&imageId.length>50)return response({error:"Identificador inválido"},400);
 const edge=(caches as CacheStorage & {default:Cache}).default;
 try{const cached=await edge.match(request);if(cached)return cached;}catch{}
 try{
  const variants=imageId?(kind==="Filmes"||kind==="Séries"?await tmdbImages(kind,imageId,env.TMDB_READ_TOKEN):kind==="Jogos"?await rawgImages(imageId,env.RAWG_API_KEY):[]):undefined;
  const items=imageId?undefined:(kind==="Filmes"||kind==="Séries"?await tmdb(kind,env.TMDB_READ_TOKEN,feed):kind==="Jogos"?await rawg(env.RAWG_API_KEY,feed):await kitsu(feed).catch(()=>anime()));
  const source=kind==="Filmes"||kind==="Séries"?"TMDB":kind==="Jogos"?"RAWG":items?.[0]?.provider==="kitsu"?"Kitsu":"AniList";
  const result=response(imageId?{kind,source,id:imageId,variants}:{kind,source,items,feed,updatedAt:new Date().toISOString()},200,true);
  ctx.waitUntil(edge.put(request,result.clone()).catch(()=>{}));
  return result;
 }catch(e){
  const error=e instanceof Error?e.message:"Erro desconhecido";
  const missing=error.includes("não configurad");
  return response({kind,items:[],error:missing?"Chave da API não configurada na Cloudflare.":error},missing?503:502);
 }
}
export default {
 async fetch(request:Request,env:Env,ctx:Context){
  const path=new URL(request.url).pathname;
  if(path==="/api/catalog")return catalog(request,env,ctx);
  if(path.startsWith("/api/"))return response({error:"Rota não encontrada"},404);
  return env.ASSETS.fetch(request);
 }
};

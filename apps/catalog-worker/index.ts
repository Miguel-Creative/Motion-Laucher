
/** Motion Laucher: catálogo vivo via Cloudflare, sem expor secrets no navegador. */
type Kind="Filmes"|"Séries"|"Jogos"|"Anime";
type Env={ ASSETS:{fetch(request:Request):Promise<Response>},TMDB_READ_TOKEN?:string,RAWG_API_KEY?:string};
type Context={waitUntil(promise:Promise<unknown>):void};
const ttl=21600;
const sources:Record<string,Kind>={filmes:"Filmes",series:"Séries",jogos:"Jogos",animes:"Anime"};
const img=(p:any,size="w1280")=>typeof p==="string"&&/^\/[a-zA-Z0-9/_\-.]+$/.test(p)?"https://image.tmdb.org/t/p/"+size+p:null;
const response=(data:unknown,status=200,cache=false)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","X-Content-Type-Options":"nosniff","Cache-Control":cache?"public,max-age=300,s-maxage=21600":"no-store"}});
async function json(url:string,init:RequestInit={}):Promise<any>{
 const r=await fetch(url,{...init,signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw new Error("Origem HTTP "+r.status);
 return r.json();
}
async function tmdb(kind:Kind,token?:string){
 if(!token)throw new Error("TMDB_READ_TOKEN não configurado");
 const media=kind==="Filmes"?"movie":"tv";
 const data=await json("https://api.themoviedb.org/3/trending/"+media+"/week?language=pt-BR",{headers:{"Authorization":"Bearer "+token}});
 return (data.results||[]).slice(0,20).flatMap((v:any)=>{
  const wide=img(v.backdrop_path),poster=img(v.poster_path,"w780");
  if(!wide||!v.id)return [];
  return [{id:"tmdb-"+media+"-"+v.id,kind,title:String(v.title||v.name||""),subtitle:"Em alta no TMDB",genres:[],platforms:[],year:Number(String(v.release_date||v.first_air_date||"").slice(0,4))||0,provider:"tmdb",sourceUrl:"https://www.themoviedb.org/"+media+"/"+v.id,popularity:Number(v.popularity)||0,
  variants:[{src:wide,label:"Imagem panorâmica oficial"},...(poster?[{src:poster,label:"Pôster oficial",focal:"50% 25%"}]:[])]}];
 });
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
async function rawg(key?:string){
 if(!key)throw new Error("RAWG_API_KEY não configurada");
 const data=await json("https://api.rawg.io/api/games?key="+encodeURIComponent(key)+"&page_size=20&ordering=-added");
 return (data.results||[]).flatMap((v:any)=>{
  if(!v.id||typeof v.background_image!=="string"||!v.background_image.startsWith("https://"))return [];
  return [{id:"rawg-"+v.id,kind:"Jogos",title:String(v.name||""),subtitle:"Jogo real · RAWG",genres:(v.genres||[]).map((g:any)=>String(g.name)).slice(0,5),
   platforms:(v.platforms||[]).map((p:any)=>String(p.platform?.name||"")).filter(Boolean).slice(0,4),
   year:Number(String(v.released||"").slice(0,4))||0,provider:"rawg",sourceUrl:"https://rawg.io/games/"+encodeURIComponent(String(v.slug||v.id)),popularity:Number(v.added)||0,
   variants:[{src:v.background_image,label:"Imagem do jogo"}]}];
 }).slice(0,20);
}
async function rawgImages(id:string,key?:string){
 if(!key)throw new Error("RAWG_API_KEY não configurada");
 const m=/^rawg-(\d{1,9})$/.exec(id);if(!m)throw new Error("Jogo inválido");
 const data=await json("https://api.rawg.io/api/games/"+m[1]+"/screenshots?key="+encodeURIComponent(key)+"&page_size=12");
 return (data.results||[]).filter((v:any)=>typeof v.image==="string"&&v.image.startsWith("https://"))
  .slice(0,12).map((v:any,i:number)=>({src:v.image,label:"Captura "+(i+1)}));
}

/** Public Kitsu anime catalogue, fallback if AniList rejects Cloudflare egress. */
async function kitsu(){
 const data=await json("https://kitsu.io/api/edge/anime?sort=-userCount&page%5Blimit%5D=20",{headers:{"Accept":"application/vnd.api+json"}});
 return (Array.isArray(data.data)?data.data:[]).flatMap((v:any)=>{
  const a=v.attributes||{};
  const wide=a.coverImage?.original||a.coverImage?.large||"";
  const poster=a.posterImage?.original||a.posterImage?.large||"";
  const variants=[...(wide.startsWith("https://")?[{src:wide,label:"Capa panorâmica"}]:[]),
    ...(poster.startsWith("https://")?[{src:poster,label:"Pôster original",focal:"50% 25%"}]:[])];
  if(!variants.length||!/^\d{1,9}$/.test(String(v.id||""))||!a.canonicalTitle)return [];
  return [{id:"kitsu-"+v.id,kind:"Anime",title:String(a.titles?.en||a.canonicalTitle),
    subtitle:"Anime popular · Kitsu",genres:[],platforms:["Anime"],
    year:Number(String(a.startDate||"").slice(0,4))||0,provider:"kitsu",
    sourceUrl:"https://kitsu.app/anime/"+encodeURIComponent(String(a.slug||v.id)),
    popularity:Number(a.userCount)||0,variants}];
 });
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
 if(!kind)return response({error:"Categoria inválida"},400);
 const imageId=url.searchParams.get("imageId");
 if(imageId&&imageId.length>50)return response({error:"Identificador inválido"},400);
 const edge=(caches as CacheStorage & {default:Cache}).default;
 try{const cached=await edge.match(request);if(cached)return cached;}catch{}
 try{
  const variants=imageId?(kind==="Filmes"||kind==="Séries"?await tmdbImages(kind,imageId,env.TMDB_READ_TOKEN):kind==="Jogos"?await rawgImages(imageId,env.RAWG_API_KEY):[]):undefined;
  const items=imageId?undefined:(kind==="Filmes"||kind==="Séries"?await tmdb(kind,env.TMDB_READ_TOKEN):kind==="Jogos"?await rawg(env.RAWG_API_KEY):await anime().catch(()=>kitsu()));
  const source=kind==="Filmes"||kind==="Séries"?"TMDB":kind==="Jogos"?"RAWG":items?.[0]?.provider==="kitsu"?"Kitsu":"AniList";
  const result=response(imageId?{kind,source,id:imageId,variants}:{kind,source,items,updatedAt:new Date().toISOString()},200,true);
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

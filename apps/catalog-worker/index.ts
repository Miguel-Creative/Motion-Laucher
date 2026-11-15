
/** Motion Laucher: catálogo vivo via Cloudflare, sem expor secrets no navegador. */
type Kind="Filmes"|"Séries"|"Jogos"|"Anime";
type Env={ ASSETS:{fetch(request:Request):Promise<Response>},TMDB_READ_TOKEN?:string,RAWG_API_KEY?:string,STEAMGRIDDB_API_KEY?:string};
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

const sources:Record<string,Kind>={filmes:"Filmes",series:"Séries",séries:"Séries",jogos:"Jogos",animes:"Anime",anime:"Anime"};
const img=(p:any,size="w1280")=>typeof p==="string"&&/^\/[a-zA-Z0-9/_\-.]+$/.test(p)?"https://image.tmdb.org/t/p/"+size+p:null;
/** International productions that have relevant audiences in Brazil; not Brazilian, Mandarin or Thai originals.
 * This is a user preference, not a claim that other productions are inferior.
 */
export function isInternationalForBR(v:any):boolean {
 const country=Array.isArray(v?.origin_country)?v.origin_country.map((x:unknown)=>String(x).toUpperCase()):[];
 const lang=String(v?.original_language||"").toLowerCase();
 return !["pt","zh","th"].includes(lang) && !country.some((c:string)=>["BR","CN","TW","HK","TH"].includes(c)) &&
   v?.adult!==true && !!(v?.backdrop_path);
}
const landscapeImage=(v:any)=>Number(v?.aspect_ratio)>=1.62 && Number(v?.aspect_ratio)<=2.20 &&
  Number(v?.width)>=1000 && typeof v?.file_path==="string";
/** Prefer text-free artwork to avoid giant series titles baked into a backdrop. */
const imageScore=(v:any)=>Number(v?.vote_average||0)*3+Math.min(Number(v?.vote_count||0),25)/3+
 (v?.iso_639_1==null?12:0)+Math.min(Number(v?.width||0),3000)/2000;

const response=(data:unknown,status=200,cache=false)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","X-Content-Type-Options":"nosniff","Cache-Control":cache?"public,max-age=300,s-maxage=21600":"no-store"}});
async function json(url:string,init:RequestInit={}):Promise<any>{
 const r=await fetch(url,{...init,signal:AbortSignal.timeout(10000)});
 if(!r.ok)throw new Error("Origem HTTP "+r.status);
 return r.json();
}

function tmdbMap(list:any[],kind:Kind,category:string) {
 const media=kind==="Filmes"?"movie":"tv";
 return list.flatMap((v:any)=>{
  const wide=img(v.backdrop_path);
  if(!wide||!v.id||!isInternationalForBR(v))return [];
  if(kind==="Séries"&&v.original_language==="ja"&&Array.isArray(v.genre_ids)&&v.genre_ids.includes(16))return [];
  const year=Number(String(v.release_date||v.first_air_date||"").slice(0,4))||0;
  return [{id:"tmdb-"+media+"-"+v.id,kind,title:String(v.title||v.name||""),
   subtitle:category+" · TMDB",genres:[],platforms:[],year,provider:"tmdb",
   sourceUrl:"https://www.themoviedb.org/"+media+"/"+v.id,popularity:Number(v.popularity)||0,
   variants:[{src:wide,label:"Imagem horizontal oficial · TMDB"}]}];
 });
}
async function tmdb(kind:Kind,token:string|undefined,feed:Feed){
 if(!token)throw Error("TMDB_READ_TOKEN não configurado");
 const media=kind==="Filmes"?"movie":"tv";
 const base="https://api.themoviedb.org/3/";
 const lang="?language=pt-BR&page=1";
 const headers={"Authorization":"Bearer "+token};
 const query=(endpoint:string)=>json(base+endpoint,{headers});
 const trending=async()=>{const r=await Promise.allSettled([1,2].map(page=>
    query("trending/"+media+"/week?language=pt-BR&page="+page)));
   return r.flatMap(x=>x.status==="fulfilled"?tmdbMap(x.value.results||[],kind,"Em alta internacional"):[]);
 };
 // "watch_region=BR" only selects content with availability indexed for Brazil.
 // It does NOT force a Brazilian original-language or Brazilian production.
 const brasil=async()=>{const r=await Promise.allSettled([1,2].map(page=>
  query("discover/"+media+"?language=pt-BR&watch_region=BR&with_watch_monetization_types=flatrate%7Cfree%7Cads&sort_by=popularity.desc&vote_count.gte=30&page="+page)));
  return r.flatMap(x=>x.status==="fulfilled"?tmdbMap(x.value.results||[],kind,"Popular no Brasil"):[]);
 };
 const upcoming=()=>query(kind==="Filmes"?
  "movie/upcoming?language=pt-BR&region=BR&page=1":
  "discover/tv?language=pt-BR&sort_by=popularity.desc&first_air_date.gte="+iso(new Date())+"&first_air_date.lte="+shift(12)+"&page=1")
  .then(d=>tmdbMap(d.results||[],kind,"Estreias internacionais"));
 const top=async()=>{
  const results=await Promise.allSettled([1,2].map(page=>query(
   "discover/"+media+"?language=pt-BR&sort_by=vote_average.desc&vote_count.gte=180&"+
   (kind==="Filmes"?"primary_release_date.gte=":"first_air_date.gte=")+shift(-48)+"&page="+page)));
  return results.flatMap(x=>x.status==="fulfilled"?tmdbMap((x.value.results||[]).filter((v:any)=>Number(v.vote_average)>=7),kind,"Mais bem avaliados"):[]);
 };
 const onAir=()=>query("tv/on_the_air"+lang).then(d=>tmdbMap(d.results||[],kind,"Em exibição"));
 const returning=async()=>{
  const titles=await onAir();
  const r=await Promise.allSettled(titles.slice(0,15).map(async(t:any)=>{
   const id=String(t.id).replace(/^tmdb-tv-/,"");
   const d=await query("tv/"+id+"?language=pt-BR");
   const now=Date.now();
   const isNew=[d.next_episode_to_air,d.last_episode_to_air].some(ep=>{
    if(!ep||Number(ep.season_number)<2)return false;
    const date=Date.parse(String(ep.air_date||""));
    return Number.isFinite(date)&&date>=now-1000*60*60*24*120&&date<=now+1000*60*60*24*90;
   });
   return isNew?{...t,subtitle:"Nova temporada em exibição · TMDB"}:null;
  }));
  return r.flatMap(x=>x.status==="fulfilled"&&x.value?[x.value]:[]);
 };
 if(feed==="em-alta"){const r=await Promise.allSettled([brasil(),trending()]);return mix(r.map(x=>x.status==="fulfilled"?x.value:[]),[28,18],55);}
 if(feed==="em-breve")return upcoming();
 if(feed==="melhores")return top();
 if(feed==="novas-temporadas")return kind==="Séries"?returning():[];
 const jobs=kind==="Séries"?[brasil(),trending(),upcoming(),top(),onAir()]:[brasil(),trending(),upcoming(),top()];
 const results=await Promise.allSettled(jobs);
 const lists=results.map(x=>x.status==="fulfilled"?x.value:[]);
 if(!lists.some(x=>x.length))throw Error("TMDB indisponível");
 return mix(lists,kind==="Séries"?[25,18,8,10,8]:[26,18,10,12],72);
}
async function tmdbImages(kind:Kind,id:string,token?:string){
 if(!token)throw new Error("TMDB_READ_TOKEN não configurado");
 const m=/^tmdb-(movie|tv)-(\d{1,9})$/.exec(id);
 if(!m||(m[1]==="movie")!==(kind==="Filmes"))throw new Error("Título inválido");
 const data=await json("https://api.themoviedb.org/3/"+m[1]+"/"+m[2]+"/images?include_image_language=pt,en,null",{headers:{"Authorization":"Bearer "+token}});
 const backs=(data.backdrops||[]).filter(landscapeImage).sort((a:any,b:any)=>imageScore(b)-imageScore(a))
  .slice(0,18).map((x:any,i:number)=>({src:img(x.file_path),label:"Arte panorâmica "+(i+1)}));
 return backs.filter((x:any)=>x.src);
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
 const base="https://api.rawg.io/api/games?key="+encodeURIComponent(key)+"&page_size=40";
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
 return mix([lists[3],lists[4],lists[0],lists[1],lists[2]],[2,2,18,17,15],60);
}

async function steamGridHeroes(gameName:string,token:string|undefined){
 if(!token||!gameName)return [];
 const headers={Authorization:"Bearer "+token,Accept:"application/json"};
 const base="https://www.steamgriddb.com/api/v2/";
 const clean=(v:string)=>v.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();
 const search=await json(base+"search/autocomplete/"+encodeURIComponent(gameName),{headers});
 const found=(search.data||[]).find((x:any)=>clean(String(x.name||""))===clean(gameName));
 if(!found||!Number.isInteger(Number(found.id)))return [];
 const heroes=await json(base+"heroes/game/"+found.id+"?types=static",{headers});
 return (Array.isArray(heroes.data)?heroes.data:[])
  .filter((v:any)=>typeof v.url==="string"&&v.url.startsWith("https://") &&
    (!v.width||!v.height||Number(v.width)/Number(v.height)>=1.5))
  .sort((a:any,b:any)=>(Number(b.score)||0)-(Number(a.score)||0))
  .slice(0,6).map((v:any,i:number)=>({
    src:v.url,label:"Arte panorâmica SteamGridDB "+(i+1)+(v.author?.name?" · "+v.author.name:"")
  }));
}
async function rawgImages(id:string,key?:string,steamKey?:string){
 if(!key)throw new Error("RAWG_API_KEY não configurada");
 const m=/^rawg-(\d{1,9})$/.exec(id);if(!m)throw new Error("Jogo inválido");
 const base="https://api.rawg.io/api/games/"+m[1]+"?key="+encodeURIComponent(key);
 const screenshots=json("https://api.rawg.io/api/games/"+m[1]+"/screenshots?key="+encodeURIComponent(key)+"&page_size=12")
  .then(data=>(data.results||[]).filter((v:any)=>typeof v.image==="string"&&v.image.startsWith("https://"))
   .slice(0,10).map((v:any,i:number)=>({src:v.image,label:"Captura oficial "+(i+1)})));
 const heroes=steamKey?json(base).then(d=>steamGridHeroes(String(d.name||""),steamKey)).catch(()=>[]):Promise.resolve([]);
 const parts=await Promise.allSettled([heroes,screenshots]);
 const group=parts.map((p:any)=>p.status==="fulfilled"?p.value:[]);
 return [...group[0],...group[1]].slice(0,16);
}

/** Official TMDB landscape artwork for requested anime franchises.
 * Delivers remote CDN URLs rather than redistributing images via GitHub.
 * A single title can have 6-10 safe-to-display horizontal artwork variants.
 */
const ANIME_FRANCHISES=[
 {query:"One Piece",match:/one piece|ワンピース/i},
 {query:"Solo Leveling",match:/solo leveling|俺だけレベルアップ/i},
 {query:"Jujutsu Kaisen",match:/jujutsu kaisen|呪術廻戦/i},
 {query:"Demon Slayer",match:/demon slayer|kimetsu no yaiba|鬼滅の刃/i},
 {query:"Dragon Ball Super",match:/dragon ball super|ドラゴンボール超/i},
 {query:"Dragon Ball Z",match:/dragon ball z|ドラゴンボールz/i},
 {query:"Chainsaw Man",match:/chainsaw man|チェンソーマン/i},
 {query:"Bleach",match:/bleach|ブリーチ/i},
 {query:"Naruto Shippuden",match:/naruto.*shippuden|ナルト/i},
] as const;
async function animeSpotlight(token:string|undefined){
 if(!token)return [];
 const base="https://api.themoviedb.org/3/";
 const headers={"Authorization":"Bearer "+token};
 const records=await Promise.allSettled(ANIME_FRANCHISES.map(async franchise=>{
  const url=base+"search/tv?language=pt-BR&include_adult=false&query="+encodeURIComponent(franchise.query);
  const found=await json(url,{headers});
  const match=(found.results||[]).filter((v:any)=>
   franchise.match.test(String(v.original_name||"")+" "+String(v.name||"")) &&
   v.original_language==="ja" && Array.isArray(v.genre_ids)&&v.genre_ids.includes(16) &&
   typeof v.backdrop_path==="string")
   .sort((a:any,b:any)=>Number(b.vote_count||0)-Number(a.vote_count||0))[0];
  if(!match)return null;
  const imageData=await json(base+"tv/"+match.id+"/images?include_image_language=pt,en,null",{headers}).catch(()=>({backdrops:[]}));
  const wide=(imageData.backdrops||[]).filter(landscapeImage)
   .sort((a:any,b:any)=>imageScore(b)-imageScore(a))
   .slice(0,11).map((v:any,i:number)=>({src:img(v.file_path),label:"Backdrop oficial "+(i+1)}))
   .filter((v:any)=>v.src);
  const first=img(match.backdrop_path);
  if(first&&!wide.some((v:any)=>v.src===first))wide.unshift({src:first,label:"Backdrop original"});
  if(!wide.length)return null;
  return {id:"tmdb-tv-"+match.id,kind:"Anime",title:String(match.name||franchise.query),
   subtitle:"Anime favorito · Artes horizontais TMDB",genres:["Anime","Ação"],platforms:["Anime"],
   year:Number(String(match.first_air_date||"").slice(0,4))||0,provider:"tmdb",
   sourceUrl:"https://www.themoviedb.org/tv/"+match.id,popularity:Math.max(100,Number(match.popularity)||0),
   variants:wide.slice(0,12)};
 }));
 return records.flatMap(x=>x.status==="fulfilled"&&x.value?[x.value]:[]);
}

/** Public Kitsu anime catalogue, fallback if AniList rejects Cloudflare egress. */

function kitsuMap(list:any[],tag:string){
 const current=yearNow();
 return list.flatMap((v:any)=>{
  const a=v.attributes||{};
  if(a.ageRating==="R18" || a.nsfw===true)return [];
  const coverDims=a.coverImage?.meta?.dimensions?.original || a.coverImage?.meta?.dimensions?.large;
  const aspect=Number(coverDims?.width)/Number(coverDims?.height);
  // Reject uncertain or portrait-like "coverImage"; no vertical poster in the TV rotation.
  if(!Number.isFinite(aspect)||aspect<1.55||aspect>2.20)return [];
  const wide=a.coverImage?.original||a.coverImage?.large||"";
  const poster=a.posterImage?.original||a.posterImage?.large||"";
  const variants=[...(typeof wide==="string"&&wide.startsWith("https://")?[{src:wide,label:"Arte panorâmica"}]:[])];
  // A poster alone is not an appropriate fullscreen TV wallpaper.
  if(!wide||! /^\d{1,9}$/.test(String(v.id||""))||!a.canonicalTitle)return [];
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
  const variants=[...(typeof v.bannerImage==="string"&&v.bannerImage.startsWith("https://")?[{src:v.bannerImage,label:"Banner do anime"}]:[])];
  if(!v.bannerImage||!variants.length)return []; // no portrait-only artwork in TV hero feed
  return [{id:"anilist-"+v.id,kind:"Anime",title:String(v.title?.english||v.title?.romaji||v.title?.native||""),subtitle:"Anime em alta · AniList",
    genres:v.genres||[],platforms:["Anime"],year:Number(v.seasonYear)||0,provider:"anilist",
    sourceUrl:"https://anilist.co/anime/"+v.id,popularity:Number(v.popularity)||0,variants}];
 }).slice(0,18);
}
async function animePopularBR(token:string|undefined){
 if(!token)return [];
 const base="https://api.themoviedb.org/3/discover/tv";
 const headers={"Authorization":"Bearer "+token};
 const tasks=await Promise.allSettled([1,2,3].map(page=>json(base+
  "?language=pt-BR&sort_by=popularity.desc&watch_region=BR"+
  "&with_watch_monetization_types=flatrate%7Cads&with_genres=16"+
  "&with_original_language=ja&vote_count.gte=80&page="+page,{headers})));
 return tasks.flatMap(x=>x.status==="fulfilled"?tmdbMap((x.value.results||[]).filter((v:any)=>
  v.original_language==="ja" && v.genre_ids?.includes(16)), "Anime","Popular no Brasil"):[]);
}
async function animeCatalog(feed:Feed,token:string|undefined){
 const tasks=await Promise.allSettled([animeSpotlight(token),animePopularBR(token),kitsu(feed),anime()]);
 const spot=tasks[0].status==="fulfilled"?tasks[0].value:[];
 const popular=tasks[1].status==="fulfilled"?tasks[1].value:[];
 const kitsuList=tasks[2].status==="fulfilled"?tasks[2].value:[];
 const aniList=tasks[3].status==="fulfilled"?tasks[3].value:[];
 if(feed==="em-breve"||feed==="novas-temporadas")return mix([kitsuList,aniList.filter((x:any)=>feed==="em-breve"&&x.year>=yearNow())],[25,10],45);
 if(!spot.length&&!popular.length&&!kitsuList.length&&!aniList.length)throw Error("Catálogo de animes indisponível");
 if(spot.length+popular.length>=12)return mix([spot,popular],[12,65],85);
 return mix([spot,popular,kitsuList,aniList],[12,33,16,12],85);
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
 // Namespace cache per catalog schema: avoid old pre-filter responses after deploy.
 const cacheUrl=new URL(request.url);
 cacheUrl.searchParams.set("__catalog_schema","br-anime-widescreen-v6");
 const cacheKey=new Request(cacheUrl.toString(),{method:"GET"});
 const edge=(caches as CacheStorage & {default:Cache}).default;
 try{const cached=await edge.match(cacheKey);if(cached)return cached;}catch{}
 try{
  const variants=imageId?(kind==="Filmes"||kind==="Séries"?await tmdbImages(kind,imageId,env.TMDB_READ_TOKEN):kind==="Jogos"?await rawgImages(imageId,env.RAWG_API_KEY,env.STEAMGRIDDB_API_KEY):[]):undefined;
  const items=imageId?undefined:(kind==="Filmes"||kind==="Séries"?await tmdb(kind,env.TMDB_READ_TOKEN,feed):kind==="Jogos"?await rawg(env.RAWG_API_KEY,feed):await animeCatalog(feed,env.TMDB_READ_TOKEN));
  const source=kind==="Filmes"||kind==="Séries"?"TMDB":kind==="Jogos"?"RAWG":items?.[0]?.provider==="tmdb"?"TMDB + Kitsu/AniList":items?.[0]?.provider==="kitsu"?"Kitsu":"AniList";
  const result=response(imageId?{kind,source,id:imageId,variants}:{kind,source,items,feed,updatedAt:new Date().toISOString()},200,true);
  ctx.waitUntil(edge.put(cacheKey,result.clone()).catch(()=>{}));
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
  // Dedicated uncached time source, queried on Wi-Fi reconnection.
  // This synchronizes the launcher display without requiring Android SET_TIME.
  if(path==="/api/time")return new Response(JSON.stringify({nowMs:Date.now()}),{
   status:200,headers:{"Content-Type":"application/json; charset=utf-8",
     "Cache-Control":"no-store, max-age=0","X-Content-Type-Options":"nosniff"}
  });
  if(path==="/api/catalog")return catalog(request,env,ctx);
  if(path.startsWith("/api/"))return response({error:"Rota não encontrada"},404);
  return env.ASSETS.fetch(request);
 }
};

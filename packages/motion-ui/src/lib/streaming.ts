export type MediaKind="br"|"international"|"movie"|"series";
export interface MediaEntry {id:string;title:string;kind:MediaKind;info:string;src:string;official:string;poster?:string}
export const MEDIA:MediaEntry[]=[
{"id":"tvcultura","title":"TV Cultura","kind":"br","info":"Brasil · Cultura e entretenimento","src":"https://player-tvcultura.stream.uol.com.br/live/tvcultura.m3u8","official":"https://cultura.uol.com.br/aovivo/107_ao-vivo-tv-cultura.html"},
{"id":"recordnews","title":"Record News","kind":"br","info":"Brasil · Notícias","src":"https://rnw-rn.otteravision.com/rnw/rn/rnw_rn.m3u8","official":"https://noticias.r7.com/record-news/"},
{"id":"redebrasil","title":"Rede Brasil","kind":"br","info":"Brasil · Entretenimento","src":"https://video09.logicahost.com.br/redebrasiloficial/redebrasiloficial/playlist.m3u8","official":"https://rbtv.com.br/"},
{"id":"sita","title":"Sita Sings the Blues","kind":"movie","info":"2008 · Animação · Longa-metragem · Obra aberta","src":"https://archive.org/download/Sita_Sings_the_Blues/Sita_Sings_the_Blues_480p_2150kbps.mp4","official":"https://www.sitasingstheblues.com/watch.html"},
{"id":"wingit","title":"WING IT!","kind":"movie","info":"2023 · Animação · 4 min · Obra aberta","src":"https://video.blender.org/object-storage/web_videos/1be4c93c-1fd2-498d-adc7-50126823033e-480.mp4","poster":"https://video.blender.org/lazy-static/thumbnails/4efa0a16-83b0-4c62-a4bc-4dcd30c05749.jpg","official":"https://video.blender.org/videos/watch/bd0084a5-1d26-4816-ab5e-1bad9e2fb990"},
{"id":"singularity","title":"Singularity","kind":"movie","info":"2026 · Animação · 6 min · Lançamento aberto","src":"https://video.blender.org/object-storage/web_videos/f91fd74e-a81f-48ec-b92b-c9504ac46e31-1080.mp4","poster":"https://video.blender.org/lazy-static/thumbnails/38b6e48a-40e7-4c46-801f-9a46baf9c02a.jpg","official":"https://studio.blender.org/projects/singularity/"},
  {
    "id": "tvbrasil",
    "title": "TV Brasil",
    "kind": "br",
    "info": "Brasil · Programação pública",
    "src": "https://tvbrasil-stream.ebc.com.br/index.m3u8",
    "official": "https://tvbrasil.ebc.com.br/"
  },
  {
    "id": "canalgov",
    "title": "Canal Gov",
    "kind": "br",
    "info": "Brasil · Informação",
    "src": "https://canalgov-stream.ebc.com.br/index.m3u8",
    "official": "https://canalgov.ebc.com.br/"
  },
  {
    "id": "tvcamara",
    "title": "TV Câmara",
    "kind": "br",
    "info": "Brasil · Legislativo",
    "src": "https://stream3.camara.gov.br/tv1/manifest.m3u8",
    "official": "https://www.camara.leg.br/tv/aovivo"
  },
  {
    "id": "france24",
    "title": "France 24",
    "kind": "international",
    "info": "França · Notícias em inglês",
    "src": "https://live.france24.com/hls/live/2037218/F24_EN_HI_HLS/master_5000.m3u8",
    "official": "https://www.france24.com/en/live"
  },
  {
    "id": "dw",
    "title": "DW News",
    "kind": "international",
    "info": "Alemanha · Notícias em inglês",
    "src": "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8",
    "official": "https://www.dw.com/en/live-tv/s-100825"
  },
  {
    "id": "bunny",
    "title": "Big Buck Bunny",
    "kind": "movie",
    "info": "2008 · Animação · 10 min",
    "src": "https://video.blender.org/object-storage/web_videos/6402b77c-b61f-4a06-96ca-c8420a2becf4-480.mp4",
    "poster": "https://video.blender.org/lazy-static/thumbnails/6402b77c-b61f-4a06-96ca-c8420a2becf4.jpg",
    "official": "https://video.blender.org/w/6402b77c-b61f-4a06-96ca-c8420a2becf4"
  },
  {
    "id": "sintel",
    "title": "Sintel",
    "kind": "movie",
    "info": "2010 · Fantasia · 14 min",
    "src": "https://video.blender.org/object-storage/web_videos/0eb052d0-fd51-43e6-aa33-ecdbf77a5d40-480.mp4",
    "poster": "https://video.blender.org/lazy-static/thumbnails/0eb052d0-fd51-43e6-aa33-ecdbf77a5d40.jpg",
    "official": "https://video.blender.org/w/0eb052d0-fd51-43e6-aa33-ecdbf77a5d40"
  },
  {
    "id": "tears",
    "title": "Tears of Steel",
    "kind": "movie",
    "info": "2012 · Ficção científica · 12 min",
    "src": "https://video.blender.org/object-storage/web_videos/8533ea43-4271-4a57-9694-e9d0b35e1aa1-480.mp4",
    "poster": "https://video.blender.org/lazy-static/thumbnails/8533ea43-4271-4a57-9694-e9d0b35e1aa1.jpg",
    "official": "https://video.blender.org/w/8533ea43-4271-4a57-9694-e9d0b35e1aa1"
  },
  {
    "id": "sprite",
    "title": "Sprite Fright",
    "kind": "movie",
    "info": "2021 · Animação · 10 min",
    "src": "https://video.blender.org/object-storage/web_videos/a69d68a5-a0e0-4a80-9d66-49f093c97aaf-720.mp4",
    "poster": "https://video.blender.org/lazy-static/thumbnails/2d32ff36-a56a-4493-872b-5dea70fc59ae.jpg",
    "official": "https://video.blender.org/w/a69d68a5-a0e0-4a80-9d66-49f093c97aaf"
  },
  {
    "id": "charge",
    "title": "Charge",
    "kind": "movie",
    "info": "2022 · Ficção científica · 4 min",
    "src": "https://video.blender.org/object-storage/web_videos/70528f27-fd51-479f-8146-abb5a7a81fff-720.mp4",
    "poster": "https://video.blender.org/lazy-static/thumbnails/0dd54e62-2ae7-4db9-8144-4da805fbe4ba.jpg",
    "official": "https://video.blender.org/w/04da454b-9893-4184-98f3-248d00625efe"
  },
  {
    "id": "cam2",
    "title": "Caminandes: Gran Dillama",
    "kind": "series",
    "info": "Episódio 2 · 2 min",
    "src": "https://video.blender.org/object-storage/web_videos/fb70d459-48d2-4db5-adba-813c84f9200a-480.mp4",
    "poster": "https://video.blender.org/lazy-static/thumbnails/fb70d459-48d2-4db5-adba-813c84f9200a.jpg",
    "official": "https://video.blender.org/w/fb70d459-48d2-4db5-adba-813c84f9200a"
  },
  {
    "id": "cam3",
    "title": "Caminandes: Llamigos",
    "kind": "series",
    "info": "Episódio 3 · 2 min",
    "src": "https://video.blender.org/object-storage/web_videos/23f3ef79-15dc-44c5-aa45-cf92e78a4509-480.mp4",
    "poster": "https://video.blender.org/lazy-static/thumbnails/23f3ef79-15dc-44c5-aa45-cf92e78a4509.jpg",
    "official": "https://video.blender.org/w/23f3ef79-15dc-44c5-aa45-cf92e78a4509"
  }
];
export const MEDIA_TABS=[{id:"br",label:"TV brasileira"},{id:"international",label:"TV internacional"},{id:"movie",label:"Filmes"},{id:"series",label:"Séries"}] as const;
export function mediaFor(kind:MediaKind){return MEDIA.filter(m=>m.kind===kind);}

export type MediaTab=MediaKind|"recent"|"resume";
export function entriesForTab(tab:MediaTab,resumeIds:string[]=[]){if(tab==="recent")return MEDIA.filter(m=>m.kind==="movie"&&m.info.startsWith("2026"));if(tab==="resume")return resumeIds.map(id=>MEDIA.find(m=>m.id===id&&(m.kind==="movie"||m.kind==="series"))).filter((m):m is MediaEntry=>!!m);return mediaFor(tab);}

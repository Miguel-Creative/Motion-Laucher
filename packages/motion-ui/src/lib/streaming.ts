export type MediaKind="br"|"international"|"movie"|"series";
export interface MediaEntry {id:string;title:string;kind:MediaKind;info:string;src:string;official:string;poster?:string}
export const MEDIA:MediaEntry[]=[
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
    "src": "https://video.blender.org/object-storage/web_videos/70528f27-fd51-479f-8144-4da805fbe4ba-720.mp4",
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

export type MediaKind="br"|"international"|"movie"|"series";
export interface MediaEntry {id:string;title:string;kind:MediaKind;info:string;src?:string;official:string;poster?:string}
export const MEDIA:MediaEntry[]=[
  {
    "id": "globo",
    "title": "Globo",
    "kind": "br",
    "info": "TV aberta · Conta gratuita e região",
    "official": "https://globoplay.globo.com/agora-na-tv/"
  },
  {
    "id": "sbt",
    "title": "SBT",
    "kind": "br",
    "info": "TV aberta · Sinal nacional pelo site",
    "official": "https://www.sbt.com.br/ao-vivo"
  },
  {
    "id": "record",
    "title": "Record",
    "kind": "br",
    "info": "TV aberta · RecordPlus",
    "official": "https://descubra.recordplus.com/"
  },
  {
    "id": "band",
    "title": "Band",
    "kind": "br",
    "info": "TV aberta · Band ao vivo",
    "official": "https://www.band.com.br/ao-vivo"
  },
  {
    "id": "redetv",
    "title": "RedeTV!",
    "kind": "br",
    "info": "TV aberta · Sinal oficial",
    "official": "https://www.redetv.uol.com.br/aovivo"
  },
  {
    "id": "sbtinterior",
    "title": "SBT Interior",
    "kind": "br",
    "info": "TV aberta · São Paulo · Regional",
    "src": "https://cdn.jmvstream.com/w/LVW-10801/LVW10801_Xvg4R0u57n/playlist.m3u8",
    "official": "https://tela2.com.br/"
  },
  {
    "id": "gazeta",
    "title": "TV Gazeta",
    "kind": "br",
    "info": "TV aberta · Entretenimento",
    "official": "https://www.tvgazeta.com.br/aovivo/"
  },
  {
    "id": "recordnews",
    "title": "Record News",
    "kind": "br",
    "info": "TV aberta · Notícias",
    "src": "https://rnw-rn.otteravision.com/rnw/rn/rnw_rn.m3u8",
    "official": "https://noticias.r7.com/record-news/"
  },
  {
    "id": "tvcultura",
    "title": "TV Cultura",
    "kind": "br",
    "info": "TV aberta · Cultura e entretenimento",
    "src": "https://player-tvcultura.stream.uol.com.br/live/tvcultura.m3u8",
    "official": "https://cultura.uol.com.br/aovivo/107_ao-vivo-tv-cultura.html"
  }
];
export const MEDIA_TABS=[{id:"br",label:"TV brasileira"}] as const;
export function mediaFor(kind:MediaKind){return MEDIA.filter(m=>m.kind===kind);}
export type MediaTab=MediaKind|"recent"|"resume";
export function entriesForTab(tab:MediaTab,_resumeIds:string[]=[]){return tab==="br"?mediaFor("br"):[];}

import { useEffect,useState } from "react";
import { Link } from "@tanstack/react-router";
import { Shell } from "./Shell";
import { Button } from "@/components/ui/button";
import { Dialog,DialogContent,DialogTitle,DialogDescription } from "@/components/ui/dialog";
import { TVSearchButton } from "./TVSearchButton";
import { getManagedApps,type ManagedApp } from "@/lib/device/native-android";
type Filter="all"|"user"|"system"|"disabled";
export function InstalledAppsPage(){
 const bridge=window.MotionNative;
 const native=typeof bridge?.getManagedApps==="function";
 const [apps,setApps]=useState<ManagedApp[]>(()=>getManagedApps());
 const [filter,setFilter]=useState<Filter>("all");
 const [query,setQuery]=useState("");const [page,setPage]=useState(0);const [selected,setSelected]=useState<ManagedApp|null>(null);
 const reload=()=>{setApps(getManagedApps());setSelected(null);};
 useEffect(()=>{window.addEventListener("motion-apps-changed",reload);return()=>window.removeEventListener("motion-apps-changed",reload);},[]);
 const filtered=apps.filter(a=>(filter==="all"||(filter==="user"&&!a.system)||(filter==="system"&&a.system)||(filter==="disabled"&&!a.enabled))&&(a.name+" "+a.pkg).toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR"))).sort((a,b)=>a.name.localeCompare(b.name,"pt-BR"));
 const count=Math.max(1,Math.ceil(filtered.length/8)),safePage=Math.min(page,count-1);
 return <Shell title="Aplicativos instalados" subtitle={native?apps.length+" aplicativos encontrados no Android":"Disponível no aplicativo Android atualizado."} variant="media"><div className="motion-media-body">
 <div className="motion-media-tabs"><Button asChild variant="outline"><Link data-nav to="/settings">Ajustes</Link></Button>{([["all","Todos"],["user","Usuário"],["system","Sistema"],["disabled","Desativados"]] as const).map(([id,label])=><Button data-nav data-nav-default={id===filter?"":undefined} key={id} variant={id===filter?"default":"outline"} onClick={()=>{setFilter(id);setPage(0);}}>{label}</Button>)}<TVSearchButton label="Buscar" value={query} onChange={v=>{setQuery(v);setPage(0);}}/></div>
 <div className="motion-media-scroll">{filtered.slice(safePage*8,safePage*8+8).map(a=><button key={a.pkg} type="button" data-nav className="motion-app-row" onClick={()=>setSelected(a)}><strong>{a.name}</strong><small>{a.enabled?"Ativo":"Desativado"} · {a.system?"Sistema":"Usuário"} · {a.version||"Versão não informada"}{a.self?" · Protegido":""}</small></button>)}{!filtered.length&&<p>{native?"Nenhum aplicativo neste filtro.":"Não é possível gerenciar aplicativos pela prévia web."}</p>}</div>
 <div className="motion-media-footer"><span>{filtered.length} apps · Página {safePage+1} de {count}</span><div><Button data-nav disabled={safePage===0} onClick={()=>setPage(safePage-1)}>Anterior</Button><Button data-nav disabled={safePage+1>=count} onClick={()=>setPage(safePage+1)}>Próxima</Button><Button data-nav variant="outline" onClick={reload}>Atualizar</Button></div></div>
 <Dialog open={!!selected} onOpenChange={v=>{if(!v)setSelected(null);}}><DialogContent className="motion-app-dialog"><DialogTitle>{selected?.name}</DialogTitle><DialogDescription>{selected?.pkg} · {selected?.enabled?"Ativo":"Desativado"}</DialogDescription>{selected&&<>{selected.launchable&&!selected.self&&selected.enabled&&<Button data-nav onClick={()=>{bridge?.launchPackage(selected.pkg);setSelected(null);}}>Abrir aplicativo</Button>}{!selected.self&&<Button data-nav onClick={()=>{bridge?.openAppDetails?.(selected.pkg);setSelected(null);}}>Detalhes / {selected.enabled?"Desativar":"Reativar"} no Android</Button>}{!selected.self&&!selected.system&&<Button data-nav variant="destructive" onClick={()=>{bridge?.requestUninstall?.(selected.pkg);setSelected(null);}}>Desinstalar (confirmar no Android)</Button>}{selected.system&&<p>O Android determina quais componentes do sistema podem ser desativados.</p>}{selected.self&&<p>Motion Launcher protegido para evitar perder a tela inicial.</p>}<Button data-nav variant="outline" onClick={()=>setSelected(null)}>Voltar</Button></>}</DialogContent></Dialog>
 </div></Shell>;
}

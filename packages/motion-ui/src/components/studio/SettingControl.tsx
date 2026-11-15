import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AVAILABILITY_LABEL, type SettingDef, type SettingValue } from "@/lib/settings-schema";
import { useAppState, readSetting, setSetting } from "@/lib/store";
import { runSettingAction } from "@/lib/actions";
const DESTINATIONS = ["/wallpapers", "/remote", "/recovery", "/welcome"] as const;
export function SettingControl({ def }: { def: SettingDef }) {
 const value = useAppState(s=>readSetting<SettingValue>(def.id,s)); const navigate=useNavigate(); const [confirm,setConfirm]=useState(false);
 const implemented = def.type === "action" || def.id.startsWith("projector.") || ["appearance.theme", "appearance.accent", "motion.speed", "motion.focusEffect", "motion.reduce", "performance.visualMode", "performance.pauseHidden", "wallpaper.rotation", "wallpaper.customMinutes", "wallpaper.order", "wallpaper.mix", "wallpaper.pauseOnPlayback", "wallpaper.maxResolution", "profiles.active", "profiles.name", "privacy.history", "storage.uploadQuality", "storage.maxUploads", "input.pointerSpeed", "a11y.highContrast", "notify.duration"].includes(def.id);
 const unsupported = def.availability === "ponte" || def.availability === "indisponivel" || def.secret;
 const update=(v:SettingValue)=>{setSetting(def.id,v);};
 const action=()=>void runSettingAction(def.action ?? "", to=>{const dest=DESTINATIONS.find(d=>d===to);if(dest)void navigate({to:dest});});
 return <div className="setting-row"><div className="min-w-0"><label htmlFor={def.id} className="font-medium text-sm">{def.label}</label><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{def.description}</p><span className={`mt-2 inline-block text-[10px] ${unsupported ? "text-warning" : "text-success"}`}>{def.secret ? "Não configurado · Requer integração autorizada" : AVAILABILITY_LABEL[def.availability ?? (implemented ? "local" : "demo")]}</span></div><div className="setting-input">
 {def.type==="toggle" && <Switch data-nav id={def.id} disabled={unsupported} checked={Boolean(value)} onCheckedChange={update}/>}
 {def.type==="slider" && <div className="w-full"><output className="mb-2 block text-right font-mono text-xs text-primary">{String(value)}{def.unit}</output><input data-nav id={def.id} aria-label={def.label} disabled={unsupported} type="range" className="ml-range w-full" min={def.min} max={def.max} step={def.step} value={Number(value)} onChange={e=>update(Number(e.target.value))}/></div>}
 {(def.type==="select" || def.type==="segmented") && <select data-nav id={def.id} disabled={unsupported} value={String(value)} onChange={e=>update(e.target.value)}>{def.options?.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select>}
 {def.type==="text" && <Input data-nav id={def.id} disabled={unsupported} type={def.secret ? "password" : "text"} value={String(value ?? "")} placeholder={def.placeholder} onChange={e=>update(e.target.value)}/>}
 {def.type==="multi" && <div className="flex flex-wrap gap-2">{def.options?.map(o=><label key={o.value} className="flex items-center gap-1 text-xs"><input data-nav type="checkbox" checked={Array.isArray(value)&&value.includes(o.value)} onChange={e=>{const list=Array.isArray(value)?value:[];update(e.target.checked?[...list,o.value]:list.filter(v=>v!==o.value));}}/>{o.label}</label>)}</div>}
 {def.type==="action" && <Button data-nav variant={def.destructive?"destructive":"outline"} onClick={()=>def.destructive?setConfirm(true):action()}>{def.actionLabel ?? "Abrir"}</Button>}
 </div><Dialog open={confirm} onOpenChange={setConfirm}><DialogContent><DialogTitle>{def.label}?</DialogTitle><DialogDescription>{def.description} Esta ação afeta apenas as preferências locais. Exporte um backup para poder restaurá-las.</DialogDescription><div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>setConfirm(false)}>Cancelar</Button><Button variant="destructive" onClick={()=>{action();setConfirm(false);}}>Confirmar</Button></div></DialogContent></Dialog></div>;
}
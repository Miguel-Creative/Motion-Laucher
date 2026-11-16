import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

/** Remote-first search. Focusing this trigger never summons Android's keyboard. */
export function TVSearchButton({label,value,onChange}:{label:string;value:string;onChange:(next:string)=>void}) {
 const [open,setOpen]=useState(false);
 return <>
  <Button data-nav variant="outline" onClick={()=>setOpen(true)} aria-label={label}><Search size={16}/>{value?"Busca: "+value:label}</Button>
  <Dialog open={open} onOpenChange={setOpen}><DialogContent className="wp-search-dialog">
   <DialogTitle>{label}</DialogTitle>
   <DialogDescription>Aperte OK para abrir a digitação. Use o teclado para pesquisar.</DialogDescription>
   <input autoFocus aria-label="Texto da pesquisa" className="wp-search-input" value={value}
    onChange={e=>onChange(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();setOpen(false);}}}
    placeholder="O que você procura?"/>
   <Button data-nav onClick={()=>setOpen(false)}>Mostrar resultados</Button>
  </DialogContent></Dialog>
 </>;
}

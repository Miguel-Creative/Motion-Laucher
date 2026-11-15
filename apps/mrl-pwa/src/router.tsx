import { createRootRoute, createRoute, createRouter, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { ThemeApplier } from "@/components/system/ThemeApplier";
import { ProjectorSvgDefs } from "@/components/system/ProjectorSvgDefs";
import { Toaster } from "@/components/ui/sonner";
import { initializeStore } from "@/lib/store";
import { RemotePage } from "@/components/studio/RemotePage";

function MRLLayout(){
 useEffect(() => { initializeStore(); }, []);
 return <ThemeApplier><ProjectorSvgDefs/><Outlet/><Toaster position="top-center"/></ThemeApplier>;
}
const rootRoute = createRootRoute({component:MRLLayout,notFoundComponent:()=> <div className="min-h-screen bg-background p-8 text-foreground">Página não encontrada. <a href="/">Abrir MRL</a></div>});
const indexRoute = createRoute({getParentRoute:()=>rootRoute,path:"/",component:RemotePage});
const remoteRoute = createRoute({getParentRoute:()=>rootRoute,path:"/remote",component:RemotePage});
export const mrlRouter=createRouter({routeTree:rootRoute.addChildren([indexRoute,remoteRoute])});

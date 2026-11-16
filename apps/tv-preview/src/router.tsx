import { createRootRoute, createRoute, createRouter, Outlet, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { ThemeApplier } from "@/components/system/ThemeApplier";
import { ProjectorSvgDefs } from "@/components/system/ProjectorSvgDefs";
import { WallpaperRotation } from "@/components/system/WallpaperRotation";
import { useSpatialNav, focusFirst } from "@/hooks/use-spatial-nav";
import { Toaster } from "@/components/ui/sonner";
import { initializeStore } from "@/lib/store";
import { startLiveCatalog } from "@/lib/catalog/live";
import { TVHome } from "@/components/studio/TVHome";
import { LibraryPage } from "@/components/studio/LibraryPage";
import { WallpaperPage } from "@/components/studio/WallpaperPage";
import { SettingsPage } from "@/components/studio/SettingsPage";
import { WelcomePage, RecoveryPage } from "@/components/studio/WelcomePage";

function TVLayout() {
 const path=useLocation({select:s=>s.pathname});
 useSpatialNav();
 useEffect(() => { const stopStore=initializeStore(); const stopCatalog=startLiveCatalog(); return ()=>{stopStore?.();stopCatalog();}; }, []);
 // Every TV page starts with a clear, visible, non-editable remote focus target.
 useEffect(() => {
   const id=window.requestAnimationFrame(()=>{if(!document.querySelector('[role="dialog"][data-state="open"]'))focusFirst();});
   return ()=>window.cancelAnimationFrame(id);
 },[path]);
 return <ThemeApplier><ProjectorSvgDefs/><WallpaperRotation/><Outlet/><Toaster position="bottom-right"/></ThemeApplier>;
}
const rootRoute = createRootRoute({ component: TVLayout, notFoundComponent: () => <div className="min-h-screen bg-background p-8 text-foreground">Página não encontrada. <a href="/">Voltar ao início</a></div> });
const indexRoute = createRoute({getParentRoute:()=>rootRoute,path:"/",component:TVHome});
const launcherRoute = createRoute({getParentRoute:()=>rootRoute,path:"/launcher",component:TVHome});
const libraryRoute = createRoute({getParentRoute:()=>rootRoute,path:"/library",component:LibraryPage});
const wallpapersRoute = createRoute({getParentRoute:()=>rootRoute,path:"/wallpapers",component:WallpaperPage});
const settingsRoute = createRoute({getParentRoute:()=>rootRoute,path:"/settings",component:SettingsPage});
const welcomeRoute = createRoute({getParentRoute:()=>rootRoute,path:"/welcome",component:WelcomePage});
const onboardingRoute = createRoute({getParentRoute:()=>rootRoute,path:"/onboarding",component:WelcomePage});
const recoveryRoute = createRoute({getParentRoute:()=>rootRoute,path:"/recovery",component:RecoveryPage});
export const tvRouter = createRouter({routeTree:rootRoute.addChildren([indexRoute,launcherRoute,libraryRoute,wallpapersRoute,settingsRoute,welcomeRoute,onboardingRoute,recoveryRoute])});

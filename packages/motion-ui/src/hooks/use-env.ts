import { useEffect, useState } from "react";

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

/** Clock disciplined by Cloudflare time when connected, using monotonic elapsed time.
 * Android Wi-Fi projectors often have a wrong RTC/timezone even with auto-time enabled.
 * The display updates immediately on connectivity recovery without altering system settings.
 */
export function useNetworkClock(intervalMs=1000) {
  const [now,setNow]=useState<Date|null>(null);
  useEffect(()=>{
    let active=true;
    let anchorTime=0;
    let anchorMonotonic=0;
    let syncing=false;
    const tick=()=>{
      if(!active)return;
      const unixMs=anchorTime>0?anchorTime+(performance.now()-anchorMonotonic):Date.now();
      setNow(new Date(unixMs));
    };
    const sync=async()=>{
      if(!active || syncing || !navigator.onLine)return;
      syncing=true;
      const begin=performance.now();
      try{
        const response=await fetch("/api/time",{cache:"no-store",headers:{Accept:"application/json"}});
        if(!response.ok)throw new Error("Clock server unavailable");
        const payload=await response.json() as {nowMs?:number};
        const done=performance.now();
        if(typeof payload.nowMs!=="number" || !Number.isFinite(payload.nowMs))return;
        anchorTime=payload.nowMs+(done-begin)/2;
        anchorMonotonic=done;
        tick();
      }catch{
        // Device RTC remains a readable fallback offline.
      }finally{syncing=false;}
    };
    const onConnected=()=>{void sync();};
    const onVisible=()=>{if(document.visibilityState==="visible"){tick();void sync();}};
    tick();
    void sync();
    const timer=window.setInterval(tick,Math.min(intervalMs,1000));
    const resync=window.setInterval(()=>{void sync();},10*60*1000);
    window.addEventListener("online",onConnected);
    document.addEventListener("visibilitychange",onVisible);
    return ()=>{
      active=false;window.clearInterval(timer);window.clearInterval(resync);
      window.removeEventListener("online",onConnected);
      document.removeEventListener("visibilitychange",onVisible);
    };
  },[intervalMs]);
  return now;
}

export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  return online;
}

export function usePageVisible() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const fn = () => setVisible(document.visibilityState === "visible");
    fn();
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, []);
  return visible;
}

export function useMediaQuery(query: string) {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const fn = () => setMatch(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [query]);
  return match;
}

export function useSurface(surface: "tv" | "remote") {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset["surface"] = surface;
    return () => {
      delete html.dataset["surface"];
    };
  }, [surface]);
}

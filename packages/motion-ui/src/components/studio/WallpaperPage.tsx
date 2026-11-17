import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Check, Heart, Image as ImageIcon, Search, Settings2, Upload, X, Eye } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "./Shell";
import { Artwork } from "./Artwork";
import { SettingControl } from "./SettingControl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAllWallpapers, useCurrentWallpaper, stepWallpaper } from "@/lib/wallpaper";
import { useAppState, setState, setSettings, readSetting, toggleInList, useSetting, setSetting } from "@/lib/store";
import { SETTINGS_SECTIONS } from "@/lib/settings-schema";
import { formatReleaseDate } from "@/lib/catalog/format-release";
import type { Wallpaper } from "@/data/wallpapers";
import { useCatalogHealth, loadArtVariants, FEED_OPTIONS, getSelectedFeed, setSelectedFeed, type EditorialFeed } from "@/lib/catalog/live";

const FILTERS = ["Todos", "Anime", "Filmes", "Séries", "Jogos", "Favoritos", "Meus Wallpapers", "Fantasia", "Sci-Fi"];
const COMPACT_TV_MAX_HEIGHT = 620;
const pageSizeForViewport = () => typeof window === "undefined" || window.innerHeight > COMPACT_TV_MAX_HEIGHT ? 6 : 3;

function matchCategory(w: Wallpaper, filter: string, favorites: string[]) {
  if (filter === "Todos") return true;
  if (filter === "Favoritos") return favorites.includes(w.id);
  if (filter === "Meus Wallpapers") return w.id.startsWith("local-");
  if (filter === "Fantasia") return w.genres.some(g => /fantas/i.test(g));
  if (filter === "Sci-Fi") return w.genres.some(g => /ficção científica|sci.?fi|science fiction/i.test(g));
  return w.kind === filter;
}

/** Designed as a TV screen, not a long mobile page: six artworks and one detail panel at a time. */
export function WallpaperPage() {
  const all = useAllWallpapers();
  const { wallpaper } = useCurrentWallpaper();
  const favorites = useAppState(s => s.favWallpapers);
  const catalogHealth = useCatalogHealth();
  const fitMode = useSetting<string>("wallpaper.fitMode") || "preserve";
  const [category, setCategory] = useState("Todos");
  const [feed, setFeed] = useState<EditorialFeed>(getSelectedFeed);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(pageSizeForViewport);
  useEffect(() => {
    const syncViewport = () => setPageSize(pageSizeForViewport());
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [panel, setPanel] = useState<"detail" | "settings">("detail");
  const [showOriginal, setShowOriginal] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const pickerRef = useRef<HTMLInputElement>(null);

  const filtered = all.filter(w =>
    matchCategory(w, category, favorites) &&
    (query.trim() === "" || (w.title + " " + w.genres.join(" ")).toLocaleLowerCase("pt-BR").includes(query.trim().toLocaleLowerCase("pt-BR")))
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const currentPage = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);
  const selected = currentPage.find(w => w.id === selectedId) ?? currentPage[0] ?? wallpaper;
  const applied = wallpaper.id === selected.id;

  const resetList = () => { setPage(0); setSelectedId(null); setPanel("detail"); };
  const chooseFeed = (value: EditorialFeed) => {
    setFeed(value); setSelectedFeed(value);
    if (value === "novas-temporadas" && !["Séries", "Anime"].includes(category)) setCategory("Anime");
    resetList();
  };
  const apply = (w: Wallpaper) => { setState({ currentWallpaper: w.id }); setSelectedId(w.id); toast.success("Wallpaper aplicado à tela inicial."); };
  const toggleFavorite = () => toggleInList("favWallpapers", selected.id);
  const showPreview = () => {
    setPreviewOpen(true);
    if (selected.provider === "tmdb" || selected.provider === "rawg") {
      void loadArtVariants(selected).catch(() => toast.info("Não foi possível carregar artes alternativas."));
    }
  };
  const upload = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem."); return; }
    try {
      const bitmap = await createImageBitmap(file);
      const quality = Number(readSetting<string>("storage.uploadQuality")) || 1080;
      const width = Math.min(quality, bitmap.width);
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = Math.round(bitmap.height * width / bitmap.width);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const id = "local-" + Date.now();
      setState(s => ({ uploads: [...s.uploads, { id, name:file.name, dataUrl:canvas.toDataURL("image/jpeg", .8), createdAt:Date.now() }].slice(-readSetting<number>("storage.maxUploads")), currentWallpaper:id }));
      setCategory("Meus Wallpapers"); resetList();
      toast.success("Imagem enviada e aplicada.");
    } catch { toast.error("Não foi possível importar essa imagem."); }
  };
  const settings = SETTINGS_SECTIONS.find(s => s.id === "wallpaper")?.items.filter(d =>
    ["wallpaper.rotation", "wallpaper.customSeconds", "wallpaper.order", "wallpaper.mix", "wallpaper.pauseOnPlayback"].includes(d.id)
  ) ?? [];
  const activePreview = all.find(w => w.id === selected.id) ?? selected;

  return <Shell variant="wallpapers" title="Wallpapers" subtitle="Escolha artes para sua tela. Use as setas do controle e aperte OK para selecionar.">
    <div className="wp-tv">
      <div className="wp-toolbar">
        <div className="wp-feed" aria-label="Seleção editorial">
          {FEED_OPTIONS.map(option =>
            <Button key={option.id} data-nav size="sm" className="wp-chip" aria-pressed={feed===option.id}
              onClick={() => chooseFeed(option.id)}>{option.label}</Button>
          )}
        </div>
        <div className="wp-tools">
          <Button data-nav data-nav-default className="wp-tool" onClick={() => setSearchOpen(true)} aria-label="Abrir pesquisa de wallpapers">
            <Search size={16}/><span>{query ? "Busca: " + query : "Buscar"}</span>
          </Button>
          {query && <Button data-nav className="wp-icon-button" aria-label="Limpar busca" onClick={() => {setQuery(""); resetList();}}><X size={16}/></Button>}
          <Button data-nav className="wp-tool" onClick={() => pickerRef.current?.click()}><Upload size={16}/>Enviar</Button>
          <input ref={pickerRef} type="file" accept="image/*" tabIndex={-1} style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0]; if(f) void upload(f); e.target.value="";}}/>
        </div>
      </div>
      <div className="wp-categories" aria-label="Categorias de wallpapers">
        {FILTERS.map(label=>
          <Button key={label} data-nav className="wp-category" aria-pressed={category===label}
            onClick={()=>{setCategory(label);resetList();}}>{label}</Button>
        )}
      </div>
      <div className="wp-workspace">
        <section className="wp-catalog" aria-label="Catálogo de wallpapers">
          <div className="wp-catalog-head">
            <span><strong>{category==="Todos"?"Explore o catálogo":category}</strong> <span className="wp-muted">· {filtered.length} artes</span></span>
            <span className="wp-source">{catalogHealth.loading ? "Atualizando catálogo" : catalogHealth.live ? "Catálogo atualizado" : "Catálogo local"}</span>
          </div>
          <div className="wp-grid">
            {currentPage.map(w=>
              <button key={w.id} data-nav type="button" className={"wp-card "+(selected.id===w.id?"wp-card-selected ":"")+(wallpaper.id===w.id?"wp-card-applied":"")}
                aria-label={"Selecionar wallpaper " + w.title} aria-pressed={selected.id===w.id} onFocus={()=>setSelectedId(w.id)}
                onClick={()=>apply(w)}>
                <span className="wp-card-art"><Artwork wallpaper={w} thumbnail className="wp-card-image"/></span>
                <span className="wp-card-title">{w.title}</span>
                <span className="wp-card-kind">{w.kind}{wallpaper.id===w.id?" · Em uso":""}</span>
                <span className="wp-card-release">{formatReleaseDate(w)}</span>
              </button>
            )}
            {!currentPage.length && <div className="wp-empty"><Search size={28}/><strong>Nenhuma arte encontrada</strong><span>Escolha outra categoria ou limpe a pesquisa.</span></div>}
          </div>
          <footer className="wp-pagination">
            <span>Use ◀ ▶ para navegar pelas artes e OK para aplicar</span>
            <div className="wp-page-controls">
              <Button data-nav className="wp-page-button" disabled={safePage===0} onClick={()=>{setPage(p=>Math.max(0,p-1));setSelectedId(null);}} aria-label="Página anterior"><ChevronLeft/></Button>
              <span aria-live="polite">Página {safePage+1} de {pageCount}</span>
              <Button data-nav className="wp-page-button" disabled={safePage===pageCount-1} onClick={()=>{setPage(p=>Math.min(pageCount-1,p+1));setSelectedId(null);}} aria-label="Próxima página"><ChevronRight/></Button>
            </div>
          </footer>
        </section>
        <aside className="wp-details" aria-label="Prévia e personalização">
          <div className="wp-panel-tabs">
            <Button data-nav className="wp-panel-tab" aria-pressed={panel==="detail"} onClick={()=>setPanel("detail")}><Eye size={15}/>Prévia</Button>
            <Button data-nav className="wp-panel-tab" aria-pressed={panel==="settings"} onClick={()=>setPanel("settings")}><Settings2 size={15}/>Ajustes</Button>
          </div>
          {panel==="detail" ?
          <div className="wp-detail-body">
            <div className="wp-preview-art"><Artwork wallpaper={selected} original={showOriginal} className="wp-preview-image"/></div>
            <div className="wp-selected-title" title={selected.title}>{selected.title}</div>
            <div className="wp-selected-meta">{selected.kind} · {formatReleaseDate(selected)}</div>
            <div className="wp-detail-actions">
              <Button data-nav className="wp-apply" onClick={()=>apply(selected)}><Check size={16}/>{applied?"Em uso":"Aplicar wallpaper"}</Button>
              <Button data-nav className="wp-icon-button" aria-label="Favoritar wallpaper" aria-pressed={favorites.includes(selected.id)} onClick={toggleFavorite}><Heart size={18}/></Button>
            </div>
            <div className="wp-secondary-actions">
              <Button data-nav className="wp-secondary" onClick={()=>setShowOriginal(v=>!v)}>{showOriginal?"Ver otimizada":"Ver original"}</Button>
              <Button data-nav className="wp-secondary" onClick={showPreview}>Mais artes</Button>
            </div>
            <p className="wp-help">Selecionar uma arte à esquerda mostra sua prévia. Aperte OK para aplicá-la na tela inicial.</p>
          </div> :
          <div className="wp-settings-scroll">
            <p className="wp-help">Controle a troca automática e o enquadramento sem sair do catálogo.</p>
            {settings.map(def=><SettingControl key={def.id} def={def}/>)}
            <div className="wp-fit"><strong>Enquadramento</strong>
              <Button data-nav aria-pressed={fitMode==="preserve"} onClick={()=>setSetting("wallpaper.fitMode","preserve")}>Arte completa</Button>
              <Button data-nav aria-pressed={fitMode==="fill"} onClick={()=>setSetting("wallpaper.fitMode","fill")}>Preencher tela</Button>
            </div>
            <div className="wp-settings-actions">
              <Button data-nav onClick={()=>stepWallpaper(-1,"sequential")}><ChevronLeft size={16}/>Anterior</Button>
              <Button data-nav onClick={()=>stepWallpaper(1,"sequential")}>Próxima<ChevronRight size={16}/></Button>
            </div>
          </div>}
        </aside>
      </div>
    </div>
    <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
      <DialogContent className="wp-search-dialog">
        <DialogTitle>Buscar wallpapers</DialogTitle>
        <DialogDescription>Digite o título ou gênero. O teclado só aparece após pressionar OK em Buscar.</DialogDescription>
        <input autoFocus aria-label="Digite o título ou gênero" className="wp-search-input" value={query}
          onChange={e=>{setQuery(e.target.value);resetList();}}
          onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();setSearchOpen(false);}}}
          placeholder="Nome do anime, filme, série ou jogo"/>
        <Button data-nav onClick={()=>setSearchOpen(false)}>Ver resultados</Button>
      </DialogContent>
    </Dialog>
    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
      <DialogContent className="wp-modal">
        <DialogTitle>{activePreview.title}</DialogTitle>
        <DialogDescription>Visualização ampliada · {activePreview.kind}</DialogDescription>
        <div className="wp-modal-art"><Artwork wallpaper={activePreview} className="wp-preview-image"/></div>
        <div className="wp-modal-actions">
          {activePreview.variants.map((v,i)=><Button data-nav key={i} variant="outline" onClick={()=>setState(s=>({wallpaperAlt:{...s.wallpaperAlt,[activePreview.id]:i}}))}>{v.label}</Button>)}
        </div>
        <Button data-nav onClick={()=>{apply(activePreview);setPreviewOpen(false);}}>Aplicar na tela</Button>
      </DialogContent>
    </Dialog>
  </Shell>;
}

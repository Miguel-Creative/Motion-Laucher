/** Fast proportion-only image intelligence: no model download, GPU inference or generative edits. */
export type WallpaperLayout="cover"|"composite";
/** Preserve portrait/square/near-square source images without cropping faces/logos. */
export function chooseWallpaperLayout(width:number,height:number):WallpaperLayout{
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return "cover";
 const aspect = width/height;
 // Panoramas wider than 2.1:1 also need preservation, not destructive crops.
 return aspect<1.55||aspect>2.10?"composite":"cover";
}

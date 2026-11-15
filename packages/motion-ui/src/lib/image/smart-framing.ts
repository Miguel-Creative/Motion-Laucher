/** Fast proportion-only image intelligence: no model download, GPU inference or generative edits. */
export type WallpaperLayout="cover"|"composite";
/** Preserve portrait/square/near-square source images without cropping faces/logos. */
export function chooseWallpaperLayout(width:number,height:number):WallpaperLayout{
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)return "cover";
 return width/height<1.48?"composite":"cover";
}

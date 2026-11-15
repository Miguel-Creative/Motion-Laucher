import type { Wallpaper } from "@/data/wallpapers";

/** A content's original release date, never the date a wallpaper was uploaded.
 * Compare date-only values to the viewer's calendar day, rather than UTC instants.
 * At midnight a release is already "Lançado em" and does not stay "Estreia".
 */
export function formatReleaseDate(wallpaper: Pick<Wallpaper, "kind" | "releaseDate" | "year">, today = new Date()): string {
  const upcomingLabel = wallpaper.kind === "Jogos" ? "Lançamento" : "Estreia";
  const todayNumber = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const raw = wallpaper.releaseDate;
  if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [year, month, day] = raw.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day) {
      const label = year * 10000 + month * 100 + day > todayNumber ? upcomingLabel : "Lançado em";
      return label + ": " + String(day).padStart(2, "0") + "/" + String(month).padStart(2, "0") + "/" + year;
    }
  }
  if (wallpaper.year >= 1900 && wallpaper.year <= 2100) {
    if (wallpaper.year < today.getFullYear()) return "Lançado em: " + wallpaper.year;
    if (wallpaper.year > today.getFullYear()) return upcomingLabel + ": " + wallpaper.year;
    // The release year is current, but we do not know whether it has already premiered.
    return "Ano de lançamento: " + wallpaper.year;
  }
  return "Data de lançamento a confirmar";
}

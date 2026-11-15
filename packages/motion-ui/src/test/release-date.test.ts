import { describe, it, expect } from "vitest";
import { safeReleaseDate } from "../../../../apps/catalog-worker/index";
import { formatReleaseDate } from "@/lib/catalog/format-release";

describe("datas dos conteúdos: lançado versus estreia", () => {
  const today = new Date(2026, 10, 15, 12, 0, 0); // 15 November 2026 in device's local calendar

  it("shows Lançado em for already premiered movies", () => {
    expect(safeReleaseDate("2025-07-03")).toBe("2025-07-03");
    expect(formatReleaseDate({kind:"Filmes",year:2025,releaseDate:"2025-07-03"},today)).toBe("Lançado em: 03/07/2025");
  });
  it("shows Lançado em for past games, series and anime", () => {
    for (const kind of ["Jogos","Séries","Anime"] as const) {
      expect(formatReleaseDate({kind,year:2024,releaseDate:"2024-01-07"},today)).toBe("Lançado em: 07/01/2024");
    }
  });
  it("shows Estreia for future movie, series and anime, Lançamento for future game", () => {
    for (const kind of ["Filmes","Séries","Anime"] as const) {
      expect(formatReleaseDate({kind,year:2027,releaseDate:"2027-02-09"},today)).toBe("Estreia: 09/02/2027");
    }
    expect(formatReleaseDate({kind:"Jogos",year:2026,releaseDate:"2026-12-18"},today)).toBe("Lançamento: 18/12/2026");
  });
  it("counts a title as released on its release day", () => {
    expect(formatReleaseDate({kind:"Anime",year:2026,releaseDate:"2026-11-15"},today)).toBe("Lançado em: 15/11/2026");
  });
  it("does not classify already-released content as an upcoming premiere", () => {
    expect(formatReleaseDate({kind:"Anime",year:1999,releaseDate:"1999-10-20"},today)).toBe("Lançado em: 20/10/1999");
    expect(formatReleaseDate({kind:"Anime",year:2024,releaseDate:"2024-01-07"},today)).toBe("Lançado em: 07/01/2024");
  });
  it("uses only the precision known for year-only dates", () => {
    expect(safeReleaseDate("2025")).toBeUndefined();
    expect(formatReleaseDate({kind:"Séries",year:2024},today)).toBe("Lançado em: 2024");
    expect(formatReleaseDate({kind:"Filmes",year:2027},today)).toBe("Estreia: 2027");
    expect(formatReleaseDate({kind:"Jogos",year:2026},today)).toBe("Ano de lançamento: 2026");
    expect(formatReleaseDate({kind:"Anime",year:0},today)).toBe("Data de lançamento a confirmar");
  });
  it("rejects impossible calendar dates", () => {
    expect(safeReleaseDate("2026-02-30")).toBeUndefined();
    expect(safeReleaseDate("2026-13-01")).toBeUndefined();
    expect(safeReleaseDate("2026-01-00")).toBeUndefined();
  });
});

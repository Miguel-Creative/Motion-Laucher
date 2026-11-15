import {describe,it,expect} from "vitest";
import {safeReleaseDate} from "../../../../apps/catalog-worker/index";
import {formatReleaseDate} from "@/lib/catalog/format-release";

describe("datas dos conteúdos, sem inventar precisão",()=>{
 const today=new Date("2026-11-15T12:00:00Z");
 it("displays real complete cinema release date",()=>{
  expect(safeReleaseDate("2025-07-03")).toBe("2025-07-03");
  expect(formatReleaseDate({kind:"Filmes",year:2025,releaseDate:"2025-07-03"},today)).toBe("Estreia: 03/07/2025");
 });
 it("displays game release with correct label",()=>{
  expect(formatReleaseDate({kind:"Jogos",year:2025,releaseDate:"2025-12-18"},today)).toBe("Lançamento: 18/12/2025");
 });
 it("indicates upcoming content rather than suggesting it already premiered",()=>{
  expect(formatReleaseDate({kind:"Anime",year:2027,releaseDate:"2027-02-09"},today)).toBe("Estreia prevista: 09/02/2027");
 });
 it("does not invent a day for year-only or missing dates",()=>{
  expect(safeReleaseDate("2025")).toBeUndefined();
  expect(formatReleaseDate({kind:"Séries",year:2024},today)).toBe("Estreia: 2024");
  expect(formatReleaseDate({kind:"Anime",year:0},today)).toBe("Estreia: a confirmar");
 });
 it("rejects invalid dates",()=>{
  expect(safeReleaseDate("2026-02-30")).toBeUndefined();
  expect(safeReleaseDate("2026-13-01")).toBeUndefined();
  expect(safeReleaseDate("2026-01-00")).toBeUndefined();
 });
});

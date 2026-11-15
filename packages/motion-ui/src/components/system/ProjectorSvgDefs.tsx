import { toneTable, useProjector } from "@/lib/projector";

/** Global SVG filter referenced by artwork: gamma + shadow detail + vibrance (approximation). */
export function ProjectorSvgDefs() {
  const p = useProjector();
  const table = toneTable(p.gamma, p.shadowDetail);
  const vib = 1 + (p.vibrance / 100) * 0.35;
  return (
    <svg aria-hidden width="0" height="0" style={{ position: "absolute" }}>
      <filter id="ml-projector" colorInterpolationFilters="sRGB">
        <feComponentTransfer>
          <feFuncR type="table" tableValues={table} />
          <feFuncG type="table" tableValues={table} />
          <feFuncB type="table" tableValues={table} />
        </feComponentTransfer>
        <feColorMatrix type="saturate" values={vib.toFixed(3)} />
      </filter>
    </svg>
  );
}

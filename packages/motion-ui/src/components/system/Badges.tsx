import { FlaskConical, PlugZap, Ban, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AVAILABILITY_LABEL, type Availability } from "@/lib/settings-schema";

const STYLE: Record<Availability, string> = {
  local: "bg-success/15 text-success border-success/30",
  demo: "bg-warning/15 text-warning border-warning/35",
  ponte: "bg-info/15 text-info border-info/35",
  indisponivel: "bg-muted text-muted-foreground border-border",
};
const ICON = { local: CheckCircle2, demo: FlaskConical, ponte: PlugZap, indisponivel: Ban };

export function AvailabilityBadge({ value, className }: { value: Availability; className?: string }) {
  const Icon = ICON[value];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide", STYLE[value], className)}>
      <Icon className="size-3" aria-hidden />
      {AVAILABILITY_LABEL[value]}
    </span>
  );
}

export function DemoBadge({ className, label = "Demonstração" }: { className?: string; label?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/15 px-2 py-0.5 text-[0.68rem] font-bold uppercase tracking-wider text-warning", className)}>
      <FlaskConical className="size-3" aria-hidden />
      {label}
    </span>
  );
}

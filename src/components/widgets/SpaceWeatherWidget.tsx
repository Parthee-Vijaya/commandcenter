"use client";
import { usePoll } from "@/hooks/usePoll";
import { Card } from "@/components/ui/Card";
import type { SpaceWeatherData } from "@/lib/types";

const AURORA_COLOR: Record<SpaceWeatherData["auroraChance"], string> = {
  low: "text-neutral-400",
  moderate: "text-cyan-300",
  high: "text-emerald-300",
  severe: "text-fuchsia-400",
};

const AURORA_LABEL: Record<SpaceWeatherData["auroraChance"], string> = {
  low: "Lav",
  moderate: "Moderat",
  high: "Høj",
  severe: "Meget høj",
};

function KpBar({ kp }: { kp: number | null }) {
  const bars = 9;
  const filled = kp != null ? Math.min(bars, Math.round(kp)) : 0;
  return (
    <div className="flex items-end gap-[2px] h-5">
      {Array.from({ length: bars }).map((_, i) => {
        const h = 30 + i * 8;
        const active = i < filled;
        const color =
          i < 4
            ? "bg-cyan-400/70"
            : i < 7
            ? "bg-amber-400/80"
            : "bg-fuchsia-400/80";
        return (
          <div
            key={i}
            className={`w-[4px] rounded-sm transition-colors ${active ? color : "bg-neutral-800"}`}
            style={{ height: `${h}%` }}
          />
        );
      })}
    </div>
  );
}

export function SpaceWeatherWidget() {
  const { data } = usePoll<SpaceWeatherData>("/api/space", 5 * 60_000);

  return (
    <Card title="Rumvejr" className="sm:col-span-1 lg:col-span-2">
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <KpBar kp={data?.kpIndex ?? null} />
          <div>
            <div className="text-2xl font-light tabular-nums text-cyan-300">
              {data?.kpIndex?.toFixed(1) ?? "—"}
            </div>
            <div className="text-[9px] text-neutral-500 uppercase tracking-[0.2em]">Kp-indeks</div>
          </div>
        </div>

        <div className="pt-2 border-t border-cyan-400/10 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Aurora</span>
            <span className={AURORA_COLOR[data?.auroraChance ?? "low"]}>
              {AURORA_LABEL[data?.auroraChance ?? "low"]}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Solvind</span>
            <span className="font-mono tabular-nums text-neutral-300">
              {data?.solarWindKmS != null ? `${data.solarWindKmS} km/s` : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Røntgen</span>
            <span className="font-mono text-neutral-300">{data?.xrayClass ?? "—"}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

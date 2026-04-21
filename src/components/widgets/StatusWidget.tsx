"use client";
import { usePoll } from "@/hooks/usePoll";
import { Card } from "@/components/ui/Card";
import { formatRate, formatUptime } from "@/lib/formatters";
import type { SystemData } from "@/lib/types";

function ActivityBar({ load, cores }: { load: number; cores: number }) {
  const cells = 14;
  const filled = Math.round((load / 100) * cells);
  return (
    <div className="flex items-center gap-[2px]" title={`CPU load · ${cores} cores`}>
      {Array.from({ length: cells }).map((_, i) => {
        const active = i < filled;
        const hot = i >= cells - 3 && active;
        return (
          <div
            key={i}
            className={`w-[5px] h-3 rounded-[1px] transition-colors ${
              active
                ? hot
                  ? "bg-rose-400/80"
                  : i >= cells - 6
                  ? "bg-amber-400/70"
                  : "bg-emerald-400/70"
                : "bg-neutral-800"
            }`}
          />
        );
      })}
    </div>
  );
}

export function StatusWidget() {
  const { data, isStale } = usePoll<SystemData>("/api/system", 2000);

  const powerLabel = data?.power.source === "ac"
    ? "AC"
    : data?.power.source === "battery"
    ? `Bat ${data.battery.percent ?? ""}${data.battery.percent ? "%" : ""}`.trim()
    : "—";
  const powerColor = data?.power.thermalWarning
    ? "text-rose-400"
    : data?.power.source === "ac"
    ? "text-emerald-400"
    : "text-neutral-400";

  const tempText = data?.temperature != null ? `${data.temperature}°C` : "—";

  return (
    <Card
      title="Status"
      className="sm:col-span-2 lg:col-span-2"
      action={
        <span className="text-[10px] text-neutral-500 font-mono truncate max-w-[140px]">
          {isStale ? <span className="text-amber-500">stale</span> : data?.host.hostname?.split("-")[0]}
        </span>
      }
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Oppetid</span>
          <span className="text-sm font-light tabular-nums text-neutral-100">
            {data ? formatUptime(data.host.uptime) : "—"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Load · proc</span>
          <span className="text-xs font-mono tabular-nums text-neutral-300">
            {data
              ? `${data.loadAvg[0].toFixed(2)} · ${data.loadAvg[1].toFixed(2)} · ${data.loadAvg[2].toFixed(2)}`
              : "—"}
            <span className="text-neutral-600 ml-1.5">· {data?.processes.total ?? "—"}</span>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Strøm · temp</span>
          <span className="text-xs flex items-center gap-1.5">
            <span className={powerColor}>
              {data?.power.thermalWarning && <span className="mr-0.5">⚠</span>}
              {powerLabel}
            </span>
            <span className="text-neutral-600">·</span>
            <span className="text-neutral-400 font-mono">{tempText}</span>
          </span>
        </div>

        <div className="pt-2 border-t border-neutral-800 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 uppercase tracking-wider">CPU puls</span>
            <ActivityBar load={data?.cpu.load ?? 0} cores={data?.cpu.cores ?? 0} />
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-neutral-400">↓ {data ? formatRate(data.network.rxSec) : "—"}</span>
            <span className="font-mono text-neutral-400">↑ {data ? formatRate(data.network.txSec) : "—"}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

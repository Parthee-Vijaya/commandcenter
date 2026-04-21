"use client";
import { usePoll } from "@/hooks/usePoll";
import { Card } from "@/components/ui/Card";
import type { TrafficData, TrafficIncident } from "@/lib/types";

const LAYERS = [
  { key: "current-roadblocks", label: "Spærret", color: "bg-rose-400", text: "text-rose-400" },
  { key: "current-blocking-roadwork", label: "Vejarbejde spær.", color: "bg-amber-400", text: "text-amber-400" },
  { key: "current-queue", label: "Kø", color: "bg-orange-400", text: "text-orange-400" },
  { key: "current-other-traffic-announcements", label: "Trafik", color: "bg-sky-400", text: "text-sky-400" },
  { key: "current-roadwork", label: "Vejarbejde", color: "bg-neutral-400", text: "text-neutral-400" },
];

function LAYER_LABEL(key: string): string {
  return LAYERS.find((l) => l.key === key)?.label ?? key;
}

function LAYER_TEXT(key: string): string {
  return LAYERS.find((l) => l.key === key)?.text ?? "text-neutral-400";
}

// Super-simplified Denmark outline (Jylland + Fyn + Sjælland as stylized shapes).
// Not a geo-accurate map — just a visual anchor to signal "DK traffic".
function DenmarkMap({ severity }: { severity: number }) {
  // severity 0..1 controls pulse intensity of the dot
  const pulse = Math.min(1, severity);
  const dotColor =
    severity === 0
      ? "#22c55e" // green – ok
      : severity < 0.3
      ? "#38bdf8" // sky
      : severity < 0.7
      ? "#f59e0b" // amber
      : "#f43f5e"; // rose

  return (
    <svg viewBox="0 0 120 70" className="w-full h-24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="dkGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={dotColor} stopOpacity="0.5" />
          <stop offset="100%" stopColor={dotColor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Jylland */}
      <path
        d="M35,8 Q28,6 25,14 Q22,22 25,32 Q23,40 26,48 Q30,58 38,62 Q44,64 48,58 Q52,54 50,46 Q54,38 50,30 Q52,22 48,16 Q44,10 35,8 Z"
        fill="#0d1518"
        stroke="#00d9ff"
        strokeOpacity="0.3"
        strokeWidth="0.7"
      />
      {/* Fyn */}
      <ellipse cx="66" cy="40" rx="10" ry="7" fill="#0d1518" stroke="#00d9ff" strokeOpacity="0.3" strokeWidth="0.7" />
      {/* Sjælland */}
      <path
        d="M82,26 Q88,24 96,28 Q102,34 100,42 Q96,50 88,50 Q82,48 80,42 Q78,32 82,26 Z"
        fill="#0d1518"
        stroke="#00d9ff"
        strokeOpacity="0.3"
        strokeWidth="0.7"
      />
      {/* Bornholm */}
      <circle cx="112" cy="50" r="2.5" fill="#0d1518" stroke="#00d9ff" strokeOpacity="0.3" strokeWidth="0.5" />

      {/* Activity glow + pulse dot somewhere central */}
      {severity > 0 && (
        <>
          <circle cx="68" cy="38" r="18" fill="url(#dkGlow)">
            <animate attributeName="r" values="12;22;12" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="68" cy="38" r="2" fill={dotColor}>
            <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      {severity === 0 && <circle cx="68" cy="38" r="2" fill="#22c55e" opacity="0.8" />}
    </svg>
  );
}

function Row({ inc }: { inc: TrafficIncident }) {
  return (
    <div className="text-xs leading-snug py-0.5">
      <span className={`font-mono text-[10px] mr-2 ${LAYER_TEXT(inc.layer)}`}>
        {LAYER_LABEL(inc.layer)}
      </span>
      <span className="text-neutral-300">{inc.header}</span>
    </div>
  );
}

export function TrafficWidget() {
  const { data } = usePoll<TrafficData>("/api/traffic", 5 * 60_000);

  const incidents = data?.incidents ?? [];
  const total = data?.total ?? 0;

  // Count incidents by layer
  const counts: Record<string, number> = {};
  for (const inc of incidents) {
    counts[inc.layer] = (counts[inc.layer] ?? 0) + 1;
  }
  const barTotal = Math.max(1, incidents.length);

  // Severity: roadblocks + queue get weight 1, others weight 0.5
  const severity =
    Math.min(
      1,
      ((counts["current-roadblocks"] ?? 0) * 1 +
        (counts["current-blocking-roadwork"] ?? 0) * 0.8 +
        (counts["current-queue"] ?? 0) * 0.6 +
        (counts["current-other-traffic-announcements"] ?? 0) * 0.3) /
        4
    );

  return (
    <Card
      title="Trafik · DK"
      className="sm:col-span-2 lg:col-span-3"
      action={
        <span className="text-[10px] font-mono text-cyan-400/60">
          {total} aktive
        </span>
      }
    >
      <DenmarkMap severity={severity} />

      {/* Stacked bar of incident categories */}
      {incidents.length > 0 && (
        <div className="mt-2">
          <div className="w-full h-2 flex rounded-full overflow-hidden bg-neutral-800/60">
            {LAYERS.map((l) => {
              const n = counts[l.key] ?? 0;
              if (n === 0) return null;
              return (
                <div
                  key={l.key}
                  className={`${l.color} transition-all duration-500`}
                  style={{ width: `${(n / barTotal) * 100}%` }}
                  title={`${l.label}: ${n}`}
                />
              );
            })}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[9px] font-mono">
            {LAYERS.map((l) => {
              const n = counts[l.key] ?? 0;
              if (n === 0) return null;
              return (
                <span key={l.key} className={l.text}>
                  ● <span className="text-neutral-400">{l.label}</span> {n}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Incident list */}
      <div className="mt-3 pt-3 border-t border-cyan-400/10 space-y-0.5">
        {data?.error ? (
          <div className="text-xs text-rose-400/70">{data.error}</div>
        ) : incidents.length === 0 ? (
          <div className="text-xs text-neutral-500">Ingen alvorlige hændelser</div>
        ) : (
          incidents.slice(0, 3).map((inc, i) => <Row key={i} inc={inc} />)
        )}
      </div>
    </Card>
  );
}

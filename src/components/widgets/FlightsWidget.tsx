"use client";
import { usePoll } from "@/hooks/usePoll";
import { Card } from "@/components/ui/Card";
import type { FlightsData, FlightItem } from "@/lib/types";

function compassLabel(deg: number): string {
  const dirs = ["N", "NØ", "Ø", "SØ", "S", "SV", "V", "NV"];
  return dirs[Math.round(deg / 45) % 8];
}

function FlightRow({ f }: { f: FlightItem }) {
  return (
    <div className="flex items-center gap-2 text-xs py-1">
      <span
        className="text-cyan-300 inline-block transition-transform"
        style={{ transform: `rotate(${f.heading}deg)` }}
        title={`Retning ${f.heading}°`}
      >
        ✈
      </span>
      <span className="font-mono text-neutral-200 w-16 truncate">{f.callsign}</span>
      <span className="font-mono text-neutral-500 tabular-nums w-12 text-right">
        {f.altitudeKm.toFixed(1)}km
      </span>
      <span className="font-mono text-neutral-500 tabular-nums w-12 text-right">
        {f.speedKmh}
      </span>
      <span className="ml-auto text-[10px] font-mono text-cyan-400/70">
        {f.distanceKm.toFixed(0)}km {compassLabel(f.bearing)}
      </span>
    </div>
  );
}

export function FlightsWidget() {
  const { data } = usePoll<FlightsData>("/api/flights", 30_000);
  const flights = data?.flights ?? [];

  return (
    <Card
      title={`Fly · ${data?.radiusKm ?? 50}km`}
      className="sm:col-span-2 lg:col-span-2"
      action={
        <span className="text-[10px] font-mono text-cyan-400/60">
          {data?.count ?? 0} over
        </span>
      }
    >
      {data?.error ? (
        <div className="text-xs text-rose-400/70">{data.error}</div>
      ) : flights.length === 0 ? (
        <div className="text-xs text-neutral-500">Ingen fly inden for radius</div>
      ) : (
        <div className="divide-y divide-cyan-400/5">
          {flights.slice(0, 6).map((f, i) => (
            <FlightRow key={`${f.callsign}-${i}`} f={f} />
          ))}
        </div>
      )}
    </Card>
  );
}

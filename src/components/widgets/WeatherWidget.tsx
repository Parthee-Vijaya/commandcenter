"use client";
import { usePoll } from "@/hooks/usePoll";
import { Card } from "@/components/ui/Card";
import type { WeatherData, TrafficData } from "@/lib/types";
import { weatherEmoji, weatherLabel } from "@/lib/formatters";

const LAYER_LABEL: Record<string, string> = {
  "current-roadblocks": "Spærret",
  "current-blocking-roadwork": "Vejarbejde (spærret)",
  "current-queue": "Kø",
  "current-other-traffic-announcements": "Trafik",
  "current-roadwork": "Vejarbejde",
};

const LAYER_COLOR: Record<string, string> = {
  "current-roadblocks": "text-rose-400",
  "current-blocking-roadwork": "text-amber-400",
  "current-queue": "text-orange-400",
  "current-other-traffic-announcements": "text-sky-400",
  "current-roadwork": "text-neutral-400",
};

export function WeatherWidget() {
  const { data } = usePoll<WeatherData>("/api/weather", 10 * 60_000);
  const { data: traffic } = usePoll<TrafficData>("/api/traffic", 5 * 60_000);

  if (!data) {
    return (
      <Card title="Vejr" className="sm:col-span-2 lg:col-span-3">
        <div className="text-neutral-500 text-sm">Indlæser...</div>
      </Card>
    );
  }

  return (
    <Card
      title="Vejr"
      className="sm:col-span-2 lg:col-span-3"
      action={<span className="text-xs text-neutral-500">{data.location}</span>}
    >
      <div className="flex items-baseline gap-3">
        <span className="text-3xl">{weatherEmoji(data.current.weatherCode)}</span>
        <span className="text-5xl font-thin tabular-nums">
          {Math.round(data.current.temp)}°
        </span>
        <span className="text-xs text-neutral-500 ml-auto font-mono">
          vind {Math.round(data.current.windSpeed)} m/s · fugt {data.current.humidity}%
        </span>
      </div>
      <div className="text-sm text-neutral-400 mt-1">
        {weatherLabel(data.current.weatherCode)} · føles som {Math.round(data.current.feelsLike)}°
      </div>
      <div className="mt-4 grid grid-cols-6 gap-1 text-center">
        {data.hourly.slice(0, 6).map((h) => (
          <div key={h.time} className="text-xs">
            <div className="text-neutral-500 font-mono">
              {new Date(h.time).getHours().toString().padStart(2, "0")}
            </div>
            <div className="my-0.5">{weatherEmoji(h.weatherCode)}</div>
            <div className="tabular-nums">{Math.round(h.temp)}°</div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
        <span className="text-amber-400/80">☀ {data.sun.sunrise}</span>
        <span className="text-neutral-500">
          {Math.floor(data.sun.dayLengthMinutes / 60)}t {data.sun.dayLengthMinutes % 60}m dagslys
        </span>
        <span className="text-indigo-400/80">🌙 {data.sun.sunset}</span>
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-800">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Trafik · DK</span>
          <span className="text-[10px] text-neutral-500 font-mono">
            {traffic ? `${traffic.total} aktive` : "—"}
          </span>
        </div>
        {traffic?.error ? (
          <div className="text-xs text-rose-400/70">{traffic.error}</div>
        ) : (traffic?.incidents.length ?? 0) === 0 ? (
          <div className="text-xs text-neutral-500">Ingen alvorlige hændelser</div>
        ) : (
          <div className="space-y-1">
            {traffic?.incidents.slice(0, 3).map((inc, i) => (
              <div key={i} className="text-xs leading-snug">
                <span className={`font-mono text-[10px] ${LAYER_COLOR[inc.layer] ?? "text-neutral-500"} mr-2`}>
                  {LAYER_LABEL[inc.layer] ?? inc.layer}
                </span>
                <span className="text-neutral-300">{inc.header}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

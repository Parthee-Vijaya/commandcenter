"use client";
import { usePoll } from "@/hooks/usePoll";
import { Card } from "@/components/ui/Card";
import type { WeatherData, MoonData } from "@/lib/types";
import { weatherEmoji, weatherLabel } from "@/lib/formatters";

function MoonDisc({ phase, illumination }: { phase: number; illumination: number }) {
  const size = 52;
  const r = size / 2 - 1;
  const cx = size / 2;
  const cy = size / 2;
  const waxing = phase <= 0.5;
  const rx = r * Math.abs(1 - 2 * illumination);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <radialGradient id="mDiscBright" cx="0.4" cy="0.4" r="0.7">
          <stop offset="0%" stopColor="#f5f3e8" />
          <stop offset="100%" stopColor="#b8b4a0" />
        </radialGradient>
        <clipPath id="mDiscClip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="url(#mDiscBright)" />
      <g clipPath="url(#mDiscClip)">
        {illumination < 0.999 &&
          (waxing ? (
            <>
              <rect x={0} y={0} width={cx} height={size} fill="#0a0d10" />
              <ellipse cx={cx} cy={cy} rx={rx} ry={r} fill={illumination < 0.5 ? "#0a0d10" : "url(#mDiscBright)"} />
            </>
          ) : (
            <>
              <rect x={cx} y={0} width={cx} height={size} fill="#0a0d10" />
              <ellipse cx={cx} cy={cy} rx={rx} ry={r} fill={illumination < 0.5 ? "#0a0d10" : "url(#mDiscBright)"} />
            </>
          ))}
      </g>
    </svg>
  );
}

function daysUntil(iso: string | undefined): string {
  if (!iso) return "—";
  const days = Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "i dag";
  if (days === 1) return "1 dag";
  return `${days} dage`;
}

export function WeatherWidget() {
  const { data } = usePoll<WeatherData>("/api/weather", 10 * 60_000);
  const { data: moon } = usePoll<MoonData>("/api/moon", 60 * 60_000);

  if (!data) {
    return (
      <Card title="Vejr · Måne" className="sm:col-span-2 lg:col-span-3">
        <div className="text-neutral-500 text-sm">Indlæser...</div>
      </Card>
    );
  }

  return (
    <Card
      title="Vejr · Måne"
      className="sm:col-span-2 lg:col-span-3"
      action={<span className="text-xs text-neutral-500 truncate max-w-[100px]">{data.location}</span>}
    >
      {/* Top: temperature + moon side by side */}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl">{weatherEmoji(data.current.weatherCode)}</span>
            <span className="text-5xl font-thin tabular-nums text-cyan-50">
              {Math.round(data.current.temp)}°
            </span>
          </div>
          <div className="text-xs text-neutral-400 mt-1">
            {weatherLabel(data.current.weatherCode)} · føles {Math.round(data.current.feelsLike)}°
          </div>
          <div className="text-[10px] text-neutral-500 font-mono mt-1">
            vind {Math.round(data.current.windSpeed)} m/s · fugt {data.current.humidity}%
          </div>
        </div>
        <div className="flex flex-col items-center shrink-0 pt-1">
          <MoonDisc phase={moon?.phase ?? 0} illumination={moon?.illumination ?? 0} />
          <div className="text-[9px] text-neutral-400 mt-1 text-center leading-tight max-w-[72px]">
            {moon?.name ?? "—"}
          </div>
          <div className="text-[9px] font-mono text-neutral-500">
            {moon ? `${Math.round(moon.illumination * 100)}%` : ""}
          </div>
        </div>
      </div>

      {/* Hourly forecast */}
      <div className="mt-4 grid grid-cols-6 gap-1 text-center">
        {data.hourly.slice(0, 6).map((h) => (
          <div key={h.time} className="text-xs">
            <div className="text-neutral-500 font-mono text-[10px]">
              {new Date(h.time).getHours().toString().padStart(2, "0")}
            </div>
            <div className="my-0.5">{weatherEmoji(h.weatherCode)}</div>
            <div className="tabular-nums text-[11px]">{Math.round(h.temp)}°</div>
          </div>
        ))}
      </div>

      {/* Sun + moon events */}
      <div className="mt-3 pt-3 border-t border-cyan-400/10 grid grid-cols-4 gap-2 text-[10px] font-mono">
        <div>
          <div className="text-neutral-500 text-[9px] uppercase tracking-wider">Op</div>
          <div className="text-amber-300/90">☀ {data.sun.sunrise}</div>
        </div>
        <div>
          <div className="text-neutral-500 text-[9px] uppercase tracking-wider">Ned</div>
          <div className="text-indigo-300/90">🌙 {data.sun.sunset}</div>
        </div>
        <div>
          <div className="text-neutral-500 text-[9px] uppercase tracking-wider">Fuldmåne</div>
          <div className="text-cyan-300">{daysUntil(moon?.nextFullMoon)}</div>
        </div>
        <div>
          <div className="text-neutral-500 text-[9px] uppercase tracking-wider">Nymåne</div>
          <div className="text-cyan-300">{daysUntil(moon?.nextNewMoon)}</div>
        </div>
      </div>
    </Card>
  );
}

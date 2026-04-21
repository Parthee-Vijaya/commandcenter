"use client";
import { useEffect, useState } from "react";
import { FAKE, SPARK_CPU, SPARK_MEM } from "../_fakes";

function useTween(target: number, duration = 600) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const from = v;
    const animate = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(from + (target - from) * eased);
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return v;
}

function RadialGauge({
  value,
  max = 100,
  label,
  unit = "%",
  color = "#38bdf8",
  size = 120,
}: {
  value: number;
  max?: number;
  label: string;
  unit?: string;
  color?: string;
  size?: number;
}) {
  const tweened = useTween(value);
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(1, tweened / max);
  return (
    <div className="relative flex flex-col items-center" style={{ width: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a1a1a" strokeWidth="6" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#grad-${label})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-thin tabular-nums text-neutral-100">{tweened.toFixed(0)}</span>
        <span className="text-[10px] text-neutral-500">{unit}</span>
      </div>
      <div className="text-[10px] uppercase tracking-widest text-neutral-500 mt-2">{label}</div>
    </div>
  );
}

function GradientArea({ data, color = "#38bdf8", height = 60 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(" ");
  const id = `gAreaC-${color.slice(1)}`;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.5" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${id})`} points={`0,100 ${pts} 100,100`} />
      <polyline fill="none" stroke={color} strokeWidth="1.8" points={pts} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function SymCard({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative rounded-2xl bg-[#141414] border border-[#262626] hover:border-[#404040] transition-colors p-5 ${className}`}>
      <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-sky-400 sym-pulse" />
      {title && <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium mb-3">{title}</div>}
      {children}
    </div>
  );
}

export default function MockupC() {
  const cpu = useTween(FAKE.cpu.load);
  const mem = useTween(FAKE.memory.percent);
  const disk = useTween(FAKE.disk.percent);
  const bat = useTween(FAKE.battery.percent);

  // 24h heatmap fake values
  const heat = Array.from({ length: 24 }, (_, h) => Math.round(Math.sin((h - 3) * 0.4) * 30 + 45 + ((h * 13) % 20)));

  return (
    <div className="min-h-screen text-neutral-200">
      <style>{`
        @keyframes symPulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.5); } }
        .sym-pulse { animation: symPulse 3s ease-in-out infinite; box-shadow: 0 0 6px #38bdf8; }
      `}</style>

      {/* APOD hero */}
      <div
        className="relative h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${FAKE.apod.imageUrl})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a]" />
        <div className="absolute inset-0 backdrop-blur-[2px]" style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 100%)" }} />
        <div className="relative max-w-[1800px] mx-auto px-6 h-full flex flex-col justify-end pb-4">
          <div className="text-[10px] text-sky-300 uppercase tracking-[0.3em] mb-1">NASA · {FAKE.apod.date}</div>
          <div className="text-2xl font-light text-neutral-100">{FAKE.apod.title}</div>
          <div className="text-xs text-neutral-400 mt-1 max-w-xl">{FAKE.apod.explanation}</div>
        </div>
      </div>

      <main className="max-w-[1800px] mx-auto px-6 py-4 space-y-3">
        {/* 24h activity heatmap strip */}
        <div className="rounded-2xl bg-[#141414] border border-[#262626] p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">24 timers aktivitet</span>
            <span className="text-[10px] text-neutral-600 font-mono">Nu · {FAKE.time.hhmm}</span>
          </div>
          <div className="flex items-center gap-[3px]">
            {heat.map((v, i) => {
              const intensity = v / 100;
              const color =
                intensity > 0.75 ? "#f43f5e" : intensity > 0.55 ? "#fbbf24" : intensity > 0.3 ? "#34d399" : "#1f2937";
              return (
                <div
                  key={i}
                  className="flex-1 h-6 rounded-sm transition-all hover:scale-110"
                  style={{ background: color, opacity: 0.3 + intensity * 0.7 }}
                  title={`${i}:00 · ${v}% load`}
                />
              );
            })}
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] text-neutral-600 font-mono">
            <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
          </div>
        </div>

        {/* Radial gauges row */}
        <div className="grid grid-cols-6 gap-3">
          <SymCard className="col-span-2 flex items-center justify-around" title="Systemkerne">
            <RadialGauge value={cpu} label="CPU" color="#38bdf8" size={100} />
            <RadialGauge value={mem} label="RAM" color="#a78bfa" size={100} />
          </SymCard>

          <SymCard className="col-span-2 flex items-center justify-around" title="Ressourcer">
            <RadialGauge value={disk} label="Disk" color="#fbbf24" size={100} />
            <RadialGauge value={bat} label="Bat" color="#34d399" size={100} />
          </SymCard>

          <SymCard className="col-span-2" title="Power · live">
            <div className="flex items-center justify-between">
              <RadialGauge value={FAKE.power.watts} max={100} unit="W" label="Watt" color="#fb7185" size={110} />
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between gap-4"><span className="text-neutral-500">Kilde</span><span className="text-emerald-300">AC</span></div>
                <div className="flex justify-between gap-4"><span className="text-neutral-500">Temp</span><span className="font-mono">{FAKE.cpu.temp}°C</span></div>
                <div className="flex justify-between gap-4"><span className="text-neutral-500">Oppetid</span><span className="font-mono">{FAKE.time.uptime}</span></div>
                <div className="flex justify-between gap-4"><span className="text-neutral-500">Proc</span><span className="font-mono">{FAKE.processCount}</span></div>
              </div>
            </div>
          </SymCard>
        </div>

        {/* Second row — weather + energy + space */}
        <div className="grid grid-cols-6 gap-3">
          <SymCard className="col-span-3" title="Vejr · måne · aurora">
            <div className="flex items-start gap-6">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-thin tabular-nums">{FAKE.weather.temp}°</span>
                  <span className="text-xs text-neutral-400">{FAKE.weather.condition}</span>
                </div>
                <div className="text-[10px] text-neutral-500 mt-1">Føles som {FAKE.weather.feelsLike}°</div>
              </div>
              <div className="flex-1 min-w-0">
                <GradientArea data={FAKE.weather.hourly} color="#38bdf8" height={60} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t border-[#262626]">
              <div>
                <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">Sol</div>
                <div className="flex justify-between text-xs"><span className="text-amber-300">☀ {FAKE.weather.sunrise}</span><span className="text-sky-300">🌙 {FAKE.weather.sunset}</span></div>
                <div className="text-[10px] text-neutral-600 mt-0.5">{FAKE.weather.dayLength}</div>
              </div>
              <div>
                <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">Måne</div>
                <div className="flex items-center gap-1.5">
                  <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="9" cy="9" r="8" fill="#1a1a1a" /><path d={`M 9 1 A 8 8 0 0 1 9 17 A ${16 * (1 - FAKE.moon.illumination)} 8 0 0 ${FAKE.moon.phase < 0.5 ? 0 : 1} 9 1`} fill="#d4d4d8" /></svg>
                  <span className="text-xs text-neutral-300">{(FAKE.moon.illumination * 100).toFixed(0)}%</span>
                </div>
                <div className="text-[10px] text-neutral-600 mt-0.5">{FAKE.moon.name}</div>
              </div>
              <div>
                <div className="text-[9px] text-neutral-500 uppercase tracking-widest mb-1">Aurora</div>
                <div className="text-xs text-amber-300">Kp {FAKE.space.kpIndex} · {FAKE.space.auroraChance}</div>
                <div className="text-[10px] text-neutral-600 mt-0.5">Sol {FAKE.space.solarWind}km/s · {FAKE.space.xrayClass}</div>
              </div>
            </div>
          </SymCard>

          <SymCard className="col-span-3" title="Elpris · CO₂ · grøn andel">
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-thin tabular-nums text-emerald-300">{FAKE.energy.priceDK2.toFixed(2)}</span>
              <span className="text-xs text-neutral-500">kr/kWh · DK2</span>
              <span className="ml-auto text-xs text-emerald-400 font-mono">↓ 12%</span>
            </div>
            <div className="mt-4">
              <GradientArea data={FAKE.energy.trend} color="#34d399" height={48} />
              <div className="flex justify-between text-[9px] text-neutral-600 mt-1 font-mono"><span>00:00</span><span>12:00</span><span>nu</span></div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#262626]">
              <div className="flex justify-between text-[10px] mb-1.5">
                <span className="text-neutral-500 uppercase tracking-wider">Mix nu</span>
                <span className="text-emerald-400 font-mono">{FAKE.energy.greenPct}% grøn · {FAKE.energy.co2GPerKwh}g CO₂</span>
              </div>
              <div className="h-2 rounded-full bg-neutral-800 overflow-hidden flex">
                <div className="bg-sky-400" style={{ width: `${FAKE.energy.windPct}%` }} />
                <div className="bg-amber-400" style={{ width: `${FAKE.energy.solarPct}%` }} />
                <div className="bg-neutral-700" style={{ width: `${100 - FAKE.energy.greenPct}%` }} />
              </div>
              <div className="mt-1.5 flex justify-between text-[10px] text-neutral-500">
                <span>💨 vind {FAKE.energy.windPct}%</span>
                <span>☀ sol {FAKE.energy.solarPct}%</span>
                <span>fossil {100 - FAKE.energy.greenPct}%</span>
              </div>
            </div>
          </SymCard>
        </div>

        {/* Third row — flights + earthquakes + lightning */}
        <div className="grid grid-cols-6 gap-3">
          <SymCard className="col-span-2" title="Luftrum · 50km">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-thin tabular-nums">{FAKE.flights.length}</span>
              <span className="text-xs text-neutral-500">fly over dig</span>
            </div>
            <div className="space-y-2">
              {FAKE.flights.map((f) => (
                <div key={f.callsign} className="relative">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-mono text-sky-300 w-14">{f.callsign}</span>
                    <span className="text-neutral-500 text-[10px] flex-1 truncate">{f.origin} → {f.dest}</span>
                    <span className="font-mono text-neutral-400">{(f.altitude / 1000).toFixed(1)}km</span>
                  </div>
                  <div className="mt-1 h-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-400/50" style={{ width: `${Math.min(100, (f.speed / 900) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </SymCard>

          <SymCard className="col-span-2" title="Jordskælv · 24t">
            <div className="flex items-baseline gap-2 mb-3">
              <span className={`text-4xl font-thin tabular-nums ${FAKE.earthquakes[0].magnitude >= 6 ? "text-rose-400" : "text-amber-300"}`}>M{FAKE.earthquakes[0].magnitude}</span>
              <span className="text-xs text-neutral-500">seneste</span>
            </div>
            <div className="space-y-2">
              {FAKE.earthquakes.map((q, i) => (
                <div key={i} className="relative">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className={`font-mono w-9 ${q.magnitude >= 5 ? "text-rose-400" : "text-amber-400"}`}>M{q.magnitude}</span>
                    <span className="text-neutral-400 flex-1 truncate">{q.place}</span>
                    <span className="text-neutral-600 font-mono">{q.timeAgo}</span>
                  </div>
                  <div className="mt-1 h-1 rounded-full overflow-hidden bg-neutral-800">
                    <div
                      className={`h-full ${q.magnitude >= 5 ? "bg-rose-400/60" : "bg-amber-400/60"}`}
                      style={{ width: `${((q.magnitude - 3) / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </SymCard>

          <SymCard className="col-span-2" title="Lyn · Danmark">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-thin tabular-nums text-amber-300">{FAKE.lightning.last1h}</span>
              <span className="text-xs text-neutral-500">/ time</span>
              <span className="ml-auto text-[10px] text-neutral-400">⚡ {FAKE.lightning.nearestKm}km {FAKE.lightning.direction}</span>
            </div>
            <GradientArea
              data={Array.from({ length: 24 }).map((_, i) => Math.round(Math.sin(i * 0.4) * 40 + 55 + ((i * 11) % 15)))}
              color="#fbbf24"
              height={50}
            />
            <div className="mt-1.5 flex justify-between text-[9px] text-neutral-600 font-mono">
              <span>24t siden</span><span className="text-neutral-500">I dag: {FAKE.lightning.totalToday}</span><span>nu</span>
            </div>
          </SymCard>
        </div>

        {/* Existing widgets */}
        <div className="grid grid-cols-6 gap-3">
          <SymCard className="col-span-2" title="CPU · historik">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-thin tabular-nums">{FAKE.cpu.load}</span>
              <span className="text-xs text-neutral-500">% · {FAKE.cpu.cores} kerner</span>
            </div>
            <GradientArea data={SPARK_CPU} color="#38bdf8" height={50} />
          </SymCard>

          <SymCard className="col-span-2" title="RAM · historik">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-thin tabular-nums">{FAKE.memory.usedGB}</span>
              <span className="text-xs text-neutral-500">/ {FAKE.memory.totalGB} GB</span>
            </div>
            <GradientArea data={SPARK_MEM} color="#a78bfa" height={50} />
          </SymCard>

          <SymCard className="col-span-2" title="Claude Code · tokens">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-thin tabular-nums">{FAKE.claude.today}</span>
              <span className="text-xs text-neutral-500">i dag</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between"><span className="text-neutral-500">Uge</span><span className="font-mono">{FAKE.claude.week}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">YTD</span><span className="font-mono">{FAKE.claude.ytd}</span></div>
            </div>
          </SymCard>
        </div>
      </main>
    </div>
  );
}

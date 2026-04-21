"use client";
import { FAKE, SPARK_CPU, SPARK_MEM } from "../_fakes";

const CYAN = "#00d9ff";

function Brackets() {
  const arm = "absolute w-3 h-3 border-cyan-400/60 pointer-events-none";
  return (
    <>
      <div className={`${arm} top-1.5 left-1.5 border-t border-l`} />
      <div className={`${arm} top-1.5 right-1.5 border-t border-r`} />
      <div className={`${arm} bottom-1.5 left-1.5 border-b border-l`} />
      <div className={`${arm} bottom-1.5 right-1.5 border-b border-r`} />
    </>
  );
}

function HoloCard({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-lg bg-[#0d1518] border border-cyan-400/20 p-5 overflow-hidden holo-card ${className}`}
      style={{ boxShadow: "0 0 0 1px rgba(0,217,255,0.05) inset, 0 4px 24px rgba(0,217,255,0.04)" }}
    >
      <Brackets />
      <div className="holo-scan pointer-events-none" />
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/70 font-medium">{title}</span>
        </div>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

function MiniSpark({ data, color = CYAN }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-8">
      <defs>
        <linearGradient id="holo-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} vectorEffect="non-scaling-stroke" />
      <polygon fill="url(#holo-grad)" points={`0,100 ${pts} 100,100`} />
    </svg>
  );
}

export default function MockupA() {
  return (
    <div className="min-h-screen text-neutral-200 holo-bg">
      <style>{`
        .holo-bg {
          background-color: #07090b;
          background-image:
            linear-gradient(rgba(0,217,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,217,255,0.03) 1px, transparent 1px);
          background-size: 32px 32px;
        }
        .holo-card:hover { transform: perspective(1000px) rotateX(1deg) rotateY(-1deg); transition: transform 400ms ease-out; border-color: rgba(0,217,255,0.45); }
        .holo-scan {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 0%, rgba(0,217,255,0.08) 50%, transparent 100%);
          height: 40%;
          animation: holoScan 8s linear infinite;
          pointer-events: none;
        }
        @keyframes holoScan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(250%); }
        }
        @keyframes holoPulse {
          0%, 100% { border-color: rgba(0,217,255,0.2); }
          50% { border-color: rgba(0,217,255,0.7); box-shadow: 0 0 24px rgba(0,217,255,0.2); }
        }
        .holo-pulse { animation: holoPulse 4s ease-in-out infinite; }
      `}</style>

      <header className="max-w-[1800px] mx-auto px-6 pt-10 pb-6 flex items-end justify-between">
        <div>
          <h1 className="text-5xl font-thin tracking-[0.3em] text-cyan-100" style={{ textShadow: "0 0 20px rgba(0,217,255,0.3)" }}>
            J.A.R.V.I.S.
          </h1>
          <p className="text-xs text-cyan-400/60 mt-2 tracking-widest uppercase">
            {FAKE.time.date} · {FAKE.time.hhmm} · System nominal
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/60">Operational</span>
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ boxShadow: "0 0 8px #00d9ff" }} />
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 pb-20 grid grid-cols-6 gap-4 auto-rows-min">
        {/* Status with Watt */}
        <HoloCard title="Status · Systemkerne" className="col-span-2 holo-pulse">
          <div className="space-y-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-thin text-cyan-100 tabular-nums">{FAKE.power.watts}</span>
              <span className="text-xs text-cyan-400/60 uppercase tracking-widest">Watt</span>
              <span className="ml-auto text-xs font-mono text-neutral-500">{FAKE.cpu.temp}°C</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div>
                <div className="text-neutral-500 uppercase tracking-wider mb-1">Load</div>
                <div className="font-mono text-cyan-100">{FAKE.cpu.load}%</div>
              </div>
              <div>
                <div className="text-neutral-500 uppercase tracking-wider mb-1">Oppetid</div>
                <div className="font-mono text-cyan-100">{FAKE.time.uptime}</div>
              </div>
              <div>
                <div className="text-neutral-500 uppercase tracking-wider mb-1">Kilde</div>
                <div className="font-mono text-emerald-400">AC · {FAKE.battery.percent}%</div>
              </div>
            </div>
            <MiniSpark data={SPARK_CPU} />
          </div>
        </HoloCard>

        {/* Weather with moon + aurora */}
        <HoloCard title="Atmosfære · Lokalt" className="col-span-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-thin text-cyan-100 tabular-nums">{FAKE.weather.temp}°</span>
            <span className="text-xs text-neutral-400">{FAKE.weather.condition}</span>
          </div>
          <div className="mt-3 flex items-center gap-2 h-6">
            {FAKE.weather.hourly.map((t, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-cyan-400/30" style={{ height: `${(t / 20) * 24}px` }} />
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] pt-2 border-t border-cyan-400/10">
            <div className="flex justify-between text-neutral-400">
              <span>☀ {FAKE.weather.sunrise}</span>
              <span>🌙 {FAKE.weather.sunset}</span>
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>Måne</span>
              <span className="text-cyan-300">{FAKE.moon.name} · {(FAKE.moon.illumination * 100).toFixed(0)}%</span>
            </div>
          </div>
        </HoloCard>

        {/* Space weather + aurora */}
        <HoloCard title="Rumvejr · Nordlys" className="col-span-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-thin text-cyan-100 tabular-nums">{FAKE.space.kpIndex}</span>
            <span className="text-xs text-neutral-400 uppercase tracking-widest">Kp</span>
            <span className={`ml-auto text-[10px] uppercase px-2 py-0.5 rounded ${FAKE.space.kpIndex >= 5 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
              Aurora {FAKE.space.auroraChance}
            </span>
          </div>
          <div className="relative mt-3 h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0"
              style={{
                width: `${(FAKE.space.kpIndex / 9) * 100}%`,
                background: "linear-gradient(to right, #10b981, #fbbf24, #f43f5e, #a855f7)",
              }}
            />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-neutral-400">
            <div className="flex justify-between"><span>Solvind</span><span className="font-mono text-cyan-300">{FAKE.space.solarWind} km/s</span></div>
            <div className="flex justify-between"><span>X-ray</span><span className="font-mono text-cyan-300">{FAKE.space.xrayClass}</span></div>
          </div>
        </HoloCard>

        {/* Energy price */}
        <HoloCard title="Energi · DK2" className="col-span-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-thin text-cyan-100 tabular-nums">{FAKE.energy.priceDK2.toFixed(2)}</span>
            <span className="text-xs text-neutral-400">kr/kWh</span>
            <span className="ml-auto text-[10px] text-emerald-400 font-mono">↓ 12%</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-neutral-500 uppercase tracking-wider">Grøn nu</span>
              <span className="text-emerald-400 font-mono">{FAKE.energy.greenPct}%</span>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden flex">
              <div className="bg-cyan-400" style={{ width: `${FAKE.energy.windPct}%` }} />
              <div className="bg-amber-400" style={{ width: `${FAKE.energy.solarPct}%` }} />
              <div className="bg-neutral-700" style={{ width: `${100 - FAKE.energy.greenPct}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-neutral-500">
              <span>💨 {FAKE.energy.windPct}% vind</span>
              <span>☀ {FAKE.energy.solarPct}% sol</span>
              <span>{FAKE.energy.co2GPerKwh}g CO₂/kWh</span>
            </div>
          </div>
        </HoloCard>

        {/* Flights over me */}
        <HoloCard title="Luftrum · 50km radius" className="col-span-2">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-thin text-cyan-100 tabular-nums">{FAKE.flights.length}</span>
            <span className="text-xs text-neutral-400">fly</span>
          </div>
          <div className="space-y-1.5">
            {FAKE.flights.map((f) => (
              <div key={f.callsign} className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-cyan-300 w-14">{f.callsign}</span>
                <span className="text-neutral-500 w-20 truncate">{f.origin}→{f.dest}</span>
                <span className="text-neutral-400 ml-auto">{(f.altitude / 1000).toFixed(1)}km</span>
                <span className="text-neutral-500 w-12 text-right">{f.distanceKm}km</span>
              </div>
            ))}
          </div>
        </HoloCard>

        {/* Earthquakes */}
        <HoloCard title="Seismisk · 24t" className="col-span-2">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-4xl font-thin text-cyan-100 tabular-nums">{FAKE.earthquakes[0].magnitude}</span>
            <span className="text-xs text-neutral-400 uppercase tracking-widest">M · seneste</span>
          </div>
          <div className="space-y-1.5">
            {FAKE.earthquakes.map((q, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className={`font-mono w-10 ${q.magnitude >= 5 ? "text-rose-400" : "text-amber-400"}`}>M{q.magnitude}</span>
                <span className="text-neutral-400 flex-1 truncate">{q.place}</span>
                <span className="text-neutral-600 font-mono">{q.timeAgo}</span>
              </div>
            ))}
          </div>
        </HoloCard>

        {/* APOD */}
        <HoloCard title="NASA APOD · I dag" className="col-span-6">
          <div className="flex gap-4">
            <div
              className="w-48 h-32 rounded bg-cover bg-center flex-shrink-0"
              style={{
                backgroundImage: `url(${FAKE.apod.imageUrl})`,
                boxShadow: "0 0 20px rgba(0,217,255,0.2)",
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-cyan-400/60 uppercase tracking-[0.2em] mb-1">{FAKE.apod.date}</div>
              <div className="text-lg text-cyan-100 font-light">{FAKE.apod.title}</div>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{FAKE.apod.explanation}</p>
            </div>
          </div>
        </HoloCard>

        {/* Lightning */}
        <HoloCard title="Lyn · Danmark" className="col-span-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-thin text-cyan-100 tabular-nums">{FAKE.lightning.last1h}</span>
            <span className="text-xs text-neutral-400 uppercase tracking-widest">/t</span>
            <span className="ml-auto text-[10px] text-amber-400">⚡ {FAKE.lightning.nearestKm}km {FAKE.lightning.direction}</span>
          </div>
          <div className="mt-3 flex items-end gap-[2px] h-10">
            {Array.from({ length: 24 }).map((_, i) => {
              const h = Math.round(Math.sin(i * 0.4) * 20 + 25 + Math.random() * 10);
              return <div key={i} className="flex-1 bg-amber-400/60" style={{ height: `${h}px` }} />;
            })}
          </div>
          <div className="mt-2 text-[10px] text-neutral-500 text-center">I dag: {FAKE.lightning.totalToday} nedslag</div>
        </HoloCard>

        {/* Placeholders for existing widgets */}
        <HoloCard title="CPU · Hukommelse" className="col-span-2">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-thin text-cyan-100 tabular-nums">{FAKE.cpu.load}</span>
                <span className="text-xs text-neutral-500">%</span>
              </div>
              <MiniSpark data={SPARK_CPU} />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-thin text-cyan-100 tabular-nums">{FAKE.memory.percent}</span>
                <span className="text-xs text-neutral-500">% RAM</span>
              </div>
              <MiniSpark data={SPARK_MEM} color="#a78bfa" />
            </div>
          </div>
        </HoloCard>

        <HoloCard title="Claude Code" className="col-span-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-thin text-cyan-100 tabular-nums">{FAKE.claude.today}</span>
            <span className="text-xs text-neutral-400">tokens i dag</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
            <div className="flex justify-between"><span className="text-neutral-500">Uge</span><span className="font-mono text-cyan-300">{FAKE.claude.week}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">YTD</span><span className="font-mono text-cyan-300">{FAKE.claude.ytd}</span></div>
          </div>
        </HoloCard>
      </main>
    </div>
  );
}

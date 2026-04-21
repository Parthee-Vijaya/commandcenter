"use client";
import { FAKE, SPARK_CPU, SPARK_MEM, SPARK_NET_RX } from "../_fakes";

function Chip({ label, value, spark, color = "#38bdf8" }: { label: string; value: string; spark?: number[]; color?: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141414] border border-[#262626]">
      <span className="text-[9px] uppercase tracking-widest text-neutral-500">{label}</span>
      <span className="text-xs font-mono tabular-nums text-neutral-100">{value}</span>
      {spark && (
        <svg viewBox="0 0 40 20" className="w-10 h-4">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            points={spark.map((v, i) => `${(i / (spark.length - 1)) * 40},${20 - (v / Math.max(...spark)) * 18}`).join(" ")}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}
    </div>
  );
}

function DeckCard({
  title,
  section,
  children,
  className = "",
  highlight = false,
}: {
  title?: string;
  section?: string;
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`relative ${highlight ? "deck-border-glow" : ""} ${className}`}>
      <div className="rounded-2xl bg-[#141414] border border-[#262626] p-5 hover:border-[#404040] transition-colors h-full">
        {(title || section) && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-medium">{title}</span>
            {section && <span className="text-[9px] text-neutral-600 uppercase tracking-widest">{section}</span>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-6 flex items-center gap-3 mt-2 mb-1">
      <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-600 font-medium">{children}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-neutral-800 to-transparent" />
    </div>
  );
}

export default function MockupB() {
  return (
    <div className="min-h-screen text-neutral-200">
      <style>{`
        @keyframes deckGlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .deck-border-glow::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 1rem;
          padding: 1px;
          background: linear-gradient(90deg, #38bdf8, #a78bfa, #34d399, #38bdf8);
          background-size: 200% 100%;
          animation: deckGlow 4s linear infinite;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }
      `}</style>

      {/* Command bridge header */}
      <header className="border-b border-[#1a1a1a] bg-gradient-to-b from-[#0d0d0d] to-[#0a0a0a]">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-baseline gap-4">
                <span className="text-6xl font-mono font-light text-neutral-100 tabular-nums tracking-tight">
                  {FAKE.time.hhmm}
                </span>
                <div>
                  <div className="text-xs uppercase tracking-[0.3em] text-neutral-400">J.A.R.V.I.S.</div>
                  <div className="text-sm text-neutral-500 mt-1">{FAKE.time.date}</div>
                </div>
              </div>
              <div className="text-xs text-neutral-500 italic mt-3">
                &ldquo;At your service, sir. All systems are operating within nominal parameters.&rdquo;
              </div>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-medium">Nominal</span>
            </div>
          </div>

          {/* HUD chips */}
          <div className="flex items-center gap-2 flex-wrap">
            <Chip label="CPU" value={`${FAKE.cpu.load}%`} spark={SPARK_CPU} color="#38bdf8" />
            <Chip label="RAM" value={`${FAKE.memory.percent}%`} spark={SPARK_MEM} color="#a78bfa" />
            <Chip label="Temp" value={`${FAKE.cpu.temp}°`} color="#fb7185" />
            <Chip label="Watt" value={`${FAKE.power.watts}W`} color="#34d399" />
            <Chip label="Bat" value={`${FAKE.battery.percent}%`} color="#34d399" />
            <Chip label="Net ↓" value={`${FAKE.network.rx}M/s`} spark={SPARK_NET_RX} color="#fbbf24" />
            <Chip label="VPN" value="DK · tun0" color="#34d399" />
            <Chip label="Oppetid" value={FAKE.time.uptime} />
          </div>
        </div>
      </header>

      <main className="max-w-[1800px] mx-auto px-6 py-6 grid grid-cols-6 gap-3 auto-rows-min">
        <SectionHeader>Omgivelser</SectionHeader>

        {/* Weather (tall) */}
        <DeckCard title="Vejr · Atmosfære" section="14t 30m" className="col-span-3 row-span-2" highlight>
          <div className="flex items-baseline gap-3">
            <span className="text-6xl font-thin tabular-nums">{FAKE.weather.temp}°</span>
            <div>
              <div className="text-sm text-neutral-400">{FAKE.weather.condition}</div>
              <div className="text-xs text-neutral-500">Føles som {FAKE.weather.feelsLike}°</div>
            </div>
          </div>
          <div className="mt-5 flex items-end gap-1 h-16">
            {FAKE.weather.hourly.map((t, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-mono text-neutral-600">{t}°</span>
                <div className="w-full bg-sky-400/40 rounded-t" style={{ height: `${(t / 20) * 48}px` }} />
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-[#262626] grid grid-cols-3 gap-2 text-xs">
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Sol</div>
              <div className="text-neutral-300 mt-0.5">☀ {FAKE.weather.sunrise} · 🌙 {FAKE.weather.sunset}</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Måne</div>
              <div className="text-neutral-300 mt-0.5">{FAKE.moon.name}</div>
              <div className="text-neutral-500 text-[10px]">{(FAKE.moon.illumination * 100).toFixed(0)}% · næste fuld {FAKE.moon.nextFullMoon}</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-500 uppercase tracking-wider">Aurora</div>
              <div className="text-amber-300 mt-0.5">Kp {FAKE.space.kpIndex} · {FAKE.space.auroraChance}</div>
            </div>
          </div>
        </DeckCard>

        {/* Energy */}
        <DeckCard title="Elpris DK2" section="nu" className="col-span-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-thin tabular-nums">{FAKE.energy.priceDK2.toFixed(2)}</span>
            <span className="text-xs text-neutral-500">kr/kWh</span>
            <span className="ml-auto text-xs text-emerald-400 font-mono">↓ 12% vs. gns.</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[10px] mb-1.5">
              <span className="text-neutral-500 uppercase tracking-wider">Grøn andel</span>
              <span className="text-emerald-400 font-mono">{FAKE.energy.greenPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-800 overflow-hidden flex">
              <div className="bg-sky-400" style={{ width: `${FAKE.energy.windPct}%` }} title="Vind" />
              <div className="bg-amber-400" style={{ width: `${FAKE.energy.solarPct}%` }} title="Sol" />
              <div className="bg-neutral-700" style={{ width: `${100 - FAKE.energy.greenPct}%` }} title="Fossil" />
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-neutral-500">
              <span>💨 vind {FAKE.energy.windPct}%</span>
              <span>☀ sol {FAKE.energy.solarPct}%</span>
              <span>{FAKE.energy.co2GPerKwh}g CO₂/kWh</span>
            </div>
          </div>
        </DeckCard>

        {/* Space weather */}
        <DeckCard title="Rumvejr" section="Kp-index" className="col-span-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-thin tabular-nums">{FAKE.space.kpIndex}</span>
            <span className="text-xs text-neutral-500">/9</span>
            <span className={`ml-auto text-[10px] uppercase px-2 py-0.5 rounded-full ${FAKE.space.kpIndex >= 5 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
              Aurora {FAKE.space.auroraChance}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-6 rounded ${
                  i < Math.floor(FAKE.space.kpIndex)
                    ? i < 4 ? "bg-emerald-500/70" : i < 6 ? "bg-amber-500/70" : i < 8 ? "bg-rose-500/70" : "bg-fuchsia-500/70"
                    : "bg-neutral-800"
                }`}
              />
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[10px] text-neutral-400">
            <span>Solvind <span className="font-mono text-sky-300">{FAKE.space.solarWind} km/s</span></span>
            <span>Røntgen <span className="font-mono text-sky-300">{FAKE.space.xrayClass}</span></span>
          </div>
        </DeckCard>

        <SectionHeader>Intelligens</SectionHeader>

        {/* Flights */}
        <DeckCard title="Fly i nærheden" section="50km" className="col-span-2">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-thin tabular-nums">{FAKE.flights.length}</span>
            <span className="text-xs text-neutral-500">i luftrummet</span>
          </div>
          <div className="space-y-1.5">
            {FAKE.flights.map((f) => (
              <div key={f.callsign} className="flex items-center gap-2 text-xs">
                <span className="font-mono text-sky-300 w-14">{f.callsign}</span>
                <span className="text-neutral-500 flex-1 truncate">{f.origin} → {f.dest}</span>
                <span className="font-mono text-neutral-400">{(f.altitude / 1000).toFixed(1)}km</span>
                <span className="font-mono text-neutral-600 w-10 text-right">{f.distanceKm}km</span>
              </div>
            ))}
          </div>
        </DeckCard>

        {/* Earthquakes */}
        <DeckCard title="Jordskælv" section="24t · M≥4" className="col-span-2">
          <div className="flex items-baseline gap-2 mb-3">
            <span className={`text-3xl font-thin tabular-nums ${FAKE.earthquakes[0].magnitude >= 6 ? "text-rose-400" : "text-amber-300"}`}>M{FAKE.earthquakes[0].magnitude}</span>
            <span className="text-xs text-neutral-500">seneste</span>
          </div>
          <div className="space-y-1.5">
            {FAKE.earthquakes.map((q, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <span className={`font-mono w-9 ${q.magnitude >= 5 ? "text-rose-400" : "text-amber-400"}`}>M{q.magnitude}</span>
                <span className="text-neutral-400 flex-1 truncate">{q.place}</span>
                <span className="text-neutral-600 font-mono">{q.timeAgo}</span>
              </div>
            ))}
          </div>
        </DeckCard>

        {/* Lightning */}
        <DeckCard title="Lyn over DK" section="live" className="col-span-2">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-thin text-amber-300 tabular-nums">{FAKE.lightning.last1h}</span>
            <span className="text-xs text-neutral-500">/ time</span>
            <span className="ml-auto text-[10px] text-neutral-400">⚡ {FAKE.lightning.nearestKm}km {FAKE.lightning.direction}</span>
          </div>
          <div className="flex items-end gap-[2px] h-10">
            {Array.from({ length: 24 }).map((_, i) => {
              const h = Math.round(Math.sin(i * 0.4) * 16 + 22 + ((i * 7) % 10));
              return <div key={i} className="flex-1 bg-amber-400/60 rounded-sm" style={{ height: `${h}px` }} />;
            })}
          </div>
          <div className="mt-2 text-[10px] text-neutral-500 text-right">I dag: {FAKE.lightning.totalToday}</div>
        </DeckCard>

        <SectionHeader>Kosmos</SectionHeader>

        {/* APOD */}
        <DeckCard title="NASA APOD" section={FAKE.apod.date} className="col-span-6">
          <div className="flex gap-5">
            <div
              className="w-64 h-40 rounded-lg bg-cover bg-center flex-shrink-0 shadow-xl"
              style={{ backgroundImage: `url(${FAKE.apod.imageUrl})` }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-xl text-neutral-100 font-light">{FAKE.apod.title}</div>
              <p className="text-sm text-neutral-400 mt-3 leading-relaxed">{FAKE.apod.explanation}</p>
              <div className="mt-4 flex gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 uppercase tracking-widest">Galaxy</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 uppercase tracking-widest">Hubble</span>
              </div>
            </div>
          </div>
        </DeckCard>

        <SectionHeader>System</SectionHeader>

        <DeckCard title="Status · Power" className="col-span-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-thin tabular-nums text-emerald-300">{FAKE.power.watts}</span>
            <span className="text-xs text-neutral-500">W live</span>
          </div>
          <div className="mt-2 text-xs text-neutral-400">
            AC · {FAKE.battery.percent}% · {FAKE.cpu.temp}°C
          </div>
        </DeckCard>

        <DeckCard title="Claude Code" className="col-span-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-thin tabular-nums">{FAKE.claude.today}</span>
            <span className="text-xs text-neutral-500">tokens i dag</span>
          </div>
          <div className="mt-2 grid grid-cols-2 text-xs gap-2">
            <div className="flex justify-between"><span className="text-neutral-500">Uge</span><span className="font-mono">{FAKE.claude.week}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">YTD</span><span className="font-mono">{FAKE.claude.ytd}</span></div>
          </div>
        </DeckCard>

        <DeckCard title="Plex · VPN" className="col-span-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm">Plex online · {FAKE.plex.library.movies} film</span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-sm">VPN 🇩🇰 {FAKE.vpn.country} · {FAKE.vpn.ip}</span>
          </div>
        </DeckCard>
      </main>
    </div>
  );
}

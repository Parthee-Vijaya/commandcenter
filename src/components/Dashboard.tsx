"use client";
import { useEffect, useState } from "react";
import { CpuWidget } from "./widgets/CpuWidget";
import { MemoryWidget } from "./widgets/MemoryWidget";
import { StatusWidget } from "./widgets/StatusWidget";
import { DiskWidget } from "./widgets/DiskWidget";
import { WeatherWidget } from "./widgets/WeatherWidget";
import { AirWidget } from "./widgets/AirWidget";
import { PlexWidget } from "./widgets/PlexWidget";
import { VpnWidget } from "./widgets/VpnWidget";
import { NetworkWidget } from "./widgets/NetworkWidget";
import { DevicesWidget } from "./widgets/DevicesWidget";
import { NewsWidget } from "./widgets/NewsWidget";
import { NzbWidget } from "./widgets/NzbWidget";
import { ClaudeStatusWidget } from "./widgets/ClaudeStatusWidget";
import { EnergyWidget } from "./widgets/EnergyWidget";
import { MoonWidget } from "./widgets/MoonWidget";
import { FlightsWidget } from "./widgets/FlightsWidget";
import { SpaceWeatherWidget } from "./widgets/SpaceWeatherWidget";
import { EarthquakesWidget } from "./widgets/EarthquakesWidget";
import { LightningWidget } from "./widgets/LightningWidget";
import { ApodWidget } from "./widgets/ApodWidget";
import { QUOTES } from "@/lib/quotes";

function useClock() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function useRotatingQuote(intervalMs = 20_000) {
  const [quote, setQuote] = useState<string>("");
  const [fading, setFading] = useState(false);
  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
        setFading(false);
      }, 400);
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return { quote, fading };
}

export function Dashboard() {
  const now = useClock();
  const { quote, fading } = useRotatingQuote();
  const dateStr = now
    ? now.toLocaleDateString("da-DK", { weekday: "long", day: "numeric", month: "long" })
    : "—";
  const timeStr = now
    ? now.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "--:--:--";

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl sm:text-4xl font-thin tracking-[0.3em] text-cyan-100 holo-title-glow">
            J.A.R.V.I.S.
          </h1>
          <p className="text-cyan-400/60 text-xs mt-2 font-mono uppercase tracking-widest">
            <span className="capitalize">{dateStr}</span> · {timeStr}
          </p>
          <p
            className={`text-xs text-neutral-400 italic mt-2 max-w-xl transition-opacity duration-400 ${
              fading ? "opacity-0" : "opacity-100"
            }`}
          >
            {quote || "\u00a0"}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/5 w-fit shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 pulse-dot" style={{ boxShadow: "0 0 8px #00d9ff" }} />
          <span className="text-[10px] text-cyan-300/80 uppercase tracking-[0.2em]">Operational</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 auto-rows-min">
        <ApodWidget />
        <CpuWidget />
        <MemoryWidget />
        <StatusWidget />
        <DiskWidget />
        <WeatherWidget />
        <MoonWidget />
        <EnergyWidget />
        <SpaceWeatherWidget />
        <FlightsWidget />
        <EarthquakesWidget />
        <LightningWidget />
        <AirWidget />
        <PlexWidget />
        <VpnWidget />
        <NetworkWidget />
        <ClaudeStatusWidget />
        <DevicesWidget />
        <NzbWidget />
        <NewsWidget />
      </main>

      <footer className="max-w-7xl mx-auto mt-8 text-center text-xs text-neutral-600">
        J.A.R.V.I.S. · Just A Rather Very Intelligent System
      </footer>
    </div>
  );
}

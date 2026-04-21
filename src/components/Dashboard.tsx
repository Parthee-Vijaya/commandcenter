"use client";
import { useEffect, useState } from "react";
import { CpuWidget } from "./widgets/CpuWidget";
import { MemoryWidget } from "./widgets/MemoryWidget";
import { StatusWidget } from "./widgets/StatusWidget";
import { DiskWidget } from "./widgets/DiskWidget";
import { WeatherWidget } from "./widgets/WeatherWidget";
import { AirWidget } from "./widgets/AirWidget";
import { PlexWidget } from "./widgets/PlexWidget";
import { DevicesWidget } from "./widgets/DevicesWidget";
import { NewsWidget } from "./widgets/NewsWidget";
import { NzbWidget } from "./widgets/NzbWidget";
import { EnergyWidget } from "./widgets/EnergyWidget";
import { FlightsWidget } from "./widgets/FlightsWidget";
import { TrafficWidget } from "./widgets/TrafficWidget";
import { SpaceWeatherWidget } from "./widgets/SpaceWeatherWidget";
import { EarthquakesWidget } from "./widgets/EarthquakesWidget";
import { LightningWidget } from "./widgets/LightningWidget";
import { ApodWidget } from "./widgets/ApodWidget";
import { ClaudeHeaderStats } from "./ClaudeHeaderStats";
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
    <div className="min-h-screen p-3 sm:p-6 lg:p-8">
      <header className="max-w-7xl mx-auto mb-5 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-4xl font-thin tracking-[0.2em] sm:tracking-[0.3em] text-cyan-100 holo-title-glow">
            J.A.R.V.I.S.
          </h1>
          <p className="text-cyan-400/60 text-[10px] sm:text-xs mt-1.5 sm:mt-2 font-mono uppercase tracking-widest">
            <span className="capitalize">{dateStr}</span> · {timeStr}
          </p>
          <p
            className={`text-[11px] sm:text-xs text-neutral-400 italic mt-2 max-w-xl transition-opacity duration-400 ${
              fading ? "opacity-0" : "opacity-100"
            }`}
          >
            {quote || "\u00a0"}
          </p>
        </div>
        <ClaudeHeaderStats />
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 sm:gap-3 auto-rows-min">
        {/* Row 1 · System gauges */}
        <CpuWidget />
        <MemoryWidget />
        <StatusWidget />

        {/* Row 2 · APOD hero */}
        <ApodWidget />

        {/* Row 3 · Vejr+Måne + Trafik */}
        <WeatherWidget />
        <TrafficWidget />

        {/* Row 4 · Ambient */}
        <EnergyWidget />
        <SpaceWeatherWidget />

        {/* Row 5 · Live events */}
        <FlightsWidget />
        <EarthquakesWidget />

        {/* Row 6 · Smaller metrics */}
        <LightningWidget />
        <DiskWidget />
        <AirWidget />

        {/* Row 7 · Media & hardware */}
        <PlexWidget />
        <DevicesWidget />

        {/* Row 8 · Downloads */}
        <NzbWidget />

        {/* Row 9 · News */}
        <NewsWidget />
      </main>

      <footer className="max-w-7xl mx-auto mt-8 text-center text-xs text-neutral-600">
        J.A.R.V.I.S. · Just A Rather Very Intelligent System
      </footer>
    </div>
  );
}

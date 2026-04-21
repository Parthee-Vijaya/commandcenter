import type { EnergyData } from "@/lib/types";

// energinet.dk DataService open API — no key required.
// Uses Elspotprices for price + PowerSystemRightNow for mix.

interface ElspotRow {
  HourDK: string;
  PriceArea: string;
  SpotPriceDKK: number | null;
  SpotPriceEUR: number | null;
}

interface PowerSystemRow {
  Minutes1DK: string;
  PriceArea: string;
  CO2Emission: number | null;
  ProductionGe100MW: number | null;
  ProductionLt100MW: number | null;
  SolarPower: number | null;
  OffshoreWindPower: number | null;
  OnshoreWindPower: number | null;
  GrossConsumption: number | null;
}

async function fetchJson<T>(url: string, timeoutMs = 8000): Promise<T> {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as T;
}

export async function collect(): Promise<EnergyData> {
  const now = new Date();
  const from = new Date(now.getTime() - 12 * 3600 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm

  const priceUrl =
    `https://api.energidataservice.dk/dataset/Elspotprices?` +
    `start=${fmt(from)}&end=${fmt(now)}&filter=${encodeURIComponent(JSON.stringify({ PriceArea: ["DK1", "DK2"] }))}` +
    `&sort=HourDK%20ASC`;

  const mixUrl =
    `https://api.energidataservice.dk/dataset/PowerSystemRightNow?limit=2` +
    `&sort=Minutes1DK%20DESC`;

  const [priceRes, mixRes] = await Promise.allSettled([
    fetchJson<{ records: ElspotRow[] }>(priceUrl),
    fetchJson<{ records: PowerSystemRow[] }>(mixUrl),
  ]);

  // Price processing
  let priceDK1Kr: number | null = null;
  let priceDK2Kr: number | null = null;
  let trendDK2: Array<{ hour: string; priceKr: number }> = [];
  if (priceRes.status === "fulfilled") {
    const rows = priceRes.value.records;
    const dk1 = rows.filter((r) => r.PriceArea === "DK1" && r.SpotPriceDKK != null);
    const dk2 = rows.filter((r) => r.PriceArea === "DK2" && r.SpotPriceDKK != null);
    const latestDk1 = dk1[dk1.length - 1];
    const latestDk2 = dk2[dk2.length - 1];
    if (latestDk1) priceDK1Kr = (latestDk1.SpotPriceDKK ?? 0) / 1000; // øre/MWh → DKK/kWh
    if (latestDk2) priceDK2Kr = (latestDk2.SpotPriceDKK ?? 0) / 1000;
    trendDK2 = dk2.slice(-12).map((r) => ({
      hour: r.HourDK.slice(11, 16),
      priceKr: (r.SpotPriceDKK ?? 0) / 1000,
    }));
  }

  // Mix processing (DK total)
  let windPct = 0;
  let solarPct = 0;
  let greenPct = 0;
  let co2GPerKwh: number | null = null;
  if (mixRes.status === "fulfilled") {
    const rows = mixRes.value.records;
    const totalByArea = new Map<string, PowerSystemRow>();
    for (const r of rows) if (!totalByArea.has(r.PriceArea)) totalByArea.set(r.PriceArea, r);
    let wind = 0, solar = 0, gross = 0, co2Wsum = 0, co2Gross = 0;
    for (const r of totalByArea.values()) {
      wind += (r.OffshoreWindPower ?? 0) + (r.OnshoreWindPower ?? 0);
      solar += r.SolarPower ?? 0;
      gross += r.GrossConsumption ?? 0;
      if (r.CO2Emission != null && r.GrossConsumption != null) {
        co2Wsum += r.CO2Emission * r.GrossConsumption;
        co2Gross += r.GrossConsumption;
      }
    }
    if (gross > 0) {
      windPct = Math.round((wind / gross) * 100);
      solarPct = Math.round((solar / gross) * 100);
      greenPct = Math.min(100, windPct + solarPct);
    }
    if (co2Gross > 0) co2GPerKwh = Math.round(co2Wsum / co2Gross);
  }

  return {
    priceDK1Kr,
    priceDK2Kr,
    greenPct,
    windPct,
    solarPct,
    co2GPerKwh,
    region: "DK2", // default — user's region (assume Sjælland unless overridden)
    trend: trendDK2,
    fetchedAt: new Date().toISOString(),
  };
}

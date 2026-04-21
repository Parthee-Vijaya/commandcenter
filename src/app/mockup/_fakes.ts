// Shared fake data for mockup pages — kept deliberately realistic so designers can
// judge layout density without wiring real collectors.

export const FAKE = {
  time: { hhmm: "21:47", date: "Tirsdag 21. april", uptime: "4d 18t 22m" },
  cpu: { load: 34, cores: 10, temp: 58, brand: "Apple M2 Pro" },
  memory: { usedGB: 12.4, totalGB: 32, percent: 39 },
  disk: { usedTB: 1.2, totalTB: 4.0, percent: 30 },
  network: { rx: 4.3, tx: 1.8 }, // MB/s
  battery: { percent: 88, charging: true },
  power: { watts: 38.4, thermal: false, source: "ac" as const },
  weather: {
    temp: 11,
    feelsLike: 9,
    condition: "Delvist skyet",
    hourly: [12, 11, 10, 10, 9, 9, 10, 12, 14, 15, 15, 14],
    sunrise: "06:04",
    sunset: "20:34",
    dayLength: "14t 30m",
  },
  moon: {
    phase: 0.42, // 0=new, 0.5=full, 1=new
    illumination: 0.68,
    nextFullMoon: "2. maj",
    name: "Voksende halvmåne",
  },
  space: {
    kpIndex: 4.3,
    auroraChance: "moderat" as const,
    solarWind: 412, // km/s
    xrayClass: "B2.1",
  },
  energy: {
    priceDK1: 1.24, // DKK/kWh
    priceDK2: 1.18,
    greenPct: 67,
    windPct: 54,
    solarPct: 13,
    co2GPerKwh: 85,
    trend: [1.1, 1.0, 0.9, 0.85, 0.8, 0.9, 1.1, 1.4, 1.6, 1.5, 1.3, 1.24],
  },
  flights: [
    { callsign: "SAS402", altitude: 11278, speed: 845, origin: "CPH", dest: "JFK", distanceKm: 12, heading: 280 },
    { callsign: "RYR2K", altitude: 9450, speed: 780, origin: "STN", dest: "BLL", distanceKm: 38, heading: 95 },
    { callsign: "KLM1234", altitude: 10800, speed: 820, origin: "AMS", dest: "OSL", distanceKm: 47, heading: 25 },
  ],
  lightning: { last1h: 247, nearestKm: 18, direction: "SØ", totalToday: 1842 },
  earthquakes: [
    { magnitude: 5.8, place: "125km SSV for Tokyo, Japan", depth: 43, timeAgo: "2t" },
    { magnitude: 4.9, place: "Fiji-regionen", depth: 220, timeAgo: "7t" },
    { magnitude: 4.6, place: "Nord for Puerto Rico", depth: 12, timeAgo: "11t" },
  ],
  apod: {
    title: "Whirlpool Galaxy (M51)",
    explanation: "Den majestætiske spiralgalakse M51 set gennem Hubble.",
    imageUrl: "https://apod.nasa.gov/apod/image/2109/M51Abolfath_1080.jpg",
    date: "21. apr 2026",
  },
  claude: { today: "62.5M", week: "76M", ytd: "293M", total: "293M" },
  plex: { online: true, library: { movies: 412, shows: 28 } },
  vpn: { connected: true, country: "DK", ip: "89.234.12.5" },
  loadAvg: [1.24, 1.08, 0.92] as [number, number, number],
  processCount: 487,
};

// Spark data for inline sparklines
export const SPARK_CPU = [22, 24, 28, 31, 29, 34, 38, 42, 38, 34, 30, 28, 34];
export const SPARK_MEM = [35, 36, 37, 38, 37, 38, 39, 40, 39, 39, 39, 39];
export const SPARK_NET_RX = [2.1, 2.4, 3.1, 4.8, 5.2, 4.3, 3.8, 4.1, 4.6, 4.3];
export const SPARK_NET_TX = [0.8, 1.0, 1.2, 1.5, 1.8, 1.6, 1.4, 1.5, 1.7, 1.8];

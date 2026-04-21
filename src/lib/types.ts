export interface ProcessInfo {
  name: string;
  cpu: number;
  mem: number;
  pid: number;
}

export interface SystemData {
  cpu: { load: number; cores: number; brand: string };
  memory: { used: number; total: number; percent: number };
  disk: { used: number; total: number; percent: number };
  temperature: number | null;
  network: { rxSec: number; txSec: number };
  battery: { hasBattery: boolean; percent: number | null; charging: boolean };
  host: { hostname: string; uptime: number; platform: string };
  power: { source: "ac" | "battery" | "unknown"; thermalWarning: boolean };
  processes: { topCpu: ProcessInfo[]; topMem: ProcessInfo[]; total: number };
  loadAvg: [number, number, number];
}

export interface WeatherData {
  current: {
    temp: number;
    feelsLike: number;
    weatherCode: number;
    humidity: number;
    windSpeed: number;
  };
  hourly: Array<{ time: string; temp: number; weatherCode: number }>;
  location: string;
  sun: {
    sunrise: string;
    sunset: string;
    dayLengthMinutes: number;
    isDaytime: boolean;
    progressPercent: number;
  };
}

export interface AirQualityData {
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  o3: number;
  rating: "good" | "moderate" | "unhealthy" | "very_unhealthy" | "hazardous";
  uvIndex: number | null;
  pollen: {
    birch: number | null;
    grass: number | null;
    alder: number | null;
    ragweed: number | null;
    mugwort: number | null;
    olive: number | null;
  };
}

export interface PlexStream {
  title: string;
  subtitle?: string;
  player: string;
  quality: string;
  progress: number;
  remainingMinutes: number;
  thumbColor?: string;
}

export interface PlexData {
  online: boolean;
  sessions: PlexStream[];
  library: { movies: number; shows: number; sizeBytes: number };
}

export interface VpnData {
  connected: boolean;
  interface?: string;
  externalIp?: string;
  country?: string;
  countryCode?: string;
  uptimeSeconds?: number;
}

export interface DeviceItem {
  name: string;
  type: "usb" | "bluetooth" | "network";
  detail?: string;
}

export interface WifiInfo {
  ssid: string | null;
  rssi: number | null;
  channel: string | null;
  security: string | null;
  txRateMbps: number | null;
}

export interface DevicesData {
  usb: DeviceItem[];
  bluetooth: DeviceItem[];
  network: DeviceItem[];
  wifi?: WifiInfo;
}

export interface HistoryPoint {
  ts: number;
  value: number;
}

export interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  category?: string;
}

export interface FeedBundle {
  items: FeedItem[];
  fetchedAt: string;
  errors: string[];
}

export interface NzbItem {
  title: string;
  link: string;
  size: string;
  category: string;
  pubDate: string;
}

export interface NzbData {
  configured: boolean;
  items: NzbItem[];
  error?: string;
}

export interface TrafficIncident {
  title: string;
  header: string;
  description: string;
  begin: string;
  updated: string;
  layer: string;
  priority: number;
}

export interface TrafficData {
  total: number;
  incidents: TrafficIncident[];
  fetchedAt: string;
  error?: string;
}

export interface DiskDevice {
  id: string;
  name: string;
  interfaceType: string;
  mount: string;
  totalBytes: number;
  usedBytes: number;
  percentUsed: number;
  isInternal: boolean;
  rateMBs: number;
  totalMB: number;
}

export interface MountPoint {
  path: string;
  fs: string;
  totalBytes: number;
  usedBytes: number;
  percentUsed: number;
  type: string;
}

export interface DiskData {
  devices: DiskDevice[];
  mounts: MountPoint[];
}

export interface ClaudeSessionSummary {
  sessionId: string;
  project: string;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  tokensIn: number;
  tokensOut: number;
  cacheRead: number;
  cacheCreate: number;
  messageCount: number;
}

export interface TokenBucket {
  in: number;
  out: number;
  cacheRead: number;
  cacheCreate: number;
  total: number;
  messages: number;
}

export interface ClaudeStatusData {
  total: TokenBucket;
  today: TokenBucket;
  week: TokenBucket;
  yearToDate: TokenBucket;
  dailyTotals: Array<{ date: string; tokens: number }>;
  recent: ClaudeSessionSummary[];
  fetchedAt: string;
  error?: string;
}

export interface EnergyData {
  priceDK1Kr: number | null; // DKK/kWh spot
  priceDK2Kr: number | null;
  greenPct: number;
  windPct: number;
  solarPct: number;
  co2GPerKwh: number | null;
  region: "DK1" | "DK2";
  trend: Array<{ hour: string; priceKr: number }>;
  fetchedAt: string;
  error?: string;
}

export interface FlightItem {
  callsign: string;
  origin: string | null;
  altitudeKm: number;
  speedKmh: number;
  heading: number;
  verticalRate: number;
  distanceKm: number;
  bearing: number;
  onGround: boolean;
}

export interface FlightsData {
  count: number;
  radiusKm: number;
  flights: FlightItem[];
  fetchedAt: string;
  error?: string;
}

export interface SpaceWeatherData {
  kpIndex: number | null;
  auroraChance: "low" | "moderate" | "high" | "severe";
  solarWindKmS: number | null;
  xrayClass: string | null;
  trend: number[];
  fetchedAt: string;
  error?: string;
}

export interface EarthquakeItem {
  magnitude: number;
  place: string;
  depthKm: number;
  timeMs: number;
  tsunami: boolean;
  url: string;
}

export interface EarthquakesData {
  count: number;
  largest: EarthquakeItem | null;
  items: EarthquakeItem[];
  fetchedAt: string;
  error?: string;
}

export interface LightningData {
  last1h: number;
  nearestKm: number | null;
  nearestDirection: string | null;
  totalToday: number;
  hourly: number[];
  fetchedAt: string;
  error?: string;
}

export interface ApodData {
  title: string;
  explanation: string;
  imageUrl: string;
  hdUrl: string | null;
  mediaType: "image" | "video";
  date: string;
  copyright: string | null;
  fetchedAt: string;
  error?: string;
}

export interface MoonData {
  phase: number;
  illumination: number;
  name: string;
  nextFullMoon: string;
  nextNewMoon: string;
}

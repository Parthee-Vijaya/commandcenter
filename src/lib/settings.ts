import { getDb } from "./db";

export function getSetting(key: string): string | undefined {
  const row = getDb()
    .prepare("SELECT value FROM settings WHERE key = ?")
    .get(key) as { value: string } | undefined;
  return row?.value;
}

export function setSetting(key: string, value: string): void {
  getDb()
    .prepare(
      "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP"
    )
    .run(key, value, value);
}

export function getSettingJSON<T>(key: string, fallback: T): T {
  const raw = getSetting(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setSettingJSON(key: string, value: unknown): void {
  setSetting(key, JSON.stringify(value));
}

export interface LocationSetting {
  lat: number;
  lng: number;
  label: string;
}

export const DEFAULT_LOCATION: LocationSetting = {
  lat: 55.6761,
  lng: 12.5683,
  label: "København",
};

export function getLocation(): LocationSetting {
  return getSettingJSON("location", DEFAULT_LOCATION);
}

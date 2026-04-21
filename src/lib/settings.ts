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

// --- LLM / Chat ---

export interface LLMConfig {
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  systemPrompt: string;
  verbose: boolean;
}

export const DEFAULT_LLM_CONFIG: LLMConfig = {
  baseUrl: "http://localhost:1234/v1",
  apiKey: "lm-studio",
  defaultModel: "",
  systemPrompt:
    "Du er Jarvis, en hjælpsom dansk assistent. Svar altid på dansk medmindre andet forespørges.",
  verbose: true,
};

export function getLLMConfig(): LLMConfig {
  return {
    baseUrl: getSetting("llm_base_url") || DEFAULT_LLM_CONFIG.baseUrl,
    apiKey: getSetting("llm_api_key") || DEFAULT_LLM_CONFIG.apiKey,
    defaultModel: getSetting("llm_default_model") || DEFAULT_LLM_CONFIG.defaultModel,
    systemPrompt: getSetting("llm_system_prompt") || DEFAULT_LLM_CONFIG.systemPrompt,
    verbose: (getSetting("llm_verbose") ?? "true") === "true",
  };
}

export function setLLMConfig(partial: Partial<LLMConfig>): void {
  if (partial.baseUrl !== undefined) setSetting("llm_base_url", partial.baseUrl);
  if (partial.apiKey !== undefined) setSetting("llm_api_key", partial.apiKey);
  if (partial.defaultModel !== undefined) setSetting("llm_default_model", partial.defaultModel);
  if (partial.systemPrompt !== undefined) setSetting("llm_system_prompt", partial.systemPrompt);
  if (partial.verbose !== undefined) setSetting("llm_verbose", partial.verbose ? "true" : "false");
}

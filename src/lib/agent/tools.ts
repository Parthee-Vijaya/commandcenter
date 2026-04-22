/**
 * Tool-definitioner til LM Studio's OpenAI-kompatible function-calling.
 *
 * Hver tool har:
 *   - OpenAI-kompatibel schema (name, description, parameters)
 *   - En handler (i dispatcher.ts) der matcher name → execute
 *
 * Sikkerhedsmodel:
 *   - Alle tools er read-først. Destruktive actions (stop/restart/quit) kræver
 *     at brugeren har sendt `X-Confirm: true` header OR accepter i UI-dialog.
 *   - Tools kalder de eksisterende `/api/control/*` endpoints internt (ikke nye
 *     codepaths → fælles auth & allowlist).
 */

export interface ToolSchema {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, unknown>;
      required?: string[];
    };
  };
}

export const TOOLS: ToolSchema[] = [
  // ── Mission Control: Services ───────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "list_services",
      description:
        "List alle styrbare macOS LaunchAgents og deres status (running/loaded/stopped) med PID. Brug denne for at se hvad brugeren kan styre.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "control_service",
      description:
        "Start, stop, genstart eller forespørg status på en service ved dens launchctl-label. Destruktive actions (stop/restart) kræver bekræftelse fra brugeren.",
      parameters: {
        type: "object",
        properties: {
          label: {
            type: "string",
            description:
              "LaunchAgent-label, fx 'com.jarvis.dashboard' eller 'com.tailscale.tailscaled'",
          },
          action: {
            type: "string",
            enum: ["start", "stop", "restart", "status"],
            description: "Hvilken action der skal udføres",
          },
        },
        required: ["label", "action"],
      },
    },
  },

  // ── Mission Control: Apps ───────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "list_apps",
      description:
        "List alle styrbare macOS-apps og om de kører lige nu (fx 'LM Studio', 'Plex Media Server', 'Spotify').",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "control_app",
      description:
        "Start, fokusér eller afslut en macOS-app. 'quit' kræver bekræftelse. 'launch' åbner appen hvis den ikke kører, ellers fokuserer den.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "App-navn som det står i /Applications, fx 'Spotify'",
          },
          action: {
            type: "string",
            enum: ["launch", "focus", "quit"],
            description: "Hvilken action der skal udføres",
          },
        },
        required: ["name", "action"],
      },
    },
  },

  // ── System telemetry ────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "read_system_status",
      description:
        "Hent aktuel CPU-, memory- og system-telemetri (load, temperatur, uptime).",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "read_disk",
      description:
        "Hent disk-forbrug: total, brugt, fri plads i GB og procent.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "read_weather",
      description:
        "Hent aktuel vejrinfo for brugerens lokation (temperatur, nedbør, vind, skydække) + kort prognose.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "read_energy",
      description:
        "Hent aktuel dansk el-spotpris (øre/kWh) for brugerens prisområde + dagens udvikling.",
      parameters: { type: "object", properties: {} },
    },
  },

  // ── Filbrowser (read-only) ──────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "list_files",
      description:
        "Vis indholdet af en whitelisted filsti. Tilgængelige roots: projekter, downloads, documents, desktop, logs.",
      parameters: {
        type: "object",
        properties: {
          root: {
            type: "string",
            enum: ["projekter", "downloads", "documents", "desktop", "logs"],
            description: "Root-ID",
          },
          path: {
            type: "string",
            description:
              "Relativ sti fra rootet. Tom streng = rodniveau. Fx 'jarvis/src'.",
          },
        },
        required: ["root"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "read_file",
      description:
        "Læs indholdet af en tekstfil indenfor en whitelisted root. Maks 2 MB.",
      parameters: {
        type: "object",
        properties: {
          root: {
            type: "string",
            enum: ["projekter", "downloads", "documents", "desktop", "logs"],
          },
          path: {
            type: "string",
            description: "Relativ sti til filen",
          },
        },
        required: ["root", "path"],
      },
    },
  },

  // ── Discovery ───────────────────────────────────────────────────────────
  {
    type: "function",
    function: {
      name: "run_discovery",
      description:
        "Kør auto-discovery-scan: tjek hvilke datakilder og integrationer der er klar (LM Studio, Plex, Tailscale, NASA, internet, lokation).",
      parameters: { type: "object", properties: {} },
    },
  },
];

/** Tools hvor action er destruktiv → kræver X-Confirm: true */
export const DESTRUCTIVE_TOOL_ACTIONS: Record<string, string[]> = {
  control_service: ["stop", "restart"],
  control_app: ["quit"],
};

export function isDestructive(toolName: string, args: Record<string, unknown>): boolean {
  const destructive = DESTRUCTIVE_TOOL_ACTIONS[toolName];
  if (!destructive) return false;
  const action = typeof args.action === "string" ? args.action : "";
  return destructive.includes(action);
}

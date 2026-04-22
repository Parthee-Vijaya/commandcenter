/**
 * Tool-dispatcher: eksekverer tool-calls fra LM Studio ved at route dem til
 * eksisterende API-endpoints (via direkte funktionskald — ingen HTTP-roundtrip
 * internt, da vi allerede er på serveren).
 *
 * Dette holder auth & allowlist konsistent: tools genbruger præcis samme
 * codepaths som UI-knapper.
 */

import { listServices, controlService } from "@/lib/control/services";
import { listApps, controlApp } from "@/lib/control/apps";
import { listDir, readTextPreview } from "@/lib/control/files";
import { collect as collectSystem } from "@/lib/collectors/system";
import { collect as collectDisk } from "@/lib/collectors/disk";
import { collect as collectWeather } from "@/lib/collectors/weather";
import { collect as collectEnergy } from "@/lib/collectors/energy";
import { isDestructive } from "./tools";

export interface ToolCallRequest {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolCallResult {
  id: string;
  name: string;
  ok: boolean;
  /** JSON-stringified result indhold — LM Studio forventer strings for tool-returns */
  content: string;
  /** True hvis tool-call blev blokeret pga. sikkerhed */
  blocked?: boolean;
  /** Grund til blokering hvis blocked */
  blockReason?: string;
}

/**
 * Eksekverer en enkelt tool-call. Returnerer altid et ToolCallResult (aldrig
 * throw) så LM Studio kan se resultat uanset succes/fejl.
 */
export async function dispatchTool(
  req: ToolCallRequest,
  opts: { allowDestructive: boolean } = { allowDestructive: false }
): Promise<ToolCallResult> {
  // Guardrail: blokér destruktive actions medmindre UI eksplicit har bekræftet
  if (isDestructive(req.name, req.arguments) && !opts.allowDestructive) {
    return {
      id: req.id,
      name: req.name,
      ok: false,
      blocked: true,
      blockReason:
        "Destruktiv action kræver brugerens bekræftelse. Bed brugeren om at bekræfte i UI.",
      content: JSON.stringify({
        blocked: true,
        reason: "kræver bekræftelse",
        suggestion:
          "Fortæl brugeren hvad du vil gøre, og bed dem bekræfte eksplicit før genudførelse.",
      }),
    };
  }

  try {
    const result = await execute(req.name, req.arguments);
    return {
      id: req.id,
      name: req.name,
      ok: true,
      content: safeStringify(result),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      id: req.id,
      name: req.name,
      ok: false,
      content: JSON.stringify({ error: msg }),
    };
  }
}

async function execute(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    // ── Services ──────────────────────────────────────────────────────────
    case "list_services": {
      const services = await listServices();
      return {
        services: services.map((s) => ({
          label: s.label,
          name: s.name,
          description: s.description,
          running: s.running,
          loaded: s.loaded,
          pid: s.pid,
          allowed_actions: s.actions,
        })),
      };
    }
    case "control_service": {
      const label = String(args.label ?? "");
      const action = String(args.action ?? "") as
        | "start"
        | "stop"
        | "restart"
        | "status";
      if (!label || !["start", "stop", "restart", "status"].includes(action)) {
        throw new Error("label eller action mangler/ugyldig");
      }
      const res = await controlService(label, action);
      return res;
    }

    // ── Apps ──────────────────────────────────────────────────────────────
    case "list_apps": {
      const apps = await listApps();
      return {
        apps: apps.map((a) => ({
          name: a.name,
          category: a.category,
          running: a.running,
        })),
      };
    }
    case "control_app": {
      const appName = String(args.name ?? "");
      const action = String(args.action ?? "") as "launch" | "quit" | "focus";
      if (!appName || !["launch", "quit", "focus"].includes(action)) {
        throw new Error("name eller action mangler/ugyldig");
      }
      const res = await controlApp(appName, action);
      return res;
    }

    // ── System / telemetri ────────────────────────────────────────────────
    case "read_system_status": {
      const s = await collectSystem();
      return s;
    }
    case "read_disk": {
      const d = await collectDisk();
      return d;
    }
    case "read_weather": {
      const w = await collectWeather();
      return w;
    }
    case "read_energy": {
      const e = await collectEnergy();
      return e;
    }

    // ── Filbrowser ────────────────────────────────────────────────────────
    case "list_files": {
      const root = String(args.root ?? "");
      const path = String(args.path ?? "");
      const listing = await listDir(root, path);
      if (!listing) throw new Error("root eller sti ugyldig");
      return {
        root: listing.root.name,
        path: listing.rel,
        absolute: listing.absolute,
        entries: listing.entries.map((e) => ({
          name: e.name,
          type: e.type,
          size: e.size,
          ext: e.ext,
          rel: e.rel,
        })),
      };
    }
    case "read_file": {
      const root = String(args.root ?? "");
      const path = String(args.path ?? "");
      const preview = await readTextPreview(root, path);
      if (!preview) throw new Error("fil ugyldig eller udenfor root");
      if (preview.kind !== "text") {
        return {
          kind: preview.kind,
          size: preview.size,
          mime: preview.mime,
          note: "Ikke-tekst fil — kan ikke læses som tekst",
        };
      }
      return {
        kind: "text",
        size: preview.size,
        truncated: preview.truncated,
        content: preview.content,
      };
    }

    // ── Discovery ─────────────────────────────────────────────────────────
    case "run_discovery": {
      // Direkte fetch mod eget endpoint er simplere end at importere logikken
      // (den har en del fs/child_process deps der er tunge at genbruge)
      const res = await fetch("http://localhost:3100/api/control/discover", {
        headers: {
          // Sikre same-origin-auth virker
          Origin: "http://localhost:3100",
          Host: "localhost:3100",
        },
      });
      if (!res.ok) throw new Error(`discover fejlede: HTTP ${res.status}`);
      return await res.json();
    }

    default:
      throw new Error(`ukendt tool: ${name}`);
  }
}

/** JSON.stringify med fallback til String() + begrænsning */
function safeStringify(val: unknown, maxLen = 8000): string {
  try {
    const s = JSON.stringify(val);
    if (s.length > maxLen) {
      return s.slice(0, maxLen) + "…[trunkeret]";
    }
    return s;
  } catch {
    return String(val).slice(0, maxLen);
  }
}

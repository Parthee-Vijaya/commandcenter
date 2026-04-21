import { NextRequest } from "next/server";
import { getLLMConfig } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatReqMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatReq {
  messages: ChatReqMessage[];
  model: string;
  systemPrompt?: string;
}

interface OaiDelta {
  choices?: Array<{
    delta?: { content?: string };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

/**
 * POST /api/chat
 * Proxyer LM Studio's OpenAI-kompatible /v1/chat/completions med streaming
 * og oversætter output til en simpel newline-delimited JSON protokol:
 *   {"type":"delta","text":"..."}\n
 *   {"type":"usage","usage":{...}}\n
 *   {"type":"done","finishReason":"stop"}\n
 *   {"type":"error","message":"..."}\n
 */
export async function POST(req: NextRequest) {
  let body: ChatReq;
  try {
    body = (await req.json()) as ChatReq;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages, model, systemPrompt } = body;
  if (!Array.isArray(messages) || !model) {
    return new Response(JSON.stringify({ error: "missing messages or model" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { baseUrl, apiKey, systemPrompt: defaultSystem } = getLLMConfig();
  const sys = (systemPrompt ?? defaultSystem).trim();

  const payload = {
    model,
    stream: true,
    stream_options: { include_usage: true },
    messages: [
      ...(sys ? [{ role: "system" as const, content: sys }] : []),
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  };

  let upstream: Response;
  try {
    upstream = await fetch(`${baseUrl.replace(/\/+$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      // LM Studio kan være langsom ved første token hvis modellen ikke er varm
      signal: AbortSignal.timeout(120_000),
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        error: `Kunne ikke nå LM Studio på ${baseUrl}: ${
          e instanceof Error ? e.message : String(e)
        }`,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return new Response(
      JSON.stringify({
        error: `LM Studio svarede ${upstream.status}: ${text.slice(0, 400)}`,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (obj: unknown) => {
        controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      };

      const reader = upstream.body!.getReader();
      let buffer = "";
      let finishReason: string | null = null;
      let usage: OaiDelta["usage"] = undefined;

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // OpenAI SSE: events separated af "\n\n", hver linje "data: {...}"
          let sep: number;
          while ((sep = buffer.indexOf("\n\n")) !== -1) {
            const rawEvent = buffer.slice(0, sep);
            buffer = buffer.slice(sep + 2);
            for (const line of rawEvent.split("\n")) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data:")) continue;
              const data = trimmed.slice(5).trim();
              if (!data || data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data) as OaiDelta;
                const choice = parsed.choices?.[0];
                const delta = choice?.delta?.content;
                if (delta) emit({ type: "delta", text: delta });
                if (choice?.finish_reason) finishReason = choice.finish_reason;
                if (parsed.usage) usage = parsed.usage;
              } catch {
                // ignorér ugyldig JSON-chunk
              }
            }
          }
        }

        if (usage) emit({ type: "usage", usage });
        emit({ type: "done", finishReason: finishReason ?? "stop" });
      } catch (e) {
        emit({
          type: "error",
          message: e instanceof Error ? e.message : String(e),
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Whitelist of allowed webcam sources — mapped to public JPG URLs.
// Images are served from storebaelt.dk (Sund & Bælt) — public live feeds.
const SOURCES: Record<string, string> = {
  "storebaelt-bro":
    "https://storebaelt.dk/media/ctjpgsqu/webcambro.jpg?width=974&height=700&quality=75",
  "storebaelt-sprogo":
    "https://storebaelt.dk/media/eyyfkvbn/webcamsprogoe.jpg?width=974&height=700&quality=75",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ source: string }> }
) {
  const { source } = await params;
  const upstream = SOURCES[source];
  if (!upstream) {
    return NextResponse.json({ error: "unknown source" }, { status: 404 });
  }

  try {
    // Append cache-buster so we always get a fresh frame.
    const url = `${upstream}&_=${Date.now()}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: {
        // Some sites check referer; use their own origin to pass soft checks.
        Referer: "https://storebaelt.dk/",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: `upstream ${res.status}` },
        { status: 502 }
      );
    }
    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
        "Cache-Control": "public, max-age=30",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "fetch failed" },
      { status: 502 }
    );
  }
}

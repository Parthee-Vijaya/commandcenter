"use client";
import { useState } from "react";
import { usePoll } from "@/hooks/usePoll";
import { Card } from "@/components/ui/Card";
import type { ApodData } from "@/lib/types";

export function ApodWidget() {
  const { data } = usePoll<ApodData>("/api/apod", 60 * 60_000);
  const [expanded, setExpanded] = useState(false);

  const isImage = data?.mediaType === "image" && data.imageUrl;

  return (
    <Card
      title="NASA · Dagens astrobillede"
      className="sm:col-span-2 lg:col-span-6"
      action={
        <span className="text-[10px] font-mono text-cyan-400/60">
          {data?.date ?? ""}
        </span>
      }
      flat
    >
      <div className="space-y-3">
        {isImage ? (
          <div className="relative rounded-md overflow-hidden border border-cyan-400/10 group/apod">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.imageUrl}
              alt={data.title}
              className="w-full h-48 object-cover transition-transform duration-700 group-hover/apod:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090b] via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="text-sm text-cyan-100 font-light">{data.title}</div>
              {data.copyright && (
                <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                  © {data.copyright}
                </div>
              )}
            </div>
          </div>
        ) : data?.mediaType === "video" && data.imageUrl ? (
          <div className="aspect-video rounded-md overflow-hidden border border-cyan-400/10">
            <iframe
              src={data.imageUrl}
              title={data.title}
              className="w-full h-full"
              allow="encrypted-media"
            />
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center text-xs text-neutral-500">
            {data?.error ?? "Indlæser…"}
          </div>
        )}

        {data?.explanation && (
          <div className="text-xs text-neutral-400 leading-relaxed">
            <p className={expanded ? "" : "line-clamp-3"}>{data.explanation}</p>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-[10px] text-cyan-400/70 hover:text-cyan-300 uppercase tracking-wider"
            >
              {expanded ? "Skjul" : "Læs mere"}
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";

export default function MockupLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-[#262626]">
        <div className="max-w-[1800px] mx-auto px-6 py-2.5 flex items-center gap-6 text-xs">
          <span className="text-neutral-500 uppercase tracking-[0.2em]">Mockups</span>
          <Link href="/mockup/a" className="text-neutral-300 hover:text-cyan-400 transition-colors">
            A · Holographic
          </Link>
          <Link href="/mockup/b" className="text-neutral-300 hover:text-cyan-400 transition-colors">
            B · Command Deck
          </Link>
          <Link href="/mockup/c" className="text-neutral-300 hover:text-cyan-400 transition-colors">
            C · Data Symphony
          </Link>
          <div className="flex-1" />
          <Link href="/" className="text-neutral-500 hover:text-neutral-300 transition-colors">
            ← dashboard
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}

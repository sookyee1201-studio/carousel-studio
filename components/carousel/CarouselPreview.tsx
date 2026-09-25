"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import type { GlobalDesign, Page } from "@/lib/types";
import CarouselCanvas from "./CarouselCanvas";

export default function CarouselPreview({ pages, design }: { pages: Page[]; design: GlobalDesign }) {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((x) => Math.min(pages.length - 1, Math.max(0, x + d)));
  const SLIDE = 380, GAP = 20;
  return (
    <div>
      <div className="relative overflow-hidden py-2" onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }} tabIndex={0}>
        <div className="flex transition-transform duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none" style={{ gap: GAP, transform: `translateX(${-(i * (SLIDE + GAP))}px)` }}>
          {pages.map((p, n) => (
            <button key={p.id} onClick={() => setI(n)} aria-label={`P${n + 1}`} className={cn("t block shrink-0 border", n === i ? "border-line opacity-100" : "border-transparent opacity-35 hover:opacity-60")} style={{ width: SLIDE }}>
              <CarouselCanvas page={p} index={n} total={pages.length} design={design} />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 flex items-center gap-5">
        <button onClick={() => go(-1)} disabled={i === 0} aria-label="上一页" className="t flex h-10 w-10 items-center justify-center border border-line hover:border-accent hover:text-accent-ink"><ChevronLeft size={18} /></button>
        <button onClick={() => go(1)} disabled={i === pages.length - 1} aria-label="下一页" className="t flex h-10 w-10 items-center justify-center border border-line hover:border-accent hover:text-accent-ink"><ChevronRight size={18} /></button>
        <div className="flex flex-1 gap-1.5">{pages.map((p, n) => <button key={p.id} aria-label={`P${n + 1}`} onClick={() => setI(n)} className={cn("t h-[3px] flex-1", n === i ? "bg-accent" : "bg-fg/15 hover:bg-fg/35")} />)}</div>
        <span className="font-mono text-[13px] tracking-widest text-mute">{String(i + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

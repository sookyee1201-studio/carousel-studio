"use client";
import { useMemo } from "react";
import CarouselCanvas from "@/components/carousel/CarouselCanvas";
import { cn } from "@/lib/cn";
import { designFor, demoPages, PRESETS } from "@/lib/mock";

export default function PresetPicker({ value, onPick, cols = 3 }: { value: string; onPick: (id: string) => void; cols?: 2 | 3 | 4 }) {
  const pages = useMemo(demoPages, []);
  return (
    <div className={cn("grid gap-4", cols === 2 && "grid-cols-2", cols === 3 && "grid-cols-3", cols === 4 && "grid-cols-4")}>
      {PRESETS.map((p, n) => {
        const active = p.id === value;
        return (
          <button key={p.id} onClick={() => onPick(p.id)} className="t group text-left">
            <div className={cn("t grid grid-cols-3 gap-[3px] overflow-hidden border bg-bg3 p-[3px]", active ? "border-accent ring-1 ring-accent" : "border-line group-hover:border-fg/40")}>
              {[0, 3, 7].map((i) => <CarouselCanvas key={i} page={pages[i]} index={i} total={8} design={designFor(p.id)} detail={false} />)}
            </div>
            <div className="mt-2.5 flex items-baseline justify-between gap-2">
              <span className={cn("t text-[14.5px] font-medium", active ? "text-accent-ink" : "text-fg")}>{p.name}{p.kit && <span className="ml-2 border border-accent-ink/50 px-1.5 py-px font-mono text-[10px] uppercase tracking-widest text-accent-ink">Kit</span>}</span>
              <span className="flex gap-1">{[p.palette.bg, p.palette.accent, p.palette.altBg].map((c, i) => <i key={i} className="block h-2.5 w-2.5 border border-fg/20" style={{ background: c }} />)}</span>
            </div>
            <div className="mt-0.5 text-[13px] text-dim">{p.desc}</div>
          </button>
        );
      })}
    </div>
  );
}

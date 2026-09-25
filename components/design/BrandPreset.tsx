"use client";
import { cn } from "@/lib/cn";
import type { BrandPreset as Brand } from "@/lib/types";

export default function BrandPresetCard({ brand, active, onClick, action }: { brand: Brand; active?: boolean; onClick?: () => void; action?: React.ReactNode }) {
  return (
    <div onClick={onClick} className={cn("t border p-5", onClick && "cursor-pointer", active ? "border-accent bg-accent-dim/40" : "border-line hover:border-fg/30")}>
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center text-[14px] font-bold tracking-widest" style={{ background: brand.primary, color: brand.accent, border: "1px solid rgba(255,255,255,0.14)" }}>
          {brand.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0"><div className="text-[17px] font-semibold">{brand.name}</div><div className="text-[13.5px] text-dim">{brand.designStyle}</div></div>
      </div>
      <div className="mt-5 flex gap-1.5">
        {[brand.primary, brand.secondary, brand.accent].map((c, i) => <span key={i} className="h-6 flex-1 border border-fg/10" style={{ background: c }} />)}
      </div>
      <dl className="mt-4 space-y-1.5 text-[13.5px]">
        <div className="flex justify-between gap-4"><dt className="text-dim">Font</dt><dd className="text-right text-mute">{brand.font}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-dim">Image</dt><dd className="text-right text-mute">{brand.imageStyle}</dd></div>
      </dl>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

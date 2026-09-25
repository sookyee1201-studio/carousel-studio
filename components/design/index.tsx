"use client";
import { useState, type ReactNode } from "react";
import { Check, ChevronDown, Minus } from "lucide-react";
import CarouselCanvas from "@/components/carousel/CarouselCanvas";
import PageThumbnail from "@/components/carousel/PageThumbnail";
import { Chip, Label, Segmented, Slider } from "@/components/ui";
import { cn } from "@/lib/cn";
import { rhythmCaption, type Check as Chk } from "@/lib/engine";
import { IMAGE_STRATEGY, LAYOUTS, STYLE_CHOICES, VISUAL_CHOICES, VISUAL_TYPES, visualOf } from "@/lib/mock";
import type { GlobalDesign, LayoutId, Page, TypeCfg } from "@/lib/types";

/* ───────── collapsible section ───────── */
export function Section({ no, title, desc, defaultOpen = true, children }: { no: string; title: string; desc?: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-t border-line">
      <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className="t group flex w-full items-baseline gap-4 py-6 text-left">
        <span className="font-mono text-[12px] tracking-widest text-dim">{no}</span>
        <span className="flex-1"><span className="block text-[22px] font-semibold tracking-[-0.01em]">{title}</span>{desc && <span className="mt-1 block text-[14.5px] text-mute">{desc}</span>}</span>
        <ChevronDown size={18} strokeWidth={1.5} className={cn("t self-center text-dim group-hover:text-fg", open && "rotate-180")} />
      </button>
      {open && <div className="enter pb-12">{children}</div>}
    </section>
  );
}

/* ───────── style / visual selectors ───────── */
export function StyleSelector({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (s: string) => onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s]);
  return <div className="flex flex-wrap gap-2">{STYLE_CHOICES.map(([k, l]) => <Chip key={k} active={value.includes(k)} onClick={() => toggle(k)}>{l}</Chip>)}</div>;
}

export function VisualSelector({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (s: string) => onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s]);
  return (
    <div className="grid grid-cols-4 gap-x-6 gap-y-3">
      {VISUAL_CHOICES.map((v) => {
        const on = value.includes(v);
        return (
          <button key={v} onClick={() => toggle(v)} role="checkbox" aria-checked={on} className="t flex items-center gap-2.5 py-1.5 text-left text-[15px] text-mute hover:text-fg">
            <span className={cn("t flex h-4 w-4 shrink-0 items-center justify-center border", on ? "border-fg bg-fg text-bg" : "border-fg/25")}>{on && <Check size={11} strokeWidth={3} />}</span>
            <span className={on ? "text-fg" : ""}>{v}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ───────── visual rhythm ───────── */
export function VisualRhythm({ pages, design, selectedId, onSelect, onVisual }:
  { pages: Page[]; design: GlobalDesign; selectedId: string; onSelect: (id: string) => void; onVisual: (id: string, layout: LayoutId) => void }) {
  const sel = pages.find((p) => p.id === selectedId) ?? pages[0];
  const si = pages.indexOf(sel);
  return (
    <div>
      <div className="relative">
        <div className="absolute left-0 right-0 top-[-10px] h-px bg-line" />
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${pages.length}, minmax(0, 1fr))` }}>
          {pages.map((p, i) => (
            <div key={p.id} className="relative">
              <span className={cn("absolute left-1/2 top-[-13px] h-[7px] w-[7px] -translate-x-1/2 rounded-full", p.id === sel.id ? "bg-accent" : "bg-dim")} />
              <PageThumbnail page={p} index={i} total={pages.length} design={design} active={p.id === sel.id} onClick={() => onSelect(p.id)} />
              <div className="mt-2 font-mono text-[11.5px] tracking-widest text-dim">P{i + 1}</div>
              <div className="text-[12.5px] leading-tight text-mute">{rhythmCaption(p)}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 flex items-center gap-3 border-t border-line2 pt-5">
        <Label className="shrink-0">P{si + 1} · Visual Type</Label>
        <div className="flex flex-wrap gap-1.5">
          {VISUAL_TYPES.map((v) => (
            <button key={v.type} onClick={() => onVisual(sel.id, v.layout)} className={cn("t h-7 rounded-[3px] border px-2.5 text-[13px]", visualOf(sel.layout) === v.type ? "border-accent text-accent-ink" : "border-line text-mute hover:border-fg/30 hover:text-fg")}>{v.type}</button>
          ))}
        </div>
      </div>
      <p className="mt-4 text-[14px] text-dim">不要让 8 页看起来完全一样。每一页的视觉类型都可以改，内容不会受影响。</p>
    </div>
  );
}

/* ───────── image strategy ───────── */
export function ImageStrategy() {
  return (
    <div>
      <div className="divide-y divide-line2 border-y border-line2">
        {IMAGE_STRATEGY.map((r) => (
          <div key={r.type} className="grid grid-cols-[130px_1fr_200px] items-baseline gap-4 py-3 text-[15px]">
            <span className="font-mono text-[12.5px] uppercase tracking-widest text-mute">{r.type}</span>
            <span className="text-fg">→ {r.visual}</span>
            <span className="text-[13.5px] text-dim">{r.note}</span>
          </div>
        ))}
        <div className="grid grid-cols-[130px_1fr_200px] items-baseline gap-4 py-3 text-[15px]">
          <span className="font-mono text-[12.5px] uppercase tracking-widest text-accent-ink">No value</span>
          <span className="text-fg">→ No Image / Typography Only</span>
          <span className="text-[13.5px] text-dim" />
        </div>
      </div>
      <p className="mt-4 text-[14.5px] text-accent-ink">不要为了设计而硬塞图片。</p>
    </div>
  );
}

/* ───────── layout presets ───────── */
export function LayoutPreset({ page, index, total, design, onPick, cols = 5 }: { page: Page; index: number; total: number; design: GlobalDesign; onPick: (l: LayoutId) => void; cols?: 3 | 4 | 5 }) {
  return (
    <div className={cols === 3 ? "grid grid-cols-3 gap-3" : cols === 4 ? "grid grid-cols-4 gap-3" : "grid grid-cols-5 gap-3"}>
      {LAYOUTS.map((l) => {
        const preview: Page = { ...page, layout: l.id, image: { ...page.image, mode: page.image.mode === "none" ? "none" : ["headline-image", "screenshot"].includes(l.id) ? "screenshot" : "placeholder" } };
        const active = page.layout === l.id;
        return (
          <button key={l.id} onClick={() => onPick(l.id)} className="t group text-left" title={l.hint}>
            <div className={cn("t overflow-hidden border", active ? "border-accent ring-1 ring-accent" : "border-line group-hover:border-fg/40")}>
              <CarouselCanvas page={preview} index={index} total={total} design={design} detail={false} />
            </div>
            <div className="mt-1.5 flex gap-1.5 text-[12.5px]"><span className="font-mono text-dim">{l.no}</span><span className={active ? "text-accent-ink" : "text-mute"}>{l.name}</span></div>
          </button>
        );
      })}
    </div>
  );
}

/* ───────── quality checklist ───────── */
export function QualityChecklist({ title, items }: { title: string; items: Chk[] }) {
  return (
    <div>
      <Label className="mb-3">{title}</Label>
      <ul className="space-y-2.5">
        {items.map((c, i) => (
          <li key={i} className="flex items-start gap-3 text-[15px]">
            <span className={cn("mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center", c.ok ? "text-ok" : "text-accent-ink")}>{c.ok ? <Check size={15} strokeWidth={2.5} /> : <Minus size={15} strokeWidth={2.5} />}</span>
            <span className={c.ok ? "text-fg/90" : "text-fg"}>{c.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────── per-page typography ───────── */
export function TypographyControl({ t, onChange }: { t: TypeCfg; onChange: (p: Partial<TypeCfg>) => void }) {
  return (
    <div className="space-y-5">
      <div className="space-y-2"><Label>Font Family</Label><Segmented value={t.font} onChange={(font) => onChange({ font })} options={[{ v: "sans", label: "Sans" }, { v: "serif", label: "Serif" }]} className="w-full" /></div>
      <div className="space-y-2"><Label>Font Weight</Label><Segmented value={t.weight} onChange={(weight) => onChange({ weight })} options={[{ v: 400, label: "400" }, { v: 500, label: "500" }, { v: 700, label: "700" }, { v: 800, label: "800" }]} className="w-full" /></div>
      <Slider label="Font Size" value={t.size} min={40} max={140} onChange={(size) => onChange({ size })} unit="px" />
      <Slider label="Line Height" value={t.lineHeight} min={0.9} max={1.8} step={0.05} onChange={(lineHeight) => onChange({ lineHeight })} />
      <Slider label="Letter Spacing" value={t.tracking} min={-6} max={12} onChange={(tracking) => onChange({ tracking })} unit="%" />
      <Slider label="Text Width" value={t.width} min={40} max={100} onChange={(width) => onChange({ width })} unit="%" />
      <div className="space-y-2"><Label>Alignment</Label><Segmented value={t.align} onChange={(align) => onChange({ align })} options={[{ v: "left", label: "Left" }, { v: "center", label: "Center" }, { v: "right", label: "Right" }]} className="w-full" /></div>
      <div className="space-y-2"><Label>Vertical</Label><Segmented value={t.valign} onChange={(valign) => onChange({ valign })} options={[{ v: "top", label: "Top" }, { v: "middle", label: "Middle" }, { v: "bottom", label: "Bottom" }]} className="w-full" /></div>
      <div className="grid grid-cols-2 gap-4"><Slider label="Position X" value={t.x} min={-200} max={200} onChange={(x) => onChange({ x })} unit="px" /><Slider label="Position Y" value={t.y} min={-300} max={300} onChange={(y) => onChange({ y })} unit="px" /></div>
    </div>
  );
}

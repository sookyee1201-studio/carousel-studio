"use client";
import { useEffect, useLayoutEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useStudio } from "@/lib/store";

export function Button({ variant = "secondary", size = "md", className, ...p }:
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger"; size?: "sm" | "md" | "lg" }) {
  return (
    <button
      {...p}
      className={cn(
        "t press inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[3px] font-medium",
        size === "sm" && "h-8 px-3 text-[13.5px]", size === "md" && "h-10 px-4 text-[15px]", size === "lg" && "h-12 px-6 text-[16px]",
        variant === "primary" && "bg-fg text-bg hover:bg-[#3b342b]",
        variant === "secondary" && "border border-line bg-transparent text-fg hover:border-fg/30 hover:bg-fg/[0.04]",
        variant === "ghost" && "text-mute hover:text-fg hover:bg-fg/[0.05]",
        variant === "danger" && "border border-line text-mute hover:border-danger/60 hover:text-danger",
        className,
      )}
    />
  );
}

export function Chip({ active, children, onClick, className }: { active?: boolean; children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={active}
      className={cn("t press h-9 rounded-[3px] border px-3.5 text-[14px]",
        active ? "border-fg bg-fg text-bg" : "border-line text-mute hover:border-fg/30 hover:text-fg", className)}
    >{children}</button>
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("label", className)}>{children}</div>;
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between"><Label>{label}</Label>{hint && <span className="text-[12.5px] text-dim">{hint}</span>}</div>
      {children}
    </div>
  );
}

export function Slider({ label, value, min, max, step = 1, unit = "", onChange }:
  { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between"><span className="text-[13.5px] text-mute">{label}</span><span className="font-mono text-[13px] text-fg">{value}{unit}</span></div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} aria-label={label} />
    </div>
  );
}

export function Segmented<T extends string | number>({ value, options, onChange, className }:
  { value: T; options: { v: T; label: ReactNode }[]; onChange: (v: T) => void; className?: string }) {
  return (
    <div className={cn("inline-flex rounded-[3px] border border-line p-0.5", className)}>
      {options.map((o) => (
        <button key={String(o.v)} type="button" onClick={() => onChange(o.v)}
          className={cn("t h-7 flex-1 rounded-[2px] px-2.5 text-[13.5px]", o.v === value ? "bg-fg/10 text-fg" : "text-mute hover:text-fg")}>{o.label}</button>
      ))}
    </div>
  );
}

export function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const hex = value.startsWith("#") ? value : "#888888";
  return (
    <label className="group flex items-center gap-3">
      <span className="relative block h-8 w-8 shrink-0 overflow-hidden rounded-[3px] border border-line" style={{ background: value }}>
        <input type="color" value={hex.length === 7 ? hex : "#888888"} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 opacity-0" aria-label={label} />
      </span>
      <span className="min-w-0"><span className="block text-[13.5px] text-fg">{label}</span><span className="block font-mono text-[12px] uppercase text-dim">{value.startsWith("#") ? value : "rgba"}</span></span>
    </label>
  );
}

export function Toast() {
  const { toast } = useStudio();
  const [shown, setShown] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    setShown(toast.msg);
    const t = setTimeout(() => setShown(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);
  if (!shown) return null;
  return (
    <div role="status" className="enter fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-[3px] border border-line bg-card px-4 py-2.5 text-[14px] text-fg shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" />{shown}
    </div>
  );
}

export function StepShell({ eyebrow, title, desc, children, footer, wide }:
  { eyebrow: string; title: string; desc?: string; children: ReactNode; footer: ReactNode; wide?: boolean }) {
  return (
    <div className="enter flex min-h-[calc(100vh-65px)] flex-col">
      <div className={cn("mx-auto w-full flex-1 px-12 pt-14 pb-32", wide ? "max-w-[1240px]" : "max-w-[1000px]")}>
        <Label className="mb-4 text-accent-ink">{eyebrow}</Label>
        <h1 className="max-w-[820px] text-[44px] font-semibold leading-[1.15] tracking-[-0.02em]">{title}</h1>
        {desc && <p className="mt-4 max-w-[640px] text-[17px] text-mute">{desc}</p>}
        <div className="mt-12">{children}</div>
      </div>
      <div className="sticky bottom-0 z-20 border-t border-line bg-bg/90 backdrop-blur">
        <div className={cn("mx-auto flex w-full items-center justify-between gap-4 px-12 py-4", wide ? "max-w-[1240px]" : "max-w-[1000px]")}>{footer}</div>
      </div>
    </div>
  );
}

export function Spinner({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-start gap-3 py-24">
      <div className="flex gap-1.5">{[0, 1, 2, 3].map((i) => <span key={i} className="pulse h-[3px] w-8 bg-accent" style={{ animationDelay: `${i * 140}ms` }} />)}</div>
      <p className="text-[16px] text-mute">{text}</p>
    </div>
  );
}

export function AutoText({ value, onChange, className, placeholder, rows = 1, ...rest }:
  { value: string; onChange: (v: string) => void; className?: string; placeholder?: string; rows?: number } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value" | "rows">) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => { const el = ref.current; if (!el) return; el.style.height = "0px"; el.style.height = el.scrollHeight + "px"; }, [value]);
  return <textarea ref={ref} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={cn("block w-full resize-none bg-transparent outline-none", className)} {...rest} />;
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="t flex w-full items-center justify-between gap-3 py-1.5 text-left">
      <span className="text-[14.5px] text-fg">{label}</span>
      <span className={cn("t relative h-[22px] w-10 shrink-0 rounded-full", checked ? "bg-fg" : "bg-fg/20")}>
        <span className={cn("t absolute top-[3px] h-4 w-4 rounded-full bg-bg", checked ? "left-[21px]" : "left-[3px]")} />
      </span>
    </button>
  );
}

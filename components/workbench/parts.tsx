"use client";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** 一个设置项：标题 + 一句大白话说明 + 控件 */
export function Row({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2.5">
      <div>
        <div className="text-[15.5px] leading-snug text-fg">{title}</div>
        {hint && <div className="mt-0.5 text-[13.5px] leading-snug text-dim">{hint}</div>}
      </div>
      {children}
    </div>
  );
}

/** 药丸选项（单选） */
export function Pills<T extends string | number>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={String(o.v)} type="button" onClick={() => onChange(o.v)} aria-pressed={o.v === value}
          className={cn("t press h-10 rounded-full border px-4 text-[14.5px]", o.v === value ? "border-fg bg-fg text-bg" : "border-line text-mute hover:border-fg/40 hover:text-fg")}>{o.label}</button>
      ))}
    </div>
  );
}

/** 标签下面的小标签（圆角胶囊） */
export function SubTabs<T extends string>({ value, items, onChange }: { value: T; items: T[]; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-line2 pb-4">
      {items.map((s) => (
        <button key={s} type="button" onClick={() => onChange(s)} aria-pressed={s === value}
          className={cn("t h-9 rounded-full border px-4 text-[14px]", s === value ? "border-fg bg-fg text-bg" : "border-line text-mute hover:border-fg/40 hover:text-fg")}>{s}</button>
      ))}
    </div>
  );
}

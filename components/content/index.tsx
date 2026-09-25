"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Copy, GripVertical, Pencil, RefreshCw, Trash2 } from "lucide-react";
import { AutoText, Label } from "@/components/ui";
import { cn } from "@/lib/cn";
import { ROLES } from "@/lib/mock";
import type { AnalysisItem, Hook, InputState, Page } from "@/lib/types";

/* ───────── input type ───────── */
export const INPUT_TYPES: { v: InputState["type"]; label: string }[] = [
  { v: "topic", label: "主题 / Idea" }, { v: "link", label: "Reference Link" }, { v: "transcript", label: "Transcript" },
  { v: "existing", label: "Existing Content" }, { v: "screenshot", label: "Screenshot" },
];
export function InputTypeSelector({ value, onChange }: { value: InputState["type"]; onChange: (v: InputState["type"]) => void }) {
  return (
    <div className="flex flex-wrap border-b border-line">
      {INPUT_TYPES.map((t) => (
        <button key={t.v} onClick={() => onChange(t.v)} className={cn("t relative px-4 pb-3 pt-1 text-[15px]", value === t.v ? "text-fg" : "text-mute hover:text-fg")}>
          {t.label}
          {value === t.v && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-accent" />}
        </button>
      ))}
    </div>
  );
}

/* ───────── strategy card ───────── */
export function StrategyCard({ item, onEdit, onRegen, featured }: { item: AnalysisItem; onEdit: (v: string) => void; onRegen: () => void; featured?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [spin, setSpin] = useState(0);
  return (
    <div className={cn("group relative border-t pt-5 pb-7", featured ? "border-accent" : "border-line", item.wide && "col-span-2")}>
      <div className="flex items-center justify-between">
        <Label className={featured ? "text-accent-ink" : ""}><span className="mr-3 text-dim">{item.no}</span>{item.label}</Label>
        <div className="flex gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
          <button onClick={() => setEditing((e) => !e)} className="t flex items-center gap-1.5 rounded-[3px] px-2 py-1 text-[13px] text-mute hover:bg-fg/[0.06] hover:text-fg">{editing ? <Check size={12} /> : <Pencil size={12} />}{editing ? "完成" : "Edit"}</button>
          <button onClick={() => { setSpin((s) => s + 1); onRegen(); }} className="t flex items-center gap-1.5 rounded-[3px] px-2 py-1 text-[13px] text-mute hover:bg-fg/[0.06] hover:text-fg"><RefreshCw size={12} style={{ transform: `rotate(${spin * 180}deg)`, transition: "transform 240ms cubic-bezier(0.22,1,0.36,1)" }} />Regenerate</button>
        </div>
      </div>
      {editing
        ? <AutoText value={item.value} onChange={onEdit} autoFocus className="field mt-3 text-[17px]" />
        : <p className={cn("mt-3 leading-relaxed", featured || item.wide ? "text-[19px] leading-[1.55] text-fg" : "text-[17px] text-fg/90")}>{item.value}</p>}
    </div>
  );
}

/* ───────── hook card ───────── */
const STRENGTH: Record<Hook["strength"], string> = { Strong: "text-ok", Medium: "text-fg/70", Experimental: "text-accent-ink" };
export function HookCard({ hook, selected, onSelect, onEdit, onRegen }:
  { hook: Hook; selected: boolean; onSelect: () => void; onEdit: (v: string) => void; onRegen: () => void }) {
  const [editing, setEditing] = useState(false);
  return (
    <div onClick={onSelect} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && e.target === e.currentTarget && onSelect()}
      className={cn("t group flex cursor-pointer flex-col border p-6", selected ? "border-accent bg-accent-dim/30" : "border-line hover:border-fg/30 hover:bg-fg/[0.02]")}>
      <div className="flex items-center justify-between">
        <Label className={selected ? "text-accent-ink" : ""}>Hook {hook.no}</Label>
        <span className="flex items-center gap-2 text-[12.5px]"><span className={cn("font-mono uppercase tracking-widest", STRENGTH[hook.strength])}>{hook.strength}</span></span>
      </div>
      <div className="mt-1.5 text-[13.5px] text-dim">{hook.framework}</div>
      {editing
        ? <AutoText value={hook.copy} onChange={onEdit} autoFocus onClick={(e) => e.stopPropagation()} className="field mt-4 text-[22px] font-semibold leading-snug" />
        : <p className="mt-4 whitespace-pre-line text-[23px] font-semibold leading-[1.35] tracking-[-0.01em]">{hook.copy}</p>}
      <div className="mt-5 space-y-2 border-t border-line2 pt-4 text-[14px] leading-relaxed">
        <p><span className="text-dim">为什么有效　</span><span className="text-mute">{hook.why}</span></p>
        <p><span className="text-dim">针对心理　</span><span className="text-mute">{hook.psychology}</span></p>
      </div>
      <div className="mt-4 flex gap-1 -ml-2 opacity-60 transition-opacity duration-150 group-hover:opacity-100">
        <button onClick={(e) => { e.stopPropagation(); setEditing((x) => !x); }} className="t flex items-center gap-1.5 rounded-[3px] px-2 py-1 text-[13px] text-mute hover:bg-fg/[0.06] hover:text-fg">{editing ? <Check size={12} /> : <Pencil size={12} />}{editing ? "完成" : "编辑"}</button>
        <button onClick={(e) => { e.stopPropagation(); onRegen(); }} className="t flex items-center gap-1.5 rounded-[3px] px-2 py-1 text-[13px] text-mute hover:bg-fg/[0.06] hover:text-fg"><RefreshCw size={12} />重新生成类似 Hook</button>
        {selected && <span className="ml-auto flex items-center gap-1 pr-2 text-[13px] text-accent-ink"><Check size={13} strokeWidth={2.5} />已选择</span>}
      </div>
    </div>
  );
}

/* ───────── page card (story structure) ───────── */
export function CarouselPageCard({ page, index, total, dragProps, dragging, dropTarget, onChange, onRole, onDuplicate, onDelete, onMove }:
  {
    page: Page; index: number; total: number; dragProps: object; dragging: boolean; dropTarget: boolean;
    onChange: (p: Partial<Page>) => void; onRole: (r: Page["role"]) => void; onDuplicate: () => void; onDelete: () => void; onMove: (d: -1 | 1) => void;
  }) {
  return (
    <div {...dragProps} className={cn("t group grid grid-cols-[132px_1fr_260px] gap-8 border-t py-7", dropTarget ? "border-accent" : "border-line", dragging && "opacity-40")}>
      <div className="flex items-start gap-3">
        <GripVertical size={16} className="mt-1 shrink-0 cursor-grab text-dim group-hover:text-mute" aria-label="拖动排序" />
        <div className="min-w-0">
          <div className="font-serif text-[34px] leading-none">P{index + 1}</div>
          <select value={page.role} onChange={(e) => onRole(e.target.value as Page["role"])} aria-label="Page Role"
            className="t mt-3 -ml-1 w-full cursor-pointer appearance-none bg-transparent px-1 py-0.5 font-mono text-[12px] uppercase tracking-[0.12em] text-accent-ink outline-none hover:bg-fg/[0.06]">
            {ROLES.map((r) => <option key={r} value={r} className="bg-card text-fg">{r}</option>)}
          </select>
        </div>
      </div>
      <div className="min-w-0">
        <AutoText value={page.headline} onChange={(v) => onChange({ headline: v })} placeholder="这一页的标题…" className="t -mx-2 rounded-[3px] px-2 py-1 text-[24px] font-semibold leading-[1.35] tracking-[-0.01em] hover:bg-fg/[0.04] focus:bg-fg/[0.06]" />
        <AutoText value={page.body} onChange={(v) => onChange({ body: v })} placeholder="正文（可选）" className="t -mx-2 mt-1 rounded-[3px] px-2 py-1 text-[16px] leading-relaxed text-mute hover:bg-fg/[0.04] focus:bg-fg/[0.06]" />
      </div>
      <div className="space-y-4 text-[14px]">
        <div><Label className="mb-1">Purpose</Label><AutoText value={page.purpose} onChange={(v) => onChange({ purpose: v })} className="t -mx-1.5 rounded-[3px] px-1.5 py-0.5 text-mute hover:bg-fg/[0.04] focus:bg-fg/[0.06]" /></div>
        <div><Label className="mb-1">Swipe Reason</Label><AutoText value={page.swipeReason} onChange={(v) => onChange({ swipeReason: v })} className="t -mx-1.5 rounded-[3px] px-1.5 py-0.5 text-mute hover:bg-fg/[0.04] focus:bg-fg/[0.06]" /></div>
        <div className="flex gap-0.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-within:opacity-100">
          <IconBtn label="上移" onClick={() => onMove(-1)} disabled={index === 0}><ArrowUp size={14} /></IconBtn>
          <IconBtn label="下移" onClick={() => onMove(1)} disabled={index === total - 1}><ArrowDown size={14} /></IconBtn>
          <IconBtn label="Duplicate" onClick={onDuplicate}><Copy size={14} /></IconBtn>
          <IconBtn label="Delete" onClick={onDelete} disabled={total <= 1} danger><Trash2 size={14} /></IconBtn>
        </div>
      </div>
    </div>
  );
}

export function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" title={label} aria-label={label} disabled={disabled} onClick={onClick}
      className={cn("t flex h-7 w-7 items-center justify-center rounded-[3px] text-mute hover:bg-fg/[0.08]", danger ? "hover:text-danger" : "hover:text-fg")}>{children}</button>
  );
}

/* ───────── content approval ───────── */
export function ContentApproval({ status }: { status: "draft" | "approved" | "changed" }) {
  if (status === "approved") return <div className="flex items-center gap-3"><span className="label flex items-center gap-1.5 text-ok"><Check size={13} strokeWidth={2.5} />Content Approved</span><span className="text-[13.5px] text-dim">内容已锁定，可以开始设计。</span></div>;
  if (status === "changed") return <div className="flex items-center gap-3"><span className="label text-danger">● 内容已修改</span><span className="text-[13.5px] text-mute">内容已修改，需要重新确认。</span></div>;
  return <div className="flex items-center gap-3"><span className="label text-dim">○ 等待确认</span><span className="text-[13.5px] text-dim">内容确认后，我们才开始决定怎么设计。</span></div>;
}

"use client";
import { useMemo } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { designFor, demoPages } from "@/lib/mock";
import type { GlobalDesign, Page, ProjectStatus } from "@/lib/types";
import CarouselCanvas from "./CarouselCanvas";

export const STATUS_STYLE: Record<ProjectStatus, string> = {
  Draft: "bg-dim", "等待内容确认": "bg-accent", "等待设计": "bg-fg", "已完成": "bg-ok",
};

export function StatusDot({ status }: { status: ProjectStatus }) {
  return <span className="flex items-center gap-2 whitespace-nowrap text-[13.5px] text-mute"><span className={cn("h-1.5 w-1.5 rounded-full", STATUS_STYLE[status])} />{status}</span>;
}

export interface ProjectItem {
  key: string; title: string; client: string; format: string; status: ProjectStatus; edited: string;
  presetId?: string; pages?: Page[] | null; design?: GlobalDesign | null; saved?: boolean;
  open: () => void; remove?: () => void;
}

export function MiniStrip({ item }: { item: Pick<ProjectItem, "presetId" | "pages" | "design"> }) {
  const demo = useMemo(demoPages, []);
  const pages = item.pages?.length ? item.pages : demo;
  const design = useMemo(() => item.design ?? designFor(item.presetId ?? "dark-editorial"), [item.design, item.presetId]);
  const shown = pages.slice(0, 8);
  return (
    <div className="grid grid-cols-8 gap-[3px]">
      {shown.map((p, i) => <CarouselCanvas key={p.id} page={p} index={i} total={pages.length} design={design} detail={false} />)}
    </div>
  );
}

export function DeleteBtn({ onClick }: { onClick: () => void }) {
  return (
    <button aria-label="删除项目" title="删除项目" onClick={(e) => { e.stopPropagation(); if (window.confirm("确定删除这个项目吗？删除后无法恢复。")) onClick(); }}
      className="t flex h-8 w-8 items-center justify-center rounded-[3px] text-dim hover:bg-fg/[0.06] hover:text-danger"><Trash2 size={15} /></button>
  );
}

export default function ProjectCard({ item }: { item: ProjectItem }) {
  return (
    <div className="group relative">
      <button onClick={item.open} className="t block w-full text-left">
        <div className="t bg-bg3 p-4 group-hover:bg-card2"><MiniStrip item={item} /></div>
        <div className="pt-4">
          <div className="flex items-start justify-between gap-4">
            <h3 className="t text-[18px] font-semibold leading-snug tracking-[-0.01em] group-hover:text-accent-ink">{item.title}</h3>
            <StatusDot status={item.status} />
          </div>
          <div className="mt-2 flex items-center gap-3 text-[13.5px] text-dim">
            <span className="text-mute">{item.client}</span><span>·</span><span>{item.format}</span><span>·</span><span>{item.edited}</span>
          </div>
        </div>
      </button>
      {item.remove && <div className="absolute right-2 top-2 opacity-60 transition-opacity duration-150 hover:opacity-100 group-hover:opacity-100 focus-within:opacity-100"><div className="bg-bg/90"><DeleteBtn onClick={item.remove} /></div></div>}
    </div>
  );
}

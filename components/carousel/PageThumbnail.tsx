"use client";
import { cn } from "@/lib/cn";
import type { GlobalDesign, Page } from "@/lib/types";
import CarouselCanvas from "./CarouselCanvas";

export default function PageThumbnail({ page, index, total, design, active, onClick, className }:
  { page: Page; index: number; total: number; design: GlobalDesign; active?: boolean; onClick?: () => void; className?: string }) {
  const inner = <CarouselCanvas page={page} index={index} total={total} design={design} detail={false} />;
  const cls = cn("t block w-full overflow-hidden border", active ? "border-accent ring-1 ring-accent" : "border-line", onClick && !active && "hover:border-fg/40", className);
  return onClick
    ? <button type="button" onClick={onClick} className={cls} aria-label={`P${index + 1}`}>{inner}</button>
    : <div className={cls}>{inner}</div>;
}

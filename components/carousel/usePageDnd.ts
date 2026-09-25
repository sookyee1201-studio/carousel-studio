"use client";
import { useState, type DragEvent } from "react";

export function usePageDnd(reorder: (from: number, to: number) => void) {
  const [from, setFrom] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  return {
    from, over,
    bind: (i: number) => ({
      draggable: true,
      onDragStart: (e: DragEvent) => { setFrom(i); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", String(i)); },
      onDragOver: (e: DragEvent) => { e.preventDefault(); setOver(i); },
      onDrop: (e: DragEvent) => { e.preventDefault(); if (from !== null) reorder(from, i); setFrom(null); setOver(null); },
      onDragEnd: () => { setFrom(null); setOver(null); },
    }),
  };
}

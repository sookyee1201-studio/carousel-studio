"use client";
import { Redo2, Undo2 } from "lucide-react";
import { IconBtn } from "@/components/content";
import { useStudio } from "@/lib/store";

export default function UndoRedo() {
  const { undo, redo, canUndo, canRedo } = useStudio();
  return (
    <div className="flex items-center">
      <IconBtn label="撤销 (⌘Z)" onClick={undo} disabled={!canUndo}><Undo2 size={16} /></IconBtn>
      <IconBtn label="重做 (⇧⌘Z)" onClick={redo} disabled={!canRedo}><Redo2 size={16} /></IconBtn>
    </div>
  );
}

"use client";
import { useState } from "react";
import { ArrowLeft, Maximize2, Plus, X } from "lucide-react";
import CarouselCanvas from "@/components/carousel/CarouselCanvas";
import CarouselPreview from "@/components/carousel/CarouselPreview";
import PageThumbnail from "@/components/carousel/PageThumbnail";
import { usePageDnd } from "@/components/carousel/usePageDnd";
import UndoRedo from "@/components/design/UndoRedo";
import PhotoUpload from "@/components/design/PhotoUpload";
import { Chip } from "@/components/ui";
import { cn } from "@/lib/cn";
import { layoutName } from "@/lib/engine";
import { KITS } from "@/lib/kits";
import { useStudio } from "@/lib/store";
import ContentTab from "./ContentTab";
import FinishTab from "./FinishTab";
import LayoutTab from "./LayoutTab";
import PictureTab from "./PictureTab";
import StyleTab from "./StyleTab";

const TABS = ["风格", "内容", "版式", "画面", "完成"] as const;
type Tab = (typeof TABS)[number];

export default function Workbench({ topOffset = 0 }: { topOffset?: number }) {
  const { pages, design, selectedPageId, selectPage, updatePage, reorder, addPage, project, setProjectTitle, setView, advanced, saveState, savedAt } = useStudio();
  const [tab, setTab] = useState<Tab>("风格");
  const [guides, setGuides] = useState(false);
  const [full, setFull] = useState(false);
  const dnd = usePageDnd(reorder);
  const idx = Math.max(0, pages.findIndex((p) => p.id === selectedPageId));
  const page = pages[idx];
  const kit = KITS[design.kit ?? "basic"];

  return (
    <div className="flex" style={{ height: `calc(100vh - ${topOffset}px)` }}>
      {/* ───── 左：调整区 ───── */}
      <div className="flex w-[560px] shrink-0 flex-col border-r border-line bg-bg">
        <div className="flex items-center gap-3 px-6 pb-3 pt-5">
          {!advanced && (
            <button onClick={() => setView("dashboard")} className="t flex items-center gap-1.5 text-[14px] text-mute hover:text-fg" aria-label="回到工作台"><ArrowLeft size={16} />工作台</button>
          )}
          <input value={project.title} onChange={(e) => setProjectTitle(e.target.value)} aria-label="项目名称"
            className="t min-w-0 flex-1 rounded-[3px] bg-transparent px-2 py-1 text-[17px] font-medium outline-none hover:bg-fg/[0.04] focus:bg-fg/[0.06]" />
          <span className="whitespace-nowrap text-[13px] text-dim" aria-live="polite">
            {saveState === "saving" ? "保存中…" : saveState === "saved" && savedAt ? `已保存 ${savedAt.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}` : saveState === "error" ? "保存失败" : ""}
          </span>
        </div>

        <div className="px-6">
          <div className="flex rounded-full border border-line bg-bg2 p-1" role="tablist">
            {TABS.map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
                className={cn("t h-11 flex-1 rounded-full text-[15.5px]", tab === t ? "bg-card font-medium text-fg shadow-[0_1px_4px_rgba(31,27,22,0.15)]" : "text-mute hover:text-fg")}>{t}</button>
            ))}
          </div>
        </div>

        <div key={tab} className="slide-in min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {tab === "风格" && <StyleTab />}
          {tab === "内容" && <ContentTab page={page} index={idx} />}
          {tab === "版式" && <LayoutTab page={page} index={idx} />}
          {tab === "画面" && <PictureTab page={page} />}
          {tab === "完成" && <FinishTab page={page} index={idx} />}
        </div>
      </div>

      {/* ───── 右：实时预览 ───── */}
      <div className="flex min-w-0 flex-1 flex-col bg-bg2">
        <div className="flex items-center justify-between px-8 pt-5">
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-[30px] leading-none">P{idx + 1}</span>
            <span className="label text-accent-ink">{page.role}</span>
            <span className="text-[13.5px] text-dim">{layoutName(page.layout)}</span>
          </div>
          <div className="flex items-center gap-2">
            <UndoRedo />
            <Chip active={guides} onClick={() => setGuides((g) => !g)} className="h-9 text-[13.5px]">安全区</Chip>
            <button onClick={() => setFull(true)} className="t flex h-9 items-center gap-2 rounded-full bg-fg px-4 text-[14px] font-medium text-bg hover:bg-[#3b342b]"><Maximize2 size={14} />满版预览</button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 px-8 py-4">
          {kit.usesPhoto && !design.photo && <div className="w-full max-w-[560px]"><PhotoUpload /></div>}
          <div className="min-h-0 flex-1" style={{ aspectRatio: "1080/1350", maxWidth: "100%" }}>
            <div className="h-full border border-line shadow-[0_18px_50px_rgba(31,27,22,0.22)]">
              <CarouselCanvas key={page.id + page.layout} page={page} index={idx} total={pages.length} design={design} guides={guides} className="enter"
                editable={{ onText: (f, v) => updatePage(page.id, { [f]: v }), onMove: (x, y) => updatePage(page.id, { type: { ...page.type, x, y } }) }} />
            </div>
          </div>
          <p className="text-[13px] text-dim">点画面上的文字直接修改，拖动文字调整位置</p>
        </div>

        <div className="border-t border-line bg-bg px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {pages.map((p, i) => (
              <div key={p.id} {...dnd.bind(i)} className={cn("w-[62px] shrink-0", dnd.from === i && "opacity-40", dnd.over === i && dnd.from !== i && "outline outline-1 outline-accent")}>
                <PageThumbnail page={p} index={i} total={pages.length} design={design} active={p.id === page.id} onClick={() => selectPage(p.id)} />
                <div className="mt-1 text-center font-mono text-[10.5px] text-dim">{i + 1}</div>
              </div>
            ))}
            <button onClick={addPage} aria-label="加一页" className="t mb-4 flex h-[78px] w-[62px] shrink-0 items-center justify-center border border-dashed border-line text-dim hover:border-fg hover:text-fg"><Plus size={18} /></button>
          </div>
        </div>
      </div>

      {full && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-8" onClick={() => setFull(false)}>
          <div className="enter w-full max-w-[860px] border border-line bg-bg p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="text-[22px] font-semibold">完整滑动预览</h3><button aria-label="关闭" onClick={() => setFull(false)} className="t p-1 text-mute hover:text-fg"><X size={20} /></button></div>
            <CarouselPreview pages={pages} design={design} />
          </div>
        </div>
      )}
    </div>
  );
}

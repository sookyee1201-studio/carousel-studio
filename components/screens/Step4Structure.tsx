"use client";
import { ArrowLeft, ArrowRight, Check, Plus, RefreshCw } from "lucide-react";
import { Button, Spinner, StepShell } from "@/components/ui";
import { CarouselPageCard, ContentApproval } from "@/components/content";
import { usePageDnd } from "@/components/carousel/usePageDnd";
import UndoRedo from "@/components/design/UndoRedo";
import { useStudio } from "@/lib/store";

export default function Step4Structure() {
  const { pages, updatePage, reorder, duplicatePage, deletePage, addPage, setRole, approval, approve, goStep, notify, generatingPages, quickBusy, advanced, approveAndGo, regenAll, setView } = useStudio();
  const dnd = usePageDnd(reorder);
  return (
    <StepShell wide eyebrow={advanced ? "Step 04 · 内容结构" : "第 1 步 · 写内容"} title={advanced ? "把一个 Hook，变成完整的滑动理由。" : "AI 写好了 8 页，看看文案。"} desc={advanced ? "默认 8 页结构，但不必死板。每一页都要有存在的理由，以及让人滑到下一页的理由。" : "直接点文字修改，满意了就去调设计。不满意可以整套重新生成。"}
      footer={advanced ? <>
        <div className="flex items-center gap-6">
          <Button variant="ghost" onClick={() => goStep(3)}><ArrowLeft size={16} />返回 Hook</Button>
          <ContentApproval status={approval} />
          <UndoRedo />
        </div>
        {approval === "approved"
          ? <Button variant="primary" size="lg" onClick={() => goStep(5)}>开始视觉方向 <ArrowRight size={17} /></Button>
          : <Button variant="primary" size="lg" disabled={generatingPages} onClick={() => { approve(); notify("内容已确认，现在可以开始设计了。"); }}><Check size={17} strokeWidth={2.5} />{approval === "changed" ? "重新确认内容" : "确认内容结构"}</Button>}
      </> : <>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setView("dashboard")}><ArrowLeft size={16} />工作台</Button>
          <UndoRedo />
          <Button disabled={generatingPages} onClick={regenAll}><RefreshCw size={15} />整套重新生成</Button>
        </div>
        <Button variant="primary" size="lg" disabled={generatingPages} onClick={() => approveAndGo(6)}>去调设计 <ArrowRight size={17} /></Button>
      </>}>
      {generatingPages ? <Spinner text={quickBusy ? "正在生成 8 页 Carousel，完成后直接进入设计器……" : "正在把 Hook 展开成 8 页结构……"} /> : <>
      <div className="mb-2 grid grid-cols-[132px_1fr_260px] gap-8 pb-3">
        <span /><span className="label">Headline / Body</span><span className="label">为什么这页存在</span>
      </div>
      <div className="border-b border-line">
        {pages.map((p, i) => (
          <CarouselPageCard key={p.id} page={p} index={i} total={pages.length}
            dragProps={dnd.bind(i)} dragging={dnd.from === i} dropTarget={dnd.over === i && dnd.from !== null && dnd.from !== i}
            onChange={(patch) => updatePage(p.id, patch)} onRole={(r) => setRole(p.id, r)}
            onDuplicate={() => duplicatePage(p.id)} onDelete={() => deletePage(p.id)} onMove={(d) => reorder(i, i + d)} />
        ))}
      </div>
      <button onClick={addPage} className="t mt-6 flex items-center gap-2 text-[15px] text-mute hover:text-accent-ink"><Plus size={16} />Add Page</button>
      </>}
    </StepShell>
  );
}

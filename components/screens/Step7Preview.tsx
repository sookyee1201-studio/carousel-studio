"use client";
import { useState } from "react";
import { ArrowDown, ArrowLeft, Download } from "lucide-react";
import { exportAll } from "@/lib/exportPng";
import CarouselPreview from "@/components/carousel/CarouselPreview";
import { QualityChecklist } from "@/components/design";
import { Button, Label, StepShell } from "@/components/ui";
import { qualityChecks } from "@/lib/engine";
import { useStudio } from "@/lib/store";

export default function Step7Preview() {
  const { pages, design, goStep, startNew, setView, project, notify } = useStudio();
  const [busy, setBusy] = useState<number | null>(null);
  const doExport = async () => {
    setBusy(0);
    try { await exportAll(pages, design, project.title, setBusy); notify("已导出 ZIP（每页 1080×1350 PNG）。"); }
    catch { notify("导出失败，请再试一次。"); }
    setBusy(null);
  };
  const q = qualityChecks(pages, design);
  return (
    <StepShell wide eyebrow="Step 07 · 预览" title="最后看一次完整滑动体验。"
      footer={<>
        <Button variant="ghost" onClick={() => goStep(6)}><ArrowLeft size={16} />返回设计</Button>
        <div className="flex gap-3">
          <Button onClick={() => setView("dashboard")}>回到工作台</Button>
          <Button onClick={() => startNew()}>新建另一个 Carousel</Button>
          <Button variant="primary" disabled={busy !== null} onClick={doExport}><Download size={16} />{busy === null ? "导出全部 PNG" : `导出中 ${busy}/${pages.length}…`}</Button>
        </div>
      </>}>
      <CarouselPreview pages={pages} design={design} />
      <div className="mt-16 grid grid-cols-[220px_1fr] gap-16 border-t border-line pt-10">
        <div>
          <Label className="mb-5">Story Flow</Label>
          <ol className="text-[14px]">
            {pages.map((p, i) => (
              <li key={p.id}>
                <div className="flex items-center gap-3"><span className="w-6 font-mono text-[11.5px] text-dim">P{i + 1}</span><span className="font-mono text-[13px] uppercase tracking-[0.12em] text-fg">{p.role}</span></div>
                {i < pages.length - 1 && <ArrowDown size={13} className="my-1.5 ml-[9px] text-dim" />}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <Label className="mb-5 text-accent-ink">Quality Check</Label>
          <div className="grid grid-cols-2 gap-14">
            <QualityChecklist title="Content" items={q.content} />
            <QualityChecklist title="Design" items={q.design} />
          </div>
          <p className="mt-8 text-[13.5px] text-dim">以上检查根据当前内容与设计实时计算，没有虚假的 AI Score。</p>
        </div>
      </div>
    </StepShell>
  );
}

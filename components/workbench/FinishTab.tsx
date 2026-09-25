"use client";
import { useState } from "react";
import { Copy, Download, FileText } from "lucide-react";
import { QualityChecklist } from "@/components/design";
import { Button } from "@/components/ui";
import { coverChecks, layoutName, qualityChecks } from "@/lib/engine";
import { exportAll, exportPage } from "@/lib/exportPng";
import { buildHandoff } from "@/lib/handoff";
import { PRESETS } from "@/lib/mock";
import { useStudio } from "@/lib/store";
import type { Page } from "@/lib/types";
import { Row, SubTabs } from "./parts";

const SUBS = ["检查", "交付单", "导出"] as const;

export default function FinishTab({ page, index }: { page: Page; index: number }) {
  const { pages, design, project, notify } = useStudio();
  const [sub, setSub] = useState<(typeof SUBS)[number]>("检查");
  const [busy, setBusy] = useState<number | null>(null);
  const [one, setOne] = useState(false);
  const q = qualityChecks(pages, design);
  const preset = PRESETS.find((p) => p.id === design.presetId);
  const md = buildHandoff(project.title, pages, design);

  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown;charset=utf-8" }));
    a.download = `${(project.title || "carousel").slice(0, 30)}-设计交付单.md`;
    document.body.appendChild(a); a.click(); a.remove();
  };
  const copy = async () => { try { await navigator.clipboard.writeText(md); notify("交付单已复制，可以直接发给 Designer。"); } catch { notify("复制失败，请用「下载交付单」。"); } };

  return (
    <div className="space-y-7">
      <SubTabs value={sub} items={[...SUBS]} onChange={setSub} />

      {sub === "检查" && (
        <>
          <p className="text-[14px] text-dim">这些检查根据你现在的内容和设计实时计算，不是随便打的分数。</p>
          <QualityChecklist title="第 1 页（封面）" items={coverChecks(pages[0], design)} />
          <QualityChecklist title="内容" items={q.content} />
          <QualityChecklist title="设计" items={q.design} />
        </>
      )}

      {sub === "交付单" && (
        <>
          <Row title="设计交付单" hint="把你的所有选择整理成一份文字，交给 Designer 或下一个人，他不用再重新猜。">
            <div className="space-y-5 border border-line bg-card p-5">
              <div>
                <div className="label mb-1.5">风格</div>
                <div className="text-[16px]">{preset?.name ?? design.presetId}</div>
                <div className="mt-2 flex gap-1.5">{[design.palette.bg, design.palette.text, design.palette.accent, design.palette.altBg].map((c, i) => <span key={i} className="h-6 w-10 border border-fg/20" style={{ background: c }} title={c} />)}</div>
              </div>
              <div>
                <div className="label mb-2">逐页</div>
                <ol className="space-y-2 text-[14.5px]">
                  {pages.map((p, i) => (
                    <li key={p.id} className="grid grid-cols-[34px_1fr] gap-2">
                      <span className="font-mono text-[12px] text-dim">P{i + 1}</span>
                      <span><span className="text-fg">{p.headline.replace(/\n/g, " ")}</span><span className="block text-[13px] text-dim">{p.role} · {layoutName(p.layout)}</span></span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Row>
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" onClick={copy}><Copy size={15} />复制交付单</Button>
            <Button onClick={download}><FileText size={15} />下载交付单 (.md)</Button>
          </div>
        </>
      )}

      {sub === "导出" && (
        <>
          <Row title="导出全部页面" hint="每页一张 1080×1350 的 PNG，打包成一个 ZIP。可以直接发到 Instagram。">
            <Button variant="primary" size="lg" disabled={busy !== null} onClick={async () => {
              setBusy(0); try { await exportAll(pages, design, project.title, setBusy); notify("已导出 ZIP。"); } catch { notify("导出失败，请再试一次。"); } setBusy(null);
            }}><Download size={16} />{busy === null ? "导出全部 PNG" : `导出中 ${busy}/${pages.length}…`}</Button>
          </Row>
          <Row title="只导出这一页" hint={`现在是第 ${index + 1} 页。`}>
            <Button disabled={one} onClick={async () => { setOne(true); try { await exportPage(page, index, pages, design, project.title); } catch { notify("导出失败，请再试一次。"); } setOne(false); }}><Download size={15} />{one ? "导出中…" : "导出本页 PNG"}</Button>
          </Row>
        </>
      )}
    </div>
  );
}

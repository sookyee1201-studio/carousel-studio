"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, Plus, RefreshCw, Trash2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui";
import { ROLES } from "@/lib/mock";
import { useStudio } from "@/lib/store";
import type { Page } from "@/lib/types";
import { Row, SubTabs } from "./parts";

const SUBS = ["文案", "结构"] as const;

export default function ContentTab({ page, index }: { page: Page; index: number }) {
  const { updatePage, setRole, rewritePage, notify, pages, reorder, duplicatePage, deletePage, addPage, regenAll, generatingPages } = useStudio();
  const [sub, setSub] = useState<(typeof SUBS)[number]>("文案");
  const [ask, setAsk] = useState("");
  const [busy, setBusy] = useState(false);
  const doRewrite = async () => {
    if (!ask.trim() || busy) return;
    setBusy(true); const ok = await rewritePage(page.id, ask.trim()); setBusy(false);
    if (ok) { setAsk(""); notify("已按你的要求改写这一页，可以用撤销恢复。"); }
  };
  const L = page.layout;
  return (
    <div className="space-y-7">
      <SubTabs value={sub} items={[...SUBS]} onChange={setSub} />

      {sub === "文案" && (
        <>
          <Row title="标题" hint="这页最重要的一句话。也可以直接在右边画面上点文字修改。">
            <textarea className="field text-[16px]" rows={3} value={page.headline} onChange={(e) => updatePage(page.id, { headline: e.target.value })} />
          </Row>
          <Row title="正文" hint={L === "prompt-card" ? "卡片里的文字。用 **两个星号** 包住的短语会变成粗斜体。" : "标题下面的补充说明，可以留空。"}>
            <textarea className="field text-[16px]" rows={4} value={page.body} onChange={(e) => updatePage(page.id, { body: e.target.value })} />
          </Row>
          <Row title="强调词" hint="从标题或正文里选一个词，画面上会用强调样式突出它（必须是原文里出现过的字）。">
            <input className="field" value={page.highlight} onChange={(e) => updatePage(page.id, { highlight: e.target.value })} placeholder="例如：一整周" />
          </Row>
          {L === "big-number" && (
            <Row title="大数字" hint="这页的主角。数字和单位分开填，例如 40 和 MIN。">
              <div className="grid grid-cols-2 gap-3">
                <input className="field" value={page.stat.value} onChange={(e) => updatePage(page.id, { stat: { ...page.stat, value: e.target.value } })} />
                <input className="field" value={page.stat.unit} onChange={(e) => updatePage(page.id, { stat: { ...page.stat, unit: e.target.value } })} />
              </div>
            </Row>
          )}
          {L === "stagger" && (
            <Row title="悬浮气泡" hint="封面周围漂浮的小问题，每行一个，最多 4 个。">
              <textarea className="field" rows={4} value={page.chips.join("\n")} onChange={(e) => updatePage(page.id, { chips: e.target.value.split("\n") })} />
            </Row>
          )}
          {(L === "framework" || L === "comparison" || L === "prompt-card") && (
            <Row title={L === "framework" ? "步骤" : L === "prompt-card" ? "工具图标" : "对比"} hint={L === "framework" ? "每行一步。" : L === "prompt-card" ? "每行一个，最多 3 个，显示在卡片下面。" : "第 1 行是旧做法，第 2 行是新做法。"}>
              <textarea className="field" rows={5} value={page.steps.join("\n")} onChange={(e) => updatePage(page.id, { steps: e.target.value.split("\n") })} />
            </Row>
          )}
          {L === "prompt-card" && (
            <Row title="结果卡片" hint="卡片旁边展示「做出来的成果」，像真的文件、邮件或表格。">
              <select className="field" value={page.result.kind} onChange={(e) => updatePage(page.id, { result: { ...page.result, kind: e.target.value as Page["result"]["kind"] } })}>
                <option value="none">不显示</option><option value="doc">文件封面</option><option value="email">邮件</option><option value="sheet">表格</option>
              </select>
              {page.result.kind !== "none" && (
                <div className="mt-2 grid grid-cols-1 gap-2">
                  <textarea className="field" rows={2} value={page.result.title} onChange={(e) => updatePage(page.id, { result: { ...page.result, title: e.target.value } })} placeholder="卡片标题" />
                  <input className="field" value={page.result.sub} onChange={(e) => updatePage(page.id, { result: { ...page.result, sub: e.target.value } })} placeholder="小字说明" />
                </div>
              )}
            </Row>
          )}
          <div className="border border-line bg-card p-4">
            <div className="mb-2 flex items-center gap-1.5 text-[14px] text-accent-ink"><Wand2 size={14} />让 AI 改写这一页</div>
            <textarea className="field" rows={2} value={ask} disabled={busy} onChange={(e) => setAsk(e.target.value)} placeholder="例如：更短、更有冲击力；换成提问句；加一个具体数字" />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {["更短一点", "更有冲击力", "更口语"].map((q) => <button key={q} type="button" onClick={() => setAsk(q)} className="t h-8 rounded-full border border-line px-3 text-[13px] text-mute hover:border-fg hover:text-fg">{q}</button>)}
              <Button size="sm" variant="primary" className="ml-auto" disabled={busy || !ask.trim()} onClick={doRewrite}>{busy ? "改写中…" : "改写"}</Button>
            </div>
          </div>
        </>
      )}

      {sub === "结构" && (
        <>
          <Row title="这页的角色" hint="它在整套里负责什么：抓眼球（Hook）、说痛点、给方法、收尾（CTA）…">
            <select className="field" value={page.role} onChange={(e) => setRole(page.id, e.target.value as Page["role"])}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
          </Row>
          <Row title="这页为什么存在" hint="一句话写清楚它的作用，方便自己和 Designer 理解。">
            <textarea className="field" rows={2} value={page.purpose} onChange={(e) => updatePage(page.id, { purpose: e.target.value })} />
          </Row>
          <Row title="读者为什么会滑到下一页" hint="好的 Carousel 每一页都要留一个继续滑的理由。">
            <textarea className="field" rows={2} value={page.swipeReason} onChange={(e) => updatePage(page.id, { swipeReason: e.target.value })} />
          </Row>
          <Row title="整理页面" hint={`现在是第 ${index + 1} / ${pages.length} 页。`}>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" disabled={index === 0} onClick={() => reorder(index, index - 1)}><ArrowUp size={14} />前移</Button>
              <Button size="sm" disabled={index === pages.length - 1} onClick={() => reorder(index, index + 1)}><ArrowDown size={14} />后移</Button>
              <Button size="sm" onClick={() => duplicatePage(page.id)}><Copy size={14} />复制这页</Button>
              <Button size="sm" variant="danger" disabled={pages.length <= 1} onClick={() => deletePage(page.id)}><Trash2 size={14} />删除这页</Button>
              <Button size="sm" onClick={addPage}><Plus size={14} />加一页</Button>
            </div>
          </Row>
          <Row title="整套重新写" hint="用同一个主题让 AI 重新写全部页面。不满意可以用撤销恢复。">
            <Button disabled={generatingPages} onClick={regenAll}><RefreshCw size={15} />{generatingPages ? "生成中…" : "整套重新生成"}</Button>
          </Row>
        </>
      )}
    </div>
  );
}

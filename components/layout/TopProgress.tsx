"use client";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { useStudio } from "@/lib/store";

export const STEPS = ["输入", "内容分析", "Hook", "内容结构", "视觉方向", "设计", "预览"];

export default function TopProgress() {
  const { step, maxStep, goStep, approval, project, setView, saveState, savedAt, advanced } = useStudio();
  const SIMPLE = [{ n: 4, label: "写内容" }, { n: 6, label: "调设计" }, { n: 7, label: "预览与导出" }];
  const simpleCur = step <= 4 ? 0 : step <= 6 ? 1 : 2;
  return (
    <header className="sticky top-0 z-30 flex h-[65px] items-center gap-6 border-b border-line bg-bg/90 px-8 backdrop-blur">
      <button onClick={() => setView("dashboard")} className="t label hidden shrink-0 hover:text-fg xl:block">← 工作台</button>
      {advanced ? (
      <ol className="flex min-w-0 flex-1 items-center gap-1">
        {STEPS.map((s, i) => {
          const n = i + 1; const done = n < step; const cur = n === step; const reachable = n <= maxStep;
          return (
            <li key={s} className="flex items-center">
              <button disabled={!reachable} onClick={() => goStep(n)} aria-current={cur ? "step" : undefined}
                className={cn("t flex items-center gap-2 rounded-[3px] px-2.5 py-1.5 text-[14px]",
                  cur ? "bg-fg text-bg" : reachable ? "text-fg hover:bg-fg/[0.06]" : "text-dim")}>
                <span className={cn("flex h-[18px] w-[18px] items-center justify-center rounded-full text-[11.5px] font-mono", cur ? "bg-bg/25" : done ? "bg-accent/20 text-accent-ink" : "border border-line")}>
                  {done ? <Check size={11} strokeWidth={2.5} /> : n}
                </span>
                {s}
              </button>
              {n < STEPS.length && <span className="mx-0.5 h-px w-4 bg-line" />}
            </li>
          );
        })}
      </ol>
      ) : (
        <ol className="flex min-w-0 flex-1 items-center gap-1">
          {SIMPLE.map((x, i) => {
            const done = i < simpleCur; const cur = i === simpleCur;
            return (
              <li key={x.n} className="flex items-center">
                <button onClick={() => goStep(x.n)} aria-current={cur ? "step" : undefined}
                  className={cn("t flex items-center gap-2.5 rounded-[3px] px-3.5 py-2 text-[15px]", cur ? "bg-fg text-bg" : "text-fg hover:bg-fg/[0.06]")}>
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded-full font-mono text-[12px]", cur ? "bg-bg/25" : done ? "bg-accent/20 text-accent-ink" : "border border-line")}>
                    {done ? <Check size={12} strokeWidth={2.5} /> : i + 1}
                  </span>
                  {x.label}
                </button>
                {i < SIMPLE.length - 1 && <span className="mx-1 h-px w-8 bg-line" />}
              </li>
            );
          })}
        </ol>
      )}
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden max-w-[200px] truncate text-[13px] text-dim 2xl:block" title={project.title}>{project.title}</span>
        <span className="whitespace-nowrap text-[13px] text-dim" aria-live="polite">
          {saveState === "saving" ? "保存中…" : saveState === "saved" && savedAt ? `已保存 ${savedAt.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}` : saveState === "error" ? <span className="text-danger">保存失败</span> : ""}
        </span>
        {advanced && approval === "approved" && <span className="label flex items-center gap-1.5 rounded-[3px] border border-ok/40 px-2.5 py-1.5 text-ok"><Check size={12} strokeWidth={2.5} />Content Approved</span>}
        {advanced && approval === "changed" && (
          <button onClick={() => goStep(4)} className="t rounded-[3px] border border-danger/50 px-2.5 py-1.5 text-[13px] text-danger hover:bg-danger/10">内容已修改，需要重新确认</button>
        )}
      </div>
    </header>
  );
}

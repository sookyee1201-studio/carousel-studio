"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button, Spinner, StepShell } from "@/components/ui";
import { StrategyCard } from "@/components/content";
import { useStudio } from "@/lib/store";

export default function Step2Analysis() {
  const { analysis, editAnalysis, regenAnalysis, analyzing, goStep, runHooks } = useStudio();
  return (
    <StepShell wide eyebrow="Step 02 · 内容分析" title="先找到这篇内容真正值得讲的东西。" desc="先拆解 Content Strategy，再决定怎么说。每一项都可以编辑或重新生成。"
      footer={<>
        <Button variant="ghost" onClick={() => goStep(1)}><ArrowLeft size={16} />返回修改输入</Button>
        <Button variant="primary" size="lg" disabled={analyzing} onClick={runHooks}>确认分析，开始找 Hook <ArrowRight size={17} /></Button>
      </>}>
      {analyzing ? <Spinner text="正在拆解内容策略……" /> : (
        <div className="grid grid-cols-2 gap-x-14">
          {analysis.map((a) => <StrategyCard key={a.id} item={a} featured={a.no === "09"} onEdit={(v) => editAnalysis(a.id, v)} onRegen={() => regenAnalysis(a.id)} />)}
        </div>
      )}
    </StepShell>
  );
}

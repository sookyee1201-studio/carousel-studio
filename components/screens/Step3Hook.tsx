"use client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button, Spinner, StepShell } from "@/components/ui";
import { HookCard } from "@/components/content";
import { useStudio } from "@/lib/store";

export default function Step3Hook() {
  const { hooks, selectedHookId, setSelectedHook, editHook, regenHook, generatingHooks, goStep, useHook } = useStudio();
  const sel = hooks.find((h) => h.id === selectedHookId);
  return (
    <StepShell wide eyebrow="Step 03 · Hook Lab" title="先把第一句话做对。" desc="Carousel 第一页的任务不是解释，而是让人停下来。10 个 Hook，10 种不同的切入角度。"
      footer={<>
        <Button variant="ghost" onClick={() => goStep(2)}><ArrowLeft size={16} />返回内容分析</Button>
        <div className="flex items-center gap-5">
          {sel && <span className="hidden max-w-[360px] truncate text-[14px] text-mute lg:block">已选：{sel.copy.replace(/\n/g, " ")}</span>}
          <Button variant="primary" size="lg" onClick={useHook}>使用这个 Hook <ArrowRight size={17} /></Button>
        </div>
      </>}>
      {generatingHooks ? <Spinner text="正在用 10 种 Framework 写 Hook……" /> : (
        <div className="grid grid-cols-2 gap-5">
          {hooks.map((h) => <HookCard key={h.id} hook={h} selected={h.id === selectedHookId} onSelect={() => setSelectedHook(h.id)} onEdit={(v) => editHook(h.id, v)} onRegen={() => regenHook(h.id)} />)}
        </div>
      )}
    </StepShell>
  );
}

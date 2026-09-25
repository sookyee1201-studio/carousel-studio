"use client";
import { useState } from "react";
import { ArrowRight, ChevronDown, ImagePlus } from "lucide-react";
import { fileToImage } from "@/lib/ai";
import { AutoText, Button, Chip, Field, StepShell } from "@/components/ui";
import { InputTypeSelector } from "@/components/content";
import { AUDIENCE_PLACEHOLDER, INPUT_PLACEHOLDER } from "@/lib/mock";
import { useStudio } from "@/lib/store";

const GOALS = ["Awareness", "Engagement", "Education", "Lead Generation", "Conversion", "Authority"];
const PLATFORMS = ["Instagram", "Facebook", "LinkedIn", "小红书"];
const CTAS = ["Comment", "DM", "Save", "Share", "Follow", "Click Link", "No CTA"];

export default function Step1Input() {
  const { input, setInput, runAnalyze, setView, srcImage, setSrcImage, notify } = useStudio();
  const [more, setMore] = useState(false);
  return (
    <StepShell eyebrow="Step 01 · 输入" title="先告诉我，你想做什么内容？" desc="可以从一个 Topic、Idea、Reference、Transcript 或现有内容开始。"
      footer={<>
        <Button variant="ghost" onClick={() => setView("dashboard")}>取消</Button>
        <div className="flex items-center gap-4"><span className="text-[13.5px] text-dim">留空将使用示例主题</span><Button variant="primary" size="lg" onClick={runAnalyze}>开始分析内容 <ArrowRight size={17} /></Button></div>
      </>}>
      <InputTypeSelector value={input.type} onChange={(type) => setInput({ type })} />
      <div className="mt-6">
        {input.type === "screenshot" ? (
          <div className="space-y-3">
            <label className="t flex h-[180px] cursor-pointer flex-col items-center justify-center gap-3 border border-dashed border-line text-mute hover:border-accent hover:text-accent-ink">
              {srcImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={srcImage.preview} alt="" className="h-[150px] max-w-full object-contain" />
              ) : (<><ImagePlus size={26} strokeWidth={1.3} /><span className="text-[15px]">点击选择截图、海报或文章图片</span></>)}
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return;
                try { const im = await fileToImage(f); setSrcImage(im); setInput({ fileName: im.name }); } catch { notify("这张图片读取失败，换一张试试。"); }
              }} />
            </label>
            <textarea className="field" rows={2} value={input.text} onChange={(e) => setInput({ text: e.target.value })} placeholder="补充说明（可选）：想从这张图里提炼什么角度？" />
          </div>
        ) : input.type === "link" ? (
          <input className="field h-14 text-[17px]" value={input.text} onChange={(e) => setInput({ text: e.target.value })} placeholder={INPUT_PLACEHOLDER.link} />
        ) : (
          <AutoText rows={3} value={input.text} onChange={(v) => setInput({ text: v })} placeholder={INPUT_PLACEHOLDER[input.type]}
            className="field min-h-[120px] text-[20px] leading-[1.6]" />
        )}
      </div>

      <button onClick={() => setMore((m) => !m)} aria-expanded={more} className="t mt-10 flex items-center gap-2 text-[15px] text-mute hover:text-fg">
        <ChevronDown size={16} className={more ? "t rotate-180" : "t"} />更多选项（品牌、平台、目标、受众、CTA）<span className="text-dim">· 不填也可以</span>
      </button>
      {more && <div className="enter">      <div className="mt-8 grid grid-cols-2 gap-x-12 gap-y-10">
        <Field label="品牌 / 账号" hint="可选">
          <input className="field" value={input.client} onChange={(e) => setInput({ client: e.target.value })} placeholder="例如：你的品牌名或账号名" />
        </Field>
        <Field label="Platform">
          <div className="flex flex-wrap gap-2">{PLATFORMS.map((p) => <Chip key={p} active={input.platform === p} onClick={() => setInput({ platform: p })}>{p}</Chip>)}</div>
        </Field>
        <Field label="Content Goal" className="col-span-2">
          <div className="flex flex-wrap gap-2">{GOALS.map((g) => <Chip key={g} active={input.goal === g} onClick={() => setInput({ goal: g })}>{g}</Chip>)}</div>
        </Field>
        <Field label="Audience" className="col-span-2">
          <textarea className="field" rows={2} value={input.audience} onChange={(e) => setInput({ audience: e.target.value })} placeholder={AUDIENCE_PLACEHOLDER} />
        </Field>
        <Field label="CTA Goal" className="col-span-2">
          <div className="flex flex-wrap gap-2">{CTAS.map((c) => <Chip key={c} active={input.cta === c} onClick={() => setInput({ cta: c })}>{c}</Chip>)}</div>
        </Field>
      </div>
</div>}
    </StepShell>
  );
}

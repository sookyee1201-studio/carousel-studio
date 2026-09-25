"use client";
import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Button, ColorPicker, Field, Label } from "@/components/ui";
import BrandPresetCard from "@/components/design/BrandPreset";
import PresetPicker from "@/components/design/PresetPicker";
import { BRANDS, PRESETS, TEMPLATES } from "@/lib/mock";
import { useStudio } from "@/lib/store";
import type { BrandPreset } from "@/lib/types";

const Head = ({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) => (
  <>
    <Label className="mb-5 text-accent-ink">{eyebrow}</Label>
    <h1 className="text-[44px] font-semibold tracking-[-0.02em]">{title}</h1>
    <p className="mt-4 max-w-[600px] text-[17px] text-mute">{desc}</p>
  </>
);

export function TemplatesView() {
  const { quickStart, startPaperTemplate } = useStudio();
  return (
    <div className="enter mx-auto max-w-[1080px] px-12 pt-16 pb-24">
      <Head eyebrow="Templates" title="内容模板" desc="选一个已经验证过的故事结构，带着 Topic 直接进入创作流程。" />
      <button onClick={startPaperTemplate} className="t group mt-12 flex w-full items-center justify-between gap-8 border border-line bg-card p-7 text-left hover:border-fg">
        <div>
          <div className="label mb-2 text-accent-ink">Style Template · 可微调</div>
          <h3 className="text-[24px] font-semibold">Paper Editorial 工作流示例</h3>
          <p className="mt-2 max-w-[560px] text-[15px] text-mute">错落大字封面 + 悬浮气泡、居中标题 + 白色提示卡片 + 工具图标、贯穿的赭红曲线、安静的结尾。整套 6 页，可在设计器右侧「微调」里改标题大小、卡片圆角、曲线、颜色。</p>
        </div>
        <span className="t shrink-0 text-[15px] group-hover:text-accent-ink">使用这套模板 →</span>
      </button>
      <div className="mt-12 grid grid-cols-3 gap-x-10 gap-y-12">
        {TEMPLATES.map((t, i) => (
          <div key={t.id} className="group flex flex-col border-t border-line pt-5">
            <span className="font-mono text-[12px] tracking-widest text-dim">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 text-[20px] font-semibold tracking-[-0.01em]">{t.name}</h3>
            <p className="mt-2 text-[15px] text-mute">{t.desc}</p>
            <p className="mt-4 font-mono text-[12px] leading-relaxed tracking-wide text-dim">{t.pages}</p>
            <button onClick={() => quickStart(t.topic)} className="t mt-6 flex items-center gap-2 self-start text-[14.5px] text-fg hover:text-accent-ink">使用模板 <ArrowRight size={14} className="t group-hover:translate-x-1" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DesignSystemView() {
  const { design, applyPreset } = useStudio();
  return (
    <div className="enter mx-auto max-w-[1080px] px-12 pt-16 pb-24">
      <Head eyebrow="Design System" title="设计系统" desc="Canvas、字体、栅格和预设。点击预设，整套 Carousel 的设计会更新，内容不会改变。" />
      <h2 className="mt-14 mb-6 text-[24px] font-semibold">设计预设</h2>
      <PresetPicker value={design.presetId} onPick={applyPreset} cols={3} />
      <div className="mt-16 grid grid-cols-2 gap-x-16 gap-y-10 border-t border-line pt-10">
        <div>
          <Label className="mb-4">Canvas & Grid</Label>
          <dl className="space-y-2.5 text-[15px]">
            {[["Canvas", "1080 × 1350 px · IG 4:5"], ["Margin / Safe Area", "80 px"], ["Columns", "12 · Gap 24 px"]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-line2 pb-2.5"><dt className="text-mute">{k}</dt><dd className="font-mono text-[14px]">{v}</dd></div>
            ))}
          </dl>
        </div>
        <div>
          <Label className="mb-4">Type Scale</Label>
          <dl className="space-y-2.5 text-[15px]">
            {[["Headline", "80–110 px · 700–800"], ["Subheadline", "38–48 px"], ["Body", "28–34 px · 400–500"], ["Small Label", "20–24 px · Mono"]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-line2 pb-2.5"><dt className="text-mute">{k}</dt><dd className="font-mono text-[14px]">{v}</dd></div>
            ))}
          </dl>
        </div>
      </div>
      <p className="mt-8 text-[13.5px] text-dim">共 {PRESETS.length} 套预设。</p>
    </div>
  );
}

export function BrandsView() {
  const { notify } = useStudio();
  const [brands, setBrands] = useState<BrandPreset[]>(BRANDS);
  const [sel, setSel] = useState(BRANDS[0].id);
  const cur = brands.find((b) => b.id === sel) ?? brands[0];
  const patch = (p: Partial<BrandPreset>) => setBrands((bs) => bs.map((b) => (b.id === cur.id ? { ...b, ...p } : b)));
  const add = () => {
    const b: BrandPreset = { id: "b" + Date.now(), name: "新品牌", primary: "#111111", secondary: "#F2F0EA", accent: "#F5C518", font: "Noto Sans SC / Geist", imageStyle: "Screenshot + Typography", designStyle: "Modern / Clean" };
    setBrands((x) => [...x, b]); setSel(b.id);
  };
  return (
    <div className="enter mx-auto max-w-[1080px] px-12 pt-16 pb-24">
      <Head eyebrow="Brand Presets" title="品牌预设" desc="每个客户保存自己的 Logo、颜色、字体和图片风格，之后一键套用。" />
      <div className="mt-12 grid grid-cols-[1fr_360px] gap-14">
        <div className="grid grid-cols-2 gap-4 self-start">
          {brands.map((b) => <BrandPresetCard key={b.id} brand={b} active={b.id === cur.id} onClick={() => setSel(b.id)} />)}
          <button onClick={add} className="t flex min-h-[200px] flex-col items-center justify-center gap-2 border border-dashed border-line text-mute hover:border-accent hover:text-accent-ink"><Plus size={20} strokeWidth={1.5} />新增品牌</button>
        </div>
        <div className="space-y-6 border-l border-line pl-10">
          <Label className="text-accent-ink">编辑 · {cur.name}</Label>
          <Field label="品牌名称"><input className="field" value={cur.name} onChange={(e) => patch({ name: e.target.value })} /></Field>
          <Field label="Logo"><div className="flex h-20 cursor-pointer items-center justify-center border border-dashed border-line text-[14px] text-dim hover:border-fg/30" onClick={() => notify("Logo 上传将在后续版本开放。")}>点击上传 Logo（V1 占位）</div></Field>
          <div className="grid grid-cols-3 gap-3">
            <ColorPicker label="Primary" value={cur.primary} onChange={(v) => patch({ primary: v })} />
            <ColorPicker label="Secondary" value={cur.secondary} onChange={(v) => patch({ secondary: v })} />
            <ColorPicker label="Accent" value={cur.accent} onChange={(v) => patch({ accent: v })} />
          </div>
          <Field label="Font"><input className="field" value={cur.font} onChange={(e) => patch({ font: e.target.value })} /></Field>
          <Field label="Image Style"><input className="field" value={cur.imageStyle} onChange={(e) => patch({ imageStyle: e.target.value })} /></Field>
          <Field label="Design Style"><input className="field" value={cur.designStyle} onChange={(e) => patch({ designStyle: e.target.value })} /></Field>
          <Button variant="primary" onClick={() => notify("品牌预设已保存（仅本次会话）。")}>保存品牌</Button>
        </div>
      </div>
    </div>
  );
}

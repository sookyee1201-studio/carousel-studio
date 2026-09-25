"use client";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import CarouselCanvas from "@/components/carousel/CarouselCanvas";
import BrandPresetCard from "@/components/design/BrandPreset";
import PresetPicker from "@/components/design/PresetPicker";
import PhotoUpload from "@/components/design/PhotoUpload";
import TweakPanel from "@/components/design/TweakPanel";
import { KITS } from "@/lib/kits";
import { ImageStrategy, Section, StyleSelector, VisualRhythm, VisualSelector } from "@/components/design";
import { Button, ColorPicker, Label, Segmented, Slider, StepShell } from "@/components/ui";
import { BRANDS } from "@/lib/mock";
import { useStudio } from "@/lib/store";
import type { BgStyle, LayoutId } from "@/lib/types";

const BG: [BgStyle, string][] = [["solid", "纯色"], ["dark", "暗色"], ["light", "Light"], ["gradient", "Gradient"], ["image", "Image"], ["screenshot", "Screenshot"], ["texture", "Texture"], ["grid", "Grid"], ["noise", "Noise"]];

export default function Step5Art() {
  const { advanced, design, updateDesign, applyPreset, applyBrand, pages, selectedPageId, selectPage, setLayout, goStep, approval } = useStudio();
  const idx = Math.max(0, pages.findIndex((p) => p.id === selectedPageId));
  const page = pages[idx];
  const setPal = (k: keyof typeof design.palette, v: string) => updateDesign({ palette: { ...design.palette, [k]: v } });
  const go = (d: number) => selectPage(pages[(idx + d + pages.length) % pages.length].id);

  return (
    <StepShell wide eyebrow="Step 05 · 视觉方向" title="现在决定这篇内容应该长什么样。" desc="这一步不是直接设计每一页，而是先定下整套 Global Art Direction。右侧会实时反映你的选择。"
      footer={<>
        <Button variant="ghost" onClick={() => goStep(advanced ? 4 : 6)}><ArrowLeft size={16} />{advanced ? "返回内容结构" : "返回设计"}</Button>
        <Button variant="primary" size="lg" disabled={advanced && approval === "draft"} onClick={() => goStep(6)}>进入 Carousel Designer <ArrowRight size={17} /></Button>
      </>}>
      <div className="grid grid-cols-[1fr_340px] gap-16">
        <div className="min-w-0">
          <Section no="01" title="视觉风格" desc="可以多选。风格会影响标题比例、留白和辅助线。">
            <StyleSelector value={design.styles} onChange={(styles) => updateDesign({ styles })} />
          </Section>
          <Section no="02" title="这篇内容主要使用什么视觉？" desc="不要默认使用 AI Illustration。选真正对内容有帮助的视觉。">
            <VisualSelector value={design.visuals} onChange={(visuals) => updateDesign({ visuals })} />
          </Section>
          <Section no="03" title="设计预设与品牌预设" desc="点击预设，整套设计更新，但内容不会改变。">
            <PresetPicker value={design.presetId} onPick={applyPreset} cols={2} />
            {KITS[design.kit ?? "basic"].usesPhoto && <div className="mt-8"><Label className="mb-3">背景照片</Label><PhotoUpload /></div>}
            <Label className="mb-3 mt-10">品牌预设</Label>
            <div className="grid grid-cols-3 gap-4">{BRANDS.map((b) => <BrandPresetCard key={b.id} brand={b} onClick={() => applyBrand(b)} />)}</div>
          </Section>
          {design.kit === "paper" && <Section no="03b" title="模板微调" desc="Paper Editorial：标题、卡片、曲线、颜色都可以微调，不改内容。"><TweakPanel /></Section>}
          <Section no="04" title="Visual Rhythm / 视觉节奏" desc="不要让 8 页看起来完全一样。">
            <VisualRhythm pages={pages} design={design} selectedId={page.id} onSelect={selectPage} onVisual={(id, l: LayoutId) => setLayout(id, l)} />
          </Section>
          <Section no="05" title="Global Design System" defaultOpen={false} desc="Canvas、颜色、字体、字号与栅格。">
            <div className="space-y-10">
              <div className="flex items-baseline justify-between border-b border-line2 pb-3 text-[15px]"><span className="text-mute">Canvas</span><span className="font-mono">1080 × 1350 px · Instagram 4:5</span></div>
              <div><Label className="mb-3">署名 / Handle</Label>
                <input className="field max-w-[320px]" value={design.signature} onChange={(e) => updateDesign({ signature: e.target.value })} placeholder="例如 @yourbrand（显示在每页左下角）" />
              </div>
              <div><Label className="mb-4">Color Palette</Label>
                <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                  <ColorPicker label="Background" value={design.palette.bg} onChange={(v) => setPal("bg", v)} />
                  <ColorPicker label="Primary Text" value={design.palette.text} onChange={(v) => setPal("text", v)} />
                  <ColorPicker label="Secondary Text" value={design.palette.muted} onChange={(v) => setPal("muted", v)} />
                  <ColorPicker label="Accent" value={design.palette.accent} onChange={(v) => setPal("accent", v)} />
                  <ColorPicker label="Alt Background" value={design.palette.altBg} onChange={(v) => setPal("altBg", v)} />
                  <ColorPicker label="Border" value={design.palette.border} onChange={(v) => setPal("border", v)} />
                </div>
              </div>
              <div><Label className="mb-4">Typography</Label>
                <div className="grid grid-cols-2 gap-x-10 gap-y-5">
                  <div className="space-y-2"><span className="text-[13.5px] text-mute">Headline Font</span><Segmented className="w-full" value={design.headlineFont} onChange={(headlineFont) => updateDesign({ headlineFont })} options={[{ v: "sans", label: "Bold Sans" }, { v: "serif", label: "Serif Display" }]} /></div>
                  <div className="space-y-2"><span className="text-[13.5px] text-mute">Chinese / Body Font</span><div className="field text-mute">Noto Sans SC · Geist</div></div>
                  <Slider label="Headline Weight" value={design.headlineWeight} min={600} max={800} step={100} onChange={(headlineWeight) => updateDesign({ headlineWeight })} />
                  <Slider label="Body Weight" value={design.bodyWeight} min={400} max={500} step={100} onChange={(bodyWeight) => updateDesign({ bodyWeight })} />
                </div>
                <dl className="mt-6 grid grid-cols-4 gap-4 text-[14px]">
                  {[["Headline", "80–110px"], ["Subheadline", "38–48px"], ["Body", "28–34px"], ["Small Label", "20–24px"]].map(([k, v]) => <div key={k} className="border-t border-line2 pt-2"><dt className="text-dim">{k}</dt><dd className="font-mono">{v}</dd></div>)}
                </dl>
              </div>
              <div className="grid grid-cols-[auto_1fr] items-center gap-x-8 gap-y-3"><Label>Corner Radius</Label>
                <Segmented value={design.radius} onChange={(radius) => updateDesign({ radius })} options={[0, 8, 16, 24].map((v) => ({ v, label: `${v}` }))} className="w-[260px]" />
              </div>
              <div><Label className="mb-3">Grid</Label>
                <dl className="grid grid-cols-4 gap-4 text-[14px]">
                  {[["Margin", `${design.grid.margin}px`], ["Columns", `${design.grid.cols}`], ["Gap", `${design.grid.gap}px`], ["Safe Area", `${design.grid.safe}px`]].map(([k, v]) => <div key={k} className="border-t border-line2 pt-2"><dt className="text-dim">{k}</dt><dd className="font-mono">{v}</dd></div>)}
                </dl>
              </div>
            </div>
          </Section>
          <Section no="06" title="背景风格" defaultOpen={false} desc="全局背景，每一页之后还可以单独覆盖。">
            <div className="flex flex-wrap gap-2">{BG.map(([k, l]) => <button key={k} onClick={() => updateDesign({ bgStyle: k })} className={`t h-9 rounded-[3px] border px-3.5 text-[14px] ${design.bgStyle === k ? "border-fg bg-fg text-bg" : "border-line text-mute hover:border-fg/30 hover:text-fg"}`}>{l}</button>)}</div>
            {design.bgStyle === "gradient" && (
              <div className="enter mt-7 grid grid-cols-2 gap-x-10 gap-y-5 border-t border-line2 pt-6">
                <ColorPicker label="Color A" value={design.gradient.a} onChange={(a) => updateDesign({ gradient: { ...design.gradient, a } })} />
                <ColorPicker label="Color B" value={design.gradient.b} onChange={(b) => updateDesign({ gradient: { ...design.gradient, b } })} />
                <Slider label="Direction" value={design.gradient.dir} min={0} max={360} unit="°" onChange={(dir) => updateDesign({ gradient: { ...design.gradient, dir } })} />
                <Slider label="Intensity" value={design.gradient.intensity} min={0} max={100} unit="%" onChange={(intensity) => updateDesign({ gradient: { ...design.gradient, intensity } })} />
              </div>
            )}
            <div className="mt-7 grid grid-cols-3 gap-x-8 border-t border-line2 pt-6">
              <Slider label="Image Overlay" value={design.overlay} min={0} max={80} unit="%" onChange={(overlay) => updateDesign({ overlay })} />
              <Slider label="Blur" value={design.blur} min={0} max={40} unit="px" onChange={(blur) => updateDesign({ blur })} />
              <Slider label="Grain" value={design.grain} min={0} max={20} unit="%" onChange={(grain) => updateDesign({ grain })} />
            </div>
            <p className="mt-4 text-[13.5px] text-dim">Overlay / Blur 主要作用于 Image 与 Screenshot 背景。</p>
          </Section>
          <Section no="07" title="图片策略" defaultOpen={false} desc="什么内容，配什么视觉。"><ImageStrategy /></Section>
        </div>

        <aside className="self-start sticky top-[89px]">
          <Label className="mb-3">实时预览 · P{idx + 1} {page.role}</Label>
          <div className="border border-line"><CarouselCanvas page={page} index={idx} total={pages.length} design={design} /></div>
          <div className="mt-3 flex items-center justify-between">
            <button onClick={() => go(-1)} aria-label="上一页" className="t rounded-[3px] p-2 text-mute hover:bg-fg/[0.06] hover:text-fg"><ChevronLeft size={18} /></button>
            <div className="flex gap-1.5">{pages.map((p, i) => <button key={p.id} aria-label={`P${i + 1}`} onClick={() => selectPage(p.id)} className={`t h-[3px] w-5 ${i === idx ? "bg-accent" : "bg-fg/20 hover:bg-fg/40"}`} />)}</div>
            <button onClick={() => go(1)} aria-label="下一页" className="t rounded-[3px] p-2 text-mute hover:bg-fg/[0.06] hover:text-fg"><ChevronRight size={18} /></button>
          </div>
        </aside>
      </div>
    </StepShell>
  );
}

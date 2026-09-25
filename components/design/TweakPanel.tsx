"use client";
import { ColorPicker, Label, Segmented, Slider, Toggle } from "@/components/ui";
import { useStudio } from "@/lib/store";
import type { Tweaks } from "@/lib/types";

/** Paper Editorial 模板微调：不改内容，只调这套风格的细节 */
export default function TweakPanel({ only }: { only?: "deco" }) {
  const { design, updateDesign } = useStudio();
  const tw = design.tweaks;
  const set = (p: Partial<Tweaks>) => updateDesign({ tweaks: { ...tw, ...p } });
  const pal = (k: keyof typeof design.palette, v: string) => updateDesign({ palette: { ...design.palette, [k]: v } });
  return (
    <div className="space-y-7">
      {!only && <div>
        <Label className="mb-2">标题</Label>
        <Slider label="标题大小" value={tw.titleScale} min={0.75} max={1.3} step={0.05} onChange={(titleScale) => set({ titleScale })} unit="×" />
        <div className="mt-4 space-y-2"><span className="text-[13.5px] text-mute">标题字重</span>
          <Segmented className="w-full" value={tw.titleWeight} onChange={(titleWeight) => set({ titleWeight })} options={[300, 400, 500, 600, 700].map((v) => ({ v, label: String(v) }))} />
        </div>
        <div className="mt-4 space-y-2"><span className="text-[13.5px] text-mute">强调词样式</span>
          <Segmented className="w-full" value={tw.hl} onChange={(hl) => set({ hl })} options={[{ v: "bold", label: "加粗" }, { v: "italic", label: "斜体" }, { v: "color", label: "强调色" }]} />
        </div>
      </div>}

      <div>
        <Label className="mb-2">卡片与气泡</Label>
        <Slider label="卡片圆角" value={tw.cardRadius} min={0} max={70} onChange={(cardRadius) => set({ cardRadius })} unit="px" />
        <div className="mt-3"><Slider label="卡片阴影" value={tw.cardShadow} min={0} max={100} onChange={(cardShadow) => set({ cardShadow })} /></div>
        <div className="mt-2"><Toggle label="卡片右下角发送按钮" checked={tw.sendButton} onChange={(sendButton) => set({ sendButton })} /></div>
        <Toggle label="封面悬浮气泡" checked={tw.chips} onChange={(chips) => set({ chips })} />
      </div>

      <div>
        <Label className="mb-2">曲线</Label>
        <Toggle label="显示赭红曲线" checked={tw.squiggle} onChange={(squiggle) => set({ squiggle })} />
        {tw.squiggle && <div className="mt-2"><Slider label="曲线粗细" value={tw.squiggleWidth} min={2} max={10} onChange={(squiggleWidth) => set({ squiggleWidth })} unit="px" /></div>}
      </div>

      <div>
        <Label className="mb-2">页面边框</Label>
        <Toggle label="显示标签 / 页码 / 署名 / 滑动提示" checked={tw.chrome} onChange={(chrome) => set({ chrome })} />
      </div>

      {!only && <div>
        <Label className="mb-3">颜色与纸张</Label>
        <div className="grid grid-cols-1 gap-3">
          <ColorPicker label="纸色（背景）" value={design.palette.bg} onChange={(v) => pal("bg", v)} />
          <ColorPicker label="强调色（曲线 / 按钮）" value={design.palette.accent} onChange={(v) => pal("accent", v)} />
          <ColorPicker label="文字色" value={design.palette.text} onChange={(v) => pal("text", v)} />
        </div>
        <div className="mt-4"><Slider label="纸张颗粒" value={design.grain} min={0} max={20} onChange={(grain) => updateDesign({ grain })} unit="%" /></div>
      </div>}
    </div>
  );
}

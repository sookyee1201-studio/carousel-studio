"use client";
import { useState } from "react";
import PhotoUpload from "@/components/design/PhotoUpload";
import PresetPicker from "@/components/design/PresetPicker";
import { ColorPicker, Slider } from "@/components/ui";
import { KITS } from "@/lib/kits";
import { useStudio } from "@/lib/store";
import type { BgStyle } from "@/lib/types";
import { Pills, Row, SubTabs } from "./parts";

const SUBS = ["风格套件", "颜色", "字体", "背景"] as const;
const BG: { v: BgStyle; label: string }[] = [
  { v: "solid", label: "纯色" }, { v: "gradient", label: "渐变" }, { v: "grid", label: "网格" }, { v: "texture", label: "纹理" }, { v: "noise", label: "颗粒" },
];

export default function StyleTab() {
  const { design, updateDesign, applyPreset, updateAllTypes } = useStudio();
  const [sub, setSub] = useState<(typeof SUBS)[number]>("风格套件");
  const kit = KITS[design.kit ?? "basic"];
  const pal = (k: keyof typeof design.palette, v: string) => updateDesign({ palette: { ...design.palette, [k]: v } });
  const tw = design.tweaks;
  const setTw = (p: Partial<typeof tw>) => updateDesign({ tweaks: { ...tw, ...p } });

  return (
    <div className="space-y-7">
      <SubTabs value={sub} items={[...SUBS]} onChange={setSub} />

      {sub === "风格套件" && (
        <>
          <Row title="选一个整套风格" hint="点一下，整套 Carousel 立刻换成这个风格。文字内容不会变。">
            <PresetPicker value={design.presetId} onPick={applyPreset} cols={2} />
          </Row>
          {kit.usesPhoto && <Row title="背景照片" hint="这套风格用你的照片当背景，所有页共用；也可以在「画面 → 图片」里给单页换照片。"><PhotoUpload /></Row>}
          <Row title="署名" hint="显示在画面角落，例如 @yourbrand。留空就不显示。">
            <input className="field" value={design.signature} onChange={(e) => updateDesign({ signature: e.target.value })} placeholder="@yourbrand" />
          </Row>
        </>
      )}

      {sub === "颜色" && (
        <>
          <Row title="主要颜色" hint="改一个颜色，整套 Carousel 一起变。">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <ColorPicker label="背景 / 纸色" value={design.palette.bg} onChange={(v) => pal("bg", v)} />
              <ColorPicker label="文字" value={design.palette.text} onChange={(v) => pal("text", v)} />
              <ColorPicker label="强调色" value={design.palette.accent} onChange={(v) => pal("accent", v)} />
              <ColorPicker label="反白页底色" value={design.palette.altBg} onChange={(v) => pal("altBg", v)} />
            </div>
          </Row>
          <Row title="颗粒感" hint="给背景加一层细细的颗粒，像印刷纸。0 就是完全平滑。">
            <Slider label="颗粒" value={design.grain} min={0} max={20} unit="%" onChange={(grain) => updateDesign({ grain })} />
          </Row>
        </>
      )}

      {sub === "字体" && (
        <>
          <Row title="标题大小" hint="整套所有页的标题一起放大或缩小。">
            <Slider label="大小" value={tw.titleScale} min={0.75} max={1.3} step={0.05} unit="×" onChange={(titleScale) => setTw({ titleScale })} />
          </Row>
          <Row title="标题粗细" hint="越粗越有冲击力，越细越安静优雅。">
            <Pills value={kit.id === "paper" ? tw.titleWeight : 800} onChange={(w) => (kit.id === "paper" ? setTw({ titleWeight: w }) : updateAllTypes({ weight: w }))}
              options={[{ v: 400, label: "细" }, { v: 500, label: "常规" }, { v: 700, label: "粗" }, { v: 800, label: "特粗" }]} />
          </Row>
          {kit.id === "paper" && (
            <Row title="强调词怎么突出" hint="每页有一个强调词。选它显示成加粗、斜体，还是强调色。">
              <Pills value={tw.hl} onChange={(hl) => setTw({ hl })} options={[{ v: "bold", label: "加粗" }, { v: "italic", label: "斜体" }, { v: "color", label: "强调色" }]} />
            </Row>
          )}
        </>
      )}

      {sub === "背景" && (
        <>
          <Row title="背景样式" hint="全局背景。每一页之后还可以在「画面 → 背景」单独换。">
            <Pills value={design.bgStyle} onChange={(bgStyle) => updateDesign({ bgStyle })} options={BG} />
          </Row>
          {design.bgStyle === "gradient" && (
            <Row title="渐变" hint="两个颜色和方向。">
              <div className="grid grid-cols-2 gap-4">
                <ColorPicker label="颜色 A" value={design.gradient.a} onChange={(a) => updateDesign({ gradient: { ...design.gradient, a } })} />
                <ColorPicker label="颜色 B" value={design.gradient.b} onChange={(b) => updateDesign({ gradient: { ...design.gradient, b } })} />
              </div>
              <Slider label="方向" value={design.gradient.dir} min={0} max={360} unit="°" onChange={(dir) => updateDesign({ gradient: { ...design.gradient, dir } })} />
            </Row>
          )}
          {kit.usesPhoto && (
            <>
              <Row title="背景照片"><PhotoUpload /></Row>
              <Row title="照片压暗" hint="数字越大越暗，文字越清楚。">
                <Slider label="压暗" value={design.overlay} min={0} max={80} unit="%" onChange={(overlay) => updateDesign({ overlay })} />
              </Row>
              <Row title="照片虚化" hint="让照片变模糊，背景更安静。">
                <Slider label="虚化" value={design.blur} min={0} max={40} unit="px" onChange={(blur) => updateDesign({ blur })} />
              </Row>
            </>
          )}
        </>
      )}
    </div>
  );
}

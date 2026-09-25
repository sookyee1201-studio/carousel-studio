"use client";
import { useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import TweakPanel from "@/components/design/TweakPanel";
import AiImageGen from "@/components/design/AiImageGen";
import { Button, ColorPicker, Slider } from "@/components/ui";
import { fileToImage } from "@/lib/ai";
import { hasImageSlot } from "@/lib/engine";
import { uid } from "@/lib/mock";
import { KITS } from "@/lib/kits";
import { useStudio } from "@/lib/store";
import type { BgStyle, CanvasElement, ElementType, ImageCfg, Page, Tone } from "@/lib/types";
import { Pills, Row, SubTabs } from "./parts";

const ELEMENTS: { t: ElementType; label: string; w: number; h: number }[] = [
  { t: "line", label: "横线", w: 240, h: 6 }, { t: "arrow", label: "箭头", w: 240, h: 64 }, { t: "rectangle", label: "方框", w: 320, h: 200 },
  { t: "circle", label: "圆圈", w: 240, h: 240 }, { t: "highlight", label: "荧光条", w: 420, h: 64 }, { t: "number", label: "大编号", w: 300, h: 170 },
  { t: "icon", label: "星标", w: 120, h: 120 }, { t: "grid", label: "点阵", w: 300, h: 300 },
];

export default function PictureTab({ page }: { page: Page }) {
  const { updatePage, design, notify, setLayout } = useStudio();
  const kit = KITS[design.kit ?? "basic"];
  const subs = kit.id === "paper" ? ["图片", "背景", "元素", "装饰"] : ["图片", "背景", "元素"];
  const [sub, setSub] = useState("图片");
  const img = page.image;
  const patchImg = (p: Partial<ImageCfg>) => updatePage(page.id, { image: { ...img, ...p } });
  const slot = hasImageSlot(page.layout) || kit.usesPhoto;
  const patchEl = (id: string, p: Partial<CanvasElement>) => updatePage(page.id, { elements: page.elements.map((x) => (x.id === id ? { ...x, ...p } : x)) });
  const upload = async (f?: File) => {
    if (!f) return;
    try { const im = await fileToImage(f); patchImg({ mode: "upload", url: im.preview, fileName: im.name }); } catch { notify("这张图片读取失败，换一张试试。"); }
  };
  return (
    <div className="space-y-7">
      <SubTabs value={sub} items={subs} onChange={setSub} />

      {sub === "图片" && (
        <>
          <Row title="这一页要不要放图片" hint="不一定每页都需要图。没有真正有价值的画面，就让文字来说话。">
            <Pills value={img.mode} onChange={(mode) => patchImg({ mode })}
              options={[{ v: "none", label: "不放图" }, { v: "placeholder", label: "留空位" }, { v: "screenshot", label: "手机示意" }, { v: "upload", label: "我的图片" }]} />
          </Row>
          <Row title="上传我的图片" hint={kit.usesPhoto ? "这套风格用照片当背景：这里上传的图只替换这一页的背景。" : "上传后会放进这一页的图片位置。"}>
            <label>
              <span className="t inline-flex h-10 cursor-pointer items-center gap-2 rounded-[3px] bg-fg px-4 text-[14.5px] font-medium text-bg hover:bg-[#3b342b]"><ImagePlus size={16} />上传图片</span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
            {img.mode === "upload" && img.fileName && <p className="mt-2 text-[13.5px] text-mute">当前：{img.fileName}</p>}
          </Row>
          <AiImageGen defaultPrompt={`与这句话相关的真实场景：${page.headline.replace(/\n/g, " ")}`} defaultAspect={page.layout === "split" ? "16:9" : "4:5"}
            onDone={(url, name) => {
              if (!slot) setLayout(page.id, "split");
              updatePage(page.id, { image: { ...page.image, mode: "upload", url, fileName: name, fit: "cover" } });
            }} />
          {!slot ? (
            <p className="border border-dashed border-line p-4 text-[14px] leading-relaxed text-mute">这一页的版式不使用图片。到「版式」里换一个带图片的版式，这里的设置才会生效。</p>
          ) : img.mode === "none" ? (
            <p className="border border-dashed border-line p-4 text-[14px] text-mute">这页不一定需要图片。</p>
          ) : (
            <>
              <Row title="图片怎么放" hint="铺满会裁掉边缘；完整显示会留出空白。">
                <Pills value={img.fit} onChange={(fit) => patchImg({ fit })} options={[{ v: "cover", label: "铺满" }, { v: "contain", label: "完整显示" }]} />
              </Row>
              <Row title="透明度" hint="降低透明度，图片会更淡、更像背景。"><Slider label="透明度" value={img.opacity} min={10} max={100} unit="%" onChange={(opacity) => patchImg({ opacity })} /></Row>
              <Row title="圆角"><Slider label="圆角" value={img.radius} min={0} max={80} unit="px" onChange={(radius) => patchImg({ radius })} /></Row>
              <Row title="压暗" hint="在图片上盖一层黑色，让文字更清楚。"><Slider label="压暗" value={img.overlay} min={0} max={80} unit="%" onChange={(overlay) => patchImg({ overlay })} /></Row>
              <Row title="虚化"><Slider label="虚化" value={img.blur} min={0} max={40} unit="px" onChange={(blur) => patchImg({ blur })} /></Row>
            </>
          )}
        </>
      )}

      {sub === "背景" && (
        <>
          <Row title="这一页的底色" hint="「基础」跟随整套风格；「反白」用另一种颜色，适合做视觉停顿；「强调」用强调色铺满。">
            <Pills value={page.tone} onChange={(tone: Tone) => updatePage(page.id, { tone, bgColor: null })} options={[{ v: "base", label: "基础" }, { v: "alt", label: "反白" }, { v: "accent", label: "强调" }]} />
          </Row>
          <Row title="背景样式" hint="只改这一页。选「跟随整套」就用全局设置。">
            <Pills value={(page.bgStyle ?? "") as BgStyle | ""} onChange={(v) => updatePage(page.id, { bgStyle: (v || null) as BgStyle | null })}
              options={[{ v: "", label: "跟随整套" }, { v: "solid", label: "纯色" }, { v: "gradient", label: "渐变" }, { v: "grid", label: "网格" }, { v: "noise", label: "颗粒" }]} />
          </Row>
          <Row title="自定义底色" hint="想要一个特别的颜色，可以在这里选。">
            <div className="flex items-center justify-between">
              <ColorPicker label="底色" value={page.bgColor ?? design.palette.bg} onChange={(bgColor) => updatePage(page.id, { bgColor })} />
              {page.bgColor && <Button size="sm" variant="ghost" onClick={() => updatePage(page.id, { bgColor: null })}>恢复</Button>}
            </div>
          </Row>
        </>
      )}

      {sub === "元素" && (
        <>
          <Row title="加一个小元素" hint="线、箭头、圈、荧光条这类小装饰，用来指向重点。">
            <div className="flex flex-wrap gap-2">
              {ELEMENTS.map((e) => (
                <button key={e.t} onClick={() => updatePage(page.id, { elements: [...page.elements, { id: uid(), type: e.t, x: 200, y: 520, w: e.w, h: e.h }] })}
                  className="t h-10 rounded-full border border-line px-4 text-[14px] text-mute hover:border-fg hover:text-fg">+ {e.label}</button>
              ))}
            </div>
          </Row>
          {page.elements.length === 0 ? <p className="text-[14px] text-dim">这一页还没有小元素。</p> : (
            <ul className="space-y-5">
              {page.elements.map((el) => (
                <li key={el.id} className="space-y-2 border-t border-line2 pt-4">
                  <div className="flex items-center justify-between"><span className="text-[14.5px]">{ELEMENTS.find((x) => x.t === el.type)?.label}</span>
                    <button aria-label="删除元素" onClick={() => updatePage(page.id, { elements: page.elements.filter((x) => x.id !== el.id) })} className="t text-dim hover:text-danger"><Trash2 size={15} /></button></div>
                  <Slider label="左右" value={el.x} min={0} max={1080} onChange={(x) => patchEl(el.id, { x })} />
                  <Slider label="上下" value={el.y} min={0} max={1350} onChange={(y) => patchEl(el.id, { y })} />
                  <Slider label="宽" value={el.w} min={20} max={1000} onChange={(w) => patchEl(el.id, { w })} />
                  <Slider label="高" value={el.h} min={4} max={900} onChange={(h) => patchEl(el.id, { h })} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {sub === "装饰" && kit.id === "paper" && (
        <Row title="Paper Editorial 装饰" hint="卡片、气泡、曲线这些细节，都可以拨一下就变。"><TweakPanel only="deco" /></Row>
      )}
    </div>
  );
}

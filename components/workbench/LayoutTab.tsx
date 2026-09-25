"use client";
import { useState } from "react";
import { LayoutPreset } from "@/components/design";
import { Button, Slider } from "@/components/ui";
import { useStudio } from "@/lib/store";
import type { Page } from "@/lib/types";
import { Pills, Row, SubTabs } from "./parts";

const SUBS = ["版式", "文字", "位置"] as const;

export default function LayoutTab({ page, index }: { page: Page; index: number }) {
  const { design, pages, setLayout, updatePage, updateAllTypes, notify } = useStudio();
  const [sub, setSub] = useState<(typeof SUBS)[number]>("版式");
  const t = page.type;
  const patch = (p: Partial<typeof t>) => updatePage(page.id, { type: { ...t, ...p } });
  return (
    <div className="space-y-7">
      <SubTabs value={sub} items={[...SUBS]} onChange={setSub} />

      {sub === "版式" && (
        <Row title="这一页用哪种排法" hint="下面每一格都是用这页的文字排出来的效果，点一下就换。文字不会变。">
          <LayoutPreset page={page} index={index} total={pages.length} design={design} cols={3} onPick={(l) => setLayout(page.id, l)} />
        </Row>
      )}

      {sub === "文字" && (
        <>
          <Row title="标题字号" hint="数字越大，标题越大。手机上看，太小会读不清。">
            <Slider label="字号" value={t.size} min={40} max={160} unit="px" onChange={(size) => patch({ size })} />
          </Row>
          <Row title="行距" hint="两行字之间的距离。标题一般 1.0–1.2 比较紧凑好看。">
            <Slider label="行距" value={t.lineHeight} min={0.9} max={1.8} step={0.05} onChange={(lineHeight) => patch({ lineHeight })} />
          </Row>
          <Row title="字距" hint="字和字之间的距离。负数更紧，正数更松。">
            <Slider label="字距" value={t.tracking} min={-6} max={12} unit="%" onChange={(tracking) => patch({ tracking })} />
          </Row>
          <Row title="文字宽度" hint="标题占画面宽度的多少。窄一点，换行更有节奏。">
            <Slider label="宽度" value={t.width} min={40} max={100} unit="%" onChange={(width) => patch({ width })} />
          </Row>
          <Row title="对齐方式">
            <Pills value={t.align} onChange={(align) => patch({ align })} options={[{ v: "left", label: "靠左" }, { v: "center", label: "居中" }, { v: "right", label: "靠右" }]} />
          </Row>
          <Row title="文字在画面的高度">
            <Pills value={t.valign} onChange={(valign) => patch({ valign })} options={[{ v: "top", label: "靠上" }, { v: "middle", label: "居中" }, { v: "bottom", label: "靠下" }]} />
          </Row>
          <Row title="套用到全部页" hint="把这页的字号、行距、字距一次套用给所有页面，保持统一。">
            <Button onClick={() => { updateAllTypes({ size: t.size, lineHeight: t.lineHeight, tracking: t.tracking }); notify("已套用到全部页面。"); }}>套用到全部页</Button>
          </Row>
        </>
      )}

      {sub === "位置" && (
        <>
          <Row title="左右移动" hint="也可以在右边画面上直接拖动文字。">
            <Slider label="左右" value={t.x} min={-300} max={300} unit="px" onChange={(x) => patch({ x })} />
          </Row>
          <Row title="上下移动">
            <Slider label="上下" value={t.y} min={-400} max={400} unit="px" onChange={(y) => patch({ y })} />
          </Row>
          <Row title="回到默认位置"><Button onClick={() => patch({ x: 0, y: 0 })}>重置位置</Button></Row>
        </>
      )}
    </div>
  );
}

import { layoutName, describePage } from "./engine";
import { PRESETS } from "./mock";
import type { GlobalDesign, Page } from "./types";

/** 设计交付单：把所有选择整理成一份可以交给 Designer 的文字 */
export function buildHandoff(title: string, pages: Page[], design: GlobalDesign): string {
  const preset = PRESETS.find((p) => p.id === design.presetId);
  const pal = design.palette;
  const L: string[] = [];
  L.push(`# 设计交付单：${title || "未命名 Carousel"}`, "");
  L.push("## 整体风格");
  L.push(`- 风格套件：${preset?.name ?? design.presetId}${preset ? `（${preset.desc}）` : ""}`);
  L.push(`- 画布：1080 × 1350 px（Instagram 4:5），边距 ${design.grid.margin}px`);
  L.push(`- 标题字体：${design.headlineFont === "serif" ? "衬线（Fraunces / Noto Serif SC）" : "无衬线（Noto Sans SC / Geist）"}；标题大小系数 ${design.tweaks.titleScale}×`);
  L.push(`- 颜色：背景 ${pal.bg} · 文字 ${pal.text} · 强调 ${pal.accent} · 反白 ${pal.altBg}`);
  if (design.signature) L.push(`- 署名：${design.signature}`);
  if (design.photo) L.push(`- 背景照片：${design.photo.name}`);
  L.push("", "## 逐页说明", "");
  pages.forEach((p, i) => {
    const n = describePage(p, design, i);
    L.push(`### P${i + 1} · ${p.role} · ${layoutName(p.layout)}`);
    L.push(`- 标题：${p.headline.replace(/\n/g, " / ")}`);
    if (p.body.trim()) L.push(`- 正文：${p.body.replace(/\n/g, " / ")}`);
    if (p.highlight) L.push(`- 强调词：「${p.highlight}」`);
    L.push(`- 字号：${n.headline}`);
    L.push(`- 背景：${n.background}；视觉：${n.visual}`);
    L.push(`- 为什么这样设计：${n.reason}`);
    L.push(`- 这页的作用：${p.purpose || "—"}；滑动理由：${p.swipeReason || "—"}`, "");
  });
  L.push("---", "由 Carousel Studio 生成");
  return L.join("\n");
}

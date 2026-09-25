import { KITS, type Kit } from "./kits";
import { defaultDesign, defaultType, FONT_FAMILIES, LAYOUTS, visualOf } from "./mock";

const _dt = () => defaultDesign().tweaks;
import type { BgStyle, GlobalDesign, ImageCfg, LayoutId, Page, Role, Tone, Tweaks } from "./types";

/* ───────── color utils ───────── */
export const parseHex = (hex: string): [number, number, number] => {
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const n = parseInt(h.slice(0, 6), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const lin = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
export const luminance = (hex: string) => { const [r, g, b] = parseHex(hex); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
export const contrast = (a: string, b: string) => {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};
export const isLight = (hex: string) => luminance(hex) > 0.45;
export const rgba = (hex: string, a: number) => { const [r, g, b] = parseHex(hex); return `rgba(${r},${g},${b},${a})`; };

/* ───────── theme ───────── */
export interface Theme {
  bg: string; fg: string; muted: string; accent: string; line: string; boxMode: boolean;
  headFont: string; bodyFont: string; monoFont: string; serifFont: string;
  scale: number; labelTracking: number; monoLabels: boolean; bgStyle: BgStyle; light: boolean;
  hlFg: string; hlBg: string; radius: number; gridLines: boolean; hairlines: boolean;
  kit: Kit; photo: string | null; tone: Tone;
  tw: Tweaks; hlMode: Kit["hl"]; display: string;
}

export function resolveTheme(page: Page, d: GlobalDesign): Theme {
  const p = d.palette;
  const kit = KITS[d.kit ?? "basic"];
  let tone: Tone = page.tone;
  if (tone === "base" && kit.tones) tone = page.role === "Hook" ? kit.tones.hook : page.role === "CTA" ? kit.tones.cta : kit.tones.inner;
  const bgStyle: BgStyle = page.bgStyle ?? d.bgStyle;
  let bg = p.bg, fg = p.text, muted = p.muted, accent = p.accent, line = p.border;
  if (tone === "alt") { bg = p.altBg; fg = p.altText; muted = rgba(p.altText, 0.55); line = rgba(p.altText, 0.16); if (contrast(accent, bg) < 2.2 && kit.hl !== "marker") accent = fg; }
  if (tone === "accent") { bg = p.accent; fg = isLight(p.accent) ? "#0B0B0B" : "#F5F5F2"; muted = rgba(fg, 0.62); accent = fg; line = rgba(fg, 0.25); }
  if (bgStyle === "dark" && tone === "base") { bg = "#0E0E0E"; fg = "#F5F5F2"; muted = "#9A9A95"; line = "rgba(255,255,255,0.14)"; if (contrast(accent, bg) < 2.2) accent = p.accent; }
  if (bgStyle === "light" && tone === "base") { bg = "#F4F2EC"; fg = "#111111"; muted = "#6F6F6A"; line = "rgba(0,0,0,0.12)"; if (contrast(accent, bg) < 2.2) accent = "#B98F00"; }
  if (page.bgColor) {
    bg = page.bgColor;
    fg = isLight(bg) ? "#111111" : "#F5F5F2";
    muted = rgba(fg, 0.58); line = rgba(fg, 0.16);
    if (contrast(accent, bg) < 2.2) accent = isLight(bg) ? "#B98F00" : p.accent;
  }
  const boxMode = (tone === "accent" && kit.hl !== "italic") || contrast(accent, bg) < 2.2;
  const s = d.styles;
  const tw: Tweaks = { ...(_dt()), ...(d.tweaks ?? {}) };
  const isPaper = kit.id === "paper";
  const scale = tw.titleScale * (s.includes("Minimal") ? 0.94 : 1) * (s.includes("Bold Typography") ? 1.06 : 1) * (kit.id === "photocover" ? 1.22 : 1);
  const photo = kit.usesPhoto && tone === "base" ? (page.image.mode === "upload" && page.image.url ? page.image.url : d.photo?.url ?? null) : null;
  return {
    bg, fg, muted, accent, line, boxMode, kit, photo, tone, tw, hlMode: isPaper ? tw.hl : kit.hl, display: FONT_FAMILIES.display,
    headFont: isPaper ? FONT_FAMILIES.display : FONT_FAMILIES[page.type.font === "serif" || ((d.headlineFont === "serif" || kit.headFont === "serif") && page.type.font === "sans" && page.layout !== "big-number") ? "serif" : "sans"],
    bodyFont: FONT_FAMILIES.sans, monoFont: FONT_FAMILIES.mono, serifFont: FONT_FAMILIES.serif,
    scale, labelTracking: s.includes("Premium") ? 0.28 : 0.16, monoLabels: true, bgStyle, light: isLight(bg),
    hlFg: boxMode ? bg : accent, hlBg: boxMode ? fg : "transparent", radius: d.radius,
    gridLines: s.includes("Data-driven") || s.includes("Tech"), hairlines: !s.includes("Clean"),
  };
}

/* ───────── layout helpers ───────── */
export const hasImageSlot = (l: LayoutId) => ["headline-image", "split", "full-image", "screenshot"].includes(l);

export function applyLayout(page: Page, layout: LayoutId): Partial<Page> {
  const t = defaultType(layout);
  const image: ImageCfg = { ...page.image };
  if (hasImageSlot(layout) && image.mode === "none") image.mode = "placeholder";
  if ((layout === "screenshot" || layout === "headline-image") && image.mode === "placeholder") image.mode = "screenshot";
  if ((layout === "split" || layout === "full-image") && image.mode === "screenshot") image.mode = "placeholder";
  return { layout, type: { ...page.type, size: t.size, valign: t.valign, weight: t.weight, lineHeight: t.lineHeight, tracking: t.tracking, width: t.width, align: t.align, x: 0, y: 0 }, image };
}

const CANDIDATES: Record<string, LayoutId[]> = {
  Hook: ["headline-image", "headline", "full-image"],
  "Re-hook": ["big-number", "screenshot", "headline"],
  Problem: ["screenshot", "big-number", "split"],
  Story: ["split", "full-image", "quote"],
  Reframe: ["minimal", "quote", "headline"],
  Insight: ["quote", "minimal", "headline"],
  Framework: ["framework", "comparison", "split"],
  Explanation: ["quote", "comparison", "split"],
  Example: ["screenshot", "split", "comparison"],
  Proof: ["screenshot", "big-number", "split"],
  Data: ["big-number", "framework", "headline"],
  "Case Study": ["screenshot", "split", "big-number"],
  Solution: ["framework", "split", "headline"],
  Payoff: ["headline", "quote", "big-number"],
  CTA: ["headline", "minimal", "quote"],
};
export const candidatesFor = (role: Role) => CANDIDATES[role] ?? ["headline"];

/* ───────── page design note (why) ───────── */
export const WHY_LAYOUT: Record<LayoutId, { desc: string; focus: string; why: string }> = {
  headline: { desc: "满版文字，Editorial 左对齐", focus: "标题里的关键词", why: "这页只有一个观点，文字本身就是视觉，加图片只会稀释力度。" },
  "headline-image": { desc: "左对齐 Editorial 标题 + 右下视觉锚点", focus: "标题关键词，其次是右下视觉", why: "第一眼先看到关键词，第二眼才读完整句子；视觉只负责把场景带出来。" },
  split: { desc: "上文下图，两个区块清楚分工", focus: "上方标题", why: "文字先讲观点，图片作为证据放在下方，阅读路径由上到下。" },
  "big-number": { desc: "数字作为页面主角，文字退到两侧", focus: "大数字", why: "数字是这页最强的信息点，先让人看见数字，再读解释。" },
  "full-image": { desc: "整页图片氛围 + 底部标题", focus: "图片氛围与标题", why: "这页靠情绪推进，画面需要占满，文字压在暗部保证可读。" },
  screenshot: { desc: "标题在上，截图拼贴作为 Proof", focus: "标题数字 + 截图", why: "Screenshot 是 Proof，而不是 Decoration，所以放在页面中心位置。" },
  quote: { desc: "问题 / 引述式排版，两层字重", focus: "第二段的核心问题", why: "这是一页认知转换，用两层字号对比，让读者先放下旧问题，再看到新问题。" },
  framework: { desc: "标题 + 垂直流程图", focus: "流程中的每一步", why: "内容本身是流程，用图示比一段文字更快被理解，也更容易被收藏。" },
  comparison: { desc: "左右对比，颜色区分新旧", focus: "右侧的新做法", why: "对比让转变一眼可见，读者不需要自己推导差异。" },
  stagger: { desc: "错落大字：每行左右交替，关键词加粗，周围漂浮问题气泡", focus: "加粗的关键词", why: "封面先用视觉节奏抓眼：字大、错落、有留白，气泡暗示「这套内容回答什么问题」。" },
  "prompt-card": { desc: "居中衬线标题 + 白色提示卡片 + 工具图标 + 贯穿的曲线", focus: "提示卡片里的加粗短语", why: "把抽象的用法变成一个真实的「输入」，读者一眼看到具体做法；曲线把图标和卡片串成一个流程。" },
  closing: { desc: "小插画 + 两行衬线收尾", focus: "最后一句话", why: "结尾放慢节奏：一个安静的图形加一句话，让读者记住结论。" },
  minimal: { desc: "大留白 + 一句话", focus: "整句话", why: "这是一页认知 Reframe，需要 Visual Reset：没有图片，让上一页的信息量沉淀下来。" },
};

export function describePage(page: Page, d: GlobalDesign, index: number) {
  const w = WHY_LAYOUT[page.layout];
  const t = page.type;
  const size = Math.round(t.size * (page.layout === "quote" ? 1 : 1));
  const th = resolveTheme(page, d);
  const hasImg = hasImageSlot(page.layout) && page.image.mode !== "none";
  const imageDesc =
    page.image.mode === "none" ? "无图片" :
    !hasImageSlot(page.layout) ? "无图片（本 Layout 不使用）" :
    page.image.mode === "screenshot" ? "Instagram Feed Screenshot" :
    page.image.mode === "upload" ? `已上传：${page.image.fileName ?? "图片"}` : "Image Placeholder（待补图）";
  const whyImage = !hasImageSlot(page.layout)
    ? "这一页没有图片：视觉靠文字与留白完成，不为设计而硬塞图片。"
    : page.image.mode === "screenshot"
      ? "Screenshot 是 Proof，而不是 Decoration，所以真实界面要清晰可辨。"
      : "这页需要一个视觉锚点，但目前还没有真正有价值的素材。";
  const hl = page.highlight
    ? `「${page.highlight}」使用 ${th.boxMode ? "反色色块" : "Accent Yellow"}`
    : "未设置 Highlight";
  return {
    role: page.role,
    layout: w.desc,
    focus: page.layout === "big-number" ? `${page.stat.value} ${page.stat.unit}` : page.highlight ? `「${page.highlight}」` : w.focus,
    headline: `${size}px · ${t.weight >= 700 ? "Bold" : t.weight >= 500 ? "Medium" : "Regular"} · Line height ${t.lineHeight}`,
    highlight: hl,
    position: `X ${d.grid.margin + t.x}px · Y ${(page.layout === "headline" ? 310 : 170) + t.y}px`,
    background: `${th.bg.toUpperCase()}${page.bgStyle ?? d.bgStyle !== "solid" ? ` · ${page.bgStyle ?? d.bgStyle}` : ""}`,
    visual: imageDesc,
    treatment: hasImg ? `Opacity ${page.image.opacity}% · Overlay ${page.image.overlay}% · Blur ${page.image.blur}px` : "—",
    label: `${page.label || `P${index + 1}`} · ${d.grid.safe > 60 ? 22 : 20}px`,
    reason: w.why,
    whyImage,
    whyHighlight: page.highlight ? "它是整句话的 Visual Focus，颜色只用在这一处，避免分散注意力。" : "",
  };
}

/* ───────── checks ───────── */
export interface Check { ok: boolean; text: string }
const plain = (s: string) => s.replace(/\s+/g, "");
const grams = (s: string) => { const t = plain(s).toLowerCase(); const g = new Set<string>(); for (let i = 0; i < t.length - 1; i++) g.add(t.slice(i, i + 2)); return g; };
const similarity = (a: string, b: string) => {
  const A = grams(a), B = grams(b); if (!A.size || !B.size) return 0;
  let n = 0; A.forEach((x) => B.has(x) && n++); return n / Math.min(A.size, B.size);
};

export function coverChecks(page: Page, d: GlobalDesign): Check[] {
  const th = resolveTheme(page, d);
  const len = plain(page.headline).length;
  const hlCount = (page.highlight ? 1 : 0) + page.elements.filter((e) => e.type === "highlight" || e.type === "number").length;
  const ratio = contrast(th.fg, th.bg);
  const short = Math.max(6, Math.round((len - 18) / Math.max(len, 1) * 100));
  return [
    { ok: len <= 26, text: len <= 26 ? "Hook 清晰，3 秒内能读完" : "Hook 偏长，3 秒内可能读不完" },
    { ok: !!page.highlight, text: page.highlight ? "Visual Focus 明确" : "还没有设置 Visual Focus（Highlight）" },
    { ok: len <= 20, text: len <= 20 ? "Headline 长度合适" : `Headline 可以再缩短 ${Math.min(short, 40)}%` },
    { ok: hlCount <= 3, text: hlCount <= 3 ? "重点不超过 3 个" : "重点超过 3 个，会分散注意力" },
    { ok: ratio >= 4.5, text: ratio >= 4.5 ? `Contrast 良好（${ratio.toFixed(1)}:1）` : `Contrast 不足（${ratio.toFixed(1)}:1）` },
    { ok: page.type.size * th.scale >= 64, text: page.type.size * th.scale >= 64 ? "Mobile 上容易阅读" : "字号偏小，手机上可能难读" },
  ];
}

export function rehookChecks(page: Page, first: Page | undefined): Check[] {
  const sim = first ? similarity(first.headline, page.headline) : 0;
  const hasNew = plain(page.body).length > 0 || page.layout === "big-number";
  return [
    { ok: sim < 0.5, text: sim < 0.5 ? "没有重复 P1" : "和 P1 太像，读者没有新理由继续滑" },
    { ok: hasNew, text: hasNew ? "增加了新信息（具体场景 / 数字）" : "没有增加新信息，只是换了句话" },
    { ok: !!page.swipeReason.trim(), text: page.swipeReason.trim() ? "继续制造了 Swipe Reason" : "还没有写 Swipe Reason" },
  ];
}

export function qualityChecks(pages: Page[], d: GlobalDesign) {
  const first = pages[0], second = pages[1], last = pages[pages.length - 1];
  const layouts = new Set(pages.map((p) => p.layout));
  let run = 1, maxRun = 1;
  pages.forEach((p, i) => { if (i && p.layout === pages[i - 1].layout) run++; else run = 1; maxRun = Math.max(maxRun, run); });
  const contrastFail = pages.filter((p) => { const t = resolveTheme(p, d); return contrast(t.fg, t.bg) < 4.5; }).length;
  const imgPages = pages.filter((p) => hasImageSlot(p.layout) && p.image.mode !== "none");
  const tooSmall = pages.filter((p) => p.type.size * resolveTheme(p, d).scale < 56 && p.layout !== "quote" && p.layout !== "big-number").length;
  const content: Check[] = [
    { ok: !!first?.headline.trim() && plain(first.headline).length <= 30, text: "Hook 有明确观点" },
    { ok: !second || !first || similarity(first.headline, second.headline) < 0.5, text: "P2 没有重复 P1" },
    { ok: pages.every((p) => plain(p.headline).length <= 34), text: "每页只有一个主要信息" },
    { ok: new Set(pages.map((p) => p.role)).size >= Math.min(4, pages.length), text: "内容有逻辑推进" },
    { ok: last?.role === "CTA" && plain(last.body).length > 0, text: "CTA 与内容一致" },
  ];
  const design: Check[] = [
    { ok: pages.every((p) => p.type.size >= 56 || p.layout === "quote"), text: "Typography Hierarchy 清晰" },
    { ok: contrastFail === 0, text: "Contrast 足够" },
    { ok: layouts.size >= 4, text: "Visual Rhythm 有变化" },
    { ok: maxRun < 3 && layouts.size > 1, text: "没有连续多页使用相同 Layout" },
    { ok: imgPages.every((p) => p.image.mode !== "placeholder"), text: "图片有实际作用（没有留空的占位图）" },
    { ok: true, text: "Brand Color 使用一致" },
    { ok: tooSmall === 0, text: "Mobile Readability 良好" },
  ];
  return { content, design };
}

/* ───────── rhythm caption ───────── */
export function rhythmCaption(p: Page): string {
  if (p.role === "CTA" || p.tone === "accent") return "Yellow CTA";
  switch (p.layout) {
    case "headline-image": return "Typography + Visual";
    case "big-number": return "Big Number";
    case "screenshot": return "Screenshot Heavy";
    case "minimal": return "Minimal Reset";
    case "framework": return "Framework";
    case "quote": return "Question / Editorial";
    case "headline": return "Bold Statement";
    default: return visualOf(p.layout);
  }
}

export const layoutName = (l: LayoutId) => LAYOUTS.find((x) => x.id === l)?.name ?? l;
export const toneCycle: Tone[] = ["base", "alt", "accent"];

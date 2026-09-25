import type {
  AnalysisItem, BrandPreset, DesignPreset, GlobalDesign, Hook, ImageCfg, InputState, LayoutId,
  Page, Project, Role, TypeCfg, VisualType,
} from "./types";

/* ───────── constants ───────── */
export const ROLES: Role[] = [
  "Hook", "Re-hook", "Problem", "Story", "Reframe", "Insight", "Framework", "Explanation",
  "Example", "Proof", "Data", "Case Study", "Solution", "Payoff", "CTA",
];

export const LAYOUTS: { id: LayoutId; no: string; name: string; hint: string }[] = [
  { id: "headline", no: "01", name: "Big Headline", hint: "纯文字，观点最强" },
  { id: "headline-image", no: "02", name: "Headline + Image", hint: "标题 + 视觉锚点" },
  { id: "split", no: "03", name: "Split", hint: "上文下图" },
  { id: "big-number", no: "04", name: "Big Number", hint: "数字是主角" },
  { id: "full-image", no: "05", name: "Full Image", hint: "整页图片氛围" },
  { id: "screenshot", no: "06", name: "Screenshot", hint: "用截图做 Proof" },
  { id: "quote", no: "07", name: "Quote", hint: "问题 / 引述" },
  { id: "framework", no: "08", name: "Framework", hint: "流程 / 步骤" },
  { id: "comparison", no: "09", name: "Comparison", hint: "新旧对比" },
  { id: "minimal", no: "10", name: "Minimal", hint: "留白，视觉重置" },
  { id: "stagger", no: "11", name: "Stagger Cover", hint: "错落大字封面 + 气泡" },
  { id: "prompt-card", no: "12", name: "Prompt Card", hint: "标题 + 白色提示卡片 + 工具图标" },
  { id: "closing", no: "13", name: "Closing", hint: "小插画 + 两行收尾" },
];

export const VISUAL_TYPES: { type: VisualType; layout: LayoutId }[] = [
  { type: "Typography", layout: "headline" },
  { type: "Photo", layout: "headline-image" },
  { type: "Screenshot", layout: "screenshot" },
  { type: "Big Number", layout: "big-number" },
  { type: "Diagram", layout: "framework" },
  { type: "Quote", layout: "quote" },
  { type: "Split Layout", layout: "split" },
  { type: "Full Image", layout: "full-image" },
  { type: "Minimal", layout: "minimal" },
  { type: "Data", layout: "big-number" },
  { type: "Framework", layout: "framework" },
];

export const visualOf = (l: LayoutId): VisualType =>
  VISUAL_TYPES.find((v) => v.layout === l)?.type ?? "Typography";

export const STYLE_CHOICES = [
  ["Clean", "干净"], ["Modern", "现代"], ["Professional", "专业"], ["Editorial", "Editorial"],
  ["Bold Typography", "Bold Typography"], ["Minimal", "Minimal"], ["Tech", "Tech"],
  ["Premium", "Premium"], ["Data-driven", "Data-driven"],
];

export const VISUAL_CHOICES = [
  "真实照片", "人物照片", "产品照片", "Screenshot", "UI Screen", "数据图表", "Diagram",
  "Icon", "Typography", "Gradient", "Texture", "Illustration", "Meme", "Before / After",
];

export const IMAGE_STRATEGY: { type: string; visual: string; note: string }[] = [
  { type: "Result", visual: "Result Screenshot / Before After", note: "结果必须被看见" },
  { type: "Process", visual: "Workflow / UI / Diagram", note: "让步骤一眼可读" },
  { type: "Pain", visual: "Real-life Scene / Screenshot", note: "还原真实的烦恼场景" },
  { type: "Opinion", visual: "Typography", note: "观点靠文字的力度" },
  { type: "Data", visual: "Big Number / Chart", note: "数字就是视觉" },
  { type: "Product", visual: "Product / Interface", note: "展示真实界面" },
  { type: "Case Study", visual: "Client / Result / Proof", note: "证明比装饰重要" },
  { type: "Framework", visual: "Diagram / Cards", note: "结构可视化" },
];

export const FONT_FAMILIES = {
  sans: `var(--font-sc), var(--font-geist), "PingFang SC", "Helvetica Neue", sans-serif`,
  display: `var(--font-fraunces), var(--font-serif-sc), "Songti SC", serif`,
  serif: `var(--font-instrument), "Songti SC", "Noto Serif SC", serif`,
  mono: `var(--font-geist-mono), ui-monospace, monospace`,
};

/* ───────── default image / type ───────── */
export const defaultImage = (mode: ImageCfg["mode"] = "placeholder"): ImageCfg => ({
  mode, fit: "cover", opacity: 100, radius: 0, overlay: 0, blur: 0,
});

export const defaultType = (layout: LayoutId): TypeCfg => {
  const base: TypeCfg = {
    font: "sans", size: 96, weight: 800, lineHeight: 1.1, tracking: -2, align: "left",
    valign: "top", width: 100, x: 0, y: 0,
  };
  switch (layout) {
    case "headline": return { ...base, size: 108, valign: "middle" };
    case "headline-image": return { ...base, size: 80, lineHeight: 1.12 };
    case "split": return { ...base, size: 92 };
    case "big-number": return { ...base, size: 72, weight: 700, lineHeight: 1.2 };
    case "full-image": return { ...base, size: 100, valign: "bottom" };
    case "screenshot": return { ...base, size: 90 };
    case "quote": return { ...base, size: 60, weight: 500, lineHeight: 1.35, tracking: 0, valign: "middle" };
    case "framework": return { ...base, size: 80 };
    case "comparison": return { ...base, size: 80 };
    case "minimal": return { ...base, size: 88, weight: 700, valign: "middle", width: 100 };
    case "stagger": return { ...base, size: 190, weight: 400, lineHeight: 0.92, tracking: -2, valign: "middle" };
    case "prompt-card": return { ...base, size: 66, weight: 400, lineHeight: 1.18, tracking: -1, align: "center" };
    case "closing": return { ...base, size: 104, weight: 400, lineHeight: 1.1, tracking: -1, align: "center", valign: "middle" };
  }
};

export const uid = () => Math.random().toString(36).slice(2, 9);

export const mkPage = (o: Partial<Page> & Pick<Page, "role" | "headline" | "layout">): Page => ({
  id: uid(), body: "", purpose: "", swipeReason: "", label: "", tone: "base", highlight: "",
  stat: { value: "5", unit: "STEPS" }, steps: ["Research", "Breakdown", "Find Angle", "Adapt", "Create"], chips: [], result: { kind: "none", title: "", sub: "" },
  image: defaultImage(o.layout === "headline-image" || o.layout === "screenshot" ? "screenshot" : "placeholder"),
  type: defaultType(o.layout), bgStyle: null, bgColor: null, elements: [], ctaType: "Comment",
  ...o,
});

/* ───────── demo carousel ───────── */
export const demoPages = (): Page[] => [
  mkPage({
    role: "Hook", layout: "headline-image", label: "CONTENT SYSTEM / 01",
    headline: "每天找 Content，\n才是最浪费时间的工作。", highlight: "找 Content",
    purpose: "制造认知冲突。", swipeReason: "用户会想知道「那应该怎么找？」",
  }),
  mkPage({
    role: "Re-hook", layout: "big-number", label: "REALITY CHECK / 02",
    headline: "你以为你在 Research。",
    body: "IG → TikTok → 小红书 → Threads\n\n40分钟过去，\n还是不知道今天发什么。",
    stat: { value: "40", unit: "MIN" }, highlight: "",
    purpose: "把抽象问题变成真实日常。", swipeReason: "「这不就是我每天在做的事吗？」",
  }),
  mkPage({
    role: "Problem", layout: "screenshot", label: "THE PAIN / 03",
    headline: "Save了100条。", body: "真正用到的，\n可能不到5条。", highlight: "100条",
    purpose: "用具体数字放大痛点，让人对号入座。", swipeReason: "想知道另外 95 条为什么没用上。",
  }),
  mkPage({
    role: "Reframe", layout: "minimal", tone: "alt", label: "REFRAME / 04",
    headline: "问题不是没有灵感。", body: "是 Research 没有系统。", highlight: "没有系统",
    purpose: "一句话推翻旧认知，同时给视觉一次重置。", swipeReason: "想看「系统」到底是什么。",
  }),
  mkPage({
    role: "Framework", layout: "framework", label: "FRAMEWORK / 05",
    headline: "真正有效的\nContent Research：", highlight: "Content Research",
    steps: ["Research", "Breakdown", "Find Angle", "Adapt", "Create"],
    purpose: "把系统可视化成 5 个可执行步骤。", swipeReason: "想知道每一步具体怎么做。",
  }),
  mkPage({
    role: "Explanation", layout: "quote", label: "MINDSET / 06",
    headline: "看到一条爆款，\n不要先问：\n「我可以怎样抄？」",
    body: "先问：\n它为什么让人停下来？", highlight: "让人停下来",
    purpose: "用一个问题的转换，教会判断标准。", swipeReason: "想马上用这个问题去拆一条内容。",
  }),
  mkPage({
    role: "Payoff", layout: "headline", label: "PAYOFF / 07", type: { ...defaultType("headline"), size: 80, valign: "middle" },
    headline: "你真正需要建立的，\n不是一个 Inspiration Folder。",
    body: "而是一套：\nContent Intelligence System。", highlight: "Content Intelligence System",
    purpose: "给出最终的身份升级：从收藏到系统。", swipeReason: "想要拿到这套系统。",
  }),
  mkPage({
    role: "CTA", layout: "headline", tone: "accent", label: "GET THE SYSTEM / 08",
    headline: "想要这套\nContent Research\nFramework？", body: "留言：「SYSTEM」",
    highlight: "Framework", ctaType: "Comment",
    purpose: "只给一个动作，让互动门槛最低。", swipeReason: "已经看完 7 页，动作成本很低。",
  }),
];

/* ───────── design presets ───────── */
export const PRESETS: DesignPreset[] = [
  {
    id: "kit-paper", kit: "paper", name: "Paper Editorial", desc: "暖白纸底 + 衬线大标题 + 白色提示卡片 + 赭红曲线（可微调）", headlineFont: "serif", radius: 0, bgStyle: "solid",
    visual: "Typography + Line Art", typography: "Serif Display + Italic",
    palette: { bg: "#F5F2EA", text: "#1E1B18", muted: "#6F675C", accent: "#D4714E", border: "rgba(30,27,24,0.14)", altBg: "#C8623E", altText: "#FBF6EC" },
  },
  {
    id: "kit-moody", kit: "moody", name: "Moody Gold", desc: "暗调照片背景 + 衬线标题 + 金色细线（需上传照片）", headlineFont: "serif", radius: 0, bgStyle: "solid",
    visual: "Photo + Typography", typography: "Serif Display + Gold Rule",
    palette: { bg: "#15110C", text: "#F6F0E6", muted: "#D9CFBC", accent: "#D4B26A", border: "rgba(212,178,106,0.5)", altBg: "#F3EBDD", altText: "#1A1510" },
  },
  {
    id: "kit-collage", kit: "collage", name: "Collage Punk", desc: "封面暗纹 + 撕纸标题 + 马克笔，内页极简白底", headlineFont: "serif", radius: 0, bgStyle: "texture",
    visual: "Torn Paper + Marker", typography: "Heavy Serif",
    palette: { bg: "#1A1A19", text: "#F5F3EE", muted: "#A6A297", accent: "#F2C230", border: "rgba(245,243,238,0.2)", altBg: "#F6F3EC", altText: "#141414" },
  },
  {
    id: "kit-photocover", kit: "photocover", name: "Photo Cover", desc: "全出血照片 + 超粗大字 + 斜体衬线强调 + 药丸按钮（需上传照片）", headlineFont: "sans", radius: 0, bgStyle: "solid",
    visual: "Photo + Heavy Type", typography: "Heavy Sans + Italic Serif",
    palette: { bg: "#161616", text: "#FFFFFF", muted: "#F0EDE6", accent: "#FFFFFF", border: "rgba(255,255,255,0.4)", altBg: "#F4F1EA", altText: "#111111" },
  },
  {
    id: "kit-frosted", kit: "frosted", name: "Frosted Card", desc: "照片背景 + 毛玻璃卡片 + 星星贴纸（需上传照片）", headlineFont: "sans", radius: 0, bgStyle: "solid",
    visual: "Photo + Frosted Glass", typography: "Bold Sans",
    palette: { bg: "#1F281B", text: "#FFFFFF", muted: "#F4F0E2", accent: "#E9F27A", border: "rgba(255,255,255,0.5)", altBg: "#F5F1E4", altText: "#1A1A1A" },
  },
  {
    id: "kit-pixel", kit: "pixel", name: "Pixel Game", desc: "深蓝舞台 + 奶油铭牌 + 像素角色 + 荧光绿高亮", headlineFont: "serif", radius: 0, bgStyle: "solid",
    visual: "Pixel Illustration", typography: "Bold Serif",
    palette: { bg: "#1F2E45", text: "#F6EBD3", muted: "#B9C4D4", accent: "#C6E266", border: "rgba(246,235,211,0.3)", altBg: "#F4E9CF", altText: "#1B2536" },
  },
  {
    id: "dark-editorial", name: "Dark Editorial", desc: "黑底 + 黄色重点 + Bold Sans", headlineFont: "sans", radius: 0, bgStyle: "solid",
    visual: "Screenshot + Typography", typography: "Bold Sans",
    palette: { bg: "#101010", text: "#F5F5F2", muted: "#9A9A95", accent: "#F5C518", border: "rgba(255,255,255,0.14)", altBg: "#F2F0EA", altText: "#111111" },
  },
  {
    id: "clean-white", name: "Clean White", desc: "白底，干净，信息优先", headlineFont: "sans", radius: 8, bgStyle: "solid",
    visual: "Diagram + Icon", typography: "Regular Sans",
    palette: { bg: "#FAFAF8", text: "#141414", muted: "#6F6F6A", accent: "#E0A800", border: "rgba(0,0,0,0.12)", altBg: "#141414", altText: "#F5F5F2" },
  },
  {
    id: "premium-black", name: "Premium Black", desc: "纯黑 + 香槟金，克制", headlineFont: "serif", radius: 0, bgStyle: "gradient",
    visual: "Typography + Texture", typography: "Serif Display",
    palette: { bg: "#0A0A0A", text: "#F3EFE6", muted: "#8E8A80", accent: "#D6C08A", border: "rgba(243,239,230,0.14)", altBg: "#E9E3D4", altText: "#0A0A0A" },
  },
  {
    id: "editorial-beige", name: "Editorial Beige", desc: "米色纸感 + 衬线标题", headlineFont: "serif", radius: 0, bgStyle: "noise",
    visual: "Typography + Photo", typography: "Serif Display",
    palette: { bg: "#EDE7DA", text: "#1B1A17", muted: "#77705F", accent: "#B4532F", border: "rgba(27,26,23,0.16)", altBg: "#1B1A17", altText: "#EDE7DA" },
  },
  {
    id: "tech-dark", name: "Tech Dark", desc: "深灰蓝 + 低饱和薄荷", headlineFont: "sans", radius: 8, bgStyle: "grid",
    visual: "UI Screen + Data", typography: "Sans + Mono",
    palette: { bg: "#0D1113", text: "#E8EEEC", muted: "#7F8B88", accent: "#8CCDB6", border: "rgba(232,238,236,0.14)", altBg: "#E8EEEC", altText: "#0D1113" },
  },
  {
    id: "bold-yellow", name: "Bold Yellow", desc: "黄底黑字，强烈冲击", headlineFont: "sans", radius: 0, bgStyle: "solid",
    visual: "Big Typography", typography: "Heavy Sans",
    palette: { bg: "#F5C518", text: "#0B0B0B", muted: "#4A3F0C", accent: "#0B0B0B", border: "rgba(11,11,11,0.25)", altBg: "#0B0B0B", altText: "#F5C518" },
  },
  {
    id: "minimal-grey", name: "Minimal Grey", desc: "浅灰 + 大留白", headlineFont: "sans", radius: 16, bgStyle: "solid",
    visual: "Minimal Typography", typography: "Light Sans",
    palette: { bg: "#E7E7E3", text: "#161616", muted: "#7A7A75", accent: "#B98F00", border: "rgba(22,22,22,0.14)", altBg: "#161616", altText: "#E7E7E3" },
  },
];

export const defaultDesign = (): GlobalDesign => ({
  presetId: "kit-paper",
  kit: "paper",
  photo: null,
  styles: ["Editorial", "Modern"],
  visuals: ["Screenshot", "Typography", "Icon"],
  palette: { ...PRESETS.find((p) => p.id === "kit-paper")!.palette },
  signature: "",
  tweaks: { chrome: false, hl: "bold", squiggle: true, squiggleWidth: 3, chips: true, cardRadius: 40, cardShadow: 40, sendButton: true, titleScale: 1, titleWeight: 400 },
  headlineFont: "serif",
  bodyFontName: "Noto Sans SC",
  headlineWeight: 800,
  bodyWeight: 400,
  radius: 0,
  grid: { margin: 80, cols: 12, gap: 24, safe: 80 },
  bgStyle: "solid",
  gradient: { a: "#2B2410", b: "#101010", dir: 160, intensity: 100 },
  overlay: 45, blur: 0, grain: 5,
});

/* ───────── brands ───────── */
export const BRANDS: BrandPreset[] = [
  { id: "b1", name: "我的品牌", primary: "#1F1B16", secondary: "#F6F1E8", accent: "#C0562F", font: "Noto Serif SC / Geist", imageStyle: "Screenshot + Typography", designStyle: "Editorial / Warm / Calm" },
];

/* ───────── projects ───────── */
export const PROJECTS: Project[] = [
  { id: "p1", title: "每天找 Content，才是最浪费时间的工作", client: "示例品牌 A", format: "IG Carousel · 8页", status: "等待设计", edited: "12 分钟前", presetId: "dark-editorial" },
  { id: "p2", title: "为什么老板越来越难做内容", client: "示例品牌 B", format: "IG Carousel · 8页", status: "Draft", edited: "今天 09:40", presetId: "premium-black" },
  { id: "p3", title: "AI不会取代Marketing", client: "示例品牌 A", format: "FB Carousel · 8页", status: "等待内容确认", edited: "昨天", presetId: "tech-dark" },
  { id: "p4", title: "客户不是因为价格不买", client: "示例品牌 C", format: "IG Carousel · 8页", status: "已完成", edited: "2 天前", presetId: "editorial-beige" },
  { id: "p5", title: "Founder IP为什么重要", client: "示例品牌 B", format: "LinkedIn · 8页", status: "已完成", edited: "3 天前", presetId: "clean-white" },
  { id: "p6", title: "一条内容，怎么拆成七天素材", client: "示例品牌 A", format: "小红书 · 8页", status: "Draft", edited: "上周", presetId: "bold-yellow" },
];

export const STATUS_STEP: Record<Project["status"], number> = { Draft: 2, "等待内容确认": 4, "等待设计": 5, "已完成": 7 };

export const TEMPLATES = [
  { id: "t1", name: "Myth Bust", desc: "推翻一个行业里人人相信的说法", pages: "Hook → 迷思 → 真相 → 证据 → CTA", topic: "「多发内容就会有流量」是最贵的谎言" },
  { id: "t2", name: "Framework 拆解", desc: "把一套方法讲成 5 步可执行框架", pages: "Hook → 问题 → 框架 → 每步说明 → CTA", topic: "把 Content Research 变成 5 步系统" },
  { id: "t3", name: "Case Study", desc: "客户结果 + 做法 + 可复制的原则", pages: "Hook → 背景 → 做法 → 结果 → 原则 → CTA", topic: "一个 SME 如何用 30 天拿到 120 个 Lead" },
  { id: "t4", name: "Before / After", desc: "用对比让转变一眼可见", pages: "Hook → Before → 转折 → After → CTA", topic: "同一个产品，两种内容策略的差别" },
  { id: "t5", name: "Founder Story", desc: "个人叙事带出观点与信任", pages: "Hook → 起点 → 低谷 → 转折 → 教训 → CTA", topic: "我为什么把 Founder IP 当作第一优先" },
  { id: "t6", name: "Checklist / 清单", desc: "高收藏率的实用清单", pages: "Hook → 清单 1–6 → 总结 → CTA", topic: "发布前必检的 7 件事" },
];

/* ───────── input ───────── */
export const defaultInput = (): InputState => ({
  type: "topic", text: "", client: "示例品牌 A", goal: "Education", platform: "Instagram",
  audience: "", cta: "Comment", fileName: "",
});

export const INPUT_PLACEHOLDER = {
  topic: "为什么很多老板每天都在做Content，但Content还是没有带来客户？",
  link: "https://www.instagram.com/p/…",
  transcript: "把视频 / 播客 / 会议的逐字稿贴在这里……",
  existing: "把已有的文章、文案或旧 Carousel 内容贴在这里……",
  screenshot: "",
};
export const AUDIENCE_PLACEHOLDER = "马来西亚 SME Business Owner，25–45岁，有在经营社交媒体，但没有稳定内容策略。";

/* ───────── analysis ───────── */
const A = (no: string, label: string, value: string, alts: string[], wide = false): AnalysisItem => ({
  id: "a" + no, no, label, value, alts, altIdx: 0, wide,
});
export const demoAnalysis = (): AnalysisItem[] => [
  A("01", "核心主题", "Content Research 不是找灵感，而是把灵感变成自己的 Angle 的系统。", ["与其每天找内容，不如先建立一套内容判断标准。"]),
  A("02", "目标受众", "马来西亚 SME Business Owner / Content Manager，25–45岁，已经在经营社交媒体，但没有稳定的内容策略。", ["经营 3–10 人团队的小老板，亲自盯内容，却没有时间做系统。"]),
  A("03", "用户现在的问题", "每天花大量时间刷内容找灵感，最后发出去的还是临时凑的东西，没有客户回应。", ["内容产出靠感觉，没有可复制的流程，所以每天都像从零开始。"]),
  A("04", "大众共鸣点", "每天花很多时间找内容，却还是不知道该发什么。", ["Save 了一堆参考，真正用上的没几条。"], true),
  A("05", "为什么会共鸣", "因为很多 Content Creator / Business Owner 的问题不是没有素材，而是没有一个固定的 Research → Filter → Adapt → Create 系统。", ["这是每个做内容的人都经历过的日常，且从来没人告诉他们这是流程问题。"], true),
  A("06", "核心矛盾", "花越多时间找灵感，产出反而越慢、越没有方向。", ["看得越多，越不知道该做什么。"]),
  A("07", "Existing Belief", "「我要找更多 Content Inspiration。」", ["「灵感够多，内容自然会好。」"]),
  A("08", "New Belief", "「你缺的不是更多灵感，而是一个把灵感变成内容的系统。」", ["「灵感只是原料，判断标准才是产能。」"]),
  A("09", "Key Insight", "Content Research 不应该以“找到好内容”为结束，而应该以“能不能变成自己的 Angle”为判断标准。", ["好内容的价值不在于它本身，而在于你能从中拆出什么。"], true),
  A("10", "Content Promise", "看完这 8 页，你会拿到一套 5 步 Content Research 流程，下一次不再从零开始。", ["读完后你能用一个问题，判断任何一条内容值不值得参考。"]),
  A("11", "Emotional Trigger", "焦虑 / 被戳中：每天都在做、却从没怀疑过的事，其实是在浪费时间。", ["自我怀疑 + 释然：原来问题不在我。"]),
  A("12", "Share Trigger", "「这就是我们团队每天的状态」——适合转发给同事和老板。", ["转发给还在“找灵感”的合作伙伴。"]),
  A("13", "Save Trigger", "P5 的 5 步 Framework，可以直接拿来当工作清单。", ["P6 的判断问题，适合截图收藏。"]),
  A("14", "Comment Trigger", "留言 SYSTEM，领取完整 Research 模板。", ["留言你现在最头痛的一步，我们回复具体做法。"]),
];

/* ───────── hooks ───────── */
const H = (no: string, framework: string, copy: string, why: string, psychology: string, strength: Hook["strength"], variants: string[]): Hook => ({
  id: "h" + no, no, framework, copy, why, psychology, strength, variants, vIdx: 0,
});
export const demoHooks = (): Hook[] => [
  H("01", "Contrarian", "每天找 Content，\n才是最浪费时间的工作。", "它攻击一个目标受众每天都在做、却从未怀疑过的行为。", "认知冲突 · 自我怀疑", "Strong",
    ["每天刷灵感，\n其实是在拖慢你的内容。", "找内容这件事，\n本身就是问题。"]),
  H("02", "Hidden Problem", "你的 Content 没有带来客户，\n问题不在 Content。", "把注意力从表面症状转到一个看不见的原因。", "好奇 · 归因转移", "Strong",
    ["内容没效果，\n多半不是内容的错。", "你一直在修错地方。"]),
  H("03", "Sharp Reframe", "Content 不是发布出去的东西，\n是客户走进来的入口。", "换一个定义，就换了整个工作的重要性。", "身份升级 · 新框架", "Strong",
    ["Content 不是任务，\n是一条销售通道。", "发内容不是发布，是布局。"]),
  H("04", "Counterintuitive", "发得越多，\n客户反而越少。", "与常识相反，但能被自己的经验验证。", "反直觉 · 好奇", "Medium",
    ["更新越勤，\n回复越少。", "越努力发，越没人看。"]),
  H("05", "Myth Bust", "「多发就会有流量」\n是这个行业最贵的谎言。", "直接点名一个被广泛接受的说法。", "挑战权威 · 损失厌恶", "Medium",
    ["「坚持发就会有结果」\n只对了一半。", "流量不是发出来的。"]),
  H("06", "Diagnostic", "如果你每天都在想「今天发什么」，\n你缺的不是灵感。", "用一个自测条件让读者自我对号入座。", "自我诊断 · 好奇", "Strong",
    ["如果你总在赶发布，\n问题是流程。", "还在想今天发什么？\n先看这一页。"]),
  H("07", "Curiosity", "我看了 100 个 Content Team 的工作流，\n发现只有 3 个人不再找灵感。", "用具体样本制造信息缺口。", "信息缺口 · 社会证明", "Experimental",
    ["只有 3% 的团队，\n不再为选题发愁。", "他们为什么从不缺内容？"]),
  H("08", "Missing Piece", "你有素材、有工具、有团队，\n唯独少了这一块。", "暗示答案只差一步，促使继续滑动。", "缺口感 · 期待", "Medium",
    ["你什么都有了，\n只差一个系统。", "其实只差一步。"]),
  H("09", "Outcome Without Sacrifice", "不用每天刷 40 分钟，\n也能有发不完的内容。", "承诺结果，同时移除最大的代价。", "欲望 · 省力", "Medium",
    ["不花 40 分钟，\n照样有内容可发。", "少刷一点，多产一点。"]),
  H("10", "High-Stakes Warning", "再这样找灵感下去，\n你的团队会先被耗尽。", "把日常小事放大成后果，制造紧迫感。", "损失厌恶 · 紧迫", "Experimental",
    ["这样下去，\n先撑不住的是团队。", "找灵感正在消耗你的团队。"]),
];

/* ───────── page purpose defaults ───────── */
export const ROLE_PURPOSE: Record<string, [string, string]> = {
  Hook: ["制造认知冲突。", "想知道答案是什么。"],
  "Re-hook": ["把抽象问题变成真实日常。", "继续往下看还有什么。"],
  Problem: ["放大痛点，让读者对号入座。", "想知道怎么解决。"],
  Story: ["用一个具体场景建立共鸣。", "想知道结局。"],
  Reframe: ["推翻旧认知，给出新视角。", "想看新视角如何落地。"],
  Insight: ["给出一个可记住的洞察。", "想看它如何应用。"],
  Framework: ["把方法变成可执行步骤。", "想知道每一步细节。"],
  Explanation: ["解释为什么这样做有效。", "想立刻试一试。"],
  Example: ["用例子让抽象变具体。", "想看更多例子。"],
  Proof: ["提供证据建立信任。", "想知道怎么做到的。"],
  Data: ["用数字增加说服力。", "想知道数字背后的原因。"],
  "Case Study": ["用真实案例证明可行。", "想复制这个结果。"],
  Solution: ["给出清晰的解法。", "想拿到完整方法。"],
  Payoff: ["兑现承诺，给出最终结论。", "想拥有它。"],
  CTA: ["只给一个明确动作。", "动作成本很低。"],
};
export const newPage = (): Page =>
  mkPage({ role: "Insight", layout: "headline", headline: "新的一页：写下这页唯一要说的一件事。", body: "", label: "NEW PAGE",
    purpose: ROLE_PURPOSE.Insight[0], swipeReason: ROLE_PURPOSE.Insight[1] });

export const presetToDesign = (pr: DesignPreset): GlobalDesign => ({
  ...defaultDesign(), presetId: pr.id, kit: pr.kit ?? "basic", palette: { ...pr.palette }, headlineFont: pr.headlineFont, radius: pr.radius, bgStyle: pr.bgStyle,
  overlay: pr.kit === "moody" ? 55 : pr.kit === "photocover" ? 28 : pr.kit === "frosted" ? 32 : 45, grain: pr.kit === "paper" ? 2 : pr.kit === "collage" ? 12 : 5,
});

export const designFor = (presetId: string): GlobalDesign => {
  const pr = PRESETS.find((x) => x.id === presetId) ?? PRESETS[0];
  return presetToDesign(pr);
};

/* ───────── Paper Editorial 模板示例（结构对照参考帖，文案为原创示例） ───────── */
export const paperDemoPages = (): Page[] => {
  const card = (title: string, body: string, tools: string[], result: Page["result"], hl = ""): Page =>
    mkPage({
      role: "Solution", layout: "prompt-card", headline: title, body, steps: tools, highlight: hl, result,
      purpose: "把方法变成一个真实的输入，读者能直接照做。", swipeReason: "想看下一个用法。", label: "",
      type: defaultType("prompt-card"), image: defaultImage("none"),
    });
  return [
    mkPage({
      role: "Hook", layout: "stagger", headline: "一个小时\n排好\n一整周\n的内容\n再也不\n卡壳", highlight: "内容",
      chips: ["今天该发什么？", "哪些内容值得复用？", "标题怎么写才有人点？", "这周还缺哪一类？", "客户在问什么？"],
      purpose: "用错落大字和问题气泡抓住眼球，同时提出读者关心的问题。", swipeReason: "想知道一小时是怎么做到的。", label: "",
      type: defaultType("stagger"), image: defaultImage("none"),
    }),
    card("把灵感变成\n可用的选题", "这是我这周收藏的 12 条参考和几张截图。**帮我按主题分组，标出可以改写的角度**，每个角度给一个开头句。**先不要发布，等我确认。**", ["Notion", "Excel", "相册"], { kind: "doc", title: "本周选题\n整理清单", sub: "12 条参考 · 4 个主题" }),
    card("让标题不再\n卡在第一句", "这是我想发的主题和目标读者。**给我 10 个 Hook，每个用不同角度**，并说明为什么能让人停下来。**选出你最推荐的 3 个。**", ["Canva", "Gmail", "Docs"], { kind: "email", title: "Re: 本周内容\n选题确认", sub: "收件人：团队" }),
    card("一次排好\n8 页结构", "用我选的 Hook，**排成 8 页 Carousel**：封面、痛点、转折、框架、例子、结论、CTA。**每页只保留一个重点。**", ["Figma", "Canva"], { kind: "sheet", title: "内容排期表.xlsx", sub: "已同步 · 今天 9:14" }),
    card("把风格\n统一起来", "把这套内容做成同一个视觉风格：**暖白底、衬线标题、赭红强调色**。**每页留白多一点，别塞满。**", ["Figma", "Canva", "Drive"], { kind: "doc", title: "品牌\n视觉规范", sub: "v1.2 · 已确认" }),
    mkPage({
      role: "CTA", layout: "closing", headline: "开始做\n你自己的\n内容", body: "", highlight: "",
      purpose: "放慢节奏，留一个安静的收尾。", swipeReason: "已经看完，行动成本很低。", label: "",
      type: defaultType("closing"), image: defaultImage("none"),
    }),
  ];
};

/** 兼容旧版本保存的页面数据：补上后来新增的字段 */
export const normalizePage = (p: Page): Page => ({
  ...p,
  chips: p.chips ?? [], steps: p.steps ?? [], elements: p.elements ?? [],
  result: p.result ?? { kind: "none", title: "", sub: "" },
});

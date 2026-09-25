import type { Tone } from "./types";

export type KitId = "basic" | "paper" | "moody" | "collage" | "photocover" | "frosted" | "pixel";

export interface Kit {
  id: KitId;
  /** 需要用户上传照片做背景 */
  usesPhoto: boolean;
  /** 页面骨架样式 */
  frame: "basic" | "paper" | "moody" | "collage" | "photo" | "frost" | "pixel";
  /** 关键词高亮样式 */
  hl: "color" | "italic" | "marker" | "gold" | "bold";
  /** 封面标题用撕纸条 */
  strip: boolean;
  /** 标题下方加细金线 */
  rule: boolean;
  /** 角落手绘曲线 */
  squiggle: boolean;
  /** 底部滑动提示文字 */
  cue: string;
  /** 自动分配底色：封面 / 内页 / CTA（仅当页面 tone 为 base 时生效） */
  tones: { hook: Tone; inner: Tone; cta: Tone } | null;
  headFont: "sans" | "serif";
  /** 封面文字位置 */
  hero: "default" | "bottom" | "center";
  /** 文字放进卡片：毛玻璃 / 奶油铭牌 */
  card: null | "frost" | "plaque";
  /** 封面是否也用卡片 */
  cardCover: boolean;
  /** 文字阴影（压在照片上时保证可读） */
  shadow: boolean;
  /** 星星贴纸 */
  stars: boolean;
  /** 像素游戏装饰 */
  pixel: boolean;
  /** CTA 用白色药丸按钮 */
  pill: boolean;
}

const B: Kit = {
  id: "basic", usesPhoto: false, frame: "basic", hl: "color", strip: false, rule: false, squiggle: false, cue: "SWIPE  →", tones: null, headFont: "sans",
  hero: "default", card: null, cardCover: false, shadow: false, stars: false, pixel: false, pill: false,
};

export const KITS: Record<KitId, Kit> = {
  basic: B,
  paper: { ...B, id: "paper", frame: "paper", hl: "bold", squiggle: false, cue: "往左滑  →", tones: null, headFont: "serif" },
  moody: { ...B, id: "moody", usesPhoto: true, frame: "moody", hl: "gold", rule: true, cue: "往左滑  →", headFont: "serif" },
  collage: { ...B, id: "collage", frame: "collage", hl: "marker", strip: true, tones: { hook: "base", inner: "alt", cta: "accent" }, headFont: "serif" },
  photocover: { ...B, id: "photocover", usesPhoto: true, frame: "photo", hl: "italic", cue: "", headFont: "sans", hero: "bottom", shadow: true, pill: true },
  frosted: { ...B, id: "frosted", usesPhoto: true, frame: "frost", hl: "gold", cue: "", headFont: "sans", hero: "center", card: "frost", shadow: true, stars: true },
  pixel: { ...B, id: "pixel", frame: "pixel", hl: "marker", cue: "→", headFont: "serif", hero: "bottom", card: "plaque", cardCover: true, pixel: true },
};

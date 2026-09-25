export type Role =
  | "Hook" | "Re-hook" | "Problem" | "Story" | "Reframe" | "Insight" | "Framework"
  | "Explanation" | "Example" | "Proof" | "Data" | "Case Study" | "Solution" | "Payoff" | "CTA";

export type LayoutId =
  | "headline" | "headline-image" | "split" | "big-number" | "full-image"
  | "screenshot" | "quote" | "framework" | "comparison" | "minimal"
  | "stagger" | "prompt-card" | "closing";

export type VisualType =
  | "Typography" | "Photo" | "Screenshot" | "Big Number" | "Diagram" | "Quote"
  | "Split Layout" | "Full Image" | "Minimal" | "Data" | "Framework";

export type Tone = "base" | "alt" | "accent";
export type BgStyle = "solid" | "dark" | "light" | "gradient" | "image" | "screenshot" | "texture" | "grid" | "noise";
export type ImageMode = "none" | "placeholder" | "screenshot" | "upload";
export type ElementType = "line" | "arrow" | "rectangle" | "circle" | "highlight" | "number" | "icon" | "grid";
export type CtaType = "Comment" | "Save" | "Share" | "DM" | "Follow" | "Click Link";

export interface ImageCfg {
  mode: ImageMode;
  url?: string;
  fileName?: string;
  fit: "cover" | "contain";
  opacity: number; // 0-100
  radius: number;
  overlay: number; // 0-80
  blur: number; // 0-40
}

export interface TypeCfg {
  font: "sans" | "serif";
  size: number;
  weight: number;
  lineHeight: number;
  tracking: number; // em * 100
  align: "left" | "center" | "right";
  valign: "top" | "middle" | "bottom";
  width: number; // % of safe width
  x: number;
  y: number;
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Page {
  id: string;
  role: Role;
  headline: string;
  body: string;
  purpose: string;
  swipeReason: string;
  label: string;
  layout: LayoutId;
  tone: Tone;
  highlight: string;
  stat: { value: string; unit: string };
  steps: string[];
  chips: string[];
  result: { kind: "none" | "doc" | "email" | "sheet"; title: string; sub: string };
  image: ImageCfg;
  type: TypeCfg;
  bgStyle: BgStyle | null;
  bgColor: string | null;
  elements: CanvasElement[];
  ctaType: CtaType;
}

export interface Palette {
  bg: string; text: string; muted: string; accent: string; border: string; altBg: string; altText: string;
}

import type { KitId } from "./kits";

/** Paper Editorial 模板的微调项 */
export interface Tweaks {
  chrome: boolean;        // 显示标签 / 页码 / 署名 / 滑动提示
  hl: "bold" | "italic" | "color";
  squiggle: boolean;      // 赭红曲线
  squiggleWidth: number;
  chips: boolean;         // 封面悬浮气泡
  cardRadius: number;     // 提示卡片圆角
  cardShadow: number;     // 卡片阴影强度
  sendButton: boolean;    // 卡片右下角发送按钮
  titleScale: number;     // 标题大小系数
  titleWeight: number;    // 标题字重
}

export interface GlobalDesign {
  tweaks: Tweaks;
  presetId: string;
  kit: KitId;
  photo: { url: string; name: string } | null;
  signature: string;
  styles: string[];
  visuals: string[];
  palette: Palette;
  headlineFont: "sans" | "serif";
  bodyFontName: string;
  headlineWeight: number;
  bodyWeight: number;
  radius: number;
  grid: { margin: number; cols: number; gap: number; safe: number };
  bgStyle: BgStyle;
  gradient: { a: string; b: string; dir: number; intensity: number };
  overlay: number;
  blur: number;
  grain: number;
}

export interface DesignPreset {
  id: string;
  kit?: KitId;
  name: string;
  desc: string;
  headlineFont: "sans" | "serif";
  radius: number;
  bgStyle: BgStyle;
  palette: Palette;
  visual: string;
  typography: string;
}

export interface BrandPreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  font: string;
  imageStyle: string;
  designStyle: string;
}

export interface AnalysisItem { id: string; no: string; label: string; value: string; alts: string[]; altIdx: number; wide?: boolean }
export type Strength = "Strong" | "Medium" | "Experimental";
export interface Hook { id: string; no: string; framework: string; copy: string; why: string; psychology: string; strength: Strength; variants: string[]; vIdx: number }

export type ProjectStatus = "Draft" | "等待内容确认" | "等待设计" | "已完成";
export interface Project { id: string; title: string; client: string; format: string; status: ProjectStatus; edited: string; presetId: string }

export interface InputState {
  type: "topic" | "link" | "transcript" | "existing" | "screenshot";
  text: string;
  client: string;
  goal: string;
  platform: string;
  audience: string;
  cta: string;
  fileName: string;
}

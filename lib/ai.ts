import { supabase } from "./supabase";
import { candidatesFor } from "./engine";
import { defaultImage, defaultType, mkPage, ROLE_PURPOSE } from "./mock";
import type { AnalysisItem, Hook, InputState, LayoutId, Page, Role } from "./types";
import { ROLES } from "./mock";

export class AiError extends Error { constructor(public code: string, msg?: string) { super(msg ?? code); } }

export async function ai<T>(task: string, payload: Record<string, unknown>): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ task, ...payload }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new AiError(j.error ?? "FAILED", j.detail);
  return j.result as T;
}

export const briefOf = (i: InputState, placeholder: string) => ({
  text: i.type === "screenshot" ? `（截图：${i.fileName || "未命名"}）` : i.text.trim() || placeholder,
  client: i.client, goal: i.goal, platform: i.platform, audience: i.audience, cta: i.cta,
});

const s = (v: unknown, d = "") => (typeof v === "string" ? v : d);

export function mapAnalysis(items: unknown, base: AnalysisItem[]): AnalysisItem[] {
  const arr = Array.isArray(items) ? items : [];
  return base.map((b, i) => ({ ...b, value: s(arr[i], b.value), alts: [], altIdx: 0 }));
}

export function mapHooks(raw: unknown, base: Hook[]): Hook[] {
  const arr = Array.isArray(raw) ? raw : [];
  return base.map((b, i) => {
    const h = (arr[i] ?? {}) as Record<string, unknown>;
    const st = h.strength === "Strong" || h.strength === "Medium" || h.strength === "Experimental" ? h.strength : b.strength;
    return { ...b, framework: s(h.framework, b.framework), copy: s(h.copy, b.copy), why: s(h.why, b.why), psychology: s(h.psychology, b.psychology), strength: st, variants: [] };
  });
}

export function mapPages(raw: unknown): Page[] {
  const arr = (Array.isArray(raw) ? raw : []).slice(0, 12) as Record<string, unknown>[];
  const out: Page[] = [];
  arr.forEach((r, i) => {
    const role = (ROLES.includes(r.role as Role) ? r.role : "Insight") as Role;
    const stat = r.stat as { value?: string; unit?: string } | undefined;
    const steps = Array.isArray(r.steps) ? (r.steps as unknown[]).map(String).filter(Boolean) : [];
    const prev = out[i - 1]?.layout;
    let layout: LayoutId;
    if (role === "CTA") layout = "headline";
    else if (stat?.value) layout = "big-number";
    else if (steps.length >= 3) layout = "framework";
    else {
      const c = candidatesFor(role);
      layout = c.find((l) => l !== prev) ?? c[0];
    }
    const purpose = s(r.purpose, ROLE_PURPOSE[role]?.[0] ?? "");
    const p = mkPage({
      role, layout, headline: s(r.headline, "（待补标题）"), body: s(r.body), highlight: s(r.highlight),
      purpose, swipeReason: s(r.swipeReason, ROLE_PURPOSE[role]?.[1] ?? ""), label: s(r.label, `PAGE ${String(i + 1).padStart(2, "0")}`).toUpperCase(),
      tone: role === "CTA" ? "accent" : layout === "minimal" ? "alt" : "base",
      type: defaultType(layout),
      image: defaultImage(layout === "headline-image" || layout === "screenshot" ? "screenshot" : "placeholder"),
    });
    if (stat?.value) p.stat = { value: String(stat.value), unit: String(stat.unit ?? "") };
    if (steps.length) p.steps = steps;
    out.push(p);
  });
  return out.length >= 2 ? out : [];
}

export interface SrcImage { mime: string; data: string; name: string; preview: string }

/** 读取图片并缩小到最长边 1280px，转成 JPEG base64，避免请求过大 */
export async function fileToImage(file: File): Promise<SrcImage> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image(); img.src = url; await img.decode();
    const k = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    const dataUrl = c.toDataURL("image/jpeg", 0.82);
    return { mime: "image/jpeg", data: dataUrl.split(",")[1], name: file.name, preview: dataUrl };
  } finally { URL.revokeObjectURL(url); }
}

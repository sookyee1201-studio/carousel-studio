import { AiError, fileToImage } from "./ai";

export type ImageProvider = "gemini";
export type Aspect = "4:5" | "1:1" | "16:9";

/** 让 AI 生成一张图，返回可以直接放进画面的 data URL */
export async function generateImage(provider: ImageProvider, prompt: string, aspect: Aspect, palette: { bg: string; text: string; accent: string }) {
  const res = await fetch("/api/image", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider, prompt, aspect, palette }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new AiError(j.error ?? "FAILED", j.detail);
  const r = j.result as { kind: "raster"; mime: string; data: string };
  // 位图缩小后再保存，避免项目数据过大
  const blob = await (await fetch(`data:${r.mime};base64,${r.data}`)).blob();
  const im = await fileToImage(new File([blob], "gemini.png", { type: r.mime }));
  return { url: im.preview, name: "Gemini 生成图" };
}

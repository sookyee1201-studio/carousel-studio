"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { AiError } from "@/lib/ai";
import { generateImage, type Aspect } from "@/lib/imageGen";
import { useStudio } from "@/lib/store";

const ASPECTS: { v: Aspect; label: string }[] = [{ v: "4:5", label: "竖图" }, { v: "1:1", label: "方图" }, { v: "16:9", label: "横图" }];

/** 画面类型：全部偏向真实、不要卡通插画 */
const STYLES = [
  { v: "photo", label: "真实照片", hint: "自然光、生活感的摄影照片", suffix: "Photorealistic photograph, natural light, candid editorial style, shallow depth of field. No illustration, no cartoon, no text, no watermark." },
  { v: "ui", label: "产品 / 界面", hint: "像真的软件或网页界面截图", suffix: "Realistic software or website interface screenshot mockup, clean modern UI, believable content. No cartoon, no illustration, no watermark." },
  { v: "texture", label: "质感背景", hint: "纸张、渐变、暗纹这类安静背景", suffix: "Abstract subtle background texture (paper, soft gradient or grain), plenty of empty space for text. No objects, no text, no illustration." },
] as const;

/** 用 Gemini 生成图片，生成后交给 onDone 放进画面 */
export default function AiImageGen({ defaultPrompt, defaultAspect = "4:5", onDone }: { defaultPrompt: string; defaultAspect?: Aspect; onDone: (url: string, name: string) => void }) {
  const { design, notify } = useStudio();
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [aspect, setAspect] = useState<Aspect>(defaultAspect);
  const [style, setStyle] = useState<(typeof STYLES)[number]["v"]>("photo");
  const [busy, setBusy] = useState(false);
  const cur = STYLES.find((s) => s.v === style)!;

  const run = async () => {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    try {
      const r = await generateImage("gemini", `${prompt.trim()}. ${cur.suffix}`, aspect, { bg: design.palette.bg, text: design.palette.text, accent: design.palette.accent });
      onDone(r.url, r.name); notify("Gemini 已生成，已放进这一页。不满意可以撤销。");
    } catch (e) {
      const c = e instanceof AiError ? e.code : "";
      notify(c === "NO_KEY" ? "还没有设置 GEMINI_API_KEY。" : c === "UNAUTHORIZED" ? "登录已过期，请重新登录。" : c === "RATE_LIMIT" ? "生成次数暂时用完了。" : "生成失败，请换个描述再试一次。");
    }
    setBusy(false);
  };

  return (
    <div className="space-y-3 border border-line bg-card p-4">
      <div className="flex items-center gap-1.5 text-[14.5px] text-accent-ink"><Sparkles size={14} />用 AI 生成图片</div>
      <div className="flex flex-wrap gap-2">
        {STYLES.map((s) => (
          <button key={s.v} type="button" onClick={() => setStyle(s.v)} aria-pressed={s.v === style}
            className={`t h-9 rounded-full border px-4 text-[14px] ${s.v === style ? "border-fg bg-fg text-bg" : "border-line text-mute hover:border-fg/40 hover:text-fg"}`}>{s.label}</button>
        ))}
      </div>
      <p className="text-[13px] text-dim">{cur.hint}。不会生成卡通或插画。</p>
      <textarea className="field" rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="描述你想要的画面，例如：一位老板在咖啡店用笔记本工作，早晨的窗边光线" />
      <div className="flex flex-wrap items-center gap-2">
        {ASPECTS.map((a) => (
          <button key={a.v} type="button" onClick={() => setAspect(a.v)} aria-pressed={a.v === aspect}
            className={`t h-9 rounded-full border px-4 text-[14px] ${a.v === aspect ? "border-fg bg-fg text-bg" : "border-line text-mute hover:border-fg/40 hover:text-fg"}`}>{a.label}</button>
        ))}
        <Button variant="primary" className="ml-auto" disabled={busy || !prompt.trim()} onClick={run}>{busy ? "生成中…" : "Gemini 生成图片"}</Button>
      </div>
      <p className="text-[12.5px] text-dim">约 10–20 秒，每张约 $0.05。点了才会生成。</p>
    </div>
  );
}

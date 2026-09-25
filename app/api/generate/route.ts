import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { limited } from "@/lib/rateLimit";

export const maxDuration = 60;

const LABELS = ["核心主题", "目标受众", "用户现在的问题", "大众共鸣点", "为什么会共鸣", "核心矛盾", "Existing Belief", "New Belief", "Key Insight", "Content Promise", "Emotional Trigger", "Share Trigger", "Save Trigger", "Comment Trigger"];
const FRAMEWORKS = ["Contrarian", "Hidden Problem", "Sharp Reframe", "Counterintuitive", "Myth Bust", "Diagnostic", "Curiosity", "Missing Piece", "Outcome Without Sacrifice", "High-Stakes Warning"];
const ROLES = "Hook, Re-hook, Problem, Story, Reframe, Insight, Framework, Explanation, Example, Proof, Data, Case Study, Solution, Payoff, CTA";

interface Ctx { text: string; client: string; goal: string; platform: string; audience: string; cta: string }
const brief = (c: Ctx) =>
  `主题/素材：${c.text}\n品牌客户：${c.client}\n内容目标：${c.goal}\n平台：${c.platform}\n目标受众：${c.audience || "（未填，请根据主题合理推断）"}\nCTA 目标：${c.cta}`;

const SYS = `你是资深的社交媒体 Content Strategist 兼 Creative Director，擅长为各类品牌和个人做 Instagram / Facebook / 小红书 Carousel。用简体中文输出，允许保留 Hook、Re-hook、CTA、Framework、Insight 等行业英文词。文案要口语、有观点、短句，避免空话与套话，不要虚构数据或案例。只输出 JSON，不要任何解释文字。`;

const PAGE_SPEC = `每页字段：role, headline（可含 \\n，≤30字）, body（可空，可含 \\n）, purpose（这页的作用）, swipeReason（读者为什么会滑到下一页）, highlight（headline 或 body 中需要用强调色突出的一个原文关键词，必须是原文的连续片段，可空）, label（大写英文小标签，如 "CONTENT SYSTEM / 01"）。如果某页的主视觉是一个数字，加 stat:{"value":"40","unit":"MIN"}；如果是流程/步骤，加 steps:["...","..."]（3–6 步，短词）。`;
const IMG_NOTE = "用户还提供了一张图片（可能是截图、海报或文章）。请先读取图片里的文字和信息，把它当作内容素材。";

function prompt(task: string, b: Record<string, unknown>): string | null {
  const c = b.input as Ctx;
  switch (task) {
    case "analysis":
      return `${SYS}\n\n${brief(c)}\n${b.hasImage ? IMG_NOTE : ""}\n\n请拆解这篇 Carousel 的 Content Strategy，按以下 14 项依次给出内容（每项 1–2 句，具体、不空泛）：${LABELS.join("、")}。\n输出格式：{"items":["...共14个字符串，顺序与上面一致"]}`;
    case "hooks":
      return `${SYS}\n\n${brief(c)}\n\n已有的内容分析：\n${JSON.stringify(b.analysis)}\n\n请写 10 个 Carousel 第一页的 Hook，依次使用这些 Framework：${FRAMEWORKS.join("、")}。Hook 文案不超过 26 个字，可用 \\n 分成两行。\n输出格式：{"hooks":[{"framework":"","copy":"","why":"为什么有效（一句）","psychology":"针对的心理（2–3 个词，用 · 分隔）","strength":"Strong|Medium|Experimental"}]}。不要虚假打分，strength 只能是这三个值之一。`;
    case "structure":
      return `${SYS}\n\n${brief(c)}\n\n内容分析：${JSON.stringify(b.analysis)}\n选定的 Hook（第一页标题）：${b.hook}\n${b.hasImage ? IMG_NOTE : ""}\n\n请写 8 页 Carousel 的内容结构，默认角色顺序：Hook, Re-hook, Problem, Reframe, Framework(或 Insight), Explanation(或 Solution), Payoff(或 Proof), CTA。可按内容调整，可用角色：${ROLES}。第 1 页 headline 必须使用上面选定的 Hook。每页只讲一个主要信息，第 2 页不得重复第 1 页并要增加新信息，最后一页是 CTA，CTA 必须与「CTA 目标」一致。\n每页字段：role, headline（可含 \\n，≤30字）, body（可空，可含 \\n）, purpose（这页的作用）, swipeReason（读者为什么会滑到下一页）, highlight（headline 或 body 中需要用强调色突出的一个原文关键词，必须是原文的连续片段，可空）, label（大写英文小标签，如 "CONTENT SYSTEM / 01"）。如果某页的主视觉是一个数字，加 stat:{"value":"40","unit":"MIN"}；如果是流程/步骤，加 steps:["...","..."]（3–6 步，短词）。\n输出格式：{"pages":[...8个对象]}`;
    case "quick":
      if (b.style === "paper") {
        return `${SYS}\n\n${brief(c)}\n${b.hasImage ? IMG_NOTE : ""}\n\n请为这个主题写一套 Carousel，共 7 页，按下面的版式结构，每页只讲一个主要信息：\n\n【第 1 页 · 封面 · role: Hook】headline 由 5–7 行极短的词组组成（每行 2–4 个汉字（绝对不要超过 5 个），或 1–2 个英文词），用 \\n 分行，连起来读是一句有观点、让人想点进来的话；highlight 选其中最关键的一个词（必须是原文的连续片段）；chips 写 4–5 个目标读者会问的短问题（每个 ≤12 字）。body 留空。\n\n【第 2–6 页 · 内容页 · role: Solution/Framework/Insight/Example 任选】headline 是 2 行（用 \\n 分行，每行 ≤8 个汉字）的小标题；body 写成「用户对 AI 说的一段具体请求」：第一人称、有具体场景和数字、3–5 句话，并用 **双星号** 包住其中 2–3 个关键短语；tools 写 2–3 个与这页相关、真实存在的常见工具或平台名（如 Canva、Excel、Notion、Gmail、Google Sheets、Figma、Shopify、Instagram、WhatsApp）；result 描述「做出来的成果」：{"kind":"doc|email|sheet 三选一","title":"≤12字，可含 \\n","sub":"≤14字的小字说明"}。\n\n【第 7 页 · 收尾 · role: CTA】headline 用 2–3 行（\\n 分行）的收尾语，且与「CTA 目标」一致；body 可写一句行动指引，也可留空。\n\n所有页面都要有 purpose（这页的作用）和 swipeReason（读者为什么会滑到下一页）。不要虚构数据或案例，文案口语、具体、避免空话。\n另外给出 title：这套 Carousel 的简短标题（≤20字）。\n输出格式：{"title":"","pages":[{"role":"","headline":"","body":"","highlight":"","chips":[],"tools":[],"result":{"kind":"","title":"","sub":""},"purpose":"","swipeReason":""}]}`;
      }
      return `${SYS}\n\n${brief(c)}\n${b.hasImage ? IMG_NOTE : ""}\n\n请直接为这个主题写一套 8 页 Carousel（跳过冗长分析）。第 1 页 headline 必须是一个有观点、能让人停下来的 Hook；第 2 页不得重复第 1 页并要增加新信息；每页只讲一个主要信息，内容要有逻辑推进（例如 Hook → Re-hook → Problem → Reframe → Framework/Insight → Explanation/Solution → Payoff/Proof → CTA），最后一页是 CTA，且与「CTA 目标」一致。可用角色：${ROLES}。\n${PAGE_SPEC}\n另外给出 title：这套 Carousel 的简短标题（≤20字）。\n输出格式：{"title":"","pages":[...8个对象]}`;
    case "rewrite":
      return `${SYS}\n\n${brief(c)}\n\n整套 Carousel 各页标题（供你把握上下文）：${JSON.stringify(b.context)}\n\n现在只改第 ${b.index} 页（角色：${b.role}）。当前 headline：「${b.headline}」；当前 body：「${b.body}」。\n用户的修改要求：${b.instruction}\n请按要求重写这一页，保持与前后页的逻辑衔接，只改文案。headline 可含 \\n（≤30字）。highlight 必须是新文案中的连续原文片段，可空。\n输出格式：{"headline":"","body":"","highlight":""}`;
    case "regen_analysis":
      return `${SYS}\n\n${brief(c)}\n\n请重写内容分析中的「${b.label}」，当前内容是：「${b.current}」。给出一个角度不同但同样具体的版本（1–2 句）。\n输出格式：{"value":"..."}`;
    case "regen_hook":
      return `${SYS}\n\n${brief(c)}\n\n请用「${b.framework}」这个 Framework，为下面这个 Hook 写一个相似但不同的新版本（≤26 字，可用 \\n 分两行）：「${b.copy}」\n输出格式：{"copy":"..."}`;
  }
  return null;
}

export async function POST(req: Request) {
  // 登录用户每小时 120 次，未登录按 IP 每小时 15 次，避免 API 额度被滥用
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  let who = "ip:" + (req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local");
  let max = 15;
  if (token && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    const { data } = await sb.auth.getUser(token);
    if (data.user) { who = "user:" + data.user.id; max = 120; }
  }
  if (limited(who, max)) return NextResponse.json({ error: "RATE_LIMIT" }, { status: 429 });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "NO_KEY" }, { status: 503 });

  const body = await req.json().catch(() => null);
  const p = body && typeof body.task === "string" ? prompt(body.task, { ...body, hasImage: !!body.image?.data }) : null;
  if (!p) return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });

  const img = body.image as { mime?: string; data?: string } | null | undefined;
  const parts: Record<string, unknown>[] = [{ text: p }];
  if (img?.data && img.mime && img.data.length < 4_000_000) parts.push({ inline_data: { mime_type: img.mime, data: img.data } });

  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  try {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { responseMimeType: "application/json", temperature: 0.9 } }),
    });
    if (!r.ok) return NextResponse.json({ error: "UPSTREAM", status: r.status, detail: (await r.text()).slice(0, 300) }, { status: 502 });
    const j = await r.json();
    const outParts: { text?: string; thought?: boolean }[] = j?.candidates?.[0]?.content?.parts ?? [];
    const text = outParts.filter((x) => x.text && !x.thought).map((x) => x.text).join("") || undefined;
    if (!text) return NextResponse.json({ error: "EMPTY" }, { status: 502 });
    return NextResponse.json({ result: JSON.parse(text) });
  } catch (e) {
    return NextResponse.json({ error: "FAILED", detail: String(e).slice(0, 200) }, { status: 500 });
  }
}

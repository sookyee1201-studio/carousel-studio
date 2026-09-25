import { NextResponse } from "next/server";
import { authConfigured, readSession } from "@/lib/auth";
import { limited } from "@/lib/rateLimit";

export const maxDuration = 60;

const ASPECTS = ["4:5", "1:1", "16:9", "3:4"];

export async function POST(req: Request) {
  // 配置了登录就必须先登录（保护你的 API 额度）；没配置（本地开发）时按 IP 限流
  let who = "img-ip:" + (req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local");
  let max = 6;
  if (authConfigured()) {
    const email = readSession(req);
    if (!email) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    who = "img-user:" + email; max = 40;
  }
  if (limited(who, max)) return NextResponse.json({ error: "RATE_LIMIT" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim().slice(0, 800) : "";
  const aspect = ASPECTS.includes(body?.aspect) ? body.aspect : "4:5";
  const provider = body?.provider;
  if (!prompt || provider !== "gemini") return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });

  try {
    if (provider === "gemini") {
      const key = process.env.GEMINI_API_KEY;
      if (!key) return NextResponse.json({ error: "NO_KEY" }, { status: 503 });
      const model = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
      const call = (cfg: Record<string, unknown>) =>
        fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
          method: "POST", headers: { "content-type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: cfg }),
        });
      let r = await call({ responseModalities: ["IMAGE"], imageConfig: { aspectRatio: aspect } });
      if (!r.ok && r.status === 400) r = await call({ responseModalities: ["IMAGE"] });
      if (!r.ok) return NextResponse.json({ error: "UPSTREAM", status: r.status, detail: (await r.text()).slice(0, 300) }, { status: 502 });
      const j = await r.json();
      const parts: { inlineData?: { mimeType: string; data: string }; inline_data?: { mime_type: string; data: string } }[] = j?.candidates?.[0]?.content?.parts ?? [];
      const p = parts.find((x) => x.inlineData || x.inline_data);
      const d = p?.inlineData ? { mime: p.inlineData.mimeType, data: p.inlineData.data } : p?.inline_data ? { mime: p.inline_data.mime_type, data: p.inline_data.data } : null;
      if (!d) return NextResponse.json({ error: "EMPTY" }, { status: 502 });
      return NextResponse.json({ result: { kind: "raster", mime: d.mime, data: d.data } });
    }

  } catch (e) {
    return NextResponse.json({ error: "FAILED", detail: String(e).slice(0, 200) }, { status: 500 });
  }
}

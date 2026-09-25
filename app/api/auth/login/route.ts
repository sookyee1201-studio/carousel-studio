import { NextResponse } from "next/server";
import { authConfigured, cookieHeader, makeToken, verifyLogin } from "@/lib/auth";
import { limited } from "@/lib/rateLimit";

export async function POST(req: Request) {
  if (!authConfigured()) return NextResponse.json({ error: "NOT_CONFIGURED" }, { status: 503 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "local";
  if (limited("login:" + ip, 10)) return NextResponse.json({ error: "TOO_MANY" }, { status: 429 });
  const body = await req.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!verifyLogin(email, password)) return NextResponse.json({ error: "INVALID" }, { status: 401 });
  const res = NextResponse.json({ email: email.trim().toLowerCase() });
  res.headers.set("set-cookie", cookieHeader(makeToken(email.trim().toLowerCase())));
  return res;
}

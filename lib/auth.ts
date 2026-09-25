import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

/** 服务器端的简单登录：一个账号，密码只存哈希；登录后发带签名的 cookie */
export const COOKIE = "cs_session";
const DAYS = 7;

export const authConfigured = () => !!(process.env.APP_SESSION_SECRET && process.env.APP_LOGIN_HASH && process.env.APP_LOGIN_EMAIL);

const eq = (a: Buffer, b: Buffer) => a.length === b.length && timingSafeEqual(a, b);

/** APP_LOGIN_HASH 格式：scrypt:<salt>:<hash>（hex）。不用 $ 是因为 .env 文件会把 $ 当成变量替换 */
export function verifyLogin(email: string, password: string): boolean {
  const okEmail = eq(Buffer.from(email.trim().toLowerCase()), Buffer.from((process.env.APP_LOGIN_EMAIL ?? "").trim().toLowerCase()));
  const [alg, salt, hash] = (process.env.APP_LOGIN_HASH ?? "").split(":");
  if (alg !== "scrypt" || !salt || !hash) return false;
  const got = scryptSync(password, salt, 32);
  return eq(got, Buffer.from(hash, "hex")) && okEmail;
}

const sign = (payload: string) => createHmac("sha256", process.env.APP_SESSION_SECRET ?? "").update(payload).digest("base64url");

export function makeToken(email: string): string {
  const payload = Buffer.from(JSON.stringify({ e: email, x: Date.now() + DAYS * 86400_000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

/** 从请求里读出已登录的邮箱；未登录或已过期返回 null */
export function readSession(req: Request): string | null {
  if (!authConfigured()) return null;
  const raw = req.headers.get("cookie")?.split(";").map((c) => c.trim()).find((c) => c.startsWith(COOKIE + "="))?.slice(COOKIE.length + 1);
  if (!raw) return null;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig || !eq(Buffer.from(sig), Buffer.from(sign(payload)))) return null;
  try {
    const d = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof d.e === "string" && d.x > Date.now() ? d.e : null;
  } catch { return null; }
}

export const cookieHeader = (token: string | null) =>
  `${COOKIE}=${token ?? ""}; Path=/; HttpOnly; SameSite=Lax; ${process.env.NODE_ENV === "production" ? "Secure; " : ""}Max-Age=${token ? DAYS * 86400 : 0}`;

"use client";
import { useState } from "react";
import { Button, Field } from "@/components/ui";
import { useStudio } from "@/lib/store";
import { supabaseConfigured } from "@/lib/supabase";

export default function Login() {
  const { signIn, signUp, setView } = useStudio();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null);
    const err = await (mode === "in" ? signIn(email.trim(), pw) : signUp(email.trim(), pw));
    setMsg(err); setBusy(false);
  };

  return (
    <div className="grid min-h-screen grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col justify-between bg-[#1f1b16] p-14 text-[#f6f1e8]">
        <div className="font-serif text-[27px] leading-none">Carousel<span className="italic text-[#e0876a]"> Studio</span></div>
        <div>
          <h1 className="max-w-[520px] text-[54px] font-semibold leading-[1.12] tracking-[-0.025em]">先想清楚内容，<br />再决定它<span className="italic text-[#e0876a]">长什么样</span>。</h1>
          <p className="mt-6 max-w-[440px] text-[17px] text-[#b3a996]">从一个想法开始，走完内容策略、Hook、8 页结构和视觉方向，最后导出一套可以直接发布的 Carousel。</p>
        </div>
        <div className="label !text-[#7d7463]">内容 → 设计 → 成品</div>
      </div>
      <div className="flex items-center justify-center px-14">
        <form onSubmit={submit} className="w-full max-w-[380px] space-y-6">
          <div>
            <h2 className="text-[28px] font-semibold tracking-[-0.015em]">{mode === "in" ? "登录" : "创建账号"}</h2>
            <p className="mt-2 text-[15px] text-mute">{mode === "in" ? "请先登录再使用。项目会自动保存到你的账号，换设备也能继续。" : "创建账号，跨设备保存你的项目。"}</p>
          </div>
          <Field label="邮箱"><input className="field" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="密码" hint={mode === "up" ? "至少 6 位" : undefined}><input className="field" type="password" required minLength={6} autoComplete={mode === "in" ? "current-password" : "new-password"} value={pw} onChange={(e) => setPw(e.target.value)} /></Field>
          {msg && <p role="alert" className="text-[14px] text-danger">{msg}</p>}
          <Button variant="primary" size="lg" className="w-full" disabled={busy} type="submit">{busy ? "请稍候…" : mode === "in" ? "登录" : "注册"}</Button>
          <button type="button" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(null); }} className="t text-[14px] text-mute underline underline-offset-4 hover:text-fg">
            {mode === "in" ? "还没有账号？创建账号" : "已有账号？去登录"}
          </button>
          <div className="border-t border-line2 pt-5"><button type="button" onClick={() => setView("dashboard")} className="t text-[14px] text-mute hover:text-fg">← 先不登录，直接试用</button></div>
        </form>
      </div>
    </div>
  );
}

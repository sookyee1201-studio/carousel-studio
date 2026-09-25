"use client";
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ai, AiError, briefOf, mapAnalysis, mapHooks, mapPages, mapPaperPages, type SrcImage } from "./ai";
import { applyLayout, candidatesFor } from "./engine";
import { supabase } from "./supabase";
import {
  normalizePage, paperDemoPages, BRANDS, defaultDesign, defaultInput, demoAnalysis, demoHooks, demoPages, INPUT_PLACEHOLDER, newPage, PRESETS, presetToDesign,
  PROJECTS, ROLE_PURPOSE, STATUS_STEP, uid,
} from "./mock";
import type {
  AnalysisItem, BrandPreset, GlobalDesign, Hook, InputState, LayoutId, Page, Project,
} from "./types";

export type View = "login" | "dashboard" | "projects" | "templates" | "design-system" | "brands" | "wizard";
export type Approval = "draft" | "approved" | "changed";
export interface SavedRow { id: string; title: string; client: string; status: Project["status"]; updated_at: string; pages: Page[] | null; design: GlobalDesign | null }
export type SaveState = "idle" | "saving" | "saved" | "error";

interface Store {
  view: View; setView: (v: View) => void;
  step: number; maxStep: number; goStep: (n: number) => void; advanced: boolean; approveAndGo: (n: number) => void; regenAll: () => Promise<void>;
  project: { title: string; client: string };
  input: InputState; setInput: (p: Partial<InputState>) => void;
  analysis: AnalysisItem[]; editAnalysis: (id: string, v: string) => void; regenAnalysis: (id: string) => void;
  hooks: Hook[]; selectedHookId: string; setSelectedHook: (id: string) => void;
  editHook: (id: string, copy: string) => void; regenHook: (id: string) => void; useHook: () => void;
  pages: Page[]; updatePage: (id: string, patch: Partial<Page>) => void;
  setLayout: (id: string, l: LayoutId) => void;
  reorder: (from: number, to: number) => void; duplicatePage: (id: string) => void;
  deletePage: (id: string) => void; addPage: () => void; setRole: (id: string, role: Page["role"]) => void;
  approval: Approval; approve: () => void;
  design: GlobalDesign; updateDesign: (p: Partial<GlobalDesign>) => void; applyPreset: (id: string) => void;
  applyBrand: (b: BrandPreset) => void;
  selectedPageId: string; selectPage: (id: string) => void;
  toast: { msg: string; key: number } | null; notify: (m: string) => void;
  startNew: (topic?: string, image?: SrcImage | null) => void; startPaperTemplate: () => void;
  quickStart: (topic: string, image?: SrcImage | null) => Promise<void>; quickBusy: boolean;
  srcImage: SrcImage | null; setSrcImage: (i: SrcImage | null) => void;
  rewritePage: (id: string, instruction: string) => Promise<boolean>;
  updateAllTypes: (patch: Partial<Page["type"]>) => void; setProjectTitle: (t: string) => void; setProjectClient: (t: string) => void;
  undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean; openProject: (p: Project) => void;
  regenDesign: (id: string) => void; rerollCounter: number;
  analyzing: boolean; runAnalyze: () => void; generatingHooks: boolean; runHooks: () => void; generatingPages: boolean;
  user: { id: string; email: string } | null; authReady: boolean;
  signIn: (e: string, p: string) => Promise<string | null>; signUp: (e: string, p: string) => Promise<string | null>; signOut: () => void;
  saved: SavedRow[]; openSaved: (r: SavedRow) => void; deleteSaved: (id: string) => Promise<void>;
  saveState: SaveState; savedAt: Date | null;
}

const Ctx = createContext<Store | null>(null);
export const useStudio = () => { const c = useContext(Ctx); if (!c) throw new Error("no provider"); return c; };

const LS = "carousel-studio.projects.v1";
interface LocalRow extends SavedRow { data: Record<string, unknown> }
const readLocal = (): LocalRow[] => { try { return JSON.parse(localStorage.getItem(LS) ?? "[]"); } catch { return []; } };
const writeLocal = (rows: LocalRow[]) => { try { localStorage.setItem(LS, JSON.stringify(rows)); return true; } catch { return false; } };
const isLocal = (id: string | null) => !!id && id.startsWith("local-");
const toSaved = (r: LocalRow): SavedRow => ({ id: r.id, title: r.title, client: r.client, status: r.status, updated_at: r.updated_at, pages: (r.data.pages as Page[]) ?? null, design: (r.data.design as GlobalDesign) ?? null });

const sigOf = (pages: Page[]) => pages.map((p) => [p.id, p.role, p.headline, p.body].join("¦")).join("§");

export function StudioProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("dashboard");
  const [step, setStep] = useState(1);
  const [maxStep, setMax] = useState(1);
  const [project, setProject] = useState({ title: "未命名 Carousel", client: "" });
  const [input, setInputS] = useState<InputState>(defaultInput);
  const [analysis, setAnalysis] = useState<AnalysisItem[]>(demoAnalysis);
  const [hooks, setHooks] = useState<Hook[]>(demoHooks);
  const [selectedHookId, setSelectedHook] = useState("h01");
  const [pages, setPages] = useState<Page[]>(demoPages);
  const [approvedSig, setApprovedSig] = useState<string | null>(null);
  const [design, setDesign] = useState<GlobalDesign>(defaultDesign);
  const [selectedPageId, selectPage] = useState<string>("");
  const [toast, setToast] = useState<Store["toast"]>(null);
  const [rerollCounter, setReroll] = useState(0);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingHooks, setGenHooks] = useState(false);
  const timers = useRef<number[]>([]);
  const [generatingPages, setGenPages] = useState(false);
  const [user, setUser] = useState<Store["user"]>(null);
  const [authReady, setAuthReady] = useState(false);
  const [saved, setSaved] = useState<SavedRow[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [srcImage, setSrcImage] = useState<SrcImage | null>(null);
  const [advanced, setAdvanced] = useState(false);
  const [quickBusy, setQuickBusy] = useState(false);
  const [, setHv] = useState(0);
  const lastSnap = useRef("");
  const userRef = useRef<Store["user"]>(null);
  const structKey = useRef("");
  const saving = useRef(false);

  const notify = useCallback((msg: string) => setToast({ msg, key: Date.now() }), []);
  const approval: Approval = approvedSig === null ? "draft" : approvedSig === sigOf(pages) ? "approved" : "changed";

  const goStep = useCallback((n: number) => {
    setStep(n); setMax((m) => Math.max(m, n)); setView("wizard");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  const guardedGo = useCallback((n: number) => {
    const simpleOk = !advanced && (n === 4 || n === 6 || n === 7);
    if (n > maxStep && n !== step + 1 && !simpleOk) return;
    if (n >= 5 && approval === "draft" && !simpleOk) { notify("内容确认后，我们才开始决定怎么设计。"); return; }
    goStep(n);
  }, [maxStep, step, approval, advanced, goStep, notify]);

  const setInput = (p: Partial<InputState>) => setInputS((s) => ({ ...s, ...p }));

  const editAnalysis = (id: string, v: string) => setAnalysis((a) => a.map((x) => (x.id === id ? { ...x, value: v } : x)));

  const editHook = (id: string, copy: string) => setHooks((h) => h.map((x) => (x.id === id ? { ...x, copy } : x)));

  const updatePage = (id: string, patch: Partial<Page>) => setPages((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const updateAllTypes = (patch: Partial<Page["type"]>) => setPages((ps) => ps.map((p) => ({ ...p, type: { ...p.type, ...patch } })));
  const setProjectTitle = (t: string) => setProject((p) => ({ ...p, title: t }));
  const setProjectClient = (t: string) => setProject((p) => ({ ...p, client: t }));
  const setLayout = (id: string, l: LayoutId) => setPages((ps) => ps.map((p) => (p.id === id ? { ...p, ...applyLayout(p, l) } : p)));
  const reorder = (from: number, to: number) => setPages((ps) => {
    if (from === to || from < 0 || to < 0 || from >= ps.length || to >= ps.length) return ps;
    const n = [...ps]; const [m] = n.splice(from, 1); n.splice(to, 0, m); return n;
  });
  const duplicatePage = (id: string) => setPages((ps) => {
    const i = ps.findIndex((p) => p.id === id); if (i < 0) return ps;
    const copy: Page = { ...JSON.parse(JSON.stringify(ps[i])), id: uid() };
    const n = [...ps]; n.splice(i + 1, 0, copy); return n;
  });
  const deletePage = (id: string) => setPages((ps) => {
    if (ps.length <= 1) return ps;
    const n = ps.filter((p) => p.id !== id);
    return n;
  });
  const addPage = () => { const p = newPage(); setPages((ps) => [...ps.slice(0, -1).length ? [...ps.slice(0, -1), p, ps[ps.length - 1]] : [...ps, p]]); selectPage(p.id); };
  const setRole = (id: string, role: Page["role"]) => {
    const r = ROLE_PURPOSE[role] ?? ["", ""];
    updatePage(id, { role, purpose: r[0], swipeReason: r[1] });
  };

  const approve = () => setApprovedSig(sigOf(pages));

  const updateDesign = (p: Partial<GlobalDesign>) => setDesign((d) => ({ ...d, ...p }));
  const applyPreset = (id: string) => {
    const pr = PRESETS.find((x) => x.id === id); if (!pr) return;
    setDesign((d) => ({ ...presetToDesign(pr), styles: d.styles, visuals: d.visuals, signature: d.signature, photo: d.photo, gradient: d.gradient }));
    notify(`已应用「${pr.name}」，内容没有改变。`);
  };
  const applyBrand = (b: BrandPreset) => {
    setDesign((d) => ({ ...d, palette: { ...d.palette, accent: b.accent, altBg: b.secondary, altText: b.primary } }));
    notify(`已套用品牌预设：${b.name}`);
  };

  const regenDesign = (id: string) => {
    setReroll((n) => n + 1);
    setPages((ps) => ps.map((p) => {
      if (p.id !== id) return p;
      const c = candidatesFor(p.role);
      const pool = c.filter((l) => l !== p.layout);
      const l = pool[(rerollCounter) % pool.length];
      const tones = ["base", "alt"] as const;
      return { ...p, ...applyLayout(p, l), tone: p.role === "CTA" ? "accent" : tones[(rerollCounter + 1) % 2 === 0 && p.role !== "Hook" ? 1 : 0] };
    }));
  };

  const startNew = (topic?: string, image?: SrcImage | null) => {
    timers.current.forEach(clearTimeout);
    resetHist.current = true; setSrcImage(image ?? null); setAdvanced(true);
    const ps = demoPages();
    setPages(ps); selectPage(ps[0].id); setApprovedSig(null);
    setInputS({ ...defaultInput(), text: topic ?? "" });
    setAnalysis(demoAnalysis()); setHooks(demoHooks()); setSelectedHook("h01");
    setDesign(defaultDesign());
    setProject({ title: topic ?? "未命名 Carousel", client: "" });
    setStep(1); setMax(1); setView("wizard");
    setCurrentId(null); structKey.current = ""; lastSnap.current = ""; setSaveState("idle");
  };

  const startPaperTemplate = () => {
    startNew(undefined, null); setAdvanced(false);
    const ps = paperDemoPages();
    resetHist.current = true;
    setPages(ps); selectPage(ps[0].id); setApprovedSig(sigOf(ps));
    setDesign(presetToDesign(PRESETS.find((x) => x.id === "kit-paper")!));
    setProject({ title: "Paper Editorial 模板", client: "" });
    structKey.current = "paper-template";
    setStep(6); setMax(6); setView("wizard");
  };

  const openProject = (p: Project) => {
    resetHist.current = true; setSrcImage(null); setAdvanced(false);
    const ps = demoPages();
    const s = 6;
    setPages(ps); selectPage(ps[0].id);
    setApprovedSig(s >= 5 ? sigOf(ps) : null);
    const pr = PRESETS.find((x) => x.id === p.presetId) ?? PRESETS[0];
    setDesign(presetToDesign(pr));
    setAnalysis(demoAnalysis()); setHooks(demoHooks()); setSelectedHook("h01");
    setInputS({ ...defaultInput(), text: p.title, client: p.client });
    setProject({ title: p.title, client: p.client });
    setStep(s); setMax(7); setView("wizard");
    setCurrentId(null); structKey.current = "demo"; lastSnap.current = ""; setSaveState("idle");
  };


  // 简易模式没有「确认内容」这一步：文案随时可改，状态始终视为已确认
  useEffect(() => {
    if (!advanced && view === "wizard" && step >= 4) setApprovedSig(sigOf(pages));
  }, [advanced, view, step, pages]);
  const approveAndGo = (n: number) => { setApprovedSig(sigOf(pages)); goStep(n); };

  /* ───────── undo / redo ───────── */
  type Snap = { pages: Page[]; design: GlobalDesign };
  const past = useRef<Snap[]>([]);
  const future = useRef<Snap[]>([]);
  const lastHist = useRef<Snap>({ pages, design });
  const lastPush = useRef(0);
  const skipHist = useRef(false);
  const resetHist = useRef(false);
  useEffect(() => {
    const cur = { pages, design };
    if (skipHist.current) { skipHist.current = false; lastHist.current = cur; return; }
    if (resetHist.current) { resetHist.current = false; past.current = []; future.current = []; lastHist.current = cur; setHv((v) => v + 1); return; }
    const prev = lastHist.current;
    if (prev.pages === pages && prev.design === design) return;
    const now = Date.now();
    if (now - lastPush.current > 600) { past.current.push(prev); if (past.current.length > 100) past.current.shift(); lastPush.current = now; }
    future.current = []; lastHist.current = cur; setHv((v) => v + 1);
  }, [pages, design]);
  const undo = () => {
    const prev = past.current.pop(); if (!prev) return;
    future.current.push(lastHist.current); skipHist.current = true; lastHist.current = prev;
    setPages(prev.pages); setDesign(prev.design); setHv((v) => v + 1);
  };
  const redo = () => {
    const next = future.current.pop(); if (!next) return;
    past.current.push(lastHist.current); skipHist.current = true; lastHist.current = next;
    setPages(next.pages); setDesign(next.design); setHv((v) => v + 1);
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || view !== "wizard") return;
      const t = e.target as HTMLElement;
      if (t.closest?.("input, textarea, select, [contenteditable=true]")) return;
      const k = e.key.toLowerCase();
      if (k === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((k === "z" && e.shiftKey) || k === "y") { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  /* ───────── AI ───────── */
  const brief = () => briefOf(input, INPUT_PLACEHOLDER.topic);
  const imgArg = () => (srcImage ? { mime: srcImage.mime, data: srcImage.data } : null);
  const aiFail = (e: unknown) =>
    notify(e instanceof AiError && e.code === "NO_KEY" ? "未配置 GEMINI_API_KEY，已使用示例数据。" : e instanceof AiError && e.code === "UNAUTHORIZED" ? "登录已过期，请重新登录后再生成。" : e instanceof AiError && e.code === "RATE_LIMIT" ? "AI 使用次数暂时用完了，已使用示例数据。" : "AI 生成失败，已使用示例数据。");

  const runAnalyze = async () => {
    setAnalyzing(true); goStep(2);
    if (input.text.trim()) setProject((p) => ({ ...p, title: input.text.trim().slice(0, 40) }));
    try {
      const r = await ai<{ items: string[] }>("analysis", { input: brief(), image: imgArg() });
      setAnalysis((a) => mapAnalysis(r.items, a));
    } catch (e) { aiFail(e); setAnalysis(demoAnalysis()); }
    setAnalyzing(false);
  };

  const runHooks = async () => {
    setGenHooks(true); goStep(3);
    try {
      const r = await ai<{ hooks: unknown[] }>("hooks", { input: brief(), image: imgArg(), analysis: analysis.map((a) => ({ label: a.label, value: a.value })) });
      setHooks((h) => mapHooks(r.hooks, h)); setSelectedHook("h01");
    } catch (e) { aiFail(e); setHooks(demoHooks()); }
    setGenHooks(false);
  };

  const useHook = async () => {
    const h = hooks.find((x) => x.id === selectedHookId); if (!h) return;
    const key = h.id + "|" + h.copy + "|" + analysis.map((a) => a.value).join("");
    goStep(4);
    if (key === structKey.current) return;
    setGenPages(true);
    try {
      const r = await ai<{ pages: unknown[] }>("structure", { input: brief(), image: imgArg(), analysis: analysis.map((a) => ({ label: a.label, value: a.value })), hook: h.copy });
      const ps = mapPages(r.pages);
      if (!ps.length) throw new AiError("EMPTY");
      setPages(ps); selectPage(ps[0].id); setApprovedSig(null);
    } catch (e) {
      aiFail(e);
      setPages((ps) => ps.map((p, i) => (i === 0 ? { ...p, headline: h.copy, highlight: h.copy.includes(p.highlight) ? p.highlight : "" } : p)));
    }
    structKey.current = key;
    setGenPages(false);
  };

  const regenAnalysis = async (id: string) => {
    const it = analysis.find((x) => x.id === id); if (!it) return;
    try {
      const r = await ai<{ value: string }>("regen_analysis", { input: brief(), label: it.label, current: it.value });
      if (r.value) return editAnalysis(id, r.value);
    } catch (e) { if (e instanceof AiError && e.code !== "NO_KEY") aiFail(e); }
    if (!it.alts.length) return notify("没有更多备选了。");
    setAnalysis((a) => a.map((x) => {
      if (x.id !== id) return x;
      const pool = [x.value, ...x.alts]; const next = 1 % pool.length;
      return { ...x, value: pool[next], alts: pool.filter((_, i) => i !== next) };
    }));
  };

  const regenHook = async (id: string) => {
    const h = hooks.find((x) => x.id === id); if (!h) return;
    try {
      const r = await ai<{ copy: string }>("regen_hook", { input: brief(), framework: h.framework, copy: h.copy });
      if (r.copy) return editHook(id, r.copy);
    } catch (e) { if (e instanceof AiError && e.code !== "NO_KEY") aiFail(e); }
    if (!h.variants.length) return notify("没有更多备选了。");
    setHooks((hs) => hs.map((x) => {
      if (x.id !== id) return x;
      const pool = [x.copy, ...x.variants]; const next = 1 % pool.length;
      return { ...x, copy: pool[next], variants: pool.filter((_, i) => i !== next) };
    }));
  };

  const quickStart = async (topic: string, image?: SrcImage | null) => {
    startNew(topic || undefined, image ?? null); setAdvanced(false);
    setQuickBusy(true); setGenPages(true); setStep(4); setMax(4);
    const ctx = { text: topic.trim() || (image ? `（图片：${image.name}）` : INPUT_PLACEHOLDER.topic), client: "", goal: "Education", platform: "Instagram", audience: "", cta: "Comment" };
    let ps: Page[] = []; let title = topic.trim().slice(0, 40);
    try {
      const r = await ai<{ title?: string; pages: unknown[] }>("quick", { input: ctx, style: "paper", image: image ? { mime: image.mime, data: image.data } : null });
      ps = mapPaperPages(r.pages); if (r.title) title = r.title;
      if (!ps.length) throw new AiError("EMPTY");
    } catch (e) { aiFail(e); ps = paperDemoPages(); }
    resetHist.current = true;
    setPages(ps); selectPage(ps[0].id); setApprovedSig(sigOf(ps));
    setProject({ title: title || "未命名 Carousel", client: "" });
    structKey.current = "quick";
    setGenPages(false); setQuickBusy(false);
    setStep(6); setMax(6); setView("wizard");
  };

  const regenAll = async () => {
    setGenPages(true);
    const ctx = { text: input.text.trim() || project.title || INPUT_PLACEHOLDER.topic, client: input.client, goal: input.goal, platform: input.platform, audience: input.audience, cta: input.cta };
    try {
      const paper = design.kit === "paper";
      const r = await ai<{ pages: unknown[] }>("quick", { input: ctx, style: paper ? "paper" : "default", image: imgArg() });
      const ps = paper ? mapPaperPages(r.pages) : mapPages(r.pages); if (!ps.length) throw new AiError("EMPTY");
      setPages(ps); selectPage(ps[0].id); notify("已重新生成 8 页，可以用撤销恢复。");
    } catch (e) { aiFail(e); }
    setGenPages(false);
  };

  const rewritePage = async (id: string, instruction: string) => {
    const i = pages.findIndex((p) => p.id === id); const pg = pages[i]; if (!pg) return false;
    try {
      const r = await ai<{ headline?: string; body?: string; highlight?: string }>("rewrite", {
        input: brief(), image: imgArg(), index: i + 1, role: pg.role, headline: pg.headline, body: pg.body, instruction,
        context: pages.map((p) => p.headline.replace(/\n/g, " ")),
      });
      if (!r.headline) throw new AiError("EMPTY");
      updatePage(id, { headline: r.headline, body: r.body ?? "", highlight: r.highlight ?? "" });
      return true;
    } catch (e) { aiFail(e); return false; }
  };

  /* ───────── auth ───────── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user; setUser(u ? { id: u.id, email: u.email ?? "" } : null); setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user; setUser(u ? { id: u.id, email: u.email ?? "" } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) setView("dashboard");
    return error ? (error.message.includes("Invalid login") ? "邮箱或密码不正确。" : error.message) : null;
  };
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (data.session) setView("dashboard");
    return data.session ? null : "注册成功，请到邮箱点击验证链接后再登录。";
  };
  const signOut = () => { supabase.auth.signOut(); setSaved([]); setCurrentId(null); setView("dashboard"); notify("已退出登录。"); };

  /* ───────── persistence ───────── */
  const refreshSaved = useCallback(async () => {
    if (!userRef.current) { setSaved(readLocal().sort((a, b) => b.updated_at.localeCompare(a.updated_at)).map(toSaved)); return; }
    const { data } = await supabase.from("carousel_projects")
      .select("id,title,client,status,updated_at,pages:data->pages,design:data->design").order("updated_at", { ascending: false });
    if (data) setSaved(data as unknown as SavedRow[]);
  }, []);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => {
    if (!authReady) return;
    (async () => {
      const local = readLocal();
      if (user && local.length) {
        const rows = local.map((r) => ({ title: r.title, client: r.client, status: r.status, data: r.data, updated_at: r.updated_at }));
        const { error } = await supabase.from("carousel_projects").insert(rows);
        if (!error) { writeLocal([]); setCurrentId((c) => (isLocal(c) ? null : c)); notify(`已把 ${rows.length} 个本地项目同步到你的账号。`); }
      }
      refreshSaved();
    })();
  }, [user, authReady, refreshSaved, notify]);

  const snapshot = () => {
    const strip = (ps: Page[]) => ps;
    return { input, analysis, hooks, selectedHookId, pages: strip(pages), approvedSig, design, step, maxStep, advanced };
  };
  const statusNow = (): Project["status"] => (step >= 7 ? "已完成" : approval === "approved" && step >= 5 ? "等待设计" : step >= 4 ? "等待内容确认" : "Draft");

  useEffect(() => {
    if (!authReady || view !== "wizard") return;
    const t = window.setTimeout(async () => {
      const data = snapshot(); const snap = JSON.stringify(data) + project.title + project.client;
      if (snap === lastSnap.current || saving.current) return;
      saving.current = true; setSaveState("saving");
      const row = { title: project.title, client: project.client, status: statusNow(), data, updated_at: new Date().toISOString() };
      if (!user) {
        const rows = readLocal(); const id = isLocal(currentId) ? currentId! : "local-" + uid();
        const i = rows.findIndex((r) => r.id === id);
        const next: LocalRow = { id, pages: null, design: null, ...row };
        if (i >= 0) rows[i] = next; else rows.unshift(next);
        saving.current = false;
        if (!writeLocal(rows)) { setSaveState("error"); return; }
        lastSnap.current = snap; setCurrentId(id); setSaveState("saved"); setSavedAt(new Date()); refreshSaved();
        return;
      }
      const dbId = currentId && !isLocal(currentId) ? currentId : null;
      const res = dbId
        ? await supabase.from("carousel_projects").update(row).eq("id", dbId).select("id").single()
        : await supabase.from("carousel_projects").insert(row).select("id").single();
      saving.current = false;
      if (res.error) { setSaveState("error"); return; }
      lastSnap.current = snap; setCurrentId(res.data.id); setSaveState("saved"); setSavedAt(new Date()); refreshSaved();
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authReady, view, pages, input, analysis, hooks, selectedHookId, design, step, maxStep, approvedSig, project, currentId, advanced]);

  const openSaved = async (r: SavedRow) => {
    const d: Record<string, unknown> = isLocal(r.id)
      ? readLocal().find((x) => x.id === r.id)?.data ?? {}
      : ((await supabase.from("carousel_projects").select("data").eq("id", r.id).single()).data?.data ?? {}) as Record<string, unknown>;
    const ps = ((d.pages as Page[]) ?? demoPages()).map(normalizePage);
    setPages(ps); selectPage(ps[0]?.id ?? "");
    setApprovedSig((d.approvedSig as string | null) ?? null);
    setDesign({ ...defaultDesign(), ...((d.design as Partial<GlobalDesign>) ?? {}) });
    setAnalysis((d.analysis as AnalysisItem[]) ?? demoAnalysis());
    setHooks((d.hooks as Hook[]) ?? demoHooks()); setSelectedHook((d.selectedHookId as string) ?? "h01");
    setInputS((d.input as InputState) ?? defaultInput());
    setProject({ title: r.title, client: r.client });
    structKey.current = "loaded";
    setCurrentId(r.id); lastSnap.current = ""; setSaveState("idle");
    resetHist.current = true; setSrcImage(null);
    const adv = (d.advanced as boolean | undefined) ?? ((d.step as number) ?? 4) < 4; setAdvanced(adv);
    const st = adv ? ((d.step as number) ?? 4) : 6; setStep(st); setMax(Math.max((d.maxStep as number) ?? st, st)); setView("wizard");
  };
  const deleteSaved = async (id: string) => {
    if (isLocal(id)) writeLocal(readLocal().filter((r) => r.id !== id));
    else await supabase.from("carousel_projects").delete().eq("id", id);
    if (currentId === id) setCurrentId(null);
    refreshSaved();
  };

  const sel = selectedPageId || pages[0]?.id || "";
  const value: Store = {
    view, setView, step, maxStep, goStep: guardedGo, project, input, setInput,
    analysis, editAnalysis, regenAnalysis, hooks, selectedHookId, setSelectedHook, editHook, regenHook, useHook,
    pages, updatePage, setLayout, reorder, duplicatePage, deletePage, addPage, setRole,
    approval, approve, design, updateDesign, applyPreset, applyBrand,
    selectedPageId: pages.some((p) => p.id === sel) ? sel : pages[0]?.id ?? "", selectPage,
    toast, notify, startNew, openProject, regenDesign, rerollCounter, analyzing, runAnalyze, generatingHooks, runHooks, generatingPages,
    updateAllTypes, setProjectTitle, setProjectClient, advanced, approveAndGo, regenAll, startPaperTemplate, quickStart, quickBusy, srcImage, setSrcImage, rewritePage, undo, redo, canUndo: past.current.length > 0, canRedo: future.current.length > 0,
    user, authReady, signIn, signUp, signOut, saved, openSaved, deleteSaved, saveState, savedAt,
  };
  // raw (unguarded) step setter used internally by screens that already validated
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export { BRANDS };
export const rawGo = (s: Store, n: number) => s.goStep(n);

"use client";
import { createContext, useContext, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { hasImageSlot, resolveTheme, rgba, type Theme } from "@/lib/engine";
import type { CanvasElement, GlobalDesign, LayoutId, Page } from "@/lib/types";

const W = 1080, H = 1350;
const pad2 = (n: number) => String(n).padStart(2, "0");

/* ───────── scaled wrapper ───────── */
export default function CarouselCanvas({ page, index, total, design, detail = true, className = "", guides = false, editable }:
  { page: Page; index: number; total: number; design: GlobalDesign; detail?: boolean; className?: string; guides?: boolean; editable?: Editable }) {
  const ref = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean; field: "headline" | "body"; el: HTMLElement } | null>(null);
  const [w, setW] = useState(0);
  const [ed, setEd] = useState<{ field: "headline" | "body"; box: CSSProperties } | null>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el); setW(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  useLayoutEffect(() => { const t = taRef.current; if (t) { t.style.height = "0px"; t.style.height = t.scrollHeight + "px"; } });
  useLayoutEffect(() => { taRef.current?.focus(); }, [ed?.field]);
  const scale = w / W;

  const down = (e: React.PointerEvent) => {
    if (!editable || (e.target as HTMLElement).closest("textarea")) return;
    const el = (e.target as HTMLElement).closest("[data-field]") as HTMLElement | null;
    if (!el) { setEd(null); return; }
    drag.current = { x: e.clientX, y: e.clientY, tx: page.type.x, ty: page.type.y, moved: false, field: el.dataset.field as "headline" | "body", el };
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current; if (!d || !editable) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 6) return;
    if (page.layout === "big-number" && d.field === "body") return;
    d.moved = true; setEd(null);
    const c = (v: number, m: number) => Math.max(-m, Math.min(m, Math.round(v)));
    editable.onMove(c(d.tx + dx / scale, 500), c(d.ty + dy / scale, 700));
  };
  const up = (e: React.PointerEvent) => {
    const d = drag.current; drag.current = null; if (!d) return;
    try { (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
    if (d.moved || !ref.current) return;
    const r = d.el.getBoundingClientRect(), o = ref.current.getBoundingClientRect(), cs = getComputedStyle(d.el);
    const px = (v: string) => (parseFloat(v) || 0) * scale;
    setEd({
      field: d.field,
      box: {
        left: r.left - o.left - 6, top: r.top - o.top - 4, width: Math.max(r.width + 12, 140), minHeight: r.height + 8,
        fontFamily: cs.fontFamily, fontWeight: cs.fontWeight, fontSize: px(cs.fontSize), color: cs.color,
        lineHeight: cs.lineHeight === "normal" ? 1.2 : `${px(cs.lineHeight)}px`, letterSpacing: cs.letterSpacing === "normal" ? 0 : px(cs.letterSpacing),
        textAlign: cs.textAlign as CSSProperties["textAlign"],
      },
    });
  };

  return (
    <div ref={ref} className={`relative w-full overflow-hidden ${editable ? "canvas-edit" : ""} ${className}`} style={{ aspectRatio: `${W}/${H}`, touchAction: editable ? "none" : undefined }}
      onPointerDown={down} onPointerMove={move} onPointerUp={up}>
      {w > 0 && (
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0" }}>
          <Slide page={page} index={index} total={total} design={design} detail={detail} guides={guides} edit={editable ? { enabled: true, hide: ed?.field ?? null } : undefined} />
        </div>
      )}
      {editable && ed && (
        <textarea ref={taRef} value={page[ed.field]} aria-label={ed.field === "headline" ? "编辑标题" : "编辑正文"}
          onChange={(e) => editable.onText(ed.field, e.target.value)}
          onBlur={() => setEd(null)} onKeyDown={(e) => { if (e.key === "Escape") setEd(null); }}
          style={{ position: "absolute", zIndex: 5, resize: "none", overflow: "hidden", background: "rgba(255,255,255,0.0)", border: "1px dashed #c0562f", outline: "none", padding: 0, margin: 0, whiteSpace: "pre-wrap", caretColor: "#c0562f", ...ed.box }} />
      )}
    </div>
  );
}

/* ───────── inline-edit plumbing ───────── */
const EditCtx = createContext<{ enabled: boolean; hide: string | null }>({ enabled: false, hide: null });
function Fld({ tag, field, style, children }: { tag: "h2" | "p" | "span" | "div"; field: "headline" | "body"; style: CSSProperties; children: ReactNode }) {
  const c = useContext(EditCtx);
  const Tag = tag;
  return <Tag data-field={c.enabled ? field : undefined} style={{ ...style, visibility: c.hide === field ? "hidden" : undefined }}>{children}</Tag>;
}

export interface Editable {
  onText: (field: "headline" | "body", value: string) => void;
  onMove: (x: number, y: number) => void;
}

/* ───────── highlight ───────── */
function Hl({ text, hl, t }: { text: string; hl: string; t: Theme }) {
  const i = hl ? text.indexOf(hl) : -1;
  if (i < 0) return <>{text}</>;
  const k = t.hlMode;
  let st: CSSProperties;
  if (k === "bold") st = { fontWeight: 700 };
  else if (k === "italic") st = { color: t.hlFg, fontStyle: "italic", fontFamily: t.serifFont };
  else if (k === "gold") st = { color: t.accent };
  else if (k === "marker") {
    const under = t.light && t.tone !== "accent";
    st = under
      ? { backgroundImage: `linear-gradient(transparent 56%, ${t.accent} 56%, ${t.accent} 92%, transparent 92%)`, padding: "0 6px", margin: "0 -6px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }
      : { background: t.tone === "accent" ? t.fg : t.accent, color: t.tone === "accent" ? t.bg : "#141414", padding: "0 14px", margin: "0 -6px", boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" };
  } else st = { color: t.hlFg, background: t.hlBg, padding: t.boxMode ? "0 14px" : 0, margin: t.boxMode ? "0 -6px" : 0, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" };
  return (
    <>
      {text.slice(0, i)}
      <span style={st}>{hl}</span>
      {text.slice(i + hl.length)}
    </>
  );
}

const TORN = (() => {
  const top: string[] = [], bot: string[] = [];
  for (let i = 0; i <= 26; i++) {
    const x = (i * 100) / 26;
    top.push(`${x.toFixed(1)}% ${((i % 2 ? 0 : 1.5) + ((i * 7) % 3) * 0.6).toFixed(1)}%`);
    bot.push(`${(100 - x).toFixed(1)}% ${(100 - ((i % 2 ? 0.2 : 1.9) + ((i * 5) % 3) * 0.6)).toFixed(1)}%`);
  }
  return `polygon(${top.join(",")},${bot.join(",")})`;
})();

/* ───────── 界面卡片（用代码画得像真的软件界面） ───────── */
const TILE_HUES = ["#D4714E", "#5E8C72", "#2B2622", "#C9973A", "#6F7F9A", "#9A6B7E"];
const hueOf = (name: string) => TILE_HUES[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % TILE_HUES.length];

function AppTile({ name, x, y, i }: { name: string; x: number; y: number; i: number }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 140, height: 140, borderRadius: 32, background: "#fff", boxShadow: "0 10px 30px rgba(70,45,20,0.14)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 2 - (i > 1 ? 1 : 0) }}>
      <span style={{ width: 70, height: 70, borderRadius: 20, background: hueOf(name), color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-fraunces), serif", fontSize: 42, fontWeight: 700 }}>{[...name][0]?.toUpperCase()}</span>
      <span style={{ fontFamily: "var(--font-geist), var(--font-sc), sans-serif", fontSize: 19, color: "#4a443c", maxWidth: 124, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
    </div>
  );
}

function ResultCard({ r, t }: { r: Page["result"]; t: Theme }) {
  const box: CSSProperties = { position: "absolute", left: 585, top: 850, width: 420, height: 400, borderRadius: 24, boxShadow: "0 18px 46px rgba(70,45,20,0.16)", overflow: "hidden", fontFamily: "var(--font-geist), var(--font-sc), sans-serif" };
  const bar = (w: number, c = "#E6E2DA", h = 12) => <div style={{ width: `${w}%`, height: h, borderRadius: 6, background: c }} />;
  if (r.kind === "doc") {
    return (
      <div style={{ ...box, background: "#6E9A82", color: "#fff", padding: "40px 40px" }}>
        <div style={{ fontSize: 21, opacity: 0.8, letterSpacing: "0.02em" }}>{r.sub}</div>
        <div style={{ marginTop: 60, fontFamily: t.headFont, fontSize: 56, lineHeight: 1.1, whiteSpace: "pre-line", fontWeight: 500 }}>{r.title}</div>
      </div>
    );
  }
  if (r.kind === "email") {
    return (
      <div style={{ ...box, background: "#fff", color: "#2A2622", padding: "30px 34px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 26 }}>
          <span style={{ width: 40, height: 40, borderRadius: 20, background: "#E7DDF0", display: "block" }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>{bar(48, "#CFC8BC", 11)}{bar(70, "#E6E2DA", 9)}</div>
        </div>
        <div style={{ fontFamily: t.headFont, fontSize: 42, lineHeight: 1.15, fontWeight: 600, whiteSpace: "pre-line" }}>{r.title}</div>
        <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 12 }}>{bar(92)}{bar(78)}{bar(60)}</div>
        <div style={{ position: "absolute", left: 34, bottom: 22, fontSize: 18, color: "#8f8f88" }}>✓ 已发送 · {r.sub}</div>
      </div>
    );
  }
  return (
    <div style={{ ...box, background: "#fff", color: "#2A2622" }}>
      <div style={{ background: "#3F6B4F", color: "#fff", padding: "20px 30px", fontSize: 22, fontWeight: 500 }}>{r.title}</div>
      <div style={{ padding: "22px 30px", display: "flex", flexDirection: "column", gap: 20 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 18, alignItems: "center", opacity: i === 0 ? 1 : 1 }}>
            {bar(i === 0 ? 70 : 60, i === 0 ? "#9C978D" : "#E1DDD4", i === 0 ? 11 : 10)}{bar(i === 0 ? 55 : 80 - (i % 3) * 12, i === 0 ? "#9C978D" : "#E1DDD4", i === 0 ? 11 : 10)}{bar(i === 0 ? 60 : 50, i === 0 ? "#9C978D" : "#E1DDD4", i === 0 ? 11 : 10)}
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 30, bottom: 20, fontSize: 18, color: "#8f8f88" }}>✓ {r.sub}</div>
    </div>
  );
}

/* ───────── decorations ───────── */
const SPARK = "M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0Z";
function Sparkle({ x, y, size, fill, stroke, rotate = 0 }: { x: number; y: number; size: number; fill?: string; stroke?: string; rotate?: number }) {
  return (
    <svg style={{ position: "absolute", left: x, top: y, transform: `rotate(${rotate}deg)` }} width={size} height={size} viewBox="0 0 24 24">
      <path d={SPARK} fill={fill ?? "none"} stroke={stroke} strokeWidth={stroke ? 0.8 : 0} strokeLinejoin="round" />
    </svg>
  );
}

const HERO_GRID = ["y..y.yy.y..y", "yyyyyyyyyyyy", "yyryyyyyryyy", ".bbbbbbbbbb.", ".bwdbbbbwdb.", ".bbbbbbbbbb.", ".bbbbmmbbbb.", ".bbbbbbbbbb.", "..bbbbbbbb..", "..b.b..b.b.."];
const CROWD_GRID = ["..bbbb..", ".bbbbbb.", ".bwdbwd.", ".bbbbbb.", "..bbbb..", ".bbbbbb.", ".b.bb.b.", "........"];
function PixelArt({ grid, px, colors, style }: { grid: string[]; px: number; colors: Record<string, string>; style?: CSSProperties }) {
  return (
    <svg style={style} width={grid[0].length * px} height={grid.length * px} shapeRendering="crispEdges">
      {grid.flatMap((row, y) => row.split("").map((c, x) => (c === "." ? null : <rect key={`${x}-${y}`} x={x * px} y={y * px} width={px} height={px} fill={colors[c]} />)))}
    </svg>
  );
}
const HERO_COLORS = { y: "#F2C14E", r: "#D9534F", b: "#E28B5B", w: "#FFFFFF", d: "#1B2536", m: "#B5603A" };
const CROWD_BODY = ["#E28B5B", "#8CB6A0", "#D9B25F", "#C98C9C", "#7FA9C9", "#E28B5B", "#B9C46B"];
function PixelCrowd({ y }: { y: number }) {
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      {CROWD_BODY.concat(CROWD_BODY).slice(0, 12).map((c, i) => (
        <PixelArt key={i} grid={CROWD_GRID} px={i % 3 === 1 ? 8 : 7} colors={{ b: c, w: "#fff", d: "#1B2536" }} />
      ))}
    </div>
  );
}

const SQUIGGLE: Partial<Record<LayoutId, string>> = {
  stagger: "M1080 545 C 985 560, 940 660, 990 760 C 1040 860, 1030 1010, 950 1060 C 880 1100, 800 1050, 850 970 C 895 900, 990 990, 975 1120 C 965 1210, 900 1250, 850 1240",
  "prompt-card": "M0 790 C 130 730, 230 790, 260 890 C 300 1010, 400 1060, 500 1030 C 560 1010, 560 960, 520 950 C 470 940, 440 1010, 500 1090 C 620 1250, 920 1150, 1080 990",
  headline: "M1080 980 C 900 1010, 860 1150, 700 1150 C 560 1150, 520 1090, 590 1060",
  minimal: "M1080 980 C 900 1010, 860 1150, 700 1150 C 560 1150, 520 1090, 590 1060",
  quote: "M1080 980 C 900 1010, 860 1150, 700 1150 C 560 1150, 520 1090, 590 1060",
  "headline-image": "M0 560 C 120 520, 150 640, 60 690",
};

/** **粗斜体** 语法：把文字里用 ** 包起来的部分渲染成粗斜体 */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((seg, i) =>
        seg.startsWith("**") && seg.endsWith("**") ? <b key={i} style={{ fontWeight: 700, fontStyle: "italic" }}>{seg.slice(2, -2)}</b> : <span key={i}>{seg}</span>,
      )}
    </>
  );
}

const TILE_COLORS = ["#D4714E", "#7C9A7E", "#2B2622", "#D9A441", "#8E8577"];

/* ───────── slide ───────── */
export function Slide({ page: rawPage, index, total, design, detail, guides, edit }:
  { page: Page; index: number; total: number; design: GlobalDesign; detail: boolean; guides: boolean; edit?: { enabled: boolean; hide: string | null } }) {
  // 兼容旧版本保存的项目（缺少后来新增的字段）
  const page: Page = { ...rawPage, chips: rawPage.chips ?? [], steps: rawPage.steps ?? [], elements: rawPage.elements ?? [], result: rawPage.result ?? { kind: "none", title: "", sub: "" } };
  const t = resolveTheme(page, design);
  const M = design.grid.margin;
  const box: CSSProperties = { position: "relative", width: W, height: H, background: t.bg, color: t.fg, overflow: "hidden", fontFamily: t.bodyFont };
  return (
    <EditCtx.Provider value={edit ?? { enabled: false, hide: null }}>
    <div style={box}>
      <Bg t={t} page={page} design={design} detail={detail} />
      {(t.kit.squiggle || (t.kit.id === "paper" && t.tw.squiggle)) && SQUIGGLE[page.layout] && (
        <svg style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }} width="1080" height="1350" viewBox="0 0 1080 1350" fill="none">
          <path d={SQUIGGLE[page.layout]} stroke={t.accent} strokeWidth={t.kit.id === "paper" ? t.tw.squiggleWidth : 5} strokeLinecap="round" />
        </svg>
      )}
      {t.kit.stars && (
        <>
          <Sparkle x={M + 6} y={170} size={92} fill={t.accent} />
          <Sparkle x={M + 118} y={250} size={44} fill={t.accent} rotate={12} />
          <Sparkle x={860} y={1040} size={62} stroke="#fff" rotate={-14} />
        </>
      )}
      {t.kit.pixel && (
        <>
          {page.role === "Hook" && <PixelArt grid={HERO_GRID} px={30} colors={HERO_COLORS} style={{ position: "absolute", left: 540 - 180, top: 270 }} />}
          <PixelCrowd y={page.role === "Hook" ? 700 : 1110} />
        </>
      )}
      <Chrome t={t} page={page} index={index} total={total} M={M} signature={design.signature} />
      <LayoutBody page={page} t={t} M={M} design={design} index={index} />
      {page.elements.map((e) => <El key={e.id} e={e} t={t} />)}
      {guides && (
        <div style={{ position: "absolute", inset: design.grid.safe, border: "1px dashed rgba(245,197,24,0.55)", pointerEvents: "none" }} />
      )}
    </div>
    </EditCtx.Provider>
  );
}

/* ───────── background ───────── */
const NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .9 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

function Bg({ t, page, design, detail }: { t: Theme; page: Page; design: GlobalDesign; detail: boolean }) {
  const s = t.bgStyle;
  const fill: CSSProperties = { position: "absolute", inset: 0 };
  const grain = s === "noise" ? Math.max(design.grain, 14) : design.grain;
  return (
    <>
      {t.kit.pixel && t.tone === "base" && (
        <>
          <div style={{ ...fill, background: "radial-gradient(80% 45% at 50% 30%, #35507a 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 330, background: "linear-gradient(180deg, #16233a, #0f1828)" }} />
          <div style={{ position: "absolute", left: 90, right: 90, top: 150, height: 620, border: "10px solid rgba(242,193,78,0.28)", borderBottom: "none", borderRadius: "540px 540px 0 0" }} />
        </>
      )}
      {t.kit.usesPhoto && t.tone === "base" && (t.photo ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={t.photo} alt="" style={{ ...fill, width: "100%", height: "100%", objectFit: "cover", filter: `blur(${design.blur}px)`, transform: design.blur ? "scale(1.06)" : undefined }} />
          <div style={{ ...fill, background: `linear-gradient(180deg, ${rgba(t.bg, 0.3)} 0%, ${rgba(t.bg, Math.min(0.96, design.overlay / 100 + 0.25))} 100%)` }} />
        </>
      ) : (
        <div style={{ ...fill, background: "radial-gradient(90% 55% at 72% 18%, #5a4527 0%, transparent 70%), linear-gradient(180deg, #211a11, #0b0805)" }} />
      ))}
      {s === "gradient" && page.tone === "base" && !page.bgColor && (
        <div style={{ ...fill, background: `linear-gradient(${design.gradient.dir}deg, ${design.gradient.a}, ${design.gradient.b})`, opacity: design.gradient.intensity / 100 }} />
      )}
      {s === "gradient" && (page.tone !== "base" || !!page.bgColor) && (
        <div style={{ ...fill, background: `linear-gradient(${design.gradient.dir}deg, ${rgba(t.fg, 0.06)}, transparent 70%)` }} />
      )}
      {s === "texture" && <div style={{ ...fill, background: `repeating-linear-gradient(45deg, ${rgba(t.fg, 0.05)} 0 2px, transparent 2px 14px)` }} />}
      {(s === "grid" || t.gridLines) && (
        <div style={{ ...fill, backgroundImage: `linear-gradient(${rgba(t.fg, 0.07)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(t.fg, 0.07)} 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
      )}
      {(s === "image" || s === "screenshot") && (
        <>
          <div style={{ ...fill, filter: `blur(${design.blur}px)`, transform: "scale(1.05)" }}>
            {s === "image"
              ? <div style={{ ...fill, background: `radial-gradient(70% 55% at 75% 25%, ${rgba(t.fg, 0.28)}, transparent 70%), repeating-linear-gradient(135deg, ${rgba(t.fg, 0.08)} 0 2px, transparent 2px 18px)` }} />
              : <div style={{ ...fill, display: "flex", gap: 30, padding: 60, alignItems: "flex-start" }}><Shot kind="feed" t={t} w={400} h={900} /><Shot kind="grid" t={t} w={400} h={760} /><Shot kind="list" t={t} w={400} h={820} /></div>}
          </div>
          <div style={{ ...fill, background: rgba(t.bg, design.overlay / 100) }} />
        </>
      )}
      {detail && grain > 0 && <div style={{ ...fill, backgroundImage: NOISE, opacity: grain / 100, mixBlendMode: "overlay" }} />}
    </>
  );
}

/* ───────── chrome (label, page count) ───────── */
function Chrome({ t, page, index, total, M, signature }: { t: Theme; page: Page; index: number; total: number; M: number; signature: string }) {
  const mono: CSSProperties = { fontFamily: t.monoFont, fontSize: 22, letterSpacing: `${t.labelTracking}em`, textTransform: "uppercase", color: t.muted };
  const f = t.kit.frame;
  if (t.kit.id === "paper" && !t.tw.chrome) return null;
  const label = page.label || `PAGE ${pad2(index + 1)}`;
  const shadow = t.kit.shadow ? "0 2px 12px rgba(0,0,0,0.5)" : undefined;

  if (f === "photo") {
    return (
      <>
        <div style={{ position: "absolute", left: M, right: M, top: 64, display: "flex", justifyContent: "space-between", alignItems: "center", ...mono, color: "#fff", textShadow: shadow }}>
          <span>{label}</span>
          <span style={{ fontFamily: t.headFont, fontWeight: 900, fontSize: 30, letterSpacing: "0.04em" }}>{signature}</span>
        </div>
        <div style={{ position: "absolute", left: M, right: M, bottom: 60, ...mono, color: "#fff", textShadow: shadow }}>{pad2(index + 1)} / {pad2(total)}</div>
      </>
    );
  }
  if (f === "frost") {
    return (
      <div style={{ position: "absolute", left: M, right: M, bottom: 64, textAlign: "center", ...mono, color: "#fff", textShadow: shadow, letterSpacing: "0.08em", textTransform: "none", fontSize: 26 }}>
        {signature ? `✧ ${signature} ✧` : `${pad2(index + 1)} / ${pad2(total)}`}
      </div>
    );
  }
  if (f === "pixel") {
    return (
      <>
        <div style={{ position: "absolute", left: M, right: M, top: 60, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: t.monoFont, fontSize: 22, letterSpacing: "0.14em", textTransform: "uppercase", background: "#0E1622", color: "#F6EBD3", padding: "10px 22px", borderRadius: 999, border: "2px solid rgba(246,235,211,0.35)" }}>{label}</span>
          <span style={{ fontFamily: t.monoFont, fontSize: 22, color: t.fg, letterSpacing: "0.1em" }}>{index + 1}/{total}</span>
        </div>
        <div style={{ position: "absolute", left: M, right: M, bottom: 60, display: "flex", justifyContent: "space-between", ...mono, color: t.muted }}>
          <span style={{ color: t.fg, fontWeight: 600 }}>{signature}</span><span>{index < total - 1 ? t.kit.cue : "END"}</span>
        </div>
      </>
    );
  }
  return (
    <>
      <div style={{ position: "absolute", left: M, right: M, top: 64, display: "flex", justifyContent: "space-between", alignItems: "center", ...mono }}>
        {f === "moody" ? (
          <span style={{ border: `2px solid ${t.accent}`, color: t.accent, padding: "7px 18px" }}>{label}</span>
        ) : (
          <span style={{ display: "flex", alignItems: "center", gap: 16, color: f === "paper" ? t.accent : t.muted }}>
            {f === "basic" && <span style={{ width: 34, height: 4, background: t.accent, display: "block" }} />}
            {label}
          </span>
        )}
        <span>{pad2(index + 1)} / {pad2(total)}</span>
      </div>
      {t.hairlines && (f === "basic" || f === "paper") && <div style={{ position: "absolute", left: M, right: M, top: 128, height: 1, background: t.line }} />}
      <div style={{ position: "absolute", left: M, right: M, bottom: 68, display: "flex", justifyContent: "space-between", alignItems: "center", ...mono }}>
        <span style={{ color: t.fg, fontWeight: 600, letterSpacing: "0.12em" }}>{signature}</span>
        <span>{index < total - 1 ? t.kit.cue : "END"}</span>
      </div>
    </>
  );
}

/* ───────── text block ───────── */
const JUSTIFY = { top: "flex-start", middle: "center", bottom: "flex-end" } as const;
const ALIGN = { left: "flex-start", center: "center", right: "flex-end" } as const;
const bodySize = (size: number, ratio = 0.46) => Math.min(76, Math.max(34, Math.round(size * ratio)));

const wOf = (t: Theme, w: number) => (t.kit.id === "paper" ? t.tw.titleWeight : w);

function TextBlock({ page, t, M, top, bottom, showBody = true, bodyColor, bodyRatio }:
  { page: Page; t: Theme; M: number; top: number; bottom: number; showBody?: boolean; bodyColor?: string; bodyRatio?: number }) {
  const ty = page.type; const size = ty.size * t.scale;
  const isHook = page.role === "Hook";
  const strip = t.kit.strip && isHook;
  const card = t.kit.card && (!isHook || t.kit.cardCover) ? t.kit.card : null;
  const light = strip || card === "plaque";
  const th: Theme = light ? { ...t, fg: card === "plaque" ? "#1B2536" : "#141414", muted: card === "plaque" ? "#4A5568" : t.muted, light: true, tone: "base", hlFg: card === "plaque" ? "#1B2536" : "#141414" } : t;
  const hero = isHook && t.kit.hero !== "default";
  const justify = hero ? (t.kit.hero === "bottom" ? "flex-end" : "center") : JUSTIFY[ty.valign];
  const T = hero ? 170 : top;
  const Bt = hero ? (t.kit.hero === "bottom" ? 190 : 170) : bottom;
  const shadow = t.kit.shadow && !card ? "0 3px 26px rgba(0,0,0,0.5)" : undefined;
  const cardStyle: CSSProperties | undefined =
    card === "frost" ? { background: "rgba(255,255,255,0.2)", border: "2px solid rgba(255,255,255,0.55)", borderRadius: 40, padding: "46px 52px", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)" }
    : card === "plaque" ? { background: "#F3E8D0", border: "6px solid #16202F", boxShadow: "10px 10px 0 #0E1622", borderRadius: 10, padding: "40px 46px" }
    : undefined;
  return (
    <div style={{ position: "absolute", left: M, right: M, top: T, bottom: Bt, display: "flex", flexDirection: "column", justifyContent: justify, alignItems: ALIGN[ty.align], transform: `translate(${ty.x}px, ${ty.y}px)` }}>
      <div style={{ width: `${ty.width}%`, textAlign: ty.align, ...cardStyle }}>
        <div style={strip ? { background: "#F4F1EA", color: "#141414", padding: "34px 40px 42px", margin: "0 -30px", transform: "rotate(-2deg)", clipPath: TORN, display: "block" } : undefined}>
        <Fld tag="h2" field="headline" style={{ margin: 0, fontFamily: t.headFont, fontWeight: wOf(t, ty.weight), fontSize: size, lineHeight: ty.lineHeight, letterSpacing: `${ty.tracking / 100}em`, whiteSpace: "pre-line", overflowWrap: "anywhere", textWrap: "balance", color: light ? th.fg : undefined, textShadow: shadow }}>
          <Hl text={page.headline} hl={page.highlight} t={th} />
        </Fld>
        </div>
        {t.kit.rule && <div style={{ width: 96, height: 4, background: t.accent, marginTop: size * 0.32, marginLeft: ty.align === "left" ? 0 : "auto", marginRight: ty.align === "right" ? 0 : "auto" }} />}
        {showBody && page.body && (
          <Fld tag="p" field="body" style={{ margin: 0, marginTop: size * 0.42, fontSize: bodySize(size, bodyRatio), lineHeight: 1.4, fontWeight: bodyRatio ? 700 : 400, color: light ? th.muted : bodyColor ?? t.muted, whiteSpace: "pre-line", letterSpacing: 0, textShadow: shadow }}>
            <Hl text={page.body} hl={page.highlight} t={th} />
          </Fld>
        )}
      </div>
    </div>
  );
}

/* ───────── layouts ───────── */
function LayoutBody({ page, t, M, design, index }: { page: Page; t: Theme; M: number; design: GlobalDesign; index: number }) {
  const ty = page.type; const size = ty.size * t.scale;
  const im = page.image;
  const isCta = page.role === "CTA" && page.layout === "headline";
  switch (page.layout) {
    case "headline":
      return (
        <>
          <TextBlock page={page} t={t} M={M} top={170} bottom={isCta ? 470 : 160} showBody={!isCta} bodyColor={t.fg} bodyRatio={0.66} />
          {isCta && <CtaBox page={page} t={t} M={M} />}
        </>
      );
    case "headline-image":
      return (
        <>
          <TextBlock page={page} t={t} M={M} top={170} bottom={620} />
          <ImageSlot page={page} t={t} design={design} style={{ position: "absolute", right: 0, bottom: 0, width: 600, height: 700 }} phone fade />
        </>
      );
    case "split":
      return (
        <>
          <TextBlock page={page} t={t} M={M} top={170} bottom={640} />
          <ImageSlot page={page} t={t} design={design} style={{ position: "absolute", left: M, right: M, top: 790, height: 400 }} />
        </>
      );
    case "full-image":
      return (
        <>
          <ImageSlot page={page} t={t} design={design} style={{ position: "absolute", left: 0, top: 0, width: W, height: H }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 900, background: `linear-gradient(to top, ${rgba(t.bg, 0.96)} 10%, transparent)` }} />
          <TextBlock page={page} t={t} M={M} top={170} bottom={170} bodyColor={t.fg} />
        </>
      );
    case "screenshot":
      return (
        <>
          <TextBlock page={page} t={t} M={M} top={170} bottom={640} />
          {im.mode === "screenshot" && !t.kit.usesPhoto ? (
            <div style={{ position: "absolute", left: M, right: M, top: 640, height: 560 }}>
              <div style={{ position: "absolute", left: 0, top: 70, transform: "rotate(-3deg)" }}><Shot kind="grid" t={t} w={370} h={480} /></div>
              <div style={{ position: "absolute", left: 500, top: 100, transform: "rotate(3deg)" }}><Shot kind="list" t={t} w={370} h={460} /></div>
              <div style={{ position: "absolute", left: 275, top: 0, zIndex: 2, boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}><Shot kind="feed" t={t} w={370} h={560} /></div>
            </div>
          ) : (
            <ImageSlot page={page} t={t} design={design} style={{ position: "absolute", left: M, right: M, top: 660, height: 530 }} />
          )}
        </>
      );
    case "big-number": {
      const len = page.stat.value.length;
      const ns = len <= 2 ? 470 : len === 3 ? 340 : 250;
      return (
        <>
          <TextBlock page={page} t={t} M={M} top={170} bottom={900} showBody={false} />
          <div style={{ position: "absolute", left: M - 12, top: 330, display: "flex", alignItems: "baseline", gap: 26, transform: `translate(${ty.x}px, ${ty.y}px)` }}>
            <span style={{ fontFamily: t.serifFont, fontSize: ns, lineHeight: 1, letterSpacing: "-0.04em", color: t.fg }}>{page.stat.value}</span>
            <span style={{ fontFamily: t.headFont, fontWeight: 800, fontSize: Math.round(ns * 0.27), letterSpacing: "0.02em", color: t.hlFg, background: t.hlBg, padding: t.boxMode ? "0 14px" : 0 }}>{page.stat.unit}</span>
          </div>
          {page.body && (
            <Fld tag="p" field="body" style={{ position: "absolute", left: M, right: M, bottom: 170, margin: 0, fontSize: 42, lineHeight: 1.5, color: t.muted, whiteSpace: "pre-line" }}>{page.body}</Fld>
          )}
        </>
      );
    }
    case "quote":
      return (
        <>
          <div style={{ position: "absolute", left: M - 6, top: 150, fontFamily: t.serifFont, fontSize: 340, lineHeight: 1, height: 220, color: t.accent, overflow: "hidden" }}>“</div>
          <div style={{ position: "absolute", left: M, right: M, top: 380, bottom: 170, display: "flex", flexDirection: "column", justifyContent: JUSTIFY[ty.valign], transform: `translate(${ty.x}px, ${ty.y}px)` }}>
            <div style={{ width: `${ty.width}%`, textAlign: ty.align, alignSelf: ALIGN[ty.align] }}>
              <Fld tag="p" field="headline" style={{ margin: 0, fontSize: size, lineHeight: ty.lineHeight, fontWeight: ty.weight, color: page.body ? t.muted : t.fg, whiteSpace: "pre-line", letterSpacing: 0 }}>
                <Hl text={page.headline} hl={page.highlight} t={t} />
              </Fld>
              {page.body && (
                <Fld tag="p" field="body" style={{ margin: 0, marginTop: 56, fontFamily: t.headFont, fontSize: size * 1.55, lineHeight: 1.18, fontWeight: 800, letterSpacing: "-0.02em", color: t.fg, whiteSpace: "pre-line" }}>
                  <Hl text={page.body} hl={page.highlight} t={t} />
                </Fld>
              )}
            </div>
          </div>
        </>
      );
    case "framework": {
      const steps = page.steps.filter(Boolean);
      const rowH = Math.min(120, 640 / Math.max(steps.length, 1));
      return (
        <>
          <TextBlock page={page} t={t} M={M} top={170} bottom={800} showBody={false} />
          <div style={{ position: "absolute", left: M, right: M, top: 560, display: "flex", flexDirection: "column" }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", height: rowH, alignItems: "flex-start", gap: 34 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                  <div style={{ width: 62, height: 62, border: `3px solid ${t.accent}`, borderRadius: t.radius > 8 ? 31 : 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: t.monoFont, fontSize: 24, color: t.accent, flexShrink: 0 }}>{pad2(i + 1)}</div>
                  {i < steps.length - 1 && <div style={{ flex: 1, width: 3, background: t.line, marginTop: 6, marginBottom: 6 }} />}
                </div>
                <div style={{ paddingTop: 4, fontSize: 56, fontWeight: 800, letterSpacing: "-0.01em", lineHeight: 1.2, color: t.fg }}>{s}</div>
              </div>
            ))}
          </div>
        </>
      );
    }
    case "comparison": {
      const a = page.steps[0] || "找更多灵感", b = page.steps[1] || "建立判断系统";
      return (
        <>
          <TextBlock page={page} t={t} M={M} top={170} bottom={780} showBody={false} />
          <div style={{ position: "absolute", left: M, right: M, top: 580, height: 610, display: "flex", gap: 28 }}>
            <div style={{ flex: 1, border: `2px solid ${t.line}`, padding: 44, display: "flex", flexDirection: "column", justifyContent: "space-between", borderRadius: t.radius }}>
              <span style={{ fontFamily: t.monoFont, fontSize: 22, letterSpacing: "0.16em", color: t.muted }}>常见做法</span>
              <span style={{ fontSize: 60, fontWeight: 700, color: t.muted, lineHeight: 1.2, textDecoration: "line-through", textDecorationThickness: 4 }}>{a}</span>
            </div>
            <div style={{ flex: 1, border: `3px solid ${t.accent}`, padding: 44, display: "flex", flexDirection: "column", justifyContent: "space-between", borderRadius: t.radius, background: rgba(t.accent, 0.08) }}>
              <span style={{ fontFamily: t.monoFont, fontSize: 22, letterSpacing: "0.16em", color: t.accent }}>有效做法</span>
              <span style={{ fontSize: 60, fontWeight: 800, color: t.fg, lineHeight: 1.2 }}>{b}</span>
            </div>
          </div>
        </>
      );
    }
    case "stagger": {
      const lines = page.headline.split("\n").filter((l) => l.length);
      const n = Math.max(lines.length, 1);
      // 一行字的宽度（以「字」为单位）：汉字算 1，英文数字算 0.55
      const em = (ln: string) => [...ln].reduce((a, c) => a + (/[\u2E80-\u9FFF\uFF00-\uFFEF]/.test(c) ? 1 : 0.55), 0);
      const maxEm = Math.max(...lines.map(em), 1);
      const fs = Math.min(ty.size * t.scale, 1010 / (n * ty.lineHeight), 650 / maxEm);
      const rowH = fs * ty.lineHeight;
      const blockTop = 110 + (1130 - n * rowH) / 2;
      const side = (i: number) => (i === 0 ? "L0" : i === 1 ? "L1" : i % 2 === 0 ? "R" : "L");
      const chips = t.tw.chips ? page.chips.filter(Boolean).slice(0, 5) : [];
      return (
        <>
          {chips.map((c, j) => {
            const row = Math.min(n - 1, Math.max(0, Math.round(((j + 0.5) * n) / chips.length - 0.5)));
            const onRight = side(row) !== "R"; // 这一行靠左 → 气泡放右边空位
            const y = blockTop + row * rowH + rowH / 2 - 26;
            return (
              <div key={j} style={{ position: "absolute", top: y, ...(onRight ? { right: 36 } : { left: 44 }), background: "#fff", color: "#4a443c", padding: "13px 24px", borderRadius: 18, fontFamily: t.bodyFont, fontStyle: "italic", fontSize: 25, lineHeight: 1.25, maxWidth: 290, boxShadow: "0 8px 26px rgba(60,40,20,0.10)", transform: `rotate(${j % 2 ? 1.5 : -1.5}deg)` }}>{c}</div>
            );
          })}
          <div style={{ position: "absolute", left: 100, right: 130, top: 110, bottom: 110, display: "flex", flexDirection: "column", justifyContent: "center", transform: `translate(${ty.x}px, ${ty.y}px)` }}>
            <Fld tag="h2" field="headline" style={{ margin: 0, fontFamily: t.headFont, fontWeight: wOf(t, ty.weight), fontSize: fs, lineHeight: ty.lineHeight, letterSpacing: `${ty.tracking / 100}em`, color: t.fg }}>
              {lines.map((ln, i) => {
                const sd = side(i);
                return <span key={i} style={{ display: "block", textAlign: sd === "R" ? "right" : "left", paddingLeft: sd === "L1" ? fs * 0.3 : 0, whiteSpace: "nowrap" }}><Hl text={ln} hl={page.highlight} t={t} /></span>;
              })}
            </Fld>
          </div>
        </>
      );
    }
    case "prompt-card": {
      const fs = ty.size * t.scale;
      const cs = t.tw.cardShadow;
      const tiles = page.steps.filter(Boolean).slice(0, 3);
      const off = [-30, 70, -70, 40][index % 4];
      const tilePos = [{ x: 78, y: 800 }, { x: 172, y: 935 }, { x: 120, y: 1070 }];
      return (
        <>
          <div style={{ position: "absolute", left: M, right: M, top: 108, textAlign: "center", transform: `translate(${ty.x}px, ${ty.y}px)` }}>
            <Fld tag="h2" field="headline" style={{ margin: 0, fontFamily: t.headFont, fontWeight: wOf(t, ty.weight), fontSize: fs, lineHeight: ty.lineHeight, letterSpacing: `${ty.tracking / 100}em`, whiteSpace: "pre-line", textWrap: "balance", color: t.fg }}>
              <Hl text={page.headline} hl={page.highlight} t={t} />
            </Fld>
          </div>
          <div style={{ position: "absolute", left: 170 + off, width: 745, top: 345, background: "#FFFFFF", color: "#2A2622", borderRadius: t.tw.cardRadius, padding: "52px 58px", boxShadow: `0 ${cs * 0.4}px ${cs * 1.4}px rgba(70,45,20,${(cs / 400).toFixed(2)})` }}>
            <Fld tag="p" field="body" style={{ margin: 0, fontFamily: t.bodyFont, fontSize: 36, lineHeight: 1.45, whiteSpace: "pre-line", paddingRight: t.tw.sendButton ? 20 : 0 }}>
              <RichText text={page.body} />
            </Fld>
            {t.tw.sendButton && (
              <div style={{ position: "absolute", right: 22, bottom: 22, width: 58, height: 58, borderRadius: 14, background: t.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 700, lineHeight: 1 }}>↑</div>
            )}
          </div>
          {tiles.map((name, i) => <AppTile key={i} name={name} x={tilePos[i].x} y={tilePos[i].y} i={i} />)}
          {page.result.kind !== "none" && <ResultCard r={page.result} t={t} />}
        </>
      );
    }
    case "closing": {
      const fs = ty.size * t.scale;
      return (
        <div style={{ position: "absolute", left: M, right: M, top: 150, bottom: 150, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", transform: `translate(${ty.x}px, ${ty.y}px)` }}>
          <Fld tag="h2" field="headline" style={{ margin: 0, fontFamily: t.headFont, fontWeight: wOf(t, ty.weight), fontSize: fs, lineHeight: ty.lineHeight, letterSpacing: `${ty.tracking / 100}em`, whiteSpace: "pre-line", textWrap: "balance", color: t.fg }}>
            <Hl text={page.headline} hl={page.highlight} t={t} />
          </Fld>
          {page.body && <Fld tag="p" field="body" style={{ margin: "40px 0 0", fontFamily: t.bodyFont, fontSize: 38, color: t.muted, whiteSpace: "pre-line" }}>{page.body}</Fld>}
        </div>
      );
    }
    case "minimal":
      return <TextBlock page={page} t={t} M={M} top={170} bottom={170} bodyColor={t.muted} />;
  }
}

function CtaBox({ page, t, M }: { page: Page; t: Theme; M: number }) {
  return (
    <div style={{ position: "absolute", left: M, right: M, bottom: 170 }}>
      <div style={{ fontFamily: t.monoFont, fontSize: 22, letterSpacing: "0.18em", textTransform: "uppercase", color: t.muted, marginBottom: 20 }}>{page.ctaType}</div>
      <div style={t.kit.pill
        ? { background: "#FFFFFF", color: "#141414", padding: "34px 60px", display: "inline-flex", alignItems: "center", gap: 28, borderRadius: 999, boxShadow: "0 12px 40px rgba(0,0,0,0.35)" }
        : t.kit.card === "plaque"
        ? { background: "#F3E8D0", color: "#1B2536", border: "6px solid #16202F", boxShadow: "10px 10px 0 #0E1622", padding: "38px 46px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 30, borderRadius: 10 }
        : { background: t.fg, color: t.bg, padding: "44px 52px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 30, borderRadius: t.radius }}>
        <Fld tag="span" field="body" style={{ fontSize: t.kit.pill ? 52 : 68, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1, whiteSpace: "pre-line" }}>{page.body || "写下你的 CTA"}</Fld>
        <span style={{ fontSize: t.kit.pill ? 56 : 80, lineHeight: 1 }}>→</span>
      </div>
    </div>
  );
}

/* ───────── image slot ───────── */
function ImageSlot({ page, t, style, phone, fade }: { page: Page; t: Theme; design: GlobalDesign; style: CSSProperties; phone?: boolean; fade?: boolean }) {
  const im = page.image;
  if (im.mode === "none" || !hasImageSlot(page.layout) || t.kit.usesPhoto || (t.kit.pixel && page.layout === "headline-image")) return null;
  const w = Number(style.width) || 920, h = Number(style.height) || 400;
  const wrap: CSSProperties = {
    ...style, opacity: im.opacity / 100, overflow: "hidden", borderRadius: im.radius,
    WebkitMaskImage: fade ? "linear-gradient(180deg, transparent 0%, #000 26%)" : undefined,
    maskImage: fade ? "linear-gradient(180deg, transparent 0%, #000 26%)" : undefined,
  };
  const overlay = im.overlay > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${im.overlay / 100})` }} />;
  if (im.mode === "upload" && im.url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <div style={wrap}><img src={im.url} alt="" style={{ width: "100%", height: "100%", objectFit: im.fit, filter: `blur(${im.blur}px)`, display: "block" }} />{overlay}</div>;
  }
  if (im.mode === "screenshot") {
    return (
      <div style={wrap}>
        <div style={{ filter: `blur(${im.blur}px)`, width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: phone ? 30 : 0 }}>
          {phone ? <Shot kind="phone" t={t} w={Math.min(w - 90, 470)} h={h + 60} /> : <Shot kind="feed" t={t} w={Math.min(w, 460)} h={h} />}
        </div>
        {overlay}
      </div>
    );
  }
  return (
    <div style={{ ...wrap, border: `2px dashed ${t.line}`, background: `repeating-linear-gradient(135deg, ${rgba(t.fg, 0.06)} 0 2px, transparent 2px 22px)`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 14 }}>
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="1.2"><rect x="3" y="4" width="18" height="16" rx="1" /><circle cx="9" cy="10" r="1.6" /><path d="m3 17 5-5 4 4 3-3 6 6" /></svg>
      <span style={{ fontFamily: t.monoFont, fontSize: 22, letterSpacing: "0.2em", color: t.muted }}>IMAGE · {Math.round(w)}×{Math.round(h)}</span>
      {overlay}
    </div>
  );
}

/* ───────── mock screenshots (CSS-drawn, no stock photos) ───────── */
function Shot({ kind, t, w, h }: { kind: "phone" | "feed" | "grid" | "list"; t: Theme; w: number; h: number }) {
  const surf = t.light ? "#FFFFFF" : "#1A1A1A";
  const blk = t.light ? "#E3E0D8" : "#2B2B2B";
  const ink = t.light ? "rgba(0,0,0,0.75)" : "rgba(255,255,255,0.8)";
  const soft = t.light ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.16)";
  const outer: CSSProperties = { width: w, height: h, background: surf, border: `2px solid ${t.line}`, borderRadius: kind === "phone" ? 52 : 14, overflow: "hidden", position: "relative", flexShrink: 0, padding: kind === "phone" ? "26px 20px" : 20 };
  const bar = (wp: number, hh = 10, c = soft) => <div style={{ width: `${wp}%`, height: hh, background: c, borderRadius: 2 }} />;
  const head = (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 20, background: t.accent }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>{bar(45, 10, ink)}{bar(28, 8)}</div>
    </div>
  );
  if (kind === "grid") {
    return (
      <div style={outer}>
        <div style={{ fontFamily: t.monoFont, fontSize: 16, letterSpacing: "0.16em", color: ink, marginBottom: 14 }}>SAVED · 100</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {Array.from({ length: 12 }).map((_, i) => <div key={i} style={{ aspectRatio: "1/1.25", background: i % 5 === 2 ? rgba(t.accent, 0.5) : blk }} />)}
        </div>
      </div>
    );
  }
  if (kind === "list") {
    return (
      <div style={outer}>
        <div style={{ fontFamily: t.monoFont, fontSize: 16, letterSpacing: "0.16em", color: ink, marginBottom: 16 }}>COLLECTION</div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ display: "flex", gap: 14, marginBottom: 18, alignItems: "center" }}>
            <div style={{ width: 64, height: 64, background: i === 1 ? rgba(t.accent, 0.5) : blk, flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>{bar(90 - (i % 3) * 12, 10, ink)}{bar(55)}</div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={outer}>
      {kind === "phone" && <div style={{ width: 110, height: 8, background: soft, borderRadius: 4, margin: "0 auto 22px" }} />}
      {head}
      <div style={{ width: "100%", height: h * 0.34, background: blk, position: "relative", marginBottom: 14 }}>
        <div style={{ position: "absolute", left: 20, bottom: 20, width: "45%", height: 12, background: soft }} />
        <div style={{ position: "absolute", right: 20, top: 20, width: 42, height: 42, borderRadius: 21, background: rgba(t.accent, 0.6) }} />
      </div>
      <div style={{ display: "flex", gap: 14, marginBottom: 14 }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 26, height: 26, border: `2px solid ${ink}`, borderRadius: 13 }} />)}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 26 }}>{bar(85, 10, ink)}{bar(60)}</div>
      {head}
      <div style={{ width: "100%", height: h * 0.3, background: blk }} />
    </div>
  );
}

/* ───────── extra elements ───────── */
function El({ e, t }: { e: CanvasElement; t: Theme }) {
  const base: CSSProperties = { position: "absolute", left: e.x, top: e.y, width: e.w, height: e.h };
  const c = t.accent;
  switch (e.type) {
    case "line": return <div style={{ ...base, height: 6, background: c }} />;
    case "arrow": return <svg style={base} viewBox={`0 0 ${e.w} ${e.h}`}><line x1="0" y1={e.h / 2} x2={e.w - 8} y2={e.h / 2} stroke={c} strokeWidth="6" /><path d={`M${e.w - 34} ${e.h / 2 - 26}L${e.w - 4} ${e.h / 2}L${e.w - 34} ${e.h / 2 + 26}`} fill="none" stroke={c} strokeWidth="6" /></svg>;
    case "rectangle": return <div style={{ ...base, border: `5px solid ${c}` }} />;
    case "circle": return <div style={{ ...base, border: `5px solid ${c}`, borderRadius: "50%" }} />;
    case "highlight": return <div style={{ ...base, background: rgba(c, 0.38) }} />;
    case "number": return <div style={{ ...base, fontFamily: t.serifFont, fontSize: 170, lineHeight: 1, color: c }}>01</div>;
    case "icon": return <div style={{ ...base, fontSize: e.h, lineHeight: 1, color: c, display: "flex", alignItems: "center", justifyContent: "center" }}>✳</div>;
    case "grid": return <div style={{ ...base, backgroundImage: `radial-gradient(${rgba(c, 0.8)} 3px, transparent 3.5px)`, backgroundSize: "36px 36px" }} />;
  }
}


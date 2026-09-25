"use client";
import { Trash2, Building2, FolderOpen, LayoutDashboard, LayoutTemplate, LogIn, LogOut, Plus, SwatchBook } from "lucide-react";
import { cn } from "@/lib/cn";
import { PROJECTS } from "@/lib/mock";
import { useStudio, type View } from "@/lib/store";

const NAV: { no: string; label: string; view: View | "new"; icon: typeof Plus }[] = [
  { no: "01", label: "工作台", view: "dashboard", icon: LayoutDashboard },
  { no: "02", label: "新建 Carousel", view: "new", icon: Plus },
  { no: "03", label: "我的项目", view: "projects", icon: FolderOpen },
  { no: "04", label: "内容模板", view: "templates", icon: LayoutTemplate },
  { no: "05", label: "设计系统", view: "design-system", icon: SwatchBook },
  { no: "06", label: "品牌预设", view: "brands", icon: Building2 },
];

export default function Sidebar() {
  const { view, setView, startNew, openProject, openSaved, deleteSaved, saved, user, signOut } = useStudio();
  return (
    <aside className="sticky top-0 flex h-screen w-[248px] shrink-0 flex-col border-r border-line bg-bg2">
      <div className="px-6 pt-8 pb-9">
        <div className="font-serif text-[27px] leading-none tracking-[-0.01em]">Carousel<span className="italic text-accent-ink"> Studio</span></div>
        <div className="label mt-3 text-[10px]">内容 → 设计 → 成品</div>
      </div>

      <nav className="px-3">
        {NAV.map((n) => {
          const active = n.view !== "new" && view === n.view;
          const Icon = n.icon;
          return (
            <button key={n.no} onClick={() => (n.view === "new" ? (setView("dashboard"), window.scrollTo({ top: 0 })) : setView(n.view))}
              className={cn("t group relative flex w-full items-center gap-3 rounded-[3px] px-3 py-2.5 text-left text-[15px]",
                active ? "bg-fg/[0.06] text-fg" : "text-mute hover:bg-fg/[0.04] hover:text-fg")}>
              {active && <span className="absolute left-0 top-2 bottom-2 w-[2px] bg-accent" />}
              <span className="font-mono text-[11.5px] tracking-widest text-dim">{n.no}</span>
              <span className="flex-1">{n.label}</span>
              <Icon size={15} strokeWidth={1.5} className={cn("t", n.view === "new" ? "text-accent-ink" : "opacity-0 group-hover:opacity-60")} />
            </button>
          );
        })}
      </nav>

      <div className="mt-9 min-h-0 flex-1 overflow-y-auto px-6">
        <div className="label mb-3">最近项目</div>
        <ul className="space-y-0.5">
          {(saved.length ? saved.slice(0, 8).map((r) => ({ id: r.id, title: r.title, open: () => openSaved(r), remove: () => deleteSaved(r.id) })) : PROJECTS.slice(0, 4).map((p) => ({ id: p.id, title: p.title, open: () => openProject(p), remove: undefined as (() => void) | undefined }))).map((p) => (
            <li key={p.id} className="group/item relative">
              <button onClick={p.open} className="t -mx-2 block w-[calc(100%+16px)] rounded-[3px] px-2 py-2 pr-8 text-left text-[14px] leading-snug text-mute hover:bg-fg/[0.04] hover:text-fg">
                <span className="line-clamp-2">「{p.title}」</span>
              </button>
              {p.remove && (
                <button aria-label="删除项目" title="删除项目"
                  onClick={() => { if (window.confirm(`确定删除「${p.title}」吗？删除后无法恢复。`)) p.remove!(); }}
                  className="t absolute right-[-6px] top-1.5 flex h-7 w-7 items-center justify-center rounded-[3px] text-dim opacity-60 hover:bg-fg/[0.06] hover:text-danger hover:opacity-100 group-hover/item:opacity-100"><Trash2 size={14} /></button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-line p-4">
        {user ? (
          <>
            <div className="truncate text-[13.5px] text-mute" title={user.email}>{user.email}</div>
            <button onClick={signOut} className="t mt-2 flex items-center gap-2 text-[14px] text-dim hover:text-fg"><LogOut size={14} strokeWidth={1.5} />退出登录</button>
          </>
        ) : (
          <>
            <p className="text-[13px] leading-relaxed text-dim">项目保存在这台设备上。登录后可跨设备保存。</p>
            <button onClick={() => setView("login")} className="t mt-2 flex items-center gap-2 text-[14px] text-fg underline underline-offset-4 hover:text-accent-ink"><LogIn size={14} strokeWidth={1.5} />登录 / 注册</button>
          </>
        )}
      </div>
    </aside>
  );
}

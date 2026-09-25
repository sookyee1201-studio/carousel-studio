"use client";
import { useState } from "react";
import { ArrowRight, Paperclip, Plus, X, Zap } from "lucide-react";
import { fileToImage, type SrcImage } from "@/lib/ai";
import { Button, Chip, Label } from "@/components/ui";
import ProjectCard, { DeleteBtn, MiniStrip, StatusDot, type ProjectItem } from "@/components/carousel/ProjectCard";
import { PROJECTS } from "@/lib/mock";
import { useStudio } from "@/lib/store";
import type { ProjectStatus } from "@/lib/types";

const ago = (iso: string) => {
  const m = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  return m < 1 ? "刚刚" : m < 60 ? `${m} 分钟前` : m < 1440 ? `${Math.round(m / 60)} 小时前` : `${Math.round(m / 1440)} 天前`;
};
function useItems(): ProjectItem[] {
  const { saved, openSaved, deleteSaved, openProject } = useStudio();
  const mine: ProjectItem[] = saved.map((r) => ({
    key: r.id, title: r.title, client: r.client, format: `Carousel · ${r.pages?.length ?? 8}页`, status: r.status, edited: ago(r.updated_at),
    pages: r.pages, design: r.design, saved: true, open: () => openSaved(r), remove: () => deleteSaved(r.id),
  }));
  const samples: ProjectItem[] = PROJECTS.map((p) => ({ key: p.id, title: p.title, client: p.client, format: p.format, status: p.status, edited: p.edited, presetId: p.presetId, open: () => openProject(p) }));
  return [...mine, ...samples];
}

const FILTERS: ("全部" | ProjectStatus)[] = ["全部", "Draft", "等待内容确认", "等待设计", "已完成"];

function Filters({ value, onChange, items }: { value: string; onChange: (v: (typeof FILTERS)[number]) => void; items: ProjectItem[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((f) => (
        <Chip key={f} active={value === f} onClick={() => onChange(f)}>
          {f} <span className="ml-1 font-mono text-[12px] opacity-60">{f === "全部" ? items.length : items.filter((p) => p.status === f).length}</span>
        </Chip>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const { startNew, quickStart, setView, notify } = useStudio();
  const items = useItems();
  const [topic, setTopic] = useState("");
  const [img, setImg] = useState<SrcImage | null>(null);
  const canGo = !!topic.trim() || !!img;
  const quick = () => (canGo ? quickStart(topic.trim(), img) : notify("先输入一个主题，或者上传一张图片。"));
  const steps = () => startNew(topic.trim() || undefined, img);
  const pick = async (f?: File) => { if (!f) return; try { setImg(await fileToImage(f)); } catch { notify("这张图片读取失败，换一张试试。"); } };
  const [f, setF] = useState<(typeof FILTERS)[number]>("全部");
  const list = items.filter((p) => f === "全部" || p.status === f);
  return (
    <div className="enter mx-auto max-w-[1080px] px-12 pt-16 pb-24">
      <Label className="mb-5 text-accent-ink">Workspace</Label>
      <h1 className="text-[62px] font-semibold leading-[1.08] tracking-[-0.02em]">今天要做什么<span className="italic text-accent-ink">内容</span>？</h1>
      <p className="mt-5 max-w-[560px] text-[18px] text-mute">写下一个想法，或者传一张图。AI 帮你写好 8 页，再直接调整、导出。</p>
      <form className="mt-10 max-w-[760px] border border-fg/25 bg-card p-1.5 transition-colors duration-150 focus-within:border-fg" onSubmit={(e) => { e.preventDefault(); quick(); }}>
        <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={2} placeholder="输入一个主题或想法，或者上传一张截图 / 海报，让 AI 帮你写成 Carousel"
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) { e.preventDefault(); quick(); } }}
          className="block w-full resize-none bg-transparent px-4 pt-3.5 text-[18px] leading-relaxed outline-none placeholder:text-dim" />
        {img && (
          <div className="mx-3 mb-2 mt-1 inline-flex items-center gap-2.5 border border-line bg-bg2 py-1 pl-1 pr-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.preview} alt="" className="h-9 w-9 object-cover" />
            <span className="max-w-[240px] truncate text-[13.5px] text-mute">{img.name}</span>
            <button type="button" aria-label="移除图片" onClick={() => setImg(null)} className="t text-dim hover:text-fg"><X size={14} /></button>
          </div>
        )}
        <div className="flex items-center justify-between gap-2 px-2 pb-1.5 pt-1">
          <div className="flex items-center gap-1">
            <label className="t flex cursor-pointer items-center gap-1.5 rounded-[3px] px-2.5 py-1.5 text-[14px] text-mute hover:bg-fg/[0.05] hover:text-fg">
              <Paperclip size={14} />上传图片
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
            </label>
            <button type="button" onClick={() => setView("templates")} className="t rounded-[3px] px-2.5 py-1.5 text-[14px] text-mute hover:bg-fg/[0.05] hover:text-fg">从模板开始</button>
          </div>
          <Button variant="primary" size="lg" type="submit"><Zap size={16} strokeWidth={2} />生成 Carousel</Button>
        </div>
      </form>
      <p className="mt-3 text-[14px] text-dim">想一步步把关？<button type="button" onClick={steps} className="t ml-1 underline underline-offset-4 hover:text-fg">使用高级模式（分析 → Hook → 结构 → 视觉）</button></p>

      <section className="mt-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-[32px] font-semibold tracking-[-0.01em]">最近项目</h2>
          <Filters value={f} onChange={setF} items={items} />
        </div>
        <div className="grid grid-cols-2 gap-x-10 gap-y-14">
          {list.map((p) => <ProjectCard key={p.key} item={p} />)}
        </div>
        {!list.length && <p className="py-20 text-mute">这个状态下还没有项目。</p>}
      </section>
    </div>
  );
}

export function ProjectsView() {
  const { startNew } = useStudio();
  const items = useItems();
  const [f, setF] = useState<(typeof FILTERS)[number]>("全部");
  const list = items.filter((p) => f === "全部" || p.status === f);
  return (
    <div className="enter mx-auto max-w-[1080px] px-12 pt-16 pb-24">
      <Label className="mb-5 text-accent-ink">Projects</Label>
      <div className="flex items-end justify-between gap-6">
        <h1 className="text-[44px] font-semibold tracking-[-0.02em]">我的项目</h1>
        <Button variant="primary" onClick={() => startNew()}><Plus size={16} />新建 Carousel</Button>
      </div>
      <div className="mt-8"><Filters value={f} onChange={setF} items={items} /></div>
      <ul className="mt-10 divide-y divide-line2 border-t border-line2">
        {list.map((p) => (
          <li key={p.key} className="group relative">
            <button onClick={p.open} className="t grid w-full grid-cols-[300px_1fr_auto] items-center gap-8 py-6 pr-12 text-left hover:bg-fg/[0.02]">
              <div className="bg-bg3 p-2.5"><MiniStrip item={p} /></div>
              <div>
                <h3 className="t text-[18px] font-semibold group-hover:text-accent-ink">{p.title}</h3>
                <p className="mt-1.5 text-[13.5px] text-dim"><span className="text-mute">{p.client}</span> · {p.format}{!p.saved && " · 示例"}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5"><StatusDot status={p.status} /><span className="text-[13px] text-dim">{p.edited}</span></div>
            </button>
            {p.remove && <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-60 transition-opacity duration-150 hover:opacity-100 group-hover:opacity-100 focus-within:opacity-100"><DeleteBtn onClick={p.remove} /></div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

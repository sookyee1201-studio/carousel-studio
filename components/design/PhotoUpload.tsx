"use client";
import { ImagePlus, X } from "lucide-react";
import AiImageGen from "@/components/design/AiImageGen";
import { Button } from "@/components/ui";
import { fileToImage } from "@/lib/ai";
import { useStudio } from "@/lib/store";

/** 风格套件需要照片时使用：上传一张背景照片，所有页面共用（每页也可以在「图片」里单独换） */
export default function PhotoUpload({ compact }: { compact?: boolean }) {
  const { design, updateDesign, notify } = useStudio();
  const pick = async (f?: File) => {
    if (!f) return;
    try { const im = await fileToImage(f); updateDesign({ photo: { url: im.preview, name: im.name } }); }
    catch { notify("这张图片读取失败，换一张试试。"); }
  };
  return (
    <div className={compact ? "space-y-4" : "space-y-4 border border-line bg-card p-4"}>
      <div className="flex items-center gap-4">
        {design.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={design.photo.url} alt="" className="h-16 w-16 shrink-0 object-cover" />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-dashed border-line text-dim"><ImagePlus size={22} strokeWidth={1.3} /></div>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14.5px]">{design.photo ? design.photo.name : "这套风格需要一张背景照片"}</div>
          <div className="text-[13px] text-dim">{design.photo ? "所有页面共用这张照片" : "选一张主体清晰、光线偏暗的照片效果最好"}</div>
        </div>
        <label>
          <span className="t inline-flex h-10 cursor-pointer items-center gap-2 rounded-[3px] bg-fg px-4 text-[14.5px] font-medium text-bg hover:bg-[#3b342b]"><ImagePlus size={16} />{design.photo ? "更换图片" : "上传图片"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
        </label>
        {design.photo && <Button variant="ghost" size="sm" aria-label="移除照片" onClick={() => updateDesign({ photo: null })}><X size={14} /></Button>}
      </div>
      <AiImageGen defaultPrompt="一位创业者在咖啡店工作的生活照，暗调、电影感，柔和的窗边光线，画面留出大面积空白放文字" onDone={(url, name) => updateDesign({ photo: { url, name } })} />
    </div>
  );
}

import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";
import { toPng } from "html-to-image";
import JSZip from "jszip";
import { Slide } from "@/components/carousel/CarouselCanvas";
import type { GlobalDesign, Page } from "./types";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function renderPage(page: Page, index: number, total: number, design: GlobalDesign): Promise<string> {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-20000px;top:0;width:1080px;height:1350px;pointer-events:none";
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(createElement(Slide, { page, index, total, design, detail: true, guides: false })));
    await document.fonts.ready;
    await wait(150);
    const node = host.firstElementChild as HTMLElement;
    // first pass warms up font/image embedding, second pass is the real render
    await toPng(node, { width: 1080, height: 1350, pixelRatio: 1 }).catch(() => "");
    return await toPng(node, { width: 1080, height: 1350, pixelRatio: 1 });
  } finally {
    root.unmount();
    host.remove();
  }
}

const save = (blob: Blob, name: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
};
const toBlob = async (dataUrl: string) => (await fetch(dataUrl)).blob();
const safe = (s: string) => s.replace(/[\\/:*?"<>|\s]+/g, "-").slice(0, 40) || "carousel";

export async function exportPage(page: Page, index: number, pages: Page[], design: GlobalDesign, title: string) {
  const url = await renderPage(page, index, pages.length, design);
  save(await toBlob(url), `${safe(title)}-P${index + 1}.png`);
}

export async function exportAll(pages: Page[], design: GlobalDesign, title: string, onProgress?: (n: number) => void) {
  const zip = new JSZip();
  for (let i = 0; i < pages.length; i++) {
    const url = await renderPage(pages[i], i, pages.length, design);
    zip.file(`${safe(title)}-P${String(i + 1).padStart(2, "0")}.png`, await toBlob(url));
    onProgress?.(i + 1);
  }
  save(await zip.generateAsync({ type: "blob" }), `${safe(title)}.zip`);
}

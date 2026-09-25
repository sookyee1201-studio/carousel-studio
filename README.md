# Carousel Studio

从一个想法到一套 Carousel：输入主题（或上传图片）→ AI 写好 8 页 → 在一个页面里调整风格、版式、文字、画面 → 导出 PNG 和设计交付单。

- Next.js 16 · TypeScript · Tailwind CSS 4
- 文案与图片生成：Gemini API（服务器端调用，Key 不会发到浏览器）
- 登录与云端保存：Supabase（可选；不登录时项目保存在浏览器本地）

## 本地运行

```bash
npm install
cp .env.example .env.local   # 然后填写里面的 Key
npm run dev                  # http://localhost:3456
```

没有填 `GEMINI_API_KEY` 时，AI 功能会自动回退到示例内容，其余功能照常使用。

## 环境变量

| 变量 | 说明 |
|---|---|
| `GEMINI_API_KEY` | Gemini API Key（AI 文案与图片生成） |
| `GEMINI_MODEL` | 文案模型，默认 `gemini-3.8-flash` |
| `GEMINI_IMAGE_MODEL` | 图片模型，默认 `gemini-3.1-flash-image` |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 可选，登录与云端保存 |

Supabase 需要一张 `carousel_projects` 表（含 RLS，仅本人可读写）。

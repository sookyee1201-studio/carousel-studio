# Carousel Studio

从一个想法到一套 Carousel：输入主题（或上传图片）→ AI 写好 8 页 → 在一个页面里调整风格、版式、文字、画面 → 导出 PNG 和设计交付单。

- Next.js 16 · TypeScript · Tailwind CSS 4
- 文案与图片生成：Gemini API（服务器端调用，Key 不会发到浏览器）
- 登录：简单的单账号登录（服务器校验，只存密码哈希，登录后发带签名的 cookie）；项目保存在浏览器本地

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
| `APP_LOGIN_EMAIL` | 登录邮箱。三项登录变量都配置了，才会强制登录；没配置时（本地开发）不强制 |
| `APP_LOGIN_HASH` | 密码哈希（格式 `scrypt:盐:哈希`，生成方法见 `.env.example`），不要存明文密码 |
| `APP_SESSION_SECRET` | 签名 cookie 用的随机字符串 |

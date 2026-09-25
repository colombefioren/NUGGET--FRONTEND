<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/logo-dark.png">
  <img src="docs/logo.png" alt="Nugget" width="260">
</picture>

### ask your docs · get the nugget

A multilingual RAG interface: drop files, ask in any language, get streamed answers with citations you can click.

![Next.js](https://img.shields.io/badge/Next.js_15-18141e?style=for-the-badge&logo=nextdotjs&logoColor=FFBF2E)
![React](https://img.shields.io/badge/React_19-18141e?style=for-the-badge&logo=react&logoColor=A6DCFF)
![TypeScript](https://img.shields.io/badge/TypeScript-18141e?style=for-the-badge&logo=typescript&logoColor=CCBAFF)
![Tailwind](https://img.shields.io/badge/Tailwind-18141e?style=for-the-badge&logo=tailwindcss&logoColor=A6F0CE)
![Motion](https://img.shields.io/badge/Motion-18141e?style=for-the-badge&logo=framer&logoColor=FF48A0)

**Frontend** · [Backend →](https://github.com/colombefioren/NUGGET--BACKEND)

<img src="docs/home.jpg" alt="Nugget home screen" width="100%">

<table><tr>
<td><img src="docs/answer-light.jpg" alt="Answer with sources, light"></td>
<td><img src="docs/answer-dark.jpg" alt="Answer with citations, dark neon"></td>
</tr></table>

</div>

## ✦ What's inside

- **Streaming answers** over SSE, with a live pipeline tracker (rewrite → search → write)
- **Clickable `[n]` citations**: hover to preview, click to jump to the exact passage
- **Library**: drag-and-drop anywhere, paste text, choose which docs to search
- **Local-first**: chats, library, scope, theme and language live in `localStorage`, and any chat exports to Markdown
- **9 languages** (EN FR ES DE PT IT 日本語 中文 العربية) with full RTL
- **Pastel neon brutalism**: ink outlines, hard shadows, neon glow in dark mode, spring animations, responsive down to phones

## ✦ Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

Needs the [Nugget API](https://github.com/colombefioren/NUGGET--BACKEND) running. `/api/*` is proxied to `NUGGET_API_URL` (default `http://localhost:8000`).

## ✦ Keys

`/` focus · `Ctrl/⌘ K` new chat · `Esc` stop · `Shift ⏎` new line

<div align="center"><sub>made with 🟡 by <a href="https://github.com/colombefioren">colombefioren</a></sub></div>

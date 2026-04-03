# CLAUDE.md

## 项目信息

**GOSIM Agentic Hackathon 2026 — Paris**

前端站点源码，Vue 3 + TypeScript + Vite。

## 双仓库同步

Push 时同时推送到：
- `mofa-org/paris-hackathon-site` (origin)
- `gosimfoundation/paris-hackathon` (origin 第二 pushurl)

```bash
git push origin main
```

## 部署

- **gh-pages**: `npx gh-pages -d dist -r git@github.com:gosimfoundation/paris-hackathon.git -b gh-pages`
- **macmini**: `rsync -avz dist/ macmini:~/gosim-hackathon/dist/`

## 后端

- API: `https://paris.mofa.ai/api/`
- 后端在 macmini: `~/gosim-hackathon/server.js`

## 常用

```bash
npm run dev          # 开发
GHPAGES=gosim npm run build  # 构建 (base=/)
npx vite build       # 构建 (base=/)
```

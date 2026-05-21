# 满满代码站

一个给代码新手使用的学习卡片库，用来记录开发术语、常用命令、按钮含义和踩坑经验。

## 本地开发

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

构建产物会输出到 `dist`，可用于 GitHub Pages 或其他静态站点托管。

## GitHub Pages

项目已经将 Vite 的 `base` 设置为 `./`，适合部署到 GitHub Pages 的子路径。推送到 GitHub 后，可以用 GitHub Actions 或手动上传 `dist` 目录完成部署。

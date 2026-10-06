#!/usr/bin/env node
// 由 web/artifact.html（Claude Artifact 内容版）重建 web/index.html（独立可部署版）。
// 用法：node scripts/build-index.mjs
// 原理：Artifact 内容版没有 doctype/head/body 外壳（发布时平台包裹）；
// 独立版需要外壳 + 字体 + 基础 reset。此脚本把 <title> 提到 <head>，其余放进 <body>。
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = readFileSync(join(root, "web/artifact.html"), "utf8");

const m = src.match(/<title>[\s\S]*?<\/title>/);
const title = m ? m[0] : "<title>欧洲硕士规划台</title>";
const body = src.replace(title, "").replace(/^\n+/, "");

const out = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${title}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600;700&family=Noto+Serif+SC:wght@600;700&display=swap">
<style>:root{padding:env(safe-area-inset-top,0) 0 env(safe-area-inset-bottom,0);color-scheme:light}body{margin:0;background:#f5f6f8}img{max-width:100%}[hidden]{display:none!important}</style>
</head>
<body>
${body}
</body>
</html>
`;

writeFileSync(join(root, "web/index.html"), out);
console.log("web/index.html rebuilt from web/artifact.html (%d bytes)", Buffer.byteLength(out));

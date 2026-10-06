# PACKAGE_MANIFEST.md — 打包清单

- **Package**: europe-master-agent-audit-v0.1.0.zip
- **Created**: 2026-10-06
- **Project Size (unpacked)**: 220K (150968 bytes)
- **File Count**: 17（不含 .git / dist）
- **Main Entry**: `web/index.html`（独立可部署版）；`web/artifact.html`（Claude Artifact 内容版，唯一逻辑文件）
- **Run Command**: 无需命令——浏览器直接打开 `web/index.html`。完整联网体验需在 claude.ai 发布 `web/artifact.html` 为 Artifact 并连接 Parallel Search 连接器（见 HANDOFF.md §7）。
- **Build Command**: 无构建系统。可选：`node scripts/build-index.mjs`（由 artifact.html 重建 index.html）；`node --check`（脚本语法检查，已通过）。
- **Environment Variables**: 无（见 .env.example）。连接器鉴权在 claude.ai 侧，不经过本仓库。
- **Current Version**: v0.1.0（Prototype / MVP）

## Known Critical Issues
- 无（无密钥泄露、无固化虚构数据）。

## Known High Issues
1. 关键字段核实依赖 LLM 自律 + 有限工具轮数，**无程序级证据强制**（DATA_RISK 风险 1）。
2. 确定性业务引擎（Eligibility / Cost / Risk / Portfolio / Timeline / Document Checklist）全部 **MISSING**。
3. LLM 返回无 schema 校验；无类型系统；无自动化测试。
4. 5 条用户流程未在打包环境端到端实测（需连接器与用户额度）。

## Known Medium Issues
- tier（冲刺/匹配/保底）为 LLM 定性判断，无可追溯依据。
- 知识库少数具体政策声明缺内联来源与核实日期。

## Demo Data
- **NO 固化招生数据**（仓库内 0 条学校/项目数据）。仅表单 placeholder 为输入示例；运行时数据由联网生成。

## Production Ready
- **NO** —— 定位为可交接、可运行、可审计的 MVP / 原型，不可直接用于真实申请决策（未核实字段须自行到官网确认）。

## Secret Check
- **PASS** —— 全量扫描未发现任何真实 API Key / Token / Password / 凭证。

## Contents Excluded From ZIP
- .git、dist、node_modules（不存在）、.DS_Store、构建/缓存/临时/日志、真实环境变量（均无或已排除）。

# HANDOFF.md — 交接说明（给下一位 AI / 开发者）

你拿到的是一个**欧洲研究生留学智能决策助手**的早期原型（v0.1.0）。请先读本文件，再按需要看其他文档。

---

## 1. 这个项目是什么
一个**单页 Web 应用（Artifact）**：用户填本科背景/成绩/预算/目标，页面调用联网搜索核对大学官网，直接输出约 5 套留学方案 + 横向对比 + 差异分析。灵魂是**反幻觉**：事实尽量核到官网并给来源，核不到就标「需核实」。

## 2. 当前做到哪里
- ✅ 完整交互表单、持久化、主题、容错、降级。
- ✅ 联网核查式生成（`sample` + `mcp`/Parallel Search，页面内 Claude 带 `web_search`/`web_fetch`）。
- ✅ 方案卡片 + 对比表 + 差异分析 + 来源链接 + 核实状态徽章。
- ❌ 确定性业务引擎（Eligibility / Cost / Risk / Portfolio / Timeline）全部 **MISSING**。
- ❌ 无类型系统、无 LLM 返回校验、无测试、无后端。
详见 `PROJECT_MAP.md` 与 `AUDIT_REPORT.md`。

## 3. 哪些是真的 / 哪些只是 Demo
- **真的（运行时）**：方案里的学费/门槛/截止等，是 LLM 联网核实后生成的——**成功与否因运行而异**，带 `verified` 状态与来源链接。
- **Demo**：表单 `placeholder`（如「武汉大学」「数据科学」）只是输入示例，不是结果数据。
- **方法论（非事实）**：`knowledge/*.md` 是国家体系常识，**不可当作逐校事实**，顶部已声明必须联网核实。
- **仓库内没有任何内置招生数据库**（0 条固化数据）。

## 4. 哪些地方有风险
见 `DATA_RISK.md`。最重要一条：**关键字段的核实依赖 LLM 自律 + 有限工具轮数，没有程序级证据强制**（风险 1，High）。tier（冲刺/匹配/保底）是 LLM 定性判断，不是计算结果（风险 2）。

## 5. 下一步最该做什么
按 `FUTURE_ARCHITECTURE.md` 的阶段 2 推进：
1. **证据强制 + LLM 返回 schema 校验**（关键字段无 A/B 来源即降级为「需核实」）。
2. **Eligibility Engine**（确定性判定「我能不能申请这个项目」，输出 ELIGIBLE/UNCERTAIN/… + 原因）。
3. 给知识库具体政策声明补来源与核实日期。
（完整 10 项见 README 的 Roadmap 与审计报告。）

## 6. 哪些文件最重要
- **程序逻辑**：`web/artifact.html`（唯一逻辑文件；读它就懂整个应用）。`web/index.html` 是它的独立可部署版（同源生成）。
- **方法论/反幻觉**：`prompts/system_prompt_zh.md`、`knowledge/anti_hallucination_rules.md`。
- **文档**：本 HANDOFF + PROJECT_MAP + AUDIT_REPORT + FUTURE_ARCHITECTURE + DATA_RISK。

## 7. 如何运行
- **只看确定性前端**：浏览器直接打开 `web/index.html`。表单、排序、持久化、主题、复制、渲染都能用；联网生成按钮会因 `window.claude` 不存在而自动禁用并提示用「备用」。
- **完整联网核查体验**（必须在 claude.ai）：
  1. 在 claude.ai 把 `web/artifact.html` 发布为 Artifact（声明 `capabilities: {sample:{}, mcp:{servers:[{server:"Parallel Search", tools:["web_search","web_fetch"]}]}}`）；
  2. 在 claude.ai「设置 → 连接器」连接 **Parallel Search**（免费、免 API key）并在该对话启用；
  3. 打开页面、填表、点「生成联网核查方案」，首次会请你授权。
- **无需** `npm install`：没有依赖、没有构建。`node` 仅用于可选的语法检查（`node --check`）。

## 8. 如何继续开发
- 短期：直接在 `web/artifact.html` 内迭代（单文件，`node --check` 校验脚本语法；在 claude.ai 重新发布同一文件到同一 URL 即更新）。记得同步用它重新生成 `web/index.html`（见下）。
- 中期：按 FUTURE_ARCHITECTURE 迁到 Vite + TypeScript + 组件化，把引擎层抽成可测试模块，保留一个「Artifact 导出」目标以继续在 claude.ai 运行。

### 保持两个 HTML 同步的方法
`web/index.html` = `web/artifact.html` 的内容 + 标准 HTML 外壳。改完 `artifact.html` 后用同样方式重建 `index.html`（取其 `<title>` 放进 `<head>`，其余放进 `<body>`，并补 doctype/charset/viewport/字体/reset）。本仓库此前即以此法生成，接手后建议写成一个小脚本固化。

## 9. 绝对不要做的事
- 不要编造学校/项目/学费/截止/门槛/录取率，不要把 Demo 当真实数据。
- 不要删除你无法确认是否有用的文件。
- 不要为「看起来高级」加没有依据的复杂算法或假概率。
- 不要把任何真实密钥提交进仓库（当前为 0，保持住）。

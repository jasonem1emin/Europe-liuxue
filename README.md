# 欧洲研究生留学智能体 🎓🇪🇺

一个根据**本科院校、专业、GPA、语言、预算、目标**给出**真实可行**欧洲硕士方案的智能决策助手。核心是**反幻觉**：事实（学费/门槛/截止）尽量联网核实到大学官网并给出来源，核实不到的一律标注「需核实」。

> 版本 v0.1.0 · 形态：单页 Web Artifact 原型 / MVP。详细审计见 `AUDIT_REPORT.md`，交接见 `HANDOFF.md`。

---

## Project · 项目介绍
用户填写背景后，页面调用联网搜索逐条核对大学官网，直接在网页内输出约 **5 套方案**（覆盖冲刺/匹配/保底）、一张**横向对比表**与**差异分析**。配套还有可复制的系统指令与方法论知识库。

## Features · 当前功能
- 交互式背景采集表（院校/层次/专业/GPA+口径/语言/GRE/目标国家/跨专业/入学/预算/奖学金/软背景/**优先级排序**）。
- 本地草稿持久化（`localStorage`）、深浅色主题、移动端适配、键盘可达。
- **联网核查式方案生成**：页面内 Claude 带 `web_search`/`web_fetch` 工具核对官网 → 结构化输出 5 套方案 + 画像 + 对比表 + 差异分析，带**来源链接**与**核实状态徽章**、实时工具活动日志。
- 完整容错与降级：连接器错误按码分支；不可用时「备用」一键复制指令到任意联网 Claude 手动跑。

## Tech Stack · 技术栈
- 纯前端：**原生 HTML/CSS/JavaScript，无框架、无构建**。
- 运行时能力（仅 claude.ai Artifact 内）：`sample`（页面内调用 Claude）+ `mcp`（调用 **Parallel Search** 连接器）。
- 外部库：仅 DOMPurify（CDN，用于净化 AI 返回的 markdown）。
- 无 `package.json`、无 `node_modules`、无后端、无数据库。`node` 仅用于可选语法检查。

## Installation · 安装
无需安装依赖。获取代码即可：
```
git clone <repo> && cd Europe-liuxue
```

## Development · 开发
- 快速预览确定性前端：浏览器打开 `web/index.html`（联网生成功能需 claude.ai 环境，本地会自动禁用并提示用「备用」）。
- 语法检查（可选，需 node）：`node --check` 内联脚本（见 `scripts/build-index.mjs` 亦可重建 index）。
- 同步两个 HTML：改 `web/artifact.html` 后运行 `node scripts/build-index.mjs` 重建 `web/index.html`。
- 完整联网体验：在 claude.ai 发布 `web/artifact.html` 为 Artifact（声明 `sample` + `mcp`/Parallel Search 能力），连接并启用 Parallel Search 连接器，再填表生成。详见 `HANDOFF.md §7`。

## Environment Variables · 环境变量
**当前不需要任何环境变量或密钥**（见 `.env.example`）。连接器鉴权在 claude.ai 账号侧完成，不经过本仓库。仓库内无任何密钥。

## Project Structure · 目录结构
```
Europe-liuxue/
├── web/
│   ├── artifact.html        # 唯一程序逻辑文件（Claude Artifact 内容版）
│   └── index.html           # 独立可部署版（由 artifact.html 同源生成）
├── prompts/
│   ├── system_prompt_zh.md  # 完整系统指令
│   └── one_paste_prompt_zh.md # 一键复制版指令
├── knowledge/
│   ├── anti_hallucination_rules.md  # 反幻觉核查规则
│   └── europe_country_guide.md      # 欧洲国家体系方法论（非事实数据）
├── templates/
│   └── intake_form_zh.md    # 背景采集表
├── .claude/skills/eu-master-advisor/SKILL.md  # Claude Code skill
├── scripts/build-index.mjs  # 由 artifact.html 重建 index.html
├── README.md / PROJECT_MAP.md / AUDIT_REPORT.md
├── FUTURE_ARCHITECTURE.md / DATA_RISK.md / HANDOFF.md
├── CHANGELOG.md / PACKAGE_MANIFEST.md / .env.example
```

## Current Limitations · 当前限制
- 关键字段核实依赖 LLM 自律 + 有限工具轮数，**无程序级证据强制**（见 `DATA_RISK.md`）。
- 「冲刺/匹配/保底」为 LLM 定性判断，非计算结果；**未引入任何录取概率**（刻意为之）。
- 确定性业务引擎（Eligibility / Cost / Risk / Portfolio / Timeline / Document Checklist）**均 MISSING**。
- 无 TypeScript、无 LLM 返回 schema 校验、无自动化测试、无后端。
- 联网生成仅在 claude.ai + 已连接 Parallel Search 时可用；5 条用户流程尚未端到端实测。

## Roadmap · 未来规划（摘要，详见 FUTURE_ARCHITECTURE.md）
1. 证据强制 + LLM 返回 schema 校验。
2. Eligibility Engine（确定性资格判定 + 原因）。
3. 证据分级 A/B/C/D，关键结论要求 A/B。
4. Cost Engine（结构化年度成本，最低/现实/舒适三档）。
5. Admission Strength 定性分级（不伪造概率）。
6. Application Portfolio 自动配平（Reach/Target/Safety）。
7. Timeline 倒推与提醒。
8. Document Checklist 生成。
9. 知识库补来源与核实日期。
10. 迁移到 Vite+TypeScript+组件化 + 引入测试/CI。

## ⚠️ Important Warning · 重要警告
**本系统中出现的学校 / 项目 / 学费 / 语言要求 / 截止日期等信息，若未经官方来源（大学官网 / 招生简章）核实，一律不得直接用于真实申请决策。** 标注「需核实」的字段必须由用户自行到官网最终确认。本工具仅提供决策参考，不承诺任何录取结果。

# CHANGELOG

## v0.1.0 — 2026-10-06

- **Current Status**: Prototype / MVP（单页 Web Artifact）

### Completed
- 交互式背景采集表（院校/专业/GPA/语言/预算/目标/优先级排序），`localStorage` 持久化，深浅色主题。
- 反幻觉方法论资产：`prompts/`（系统指令 + 一键复制版）、`knowledge/`（反幻觉规则 + 国家体系速查）、`templates/`（采集表）、`.claude/` skill。
- 联网核查式方案生成：通过 Claude Artifact 的 `sample` + `mcp`(Parallel Search) 能力，页面内 Claude 带 `web_search`/`web_fetch` 工具核对官网，直接输出约 5 套方案 + 画像 + 客户端对比表 + 差异分析，带来源链接与核实状态徽章，含实时工具活动日志。
- 完整容错：连接器错误按错误码分支、未连接/未授权降级到「备用」复制指令。
- 审计与交接文档：PROJECT_MAP / AUDIT_REPORT / FUTURE_ARCHITECTURE / DATA_RISK / HANDOFF / PACKAGE_MANIFEST，`.env.example`。

### Known Issues
- 关键字段核实依赖 LLM 自律 + 工具轮数，**无程序级证据强制**（DATA_RISK 风险 1，High）。
- 「冲刺/匹配/保底」为 LLM 定性判断，无可追溯依据（风险 2）。
- 知识库少数具体政策声明缺内联来源与核实日期（风险 3）。
- 无 TypeScript、无 LLM 返回 schema 校验、无自动化测试。
- Eligibility / Cost / Risk / Portfolio / Timeline / Document Checklist 等引擎 **MISSING**。
- 联网生成仅在 claude.ai Artifact + 已连接 Parallel Search 时可用；本地直接打开仅有确定性前端。
- 5 条用户流程**未在本环境端到端实测**（需连接器与用户额度），交接后应优先验收。

### Next
- 实现证据强制与 LLM 返回 schema 校验（最高优先）。
- 落地 Eligibility Engine（确定性资格判定）与证据分级 A/B/C/D。
- 给知识库具体政策声明补来源与 `last_verified`。

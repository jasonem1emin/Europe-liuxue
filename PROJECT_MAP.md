# PROJECT_MAP.md — 项目地图

> 本文件基于对仓库真实代码的逐文件扫描编写，不含猜测。扫描日期：2026-10-06。
> 判断依据：`web/artifact.html`（唯一的程序逻辑所在）、`prompts/`、`knowledge/`、`templates/`、`.claude/`。

---

## 1. 项目定位

**欧洲研究生留学智能决策助手（当前形态：单页 Web Artifact 原型）。**

它根据用户的本科背景、成绩、预算与目标，**调用联网搜索核对大学官网**，在网页内直接输出约 5 套留学方案，并给出横向对比与差异分析。核心设计原则是**反幻觉**：事实（学费/门槛/截止）必须尽量核实到官网并给出来源，核实不到的一律标注「需核实」。

**它现在不是什么**（避免误解）：
- 不是 React/Vue/Next.js 工程，没有构建系统、没有 `package.json`、没有 `node_modules`。
- 没有内置的学校/项目数据库（CSV/JSON 数据文件为 0）。所有项目数据都是**运行时实时联网获取**的。
- 没有确定性的打分/录取概率算法。方案与「冲刺/匹配/保底」定位均由大模型（LLM）判断产生，不是计算得出。
- 没有后端、没有数据库、没有用户账户（仅浏览器 `localStorage` 存草稿）。

---

## 2. 当前已实现的功能（依据真实代码）

**交互式背景采集表**（`web/artifact.html` 表单区）：
- 本科院校全名、院校层次（下拉）
- 本科专业、GPA/均分 + 制式（百分/4.0/4.5）+ 算法（算术/加权）
- 语言考试类型 + 成绩 + 计划考试时间；GRE/GMAT
- 目标国家（多选 chips，含「帮我推荐」）、目标专业方向、是否跨专业
- 入学时间、长期目标（单选 chips）
- 预算涵盖/金额/币种、奖学金需求
- 软背景（自由文本）
- **优先级排序**（7 项，↑↓ 键盘可达重排）

**本地持久化**：表单与选择用 `localStorage`（key `eu-advisor-v2`）保存，刷新不丢；读写全部包在 try/catch 中。

**主题切换**：浅/深色，通过 `data-theme` 覆盖，默认跟随系统。

**联网核查式方案生成**（核心，依赖 Claude Artifact 运行时能力）：
- 使用 `sample` 能力在页面内调用 Claude；
- 通过 `mcp` 能力调用用户连接的 **Parallel Search** 连接器，向 Claude 暴露两个工具：`web_search`（找官网）、`web_fetch`（读官网核实）；
- 产出结构化 JSON：`profile`（竞争力画像）、`recommended_countries`、`plans[5]`（每个含学校/项目/学位/语言门槛/学费/生活费/申请要求/截止/定位/适配理由/来源URL/核实状态）、`analysis`（差异分析）；
- 页面渲染：画像块、推荐国家、5 张方案卡片（定位徽章 + 核实状态徽章 + 来源链接）、**客户端根据方案数据生成的横向对比表**、差异分析（markdown）；
- **实时工具活动日志**：显示「正在搜索…/正在核对官网…」。

**降级与容错**：
- 检测 `sample`/`mcp` 是否可用，不可用时顶部红点提示并展开「备用」；
- 连接器错误按错误码分支（未连接/需重连/未授权/限流等），给出具体修复提示，而非笼统报错；
- 「备用」：一键复制一份带反幻觉铁律的指令，拿去任意联网 Claude 手动运行。

**配套方法论资产**（非程序，供人与 LLM 参考）：
- `prompts/system_prompt_zh.md`、`prompts/one_paste_prompt_zh.md`
- `knowledge/anti_hallucination_rules.md`、`knowledge/europe_country_guide.md`
- `templates/intake_form_zh.md`
- `.claude/skills/eu-master-advisor/SKILL.md`（Claude Code 可触发的 skill）

---

## 3. 尚未实现的功能（明确标注 MISSING）

- **MISSING** 确定性 Eligibility Engine（逐项判断「我能不能申请」：学位/专业/ECTS/数学/统计/编程/语言/GPA/截止/其他限制）。当前仅靠 LLM 在提示词约束下尽力判断。
- **MISSING** 内置可追溯的学校/项目数据库（带 Source URL / Last Verified 字段）。当前 0 条内置数据。
- **MISSING** 本科课程/先修课匹配（ECTS、数学、统计、编程等课程级校验）。
- **MISSING** 结构化成本模型（学费 + 注册费 + 房租 + 餐饮 + 保险 + 交通 + 签证资金 + 其他 = 年度估算；最低/现实/舒适三档）。
- **MISSING** 录取风险引擎 / Application Strength 量化（当前只有 LLM 贴的「冲刺/匹配/保底」文字标签）。
- **MISSING** 申请组合自动配平（Reach 2–3 / Target 4–6 / Safety 2–3 的数量与预算约束）。
- **MISSING** 时间线倒推与提醒（语言/材料/推荐信/网申/认证/签证/住宿）。
- **MISSING** 文书清单（Document Checklist）生成。
- **MISSING** 代码层面的证据等级（A/B/C/D）强制机制。当前仅有 LLM 自报的 `verified` 文本字段 + 来源链接，未做强制校验。
- **MISSING** 自动化测试、CI、构建流程。
- **MISSING** 后端/数据库/用户账户/多设备同步。

---

## 4. 项目架构（实际）

当前是**纯前端单页 + 运行时 LLM/连接器**，没有自建后端：

```
用户在表单输入背景
        ↓
前端（web/artifact.html，原生 JS，无框架）
        ↓  组装 background 文本 + 生成提示词
Claude（sample 能力，运行在 claude.ai Artifact 运行时内）
        ↓  带 web_search / web_fetch 两个工具
Parallel Search 连接器（mcp 能力，用户在 claude.ai 连接）
        ↓  web_search 找官网 → web_fetch 读官网核实
Claude 综合后返回结构化 JSON（5 套方案 + 画像 + 对比）
        ↓
前端渲染：方案卡片 + 对比表 + 差异分析 + 来源链接 + 核实徽章
```

要点：
- **数据不在仓库里**，而是运行时从网络获取；仓库里的 `knowledge/*.md` 只是**方法论**（国家体系常识 + 反幻觉规则），不是事实数据源。
- 整条「联网核查」链路**只在 claude.ai 的 Artifact 环境中、且用户已连接 Parallel Search 时可用**。本地直接打开 `index.html` 时 `window.claude` 不存在，联网生成功能会优雅禁用，仅保留表单 + 「备用」复制指令。

---

## 5. 关键文件说明

| 文件 | 作用 |
|---|---|
| `web/artifact.html` | **唯一的程序逻辑文件**。Claude Artifact 的内容版（无 `<!doctype>`/`<head>`/`<body>` 外壳，发布时由平台包裹）。含全部 CSS、表单、状态管理、`sample`+`mcp` 调用、渲染与容错逻辑。约 598 行。 |
| `web/index.html` | **同一内容的独立可部署版**：由 `artifact.html` 的内容加上标准 HTML 外壳（doctype/head/字体/reset）生成，可本地双击或静态托管打开。两者正文逻辑一致，由同一源生成。 |
| `prompts/system_prompt_zh.md` | 完整系统指令：角色、5 条反幻觉铁律、需收集的输入、工作流程、输出卡片格式、边界。 |
| `prompts/one_paste_prompt_zh.md` | 一键复制版指令，贴进任意联网模型即可用。 |
| `knowledge/anti_hallucination_rules.md` | 反幻觉核查规则：哪些字段必须联网核实、来源标注规范、自检清单。 |
| `knowledge/europe_country_guide.md` | 欧洲各国留学体系**方法论速查**（结构性常识，非事实数据；文件顶部有时效性警告）。 |
| `templates/intake_form_zh.md` | 背景信息采集表（markdown 版，供离线填写）。 |
| `.claude/skills/eu-master-advisor/SKILL.md` | Claude Code skill 定义，描述触发条件与启动步骤（读取上述 prompts/knowledge）。 |
| `README.md` | 项目说明与使用方式。 |

> 给接手者：要理解程序，**只需读 `web/artifact.html` 一个文件**；要理解方法论与反幻觉设计，读 `prompts/` 与 `knowledge/`。其余为文档与配套资产。

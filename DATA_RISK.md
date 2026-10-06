# DATA_RISK.md — 数据与幻觉风险清单

> 扫描日期：2026-10-06。目标：找出虚构/无来源/可能过期/可能把推断当事实的风险点。
> 重要事实：**本仓库没有任何内置学校/项目数据文件**（0 条 CSV/JSON 数据）。因此「内置假数据」类风险基本不存在；主要风险来自**运行时 LLM 生成**与**知识库中的少量具体政策声明**。

数据性质说明：
- **DEMO_DATA**：表单里的 `placeholder`（如「武汉大学」「数据科学」）——纯属输入示例，不是招生数据，不会被当作结果展示。
- **运行时数据**：方案中的学费/门槛/截止等，由 LLM 联网核实后生成，**不在仓库内**。
- **方法论数据**：`knowledge/*.md` 为国家体系常识，非逐校事实。

---

## 风险 1 — 运行时关键字段可能未经官网核实却显示得像事实
- 问题描述：工具调用轮数有限，一次生成里 LLM 未必能把 5 个项目的每个字段都核实到官网；未核实字段虽要求标「需核实」，但模型可能遗漏或给出貌似确定的值。
- File：`web/artifact.html`（`genPrompt()` / `sample.json` 调用 / `renderResult()`）
- Current Behavior：每方案带 `verified`（官网已核实/部分核实/未核实）与 `source` 链接；页面结尾与卡片均提示自行到官网确认。但 `verified` 由 **LLM 自报**，无程序强制校验。
- Risk Level：**High**
- Recommended Fix：实现**证据强制**（FUTURE_ARCHITECTURE §4）：关键字段无 A/B 级来源时，代码层强制降级为「需核实」并视觉弱化；对 LLM 返回做 schema 校验。

## 风险 2 — 「冲刺/匹配/保底」是 LLM 定性判断，无依据可追溯
- 问题描述：tier 标签看起来是结论，实际无评分依据，可能误导用户当成客观定位。
- File：`web/artifact.html`（`plans[].tier` 渲染）
- Current Behavior：直接展示文字标签；未标注「这是 AI 定性判断」。
- Risk Level：**Medium**
- Recommended Fix：UI 上标注 tier 为「AI 判断」；未来由 Eligibility + Admission Strength 引擎支撑（FUTURE_ARCHITECTURE §3/§5）。不要引入假概率。

## 风险 3 — 知识库含具体政策声明但缺内联来源与核实日期
- 问题描述：`knowledge/europe_country_guide.md` 中有具体政策/数字声明，可能随政策变动而过期。
  典型：第 11 行「德国毕业后 18 个月找工作签证」；第 7 行「公立多数免学费」；第 41 行「爱尔兰 Stay Back 工签」；第 29 行「挪威历史上免费但政策已变」；第 45–46 行「意大利 ISEE 分级 / DSU 减免」。
- File：`knowledge/europe_country_guide.md`
- Current Behavior：文件顶部已声明「必须联网核实当年官网数据，不得当作事实报给用户」；但上述具体声明无逐条来源链接与 `last_verified` 时间戳。
- Risk Level：**Medium**
- Recommended Fix：给每条具体政策声明加「需核实 + 建议官方来源（如 DAAD / 各国移民局）」标注，或移出「事实」语气改为「趋势/方法论」措辞，并加文件级 `last_reviewed` 日期。

## 风险 4 — LLM 返回 JSON 无 schema 校验
- 问题描述：若 LLM 返回缺字段/类型异常/plans 非数组，渲染可能出现空字段或退化显示。
- File：`web/artifact.html`（`renderResult()` 前仅判断 `data.plans || data.profile`）
- Current Behavior：有基本兜底（非预期结构则显示原文 `<pre>`）；字段级缺失显示为空或「需核实」默认。
- Risk Level：**Low–Medium**
- Recommended Fix：引入 zod/valibot 校验，非法结构不作为方案展示，提示重试。

## 风险 5 — 连接器未连接/不可用时用户可能误以为「已联网核实」
- 问题描述：若 Parallel Search 未连接，联网链路不可用；若用户改用「备用」复制指令到无联网模型，可能得到未核实结果却不自知。
- File：`web/artifact.html`（连接器状态检测 / `connectorHelp()` / 备用区文案）
- Current Behavior：页面顶部红点提示、错误码分支提示连接步骤；备用指令本身要求模型联网核实。已做较完整提示。
- Risk Level：**Low**
- Recommended Fix：在「备用」区增加一行醒目提示「仅在能联网的模型中运行，否则结果不可信」。

---

## 幻觉清单逐项核对（当前仓库静态层面）

| 潜在幻觉类型 | 仓库内是否存在固化的虚构内容 | 说明 |
|---|---|---|
| 虚构学校 | 否 | 无内置学校数据 |
| 虚构项目 | 否 | 无内置项目数据 |
| 虚构学费 | 否（仅 `€X` 占位示例） | 见 anti_hallucination_rules 第 23–24 行，是模板占位 |
| 虚构 Deadline | 否 | 无内置截止数据 |
| 虚构语言要求 | 否 | 无内置门槛数据 |
| 虚构 GPA 要求 | 否 | 无内置门槛数据 |
| 虚构录取率 | 否 | **刻意未引入任何录取概率** |
| 虚构就业率 | 否 | 无就业率数字 |
| 虚构奖学金 | 否（仅方法论提及「如瑞典 SI 奖学金，竞争激烈」） | 属常识级方法论，建议加来源 |
| 虚构课程要求 | 否 | ECTS/先修课程校验本就 MISSING，未固化任何虚构要求 |

**结论**：仓库**静态内容层面无固化的虚构招生数据**。真正的幻觉风险在**运行时生成**（风险 1/2）与**知识库少数具体政策声明**（风险 3）。最该优先修的是**风险 1（证据强制）**。

# FUTURE_ARCHITECTURE.md — 未来架构设计

> 本文件是**设计蓝图**，不是已实现功能。它描述把当前原型发展为「可用、可验证、可扩展」系统的目标结构。
> 原则：先补**确定性引擎 + 证据强制**，再谈复杂模型；任何关键结论都必须可追溯到证据；不伪造概率。

---

## 0. 现状 → 目标 的差距一句话

当前：`表单 → LLM(带联网工具) → 5 套方案`，业务判断全在 LLM 自然语言里。
目标：把「能不能申请」「花多少钱」「风险多大」「组合怎么配」从 LLM 的脑子里**抽出来变成可检查的引擎**，LLM 退化为「检索 + 解释」的角色，结论由引擎 + 证据支撑。

---

## 1. 目标分层架构

```
用户画像 (Profile)
   ↓  Profile Engine         —— 规范化背景：院校层次、GPA 口径换算、ECTS 估算、语言等级
Eligibility Engine           —— 逐条判定「我能不能申请这个项目」（见 §3）
   ↓
Program Retrieval            —— 检索候选项目（联网 + 未来可选的缓存库）
   ↓
Evidence Verification        —— 对每条关键字段核实到官网，打证据等级 A/B/C/D（见 §4）
   ↓
Academic Matching            —— 本科专业/课程/ECTS 与项目先修要求的结构化匹配
   ↓
Cost Engine                  —— 结构化年度成本模型（见 §6）
   ↓
Admission Risk Engine        —— Application Strength / Risk 定性分级（见 §5，不伪造概率）
   ↓
Career Fit Engine            —— 就业/移民契合（工签政策、行业聚集、语言门槛）
   ↓
Multi-objective Recommendation —— 在预算/风险/偏好/国家多目标下排序与取舍
   ↓
Application Portfolio        —— 自动配平 Reach/Target/Safety（见 §7）
   ↓
Timeline                     —— 倒推时间线与提醒（见 §8）
   ↓
Document Checklist           —— 按国家/项目生成材料清单
```

每一层的输入/输出应是**结构化对象**（建议 TypeScript 类型 + 运行时 schema 校验，如 zod），而不是自由文本，这样每一步都可测试、可追溯。

---

## 2. Profile Engine（用户画像）

职责：把原始表单变成规范画像。
- GPA 口径：百分制/4.0/4.5 之间的**显式换算规则**（并保留原值 + 换算说明，不隐藏假设）；
- 院校层次 → 用于说明「在不同国家体系中的分量」（德国偏课程匹配、英国看院校 list）；
- 本科课程 → 估算已修 ECTS / 是否覆盖数学·统计·编程（初期可由用户勾选或上传成绩单，后期可解析）；
- 语言：换算到 CEFR 等级，便于与项目门槛比对。

---

## 3. Eligibility Engine（最关键，优先做）

未来系统必须能回答「**我能不能申请这个项目**」，而不是「这个学校适不适合我」。

```
Eligibility
├── Degree Requirement        学位要求（本科/同等学力）
├── Subject Requirement       专业/背景要求（是否接受本专业、相关专业、跨专业）
├── ECTS Requirement          学分要求（总量 / 特定领域学分）
├── Mathematics Requirement   数学先修
├── Statistics Requirement    统计先修
├── Programming Requirement   编程先修
├── Language Requirement      语言门槛（含分项小分）
├── GPA Requirement           均分门槛
├── Deadline                  截止（是否分轮/是否已过）
└── Other Restrictions        其他（国籍/配额/面试/作品集/工作年限等）
```

**输出（每条 + 总体）**：
```
ELIGIBLE          满足
LIKELY_ELIGIBLE   很可能满足（有少量不确定）
UNCERTAIN         无法判定（官网未明确 / 证据不足）
LIKELY_INELIGIBLE 很可能不满足
INELIGIBLE        明确不满足
```
**强制要求**：每条判定必须附**原因**与**证据等级**。任一硬性条件为 `INELIGIBLE` → 整体不得标为可申请；关键条件为 `UNCERTAIN` → 整体最多 `UNCERTAIN`，并提示「需人工/官网确认」。

实现建议：LLM 负责从官网抽取各条要求（带来源），**判定规则用确定性代码**，避免 LLM 既当运动员又当裁判。

---

## 4. 证据分级（Evidence Level）

```
A  官方「具体项目」官网 / 招生简章明确说明
B  大学官方页面（非该具体项目，但官方）
C  可靠第三方数据库（DAAD、Study in … 官方门户、权威聚合）
D  AI 推断 / 常识
```

**铁律**：`Admission Requirement / ECTS / Deadline / Tuition / Language Requirement` 等关键结论**要求 A/B 级**；仅有 C/D 时，结论必须降级为 `UNCERTAIN` 并显式提示「未经官方核实，不得据此做最终申请决策」。

落地：当前页面的 `verified` 三态升级为枚举 A/B/C/D，并在**代码层**对关键字段做「无 A/B 证据即降级」的强制，而非依赖 LLM 自觉。

---

## 5. Admission Score（谨慎，不伪造概率）

允许的综合维度（用于**定性**强弱，不等于录取率）：
```
Academic Match + Eligibility + GPA + Relevant Coursework
+ Research + Internship + Language + Competition + Program Fit
```
**输出形式**（刻意避免假概率）：
```
Application Strength: Very Strong / Strong / Moderate / Weak
Risk:                 Low / Medium / High
```
**禁止**在没有充分统计数据时输出「录取概率 73%」这类数字。只有当未来确实建立了带样本的统计模型（历史录取数据），才可引入概率，并必须标注样本与置信区间。

---

## 6. Cost Engine（结构化成本）

```
Tuition + Semester Fee + Rent + Food + Insurance + Transportation + Visa + Other
= Estimated Annual Cost
```
三档输出：`Minimum / Realistic / Comfortable`。
支持用户设置**最大年度预算**，并据此过滤/排序方案；成本每一项尽量带证据等级与城市级别的生活成本来源。

---

## 7. Application Portfolio（申请组合）

不是「推荐 10 所」，而是在**预算 / 国家 / 专业 / 录取风险 / 时间 / 偏好**约束下自动配平：
```
Reach   2–3 个
Target  4–6 个
Safety  2–3 个
```
并保证组合在用户预算与截止日期内可行（例如避免全部集中在同一超早截止轮次、避免全部超预算）。

---

## 8. Timeline（时间线）

给定目标（如 `2027 Winter Intake`）自动倒推关键节点并可提醒：
语言考试 → 材料准备（CV / Motivation Letter / 成绩单）→ 推荐信 → 学历认证（APS/WES）→ 网申 → Deadline → 签证 → 住宿。
每个节点带建议提前量与依赖关系。

---

## 9. 推荐算法演进路线（务实，不炫技）

- **阶段 1（现在）**：LLM + 联网核查，定性 tier。保持诚实，不加假分数。
- **阶段 2**：加 Eligibility Engine（确定性）+ 证据强制。推荐 = 先过硬性资格，再按多目标排序。
- **阶段 3**：加 Cost Engine 与 Portfolio 配平；Application Strength 定性分级（规则/加权，权重可解释、可调）。
- **阶段 4（仅在有数据时）**：引入基于历史录取数据的统计模型，才谈概率预测。

权重若引入，必须**可解释、可追溯、可关闭**，并在 UI 上展示「为什么这么排」。

---

## 10. 工程化建议（配合上述）

- 迁移到带构建的前端（Vite + TypeScript + 组件框架），把 `web/artifact.html` 拆成组件；保留一个「Artifact 导出」目标以继续在 claude.ai 内运行。
- 对所有运行时 LLM 返回引入 **schema 校验**（zod/valibot），非法结构不渲染为方案。
- 引入最小测试：引擎层单元测试（Eligibility/Cost 规则）、渲染快照、关键用户流程 e2e。
- 若未来加后端/缓存库：数据表必须含 `source_url / source_type / last_verified`，无来源不得入库。

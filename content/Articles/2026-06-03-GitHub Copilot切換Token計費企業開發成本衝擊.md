---
title: "GitHub Copilot 六月起切換 Token 計費制：企業開發者成本衝擊與新挑戰"
date: 2026-06-03
source: TechCrunch / GitHub Blog / Enterprise DNA
url: https://techcrunch.com/2026/05/30/what-a-joke-github-copilots-new-token-based-billing-spurs-consternation-among-devs/
category: 企業應用導入
industry: 其他
tags:
  - AI
  - 企業應用導入
  - GitHub Copilot
  - Microsoft
  - 開發者工具
  - Token計費
  - 企業AI
created: 2026-06-03
---

> [!info] 文章資訊
> - **來源**：[TechCrunch](https://techcrunch.com/2026/05/30/what-a-joke-github-copilots-new-token-based-billing-spurs-consternation-among-devs/)
> - **發布日期**：2026-05-30（計費變更於 2026-06-01 生效）
> - **分類**：企業應用導入

## 📝 重點摘要

GitHub Copilot 自 **2026 年 6 月 1 日**起，全面從固定月費制切換為「Token 使用量計費制（Usage-based Billing）」，引發企業開發者廣泛反彈。新制下，每個訂閱方案將包含月度 **AI Credits 配額**，超出部分按 Token 消耗量付費。企業方案座位費 **$39/月**維持不變，但包含 $39 的 Credits，代理式（Agentic）編碼任務每次可消耗 $30–$40，加上超額費用，重度使用者月帳單可能大幅超出預期。微軟同步推出了 6–8 月的過渡期促銷補貼（額外 $70/月 Credits），以緩解企業客戶的衝擊。

## 📖 全文內容

⚠️ 全文抓取失敗（WebFetch 返回 403），以下為多來源搜尋摘要整理。

### 計費制度變更說明

**舊制（固定月費制）**

| 方案 | 月費 | 功能 |
|---|---|---|
| Individual | $10/月 | 基本程式碼補全 |
| Business | $19/人/月 | 企業管理、安全性 |
| Enterprise | $39/人/月 | 所有功能 + 企業整合 |

舊制的核心優點：**費用完全可預期**，企業 IT 部門可精確計算全年授權成本。

**新制（Token 使用量計費制，生效日：2026 年 6 月 1 日）**

所有 Copilot 方案都切換為以下模式：
1. **每月包含一定量的 AI Credits**（以美元計）
2. 超出 Credits 的使用量：依各模型的 Token 費率額外計費
3. Credits 未用完不累積至下月

**各方案 Credits 配置：**

| 方案 | 月費 | 包含 AI Credits | 代理式任務估算 |
|---|---|---|---|
| Individual | $10/月 | $10 Credits | ~0.25 次代理任務 |
| Business | $19/人/月 | $19 Credits | ~0.5 次代理任務 |
| Enterprise | $39/人/月 | $39 Credits | ~1 次代理任務 |

其中，代理式（Agentic）編碼任務（讓 Copilot 自主完成完整功能或修復）估算每次消耗 **$30–$40 Credits**。

### 為什麼開發者感到憤怒？

**TechCrunch 引述的開發者反應**

TechCrunch 的報導標題直接引用了開發者社群反應：「What a joke（什麼笑話）」。核心抱怨包括：

1. **不可預期的帳單**：代理式任務的 Token 消耗量難以事先估計，開發者擔心月底帳單爆表
2. **「免費」功能消失感**：原本無限制的程式碼補全功能，現在受 Credits 限制（雖然微軟聲稱程式碼補全和「Next Edit Suggestions」仍維持無限制）
3. **代理功能反而變貴**：Build 2026 正大力推廣代理式編碼，但新計費制讓代理功能的成本大幅提升
4. **企業管理複雜度**：IT 部門需要追蹤每個開發者的 Token 消耗，比舊制複雜得多

**受影響最大的使用者族群**

- 使用 Agentic 工作流程的開發者（每次 session 消耗 $30–$40）
- 使用多個 AI 模型的 Power User
- 進行大規模重構或長時間任務的工程師

**影響較小的族群**

- 純程式碼補全用戶（仍維持無限制）
- Next Edit Suggestions 用戶（仍維持無限制）
- 低頻率 AI 使用者

### 微軟的緩衝措施

微軟採取了幾個措施應對反彈：

**過渡期促銷補貼（2026 年 6–8 月）**

Enterprise 方案客戶在過渡期每月額外獲得 **$70 Credits**，相當於三個月的緩衝期。這讓 Enterprise 用戶在 6、7、8 月實際可用 Credits 為 **$39 + $70 = $109/月**，足夠約 2–3 次完整代理任務。

**新增管理工具**

- **預算控制**：企業、成本中心、個人用戶三層級的支出上限設定
- **預覽帳單**：5 月初已推出，管理員可在月底前看到預估費用
- **跨組織 Credits 池**：以成本中心而非個別帳號分配 Credits，提供更靈活的管理彈性

### 企業應對策略建議

**短期（1–3 個月）**

1. **盤點實際使用模式**：利用微軟提供的預覽帳單功能，了解現有團隊的 Token 消耗模式
2. **設定預算上限**：為每個開發者或團隊設定月度 Credits 上限，避免意外超額
3. **分類任務優先序**：識別哪些任務適合 Agentic 模式（高價值），哪些用程式碼補全即可

**長期（3–6 個月）**

1. **評估替代方案**：GitHub Copilot 的競爭對手（Cursor、Replit AI、JetBrains AI Assistant）目前仍多採固定費率，可作為成本基準比較
2. **重新設計 Agentic 工作流程**：將大型代理任務分解為較小的互動式工作流，降低單次 Token 消耗
3. **訓練開發者高效使用**：教導開發者如何撰寫更精確的提示，減少不必要的 Token 浪費

## 💡 觀察與啟發

GitHub Copilot 的計費轉型，對 **IT 採購部門、工程師、CTO** 都有重要參考價值：

1. **Token 計費是 AI 企業工具的大趨勢，但管理複雜度大幅提升**：企業 IT 部門必須像管理雲服務費用（AWS、Azure）一樣，建立 AI Token 消耗的監控和預算框架。AI 工具的成本不再固定，而是隨使用強度波動。

2. **代理式 AI 的推廣與成本控制形成矛盾**：微軟一方面在 Build 2026 大力鼓吹 Agentic Coding，另一方面新計費制讓代理任務變貴。這可能延緩企業採用代理式開發工具的速度，是一個值得觀察的市場信號。

3. **導入門檻**：對台灣中小型企業而言，建議先以 Business 方案（$19/人）搭配謹慎的 Agentic 使用策略，而非直接採用 Enterprise 方案，等企業熟悉 Token 消耗模式後再升級。

## 🔗 相關連結
- [TechCrunch 開發者反應報導](https://techcrunch.com/2026/05/30/what-a-joke-github-copilots-new-token-based-billing-spurs-consternation-among-devs/)
- [GitHub 官方部落格：計費變更公告](https://github.blog/news-insights/company-news/github-copilot-is-moving-to-usage-based-billing/)
- [Enterprise DNA：企業衝擊分析](https://enterprisedna.co/resources/news/github-copilot-usage-based-billing-enterprise-2026/)
- [MLQ News：Token 計費詳細說明](https://mlq.ai/news/v2/github-copilot-switches-to-token-based-billing-june-1-drawing-developer-backlash/)

---
*由 Claude 自動整理於 2026-06-03*

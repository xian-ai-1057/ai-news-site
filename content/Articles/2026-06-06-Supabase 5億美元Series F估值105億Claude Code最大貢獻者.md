---
title: "Supabase 完成 5 億美元 Series F，估值 105 億：Claude Code 是今年最大資料庫貢獻者"
date: 2026-06-06
source: CNBC
url: https://www.cnbc.com/2026/06/04/database-startup-supabase-raises-500-million-10point5-billion-valuation.html
category: 新創公司
industry: ""
tags:
  - AI
  - 新創公司
  - Supabase
  - 資料庫
  - AI代理
  - vibe-coding
  - Series F
  - 開發者工具
created: 2026-06-06
---

> [!info] 文章資訊
> - **來源**：[CNBC](https://www.cnbc.com/2026/06/04/database-startup-supabase-raises-500-million-10point5-billion-valuation.html)
> - **發布日期**：2026-06-04
> - **分類**：新創公司

## 📝 重點摘要

開源後端即服務（Backend-as-a-Service）新創 Supabase 於 2026 年 6 月 4 日宣布完成 5 億美元 Series F 融資，融資後估值達 105 億美元，距上一輪（2025 年 10 月）僅 8 個月即翻倍。本輪由新加坡主權基金 GIC 領投，Stripe、Salesforce Ventures 等也是投資人。最引人注目的數據：**Claude Code 是 2026 年平台上最大的資料庫創建貢獻者**，AI 代理目前部署了平台上大多數的資料庫，「vibe-coding」現象（AI 協助寫程式）是驅動此次成長的核心力量。

## 📖 全文內容

⚠️ 全文抓取失敗（CNBC 返回 403），以下整合自 CNBC、TechCrunch、PR Newswire 及多方報導。

### Supabase 是什麼？

Supabase 是一個**開源的 Firebase 替代方案**，提供以 PostgreSQL 為底層的後端即服務平台，整合了：
- **資料庫**（PostgreSQL）
- **身份驗證**（Authentication）
- **即時訂閱**（Realtime）
- **儲存**（Storage）
- **邊緣函數**（Edge Functions）
- **向量資料庫**（pgvector，用於 AI 應用的語義搜尋）

開發者可以不用自建後端伺服器，直接使用 Supabase 提供的托管服務搭建全端應用。其開源性質（前端 MIT 授權）讓開發者社群快速增長，形成強大的生態護城河。

### Series F 融資詳情

**關鍵數字**：
| 指標 | 數值 |
|---|---|
| 融資金額 | **5 億美元** |
| 融資後估值 | **105 億美元** |
| 上一輪估值 | ~50 億美元（2025 年 10 月）|
| 估值翻倍時間 | **約 8 個月** |
| 累積融資總額 | **超過 10 億美元** |

**投資方**：
- **領投**：GIC（新加坡政府投資公司）
- **跟投**：Accel、Y Combinator、Craft、Felicis、Coatue
- **策略投資**：Stripe（第二度投資）、Salesforce Ventures

Stripe 的二度投資特別值得關注——Stripe 本身是 Supabase 的重要企業用戶，這筆投資反映了支付基礎設施巨頭對 AI 代理時代資料庫基礎設施的長期看好。

### 爆炸性增長的核心驅動：AI 代理革命

**最關鍵的數據點**：
> *"Claude Code is the largest contributor since the start of the year, with agents now deploying the majority of databases on Supabase's platform."*
> ——CNBC 報導引述 Supabase 數據

這意味著：
1. **AI 代理已成為主要的「開發者」**：在 Supabase 平台上，建立新資料庫的主體已從人類開發者轉移至 AI 代理
2. **Claude Code 主導**：Anthropic 的 CLI 工具 Claude Code 是 2026 年以來最活躍的 Supabase 用戶之一
3. **自動化部署是新常態**：AI 輔助程式設計（vibe-coding）不只是寫程式碼，還包含完整的後端基礎設施部署

**量化增長指標**：
- 用戶數：自 2025 年 10 月 Series E 以來**翻倍**
- 資料庫數量：**年增率 600%**
- 累積資料庫數量：**數千萬個**（具體數字未公開）

這樣的成長速度在 SaaS/PaaS 行業中極為罕見，主要得益於 vibe-coding 帶來的需求飛升——每個 AI 輔助開發的項目幾乎都需要一個資料庫。

### Multigres：面向 AI 規模的新產品

配合本輪融資，Supabase 同步發布了 **Multigres** 的預覽版：

**Multigres 是什麼？**
Multigres 是一個開源的 PostgreSQL **橫向擴展層（Horizontal Scaling Layer）**，允許企業將多個 PostgreSQL 實例組合成一個邏輯資料庫，實現接近無限的水平擴展能力。

**目標**：幫助在 Supabase 平台上開發的公司，「擴展到 OpenAI 甚至更大的規模」——這個措辭暗示 Multigres 的設計目標是支援超大規模的 AI 應用後端。

**商業意義**：
- 解決了 Supabase 用戶企業成長後的擴展瓶頸
- 為 Supabase 提供進入大型企業市場的技術基礎
- 強化開源生態——Multigres 的開源性質有助於社群採用和生態建設

### 市場背景：vibe-coding 改變了什麼？

「Vibe-coding」是 2025-2026 年出現的新詞彙，描述開發者主要依賴 AI 工具（GitHub Copilot、Claude Code、Cursor、Windsurf 等）進行軟體開發，甚至非技術背景的人也能透過 AI 建立功能完整的應用。

**對基礎設施市場的影響**：
- 開發者數量（包含 AI 輔助開發的非傳統開發者）爆炸性增長
- 每個新項目幾乎都需要資料庫、身份驗證等後端服務
- 快速上手、少量設置的後端即服務（BaaS）需求急增
- Supabase 的「所見即所得 + PostgreSQL 強大能力」定位完美契合這個趨勢

其競爭者 Firebase（Google）、PlanetScale、Neon 等也受益於同一趨勢，但 Supabase 的開源性質和 PostgreSQL 相容性使其在開發者中的口碑和採用率最高。

## 💡 觀察與啟發

Supabase 的故事揭示了 AI 代理時代最重要的基礎設施機遇之一：**隨著 AI 代理成為「主動的基礎設施消費者」，傳統面向人類開發者的工具和平台將迎來新一輪成長**。

Claude Code 成為最大資料庫貢獻者這件事，不只是一個有趣的統計數字——它象徵著軟體開發生態的深層轉變：未來的「開發者生態」中，AI 代理將是基礎設施的主要使用者和付費方。這對整個開發者工具行業（從 CI/CD 到資料庫、從 API 網關到監控）都有深遠影響。

**對台灣科技業的啟示**：台灣有大量的軟體開發商和系統整合商（SI），若能在客戶案例中積極引入 AI 代理 + Supabase 類型的後端即服務，可以大幅降低項目的基礎設施成本和開發週期，提升競爭力。

**投資視角**：105 億估值對應 10 億以上累積融資，市值/融資比約 10 倍，暗示市場對其未來收入增長的強烈預期。GIC 的領投說明主權基金也開始直接布局 AI 基礎設施層，而非只投資上市科技股。

## 🔗 相關連結
- [CNBC 原文](https://www.cnbc.com/2026/06/04/database-startup-supabase-raises-500-million-10point5-billion-valuation.html)
- [TechCrunch 報導](https://techcrunch.com/2026/06/05/supabase-doubles-valuation-to-10b-in-8-months/)
- [PR Newswire 官方新聞稿](https://www.prnewswire.com/news-releases/supabase-raises-500m-at-10-5b-to-accelerate-lead-in-agentic-infrastructure-302791787.html)
- [The SaaS News](https://www.thesaasnews.com/news/supabase-raises-500m-series-f/)

---
*由 Claude 自動整理於 2026-06-06*

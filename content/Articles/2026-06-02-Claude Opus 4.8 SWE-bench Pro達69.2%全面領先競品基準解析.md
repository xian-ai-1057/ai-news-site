---
title: "Claude Opus 4.8 SWE-bench Pro 達 69.2%：全面領先競品，AI 編程基準新里程碑"
date: 2026-06-02
source: Vellum AI / LLM Stats
url: https://www.vellum.ai/blog/claude-opus-4-8-benchmarks-explained
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - Claude
  - Anthropic
  - SWE-bench
  - Benchmark
  - LLM
  - 編程AI
created: 2026-06-02
---

> [!info] 文章資訊
> - **來源**：[Vellum AI Blog](https://www.vellum.ai/blog/claude-opus-4-8-benchmarks-explained)
> - **發布日期**：2026-06-01
> - **分類**：技術理論

## 📝 重點摘要

Anthropic 於 2026 年 5 月 28 日發布的 **Claude Opus 4.8** 在業界最嚴格的 AI 編程基準 SWE-bench Pro 上取得 **69.2%** 的成績，比上一代 Opus 4.7（64.3%）高出近 5 個百分點，同時大幅領先 GPT-5.5（58.6%）與 Gemini 3.1 Pro（54.2%）。在更廣泛的 SWE-bench Verified（500 題集）上，Opus 4.8 以 **88.6%** 更新紀錄。此外，尚未正式對外開放的 **Claude Mythos Preview** 在難度最高的推理基準 GPQA Diamond 上以 **94.6%** 名列首位，顯示 Anthropic 下一代旗艦模型的天花板仍有顯著空間。

## 📖 全文內容

⚠️ 全文抓取失敗（WebFetch 返回 403），以下為多來源搜尋摘要整理。

### Claude Opus 4.8 的發布背景

Anthropic 在 2026 年 5 月 28 日發布 Claude Opus 4.8，定位為「謹慎且明顯的進步」（modest but tangible improvement）。這一代的核心進步在於：進一步強化了自主代理（Agentic）任務的能力，以及優化長上下文（Long-context）處理穩定性，同時定價維持與前代相同——輸入每百萬 tokens $5 美元，輸出每百萬 tokens $25 美元。

Opus 4.8 的一大特色是支援**動態工作流程（Dynamic Workflows）**：模型可在執行代理任務時自動調整工具調用策略，當某一步驟失敗或回傳非預期結果，模型能即時修正執行路徑，而非從頭重跑整個工作流。

### SWE-bench 基準詳解：為何是最嚴格的標準

**SWE-bench Pro** 是目前業界公認最難以「作弊」的 AI 編程基準，設計特點如下：
- 題目來自**活躍維護中的真實 GitHub 倉庫**，涉及多檔案修改（multi-file diffs）
- 沒有公開的正確答案（no ground-truth leakage）
- 問題需要理解完整程式庫脈絡，而非孤立的函式
- 分數直接對應「自動修復 GitHub Issue 的實際成功率」

**SWE-bench Verified** 是較早的版本（500 道題），雖然較容易，但仍是重要的橫向比較指標。

### 跨模型基準比較

| 模型 | SWE-bench Verified | SWE-bench Pro | GPQA Diamond |
|---|---|---|---|
| Claude Opus 4.8（Anthropic）| **88.6%** | **69.2%** | — |
| Claude Opus 4.7（Anthropic）| 87.6% | 64.3% | — |
| Claude Mythos Preview（Anthropic）| — | — | **94.6%** |
| GPT-5.5（OpenAI）| — | 58.6% | — |
| Gemini 3.1 Pro（Google）| 80.6% | 54.2% | — |
| Kimi K2.6（Moonshot AI）| — | 58.6% | — |

### Claude Mythos Preview：下一代旗艦的預覽

LLM Stats 的最新排行顯示，**Claude Mythos Preview** 在 GPQA Diamond 以 94.6% 的準確率名列第一。GPQA Diamond 是目前最能區分「真正推理能力」與「記憶/猜答」的基準——這是一組由博士生設計的跨領域難題（物理、化學、生物），設計讓領域外專家的正確率約 34%，但讓擁有該領域博士學位者也只能達到 65% 左右。

Anthropic 此前（5 月底）已宣布因 Mythos Preview 擁有「零日漏洞利用能力」而限制其對外發布，目前僅在受控環境下提供評估。

### 目前主要模型排名

根據 LLM Stats 在 2026 年 6 月的 Artificial Analysis Intelligence Index：
- 🥇 Claude Opus 4.8：61.4 分（整體排名第一）
- 🥈 GPT-5.5：60.2 分
- 🥉 xAI Grok 4.3：第三位
- 第四：Google Gemini 3.1 Pro

在細分排名中：
- **推理**：Gemini 3.1 Pro 領先
- **編程**：Claude Opus 4.8 領先（SWE-bench 系列）
- **創意寫作**：GPT-5.5 領先
- **終端機/CLI 工作流**：GPT-5.5 領先
- **最低成本前十**：Kimi K2.6（$0.14/M 輸入 tokens）

### 技術亮點：動態工作流程與快速模式

Opus 4.8 新增的「快速模式（Fast Mode）」讓模型在確信度高的步驟自動降低輸出時間，在完整代理任務中可節省 30-40% 的延遲，兼顧效能與速度。

## 💡 觀察與啟發

Claude Opus 4.8 的 SWE-bench Pro 成績代表一個重要里程碑：AI 已可在真實軟體工程任務（而非玩具問題）上達到接近七成的成功率。這對軟體開發流程的影響是深遠的：

1. **「AI 初級工程師」的門檻已到**：SWE-bench Pro 69.2% 意味著大多數「一位初級工程師需要 1-2 小時處理的標準 bug」，AI 已可自動化。這將重塑軟體團隊的人員結構與 PR review 流程。

2. **競爭格局重組**：Opus 4.8 與 GPT-5.5 的差距（69.2% vs 58.6%，超過 10 個百分點）是顯著的，Anthropic 在「代碼類任務」的競爭優勢仍維持。

3. **Claude Mythos 的暗示**：Mythos Preview 在 GPQA Diamond 94.6% 的成績暗示，一旦安全問題解決並正式發布，整體排名格局可能再次洗牌。

## 🔗 相關連結
- [原文連結（Vellum AI）](https://www.vellum.ai/blog/claude-opus-4-8-benchmarks-explained)
- [LLM Stats 排行榜](https://llm-stats.com/leaderboards/llm-leaderboard)
- [Claude Opus 4.8 詳細評測（LLM Stats 部落格）](https://llm-stats.com/blog/research/claude-opus-4-8-launch)
- [SWE-bench Pro 說明（TrueFoundry）](https://www.truefoundry.com/blog/claude-opus-4-8-and-swe-bench-pro-we-ran-anthropics-headline-through-our-gateway)

## 📓 學習筆記
- [[2026-06-02-學習-SWE-bench與AI編程能力評估方法論|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-06-02*

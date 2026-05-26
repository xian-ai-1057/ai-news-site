---
title: "DeepSeek V4 Pro NIST CAISI 評測：最強中國 AI 模型仍落後美國前沿八個月"
date: 2026-05-26
source: NIST / CAISI
url: https://www.nist.gov/news-events/news/2026/05/caisi-evaluation-deepseek-v4-pro
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - DeepSeek
  - benchmark
  - NIST
  - 開源模型
  - 中美AI競爭
created: 2026-05-26
---

> [!info] 文章資訊
> - **來源**：[NIST / CAISI](https://www.nist.gov/news-events/news/2026/05/caisi-evaluation-deepseek-v4-pro)
> - **發布日期**：2026-05-02
> - **分類**：技術理論

## 📝 重點摘要

美國國家標準技術研究院（NIST）旗下的 AI 標準與創新中心（CAISI）於 2026 年 5 月 2 日發布了對 DeepSeek V4 Pro 的全面評測報告。報告指出，DeepSeek V4 Pro 是迄今為止 CAISI 評測過的最強中國 AI 模型，但其整體能力仍落後美國前沿模型約八個月，在網路安全能力（32% vs GPT-5.5 的 71%）與代理軟體工程（44% vs 78%）等關鍵領域差距最為顯著。值得注意的是，DeepSeek V4 在數學推理領域表現接近頂尖水準，且成本效益優於大多數同級美國模型，在 7 項測試中的 5 項優於 GPT-5.4 mini。

## 📖 全文內容

⚠️ 全文抓取失敗，以下為搜尋結果摘要整理。

### 評測背景：NIST CAISI 是什麼？

NIST（美國國家標準技術研究院）是美國負責制定技術標準的聯邦機構。其 AI 標準與創新中心（Center for AI Standards and Innovation, CAISI）負責對國內外 AI 模型進行系統性評測，包括使用部分非公開 benchmark，提供比公開排行榜更具公信力的第三方評估。

CAISI 的評測涵蓋五大面向：網路安全（Cyber）、軟體工程（Software Engineering）、自然科學（Natural Sciences）、抽象推理（Abstract Reasoning）、數學（Mathematics）。

### DeepSeek V4 模型規格

DeepSeek V4 於 **2026 年 4 月 24 日**發布，提供兩個版本：

- **V4 Pro**：總參數量 1.6 兆（Trillion），激活參數 490 億（49B active）；1M Token 上下文視窗
- **V4 Flash**：總參數量 2840 億（284B），激活參數 130 億（13B active）；1M Token 上下文視窗

這兩個版本均採用 MoE（Mixture of Experts，混合專家）架構，僅激活部分專家參數進行推理，大幅降低單次推理成本。

### 核心評測結果

**整體評估**：DeepSeek V4 能力相當於大約 8 個月前的美國前沿模型（即 GPT-5，發布於 2025 年末），是 CAISI 評測過的最強中國 AI 模型。

**各領域表現**：

| 測試領域 | DeepSeek V4 Pro | GPT-5.5（美國前沿）| 差距 |
|---|---|---|---|
| 網路安全（Cyber） | 32% | 71% | -39% |
| 抽象推理 | 46% | 79% | -33% |
| 代理軟體工程 | 44% | 78% | -34% |
| 數學（OTIS-AIME-2025） | 97% | — | 接近頂尖 |
| 數學（PUMaC 2024） | 96% | — | 接近頂尖 |
| 數學（SMT 2025） | 96% | — | 接近頂尖 |

### 強項：數學推理與成本效益

DeepSeek V4 的兩個突出強項：

1. **數學推理**：在競賽數學（AIME、PUMaC、SMT）等領域，DeepSeek V4 Pro 得分高達 96-97%，接近美國頂尖模型水準。這延續了 DeepSeek 系列在數學領域一貫的競爭力。

2. **成本效益**：在與 GPT-5.4 mini（美國最具成本競爭力的參考模型）的比較中，DeepSeek V4 在 7 項測試基準中的 5 項具有更高的成本效益。業界早有估算，DeepSeek V4 的輸出成本約比 GPT-5.5 便宜 34 倍。

### 弱項：網路安全與代理能力

DeepSeek V4 在網路安全評估中差距最為顯著——32% 對比 GPT-5.5 的 71%，幾乎只有前者的一半。這個差距在代理軟體工程（44% vs 78%）和抽象推理（46% vs 79%）中也相當明顯。

這意味著 DeepSeek V4 目前不適合作為高度安全相關任務的主力模型，其代理能力（自主完成複雜軟體開發任務）也仍有明顯提升空間。

### 評測引發的爭議

NIST 說 8 個月差距，DeepSeek 方面（官方及中國 AI 社群）對此提出質疑，認為：
- 部分 benchmark 可能受到訓練資料污染，對 GPT 系列更有利
- 成本效益比才是更重要的衡量指標
- 數學等特定領域的表現差距遠小於 8 個月

這場爭議反映了中美 AI 評測標準話語權的競爭。

### V4 的長文本能力

值得注意的是，DeepSeek V4 Pro 的 MRCR 1M（1M Token 上下文中的多步參照解析）得分 83.5、CorpusQA 1M 得分 62.0，表現足夠強勁，使得「把整個服務規模的程式碼庫（約 75 萬 Token）塞進單一 Prompt」這種方式，已可作為維護 RAG Pipeline 的可行替代方案。

## 💡 觀察與啟發

NIST 的評測對中美 AI 競賽提供了一個相對客觀的截面快照：DeepSeek V4 確實是目前中國最強的開源大模型，在數學和性價比上具有真實競爭力，但在網路安全、代理推理等「高價值」應用領域仍有明顯差距。

對企業決策者而言，這個結果意味著：若任務屬於數學計算、資料分析、成本敏感型應用，DeepSeek V4 是值得考慮的選項；若任務涉及自主代理、安全評估、複雜推理，目前仍建議選擇美國前沿模型。

更值得關注的是中美評測標準之爭：誰定義了「前沿」的衡量方式，誰就在一定程度上控制了 AI 軍備競賽的敘事。

## 🔗 相關連結
- [原文連結（NIST CAISI）](https://www.nist.gov/news-events/news/2026/05/caisi-evaluation-deepseek-v4-pro)
- [相關報導（TechFastForward）](https://techfastforward.com/articles/nist-caisi-deepseek-v4-pro-8-months-us-frontier-benchmark-gap-2026)
- [DeepSeek V4 完整指南（CodersEra）](https://codersera.com/blog/deepseek-v4-complete-guide-2026/)
- [Artificial Analysis 性能分析](https://artificialanalysis.ai/models/deepseek-v4-pro)

## 📓 學習筆記
- [[2026-05-26-學習-DeepSeek V4 MoE架構與CAISI評測方法|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-26*

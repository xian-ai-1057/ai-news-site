---
title: "Microsoft Build 2026 發布 MAI-Thinking-1：首款自研推理模型，稀疏 MoE 架構，不借助 OpenAI 資料"
date: 2026-06-03
source: TechTimes / Microsoft AI
url: http://www.techtimes.com/articles/317631/20260602/microsoft-build-2026-mai-thinking-1-first-house-reasoning-model-trained-without-openai-data.htm
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - Microsoft
  - MAI-Thinking-1
  - MoE
  - 推理模型
  - Build2026
  - 語言模型
created: 2026-06-03
---

> [!info] 文章資訊
> - **來源**：[TechTimes](http://www.techtimes.com/articles/317631/20260602/microsoft-build-2026-mai-thinking-1-first-house-reasoning-model-trained-without-openai-data.htm)
> - **發布日期**：2026-06-02
> - **分類**：技術理論

## 📝 重點摘要

微軟於 2026 年 6 月 2 日的 Build 開發者大會上，正式發布旗下首款自研推理模型 **MAI-Thinking-1**，採用稀疏混合專家（Sparse MoE）架構，擁有 **35 億活躍參數、約 1 兆總參數**，支援 **256,000 token 上下文窗口**。微軟強調此模型完全使用商業授權資料訓練，**未借助任何第三方模型（包括 OpenAI）的蒸餾輸出**，標誌著微軟從 OpenAI 技術依賴走向自主研發的重大轉折。在數學推理基準 AIME 2025 達 97.0%、AIME 2026 達 94.5%，並在 SWE-bench Pro 上以大幅較低成本追平 Claude Opus 4.6。

## 📖 全文內容

⚠️ 全文抓取失敗（WebFetch 返回 403），以下為多來源搜尋摘要整理。

### MAI-Thinking-1 的誕生背景

**從 OpenAI 合作夥伴到自主研發**

微軟自 2019 年起與 OpenAI 建立深度合作，為 OpenAI 提供大量算力，並在旗下所有產品（Azure OpenAI Service、GitHub Copilot、Bing、Microsoft 365 Copilot）中使用 OpenAI 模型。然而，這種高度依賴也帶來若干風險：

- 成本控制難度高（OpenAI 模型費用隨使用量線性增加）
- 技術路線受制於 OpenAI 的研發優先序
- 競爭格局中，OpenAI 同時是微軟的合作方也是潛在競爭者

**Project Polaris：微軟走向模型自主**

Build 2026 的背後，是代號「Project Polaris」的內部計畫——由 AI 首席執行長 Mustafa Suleiman 主導，目標是在 2027 年前讓微軟的核心產品能夠在自研模型上運行，減少對 OpenAI 的依賴。MAI-Thinking-1 是 Project Polaris 的第一個公開成果。

### 模型規格詳解

**架構特點：稀疏混合專家（Sparse MoE）**

MAI-Thinking-1 採用稀疏 MoE（Mixture-of-Experts）架構，其核心設計理念是：

- **總參數約 1 兆**，但每次推理**只啟動 35 億活躍參數**（約 3.5%）
- 每個 token 的處理請求，會被路由至最合適的「專家子網路」子集
- 在保持大模型整體容量的同時，大幅降低單次推理所需算力
- 對比全密集架構（Dense Transformer），相同推理成本下可容納更多總知識

這種架構與 Google 的 Gemini 系列（部分使用 MoE）和 Mistral 的 Mixtral 系列相似，但微軟聲稱其路由機制和訓練策略有所創新。

**關鍵技術規格：**

| 規格 | 數值 |
|---|---|
| 活躍參數量 | 35 億（35B） |
| 總參數量 | 約 1 兆（~1T） |
| 架構類型 | 稀疏混合專家（Sparse MoE） |
| 上下文窗口 | 256,000 tokens |
| 訓練資料 | 商業授權資料，無第三方模型蒸餾 |
| 目標客群 | 企業客戶（Enterprise） |

**訓練方法的突破：零蒸餾原則**

微軟 AI 首席 Mustafa Suleiman 在 Build 主題演講中特別強調：MAI-Thinking-1「未使用蒸餾（distillation）進行訓練」——即未將 GPT-4、GPT-5.5 等 OpenAI 模型的輸出用作訓練樣本。

這在業界並不常見。Llama、Qwen 等多個開源模型均曾借助 GPT-4 的輸出進行知識蒸餾以提升效能。微軟此舉明確傳遞出「完全自主研發」的信號，同時避免潛在的 IP 爭議。

### 效能表現

**數學推理基準（AIME）：**

| 基準 | MAI-Thinking-1 分數 |
|---|---|
| AIME 2025 | 97.0% |
| AIME 2026 | 94.5% |

AIME（美國數學邀請賽）是評估數學和多步驟科學推理能力的重要指標。97% 的 AIME 2025 分數達到頂尖推理模型水準。

**軟體工程基準（SWE-bench Pro）：**

MAI-Thinking-1 在 SWE-bench Pro 上的表現達到 Claude Opus 4.6 的同等水準，且推理成本更低。根據微軟公開資訊，其初步偏好測試也顯示與 Claude Sonnet 4.6 相當。

### 同期發布的其他 MAI 模型

Build 2026 期間，微軟共發布 **7 款 MAI 品牌自研模型**：

| 模型 | 用途 |
|---|---|
| MAI-Thinking-1 | 推理（Reasoning）旗艦 |
| MAI-Code-1-Flash | 程式碼生成（GitHub Copilot 整合） |
| MAI-Transcribe-1.5 | 語音轉文字，43 種語言最高精度 |
| MAI-Image-2.5 | 圖像生成 |
| MAI-Image-2.5-Flash | 快速圖像生成（低成本） |
| MAI-Voice-* | 語音合成系列 |

MAI-Transcribe-1.5 被微軟稱為「全球最準確的轉錄模型」，在 43 種語言上的精度超越 Gemini 和 OpenAI 的旗艦語音模型。

### 可用性與定價

MAI-Thinking-1 透過 **Microsoft Azure AI Foundry** 及 **GitHub Copilot Enterprise** 提供，主要面向企業客戶。公開定價尚未完整披露，但微軟聲稱其推理成本顯著低於 Claude Opus 4.6。

## 💡 觀察與啟發

MAI-Thinking-1 的發布，在技術層面有兩個值得深思的面向：

1. **稀疏 MoE 正在成為頂尖推理模型的標準架構**：1 兆總參數 / 35B 活躍參數的設計，延續了 GPT-4（據傳 1.7T 總參數）、Gemini 1.5 Pro、Mixtral 的路線。MoE 讓模型在保持高容量的同時控制推理成本，這種「高天花板、低邊際成本」的特性，使其特別適合企業大規模部署場景。

2. **微軟去 OpenAI 依賴的時程正在加速**：Build 2026 標誌著微軟從「OpenAI 的最大客戶」轉向「與 OpenAI 並行競爭的 AI 廠商」。這對整個產業的競合格局有深遠影響——未來 Azure OpenAI Service 和 Azure AI Foundry（含 MAI 模型）將在同一平台上共存，形成有趣的內部競爭。

## 🔗 相關連結
- [TechTimes 原文](http://www.techtimes.com/articles/317631/20260602/microsoft-build-2026-mai-thinking-1-first-house-reasoning-model-trained-without-openai-data.htm)
- [Microsoft AI MAI-Thinking-1 官方頁面](https://microsoft.ai/models/mai-thinking-1/)
- [Windows Forum：MAI 模型總覽](https://windowsforum.com/threads/microsoft-mai-models-at-build-2026-reasoning-code-voice-and-the-shift-to-model-ownership.421643/)
- [Neowin：MAI-Thinking-1 與 MAI-Code-1](https://www.neowin.net/news/microsoft-unveils-mai-thinking-1-reasoning-and-mai-code-1-coding-models/)

## 📓 學習筆記
- [[2026-06-03-學習-稀疏MoE推理模型與MAI-Thinking-1架構|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-06-03*

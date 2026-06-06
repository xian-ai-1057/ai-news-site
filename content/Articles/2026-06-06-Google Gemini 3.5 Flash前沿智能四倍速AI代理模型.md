---
title: "Google Gemini 3.5 Flash：前沿智能四倍速、1M 上下文、AI 代理首選模型"
date: 2026-06-06
source: Google Blog
url: https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - Gemini
  - Google
  - 多模態
  - AI代理
  - 模型評測
created: 2026-06-06
---

> [!info] 文章資訊
> - **來源**：[Google Blog](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/)
> - **發布日期**：2026-05-19（Google I/O 2026 發布）
> - **分類**：技術理論

## 📝 重點摘要

Google 於 2026 年 5 月 19 日 Google I/O 2026 大會正式發布 Gemini 3.5 Flash，以「前沿智能、四倍速度」為核心定位，在多個代理任務與程式碼基準上超越同家族前代 Gemini 3.1 Pro。模型擁有 100 萬 token 的超長上下文視窗，支援文字、圖片、音訊、影片多模態輸入，內建思維鏈（Dynamic Thinking）與工具使用能力。定價 $1.50/$9.00（輸入/輸出 每百萬 tokens），快取輸入僅 $0.15/M，競爭力顯著。Gemini 3.5 Pro 預計 2026 年 6 月正式推出。

## 📖 全文內容

⚠️ 全文抓取失敗（Google Blog 返回 403），以下整合自 Google 官方資訊與多方技術媒體報導。

### 發布背景：Google I/O 2026

2026 年 5 月 19 日，Google 在加州 Mountain View 的 Shoreline Amphitheatre 舉辦 Google I/O 2026 開發者大會。Gemini 3.5 Flash 是大會的重頭戲之一，Google 將其定位為「以具有競爭力的價格提供前沿級別智能」的模型，特別針對 AI 代理（AI Agent）和程式碼生成場景進行優化。

### 核心規格

**速度與智能**：
- 輸出速度是同類前沿模型的 **4 倍**
- 動態思維（Dynamic Thinking）預設啟用，模型可自主選擇是否進行深度推理
- 設計目標：在需要快速響應的代理工作流中，不犧牲品質地大幅提升吞吐量

**上下文與多模態**：
- 上下文視窗：**100 萬 tokens（1M context window）**
- 支援輸入模式：文字、圖片、音訊、影片
- 輸出模式：文字
- 允許跨模態的長文件理解與分析

**工具使用能力（Tool Use）**：
- 函數呼叫（Function Calling）
- 結構化輸出（Structured Output）
- 搜尋即工具（Search as a Tool）
- 程式碼執行（Code Execution）

### 基準測試表現

Gemini 3.5 Flash 在多個關鍵基準上超越 Gemini 3.1 Pro：

| 基準測試 | Gemini 3.5 Flash | 說明 |
|---|---|---|
| Terminal-Bench 2.1 | **76.2%** | 終端機操作代理任務 |
| GDPval-AA | **1656 Elo** | 代理規劃能力競技排名 |
| MCP Atlas | **83.6%** | 多步工具使用與 MCP 整合 |
| CharXiv Reasoning | **84.2%** | 多模態圖表理解與推理 |

上述成績均優於 Gemini 3.1 Pro 的對應表現，特別是在以程式碼與工具使用為核心的代理任務場景中優勢明顯。

### 定價結構

| 類型 | 價格（每百萬 tokens） |
|---|---|
| 輸入（全球區域）| $1.50 |
| 輸出（全球區域）| $9.00 |
| 快取輸入（90% 折扣）| $0.15 |
| 輸入（非全球區域）| $1.65 |
| 輸出（非全球區域）| $9.90 |

相較於 Gemini 3.1 Pro 的定價，Gemini 3.5 Flash 在更強性能下提供更具競爭力的價格點，快取折扣特別適合 RAG 和長文件重複處理的應用場景。

### 存取管道

**開發者**：
- Google AI Studio
- Gemini API
- Android Studio
- Google Antigravity 2.0
- Vertex AI
- Gemini Enterprise Agent Platform

**消費者**：
- Gemini 應用程式
- Google 搜尋中的 AI Mode

### Gemini 3.5 Pro 預告

Google 宣布 Gemini 3.5 Pro 將於 2026 年 6 月正式發布，預計提供更強的推理能力和更高的性能上限，適合需要最高準確度的複雜任務。

### 競爭格局對比

| 模型 | 最高速度 | 1M 上下文 | 代理任務支援 | 輸入定價/M |
|---|---|---|---|---|
| Gemini 3.5 Flash | 4x（相對基準）| ✓ | ✓ | $1.50 |
| Claude Opus 4.8 | 標準 | 部分支援 | ✓ | 較高 |
| GPT-5.5 | 標準 | ✓ | ✓ | 較高 |

（注：上表為概括性對比，各模型在不同任務上各有優勢）

## 💡 觀察與啟發

Gemini 3.5 Flash 的發布清晰地展示了 Google 在 AI 基礎設施上的競爭策略：**以 TPU 優勢換速度，以速度換市場份額**。四倍速度在 AI 代理場景尤為關鍵——一個需要執行 100 步工具呼叫的代理，若每步推理快四倍，整體執行時間可縮短 75%。

**對開發者的影響**：快取輸入 $0.15/M 的定價意味著長文件分析（如法律合約、醫療報告）應用的成本大幅下降，結合 1M 上下文，使「一次性輸入整份報告」的開發模式更具商業可行性。

**MCP 生態整合**：MCP Atlas 基準達 83.6% 意味著 Gemini 3.5 Flash 在 Model Context Protocol 生態中有強大的工具整合能力，這對於企業部署 AI Agent 系統、對接現有 SaaS 工具具有重要的實用價值。

## 🔗 相關連結
- [Google Blog 原文](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-5/)
- [MarkTechPost 技術報導](https://www.marktechpost.com/2026/05/20/google-introduces-gemini-3-5-flash-at-i-o-2026-a-faster-and-cheaper-model-for-ai-agents-and-coding/)
- [Gemini API 定價頁](https://ai.google.dev/gemini-api/docs/pricing)

## 📓 學習筆記
- [[2026-06-06-學習-Gemini 3.5 Flash架構與代理任務設計|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-06-06*

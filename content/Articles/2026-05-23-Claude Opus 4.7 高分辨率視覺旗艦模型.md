---
title: "Claude Opus 4.7：Anthropic 新旗艦模型，首支援高解析度圖像與百萬 Token"
date: 2026-05-23
source: Anthropic
url: https://www.anthropic.com/news/claude-opus-4-7
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - Anthropic
  - Claude
  - 多模態
  - 旗艦模型
  - 模型發布
created: 2026-05-23
---

> [!info] 文章資訊
> - **來源**：[Anthropic](https://www.anthropic.com/news/claude-opus-4-7)
> - **發布日期**：2026-04-16
> - **分類**：技術理論

## 📝 重點摘要

Anthropic 於 2026 年 4 月 16 日正式發布 **Claude Opus 4.7**，是該公司現役最強旗艦模型，代號 `claude-opus-4-7`。主要升級包含：首次支援高解析度圖像（最高 2576px / 3.75MP，較前代提升約 3.3 倍）、100 萬 Token 上下文視窗、128k Token 最大輸出、最佳化的長程自主任務執行能力，以及新設的「網路安全驗證計畫（Cyber Verification Program）」以防範高風險濫用。定價維持與 4.6 相同的每百萬輸入 Token $5 / 輸出 $25。

## 📖 全文內容

⚠️ 全文抓取失敗，以下為搜尋結果摘要整理。

### 發布背景

Claude Opus 4.7 是 Claude Opus 4 系列的最新版本，在 2026 年 4 月 16 日全面上市（General Availability）。與前代 Opus 4.6 相比，4.7 主要強化三個面向：**視覺能力**、**長程任務一致性**、與**安全防護機制**。

### 核心技術規格

| 規格項目 | Claude Opus 4.7 | Claude Opus 4.6 |
|---------|----------------|----------------|
| 最大圖像解析度 | **2576px / 3.75MP** | 1568px / 1.15MP |
| 上下文視窗 | 1,000,000 Token | 1,000,000 Token |
| 最大輸出 Token | 128,000 Token | 128,000 Token |
| 輸入定價 | $5 / 百萬 Token | $5 / 百萬 Token |
| 輸出定價 | $25 / 百萬 Token | $25 / 百萬 Token |

### 主要新功能與改進

**1. 高解析度圖像支援（首次）**

Claude Opus 4.7 是 **Anthropic 首款支援高解析度圖像輸入**的 Claude 模型。最大圖像解析度從 1568px（1.15MP）提升至 **2576px（3.75MP）**，提升幅度約 3.3 倍。這讓 Opus 4.7 能夠識別：
- 密密麻麻的文字表格（如財務報表截圖）
- 高細節技術圖表（電路圖、建築藍圖）
- 醫療影像中的細微特徵
- 高解析度文件掃描

**2. 長程自主任務（Agentic Task）效能提升**

Opus 4.7 在高難度軟體工程任務上有顯著進步，特別是：
- 處理複雜、長時間運行任務的**嚴謹性（Rigor）和一致性（Consistency）**
- 對指令的精確遵循（Precise Instruction Following）
- **自我驗證（Self-verification）**：模型會在回報結果前主動驗證自身輸出

據用戶反饋，以往需要密切監督的困難編程任務，現在可以更有信心地交給 Opus 4.7 自主完成。

**3. Adaptive Thinking（自適應思考）**

支援 Adaptive Thinking（延伸思考模式），允許模型在回應前進行更深入的推理，適用於數學、邏輯、複雜代碼等需要多步驟思考的任務。

**4. 網路安全驗證計畫（Cyber Verification Program）**

Anthropic 在 Opus 4.7 加入了自動偵測並封鎖「高風險網路安全使用」的防護機制。同時推出 **Cyber Verification Program**，允許合法的安全專業人員（漏洞研究、滲透測試、紅隊攻防）申請驗證後使用模型的完整能力。

### 可用平台

Opus 4.7 在以下平台全面上線：
- Anthropic API（直接使用）
- Amazon Bedrock（AWS 整合）
- Google Cloud Vertex AI
- Microsoft Foundry

## 💡 觀察與啟發

Opus 4.7 的高解析度圖像支援，看似是一個「規格升級」，實則是為企業場景打開了重要的用途：大量企業文件的「核心資訊」以截圖、掃描件或高解析度 PDF 形式存在，而非純文字。3.75MP 的支援讓 Claude 能更可靠地讀取財務報表、技術手冊、醫療紀錄等。

「自我驗證（Self-verification）」功能則代表 Anthropic 在 Agentic 場景的務實策略——與其宣稱 AI 完全可靠，不如讓模型主動在回報前確認自己的答案。這是降低 Agentic 任務「靜默錯誤（Silent Failure）」風險的重要設計。

## 🔗 相關連結
- [原文連結（Anthropic）](https://www.anthropic.com/news/claude-opus-4-7)
- [Claude Opus 4.7 API 文件](https://platform.claude.com/docs/en/about-claude/models/whats-new-claude-4-7)
- [AWS Bedrock Claude Opus 4.7 公告](https://aws.amazon.com/blogs/aws/introducing-anthropics-claude-opus-4-7-model-in-amazon-bedrock/)
- [Axios 分析：Opus 4.7 vs Mythos](https://www.axios.com/2026/04/16/anthropic-claude-opus-model-mythos)

## 📓 學習筆記
- [[2026-05-23-學習-Claude Opus 4.7 自我驗證與高解析視覺|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-23*

---
title: "SubQ：首款次二次方 LLM，12M Token 上下文、成本降千倍"
date: 2026-05-23
source: SiliconANGLE / The New Stack
url: https://siliconangle.com/2026/05/05/subquadratic-launches-29m-bring-12m-token-context-windows-ai/
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - 次二次方注意力
  - LLM架構
  - 長上下文
  - SSA
  - 新模型
created: 2026-05-23
---

> [!info] 文章資訊
> - **來源**：[SiliconANGLE / The New Stack](https://siliconangle.com/2026/05/05/subquadratic-launches-29m-bring-12m-token-context-windows-ai/)
> - **發布日期**：2026-05-05
> - **分類**：技術理論

## 📝 重點摘要

邁阿密新創 Subquadratic 於 2026 年 5 月 5 日發布 **SubQ**，宣稱是史上第一款完全基於次二次方（Subquadratic）線性縮放注意力架構的商業 LLM，支援 **1,200 萬（12M）Token 的超長上下文視窗**。核心技術 SSA（Subquadratic Sparse Attention）讓計算複雜度從 O(n²) 降至 O(n)，在 100 萬 Token 長度下比 FlashAttention 快 52 倍、成本約為 Claude Opus 或 GPT-5.5 的五分之一，在 12M Token 時算力需求比其他前沿模型低約千倍。公司同步完成 2,900 萬美元種子輪融資。

## 📖 全文內容

⚠️ 全文抓取失敗，以下為搜尋結果摘要整理。

### 公司與團隊背景

**Subquadratic** 是一家總部位於佛羅里達州邁阿密的 AI 新創公司，由兩位創辦人領導：
- **Justin Dangel**（CEO）
- **Alexander Whedon**（CTO）：前 Meta 生成式 AI 負責人（Head of GenAI）

公司在 2026 年 5 月 5 日從隱匿模式（Stealth Mode）正式亮相，同步發布首款模型 SubQ 並完成種子輪融資。

### 技術核心：Subquadratic Sparse Attention（SSA）

SubQ 的核心技術是 **SSA（Subquadratic Sparse Attention，次二次方稀疏注意力機制）**：

**傳統 Transformer 的問題**：
- 標準自注意力（Self-Attention）計算複雜度為 O(n²)——上下文長度每增加一倍，算力消耗增加 4 倍
- 即使 FlashAttention 等優化版本，在極長上下文下仍面臨算力和記憶體挑戰

**SSA 的解決方案**：
- 計算複雜度降至 **O(n)**——與上下文長度呈線性比例縮放
- 這使 12M Token 的超長上下文在算力上「可負擔」
- 不依賴近似（Approximation）方法，而是全新的注意力架構設計

### 效能數據（廠商自評，尚未獨立驗證）

| 指標 | SubQ 表現 |
|------|-----------|
| 上下文視窗 | 12,000,000 Token（12M）|
| 速度 vs FlashAttention（1M Token）| **52 倍**更快 |
| 成本 vs Claude Opus / GPT-5.5 | 約 **1/5** |
| 算力 vs 其他前沿模型（12M Token）| 降低約 **1,000 倍** |

⚠️ **注意**：以上效能數據均由 Subquadratic 公司自行發布，為單次測試結果，**尚未經第三方獨立重現驗證**。

### 融資細節

- **融資輪次**：種子輪（Seed Round）
- **融資金額**：2,900 萬美元（$29M）
- **報告估值**：5 億美元（$500M）
- **融資時間**：2026 年 5 月

### 應用場景

12M Token 的上下文視窗為下列場景打開大門：
1. **完整代碼庫分析**：一次輸入整個大型軟體項目的代碼
2. **超長文件處理**：法律合約全文、學術論文集、財務報告完整分析
3. **多輪深度對話**：保存超長歷史紀錄的連續對話應用
4. **大規模 RAG 替代**：直接把大量文件放入上下文，無需分塊向量檢索

## 💡 觀察與啟發

SubQ 的「12M Token 上下文」宣言，代表線性注意力架構的商業化正在提速。技術上，SSA 走的是與 ASI-ARCH 發現的線性注意力架構（如 PathGateFusionNet）同一方向——以 O(n) 複雜度取代 O(n²) 的 Transformer 注意力。

最重要的警示：**SubQ 的效能數據尚未被獨立機構驗證**，「千倍成本優勢」這類數字在 AI 領域屢見不鮮地被誇大。真正的考驗是在標準基準（如 MMLU、HumanEval、RULER 長上下文 Benchmark）上與 GPT-5.5、Claude Opus 4.7 的直接比較——這些數據目前尚未公開。

對企業評估而言，SubQ 是一個值得觀察的架構方向，但不宜在獨立基準出爐前就大規模投入。

## 🔗 相關連結
- [原文連結（SiliconANGLE）](https://siliconangle.com/2026/05/05/subquadratic-launches-29m-bring-12m-token-context-windows-ai/)
- [The New Stack 報導](https://thenewstack.io/subquadratic-12-million-context-window/)
- [SubQ 官網](https://subq.ai/)
- [ExplainX 技術分析](https://explainx.ai/blog/subq-ssa-sparse-attention-12m-context-2026)

## 📓 學習筆記
- [[2026-05-23-學習-SubQ 次二次方稀疏注意力機制|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-23*

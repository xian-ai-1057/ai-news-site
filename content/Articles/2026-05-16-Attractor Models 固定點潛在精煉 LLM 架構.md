---
title: "Attractor Models: Fixed-Point Latent Refinement for Language Models (ICLR 2026)"
date: 2026-05-16
source: ICLR 2026 / OpenReview
url: https://openreview.net/forum?id=qnLj1BEHQj
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - ICLR
  - LLM架構
  - 固定點迭代
  - Transformer
created: 2026-05-16
---

# Attractor Models：以固定點迭代精煉潛在表示，打破 Transformer 深度天花板

> [!info] 文章資訊
> - **來源**：[ICLR 2026 / OpenReview](https://openreview.net/forum?id=qnLj1BEHQj)
> - **發布日期**：2026-05（ICLR 2026 發表）
> - **分類**：技術理論

## 📝 重點摘要

ICLR 2026 接收論文「Attractor Models」提出一種新型語言模型架構：在標準骨幹模組（backbone）輸出嵌入後，增加一個「吸子模組（Attractor Module）」以隱式微分求解固定點（fixed point），對輸出嵌入進行迭代精煉，且梯度計算的記憶體消耗不隨迭代次數增加。在大規模語言模型預訓練與小型推理模型兩個場景上，Attractor Models 均超越標準 Transformer 與穩定迴圈模型（stable looped models），困惑度（perplexity）最高改善 **46.6%**，下游任務準確率最高提升 **19.7%**，且迭代次數可根據收斂情況自適應調整。

## 📖 全文內容

### 問題背景：Transformer 的深度擴展限制

標準 Transformer 的深度（層數）在訓練時固定，推理時每個 token 都使用完全相同的計算路徑。這帶來兩個限制：

1. **計算深度無法自適應**：簡單 token 和困難 token 使用同等算力，效率低下。
2. **固定深度的天花板**：增加層數帶來的邊際收益遞減，且訓練成本線性上升。

此前有研究嘗試「迴圈模型（Looped Models）」，即多次重複同一層的計算，但這類方法難以穩定訓練，且梯度爆炸問題嚴重。

### Attractor Models 的核心設計

Attractor Models 由兩個模組組成：

**1. 骨幹模組（Backbone Module）**
標準的 Transformer 骨幹，先對輸入序列進行一次前向傳遞，產生初始輸出嵌入。

**2. 吸子模組（Attractor Module）**
接收骨幹模組的輸出嵌入作為初始值，通過以下方式進行迭代精煉：
- 以「固定點問題（fixed-point problem）」的形式建構：尋找使吸子模組輸出等於輸入的嵌入向量 $z^* = f(z^*)$
- 使用「隱式微分（Implicit Differentiation）」計算梯度，無需展開完整的迭代計算圖，因此記憶體消耗在有效計算深度上保持恆定
- 迭代次數根據收斂條件自適應選擇：容易的 token 快速收斂，困難的 token 自動增加迭代次數

### 性能表現

| 場景 | 對比基線 | 改善幅度 |
|---|---|---|
| 大規模 LLM 預訓練 | 標準 Transformer | 困惑度改善最高 46.6% |
| 小型推理模型 | 穩定迴圈模型 | 下游準確率提升最高 19.7% |

Attractor Models 在兩種場景下均實現「Pareto 改善」——即在計算量相同的前提下，性能全面優於基線，沒有任何指標退步。

### 與 Concept Attractors（同期研究）的關係

同樣在 ICLR 2026 發表的另一篇論文「Concept Attractors in LLMs and their Applications」從不同角度探討 LLM 的吸子特性——它發現 LLM 的 Transformer 層可被視為迭代函數系統（Iterated Function System），概念在層間形成吸子聚類。該論文進一步展示，通過對吸子進行輕量化介入，可以在不需要微調的情況下解決程式語言翻譯、幻覺減少、合成資料生成等問題。兩篇論文共同揭示：從動態系統視角理解 LLM 正成為一個重要研究方向。

## 💡 觀察與啟發

Attractor Models 的最有趣之處在於它用「動態系統」的語言重新詮釋了 LLM 的計算深度問題：與其讓模型固定深度地處理所有 token，不如讓每個 token 的計算深度根據收斂難易程度自適應調整。這個思路在概念上接近 Chain-of-Thought 的「思考時間」理念，但在架構層面實現，效率更高。

隱式微分的使用是技術上的關鍵突破——它讓「任意深度迭代精煉」成為可微分、可訓練的操作，繞開了迴圈模型的訓練不穩定問題。這個技術路徑與 DEQ（Deep Equilibrium Models）等早期固定點神經網路研究一脈相承，但在 LLM 規模上的成功驗證具有重大意義。

## 🔗 相關連結
- [論文原文（OpenReview）](https://openreview.net/forum?id=qnLj1BEHQj)
- [Concept Attractors in LLMs（同期相關論文）](https://arxiv.org/html/2601.11575v1)
- [Unveiling Attractor Cycles in LLMs（ACL 2025）](https://aclanthology.org/2025.acl-long.624/)

## 📓 學習筆記
- [[2026-05-16-學習-Attractor Models 固定點潛在精煉架構|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-16*

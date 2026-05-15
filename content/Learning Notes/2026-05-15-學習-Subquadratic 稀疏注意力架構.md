---
title: Subquadratic 稀疏注意力架構
date: 2026-05-15
type: learning-note
source_article: "[[2026-05-15-SubQ Subquadratic LLM 架構突破]]"
topic: Subquadratic Sparse Attention / Transformer 架構替代方案
difficulty: 中階
tags:
  - AI
  - 學習筆記
  - Transformer
  - 注意力機制
  - 稀疏注意力
  - 架構創新
created: 2026-05-15
---

# Subquadratic 稀疏注意力架構：打破 Transformer 的計算詛咒

> [!abstract] 一句話理解
> 這是一個用來處理超長文本的 Transformer 替代架構，特別之處在於它把「每個字要跟每個字比較」這個代價極高的操作，改成「每個字只跟最相關的一些字比較」，讓計算量從隨長度平方成長，降為只隨長度線性成長。

## 🎯 為什麼重要

**它解決了什麼問題？**

標準 Transformer 的注意力機制有一個根本性的計算瓶頸：輸入長度翻倍，計算量就變成四倍（二次方縮放）。這導致當上下文窗口超過 100 萬 Token 時，計算成本變得令人望而卻步。

在此技術出現前，業界通常以兩種方式繞過這個問題：
1. **RAG（檢索增強生成）**：不把所有資訊塞進上下文，而是先「檢索」出相關段落再輸入模型——但這增加了工程複雜度和潛在的資訊偏差。
2. **設定硬性上下文上限**：大多數模型限制在 12.8 萬至 100 萬 Token，超過就截斷。

Subquadratic 稀疏注意力的突破在於：它從架構層面解決問題，讓計算量線性增長，從而使 1200 萬 Token 的上下文在成本上可行。

## 🧠 入門解說（用類比理解）

**讀書的方式**

想像你在讀一本 1200 頁的書，你需要理解第 800 頁的某個情節。

- **密集注意力**的做法：回頭把前 799 頁的每一頁都重新瀏覽一遍，確認哪些頁面與第 800 頁有關係。頁數越多，工作量越龐大。

- **稀疏注意力**的做法：根據第 800 頁的主題，先快速判斷「這頁可能跟第 50 頁、第 340 頁、第 612 頁有關」，只精讀這幾頁。其他 790 多頁可能完全不相關，就跳過。

稀疏注意力的智慧在於：**大多數情況下，一個 Token 只和其他一小部分 Token 有強烈的語義關係**。密集注意力做了很多「多餘的比較」，稀疏注意力省去了這些不必要的工作。

## 🔑 重點原理

1. **二次方縮放的根源**：傳統 Transformer 的自注意力機制計算每對 Token 之間的相關性。如果有 N 個 Token，就有 N×N 對，計算量為 O(N²)。這就是「二次方」的由來。

2. **稀疏注意力的核心思想**：對每個 Token，只計算與它「最相關」的 K 個 Token 的注意力，而非所有 Token。K 是一個固定的小數字，與 N 無關。這讓複雜度降至 O(N·K) = O(N)，也就是線性縮放。

3. **如何找到「最相關」的 Token**？這是技術挑戰所在。SubQ 的 Subquadratic Selective Attention（SSA）使用一個輕量級的選擇機制，快速篩選出每個 Token 的相關候選集。具體選擇算法是 Subquadratic 的核心技術（未公開細節）。

4. **精度的取捨**：理論上稀疏注意力可能「錯過」某些遠距離的重要關聯。SubQ 聲稱在 RULER 128K 基準測試上達到 95% 準確率（密集注意力模型約 94%），顯示精度損失在可接受範圍內，甚至有所改善。

5. **線性與二次方的成本差異**：在百萬 Token 規模時，「52倍速度、50倍成本優勢」的背後，就是線性 vs. 二次方的數學差距。N = 1,000,000 時，N² = 10¹²，而線性縮放的計算量僅為 N = 10⁶。

## 📊 視覺化說明

### 計算量成長比較

```mermaid
graph LR
    A[輸入 Token 數量] --> B{縮放方式}
    B -->|密集注意力 O(N²)| C[100K tokens → 10,000,000,000 次操作]
    B -->|稀疏注意力 O(N×K)| D[100K tokens → 100,000 × K 次操作]
    C --> E[1M tokens → 1兆次操作 💥]
    D --> F[1M tokens → 100萬×K次操作 ✅]
```

### 方法比較表

| 維度 | 密集注意力（傳統） | 稀疏注意力（SSA） |
|------|-----------------|----------------|
| 計算複雜度 | O(N²) | O(N) |
| 100萬 Token 成本 | ~$2,600（Claude Opus 基準） | ~$8（SubQ） |
| 上下文上限 | 實際 ~1M Token | 12M Token（已展示） |
| 準確率（RULER 128K） | 94% | 95% |
| 需要 RAG 嗎？ | 通常需要 | 不需要（足夠長直接放入） |

## 🔍 與既有技術的差異

**vs. 滑動窗口注意力（Sliding Window Attention）**
滑動窗口只關注相鄰的 Token，適合語言連貫性但無法捕捉長距離依賴。SSA 不限於相鄰，選擇全文中最相關的 Token，保留長距離關係能力。

**vs. 線性注意力（Linear Attention）**
線性注意力通過近似方法降低複雜度，但通常犧牲了較多的表達能力和準確性。SSA 採用「選擇性」而非「近似性」的路徑，聲稱在準確率上有更好的保留。

**vs. RAG（檢索增強生成）**
RAG 在模型外部進行資訊篩選，稀疏注意力在模型內部進行。RAG 依賴人工設計的檢索策略，稀疏注意力是端到端學習的。二者並非互斥：在極長上下文場景下可能仍需要結合。

## 📚 關鍵詞對照表

| 中文 | 英文 | 簡短解釋 |
|------|------|---------|
| 注意力機制 | Attention Mechanism | Transformer 理解 Token 間關係的核心計算 |
| 密集注意力 | Dense Attention | 每個 Token 與所有其他 Token 計算相關性 |
| 稀疏注意力 | Sparse Attention | 每個 Token 只與少數相關 Token 計算相關性 |
| 二次方縮放 | Quadratic Scaling | 計算量以輸入長度的平方成長 |
| 線性縮放 | Linear Scaling | 計算量與輸入長度成正比成長 |
| 上下文窗口 | Context Window | 模型一次能處理的最大輸入長度 |
| Token | Token | 文字被分割後的基本計算單位（約 0.75 個英文單字） |
| RAG | Retrieval-Augmented Generation | 檢索增強生成，用外部知識庫補充上下文 |
| SSA | Subquadratic Selective Attention | SubQ 的稀疏注意力機制名稱 |

## 🛠️ 可能的應用場景

1. **整個程式碼庫分析**：SubQ Code 可以將整個大型程式碼庫（數百萬 Token）加載到單一上下文進行跨文件推理，無需多個 RAG 代理協調。

2. **法律文件審查**：合約、法規文件動輒數百頁，超長上下文讓模型能夠直接比對文件各部分的前後一致性。

3. **長期對話記憶**：不再需要將長對話歷史壓縮或截斷，可以保留完整的互動記錄。

4. **多文件研究彙整**：同時將大量研究論文或報告放入上下文，讓模型進行跨文件的綜合分析。

5. **基因組學/生物序列分析**：生物序列通常極長，稀疏注意力可讓模型直接處理更完整的基因組數據。

## 📖 學習路徑建議

1. **先讀**：Vaswani et al., "Attention Is All You Need"（2017）——理解標準 Transformer 和密集注意力的基礎
2. **再讀**：Longformer 論文（2020）——了解早期稀疏注意力的開創性工作（滑動窗口 + 全局注意力）
3. **再讀**：本文（SubQ 的 SiliconANGLE 報導）
4. **進階**：BigBird、Flash Attention（高效注意力計算），以及 Mamba（State Space Model，另一條脫離 Transformer 的路線）

## 🔗 延伸閱讀
- 原文連結：[Subquadratic launches with $29M](https://siliconangle.com/2026/05/05/subquadratic-launches-29m-bring-12m-token-context-windows-ai/)
- 對應新聞筆記：[[2026-05-15-SubQ Subquadratic LLM 架構突破]]
- SubQ 官方介紹：[subq.ai/introducing-subq](https://subq.ai/introducing-subq)
- DataCamp 解析：[SubQ AI Explained](https://www.datacamp.com/blog/subq-ai-explained)

---
*由 Claude 自動整理於 2026-05-15*

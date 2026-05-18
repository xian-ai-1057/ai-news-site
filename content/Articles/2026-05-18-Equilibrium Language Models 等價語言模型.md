---
title: "Equilibrium Language Models"
date: 2026-05-18
source: ICLR 2026 / OpenReview
url: https://openreview.net/forum?id=lqJT6xmuH3
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - 等價模型
  - 固定點求解
  - 模型壓縮
  - 邊緣推理
  - ICLR2026
created: 2026-05-18
---

# Equilibrium Language Models（ELMs）：用固定點求解取代 Transformer 多層堆疊

> [!info] 文章資訊
> - **來源**：[OpenReview / ICLR 2026 會議論文](https://openreview.net/forum?id=lqJT6xmuH3)
> - **發布日期**：2026 年 ICLR 會議發表
> - **分類**：技術理論

## 📝 重點摘要

由華為、香港科技大學與香港中文大學團隊合著的 ICLR 2026 論文《Equilibrium Language Models》提出一種突破性的 LLM 壓縮框架——**ELMs（Equilibrium Language Models）**，把多層 Transformer 替換為一個輕量級「固定點網路（fixed-point network）」，將傳統的深度層堆疊運算重新詮釋為**「求解一個等價狀態（equilibrium state）」**。為實現這個目標，作者提出兩項關鍵技術：**Group Pruning Policy Optimization（自動學習最佳剪枝區間）**與 **One-Step KV-Cache（只儲存最終迭代快取以大幅降低記憶體開銷）**。實驗顯示 ELMs 能在剪掉 28% 參數的前提下，仍保留 99% 的原始密集 fine-tuned LLM 精度，涵蓋常識推理、數學求解、程式生成等任務。這項工作將「深度等價模型（Deep Equilibrium Models, DEQ）」這個自 2019 年起即被研究的範式正式應用到 LLM 規模，為**邊緣裝置部署超大型 LLM** 開出新路徑。

## 📖 全文內容

### 從 Deep Equilibrium Models 到 ELMs

「深度等價模型（DEQ）」的概念由 Carnegie Mellon 的 Shaojie Bai 與 Zico Kolter 在 2019 年提出——核心思想是：**與其堆疊 N 個不同的層，不如重複套用同一個層直到輸入收斂為止**。數學上，這等價於求解 `z* = f(z*, x)` 這個固定點方程，其中 z 是隱藏狀態、x 是輸入。

DEQ 的優勢是**參數量大幅減少**（只需一個層的參數）、**記憶體效率高**（反向傳播只需一個層的活化）。但長期以來，DEQ 難以擴展到大型 LLM 規模——固定點求解的不穩定性、訓練收斂困難、與現代 Transformer 設計的相容性問題，都是阻礙。

ELMs 是第一個成功把 DEQ 框架擴展到當代 LLM 規模並達到實用精度的工作。

### 關鍵技術一：Group Pruning Policy Optimization

ELMs 不會把整個 Transformer 替換為單一固定點層，而是**選擇性地把某些「層群組」替換為固定點求解**。問題是：哪些層該被群組化？群組大小該多大？

作者用強化學習（Policy Optimization）來自動搜尋這個問題：把「保留多少 dense 層、把多少層折成固定點群組」當作 RL 的決策，獎勵設計為「精度保留率 × 壓縮率」。

訓練後的策略會輸出每個 LLM 的最佳剪枝佈局——對 7B 模型，典型結果是把 32 層中相鄰的 8-12 層折成 2-3 個固定點群組，保留前後的關鍵 dense 層處理輸入嵌入與輸出投影。

### 關鍵技術二：One-Step KV-Cache

傳統 LLM 推理的記憶體瓶頸是 KV-Cache（注意力的鍵值快取）——每一層、每一個 token 都要儲存 K 和 V 矩陣。對固定點網路而言，這個問題更嚴重，因為理論上每次迭代都會產生一份新的 KV 對。

ELMs 的解法是 **One-Step KV-Cache**：**只儲存固定點迭代的最終結果**，丟棄中間迭代的 KV。實驗顯示，這個近似在精度上幾乎沒有損失（< 0.5%），但記憶體開銷可降到單層 KV-Cache 的水準。

這項技術的價值在於——它讓固定點網路的記憶體使用「不隨迭代次數線性增長」，這是 ELMs 能在邊緣裝置部署的關鍵。

### 性能表現

ELMs 在常用 LLM benchmark 上的表現：

| 維度 | 密集 fine-tuned 基準 | ELMs |
|---|---|---|
| 參數量 | 100% | **72%（剪掉 28%）** |
| 常識推理（CommonsenseQA） | 100% 基線 | **99.2%** |
| 數學（GSM8K） | 100% 基線 | **98.7%** |
| 程式生成（HumanEval） | 100% 基線 | **99.0%** |
| 推理速度 | 1.0x | **1.3-1.5x（視批次大小）** |
| 推理記憶體 | 100% | **65-70%** |

精度保留 99%、參數削減 28%、推理速度提升 30-50%、記憶體開銷降 30-35%——這是傳統剪枝難以同時達成的「四贏」。

### 與其他壓縮路徑的差異

2026 年 LLM 壓縮技術大致分四條路線：

| 路線 | 代表方法 | 核心思想 | ELMs 對比優勢 |
|---|---|---|---|
| **量化** | INT4 / FP8 | 降低數值精度 | ELMs 與量化正交，可疊加使用 |
| **剪枝** | Wanda、SparseGPT | 移除不重要權重 | ELMs 剪「整層」而非「個別權重」 |
| **蒸餾** | DistilBERT、TinyLlama | 訓練小模型模仿大模型 | ELMs 不需重新訓練學生模型 |
| **固定點等價** | **ELMs（本文）** | 把多層折成一個層的迭代 | 結構性壓縮，相容其他三條路線 |

### 對邊緣部署的意義

ELMs 最有可能的落地場景是**邊緣 LLM 推理**——手機、車載、IoT 等記憶體受限環境。傳統做法是「把 70B 模型蒸餾到 7B」，但精度損失通常 10-20%。ELMs 提供另一條路：「把 70B 模型壓到 50B 但保留 99% 精度，且推理更快」——對需要極致精度但仍要在邊緣跑的應用（如車載對話、隱私敏感醫療助理）非常有吸引力。

## 💡 觀察與啟發

ELMs 的真正意義不只是「又一個壓縮方法」，而是**把固定點/等價/動態系統這套數學語言正式引入主流 LLM**。在這之前，DEQ 雖然理論優雅但只在小規模實驗中存在；ELMs 第一次證明它能在當代 LLM 規模上達到實用精度。這條路線打開了好幾個新的研究方向：例如「自適應深度推理」（簡單問題少迭代、難題多迭代）、「條件式固定點」（不同 token 走不同迭代路徑）、「固定點解的不確定性量化」（用收斂速度估計信心度）。

從產業角度看，ELMs 與 Concept Attractors、Mamba-3 這群論文一起，標誌著 2026 年 LLM 研究從「堆規模拚 SOTA」進入「結構性效率優化」的階段。當前沿模型的精度已逼近天花板，下一個競爭點是「在更小的硬體上跑更聰明的模型」。這對台灣半導體與邊緣 AI 產業是利多——當模型可以壓到 30-50B 規模並在手機/車載上運行，邊緣 AI 晶片的市場規模會大幅增加。值得追蹤的是：華為這個團隊的下一步是否會把 ELMs 整合到華為自家的昇騰晶片棧，這可能是中國 AI 自主鏈的關鍵一環。

## 🔗 相關連結
- [Equilibrium Language Models 論文（OpenReview）](https://openreview.net/forum?id=lqJT6xmuH3)
- [ELMs PDF 全文](https://openreview.net/pdf?id=lqJT6xmuH3)
- [原始 Deep Equilibrium Models（NeurIPS 2019）](https://arxiv.org/abs/1909.01377)
- [ICLR 2026 論文清單](https://iclr.cc/virtual/2026/papers.html)

## 📓 學習筆記
- [[2026-05-18-學習-深度等價模型與固定點 LLM|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-18*

---
title: "NVIDIA Nemotron 3：開源多模態 AI 代理模型家族發布"
date: 2026-05-25
source: NVIDIA Newsroom
url: https://nvidianews.nvidia.com/news/nvidia-debuts-nemotron-3-family-of-open-models
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - NVIDIA
  - 開源模型
  - 多模態
  - AI Agent
  - Nemotron
created: 2026-05-25
---

> [!info] 文章資訊
> - **來源**：[NVIDIA Newsroom](https://nvidianews.nvidia.com/news/nvidia-debuts-nemotron-3-family-of-open-models)
> - **發布日期**：2026-05-25
> - **分類**：技術理論

## 📝 重點摘要

NVIDIA 發布 Nemotron 3 開源模型家族，包含 Nano、Super、Ultra 三個規模，專為建構高效代理 AI 應用而設計。其中最受矚目的是 **Nemotron 3 Nano Omni**，這是一個 300 億參數（僅 30 億參數激活）的多模態模型，統一了視覺、音訊與語言能力，專為邊緣端 AI 代理設計，效率比上一代提升 4 倍。Nemotron 3 Super 則是 1200 億參數（120 億激活）的代理旗艦模型，吞吐量達 5 倍提升，專為大規模自主代理系統設計。這是 NVIDIA 首次以完整生態（模型 + 訓練資料集 + 強化學習環境）形式發布，試圖為 AI 代理開發建立開源標準。

## 📖 全文內容

⚠️ 全文抓取失敗，以下為搜尋結果摘要整理。

### Nemotron 3 家族概覽

NVIDIA Nemotron 3 是 Nemotron 系列的第三代，延續了 NVIDIA 在開源高效 LLM 領域的佈局。此次發布定位為「建構代理 AI 應用最高效的開源模型家族」，包含三個尺寸：

| 模型 | 總參數 | 激活參數 | 核心特點 |
|---|---|---|---|
| Nemotron 3 Nano Omni | 300 億 | 30 億 | 多模態（視覺+音訊+語言）、邊緣部署 |
| Nemotron 3 Super | 1,200 億 | 120 億 | 高吞吐量、大規模代理系統 |
| Nemotron 3 Ultra | 尚未公布 | 尚未公布 | 最高精度與推理性能 |

### Nano Omni：邊緣多模態代理

**Nemotron 3 Nano Omni** 是此次發布的技術亮點之一，也是整個 Omni 系列的首款多模態版本：

**架構創新**
- 採用「混合專家架構（Hybrid Mixture-of-Experts）」突破
- 300 億總參數，但每次推理僅激活約 30 億參數
- 實現了比 Nemotron 2 Nano 高 4 倍的吞吐量（tokens per second）

**多模態統一**
- 統一整合視覺（vision）、音訊（audio）、語言（language）三個模態
- 專為「多代理系統大規模協同」而優化
- 設計目標是可在 NVIDIA RTX PC、DGX Sparks 等本地端硬體上運行

### Super：大規模代理的推理骨幹

**Nemotron 3 Super** 是為企業大規模代理 AI 系統設計的旗艦模型：

- 1,200 億總參數，120 億激活參數
- 吞吐量比前代提升 5 倍
- 專注於「複雜代理 AI 系統的高準確率完成」
- 具備進階推理能力，適合代理任務中的自主決策

### 開源生態系統

NVIDIA 此次不只發布模型本身，還同步釋出：
- **訓練資料集**：專為代理 AI 訓練設計的高品質資料集
- **強化學習環境（RL Environments）**：建構自主代理所需的模擬環境
- **強化學習函式庫（RL Libraries）**：可直接用於微調代理行為的工具

NVIDIA 聲稱，這是業界首次以完整套件形式發布的代理 AI 開源生態系統，目標是讓開發者能夠在 NVIDIA 的硬體與軟體生態上端到端地建構高效代理應用。

### 市場定位：與其他開源模型的競爭

Nemotron 3 直接競爭的對象包括：
- **Meta LLaMA 系列**：目前最廣泛部署的開源 LLM
- **Mistral 系列**：以效率聞名的歐洲開源模型
- **Google Gemma 系列**：Google 的輕量開源模型

Nemotron 3 的差異化在於：以「代理 AI（Agentic AI）」為核心設計場景，並提供完整的訓練生態（不只是模型權重），以及對 NVIDIA 硬體的深度優化。

## 💡 觀察與啟發

Nemotron 3 的發布顯示 NVIDIA 正從「晶片供應商」積極轉型為「AI 生態系統平台商」。提供完整的模型 + 訓練資料集 + RL 環境的策略，類似 Google 對 Tensorflow/JAX 生態的建構，試圖讓 AI 開發者對 NVIDIA 產生更深的平台依賴。

Nano Omni 的多模態邊緣部署設計特別值得關注：隨著 AI 代理逐漸從雲端走向本地端（edge），能在 RTX PC 等消費級硬體上運行的高效多模態模型，將成為未來「AI PC」概念落地的關鍵。這與 Microsoft 在 AI PC 上的 Copilot+ 佈局形成呼應。

對於台灣科技業而言，NVIDIA 強化開源生態的做法，意味著台灣 AI 硬體廠商（包括伺服器、邊緣設備製造商）可以找到更清晰的「跑 Nemotron」應用場景，有助於 AI 硬體的差異化定位。

## 🔗 相關連結
- [原文連結（NVIDIA Newsroom）](https://nvidianews.nvidia.com/news/nvidia-debuts-nemotron-3-family-of-open-models)
- [Nemotron 3 Nano Omni 詳細介紹](https://blogs.nvidia.com/blog/nemotron-3-nano-omni-multimodal-ai-agents/)
- [Nemotron 3 Super 吞吐量提升](https://blogs.nvidia.com/blog/nemotron-3-super-agentic-ai/)
- [NVIDIA Nemotron 研究頁面](https://research.nvidia.com/labs/nemotron/Nemotron-3/)

## 📓 學習筆記
- [[2026-05-25-學習-NVIDIA Nemotron 3 混合專家架構代理模型|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-25*

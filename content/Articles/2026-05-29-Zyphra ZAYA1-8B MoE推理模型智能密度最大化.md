---
title: "Zyphra ZAYA1-8B：MoE 推理模型智能密度最大化，以 8B 參數超越百億級模型"
date: 2026-05-29
source: VentureBeat / MarkTechPost / PR Newswire
url: https://venturebeat.com/technology/meet-zaya1-8b-a-super-efficient-open-reasoning-model-trained-on-amd-instinct-mi300-gpus
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - MoE
  - LLM
  - 推理模型
  - 開源模型
  - AMD
created: 2026-05-29
---

> [!info] 文章資訊
> - **來源**：[VentureBeat](https://venturebeat.com/technology/meet-zaya1-8b-a-super-efficient-open-reasoning-model-trained-on-amd-instinct-mi300-gpus)
> - **發布日期**：2026-05-07
> - **分類**：技術理論

## 📝 重點摘要

Zyphra 於 2026 年 5 月初正式發布 ZAYA1-8B，一個採用混合專家（Mixture of Experts, MoE）架構的推理模型，名義參數量為 8B，但推理時僅啟動約 7.6 億個活躍參數。透過三項架構創新（壓縮卷積注意力 CCA、MLP 路由器、學習殘差縮放），ZAYA1-8B 實現了「每參數智能密度」（Intelligence Density per Parameter）兩倍於目前最佳同類開源推理模型，數學與程式碼性能可媲美乃至超越 Claude 4.5 Sonnet、Gemini 2.5 Pro、DeepSeek V3.2 等前沿模型。模型已在 Hugging Face 開源，並可透過 Zyphra Cloud 免費使用。

## 📖 全文內容

### 發布背景

Zyphra 是一間專注於高效率 AI 架構研究的公司，其前作 ZAYA1-base 已建立起 AMD 原生訓練堆疊。ZAYA1-8B 是在此基礎上推出的首款完整推理模型，主打「以最小的算力代價獲得最大的推理能力」。

發布時間：2026 年 5 月 6-7 日。模型在 AMD Instinct MI300X 叢集上訓練，使用 IBM Cloud 基礎設施和 AMD Pensando Pollara 網路。

### 核心技術創新

**1. 壓縮卷積注意力（Compressed Convolutional Attention, CCA）**

CCA 是 Zyphra 自研的更高效注意力變體。標準 Transformer 的自注意力機制在計算複雜度上是序列長度的平方（O(n²)），對長序列成本極高。CCA 透過卷積壓縮，在維持注意力的語意捕捉能力的同時，顯著降低計算量。

**2. MLP 路由器（MLP-based Expert Router）**

傳統 MoE 架構通常使用線性路由器（linear router）來決定每個 token 發送到哪個「專家（Expert）」。ZAYA1-8B 改用基於 MLP 的路由器，提升了路由穩定性。路由不穩定會導致模型在訓練時出現「專家崩潰（Expert Collapse）」問題（少數專家被過度使用，多數專家幾乎閒置），MLP 路由器有效緩解了這一問題。

**3. 學習殘差縮放（Learned Residual Scaling）**

這是一種透過可學習的縮放係數來控制殘差連接中向量範數（residual norm）在深度方向增長的技術，幾乎不增加參數量和計算量（FLOP），卻能穩定訓練並改善收斂。

### 架構規格

- **名義參數量**：8B
- **推理時活躍參數**：約 7.6 億（~760M）
- **架構類型**：Mixture of Experts（MoE）
- **訓練硬體**：AMD Instinct MI300X（非 NVIDIA GPU）
- **訓練框架**：Zyphra 自研 AMD 原生訓練堆疊

### 性能表現

根據 Zyphra 公布的基準測試結果，ZAYA1-8B 的主要成績：

- **數學推理**（AIME、HMMT）：達到或超越 Claude 4.5 Sonnet 和 Gemini 2.5 Pro
- **程式碼生成**（LiveCodeBench）：具競爭力
- **科學推理**（GPQA-Diamond）：達到前沿水準
- **指令遵循**（IFEval、IFBench）：強競爭力
- **APEX 短列表基準**（APEX-shortlist）：超越 DeepSeek-V3.2 和 GPT-OSS-120B（high setting）

Zyphra 聲稱，上述三項技術合在一起使 ZAYA1-8B 達到「每活躍參數智能密度是目前最佳同類開源推理模型的約兩倍」。

### 可用性與授權

- **Hugging Face**：模型權重已公開，免費下載
- **Zyphra Cloud**：作為 serverless endpoint 免費提供（cloud.zyphra.com）
- **授權**：開放使用，適合研究和商業應用

### AMD 生態系的戰略意義

值得注意的是，ZAYA1-8B 完全在 AMD 而非 NVIDIA 的 GPU 上訓練，這在目前的 AI 訓練領域仍屬少數。Zyphra 此舉在技術上驗證了 AMD MI300X 可以支撐高品質推理模型訓練，具有打破 NVIDIA 壟斷訓練市場的潛在示範意義。

同時，5 月 15 日 Zyphra 還發布了 ZAYA1-8B-Diffusion-Preview——第一個從自回歸 LLM 轉換而來的 MoE 擴散模型，聲稱可達到高達 7.7 倍的推理加速，顯示 Zyphra 的技術路線正在快速擴展。

## 💡 觀察與啟發

ZAYA1-8B 代表了 2026 年 AI 模型競爭的一個重要轉向：**從純參數規模的軍備競賽，轉向「智能密度」的效率競爭**。以 8B 名義參數、7.6 億活躍參數達到或超越數十倍大小的前沿模型，直接挑戰了「更大即更好」的傳統假設。

對開發者和企業而言，ZAYA1-8B 的開源和可免費部署的特性意味著：不需要 NVIDIA A100/H100 等高昂硬體，同樣可以執行接近前沿水準的數學推理和程式碼生成任務。這對計算資源有限的新創公司和研究機構具有重要意義。

AMD MI300X 訓練成功也預示，GPU 供應鏈的競爭態勢可能在 2026-2027 年出現實質性變化。

## 🔗 相關連結
- [原文連結 - VentureBeat](https://venturebeat.com/technology/meet-zaya1-8b-a-super-efficient-open-reasoning-model-trained-on-amd-instinct-mi300-gpus)
- [PR Newswire 官方新聞稿](https://www.prnewswire.com/news-releases/zyphra-releases-zaya1-8b-a-reasoning-model-trained-on-amd-and-optimized-for-maximum-intelligence-density-per-parameter-302764700.html)
- [MarkTechPost 技術分析](https://www.marktechpost.com/2026/05/06/zyphra-releases-zaya1-8b-a-reasoning-moe-trained-on-amd-hardware-that-punches-far-above-its-weight-class/)

## 📓 學習筆記
- [[2026-05-29-學習-ZAYA1-8B MoE智能密度與壓縮卷積注意力架構|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-29*

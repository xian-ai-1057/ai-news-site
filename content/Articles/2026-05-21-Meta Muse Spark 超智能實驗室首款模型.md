---
title: "Meta Debuts Muse Spark, First AI Model Under Alexandr Wang's Superintelligence Labs"
date: 2026-05-21
source: TechCrunch
url: https://techcrunch.com/2026/04/08/meta-debuts-the-muse-spark-model-in-a-ground-up-overhaul-of-its-ai/
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - Meta
  - Muse Spark
  - Alexandr Wang
  - 多模態
  - 大型語言模型
created: 2026-05-21
---

# Meta Muse Spark：Alexandr Wang 領導的超智能實驗室首款旗艦模型正式亮相

> [!info] 文章資訊
> - **來源**：[TechCrunch](https://techcrunch.com/2026/04/08/meta-debuts-the-muse-spark-model-in-a-ground-up-overhaul-of-its-ai/)
> - **發布日期**：2026-04-08
> - **分類**：技術理論

## 📝 重點摘要

Meta 於 2026 年 4 月 8 日正式發布 **Muse Spark**，這是前 Scale AI 執行長 **Alexandr Wang** 領導的 Meta Superintelligence Labs（超智能實驗室）推出的第一款旗艦模型，標誌著 Meta 在斥資 143 億美元換取 Scale AI 49% 股份後的重大 AI 戰略轉型。Muse Spark 接受語音、文字與圖片輸入，採用多 Agent 並行推理架構，提供快速模式（Fast mode）與多種推理模式，並計劃推出「Contemplating（沉思）」模式處理複雜問題。模型已即時上線 Meta AI 應用程式與 Meta.ai 網站，後續將擴展至 Facebook、Instagram 和 WhatsApp。

## 📖 全文內容

⚠️ 全文抓取失敗，以下根據搜尋摘要整理。

### 背景：Meta 為何要重建 AI？

過去兩年，Meta 的 AI 發展策略以 **Llama 開源系列**為核心——透過開源基礎模型，建立生態、搜集回饋並降低外部研究社群的依賴。然而，執行長 **Mark Zuckerberg** 對這個策略的執行結果不滿意：Llama 4 系列的性能在多個關鍵評測上仍落後於 OpenAI 的 GPT-4o 和 Anthropic 的 Claude 3.5 系列，Meta AI 的實際使用率也低於預期。

2025 年末，Meta 採取了兩個重大行動：
1. **招募 Alexandr Wang**：以 143 億美元換取 Scale AI 49% 股份，並讓 Wang 出任 Meta Superintelligence Labs 負責人
2. **成立 Meta Superintelligence Labs**：一個獨立於原有 AI 研究部門（FAIR）的新單位，專注於前沿旗艦模型開發

Wang 帶來了 Scale AI 在**高品質資料標注**方面的核心能力——業界廣泛認為，高品質人類回饋（RLHF）資料是頂尖模型的關鍵競爭優勢。

### Muse Spark 的技術特點

**模型代號與開發週期**：
- 內部代號：**Avocado**
- 開發週期：Wang 加入後約 9 個月完成初版

**輸入輸出能力**：
- **輸入**：語音（Voice）、文字（Text）、圖片（Image）
- **輸出**：純文字（Text-only）
- 注：影片輸出和圖片生成暫未包含在初版

**推理模式架構**：
Muse Spark 採用多模式設計，類似 OpenAI o 系列的「快速/深度思考」雙模式策略：

| 模式 | 適用場景 | 計算消耗 |
|------|---------|---------|
| **Fast Mode（快速模式）** | 日常問答、休閒查詢 | 低 |
| **Reasoning Modes（推理模式）** | 複雜分析、多步驟任務 | 中 |
| **Contemplating Mode（沉思模式）** | 最複雜問題（計畫中） | 高 |

**多 Agent 並行架構**：
Muse Spark 的一個重要技術創新是「多 Agent 同時處理同一問題」——系統會同時派遣多個 Agent 從不同角度分析問題，再整合結果。Meta 表示這可在 Contemplating 模式下顯著提升複雜問題的解決速度和品質。

### 與 Llama 4 的關係

Muse Spark 不是 Llama 4 的更新版，而是**從頭全新訓練的模型**（ground-up overhaul）。Meta 官方描述這是對 AI 策略的「全面改革」：

- **Llama 系列**：繼續保持開源，服務研究社群和低成本應用場景
- **Muse Spark**：閉源旗艦模型，直接與 ChatGPT 和 Claude 競爭

從內部架構到訓練數據，Muse Spark 都是獨立的新工作，不繼承 Llama 4 的架構。

### 部署範圍與用戶觸達

Muse Spark 的最大優勢在於 Meta 平台的龐大用戶基礎：
- **即時上線**：Meta AI 應用程式、Meta.ai 網站
- **後續擴展**：Facebook（逾 30 億用戶）、Instagram、WhatsApp

這意味著 Muse Spark 的潛在用戶規模遠超 ChatGPT（約 5 億月活用戶）和 Claude——若品質達標，Meta 的分發優勢可能是決定性的競爭砝碼。

## 💡 觀察與啟發

Muse Spark 的發布是 2026 年 AI 競爭格局的重要節點。Meta 在 Llama 開源路線之外，同時建立了一條閉源旗艦模型路線，這讓它在 AI 競爭中同時具備「生態建設」和「直接 B2C/B2B 競爭」兩張牌。

最值得觀察的是 **Wang 的資料飛輪策略**：Scale AI 的核心能力是高品質資料標注，若 Meta 能將 Scale AI 的資料品質優勢系統性地應用到 Muse Spark 的後訓練（post-training）流程，在 RLHF 數據品質上建立優勢，可能是 Meta AI 追趕 OpenAI 的最快路徑。

多 Agent 並行架構也值得關注——這代表 Meta 在模型能力設計上的新思路：與其訓練一個更大的單一模型，不如讓多個較小的模型協同工作，在速度和複雜度之間取得更好的平衡。

## 🔗 相關連結
- [原文連結（TechCrunch）](https://techcrunch.com/2026/04/08/meta-debuts-the-muse-spark-model-in-a-ground-up-overhaul-of-its-ai/)
- [CNBC 報導](https://www.cnbc.com/2026/04/08/meta-debuts-first-major-ai-model-since-14-billion-deal-to-bring-in-alexandr-wang.html)
- 相關閱讀：Meta AI 策略轉型分析

## 📓 學習筆記
- [[2026-05-21-學習-Meta Muse Spark 多 Agent 並行推理架構|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-21*

---
title: "Cerebras 以 WSE-3 晶片達兆參數推論新紀錄：每秒 981 tokens，比 GPU 雲快 6.7 倍"
date: 2026-05-31
source: VentureBeat
url: https://venturebeat.com/technology/cerebras-says-its-chips-run-a-trillion-parameter-ai-model-nearly-7-times-faster-than-gpu-clouds
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - Cerebras
  - 推論加速
  - AI晶片
  - Kimi
  - WSE-3
created: 2026-05-31
---

> [!info] 文章資訊
> - **來源**：[VentureBeat](https://venturebeat.com/technology/cerebras-says-its-chips-run-a-trillion-parameter-ai-model-nearly-7-times-faster-than-gpu-clouds)
> - **發布日期**：2026-05-06
> - **分類**：技術理論

## 📝 重點摘要

Cerebras Systems 以其 Wafer Scale Engine 3（WSE-3）晶片在兆參數（1 trillion）開放模型 Kimi K2.6 上達到每秒 981 個輸出 token，經第三方機構 Artificial Analysis 獨立驗證，比排名第二的 GPU 雲快 6.7 倍、比中位數推論服務商快 23 倍。這項突破的核心在於 WSE-3 擁有比 NVIDIA H100 高 7,000 倍的記憶體頻寬，直接解決了大模型推論的根本瓶頸。Cerebras 並於 2026 年 5 月 13 日以每股 185 美元完成 IPO，籌得 55.5 億美元，成為當年美國最大 IPO。

## 📖 全文內容

⚠️ 全文抓取失敗（WebFetch 返回 403），以下為多來源搜尋摘要整理。

### 背景：推論速度是新競爭前線

2026 年 AI 推論市場已從「能不能用」演變為「夠不夠快」的競爭。隨著 Kimi K2.6（Moonshot AI 於 2026 年 4 月 20 日發布）等兆參數開放模型普及，企業對低延遲推論的需求急劇上升。在這個背景下，Cerebras 利用其獨特的晶圓尺寸引擎（Wafer Scale Engine）架構，在速度競賽中取得決定性領先。

### 核心突破：981 tokens/秒獨立驗證

Artificial Analysis 於 2026 年 5 月 6 日透過 Cerebras Inference API 私有端點進行測量，得出 981 個輸出 tokens/秒的結果：

| 服務商 | Kimi K2.6 推論速度 |
|---|---|
| **Cerebras（WSE-3）** | **981 tokens/秒** |
| 排名第二（GPU 雲） | ~146 tokens/秒（估算）|
| 中位數推論服務商 | ~43 tokens/秒（估算）|
| 官方 Kimi 端點 | 明顯較慢 |

**實際延遲對比**：對於一個包含 10,000 個輸入 token、500 個輸出 token 的請求：
- Cerebras：**5.6 秒**完成全部響應
- 官方 Kimi 端點：**163.7 秒**（慢 29 倍）

### 技術原理：記憶體頻寬是關鍵

大型語言模型推論的速度瓶頸不在於計算能力（FLOPS），而在於**記憶體頻寬**——每次生成一個 token 時，模型需要從記憶體中讀取所有參數權重。

Cerebras WSE-3 的關鍵規格：
- **記憶體頻寬**：比 NVIDIA H100 高 **7,000 倍**
- **晶圓尺寸**：業界唯一採用完整晶圓（而非切割成小晶片再拼接）的 AI 加速器
- **底層架構**：單一晶片容納所有計算核心，消除了 GPU 叢集間的通訊延遲

這一設計哲學與 GPU 叢集的根本差異在於：GPU 需要將兆參數模型分散在多個 GPU 上，節點間通訊開銷（interconnect overhead）成為瓶頸；WSE-3 則在單一晶圓上集中大量 SRAM，直接解決了記憶體頻寬限制。

### Kimi K2.6 模型背景

Kimi K2.6 由中國 AI 新創 Moonshot AI 開發，於 2026 年 4 月 20 日發布：
- **規模**：兆參數（1 trillion parameters）
- **類型**：開放權重（open-weight）模型
- **特色**：強大的長上下文理解和推理能力
- **應用**：Cerebras 已開始為企業客戶提供 K2.6 推論服務

### Cerebras IPO：市場驗證

就在推論記錄發布後不久，Cerebras 於 2026 年 5 月 13 日完成 IPO：
- **定價**：每股 185 美元
- **募資**：55.5 億美元
- **市值**：上市首日幾乎翻倍，估值達 660 億美元
- **意義**：成為 2026 年美國最大 IPO，證明市場對非 GPU 推論架構的高度認可

### 更廣泛的速度突破

Cerebras 基礎設施上的其他模型也創下記錄：
- Qwen3 Coder 480B：達到 **2,000 tokens/秒**
- OpenAI 開源模型 gpt-oss-120B：達到 **3,000 tokens/秒**

這顯示 WSE-3 的記憶體頻寬優勢對各種規模的模型都有效。

## 💡 觀察與啟發

Cerebras 的速度突破標誌著 AI 基礎設施競爭正進入新階段。NVIDIA 在訓練市場擁有壓倒性優勢，但推論市場是一個全新的戰場——而推論速度恰恰是 NVIDIA H100/H200 架構的結構性弱點（記憶體頻寬問題）。

對開發者和企業而言，981 tokens/秒的速度意味著：對話體驗從「等待」變為「即時」，AI Agent 的行動-觀察循環（action-observation loop）可以在亞秒內完成，實時應用（即時翻譯、即時程式碼補全、即時文件摘要）成為可能。

這也說明了為什麼 Cerebras 的 IPO 估值如此之高——市場看到的不是一家「小眾晶片公司」，而是一個可能在推論市場挑戰 NVIDIA 主導地位的基礎設施平台。

## 🔗 相關連結
- [原文連結（VentureBeat）](https://venturebeat.com/technology/cerebras-says-its-chips-run-a-trillion-parameter-ai-model-nearly-7-times-faster-than-gpu-clouds)
- [Cerebras 官方部落格](https://www.cerebras.ai/blog/cerebras-kimi-k2-Enterprise)
- [Artificial Analysis 測量報告](https://www.cerebras.ai/blog/2026Insights)

## 📓 學習筆記
- [[2026-05-31-學習-晶圓級AI推論加速器WSE-3架構突破|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-31*

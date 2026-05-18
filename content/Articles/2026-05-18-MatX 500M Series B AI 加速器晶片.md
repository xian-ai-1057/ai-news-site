---
title: "MatX raises $500M Series B to build AI accelerator chips for data centers"
date: 2026-05-18
source: Tech Startups
url: https://techstartups.com/2026/05/11/top-startup-and-tech-funding-news-may-11-2025/
category: 新創公司
industry: ""
tags:
  - AI
  - 新創公司
  - MatX
  - AI晶片
  - ASIC
  - Nvidia挑戰者
created: 2026-05-18
---

# MatX 募資 5 億美元 Series B：客製化 AI 加速器晶片，正面挑戰 Nvidia 通用 GPU 路線

> [!info] 文章資訊
> - **來源**：[Tech Startups](https://techstartups.com/2026/05/11/top-startup-and-tech-funding-news-may-11-2025/)
> - **發布日期**：2026-05-11
> - **分類**：新創公司

## 📝 重點摘要

5 月 11 日，AI 晶片新創 **MatX** 宣布完成 **5 億美元 Series B 募資**，用於擴大資料中心 AI 加速器晶片的量產規模。這輪募資反映 2026 年資本市場對「Nvidia 通用 GPU 之外的替代方案」的強烈興趣——當 Hyperscaler 持續擴張、能源與供應吃緊，**客製化 ASIC（Application-Specific Integrated Circuit）路線**重新受到青睞。MatX 與 Cowboy Space ($275M)、Corgi ($160M)、Panthalassa ($140M)、Bluefish ($43M) 同週宣布募資，五家公司共募 1.118 億美元，主題集中在 **「AI 物理層基礎設施」**——晶片、能源、資料中心硬體、垂直應用。MatX 是這波中最受矚目的硬體賭注，預示資料中心市場將在 2026-2028 進入「ASIC vs GPU」的路線競爭新階段。

## 📖 全文內容

### MatX 簡介

MatX 由前 Google TPU 團隊核心成員 Reiner Pope 與 Mike Gunter 在 2023 年創辦，總部位於加州 Mountain View。創辦團隊的背景是**設計過 Google TPU v4 與 v5p**——這代表他們對「為 Transformer 量身訂做的 ASIC 該怎麼做」有第一手經驗。

公司核心主張：**「GPU 是為圖形設計的，TPU/ASIC 才是為 Transformer 設計的」**。MatX 認為，當 LLM 訓練與推理已成為資料中心的主流負載，繼續用 GPU（即使是 Nvidia H100/B200）是次優解——客製化 ASIC 在「每美元算力」與「每瓦算力」上都能勝出。

### Series B 投資人組合

5 億美元 Series B 的領投與跟投陣容（依公開揭露）：
- **Coatue**：領投
- **Lightspeed Venture Partners**：跟投
- **a16z**：跟投
- **Khosla Ventures**：跟投
- **NVIDIA**：**少數策略性投資**（重要訊號）

特別值得注意的是 **NVIDIA 自身也參與這輪募資**——這反映 NVIDIA 對「ASIC 路線無法完全壓制」的務實態度，選擇透過投資布局未來，而非單純對抗。

### MatX 的技術定位

MatX 不打算與 Nvidia 在「通用 AI 訓練 GPU」正面競爭，而是聚焦三個利基：

**1. LLM 推理加速器**

針對推理場景（不是訓練）做極致優化。當企業大規模部署 LLM，推理算力需求遠超過訓練——MatX 預估推理算力 2027 年將是訓練算力的 10 倍以上。

**2. 大模型專用 ASIC**

針對 70B+ 大模型的記憶體頻寬、互聯架構做特殊設計。對 7B 以下小模型，反而沒有優勢。

**3. 能效比優先**

設計目標是「每瓦 token/秒」最大化。對資料中心而言，能源成本已成為比晶片購置成本更大的開銷。

### 募資資金用途

5 億美元主要用於：
- **量產規模化**：與 TSMC 合作的 N3/N2 製程量產
- **資料中心客戶部署**：第一批超大型 Hyperscaler 客戶（傳聞包括一家美國雲端三巨頭之一）
- **下一代晶片研發**：規劃 2027 年發布的下一代產品

### 競爭格局：ASIC 玩家齊聚

MatX 並非孤軍，2026 年的 ASIC 競爭已非常激烈：

| 公司 | 募資狀況 | 路線特色 |
|---|---|---|
| **MatX** | **5 億 Series B（本輪）** | LLM 推理 ASIC、能效優先 |
| **Etched** | Series A（前期約 1.2 億） | Transformer 專用晶片 Sohu |
| **Groq** | 多輪總計 9+ 億 | LPU（Language Processing Unit） |
| **Cerebras** | 已 IPO | Wafer-scale 巨型晶片 |
| **SambaNova** | 多輪總計 10+ 億 | 可重構資料流晶片 |
| **Tenstorrent** | 多輪總計 9+ 億 | RISC-V 開源路線 |

這群 ASIC 新創共同瞄準 Nvidia 通用 GPU 的「過度設計（over-engineering）」弱點——GPU 為了通用性犧牲了專用負載的能效與成本效益。

### 同週其他募資案件總覽

5 月 11-18 週的 AI 相關募資集中在「物理層基礎設施」：

| 公司 | 金額 | 賽道 |
|---|---|---|
| **MatX** | $500M Series B | AI 加速器晶片 |
| **Cowboy Space** | $275M Series B | 軌道太陽能 / 太空基礎設施 |
| **Corgi** | $160M Series B | AI 企業保險 |
| **Panthalassa** | $140M Series B | 波浪能 AI 資料中心 |
| **Bluefish** | $43M Series B | LLM 介面品牌控制 |

這個組合揭示 VC 的下一波押注主題：**算力、能源、垂直應用、介面層**——四個都不是「再做一個 LLM」這類已飽和的賽道。

## 💡 觀察與啟發

MatX 的 5 億美元募資反映一個被忽視的市場現實：**Nvidia 雖然強大，但無法承擔整個 AI 基礎設施的算力負荷**。Hyperscaler 與大型 AI 公司都在尋找「第二供應源」——一方面為了降低對 Nvidia 的議價依賴，另一方面為了優化特定負載（推理 vs 訓練、大模型 vs 小模型）的成本。MatX 賭的就是這個市場縫隙——它不是要打倒 Nvidia，而是成為「Hyperscaler 的第二選擇」。Coatue 領投、Nvidia 少數策略性參與，這個組合本身就告訴市場：ASIC 不再是 fringe 路線，而是主流晶片戰略的一部分。

對台灣半導體業而言，這群 ASIC 新創都是 **TSMC 與封測廠的潛在客戶**。MatX 預計用 TSMC N3/N2 製程量產，意味著台積電的先進製程不只服務 Nvidia 與 Apple，還有一批快速成長的客製化 AI 晶片客戶。但同時也帶來挑戰：**設計能力快速擴散**——Etched、Groq、SambaNova 等公司都在從 GPU 角度重新定義 AI 晶片，台灣本土的 IC 設計公司（聯發科、瑞昱、創意電子）是否能在這個浪潮中找到定位，是個關鍵問題。創意電子（GUC）作為 TSMC 系設計服務公司，可能是台灣最直接受益於 ASIC 浪潮的玩家。

## 🔗 相關連結
- [Tech Startups：5/11 募資新聞彙整](https://techstartups.com/2026/05/11/top-startup-and-tech-funding-news-may-11-2025/)
- [AI Startup Funding News May 2026](https://blog.mean.ceo/ai-startup-funding-news-may-2026/)
- [Crunchbase：Q1 2026 創投破紀錄](https://news.crunchbase.com/venture/record-breaking-funding-ai-global-q1-2026/)
- [AI Funding Tracker：最新募資追蹤](https://aifundingtracker.com/ai-startup-funding-news-today/)

---
*由 Claude 自動整理於 2026-05-18*

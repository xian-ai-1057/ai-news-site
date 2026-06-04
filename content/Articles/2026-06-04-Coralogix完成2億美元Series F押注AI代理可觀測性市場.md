---
title: "Coralogix 完成 2 億美元 Series F 融資，估值 16 億美元，押注 AI 代理可觀測性新市場"
date: 2026-06-04
source: TechCrunch / Axios / Coralogix
url: https://techcrunch.com/2026/06/03/coralogix-raises-200m-in-race-to-build-the-monitoring-layer-for-ai-agents/
category: 新創公司
industry: ""
tags:
  - AI
  - 新創公司
  - Coralogix
  - AI代理監控
  - 可觀測性
  - 融資
  - 企業軟體
created: 2026-06-04
---

> [!info] 文章資訊
> - **來源**：[TechCrunch](https://techcrunch.com/2026/06/03/coralogix-raises-200m-in-race-to-build-the-monitoring-layer-for-ai-agents/)
> - **發布日期**：2026-06-03
> - **分類**：新創公司

## 📝 重點摘要

以色列 AI 可觀測性平台 Coralogix 於 2026 年 6 月 3 日完成 **2 億美元 Series F** 融資，由 Advent International 和加拿大養老金投資委員會（CPPIB）共同領投，融資後估值達 **16 億美元**。這是繼 2025 年 7 月 1.15 億美元 Series E 後不到 12 個月的再次融資。Coralogix 押注 AI 代理浪潮將催生對「監控 AI 代理行為」的龐大需求，其平台已服務超過 5,000 家企業客戶，過去一年收入成長逾 60%，並已有約 30 家客戶年繳費超過 100 萬美元。

## 📖 全文內容

⚠️ 全文抓取失敗（WebFetch 返回 403）。以下為 TechCrunch、Axios、Coralogix 官方部落格、Calcalist、VentureBurn 等多來源整合。

### Coralogix 是什麼？

**核心定位：AI 原生可觀測性平台（AI-Native Observability Platform）**

Coralogix 成立於以色列，總部設在波士頓，是一家軟體監控公司，幫助企業即時監控其軟體系統的健康狀況與效能。

**傳統可觀測性三支柱：**
1. **日誌（Logs）**：應用程式運行時的事件記錄
2. **指標（Metrics）**：系統效能的數量化測量（如延遲、錯誤率）
3. **鏈路追蹤（Traces）**：請求在分散式系統中的完整路徑

### 為何「AI 代理可觀測性」是新市場？

**AI 代理的行為複雜性**

傳統軟體的行為是確定性的——給定相同輸入，輸出相同結果。AI 代理的行為則是**非確定性**的：

- 代理可以自主決定調用哪個工具、執行哪個步驟
- 多代理系統（Multi-Agent）中，代理之間的互動創造更複雜的錯誤模式
- 代理「幻覺」（Hallucination）和「任務漂移」（Task Drift）難以用傳統監控工具捕捉

**傳統監控工具的不足：**
- 只能追蹤 API 調用的成功/失敗，無法評估代理輸出的語意品質
- 無法追蹤「代理為什麼做出某個決策」的推理路徑
- 對長時運行的代理任務（如過夜的批次處理）缺乏有效的異常預警

### Coralogix 的 AI 代理監控能力

**Olly：Coralogix 的內建 AI 代理**

Coralogix 推出了 **Olly**，一個能夠主動監控、診斷和回應系統異常的內建 AI 代理。Olly 的特點：
- 在 Coralogix 的統一資料基礎上運行（同一份日誌、指標、鏈路資料）
- 能夠自主識別問題並提出修復建議，不只是發出告警
- 支援 MCP（Model Context Protocol）和 CLI 介面，適合自動化工作流程整合

**對外部 AI 代理的監控：**
Coralogix 的平台也可以監控客戶自行部署的 AI 代理：
- 追蹤代理的 LLM 調用（token 消耗、成本、延遲）
- 記錄代理的決策路徑和工具調用序列
- 建立代理行為基線，對異常模式發出預警

### 融資詳情

**本輪融資：**

| 項目 | 詳情 |
|---|---|
| 融資金額 | 2 億美元 |
| 輪次 | Series F |
| 投後估值 | 16 億美元 |
| 領投方 | Advent International、CPPIB |
| 跟投方 | Greenfield Partners、Brighton Park Capital |
| 宣布日期 | 2026 年 6 月 3 日 |

**成長軌跡：**

| 時間 | 里程碑 |
|---|---|
| 2025 年 7 月 | 完成 Series E（1.15 億美元）|
| 2026 年 6 月 | 完成 Series F（2 億美元），估值 16 億 |
| 累計融資 | 5.5 億美元 |

**業務數字：**
- 全球客戶超過 **5,000 家**（含 IBM、Tradeweb、JFrog）
- 過去一年收入成長 **逾 60%**
- 約 **30 家**客戶年繳費超過 **100 萬美元**

### 市場背景：可觀測性市場競爭格局

Coralogix 進入的是一個競爭激烈但持續成長的市場：

**主要競爭者：**
- Datadog：可觀測性市場領導者，已開始進入 AI 監控領域
- New Relic：傳統 APM 轉型 AI 觀測
- Dynatrace：企業級監控，強調自動化根因分析
- Honeycomb.io：以「可觀測性即查詢」著稱的新一代工具

**Coralogix 的差異化主張：**
- 「AI 原生」架構（從底層設計支援 AI 代理監控，而非改造現有工具）
- 成本效益（聲稱比 Datadog 等傳統工具低 70%）
- 彈性部署（支援雲端、混合雲、本地部署）

## 💡 觀察與啟發

Coralogix 的 Series F 揭示了一個「代理 AI 時代的基礎設施缺口」：

1. **誰來監控 AI 代理？** 這是現在最真實的企業 AI 問題之一。隨著 AI 代理被部署到財務報表分析、客戶服務、供應鏈管理等高風險業務流程，「代理做了什麼、為什麼這樣做、出了什麼問題」的可見性（Visibility）成為企業的核心需求。

2. **傳統監控工具的創新壁壘**：Datadog 等傳統可觀測性工具已有深厚的護城河，但 AI 代理監控需要理解語意而非只看結構化指標，這為新創提供了真實的入場機會。

3. **11 個月融資兩輪，說明投資人對這個方向極度看好**：Series E 到 Series F 的快速迭代融資（1.15 億 → 2 億），配合 60%+ 的收入增速，代表 Coralogix 所押注的「AI 代理可觀測性」方向正在被市場驗證。

## 🔗 相關連結
- [TechCrunch 報導](https://techcrunch.com/2026/06/03/coralogix-raises-200m-in-race-to-build-the-monitoring-layer-for-ai-agents/)
- [Coralogix 官方部落格](https://coralogix.com/coralogix-raises-200m-to-scale-the-observability-backbone-for-the-age-of-ai/)
- [Axios 報導](https://www.axios.com/pro/enterprise-software-deals/2026/06/03/coralogix-200m-observability-advent-cppib)
- [Calcalist 深度分析](https://www.calcalistech.com/ctechnews/article/bkifhk6gmx)

---
*由 Claude 自動整理於 2026-06-04*

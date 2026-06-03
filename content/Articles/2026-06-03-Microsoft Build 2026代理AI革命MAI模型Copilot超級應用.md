---
title: "Microsoft Build 2026 全覽：代理 AI 革命、七款自研 MAI 模型、Copilot 超級應用正式亮相"
date: 2026-06-03
source: Tom's Guide / Engadget / The Neuron
url: https://www.tomsguide.com/news/live/microsoft-build-2026
category: 重大新聞
industry: ""
tags:
  - AI
  - 重大新聞
  - Microsoft
  - Build2026
  - Copilot
  - MAI
  - Agent
  - 代理AI
  - 開發者
created: 2026-06-03
---

> [!info] 文章資訊
> - **來源**：[Tom's Guide - Microsoft Build 2026 Live](https://www.tomsguide.com/news/live/microsoft-build-2026)
> - **發布日期**：2026-06-02
> - **分類**：重大新聞

## 📝 重點摘要

微軟於 2026 年 6 月 2–3 日在舊金山舉行年度開發者大會 **Build 2026**，CEO Satya Nadella 以「AI 從回應提示轉向主動做事」為核心主題，發布了一系列重大公告：七款自研 **MAI 品牌模型**（首款推理模型 MAI-Thinking-1 最受矚目）、代理式 **Copilot 超級應用**（將多個 AI 助手整合為一）、首款 **Autopilot 代理「Scout」**、面向開發者的 **Rayfin SDK** 與 **Frontier Tuning**，以及 Windows 本機推理 API **Copilot Runtime**。本次 Build 被普遍視為微軟「宣告脫離 OpenAI 依賴、走向 AI 自主」的里程碑。

## 📖 全文內容

⚠️ 全文抓取失敗（WebFetch 返回 403），以下為多來源搜尋摘要整理。

### 大會核心主題：AI 代理（Agentic AI）

Nadella 的主題演講圍繞一個核心命題：AI 的角色正從「被動回應用戶提問」轉向「主動代替用戶完成工作」。

微軟對「Agentic AI」的定義：
- **無需每一步提示**：代理可以自主規劃、執行長達數小時甚至數天的任務
- **跨應用協作**：代理能夠橫跨 Microsoft 365、Azure、Windows 在不同應用之間行動
- **人在迴路（Human-in-the-loop）**：關鍵節點仍由人類審核和批准
- **企業知識整合**：代理能夠存取企業內部資料（SharePoint、Teams、Outlook）並作出情境化決策

### 七款 MAI 自研模型

| 模型 | 用途 | 亮點 |
|---|---|---|
| MAI-Thinking-1 | 推理旗艦 | 35B 活躍參數 / ~1T 總參數，稀疏 MoE，AIME 2025 達 97% |
| MAI-Code-1-Flash | 程式碼生成 | 整合至 GitHub Copilot，針對 Copilot 工作流程優化 |
| MAI-Transcribe-1.5 | 語音轉文字 | 43 種語言最高精度，勝過 Gemini 和 OpenAI Whisper |
| MAI-Image-2.5 | 圖像生成 | 高品質旗艦版 |
| MAI-Image-2.5-Flash | 快速圖像生成 | 低成本、快速版 |
| MAI-Voice | 語音合成 | 自然語音輸出 |

所有 MAI 模型均可透過 **Azure AI Foundry** 存取，部分整合至 Microsoft 365 Copilot 和 GitHub Copilot。

### Copilot 超級應用：統一多個 AI 助手

微軟宣布開發 **Copilot 超級應用（Copilot Super App）**，目標是將原本分散在不同產品中的多個 AI 功能整合到單一介面：

- 跨 Microsoft 365（Word、Excel、Teams、Outlook）的統一 AI 助手
- 支援長時間運行的自主任務
- 與個人日曆、郵件、會議紀錄深度整合
- **上市時程**：預覽版計畫 2026 年下半年推出（非 Build 即時可用）

### Scout：首款 Autopilot 代理

**Scout** 是微軟發布的首款 Autopilot（自動駕駛式代理），具體功能：

- 持續監控用戶的 **Outlook 收件匣和 Teams 訊息**
- 自動識別需要跟進的事項（待辦事項、截止日期、待批准請求）
- 主動通知用戶並提供建議行動
- 無需用戶每次提問，自動「保持眼睛張開」

Scout 被視為從「聊天機器人」到「主動工作助理」的第一步。

### 開發者工具：Rayfin SDK 與 Frontier Tuning

**Rayfin**（代理優先 SDK）：
- 讓開發者將自己的代理作為「後端服務」連接到 Microsoft 生態系統
- 支援代理之間的互相調用與協作
- 設計理念：讓第三方代理和 Microsoft 自有代理在同一框架下協作

**Frontier Tuning**（私人預覽）：
- 讓企業的 AI 代理在其合規邊界內學習「這家公司如何運作」
- 代理能夠根據企業自有資料和流程進行個性化適應
- 不需要向外部模型提供商分享敏感企業資料

### Microsoft IQ：代理的知識層

**Microsoft IQ** 是 Build 2026 發布的一個重要基礎設施元件，現已正式向所有人開放（GA）：

- 充當 AI 代理的「情境供給層」，向代理提供實時的企業知識
- 整合至 GitHub Copilot、Azure AI Foundry 和 Copilot Studios
- 代理可透過 Microsoft IQ 存取員工資料、專案狀態、組織架構等內部資訊
- 解決「代理知道很多通用知識，但不知道這個公司在做什麼」的問題

### Copilot Runtime for Windows：本機 AI 推理

**Copilot Runtime for Windows** 是一組本機推理 API，讓任何 Windows 應用程式能夠：

- 呼叫裝置端（On-device）AI 模型進行推理
- 支援情境感知補全、文本摘要、命令解讀等功能
- 無需將資料傳送到雲端（離線可用）
- 目標：讓 Windows 成為「AI 代理平台」，而非只是一個作業系統

### 硬體：RTX Spark Dev Box（Surface Laptop Ultra）

微軟同時展示了與 NVIDIA 合作開發的 **Surface Laptop Ultra**：
- 搭載 NVIDIA Blackwell RTX（RTX Spark）GPU
- 最高 **128GB 統一記憶體**
- 定位為本機 AI 開發的高性能工作站
- 可在本機運行各種大型 AI 模型，無需依賴雲端

### GitHub Copilot 原生桌面應用

GitHub Copilot 正式推出原生桌面應用（預覽版）：
- 不再只是 IDE 外掛，而是獨立運行的代理式開發工具
- 支援長時間運行的代理編碼任務
- 整合 MAI-Code-1-Flash 等自研模型

## 💡 觀察與啟發

Build 2026 在兩個方向上意義深遠：

1. **「代理」不再是概念，已成為產品**：Scout 代理、Autopilot 框架、Rayfin SDK，都是具體可用的產品和工具。企業 IT 部門現在必須認真考慮「如何在組織內安全地部署 AI 代理」這個問題——不是「要不要」，而是「怎麼做、怎麼管控」。

2. **微軟的戰略轉型正式公開化**：七款 MAI 自研模型、Project Polaris、Frontier Tuning——Build 2026 是微軟告訴全世界：「我們不再只是 OpenAI 的最大客戶，我們也是 AI 供應商。」這對 OpenAI、Anthropic、Google 而言，都意味著競爭格局的重大變化。

## 🔗 相關連結
- [Tom's Guide：Build 2026 全公告整理](https://www.tomsguide.com/news/live/microsoft-build-2026)
- [Engadget 直播部落格](https://www.engadget.com/2185601/microsoft-build-2026-live-blog-copilot-windows-news/)
- [The Neuron：所有公告解說](https://www.theneuron.ai/explainer-articles/everything-microsoft-announced-at-microsoft-build-2026-explained/)
- [ChatForest：Build 2026 回顧](https://chatforest.com/builders-log/microsoft-build-2026-recap-windows-agent-platform-project-polaris-copilot-workspace/)

---
*由 Claude 自動整理於 2026-06-03*

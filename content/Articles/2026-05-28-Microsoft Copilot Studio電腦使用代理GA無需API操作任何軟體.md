---
title: "Microsoft Copilot Studio 電腦使用代理正式 GA：視覺推理驅動、無需 API 即可操作任何軟體"
date: 2026-05-28
source: Microsoft Tech Community
url: https://techcommunity.microsoft.com/blog/copilot-studio-blog/computer-using-agents-in-microsoft-copilot-studio-are-now-generally-available/4519427
category: 企業應用導入
industry: 其他
tags:
  - AI
  - 企業應用導入
  - Microsoft
  - Copilot Studio
  - AI代理
  - 企業自動化
  - Computer Use
  - RPA
created: 2026-05-28
---

> [!info] 文章資訊
> - **來源**：[Microsoft Tech Community](https://techcommunity.microsoft.com/blog/copilot-studio-blog/computer-using-agents-in-microsoft-copilot-studio-are-now-generally-available/4519427)
> - **發布日期**：2026-05-13
> - **分類**：企業應用導入

## 📝 重點摘要

Microsoft 於 2026 年 5 月 13 日宣佈 Copilot Studio 的「電腦使用代理（Computer-Using Agents）」功能正式 GA（General Availability），面向所有商業地理區域的 Power Platform 用戶開放。此功能讓 AI 代理能直接操作任何桌面應用程式或網站，無需傳統 RPA 工具或自訂 API，僅憑視覺推理即可完成操作。同時新增企業級治理功能，包括 DLP 政策、Purview 審計整合和人機協作檢查點（Human-in-the-loop）。

## 📖 全文內容

⚠️ 全文抓取失敗（網站返回 403），以下為 Microsoft 官方部落格與多方報導彙整。

### 核心功能：電腦使用代理（Computer-Using Agents）

**什麼是電腦使用代理？**

電腦使用代理讓 AI 具備與人類相同的電腦操控能力：
- **瀏覽器**：操作任何網頁應用程式
- **桌面應用**：操作任何 Windows 應用程式
- **螢幕識別**：「閱讀」螢幕上的內容
- **鍵盤/滑鼠**：模擬人類的輸入操作

代理使用**視覺推理（Vision and Reasoning）**導航即時 UI，即使 UI 佈局改變、欄位移動或工作流程分支，也能自動適應——這是傳統 RPA（機器人流程自動化）工具的最大痛點。

**GA 時間與範圍**

- **正式 GA 日期**：2026 年 5 月 13 日
- **適用範圍**：所有商業地理區域的 Microsoft Power Platform 用戶

### 與傳統 RPA 的根本差異

| 維度 | 傳統 RPA（如 UiPath / AutomationAnywhere） | Copilot Studio 電腦使用代理 |
|---|---|---|
| 設定方式 | 錄製操作路徑，需要精確的 UI 座標 | 用自然語言描述任務意圖 |
| UI 變更適應 | 脆弱——UI 一改就會失效 | 強韌——視覺推理動態適應 |
| 技術門檻 | 需要 RPA 開發師 | 低代碼/無代碼 |
| API 需求 | 無 API 仍可用，但需要 UI 錄製 | 完全無需 API |
| 模型選擇 | 固定邏輯 | 支持 OpenAI 和 Anthropic 模型 |

### 企業功能

**2026 年 5 月 GA 版本新增的企業就緒功能**：

**1. 安全憑證管理（Secure Credential Management）**
- 更安全的憑證儲存和使用機制
- 避免 API 密鑰和帳號密碼在自動化流程中明文傳遞

**2. 模型選擇（Model Selection）**
代理建置者可以根據不同自動化場景的需求選擇最合適的模型：
- OpenAI 模型（如 GPT-5.5）
- Anthropic 模型（如 Claude Opus 4.7）

**3. 彈性自動化（Resilient Automations）**
自動化能夠應對 UI 介面變化，不因佈局調整而失效。

### 治理與安全功能

**企業治理工具包（Enterprise Governance Toolkit）**：

| 功能 | 說明 |
|---|---|
| 允許清單（Allowlist） | 限制代理只能操作特定網站或桌面應用程式 |
| DLP 政策 | Power Platform 原生資料防洩漏控制 |
| 環境隔離 | 不同部門/用途的代理在獨立環境中運行 |
| 審計軌跡（Audit Trail） | 代理操作日誌同步到 Microsoft Purview |
| Dataverse 整合 | 運行歷史和觀察性日誌推送至 Dataverse 以供稽核 |
| 人機協作檢查點（Human-in-the-loop） | 在低置信度步驟或例外情況暫停並請求人工確認 |

### May 2026 更新的其他功能

Copilot Studio 同時新增了多項功能：

**新工作流程體驗（New Workflows Experience）**
更直觀的工作流程設計介面，支援複雜的多步驟代理任務建置。

**即時語音體驗（Real-time Voice Experiences）**
代理現在支援即時語音互動，適用於客服和協助場景。

**Work IQ**
新的商業智慧功能，讓代理能夠連結企業資料，提供更具洞察力的協助。

### 企業應用場景

電腦使用代理適用的典型場景：

1. **ERP 資料輸入自動化**：讓代理自動將訂單、發票資料輸入到 SAP 或 Oracle ERP，無需等待 API 整合
2. **跨系統資料彙整**：自動從多個遺留系統（Legacy System）提取資料，無需自訂 API 開發
3. **IT 服務台自動化**：代理代替人工在多個系統間處理 IT 服務請求
4. **財務對帳**：自動操作銀行和企業財務系統進行交易對帳
5. **合規文件檢查**：在多個監管平台上自動完成合規文件提交和驗證

### 420M 月活用戶背景

此次 GA 發布的背景是：截至 2026 年 Q1，Microsoft Copilot 已有 4.2 億月活躍用戶，企業授權佔比約 38%（約 1.6 億用戶）。電腦使用代理的 GA 是 Copilot 生態系統從「智慧助理」走向「自主工作代理」的關鍵升級。

## 💡 觀察與啟發

電腦使用代理的 GA 是企業 AI 採用的一個重要里程碑：

**對 IT/運維部門**：最重要的訊息是「傳統 RPA 的最大痛點——UI 脆弱性——已被 AI 視覺推理解決」。這意味著企業過去因 UI 不穩定而放棄的自動化場景，現在可以重新評估。

**對 CIO**：Copilot Studio 的治理工具（DLP、Purview 整合、環境隔離）解決了之前 AI 代理部署最大的企業顧慮——可審計性和安全控制。這讓大型組織可以在符合 IT 政策的前提下部署 AI 代理。

**可借鏡之處**：從最結構化、重複性高的業務流程開始試點（如 ERP 資料輸入、表單填寫），建立成功案例後再推廣到複雜場景，這是降低導入風險的最佳路徑。

## 🔗 相關連結
- [原文連結（Microsoft Tech Community）](https://techcommunity.microsoft.com/blog/copilot-studio-blog/computer-using-agents-in-microsoft-copilot-studio-are-now-generally-available/4519427)
- [Microsoft Copilot Blog 更新](https://www.microsoft.com/en-us/microsoft-copilot/blog/copilot-studio/new-and-improved-computer-using-agents-a-new-workflows-experience-and-real-time-voice-experiences/)
- [DevOps.com 深度分析](https://devops.com/microsoft-copilot-studio-brings-computer-using-agents-to-the-enterprise/)

---
*由 Claude 自動整理於 2026-05-28*

---
title: "Microsoft Agent 365, now generally available, expands capabilities and integrations"
date: 2026-05-18
source: Microsoft Security Blog
url: https://www.microsoft.com/en-us/security/blog/2026/05/01/microsoft-agent-365-now-generally-available-expands-capabilities-and-integrations/
category: 重大新聞
industry: ""
tags:
  - AI
  - 重大新聞
  - Microsoft
  - Agent365
  - 企業治理
  - AI安全
  - M365E7
created: 2026-05-18
---

# Microsoft Agent 365 正式 GA：企業 AI Agent 治理進入「集中註冊 + 統一觀測 + 跨雲管控」時代

> [!info] 文章資訊
> - **來源**：[Microsoft Security Blog](https://www.microsoft.com/en-us/security/blog/2026/05/01/microsoft-agent-365-now-generally-available-expands-capabilities-and-integrations/)
> - **發布日期**：2026-05-01（5 月持續發酵）
> - **分類**：重大新聞

## 📝 重點摘要

Microsoft 於 5 月 1 日宣布 **Agent 365** 正式 General Availability（GA），並同時推出全新「Microsoft 365 E7 Frontier Suite」訂閱方案。Agent 365 是一個專為**企業 AI Agent 治理**設計的控制平面，以 **「觀測（Observe）、治理（Govern）、安全（Secure）」**三大支柱，提供 IT 與安全團隊對整個組織 agent 隊伍的可視性、一致性控制與企業級保護。新功能包括：**集中註冊（Centralized Registry）**讓所有 agent 在單一介面可見、**Registry Sync** 把 AWS Bedrock 與 Google Cloud Vertex 的 agent 拉進統一視圖、**Context Mapping、Policy 控制、Runtime 阻擋與警報** 將於 6 月透過 Intune 與 Defender 公開預覽。Agent 365 單獨定價 USD 15/人/月，整合進 M365 E7 套件則為 USD 99/人/月（內含 M365 Copilot、E5、Entra Suite、Agent 365）。這標誌著「Shadow AI」（員工自行使用未受管 AI 的問題）正式被微軟治理化、商品化。

## 📖 全文內容

### 三大支柱：觀測、治理、安全

Agent 365 圍繞三個核心能力構建：

**1. 觀測（Observe）**

Admin 可在單一中央註冊表中查看組織內所有 agent，獲得統一的 agent 採用率、活動、健康狀態視圖。對 IT 而言，這解決了多年來「組織裡到底跑了哪些 AI agent、誰在用、用得怎樣」的黑盒問題。

**2. 治理（Govern）**

包括：
- **生命週期管理**：agent 從建立、部署、版本更新、退役的完整流程
- **存取控制**：哪些員工可以建立、使用、調整 agent
- **合規對映**：把 agent 對應到組織的合規框架（SOC2、HIPAA、GDPR）

**3. 安全（Secure）**

- **Runtime 監控**：agent 執行時的行為偵測
- **Prompt 注入防護**：偵測並阻擋惡意 prompt
- **資料外洩防護**：與 Purview DLP 整合
- **6 月將上線**：Context Mapping、Policy 控制、Runtime 阻擋與警報

### 跨雲整合：Registry Sync

最具策略意義的新功能是 **Registry Sync**——AI 管理員可以安全地同意並連接「外部 agent 平台」到 Agent 365，把 AWS、Google Cloud 等其他雲端供應商的 agent 與其元資料納入 Agent 365 註冊表。初期預覽支援：
- **AWS Bedrock Agents**
- **Google Cloud Vertex AI Agents**
- 後續將加入更多合作夥伴平台

這個設計反映微軟接受「企業不會只用 Azure」的現實——與其逼客戶遷移，不如**在治理層贏家通吃**。對 CISO 而言，Registry Sync 解決了「多雲 agent 治理碎片化」的痛點。

### Microsoft 365 E7 Frontier Suite

伴隨 Agent 365 GA，微軟推出全新訂閱層級 **M365 E7**，組合內容：
- Microsoft 365 Copilot
- Microsoft 365 E5
- Microsoft Entra Suite（身分與存取管理）
- **Agent 365**

定價：**USD 99/人/月**

對比：
- M365 E5 標準價：約 USD 57/人/月
- M365 Copilot 附加：USD 30/人/月
- 過去若要全部加總：USD 87+
- E7 套件：USD 99（多出 USD 12 包含 Agent 365 與 Entra Suite 完整版）

從定價策略看，微軟把 Agent 365 定位為**「Copilot 用戶的必然升級」**——當員工大量使用 Copilot 與第三方 agent，IT 必然需要治理工具，這時 E7 變成自然選擇。

### 為什麼這對市場很重要？

Agent 365 GA 解決了 2025-2026 年企業 AI 採用的三大痛點：

| 痛點 | 過去做法 | Agent 365 解法 |
|---|---|---|
| **Shadow AI**（員工自行用 ChatGPT） | 封鎖或裝睡 | 註冊化、可見化、可治理 |
| **多 Agent 散亂部署** | 每個部門自己管 | 統一註冊表 + 跨平台同步 |
| **合規責任不明** | 含糊歸屬 | 對映到既有合規框架 |

根據 Microsoft 自家遙測，截至 2025 年 11 月，**80% Fortune 500 企業已透過 Copilot Studio 或 Agent Builder 建構 AI agent**。但「建構」與「治理」是兩件事——大多數企業根本不知道組織裡跑了多少個 agent、彼此如何互動。Agent 365 把這個治理缺口填上。

### 與 Anthropic、Google、AWS 的競爭格局

- **Anthropic**：透過 Claude Cowork 進入企業，與 PwC 等 SI 深度合作
- **Google**：Vertex AI Agent Engine 提供開發框架，但治理工具相對缺
- **AWS**：Bedrock Agents 強於開發，治理仍依賴第三方
- **Microsoft**：**唯一同時擁有「強大開發平台（Copilot Studio）+ 統一治理層（Agent 365）+ 既有企業客戶基礎（M365）」**

這個三合一是其他競爭者短期內難以複製的——Anthropic 沒有作業系統與生產力套件的入口，Google 沒有與企業 IT 部門的長期信任關係，AWS 沒有桌面端的使用者觸點。

## 💡 觀察與啟發

Microsoft 推出 Agent 365 的真正意義不是「又一個新產品」，而是**正式定義了一個新的軟體類別——「AI Agent 治理平台（Agent Governance Platform）」**。這個類別在 2025 年還只是 Gartner 報告中的概念，2026 年透過 Microsoft 的商品化與標準化定價，正式成為企業必買項目。CIO 預算的下一波重組，會從「採購更多 AI 工具」轉向「採購 AI 治理基礎設施」——這是個典型的「鏟子賺錢」場景。

對企業導入者特別有啟發的是 Agent 365 的設計理念：**接受混亂、把混亂變可管理**，而不是試圖強制集中化。Registry Sync 同步 AWS、Google 平台就是這個哲學的體現——CISO 不可能阻止業務單位用其他雲端，但可以要求所有 agent 都納入統一註冊表。這個思路值得台灣企業 IT 借鑑：與其禁用員工的 AI 工具，不如建立「自助申請註冊 → 自動安全掃描 → 合規通過後可用」的流程，把治理工作前移而非事後懲處。

## 🔗 相關連結
- [Microsoft Agent 365 GA 公告](https://www.microsoft.com/en-us/security/blog/2026/05/01/microsoft-agent-365-now-generally-available-expands-capabilities-and-integrations/)
- [What's New in Agent 365: May 2026](https://techcommunity.microsoft.com/blog/agent-365-blog/what%E2%80%99s-new-in-agent-365-may-2026/4516340)
- [Microsoft Agent 365 Overview（Learn）](https://learn.microsoft.com/en-us/microsoft-agent-365/overview)
- [Futurum 分析：Agent 365 如何把 Shadow AI 變成受治理資產類別](https://futurumgroup.com/insights/microsoft-agent-365-turns-shadow-ai-into-a-governed-asset-class/)
- [Redmond Channel Partner：M365 E7 套件解析](https://rcpmag.com/articles/2026/05/06/microsoft-pushes-ai-governance.aspx)

---
*由 Claude 自動整理於 2026-05-18*

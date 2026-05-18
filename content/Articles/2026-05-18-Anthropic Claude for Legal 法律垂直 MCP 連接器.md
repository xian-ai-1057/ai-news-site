---
title: "Anthropic Goes All-In on Legal, Releasing More Than 20 Connectors and 12 Practice-Area Plugins for Claude"
date: 2026-05-18
source: LawSites / Anthropic
url: https://www.lawnext.com/2026/05/anthropic-goes-all-in-on-legal-releasing-more-than-20-connectors-and-12-practice-area-plugins-for-claude.html
category: 重大新聞
industry: ""
tags:
  - AI
  - 重大新聞
  - Anthropic
  - Claude
  - 法律科技
  - MCP
  - 垂直整合
created: 2026-05-18
---

# Anthropic 全面進攻法律垂直：Claude 推 20+ MCP 連接器與 12 大專業領域外掛

> [!info] 文章資訊
> - **來源**：[LawSites / Anthropic 官方](https://www.lawnext.com/2026/05/anthropic-goes-all-in-on-legal-releasing-more-than-20-connectors-and-12-practice-area-plugins-for-claude.html)
> - **發布日期**：2026-05-12（5/13-18 持續發酵）
> - **分類**：重大新聞

## 📝 重點摘要

Anthropic 於 5 月 12 日宣布**全面進攻法律行業**——推出 20 多個 MCP（Model Context Protocol）連接器，把 Claude 接上法律業者每日使用的軟體生態，同時推出 12 個針對特定執業領域的外掛（plugins）。連接器涵蓋 **Thomson Reuters Westlaw、Practical Law、Harvey、Everlaw、DocuSign、Box、Microsoft 365** 等核心法律工具；外掛覆蓋商業、訴訟、隱私、智財、員工法、產品法、AI 治理等執業領域。同時 Thomson Reuters 與 Free Law Project（CourtListener）也宣布以 MCP 連接器形式接入 Claude，後者完全免費。**所有連接器與外掛皆開源**，並透過 Claude Cowork 向所有付費客戶開放。這標誌著 AI 法律科技競爭進入「全棧整合」階段——不只是查資料，而是把整個法律工作流（研究、合約、揭露、案件管理）統一在一個 AI 介面內。

## 📖 全文內容

### 20+ MCP 連接器：覆蓋律師日常工具棧

新發布的 MCP 連接器把 Claude 接到法律業者每日使用的核心工具，主要分四類：

**1. 法律研究與資料庫**
- **Thomson Reuters Westlaw**：全球最大付費法律資料庫
- **Practical Law**：實務指引與範例文件
- **Harvey**：原生 AI 法律研究平台
- **CourtListener（Free Law Project）**：開源美國案例資料庫，**免費開放**

**2. 揭露與案件管理**
- **Everlaw**：電子揭露（eDiscovery）平台
- **Relativity**（即將推出）：另一大 eDiscovery 玩家

**3. 文件與簽署**
- **DocuSign**：電子簽署
- **Box**：文件儲存與協作
- **iManage**（即將推出）：律師事務所主流 DMS

**4. 生產力套件**
- **Microsoft 365**：Word、Outlook、Teams 全整合

### 12 個專業領域外掛

外掛是針對特定執業領域的「預設工作流 + 提示詞 + 範例庫」組合包：

| 編號 | 外掛 | 涵蓋範圍 |
|---|---|---|
| 1 | **公司法（Corporate）** | M&A 盡調、公司治理、董事會決議 |
| 2 | **訴訟（Litigation）** | 起訴狀、案件策略、證據整理 |
| 3 | **商業（Commercial）** | 商業合約、條款談判、風險分析 |
| 4 | **隱私（Privacy）** | GDPR、CCPA、HIPAA 合規 |
| 5 | **智財（IP）** | 專利檢索、商標、著作權 |
| 6 | **員工法（Employment）** | 勞動法、合約、爭議處理 |
| 7 | **產品法（Product Law）** | 產品責任、召回、規範 |
| 8 | **AI 治理（AI Governance）** | AI Act、模型治理、內部 AI 政策 |
| 9 | **稅務（Tax）** | 稅務分析、跨境稅務 |
| 10 | **金融監管** | 銀行業合規、證券法 |
| 11 | **房地產** | 不動產交易、租賃 |
| 12 | **政府事務** | 法規追蹤、政策影響評估 |

**AI Governance Legal 外掛**特別值得關注——它提供 AI 政策合規、AI Act 要求、模型治理文件、內部 AI 使用政策開發等工作流。考慮到「AI 治理」已在主要事務所成為獨立執業領域，這個外掛反映 Anthropic 對市場需求的精準掌握。

### 為什麼 MCP 是關鍵？

MCP（Model Context Protocol）是 Anthropic 於 2024 年底開源的協議，允許 LLM 以標準化方式連接外部資料源與工具。MCP 連接器的價值在於：
- **開源、無廠商鎖定**：任何供應商都能寫 MCP 連接器
- **單一介面、多工具**：律師在 Claude 介面內就能查 Westlaw、調 DocuSign、抓 Box 文件
- **可組合性**：MCP + 外掛可以混搭，例如「公司法外掛 + Westlaw + Box」三件套

### 與競品的差異

對比 Anthropic 此次發布與其他 AI 法律玩家：

| 玩家 | 模型 | 法律垂直深度 | 開放性 |
|---|---|---|---|
| **Anthropic Claude for Legal** | Claude | 20+ 連接器 + 12 外掛 | **開源、跨供應商** |
| **Harvey**（OpenAI 投資） | GPT 系列 | 自建工作流 | 封閉、自有 |
| **CoCounsel**（Thomson Reuters） | 多模型 | 深度整合 Westlaw | 封閉、Westlaw 生態 |
| **Lexis+ AI** | 多模型 | 深度整合 LexisNexis | 封閉、LexisNexis 生態 |

Claude for Legal 的核心優勢是「**開放生態**」——律師事務所可以混用既有的 Westlaw、Harvey、Box，而不需要因為選了 AI 工具就鎖死某個供應商。這對大型事務所特別有吸引力，因為他們通常已經有複雜的工具棧。

### 商業模式與可得性

- **付費 Claude 客戶**：全部新連接器與外掛**免費啟用**
- **Claude Cowork**：透過此產品介面整合
- **開源**：所有連接器與外掛在 GitHub 公開
- **CourtListener**：完全免費，任何 Claude 用戶可用

### 市場反應

Bloomberg Law 評論「這是法律科技歷史上單次發布規模最大的 AI 整合」。多家大型事務所（包括 PwC、安永）已開始導入。Anthropic 同時宣布**法律業務專屬定價**將於 6 月公布，預期會推出針對律所工作流量化的方案。

## 💡 觀察與啟發

Anthropic 這次發布的真正策略意義不在於「再贏一個垂直」，而在於**證明 MCP 協議能作為「跨廠商整合層」**。在 GPT 系列以「API + 封閉生態」為主流的當下，Anthropic 押注「開放標準會贏」——這與 1990 年代 Internet 開放協議擊敗 AOL 封閉花園的歷史邏輯類似。對企業客戶而言，這代表他們**不必為了 AI 鎖死供應商**——既有的 Westlaw、Box、DocuSign 不會被廢棄，反而會被 AI「重新粘合」。

從法律行業角度看，這次發布揭示了三個重要變化：**第一**，AI 法律工具的競爭從「比模型強」轉向「比生態廣」；**第二**，「AI 治理」這個執業領域已正式從新興類別變成標準執業領域，未來律師需要懂的不只是合約法，還有 AI 治理框架；**第三**，律師助理（Paralegal）與初階律師的工作將被大幅自動化，事務所的人力結構會在 18-24 個月內重組。對台灣法律業而言，繁體中文版 MCP 連接器與台灣案例庫的接入會是關鍵——目前 Anthropic 主要連接器仍以美國資料為主，台灣業者可能需要與本土資料供應商（如月旦法學、北辰資訊）合作開發本地連接器。

## 🔗 相關連結
- [LawSites 詳細報導](https://www.lawnext.com/2026/05/anthropic-goes-all-in-on-legal-releasing-more-than-20-connectors-and-12-practice-area-plugins-for-claude.html)
- [Anthropic Claude for Legal 官方部落格](https://claude.com/blog/claude-for-the-legal-industry)
- [TechCrunch：AI 法律服務戰場](https://techcrunch.com/2026/05/12/the-ai-legal-services-industry-is-heating-up-anthropic-is-getting-in-on-the-action/)
- [Thomson Reuters + Free Law Project MCP 整合](https://www.lawnext.com/2026/05/two-legal-research-providers-launch-mcp-integrations-with-claude-thomson-reuters-and-free-law-project-connect-their-data-to-ai.html)
- [Bloomberg Law：Claude 法律功能擴充](https://news.bloomberglaw.com/legal-ops-and-tech/anthropic-pushes-deeper-into-legal-work-with-claude-updates)

---
*由 Claude 自動整理於 2026-05-18*

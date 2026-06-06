---
title: "Anthropic Project Glasswing 擴展至全球 150 個組織，Claude Mythos 掃出 1 萬個高危漏洞"
date: 2026-06-06
source: CyberScoop
url: https://cyberscoop.com/anthropic-project-glasswing-expansion-critical-infrastructure-claude-mythos/
category: 重大新聞
industry: ""
tags:
  - AI
  - 重大新聞
  - Anthropic
  - 網路安全
  - Claude Mythos
  - Project Glasswing
  - AI安全
  - 關鍵基礎設施
created: 2026-06-06
---

> [!info] 文章資訊
> - **來源**：[CyberScoop](https://cyberscoop.com/anthropic-project-glasswing-expansion-critical-infrastructure-claude-mythos/)
> - **發布日期**：2026-06-02
> - **分類**：重大新聞

## 📝 重點摘要

Anthropic 於 2026 年 6 月 2 日宣布，將旗下 AI 資安計劃 Project Glasswing 擴展至全球 15 個以上國家的約 150 個新組織，涵蓋電力、水務、醫療、通訊、科技與硬體等關鍵基礎設施業者。早期 50 個合作夥伴在取得 Claude Mythos Preview 存取權限後，已成功掃描發現超過 **1 萬個高危或嚴重等級的安全漏洞**。Claude Mythos 是 Anthropic 的前沿資安模型，能自主尋找並利用軟體漏洞，Anthropic 因其攻擊潛力而未對外公開發布，僅在嚴格審查機制下向受信任組織開放。

## 📖 全文內容

⚠️ 全文抓取失敗（CyberScoop 返回 403），以下整合自 Anthropic 官方公告、SiliconAngle、Help Net Security 等多方報導。

### Project Glasswing 背景

Project Glasswing 是 Anthropic 啟動的網路安全夥伴計劃，核心理念是：**在惡意行為者利用 AI 發動攻擊之前，讓防守者先獲得 AI 輔助的漏洞偵測能力**。

計劃的核心工具是 **Claude Mythos Preview**——Anthropic 的前沿資安模型，具備：
- **自主漏洞掃描**：能自動分析大型程式碼庫，識別潛在安全漏洞
- **漏洞利用能力**：能嘗試設計實際的漏洞利用方案（Exploit），驗證漏洞的真實嚴重性
- **大規模掃描**：可在短時間內處理數百萬行程式碼

**為何不公開發布 Claude Mythos？**
Anthropic 明確表示，Claude Mythos Preview **不會作為商業產品公開提供**，原因是：模型的攻擊能力過強，若落入惡意行為者手中，可能造成嚴重的網路安全事件。這與 Anthropic 的「負責任 AI 發布」（Responsible Scaling Policy）原則一致。

### 第一階段成果（約 50 個初始夥伴）

Project Glasswing 於 2026 年 4 月啟動，初始合作夥伴約 50 個，由美國政府、安全產業與開源軟體維護者組成。

**截至 2026 年 6 月 2 日前已達成**：
- 掃描了合作夥伴的程式碼庫
- 發現超過 **10,000 個高危（High-severity）或嚴重（Critical-severity）安全漏洞**
- 合作夥伴已開始修補這些漏洞，在攻擊者利用前完成防禦

此一成果顯示，即便在試驗性的小規模部署中，AI 輔助的漏洞掃描也已帶來可量化的防禦效益。

### 第二階段：全球擴展（約 150 個新組織）

2026 年 6 月 2 日宣布的擴展計劃，將 Project Glasswing 帶入全球更多國家的關鍵基礎設施領域：

**地理範圍**：超過 15 個國家（具體國家未公開）

**涵蓋行業**：
- ⚡ **電力（Power）**：電網操作商與電力公司
- 💧 **水務（Water）**：供水系統與廢水處理設施
- 🏥 **醫療（Healthcare）**：醫院網路與醫療設備製造商
- 📡 **通訊（Communications）**：電信運營商與網路設備商
- 💻 **科技（Technology）**：技術基礎設施提供商
- 🔧 **硬體（Hardware）**：半導體與電子設備製造商

**加入資格**：組織必須先通過 Anthropic 的安全審查（Security Requirements Assessment）才能獲得存取權限，確保 Claude Mythos 不會被濫用。

### Claude Security：公開版的補充方案

與 Claude Mythos Preview 並行，Anthropic 也推出了 **Claude Security**——這是使用最新公開前沿模型（如 Claude Opus 4.8）的商業化資安產品，功能包括：
- 程式碼庫掃描
- 漏洞建議修補（Patch Suggestions）
- 適用於無法通過 Project Glasswing 審查資格的一般企業

Claude Security 定位為 Claude Mythos 的「降級但可及」版本，使更多組織能受益於 AI 輔助的程式碼安全。

### 未來計劃與戰略展望

**工具開放**：Anthropic 計劃將為 Project Glasswing 開發的漏洞發現工具，在申請後提供給受信任的安全團隊使用。

**競爭格局預警**：Anthropic 預估，在未來 6 至 12 個月內，其他 AI 公司也將擁有 Mythos 級別的模型能力。關鍵差異在於：這些模型是否會在缺乏防止濫用保護措施的情況下公開發布。這暗示 Anthropic 預期 AI 資安能力的軍備競賽將在 2026 下半年至 2027 年顯著升溫。

## 💡 觀察與啟發

Project Glasswing 的擴展代表了一個重要的行業範例：**前沿 AI 實驗室以「負責任使用」的框架，同時推進 AI 的軍事/安全應用與商業應用**。Anthropic 透過嚴格的存取控制和夥伴審查，試圖在「讓防守者先行」和「防止技術濫用」之間找到平衡。

**對關鍵基礎設施的啟示**：10,000 個高危漏洞的發現結果，說明全球關鍵基礎設施的程式碼安全狀態仍令人憂慮。這些漏洞原本可能被攻擊者利用，造成電網、水務、醫療系統的中斷。AI 輔助掃描的效率（數百萬行程式碼的快速審計）將改變資安防禦的成本效益比。

**台灣科技硬體廠商的相關性**：Project Glasswing 的硬體行業合作對象，可能包括台灣的 ODM/OEM 廠商。若台灣主要的電子設備製造商能接入類似工具，將有助於提升出口產品的軟體安全水準，應對日益嚴格的國際資安合規要求。

## 🔗 相關連結
- [CyberScoop 報導](https://cyberscoop.com/anthropic-project-glasswing-expansion-critical-infrastructure-claude-mythos/)
- [Anthropic 官方公告](https://www.anthropic.com/news/expanding-project-glasswing)
- [SiliconAngle 報導](https://siliconangle.com/2026/06/02/anthropic-expands-project-glasswing-cybersecurity-program-150-organizations/)
- [Help Net Security](https://www.helpnetsecurity.com/2026/06/03/anthropic-project-glasswing-expansion/)

---
*由 Claude 自動整理於 2026-06-06*

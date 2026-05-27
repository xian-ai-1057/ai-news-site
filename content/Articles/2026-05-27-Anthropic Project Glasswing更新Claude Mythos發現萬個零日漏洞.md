---
title: "Anthropic Project Glasswing 最新進展：Claude Mythos 識別超過 10,000 個零日安全漏洞"
date: 2026-05-27
source: SiliconANGLE / Anthropic
url: https://siliconangle.com/2026/04/30/anthropic-announces-claude-security-public-beta-find-fix-software-vulnerabilities/
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - Anthropic
  - 資安
  - Claude Mythos
  - 零日漏洞
  - Project Glasswing
created: 2026-05-27
---

> [!info] 文章資訊
> - **來源**：[SiliconANGLE / Anthropic](https://siliconangle.com/2026/04/30/anthropic-announces-claude-security-public-beta-find-fix-software-vulnerabilities/)
> - **發布日期**：2026-05-26
> - **分類**：技術理論

## 📝 重點摘要

Anthropic 在 2026 年 5 月 26 日發布 Project Glasswing 最新進展報告：旗艦模型 Claude Mythos Preview 已在合作夥伴的協助下，識別出全球主要作業系統、瀏覽器及關鍵軟體中超過 10,000 個高危或重大安全漏洞，打破了傳統安全研究的速度紀錄。Anthropic 同時宣佈 Claude Security 公開測試版已上線，在三週內協助修補超過 2,100 個漏洞。Project Glasswing 的合作夥伴包括 AWS、Apple、Broadcom、Cisco、CrowdStrike、Google 和 JPMorganChase，Anthropic 已投入 1 億美元的模型算力信用額度支持計劃運作。

## 📖 全文內容

⚠️ 全文抓取失敗，以下為搜尋結果摘要整理。

### Project Glasswing 背景

Project Glasswing 是 Anthropic 於 2026 年 4 月發起的重大資安合作計劃，核心理念是：**在強大的 AI 模型被惡意利用之前，先用這些模型來修補全球最關鍵的軟體漏洞**。計劃的命名來自於玻璃翼蝶（Glasswing butterfly），象徵透明度與精細保護。

### Claude Mythos Preview 的資安能力

Claude Mythos Preview 是 Anthropic 的未發布前沿模型，目前僅向 Project Glasswing 的選定合作夥伴開放存取。根據 5 月 26 日的更新報告：

**識別能力：**
- 在**每一個主要作業系統**中均發現了零日漏洞（含 Windows、macOS、Linux 核心）
- 在**每一個主要瀏覽器**中均發現了零日漏洞（含 Chrome、Safari、Firefox、Edge）
- 在各類關鍵基礎設施軟體中累計識別超過 **10,000 個高危或重大安全漏洞**

**技術方法：**
Claude Mythos Preview 結合了靜態程式碼分析、語義推理與安全知識庫，能夠理解複雜的多層次軟體漏洞，包括記憶體安全問題、邏輯錯誤、認證繞過等多種類型，並自動生成修補建議。

### Claude Security 公開測試版

Claude Security 是面向所有 Claude Enterprise 客戶的新產品，已於 2026 年 4 月 30 日進入公開測試版。主要功能包括：

- **程式碼庫掃描**：自動識別程式碼中的安全漏洞
- **漏洞分類**：依嚴重程度和修補優先順序排序
- **修補建議生成**：自動生成可直接應用的程式碼修補方案

自上線以來，Claude Opus 4.7 已在三週內被用來識別並提議修補超過 **2,100 個安全漏洞**，顯示商業部署效果遠超預期。

### 合作夥伴生態系統

Project Glasswing 的合作夥伴涵蓋科技、金融和安全領域的頭部企業：

| 類型 | 合作夥伴 |
|---|---|
| 雲端基礎設施 | Amazon Web Services、Google Cloud |
| 科技巨頭 | Apple、Broadcom、Cisco |
| 資安專業 | CrowdStrike |
| 金融機構 | JPMorganChase |
| 開源社群 | 多個開源專案組織 |

### 財務規模

Anthropic 為 Project Glasswing 承諾了 1 億美元的模型算力信用額度，允許合作夥伴免費使用 Claude Mythos Preview 進行漏洞掃描。計劃結束後，Mythos Preview 的定價為每百萬輸入 Token $25、輸出 Token $125，遠高於標準模型，反映其超強的推理能力。

### 安全與透明度

Anthropic 強調，Project Glasswing 識別到的所有漏洞均按照「負責任披露（Responsible Disclosure）」原則處理：先通知相關軟體廠商，給予修補時間，再考慮是否公開。目前大部分已識別漏洞仍在修補過程中，尚未對外公開細節。

## 💡 觀察與啟發

Project Glasswing 的最新進展在技術上具有雙重意義：一方面，它證明了 AI 模型在靜態程式碼分析和安全漏洞識別方面已達到甚至超越頂尖人類安全研究員的水準；另一方面，10,000+ 漏洞的識別數量也引發了一個值得深思的問題——如果 Claude Mythos 能找到這些漏洞，具備類似能力的惡意行為者也可能正在做同樣的事。

對資安行業而言，這標誌著一個新時代的開始：AI 驅動的攻擊（AI-powered attacks）與 AI 驅動的防禦（AI-powered defense）將進入軍備競賽。Anthropic 選擇搶先一步用 AI 修補漏洞，是一個有遠見的策略，但也凸顯了整個產業對「AI 軍備競賽」問題的高度警惕。

對想部署 AI 安全工具的企業來說，Claude Security 的公開測試版是一個難得的機會。能在不大幅增加安全團隊規模的情況下，快速掃描並修補程式碼庫中的已知漏洞，這對中小型企業尤其有價值。

## 🔗 相關連結
- [原文連結（SiliconANGLE）](https://siliconangle.com/2026/04/30/anthropic-announces-claude-security-public-beta-find-fix-software-vulnerabilities/)
- [Project Glasswing 官方頁面](https://www.anthropic.com/glasswing)
- [Help Net Security 報導](https://www.helpnetsecurity.com/2026/05/26/anthropic-project-glasswing-update/)
- [The Ringer：Claude Mythos 的資安威脅分析](https://www.theringer.com/2026/05/06/tech/claude-mythos-anthropic-project-glasswing-cybersecurity-threat-ai)

## 📓 學習筆記
- [[2026-05-27-學習-Claude Mythos零日漏洞識別與AI資安能力|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-27*

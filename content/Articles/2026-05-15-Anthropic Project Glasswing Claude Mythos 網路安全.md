---
title: "Project Glasswing: Securing critical software for the AI era"
date: 2026-05-15
source: Anthropic
url: https://www.anthropic.com/glasswing
category: 重大新聞
tags:
  - AI
  - 重大新聞
  - Anthropic
  - Claude Mythos
  - 網路安全
  - 資安
  - Project Glasswing
created: 2026-05-15
---

# Anthropic Project Glasswing：Claude Mythos Preview 開啟 AI 時代的網路安全新戰場

> [!info] 文章資訊
> - **來源**：[Anthropic](https://www.anthropic.com/glasswing)
> - **發布日期**：2026-04-07
> - **分類**：重大新聞

## 📝 重點摘要

Anthropic 宣布啟動「Project Glasswing」，聯合 AWS、Apple、Broadcom、Cisco、CrowdStrike、Google、JPMorganChase、Linux Foundation、Microsoft、NVIDIA 和 Palo Alto Networks 等12家科技巨頭，以旗下未公開發布的前沿模型 Claude Mythos Preview 進行大規模關鍵軟體安全掃描。Mythos Preview 已自主發現數千個零日漏洞，包括涵蓋所有主要作業系統和瀏覽器的高危漏洞，代表 AI 的漏洞挖掘能力已超越絕大多數人類安全專家。Anthropic 承諾投入 1 億美元模型使用額度支持此計畫，這是 AI 能力安全部署的重大業界行動。

## 📖 全文內容

### 計畫背景

Anthropic 因為觀察到 Claude Mythos Preview——一個尚未公開發布的前沿模型——的強大能力，而感到有必要緊急行動。一個嚴峻的事實擺在眼前：AI 模型的編程能力已達到一個水準，能在發現和利用軟體漏洞方面超越除最頂尖人類之外的所有人。

目前網路攻擊的代價已相當嚴重——僅全球每年網路犯罪的財務成本估計就高達約 5000 億美元。而 AI 強化的攻擊能力可能使這一問題大幅惡化。

### Claude Mythos Preview 的能力

Anthropic 使用 Claude Mythos Preview 在幾週內識別出數千個零日漏洞（即軟體開發者此前未知的缺陷），其中許多是嚴重漏洞，涵蓋所有主要作業系統和所有主要網頁瀏覽器。

具體案例：

1. **OpenBSD 27年老漏洞**：Mythos Preview 發現了一個存在於 OpenBSD（以其安全強化而聞名，用於運行防火牆和其他關鍵基礎設施）中長達27年的漏洞，允許攻擊者通過連接到機器遠端崩潰任何運行該作業系統的機器。

2. **FFmpeg 16年漏洞**：它還發現了一個存在16年的 FFmpeg 漏洞（廣泛用於視頻編解碼），此漏洞所在的那行代碼已被自動測試工具執行了500萬次而從未被發現。

3. **Linux 核心提權漏洞**：該模型自主發現並鏈接了 Linux 核心中的多個漏洞，允許攻擊者從普通用戶訪問升級到對機器的完全控制。

### 基準表現

| 評估項目 | Mythos Preview | Claude Opus 4.6 |
|---------|---------------|-----------------|
| CyberGym（漏洞重現） | 83.1% | 66.6% |
| SWE-bench Verified | 93.9% | 80.8% |
| SWE-bench Pro | 77.8% | 53.4% |
| Terminal-Bench 2.0 | 82.0% | 65.4% |
| GPQA Diamond | 94.6% | 91.3% |
| Humanity's Last Exam（含工具） | 64.7% | 53.1% |

### Project Glasswing 的運作機制

計畫的12個發起夥伴（包括 AWS、Apple、Cisco、CrowdStrike、Google、JPMorganChase、Linux Foundation、Microsoft、NVIDIA 和 Palo Alto Networks）將獲得 Claude Mythos Preview 的訪問權限，用於其基礎系統的漏洞發現和修復工作。

**資金承諾**：
- Anthropic 承諾高達 1 億美元的模型使用額度
- 向 Linux Foundation 下的 Alpha-Omega 和 OpenSSF 捐款 250 萬美元
- 向 Apache 軟體基金會捐款 150 萬美元

**模型定價**（研究預覽結束後）：
- 輸入：每百萬 Token 25 美元
- 輸出：每百萬 Token 125 美元

### 合作夥伴評語

> *「AI 能力已跨越了一個門檻，從根本上改變了保護關鍵基礎設施免受網路威脅的緊迫性，而且無法回頭。」* — Anthony Grieco，Cisco 首席安全和信任長

> *「從發現漏洞到被對手利用的視窗已經崩潰——以前需要數月的事情現在可以用 AI 在幾分鐘內完成。」* — Elia Zaitsev，CrowdStrike 技術長

> *「也許更重要的是：每個人都需要為 AI 輔助的攻擊者做好準備。將會有更多攻擊、更快的攻擊和更複雜的攻擊。」* — Lee Klarich，Palo Alto Networks 產品和技術長

### 開源安全的特殊意義

計畫特別關注開源軟體的安全。Linux Foundation CEO Jim Zemlin 指出，開源軟體構成了現代系統中絕大多數代碼，而開源維護者歷來缺乏安全資源。Project Glasswing 為這些關鍵開源程式碼庫的維護者提供了訪問下一代 AI 模型的機會，有望改變這一長期失衡的局面。

## 💡 觀察與啟發

Project Glasswing 是迄今為止 AI 安全能力部署中規模最大、最正式的業界聯合行動。它揭示了一個深刻的悖論：同一個能夠發現並利用漏洞的 AI 模型，也是最有效的防禦工具。

這個計畫的重要性不僅在於技術層面，更在於它確立了一個先例：當 AI 能力達到危險門檻時，負責任的做法是主動聯合業界進行集體防禦，而非等待事故發生。這一模式可能成為未來 AI 能力治理的範本。

對於台灣企業和政府機構而言，了解 AI 輔助的網路攻擊能力提升趨勢，並評估自身系統面對 AI 增強型攻擊的脆弱性，應當成為近期的優先議題。傳統的安全測試和補丁週期可能無法應對 AI 加速後的漏洞利用速度。

## 🔗 相關連結
- [原文連結](https://www.anthropic.com/glasswing)
- [Claude Mythos Preview 紅隊部落格](https://red.anthropic.com/2026/mythos-preview/)
- [The Ringer：Claude Mythos 是否真能摧毀網際網路？](https://www.theringer.com/2026/05/06/tech/claude-mythos-anthropic-project-glasswing-cybersecurity-threat-ai)
- [Fortune 報導](https://fortune.com/2026/04/07/anthropic-claude-mythos-model-project-glasswing-cybersecurity/)

---
*由 Claude 自動整理於 2026-05-15*

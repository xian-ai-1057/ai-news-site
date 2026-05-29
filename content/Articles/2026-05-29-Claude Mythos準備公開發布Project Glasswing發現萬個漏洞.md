---
title: "Claude Mythos 準備公開發布：Project Glasswing 發現逾萬個零日漏洞、AI 資安能力引國際關注"
date: 2026-05-29
source: TechTimes / AndroidHeadlines / Cybersecurity News
url: https://www.techtimes.com/articles/317076/20260524/anthropic-moves-closer-public-claude-mythos-release-10000-critical-bugs-found-first.htm
category: 重大新聞
industry: ""
tags:
  - AI
  - 重大新聞
  - Anthropic
  - Claude Mythos
  - AI安全
  - 資安
  - 漏洞
  - Project Glasswing
created: 2026-05-29
---

> [!info] 文章資訊
> - **來源**：[TechTimes](https://www.techtimes.com/articles/317076/20260524/anthropic-moves-closer-public-claude-mythos-release-10000-critical-bugs-found-first.htm)
> - **發布日期**：2026-05-24
> - **分類**：重大新聞

## 📝 重點摘要

Anthropic 確認其最先進的模型 Claude Mythos 已通過 Project Glasswing 受限測試計畫的安全驗證，正式準備擴大公開發布範圍。在測試階段，約 50 個合作夥伴組織部署 Claude Mythos Preview 於防禦性資安工作流，成功發現逾 10,000 個廣泛使用軟體（包括 Firefox 和 Apple M5 Mac 晶片驅動程式）中的高危或嚴重漏洞。此能力已引發國際安全機構的高度關注，多個國家政府已開始討論針對此類「攻守兼備型 AI」的新監管框架。Mythos 的公開發布將打破「政府/資安業界專用前沿 AI 與開發者可用前沿 AI 之間的分野」，是一個具有廣泛影響的里程碑事件。

## 📖 全文內容

### Claude Mythos 背景

Claude Mythos 是 Anthropic 的最頂級模型，能力明顯超越現有旗艦 Claude Opus 4.7，特別在以下方面：
- **複雜自主推理**：能夠執行需要多步驟規劃的高難度任務
- **程式碼分析與漏洞識別**：可深度分析大型程式碼庫的安全性
- **自主網路攻擊模擬**：具備模擬複雜網路攻擊鏈的能力

正因為 Mythos 的能力遠超目前公開模型，Anthropic 採取了高度審慎的分階段發布策略。

### Project Glasswing：受限安全測試計畫

**計畫設計**

Project Glasswing 是 Anthropic 為 Claude Mythos Preview 設計的受限測試框架：
- **參與者**：約 50 個合作夥伴組織（關鍵基礎設施供應商、資安公司、開源開發者社群）
- **使用範圍**：僅限於防禦性（Defensive）資安工作流
- **監控機制**：所有使用均在 Anthropic 的監控下進行，具備細粒度的使用稽核

**主要發現：逾 10,000 個漏洞**

在受控的 Project Glasswing 測試中，Claude Mythos Preview 協助合作夥伴：
- 識別 Firefox 中的數百個高危和嚴重安全漏洞
- 發現 Apple M5 Mac 晶片驅動程式中的底層硬體漏洞
- 在總計超過 10,000 個廣泛使用軟體的高危或嚴重等級漏洞中發揮了關鍵作用

Anthropic 表示，Project Glasswing 是「AI 協助大規模防禦性漏洞發現的規模化驗證」，並且所有發現已按照負責任披露（Responsible Disclosure）流程通報至相關廠商。

### 向公開發布推進

**claude-mythos-1-preview 出現在 UI**

多個安全研究人員報告，模型字串 `claude-mythos-1-preview` 已短暫出現在 Claude Code 和 Claude Security 的公開介面中，隨後被移除。這被解讀為 Anthropic 正在進行有限的公開測試（Shadow Release）。

**發布時間線**

- **4 月 7 日**：Claude Mythos 早期預覽版（Early Preview）宣布
- **5 月中旬**：日本三大銀行（三菱 UFJ、三井住友、瑞穗）獲得受限存取權
- **5 月 24 日**：Project Glasswing 結果公布，Mythos 安全驗證基本完成
- **預計 5-6 月**：向更廣泛的開發者、企業和消費者開放

### 國際安全監管關注

**AI 模型的攻防雙重性引發擔憂**

Claude Mythos 的能力使其既可用於防禦（快速發現漏洞、主動修補），也理論上可被用於攻擊（自動生成攻擊向量、識別目標漏洞）。這種「攻守兼備型 AI」的出現，讓各國政府安全機構感到緊迫：

- **美國 CISA**：已在評估是否需要針對此類模型制定特殊訪問控制要求
- **歐盟 ENISA**：將 Claude Mythos 的發布視為「AI 資安能力閾值突破事件」，正在準備相關評估報告
- **多國政府**：討論是否需要類似「雙用途技術出口管制」的 AI 模型管控機制

**Anthropic 的安全立場**

Anthropic CEO 黛利歐·阿莫迪（Dario Amodei）在相關討論中表示，Anthropic 相信公開的安全能力勝過秘密保留的安全風險（因為攻擊者最終也會獲得相同能力），主動公開並建立使用規範和審計機制，比限制模型更符合全球安全利益。

### Mythos 的戰略意義

**打破「政府級 AI 與消費者級 AI」的分野**

過去，最前沿的 AI 能力往往先由政府機構和頂級安全公司獨家使用，然後才逐步開放給商業和消費者市場。Claude Mythos 的發布計畫，按照 Anthropic 的說法，是要「同時向各類用戶開放前沿能力，並通過使用條款和審計機制進行治理」，而非採取傳統的分級鎖定模式。

這一決策影響深遠：大型企業、中小型資安公司、甚至個人開發者都可能在同一時間獲得 Mythos 級別的 AI 能力，這將大幅改變資安行業的競爭格局。

## 💡 觀察與啟發

Claude Mythos 的發布是一個多維度的里程碑。從技術角度，10,000 個漏洞的發現展示了 AI 在「找出人類難以察覺的代碼安全問題」方面已超越頂級人類資安專家的速度和規模。從政策角度，Mythos 引發的監管討論預示著 AI 將迎來類似「雙用途技術」的出口管制框架，中國、歐洲和美國的監管路徑將可能出現分歧。

對企業 CISO（首席資安長）和安全團隊而言，Mythos 公開後的最重要問題是：**如何在允許防禦性使用的同時，防止攻擊者用相同能力發起大規模自動化攻擊**？這是 2026 年下半年資安領域最重要的新議題。

## 🔗 相關連結
- [原文連結 - TechTimes](https://www.techtimes.com/articles/317076/20260524/anthropic-moves-closer-public-claude-mythos-release-10000-critical-bugs-found-first.htm)
- [AndroidHeadlines 報導](https://www.androidheadlines.com/2026/05/anthropic-claude-mythos-ai-model-public-release-cybersecurity.html)
- [Cybersecurity News 分析](https://cybersecuritynews.com/claude-mythos-moves-toward-public/)
- [BleepingComputer 報導](https://www.bleepingcomputer.com/news/artificial-intelligence/anthropics-restricted-claude-mythos-model-may-be-coming-to-claude-code/)

---
*由 Claude 自動整理於 2026-05-29*

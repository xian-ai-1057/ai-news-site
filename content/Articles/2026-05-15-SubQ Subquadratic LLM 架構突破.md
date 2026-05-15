---
title: "Subquadratic launches with $29M to bring 12M-token context windows to AI"
date: 2026-05-15
source: SiliconANGLE
url: https://siliconangle.com/2026/05/05/subquadratic-launches-29m-bring-12m-token-context-windows-ai/
category: 技術理論
tags:
  - AI
  - 技術理論
  - LLM
  - 架構突破
  - 長上下文
  - Transformer
created: 2026-05-15
---

# SubQ：首個 Subquadratic 架構 LLM，1200 萬 Token 上下文窗口突破

> [!info] 文章資訊
> - **來源**：[SiliconANGLE](https://siliconangle.com/2026/05/05/subquadratic-launches-29m-bring-12m-token-context-windows-ai/)
> - **發布日期**：2026-05-05
> - **分類**：技術理論

## 📝 重點摘要

Subquadratic 公司以 2900 萬美元種子融資正式推出 SubQ，這是首個基於完全 Subquadratic（次二次方）架構建構的大型語言模型，支援高達 1200 萬 Token 的上下文窗口。SubQ 採用稀疏注意力機制（Sparse Attention），打破傳統 Transformer 的二次方運算瓶頸，在百萬 Token 規模下速度比主流前沿模型快 52 倍、成本降低 50 倍以上。此架構突破可能從根本上改變 AI 產品的設計方式，讓開發者無需依賴複雜的 RAG 系統即可處理整個程式碼庫或數百本書籍的長文本。

## 📖 全文內容

### 什麼是 SubQ？

Subquadratic 是一家開發新型生成式 AI 模型的公司，其旗艦產品 SubQ 使用所謂的 Subquadratic 架構，大幅增加上下文窗口——即 AI 一次能讀取的資訊量——而無需顯著增加所需的計算量。該公司表示，SubQ 在速度和準確性上均優於其他最先進的模型。

目前許多 AI 系統都是在上下文窗口限制下構建的。以行業標準而言，許多 AI 模型的上下文窗口為 12.8 萬 Token，而 Claude Sonnet 4.7 和 Gemini 3.1 Pro 等前沿雲端模型可達 100 萬 Token。SubQ 能管理高達 1200 萬 Token 的上下文窗口，在這個長度下，相當於約 900 萬個英文單詞，或接近 120 本書。

### 技術突破：從二次方到線性

為了達到這個上下文大小，Subquadratic 需要創建一個能夠處理大量數據而不超出「計算預算」的模型。共同創辦人 Justin Dangel（執行長）和 Alexander Whedon（技術長）表示，公司採用了一種實現稀疏注意力的專有 Transformer 架構。

「我們非常專注於如何從密集注意力的二次方縮放架構過渡到稀疏注意力的線性架構，」Dangel 說。「稀疏注意力是一種嘗試，不讓每個 Token 與每個 Token 進行比較。」

傳統 Transformer 模型使用密集注意力，即模型將輸入中的每個 Token 與其他每個 Token 進行比較。這很快就會變得昂貴：輸入量翻倍不只讓工作量翻倍，而是讓模型需要考慮的 Token 間關係數量大約增加四倍。這就是 Subquadratic 所針對的「二次方」縮放問題。

Whedon 解釋說：「如果你用二次方縮放定律將輸入大小翻倍，你需要四倍的計算量；用線性縮放定律，你只需要兩倍。」

### 性能表現

根據 Subquadratic 的說法，SubQ 在 100 萬 Token 時比領先的前沿模型快 50 多倍，成本降低 50 多倍，同時保持更高的準確性。在其完整的 1200 萬 Token 上下文窗口下，該公司表示，與其他前沿模型相比，模型的計算需求降低了近 1000 倍。

在 RULER 128K 長上下文基準測試中，Subquadratic 表示 SubQ 以 8 美元的成本達到了 95% 的準確率，而 Claude Opus 在 94% 的準確率下約需 2600 美元，代表成本降低了約 300 倍。

### 改變上下文窗口的處理方式

目前，LLM 的數據視圖對大多數最先進模型來說最多限制在 100 萬 Token，即使如此也可能因為計算限制而難以使用。

為了處理這個問題，開發者使用檢索增強生成（RAG）和代理檢索系統等系統來管理數據流。這些系統必然增加延遲和計算開銷，並可能使輸入到 LLM 的資訊產生偏差。

「我以前手動策劃提示詞、檢索系統、評估和條件邏輯來串聯工作流程，」Whedon 說。「我認為這是一種人類智慧的浪費，也限制了產品質量。」

Subquadratic 的願景是，AI 正受到密集注意力 Transformer 成本曲線的制約。該公司認為，一旦架構從二次方縮放轉移到線性縮放，開發者就可以構建以前速度太慢、成本太高或過度依賴脆弱數據整理的產品。

### 產品發布

公司正式推出 SubQ API，提供給需要訪問完整 1200 萬 Token 上下文窗口的開發者和企業團隊。同時也推出 SubQ Code，一個命令列介面編碼代理，設計用於將整個程式碼庫加載到單個上下文窗口中，讓開發者可以在整個存儲庫中進行規劃、執行和審查，而無需協調多個代理。

### 融資背景

本輪融資由包括 SoftBank Vision Fund 前合夥人 Javier Villamizar 和 Tinder 共同創辦人 Justin Mateen（JAM fund 創辦人）在內的投資者參與，以及 Anthropic、OpenAI、Stripe 和 Brex 的早期投資者。

「Transformer 架構和密集注意力所施加的基本縮放定律已經被突破，」Dangel 總結道。

## 💡 觀察與啟發

SubQ 的發布代表了一個重要的技術節點：如果稀疏注意力的線性縮放架構能被廣泛驗證，它將從根本上挑戰當前主流的 RAG（檢索增強生成）模式。目前幾乎所有企業 AI 部署都依賴 RAG 來管理大型知識庫，而一個能直接裝入 1200 萬 Token 的模型，理論上可以省去大量的數據工程投入。

然而，值得注意的是，截至發布時，SubQ 的性能數字均為廠商自述，尚未有第三方獨立驗證。在評估這個號稱「1000 倍成本降低」的宣稱時，應保持審慎。技術方向是正確的——業界確實需要突破二次方縮放瓶頸——但採用時機和實際業務落地效果仍需觀察。

對於軟體工程師和平台開發者而言，SubQ Code 的發布是更直接值得關注的產品：能將整個大型程式碼庫加載進單一上下文進行推理，這對程式碼審查、重構和跨文件依賴分析有潛在的革命性意義。

## 🔗 相關連結
- [原文連結](https://siliconangle.com/2026/05/05/subquadratic-launches-29m-bring-12m-token-context-windows-ai/)
- [SubQ 官方介紹](https://subq.ai/introducing-subq)
- [DataCamp SubQ 解析](https://www.datacamp.com/blog/subq-ai-explained)

## 📓 學習筆記
- [[2026-05-15-學習-Subquadratic 稀疏注意力架構|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-15*

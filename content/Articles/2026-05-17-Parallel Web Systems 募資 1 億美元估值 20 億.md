---
title: "Parallel Web Systems hits $2B valuation five months after its last big raise"
date: 2026-05-17
source: TechCrunch / SiliconANGLE
url: https://techcrunch.com/2026/04/29/parallel-web-systems-hits-2b-valuation-five-months-after-its-last-big-raise/
category: 新創公司
industry: ""
tags:
  - AI
  - 新創公司
  - AI Agent
  - 募資
  - Parag Agrawal
  - Sequoia
  - Web基礎設施
created: 2026-05-17
---

# Parallel Web Systems 五個月內估值翻倍至 20 億美元：前 Twitter CEO 的 AI Agent 網路基礎設施

> [!info] 文章資訊
> - **來源**：[TechCrunch](https://techcrunch.com/2026/04/29/parallel-web-systems-hits-2b-valuation-five-months-after-its-last-big-raise/)
> - **發布日期**：2026-04-29
> - **分類**：新創公司

## 📝 重點摘要

前 Twitter CEO **Parag Agrawal** 創辦的 **Parallel Web Systems** 完成 Series B 融資，由 Sequoia 領投，獲 **1 億美元**、估值跳升至 **20 億美元**——距離 2025 年底由 Kleiner Perkins、Index Ventures 領投的 1 億美元 Series A（估值 7.4 億美元）僅 5 個月。公司累計募資已達 2.3 億美元。Parallel 主打「為 AI Agent 設計的網頁搜尋與研究 API」，目前已被 Clay、Harvey、Notion、Opendoor 等客戶採用，平台開發者已突破 10 萬。本輪估值翻倍速度，反映了 AI Agent 基礎設施（特別是「能讓 Agent 上網讀資料」這一層）已成為 2026 年 VC 最熱門的押注方向之一。

## 📖 全文內容

### 募資條款

| 項目 | Series A（2025 Q4） | Series B（2026 Q2） |
|---|---|---|
| 募資金額 | $1 億 | **$1 億** |
| 估值（投後） | $7.4 億 | **$20 億** |
| 領投 | Kleiner Perkins、Index Ventures | **Sequoia** |
| 公司累計募資 | $1 億 | **$2.3 億** |

Series B 跟投投資人包括 Khosla Ventures、First Round Capital、Spark Capital、Terrain Capital——以及 Series A 領投方 Kleiner Perkins 與 Index Ventures 繼續加碼。

**5 個月估值翻倍**反映了三件事：
1. AI Agent 賽道資本擁擠程度極高
2. Parallel 在這段時間有明確的客戶增長與營收成長
3. Sequoia 為了搶頭部交易，願意付出顯著的估值溢價

### Parallel 在做什麼？「給 Agent 用的網際網路」

Parag Agrawal 在 2022 年 10 月被 Elon Musk 收購 Twitter 後解職，2023 年創辦 Parallel Web Systems。公司的核心產品定位是「**為 AI Agent 設計的網頁搜尋與研究 API**」——這個定位很重要，因為它不是「另一個搜尋引擎」，而是把整個 Web 重新包裝成「Agent 友善」的基礎設施。

**Parallel 解決什麼問題？**

當 AI Agent 需要上網查資料時，會遇到一連串問題：
1. **網頁不是給 Agent 看的**：HTML、JavaScript、動態載入、廣告、Cookie 牆——這些是給人看的，Agent 必須花大量算力解析
2. **檢索成本高**：每次需要新資料就要重新爬取，反覆抓取浪費頻寬
3. **品質判定難**：Agent 無法輕易分辨「這個網頁的資訊是否可信」
4. **頻率限制**：許多網站封鎖頻繁訪問的 IP，Agent 無法穩定取得資料

Parallel 把上述問題抽象成 API——Agent 開發者只要呼叫 Parallel 的 endpoint，就能取得「乾淨、結構化、可信的 Web 資訊」，不需自建爬蟲與處理 pipeline。

### 客戶與規模

公開的客戶名單包括：
- **Clay**：B2B 銷售 Agent 平台，需要大量公司與聯絡人資料
- **Harvey**：法律 AI 助手，需要法規與判例資料
- **Notion**：個人與企業生產力，需要 Web 內容整合
- **Opendoor**：房地產，需要市場與房源資料

平台開發者數量已突破 **10 萬**——以新創公司只有不到 2 年歷史、且面向相對技術背景的 Agent 開發者市場，這個數字相當亮眼。

### 為什麼這個賽道現在這麼火？

2026 年 AI Agent 已從「Demo」進入「實際工作」階段，Agent 在執行任務時需要大量上網查詢資料。這驅動了一個全新的基礎設施需求：

**Agent-friendly Web 基礎設施堆疊**

| 層級 | 代表新創 |
|---|---|
| Agent 編排（Orchestration） | LangChain、CrewAI、AutoGen |
| Agent 評估（Evaluation） | Judgment Labs（Series A $32M） |
| Agent 工具呼叫（Tool Use） | Composio、Arcade |
| **Web 資料層（Web Data）** | **Parallel Web Systems**、Bright Data、Apify |
| 通用 Agent 平台 | Sierra（$15B 估值）、Adept |

Parallel 處在「Web 資料層」這個重要位置——隨著 Agent 數量爆炸性增長，每個 Agent 都需要上網時，這層就成為兵家必爭。

### Sequoia 的策略：把賽道頭部押滿

Sequoia 在 2026 年的 AI Agent 賽道押注非常密集：
- Parallel Web Systems（領投 Series B）
- 多家其他 Agent 基礎設施與應用層公司

對 Sequoia 而言，「Web 給 Agent 用」這個故事如果跑通，市場規模可比擬「Twilio 之於 SMS、Stripe 之於支付」——成為新時代的網路基礎設施支柱。

## 💡 觀察與啟發

Parallel Web Systems 的快速估值成長並非偶然，它反映了 2026 年 AI 基礎設施投資邏輯的一個關鍵轉變：**資金正從「模型層」流向「工具與資料層」**。過去三年資本集中在 OpenAI、Anthropic、Mistral 這類前沿模型；2026 年隨著模型能力進入紅海，投資焦點開始下移到「讓 Agent 能真正工作」的基礎設施——包括 Web 資料、工具呼叫、評估、編排。

從產業結構看，Parallel 這類公司有兩個結構性優勢：
1. **平台不偏好任何模型**：無論你的 Agent 跑的是 Claude、GPT、Gemini 還是開源模型，都需要 Web 資料。這讓 Parallel 不會因為某個模型供應商崛起或衰落而受影響。
2. **網路效應**：用戶愈多，Parallel 可以做愈多的「集中爬取」——爬一次資料服務多個客戶，邊際成本極低、毛利率極高。

對台灣與亞洲市場而言，Parallel 模式提供了一個值得思考的本土機會：**繁體中文與亞洲語言的 Web 資料層尚未被充分商品化**。Parallel 主要服務英文網際網路，但日韓中、東南亞語言的 Web 結構與內容生態不同，存在本地化機會。如果有公司能做出「亞洲版 Parallel」——專注於台灣的法規資料庫、PTT、Mobile01、商業司、健保署等繁體中文資料源——可能會在企業級客戶（律師事務所、金融、零售）中找到強烈需求。

對台灣的 AI 應用開發者而言，這個趨勢有一個實用啟示：**不要自建爬蟲與資料 pipeline**——把這個複雜性外包給 Parallel 這類專業基礎設施，把自己的精力放在差異化的「Agent 應用邏輯」與「客戶體驗」上。AI Agent 時代的開發棧正在快速分工專業化，自建 Web 抓取在 2026 年已經是個負優勢的選擇。

## 🔗 相關連結
- [TechCrunch 報導](https://techcrunch.com/2026/04/29/parallel-web-systems-hits-2b-valuation-five-months-after-its-last-big-raise/)
- [SiliconANGLE: Parallel $100M Series A](https://siliconangle.com/2026/04/28/parag-agrawals-startup-raises-100m-build-parallel-web-ai-agents/)
- [Parallel 官方網站](https://parallel.ai/)
- [PRNewswire 官方發布](https://www.prnewswire.com/news-releases/parallel-raises-at-2-billion-valuation-to-scale-web-infrastructure-for-agents-302756350.html)

---
*由 Claude 自動整理於 2026-05-17*

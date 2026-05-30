---
title: "Anthropic 限制 Claude Mythos Preview 公開發布：零日漏洞自主發現能力過危險，僅授權 40+ 關鍵基礎設施夥伴"
date: 2026-05-30
source: The Hill / Fortune
url: https://thehill.com/policy/technology/5824219-anthropic-new-ai-dangerous-public/
category: 重大新聞
industry: ""
tags:
  - AI
  - 重大新聞
  - Anthropic
  - AI安全
  - Claude
  - 網路安全
  - AI風險
created: 2026-05-30
---

> [!info] 文章資訊
> - **來源**：[The Hill](https://thehill.com/policy/technology/5824219-anthropic-new-ai-dangerous-public/)
> - **發布日期**：2026-04-08 至 2026-04-11
> - **分類**：重大新聞

## 📝 重點摘要

Anthropic 在 2026 年 4 月宣布其最新模型 Claude Mythos Preview 因安全疑慮而不向一般大眾公開發布，僅向包含 Microsoft、Apple、CrowdStrike、Amazon Web Services 在內的約 40 個關鍵基礎設施組織授權存取。核心安全考量是：Mythos Preview 能夠自主、即時地大規模發現與利用「零日漏洞（zero-day vulnerabilities）」，在公開測試中已找到存在於每個主流作業系統與瀏覽器中數千個先前未被發現的安全漏洞。Anthropic 同時啟動「Project Glasswing」計畫，引導這些能力用於修補而非攻擊。

## 📖 全文內容

⚠️ 全文抓取失敗（WebFetch 返回 403），以下為多來源搜尋摘要整理。

### 事件背景

2026 年 4 月 8-11 日，Anthropic 公開宣布對其最新的前沿模型 Claude Mythos Preview 實施「限制發布（restricted release）」——即該模型不向一般開發者或公眾開放，只向嚴格審核的合作夥伴開放存取。

這是 AI 公司首次因為模型「過於強大而具有危險性」的理由而主動限制商業發布，標誌著 AI 安全考量首次在商業決策層面凌駕於市場競爭壓力。

### 核心安全問題：自主零日漏洞發現

Anthropic 在公告中說明了限制發布的具體原因：

**Mythos Preview 已越過前所未有的安全門檻**

沒有任何先前的商業 AI 模型達到過 Mythos Preview 所表現出的安全相關能力：
- 能夠**自主、即時地**（autonomous, real-time）大規模發現並利用零日漏洞
- 在測試中已找到存在於**每個主流作業系統和網路瀏覽器**中的數千個先前未知的安全漏洞
- 這些漏洞涵蓋了現有所有主要軟體平台的底層系統

**潛在危害規模**

Anthropic 在公告中明確指出：
- 若此類能力被惡意行為者取得，其對經濟、公共安全與國家安全的破壞力「可能極為嚴峻（could be severe）」
- Anthropic 認為，鑑於 AI 進展速度，「不久後此類能力將可能擴散到對安全部署沒有承諾的行為者手中」

### Project Glasswing：攻擊性能力轉為防禦性用途

為了讓 Mythos Preview 的安全發現能力用於保護而非傷害，Anthropic 同步啟動了「Project Glasswing」計畫：

**授權夥伴（約 40+ 組織）**：
- **科技巨頭**：Microsoft、Apple、Amazon Web Services
- **網路安全公司**：CrowdStrike
- **關鍵基礎設施建構者**：40+ 個建構關鍵軟體基礎設施的組織

**Project Glasswing 的運作模式**：
- 授權夥伴在受控環境中使用 Mythos Preview 掃描自身系統
- 發現漏洞後立即進行修補，而非公開或利用
- Anthropic 設置監控機制確保模型在授權範圍內使用
- 計畫目標是：在惡意行為者能複製此能力前，率先修補關鍵基礎設施中的已知漏洞

### 行業與政策反應

**業界反應**

這一決定在 AI 業界引發廣泛討論。部分人士認為 Anthropic 的做法是負責任的 AI 開發典範；另一些人（包括一篇廣為流傳的文章）質疑限制發布的真實原因，認為成本而非安全才是主因。

**政策影響**

Mythos Preview 的出現加速了多個政策討論：
- 美國政府正在建立 AI 模型的預發布評估框架
- 歐盟 AI 法案的「極高風險」類別（frontier capabilities）相關討論更加緊迫
- 包括 Microsoft、xAI 在內的多家主要 AI 公司已同意向監管機構提供早期模型存取權

### Anthropic 的公開聲明

Anthropic 的官方表述：

> "Given the rate of AI progress, it will not be longer before such capabilities proliferate, potentially beyond actors who are committed to deploying them safely. The fallout — for economics, public safety, and national security — could be severe."

（「鑑於 AI 進展速度，此類能力不久將可能擴散到對安全部署沒有承諾的行為者手中。其後果——對經濟、公共安全與國家安全——可能是嚴峻的。」）

## 💡 觀察與啟發

Anthropic 的這一決定是 AI 歷史上的一個重要轉折點：這是商業 AI 公司第一次正式承認「我們做出了一個即使從商業角度看也值得犧牲收入的安全決策」。

這個事件暴露了 AI 安全的一個核心問題：最有動機謹慎發布的公司（如 Anthropic）確實在謹慎發布，但最有動機快速發布的競爭對手不一定會做相同選擇。Anthropic 做了「對的事」，但如果其他公司很快發展出類似能力而選擇公開發布，Anthropic 的自我克制就只是讓競爭對手獲得了市場優勢。

Project Glasswing 的設計思路值得借鑑：與其被動防守，不如主動用 AI 的攻擊性能力修補現有系統——這是一種「以子之矛攻子之盾」的防禦策略。

對網路安全產業而言，零日漏洞的大規模自動發現能力的出現，意味著傳統的漏洞賞金和手動滲透測試模式即將被顛覆。

## 🔗 相關連結
- [The Hill 報導](https://thehill.com/policy/technology/5824219-anthropic-new-ai-dangerous-public/)
- [Fortune 分析](https://fortune.com/2026/04/10/anthropic-too-dangerous-to-release-ai-model-means-for-its-upcoming-ipo/)
- [Euronews 詳細說明](https://www.euronews.com/next/2026/04/08/why-anthropics-most-powerful-ai-model-mythos-preview-is-too-dangerous-for-public-release)
- [Understanding AI 深度分析](https://www.understandingai.org/p/why-anthropic-believes-its-latest)

---
*由 Claude 自動整理於 2026-05-30*

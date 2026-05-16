---
title: "Defense at AI speed: Microsoft's new multi-model agentic security system tops leading industry benchmark"
date: 2026-05-16
source: Microsoft Security Blog
url: https://www.microsoft.com/en-us/security/blog/2026/05/12/defense-at-ai-speed-microsofts-new-multi-model-agentic-security-system-tops-leading-industry-benchmark/
category: 技術理論
tags:
  - AI
  - 技術理論
  - 資安
  - Agent系統
  - Microsoft
  - 漏洞掃描
created: 2026-05-16
---

# Microsoft MDASH：AI 驅動的多模型代理安全掃描系統

> [!info] 文章資訊
> - **來源**：[Microsoft Security Blog](https://www.microsoft.com/en-us/security/blog/2026/05/12/defense-at-ai-speed-microsofts-new-multi-model-agentic-security-system-tops-leading-industry-benchmark/)
> - **發布日期**：2026-05-12
> - **分類**：技術理論

## 📝 重點摘要

微軟宣布推出代號 MDASH（多模型代理掃描框架）的 AI 驅動資安系統，透過協調 100 多個專用 AI Agent 的集成模型，在 Windows 網路堆疊中發現了 16 個新漏洞（含 4 個嚴重遠端執行程式碼漏洞）。該系統在行業公開基準測試 CyberGym 上達到 88.45% 的得分，位居排行榜首位，比第二名領先約 5 個百分點，標誌著 AI 漏洞發現已從研究跨越至生產級防禦。

## 📖 全文內容

### 背景：AI 安全的工程挑戰

微軟自主程式碼安全（ACS）團隊的多名成員來自 Team Atlanta，這個團隊贏得了 DARPA AI 網路挑戰賽（AI Cyber Challenge）的 2950 萬美元獎金，透過建構一個能在複雜開源專案中發現並修補真實漏洞的自主網路推理系統。

微軟程式碼庫對安全審計具有獨特挑戰：
- **龐大的私有攻擊面**：Windows、Hyper-V、Azure 是私有 Microsoft 程式碼庫，不在任何商用語言模型的訓練語料中
- **規模化的 DevSecOps**：每個發現都有真實負責人、分類流程和 Patch Tuesday 時限
- **高價值目標**：Windows、Hyper-V、Xbox 和 Azure 服務數十億用戶

### MDASH 架構

MDASH 的核心是一個**代理漏洞發現與修復系統**。模型是一個輸入，系統才是產品。

**五個流水線階段：**
1. **準備階段**：攝取原始碼目標，建立語言感知索引，通過分析過去的提交來繪製攻擊面和威脅模型
2. **掃描階段**：在候選程式碼路徑上運行專門的審計 Agent，產出候選發現
3. **驗證階段**：運行第二批 Agent（辯論者）對每個發現的可達性和可利用性進行論證
4. **去重階段**：折疊語義等效的發現
5. **驗證階段**：構建並執行觸發輸入（如 ASan 在 C/C++ 中的應用）

**三個核心屬性：**
1. **多模型集成**：沒有任何單一模型在所有階段表現最佳，MDASH 運行可配置的模型組合（頂尖模型作為重度推理器、蒸餾模型作為高容量辯論者、第二個獨立的頂尖模型作為反例）
2. **專用 Agent**：100 多個專用 Agent 各司其職——審計者不同於辯論者，辯論者不同於驗證者
3. **端到端流水線及可擴展插件**：插件讓領域專家注入基礎模型無法自行獲取的上下文

### 5 月 12 日 Patch Tuesday 成果

MDASH 在今日 Patch Tuesday 中包含的 16 個 CVE 橫跨 Windows 網路堆疊和相鄰服務：

| 元件 | 描述 | CVE | 嚴重程度 | 類型 |
|---|---|---|---|---|
| tcpip.sys | 遠端未認證 SSRR IPv4 封包導致 UAF | CVE-2026-33827 | **嚴重** | 遠端程式碼執行 |
| ikeext.dll | 未認證 IKEv2 SA_INIT 雙重釋放觸發 LocalSystem RCE | CVE-2026-33824 | **嚴重** | 遠端程式碼執行 |
| netlogon.dll | 未認證 CLDAP User= 過濾器堆疊溢位 | CVE-2026-41089 | **嚴重** | 遠端程式碼執行 |
| dnsapi.dll | 精心製作的 UDP DNS 回應觸發堆積 OOB | CVE-2026-41096 | **嚴重** | 遠端程式碼執行 |
| 其他（共 12 個） | tcpip.sys、http.sys、telnet.exe 等 | 多個 | 重要 | DoS/信息洩露/提權 |

### 深度剖析兩個代表性漏洞

**CVE-2026-33827**（tcpip.sys 遠端未認證 UAF）：漏洞源於 Windows IPv4 接收路徑中 Path 物件的生命週期管理不當。函數調用路由查找後，通過解引用操作釋放了對 Path 的唯一擁有引用，但之後在處理嚴格來源與記錄路由（SSRR）時重複使用了同一個指標。由於物件的引用計數可能已在早期釋放點達到零，底層記憶體可能被回收並重用，將後續訪問變成核心上下文中的典型使用後釋放（UAF）。

**CVE-2026-33824**（ikeext.dll IKEv2 雙重釋放導致 LocalSystem RCE）：漏洞存在於 IKEEXT 服務中。攻擊者發送攜帶 Microsoft 供應商 ID payload 的精心製作 IKE_SA_INIT，再加上一個立即重組的 IKEv2 片段，即可觸發服務內部 16 字節堆分配的確定性雙重釋放。由於 IKEEXT 作為 LocalSystem 在 svchost.exe 中運行，這代表著對系統最高特權上下文之一的預認證遠端程式碼執行路徑。

### 基準測試表現

**歷史 MSRC 案例回顧性測試：**
- `clfs.sys`：5 年 28 個 MSRC 案例的 **96% 召回率**
- `tcpip.sys`：5 年 7 個 MSRC 案例的 **100% 召回率**

**公開基準 CyberGym：**
在涵蓋 188 個 OSS-Fuzz 專案的 1,507 個真實世界漏洞重現任務上，MDASH 達到 **88.45%** 的成功率，高於排行榜第二名的 83.1%。

### 核心洞察

> 「系統做工，而模型是一個輸入。」

三個關鍵啟示：
1. **發現需要組合能力**——單一模型無法處理跨越多個檔案的複雜漏洞
2. **驗證決定發現品質**——沒有驗證的掃描器只是製造待分類的積壓工作
3. **系統能吸收模型改進**——每次新模型上線，無需重寫流水線，只需更換配置

## 💡 觀察與啟發

MDASH 的重要性不僅在於其發現了多少漏洞，更在於它重塑了「AI 安全工具」的定義框架。傳統上，業界關注的問題是「用哪個模型？」，而 MDASH 的答案是「模型本身不重要，模型周圍的代理系統才是護城河」。

對於資安產品開發者和企業 CISO，這帶來了清晰的含義：投資 AI 安全工具時，應評估的是其代理框架的設計（去重、驗證、專用 Agent 的協調能力），而非單純比較底層模型的排名。那些把賭注押在特定模型上的工具，每六個月就得重建一次。

## 🔗 相關連結
- [原文連結](https://www.microsoft.com/en-us/security/blog/2026/05/12/defense-at-ai-speed-microsofts-new-multi-model-agentic-security-system-tops-leading-industry-benchmark/)
- [加入私人預覽](https://aka.ms/AI-drivenScanningHarness)

## 📓 學習筆記
- [[2026-05-16-學習-多模型代理安全掃描系統|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-16*

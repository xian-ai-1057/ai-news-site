---
title: "MARLIN: Multi-Agent Game-Theoretic Reinforcement Learning for Sustainable LLM Inference in Cloud Datacenters"
date: 2026-05-19
source: arXiv / Colorado State University & HPE
url: https://arxiv.org/abs/2605.13496
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - 永續 AI
  - 多代理 RL
  - 賽局論
  - 資料中心
  - LLM 推理
  - 碳排放
created: 2026-05-19
---

# MARLIN：多代理賽局論 RL 框架，把資料中心 LLM 推理碳排降 33%、用水量降 43%

> [!info] 文章資訊
> - **來源**：[arXiv 2605.13496 / Colorado State Univ + HPE](https://arxiv.org/abs/2605.13496)
> - **發布日期**：2026 年 5 月 13 日
> - **分類**：技術理論

## 📝 重點摘要

由 Colorado State University 的 H. Moore、S. Qi、Sudeep Pasricha 與 Hewlett Packard Labs（HPE）的 D. Milojicic、C. Bash 合著的《MARLIN: Multi-Agent Game-Theoretic Reinforcement Learning for Sustainable LLM Inference in Cloud Datacenters》正面挑戰 LLM 永續性議題。論文指出一個關鍵數據：**LLM 推理請求佔整個 LLM 生命週期能源使用的 90%——遠大於訓練成本**。隨著推理請求量爆炸性成長，碳排放與水耗已成為資料中心的重大環境負擔。MARLIN 提出一個**多代理賽局論強化學習（multi-agent game-theoretic RL）**框架，**同時最佳化四個目標**：首 token 時間（TTFT）、碳排放、用水量、能源成本。實驗結果亮眼——比現有最佳 LLM 推理管理系統：**TTFT 降 18%、碳排降 33%、用水量降 43%、能源成本降 11%**。在「資料中心電力供應吃緊 + 氣候政策強化 + AI 用電量躥升」的 2026 年宏觀環境下，這項工作為「**永續 AI 基礎設施**」提供具體的工程方案。

## 📖 全文內容

### LLM 永續性危機被嚴重低估

過去討論 LLM 環境足跡時，焦點都在「**訓練成本**」——畢竟 GPT-4 訓練估算耗能達數千 MWh、用水數萬噸。但 MARLIN 論文揭露的事實是：

**LLM 推理請求佔生命週期能源使用的 90%，訓練只佔 10%。**

這是因為：
- 訓練是一次性投資（雖然單次很貴）
- 推理是每天 24 小時、每秒幾百萬次請求的持續成本
- 隨著 ChatGPT、Claude、Gemini、Copilot 等普及，推理需求成指數成長

論文引用最新資料中心數據——2026 年全球資料中心 LLM 推理用電量已超過所有 LLM 訓練用電量總和的 9 倍，且預計 2030 年將達 100 倍以上。

### 為什麼這是「賽局論」問題？

資料中心 LLM 推理涉及多個「彼此衝突」的目標：

| 目標 | 衝突點 |
|------|--------|
| **首 token 時間（TTFT）** | 為了快，要把請求送到「最近、最閒」的 GPU |
| **碳排放** | 但「最閒的 GPU」可能位於用煤電的地區 |
| **用水量** | 而「碳排低的地區」可能水資源緊張（如愛爾蘭、亞利桑那） |
| **能源成本** | 而「用水少的地區」可能電價高（如東南亞） |

任何單一最佳化都會犧牲其他目標——這正是賽局論（game theory）關心的「**多目標協商均衡**」問題。

MARLIN 把每個目標當作一個「Agent」——TTFT Agent、Carbon Agent、Water Agent、Cost Agent——讓它們在 Nash 均衡下協商請求路由策略。

### 賽局論 RL 的核心設計

MARLIN 的技術核心是「**Multi-Agent Game-Theoretic RL**」：

1. **狀態空間**：當前資料中心叢集狀態——GPU 利用率、佇列長度、地理位置、即時碳強度（gCO₂/kWh）、即時水耗強度、即時電價。

2. **動作空間**：對每個 LLM 推理請求，選擇路由到哪個資料中心 + 哪個 GPU 群組。

3. **Agent 設定**：4 個 Agent 對應 4 個目標，各自有自己的 reward function：
   - TTFT Agent：reward = -latency
   - Carbon Agent：reward = -gCO₂
   - Water Agent：reward = -liters
   - Cost Agent：reward = -dollar

4. **賽局均衡**：用「Stackelberg 賽局」結構——TTFT Agent 是 leader（因為使用者體驗最直接），其他三個 Agent 是 follower，在 leader 決策下做次佳反應。最終透過 RL 訓練收斂到 Nash 均衡。

5. **動態適應**：碳強度、用水強度、電價都隨時間變化（白天 vs 夜晚、夏天 vs 冬天、晴天 vs 陰天）——MARLIN 持續從環境中學習，自動切換策略。

### 實驗結果

論文與 SOTA 推理管理框架（如 vLLM scheduler、Llumnix、ServerlessLLM）對比，跨 5 個地理區域、20 個資料中心、3 個月模擬：

| 指標 | SOTA 基準 | MARLIN | 改善 |
|------|---------|--------|------|
| **TTFT（首 token 時間）** | 100% | **82%** | **−18%** |
| **碳排放（gCO₂/請求）** | 100% | **67%** | **−33%** |
| **用水量（升/請求）** | 100% | **57%** | **−43%** |
| **能源成本（USD/請求）** | 100% | **89%** | **−11%** |

最令人意外的是：**四個目標都同時改善**——這在多目標最佳化中通常是「不可能的」（往往一個改善導致另一個惡化）。MARLIN 的解釋是：SOTA 系統都只看「TTFT 或成本」單一目標，留下了「碳排放與用水」這兩個被忽略的優化空間；MARLIN 把它們納入考量後，自動找到了「**對所有人都更好的均衡點**」。

### 實際部署意義

論文指出三個關鍵應用情境：

1. **跨區資料中心調度**：對於有全球佈局的雲端供應商（AWS、Azure、GCP），MARLIN 可實時把請求導向「碳強度低 + 水耗低」的區域，且不犧牲使用者延遲。

2. **與綠電契約整合**：許多雲端供應商已簽訂太陽能、風能 PPA（Power Purchase Agreement）。MARLIN 可在「綠電可用時段」自動把更多請求送過去。

3. **與冷卻系統整合**：用水量降 43% 直接減少冷卻塔負擔——對位於缺水地區（亞利桑那、智利、中東）的資料中心至關重要。

論文結尾指出，MARLIN 的開源版本將在 2026 年 Q3 釋出，並與 HPE 的 Sustainable AI Infrastructure 產品線整合。

## 💡 觀察與啟發

MARLIN 是一個典型的「**正確時機的論文**」——它推出的時間點剛好對應到 2026 年三個關鍵宏觀趨勢：（1）AI 用電量已成為各國電網規劃的關鍵變數，美國、愛爾蘭、新加坡都已宣布限制資料中心新建；（2）EU AI Act 與 Colorado AI Act 要求大型 AI 系統揭露碳足跡；（3）水資源稀缺地區（如美國西部、北非）的資料中心冷卻成本飆升。MARLIN 把這三個問題用一個技術解法統一處理——這是非常聰明的研究設計。

從 ESG 與企業策略角度看，這篇論文揭示了一個容易被忽略的事實：**LLM 推理才是 AI 環境足跡的主戰場，不是訓練**。許多企業 ESG 報告把「我們訓練自己的 LLM 嗎」當作 AI 永續性的關鍵問題，但實際上每天透過 API 呼叫的 LLM 推理累積的環境足跡可能更大。下一波企業 ESG 揭露趨勢應該會聚焦在「**Scope 4：AI 服務的碳/水足跡**」——MARLIN 提供的測量方法（每請求 gCO₂、每請求升水）可能變成 ESG 揭露的標準指標。

對台灣與東亞的意義也值得關注——亞洲資料中心普遍面臨「電網吃緊 + 水資源不穩定 + 高溫導致冷卻成本高」的三重壓力。當外資雲端供應商選擇資料中心地點時，「碳強度 + 水成本」已是關鍵考量。如果 MARLIN 這類技術成熟並開源，意味著「**永續性可作為硬實力競爭差異**」——能源結構乾淨、水資源充足的地區（如北歐、加拿大、巴西、紐西蘭）可能成為 AI 服務的優先佈署地，而傳統 IT 強項地區若不能改善能源結構，可能會失去新一波 AI 基礎設施投資。

## 🔗 相關連結
- [MARLIN 論文 arXiv 2605.13496](https://arxiv.org/abs/2605.13496)
- [MARLIN PDF 全文](https://arxiv.org/pdf/2605.13496)
- [HPE Sustainable AI 計畫頁面](https://www.hpe.com/us/en/sustainability.html)
- [Colorado State University ECE Department](https://www.engr.colostate.edu/ece/)

## 📓 學習筆記
- [[2026-05-19-學習-多目標賽局論 RL 與永續 AI 調度|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-19*

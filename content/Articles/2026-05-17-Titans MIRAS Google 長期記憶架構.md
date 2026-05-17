---
title: "Titans + MIRAS: Helping AI have long-term memory"
date: 2026-05-17
source: Google Research Blog
url: https://research.google/blog/titans-miras-helping-ai-have-long-term-memory/
category: 技術理論
industry: ""
tags:
  - AI
  - 技術理論
  - Google
  - LLM架構
  - 長期記憶
  - Transformer
  - 序列建模
created: 2026-05-17
---

# Titans + MIRAS：Google 提出可在執行中即時更新長期記憶的 AI 架構

> [!info] 文章資訊
> - **來源**：[Google Research Blog](https://research.google/blog/titans-miras-helping-ai-have-long-term-memory/)
> - **發布日期**：2025-12-04（持續為 2026 年研究社群討論的核心）
> - **分類**：技術理論

## 📝 重點摘要

Google Research 發表 Titans 架構與 MIRAS 框架兩篇論文，提出一種能在執行（test-time）時即時更新自身記憶的全新序列建模典範。Titans 以「短期注意力 + 神經長期記憶模組（multi-layer perceptron）」雙系統設計，並引入「驚訝度（surprise metric）」決定哪些資訊值得寫入長期記憶；MIRAS 則將所有現代序列模型（Transformer、Mamba-2、Gated DeltaNet 等）統一為「聯想記憶模組」的四個設計選擇。實驗顯示 Titans 在 BABILong 長文推理基準上超越 GPT-4，並能擴展至超過 200 萬 token 的上下文窗口，且維持線性推理速度。

## 📖 全文內容

### 問題背景：Transformer 與線性 RNN 的兩難

標準 Transformer 透過注意力機制達成高精度，但計算成本隨序列長度二次方增長，無法擴展到極長上下文（如全文件理解或基因組分析）。線性 RNN 與狀態空間模型（SSM，如 Mamba-2）以「將上下文壓縮成固定大小狀態」實現線性擴展，但固定大小的壓縮無法承載極長序列的豐富資訊。Google 提出 Titans 與 MIRAS，目標是結合 RNN 的速度與 Transformer 的精度。

### Titans：執行中即時學習新上下文

Titans 引入一個與標準注意力並列、但本質截然不同的「神經長期記憶模組」。與傳統 RNN 使用固定向量或矩陣保存狀態不同，Titans 的長期記憶模組是一個「多層感知器（MLP）深度神經網路」——表達力遠強於向量壓縮，能在不丟失關鍵脈絡的前提下，總結大量資訊。

**驚訝度機制（Surprise Metric）**

Titans 不是被動儲存資料，而是主動學習辨識值得記憶的關鍵概念與關聯。它將「驚訝度」量化為新輸入與當前記憶狀態之間的梯度差距：

- **低驚訝度**：模型已預期下一個 token 是動物名詞，輸入「cat」時梯度小，可跳過長期記憶寫入。
- **高驚訝度**：模型正在總結財務報告，突然出現「香蕉皮的圖片」，梯度極大，必須優先寫入長期記憶。

這個機制讓 Titans 只將真正「打破預期」的資訊納入長期記憶，保持整體流程的高效。

**動量（Momentum）與遺忘（Forgetting）**

Titans 進一步引入兩個機制：
1. **動量**：同時考量「當下驚訝」與「近期累積驚訝」，避免單一 token 的驚訝度誤判。
2. **自適應權重衰減（Forgetting Gate）**：處理極長序列時，主動丟棄不再需要的資訊，管理有限的記憶容量。

### MIRAS：序列建模的統一視角

MIRAS（Memory In Reaction to Associative Stream）論文指出，從 Transformer 到 Mamba-2、Gated DeltaNet 的所有突破，本質上都是不同形式的「聯想記憶模組」。MIRAS 把任何序列模型拆解為四個設計選擇：

1. **記憶架構（Memory architecture）**：儲存資訊的結構（向量、矩陣、或像 Titans 的深度 MLP）。
2. **注意力偏好（Attentional bias）**：模型內部學習目標決定它優先注意什麼。
3. **保留閘（Retention gate）**：重新詮釋為「正則化」——平衡新學習與保留舊知識。
4. **記憶演算法（Memory algorithm）**：用於更新記憶的最佳化演算法。

**突破 MSE 範式**

幾乎所有現有序列模型都依賴均方誤差（MSE）或內積相似度作為偏好與保留訓練目標，這導致模型對極端值敏感、表達力受限。MIRAS 提供生成式框架，可探索非歐幾里德目標與正則化，並衍生三個具體模型：

- **YAAD**：使用 Huber loss，對極端值較不敏感，適合輸入資料雜訊大的情境。
- **MONETA**：使用廣義範數，對注意力與遺忘採用更嚴格的數學懲罰。
- **MEMORA**：強制記憶呈現嚴格機率分佈，確保每次更新都穩定可控。

### 實驗結果

| 場景 | 對比基線 | 結果 |
|---|---|---|
| 語言建模（C4, WikiText） | Transformer++, Mamba-2, Gated DeltaNet | Titans 與 MIRAS 變體（YAAD/MONETA/MEMORA）全面領先 |
| 零樣本推理（HellaSwag, PIQA） | 同上 | 更高準確率與更低困惑度 |
| BABILong 長文推理 | GPT-4 等大型模型 | Titans 在參數遠少於 GPT-4 的情況下勝出 |
| 上下文窗口擴展 | — | 成功擴展至 200 萬 token 以上，精度仍維持 |

消融研究還顯示「記憶模組的深度」是關鍵——同樣記憶體大小下，更深的 MLP 記憶模組能顯著降低困惑度，且隨序列長度增加時的擴展性也更佳。

### 應用範圍

Titans 與 MIRAS 不僅在語言模型上有效，研究團隊還在 DNA 基因組建模與時間序列預測中驗證了該架構的通用性——這代表「執行時學習記憶」的範式可能適用於遠超語言以外的序列建模問題。

## 💡 觀察與啟發

Titans 與 MIRAS 最深刻的意義在於它們重新定義了「上下文窗口」這個概念。過去 LLM 的長上下文是靠把 KV-cache 撐大或用稀疏注意力近似來達成；Titans 則改變了問題框架——上下文不是被「記住」，而是被「學習進記憶模組」。這意味著模型在執行時就能對個別任務做出小幅、即時、可逆的微調，而不需要重新訓練。

MIRAS 把所有序列模型統一在「聯想記憶 + 線上最佳化」的框架下，這個觀點在學術上極具威力——它讓 Transformer、Mamba-2、Titans 都成為同一個設計空間裡的不同點，未來新架構不必每次都「重新發明輪子」，可以系統性地探索四個設計選擇的組合。

對企業而言，Titans 類架構意味著「個人化記憶 AI」可能不再依賴複雜的 RAG pipeline——模型本身就能在對話中即時記住每個使用者的偏好與歷史脈絡。配合 200 萬 token 上下文，整本書、整套程式碼倉庫、整年度財報，都可在單一推理流程中保持精度。這是 Anthropic 的 1M context Claude 與 Gemini 2M context 之外，又一條值得關注的長上下文路徑。

## 🔗 相關連結
- [Google Research 部落格原文](https://research.google/blog/titans-miras-helping-ai-have-long-term-memory/)
- [Titans 論文（arXiv:2501.00663）](https://arxiv.org/abs/2501.00663)
- [MIRAS 論文（arXiv:2504.13173）](https://arxiv.org/pdf/2504.13173)

## 📓 學習筆記
- [[2026-05-17-學習-Titans 神經長期記憶架構|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-17*

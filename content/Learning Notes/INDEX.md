---
title: AI 學習筆記中心
date: 2026-05-14
type: index
tags:
  - AI
  - 學習筆記
  - 索引
created: 2026-05-13
updated: 2026-05-15
---

# 🎓 AI 學習筆記中心

> 這是一份**學習導航頁**——所有從每日 AI 日報自動產出的技術主題學習筆記都會匯總在這裡，按主題分類、難度分級、並提供建議閱讀順序。

---

## 📊 全部學習筆記（依日期）

| 日期 | 主題 | 難度 | 領域 | 互動工具 |
|---|---|---|---|---|
| 2026-05-15 | [[2026-05-15-學習-Subquadratic 稀疏注意力架構\|Subquadratic 稀疏注意力架構]] | 中階 | 模型架構 / 長上下文 | — |
| 2026-05-15 | [[2026-05-15-學習-AlphaEvolve 進化演算法與 LLM 結合\|AlphaEvolve：進化演算法 × LLM]] | 中階 | 演算法發現 / 科學 AI | — |
| 2026-05-15 | [[2026-05-15-學習-混合專家架構 MoE 為何成為主流\|混合專家架構（MoE）主流化]] | 入門 | 模型架構 | — |
| 2026-05-14 | [[2026-05-14-學習-Qwen3 雙模式統一推理\|Qwen3 雙模式統一推理]] | 中階 | 模型架構 / 推理模型 | — |
| 2026-05-14 | [[2026-05-14-學習-Mem0 圖記憶架構\|Mem0 圖記憶架構]] | 中階 | Agent / 長期記憶 | — |
| 2026-05-14 | [[2026-05-14-學習-推測解碼與 TLT 訓練加速\|推測解碼與 TLT 訓練加速]] | 進階 | 訓練優化 / 推測解碼 | — |
| 2026-05-13 | [[2026-05-13-學習-Recursive Language Models 遞迴語言模型\|遞迴語言模型 (RLM)]] | 中階 | 推論架構 / 長上下文 | [🎮 RLM Explorer](Interactive/rlm-recursive-explorer.html) |
| 2026-05-13 | [[2026-05-13-學習-Mixture of Experts MoE 入門\|Mixture of Experts (MoE)]] | 入門 | 模型架構 | [🎮 MoE Simulator](Interactive/moe-router-simulator.html) |
| 2026-05-13 | [[2026-05-13-學習-Bayes-consistent Agent 編排\|Bayes-consistent Agent 編排]] | 中階 | Agent / 不確定性 | — |
| 2026-05-13 | [[2026-05-13-學習-LLM Agent 技能演化框架\|LLM Agent 技能演化（Evolving-RL / SkillOS）]] | 中階 | Agent / 持續學習 | — |

---

## 🗺️ 依主題分類

### 模型架構（怎麼把模型蓋大、蓋好）
- [[2026-05-15-學習-Subquadratic 稀疏注意力架構|Subquadratic 稀疏注意力（SSA）]] — 打破 Transformer 二次方縮放，支援 1200 萬 Token 上下文
- [[2026-05-15-學習-混合專家架構 MoE 為何成為主流|混合專家架構（MoE）主流化]] — 2026年四大中國開放模型全採 MoE 的原因
- [[2026-05-14-學習-Qwen3 雙模式統一推理|Qwen3 雙模式統一推理]] — 把「快答」與「慢想」整合進單一權重
- [[2026-05-13-學習-Mixture of Experts MoE 入門|Mixture of Experts (MoE) 入門]] — 稀疏激活讓容量變大但運算不變大

### 演算法發現（怎麼讓 AI 自己發明更好的算法）
- [[2026-05-15-學習-AlphaEvolve 進化演算法與 LLM 結合|AlphaEvolve：進化演算法 × LLM]] — Gemini 驅動的演化搜尋，在量子物理到物流均取得突破

### 推論流程（怎麼讓 LLM 更聰明地用上下文）
- [[2026-05-13-學習-Recursive Language Models 遞迴語言模型|遞迴語言模型 (RLM)]] — LLM 對長文件遞迴展開的新典範

### 訓練優化（怎麼讓模型訓練得更快更便宜）
- [[2026-05-14-學習-推測解碼與 TLT 訓練加速|推測解碼與 TLT 訓練加速]] — 用閒置 GPU 訓 drafter，把推理模型訓練速度翻倍

### Agent / 自主系統（怎麼讓 LLM 變成真正的助理）
- [[2026-05-14-學習-Mem0 圖記憶架構|Mem0 圖記憶架構]] — 跨 session 的個人化長期記憶層
- [[2026-05-13-學習-Bayes-consistent Agent 編排|Bayes-consistent Agent 編排]] — 把不確定性正式納入控制邏輯
- [[2026-05-13-學習-LLM Agent 技能演化框架|LLM Agent 技能演化]] — Agent 從經驗中累積可重用技能

---

## 🎯 依難度分級

### 入門（無背景知識亦可閱讀）
- [[2026-05-15-學習-混合專家架構 MoE 為何成為主流|MoE 主流化]] — 用「醫院分診」類比理解稀疏激活
- [[2026-05-13-學習-Mixture of Experts MoE 入門|Mixture of Experts (MoE)]] — 用「綜合醫院 vs 分診台」類比即可理解

### 中階（建議先讀 Transformer 與 LLM 基礎）
- [[2026-05-15-學習-Subquadratic 稀疏注意力架構|Subquadratic 稀疏注意力（SSA）]]
- [[2026-05-15-學習-AlphaEvolve 進化演算法與 LLM 結合|AlphaEvolve：進化演算法 × LLM]]
- [[2026-05-14-學習-Qwen3 雙模式統一推理|Qwen3 雙模式統一推理]]
- [[2026-05-14-學習-Mem0 圖記憶架構|Mem0 圖記憶架構]]
- [[2026-05-13-學習-Recursive Language Models 遞迴語言模型|遞迴語言模型 (RLM)]]
- [[2026-05-13-學習-Bayes-consistent Agent 編排|Bayes-consistent Agent 編排]]
- [[2026-05-13-學習-LLM Agent 技能演化框架|LLM Agent 技能演化]]

### 進階（需要強數學或工程背景）
- [[2026-05-14-學習-推測解碼與 TLT 訓練加速|推測解碼與 TLT 訓練加速]] — 訓練側的推測解碼，涉及 RL rollout 與集群排程

---

## 📚 建議閱讀順序

### 🌱 路徑 A：完全新手的 AI 工程師
> 從架構基礎開始，逐步進到 agent
1. [[2026-05-13-學習-Mixture of Experts MoE 入門|① MoE 入門]] — 理解現代 LLM 怎麼蓋
2. [[2026-05-13-學習-Recursive Language Models 遞迴語言模型|② RLM]] — 理解推論時怎麼用上下文
3. [[2026-05-13-學習-LLM Agent 技能演化框架|③ Skill Evolution]] — 進入 agent 世界
4. [[2026-05-13-學習-Bayes-consistent Agent 編排|④ Bayes-consistent Orchestration]] — agent 的數學原理

### 🚀 路徑 B：想做 Agent 應用的工程師
> 快速直達 agent 相關技術
1. [[2026-05-13-學習-Recursive Language Models 遞迴語言模型|① RLM]] — Agent 處理長文件的基礎
2. [[2026-05-13-學習-LLM Agent 技能演化框架|② Skill Evolution]] — 讓 agent 真正會「學」
3. [[2026-05-13-學習-Bayes-consistent Agent 編排|③ Bayes-consistent Orchestration]] — agent 決策的嚴謹基礎

### 🏢 路徑 C：企業 IT 主管 / 決策者
> 不寫程式但要懂概念以做採購決策
1. [[2026-05-13-學習-Mixture of Experts MoE 入門|① MoE]] — 理解為什麼「總參數」與「啟用參數」不同對 GPU 採購重要
2. [[2026-05-13-學習-LLM Agent 技能演化框架|② Skill Evolution]] — 為什麼「技能庫」會成為企業核心 IP
3. [[2026-05-13-學習-Bayes-consistent Agent 編排|③ Bayes-consistent Orchestration]] — 為什麼校準度對受監管行業關鍵

### 🧪 路徑 D：研究取向
> 學術角度的閱讀順序
1. [[2026-05-13-學習-Mixture of Experts MoE 入門|① MoE]] + Shazeer 2017 → Switch Transformer → Mixtral 系列
2. [[2026-05-13-學習-Bayes-consistent Agent 編排|② Bayes-consistent Orchestration]] + ReAct → Reflexion → 本文
3. [[2026-05-13-學習-Recursive Language Models 遞迴語言模型|③ RLM]] + Lost-in-the-Middle → Self-RAG → 本文
4. [[2026-05-13-學習-LLM Agent 技能演化框架|④ Skill Evolution]] + Voyager → Reflexion → 本文

---

## 🎮 互動式學習工具

| 工具 | 涵蓋概念 | 開啟方式 |
|---|---|---|
| [MoE 路由器互動模擬器](Interactive/moe-router-simulator.html) | 路由器、Top-K 選擇、Active vs Total params | 右鍵連結 → Open in default app |
| [RLM 遞迴查詢視覺化](Interactive/rlm-recursive-explorer.html) | 階層展開、token 節省、規劃決策 | 右鍵連結 → Open in default app |

> 💡 提示：在 Obsidian 中如果 HTML 連結不能直接點，可在檔案總管中找到 `Interactive/` 資料夾，直接雙擊 HTML 檔案以瀏覽器開啟。

---

## 📌 學習筆記怎麼用

每篇學習筆記都按下面結構編排：

1. **一句話理解**：用統一句型快速 capture 核心概念
2. **為什麼重要 + 入門解說（類比）**：先建立直覺
3. **重點原理**：3–7 個關鍵概念
4. **視覺化說明**：流程圖 / 比較表（用 Mermaid 或 Markdown table）
5. **與既有技術的差異**：定位這個技術在版圖中的位置
6. **關鍵詞對照表**：中英對照 + 簡述
7. **可能的應用場景**：3–5 個具體情境
8. **學習路徑建議**：5 步遞進
9. **🎬 推薦影片**：依難度排序的 YouTube 資源
10. **📖 進階閱讀**：依閱讀順序的論文 / 部落格
11. **🎮 互動式學習工具**（部分篇有）
12. **🧠 自我測驗 Quiz**：5 題不同難度
13. **🔗 延伸閱讀**：對應新聞筆記、學習中心

---

## 🔄 怎麼更新這份索引

當 AI 日報自動產生新的技術學習筆記時，這份索引也應該同步更新。建議：

- 在每日跑完日報後，**手動或請 Claude** 把新筆記加進「全部學習筆記」表格、相應的主題分類、難度分級
- 半年盤點一次「建議閱讀順序」，把當紅主題與經典主題重新排列
- 互動工具製作門檻較高，可挑選「視覺化價值高」的主題逐步補上

---

*由 Claude 自動整理於 2026-05-14*
*下次更新時請依「全部學習筆記」表格 + 主題分類加入新項目*

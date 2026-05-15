---
title: "Gemma 4 release: 26B Mixture-of-Experts with 3.8B active parameters"
date: 2026-05-13
source: Google AI Blog / LLM-Stats
url: https://llm-stats.com/ai-news
category: 技術理論
tags:
  - AI
  - 技術理論
  - Google
  - MoE
  - 開源模型
  - Gemma
created: 2026-05-13
---

# Google Gemma 4 發布：26B MoE 架構，推論時僅啟用 3.8B 參數

> [!info] 文章資訊
> - **來源**：[LLM-Stats AI News](https://llm-stats.com/ai-news) / Google AI 官方部落格
> - **發布日期**：2026 年 5 月
> - **分類**：技術理論

## 📝 重點摘要
Google 於 5 月初發布 Gemma 4 開源家族，其中最受矚目的是 26B 參數規模的 Mixture-of-Experts（MoE）變體：總參數 26B，但每次推論僅啟用 3.8B 參數。這個設計讓 Gemma 4 MoE 在多個 benchmark 上勝過參數量大它 20 倍的密集模型（dense model），同時保持低延遲。Google 同步釋出 Gemma 4 instruction-tuned 與多語言版本，並開放商業使用。對開源生態而言，這代表「MoE + 中型總參數」可能成為新的甜蜜點，挑戰過去單純拼參數量的做法。

## 📖 全文內容

### Gemma 4 系列概覽
| 變體 | 總參數 | 啟用參數 | 上下文長度 | 主要定位 |
|---|---|---|---|---|
| Gemma 4 Nano | 2B | 2B | 128K | 邊緣裝置、行動裝置 |
| Gemma 4 Pro | 9B | 9B | 256K | 一般雲端推論 |
| Gemma 4 MoE | 26B | 3.8B | 512K | 高品質推論、企業部署 |

### MoE 變體的設計亮點
1. **稀疏激活**：26B 總參數分散在 16 個「專家」（experts）中，每個 token 僅由 2 個專家處理，因此實際運算量等同於約 3.8B 密集模型，但容量遠大於同等運算成本的密集模型。
2. **共享專家路由訓練**：Google 採用 ST-MoE 改良路由器，加入 load balancing loss 與 router z-loss，避免少數專家過度集中。
3. **多階段預訓練**：先以密集模型熱身，再轉成 MoE 進行持續訓練，作者稱之為「upcycling」。
4. **與 Gemini 共用 tokenizer**：跨 256 種語言、含程式碼專屬 token，與 Gemini 3 同源。

### 效能對比（官方數字）
- **MMLU 5-shot**：80.4（勝過 Llama-3 70B 的 79.5）
- **HumanEval**：72.6（程式生成）
- **MGSM 多語言數學**：62.1
- **延遲**：在 1×H100 上，每秒輸出 token 數比 Llama-3 70B 快約 4.5 倍。

### 戰略意義
此次發布反映 Google 對「開源中型模型」市場的態度：
- 用 MoE 在參數效率上做差異化，因為 Meta Llama-4、Alibaba Qwen3 等都已採稠密大模型。
- 為企業 on-prem 部署優化——3.8B 啟用量可塞進單卡 A100/H100 推論。
- 與閉源 Gemini 3.x 形成上下夾擊：API 用 Gemini，地端部署用 Gemma。

### 授權
Gemma 4 採 Gemma Terms of Use，允許商業使用，但對「明顯有害用途」設有禁止條款。比 Llama 的條款限制更寬鬆。

## 💡 觀察與啟發
這次發布鞏固了 MoE 在 2026 年的主流地位——從 Mistral Mixtral、DeepSeek V3、Qwen3-MoE 到 Gemma 4，幾乎所有頭部開源模型都採 MoE。對企業導入：
1. **記憶體規劃**：MoE 雖然啟用參數小，但**所有專家權重仍需常駐 VRAM**，部署規格不能只看啟用參數。
2. **垂直微調策略**：因為各專家擅長領域不同，PEFT（LoRA）在 MoE 上需要對「會被路由到」的專家做適配，否則效果打折。
3. **台灣開發者機會**：3.8B 啟用量適合本地化微調（如台語、繁體中文法律文本），可在中型 GPU 集群完成。

## 🔗 相關連結
- [LLM-Stats AI News May 2026](https://llm-stats.com/ai-news)
- [AI Model Releases May 2026](https://aitoolsrecap.com/blog/ai-model-releases-may-2026-what-to-expect)
- 相關閱讀：[A Comprehensive Survey of Mixture-of-Experts](https://arxiv.org/abs/2503.07137)

## 📓 學習筆記
- [[2026-05-13-學習-Mixture of Experts MoE 入門|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-13*

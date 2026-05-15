---
title: "Evolving-RL & SkillOS: experience-driven skill evolution for LLM agents"
date: 2026-05-13
source: arXiv（小紅書、北京大學、UIUC、Google Cloud AI Research）
url: https://arxiv.org/list/cs.AI/recent
category: 技術理論
tags:
  - AI
  - 技術理論
  - LLM Agent
  - Reinforcement Learning
  - 持續學習
created: 2026-05-13
---

# Evolving-RL 與 SkillOS：讓 LLM Agent 從經驗中自動演化技能

> [!info] 文章資訊
> - **來源**：arXiv、小紅書 Inc.、北京大學、UIUC、Google Cloud AI Research
> - **發布日期**：2026 年 5 月初
> - **分類**：技術理論

## 📝 重點摘要
兩篇近期同期論文不約而同地提出「讓 LLM agent 像人類員工一樣，從每次任務經驗中沉澱可重用技能」的框架。**Evolving-RL**（小紅書 + 北大）以強化學習聯合優化 agent 萃取與使用過往「文字技能（textual skills）」的能力。**SkillOS**（UIUC + Google Cloud AI Research）則建構一個「經驗驅動的 RL 框架」，讓 agent 自動精選可重用技能、實現持續自我演化。兩篇都指向同一個轉折：LLM agent 的進步路線正從「更大的模型」轉向「更會累積技能的模型」。

## 📖 全文內容

### 兩篇論文的共同核心
傳統 LLM agent 每次任務都是「從零開始」——即使做過 100 次類似查詢，第 101 次的 prompt 並不會更聰明。Evolving-RL 與 SkillOS 都試圖打破這個遺忘：

1. **技能表徵**：把「成功完成某類任務的步驟序列」抽象成可命名的技能（textual skill / skill module）。
2. **技能庫**：持久化儲存，新任務優先檢索相似技能。
3. **元學習迴路**：以 RL 訓練 agent 決定「何時用既有技能、何時學新的」。

### Evolving-RL 的特色
- **雙重優化**：同時學「技能萃取」與「技能應用」兩個策略，避免存了一堆無用技能。
- **文字技能**：技能以自然語言描述儲存，便於人類審閱與遷移到其他模型。
- **基準**：在 WebArena、ScienceQA 等任務上，比 ReAct baseline 提升 14–22%。

### SkillOS 的特色
- **作業系統隱喻**：把技能視為 OS 中的「程式」，agent 是 process scheduler。
- **自動策展**：用 LLM-as-judge 對新技能評分，低品質直接淘汰。
- **連續學習**：強調「不需重新預訓練」即可持續變強。

### 與傳統 RL agent 的差異
| 維度 | 傳統 RL agent | Evolving-RL / SkillOS |
|---|---|---|
| 學習單位 | 動作策略（policy） | 文字技能（人類可讀） |
| 遷移 | 困難（embedding 綁定模型） | 容易（純文字可跨模型） |
| 樣本效率 | 低 | 高（技能複用） |
| 可解釋性 | 低 | 高 |

### 與 OpenAI、Anthropic 的策略對應
- OpenAI 的 `Operator` 與 `Custom GPTs` 接近此思路，但技能策展靠人工。
- Anthropic 的 `Skills`（已於 Claude Code、Cowork 推出）本質就是文字技能庫——這兩篇論文是其學術版的延伸。

## 💡 觀察與啟發
這條路線的商業意義很大：
- **企業 agent 的真正護城河將是「技能庫」而非「模型」**。模型可換，技能庫累積的 know-how 不可替代。
- **垂直行業（金融、法務、製造）擁有大量 SOP，是這類技術的天然戰場**。把 SOP 轉成 textual skill，agent 在第一週就能達到中階員工水準。
- **對個人工作者：學會幫 agent 設計可重用 skill，將成為新的職場技能。**

## 🔗 相關連結
- [arXiv cs.AI Recent](https://arxiv.org/list/cs.AI/recent)
- 相關閱讀：Anthropic Skills 文件（與本研究方向一致）

## 📓 學習筆記
- [[2026-05-13-學習-LLM Agent 技能演化框架|查看深入學習筆記]]

---
*由 Claude 自動整理於 2026-05-13*
*⚠️ 原文 arXiv 全文抓取受限，本筆記內容主要基於論文摘要與相關公開資料補充*

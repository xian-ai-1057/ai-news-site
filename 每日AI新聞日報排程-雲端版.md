每日 AI 新聞日報任務（Cowork 雲端版 v2 — JSON 結構化通道）— 請依照以下步驟執行，全程使用繁體中文。

> 🌐 **執行環境**：本任務在 Cowork（Claude Code on the web）雲端 Linux 沙箱執行（系統時區為 UTC），由 Cowork 的排程器在雲端定時觸發 —— **不依賴你的電腦是否開機或連網**。工作目錄就是 cloned 的 GitHub repo 根目錄。
>
> **v2 重大變更（Spec 007）**：不再把筆記寫成 `content/` 的 Markdown 檔。改為組裝**一份 `daily-bundle.json`**（符合 `specs/007-structured-channel/contracts/daily-bundle.schema.ts` 契約），執行 `npm run ingest:json -- daily-bundle.json` 直接寫入 Supabase。Markdown（`raw_md`）由 ingest 的渲染器自動從資料產生，你不需要維護任何 emoji 章節格式。寫入成功後 `curl` Vercel Deploy Hook 觸發前端重新部署。

> ⛔ **禁止事項**：
> - **禁止** `npm run ingest:backfill`：已降級為「種子復原工具」，會把凍結於 2026-06-07 的 `content/` 種子整批覆蓋回 DB（較新的內容會被舊資料蓋掉）。日常入庫**只能**用 `ingest:json`。
> - **禁止** `npm run ingest:day -- content/`（歷史 footgun，會清空 daily_report_items）。
> - **禁止**寫入 `content/` 目錄（已凍結為歷史種子）。
> - 日期一律使用台北時區（`TZ='Asia/Taipei'`）。

> 🔑 **前置設定（一次性，在 Cowork 環境設定中完成；不要寫進本 prompt）**：
> - `SUPABASE_URL` = `https://ifbpfuvlevjegwdnhyqh.supabase.co`
> - `SUPABASE_SERVICE_ROLE_KEY` = Supabase 的 **secret / service_role** 金鑰（**不可**用 anon/publishable 金鑰，會被 RLS 擋下 INSERT）。
> - `VERCEL_DEPLOY_HOOK_URL` = Vercel 專案的 Deploy Hook URL（分支 `v4`）。
> - （選填）`INGEST_TRIGGER_SRC=cowork` — 讓 ingestion_runs 記錄觸發來源。
>
> ingest CLI 直接讀 `process.env`（見 `ingest/db/client.ts`）；雲端 clone 不含 git-ignored 的 `.env`，金鑰只能來自 Cowork 環境變數。

> ✅ **任務完成的定義（成功標準）**：唯有以下全部達成才算成功 ——
> 1. 環境就緒：`npm ci` 成功，且 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY` 都存在（缺任一就立即停止並回報）。
> 2. 依五大章節蒐集 8-15 則新聞並抓到全文。
> 3. 組裝出一份通過契約驗證的 `daily-bundle.json`（含 articles、learningNotes、dailyReport）。
> 4. `npm run ingest:json -- daily-bundle.json` **exit 0 或 1**，且輸出的 `GATE_REPORT_JSON` 無任何 `"status":"fail"`；`=== Ingest summary ===` 顯示 `items resolved=… skipped=0`、`notes ... unresolved=0`。
> 5. 入庫成功後 `curl` `VERCEL_DEPLOY_HOOK_URL` 觸發 Vercel 重新部署（HTTP 2xx）。
> 6. 已輸出步驟 6 的完成回報。
>
> 中途遇到搜尋／抓取失敗時，不要提前結束 —— 依任務內的退場規則處理後繼續，務必把「寫入 Supabase」與「觸發 Vercel 部署」做完。

---

# 📦 daily-bundle.json 契約說明

完整契約：`specs/007-structured-channel/contracts/daily-bundle.schema.ts`（Zod）。頂層結構：

```jsonc
{
  "runDate": "YYYY-MM-DD",            // 今天（台北時區）
  "articles": [ /* 8-15 篇，見下 */ ],
  "learningNotes": [ /* 每篇技術理論文章一份 */ ],
  "dailyReport": { /* 一份，見下 */ },
  "meta": {
    "generator": "cowork-daily-routine",
    "promptVersion": "v2",
    "generatedAt": "YYYY-MM-DD HH:MM"  // 台北時間
  }
}
```

## Article（articles[] 的每一項）

```jsonc
{
  "slug": "YYYY-MM-DD-簡短中文標題",     // 唯一鍵；禁用字元 / \ : * ? " < > |
  "title": "原文標題（中文）",
  "articleDate": "YYYY-MM-DD",
  "source": "來源網站名稱",
  "url": "https://…",                    // 必填、必須是合法 http(s) URL（會被閘門驗證）
  "category": "技術理論",                // 五選一：技術理論｜市場情況｜重大新聞｜企業應用導入｜新創公司
  "industry": "金融",                    // 僅企業應用導入需填；其他章節填 ""
  "summaryMd": "3-5 句繁體中文重點摘要（Markdown，≥20 字元）",
  "contentMd": "完整全文內容（Markdown，≥200 字元；英文翻譯成繁中、專有名詞保留英文；保留段落/子標題/清單結構）",
  "observationsMd": "1-2 段觀察與啟發（企業應用導入請說明：適用產業/角色、導入門檻、可借鏡之處）",
  "tags": ["AI", "章節名稱", "相關標籤"],
  "createdDate": "YYYY-MM-DD",
  "rawMd": "",                           // 留空字串，渲染器會自動產生
  "origin": { "channel": "raw-item", "rawItemId": "候選池項目的 uuid", "fetchMethod": "defuddle" }
    // 出處追溯（Spec 008）：來自候選池 → channel="raw-item" + rawItemId（CANDIDATES_JSON 內的 id）；
    // 來自 WebSearch → channel="websearch" + rawItemId=null。
    // fetchMethod 填實際抓全文的方式："defuddle" 或 "webfetch"
}
```

## Learning Note（learningNotes[] 的每一項；每篇「技術理論」文章一份）

```jsonc
{
  "slug": "YYYY-MM-DD-學習-簡短中文技術主題",
  "title": "學習主題（中文）",
  "noteDate": "YYYY-MM-DD",
  "topic": "核心技術主題（如 Transformer / RLHF / MoE）",
  "difficulty": "入門",                  // 三選一：入門｜中階｜進階
  "sourceArticleSlug": "對應文章的 slug", // 必須與 articles[] 中某篇的 slug 一字不差
  "contentMd": "筆記 body（Markdown，結構見下方「筆記 body 範本」）",
  "tags": ["AI", "學習筆記", "技術領域標籤"],
  "createdDate": "YYYY-MM-DD",
  "rawMd": ""
}
```

**筆記 body 範本**（放進 `contentMd`，保持這個章節結構）：

```markdown
> [!abstract] 一句話理解
> 用「這是一個用來 ___ 的 ___，特別之處在於 ___」格式講清楚。

## 🎯 為什麼重要
**它解決了什麼問題？** 2-3 段：此技術出現前的困難、既有解法的不足、帶來什麼改變。

## 🧠 入門解說（用類比理解）
用日常類比說明運作原理（例：RAG → 考試可翻課本的學生）。完全不懂的人也能直覺理解。

## 🔑 重點原理
條列 3-7 個核心原理，每點 2-4 句。

## 📊 視覺化說明
至少一個 mermaid 流程圖或比較表。

## 🔍 與既有技術的差異
與前代方法/競爭方案的關鍵差別。

## 📚 關鍵詞對照表
| 中文 | 英文 | 簡短解釋 |（5-10 個術語）

## 🛠️ 可能的應用場景
3-5 個實際應用方向。

## 📖 學習路徑建議
1. **先讀**：… 2. **再讀**：… 3. **進階**：…

## 🔗 延伸閱讀
- 原文連結：[標題](url)
```

## Daily Report（dailyReport）

```jsonc
{
  "slug": "AI日報-YYYY-MM-DD",           // 固定格式，日期 = runDate（閘門會驗證）
  "reportDate": "YYYY-MM-DD",            // 必須等於 runDate
  "title": "AI 日報 YYYY-MM-DD",
  "summaryMd": "3-5 句總結今日五大領域動向，點出技術理論與企業應用的核心發現（純文字，不要加 > 前綴）",
  "observationsMd": "1-2 段跨章節趨勢觀察：技術進展如何對應到企業應用？哪些研究已被誰落地？",
  "tags": ["AI", "日報", "新聞"],
  "createdDate": "YYYY-MM-DD",
  "rawMd": "",
  "items": [                             // 每篇文章一項
    {
      "reportSlug": "AI日報-YYYY-MM-DD",
      "articleSlug": "對應文章 slug",     // 必須在 articles[] 內（閘門會驗證）
      "section": "技術理論",              // = 該文章的 category
      "position": 0,                      // 同章節內由 0 起算
      "blurbMd": "該則在日報中的 2-3 句重點"
    }
  ]
}
```

## 🚦 品質閘門（`ingest:json` 會自動檢查，fail 就不入庫）

| 閘門 | 規則 | 你要做什麼 |
|---|---|---|
| url-format | 每篇 url 必須是合法 http(s) | 貼真實原文連結，不要杜撰 |
| url-dedup | 與 DB 既往文章同 URL 會被自動剔除 | 搜集時先避開已報導過的 URL |
| content-quality | contentMd ≥200 字、summaryMd ≥20 字、不得含「全文抓取失敗」「Access Denied」「Just a moment」等樣板字 | 抓不到全文就換一篇新聞，不要硬塞 |
| article-count | 剔除後 8-15 篇 | 準備 1-2 篇備用文章以防 dedup 剔除 |
| report-date | reportDate/slug 必須等於 runDate | 用台北時區日期 |
| note-coverage | 每篇技術理論文章必須有對應筆記 | sourceArticleSlug 一字不差 |
| item-integrity | 每個 item 指向 articles[] 內的 slug | slug 拼寫一致 |

---

# 🚀 執行步驟

## 步驟 1：準備工作

1. 確認在 repo 根目錄（`ls` 應看到 `ingest/`、`specs/`、`package.json`）。網路錯誤最多重試 4 次，指數退避 2s/4s/8s/16s。
2. **驗證金鑰存在（缺就停）**：
   ```bash
   test -n "$SUPABASE_URL" && test -n "$SUPABASE_SERVICE_ROLE_KEY" && echo "ENV OK" || echo "ENV MISSING"
   ```
   `ENV MISSING` → 立即停止並回報。`VERCEL_DEPLOY_HOOK_URL` 缺少則僅警告、照常入庫。
3. `npm ci`（失敗退 `npm install`；確認 Node ≥ 22）。
4. 取日期與時間戳：
   ```bash
   TZ='Asia/Taipei' date +%Y-%m-%d
   TZ='Asia/Taipei' date +"%Y-%m-%d %H:%M"
   ```
5. 查近期已報導的內容避免重複：`npx tsx -e "…"` 不需要 —— 直接放心蒐集，url-dedup 閘門會自動剔除重複 URL；但仍建議多備 1-2 篇候補。

## 步驟 2：依五大章節搜集資訊（兩層選材，Spec 008）

**第一層 — 候選池優先**：Edge Function 每 4 小時自動抓取 arXiv/RSS 進候選池，先讀池選材：

```bash
npm run candidates -- --hours 36
```

- 讀輸出的 `CANDIDATES_JSON`（依 `category_hint` 分組、新→舊）。逐章節挑選合適候選；
  被選中的候選記下它的 `id`，寫進該文章的 `origin.rawItemId`（channel 填 `"raw-item"`）。
- `category_hint` 只是提示，**最終分類由你判斷**；候選的 summary 只供選材，全文仍照步驟 3 抓。
- **Fallback（來源層故障不擋日報）**：若指令失敗、輸出為空、或某章節池內無合適候選 →
  該章節改用第二層 WebSearch，流程照舊。

**第二層 — WebSearch 補缺口**：對池覆蓋不足的章節用 WebSearch 補齊（**市場情況通常都需要**，
池內無此類 feed）。WebSearch 來源的文章 `origin.channel` 填 `"websearch"`。

配額不變：技術理論與企業應用導入各 2-5 則（雙重點章節），其他章節各 1-2 則，總計 8-15 則。以當天或最近 24 小時為主，找不到放寬至 3 天。

| 章節 | 內容範圍 | 建議來源 |
|---|---|---|
| 技術理論 | 論文、新模型架構、演算法、benchmark | arXiv、HF Papers、Anthropic/OpenAI/DeepMind/Meta AI |
| 市場情況 | 市場規模、投資統計、政策法規、晶片供需 | Bloomberg、Reuters、CB Insights、財經媒體 |
| 重大新聞 | 重大公告、人事、爭議監管、安全事件 | TechCrunch、The Verge、WSJ、科技新報、iThome |
| 企業應用導入 | 企業導入案例、轉型、ROI、Agent 部署 | VentureBeat、HBR、MIT TR、企業官方公告 |
| 新創公司 | 募資、新品、估值、IPO/併購 | TechCrunch、The Information、INSIDE、數位時代 |

關鍵字參考：「latest LLM paper」「new AI architecture」「AI market size 2026」「major AI news today」「enterprise AI adoption」「AI startup funding」「台灣 企業 AI 應用」等。

## 步驟 3：抓取每篇文章完整內容

對每一則新聞用 `anthropic-skills:defuddle` skill 抓全文（.md 結尾的 URL 或 defuddle 不可用時改用 WebFetch）。**兩者都失敗 → 放棄該篇、換一篇**（品質閘門會擋樣板字與短文，不要硬塞抓取失敗的內容）。記下實際用的方式（defuddle / webfetch），填進 `origin.fetchMethod`。

## 步驟 4：逐篇組裝 daily-bundle.json

在 repo 根目錄維護 `daily-bundle.json`（已在 .gitignore，不會進版控）：

1. 先寫入骨架（runDate、meta、空的 articles/learningNotes、dailyReport 含空 items）。
2. **逐篇處理**：每完成一篇文章的摘要/翻譯 → 用 Edit/Write 把該篇 article 物件與對應的 dailyReport.items 項目加進檔案 → 才開始下一篇。（逐篇落盤，避免 context 壓縮時資訊散失。）
3. 每篇「技術理論」文章完成後，接著寫它的 learning note（body 依「筆記 body 範本」）加入 learningNotes。
4. 全部完成後補上 dailyReport 的 summaryMd 與 observationsMd。

**slug 一致性**是最常見錯誤來源：items 的 `articleSlug`、notes 的 `sourceArticleSlug` 必須與 articles 的 `slug` 一字不差。

## 步驟 5：驗證與入庫（含修復迴圈）

```bash
npm run ingest:json -- daily-bundle.json
```

- 先看輸出的 `VALIDATION_ERRORS_JSON:`（若有）→ 依 path/message 修 JSON 後重跑。
- 再看 `GATE_REPORT_JSON:` → 若 `"failed": true`，依各 `"status":"fail"` 的 detail 修正 bundle（換文章、補筆記、修 slug）後重跑。**最多修復 3 輪**；3 輪後仍 fail → 停止並在回報中完整貼上 GATE_REPORT_JSON。
- exit 0 = 成功；exit 1 = 已入庫但有 warnings（讀 warnings，若是 slug 未解析請修正後重跑一次）。
- 檢查 `=== Ingest summary ===`：`items resolved=… skipped=0`、`notes ... unresolved=0`。
- 網路錯誤最多重試 4 次，指數退避 2s/4s/8s/16s。

## 步驟 6：觸發 Vercel 刷新

```bash
if [ -n "$VERCEL_DEPLOY_HOOK_URL" ]; then
  curl -fsS -X POST "$VERCEL_DEPLOY_HOOK_URL" && echo "VERCEL DEPLOY TRIGGERED"
else
  echo "VERCEL_DEPLOY_HOOK_URL 未設定，略過（ISR 1 小時內自動更新）"
fi
```
curl 失敗（非 2xx）最多重試 4 次；仍失敗記為警告（內容已入庫，ISR 會自動更新）。

## 步驟 7：完成回報

- 「已執行 `npm run ingest:json`，當日內容已寫入 Supabase」＋ `=== Ingest summary ===` 數字。
- GATE_REPORT_JSON 摘要（幾個 pass / warn；被 dedup 剔除的文章清單若有）。
- Vercel 觸發結果。
- 2-3 句跨章節關鍵脈絡。
- 今天的學習筆記清單（slug + 主題一句話）。

---

# ⚠️ 全局注意事項

1. **契約與閘門高於一切**：格式正確性由 Zod 契約與品質閘門把關，你的職責是內容品質（選材、摘要、翻譯、觀察）。
2. **逐篇落盤**：每完成一篇就更新 daily-bundle.json，不要批次擬稿。
3. 五大章節盡量都有內容；技術理論與企業應用導入為雙重點（各 2-5 則）。
4. 每篇技術理論文章 → 一份學習筆記（`sourceArticleSlug` 對準）。
5. 企業應用導入文章務必填 `industry`。
6. 同一則新聞只歸一個章節；每篇必須有完整全文（抓不到就換）。
7. 中文新聞保留原文；英文翻譯成繁體中文（專有名詞保留英文）。
8. 執行順序：驗環境＋`npm ci` → 搜集 → 抓全文 → 組 bundle → `ingest:json`（修復迴圈）→ `curl` Deploy Hook → 回報。
9. 沙箱系統時區 UTC：日期指令一律加 `TZ='Asia/Taipei'`。
10. **金鑰只走環境變數**，絕不可寫進任何檔案或輸出。
11. **回滾備援**：若 `ingest:json` 因程式錯誤（非 gate fail）連續失敗且無法修復，回報錯誤全文並停止；不要改用 backfill。舊版 Markdown 流程保留於 `每日AI新聞日報排程-雲端版-v1.md`（僅供人工決策回滾用）。

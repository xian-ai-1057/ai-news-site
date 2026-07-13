每日 AI 新聞日報任務（Claude Code Routine 版 v3 — 多代理領域專家通道）— 請依照以下步驟執行，全程使用繁體中文。

> 🌐 **執行環境**：本任務由 **Claude Code Routine**（排程觸發）在 Anthropic 雲端沙箱執行（系統時區為 UTC）—— **不依賴你的電腦是否開機或連網**。每次執行都是從 GitHub repo 的 default 分支（`v4`）**全新 clone**，工作目錄即 repo 根目錄。沙箱為暫時性、結束即銷毀：`daily-bundle.json` 與 `work/` 下的暫存檔只存在於本次沙箱、不進版控（已 gitignore）；**不需要也不要 `git push` 任何內容**（資料一律寫進 Supabase）。（本 prompt 亦相容 Cowork 排程，差別僅在下方「前置設定」的設定位置。）
>
> **v3 重大變更（多代理領域專家）**：改為 **Lead 協調者 + 5 位平行領域專家 + 1 個 Opus 品質審查** 的多代理流程。每個章節（主題）都由一位專屬領域專家撰稿，內容深度對齊 6 月水準（每篇文章約 1,000–1,600 漢字、結構化）。**模型分層**：搜集與撰寫用 **Claude Sonnet 5**（子代理，加速且省成本），只有協調、合併、跨章節綜整、品質審查等高品質關卡用 **Claude Opus**（Routine 主體）。
>
> **v2 起延續（Spec 007）**：不再把筆記寫成 `content/` 的 Markdown 檔。改為組裝**一份 `daily-bundle.json`**（符合 `specs/007-structured-channel/contracts/daily-bundle.schema.ts` 契約），執行 `npm run ingest:json -- daily-bundle.json` 直接寫入 Supabase。Markdown（`raw_md`）由 ingest 的渲染器自動從資料產生，你不需要維護任何 emoji 章節格式。寫入成功後 `curl` Vercel Deploy Hook 觸發前端重新部署。

> ⛔ **禁止事項**：
> - **禁止** `npm run ingest:backfill`：已降級為「種子復原工具」，會把凍結於 2026-06-07 的 `content/` 種子整批覆蓋回 DB（較新的內容會被舊資料蓋掉）。日常入庫**只能**用 `ingest:json`。
> - **禁止** `npm run ingest:day -- content/`（歷史 footgun，會清空 daily_report_items）。
> - **禁止**寫入 `content/` 目錄（已凍結為歷史種子）；**禁止** `git push`（Routine 預設只能推 `claude/` 分支，且本任務本就不需要 push）。
> - **檔案隔離鐵則**：平行的 5 位專家**不可寫同一個檔案**。每位專家只寫自己章節的 `work/<key>.section.json` 與 `work/<key>.urls.json`；`daily-bundle.json` 只有 Lead 能寫（見「🧩 多代理架構與檔案隔離」）。
> - 日期一律使用台北時區（`TZ='Asia/Taipei'`）。

> 🔑 **前置設定（一次性；在 Routine 的 cloud environment 設定，不要寫進本 prompt）**：
> 在 [claude.ai/code/routines](https://claude.ai/code/routines) 建立 routine → 選 repo `xian-ai-1057/ai-news-site` → **Environment → Environment variables** 加入下列變數。**Setup script 請留空**（Setup script 在 repo clone 之前執行、快照快取，放 `npm ci` 會因讀不到 lockfile 而失敗）——相依套件改由 repo 內 `.claude/settings.json` 的 **SessionStart hook** 在 clone 後自動 `npm ci`。
> - `SUPABASE_URL` = `https://ifbpfuvlevjegwdnhyqh.supabase.co`
> - `SUPABASE_SERVICE_ROLE_KEY` = Supabase 的 **secret / service_role** 金鑰（**不可**用 anon/publishable 金鑰，會被 RLS 擋下 INSERT）。
> - `VERCEL_DEPLOY_HOOK_URL` = Vercel 專案的 Deploy Hook URL（分支 `v4`）。
> - （選填）`INGEST_TRIGGER_SRC=routine` — 讓 ingestion_runs 記錄觸發來源。
>
> 🤖 **模型設定**：Routine 的 **主體模型建議設為 Claude Opus**——Lead 負責協調、切分候選、合併 bundle、跨章節綜整、品質審查這些「高品質／檢查」關卡。搜集與撰寫的大宗工作由 Lead 用 **Task 工具 spawn 的 Claude Sonnet 5 子代理**承擔（見步驟 3，`model: sonnet`），不佔用 Opus 額度。
>
> ⚠️ **網路白名單**：Routine 環境預設「Trusted」網路會 **403 擋掉任意網域**。本任務**全文抽取已搬到伺服端**（extract-fulltext Edge Function，見步驟 3），routine 本身（含子代理）**不再直接抓新聞網站**。環境的 **Network access 設 Custom，放行這兩個網域即可**：
> - `ifbpfuvlevjegwdnhyqh.supabase.co` — candidates／fulltext／ingest:json 讀寫 Supabase
> - `api.vercel.com` — 步驟 7 觸發 Vercel deploy hook
>
> （WebSearch 走 Anthropic、自動放行。）若 `candidates` / `fulltext` / `ingest:json` 或 step 7 的 `curl` 回 `403 host_not_allowed`，代表對應網域漏加白名單——在 routine 的 environment 補上後重跑。
>
> ingest CLI 直接讀 `process.env`（見 `ingest/db/client.ts`）；雲端 clone 不含 git-ignored 的 `.env`，金鑰只能來自 routine 的 environment variables。子代理與 Lead 共用同一組環境變數。

> ✅ **任務完成的定義（成功標準）**：唯有以下全部達成才算成功 ——
> 1. 環境就緒：`npm ci` 成功，且 `SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY` 都存在（缺任一就立即停止並回報）。
> 2. Lead 跑一次 `candidates` 並切分給 5 位領域專家；5 位專家（Sonnet）平行依五大章節蒐集 8-15 則新聞並抓到全文，各自寫出 `work/<key>.section.json`。
> 3. Lead 合併五份章節檔，組出一份通過契約驗證的 `daily-bundle.json`（含 articles、learningNotes、dailyReport）。
> 4. Opus 品質審查通過（深度、翻譯、slug 一致、分類、筆記覆蓋皆過關），Lead 依審查回饋修正 bundle。
> 5. `npm run ingest:json -- daily-bundle.json` **exit 0 或 1**，且輸出的 `GATE_REPORT_JSON` 無任何 `"status":"fail"`；`=== Ingest summary ===` 顯示 `items resolved=… skipped=0`、`notes ... unresolved=0`。
> 6. 入庫成功後 `curl` `VERCEL_DEPLOY_HOOK_URL` 觸發 Vercel 重新部署（HTTP 2xx）。
> 7. 已輸出步驟 8 的完成回報。
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
    "generator": "claude-code-routine",
    "promptVersion": "v3",
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
  "summaryMd": "150-250 字繁體中文重點摘要（Markdown；閘門下限 20 字，但目標對齊 6 月：見「✍️ 內容深度規格」）",
  "contentMd": "完整全文內容（Markdown；閘門下限 200 字，但目標約 1,000-1,600 漢字、4-6 個子章節、含表格；英文翻譯成繁中、專有名詞保留英文；保留段落/子標題/清單結構）",
  "observationsMd": "2-3 點觀察與啟發（企業應用導入請說明：適用產業/角色、導入門檻、可借鏡之處，並在地化到台灣）",
  "tags": ["AI", "章節名稱", "相關標籤"],
  "createdDate": "YYYY-MM-DD",
  "rawMd": "",                           // 留空字串，渲染器會自動產生
  "origin": { "channel": "raw-item", "rawItemId": "候選池項目的 uuid", "fetchMethod": "edge-extract" }
    // 出處追溯（Spec 008）：來自候選池 → channel="raw-item" + rawItemId（CANDIDATES_JSON 內的 id）；
    // 來自 WebSearch → channel="websearch" + rawItemId=null。
    // fetchMethod 固定 "edge-extract"（全文由 extract-fulltext Edge Function 伺服端抽取，見步驟 3）
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
| url-dedup | 與 DB 既往文章同 URL 會被自動剔除；bundle 內互重也會剔除 | 搜集時先避開已報導過的 URL；Lead 合併時跨章節去重 |
| content-quality | contentMd ≥200 字、summaryMd ≥20 字、不得含「全文抓取失敗」「Access Denied」「Just a moment」等樣板字 | 抓不到全文就換一篇新聞，不要硬塞（實際目標遠高於下限，見「✍️ 內容深度規格」） |
| article-count | 剔除後 8-15 篇 | 每位專家多備 1-2 篇備用文章以防 dedup 剔除 |
| report-date | reportDate/slug 必須等於 runDate | 用台北時區日期 |
| section-coverage | 五章節各 ≥1；技術理論、企業應用導入各 ≥2 | 雙重點章節配額要足 |
| note-coverage | 每篇技術理論文章必須有對應筆記 | sourceArticleSlug 一字不差 |
| item-integrity | 每個 item 指向 articles[] 內的 slug | slug 拼寫一致 |

---

# ✍️ 內容深度規格（對齊 6 月凍結種子的品質，**取代 v2 的「≥200 字」單薄要求**）

6 月種子文章平均約 **1,240 漢字**（範圍 913–1,696），是本站的品質標竿。每位領域專家撰稿時務必達到以下深度（程式閘門下限雖仍是 200 字，但**品質審查會擋過短**）：

- **`summaryMd`（重點摘要）**：150–250 字，一段把「發生什麼、關鍵數字、為何重要」講清楚。
- **`contentMd`（全文內容）**：**約 1,000–1,600 漢字**，在 `## 📖 全文內容` 下切 **4–6 個 `###` 子章節**，敘事順序為：
  1. **背景**：這件事的脈絡、為什麼難／為什麼重要（不只複述新聞標題）。
  2. **機制**：技術如何運作／交易如何成形／政策如何影響（要有解釋深度）。
  3. **具體數據**：用 **Markdown 表格**呈現數字、規格、名單、benchmark、融資條件等結構化資訊（6 月文章常有 2-3 個表格）。
  4. **影響 / 意義**：對產業、對台灣、對後續發展的影響。
  - 英文翻譯成通順繁體中文（專有名詞保留英文）；中文原文則保留。
- **`observationsMd`（觀察與啟發）**：2–3 點原創分析。**企業應用導入**須在地化到台灣（可點名玉山、中信、國泰世華等對照，比照 6 月 JPMorgan 篇作法），並說明適用產業/角色、導入門檻、可借鏡之處。
- **學習筆記**：技術理論文章沿用上方「筆記 body 範本」10 段結構，至少一個 mermaid 圖或比較表、關鍵詞對照 5–10 條。

> ⚠️ 若某篇伺服端抽到的全文較薄，**寧可換一篇資料更充足的新聞**，也不要硬把 contentMd 灌水到目標長度。品質＞湊字數。

---

# 🧩 多代理架構與檔案隔離

本任務由 **1 位 Lead + 5 位領域專家 + 1 個 Opus 品質審查** 組成。核心加速來自 5 位專家**平行**撰稿。

## 角色與模型

| 角色 | 模型 | 職責 |
|---|---|---|
| **Lead**（Routine 主體） | Claude Opus | 前置、跑 `candidates` 切分候選、spawn 專家、合併 bundle、跨章節綜整、驅動品質審查與修復迴圈、入庫、觸發 Vercel、回報 |
| **領域專家 ×5**（Task 子代理，平行） | Claude Sonnet 5（`model: sonnet`） | 各負責一個章節：選材、抓全文、翻譯／撰稿（對齊內容深度規格）、寫學習筆記、逐篇落盤到自己的章節檔 |
| **品質審查**（步驟 5） | Claude Opus | 入庫前把關深度、翻譯、slug 一致、分類、筆記覆蓋（Lead 本身即 Opus，可直接審） |

## 五位專家的章節鍵（key）與人設

用 **ASCII key** 命名檔案，避免 shell 對中文與空白的引號問題：

| key | 章節 | 領域專家人設 | 配額 |
|---|---|---|---|
| `tech` | 技術理論 | AI 研究／論文專家（熟 Transformer、RLHF、MoE、benchmark 評測、新架構） | 2-5 則（重點，另備 1-2） |
| `market` | 市場情況 | AI 產業分析師（熟市場規模、投資統計、政策法規、晶片供需） | 1-2 則（另備 1） |
| `news` | 重大新聞 | 科技新聞編輯（熟重大公告、人事、爭議監管、安全事件） | 1-2 則（另備 1） |
| `enterprise` | 企業應用導入 | 企業數位轉型顧問（熟各產業導入、ROI、Agent 部署、台灣落地） | 2-5 則（重點，另備 1-2） |
| `startup` | 新創公司 | 創投／新創生態分析師（熟募資、新品、估值、IPO/併購） | 1-2 則（另備 1） |

## 檔案擁有權（同一檔案只能一位 owner）

- `work/candidates.json` — **Lead 寫、專家唯讀**（共享讀取不違規）。
- `work/<key>.urls.json` — **各專家獨佔**（自己選中文章的 url 陣列，餵給 `fulltext`）。
- `work/<key>.section.json` — **各專家獨佔**（該專家的產出，結構見下）。
- `daily-bundle.json` — **只有 Lead 能寫**（合併、以及品質審查後的所有修正皆由 Lead 施作，不回頭改專家檔）。

**專家輸出契約** `work/<key>.section.json`：

```jsonc
{
  "articles": [ /* BundleArticle 物件陣列，欄位同上方 Article 契約 */ ],
  "learningNotes": [ /* 僅 tech 專家會有；每篇技術理論一份 */ ],
  "items": [ /* 該章節的 dailyReport items；section 固定為本章節、position 由 0 起算 */ ]
}
```

> 平行安全性：`candidates`／`fulltext` 皆無狀態、只讀輸入、輸出到各自 stdout，5 個平行 `fulltext` 只要輸入檔名不同即互不干擾。跨章節撞 URL 由「Lead 合併去重 + url-dedup 閘門」雙保險；因剔除可能使篇數 <8，故每位專家要多備 1-2 篇候補。

---

# 🚀 執行步驟

## 步驟 1：準備工作（Lead）

1. 確認在 repo 根目錄（`ls` 應看到 `ingest/`、`specs/`、`package.json`）。網路錯誤最多重試 4 次，指數退避 2s/4s/8s/16s。
2. **驗證金鑰存在（缺就停）**：
   ```bash
   test -n "$SUPABASE_URL" && test -n "$SUPABASE_SERVICE_ROLE_KEY" && echo "ENV OK" || echo "ENV MISSING"
   ```
   `ENV MISSING` → 立即停止並回報。`VERCEL_DEPLOY_HOOK_URL` 缺少則僅警告、照常入庫。
3. 相依套件通常已由 SessionStart hook 裝好；保險起見確認 `node_modules/` 存在，缺了再 `npm ci`（失敗退 `npm install`）。確認 Node ≥ 22。
4. 建立暫存工作目錄：`mkdir -p work`。
5. 取日期與時間戳：
   ```bash
   TZ='Asia/Taipei' date +%Y-%m-%d
   TZ='Asia/Taipei' date +"%Y-%m-%d %H:%M"
   ```
6. 不需事先查已報導內容；url-dedup 閘門會自動剔除重複 URL；但仍要求每位專家多備 1-2 篇候補。

## 步驟 2：Lead 跑候選池並切分（兩層選材，Spec 008）

**第一層 — 候選池**：Edge Function 每 4 小時自動抓取 arXiv/RSS 進候選池。Lead 跑一次：

```bash
npm run candidates -- --hours 36
```

1. 讀輸出的 `CANDIDATES_JSON`（依 `category_hint` 分組、新→舊）。用 Write 存成 `work/candidates.json`（**Lead 寫、專家唯讀**）。
2. `category_hint` 只是提示；把每個 `category_hint` 群組對應到五大章節之一，切分成五份，準備分派給對應專家。某群組為空或不足時，該章節專家改用第二層 WebSearch。
3. 被選中的候選要記下它的 `id`，之後寫進該文章的 `origin.rawItemId`（channel 填 `"raw-item"`）。

**第二層 — WebSearch 補缺口**：池覆蓋不足的章節由該章節專家自行 WebSearch（**市場情況通常都需要**，池內無此類 feed）。WebSearch 來源的文章 `origin.channel` 填 `"websearch"`、`rawItemId` 為 `null`。

配額：技術理論與企業應用導入各 2-5 則（雙重點章節），其他章節各 1-2 則，總計 8-15 則。以當天或最近 24 小時為主，找不到放寬至 3 天。

| 章節 | 內容範圍 | 建議來源 |
|---|---|---|
| 技術理論 | 論文、新模型架構、演算法、benchmark | arXiv、HF Papers、Anthropic/OpenAI/DeepMind/Meta AI |
| 市場情況 | 市場規模、投資統計、政策法規、晶片供需 | Bloomberg、Reuters、CB Insights、財經媒體 |
| 重大新聞 | 重大公告、人事、爭議監管、安全事件 | TechCrunch、The Verge、WSJ、科技新報、iThome |
| 企業應用導入 | 企業導入案例、轉型、ROI、Agent 部署 | VentureBeat、HBR、MIT TR、企業官方公告 |
| 新創公司 | 募資、新品、估值、IPO/併購 | TechCrunch、The Information、INSIDE、數位時代 |

關鍵字參考：「latest LLM paper」「new AI architecture」「AI market size 2026」「major AI news today」「enterprise AI adoption」「AI startup funding」「台灣 企業 AI 應用」等。

## 步驟 3：Lead 平行 spawn 5 位領域專家（加速核心，Sonnet 5）

Lead 用 **Task 工具**在**同一則訊息內**一次 spawn 5 位領域專家（`subagent_type: general-purpose`、`model: sonnet`），讓它們**平行**作業。每位專家的 prompt 依下方範本填入其 `key`、章節、人設、配額與該章節候選。

**領域專家 prompt 範本**（Lead 逐一填入 `{...}`）：

```
你是一位「{章節}」的資深領域專家（{人設}），全程使用繁體中文。你負責本日 AI 日報「{章節}」章節的選材與撰稿。

【輸入】
- 唯讀讀取 work/candidates.json，只看 category_hint 對應到「{章節}」的候選（其餘章節別碰）。
- 候選不足時自行用 WebSearch 補足（來源建議：{建議來源}）。

【你要產出】{配額} 篇文章（另備 1-2 篇候補以防去重被剔），寫入你獨佔的 work/{key}.section.json。

【步驟】
1. 選材：從候選 + WebSearch 挑出合適新聞。候選文章記下其 id（origin.rawItemId、channel="raw-item"）；WebSearch 文章 channel="websearch"、rawItemId=null。
2. 抓全文：把選中文章的 url 收成 JSON 陣列，用 Write 存成 work/{key}.urls.json（**只寫這個檔**），執行：
   npm run fulltext -- work/{key}.urls.json
   讀輸出的 FULLTEXT_JSON（{ results:[{url,title,contentText,chars,status}] }）。以每篇 contentText 為底翻譯／改寫。
   某 url 的 status 非 fetched/cached-feed（即 failed）→ 放棄該篇、另選一篇。origin.fetchMethod 一律填 "edge-extract"。
3. 撰稿（對齊「內容深度規格」）：每篇 summaryMd 150-250 字；contentMd 約 1,000-1,600 漢字、切 4-6 個 ### 子章節（背景→機制→具體數據含表格→影響）；observationsMd 2-3 點（企業應用導入要在地化台灣、填 industry）。
4. 逐篇落盤：每完成一篇 → 立刻用 Edit/Write 把該 article 物件與對應的 items 項目加進 work/{key}.section.json（items 的 section 固定「{章節}」、position 由 0 起算、blurbMd 2-3 句）。**不要**批次擬稿。
5. 若「{章節}」是技術理論：每篇文章接著寫一份學習筆記（依筆記 body 範本 10 段結構），sourceArticleSlug 與該文章 slug 一字不差，加進 learningNotes。

【硬性限制】
- 只能寫 work/{key}.urls.json 與 work/{key}.section.json 這兩個檔；**絕不可**寫 daily-bundle.json 或其他專家的檔。
- 不要自己抓新聞網站（環境網路只放行 Supabase）；全文一律走 npm run fulltext。
- slug 禁用字元 / \ : * ? " < > |。

【回傳】一句話統計：產出幾篇、平均漢字數、是否有候補、有無抓取失敗改選的情況。
```

Lead 等 5 位專家全部回傳後才進步驟 4。若某位專家失敗或回空 → Lead 重派該章節一次；仍不行則該章節以較少篇數繼續（但總數要保持 8-15、雙重點章節盡量 ≥2）。

## 步驟 4：Lead 合併成 daily-bundle.json

1. 先寫入骨架：`runDate`、`meta`（generator=`claude-code-routine`、promptVersion=`v3`、generatedAt）、空的 `articles`/`learningNotes`、`dailyReport`（含空 `items`）。
2. 依序讀 `work/tech.section.json`、`work/market.section.json`、`work/news.section.json`、`work/enterprise.section.json`、`work/startup.section.json`，把各自的 `articles`、`learningNotes`、`items` 併入 bundle。
3. **跨章節去重**：若兩篇文章 URL 相同，保留一篇、移除另一篇及其 item（並把該章節剩餘 items 的 position 補成連續）。
4. 檢查合併後篇數 8-15；不足就回頭請對應專家補（或啟用候補）。
5. 補上 `dailyReport.summaryMd`（3-5 句總結五大領域）與 `observationsMd`（1-2 段跨章節趨勢觀察）——這是 Lead（Opus）的綜整工作。

**slug 一致性**是最常見錯誤來源：items 的 `articleSlug`、notes 的 `sourceArticleSlug` 必須與 articles 的 `slug` 一字不差。

## 步驟 5：Opus 品質審查（入庫前的軟閘門）

Lead（Opus）對合併後的 `daily-bundle.json` 逐項審查（也可 spawn 一位 `model: opus` 的 reviewer 子代理專責審查、回傳問題清單）：

- **深度**：每篇 contentMd 是否達約 1,000-1,600 漢字、有 4-6 子章節與（適用時）表格？過短 → 退回該章節專家補寫，或 Lead 自行補足。
- **翻譯品質**：專有名詞保留英文、通順繁中、無殘留大段英文。
- **slug 一致性**：`items[].articleSlug`、`learningNotes[].sourceArticleSlug` 與 `articles[].slug` 一字不差；跨章節 slug 不重複。
- **樣板字**：無「全文抓取失敗 / Access Denied / Just a moment」等（否則 content-quality 閘門會 fail）。
- **分類正確**：category 五選一且與所屬章節一致；企業應用導入有填 `industry`。
- **筆記覆蓋**：每篇技術理論都有對應筆記（note-coverage 閘門）。
- **章節配額**：五章節各 ≥1、雙重點各 ≥2（section-coverage）。

所有修正**一律由 Lead 對 `daily-bundle.json` 施作**（單一 writer），維持檔案隔離。審查通過才進步驟 6。

## 步驟 6：驗證與入庫（含修復迴圈）

```bash
npm run ingest:json -- daily-bundle.json
```

- 先看輸出的 `VALIDATION_ERRORS_JSON:`（若有）→ 依 path/message 修 JSON 後重跑。
- 再看 `GATE_REPORT_JSON:` → 若 `"failed": true`，依各 `"status":"fail"` 的 detail 修正 bundle（換文章、補筆記、修 slug）後重跑。**最多修復 3 輪**；3 輪後仍 fail → 停止並在回報中完整貼上 GATE_REPORT_JSON。
- exit 0 = 成功；exit 1 = 已入庫但有 warnings（讀 warnings，若是 slug 未解析請修正後重跑一次）。
- 檢查 `=== Ingest summary ===`：`items resolved=… skipped=0`、`notes ... unresolved=0`。
- 網路錯誤最多重試 4 次，指數退避 2s/4s/8s/16s。

## 步驟 7：觸發 Vercel 刷新

```bash
if [ -n "$VERCEL_DEPLOY_HOOK_URL" ]; then
  curl -fsS -X POST "$VERCEL_DEPLOY_HOOK_URL" && echo "VERCEL DEPLOY TRIGGERED"
else
  echo "VERCEL_DEPLOY_HOOK_URL 未設定，略過（ISR 1 小時內自動更新）"
fi
```
curl 失敗（非 2xx）最多重試 4 次；仍失敗記為警告（內容已入庫，ISR 會自動更新）。

## 步驟 8：完成回報

- 「已執行 `npm run ingest:json`，當日內容已寫入 Supabase」＋ `=== Ingest summary ===` 數字。
- GATE_REPORT_JSON 摘要（幾個 pass / warn；被 dedup 剔除的文章清單若有）。
- **各領域專家產出統計**：每章節幾篇、平均漢字數。
- Vercel 觸發結果。
- 2-3 句跨章節關鍵脈絡。
- 今天的學習筆記清單（slug + 主題一句話）。

---

# ⚠️ 全局注意事項

1. **契約與閘門高於一切**：格式正確性由 Zod 契約與品質閘門把關；你（Lead 與專家）的職責是內容品質（選材、深度、摘要、翻譯、觀察）。
2. **多代理平行**：步驟 3 的 5 位專家要在同一則訊息內一次 spawn 以平行執行；搜集與撰寫用 `model: sonnet`，只有 Lead 的協調／合併／綜整與步驟 5 的品質審查用 Opus。
3. **檔案隔離**：專家只寫自己的 `work/<key>.*` 檔，`daily-bundle.json` 只有 Lead 寫。跨章節去重與 Bundle 修正都在 Lead。
4. **內容深度對齊 6 月**：每篇約 1,000-1,600 漢字、4-6 子章節、含表格；品質＞湊字數，全文太薄就換一篇。
5. **逐篇落盤**：每位專家每完成一篇就更新自己的 section 檔，不要批次擬稿（避免 context 壓縮遺失）。
6. 五大章節盡量都有內容；技術理論與企業應用導入為雙重點（各 2-5 則）。
7. 每篇技術理論文章 → 一份學習筆記（`sourceArticleSlug` 對準）。
8. 企業應用導入文章務必填 `industry`，並在 observationsMd 在地化到台灣。
9. 同一則新聞只歸一個章節；每篇必須有完整全文（抓不到就換）。
10. 中文新聞保留原文；英文翻譯成繁體中文（專有名詞保留英文）。
11. 執行順序：驗環境＋`npm ci` → `candidates` 切分 → 平行 5 專家（`fulltext` + 撰稿）→ Lead 合併 → Opus 審查 → `ingest:json`（修復迴圈）→ `curl` Deploy Hook → 回報。
12. 沙箱系統時區 UTC：日期指令一律加 `TZ='Asia/Taipei'`。
13. **金鑰只走環境變數**，絕不可寫進任何檔案或輸出。
14. **回滾備援**：若 `ingest:json` 因程式錯誤（非 gate fail）連續失敗且無法修復，回報錯誤全文並停止；不要改用 backfill。上一版單一代理流程保留於 `每日AI新聞日報排程-雲端版-v2.md`；更舊的 Markdown 流程保留於 `每日AI新聞日報排程-雲端版-v1.md`（僅供人工決策回滾用）。

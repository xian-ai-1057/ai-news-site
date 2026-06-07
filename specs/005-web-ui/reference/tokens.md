# tokens.md — AI 日報 · Signal 設計 token 與結構參考

> 由 `navigator` 從原型 `AI 日報.html` `<style>` + `README.md` 抽出，**pixel-perfect 重建的唯一事實**。
> Phase 5 寫 `web/app/globals.css` 與各元件時逐項對照本檔。所有數值為最終值。

## 1. CSS 變數（Design Tokens）

### Light（`:root`）
| Token | Value | 用途 |
|---|---|---|
| `--bg` | `#ffffff` | 主背景 |
| `--bg-2` | `#f5f4f9` | 次背景（卡片 hover、tag、輸入底） |
| `--ink` | `#15131f` | 主文字 / 高對比區塊底 |
| `--ink-2` | `#56526a` | 次文字 |
| `--ink-3` | `#928da6` | 弱化文字 / meta / placeholder |
| `--line` | `#e9e7f0` | 細分隔線 |
| `--line-2` | `#dcd9e8` | 邊框（卡片、按鈕、輸入框） |
| `--accent` | `#4b3ff7` | 主強調色（靛紫） |
| `--accent-2` | `#6b5cff` | 強調色亮階 |
| `--accent-soft` | `#efecff` | 強調色極淡底（badge、高亮、focus ring） |

### Dark（`[data-theme="dark"]`）
| Token | Value |
|---|---|
| `--bg` | `#0c0b12` |
| `--bg-2` | `#15131d` |
| `--ink` | `#f1eff7` |
| `--ink-2` | `#a6a1ba` |
| `--ink-3` | `#6c6682` |
| `--line` | `#211e2c` |
| `--line-2` | `#2e2a3b` |
| `--accent` | `#8b7dff` |
| `--accent-2` | `#a596ff` |
| `--accent-soft` | `#1c1830` |

### 字型變數
- `--disp`: `"Space Grotesk", sans-serif`（顯示/標籤/數字/meta）
- `--headline`（正式版用此預設）: `"Space Grotesk", "Noto Sans TC", sans-serif`，`--headline-weight: 900`
- body: `"Noto Sans TC", system-ui, sans-serif`
> 略過 Newsreader / Noto Serif TC（原型 Tweaks 探索用，不移植）。

### 分類代表色（動態，非固定 token）
`catColor(hue, dark)` → Light `hsl(<hue> 66% 48%)`、Dark `hsl(<hue> 60% 64%)`。
hue：tech 268｜market 32｜news 8｜enterprise 200｜startup 150。

## 2. Typography（精確值）
- body：`16px / 1.62`，`-webkit-font-smoothing: antialiased`，`transition: background .35s, color .35s`
- hero h1（`.hero h1`）：`font:var(--headline)`，`clamp(34px,5vw,60px)`，weight `900`，`line-height:1.06`，`letter-spacing:-.01em`，`max-width:14ch`，`text-wrap:balance`，`margin:22px 0 0`，hover→`--accent`
- 內頁 h1（`.rhead h1`）：`clamp(36px,6vw,56px)`，weight `700`，`letter-spacing:-.02em`，`line-height:1`，`margin-top:18px`
- 卡片 h4（`.card h4`）：`21px / 700 / 1.32`，`text-wrap:pretty`，hover→`--accent`
- 文章 h3（`.ritem h3`）：`25px / 700 / 1.34`，`text-wrap:pretty`，`mark`→bg `--accent-soft`/色 `--accent`/`border-radius:3px`/`padding:0 2px`
- 小標（`.feed-head h3`、`.older h3`）：`--disp 14px`，`letter-spacing:.16em`，`uppercase`，色 `--ink-3`，weight `600`
- 章節英文（`.rsec-h .en`）：`--disp 12px`，`.16em`，`uppercase`，`--ink-3`
- 內文（`.ritem p`）：`17px / 1.76`，色 `--ink-2`
- hero lede（`.hero p.lede`）：`19px / 1.72`，`--ink-2`，`max-width:62ch`，`margin-top:24px`
- 內頁 lede-box（`.lede-box`）：`20px / 1.74`，色 `--ink`，weight `500`，`padding-left:22px`，`border-left:4px solid var(--accent)`，`margin:30px 0 8px`

## 3. 間距 / 圓角 / 陰影 / 動態
- `.wrap`：`max-width:1180px`，`margin:0 auto`，`padding:0 32px`（≤600px `0 20px`）
- `.reader`：`max-width:760px`，置中
- 圓角：藥丸 `20–30px`、輸入/大藥丸 `30–40px`、卡片 `18px`、obs/大區塊 `22px`、rnav `18px`、logo `9px`、圓點/圓鈕 `50%`
- 卡片 hover：`border-color:var(--accent)` + `translateY(-2px)` + `box-shadow:0 14px 40px -22px var(--accent)`
- overlay 陰影：`0 40px 100px rgba(0,0,0,.4)`
- header：`position:sticky;top:0;z-index:30`，`background:color-mix(in srgb,var(--bg) 84%,transparent)`，`backdrop-filter:blur(12px)`，`border-bottom:1px solid var(--line)`
- 過場：互動元素 `transition:.16s`（卡片/CTA `.18s`）；CTA hover `translateY(-1px)`
- `::selection`：`background:var(--accent);color:#fff`
- hero badge 脈動：`.pulse` `7px` 圓點，`animation:pulse 2.4s infinite`；keyframes：`0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--accent) 55%,transparent)} 70%{box-shadow:0 0 0 9px transparent} 100%{...0 transparent}`

## 4. 響應式斷點
- **≤880px**：`.strip→1fr 1fr`（odd 留右框）；`.grid→1fr`；`.hero .ghost→170px`
- **≤600px**：`.wrap padding:0 20px`；`.hrow padding:14px 20px`；`.nav a:not(.on){display:none}`；`.strip→1fr`（改 `border-bottom` 分隔，去 `border-right`）；`.rnav→1fr`；`.obs padding:28px 22px`；`.catbar top:56px`

## 5. 元件結構（class → 關鍵樣式）
- **Header**：`.hrow` flex 兩端；`.logo`（`.sq` 32×32 `radius:9px` bg `--accent`，`::after` `inset:9px` `border:2.4px solid #fff` `radius:50%` `border-right-color:transparent` `rotate(-20deg)` ＝缺口訊號環；`b` weight900 19px；`.disp` 11px `.22em` uppercase `--ink-3`）；`.nav a`（14px，`padding:8px 14px`，`radius:20px`，`.on`＝白字+`--accent` 底，hover→`--bg-2`）；`.cbtn`（38×38 圓鈕，`border:1px solid var(--line-2)`，hover→色/邊 `--accent`，svg 17px）
- **Hero**：`.hero`（`padding:60px 0 48px`，`border-bottom:1px solid var(--line)`，`overflow:hidden`）；`.ghost`（絕對右上，`--disp 700 260px`，`opacity:.06`，色 `--accent`，期數補零兩位）；`.eb`（藥丸 badge，`--disp 12px .18em uppercase`，色 `--accent`，bg `--accent-soft`，`padding:7px 14px`，含 `.pulse`）；`.hmeta`（`--disp 14px`，色 `--ink-3`，gap18，`.dt`→`--ink` w500）；`.cta`（`bg:var(--ink);color:var(--bg)`，w700 15px，`padding:14px 26px`，`radius:40px`，hover→`--accent`+`translateY(-1px)`）
- **Strip**：`.strip`（`grid 5×1fr`，欄間 `border-right:1px solid var(--line)`，下 `border-bottom`）；`.s`（`padding:26px 22px`，hover→`bg:var(--bg-2)`）；`.num`（`--disp 13px --ink-3`，含 9px 圓點 `.d`）；`.ti`（15px w500 1.45，3 行 `-webkit-line-clamp`，hover→`--accent`）
- **Archive**：`.feed-head`（flex 兩端，`margin:54px 0 22px`，`.cnt` `--disp 13px --ink-3`）；`.grid`（`2×1fr` gap18）；`.card`（`border:1px solid var(--line-2)` `radius:18px` `padding:28px` flex-col，hover 如上）；`.cd`（`.big` `--disp 700 30px`；`.my` `--disp 13px --ink-3`；`.iss` 右藥丸 `--disp 12px` border）；`.ex`（14.5px 1.66 `--ink-2` 3 行截斷 flex:1）；`.tags .tag`（`--disp 11.5px`，bg `--bg-2`，`radius:20px`，含 7px 圓點）；`.older-grid a`（`--disp 13.5px` 描邊藥丸，hover→`--accent` 底白字）
- **Reader**：`.back`（描邊藥丸，hover→`--accent`）；`.rhead`（`padding:30px 0 28px`，`border-bottom:2px solid var(--ink)`，含 `.eb` `.rm`）；`.lede-box`（見上）；`.rsec`（`padding:40px 0 6px`）；`.rsec-h`（`.pill` emoji+中文名 白字 `radius:30px` bg＝catColor；`.en` 右側）；`.ritem`（`padding:26px 0`，`border-top:1px solid var(--line)`，`:first-of-type` 無線；`.rim` 來源/`.ind` 灰藥丸/`a 原文↗` `--accent`；`.nt` 📓 學習筆記 `--accent-soft` 藥丸）；`.obs`（`bg:var(--ink);color:var(--bg)` `radius:22px` `padding:38px 34px`，`.ok` `--accent-2` 小標，`p 20px/1.78 w500`）；`.rnav`（`2×1fr`，描邊卡 hover→`--accent`+`--bg-2`，`.nx` 右對齊，邊界缺側留空）
- **CatView**：`.catbar`（`sticky;top:60px;z-index:20;background:var(--bg)`，`padding:14px 0 16px`，`border-bottom:1px solid var(--line)`）；`.csearch`（flex，`border:1px solid var(--line-2)` `radius:30px` `height:50px`，`:focus-within`→`border:var(--accent)`+`box-shadow:0 0 0 3px var(--accent-soft)`；svg 18px `--ink-3`；input 16px；`.cclr` 24px 圓鈕，有輸入才 `display:grid`）；`.cchips .cchip`（描邊藥丸 14px，`.on`→白字 w700 `background:var(--cc,var(--ink))`）；`.cat-count`（`--disp 13px --ink-3`）；`.cat-empty`（置中 80px，18px + 14px 副字）
- **Overlay `#ov`**：`position:fixed;inset:0`，`background:rgba(12,11,18,.55)`，`backdrop-filter:blur(5px)`，`padding-top:11vh`，`z-index:60`，`.on`→`display:flex`；`.ov-box`（`min(640px,92vw)` `radius:20px` 陰影 `0 40px 100px rgba(0,0,0,.4)`）；`.ov-in`（input 18px，底 `border-bottom`）；`.ov-res`（`max-height:54vh` 捲）；`.r2`（彩點 `.d` 8px + `.rt2` 16px（`mark`→`--accent` w700）+ `.rm2` `--disp 12px --ink-3`「分類·來源·日期」）；`.ov-hint`（底「即時全文搜尋 / Esc 關閉」）

## 6. Icon（inline SVG，stroke）
- 放大鏡：`<circle cx=11 cy=11 r=7/><path d="m21 21-4.3-4.3"/>` viewBox 24 stroke-width 2
- 太陽：`<circle r=4.5/>` + 8 道光芒 path，stroke-width 1.8
- 月亮：`<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>`，stroke-width 1.8
- 清除：文字 `✕`（13px）
- Logo：純 CSS（見 §5 Header），無圖檔

## 7. 互動 / 鍵盤
- ⌘K / Ctrl-K 開搜尋 overlay（再按或 Esc 關、點遮罩關）
- catView 搜尋：受控 input，**只重繪結果不 remount input**（保留焦點/游標）；比對 `title+points+source+industry` 小寫 `includes`；主題 chip 單選、可與關鍵字疊加；命中 `<mark>` 高亮（escape regex）
- 主題：`data-theme` 於 `<html>`/`<body>`，存 `localStorage['ainews-theme-c']`，太陽/月亮 icon 切換
- `prefers-reduced-motion`：可關 hero pulse

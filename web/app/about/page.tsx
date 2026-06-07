import { CAT_ORDER, CATS } from "@/lib/categories";

export default function AboutPage() {
  return (
    <main className="wrap">
      <section className="hero" style={{ borderBottom: "none" }}>
        <div className="eb">關於本站</div>
        <h1>每天，把 AI 世界讀成一則訊號。</h1>
        <p className="lede">
          Signal AI 日報是一份繁體中文 AI 新聞彙整日報，每日從科技媒體、學術來源與產業動態中，精選並整理最值得關注的 AI 新聞，依技術理論、市場情況、重大新聞、企業應用導入與新創公司五大分類組織，讓你每天只需幾分鐘，就能掌握 AI 世界的脈動。
        </p>
      </section>

      <div className="sub-card">
        <h3>訂閱 · SUBSCRIBE</h3>
        <p>輸入 Email，每日第一手 AI 日報直送信箱。不推送廣告，隨時可取消訂閱。</p>
        <form className="sub-form">
          <input type="email" placeholder="you@example.com" />
          <button type="button">訂閱 →</button>
        </form>
      </div>

      <div className="tags">
        {CAT_ORDER.map((k) => {
          const cat = CATS[k];
          return (
            <span
              key={k}
              className="tag"
              style={{ "--hue": cat.hue } as React.CSSProperties}
            >
              <span className="d" style={{ width: 7, height: 7 }} />
              {cat.label}
            </span>
          );
        })}
      </div>
    </main>
  );
}

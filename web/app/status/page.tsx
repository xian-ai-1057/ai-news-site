// Spec 009 §4 — 管線狀態頁：今日狀態 → 近 14 次 run → 來源新鮮度。
// 全部 anon key 唯讀；migration 未套用時查詢回空陣列、頁面降級顯示提示。
import { getRuns, getSourceHealth, type RunSummary } from "@/lib/queries";

export const revalidate = 300;

const PHASE_COLOR: Record<string, string> = {
  completed: "hsl(150 66% 40%)",
  failed: "hsl(8 72% 50%)",
  started: "hsl(32 80% 45%)",
  validated: "hsl(32 80% 45%)",
  gated: "hsl(32 80% 45%)",
  written: "hsl(200 66% 45%)",
};

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "1px 8px",
        borderRadius: 999,
        fontSize: 12,
        color: "#fff",
        background: color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function gateSummary(run: RunSummary): string {
  if (run.gateResults.length === 0) return "—";
  const count = (s: string) => run.gateResults.filter((g) => g.status === s).length;
  return `pass ${count("pass")} · warn ${count("warn")} · fail ${count("fail")}`;
}

function fmtTime(iso: string | null): string {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 16) + " UTC";
}

const cellStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid color-mix(in oklab, currentColor 14%, transparent)",
  textAlign: "left",
  verticalAlign: "top",
  fontSize: 14,
};

export default async function StatusPage() {
  const [runs, sources] = await Promise.all([getRuns(14), getSourceHealth()]);
  const latestJson = runs.find((r) => r.channel === "json");

  return (
    <main className="wrap">
      <section className="hero" style={{ borderBottom: "none" }}>
        <div className="eb">管線狀態 · STATUS</div>
        <h1>資料管線觀測站</h1>
        <p className="lede">
          每日 ingest、來源抓取與健檢的執行紀錄。今日最新 ingest：
          {latestJson ? (
            <Chip
              label={`${latestJson.runDate} ${latestJson.phase}`}
              color={PHASE_COLOR[latestJson.phase] ?? "hsl(220 10% 50%)"}
            />
          ) : (
            <span>（尚無紀錄）</span>
          )}
        </p>
      </section>

      <section style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>近 14 次執行</h2>
        {runs.length === 0 ? (
          <p>尚無執行紀錄（ingestion_runs migration 尚未套用，或還沒有任何 run）。</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={cellStyle}>日期</th>
                  <th style={cellStyle}>通道</th>
                  <th style={cellStyle}>狀態</th>
                  <th style={cellStyle}>數量</th>
                  <th style={cellStyle}>閘門</th>
                  <th style={cellStyle}>警告</th>
                  <th style={cellStyle}>完成時間</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run, i) => (
                  <tr key={i}>
                    <td style={cellStyle}>{run.runDate}</td>
                    <td style={cellStyle}>{run.channel}</td>
                    <td style={cellStyle}>
                      <Chip
                        label={run.phase}
                        color={PHASE_COLOR[run.phase] ?? "hsl(220 10% 50%)"}
                      />
                    </td>
                    <td style={cellStyle}>
                      {Object.entries(run.counts)
                        .map(([k, v]) => `${k}:${v}`)
                        .join(" ") || "—"}
                    </td>
                    <td style={cellStyle}>{gateSummary(run)}</td>
                    <td style={cellStyle}>
                      {run.error ?? (run.warnings.length > 0 ? `${run.warnings.length} 則` : "—")}
                    </td>
                    <td style={cellStyle}>{fmtTime(run.finishedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: 20, marginBottom: 12 }}>來源新鮮度（近 48 小時）</h2>
        {sources.length === 0 ? (
          <p>尚無來源資料（Spec 008 migration 尚未套用）。</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th style={cellStyle}>來源</th>
                  <th style={cellStyle}>類型</th>
                  <th style={cellStyle}>啟用</th>
                  <th style={cellStyle}>48h 項目</th>
                  <th style={cellStyle}>最近抓取</th>
                  <th style={cellStyle}>狀態</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.name}>
                    <td style={cellStyle}>{s.name}</td>
                    <td style={cellStyle}>{s.kind}</td>
                    <td style={cellStyle}>{s.active ? "✓" : "—"}</td>
                    <td style={cellStyle}>{s.items48h}</td>
                    <td style={cellStyle}>{fmtTime(s.lastFetchedAt)}</td>
                    <td style={cellStyle}>
                      <Chip
                        label={s.lastStatus === "ok" ? "ok" : s.lastStatus ? "error" : "尚未抓取"}
                        color={
                          s.lastStatus === "ok"
                            ? "hsl(150 66% 40%)"
                            : s.lastStatus
                              ? "hsl(8 72% 50%)"
                              : "hsl(220 10% 50%)"
                        }
                      />
                      {s.lastStatus && s.lastStatus !== "ok" ? (
                        <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                          {s.lastStatus.slice(0, 120)}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

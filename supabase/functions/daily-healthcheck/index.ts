// Spec 009 §3 — daily-healthcheck Edge Function（Deno）。
// Cron 兩班（台北 11:00 warn-only / 14:00 告警）。檢查今日日報、items 數、
// json run 狀態、來源新鮮度；失敗且 ?alert=true 時 POST Slack Incoming Webhook。
// 無論結果都寫一列 ingestion_runs（channel='healthcheck'）。
import { createClient } from "@supabase/supabase-js";

const ITEM_MIN = 8;
const ITEM_MAX = 15;
const SOURCE_STALE_HOURS = 48;

/** 台北「今天」（UTC+8，無 DST）。 */
function taipeiToday(): string {
  return new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10);
}

Deno.serve(async (req: Request) => {
  const alert = new URL(req.url).searchParams.get("alert") !== "false";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  const today = taipeiToday();
  const failures: string[] = [];
  let checksPassed = 0;

  // ① 今日日報存在
  const { data: report } = await supabase
    .from("daily_reports")
    .select("id")
    .eq("report_date", today)
    .maybeSingle();
  if (report) {
    checksPassed += 1;

    // ② items 數 8–15
    const { count } = await supabase
      .from("daily_report_items")
      .select("id", { count: "exact", head: true })
      .eq("daily_report_id", report.id);
    if (count !== null && count >= ITEM_MIN && count <= ITEM_MAX) {
      checksPassed += 1;
    } else {
      failures.push(`今日日報 items=${count ?? "?"}（應 ${ITEM_MIN}-${ITEM_MAX}）`);
    }
  } else {
    failures.push(`今日（${today}）尚無日報`);
  }

  // ③ 今日最新 json run 完成
  const { data: runs } = await supabase
    .from("ingestion_runs")
    .select("phase,error")
    .eq("run_date", today)
    .eq("channel", "json")
    .order("started_at", { ascending: false })
    .limit(1);
  const latestJson = runs?.[0];
  if (latestJson?.phase === "completed") {
    checksPassed += 1;
  } else {
    failures.push(
      latestJson
        ? `今日最新 json run phase=${latestJson.phase}${latestJson.error ? `（${latestJson.error}）` : ""}`
        : "今日尚無 json ingest run",
    );
  }

  // ④ 來源新鮮度
  const staleBefore = new Date(Date.now() - SOURCE_STALE_HOURS * 3_600_000).toISOString();
  const { data: sources } = await supabase
    .from("sources")
    .select("name,last_fetched_at,last_status")
    .eq("active", true);
  const stale = (sources ?? []).filter(
    (s) =>
      !s.last_fetched_at ||
      s.last_fetched_at < staleBefore ||
      String(s.last_status).startsWith("error"),
  );
  if (stale.length === 0) {
    checksPassed += 1;
  } else {
    failures.push(
      `來源異常/逾 ${SOURCE_STALE_HOURS}h：${stale.map((s) => s.name).join("、")}`,
    );
  }

  // 記錄 run
  await supabase.from("ingestion_runs").insert([
    {
      run_date: today,
      channel: "healthcheck",
      trigger_src: "supabase-cron",
      phase: failures.length === 0 ? "completed" : "failed",
      counts: { checksPassed, failures: failures.length, alertMode: alert },
      warnings: failures,
      finished_at: new Date().toISOString(),
    },
  ]);

  // 告警
  const webhook = Deno.env.get("SLACK_WEBHOOK_URL");
  let alerted = false;
  if (failures.length > 0 && alert && webhook) {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text:
          `:rotating_light: AI News 日報管線健檢失敗（${today}）\n` +
          failures.map((f) => `• ${f}`).join("\n") +
          `\n狀態頁：/status`,
      }),
    });
    alerted = res.ok;
  }

  return Response.json({ today, checksPassed, failures, alerted });
});

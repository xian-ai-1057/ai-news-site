// Spec 007 §7 / AC6 — backfill 無 --force-seed → exit 2，且不建 DB client。
// 以子行程驗證：env 清空金鑰下 exit 2（而非 createDbClient throw 的 exit 1），
// 證明防護在建立連線之前就攔下。
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("backfill 無 --force-seed → exit 2（不碰 DB）", () => {
  const result = spawnSync(
    process.execPath,
    ["node_modules/.bin/tsx", "ingest/cli/index.ts", "backfill"],
    {
      env: { ...process.env, SUPABASE_URL: "", SUPABASE_SERVICE_ROLE_KEY: "" },
      encoding: "utf8",
      timeout: 30_000,
    },
  );
  assert.equal(result.status, 2, result.stderr);
  assert.ok(result.stderr.includes("--force-seed"), "錯誤訊息提示旗標");
  assert.ok(result.stderr.includes("ingest:json"), "錯誤訊息指向日常通道");
});

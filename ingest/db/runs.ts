// Spec 007 — ingestion_runs 生命週期紀錄。
// 紀錄失敗絕不阻斷 ingest 本體：所有 DB 錯誤降級為 console.warn。
import type { DbClient } from "./client";
import type { GateResult } from "../gates/index";

export type RunChannel =
  | "json"
  | "markdown-backfill"
  | "edge-fetch"
  | "embed"
  | "healthcheck";

export type RunPhase =
  | "started"
  | "validated"
  | "gated"
  | "written"
  | "completed"
  | "failed";

export interface RunCounts {
  articles: number;
  learningNotes: number;
  dailyReports: number;
  dailyReportItems: number;
}

export interface RunRecorder {
  /** ingestion_runs.id；insert 失敗時為 null（後續操作全部 no-op）。 */
  id: string | null;
  setPhase(phase: RunPhase, patch?: Record<string, unknown>): Promise<void>;
  complete(counts: RunCounts, warnings: string[]): Promise<void>;
  fail(error: string, patch?: Record<string, unknown>): Promise<void>;
}

/** 序列化 gate results 供 jsonb 欄位。 */
export function gateResultsJson(results: GateResult[]): GateResult[] {
  return results.map(({ gate, status, detail }) => ({ gate, status, detail }));
}

export async function startRun(
  client: DbClient,
  init: { runDate: string; channel: RunChannel; triggerSrc: string },
): Promise<RunRecorder> {
  let id: string | null = null;
  try {
    const { data, error } = await client
      .from("ingestion_runs")
      .insert([
        {
          run_date: init.runDate,
          channel: init.channel,
          trigger_src: init.triggerSrc,
          phase: "started",
        },
      ])
      .select("id");
    if (error) {
      console.warn(`[ingestion_runs] insert failed: ${error.message}`);
    } else {
      id = (data?.[0] as { id?: string } | undefined)?.id ?? null;
    }
  } catch (err) {
    console.warn(`[ingestion_runs] insert threw: ${String(err)}`);
  }

  async function patchRun(fields: Record<string, unknown>): Promise<void> {
    if (!id) return;
    try {
      const { error } = await client.from("ingestion_runs").update(fields).eq("id", id);
      if (error) console.warn(`[ingestion_runs] update failed: ${error.message}`);
    } catch (err) {
      console.warn(`[ingestion_runs] update threw: ${String(err)}`);
    }
  }

  return {
    id,
    async setPhase(phase, patch = {}) {
      await patchRun({ phase, ...patch });
    },
    async complete(counts, warnings) {
      await patchRun({
        phase: "completed",
        counts,
        warnings,
        finished_at: new Date().toISOString(),
      });
    },
    async fail(error, patch = {}) {
      await patchRun({
        phase: "failed",
        error,
        finished_at: new Date().toISOString(),
        ...patch,
      });
    },
  };
}

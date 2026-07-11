// Spec 003 — Supabase client factory.
// service_role key bypasses RLS; keys injected via .env (dotenv), never committed.
import { config as loadEnv } from "dotenv";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

loadEnv();

/**
 * Minimal structural type for the Supabase client surface used by the upsert
 * layer. Tests inject a fake that satisfies this shape, so we don't depend on
 * the full `SupabaseClient` type in {@link ingestBundle}.
 */
export interface QueryResult<T = unknown> {
  data: T[] | null;
  error: { message: string } | null;
}

export interface InsertBuilder {
  select(columns?: string): Promise<QueryResult>;
}

export interface UpsertBuilder {
  select(columns?: string): Promise<QueryResult>;
}

export interface DeleteBuilder {
  eq(column: string, value: unknown): Promise<QueryResult>;
}

export interface SelectBuilder {
  in(column: string, values: unknown[]): Promise<QueryResult>;
}

export interface UpdateBuilder {
  eq(column: string, value: unknown): Promise<QueryResult>;
}

export interface TableBuilder {
  upsert(rows: unknown[], options?: { onConflict?: string }): UpsertBuilder;
  insert(rows: unknown[]): Promise<QueryResult> & InsertBuilder;
  delete(): DeleteBuilder;
  /** Spec 007：閘門去重查詢（articles）用。 */
  select(columns: string): SelectBuilder;
  /** Spec 007：ingestion_runs 生命週期更新用。 */
  update(values: Record<string, unknown>): UpdateBuilder;
}

export interface DbClient {
  from(table: string): TableBuilder;
}

/**
 * Build a Supabase client from the environment. The service role key bypasses
 * RLS, which is required for the ingest writer.
 *
 * @param url override for SUPABASE_URL (tests / explicit config)
 * @param key override for SUPABASE_SERVICE_ROLE_KEY
 */
export function createDbClient(
  url: string | undefined = process.env.SUPABASE_URL,
  key: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY,
): SupabaseClient {
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment (.env).",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

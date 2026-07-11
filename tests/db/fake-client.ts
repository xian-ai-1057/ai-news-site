// Test fake for the Supabase client surface used by ingestBundle.
// Records every .from(table).upsert/.insert/.delete().eq().select() call,
// and returns canned rows with synthetic uuids on select.
import type {
  DbClient,
  TableBuilder,
  UpsertBuilder,
  DeleteBuilder,
  SelectBuilder,
  UpdateBuilder,
  QueryResult,
} from "../../ingest/db/client";

export interface RecordedCall {
  table: string;
  op: "upsert" | "insert" | "delete" | "select" | "update";
  rows?: unknown[];
  onConflict?: string;
  selected?: boolean;
  eq?: { column: string; value: unknown };
  in?: { column: string; values: unknown[] };
  values?: Record<string, unknown>;
}

export interface FakeOptions {
  /** tables that should return {error} on the next matching op. */
  errorOn?: { table: string; op: RecordedCall["op"]; message: string }[];
  /** canned rows returned by .select().in() per table (Spec 007 dedup lookup). */
  selectRows?: Record<string, unknown[]>;
}

let uuidCounter = 0;
function synthUuid(table: string, slug: string): string {
  uuidCounter += 1;
  return `${table}-${slug}-uuid-${uuidCounter}`;
}

export class FakeClient implements DbClient {
  calls: RecordedCall[] = [];
  private errorOn: NonNullable<FakeOptions["errorOn"]>;
  private selectRows: NonNullable<FakeOptions["selectRows"]>;

  constructor(opts: FakeOptions = {}) {
    this.errorOn = opts.errorOn ?? [];
    this.selectRows = opts.selectRows ?? {};
  }

  private takeError(table: string, op: RecordedCall["op"]): { message: string } | null {
    const idx = this.errorOn.findIndex((e) => e.table === table && e.op === op);
    if (idx === -1) return null;
    const [e] = this.errorOn.splice(idx, 1);
    return { message: e.message };
  }

  from(table: string): TableBuilder {
    const self = this;
    return {
      upsert(rows: unknown[], options?: { onConflict?: string }): UpsertBuilder {
        const call: RecordedCall = {
          table,
          op: "upsert",
          rows,
          onConflict: options?.onConflict,
        };
        self.calls.push(call);
        return {
          async select(): Promise<QueryResult> {
            call.selected = true;
            const error = self.takeError(table, "upsert");
            if (error) return { data: null, error };
            // Echo back slug + synthetic id for each row that has a slug.
            const data = (rows as Array<{ slug?: string }>).map((r) => ({
              slug: r.slug,
              id: synthUuid(table, r.slug ?? "x"),
            }));
            return { data, error: null };
          },
        };
      },
      insert(rows: unknown[]) {
        const call: RecordedCall = { table, op: "insert", rows };
        self.calls.push(call);
        const error = self.takeError(table, "insert");
        const result: QueryResult = { data: error ? null : [], error };
        // ingestBundle awaits .insert() directly, so return a thenable.
        // .select() echoes rows back with synthetic ids (Spec 007 runs.ts 需要 id)。
        return Object.assign(Promise.resolve(result), {
          async select(): Promise<QueryResult> {
            if (error) return { data: null, error };
            const data = (rows as Array<Record<string, unknown>>).map((r, i) => ({
              ...r,
              id: synthUuid(table, String((r as { slug?: string }).slug ?? i)),
            }));
            return { data, error: null };
          },
        });
      },
      delete(): DeleteBuilder {
        return {
          async eq(column: string, value: unknown): Promise<QueryResult> {
            const error = self.takeError(table, "delete");
            self.calls.push({
              table,
              op: "delete",
              eq: { column, value },
            });
            return { data: error ? null : [], error };
          },
        };
      },
      select(): SelectBuilder {
        return {
          async in(column: string, values: unknown[]): Promise<QueryResult> {
            const error = self.takeError(table, "select");
            self.calls.push({ table, op: "select", in: { column, values } });
            if (error) return { data: null, error };
            return { data: (self.selectRows[table] ?? []) as unknown[], error: null };
          },
        };
      },
      update(values: Record<string, unknown>): UpdateBuilder {
        return {
          async eq(column: string, value: unknown): Promise<QueryResult> {
            const error = self.takeError(table, "update");
            self.calls.push({ table, op: "update", values, eq: { column, value } });
            return { data: error ? null : [], error };
          },
        };
      },
    };
  }
}

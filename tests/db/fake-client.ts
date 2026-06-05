// Test fake for the Supabase client surface used by ingestBundle.
// Records every .from(table).upsert/.insert/.delete().eq().select() call,
// and returns canned rows with synthetic uuids on select.
import type {
  DbClient,
  TableBuilder,
  UpsertBuilder,
  DeleteBuilder,
  QueryResult,
} from "../../ingest/db/client";

export interface RecordedCall {
  table: string;
  op: "upsert" | "insert" | "delete";
  rows?: unknown[];
  onConflict?: string;
  selected?: boolean;
  eq?: { column: string; value: unknown };
}

export interface FakeOptions {
  /** tables that should return {error} on the next matching op. */
  errorOn?: { table: string; op: RecordedCall["op"]; message: string }[];
}

let uuidCounter = 0;
function synthUuid(table: string, slug: string): string {
  uuidCounter += 1;
  return `${table}-${slug}-uuid-${uuidCounter}`;
}

export class FakeClient implements DbClient {
  calls: RecordedCall[] = [];
  private errorOn: NonNullable<FakeOptions["errorOn"]>;

  constructor(opts: FakeOptions = {}) {
    this.errorOn = opts.errorOn ?? [];
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
        return Object.assign(Promise.resolve(result), {
          async select(): Promise<QueryResult> {
            return result;
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
    };
  }
}

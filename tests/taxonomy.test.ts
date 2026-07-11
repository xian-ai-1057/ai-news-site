// Spec 007 §9 / AC8 — taxonomy 單源化：001 契約的 CATEGORIES 為唯一事實，
// 靜態比對 DB migration enum 與 web 分類檔，任何一處漂移 → CI 失敗。
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { CATEGORIES } from "../specs/001-db-schema/contracts/records.schema";

test("supabase/migrations/0001_init.sql 的 category_enum 與契約一致", () => {
  const sql = readFileSync("supabase/migrations/0001_init.sql", "utf8");
  const enumBlock = sql.match(/create type category_enum as enum \(([\s\S]*?)\)/);
  assert.ok(enumBlock, "找不到 category_enum 定義");
  const values = [...enumBlock![1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(values, [...CATEGORIES], "DB enum 與契約 CATEGORIES 漂移");
});

test("web/lib/categories.ts 覆蓋契約全部分類且無多餘 label", () => {
  const src = readFileSync("web/lib/categories.ts", "utf8");
  for (const category of CATEGORIES) {
    assert.ok(
      src.includes(`label: "${category}"`),
      `web/lib/categories.ts 缺 label "${category}"`,
    );
    assert.ok(
      src.includes(`${category}: "`),
      `web/lib/categories.ts 的 CATEGORY_KEY 缺 "${category}"`,
    );
  }
  const labelCount = [...src.matchAll(/label: "/g)].length;
  assert.equal(labelCount, CATEGORIES.length, "web 分類數與契約不一致");
});

test("specs/005-web-ui/contracts/categories.ts（若存在）與契約一致", () => {
  const path = "specs/005-web-ui/contracts/categories.ts";
  if (!existsSync(path)) return;
  const src = readFileSync(path, "utf8");
  for (const category of CATEGORIES) {
    assert.ok(src.includes(category), `${path} 缺 "${category}"`);
  }
});

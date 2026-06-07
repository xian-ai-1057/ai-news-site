import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// 此 web app 與 repo 根目錄的 ingest 專案各有 lockfile（monorepo）。
// Next 16 要求 turbopack.root 與 outputFileTracingRoot 必須相同值；Vercel 在
// 子目錄部署時會把 outputFileTracingRoot 注入為 repo 根目錄。故把兩者都明確
// 釘在 repo 根：既消除本地「多 lockfile」推斷警告，也消除 Vercel build 的兩值不一致警告。
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

const nextConfig: NextConfig = {
  turbopack: { root: repoRoot },
  outputFileTracingRoot: repoRoot,
};

export default nextConfig;

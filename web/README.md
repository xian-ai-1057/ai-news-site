This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

This app is the **web** sub-project of a monorepo (the repo root is the ingest pipeline;
each has its own `package.json` / lockfile). It is fully deploy-ready: read-only Supabase
access via the public `anon` key + public-read RLS, no API routes, no server secrets,
ISR + SSG (`revalidate: 3600`). The anon key is safe to expose publicly.

One-time setup on [vercel.com](https://vercel.com/new):

1. Import the GitHub repo (`xian-ai-1057/ai-news-site`).
2. **Set Root Directory = `web`** — required for the monorepo, otherwise Vercel finds the
   ingest lockfile at the repo root and the build fails. Framework auto-detects as Next.js;
   leave Build Command / Output at their defaults (`next build`).
3. Add **Environment Variables** (for both Production and Preview) — same values as
   [`.env.local.example`](.env.local.example), **never** the `service_role` / secret key:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://ifbpfuvlevjegwdnhyqh.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `sb_publishable_…`
4. Set the **Production Branch** to `v4`.
5. Deploy → you get a public `https://<project>.vercel.app` URL anyone can reach.
   (Optional: bind a custom domain under Project → Settings → Domains.)

Every push to `v4` redeploys automatically; other branches / PRs get Preview URLs.

New content from the daily ingest appears within the ISR window (≤ 1 hour). To refresh
immediately, create a Vercel **Deploy Hook** and `curl` it at the end of the ingest run,
or add an on-demand revalidate route triggered by a Supabase webhook.

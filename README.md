# AI Video Price Tracker
Static site. `node scripts/scrape.mjs` refreshes data/prices.json from vendors' public pricing pages (unparsed rows keep old values and get `stale: true`; changes logged to data/changes.json). `node scripts/build.mjs` writes dist/. Deploy dist/ to Vercel.
- Affiliate links: affiliates.config.json (placeholders = vendor homepages)
- Newsletter link: affiliates.config.json `newsletter` (PLACEHOLDER: LineAI Beehiiv page)
- Sora removed: OpenAI shut down Sora 2 API on 2026-09-24.

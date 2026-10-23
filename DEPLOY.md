# Deploying (no Vercel CLI login)

Project: `aivideoprice` (prj_W1u2tfrJoBMkLDK1gtmlkVgf4VtO), prod URL https://aivideoprice.vercel.app

1. `node scripts/scrape.mjs && node scripts/build.mjs`
2. `bash scripts/prep-deploy.sh` → prints the `files` JSON array; b64 copies in /workspace/aivideoprice-b64/
3. For each file (or only ones whose sha changed), call user-Vercel `upload_file`:
   `{"contentLength": <size>, "xVercelDigest": "<sha>", "requestBody": "$file:/workspace/aivideoprice-b64/<sha>.b64"}`
   **Do NOT pass `slug`/`teamId`** — the connection 403s on scope "autom8tion-works" but works on its default scope (same team).
   Only one `$file:` arg per call works fine; max 4 per call.
4. user-Vercel `create_deployment` (no slug/teamId):
   `{"forceNew":"1","skipAutoDetectionConfirmation":"1","requestBody":{"name":"aivideoprice","project":"aivideoprice","target":"production","projectSettings":{"framework":null,"buildCommand":"echo static","installCommand":"true","outputDirectory":"."},"files":<array from step 2>}}`
   If it errors with missing files, upload those shas and retry.
5. Poll `get_deployment` until READY, then `curl -s https://aivideoprice.vercel.app | grep beehiiv` to verify.
6. `git add data dist scripts DEPLOY.md && git commit -m "Daily refresh" && git push origin master` (stage only these paths — never clips/ or .github/workflows; token lacks workflow scope).

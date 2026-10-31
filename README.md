# Projects by Xavier Loo

Project directory for https://projects.xavierloo.com/, matching the styling and hosting of [Apps by Xavier Loo](https://apps.xavierloo.com/).

No projects are listed initially.

## Structure

- `site/`: buildless HTML, CSS, favicon, robots.txt, sitemap and llms.txt.
- `worker/`: Cloudflare Worker that proxies GitHub Pages while keeping the public domain in the address bar.
- `.github/workflows/pages.yml`: publishes `site/` to GitHub Pages.
- `.github/workflows/worker.yml`: checks and deploys the Worker.

## Local development

Serve `site/` with any static HTTP server. The page follows the system light/dark preference.

```sh
cd worker
npm ci
npm run check
npm run dev
```

## First deployment

1. Create `jvloo/com-xavierloo-projects` on GitHub and push `main`.
2. Enable GitHub Pages with GitHub Actions as its build source.
3. Run the **Deploy site** workflow if it has not started automatically.
4. Authenticate Wrangler to the existing Cloudflare account and run `npm run deploy` in `worker/`. The `projects.xavierloo.com` Worker custom domain provisions its DNS record and certificate.
5. For automatic Worker deployments, set `CLOUDFLARE_API_TOKEN` in the repository's `cloudflare` environment with the permissions needed to deploy this Worker and its custom domain. Once configured, run **Deploy worker**.

## Add a project

Add its entry to `site/index.html`, replacing the empty state with a list. The stylesheet includes `.projects`, `.project`, `.project-name`, `.project-desc`, `.project-meta`, and `.status` classes matching the apps directory.

If the project is hosted on GitHub Pages and should appear at `/project-slug/`, add a mapping to `PROJECTS` in `worker/src/index.ts`:

```ts
const PROJECTS: Record<string, string> = {
  "/project-slug": "/github-pages-repository",
};
```

Build that project's assets and internal links for `/project-slug/`. External project URLs can be linked directly without a Worker mapping. Update `site/llms.txt` and add relevant sitemaps to `site/robots.txt` when projects are listed.

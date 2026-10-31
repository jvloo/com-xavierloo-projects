# Projects by Xavier Loo

Project directory for https://projects.xavierloo.com/, matching the styling and hosting of [Apps by Xavier Loo](https://apps.xavierloo.com/).

The directory contains built/co-founded products, selected contributions, side projects, open source, apps/hackathons, and earlier work. Content is kept in `site/projects.json`; `scripts/build.mjs` generates the HTML and `llms.txt` so the complete directory is readable without JavaScript.

## Structure

- `site/`: buildless HTML, CSS, favicon, robots.txt, sitemap and llms.txt.
- `site/projects.json`: project descriptions, roles, links, and gallery images.
- `site/media/`: reviewed screenshots and original repository demo media.
- `scripts/build.mjs`: validates project IDs, groups, URLs and image files, then generates the static directory.
- `docs/content-review-2026-10-31.md`: source checks and editorial/media decisions.
- `worker/`: Cloudflare Worker that proxies GitHub Pages while keeping the public domain in the address bar.
- `.github/workflows/pages.yml`: publishes `site/` to GitHub Pages.
- `.github/workflows/worker.yml`: checks and deploys the Worker.

## Local development

Serve `site/` with any static HTTP server. The page follows the system light/dark preference.

```sh
node scripts/build.mjs
python -m http.server 4174 --directory site
```

`node scripts/build.mjs` writes pages from the same `projects.json` and gallery data: the default immersive pixel-art cyberpunk RPG journal at `site/index.html` (`/`), the former minimalist style labelled Clean at `site/clean/index.html` (`/clean/`), and a legacy `site/rpg/index.html` (`/rpg/`) that is a compatibility alias rendering the same RPG page as `/` (same root canonical, no redirect). The RPG skin is styled by `site/rpg/rpg.css` (every rule scoped to `[data-skin="rpg"]`) and the decorative `site/rpg/cyberpunk-city.png`. A plain-link RPG/Clean switch in the header moves between `/` and `/clean/`; the chosen style is not persisted and nothing redirects based on it. The build fails if the RPG stylesheet or panorama is missing.

Client-side JavaScript adds search, category filters, screenshot galleries and an appearance selector. Project content, outgoing links and all earlier-work cards remain available without it.

New visitors start in dark mode; saved Light, Dark or System choices are respected. `site/browse.css` provides the compact sticky filter row, shorter uncropped project cards and the native search palette (search icon, Ctrl/Command-K or `/`). The five filters keep all six content sections: Independent covers Side projects, Open source, and Apps & hackathons. Project totals are announced to assistive technology without taking visible toolbar space.

RPG mode also loads `site/rpg/companion.js`, `companion.css` and the original pixel SVG sprite sheet `companions.svg`. A traveller and drone accompany the desktop chapter rail; smaller screens use a toolbar traveller. Six chapter objects and poses follow the visible content. The motion control pauses the decorative world and characters, native reduced-motion preferences take precedence, and open dialogs pause the background. These assets are not loaded in Clean mode.

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

Add an entry to `site/projects.json`, using an existing category ID. Use an empty `images` array for a labelled placeholder, or add reviewed local images with a caption and public source URL. Add links only where there is a usable public destination. Run `node scripts/build.mjs` and commit the content, media and generated HTML/llms.txt. GitHub Pages regenerates the directory before deployment.

If the project is hosted on GitHub Pages and should appear at `/project-slug/`, add a mapping to `PROJECTS` in `worker/src/index.ts`:

```ts
const PROJECTS: Record<string, string> = {
  "/project-slug": "/github-pages-repository",
};
```

Build that project's assets and internal links for `/project-slug/`. External project URLs can be linked directly without a Worker mapping. Update `site/llms.txt` and add relevant sitemaps to `site/robots.txt` when projects are listed.

import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const site = path.join(root, 'site');
const { groups, projects } = JSON.parse(await readFile(path.join(site, 'projects.json'), 'utf8'));
const revision = async file => createHash('sha256').update(await readFile(path.join(site, file))).digest('hex').slice(0, 12);
const scriptRevision = await revision('directory.js');
const styleRevision = await revision('directory.css');
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const ids = new Set();
for (const project of projects) {
  if (!/^[a-z0-9-]+$/.test(project.id) || ids.has(project.id)) throw new Error(`Invalid or duplicate id: ${project.id}`);
  ids.add(project.id);
  if (!groups.some(group => group.id === project.group)) throw new Error(`Unknown group: ${project.group}`);
  for (const link of [...project.links, ...(project.press || [])]) {
    if (new URL(link.url).protocol !== 'https:') throw new Error(`Expected HTTPS: ${link.url}`);
  }
  for (const image of project.images) {
    if (!image.src.startsWith('/media/') || image.src.includes('..')) throw new Error(`Invalid media path: ${image.src}`);
    await access(path.join(site, image.src));
  }
}

const external = (link, context) => `<a href="${escape(link.url)}" aria-label="${escape(`${link.label}: ${context}`)}">${escape(link.label)}<span aria-hidden="true"> ↗</span></a>`;
const card = project => {
  const hasImages = project.images.length > 0;
  const cover = hasImages
    ? `<div class="project-visual${project.images[0].portrait ? ' portrait' : ''}"><a class="project-cover" href="${escape(project.images[0].src)}" data-gallery="${project.id}" aria-label="View gallery: ${escape(project.name)}"><img src="${escape(project.images[0].src)}" alt="${escape(project.images[0].caption)}" width="1280" height="800" loading="lazy"><span class="cover-action">View gallery <span aria-hidden="true">↗</span><span class="cover-count">1 / ${project.images.length}</span></span></a>${project.images.length > 1 ? `<button class="cover-pause" type="button" data-cover-play="${project.id}" aria-label="Pause previews: ${escape(project.name)}" data-enhanced hidden>Pause</button>` : ''}</div>`
    : `<div class="project-cover placeholder" aria-label="${escape(project.name)}: preview coming soon"><span class="placeholder-label">// ${escape(project.kind)}</span><span class="monogram" aria-hidden="true">${escape(project.monogram)}</span><span class="placeholder-bottom">${escape(project.name)}<span>Preview coming soon</span></span></div>`;
  return `<article class="project-card" id="${project.id}" data-project data-group="${project.group}">
    ${cover}
    <div class="project-content">
      <p class="project-role">${escape(project.role)}</p>
      <h3>${escape(project.name)}</h3>
      <p class="project-description">${escape(project.description)}</p>
      <ul class="tags" aria-label="Project topics">${project.tags.map(tag => `<li>${escape(tag)}</li>`).join('')}</ul>
      ${project.links.length ? `<div class="project-links">${project.links.map(link => external(link, project.name)).join('')}</div>` : '<p class="unpublished">No public project link yet</p>'}
      ${project.press?.length ? `<p class="press"><span>Press</span> ${project.press.map(link => external(link, project.name)).join('')}</p>` : ''}
      ${project.note ? `<p class="project-note">${escape(project.note)}</p>` : ''}
    </div>
  </article>`;
};
const sections = groups.map((group, index) => {
  const entries = projects.filter(project => project.group === group.id);
  const content = `<div class="project-grid ${group.layout}">${entries.map(card).join('\n')}</div>`;
  return `<section class="project-section" id="${group.id}" data-section="${group.id}" aria-labelledby="${group.id}-heading">
    <div class="section-head"><div><p class="eyebrow">// ${String(index + 1).padStart(2, '0')}</p><h2 id="${group.id}-heading">${escape(group.label)}</h2><p>${escape(group.intro)}</p></div><span class="section-count" aria-label="${entries.length} projects">${String(entries.length).padStart(2, '0')}</span></div>
    ${group.collapsed ? `<details class="earlier-details"><summary>Explore ${entries.length} early projects <span aria-hidden="true">+</span></summary>${content}</details>` : content}
  </section>`;
}).join('\n');

const footerGroups = groups.filter(group => !group.collapsed).map(group => {
  const entries = projects.filter(project => project.group === group.id && project.links.length);
  return `<div class="footer-group"><h3>${escape(group.short)}</h3><ul>${entries.map(project => `<li><a href="${escape(project.links[0].url)}">${escape(project.name)}<span aria-hidden="true">↗</span></a></li>`).join('')}</ul></div>`;
}).join('');

const galleryData = Object.fromEntries(projects.filter(project => project.images.length).map(project => [project.id, { name: project.name, images: project.images }]));
const html = `<!doctype html>
<!-- Generated from site/projects.json by scripts/build.mjs. -->
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Projects by Xavier Loo</title>
<meta name="description" content="Companies I co-founded, products I built, and work I contributed to. Explore marketplaces, AI products, maps, open source, and experiments.">
<link rel="canonical" href="https://projects.xavierloo.com/">
<meta property="og:type" content="website"><meta property="og:title" content="Projects by Xavier Loo"><meta property="og:description" content="Products, contributions, and experiments by Xavier Loo."><meta property="og:url" content="https://projects.xavierloo.com/">
<meta name="theme-color" content="#f8f9fb" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#060610" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap">
<script>try { const t = localStorage.getItem('projects.theme'); if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; } catch {}</script>
<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/directory.css?v=${styleRevision}"><script src="/directory.js?v=${scriptRevision}" defer></script>
</head><body>
<a class="skip-link" href="#directory">Skip to projects</a>
<header class="masthead"><div class="wrap masthead-inner"><a class="brand" href="/">// projects</a><nav class="header-links" aria-label="Personal sites"><a href="https://xavierloo.com/">Portfolio <span aria-hidden="true">↗</span></a><a href="https://github.com/jvloo">GitHub <span aria-hidden="true">↗</span></a></nav></div></header>
<main class="wrap" id="directory">
  <div class="page-head"><p class="label">// a work in progress, always</p><h1 class="page-title">Things I've built<span class="accent">.</span></h1><p class="lede">Companies I co-founded, products I built, and work I contributed to.</p><p class="directory-note">From marketplaces and AI products to small tools made out of curiosity.</p></div>
  <div class="browse-tools" data-enhanced hidden>
    <div class="search-row"><label class="search-box"><svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span class="sr-only">Search projects</span><input id="project-search" type="search" placeholder="Search projects, topics, or technologies…" autocomplete="off" aria-describedby="result-count"><kbd aria-hidden="true">/</kbd></label><p id="result-count" role="status">${projects.length} projects</p></div>
    <nav class="category-nav" aria-label="Filter projects by category"><button type="button" data-filter="all" aria-pressed="true">All <span>${projects.length}</span></button>${groups.map(group => `<button type="button" data-filter="${group.id}" aria-pressed="false">${escape(group.short)} <span>${projects.filter(project => project.group === group.id).length}</span></button>`).join('')}</nav>
  </div>
  <div id="no-results" class="no-results" hidden><h2>No projects found.</h2><p>Try another name, topic, or technology.</p><button type="button" id="reset-search">Clear search and filters</button></div>
  ${sections}
</main>
<footer class="site-footer">
  <div class="wrap personal-footer"><div><p class="eyebrow">// elsewhere</p><h2>Find me around the web.</h2><nav class="personal-links" aria-label="Personal links"><a href="https://linkedin.com/in/xavier-loo">LinkedIn ↗</a><a href="https://github.com/jvloo">GitHub ↗</a><a href="https://x.com/J130V">X ↗</a><a href="mailto:ping@xavierloo.com">Email ↗</a></nav></div><label class="theme-picker" data-enhanced hidden>Appearance <select id="theme-control"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label></div>
  <div class="jumbo-footer"><div class="wrap"><div class="footer-title"><p class="eyebrow">// the directory</p><p>Keep exploring<span class="accent">.</span></p><a href="#directory">Back to top ↑</a></div><nav class="footer-columns" aria-label="Public projects">${footerGroups}</nav><div class="footer-bottom"><p>© 2026 Xavier Loo</p><a href="https://apps.xavierloo.com/">More small tools at // apps ↗</a><a href="https://xavierloo.com/">Main portfolio ↗</a></div></div></div>
</footer>
<dialog id="gallery" aria-labelledby="gallery-title"><div class="gallery-header"><div><p class="eyebrow">// project gallery</p><h2 id="gallery-title"></h2></div><button type="button" id="gallery-close" aria-label="Close gallery">Close <span aria-hidden="true">×</span></button></div><figure><div class="gallery-stage"><img id="gallery-image" alt=""></div><figcaption><p id="gallery-caption"></p><p class="gallery-source"><a id="gallery-source" href="/">View source ↗</a><a id="gallery-original" href="/" target="_blank" rel="noopener">Full-size image ↗</a><span id="map-attribution" hidden> · <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a><span id="map-tiles-attribution"> · <a href="https://openmaptiles.org/">OpenMapTiles</a></span></span></p></figcaption></figure><div class="gallery-toolbar"><button type="button" id="gallery-prev" aria-label="Previous screenshot">← Previous</button><div class="gallery-playback"><p id="gallery-position" role="status"></p><button type="button" id="gallery-play" aria-pressed="false">Pause slideshow</button></div><button type="button" id="gallery-next" aria-label="Next screenshot">Next →</button></div><div id="gallery-thumbs" class="gallery-thumbs" aria-label="Choose a screenshot"></div><p class="gallery-hint">Use ← → to browse · Esc to close</p></dialog>
<script id="gallery-data" type="application/json">${JSON.stringify(galleryData).replaceAll('<', '\\u003c')}</script>
</body></html>\n`;
await mkdir(site, { recursive: true });
await writeFile(path.join(site, 'index.html'), html.replace(/[ \t]+$/gm, ''));
const llms = `# Projects by Xavier Loo\n\n> Companies I co-founded, products I built, and work I contributed to.\n\n${groups.map(group => `## ${group.label}\n\n${projects.filter(project => project.group === group.id).map(project => `- [${project.name}](https://projects.xavierloo.com/#${project.id}): ${project.role}. ${project.description}`).join('\n')}`).join('\n\n')}\n\n## Related\n\n- [Main portfolio](https://xavierloo.com/)\n- [Apps](https://apps.xavierloo.com/)\n- [GitHub](https://github.com/jvloo)\n`;
await writeFile(path.join(site, 'llms.txt'), llms);
console.log(`Built ${projects.length} projects in ${groups.length} categories; ${Object.keys(galleryData).length} galleries.`);

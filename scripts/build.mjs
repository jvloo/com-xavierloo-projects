import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const site = path.join(root, 'site');
const { intro, featuredProject, groups, projects } = JSON.parse(await readFile(path.join(site, 'projects.json'), 'utf8'));
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
    ? `<div class="project-visual${project.images[0].portrait ? ' portrait' : ''}"${project.images.length > 1 ? ` data-cover-nav="${project.id}"` : ''}><a class="project-cover" href="${escape(project.images[0].src)}" data-gallery="${project.id}" aria-label="Open screenshot: ${escape(project.name)}"><img src="${escape(project.images[0].src)}" alt="${escape(project.images[0].caption)}" width="1280" height="800" loading="lazy"></a><div class="cover-toolbar">${project.images.length > 1 ? `<div class="cover-navigation" aria-label="Preview navigation: ${escape(project.name)}" data-enhanced hidden><button type="button" data-cover-prev aria-label="Previous preview: ${escape(project.name)}" disabled><span aria-hidden="true">←</span></button><button type="button" data-cover-next aria-label="Next preview: ${escape(project.name)}"><span aria-hidden="true">→</span></button></div>` : ''}<a class="cover-action" href="${escape(project.images[0].src)}" data-gallery="${project.id}" aria-label="View gallery: ${escape(project.name)}">View gallery <span aria-hidden="true">↗</span><span class="cover-count">1 / ${project.images.length}</span></a></div></div>`
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

await access(path.join(site, intro.portrait));
const introCard = `<section class="intro-card" aria-labelledby="intro-title"><img src="${escape(intro.portrait)}" alt="Portrait of ${escape(intro.name)}" width="400" height="400"><div class="intro-copy"><p class="intro-eyebrow">The person behind the projects</p><h1 id="intro-title">${escape(intro.name)}</h1><p class="intro-headline">${escape(intro.headline)}</p></div><a href="${escape(intro.url)}" class="intro-link">LinkedIn <span aria-hidden="true">↗</span></a></section>`;
const featured = projects.find(project => project.id === featuredProject);
if (!featured?.images.length || !featured.links.length) throw new Error('Featured project needs a cover and a public link.');
const featuredHero = `<section class="featured-hero" aria-labelledby="featured-title">
  <div class="featured-copy"><p class="featured-eyebrow"><span aria-hidden="true"></span> Featured · Latest project</p><h2 id="featured-title" class="featured-title">${escape(featured.name.split(' ')[0])} <span>${escape(featured.name.split(' ').slice(1).join(' '))}<span class="featured-period">.</span></span></h2><p class="featured-description">${escape(featured.featuredSummary || featured.description)}</p><p class="featured-meta">${escape(featured.role)} <span aria-hidden="true">·</span> ${escape(featured.kind)}</p><div class="featured-actions"><a class="featured-primary" href="${escape(featured.links[0].url)}">${escape(featured.links[0].label)} <span aria-hidden="true">↗</span></a><a class="featured-secondary" href="${escape(featured.images[0].src)}" data-gallery="${featured.id}" data-gallery-index="0" aria-label="View featured gallery: ${escape(featured.name)}">View gallery <span aria-hidden="true">↗</span></a></div><a class="featured-browse" href="#all-projects">Browse all projects <span aria-hidden="true">↓</span></a></div>
  <figure class="featured-preview"><div class="featured-window"><div class="featured-window-bar"><span class="window-lights" aria-hidden="true"><i></i><i></i><i></i></span><span>${escape(new URL(featured.links[0].url).host)}</span><span class="featured-preview-label">Map preview</span></div><a href="${escape(featured.images[0].src)}" data-gallery="${featured.id}" data-gallery-index="0" aria-label="Open featured screenshot: ${escape(featured.name)}"><img src="${escape(featured.images[0].src)}" alt="${escape(featured.images[0].caption)}" width="1280" height="800" fetchpriority="high"></a></div><figcaption>Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> · <a href="https://openmaptiles.org/">OpenMapTiles</a></figcaption></figure>
</section>`;

const galleryData = Object.fromEntries(projects.filter(project => project.images.length).map(project => [project.id, { name: project.name, images: project.images }]));
const html = `<!doctype html>
<!-- Generated from site/projects.json by scripts/build.mjs. -->
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Projects by Xavier Loo</title>
<meta name="description" content="Companies I co-founded, products I built, and work I contributed to. Explore marketplaces, AI products, maps, open source, and experiments.">
<link rel="canonical" href="https://projects.xavierloo.com/">
<meta property="og:type" content="website"><meta property="og:title" content="Projects by Xavier Loo"><meta property="og:description" content="Products, contributions, and experiments by Xavier Loo."><meta property="og:url" content="https://projects.xavierloo.com/">
<meta property="og:image" content="https://projects.xavierloo.com${escape(featured.images[0].src)}"><meta property="og:image:alt" content="${escape(featured.name)} map preview"><meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#f8f9fb" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#060610" media="(prefers-color-scheme: dark)">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap">
<script>try { const t = localStorage.getItem('projects.theme'); if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; } catch {}</script>
<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/directory.css?v=${styleRevision}"><script src="/directory.js?v=${scriptRevision}" defer></script>
</head><body>
<a class="skip-link" href="#all-projects">Skip to projects</a>
<header class="masthead"><div class="wrap masthead-inner"><a class="brand" href="/">// projects</a><nav class="header-links" aria-label="Personal sites"><a href="https://xavierloo.com/">Portfolio <span aria-hidden="true">↗</span></a><a href="https://github.com/jvloo">GitHub <span aria-hidden="true">↗</span></a></nav></div></header>
<main class="wrap" id="directory">
  ${introCard}
  ${featuredHero}
  <div class="page-head" id="all-projects" tabindex="-1"><p class="label">// the directory</p><h2 class="page-title">Things I've built<span class="accent">.</span></h2><p class="lede">Companies I co-founded, products I built, and work I contributed to.</p></div>
  <div class="browse-tools" data-enhanced hidden>
    <div class="search-row"><label class="search-box"><svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><span class="sr-only">Search projects</span><input id="project-search" type="search" placeholder="Search projects, topics, or technologies…" autocomplete="off" aria-describedby="result-count"><kbd aria-hidden="true">/</kbd></label><div class="result-summary"><p id="result-count" role="status">${projects.length} projects</p><button type="button" id="clear-filters" hidden>Reset filters</button></div></div>
    <nav class="category-nav" aria-label="Filter projects by category"><button type="button" data-filter="all" aria-pressed="true">All <span>${projects.length}</span></button>${groups.map(group => `<button type="button" data-filter="${group.id}" aria-pressed="false">${escape(group.short)} <span>${projects.filter(project => project.group === group.id).length}</span></button>`).join('')}</nav>
  </div>
  <div id="no-results" class="no-results" hidden><h2>No projects found.</h2><p>Try another name, topic, or technology.</p><button type="button" id="reset-search">Clear search and filters</button></div>
  ${sections}
</main>
<footer class="site-footer">
  <div class="wrap personal-footer"><div><p class="eyebrow">// elsewhere</p><h2>Find me around the web.</h2><nav class="personal-links" aria-label="Personal links"><a href="https://linkedin.com/in/xavier-loo">LinkedIn ↗</a><a href="https://github.com/jvloo">GitHub ↗</a><a href="https://x.com/J130V">X ↗</a><a href="mailto:ping@xavierloo.com">Email ↗</a></nav></div><label class="theme-picker" data-enhanced hidden>Appearance <select id="theme-control"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label></div>
  <div class="jumbo-footer"><div class="wrap"><div class="footer-title"><p class="eyebrow">// the directory</p><p>Keep exploring<span class="accent">.</span></p><a href="#directory">Back to top ↑</a></div><nav class="footer-columns" aria-label="Public projects">${footerGroups}</nav><div class="footer-bottom"><p>© 2026 Xavier Loo</p><a href="https://apps.xavierloo.com/">More small tools at // apps ↗</a><a href="https://xavierloo.com/">Main portfolio ↗</a></div></div></div>
</footer>
<dialog id="gallery" aria-labelledby="gallery-title"><div class="gallery-header"><div><p class="eyebrow">// project gallery</p><h2 id="gallery-title"></h2></div><button type="button" id="gallery-close" aria-label="Close gallery">Close <span aria-hidden="true">×</span></button></div><figure><p id="gallery-scroll-hint" class="gallery-scroll-hint" hidden>Scroll to explore the full screen ↓</p><div class="gallery-stage" tabindex="0" aria-label="Project screenshot"><img id="gallery-image" alt=""></div><figcaption><p id="gallery-caption"></p><p class="gallery-source"><a id="gallery-source" href="/">View source ↗</a><a id="gallery-original" href="/" target="_blank" rel="noopener">Full-size image ↗</a><span id="map-attribution" hidden> · <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a><span id="map-tiles-attribution"> · <a href="https://openmaptiles.org/">OpenMapTiles</a></span></span></p></figcaption></figure><div class="gallery-toolbar"><button type="button" id="gallery-prev" aria-label="Previous screenshot">← Previous</button><p id="gallery-position" role="status"></p><button type="button" id="gallery-next" aria-label="Next screenshot">Next →</button></div><div id="gallery-thumbs" class="gallery-thumbs" aria-label="Choose a screenshot"></div><p class="gallery-hint">Use ← → to browse · Esc to close</p></dialog>
<script id="gallery-data" type="application/json">${JSON.stringify(galleryData).replaceAll('<', '\\u003c')}</script>
</body></html>\n`;
await mkdir(site, { recursive: true });
await writeFile(path.join(site, 'index.html'), html.replace(/[ \t]+$/gm, ''));
const llms = `# Projects by Xavier Loo\n\n> Companies I co-founded, products I built, and work I contributed to.\n\n${groups.map(group => `## ${group.label}\n\n${projects.filter(project => project.group === group.id).map(project => `- [${project.name}](https://projects.xavierloo.com/#${project.id}): ${project.role}. ${project.description}`).join('\n')}`).join('\n\n')}\n\n## Related\n\n- [Main portfolio](https://xavierloo.com/)\n- [Apps](https://apps.xavierloo.com/)\n- [GitHub](https://github.com/jvloo)\n`;
await writeFile(path.join(site, 'llms.txt'), llms);
console.log(`Built ${projects.length} projects in ${groups.length} categories; ${Object.keys(galleryData).length} galleries.`);

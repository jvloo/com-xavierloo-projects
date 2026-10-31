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
// The RPG skin is a second output of the same data; fail loudly if its assets are missing.
const rpgStylesheet = 'rpg/rpg.css';
const rpgBanner = 'rpg/cyberpunk-city.png';
for (const file of [rpgStylesheet, rpgBanner, 'rpg/city-block.svg', 'rpg/companion.js', 'rpg/companion.css', 'rpg/companions.svg']) {
  await access(path.join(site, file)).catch(() => { throw new Error(`Missing required RPG asset: site/${file}`); });
}
const rpgStyleRevision = await revision(rpgStylesheet);
// browse.css loads last so its compact toolbar/card/search rules win over directory.css and rpg.css.
const browseRevision = await revision('browse.css');
const companionScriptRevision = await revision('rpg/companion.js');
const companionStyleRevision = await revision('rpg/companion.css');
const companionSpriteRevision = await revision('rpg/companions.svg');
// Skin-specific strings only; names, order, counts and project content are shared.
const copy = {
  clean: {
    title: 'Projects by Xavier Loo · Clean style',
    chapter: number => `// ${String(number).padStart(2, '0')}`,
    directory: '// the directory',
    introEyebrow: 'The person behind the projects',
    featuredEyebrow: 'Featured · Latest project',
    elsewhere: '// elsewhere',
    gallery: '// project gallery',
    origin: ''
  },
  rpg: {
    title: 'Projects by Xavier Loo',
    chapter: number => `Chapter ${String(number).padStart(2, '0')}`,
    directory: 'Project directory',
    introEyebrow: '',
    featuredEyebrow: 'Latest project',
    waypoints: true,
    elsewhere: 'Elsewhere',
    gallery: 'Project gallery',
    origin: '',
    linkInCopy: true
  }
};
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const ids = new Set();
for (const project of projects) {
  if (!/^[a-z0-9-]+$/.test(project.id) || ids.has(project.id)) throw new Error(`Invalid or duplicate id: ${project.id}`);
  ids.add(project.id);
  if (!groups.some(group => group.id === project.group)) throw new Error(`Unknown group: ${project.group}`);
  for (const link of [...project.links, ...(project.press || [])]) {
    if (new URL(link.url).protocol !== 'https:') throw new Error(`Expected HTTPS: ${link.url}`);
  }
  for (const image of [...project.images.flatMap(image => [image, ...(image.mobile ? [image.mobile] : [])]), ...(project.cover ? [project.cover] : [])]) {
    if (!image.src.startsWith('/media/') || image.src.includes('..')) throw new Error(`Invalid media path: ${image.src}`);
    await access(path.join(site, image.src));
  }
}

// Cards show project.summary when supplied, else the first complete sentence of the description (full text stays in data-search and JSON).
const abbreviation = /(?:\b(?:e\.g|i\.e|vs|etc|inc|ltd|co|dr|mr|mrs|ms|st|no)|\b[A-Z])\.$/i;
const firstSentence = text => {
  const pattern = /[.!?](?=\s|$)/g;
  let match;
  while ((match = pattern.exec(text))) {
    const sentence = text.slice(0, match.index + 1);
    if (!abbreviation.test(sentence)) return sentence;
  }
  return text;
};
// Browse tabs; "independent" groups several content sections without changing them.
const browseTabs = [
  { id: 'built', label: 'Built', groups: ['built'] },
  { id: 'contributions', label: 'Contributions', groups: ['contributions'] },
  { id: 'independent', label: 'Independent', groups: ['side', 'opensource', 'experiments'] },
  { id: 'earlier', label: 'Earlier', groups: ['earlier'] }
];
for (const group of browseTabs.flatMap(tab => tab.groups)) {
  if (!groups.some(entry => entry.id === group)) throw new Error(`Browse tab references unknown group: ${group}`);
}
if (browseTabs.flatMap(tab => tab.groups).length !== groups.length) throw new Error('Browse tabs must cover every content group exactly once.');
const external = (link, context) => `<a href="${escape(link.url)}" aria-label="${escape(`${link.label}: ${context}`)}">${escape(link.label)}<span aria-hidden="true"> ↗</span></a>`;
const card = project => {
  const hasImages = project.images.length > 0;
  const coverImage = project.cover || project.images[0];
  const cover = hasImages
    ? `<div class="project-visual${coverImage.portrait ? ' portrait' : ''}"><a class="project-cover" href="${escape(coverImage.src)}" data-gallery="${project.id}" aria-label="Open screenshot: ${escape(project.name)}"><img src="${escape(coverImage.src)}" alt="${escape(coverImage.caption)}" width="1280" height="800" loading="lazy"></a><a class="cover-action" href="${escape(project.images[0].src)}" data-gallery="${project.id}" aria-label="View gallery: ${escape(project.name)}">${project.images.length > 1 ? 'View screens' : 'View screen'} <span aria-hidden="true">↗</span></a></div>`
    : `<div class="project-cover placeholder" aria-label="${escape(project.name)}: preview coming soon"><span class="placeholder-label">// ${escape(project.kind)}</span><span class="monogram" aria-hidden="true">${escape(project.monogram)}</span><span class="placeholder-bottom">${escape(project.name)}<span>Preview coming soon</span></span></div>`;
  return `<article class="project-card" id="${project.id}" data-project data-group="${project.group}" data-search="${escape([project.name, project.role, project.kind, project.description, ...project.tags].filter(Boolean).join(' '))}">
    ${cover}
    <div class="project-content">
      <p class="project-role">${escape(project.role)}</p>
      <h3>${escape(project.name)}</h3>
      <p class="project-description">${escape(project.summary || firstSentence(project.description))}</p>
      <ul class="tags" aria-label="Project topics">${project.tags.map(tag => `<li>${escape(tag)}</li>`).join('')}</ul>
      ${project.links.length ? `<div class="project-links">${project.links.map(link => external(link, project.name)).join('')}</div>` : `<p class="unpublished">${escape(project.linkNote || 'No public project link yet')}</p>`}
      ${project.press?.length ? `<p class="press"><span>Press</span> ${project.press.map(link => external(link, project.name)).join('')}</p>` : ''}
      ${project.note ? `<p class="project-note">${escape(project.note)}</p>` : ''}
    </div>
  </article>`;
};
const renderSections = t => groups.map((group, index) => {
  const entries = projects.filter(project => project.group === group.id);
  const content = `<div class="project-grid ${group.layout}">${entries.map(card).join('\n')}</div>`;
  return `<section class="project-section" id="${group.id}" data-section="${group.id}" aria-labelledby="${group.id}-heading">
    ${t.waypoints ? '<span class="rpg-waypoint" aria-hidden="true"></span>\n    ' : ''}<div class="section-head"><div><p class="eyebrow">${t.chapter(index + 1)}</p><h2 id="${group.id}-heading">${escape(group.label)}</h2><p>${escape(group.intro)}</p></div><span class="section-count sr-only" aria-label="${entries.length} projects">${String(entries.length).padStart(2, '0')}</span></div>
    ${content}
  </section>`;
}).join('\n');

const footerGroups = groups.filter(group => projects.some(project => project.group === group.id && project.links.length)).map(group => {
  const entries = projects.filter(project => project.group === group.id && project.links.length);
  return `<div class="footer-group"><h3>${escape(group.short)}</h3><ul>${entries.map(project => `<li><a href="${escape(project.links[0].url)}">${escape(project.name)}<span aria-hidden="true">↗</span></a></li>`).join('')}</ul></div>`;
}).join('');

await access(path.join(site, intro.portrait));
const renderIntro = t => {
  const link = `<a href="${escape(intro.url)}" class="intro-link">LinkedIn <span aria-hidden="true">↗</span></a>`;
  return `<section class="intro-card" aria-labelledby="intro-title"><img src="${escape(intro.portrait)}" alt="Portrait of ${escape(intro.name)}" width="400" height="400"><div class="intro-copy">${t.introEyebrow ? `<p class="intro-eyebrow">${t.introEyebrow}</p>` : ''}<h1 id="intro-title">${escape(intro.name)}</h1><p class="intro-headline">${escape(intro.headline)}</p>${t.origin ? `<p class="intro-origin">${escape(t.origin)}</p>` : ''}${t.linkInCopy ? link : ''}</div>${t.linkInCopy ? '' : link}</section>`;
};
const featured = projects.find(project => project.id === featuredProject);
if (!featured?.images.length || !featured.links.length) throw new Error('Featured project needs a cover and a public link.');
const featuredMobile = featured.images[0].mobile;
const renderFeatured = t => `<section class="featured-hero" aria-labelledby="featured-title">
  <div class="featured-copy"><p class="featured-eyebrow"><span aria-hidden="true"></span> ${t.featuredEyebrow}</p><h2 id="featured-title" class="featured-title">${escape(featured.name.split(' ')[0])} <span>${escape(featured.name.split(' ').slice(1).join(' '))}<span class="featured-period">.</span></span></h2><p class="featured-description">${escape(featured.featuredSummary || featured.description)}</p><p class="featured-meta">${escape(featured.role)} <span aria-hidden="true">·</span> ${escape(featured.kind)}</p><div class="featured-actions"><a class="featured-primary" href="${escape(featured.links[0].url)}">${escape(featured.links[0].label)} <span aria-hidden="true">↗</span></a><a class="featured-secondary" href="${escape(featured.images[0].src)}" data-gallery="${featured.id}" data-gallery-index="0" aria-label="View featured gallery: ${escape(featured.name)}">View gallery <span aria-hidden="true">↗</span></a></div><a class="featured-browse" href="#all-projects">Browse all projects <span aria-hidden="true">↓</span></a></div>
  <figure class="featured-preview"><div class="featured-devices"><div class="featured-window"><div class="featured-window-bar"><span class="window-lights" aria-hidden="true"><i></i><i></i><i></i></span><span>${escape(new URL(featured.links[0].url).host)}</span><span class="featured-preview-label">Desktop</span></div><a href="${escape(featured.images[0].src)}" data-gallery="${featured.id}" data-gallery-index="0" aria-label="Open featured screenshot: ${escape(featured.name)}"><img src="${escape(featured.images[0].src)}" alt="${escape(featured.images[0].caption)}" width="1440" height="900" fetchpriority="high"></a></div>${featuredMobile ? `<a class="featured-phone" href="${escape(featuredMobile.src)}" data-gallery="${featured.id}" data-gallery-index="0" aria-label="Open featured mobile preview: ${escape(featured.name)}"><img src="${escape(featuredMobile.src)}" alt="${escape(featuredMobile.caption)}" width="390" height="844" fetchpriority="high"></a>` : ''}</div><figcaption>Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> · <a href="https://openmaptiles.org/">OpenMapTiles</a></figcaption></figure>
</section>`;

const galleryData = Object.fromEntries(projects.filter(project => project.images.length).map(project => [project.id, { name: project.name, images: project.images, ...(project.galleryLayout ? { layout: project.galleryLayout } : {}) }]));
const renderPage = skin => {
const rpg = skin === 'rpg';
const t = copy[skin];
return `<!doctype html>
<!-- Generated from site/projects.json by scripts/build.mjs. -->
<html lang="en" data-theme="dark"${rpg ? ' data-skin="rpg"' : ''}><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${t.title}</title>
<meta name="description" content="Companies I co-founded, products I built, and work I contributed to. Explore marketplaces, AI products, maps, open source, and experiments.">
<link rel="canonical" href="https://projects.xavierloo.com/">
<meta property="og:type" content="website"><meta property="og:title" content="${t.title}"><meta property="og:description" content="Products, contributions, and experiments by Xavier Loo."><meta property="og:url" content="https://projects.xavierloo.com/">
<meta property="og:image" content="https://projects.xavierloo.com${escape(featured.images[0].src)}"><meta property="og:image:alt" content="${escape(featured.name)} map preview"><meta name="twitter:card" content="summary_large_image">
<meta id="theme-color" name="theme-color" content="${rpg ? '#080c1c' : '#060610'}" data-light="${rpg ? '#eef5fb' : '#f8f9fb'}" data-dark="${rpg ? '#080c1c' : '#060610'}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap">${rpg ? '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@500;700&display=swap">' : ''}
<script>try { const t = localStorage.getItem('projects.theme'); if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t; else if (t === 'system') delete document.documentElement.dataset.theme; } catch {} { const m = document.querySelector('#theme-color'); const t = document.documentElement.dataset.theme; m.content = m.dataset[t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light']; }</script>
<link rel="stylesheet" href="/styles.css"><link rel="stylesheet" href="/directory.css?v=${styleRevision}">${rpg ? `<link rel="stylesheet" href="/rpg/rpg.css?v=${rpgStyleRevision}">` : ''}<link rel="stylesheet" href="/browse.css?v=${browseRevision}">${rpg ? `<link rel="stylesheet" href="/rpg/companion.css?v=${companionStyleRevision}">` : ''}<script src="/directory.js?v=${scriptRevision}" defer></script>${rpg ? `<script src="/rpg/companion.js?v=${companionScriptRevision}" data-sprite="/rpg/companions.svg?v=${companionSpriteRevision}" defer></script>` : ''}
</head><body>
<a class="skip-link" href="#all-projects">Skip to projects</a>
<header class="masthead"><div class="wrap masthead-inner"><a class="brand" href="${rpg ? '/' : '/clean/'}">// projects</a><div class="masthead-actions"><nav class="style-switch" aria-label="Page style"><a href="/"${rpg ? ' aria-current="page"' : ''}>RPG</a><a href="/clean/"${rpg ? '' : ' aria-current="page"'}>Clean</a></nav><nav class="header-links" aria-label="Personal sites"><a href="https://xavierloo.com/">Portfolio <span aria-hidden="true">↗</span></a><a href="https://github.com/jvloo">GitHub <span aria-hidden="true">↗</span></a></nav></div></div></header>
<main class="wrap" id="directory">
  ${rpg ? `<div class="rpg-opening"><div class="rpg-world" aria-hidden="true"><span class="rpg-scenery"></span><span class="rpg-veil"></span><span class="rpg-stars"></span><span class="rpg-mote m1"></span><span class="rpg-mote m2"></span><span class="rpg-mote m3"></span><span class="rpg-mote m4"></span><span class="rpg-towers left"><i class="tower"></i><i class="tower"></i><i class="tower"></i></span><span class="rpg-towers right"><i class="tower"></i><i class="tower"></i><i class="tower"></i></span></div>
  ${renderIntro(t)}
  ${renderFeatured(t)}</div>` : `${renderIntro(t)}
  ${renderFeatured(t)}`}
  <div class="page-head" id="all-projects" tabindex="-1"><p class="label">${t.directory}</p><h2 class="page-title">Things I've built<span class="accent">.</span></h2><p class="lede">Companies I co-founded, products I built, and work I contributed to.</p></div>
  <p id="result-count" class="sr-only" role="status">${projects.length} projects</p>
  <div id="browse-sentinel" class="browse-sentinel" aria-hidden="true"></div>
  <div class="browse-tools" data-enhanced hidden>
    <div class="browse-bar"><nav class="category-nav" aria-label="Filter projects by category"><button type="button" data-filter="all" aria-pressed="true">All</button>${browseTabs.map(tab => `<button type="button" data-filter="${tab.id}" data-groups="${tab.groups.join(' ')}" aria-pressed="false">${escape(tab.label)}</button>`).join('')}</nav><button type="button" id="search-open" class="search-trigger" aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K /" aria-label="Search projects" title="Search projects (Ctrl+K or /)"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg></button></div>
  </div>
  <div id="no-results" class="no-results" hidden><h2>No projects found.</h2><p>Try another category.</p><button type="button" id="reset-search">Show all projects</button></div>
  ${renderSections(t)}
</main>
<footer class="site-footer">
  <div class="wrap personal-footer"><div><p class="eyebrow">${t.elsewhere}</p><h2>Find me around the web.</h2><nav class="personal-links" aria-label="Personal links"><a href="https://linkedin.com/in/xavier-loo">LinkedIn ↗</a><a href="https://github.com/jvloo">GitHub ↗</a><a href="https://x.com/J130V">X ↗</a><a href="mailto:ping@xavierloo.com">Email ↗</a></nav></div><label class="theme-picker" data-enhanced hidden>Appearance <select id="theme-control"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label></div>
  <div class="jumbo-footer"><div class="wrap"><div class="footer-title"><p class="eyebrow">${t.directory}</p><p>Keep exploring<span class="accent">.</span></p><a href="#directory">Back to top ↑</a></div><nav class="footer-columns" aria-label="Public projects">${footerGroups}</nav><div class="footer-bottom"><p>© 2026 Xavier Loo</p><a href="https://apps.xavierloo.com/">More small tools at // apps ↗</a><a href="https://xavierloo.com/">Main portfolio ↗</a></div></div></div>
</footer>
<dialog id="search-dialog" class="search-dialog" aria-labelledby="search-label"><div class="search-panel"><div class="search-field"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg><label id="search-label" for="project-search" class="sr-only">Search projects by name, role, topic or technology</label><input id="project-search" type="search" role="combobox" aria-expanded="true" aria-controls="search-results" aria-autocomplete="list" placeholder="Search projects, roles, topics…" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="button" id="search-close" class="search-close">Close <kbd aria-hidden="true">Esc</kbd></button></div><ul id="search-results" class="search-results" role="listbox" aria-label="Matching projects"></ul><p id="search-empty" class="search-empty" hidden>No projects match that search.</p><p id="search-status" class="sr-only" role="status"></p><p class="search-hint" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>Enter</kbd> go to project</span><span><kbd>Esc</kbd> close</span></p></div></dialog>
<dialog id="gallery" aria-labelledby="gallery-title"><div class="gallery-header"><div><p class="eyebrow">${t.gallery}</p><h2 id="gallery-title"></h2></div><button type="button" id="gallery-close" aria-label="Close gallery">Close <span aria-hidden="true">×</span></button></div><figure><p id="gallery-scroll-hint" class="gallery-scroll-hint" hidden>Scroll to explore the full screen ↓</p><div class="gallery-stage" tabindex="0" role="group" aria-label="Project screenshot"><img id="gallery-image" alt=""><div id="gallery-paired" class="gallery-paired" hidden><div class="gallery-desktop-screen"><div class="gallery-device-label">Desktop</div><img id="gallery-desktop-image" alt=""></div><div class="gallery-phone-screen"><img id="gallery-mobile-image" alt=""></div></div><div id="gallery-mobile-grid" class="gallery-mobile-grid" hidden></div></div><figcaption><p id="gallery-caption"></p><p class="gallery-source"><a id="gallery-source" href="/">View source ↗</a><a id="gallery-original" href="/" target="_blank" rel="noopener">Full-size image ↗</a><a id="gallery-mobile-original" href="/" target="_blank" rel="noopener" hidden>Full-size mobile ↗</a><span id="map-attribution" hidden> · <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a><span id="map-tiles-attribution"> · <a href="https://openmaptiles.org/">OpenMapTiles</a></span></span></p></figcaption></figure><div class="gallery-toolbar"><button type="button" id="gallery-prev" aria-label="Previous screenshot">← Previous</button><p id="gallery-position" role="status"></p><button type="button" id="gallery-next" aria-label="Next screenshot">Next →</button></div><div id="gallery-thumbs" class="gallery-thumbs" aria-label="Choose a screenshot"></div><p class="gallery-hint">Use ← → to browse · Esc to close</p></dialog>
<script id="gallery-data" type="application/json">${JSON.stringify(galleryData).replaceAll('<', '\\u003c')}</script>
</body></html>\n`.replace(/[ \t]+$/gm, '');
};
await mkdir(path.join(site, 'rpg'), { recursive: true });
await mkdir(path.join(site, 'clean'), { recursive: true });
const rpgPage = renderPage('rpg');
await writeFile(path.join(site, 'index.html'), rpgPage);
// Legacy alias: same RPG content and root canonical, no redirect.
await writeFile(path.join(site, 'rpg', 'index.html'), rpgPage);
await writeFile(path.join(site, 'clean', 'index.html'), renderPage('clean'));
const llms = `# Projects by Xavier Loo\n\n> Companies I co-founded, products I built, and work I contributed to.\n\n${groups.map(group => `## ${group.label}\n\n${projects.filter(project => project.group === group.id).map(project => `- [${project.name}](https://projects.xavierloo.com/#${project.id}): ${project.role}. ${project.description}`).join('\n')}`).join('\n\n')}\n\n## Related\n\n- [Main portfolio](https://xavierloo.com/)\n- [Apps](https://apps.xavierloo.com/)\n- [GitHub](https://github.com/jvloo)\n`;
await writeFile(path.join(site, 'llms.txt'), llms);
console.log(`Built ${projects.length} projects in ${groups.length} categories; ${Object.keys(galleryData).length} galleries.`);

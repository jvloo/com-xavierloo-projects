const search = document.querySelector('#project-search');
const cards = [...document.querySelectorAll('[data-project]')];
const sections = [...document.querySelectorAll('[data-section]')];
const filters = [...document.querySelectorAll('[data-filter]')];
const result = document.querySelector('#result-count');
const categoryNav = document.querySelector('.category-nav');
const toolbar = document.querySelector('.browse-tools');
const sentinel = document.querySelector('#browse-sentinel');
let category = 'all';

// Equal-height cards: JS marks each card enhanced (fixed height via browse.css) and adds a real View more/less button.
// The full original description lives in .project-full; both blocks are toggled with hidden.
const cardToggles = cards.map(card => {
  const body = card.querySelector('.project-body');
  const content = card.querySelector('.project-content');
  if (!body || !content) return null;
  const full = body.querySelector('.project-full');
  const summary = body.querySelector('.project-summary');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'card-toggle';
  button.setAttribute('aria-controls', body.id);
  button.setAttribute('aria-expanded', 'false');
  button.textContent = 'View more';
  card.classList.add('is-enhanced');
  if (full) full.hidden = true;
  content.append(button);
  const set = expanded => {
    card.classList.toggle('is-expanded', expanded);
    button.setAttribute('aria-expanded', String(expanded));
    button.textContent = expanded ? 'View less' : 'View more';
    if (full) { full.hidden = !expanded; summary.hidden = expanded; }
    if (expanded) { body.tabIndex = 0; body.setAttribute('role', 'region'); body.setAttribute('aria-label', `${card.querySelector('h3').textContent} details`); }
    else { body.removeAttribute('tabindex'); body.removeAttribute('role'); body.removeAttribute('aria-label'); }
    body.scrollTop = 0;
    measure();
  };
  const measure = () => {
    if (card.hidden || card.offsetParent === null) return;
    if (!full && !card.classList.contains('is-expanded')) button.hidden = body.scrollHeight <= body.clientHeight + 1;
    else button.hidden = false;
  };
  button.addEventListener('click', () => set(!card.classList.contains('is-expanded')));
  button.hidden = !full;
  return measure;
});
const measureCards = () => cardToggles.forEach(measure => measure?.());
measureCards();
window.addEventListener('resize', measureCards);
document.addEventListener('directory:updated', measureCards);
document.fonts?.ready.then(measureCards);

// Each tab maps to a set of content groups (data-groups); "all" has none and shows everything.
const categoryGroups = new Map(filters.map(button => [button.dataset.filter, button.dataset.groups ? new Set(button.dataset.groups.split(' ')) : null]));

function updateDirectory() {
  const groups = categoryGroups.get(category) || null;
  let visible = 0;
  for (const card of cards) {
    const matches = !groups || groups.has(card.dataset.group);
    card.hidden = !matches;
    visible += Number(matches);
  }
  for (const section of sections) {
    const matches = [...section.querySelectorAll('[data-project]')].filter(card => !card.hidden).length;
    section.hidden = matches === 0;
    section.querySelector('.section-count').textContent = String(matches).padStart(2, '0');
    section.querySelector('.section-count').setAttribute('aria-label', `${matches} projects`);
  }
  document.querySelector('#no-results').hidden = visible !== 0;
  result.textContent = category !== 'all' ? `${visible} of ${cards.length} projects` : `${cards.length} projects`;
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  // Integration contract: fired after section hidden states are final.
  document.dispatchEvent(new CustomEvent('directory:updated', { detail: { category, visible, total: cards.length } }));
}

// Keep the active tab in view by scrolling the nav itself, never the page.
function revealFilter(button) {
  if (!button || categoryNav.scrollWidth <= categoryNav.clientWidth) return;
  const left = button.offsetLeft - categoryNav.offsetLeft;
  categoryNav.scrollLeft = Math.max(0, left - (categoryNav.clientWidth - button.offsetWidth) / 2);
}

// If the condensed toolbar is stuck, return to the top of the directory so a shorter list never strands the reader.
function keepDirectoryInView() {
  const top = sentinel.getBoundingClientRect().top + window.scrollY;
  if (window.scrollY > top) window.scrollTo(0, top);
}

filters.forEach(button => button.addEventListener('click', () => {
  category = button.dataset.filter;
  updateDirectory();
  revealFilter(button);
  keepDirectoryInView();
}));
function resetDirectory() { category = 'all'; updateDirectory(); revealFilter(filters[0]); keepDirectoryInView(); filters[0]?.focus({ preventScroll: true }); }
document.querySelector('#reset-search').addEventListener('click', resetDirectory);

// Sticky toolbar condenses once the sentinel above it has scrolled out of view.
if (sentinel && toolbar && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => toolbar.classList.toggle('is-condensed', !entry.isIntersecting && entry.boundingClientRect.top < 0)).observe(sentinel);
}

// Command palette: searches every card's full original text (card.dataset.search), independent of the directory filter.
const searchDialog = document.querySelector('#search-dialog');
const searchOpen = document.querySelector('#search-open');
const searchResults = document.querySelector('#search-results');
const searchEmpty = document.querySelector('#search-empty');
const searchStatus = document.querySelector('#search-status');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const entries = cards.map(card => ({
  card,
  text: (card.dataset.search || card.textContent).toLocaleLowerCase(),
  name: card.querySelector('h3').textContent,
  role: card.querySelector('.project-role')?.textContent || '',
  section: card.closest('[data-section]')?.querySelector('h2')?.textContent || ''
}));
let matches = [];
let activeIndex = 0;
let searchReturn;
let skipRestore = false;

function setActive(index, scroll = true) {
  if (!matches.length) return;
  activeIndex = (index + matches.length) % matches.length;
  [...searchResults.children].forEach((item, i) => {
    item.setAttribute('aria-selected', String(i === activeIndex));
    if (i === activeIndex) {
      search.setAttribute('aria-activedescendant', item.id);
      if (scroll) {
        if (item.offsetTop < searchResults.scrollTop) searchResults.scrollTop = item.offsetTop;
        else if (item.offsetTop + item.offsetHeight > searchResults.scrollTop + searchResults.clientHeight) searchResults.scrollTop = item.offsetTop + item.offsetHeight - searchResults.clientHeight;
      }
    }
  });
}

function renderResults() {
  const words = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const short = words.join('').length < 2;
  const query = words.join(' ');
  matches = entries.filter(entry => short || words.every(word => entry.text.includes(word)));
  if (!short) matches = matches.map((entry, i) => ({ entry, i, rank: entry.name.toLocaleLowerCase().includes(query) ? 0 : 1 })).sort((a, b) => a.rank - b.rank || a.i - b.i).map(item => item.entry);
  searchResults.replaceChildren(...matches.map((entry, i) => {
    const item = document.createElement('li');
    item.id = `search-option-${entry.card.id}`;
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', 'false');
    item.dataset.index = String(i);
    const name = document.createElement('span');
    name.className = 'search-result-name';
    name.textContent = entry.name;
    const meta = document.createElement('span');
    meta.className = 'search-result-meta';
    meta.textContent = [entry.role, entry.section].filter(Boolean).join(' · ');
    item.append(name, meta);
    return item;
  }));
  searchEmpty.hidden = matches.length !== 0;
  searchStatus.textContent = matches.length ? 'Results available. Use arrow keys to choose.' : 'No matching projects.';
  search.removeAttribute('aria-activedescendant');
  searchResults.scrollTop = 0;
  setActive(0, false);
}

function openSearch(trigger) {
  if (searchDialog.open || dialog.open) return;
  const active = document.activeElement;
  searchReturn = trigger || (active && active !== document.body && active.isConnected ? active : searchOpen);
  skipRestore = false;
  search.value = '';
  renderResults();
  searchDialog.showModal();
  search.focus();
}

function goToProject(card) {
  skipRestore = true;
  searchDialog.close();
  if (card.hidden) { category = 'all'; updateDirectory(); revealFilter(filters[0]); }
  const heading = card.querySelector('h3');
  heading.tabIndex = -1;
  // scroll-margin-top on the card (browse.css) keeps the heading clear of the sticky toolbar.
  card.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  heading.focus({ preventScroll: true });
}

function chooseActive() { if (matches[activeIndex]) goToProject(matches[activeIndex].card); }

searchOpen.addEventListener('click', () => openSearch(searchOpen));
search.addEventListener('input', renderResults);
search.addEventListener('keydown', event => {
  if (event.isComposing) return;
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setActive(activeIndex + (event.key === 'ArrowDown' ? 1 : -1)); }
  else if (event.key === 'Enter') { event.preventDefault(); chooseActive(); }
  else if (event.key === 'Escape') { event.preventDefault(); searchDialog.close(); }
});
searchResults.addEventListener('mousedown', event => event.preventDefault());
searchResults.addEventListener('click', event => {
  const item = event.target.closest('[role="option"]');
  if (!item) return;
  setActive(Number(item.dataset.index), false);
  chooseActive();
});
document.querySelector('#search-close').addEventListener('click', () => searchDialog.close());
searchDialog.addEventListener('click', event => {
  if (event.target === searchDialog) searchDialog.close();
});
searchDialog.addEventListener('close', () => {
  search.value = '';
  if (!skipRestore) (searchReturn?.isConnected ? searchReturn : searchOpen).focus();
  skipRestore = false;
});

const dialog = document.querySelector('#gallery');
const galleries = JSON.parse(document.querySelector('#gallery-data').textContent);
const image = document.querySelector('#gallery-image');
const caption = document.querySelector('#gallery-caption');
const source = document.querySelector('#gallery-source');
const thumbs = document.querySelector('#gallery-thumbs');
const previous = document.querySelector('#gallery-prev');
const next = document.querySelector('#gallery-next');
let currentGallery;
let position = 0;
let opener;
const coverPositions = new Map();

document.querySelectorAll('[data-cover-nav]').forEach(frame => {
  const id = frame.dataset.coverNav;
  const link = frame.querySelector('[data-gallery]');
  const preview = link.querySelector('img');
  const items = galleries[id].images;
  const prev = frame.querySelector('[data-cover-prev]');
  const next = frame.querySelector('[data-cover-next]');
  coverPositions.set(id, 0);
  function showCover(index) {
    if (index < 0 || index >= items.length) return;
    coverPositions.set(id, index);
    const item = items[index];
    preview.src = item.src;
    preview.alt = item.caption;
    frame.querySelectorAll('[data-gallery]').forEach(anchor => { anchor.href = item.src; });
    frame.classList.toggle('portrait', !!item.portrait);
    frame.querySelector('.cover-count').textContent = `${index + 1} / ${items.length}`;
    prev.disabled = index === 0;
    next.disabled = index === items.length - 1;
  }
  prev.addEventListener('click', () => showCover(coverPositions.get(id) - 1));
  next.addEventListener('click', () => showCover(coverPositions.get(id) + 1));
  frame.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showCover(coverPositions.get(id) + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
});

const stage = document.querySelector('.gallery-stage');
const pairedStage = document.querySelector('#gallery-paired');
const pairedDesktop = document.querySelector('#gallery-desktop-image');
const pairedMobile = document.querySelector('#gallery-mobile-image');
const mobileGrid = document.querySelector('#gallery-mobile-grid');
const mobileOriginal = document.querySelector('#gallery-mobile-original');
const compactGallery = window.matchMedia('(max-width: 700px)');
let galleryPages = [];
image.addEventListener('load', () => {
  if (image.hidden) return;
  const tall = image.naturalHeight > image.naturalWidth * 3;
  stage.classList.toggle('scrollable', tall);
  document.querySelector('#gallery-scroll-hint').hidden = !tall;
  stage.scrollTop = 0;
});

let renderVersion = 0;
const positionText = document.querySelector('#gallery-position');

function decodeImage(src) {
  const probe = new Image();
  probe.src = src;
  return probe.decode();
}

function showImage(index) {
  if (index < 0 || index >= galleryPages.length) return;
  const version = ++renderVersion;
  position = index;
  const items = galleryPages[index].items;
  const current = items[0];
  const paired = currentGallery.layout === 'paired' && !!current.mobile;
  const previousDisabled = index === 0;
  const nextDisabled = index === galleryPages.length - 1;
  // Enable first so a focus destination is always enabled, then move focus off a
  // nav button before it becomes disabled (disabling a focused button drops focus to BODY).
  if (!previousDisabled) previous.disabled = false;
  if (!nextDisabled) next.disabled = false;
  if (dialog.open) {
    const active = document.activeElement;
    if ((active === previous && previousDisabled) || (active === next && nextDisabled)) {
      const target = active === previous
        ? (!nextDisabled ? next : document.querySelector('#gallery-close'))
        : (!previousDisabled ? previous : document.querySelector('#gallery-close'));
      target.focus({ preventScroll: true });
    }
  }
  previous.disabled = previousDisabled;
  next.disabled = nextDisabled;
  thumbs.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  if (!paired) { renderImage(index, false); return; }
  const label = `${index + 1} / ${galleryPages.length}${current.title ? ` · ${current.title}` : ''}`;
  positionText.textContent = `${label} · Loading…`;
  stage.setAttribute('aria-busy', 'true');
  Promise.all([decodeImage(current.src), decodeImage(current.mobile.src)]).then(() => false, () => true).then(failed => {
    if (version !== renderVersion) return;
    stage.removeAttribute('aria-busy');
    renderImage(index, failed);
  });
}

function renderImage(index, failed) {
  stage.classList.remove('scrollable');
  document.querySelector('#gallery-scroll-hint').hidden = true;
  const items = galleryPages[index].items;
  const current = items[0];
  const paired = currentGallery.layout === 'paired' && !!current.mobile;
  const mobile = currentGallery.layout === 'mobile';
  image.hidden = paired || mobile;
  pairedStage.hidden = !paired;
  mobileGrid.hidden = !mobile;
  stage.classList.toggle('is-paired', paired);
  stage.classList.toggle('is-mobile', mobile);
  if (paired) {
    pairedDesktop.src = current.src;
    pairedDesktop.alt = current.caption;
    pairedMobile.src = current.mobile.src;
    pairedMobile.alt = current.mobile.caption;
  } else if (mobile) {
    mobileGrid.replaceChildren(...items.map(item => {
      const figure = document.createElement('figure');
      figure.className = 'gallery-mobile-item';
      const screen = document.createElement('div');
      screen.className = 'gallery-phone-scroll';
      screen.tabIndex = 0;
      screen.setAttribute('role', 'group');
      screen.setAttribute('aria-label', `${item.title || 'Mobile screenshot'}: scroll to explore`);
      const capture = document.createElement('img');
      capture.src = item.src;
      capture.alt = item.caption;
      screen.append(capture);
      const label = document.createElement('figcaption');
      const original = document.createElement('a');
      original.href = item.src;
      original.target = '_blank';
      original.rel = 'noopener';
      original.textContent = `${item.title || 'Full-size screen'} ↗`;
      label.append(original);
      figure.append(screen, label);
      return figure;
    }));
  } else {
    image.src = current.src;
    image.alt = current.caption;
  }
  caption.textContent = mobile ? items.map(item => item.title || item.caption).join(' · ') : current.caption;
  source.hidden = !current.source;
  if (current.source) source.href = current.source;
  const original = document.querySelector('#gallery-original');
  original.href = current.src;
  original.hidden = mobile;
  original.textContent = paired ? 'Full-size desktop ↗' : 'Full-size image ↗';
  mobileOriginal.hidden = !paired;
  if (paired) mobileOriginal.href = current.mobile.src;
  document.querySelector('#map-attribution').hidden = !current.attribution;
  document.querySelector('#map-tiles-attribution').hidden = current.attribution === 'openstreetmap';
  positionText.textContent = `${index + 1} / ${galleryPages.length}${mobile ? ` · ${items.length} ${items.length === 1 ? 'screen' : 'screens'}` : ''}${paired && current.title ? ` · ${current.title}` : ''}${failed ? ' · Could not load these screenshots' : ''}`;
}

function prepareGallery(startImage = 0) {
  const pageSize = currentGallery.layout === 'mobile' && !compactGallery.matches ? 3 : 1;
  galleryPages = [];
  for (let i = 0; i < currentGallery.images.length; i += pageSize) {
    galleryPages.push({ start: i, items: currentGallery.images.slice(i, i + pageSize) });
  }
  thumbs.replaceChildren();
  galleryPages.forEach((page, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Screenshot ${i + 1}: ${page.items.map(item => item.title || item.caption).join(', ')}`);
    button.classList.toggle('mobile-page', currentGallery.layout === 'mobile');
    page.items.forEach(item => {
      const thumb = document.createElement('img');
      thumb.src = item.src;
      thumb.alt = '';
      button.append(thumb);
    });
    button.addEventListener('click', () => showImage(i));
    thumbs.append(button);
  });
  showImage(Math.floor(startImage / pageSize));
}

compactGallery.addEventListener('change', () => {
  if (dialog.open && currentGallery.layout === 'mobile') prepareGallery(galleryPages[position].start);
});

document.querySelectorAll('[data-gallery]').forEach(link => link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  opener = link;
  currentGallery = galleries[link.dataset.gallery];
  document.querySelector('#gallery-title').textContent = currentGallery.name;
  prepareGallery(link.dataset.galleryIndex !== undefined ? Number(link.dataset.galleryIndex) : (coverPositions.get(link.dataset.gallery) || 0));
  dialog.showModal();
  dialog.scrollTop = 0;
  document.querySelector('#gallery-close').focus({ preventScroll: true });
}));
document.querySelector('#gallery-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { renderVersion++; stage.removeAttribute('aria-busy'); image.removeAttribute('src'); pairedDesktop.removeAttribute('src'); pairedMobile.removeAttribute('src'); mobileGrid.replaceChildren(); opener?.focus(); });

dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
previous.addEventListener('click', () => { if (position > 0) showImage(position - 1); });
next.addEventListener('click', () => { if (position < galleryPages.length - 1) showImage(position + 1); });
document.addEventListener('keydown', event => {
  const commandSearch = (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k';
  if (dialog.open) {
    if (commandSearch) event.preventDefault();
    if (event.key === 'ArrowLeft' && position > 0) { event.preventDefault(); showImage(position - 1); }
    if (event.key === 'ArrowRight' && position < galleryPages.length - 1) { event.preventDefault(); showImage(position + 1); }
    return;
  }
  if (searchDialog.open) {
    if (commandSearch) { event.preventDefault(); searchDialog.close(); }
    return;
  }
  if (event.defaultPrevented) return;
  if (commandSearch) {
    event.preventDefault(); openSearch(); return;
  }
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing && !event.target.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"])')) {
    event.preventDefault(); openSearch();
  }
});

const themeControl = document.querySelector('#theme-control');
themeControl.value = document.documentElement.dataset.theme || 'system';
const themePreference = window.matchMedia('(prefers-color-scheme: dark)');
function syncThemeColor() {
  const meta = document.querySelector('#theme-color');
  if (!meta) return;
  const theme = document.documentElement.dataset.theme;
  const dark = theme === 'dark' || (!theme && themePreference.matches);
  meta.content = meta.dataset[dark ? 'dark' : 'light'];
}
themePreference.addEventListener('change', syncThemeColor);
themeControl.addEventListener('change', () => {
  const theme = themeControl.value;
  if (theme === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('projects.theme', theme); } catch {}
  syncThemeColor();
});
document.querySelectorAll('[data-enhanced]').forEach(element => { element.hidden = false; });

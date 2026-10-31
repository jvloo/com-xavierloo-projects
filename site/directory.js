const search = document.querySelector('#project-search');
const cards = [...document.querySelectorAll('[data-project]')];
const sections = [...document.querySelectorAll('[data-section]')];
const filters = [...document.querySelectorAll('[data-filter]')];
const result = document.querySelector('#result-count');
const clearFilters = document.querySelector('#clear-filters');
let category = 'all';
const searchable = new Map(cards.map(card => [card, card.textContent.toLocaleLowerCase()]));

function updateDirectory() {
  const words = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  let visible = 0;
  for (const card of cards) {
    const matches = (category === 'all' || card.dataset.group === category) && words.every(word => searchable.get(card).includes(word));
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
  clearFilters.hidden = words.length === 0 && category === 'all';
  result.textContent = words.length || category !== 'all' ? `${visible} of ${cards.length} projects` : `${cards.length} projects`;
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
  filters.find(button => button.dataset.filter === category)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}
search.addEventListener('input', updateDirectory);
filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; updateDirectory(); }));
function resetDirectory() { search.value = ''; category = 'all'; updateDirectory(); search.focus(); }
document.querySelector('#reset-search').addEventListener('click', resetDirectory);
clearFilters.addEventListener('click', resetDirectory);
search.addEventListener('keydown', event => { if (event.key === 'Escape') { search.value = ''; updateDirectory(); } });

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
  previous.disabled = index === 0;
  next.disabled = index === galleryPages.length - 1;
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
  document.querySelector('#gallery-close').focus();
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
  if (dialog.open) {
    if (event.key === 'ArrowLeft' && position > 0) { event.preventDefault(); showImage(position - 1); }
    if (event.key === 'ArrowRight' && position < galleryPages.length - 1) { event.preventDefault(); showImage(position + 1); }
    return;
  }
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !event.target.closest('input,textarea,select,[contenteditable]')) {
    event.preventDefault(); search.focus();
  }
});

const themeControl = document.querySelector('#theme-control');
themeControl.value = document.documentElement.dataset.theme || 'system';
themeControl.addEventListener('change', () => {
  const theme = themeControl.value;
  if (theme === 'system') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('projects.theme', theme); } catch {}
});
document.querySelectorAll('[data-enhanced]').forEach(element => { element.hidden = false; });

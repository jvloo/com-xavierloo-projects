const search = document.querySelector('#project-search');
const cards = [...document.querySelectorAll('[data-project]')];
const sections = [...document.querySelectorAll('[data-section]')];
const filters = [...document.querySelectorAll('[data-filter]')];
const result = document.querySelector('#result-count');
const earlier = document.querySelector('.earlier-details');
const clearFilters = document.querySelector('#clear-filters');
let category = 'all';
let priorEarlierState = earlier.open;
let forcedEarlier = false;
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
  const forceOpen = words.length > 0 || category === 'earlier';
  if (forceOpen && !forcedEarlier) priorEarlierState = earlier.open;
  if (forceOpen) earlier.open = true;
  else if (forcedEarlier) earlier.open = priorEarlierState;
  forcedEarlier = forceOpen;
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
image.addEventListener('load', () => {
  const tall = image.naturalHeight > image.naturalWidth * 3;
  stage.classList.toggle('scrollable', tall);
  document.querySelector('#gallery-scroll-hint').hidden = !tall;
  stage.scrollTop = 0;
});

function showImage(index) {
  stage.classList.remove('scrollable');
  document.querySelector('#gallery-scroll-hint').hidden = true;
  position = index;
  const current = currentGallery.images[index];
  image.src = current.src;
  image.alt = current.caption;
  caption.textContent = current.caption;
  source.hidden = !current.source;
  if (current.source) source.href = current.source;
  document.querySelector('#gallery-original').href = current.src;
  document.querySelector('#map-attribution').hidden = !current.attribution;
  document.querySelector('#map-tiles-attribution').hidden = current.attribution === 'openstreetmap';
  document.querySelector('#gallery-position').textContent = `${index + 1} / ${currentGallery.images.length}`;
  previous.disabled = index === 0;
  next.disabled = index === currentGallery.images.length - 1;
  thumbs.querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
}

document.querySelectorAll('[data-gallery]').forEach(link => link.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  opener = link;
  currentGallery = galleries[link.dataset.gallery];
  document.querySelector('#gallery-title').textContent = currentGallery.name;
  thumbs.replaceChildren();
  currentGallery.images.forEach((item, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Screenshot ${i + 1}: ${item.caption}`);
    const thumb = document.createElement('img');
    thumb.src = item.src;
    thumb.alt = '';
    button.append(thumb);
    button.addEventListener('click', () => showImage(i));
    thumbs.append(button);
  });
  showImage(link.dataset.galleryIndex !== undefined ? Number(link.dataset.galleryIndex) : (coverPositions.get(link.dataset.gallery) || 0));
  dialog.showModal();
  document.querySelector('#gallery-close').focus();
}));
document.querySelector('#gallery-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { image.removeAttribute('src'); opener?.focus(); });

dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
previous.addEventListener('click', () => { if (position > 0) showImage(position - 1); });
next.addEventListener('click', () => { if (position < currentGallery.images.length - 1) showImage(position + 1); });
document.addEventListener('keydown', event => {
  if (dialog.open) {
    if (event.key === 'ArrowLeft' && position > 0) { event.preventDefault(); showImage(position - 1); }
    if (event.key === 'ArrowRight' && position < currentGallery.images.length - 1) { event.preventDefault(); showImage(position + 1); }
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

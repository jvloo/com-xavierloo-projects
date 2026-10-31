const search = document.querySelector('#project-search');
const cards = [...document.querySelectorAll('[data-project]')];
const sections = [...document.querySelectorAll('[data-section]')];
const filters = [...document.querySelectorAll('[data-filter]')];
const result = document.querySelector('#result-count');
const earlier = document.querySelector('.earlier-details');
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
  result.textContent = words.length || category !== 'all' ? `${visible} of ${cards.length} projects` : `${cards.length} projects`;
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
}
search.addEventListener('input', updateDirectory);
filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; updateDirectory(); }));
document.querySelector('#reset-search').addEventListener('click', () => { search.value = ''; category = 'all'; updateDirectory(); search.focus(); });

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
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const play = document.querySelector('#gallery-play');
let galleryPlaying = false;
let galleryTimer;
let stageHovered = false;
const slideInterval = 6000;
const coverSlides = [];
const coverObserver = new IntersectionObserver(entries => {
  for (const entry of entries) {
    const state = coverSlides.find(item => item.frame === entry.target);
    state.visible = entry.isIntersecting;
    scheduleCover(state);
  }
}, { threshold: .35 });

function scheduleCover(state) {
  clearTimeout(state.timer);
  if (!state.visible || state.paused || document.hidden || dialog.open || state.frame.matches(':hover, :focus-within')) return;
  state.timer = setTimeout(() => {
    state.index = (state.index + 1) % state.images.length;
    const item = state.images[state.index];
    state.image.src = item.src;
    state.image.alt = item.caption;
    state.link.href = item.src;
    state.frame.classList.toggle('portrait', !!item.portrait);
    state.frame.querySelector('.cover-count').textContent = `${state.index + 1} / ${state.images.length}`;
    scheduleCover(state);
  }, slideInterval);
}
document.querySelectorAll('[data-cover-play]').forEach(button => {
  const frame = button.closest('.project-visual');
  const link = frame.querySelector('[data-gallery]');
  const state = { frame, link, button, image: link.querySelector('img'), images: galleries[button.dataset.coverPlay].images, index: 0, visible: false, paused: reducedMotion.matches };
  coverSlides.push(state);
  const updateButton = () => {
    button.textContent = state.paused ? 'Play' : 'Pause';
    button.setAttribute('aria-label', `${state.paused ? 'Play' : 'Pause'} previews: ${galleries[button.dataset.coverPlay].name}`);
    button.setAttribute('aria-pressed', String(!state.paused));
  };
  button.addEventListener('click', () => { state.paused = !state.paused; updateButton(); scheduleCover(state); });
  for (const event of ['mouseenter', 'mouseleave', 'focusin', 'focusout']) frame.addEventListener(event, () => setTimeout(() => scheduleCover(state), 0));
  reducedMotion.addEventListener('change', () => { state.paused = reducedMotion.matches; updateButton(); scheduleCover(state); });
  updateButton();
  coverObserver.observe(frame);
});
document.addEventListener('visibilitychange', () => { coverSlides.forEach(scheduleCover); scheduleGallery(); });
reducedMotion.addEventListener('change', () => { if (dialog.open && reducedMotion.matches) setGalleryPlaying(false); });

function scheduleGallery() {
  clearTimeout(galleryTimer);
  if (!dialog.open || !galleryPlaying || stageHovered || document.hidden) return;
  galleryTimer = setTimeout(() => {
    showImage((position + 1) % currentGallery.images.length);
    scheduleGallery();
  }, slideInterval);
}
function setGalleryPlaying(playing) {
  galleryPlaying = playing && currentGallery.images.length > 1;
  play.textContent = galleryPlaying ? 'Pause slideshow' : 'Play slideshow';
  play.setAttribute('aria-pressed', String(galleryPlaying));
  play.hidden = currentGallery.images.length < 2;
  document.querySelector('#gallery-position').setAttribute('aria-live', galleryPlaying ? 'off' : 'polite');
  scheduleGallery();
}
function manualImage(index) { setGalleryPlaying(false); showImage(index); }

function showImage(index) {
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
    button.addEventListener('click', () => manualImage(i));
    thumbs.append(button);
  });
  showImage(0);
  dialog.showModal();
  coverSlides.forEach(scheduleCover);
  stageHovered = false;
  setGalleryPlaying(!reducedMotion.matches);
  document.querySelector('#gallery-close').focus();
}));
document.querySelector('#gallery-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { clearTimeout(galleryTimer); image.removeAttribute('src'); opener?.focus(); coverSlides.forEach(scheduleCover); });
play.addEventListener('click', () => setGalleryPlaying(!galleryPlaying));
const stage = document.querySelector('.gallery-stage');
stage.addEventListener('mouseenter', () => { stageHovered = true; scheduleGallery(); });
stage.addEventListener('mouseleave', () => { stageHovered = false; scheduleGallery(); });
dialog.addEventListener('click', event => {
  const bounds = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
});
previous.addEventListener('click', () => { if (position > 0) manualImage(position - 1); });
next.addEventListener('click', () => { if (position < currentGallery.images.length - 1) manualImage(position + 1); });
document.addEventListener('keydown', event => {
  if (dialog.open) {
    if (event.key === 'ArrowLeft' && position > 0) { event.preventDefault(); manualImage(position - 1); }
    if (event.key === 'ArrowRight' && position < currentGallery.images.length - 1) { event.preventDefault(); manualImage(position + 1); }
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

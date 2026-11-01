document.querySelectorAll('.year').forEach(el => el.textContent = new Date().getFullYear());
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '✕' : '☰';
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '☰';
  }));
}
window.addEventListener('pageshow', () => document.body.classList.remove('page-leave'));
document.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  if (link.target === '_blank' || link.hasAttribute('download')) return;
  const href = link.getAttribute('href');
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  event.preventDefault();
  document.body.classList.add('page-leave');
  window.setTimeout(() => { location.href = link.href; }, 320);
});
const testimonies = window.TESTIMONIES || [];
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}
function testimonyInitials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
}
function testimonyAvatar(item, large) {
  const cls = large ? 'avatar avatar-lg' : 'avatar';
  if (item.photo) return `<img class="${cls}" src="${escapeHtml(item.photo)}" alt="">`;
  return `<span class="${cls}" aria-hidden="true">${escapeHtml(testimonyInitials(item.name))}</span>`;
}
function testimonyProfile(item, large) {
  return `<div class="testimony-profile">${testimonyAvatar(item, large)}<p class="profile-meta"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.role)} · ${escapeHtml(item.campus)}</span></p></div>`;
}
function testimonyCard(item, linked) {
  const link = linked ? `<a class="text-link" href="/blog#${escapeHtml(item.id)}">Read testimony <span>→</span></a>` : '';
  const clickable = linked ? '' : ' tabindex="0" role="button"';
  return `<article class="blog-card testimony-card searchable" data-id="${escapeHtml(item.id)}"${clickable}><div class="card-body">${testimonyProfile(item, false)}<p class="card-kicker">SAMPLE TESTIMONY</p><h3>${escapeHtml(item.title)}</h3><p class="testimony-text">${escapeHtml(item.testimony)}</p>${link}</div></article>`;
}
function featuredMarkup(item) {
  return `<div class="feature-copy">${testimonyProfile(item, true)}<p class="card-kicker">TESTIMONY · SAMPLE</p><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.testimony)}</p><p class="note">Sample profile. Change the name, title, story, or photo in assets/testimonies.js.</p></div>`;
}
function showTestimony(item, options) {
  const feature = document.getElementById('testimony-feature');
  if (!feature || !item) return;
  feature.innerHTML = featuredMarkup(item);
  document.querySelectorAll('#testimony-list .testimony-card').forEach(card => {
    const selected = card.dataset.id === item.id;
    card.classList.toggle('is-selected', selected);
    if (selected) card.setAttribute('aria-current', 'true');
    else card.removeAttribute('aria-current');
  });
  if (options && options.updateHash) history.replaceState(null, '', '#' + item.id);
  if (options && options.scroll) {
    feature.scrollIntoView({ behavior: options.smooth === false ? 'auto' : 'smooth', block: 'start' });
  }
}
function renderTestimonies() {
  if (!testimonies.length) return;
  const list = document.getElementById('testimony-list');
  const home = document.getElementById('home-testimonies');
  const feature = document.getElementById('testimony-feature');
  const fromHash = testimonies.find(item => item.id === decodeURIComponent(location.hash.replace('#', '')));
  const featured = fromHash || testimonies[0];
  if (list) list.innerHTML = testimonies.map(item => testimonyCard(item, false)).join('');
  if (home) home.innerHTML = testimonies.slice(0, 3).map(item => testimonyCard(item, true)).join('');
  if (feature) showTestimony(featured, { scroll: Boolean(fromHash), smooth: false });
  if (!list) return;
  const openCard = event => {
    const card = event.target.closest('.testimony-card');
    if (!card || !list.contains(card)) return;
    const item = testimonies.find(entry => entry.id === card.dataset.id);
    if (!item) return;
    showTestimony(item, { updateHash: true, scroll: true, smooth: true });
  };
  list.addEventListener('click', openCard);
  list.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (event.target.closest('a')) return;
    event.preventDefault();
    openCard(event);
  });
}
renderTestimonies();
const search = document.getElementById('blogSearch');
if (search) {
  const articles = [...document.querySelectorAll('.searchable')];
  const empty = document.querySelector('.empty-state');
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let visible = 0;
    articles.forEach(article => {
      const show = article.textContent.toLowerCase().includes(q);
      article.hidden = !show;
      if (show) visible++;
    });
    if (empty) empty.hidden = visible > 0;
  });
}
const form = document.getElementById('contactForm');
if (form) form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const subject = encodeURIComponent(`Website inquiry: ${data.get('topic')}`);
  const body = encodeURIComponent(`Name: ${data.get('name')}\nEmail: ${data.get('email')}\nCampus: ${data.get('campus')}\nTopic: ${data.get('topic')}\n\nMessage:\n${data.get('message')}`);
  const campuses = {
    'livingwordsanfernando1993@gmail.com': 'San Fernando',
    'livingwordcarcar2022@gmail.com': 'Carcar'
  };
  const campus = data.get('campus');
  const feedback = document.getElementById('formFeedback');
  if (!campuses[campus]) {
    feedback.textContent = 'Choose San Fernando or Carcar so the message goes to the right campus.';
    return;
  }
  feedback.textContent = `Opening an email draft to Living Word ${campuses[campus]}.`;
  window.location.href = `mailto:${campus}?subject=${subject}&body=${body}`;
});
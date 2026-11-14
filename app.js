const WA = 'https://wa.me/5549998199034?text=';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// WhatsApp links
$$('[data-wa]').forEach(a => {
  a.href = WA + encodeURIComponent(a.dataset.wa);
  a.target = '_blank';
  a.rel = 'noopener';
});

// Mobile menu
const toggle = $('.menu-toggle'), menu = $('#menu');
const setMenu = open => {
  menu.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
};
toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
$$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));

// Header state
const header = $('.header');
const onScroll = () => header.classList.toggle('scrolled', scrollY > 30);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Open / closed status, computed in Lages time
const schedule = { 0: [], 1: [[360, 690], [810, 1380]], 6: [[840, 1020]] };
[2, 3, 4, 5].forEach(d => (schedule[d] = schedule[1]));
const fmt = m => `${String(Math.floor(m / 60)).padStart(2, '0')}h${m % 60 ? String(m % 60).padStart(2, '0') : ''}`;
function lagesNow() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const get = t => parts.find(p => p.type === t).value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, min: +get('hour') * 60 + +get('minute') };
}
function updateStatus() {
  const { day, min } = lagesNow();
  const slot = schedule[day].find(([a, b]) => min >= a && min < b);
  const el = $('#open-status');
  let text;
  if (slot) {
    text = `Aberto agora · até ${fmt(slot[1])}`;
  } else {
    const later = schedule[day].find(([a]) => a > min);
    if (later) text = `Fechado · abre hoje às ${fmt(later[0])}`;
    else {
      let d = (day + 1) % 7, n = 1;
      while (!schedule[d].length) { d = (d + 1) % 7; n++; }
      const names = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
      text = `Fechado · abre ${n === 1 ? 'amanhã' : names[d]} às ${fmt(schedule[d][0][0])}`;
    }
  }
  el.classList.toggle('is-open', !!slot);
  el.querySelector('span').textContent = text;
  $$('#hours-list > div').forEach(r => r.classList.toggle('today', r.dataset.days.split(',').includes(String(day))));
}
updateStatus();
setInterval(updateStatus, 60000);

// Google reviews (data in reviews.js)
const starSvg = '<svg viewBox="0 0 20 20"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z"/></svg>';
const stars = n => Array.from({ length: 5 }, (_, i) => `<i class="${i < Math.round(n) ? 'on' : ''}">${starSvg}</i>`).join('');
(function renderReviews() {
  const g = window.UPFIT_GOOGLE || {};
  const score = $('#g-score');
  if (g.rating) {
    $('#g-rating').textContent = Number(g.rating).toFixed(1).replace('.', ',');
    $('#g-stars').innerHTML = stars(g.rating);
    $('#g-count').textContent = g.total ? `${g.total} avaliações` : '';
  } else {
    score.innerHTML = '<span class="g-cta">Up Fit Academia · Penha, Lages</span>';
  }
  const list = $('#reviews-list');
  const items = (g.reviews || []).filter(r => r && r.text);
  if (!items.length) { list.remove(); return; }
  items.forEach(r => {
    const card = document.createElement('article');
    card.className = 'review';
    const initial = (r.name || '?').trim().charAt(0).toUpperCase();
    card.innerHTML = `<div class="review-stars" aria-label="${r.stars || 5} de 5 estrelas">${stars(r.stars || 5)}</div><p class="review-text"></p><div class="review-author"><span class="avatar">${initial}</span><div><b></b><small></small></div></div>`;
    $('.review-text', card).textContent = r.text;
    $('b', card).textContent = r.name || '';
    $('small', card).textContent = r.when ? `${r.when} · Google` : 'Google';
    list.appendChild(card);
  });
})();

// Video play buttons
$$('.story-video').forEach(wrap => {
  const v = $('video', wrap), btn = $('.play', wrap);
  btn.addEventListener('click', () => { v.controls = true; v.play(); });
  v.addEventListener('play', () => {
    v.controls = true;
    wrap.classList.add('playing');
    $$('.story-video video').forEach(o => o !== v && o.pause());
  });
  v.addEventListener('ended', () => wrap.classList.remove('playing'));
});

// Lightbox
const dialog = $('#media-dialog'), content = $('#media-content');
$$('[data-image]').forEach(b => b.addEventListener('click', () => {
  const img = new Image();
  img.src = b.dataset.image;
  img.alt = b.dataset.caption;
  content.replaceChildren(img);
  dialog.showModal();
}));
$('.close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

// Goal selector
const goals = {
  experimental: 'Olá! Quero agendar uma aula experimental na Up Fit.',
  planos: 'Olá! Quero conhecer os planos e valores da Up Fit.',
  horarios: 'Olá! Quais modalidades e horários estão disponíveis na Up Fit?',
  personal: 'Olá! Quero saber sobre personal trainer na Up Fit.'
};
const goalSel = $('#visit-goal'), goalBtn = $('#goal-contact');
const setGoal = () => (goalBtn.href = WA + encodeURIComponent(goals[goalSel.value]));
goalSel.addEventListener('change', setGoal);
setGoal();

// Copy address
$('#copy-address').addEventListener('click', async () => {
  const s = $('#copy-status');
  try {
    await navigator.clipboard.writeText('Rua Evilásio Ribeiro Koeche, 516 - Penha, Lages - SC, 88525-670');
    s.textContent = 'Endereço copiado ✓';
  } catch { s.textContent = 'Penha · Lages, SC'; }
  setTimeout(() => (s.textContent = 'Copiar endereço'), 2500);
});

$('#year').textContent = new Date().getFullYear();

// Reveal on scroll + active nav
if ('IntersectionObserver' in window) {
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12 });
    $$('.section-head, .card, .gallery, .story, .story-cta, .reviews-head, .review, .visit, .faq').forEach(el => {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add('reveal'); io.observe(el); }
    });
  }
  const nav = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$('#menu a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-40% 0px -55% 0px' });
  $$('main > section[id]').forEach(s => nav.observe(s));
}

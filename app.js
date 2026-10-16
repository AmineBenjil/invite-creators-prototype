const api = mockApi;
const $ = id => document.getElementById(id);

const TAGS = {
  fav:    { label: 'Favorite',         icon: 'tag-favorite.svg' },
  again:  { label: 'Would work again', icon: 'tag-work-again.svg' },
  missed: { label: 'Missed last time', icon: 'tag-missed.svg' },
};

// ---------- Shared bits ----------
const avatar = (img, border2 = false, size = '') => `
  <div class="avatar ${size}"><div class="avatar-in${border2 ? ' b2' : ''}">
    <img src="assets/${img}.jpg" alt="">
  </div></div>`;

const person = (c, sub, border2, size = '') => `
  <div class="person">
    ${avatar(c.avatar, border2, size)}
    <div class="p-info">
      <div class="p-name"><b>${c.name}</b><img src="assets/verified.svg" alt=""></div>
      <p class="p-sub">${sub}</p>
    </div>
  </div>`;

const emo = text => text.replace(/(\p{Extended_Pictographic})/gu, '<i class="emo">$1</i>');

// Creator profile: used by the step-2 card and the step-1 hover card
const profileHTML = (c, isNew) => `
    <div class="sg-head">
      <div class="sg-who">
        ${avatar(c.avatar, true, 'lg')}
        <div class="sg-info">
          <div class="sg-name">
            <span class="sg-n"><b>${c.name}</b><img src="assets/verified-16.svg" alt="" width="16" height="16"></span>
            <span class="sg-handle">@${c.handle}</span>
            ${isNew ? '<span class="sg-new">New</span>' : ''}
          </div>
          <p class="sg-bio">${emo(c.bio)}</p>
        </div>
      </div>
      <div class="sg-social">
        <a><img src="assets/instagram-24.svg" alt="Instagram" width="24" height="24"></a>
        <a><img src="assets/tiktok-24.svg" alt="TikTok" width="24" height="24"></a>
      </div>
    </div>

    <div class="sg-fit">
      <div class="sg-fit-title"><img src="assets/sparkle-fit.svg" alt="" width="16" height="16">Why they fit</div>
      <div class="sg-fit-list">
        ${c.fit.map(f => `<p><img src="assets/bullet-check.svg" alt="" width="16" height="16">${f}</p>`).join('')}
      </div>
    </div>

    <div class="sg-stats">
      <div class="sg-col" style="width:278px">
        <p class="sg-label">Social Stats</p>
        <div class="sg-box" style="height:53.789px">
          <div class="stat" style="left:15.5px"><span>Followers</span><b>${c.followers}</b></div>
          <div class="stat" style="left:153px">
            <span class="stat-row">Engagement<img src="assets/info-12.svg" alt="" width="12" height="12"></span>
            <b class="stat-row"><span class="ig12"><img src="assets/instagram-12.svg" alt=""></span>${c.engagement}</b>
          </div>
        </div>
      </div>
      <div class="sg-col">
        <p class="sg-label">Audience</p>
        <div class="sg-box" style="width:382px;height:53px">
          <div class="stat" style="left:15.5px"><span>Location</span><b>${c.location}</b></div>
          <div class="stat cx" style="left:calc(50% - 15px)"><span>Age Range</span><b>${c.age}</b></div>
          <div class="stat cx" style="left:calc(50% + 139px)"><span>Gender</span><b>${c.gender}</b></div>
        </div>
      </div>
    </div>

    <div class="sg-content">
      <p class="sg-label">Recent content</p>
      <div class="tiles">${c.content.map(img => `<div class="tile"><img src="assets/${img}.jpg" alt=""></div>`).join('')}</div>
    </div>`;

// ---------- Step 1: creators you know ----------
const rows = $('rows');
function renderRows() {
  $('prioritizeAll').disabled = api.known().every(c => c.priority);
  $('knownCount').textContent = api.known().length;
  rows.innerHTML = api.known().filter(c => !tagFilter || c.tag === tagFilter).map(c => `
    <div class="row" data-id="${c.id}">
      ${person(c, c.sub)}
      <div class="tag ${c.tag}"><img src="assets/${TAGS[c.tag].icon}" alt="">${TAGS[c.tag].label}</div>
      <div class="split${c.shortlisted ? ' added' : ''}${c.priority ? ' prio' : ''}">
        <button class="split-add" aria-pressed="${c.shortlisted}">
          <img src="assets/${c.shortlisted ? 'check-12' : 'plus-12'}.svg" alt="" width="12" height="12">${c.shortlisted ? 'Added' : 'Add'}
        </button>
        <button class="split-star" aria-pressed="${c.priority}" aria-label="Priority invite"><img src="assets/star-16-${c.priority ? 'on' : 'off'}.svg" alt="" width="16" height="16"></button>
      </div>
    </div>`).join('');
}

// ---------- "For you" filter ----------
let tagFilter = null;   // null = everyone, otherwise a TAGS key
const filterBtn = $('filterBtn'), filterPop = $('filterPop');

function renderFilterPop() {
  const opt = (key, label, icon) => `
    <button class="fp-opt${tagFilter === key ? ' on' : ''}" role="menuitemradio" aria-checked="${tagFilter === key}" data-key="${key ?? ''}">
      ${icon ? `<img class="fp-icon" src="assets/${icon}" alt="" width="12" height="12">` : '<span class="fp-icon"></span>'}
      <span class="fp-label">${label}</span>
      <img class="fp-check" src="assets/check-12.svg" alt="" width="12" height="12">
    </button>`;
  filterPop.innerHTML = `<p class="fp-title">Show creators</p>`
    + opt(null, 'All', null)
    + Object.entries(TAGS).map(([k, t]) => opt(k, t.label, t.icon)).join('');
}

function setFilterOpen(open) {
  if (open) {
    renderFilterPop();
    // drop the popover under the button, inside the card
    const b = filterBtn.getBoundingClientRect(), c = document.querySelector('.card').getBoundingClientRect();
    filterPop.style.left = (b.left - c.left - 6) + 'px';
    filterPop.style.top = (b.bottom - c.top + 6) + 'px';
  }
  filterPop.hidden = !open;
  filterBtn.classList.toggle('open', open);
  filterBtn.setAttribute('aria-expanded', open);
}

filterBtn.addEventListener('click', e => { e.stopPropagation(); setFilterOpen(filterPop.hidden); });
filterPop.addEventListener('click', e => {
  const o = e.target.closest('.fp-opt');
  if (!o) return;
  tagFilter = o.dataset.key || null;
  filterBtn.classList.toggle('active', !!tagFilter);
  setFilterOpen(false);
  renderRows();
});
document.addEventListener('click', e => { if (!filterPop.hidden && !filterPop.contains(e.target)) setFilterOpen(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !filterPop.hidden) setFilterOpen(false); });

// "Prioritize all": stars every creator in the table (which also adds them)
$('prioritizeAll').addEventListener('click', () => {
  api.known().filter(c => !c.priority).forEach(c => api.setPriority(c.id, true));
});

rows.addEventListener('click', e => {
  const row = e.target.closest('.row');
  if (!row) return;
  const c = api.get(row.dataset.id);
  if (e.target.closest('.split-add')) api.setShortlisted(c.id, !c.shortlisted);
  if (e.target.closest('.split-star')) api.setPriority(c.id, !c.priority);
});

// Hover a name in the table to preview that creator's profile card
const hovercard = document.createElement('div');
hovercard.className = 'hovercard';
document.body.appendChild(hovercard);
let hoverTimer, hideTimer, hoverId;

function showHovercard(nameEl, id) {
  const c = api.get(id);
  if (hoverId !== id) hovercard.innerHTML = profileHTML(c, false);
  hoverId = id;
  const r = nameEl.getBoundingClientRect();
  const W = 724, H = 440, GAP = 8, M = 12;
  const left = Math.min(Math.max(M, r.left - 24), innerWidth - W - M);
  const below = r.bottom + GAP + H <= innerHeight - M;
  const top = below ? r.bottom + GAP : Math.max(M, r.top - GAP - H);
  hovercard.style.left = left + 'px';
  hovercard.style.top = top + 'px';
  hovercard.dataset.side = below ? 'below' : 'above';
  hovercard.classList.add('open');
}
const hideHovercard = () => { hovercard.classList.remove('open'); };

rows.addEventListener('mouseover', e => {
  const nameEl = e.target.closest('.p-name b');
  if (!nameEl) return;
  clearTimeout(hideTimer);
  clearTimeout(hoverTimer);
  const id = nameEl.closest('.row').dataset.id;
  hoverTimer = setTimeout(() => showHovercard(nameEl, id), hovercard.classList.contains('open') ? 0 : 250);
});
rows.addEventListener('mouseout', e => {
  if (!e.target.closest('.p-name b')) return;
  clearTimeout(hoverTimer);
  hideTimer = setTimeout(hideHovercard, 150);
});
// Moving the pointer onto the card keeps it open, so links and content can be looked at
hovercard.addEventListener('mouseenter', () => clearTimeout(hideTimer));
hovercard.addEventListener('mouseleave', () => { hideTimer = setTimeout(hideHovercard, 150); });

// ---------- Right panel: the shortlist ----------
function renderList(el, list) {
  el.innerHTML = list.map(c => `
      <div class="item" data-id="${c.id}">
        ${person(c, c.handle, false, 'sm')}
        <div class="item-actions">
          ${c.priority ? '<button class="item-star" aria-label="Remove priority for ' + c.name + '"><img src="assets/star-16-panel.svg" alt="" width="16" height="16"></button>' : ''}
          <button class="item-x" aria-label="Remove ${c.name}"><img src="assets/close-12.svg" alt=""></button>
        </div>
      </div>`).join('');
}

function renderShortlist() {
  const list = api.shortlist();
  const prio = list.filter(c => c.priority), rest = list.filter(c => !c.priority);
  renderList($('priorityList'), prio);
  renderList($('everyoneList'), rest);
  // Empty shortlist gets the Figma empty state; otherwise only groups with people show
  $('slEmpty').hidden = list.length > 0;
  document.querySelector('.lists').hidden = list.length === 0;
  $('priorityList').closest('.group').hidden = prio.length === 0;
  $('everyoneList').closest('.group').hidden = rest.length === 0;
  // With nobody prioritized there is nothing to contrast with, so the one group is just "Shortlisted"
  $('othersTitle').textContent = prio.length ? 'Others' : 'Shortlisted';

  // "Your list" meter: fills toward the target, and estimates acceptances
  // using the ~40% rate quoted in the banner.
  const n = list.length;
  $('inviteCount').textContent = n;
  $('target').textContent = api.TARGET;
  $('barFill').style.width = Math.min(100, n / api.TARGET * 100) + '%';
  $('progressNote').textContent = `${n} on your list ≈ ${Math.round(n * api.ACCEPT_RATE)} likely to accept`;
  $('sgCount').textContent = api.suggestions().filter(c => !c.dismissed).length;
}

document.querySelector('.right').addEventListener('click', e => {
  const item = e.target.closest('.item');
  if (!item) return;
  if (e.target.closest('.item-x')) api.setShortlisted(item.dataset.id, false);
  if (e.target.closest('.item-star')) api.setPriority(item.dataset.id, false);
});

// ---------- Step 2: new suggestions ----------
let current = 0; // index into the suggestions still in play
const inPlay = () => api.suggestions().filter(c => !c.dismissed);

function renderSuggestion() {
  const list = inPlay();
  current = Math.max(0, Math.min(current, list.length - 1));
  const c = list[current];
  const body = $('sgBody');
  if (!c) { body.innerHTML = '<p class="sg-done">You’ve gone through every suggestion.</p>'; return; }

  body.innerHTML = profileHTML(c, true);

  // Same split Add / star pill as step 1, at the card's larger size
  $('sgSplit').classList.toggle('added', c.shortlisted);
  $('sgSplit').classList.toggle('prio', c.priority);
  $('sgAddIcon').src = `assets/${c.shortlisted ? 'check-12' : 'plus-12'}.svg`;
  $('sgAddLabel').textContent = c.shortlisted ? 'Added' : 'Add';
  $('sgStarIcon').src = `assets/${c.priority ? 'star-16-on' : 'star-20-off'}.svg`;
  $('pgNum').textContent = current + 1;
  $('pgTotal').textContent = list.length;
  $('pgPrev').disabled = current === 0;
  $('pgNext').disabled = current >= list.length - 1;
}

const currentId = () => inPlay()[current]?.id;
// ---------- Card deck animation ----------
// Two moves, built only from transform + opacity so they stay on the compositor:
//  'next' : the top card is thrown off to the left (accelerating, arcing from a
//           low pivot) while the next card dissolves up out of the deck in its place.
//  'prev' : the current card dissolves back into the deck while the previous card
//           glides back in from the left and settles (decelerating).
// The moving copy lives inside the modal, so it slides out of sight at the
// pop-up's edge. Clicking mid-swipe fast-forwards the current swipe.
const card = document.querySelector('.suggest');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const EASE_OUT = 'cubic-bezier(.22, 1, .36, 1)';   // settles softly
const THROW = 'cubic-bezier(.25, .2, .7, .55)';     // moves on the first frame, then accelerates away
const DECK = 'translateY(8px) scale(.965)';        // where a card sits in the deck
const OFFSCREEN = 'translate(-1000px, 80px) rotate(-18deg)'; // fully past the modal's left edge
let running = null;                                 // { anims, cleanup } of the swipe in flight

function flyingCopy(from) {
  // Same absolute slot as the real card, inside the modal, so the modal's
  // rounded edge clips it: the card disappears behind the pop-up's border.
  const el = from.cloneNode(true);
  el.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
  el.removeAttribute('id');
  el.classList.add('ghost');
  el.style.zIndex = 2;
  from.after(el);
  return el;
}

function finishRunning() {
  if (!running) return;
  running.anims.forEach(a => a.finish());
  running.cleanup();
}

function swap(direction, change) {
  finishRunning();
  card.classList.add('no-tx');          // the footer pill must not tween between cards
  const old = flyingCopy(card);         // frozen picture of the card being replaced
  change();                             // real card now shows the new creator

  let anims;
  if (reduceMotion) {
    anims = [
      old.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 160, fill: 'forwards' }),
      card.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 }),
    ];
  } else if (direction === 'next') {
    // The thrown card stays solid and slides out past the modal's left edge,
    // so no frame ever shows two cards' text through each other.
    old.style.transformOrigin = '50% 140%';
    anims = [
      old.animate([{ transform: 'none' }, { transform: OFFSCREEN }],
        { duration: 420, easing: THROW, fill: 'forwards' }),
      card.animate([{ transform: DECK, opacity: 0 }, { transform: 'none', opacity: 1 }],
        { duration: 420, delay: 60, easing: EASE_OUT, fill: 'backwards' }),
    ];
  } else {
    // The previous card slides back in solid from off-screen and lands on top,
    // while the current one dissolves back into the deck underneath it.
    const incoming = flyingCopy(card);   // inserted right after the card, so it sits above `old`
    old.style.zIndex = 1;
    card.style.opacity = 0;
    incoming.style.transformOrigin = '50% 140%';
    anims = [
      old.animate([{ transform: 'none' }, { transform: DECK }],
        { duration: 320, easing: EASE_OUT, fill: 'forwards' }),
      old.animate([{ opacity: 1 }, { opacity: 0 }],
        { duration: 220, easing: 'linear', fill: 'forwards' }),
      incoming.animate([{ transform: OFFSCREEN }, { transform: 'none' }],
        { duration: 540, easing: EASE_OUT, fill: 'forwards' }),
    ];
    // hand off to the real card on the exact frame the copy lands
    anims[2].finished.then(() => { card.style.opacity = ''; incoming.remove(); }, () => {});
    old.extra = incoming;
  }

  const me = {
    anims,
    cleanup() {
      if (running !== me) return;
      running = null;
      card.style.opacity = '';
      old.extra?.remove();
      old.remove();
      card.classList.remove('no-tx');
    },
  };
  running = me;
  Promise.all(anims.map(a => a.finished)).then(me.cleanup, me.cleanup);
}

// Decode a creator's photos before their card is dealt, so tiles never pop in mid-dissolve
const warmed = new Set();
function warm(c) {
  if (!c || warmed.has(c.id)) return Promise.resolve();
  warmed.add(c.id);
  const srcs = [c.avatar, ...c.content].map(n => `assets/${n}.jpg`);
  return Promise.all(srcs.map(src => { const i = new Image(); i.src = src; return i.decode().catch(() => {}); }));
}
const warmNeighbours = () => { const l = inPlay(); warm(l[current - 1]); warm(l[current + 1]); };

// Navigation is queued: rapid clicks each advance one card, in order, and each
// new swipe fast-forwards the one before it instead of being dropped.
let queue = Promise.resolve();
let pending = null;   // where the deck will be once queued swipes have run
const go = delta => {
  const list = inPlay();
  const target = (pending ?? current) + delta;
  if (target < 0 || target > list.length - 1) return queue;
  pending = target;
  queue = queue.then(async () => {
    // wait briefly for the incoming photos (cached after the first time, so usually instant)
    await Promise.race([warm(inPlay()[target]), new Promise(r => setTimeout(r, 120))]);
    swap(delta > 0 ? 'next' : 'prev', () => { current = target; renderSuggestion(); });
    if (pending === target) pending = null;
    warmNeighbours();
  });
  return queue;
};

$('pgPrev').addEventListener('click', () => go(-1));
$('pgNext').addEventListener('click', () => go(1));

// Add: add them, show "Added" for a beat, then deal the next card.
// Tapping it on someone already added just removes them (no swipe).
$('sgAdd').addEventListener('click', () => {
  const c = api.get(currentId());
  if (!c) return;
  if (c.shortlisted) return api.setShortlisted(c.id, false);
  api.setShortlisted(c.id, true);
  if (current < inPlay().length - 1) setTimeout(() => go(1), 350);
});
// Star: prioritize (adds them too if needed), show the purple star for a beat,
// then deal the next card, same as Add. Un-starring stays on the card (no swipe).
$('sgStar').addEventListener('click', () => {
  const c = api.get(currentId());
  if (!c) return;
  if (c.priority) return api.setPriority(c.id, false);
  api.setPriority(c.id, true);
  if (current < inPlay().length - 1) setTimeout(() => go(1), 350);
});

// Not a Fit: the card swipes away and drops out of the deck; the next one takes its slot.
document.querySelector('.btn-ghost').addEventListener('click', () => {
  const id = currentId();
  if (!id) return;
  swap('next', () => api.dismiss(id));
});

// ---------- Re-render whenever the "backend" changes ----------
function renderAll() { renderRows(); renderShortlist(); renderSuggestion(); }
api.onChange(renderAll);
renderAll();

// ---------- Modal open / close and steps ----------
const modal = $('modal');
const overlay = $('overlay');
const setOpen = open => { modal.classList.toggle('hidden', !open); overlay.classList.toggle('hidden', !open); };
$('closeModal').addEventListener('click', () => setOpen(false));
overlay.addEventListener('click', () => setOpen(false));
$('openModal').addEventListener('click', () => setOpen(true));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });

const setStep = n => { modal.dataset.step = n; };
$('nextBtn').addEventListener('click', () => setStep(2));
$('backBtn').addEventListener('click', () => setStep(1));
if (location.hash === '#step2') setStep(2);
warmNeighbours();

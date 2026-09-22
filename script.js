const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

let lastFocused = null;

function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  lastFocused = document.activeElement;
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  const focusTarget = el.querySelector('.close, input, a, button');
  focusTarget?.focus({ preventScroll: true });
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('open');
  el.setAttribute('aria-hidden', 'true');
  if (!document.querySelector('.overlay.open')) document.body.classList.remove('modal-open');
  lastFocused?.focus?.({ preventScroll: true });
  lastFocused = null;
}

$('#openCV')?.addEventListener('click', () => openModal('cvModal'));
$('#openCV2')?.addEventListener('click', () => openModal('cvModal'));
$('#openAI')?.addEventListener('click', () => openModal('aiModal'));
$('#openAI2')?.addEventListener('click', () => openModal('aiModal'));

$$('[data-close]').forEach(button => button.addEventListener('click', () => closeModal(button.dataset.close)));
$$('.overlay').forEach(overlay => overlay.addEventListener('click', e => {
  if (e.target === overlay) closeModal(overlay.id);
}));

document.addEventListener('keydown', e => {
  const modal = document.querySelector('.overlay.open');
  if (!modal) return;
  if (e.key === 'Escape') {
    closeModal(modal.id);
    return;
  }
  if (e.key === 'Tab') {
    const focusable = $$(`#${modal.id} a[href], #${modal.id} button:not([disabled]), #${modal.id} input, #${modal.id} iframe`)
      .filter(el => el.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

const modalData = {
  auto: {
    title: 'Diagnostic électronique automobile',
    body: `<h2>Diagnostic électronique automobile</h2><p>Projet réalisé dans le cadre du Bac Pro CIEL autour du diagnostic de véhicules et de la compréhension des systèmes électroniques embarqués.</p><ul><li>Lecture et effacement des codes défauts (DTC)</li><li>Utilisation de VCDS, Autel et Delphi DS150E</li><li>Découverte des protocoles OBD-II, CAN Bus, K-Line et KWP2000</li><li>Analyse de mesures et données en temps réel</li></ul><div class="tags"><span>OBD-II</span><span>CAN Bus</span><span>VCDS</span><span>Autel</span><span>Delphi DS150E</span></div>`
  },
  macro: {
    title: 'Macropad Raspberry Pi Pico',
    body: `<h2>Macropad Raspberry Pi Pico</h2><p>Projet hardware personnel basé sur un Raspberry Pi Pico H avec CircuitPython et KMK.</p><ul><li>Configuration de touches personnalisées</li><li>Travail sur un encodeur rotatif</li><li>Commandes multimédia : volume, mute, etc.</li><li>Tests et développement avec Thonny</li></ul><div class="tags"><span>Raspberry Pi Pico</span><span>CircuitPython</span><span>KMK</span><span>Python</span></div>`
  }
};

$$('[data-modal]').forEach(button => button.addEventListener('click', () => {
  const data = modalData[button.dataset.modal];
  if (!data) return;
  $('#modalTitle').textContent = data.title;
  $('#modalBody').innerHTML = data.body;
  openModal('projectModal');
}));

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  }), { threshold: 0.12 });
  $$('.reveal').forEach(el => revealObserver.observe(el));
} else {
  $$('.reveal').forEach(el => el.classList.add('in'));
}

const knowledge = {
  'qui est sabir': 'Sabir IAZZA est un profil orienté web et informatique, formé en Bac Pro CIEL. Son parcours mélange développement web, réseaux, cybersécurité, dépannage, électronique et projets personnels.',
  'projets': 'Ses projets présentés ici comprennent Grill Pasta, Agenda ICP, le diagnostic électronique automobile, un Macropad Raspberry Pi Pico, une contribution à KADRI AI et SabirGPT.',
  'compétences': 'Sabir travaille notamment avec HTML, CSS et JavaScript, et possède des bases en réseaux, cybersécurité, dépannage informatique, électronique et microcontrôleurs.',
  'formation': 'Il a suivi un Bac Pro CIEL (Cybersécurité, Informatique et Réseaux) au lycée professionnel Georges Cisson à Toulon, avec des certifications Pix, Cisco, freeCodeCamp et SoloLearn.'
};

function answer(question) {
  const query = question.toLowerCase();
  for (const [key, value] of Object.entries(knowledge)) {
    if (query.includes(key) || key.split(' ').some(word => word.length > 4 && query.includes(word))) return value;
  }
  return "Je peux te présenter le parcours, les compétences, les projets ou la formation de Sabir. Pour répondre à des questions générales au-delà de ce profil, cette interface est prête à être reliée à une vraie API IA.";
}

function escapeHTML(value) {
  return value.replace(/[<>&"']/g, char => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;' }[char]));
}

const API_ENDPOINT = '/api/chat';
let chatHistory = [];

function addBubble(role, text) {
  const box = $('#chatMessages');
  if (!box) return;
  const bubble = document.createElement('div');
  bubble.className = `bubble ${role === 'user' ? 'user' : 'bot'}`;
  bubble.textContent = text;
  box.appendChild(bubble);
  box.scrollTop = box.scrollHeight;
}

async function send(question) {
  const clean = question.trim();
  if (!clean || clean.length > 2000) return;
  addBubble('user', clean);

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: clean, history: chatHistory, website: $('#chatWebsite')?.value || '' })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'AI indisponible');
    const answerText = typeof data.answer === 'string' && data.answer.trim()
      ? data.answer.trim()
      : answer(clean);
    chatHistory.push({ role: 'user', content: clean }, { role: 'assistant', content: answerText });
    chatHistory = chatHistory.slice(-12);
    addBubble('bot', answerText);
  } catch {
    const fallback = answer(clean);
    chatHistory.push({ role: 'user', content: clean }, { role: 'assistant', content: fallback });
    chatHistory = chatHistory.slice(-12);
    addBubble('bot', fallback);
  }
}

$('#chatForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const input = $('#chatInput');
  const honeypot = $('#chatWebsite');
  if (!input?.checkValidity() || honeypot?.value) return;
  const question = input.value.trim();
  input.value = '';
  send(question);
});
$$('.suggestions button').forEach(button => button.addEventListener('click', () => send(button.dataset.q)));

const CONSENT_KEY = 'sabir-analytics-consent-v1';

function loadAnalytics() {
  if (document.querySelector('script[data-sabir-analytics]')) return;
  window.va = window.va || function (...args) { (window.vaq = window.vaq || []).push(args); };
  const script = document.createElement('script');
  script.src = '/_vercel/insights/script.js';
  script.defer = true;
  script.dataset.sabirAnalytics = 'true';
  document.head.appendChild(script);
}

function setAnalyticsConsent(value) {
  localStorage.setItem(CONSENT_KEY, value);
  const banner = $('#cookieBanner');
  if (banner) banner.hidden = true;
  if (value === 'accepted') loadAnalytics();
}

function initConsent() {
  const banner = $('#cookieBanner');
  const saved = localStorage.getItem(CONSENT_KEY);
  if (!banner) return;
  banner.hidden = Boolean(saved);
  $('#cookieAccept')?.addEventListener('click', () => setAnalyticsConsent('accepted'));
  $('#cookieRefuse')?.addEventListener('click', () => setAnalyticsConsent('refused'));
  $('#cookieSettings')?.addEventListener('click', () => {
    banner.hidden = false;
    banner.querySelector('#cookieAccept')?.focus({ preventScroll: true });
  });
  if (saved === 'accepted') loadAnalytics();
}
initConsent();

const mobileMenu = $('#mobileMenu');
const mobilePanel = $('#mobilePanel');
if (mobileMenu && mobilePanel) {
  mobileMenu.addEventListener('click', () => {
    const open = mobilePanel.classList.toggle('open');
    mobileMenu.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  mobilePanel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobilePanel.classList.remove('open');
    mobileMenu.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-label', 'Ouvrir le menu');
  }));
}

$('#mobileAI')?.addEventListener('click', () => {
  mobilePanel?.classList.remove('open');
  mobileMenu?.setAttribute('aria-expanded', 'false');
  openModal('aiModal');
});

const navAnchors = $$('.nav-links a');
if ('IntersectionObserver' in window) {
  const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
  }), { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
  $$('main section[id]').forEach(section => navObserver.observe(section));
}

let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    $('#nav')?.classList.toggle('scrolled', scrollY > 30);
    ticking = false;
  });
}, { passive: true });

if (window.matchMedia?.('(pointer:fine)').matches) {
  const glow = document.createElement('div');
  glow.className = 'pointer-glow';
  Object.assign(glow.style, {
    position: 'fixed', width: '280px', height: '280px', borderRadius: '50%', pointerEvents: 'none',
    zIndex: '0', opacity: '0', background: 'radial-gradient(circle,rgba(124,124,255,.09),transparent 68%)',
    transform: 'translate(-50%,-50%)'
  });
  document.body.appendChild(glow);
  addEventListener('pointermove', e => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
    glow.style.opacity = '1';
  }, { passive: true });

  $$('.skill,.project-card,.contact-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${(-y * 2.2).toFixed(2)}deg) rotateY(${(x * 2.2).toFixed(2)}deg) translateY(-3px)`;
    }, { passive: true });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* Interactive studio scenography */
const studio = document.querySelector('.studio-scene');
const studioViewport = document.querySelector('.studio-viewport');
if (studio && studioViewport) {
  let studioTicking = false;
  const updateStudio = () => {
    const rect = studio.getBoundingClientRect();
    const range = Math.max(1, studio.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / range));
    studio.style.setProperty('--studio-scroll', progress.toFixed(3));
    studioTicking = false;
  };
  addEventListener('scroll', () => {
    if (studioTicking) return;
    studioTicking = true;
    requestAnimationFrame(updateStudio);
  }, { passive: true });
  updateStudio();

  if (window.matchMedia?.('(pointer:fine)').matches) {
    studioViewport.addEventListener('pointermove', e => {
      const rect = studioViewport.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - .5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - .5) * 2;
      studio.style.setProperty('--studio-x', (x * 16).toFixed(2));
      studio.style.setProperty('--studio-y', (y * 12).toFixed(2));
    }, { passive: true });
    studioViewport.addEventListener('pointerleave', () => {
      studio.style.setProperty('--studio-x', '0');
      studio.style.setProperty('--studio-y', '0');
    });
  }
}

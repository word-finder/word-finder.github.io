// ── Shared Header Component ──────────────────────────────
function renderHeader(activePage) {
  const header = document.getElementById('site-header');
  if (!header) return;

  const pages = [
    { href: '/index.html',          label: 'Word Finder' },
    { href: '/crossword-solver.html', label: 'Crossword Solver' },
    { href: '/random-word-generator.html', label: 'Random Words' },
    { href: '/rhyming-words.html',   label: 'Rhyming Words' },
    { href: '/acronym-generator.html', label: 'Acronym Generator' },
  ];

  header.innerHTML = `
    <div class="header-inner">
      <a href="/index.html" class="logo" aria-label="WordFinder Home">
        <span class="logo-icon">
          <svg width="34" height="34" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="10" fill="var(--accent)"/>
            <text x="18" y="25" text-anchor="middle" font-family="serif" font-size="20" font-weight="700" fill="white">W</text>
          </svg>
        </span>
        <span class="logo-text">Word<strong>Finder</strong></span>
      </a>
      <nav class="main-nav" id="main-nav" role="navigation" aria-label="Main navigation">
        <ul>
          ${pages.map(p => `<li><a href="${p.href}" class="${p.label === activePage ? 'active' : ''}">${p.label}</a></li>`).join('')}
        </ul>
      </nav>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="main-nav">
        <span></span><span></span><span></span>
      </button>
    </div>
  `;

  const toggle = document.getElementById('nav-toggle');
  const nav    = document.getElementById('main-nav');
  toggle.addEventListener('click', () => {
    const exp = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !exp);
    nav.classList.toggle('open');
    toggle.classList.toggle('active');
  });
  nav.querySelectorAll('a').forEach(l => l.addEventListener('click', () => {
    nav.classList.remove('open'); toggle.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  }));
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 60));
}

// ── Shared Footer Component ──────────────────────────────
function renderFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="/index.html" class="logo footer-logo" aria-label="WordFinder Home">
          <svg width="30" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="10" fill="var(--accent)"/>
            <text x="18" y="25" text-anchor="middle" font-family="serif" font-size="20" font-weight="700" fill="white">W</text>
          </svg>
          <span class="logo-text">Word<strong>Finder</strong></span>
        </a>
        <p class="footer-tagline">Your complete toolkit for word games, puzzles, and vocabulary mastery.</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>Tools</h4>
          <ul>
            <li><a href="/index.html">Word Finder</a></li>
            <li><a href="/crossword-solver.html">Crossword Solver</a></li>
            <li><a href="/random-word-generator.html">Random Word Generator</a></li>
            <li><a href="/rhyming-words.html">Rhyming Words</a></li>
            <li><a href="/acronym-generator.html">Acronym Generator</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Games</h4>
          <ul>
            <li><a href="/index.html">Scrabble Helper</a></li>
            <li><a href="/index.html">Wordle Solver</a></li>
            <li><a href="/index.html">Words With Friends</a></li>
            <li><a href="/crossword-solver.html">Crossword Helper</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Learn</h4>
          <ul>
            <li><a href="/index.html#how-it-works">How It Works</a></li>
            <li><a href="/index.html#word-tips">Tips & Tricks</a></li>
            <li><a href="/index.html#faq">FAQ</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} WordFinder &mdash; <a href="https://word-finder.github.io">word-finder.github.io</a>. All rights reserved.</p>
      <p>Free educational word tools for games and learning.</p>
    </div>
  `;
}

// ── Network Bar ──────────────────────────────────────────
function renderNetworkBar(currentLabel) {
  const bar = document.getElementById('network-bar');
  if (!bar) return;
  const tools = [
    { href: '/index.html',                label: '🔤 Word Finder' },
    { href: '/crossword-solver.html',      label: '✏️ Crossword Solver' },
    { href: '/random-word-generator.html', label: '🎲 Random Words' },
    { href: '/rhyming-words.html',         label: '🎵 Rhyming Words' },
    { href: '/acronym-generator.html',     label: '🔡 Acronym Generator' },
  ];
  bar.innerHTML = `
    <div class="container">
      <div class="network-bar-inner">
        <span class="network-bar-label">Also Try</span>
        ${tools.map(t => `<a href="${t.href}" class="network-link${t.label.includes(currentLabel) ? ' current' : ''}">${t.label}</a>`).join('')}
      </div>
    </div>
  `;
}

// ── Copy Toast ───────────────────────────────────────────
function showCopyToast(msg = 'Copied!') {
  let toast = document.getElementById('copy-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'copy-toast';
    toast.className = 'copy-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}

// ── Chip click-to-copy ───────────────────────────────────
function addCopyChips(container) {
  container.querySelectorAll('.word-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const word = chip.dataset.word || chip.textContent.trim();
      navigator.clipboard?.writeText(word);
      chip.classList.add('copied');
      showCopyToast(`"${word}" copied!`);
      setTimeout(() => chip.classList.remove('copied'), 1400);
    });
  });
}

// ── Scroll animations ────────────────────────────────────
function initScrollAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.animate-on-scroll').forEach(el => obs.observe(el));
}

// ── FAQ accordion ────────────────────────────────────────
function initFaq() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const open = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => { i.classList.remove('open'); i.querySelector('.faq-question').setAttribute('aria-expanded','false'); });
      if (!open) { item.classList.add('open'); btn.setAttribute('aria-expanded','true'); }
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initFaq();
});

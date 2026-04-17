function renderHeader() {
  const header = document.getElementById('site-header');
  if (!header) return;
  header.innerHTML = `
    <div class="header-inner">
      <a href="/" class="logo" aria-label="WordFinder Home">
        <span class="logo-icon">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="36" height="36" rx="10" fill="var(--accent)"/>
            <text x="18" y="25" text-anchor="middle" font-family="serif" font-size="20" font-weight="700" fill="white">W</text>
          </svg>
        </span>
        <span class="logo-text">Word<strong>Finder</strong></span>
      </a>
      <nav class="main-nav" id="main-nav" role="navigation" aria-label="Main navigation">
        <ul>
          <li><a href="/#finder-tool">Word Finder</a></li>
          <li><a href="crossword-solver">Crossword Solver</a></li>
          <li><a href="random-word-generator">Random Words</a></li>
          <li><a href="rhyming-words">Rhyming Words</a></li>          
          <li><a href="acronym-generator">Acronym Generator</a></li>
          <li><a href="about">About us</a></li>
        </ul>
      </nav>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle navigation" aria-expanded="false" aria-controls="main-nav">
        <span></span><span></span><span></span>
      </button>
    </div>
  `;

  // Mobile nav toggle
  const toggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('main-nav');
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', !expanded);
    nav.classList.toggle('open');
    toggle.classList.toggle('active');
  });

  // Close nav on link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Sticky header on scroll
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });
}

document.addEventListener('DOMContentLoaded', renderHeader);

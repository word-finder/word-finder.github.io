function renderFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand">
        <a href="/" class="logo footer-logo" aria-label="WordFinder Home">
          <span class="logo-icon">
            <svg width="30" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="var(--accent)"/>
              <text x="18" y="25" text-anchor="middle" font-family="serif" font-size="20" font-weight="700" fill="white">W</text>
            </svg>
          </span>
          <span class="logo-text">Word<strong>Finder</strong></span>
        </a>
        <p class="footer-tagline">Your ultimate companion for word games, puzzles, and vocabulary mastery.</p>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>Tools</h4>
          <ul>
            <li><a href="#finder-tool">Word Finder</a></li>
            <li><a href="#unscramble">Word Unscrambler</a></li>
            <li><a href="#word-length">Words by Length</a></li>
            <li><a href="#starts-ends">Starts / Ends With</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Pages</h4>
          <ul>
            <li><a href="about">About</a></li>
            <li><a href="contact">Contact</a></li>
            <li><a href="privacy-policy">Privacy Policy</a></li>
            <li><a href="terms-of-use">Terms of Use</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Learn</h4>
          <ul>
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#word-tips">Tips & Tricks</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#word-of-the-day">Word of the Day</a></li>
          </ul>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; ${new Date().getFullYear()} WordFinder &mdash; <a href="https://word-finder.github.io">word-finder.github.io</a>. All rights reserved.</p>
      <p class="footer-disclaimer">WordFinder is an educational tool for word games and vocabulary building. Not affiliated with any specific game publisher.</p>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', renderFooter);

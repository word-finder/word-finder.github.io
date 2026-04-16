// Main App Controller - Updated for Async Loading

document.addEventListener('DOMContentLoaded', async () => {
  
  // 1. Initialize engine from text file
  // This must complete before Word of the Day or Searches can work
  const isLoaded = await WordEngine.init('word.txt');

  if (!isLoaded) {
    console.error("Application failed to start: Dictionary not found.");
    return;
  }

  // ─── Word of the Day ───────────────────────────────────────────────────────
  function renderWOTD() {
    const el = document.getElementById('wotd-word');
    const scoreEl = document.getElementById('wotd-score');
    if (!el) return;
    
    const wotd = WordEngine.wordOfTheDay();
    if (wotd) {
      el.textContent = wotd.toUpperCase();
      if (scoreEl) scoreEl.textContent = `Scrabble Score: ${WordEngine.scrabbleScore(wotd)}`;
      
      el.innerHTML = wotd.toUpperCase().split('').map((ch, i) =>
        `<span class="wotd-letter" style="animation-delay:${i * 0.12}s">${ch}</span>`
      ).join('');
    }
  }
  renderWOTD();

  // ─── Main Word Finder Tool ─────────────────────────────────────────────────
  const finderForm = document.getElementById('finder-form');
  const finderInput = document.getElementById('finder-input');
  const finderResults = document.getElementById('finder-results');
  const finderLoading = document.getElementById('finder-loading');
  const finderStats = document.getElementById('finder-stats');
  const filterBtns = document.querySelectorAll('.filter-btn');
  let currentResults = [];
  let activeFilter = 'all';

  function renderResults(words) {
    if (!words.length) {
      finderResults.innerHTML = `<div class="no-results"><span class="no-results-icon">🔍</span><p>No words found. Try different letters!</p></div>`;
      if (finderStats) finderStats.textContent = '';
      return;
    }
    const scored = WordEngine.withScores(words);
    if (finderStats) {
      finderStats.innerHTML = `<strong>${words.length.toLocaleString()}</strong> words found — sorted by Scrabble score`;
    }

    const byLen = {};
    scored.forEach(({word, score, length}) => {
      if (!byLen[length]) byLen[length] = [];
      byLen[length].push({word, score});
    });

    let html = '';
    const lengths = Object.keys(byLen).map(Number).sort((a,b) => b - a);

    if (activeFilter !== 'all') {
      const len = parseInt(activeFilter);
      html += renderGroup(len, byLen[len] || []);
    } else {
      lengths.forEach(len => html += renderGroup(len, byLen[len]));
    }

    finderResults.innerHTML = html;

    finderResults.querySelectorAll('.word-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const word = chip.dataset.word;
        navigator.clipboard?.writeText(word);
        chip.classList.add('copied');
        setTimeout(() => chip.classList.remove('copied'), 1200);
      });
    });

    updateFilterCounts(byLen);
  }

  function renderGroup(len, words) {
    if (!words.length) return '';
    return `
      <div class="result-group">
        <div class="result-group-header">
          <span class="length-badge">${len} letters</span>
          <span class="group-count">${words.length} word${words.length !== 1 ? 's' : ''}</span>
        </div>
        <div class="word-chips">
          ${words.slice(0, 100).map(({word, score}) =>
            `<span class="word-chip" data-word="${word}" data-score="${score}" title="Score: ${score}">
              ${word}
              <span class="chip-score">${score}</span>
            </span>`
          ).join('')}
          ${words.length > 100 ? `<span class="more-words">+${words.length - 100} more</span>` : ''}
        </div>
      </div>
    `;
  }

  function updateFilterCounts(byLen) {
    filterBtns.forEach(btn => {
      const f = btn.dataset.filter;
      if (f === 'all') {
        btn.querySelector('.filter-count').textContent = currentResults.length;
      } else {
        const len = parseInt(f);
        btn.querySelector('.filter-count').textContent = (byLen[len] || []).length;
      }
    });
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderResults(currentResults);
    });
  });

  if (finderForm) {
    finderForm.addEventListener('submit', e => {
      e.preventDefault();
      const letters = finderInput.value.trim();
      if (!letters) return;
      
      finderLoading.classList.add('visible');
      finderResults.innerHTML = '';
      if (finderStats) finderStats.textContent = '';

      setTimeout(() => {
        const mustInclude = document.getElementById('must-include')?.value.trim() || '';
        const minLen = parseInt(document.getElementById('min-length')?.value || '2');
        const maxLen = parseInt(document.getElementById('max-length')?.value || letters.length);
        
        currentResults = WordEngine.findFromLetters(letters, { minLen, maxLen, mustInclude });
        finderLoading.classList.remove('visible');
        renderResults(currentResults);
        document.getElementById('finder-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    });
  }

  // ─── Unscramble Tool ───────────────────────────────────────────────────────
  const unscrambleForm = document.getElementById('unscramble-form');
  const unscrambleResults = document.getElementById('unscramble-results');

  if (unscrambleForm) {
    unscrambleForm.addEventListener('submit', e => {
      e.preventDefault();
      const letters = document.getElementById('unscramble-input')?.value.trim();
      if (!letters) return;
      
      const results = WordEngine.findFromLetters(letters);
      if (!results.length) {
        unscrambleResults.innerHTML = `<div class="no-results"><p>No words found.</p></div>`;
        return;
      }
      const scored = WordEngine.withScores(results);
      unscrambleResults.innerHTML = `
        <div class="unscramble-header"><strong>${results.length}</strong> words from <em>${letters.toUpperCase()}</em></div>
        <div class="word-chips">
          ${scored.slice(0, 150).map(({word, score}) =>
            `<span class="word-chip" data-word="${word}" data-score="${score}">${word}<span class="chip-score">${score}</span></span>`
          ).join('')}
        </div>
      `;
    });
  }

  // ─── Starts / Ends With ───────────────────────────────────────────────────
  const seForm = document.getElementById('se-form');
  const seResults = document.getElementById('se-results');

  if (seForm) {
    seForm.addEventListener('submit', e => {
      e.preventDefault();
      const mode = document.querySelector('input[name="se-mode"]:checked')?.value || 'starts';
      const text = document.getElementById('se-input')?.value.trim();
      if (!text) return;

      const results = mode === 'starts' ? WordEngine.startsWith(text) : WordEngine.endsWith(text);
      if (!results.length) {
        seResults.innerHTML = `<div class="no-results"><p>No words found.</p></div>`;
        return;
      }
      const scored = WordEngine.withScores(results);
      seResults.innerHTML = `
        <div class="unscramble-header"><strong>${results.length}</strong> words ${mode === 'starts' ? 'starting' : 'ending'} with <em>${text.toUpperCase()}</em></div>
        <div class="word-chips">
          ${scored.slice(0, 200).map(({word, score}) =>
            `<span class="word-chip" data-word="${word}">${word}<span class="chip-score">${score}</span></span>`
          ).join('')}
        </div>
      `;
    });
  }

  // ─── Pattern & Length & Validator ──────────────────────────────────────────
  // (Remaining utility logic follows the same pattern as your previous code)
  
  const lengthBtns = document.querySelectorAll('.length-selector-btn');
  const lengthResults = document.getElementById('length-results');

  lengthBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      lengthBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const len = parseInt(btn.dataset.length);
      const words = WordEngine.byLength(len);
      const scored = WordEngine.withScores(words.slice(0, 300));
      lengthResults.innerHTML = `
        <div class="unscramble-header"><strong>${words.length.toLocaleString()}</strong> words with ${len} letters</div>
        <div class="word-chips">${scored.map(s => `<span class="word-chip">${s.word}<span class="chip-score">${s.score}</span></span>`).join('')}</div>
      `;
    });
  });

  const patternForm = document.getElementById('pattern-form');
  const patternResults = document.getElementById('pattern-results');
  if (patternForm) {
    patternForm.addEventListener('submit', e => {
      e.preventDefault();
      const pattern = document.getElementById('pattern-input')?.value.trim();
      if (!pattern) return;
      const results = WordEngine.matchPattern(pattern);
      patternResults.innerHTML = `<div class="word-chips">${results.slice(0, 100).map(w => `<span class="word-chip">${w}</span>`).join('')}</div>`;
    });
  }

  const validatorInput = document.getElementById('validator-input');
  const validatorResult = document.getElementById('validator-result');
  if (validatorInput) {
    validatorInput.addEventListener('input', () => {
      const word = validatorInput.value.trim();
      if (!word) { validatorResult.innerHTML = ''; return; }
      const valid = WordEngine.isValid(word);
      validatorResult.innerHTML = valid 
        ? `<span class="valid-yes">✓ Valid!</span>` 
        : `<span class="valid-no">✗ Invalid</span>`;
    });
  }

  // Hero shortcut
  const heroForm = document.getElementById('hero-form');
  if (heroForm) {
    heroForm.addEventListener('submit', e => {
      e.preventDefault();
      const val = document.getElementById('hero-input')?.value.trim();
      if (val && finderInput) {
        finderInput.value = val;
        document.getElementById('finder-tool')?.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => finderForm?.dispatchEvent(new Event('submit')), 400);
      }
    });
  }

  // Intersection Observer for animations
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
});

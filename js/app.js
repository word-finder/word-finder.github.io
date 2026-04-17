document.addEventListener('DOMContentLoaded', () => {
  WordEngine.init().then(() => {
    // All your existing initialization code
    renderWOTD();
    // ... rest of your app code
  });
});

  // ─── Word of the Day ───────────────────────────────────────────────────────
  function renderWOTD() {
    const el = document.getElementById('wotd-word');
    const defEl = document.getElementById('wotd-def');
    const scoreEl = document.getElementById('wotd-score');
    if (!el) return;
    const wotd = WordEngine.wordOfTheDay();
    if (wotd) {
      el.textContent = wotd.toUpperCase();
      scoreEl.textContent = `Scrabble Score: ${WordEngine.scrabbleScore(wotd)}`;
      // Animate letters
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
      finderStats.textContent = '';
      return;
    }
    const scored = WordEngine.withScores(words);
    finderStats.innerHTML = `<strong>${words.length.toLocaleString()}</strong> words found — sorted by Scrabble score`;

    // Group by length
    const byLen = {};
    scored.forEach(({word, score, length}) => {
      if (!byLen[length]) byLen[length] = [];
      byLen[length].push({word, score});
    });

    let html = '';
    const lengths = Object.keys(byLen).map(Number).sort((a,b) => b - a);

    if (activeFilter !== 'all') {
      const len = parseInt(activeFilter);
      const group = byLen[len] || [];
      html += renderGroup(len, group);
    } else {
      lengths.forEach(len => {
        html += renderGroup(len, byLen[len]);
      });
    }

    finderResults.innerHTML = html;

    // Add click to copy
    finderResults.querySelectorAll('.word-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const word = chip.dataset.word;
        navigator.clipboard?.writeText(word);
        chip.classList.add('copied');
        chip.title = 'Copied!';
        setTimeout(() => { chip.classList.remove('copied'); chip.title = `Score: ${chip.dataset.score}`; }, 1200);
      });
    });

    // Update filter buttons
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
      finderStats.textContent = '';

      setTimeout(() => {
        const mustInclude = document.getElementById('must-include')?.value.trim() || '';
        const minLen = parseInt(document.getElementById('min-length')?.value || '2');
        const maxLen = parseInt(document.getElementById('max-length')?.value || letters.length);
        currentResults = WordEngine.findFromLetters(letters, { minLen, maxLen, mustInclude });
        finderLoading.classList.remove('visible');
        renderResults(currentResults);
        document.getElementById('finder-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    });
  }

  // ─── Unscramble Tool ───────────────────────────────────────────────────────
  const unscrambleForm = document.getElementById('unscramble-form');
  const unscrambleInput = document.getElementById('unscramble-input');
  const unscrambleResults = document.getElementById('unscramble-results');

  if (unscrambleForm) {
    unscrambleForm.addEventListener('submit', e => {
      e.preventDefault();
      const letters = unscrambleInput.value.trim();
      if (!letters) return;
      const results = WordEngine.findFromLetters(letters);
      if (!results.length) {
        unscrambleResults.innerHTML = `<div class="no-results"><span class="no-results-icon">🔤</span><p>No unscrambled words found.</p></div>`;
        return;
      }
      const scored = WordEngine.withScores(results);
      unscrambleResults.innerHTML = `
        <div class="unscramble-header">
          <strong>${results.length}</strong> words from <em>${letters.toUpperCase()}</em>
        </div>
        <div class="word-chips">
          ${scored.slice(0, 150).map(({word, score}) =>
            `<span class="word-chip" data-word="${word}" data-score="${score}" title="Score: ${score}">${word}<span class="chip-score">${score}</span></span>`
          ).join('')}
        </div>
      `;
      unscrambleResults.querySelectorAll('.word-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          navigator.clipboard?.writeText(chip.dataset.word);
          chip.classList.add('copied');
          setTimeout(() => chip.classList.remove('copied'), 1200);
        });
      });
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
        <div class="unscramble-header">
          <strong>${results.length}</strong> words ${mode === 'starts' ? 'starting with' : 'ending with'} <em>${text.toUpperCase()}</em>
        </div>
        <div class="word-chips">
          ${scored.slice(0, 200).map(({word, score}) =>
            `<span class="word-chip" data-word="${word}" data-score="${score}" title="Score: ${score}">${word}<span class="chip-score">${score}</span></span>`
          ).join('')}
        </div>
      `;
      seResults.querySelectorAll('.word-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          navigator.clipboard?.writeText(chip.dataset.word);
          chip.classList.add('copied');
          setTimeout(() => chip.classList.remove('copied'), 1200);
        });
      });
    });
  }

  // ─── Word by Length ────────────────────────────────────────────────────────
  const lengthBtns = document.querySelectorAll('.length-selector-btn');
  const lengthResults = document.getElementById('length-results');

  lengthBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      lengthBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const len = parseInt(btn.dataset.length);
      const words = WordEngine.byLength(len);
      if (!words.length) {
        lengthResults.innerHTML = `<div class="no-results"><p>No ${len}-letter words found.</p></div>`;
        return;
      }
      const scored = WordEngine.withScores(words.slice(0, 300));
      lengthResults.innerHTML = `
        <div class="unscramble-header"><strong>${words.length.toLocaleString()}</strong> words with ${len} letters</div>
        <div class="word-chips">
          ${scored.slice(0,200).map(({word, score}) =>
            `<span class="word-chip" data-word="${word}" data-score="${score}" title="Score: ${score}">${word}<span class="chip-score">${score}</span></span>`
          ).join('')}
        </div>
      `;
      lengthResults.querySelectorAll('.word-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          navigator.clipboard?.writeText(chip.dataset.word);
          chip.classList.add('copied');
          setTimeout(() => chip.classList.remove('copied'), 1200);
        });
      });
    });
  });

  // ─── Pattern Finder ────────────────────────────────────────────────────────
  const patternForm = document.getElementById('pattern-form');
  const patternResults = document.getElementById('pattern-results');

  if (patternForm) {
    patternForm.addEventListener('submit', e => {
      e.preventDefault();
      const pattern = document.getElementById('pattern-input')?.value.trim();
      if (!pattern) return;
      const results = WordEngine.matchPattern(pattern);
      if (!results.length) {
        patternResults.innerHTML = `<div class="no-results"><p>No words match this pattern.</p></div>`;
        return;
      }
      patternResults.innerHTML = `
        <div class="unscramble-header"><strong>${results.length}</strong> words match <em>${pattern.toUpperCase()}</em></div>
        <div class="word-chips">
          ${results.slice(0,150).map(w =>
            `<span class="word-chip" data-word="${w}" title="${w}">${w}<span class="chip-score">${WordEngine.scrabbleScore(w)}</span></span>`
          ).join('')}
        </div>
      `;
    });
  }

  // ─── Word Validator ────────────────────────────────────────────────────────
  const validatorInput = document.getElementById('validator-input');
  const validatorResult = document.getElementById('validator-result');

  if (validatorInput) {
    let validatorTimeout;
    validatorInput.addEventListener('input', () => {
      clearTimeout(validatorTimeout);
      const word = validatorInput.value.trim();
      if (!word) { validatorResult.innerHTML = ''; return; }
      validatorTimeout = setTimeout(() => {
        const valid = WordEngine.isValid(word);
        const score = WordEngine.scrabbleScore(word);
        validatorResult.innerHTML = valid
          ? `<span class="valid-yes">✓ <strong>${word.toUpperCase()}</strong> is a valid word! &nbsp; Scrabble score: <strong>${score}</strong></span>`
          : `<span class="valid-no">✗ <strong>${word.toUpperCase()}</strong> is not in our dictionary</span>`;
      }, 300);
    });
  }

  // ─── Hero search shortcut ──────────────────────────────────────────────────
  const heroForm = document.getElementById('hero-form');
  if (heroForm) {
    heroForm.addEventListener('submit', e => {
      e.preventDefault();
      const val = document.getElementById('hero-input')?.value.trim();
      if (!val) return;
      if (finderInput) finderInput.value = val;
      document.getElementById('finder-tool')?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => finderForm?.dispatchEvent(new Event('submit')), 400);
    });
  }

  // ─── Animate sections on scroll ───────────────────────────────────────────
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

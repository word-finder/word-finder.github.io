// Word Finder Engine
// Requires WORD_LIST to be loaded from wordlist.js

const WordEngine = (() => {
  let wordSet = null;
  let wordsByLength = {};

  function init() {
    if (!window.WORD_LIST) return;
    wordSet = new Set(WORD_LIST);
    WORD_LIST.forEach(w => {
      const len = w.length;
      if (!wordsByLength[len]) wordsByLength[len] = [];
      wordsByLength[len].push(w);
    });
  }

  function isValid(word) {
    return wordSet && wordSet.has(word.toLowerCase());
  }

  // Find all words that can be formed from given letters (anagram/subset)
  function findFromLetters(letters, options = {}) {
    const { minLen = 2, maxLen = letters.length, mustInclude = '', exact = false } = options;
    const input = letters.toLowerCase().replace(/[^a-z?*]/g, '');
    const results = [];
    const inputArr = input.split('');
    const wildcards = inputArr.filter(c => c === '?' || c === '*').length;
    const inputLetters = inputArr.filter(c => c !== '?' && c !== '*');

    for (const word of WORD_LIST) {
      if (word.length < minLen || word.length > maxLen) continue;
      if (exact && word.length !== letters.replace(/[^a-z?*]/gi,'').length) continue;
      if (mustInclude && !word.includes(mustInclude.toLowerCase())) continue;

      const wordLetters = word.split('');
      const available = [...inputLetters];
      let wildcardsUsed = 0;
      let canForm = true;

      for (const ch of wordLetters) {
        const idx = available.indexOf(ch);
        if (idx !== -1) {
          available.splice(idx, 1);
        } else if (wildcardsUsed < wildcards) {
          wildcardsUsed++;
        } else {
          canForm = false;
          break;
        }
      }

      if (canForm) results.push(word);
    }

    return results.sort((a, b) => b.length - a.length || a.localeCompare(b));
  }

  // Unscramble: words using ALL given letters
  function unscramble(letters) {
    const input = letters.toLowerCase().replace(/[^a-z]/g, '');
    const sorted = input.split('').sort().join('');
    return WORD_LIST.filter(w => {
      if (w.length > input.length) return false;
      return w.split('').sort().join('') === w.split('').sort().join('') &&
        canFormWord(w, input);
    }).sort((a, b) => b.length - a.length);
  }

  function canFormWord(word, letters) {
    const avail = letters.split('');
    for (const ch of word) {
      const idx = avail.indexOf(ch);
      if (idx === -1) return false;
      avail.splice(idx, 1);
    }
    return true;
  }

  // Words by length
  function byLength(len) {
    return wordsByLength[len] || [];
  }

  // Words starting with prefix
  function startsWith(prefix, maxResults = 200) {
    const p = prefix.toLowerCase();
    return WORD_LIST.filter(w => w.startsWith(p)).slice(0, maxResults)
      .sort((a, b) => a.length - b.length || a.localeCompare(b));
  }

  // Words ending with suffix
  function endsWith(suffix, maxResults = 200) {
    const s = suffix.toLowerCase();
    return WORD_LIST.filter(w => w.endsWith(s)).slice(0, maxResults)
      .sort((a, b) => a.length - b.length || a.localeCompare(b));
  }

  // Words matching a pattern: e.g., "c_t" or "?at"
  function matchPattern(pattern) {
    const p = pattern.toLowerCase();
    const regex = new RegExp('^' + p.replace(/[?_]/g, '.') + '$');
    return WORD_LIST.filter(w => regex.test(w))
      .sort((a, b) => a.length - b.length);
  }

  // Contains specific letters
  function containsLetters(letters, mustContain) {
    const input = letters.toLowerCase().replace(/[^a-z]/g, '');
    const must = mustContain.toLowerCase().replace(/[^a-z]/g, '');
    return findFromLetters(input, { mustInclude: '' })
      .filter(w => must.split('').every(ch => w.includes(ch)));
  }

  // Get word of the day (deterministic by date)
  function wordOfTheDay() {
    const words5 = wordsByLength[5] || [];
    if (!words5.length) return null;
    const dayIndex = Math.floor(Date.now() / 86400000);
    return words5[dayIndex % words5.length];
  }

  // Score a word (Scrabble values)
  const SCRABBLE_VALUES = {
    a:1,b:3,c:3,d:2,e:1,f:4,g:2,h:4,i:1,j:8,k:5,l:1,m:3,
    n:1,o:1,p:3,q:10,r:1,s:1,t:1,u:1,v:4,w:4,x:8,y:4,z:10
  };

  function scrabbleScore(word) {
    return word.toLowerCase().split('').reduce((sum, ch) => sum + (SCRABBLE_VALUES[ch] || 0), 0);
  }

  // Get high-scoring words from a set of results
  function withScores(words) {
    return words.map(w => ({ word: w, score: scrabbleScore(w), length: w.length }))
      .sort((a, b) => b.score - a.score || b.length - a.length);
  }

  return { init, isValid, findFromLetters, unscramble, byLength, startsWith, endsWith, matchPattern, wordOfTheDay, scrabbleScore, withScores };
})();

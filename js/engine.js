// Word Finder Engine 
// Now fetches data from word.txt instead of wordlist.js

const WordEngine = (() => {
  let wordSet = null;
  let wordsByLength = {};
  let WORD_LIST = []; 

  /**
   * NEW: Asynchronous initialization
   * Fetches word.txt and parses it into the engine
   */
  async function init(filePath = 'word.txt') {
    try {
      const response = await fetch(filePath);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const text = await response.text();
      
      // Convert text to array: split by newline, trim whitespace, remove empty lines
      WORD_LIST = text.split(/\r?\n/)
                      .map(w => w.trim().toLowerCase())
                      .filter(w => w.length > 0);
      
      wordSet = new Set(WORD_LIST);
      wordsByLength = {}; 
      
      WORD_LIST.forEach(w => {
        const len = w.length;
        if (!wordsByLength[len]) wordsByLength[len] = [];
        wordsByLength[len].push(w);
      });

      console.log(`Successfully loaded ${WORD_LIST.length} words from ${filePath}`);
      return true;
    } catch (error) {
      console.error("Critical error loading word list:", error);
      return false;
    }
  }

  function isValid(word) {
    return wordSet && wordSet.has(word.toLowerCase());
  }

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

  function unscramble(letters) {
    const input = letters.toLowerCase().replace(/[^a-z]/g, '');
    return WORD_LIST.filter(w => {
      if (w.length > input.length) return false;
      return canFormWord(w, input);
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

  function byLength(len) {
    return wordsByLength[len] || [];
  }

  function startsWith(prefix, maxResults = 200) {
    const p = prefix.toLowerCase();
    return WORD_LIST.filter(w => w.startsWith(p)).slice(0, maxResults)
      .sort((a, b) => a.length - b.length || a.localeCompare(b));
  }

  function endsWith(suffix, maxResults = 200) {
    const s = suffix.toLowerCase();
    return WORD_LIST.filter(w => w.endsWith(s)).slice(0, maxResults)
      .sort((a, b) => a.length - b.length || a.localeCompare(b));
  }

  function matchPattern(pattern) {
    const p = pattern.toLowerCase();
    const regex = new RegExp('^' + p.replace(/[?_]/g, '.') + '$');
    return WORD_LIST.filter(w => regex.test(w))
      .sort((a, b) => a.length - b.length);
  }

  function wordOfTheDay() {
    const words5 = wordsByLength[5] || [];
    if (!words5.length) return null;
    const dayIndex = Math.floor(Date.now() / 86400000);
    return words5[dayIndex % words5.length];
  }

  const SCRABBLE_VALUES = {
    a:1,b:3,c:3,d:2,e:1,f:4,g:2,h:4,i:1,j:8,k:5,l:1,m:3,
    n:1,o:1,p:3,q:10,r:1,s:1,t:1,u:1,v:4,w:4,x:8,y:4,z:10
  };

  function scrabbleScore(word) {
    return word.toLowerCase().split('').reduce((sum, ch) => sum + (SCRABBLE_VALUES[ch] || 0), 0);
  }

  function withScores(words) {
    return words.map(w => ({ word: w, score: scrabbleScore(w), length: w.length }))
      .sort((a, b) => b.score - a.score || b.length - a.length);
  }

  return { init, isValid, findFromLetters, unscramble, byLength, startsWith, endsWith, matchPattern, wordOfTheDay, scrabbleScore, withScores };
})();

// wordlist.js - Loads words from words.txt
const WORD_LIST = [];

// Fetch words from words.txt
fetch('words.txt')
  .then(response => response.text())
  .then(text => {
    // Split by newlines, trim, filter empty lines
    const words = text.split(/\r?\n/).filter(word => word.trim().length > 0);
    // Push all words into WORD_LIST array
    WORD_LIST.push(...words);
    
    // Dispatch event when words are loaded
    const event = new CustomEvent('wordlistLoaded', { detail: words });
    document.dispatchEvent(event);
  })
  .catch(error => {
    console.error('Failed to load words.txt:', error);
    // Fallback to empty array
  });

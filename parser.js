/**
 * Parses raw text into a structured format for visualization.
 * @param {string} text The raw text input.
 * @returns {Object} A structured data object. 
 */
function parseText(text) {
    console.log('Parsing text...');

    const verses = text.split('\n').map((t, i) => ({
        id: i + 1,
        text: t.trim()
    })).filter(v => v.text.length > 0);

    const pairs = generatePalindromePairs(verses);

    return {
        title: 'Custom Text',
        verses: verses,
        pairs: pairs
    };
}

/**
 * Generates palindrome pairs from an array of verses.
 * @param {Array} verses The array of verses.
 * @returns {Array} An array of pairs.
 */
function generatePalindromePairs(verses) {
    const pairs = [];
    let start = 0;
    let end = verses.length - 1;
    while (start < end) {
        pairs.push({
            a: start,
            b: end
        });
        start++;
        end--;
    }
    if (start === end) { // Center element
        pairs.push({
            a: start,
            b: start
        });
    }
    return pairs;
}

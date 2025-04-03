import { logger } from '@/utils/logger';

/**
 * Service that determines "safe letters" for word completion exercises
 * Implements custom algorithm to identify letters that can be used in exercises
 */
export class SafeLettersService {
  
  /**
   * Get "safe letters" that can be used for word completion exercises
   * @param word The word to analyze
   * @returns Array of safe letter positions
   * 
   * As long as I don't have exactly the right algorithm, I will use a my version
   * that always includes first letter and all vowels in the word. Also the last letter, if it is not yet included.
   * The maximum number of safe letters is limited to 60% of the word length.
   */
  async getSafeLetters(word: string): Promise<string[]> {
    try {
      logger.debug(`Determining safe letters for word "${word}"`);
      
      const normalizedWord = word.toLowerCase();
      const safeLetters: string[] = [];
      
      const vowels = ['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'];
      
      safeLetters.push(normalizedWord[0]);
      
      for (let i = 1; i < normalizedWord.length; i++) {
        const letter = normalizedWord[i];
        if (vowels.includes(letter)) {
          safeLetters.push(letter);
        }
      }
      
      if (!safeLetters.includes(normalizedWord[normalizedWord.length - 1])) {
        safeLetters.push(normalizedWord[normalizedWord.length - 1]);
      }
      
      const maxSafeLetters = Math.ceil(normalizedWord.length * 0.6); // Ensure we don't have too many safe letters (max 60% of word)
      const finalSafeLetters = [...new Set(safeLetters)].slice(0, maxSafeLetters);
      
      logger.debug(`Safe letters for "${word}": ${finalSafeLetters.join(', ')}`);
      return finalSafeLetters;
    } catch (error) {
      logger.error(`Error determining safe letters for "${word}":`, error);
      // Just in case...
      return [word[0].toLowerCase(), word[word.length - 1].toLowerCase()];
    }
  }
}

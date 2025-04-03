import { logger } from '@/utils/logger';

/**
 * Service for determining word frequency in a given language
 * Uses the wordfreq library or equivalent API to calculate how common a word is
 */
export class FrequencyService {
  private apiKey: string;
  private endpoint: string;
  
  constructor() {
    this.apiKey = process.env.WORDFREQ_API_KEY || '';
    this.endpoint = process.env.WORDFREQ_ENDPOINT || '';
  }
  
  /**
   * Get the frequency of a word in a specific language
   * @param word The word to check
   * @param language The language code (ISO 639-1)
   * @returns A number between 0 and 1 representing the word's frequency
   */
  async getWordFrequency(word: string, language: string): Promise<number> {
    try {
      logger.debug(`Getting frequency for word "${word}" in ${language}`);
      
      if (!this.apiKey || process.env.NODE_ENV !== 'production') { // As long as API key is not available, use mock data
        return this.getMockFrequency(word, language);
      }
      
      const response = await fetch(`${this.endpoint}?word=${encodeURIComponent(word)}&lang=${language}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Frequency API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.frequency || 0;
    } catch (error) {
      logger.warn(`Failed to get word frequency for "${word}": ${(error as Error).message}`);
      return this.getMockFrequency(word, language);
    }
  }
  
  /**
   * Provides a mock word frequency when the API is unavailable
   * Uses a deterministic algorithm based on word properties
   */
  private getMockFrequency(word: string, language: string): number {
    const normalizedWord = word.toLowerCase();
    const wordLength = normalizedWord.length;
    
    let lengthFactor = 0;
    if (wordLength >= 5 && wordLength <= 8) {
      lengthFactor = 0.7;
    } else if (wordLength < 5) {
      lengthFactor = 0.5 + (wordLength * 0.1);
    } else {
      lengthFactor = 0.9 - ((wordLength - 8) * 0.05);
    }
    
    const charSum = normalizedWord.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const randomFactor = (charSum % 100) / 100;
    
    let frequency = (lengthFactor * 0.7) + (randomFactor * 0.3);
    frequency = Math.max(0.01, Math.min(0.99, frequency));
    
    logger.debug(`Generated mock frequency for "${word}": ${frequency}`);
    return frequency;
  }
}

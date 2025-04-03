import { logger } from '../../utils/logger';

/**
 * Service for checking the availability of audio and image resources for words
 * Implements the Adapter pattern to integrate with media APIs
 * 
 * I don't know if it should be determined by the therapists or it should be outsorsed with KI
 * in that case it may seem reasonable to mark those words for later check by the therapists. Currently not implemented.
 */
export class MediaAvailabilityService {
  private apiEndpoint: string;
  
  constructor() {
    this.apiEndpoint = process.env.MEDIA_API_ENDPOINT || '';
  }
  
  /**
   * Check if audio and image are available for a given word
   * @param word The word to check
   * @param language The language of the word
   * @returns Object indicating availability of audio and image
   */
  public async checkAvailability(word: string, language: string): Promise<{ hasAudio: boolean; hasImage: boolean }> {
    try {
      logger.debug(`Checking media availability for "${word}" in ${language}`);
      
      if (process.env.NODE_ENV !== 'production') {
        return this.getMockAvailability(word);
      }
      
      // Real implementation would call an actual API
      const response = await fetch(`${this.apiEndpoint}?word=${encodeURIComponent(word)}&lang=${language}`);
      
      if (!response.ok) {
        throw new Error(`Media API error: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        hasAudio: data.audio || false,
        hasImage: data.image || false
      };
    } catch (error) {
      logger.warn(`Media availability check failed for "${word}": ${(error as Error).message}`);
      throw new Error(`Media availability check failed: ${(error as Error).message}`);
    }
  }
  
  /**
   * Generate mock media availability data
   * Uses deterministic algorithm for consistency in testing
   */
  private getMockAvailability(word: string): { hasAudio: boolean; hasImage: boolean } {
    const normalizedWord = word.toLowerCase();
    const wordSum = normalizedWord.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    
    const wordLength = normalizedWord.length; // More common shorter words are more likely to have data, idk
    const lengthFactor = wordLength <= 6 ? 0.8 : (16 - Math.min(wordLength, 15)) / 10;
    
    // pseudo-random but deterministic results, because it could be important to have the same results for the same word
    // in different runs, e.g. for testing
    const hasAudio = (wordSum % 5 > 1) && (lengthFactor > 0.7);
    const hasImage = (wordSum % 7 > 2) && (lengthFactor > 0.6);
    
    logger.debug(`Mock media availability for "${word}": audio=${hasAudio}, image=${hasImage}`);
    return { hasAudio, hasImage };
  }
}

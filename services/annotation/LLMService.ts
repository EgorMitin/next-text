import { AnnotationStrategy } from './strategies/AnnotationStrategy';
import { logger } from '../../utils/logger';

// Define the shape of LLM response
interface LLMAnnotationResult {
  wordType: string;
  gender?: string;
  syllables: string[];
}

/**
 * Service responsible for LLM-based word annotations.
 * Uses the Adapter pattern to provide a consistent interface
 * to the underlying LLM API.
 */
export class LLMService {
  private apiKey: string;
  private endpoint: string;
  
  constructor() {
    this.apiKey = process.env.LLM_API_KEY || '';
    this.endpoint = process.env.LLM_ENDPOINT || '';
    
    if (!this.apiKey) {
      logger.warn('LLM API key not configured. Using fallback mode.');
    }
  }

  /**
   * Annotate a word using LLM to determine word type, gender, and syllables
   * @param word Word to analyze
   * @param language ISO language code
   * @param strategy Language-specific annotation strategy
   * @returns LLM annotation result containing word type, gender, and syllables
   */
  async annotate(
    word: string, 
    language: string,
    strategy: AnnotationStrategy
  ): Promise<LLMAnnotationResult> {
    try {
      logger.debug(`Requesting LLM annotation for "${word}" in ${language}`);
      
      const prompt = strategy.createLLMPrompt(word);
      
      if (!this.apiKey) { // As long as API key is missing, use mock/fallback implementation
        return this.mockLLMResponse(word, strategy);
      }
      
      const response = await fetch(this.endpoint, { // Actual API call in case is there's an API key
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'text-davinci-or-whatever',
          prompt,
          max_tokens: 100,
          temperature: 0.2,
        })
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`LLM API error: ${error}`);
      }
      
      const result = await response.json();
      return strategy.parseLLMResponse(result.choices[0].text, word);
      
    } catch (error) {
      logger.error(`LLM annotation failed for "${word}":`, error);
      throw new Error(`LLM annotation failed: ${(error as Error).message}`);
    }
  }
  
  /**
   * Provides a fallback mock implementation when the LLM is unavailable
   * @param word Word to analyze
   * @param strategy Language-specific annotation strategy
   * @returns Mock annotation result
   */
  private mockLLMResponse(
    word: string, 
    strategy: AnnotationStrategy
  ): LLMAnnotationResult {
    logger.debug(`Using mock LLM response for "${word}"`);
    return strategy.provideFallbackAnnotation(word);
  }
}

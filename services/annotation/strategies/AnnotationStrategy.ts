/**
 * Interface for language-specific annotation strategies
 * Implements the Strategy pattern to encapsulate different
 * algorithms for word annotation based on language
 */
export interface AnnotationStrategy {
  /**
   * Creates a language-specific prompt for the LLM
   */
  createLLMPrompt(word: string): string;
  
  /**
   * Parses the LLM response in a language-specific way
   */
  parseLLMResponse(llmResponse: string, originalWord: string): {
    wordType: string;
    gender?: string;
    syllables: string[];
  };
  
  /**
   * Provides fallback annotation when LLM is unavailable
   */
  provideFallbackAnnotation(word: string): {
    wordType: string;
    gender?: string;
    syllables: string[];
  };
}

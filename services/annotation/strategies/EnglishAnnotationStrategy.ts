import { AnnotationStrategy } from './AnnotationStrategy';
import { WordType } from '@/types/word';
import { logger } from '@/utils/logger';

/**
 * Implementation of the annotation strategy for English words
 */
export class EnglishAnnotationStrategy implements AnnotationStrategy {
  
  /**
   * Create a prompt for the LLM that is specific to English language analysis
   */
  createLLMPrompt(word: string): string {
    return `
Analyze the English word "${word}" and provide the following information in JSON format:

1. wordType: The grammatical type (noun, verb, adjective, etc.)
2. syllables: Break the word into syllables

Example response format:
{
  "wordType": "noun",
  "syllables": ["ap", "ple"]
}
    `.trim();
  }
  
  /**
   * Parse the LLM response for English words
   */
  parseLLMResponse(llmResponse: string, originalWord: string): {
    wordType: string;
    syllables: string[];
  } {
    try {
      const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in LLM response");
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      if (!parsedResponse.wordType) {
        throw new Error("No word type found in LLM response");
      }
      
      if (!Array.isArray(parsedResponse.syllables) || parsedResponse.syllables.length === 0) {
        throw new Error("Invalid syllables in LLM response");
      }
      
      return {
        wordType: parsedResponse.wordType.toLowerCase(),
        syllables: parsedResponse.syllables
      };
    } catch (error) {
      logger.error(`Failed to parse LLM response for English word "${originalWord}":`, error);
      logger.debug(`Raw LLM response: ${llmResponse}`);
      
      // Fall back to basic parsing
      return this.provideFallbackAnnotation(originalWord);
    }
  }
  
  /**
   * Provide a fallback annotation when LLM is unavailable
   */
  provideFallbackAnnotation(word: string): {
    wordType: string;
    syllables: string[];
  } {
    logger.debug(`Providing fallback annotation for English word "${word}"`);
    
    let wordType = WordType.OTHER;
    
    // Simple heuristics for detecting word types, just some common patterns
    if (word.endsWith('ing') && word.length > 4) {
      wordType = WordType.VERB;
    } else if (word.endsWith('ly') && word.length > 3) {
      wordType = WordType.ADVERB;
    } else if (word.endsWith('ment') || word.endsWith('ness') || word.endsWith('ity')) {
      wordType = WordType.NOUN;
    } else if (word.endsWith('ful') || word.endsWith('less') || word.endsWith('ish') || 
              word.endsWith('ive') || word.endsWith('ous') || word.endsWith('able')) {
      wordType = WordType.ADJECTIVE;
    }
    
    // Basic syllable splitting logic for English
    const syllables = this.splitEnglishWordIntoSyllables(word);
    
    return {
      wordType,
      syllables
    };
  }
  

  /**
  * Simple method to split an English word into syllables
  * Basic approximation using vowel-consonant patterns in 3 steps
  */
  private splitEnglishWordIntoSyllables(word: string): string[] {
    // For short words, just return the whole word
    if (word.length <= 3) {
      return [word];
    }
    
    const vowels = ['a', 'e', 'i', 'o', 'u', 'y'];
    const syllables = [];
    let currentSyllable = '';
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      currentSyllable += char;
      
      // 1. If we have a vowel followed by a consonant, it might be a syllable boundary
      // But only split if we have at least 2 characters in the current syllable
      if (i > 0 && 
          vowels.includes(word[i-1].toLowerCase()) && 
          !vowels.includes(char.toLowerCase()) &&
          currentSyllable.length >= 2 &&
          i < word.length - 1) {
        syllables.push(currentSyllable);
        currentSyllable = '';
      }
    }
    
    // 2. Add any remaining characters as the final syllable
    if (currentSyllable) {
      syllables.push(currentSyllable);
    }
    
    // 3. If we didn't split anything, return the original word
    return syllables.length > 0 ? syllables : [word];
  }
}
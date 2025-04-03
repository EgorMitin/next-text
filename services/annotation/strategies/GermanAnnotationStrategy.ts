import { AnnotationStrategy } from './AnnotationStrategy';
import { WordType, Gender } from '../../../types/word';
import { logger } from '../../../utils/logger';

/**
 * Implementation of the annotation strategy for German words
 * Handles specific aspects of German language like noun genders
 */
export class GermanAnnotationStrategy implements AnnotationStrategy {
  
  /**
   * Create a prompt for the LLM that is specific to German language analysis
   * 
   * (!) I assume here, that LLMs work better with English prompts
   * but it may be wrong in terms of other language linguistics
   */
  createLLMPrompt(word: string): string {
    return `
Analyze the German word "${word}" and provide the following information in JSON format:

1. wordType: The grammatical type (noun, verb, adjective, etc.)
2. gender: For nouns, specify the gender (masculine, feminine, neuter)
3. syllables: Break the word into syllables

Example response format:
{
  "wordType": "noun",
  "gender": "masculine",
  "syllables": ["Ap", "fel"]
}
    `.trim();
  }
  
  /**
   * Parse the LLM response for German words
   */
  parseLLMResponse(llmResponse: string, originalWord: string): {
    wordType: string;
    gender?: string;
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
        gender: parsedResponse.gender?.toLowerCase(),
        syllables: parsedResponse.syllables
      };
    } catch (error) {
      logger.error(`Failed to parse LLM response for German word "${originalWord}":`, error);
      logger.debug(`Raw LLM response: ${llmResponse}`);
      
      return this.provideFallbackAnnotation(originalWord);
    }
  }
  
  /**
   * Provide a fallback annotation when LLM is unavailable
   */
  provideFallbackAnnotation(word: string): {
    wordType: string;
    gender?: string;
    syllables: string[];
  } {
    logger.debug(`Providing fallback annotation for German word "${word}"`);
    
    const isLikelyNoun = /^[A-ZÄÖÜ]/.test(word);
    let wordType = isLikelyNoun ? WordType.NOUN : WordType.OTHER;
    
    let gender = undefined;
    if (isLikelyNoun) {
      if (word.endsWith('er') || word.endsWith('ig') || word.endsWith('or')) {
        gender = Gender.MASCULINE;
      } else if (word.endsWith('ung') || word.endsWith('heit') || word.endsWith('keit') || 
                word.endsWith('schaft') || word.endsWith('tät')) {
        gender = Gender.FEMININE;
      } else if (word.endsWith('chen') || word.endsWith('lein') || word.endsWith('ment')) {
        gender = Gender.NEUTER;
      }
    }
    
    const syllables = this.splitGermanWordIntoSyllables(word);
    
    return {
      wordType,
      gender,
      syllables
    };
  }
  
  /**
   * Split a German word into syllables using basic rules
   * This is a simplified implementation for fallback purposes
   */
  private splitGermanWordIntoSyllables(word: string): string[] {
    // For short words, just return the whole word
    if (word.length <= 3) {
      return [word];
    }
    
    const vowels = ['a', 'e', 'i', 'o', 'u', 'ä', 'ö', 'ü'];
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

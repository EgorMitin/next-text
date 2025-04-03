/**
 * Supported language codes
 */
export type Language = 'de' | 'en';

/**
 * List of all supported languages
 */
export const LANGUAGES: Language[] = ['de', 'en'];

/**
 * Word request data transfer object
 */
export interface WordRequestDTO {
  word: string;
  language?: Language; // defaults to German ('de')
}

/**
 * Complete annotated word with all properties
 */
export interface AnnotatedWord {
  id: string;
  word: string;
  language: string;
  wordType: string; // noun, verb, adjective, etc.
  gender?: string; // masculine, feminine, neuter (for German). Other languages may also be considered later
  syllables: string[];
  safeLetters: string[];
  frequency: number; // 0-1 scale representing word frequency
  hasAudio: boolean;
  hasImage: boolean;
  proovedByTherapist: boolean;
  createdAt?: Date; // Date when the word was created to be used for later updates
  updatedAt?: Date;
}

 

/**
 * The possible word types for classification
 */
export enum WordType {
  NOUN = 'noun',
  VERB = 'verb',
  ADJECTIVE = 'adjective',
  ADVERB = 'adverb',
  PRONOUN = 'pronoun',
  PREPOSITION = 'preposition',
  CONJUNCTION = 'conjunction',
  INTERJECTION = 'interjection',
  ARTICLE = 'article',
  NUMERAL = 'numeral',
  OTHER = 'other'
}

/**
 * List of all available word types
 */
export const WORD_TYPES: WordType[] = [
  WordType.NOUN,
  WordType.VERB,
  WordType.ADJECTIVE,
  WordType.ADVERB,
  WordType.PRONOUN,
  WordType.PREPOSITION,
  WordType.CONJUNCTION,
  WordType.INTERJECTION,
  WordType.ARTICLE,
  WordType.NUMERAL,
  WordType.OTHER
];

/**
 * Gender classifications for languages like German
 */
export enum Gender {
  MASCULINE = 'masculine',
  FEMININE = 'feminine',
  NEUTER = 'neuter',
  NONE = 'none'
}

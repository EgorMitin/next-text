import { AnnotatedWord } from '@/types/word';
import { LLMService } from './LLMService';
import { FrequencyService } from './FrequencyService';
import { SafeLettersService } from './SafeLettersService';
import { MediaAvailabilityService } from './MediaAvailabilityService';
import { AnnotationStrategy } from './strategies/AnnotationStrategy';
import { GermanAnnotationStrategy } from './strategies/GermanAnnotationStrategy';
import { EnglishAnnotationStrategy } from './strategies/EnglishAnnotationStrategy';
import { logger } from '@/utils/logger';

/**
 * Facade that coordinates all word annotation services and processes
 * Implements the Facade pattern to provide a simplified interface
 * to the complex annotation subsystem
 */
export class AnnotationServiceFacade {
  private llmService: LLMService;
  private frequencyService: FrequencyService;
  private safeLettersService: SafeLettersService;
  private mediaService: MediaAvailabilityService;
  private strategyMap: Map<string, AnnotationStrategy>;

  constructor() {
    this.llmService = new LLMService();
    this.frequencyService = new FrequencyService();
    this.safeLettersService = new SafeLettersService();
    this.mediaService = new MediaAvailabilityService();
    
    this.strategyMap = new Map();
    this.strategyMap.set('de', new GermanAnnotationStrategy());
    this.strategyMap.set('en', new EnglishAnnotationStrategy());
    // Additional languages can be added here
  }

  /**
   * Main method to annotate a word with all available services
   * @param word The word to annotate
   * @param language The language of the word (ISO code)
   * @returns A fully annotated word
   */
  async annotateWord(word: string, language: string = 'de'): Promise<Omit<AnnotatedWord, 'id'>> {
    logger.info(`Annotating word: "${word}" in language: ${language}`);

    const strategy = this.strategyMap.get(language) || this.strategyMap.get('de')!;
    
    // Run annotation tasks in parallel for better performance
    const [
      llmResults,
      frequency,
      safeLetters,
      mediaAvailability
    ] = await Promise.all([
      this.llmService.annotate(word, language, strategy),
      this.frequencyService.getWordFrequency(word, language),
      this.safeLettersService.getSafeLetters(word),
      this.mediaService.checkAvailability(word, language)
    ]);

    const annotatedWord: Omit<AnnotatedWord, 'id'> = {
      word,
      language,
      wordType: llmResults.wordType,
      gender: llmResults.gender,
      syllables: llmResults.syllables,
      safeLetters,
      frequency,
      hasAudio: mediaAvailability.hasAudio,
      hasImage: mediaAvailability.hasImage,
      proovedByTherapist: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    logger.debug(`Word annotation completed for "${word}"`);
    return annotatedWord;
  }
}

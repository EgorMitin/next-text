import postgres from 'postgres';
import { AnnotatedWord } from '../../types/word';
import { logger } from '../../utils/logger';
import { unstable_noStore as noStore } from 'next/cache';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

/**
 * Service for database operations related to word annotations
 * Implements the Singleton pattern to ensure a single database connection
 * Optimized for the needs of the annotateWords endpoint
 * 
 * noStore() is called at the beginning of each database method to ensure
 * that the database queries always run fresh and the results are never cached by Next.js.
 * 
 * Word frequency is stored as a percentage (0-100) in the database,
 * but is converted to a decimal (0-1) in the AnnotatedWord object.
 */
export class DatabaseService {
  private static instance: DatabaseService;
  private sql: ReturnType<typeof postgres>;
  
  private constructor() {
    this.sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
  }
  
  /**
   * Get the singleton instance
   */
  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize the database schema
   * This method should be called once at the start of the application
   * to ensure the database is ready for use
   */
  async initializeAnnotatedWordsTable(): Promise<void> {
    logger.info('Initializing database schema');

    noStore();
    try {
      await this.sql`
        CREATE TABLE IF NOT EXISTS annotated_words (
          id SERIAL PRIMARY KEY,
          word TEXT NOT NULL,
          language TEXT NOT NULL,
          word_type TEXT,
          gender TEXT,
          syllables TEXT,
          safe_letters TEXT,
          frequency INTEGER,
          has_audio BOOLEAN DEFAULT FALSE,
          has_image BOOLEAN DEFAULT FALSE,
          prooved_by_therapist BOOLEAN DEFAULT FALSE,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(word, language)
        )
      `;
      await this.sql`
        CREATE INDEX IF NOT EXISTS idx_word_language ON annotated_words(word, language)
      `;

      logger.info('Database schema initialized successfully');
    } catch (error) {
      logger.error('Database initialization error:', error);
      throw new Error(`Failed to initialize database: ${(error as Error).message}`);
    }
  }
  
  /**
   * Find a word by text and language with performance optimization
   * to avoid duplicate processing
   * If the word is not found, it returns null
   * This method is used to check if a word already exists in the database
   * before processing it
   */
  async findWordByText(word: string, language: string): Promise<AnnotatedWord | null> {
    noStore();
    try {
      logger.debug(`Looking up word "${word}" (${language}) in database`);
      const data = await this.sql`
        SELECT * FROM annotated_words 
        WHERE word = ${word} AND language = ${language}
        LIMIT 1
      `;
      
      if (data.length === 0) {
        return null;
      }
      
      const result = this.mapRowToAnnotatedWord(data[0]);
      logger.debug(`Found existing word: ${word}`);
      return result;
    } catch (error) {
      logger.error(`Database error finding word "${word}":`, error);
      throw new Error(`Failed to fetch word: ${(error as Error).message}`);
    }
  }
  
  /**
   * Save an annotated word to the database
   * Captures all annotation data from the services
   */
  async saveAnnotatedWord(word: Omit<AnnotatedWord, 'id'>): Promise<AnnotatedWord> {
    noStore();
    try {
      logger.debug(`Saving new word "${word.word}" to database`);
      const wordFrequencyPercent = Math.round(word.frequency * 100);

      const data = await this.sql`
        INSERT INTO annotated_words (
          word, language, word_type, gender, syllables, 
          safe_letters, frequency, has_audio, has_image,
          prooved_by_therapist
        ) VALUES (
          ${word.word},
          ${word.language},
          ${word.wordType},
          ${word.gender || null},
          ${JSON.stringify(word.syllables)},
          ${JSON.stringify(word.safeLetters)},
          ${wordFrequencyPercent},
          ${word.hasAudio},
          ${word.hasImage},
          ${word.proovedByTherapist || false}
        )
        RETURNING *
      `;
      
      if (data.length === 0) {
        throw new Error(`Failed to save word "${word.word}": No data returned`);
      }
      
      return this.mapRowToAnnotatedWord(data[0]);
    } catch (error) {
      logger.error(`Database error saving word "${word.word}":`, error);
      throw new Error(`Failed to save word: ${(error as Error).message}`);
    }
  }
  
  /**
   * Batch save multiple annotated words
   * Added for potential performance optimization of the endpoint
   * Which is probably not needed for the current use case,
   * But only to show that it is possible in some other more sutable cases
   */
  async batchSaveAnnotatedWords(words: AnnotatedWord[]): Promise<AnnotatedWord[]> {
    if (words.length === 0) return [];
    
    noStore();
    try {
      logger.debug(`Batch saving ${words.length} words to database`);

      
      const values = words.map(word => ({
        word: word.word,
        language: word.language,
        word_type: word.wordType,
        gender: word.gender || null,
        syllables: JSON.stringify(word.syllables),
        safe_letters: JSON.stringify(word.safeLetters),
        frequency: Math.round(word.frequency * 100),
        has_audio: word.hasAudio,
        has_image: word.hasImage
      }));
      
      const data = await this.sql`
        INSERT INTO annotated_words ${sql(values)}
        RETURNING *
      `;
      
      return data.map(row => this.mapRowToAnnotatedWord(row));
    } catch (error) {
      logger.error(`Database error batch saving words:`, error);
      throw new Error(`Failed to batch save words: ${(error as Error).message}`);
    }
  }
  
  /**
   * Find multiple words by their text and language
   * Useful for bulk word lookup optimization
   */
  async findWordsByTexts(words: string[], language: string): Promise<Map<string, AnnotatedWord>> {
    if (words.length === 0) return new Map();
    
    noStore();
    try {
      logger.debug(`Looking up ${words.length} words in database`);
      
      const data = await this.sql`
        SELECT * FROM annotated_words 
        WHERE word IN ${sql(words)} AND language = ${language}
      `;
      
      const wordMap = new Map<string, AnnotatedWord>();
      for (const row of data) {
        const annotatedWord = this.mapRowToAnnotatedWord(row);
        wordMap.set(annotatedWord.word, annotatedWord);
      }
      
      return wordMap;
    } catch (error) {
      logger.error(`Database error finding multiple words:`, error);
      throw new Error(`Failed to fetch words: ${(error as Error).message}`);
    }
  }

  /**
   * Find the most recently added words
   * @param limit The maximum number of words to return
   */
  async findRecentAnnotatedWords(limit: number): Promise<AnnotatedWord[]> {
    noStore();
    try {
      logger.debug(`Finding ${limit} most recent words`);
      const data = await sql`
        SELECT * FROM annotated_words
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
      return data.map(row => this.mapRowToAnnotatedWord(row));
    } catch (error) {
      logger.error('Database error finding recent words:', error);
      throw new Error(`Failed to fetch recent words: ${(error as Error).message}`);
    }
  }

  /**
   * Count the total number of words in the database
   */
  async countTotalWords(): Promise<number> {
    noStore();
    try {
      const data = await sql`SELECT COUNT(*) FROM annotated_words`;
      return Number(data[0].count);
    } catch (error) {
      logger.error('Database error counting words:', error);
      throw new Error(`Failed to count words: ${(error as Error).message}`);
    }
  }

  /**
   * Count words grouped by language
   */
  async countWordsByLanguage(): Promise<{ language: string; count: number }[]> {
    noStore();
    try {
      const data = await sql`
        SELECT language, COUNT(*) as count 
        FROM annotated_words 
        GROUP BY language
      `;
      return data.map(row => ({
        language: row.language as string,
        count: Number(row.count)
      }));
    } catch (error) {
      logger.error('Database error counting words by language:', error);
      throw new Error(`Failed to count words by language: ${(error as Error).message}`);
    }
  }

  /**
   * Count words by media availability
   */
  async countWordsByMediaAvailability(): Promise<{ 
    with_audio: number;
    with_image: number;
    with_both: number;
    with_none: number;
  }> {
    noStore();
    try {
      const data = await sql`
        SELECT 
          SUM(CASE WHEN has_audio = true THEN 1 ELSE 0 END) as with_audio,
          SUM(CASE WHEN has_image = true THEN 1 ELSE 0 END) as with_image,
          SUM(CASE WHEN has_audio = true AND has_image = true THEN 1 ELSE 0 END) as with_both,
          SUM(CASE WHEN has_audio = false AND has_image = false THEN 1 ELSE 0 END) as with_none
        FROM annotated_words
      `;
      return {
        with_audio: Number(data[0].with_audio),
        with_image: Number(data[0].with_image),
        with_both: Number(data[0].with_both),
        with_none: Number(data[0].with_none)
      };
    } catch (error) {
      logger.error('Database error counting words by media:', error);
      throw new Error(`Failed to count words by media: ${(error as Error).message}`);
    }
  }

  /**
   * Find filtered words with pagination
   */
  async findFilteredWords(
    query: string,
    language: string,
    limit: number,
    offset: number
  ): Promise<AnnotatedWord[]> {
    noStore();
    try {
      const searchPattern = `%${query}%`;
      const data = await sql`
        SELECT * FROM annotated_words
        WHERE 
          (word ILIKE ${searchPattern} OR 
          word_type ILIKE ${searchPattern}) AND
          language = ${language}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      return data.map(row => this.mapRowToAnnotatedWord(row));
    } catch (error) {
      logger.error('Database error finding filtered words:', error);
      throw new Error(`Failed to fetch filtered words: ${(error as Error).message}`);
    }
  }

  /**
   * Count filtered words for pagination
   */
  async countFilteredWords(query: string, language: string): Promise<number> {
    noStore();
    try {
      const searchPattern = `%${query}%`;
      const data = await sql`
        SELECT COUNT(*) FROM annotated_words
        WHERE 
          (word ILIKE ${searchPattern} OR 
          word_type ILIKE ${searchPattern}) AND
          language = ${language}
      `;
      return Number(data[0].count);
    } catch (error) {
      logger.error('Database error counting filtered words:', error);
      throw new Error(`Failed to count filtered words: ${(error as Error).message}`);
    }
  }

  /**
   * Find a word by ID
   */
  async findWordById(id: string): Promise<AnnotatedWord | null> {
    noStore();
    try {
      const data = await sql`
        SELECT * FROM annotated_words
        WHERE id = ${id}
        LIMIT 1
      `;
      if (data.length === 0) {
        return null;
      }
      return this.mapRowToAnnotatedWord(data[0]);
    } catch (error) {
      logger.error(`Database error finding word by ID ${id}:`, error);
      throw new Error(`Failed to fetch word: ${(error as Error).message}`);
    }
  }

  /**
   * Find all distinct languages in the database
   */
  async findAllLanguages(): Promise<string[]> {
    noStore();
    try {
      const data = await sql`
        SELECT DISTINCT language FROM annotated_words
        ORDER BY language
      `;
      return data.map(row => row.language);
    } catch (error) {
      logger.error('Database error finding languages:', error);
      throw new Error(`Failed to fetch languages: ${(error as Error).message}`);
    }
  }

  /**
   * Find words by word type
   */
  async findWordsByType(wordType: string, language: string): Promise<AnnotatedWord[]> {
    noStore();
    try {
      const data = await sql`
        SELECT * FROM annotated_words
        WHERE word_type = ${wordType} AND language = ${language}
        ORDER BY word
      `;
      return data.map(row => this.mapRowToAnnotatedWord(row));
    } catch (error) {
      logger.error(`Database error finding words by type ${wordType}:`, error);
      throw new Error(`Failed to fetch words by type: ${(error as Error).message}`);
    }
  }

/**
 * Delete a word by its ID
 * @param id The ID of the word to delete
 * @returns true if the word was deleted, false if it wasn't found
 */
async deleteWordById(id: string): Promise<boolean> {
  try {
    logger.debug(`Deleting word with ID: ${id}`);
    
    const result = await this.sql`
      DELETE FROM annotated_words
      WHERE id = ${id}
      RETURNING id
    `;
    
    const wasDeleted = result.length > 0;
    if (!wasDeleted) {
      logger.warn(`No word found with ID ${id} for deletion`);
    }
    
    return wasDeleted;
  } catch (error) {
    logger.error(`Database error deleting word with ID ${id}:`, error);
    throw new Error(`Failed to delete word: ${(error as Error).message}`);
  }
}

/**
 * Update an existing annotated word in the database
 * @param word The word to update
 * @returns The updated word
 */
async updateAnnotatedWord(word: AnnotatedWord): Promise<AnnotatedWord> {
  noStore();
  try {
    logger.debug(`Updating word with ID: ${word.id}`);
    const wordFrequencyPercent = Math.round(word.frequency * 100);
    
    const data = await this.sql`
      UPDATE annotated_words
      SET 
        word = ${word.word},
        language = ${word.language},
        word_type = ${word.wordType},
        gender = ${word.gender || null},
        syllables = ${JSON.stringify(word.syllables)},
        safe_letters = ${JSON.stringify(word.safeLetters)},
        frequency = ${wordFrequencyPercent},
        has_audio = ${word.hasAudio},
        has_image = ${word.hasImage},
        prooved_by_therapist = ${word.proovedByTherapist || false},
        updated_at = NOW()
      WHERE id = ${word.id}
      RETURNING *
    `;
    
    if (data.length === 0) {
      throw new Error(`Failed to update word with ID ${word.id}: No data returned`);
    }
    
    return this.mapRowToAnnotatedWord(data[0]);
  } catch (error) {
    logger.error(`Database error updating word with ID ${word.id}:`, error);
    throw new Error(`Failed to update word: ${(error as Error).message}`);
  }
}
  
  /**
   * Map a database row to an AnnotatedWord object
   * Handles type conversion and JSON parsing
   */
  private mapRowToAnnotatedWord(row: any): AnnotatedWord {
    return {
      id: row.id,
      word: row.word,
      language: row.language,
      wordType: row.word_type,
      gender: row.gender,
      syllables: typeof row.syllables === 'string' ? JSON.parse(row.syllables) : row.syllables,
      safeLetters: typeof row.safe_letters === 'string' ? JSON.parse(row.safe_letters) : row.safe_letters,
      frequency: Number(row.frequency)/100,
      hasAudio: Boolean(row.has_audio),
      hasImage: Boolean(row.has_image),
      proovedByTherapist: Boolean(row.prooved_by_therapist),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

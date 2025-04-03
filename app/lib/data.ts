import { DatabaseService } from '@/services/database/DatabaseService';
import { AnnotatedWord } from '@/types/word';
import { logger } from '@/utils/logger';
import { unstable_noStore as noStore } from 'next/cache';

const ITEMS_PER_PAGE = 10;
const dbService = DatabaseService.getInstance();

export async function fetchRecentAnnotatedWords() {
  noStore();
  try {
    logger.info('Fetching recent annotated words');

    const words = await dbService.findRecentAnnotatedWords(5);

    return words;
  } catch (error) {
    logger.error('Error fetching recent annotated words:', error);
    throw new Error('Failed to fetch recent annotated words.');
  }
}

export async function fetchWordStats() {
  noStore();
  try {
    logger.info('Fetching word statistics');

    const totalWordsPromise = dbService.countTotalWords();
    const languageStatsPromise = dbService.countWordsByLanguage();
    const mediaStatsPromise = dbService.countWordsByMediaAvailability();

    const [totalWords, languageStats, mediaStats] = await Promise.all([
      totalWordsPromise,
      languageStatsPromise,
      mediaStatsPromise
    ]);

    return {
      totalWords,
      languageStats,
      mediaStats
    };
  } catch (error) {
    logger.error('Error fetching word statistics:', error);
    throw new Error('Failed to fetch word statistics.');
  }
}

export async function fetchFilteredWords(
  query: string,
  currentPage: number,
  language: string="de",
) {
  noStore();
  try {
    logger.info(`Fetching filtered words: query=${query}, language=${language}, page=${currentPage}`);

    const words = await dbService.findFilteredWords(
      query,
      language,
      ITEMS_PER_PAGE,
      (currentPage - 1) * ITEMS_PER_PAGE
    );

    return words;
  } catch (error) {
    logger.error('Error fetching filtered words:', error);
    throw new Error('Failed to fetch words.');
  }
}

export async function fetchWordsPages(query: string, language: string="de") {
  noStore();
  try {
    logger.info(`Calculating total pages for words: query=${query}, language=${language}`);

    const count = await dbService.countFilteredWords(query, language);
    const totalPages = Math.ceil(count / ITEMS_PER_PAGE);

    return totalPages;
  } catch (error) {
    logger.error('Error calculating word pages:', error);
    throw new Error('Failed to fetch total number of words.');
  }
}

export async function fetchWordById(id: string) {
  noStore();
  try {
    logger.info(`Fetching word by ID: ${id}`);

    const word = await dbService.findWordById(id);

    if (!word) {
      throw new Error(`Word with ID ${id} not found`);
    }

    return word;
  } catch (error) {
    logger.error(`Error fetching word by ID ${id}:`, error);
    throw new Error('Failed to fetch word.');
  }
}

export async function fetchLanguages() {
  noStore();
  try {
    logger.info('Fetching available languages');

    const languages = await dbService.findAllLanguages();

    return languages;
  } catch (error) {
    logger.error('Error fetching languages:', error);
    throw new Error('Failed to fetch languages.');
  }
}

export async function fetchFilteredWordsByType(wordType: string, language: string) {
  noStore();
  try {
    logger.info(`Fetching words by type: type=${wordType}, language=${language}`);

    const words = await dbService.findWordsByType(wordType, language);

    return words;
  } catch (error) {
    logger.error('Error fetching words by type:', error);
    throw new Error('Failed to fetch words by type.');
  }
}
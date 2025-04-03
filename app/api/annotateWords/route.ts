'use server';

import { NextRequest, NextResponse } from 'next/server';
import { AnnotationServiceFacade } from '@/services/annotation/AnnotationServiceFacade';
import { DatabaseService } from '@/services/database/DatabaseService';
import { logger } from '@/utils/logger';
import { WordRequestDTO, AnnotatedWord } from '@/types/word';
import { wordsToAnnotateValidation } from '@/utils/validation';

/**
 * API REST endpoint for annotating non-empty list of words (non-more then configured maximum) for the myReha application
 * Handles receiving words, annotating them via multiple services,
 * storing results in PostgreSQL, and returning annotated data
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Word annotation request received');
    const startTime = performance.now();

    const requestData = await request.json();
    const wordsToAnnotate: WordRequestDTO[] = Array.isArray(requestData) 
      ? requestData 
      : [requestData];

    // First layer input validation, second may also be implemented
    // for cases like ambiguous words or non-word strings
    wordsToAnnotateValidation(wordsToAnnotate);

    // Initialize services
    const dbService = DatabaseService.getInstance();
    const annotationService = new AnnotationServiceFacade();

    // Process words
    const results: AnnotatedWord[] = [];
    for (const wordRequest of wordsToAnnotate) {
      // Set default language if not provided
      const language = 'de'; // The exact implementation of language choose can be implemented via parameters, api different endpoints usw
      
      // Check if word already exists in database
      const existingWord = await dbService.findWordByText(wordRequest.word, language);
      if (existingWord) {
        results.push(existingWord);
        continue;
      }
      
      // Annotate new word
      const annotatedWord = await annotationService.annotateWord(wordRequest.word, language);
      
      // Store in database
      const savedWord = await dbService.saveAnnotatedWord(annotatedWord);
      results.push(savedWord);
    }

    const processingTime = Math.round(performance.now() - startTime);
    logger.info(`Processed ${results.length} words in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      processingTimeMs: processingTime,
      data: results
    });
  } catch (error) {
    logger.error('Error processing word annotation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process word annotation request',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}


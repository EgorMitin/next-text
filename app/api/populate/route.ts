import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database/DatabaseService';
import { AnnotationServiceFacade } from '@/services/annotation/AnnotationServiceFacade';
import { logger } from '@/utils/logger';

const INITIAL_WORDS = [
  'Haus',
  'Katze',
  'Hund',
  'Buch',
  'Tisch',
  'Stuhl',
  'Auto',
  'Baum',
  'Sonne',
  'Mond'
];

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    logger.info('Starting database population');
    const startTime = performance.now();

    const dbService = DatabaseService.getInstance();
    const annotationService = new AnnotationServiceFacade();
    const results = [];

    for (const word of INITIAL_WORDS) {
      const existingWord = await dbService.findWordByText(word, 'de');
      
      if (existingWord) {
        logger.debug(`Word "${word}" already exists, skipping`);
        results.push(existingWord);
        continue;
      }

      const annotatedWord = await annotationService.annotateWord(word, 'de');
      const savedWord = await dbService.saveAnnotatedWord(annotatedWord);
      results.push(savedWord);
      logger.debug(`Word "${word}" processed and saved`);
    }

    const processingTime = Math.round(performance.now() - startTime);
    
    return NextResponse.json({
      success: true,
      processingTimeMs: processingTime,
      wordsProcessed: results.length,
      data: results
    });

  } catch (error) {
    logger.error('Error populating database:', error);
    return NextResponse.json(
      { 
        error: 'Failed to populate database',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
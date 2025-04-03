import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/services/database/DatabaseService';
import { logger } from '@/utils/logger';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const dbService = DatabaseService.getInstance();

    await dbService.initializeAnnotatedWordsTable();
    
    return NextResponse.json({
      success: true,
      message: 'Database schema initialized'
    });

  } catch (error) {
    logger.error('Error initializing database:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize database',
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
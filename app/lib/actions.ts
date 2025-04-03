'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { DatabaseService } from '@/services/database/DatabaseService';
import { logger } from '@/utils/logger';

const dbService = DatabaseService.getInstance();

const WordFormSchema = z.object({
  id: z.string(),
  word: z.string().min(1, { message: 'Please enter a word.' }),
  language: z.string().min(1, { message: 'Please select a language.' }),
  wordType: z.string().min(1, { message: 'Please select a word type.' }),
  gender: z.string().optional(),
  syllables: z.string().transform(val => JSON.parse(val)).optional(),
  safeLetters: z.string().transform(val => JSON.parse(val)).optional(),
  frequency: z.coerce
    .number()
    .min(0, { message: 'Frequency must be between 0 and 1.' })
    .max(1, { message: 'Frequency must be between 0 and 1.' }),
  hasAudio: z.boolean().default(false),
  hasImage: z.boolean().default(false),
  proovedByTherapist: z.boolean().default(false),
});

export type WordFormState = {
  errors?: {
    word?: string[];
    language?: string[];
    wordType?: string[];
    gender?: string[];
    syllables?: string[];
    safeLetters?: string[];
    frequency?: string[];
    hasAudio?: string[];
    hasImage?: string[];
    proovedByTherapist?: string[];
  };
  message?: string | null;
};

const CreateWordSchema = WordFormSchema.omit({ id: true });

export async function createWord(prevState: WordFormState, formData: FormData) {
  const validatedFields = CreateWordSchema.safeParse({
    word: formData.get('word'),
    language: formData.get('language'),
    wordType: formData.get('wordType'),
    gender: formData.get('gender') || null,
    syllables: formData.get('syllables') || '[]',
    safeLetters: formData.get('safeLetters') || '[]',
    frequency: formData.get('frequency'),
    hasAudio: formData.get('hasAudio') === 'true',
    hasImage: formData.get('hasImage') === 'true',
    proovedByTherapist: formData.get('proovedByTherapist') === 'true',
  });
 
  if (!validatedFields.success) {
    logger.error('Word validation failed:', validatedFields.error);
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing or invalid fields. Failed to create word.',
    };
  }
 
  // Ensure required properties are always present, even if they were optional in validated data
  // May be implemented in the more convenient ans clear way
  const wordData = {
    ...validatedFields.data,
    syllables: validatedFields.data.syllables || [],
    safeLetters: validatedFields.data.safeLetters || []
  };
 
  try {
    await dbService.saveAnnotatedWord(wordData);
    logger.info(`Word created: ${wordData.word} (${wordData.language})`);
  } catch (error) {
    logger.error('Database error creating word:', error);
    return {
      message: `Database Error: Failed to create word. ${(error as Error).message}`,
    };
  }
 
  revalidatePath('/'); // Revalidating the cache
  redirect('/');
}

const UpdateWordSchema = WordFormSchema.omit({ id: true });

export async function updateWord(id: string, formData: FormData) {
  try {
    const validatedFields = UpdateWordSchema.safeParse({
      word: formData.get('word'),
      language: formData.get('language'),
      wordType: formData.get('wordType'),
      gender: formData.get('gender') || undefined,
      syllables: formData.get('syllables') || '[]',
      safeLetters: formData.get('safeLetters') || '[]',
      frequency: formData.get('frequency'),
      hasAudio: formData.get('hasAudio') === 'true',
      hasImage: formData.get('hasImage') === 'true',
      proovedByTherapist: formData.get('proovedByTherapist') === 'true',
    });

    if (!validatedFields.success) {
      logger.error('Word validation failed:', validatedFields.error);
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Missing or invalid fields. Failed to update word.',
      };
    }

    const existingWord = await dbService.findWordById(id);
    if (!existingWord) {
      throw new Error(`Word with ID ${id} not found`);
    }

    const updatedWord = {
      ...existingWord,
      ...validatedFields.data,
      id
    };

    await dbService.updateAnnotatedWord(updatedWord);
    logger.info(`Word updated: ${updatedWord.word} (${updatedWord.language})`);
  } catch (error) {
    logger.error(`Error updating word ${id}:`, error);
    return {
      message: `Failed to update word: ${(error as Error).message}`,
    };
  }

  revalidatePath('/');
  redirect('/');
}

export async function deleteWord(id: string) {
  try {
    logger.info(`Deleting word with ID: ${id}`);
    const deleted = await dbService.deleteWordById(id);
    
    if (!deleted) {
      logger.warn(`Word with ID ${id} not found for deletion`);
    }
  } catch (error) {
    logger.error(`Error deleting word ${id}:`, error);
  }
  
  revalidatePath('/dashboard/words');
}
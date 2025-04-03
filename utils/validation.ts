import { WordRequestDTO } from "@/types/word"
import { NextResponse } from "next/server";
import { config } from "@/config";

/**
 * Validates the list of words to be annotated.
 * Ensures that the list is not empty and does not exceed the maximum limit.
 *
 * @param {WordRequestDTO[]} wordsList - The list of words to be validated.
 * @returns {NextResponse} - Returns a JSON response with an error message if validation fails.
 */
export function wordsToAnnotateValidation (wordsList: WordRequestDTO[]) {
  if (!wordsList.length) {
    return NextResponse.json(
      { error: 'No words provided for annotation' },
      { status: 400 }
    );
  } else if (wordsList.length > config.api.maxWordsLimit) {
    return NextResponse.json(
      { error: `Too many words provided for annotation at once (max: ${config.api.maxWordsLimit})` },
      { status: 400 }
    );
  }
}
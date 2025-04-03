'use client';

import { updateWord } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';
import Link from 'next/link';
import {
  BookOpenIcon,
  CheckIcon,
  GlobeAltIcon,
  LanguageIcon,
  SpeakerWaveIcon,
  PhotoIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { AnnotatedWord } from '@/types/word';
import { LANGUAGES, WORD_TYPES } from '@/types/word';
import { useActionState } from 'react';
import { WordFormState } from '@/app/lib/actions';

export default function EditWordForm({word,}: {word: AnnotatedWord}) {
  const initialState: WordFormState = { errors: {}, message: null };
  const updateWordWithId = async (prevState: WordFormState, formData: FormData) => {
    return updateWord(word.id, formData);
  };
  const [state, dispatch] = useActionState(updateWordWithId, initialState);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Word */}
        <div className="mb-4">
          <label htmlFor="word" className="mb-2 block text-sm font-medium">
            Word
          </label>
          <div className="relative">
            <input
              id="word"
              name="word"
              type="text"
              defaultValue={word.word}
              placeholder="Enter word"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              required
            />
            <BookOpenIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Language */}
        <div className="mb-4">
          <label htmlFor="language" className="mb-2 block text-sm font-medium">
            Choose language
          </label>
          <div className="relative">
            <select
              id="language"
              name="language"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={word.language}
              required
            >
              <option value="" disabled>
                Select a language
              </option>
              {LANGUAGES.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </select>
            <GlobeAltIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Word Type */}
        <div className="mb-4">
          <label htmlFor="wordType" className="mb-2 block text-sm font-medium">
            Word Type
          </label>
          <div className="relative">
            <select
              id="wordType"
              name="wordType"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={word.wordType}
              required
            >
              <option value="" disabled>
                Select a word type
              </option>
              {WORD_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <LanguageIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Gender (if applicable) */}
        <div className="mb-4">
          <label htmlFor="gender" className="mb-2 block text-sm font-medium">
            Gender (for nouns)
          </label>
          <div className="relative">
            <select
              id="gender"
              name="gender"
              className="peer block w-full cursor-pointer rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              defaultValue={word.gender || ''}
            >
              <option value="">Not applicable</option>
              <option value="masculine">Masculine</option>
              <option value="feminine">Feminine</option>
              <option value="neuter">Neuter</option>
            </select>
            <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Frequency */}
        <div className="mb-4">
          <label htmlFor="frequency" className="mb-2 block text-sm font-medium">
            Frequency (0-1)
          </label>
          <div className="relative">
            <input
              id="frequency"
              name="frequency"
              type="number"
              step="0.01"
              min="0"
              max="1"
              defaultValue={word.frequency}
              placeholder="Enter frequency (0-1)"
              className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Hidden fields for syllables and safeLetters
        (better to be implemented on the client) */}
        <input 
          type="hidden" 
          name="syllables" 
          defaultValue={JSON.stringify(word.syllables || [])}
        />
        <input 
          type="hidden" 
          name="safeLetters" 
          defaultValue={JSON.stringify(word.safeLetters || [])} 
        />

        {/* Media */}
        <fieldset className="mb-4">
          <legend className="mb-2 block text-sm font-medium">
            Media Availability
          </legend>
          <div className="rounded-md border border-gray-200 bg-white px-[14px] py-3">
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  id="hasAudio"
                  name="hasAudio"
                  type="checkbox"
                  value="true"
                  defaultChecked={word.hasAudio}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="hasAudio"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Has Audio <SpeakerWaveIcon className="h-4 w-4" />
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="hasImage"
                  name="hasImage"
                  type="checkbox"
                  value="true"
                  defaultChecked={word.hasImage}
                  className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
                />
                <label
                  htmlFor="hasImage"
                  className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
                >
                  Has Image <PhotoIcon className="h-4 w-4" />
                </label>
              </div>
            </div>
          </div>
        </fieldset>

        {/* Therapist Approval */}
        <div className="flex items-center mb-4">
          <input
            id="proovedByTherapist"
            name="proovedByTherapist"
            type="checkbox"
            value="true"
            defaultChecked={word.proovedByTherapist}
            className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
          />
          <label
            htmlFor="proovedByTherapist"
            className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
          >
            Approved by Therapist <CheckIcon className="h-4 w-4" />
          </label>
        </div>
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/words"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Update Word</Button>
      </div>
    </form>
  );
}

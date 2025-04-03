'use client';

import { createWord, WordFormState } from '@/app/lib/actions';
import { Button } from '@/app/ui/button';
import { useFormState } from 'react-dom';
import {
  BookOpenIcon,
  CheckIcon,
  GlobeAltIcon,
  LanguageIcon,
  SpeakerWaveIcon,
  PhotoIcon,
  UserIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { LANGUAGES, WORD_TYPES } from '@/types/word';
import { useActionState } from 'react';

export default function CreateWordForm() {
  const initialState: WordFormState = { errors: {}, message: null };
  const [state, dispatch] = useActionState(createWord, initialState);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* Word */}
        <div className="mb-4">
          <label htmlFor="word" className="mb-2 block text-sm font-medium">
            Word <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="word"
              name="word"
              type="text"
              placeholder="Enter word"
              className={`peer block w-full rounded-md border ${
                state.errors?.word ? 'border-red-500' : 'border-gray-200'
              } py-2 pl-10 text-sm outline-2 placeholder:text-gray-500`}
              aria-describedby="word-error"
              required
            />
            <BookOpenIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
          </div>
          {state.errors?.word && (
            <div
              id="word-error"
              className="mt-1 text-sm text-red-500"
            >
              <ExclamationCircleIcon className="inline h-4 w-4 mr-1" />
              {state.errors.word}
            </div>
          )}
        </div>

        {/* Language */}
        <div className="mb-4">
          <label htmlFor="language" className="mb-2 block text-sm font-medium">
            Choose language <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="language"
              name="language"
              className={`peer block w-full cursor-pointer rounded-md border ${
                state.errors?.language ? 'border-red-500' : 'border-gray-200'
              } py-2 pl-10 text-sm outline-2 placeholder:text-gray-500`}
              aria-describedby="language-error"
              defaultValue="Select a language"
              required
            >
              <option disabled>
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
          {state.errors?.language && (
            <div
              id="language-error"
              className="mt-1 text-sm text-red-500"
            >
              <ExclamationCircleIcon className="inline h-4 w-4 mr-1" />
              {state.errors.language}
            </div>
          )}
        </div>

        {/* Word Type */}
        <div className="mb-4">
          <label htmlFor="wordType" className="mb-2 block text-sm font-medium">
            Word Type <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              id="wordType"
              name="wordType"
              className={`peer block w-full cursor-pointer rounded-md border ${
                state.errors?.wordType ? 'border-red-500' : 'border-gray-200'
              } py-2 pl-10 text-sm outline-2 placeholder:text-gray-500`}
              aria-describedby="wordType-error"
              required
              defaultValue="Select a word type"
            >
              <option disabled>
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
          {state.errors?.wordType && (
            <div
              id="wordType-error"
              className="mt-1 text-sm text-red-500"
            >
              <ExclamationCircleIcon className="inline h-4 w-4 mr-1" />
              {state.errors.wordType}
            </div>
          )}
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
            Frequency (0-1) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="frequency"
              name="frequency"
              type="number"
              step="0.01"
              min="0"
              max="1"
              defaultValue="0.5"
              placeholder="Enter frequency (0-1)"
              className={`peer block w-full rounded-md border ${
                state.errors?.frequency ? 'border-red-500' : 'border-gray-200'
              } py-2 pl-10 text-sm outline-2 placeholder:text-gray-500`}
              aria-describedby="frequency-error"
              required
            />
          </div>
          {state.errors?.frequency && (
            <div
              id="frequency-error"
              className="mt-1 text-sm text-red-500"
            >
              <ExclamationCircleIcon className="inline h-4 w-4 mr-1" />
              {state.errors.frequency}
            </div>
          )}
        </div>

        {/* Hidden fields for syllables and safeLetters
        (may be implemented on the client, but now choosed to be done on the server) */}
        <input 
          type="hidden" 
          name="syllables" 
          value="[]"
        />
        <input 
          type="hidden" 
          name="safeLetters" 
          value="[]" 
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
            className="h-4 w-4 cursor-pointer border-gray-300 bg-gray-100 text-gray-600 focus:ring-2"
          />
          <label
            htmlFor="proovedByTherapist"
            className="ml-2 flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
          >
            Approved by Therapist <CheckIcon className="h-4 w-4" />
          </label>
        </div>

        {/* Form Error Message */}
        {state.message && (
          <div className="mt-2 p-2 text-sm text-red-500 bg-red-100 rounded-md">
            <ExclamationCircleIcon className="inline h-4 w-4 mr-1" />
            {state.message}
          </div>
        )}
      </div>
      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link>
        <Button type="submit">Create Word</Button>
      </div>
    </form>
  );
}

export type WordForm = {
  id: string;
  word: string;
  language: string;
  wordType: string;
  gender?: string;
  syllables: string[];
  safeLetters: string[];
  frequency: number;
  hasAudio: boolean;
  hasImage: boolean;
  proovedByTherapist: boolean;
};

export type WordField = {
  id: string;
  word: string;
};

export type LanguageField = {
  id: string;
  name: string;
};

export type WordsTable = {
  id: string;
  word: string;
  language: string;
  wordType: string;
  frequency: number;
  hasAudio: boolean;
  hasImage: boolean;
  proovedByTherapist: boolean;
  createdAt: string;
};
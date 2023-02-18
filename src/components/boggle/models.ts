import type { NoSerialize } from '@builder.io/qwik';

export const Language = {
  English: 'English',
  Russian: 'Russian',
  Spanish: 'Spanish',
};

export type LanguageType = typeof Language[keyof typeof Language];

const char = 'abcdefghijklmnopqrstuvwxyz'.split('');

type Char = typeof char[number];
export interface TrieNode {
  isWord?: boolean | undefined;
  children: {
    [key: Char]: TrieNode;
  };
}

export interface BoardState {
  chars: string[];
  boardSize: number;
  boardWidth: number;
  cellWidth: number;
}
export interface AnswersState {
  answers: string[];
  foundWords: string[];
}

export interface DictionaryState {
  dictionary: string[];
}

export interface WebWorkerState {
  mod: NoSerialize<Worker> | null;
}

export interface WasmState {
  mod: NoSerialize<
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    typeof import('/Users/alexbennett/Desktop/personal/boggle/src/components/boggle/boggle-solver/pkg/boggle_solver')
  > | null;
}

export interface GameState {
  isWordFound: boolean;
  selectedChars: { index: number; char: string }[];
  language: LanguageType;
  minCharLength: number;
}

export enum LetterCubeBgColor {
  Unselected = 'bg-white',
  Selected = 'bg-blue-200',
  WordFound = 'bg-green-200',
}

export enum WordListType {
  Answers = 'answers',
  Found = 'foundwords',
}

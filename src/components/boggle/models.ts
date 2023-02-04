import type { NoSerialize } from '@builder.io/qwik';
import type { Language } from '~/components/boggle/logic/api';

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

export interface GameState {
  isWordFound: boolean;
  selectedChars: { index: number; char: string }[];
  language: Language;
  minCharLength: number;
}

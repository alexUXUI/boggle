import type { NoSerialize } from '@builder.io/qwik';
import type { Language } from '~/components/boggle/logic/api';

export interface BoggleProps {
  data: {
    board: string[];
    boardWidth: number;
    boardSize: number;
    language: string;
    minCharLength: number;
  };
}

export interface BoardState {
  data: string[];
  boardSize: number;
  boardWidth: number;
  cellWidth: number;
}

export interface LanguageState {
  data: Language;
  minCharLength: number;
}

export interface AnswersState {
  data: string[];
  foundWords: string[];
}

export interface DictionaryState {
  data: string[];
}

export interface WebWorkerState {
  mod: NoSerialize<Worker> | null;
}

export interface GameState {
  isWordFound: boolean;
  selectedChars: { index: number; char: string }[];
}

export interface WordsListState {
  isAnswersOpen: boolean;
  isFoundWordsOpen: boolean;
}

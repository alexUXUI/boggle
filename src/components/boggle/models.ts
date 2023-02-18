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

export interface WasmState {
  mod: NoSerialize<
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    typeof import('/Users/alexbennett/Desktop/personal/boggle/src/components/boggle/boggle-solver/pkg/boggle_solver')
  > | null;
}

export interface GameState {
  isWordFound: boolean;
  selectedChars: { index: number; char: string }[];
  language: Language;
  minCharLength: number;
}

import { NoSerialize, useTask$ } from '@builder.io/qwik';
import { $, component$, useOnWindow, useStore } from '@builder.io/qwik';
import { Controls } from '~/features/boggle/components/Controls';
import type { Language } from '~/routes/boggle/logic/api';
import BoggleWorker from './worker?worker';
import { BoggleBoard } from './components/Board';

interface BoggleProps {
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
  selectedChars: { index: number; char: string }[];
  boardWidth: number;
  cellWidth: number;
}

export interface SelectedCharsState {
  data: { index: number; char: string }[];
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
}

export const BoogleRoot = component$(
  ({
    data: { board, boardSize, language, boardWidth, minCharLength },
  }: BoggleProps) => {
    const boardState = useStore<BoardState>({
      data: board,
      boardSize: boardSize ?? 0,
      selectedChars: [],
      boardWidth: boardWidth ?? 0,
      cellWidth: calculateCellWidth(boardWidth, boardSize),
    });

    const gameState = useStore<GameState>({
      isWordFound: false,
    });

    const selectedCharsState = useStore<SelectedCharsState>({
      data: [],
    });

    const languageState = useStore<LanguageState>({
      data: language,
      minCharLength: minCharLength ?? 0,
    });

    const answersState = useStore<AnswersState>({
      data: [],
      foundWords: [],
    });

    const dictionaryState = useStore<DictionaryState>({ data: [] });

    useOnWindow(
      'DOMContentLoaded',
      $(() => {
        if (window.Worker) {
          const worker = new BoggleWorker();
          worker.postMessage({
            language: languageState.data,
            board: boardState.data,
            minCharLength: languageState.minCharLength,
          });
          worker.onmessage = (event) => {
            dictionaryState.data = event.data.dictionary;
            answersState.data = event.data.answers;
          };
        }
      })
    );

    // track when the selected chars change
    useTask$(({ track }) => {
      track(() => selectedCharsState.data);
      console.log('selected chars changed', selectedCharsState.data);
      // figure out if the selected chars are in the dictionary
      // if they are, add them to the answers
      if (selectedCharsState.data.length) {
        const word = selectedCharsState.data
          .map((element: { index: number; char: string }) => element.char)
          .join('');

        const isWordInDict = dictionaryState.data.includes(word);
        const isWordYetToBeFound = !answersState.foundWords.includes(word);
        const isWordLongEnough = word.length >= languageState.minCharLength;
        if (isWordLongEnough && isWordInDict && isWordYetToBeFound) {
          gameState.isWordFound = true;

          setTimeout(() => {
            answersState.foundWords = [...answersState.foundWords, word];
            selectedCharsState.data = [];
            gameState.isWordFound = false;
            // fireWorks();
          }, 1000);
        }
      }
    });

    // const handleBoardChange = $((newBoard: string[]) => {
    //   if (webWorkerState?.data) {
    //     webWorkerState.data.onmessage = (event) => {
    //       dictionaryState.data = event.data.dictionary;
    //       answersState.data = event.data.answers;
    //     };
    //     webWorkerState.data.postMessage({
    //       language: languageState.data,
    //       board: newBoard,
    //       minCharLength: languageState.minCharLength,
    //     });
    //   }
    // });

    return (
      <div>
        <h1 class="text-[22px] w-fit m-auto bg-white p-2 rounded-sm text-blue-800 text-center">
          Boogle
        </h1>
        <Controls
          boardState={boardState}
          languageState={languageState}
          answersState={answersState}
          dictionaryState={dictionaryState}
        />
        <BoggleBoard
          boardState={boardState}
          selectedCharsState={selectedCharsState}
          gameState={gameState}
        />
      </div>
    );
  }
);

export const calculateCellWidth = (boardWidth: number, boardSize: number) => {
  switch (boardSize) {
    case 2:
      return boardWidth / boardSize - 40;
    case 3:
      return boardWidth / boardSize - 20;
    case 4:
      return boardWidth / boardSize - 12;
    case 5:
      return boardWidth / boardSize - boardSize * 2;
    case 6:
      return boardWidth / boardSize - boardSize - 2;
    case 7:
      return boardWidth / boardSize - 6;
    case 8:
      return boardWidth / boardSize - 6;
    case 9:
      return boardWidth / boardSize - 4;
    default:
      return boardWidth / boardSize - 2;
  }
};

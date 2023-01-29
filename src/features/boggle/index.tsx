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
        <WordsList
          answersState={answersState}
          title="answers"
          minCharLength={languageState.minCharLength}
        />
        <WordsList
          answersState={answersState}
          title="foundWords"
          minCharLength={languageState.minCharLength}
        />
      </div>
    );
  }
);

export const WordsList = component$(
  ({
    answersState,
    title,
    minCharLength,
  }: {
    answersState: AnswersState;
    title: string;
    minCharLength: number;
  }) => {
    const openState = useStore({ isOpen: false });
    const isAnswers = title === 'answers';

    // create a ref to the list

    useOnWindow(
      'DOMContentLoaded',
      $(() => {
        const list = document.getElementById(`words-list-${title}`);

        // on click detect if the click was outside the list
        // if it was, close the list
        const handleClick = (event: MouseEvent) => {
          if (list && !list.contains(event.target as Node)) {
            openState.isOpen = false;
          }
        };

        // if the user presses esc close the list
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            openState.isOpen = false;
          }
        };

        // add the event listener
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeyDown);
      })
    );

    const handleToggle = $(() => {
      openState.isOpen = !openState.isOpen;
    });

    return (
      <div
        id={`words-list-${title}`}
        class={`bg-white transition-all absolute h-[${
          openState.isOpen ? 500 : 50
        }px] bottom-[${
          isAnswers ? 0 : 50
        }px] w-full flex flex-col items-center`}
        style={{
          zIndex: isAnswers ? 50 : 5,
        }}
      >
        <div class={`w-full bg-blue-${isAnswers ? 100 : 50}`}>
          <h2 class="h-[40px] mt-[5px] text-[18px] w-fit m-auto bg-white p-2 rounded-sm text-blue-800 text-center">
            {isAnswers ? 'Answers' : 'Found Words'}
          </h2>
          <button
            class="hover:bg-blue-100 leading-[20px] absolute right-[5px] bottom-[5px] text-[18px] bg-white p-2 rounded-md border-2 border-slate-300 h-[40px]"
            onClick$={handleToggle}
          >
            {openState.isOpen ? 'Close' : 'Open'}
          </button>
        </div>

        {openState.isOpen ? (
          <div class="w-full overflow-scroll bg-white flex flex-wrap justify-center">
            <ul class="mb-[40px] mt-[10px] bg-white h-[100%] flex flex-wrap w-[100%] m-auto pb-[30px]">
              {answersState[isAnswers ? 'data' : 'foundWords']
                .filter((word) => {
                  return word.length >= minCharLength;
                })
                .map((word) => (
                  <li class="w-[33%] text-center">{word}</li>
                ))}
            </ul>
          </div>
        ) : null}
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

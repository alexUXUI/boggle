import {
  useTask$,
  $,
  component$,
  useOnWindow,
  useStore,
} from '@builder.io/qwik';
import { Controls } from './components/Controls';
import { BoggleBoard } from './components/Board';
import { WordsList } from './components/WordsList';
import { calculateCellWidth } from './logic/board.logic';
import BoggleWorker from './worker?worker';
import type {
  BoggleProps,
  BoardState,
  GameState,
  SelectedCharsState,
  LanguageState,
  AnswersState,
  DictionaryState,
} from './models';

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

    const gameState = useStore<GameState>({ isWordFound: false });

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

    const answerListState = useStore({ isOpen: false });
    const foundListState = useStore({ isOpen: false });

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
      <div class="h-[100%] dont-scroll">
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
        <div class="flex justify-center absolute bottom-0 w-full h-[60px]">
          <WordsList
            answersState={answersState}
            title="foundWords"
            minCharLength={languageState.minCharLength}
            state={foundListState}
          />
          <WordsList
            answersState={answersState}
            title="answers"
            minCharLength={languageState.minCharLength}
            state={answerListState}
          />
        </div>
      </div>
    );
  }
);

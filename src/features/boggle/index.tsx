import {
  useTask$,
  $,
  component$,
  useOnWindow,
  useStore,
  createContext,
  useContextProvider,
  useContext,
} from '@builder.io/qwik';
import { Controls } from './components/Controls';
import { BoggleBoard } from './components/Board';
import { WordsList } from './components/WordsList';
import { calculateCellWidth } from './logic/board.logic';
import type {
  BoggleProps,
  BoardState,
  GameState,
  SelectedCharsState,
  LanguageState,
  AnswersState,
  DictionaryState,
} from './models';
import BoggleWorker from './worker?worker';

export const BoardCtx = createContext<BoardState>('board-context');
export const LanguageCtx = createContext<LanguageState>('language-context');
export const GameCtx = createContext<GameState>('game-context');
export const SelectedCharsCtx = createContext<SelectedCharsState>('selected');
export const AnswersCtx = createContext<AnswersState>('answers-context');
export const DictionaryCtx = createContext<DictionaryState>('dictionary');

export const BoogleRoot = component$(
  ({
    data: { board, boardSize, language, boardWidth, minCharLength },
  }: BoggleProps) => {
    const dictionaryState = useStore<DictionaryState>({ data: [] });

    const boardState = useStore<BoardState>({
      data: board,
      boardSize: boardSize ?? 0,
      boardWidth: boardWidth ?? 0,
      cellWidth: calculateCellWidth(boardWidth, boardSize),
    });

    const languageState = useStore<LanguageState>({
      data: language,
      minCharLength: minCharLength ?? 0,
    });

    const gameState = useStore<GameState>({ isWordFound: false });

    const selectedCharsState = useStore<SelectedCharsState>({
      data: [],
    });

    const answersState = useStore<AnswersState>({
      data: [],
      foundWords: [],
    });

    useContextProvider(DictionaryCtx, dictionaryState);
    useContextProvider(BoardCtx, boardState);
    useContextProvider(LanguageCtx, languageState);
    useContextProvider(GameCtx, gameState);
    useContextProvider(SelectedCharsCtx, selectedCharsState);
    useContextProvider(AnswersCtx, answersState);

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
        <Controls />
        <BoggleBoard />
        <Words />
      </div>
    );
  }
);

export const Words = component$(() => {
  const answersState = useContext(AnswersCtx);
  const languageState = useContext(LanguageCtx);
  return (
    <div class="flex justify-center absolute bottom-0 w-full h-[60px]">
      <WordsList
        words={answersState.foundWords}
        title="foundWords"
        minCharLength={languageState.minCharLength}
      />
      <WordsList
        words={answersState.data}
        title="answers"
        minCharLength={languageState.minCharLength}
      />
    </div>
  );
});

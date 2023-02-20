import {
  $,
  component$,
  useOnWindow,
  useStore,
  useContextProvider,
  noSerialize,
  useTask$,
} from '@builder.io/qwik';

import { Controls } from './controls/Controls';
import { WordsPanel } from './controls/WordsPanel';
import { BoggleBoard } from './board/Board';
import { calculateCellWidth, handleFoundWord } from './logic/board';
import {
  DictionaryCtx,
  BoardCtx,
  GameCtx,
  AnswersCtx,
  WorkerCtx,
} from './context';
import BoggleWorker from './worker?worker';

import type {
  BoardState,
  GameState,
  AnswersState,
  DictionaryState,
  WebWorkerState,
  LanguageType,
} from './models';
import { UserGameStats } from './user/UserGameStats';

export interface BoggleProps {
  data: {
    board: string[];
    boardWidth: number;
    boardSize: number;
    language: LanguageType;
    minCharLength: number;
  };
}

export const BoogleRoot = component$(({ data }: BoggleProps) => {
  const { board, boardWidth, boardSize, language, minCharLength } = data;

  const dictionaryState = useStore<DictionaryState>({ dictionary: [] });

  const boardState = useStore<BoardState>({
    chars: board,
    boardSize: boardSize ?? 0,
    boardWidth: boardWidth ?? 0,
    cellWidth: calculateCellWidth(boardWidth, boardSize),
  });

  const gameState = useStore<GameState>({
    isWordFound: false,
    selectedChars: [],
    language: language,
    minCharLength: minCharLength ?? 0,
    currentLevel: 1,
    wordsUntilNextLevel: 1,
    levelStepSize: 1,
  });

  const answersState = useStore<AnswersState>({
    answers: [],
    foundWords: [],
  });

  const workerState = useStore<WebWorkerState>({ mod: null });

  useOnWindow(
    'DOMContentLoaded',
    $(() => {
      if (window.Worker) {
        const worker = new BoggleWorker();
        workerState.mod = noSerialize(worker);
        if (workerState.mod) {
          workerState.mod.postMessage({
            language: gameState.language,
            board: boardState.chars,
            minCharLength: gameState.minCharLength,
            isDictionaryLoaded: dictionaryState.dictionary.length,
          });
          workerState.mod.onmessage = (event) => {
            if (!dictionaryState.dictionary.length) {
              dictionaryState.dictionary = event.data.dictionary;
            }
            answersState.answers = event.data.answers;
          };
        }
      }
    })
  );

  useTask$(({ track }) => {
    track(() => gameState.selectedChars);
    if (gameState.selectedChars.length) {
      handleFoundWord(gameState, dictionaryState, answersState);
    }
  });

  useTask$(({ track }) => {
    track(() => answersState.foundWords);
    // when the user finds a word, update the level if necessary

    if (answersState.foundWords) {
      if (gameState.wordsUntilNextLevel === 0) {
        gameState.currentLevel = gameState.currentLevel + 1;
        gameState.wordsUntilNextLevel = gameState.currentLevel;
        gameState.levelStepSize = gameState.currentLevel;
      }

      gameState.wordsUntilNextLevel = gameState.wordsUntilNextLevel - 1;
    }

    // function calculateLevel(numberofFoundWords: number): number {
    //   let level: number = 1;
    //   switch (numberofFoundWords) {
    //     case 0:
    //       level = 1;
    //       break;
    //     case 1:
    //       level = 1;
    //       break;
    //     case 3:
    //       level = 2;
    //       break;
    //     case 6:
    //       level = 3;
    //       break;
    //     case 10:
    //       level = 4;
    //       break;
    //     case 15:
    //       level = 5;
    //       break;
    //     case 21:
    //       level = 6;
    //       break;
    //     case 28:
    //       level = 7;
    //       break;
    //     case 36:
    //       level = 8;
    //       break;
    //     case 45:
    //       level = 9;
    //       break;
    //     case 55:
    //       level = 10;
    //       break;
    //     case 66:
    //       level = 11;
    //       break;
    //     case 78:
    //       level = 12;
    //       break;
    //     case 91:
    //       level = 13;
    //       break;
    //     case 105:
    //       level = 14;
    //       break;
    //   }
    //   return level;
    // }

    // function calculateLevel(numberofFoundWords: number): number {
    //   return Math.floor(
    //     1 + (numberofFoundWords * (numberofFoundWords + 1)) / 2
    //   );
    // }

    // gameState.currentLevel = calculateLevel(answersState.foundWords.length);
  });

  useContextProvider(DictionaryCtx, dictionaryState);
  useContextProvider(BoardCtx, boardState);
  useContextProvider(GameCtx, gameState);
  useContextProvider(AnswersCtx, answersState);
  useContextProvider(WorkerCtx, workerState);

  return (
    <div class="h-[100%] dont-scroll">
      <Controls />
      <UserGameStats />
      <BoggleBoard />
      <WordsPanel />
    </div>
  );
});

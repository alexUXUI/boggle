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
    currentLevel: 0,
    wordsUntilNextLevel: 0,
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

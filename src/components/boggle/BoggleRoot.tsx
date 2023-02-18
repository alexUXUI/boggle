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
          });
          workerState.mod.onmessage = (event) => {
            dictionaryState.dictionary = event.data.dictionary;
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

  useContextProvider(WorkerCtx, workerState);
  useContextProvider(DictionaryCtx, dictionaryState);
  useContextProvider(BoardCtx, boardState);
  useContextProvider(GameCtx, gameState);
  useContextProvider(AnswersCtx, answersState);

  return (
    <div class="h-[100%] dont-scroll">
      <Controls />
      <BoggleBoard />
      <WordsPanel />
    </div>
  );
});

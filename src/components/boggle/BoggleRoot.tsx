import {
  useTask$,
  $,
  component$,
  useOnWindow,
  useStore,
  useContextProvider,
} from '@builder.io/qwik';

import { Controls } from './controls/Controls';
import { WordsPanel } from './controls/WordsPanel';
import { BoggleBoard } from './board/Board';
import { calculateCellWidth, handleFoundWord } from './logic/board';
import { DictionaryCtx, BoardCtx, GameCtx, AnswersCtx } from './context';
import BoggleWorker from './worker?worker';

import type {
  BoardState,
  GameState,
  AnswersState,
  DictionaryState,
} from './models';

export interface BoggleProps {
  data: {
    board: string[];
    boardWidth: number;
    boardSize: number;
    language: string;
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

  useContextProvider(DictionaryCtx, dictionaryState);
  useContextProvider(BoardCtx, boardState);
  useContextProvider(GameCtx, gameState);
  useContextProvider(AnswersCtx, answersState);

  useOnWindow(
    'DOMContentLoaded',
    $(() => {
      if (window.Worker) {
        const worker = new BoggleWorker();
        worker.postMessage({
          language: gameState.language,
          board: boardState.chars,
        });
        worker.onmessage = (event) => {
          dictionaryState.dictionary = event.data.dictionary;
          answersState.answers = event.data.answers;
        };
      }
      // import('./boggle-solver/pkg').then(async (module) => {
      //   await module.default();
      //   await module.run('alexuxui');
      //   // const value = await module.run_game();
      //   // console.log(value);
      //   // console.log(dict);
      // });
    })
  );

  useTask$(({ track }) => {
    track(() => gameState.selectedChars);
    handleFoundWord(gameState, dictionaryState, answersState);
  });

  return (
    <div class="h-[100%] dont-scroll">
      <Controls />
      <BoggleBoard />
      <WordsPanel />
    </div>
  );
});

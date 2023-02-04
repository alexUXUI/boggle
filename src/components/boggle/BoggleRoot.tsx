import {
  useTask$,
  $,
  component$,
  useOnWindow,
  useStore,
  createContext,
  useContextProvider,
} from '@builder.io/qwik';
import { BoggleBoard } from './board/Board';

import { calculateCellWidth } from './logic/board';
import type {
  BoggleProps,
  BoardState,
  GameState,
  LanguageState,
  AnswersState,
  DictionaryState,
} from './models';
import BoggleWorker from './worker?worker';
import { Controls } from './controls/Controls';
import { WordsPanel } from './controls/WordsPanel';

export const confetti = import('canvas-confetti');

export const BoardCtx = createContext<BoardState>('board-context');
export const DictionaryCtx = createContext<DictionaryState>('dictionary');
export const LanguageCtx = createContext<LanguageState>('language-context');
export const GameCtx = createContext<GameState>('game-context');
export const AnswersCtx = createContext<AnswersState>('answers-context');

export const BoogleRoot = component$(({ data }: BoggleProps) => {
  const { board, boardWidth, boardSize, language, minCharLength } = data;

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

  const gameState = useStore<GameState>({
    isWordFound: false,
    selectedChars: [],
  });

  const answersState = useStore<AnswersState>({
    data: [],
    foundWords: [],
  });

  useContextProvider(DictionaryCtx, dictionaryState);
  useContextProvider(BoardCtx, boardState);
  useContextProvider(LanguageCtx, languageState);
  useContextProvider(GameCtx, gameState);
  useContextProvider(AnswersCtx, answersState);

  useOnWindow(
    'DOMContentLoaded',
    $(() => {
      if (window.Worker) {
        const worker = new BoggleWorker();
        worker.postMessage({
          language: languageState.data,
          board: boardState.data,
        });
        worker.onmessage = (event) => {
          dictionaryState.data = event.data.dictionary;
          answersState.data = event.data.answers;
        };
      }
    })
  );

  useTask$(({ track }) => {
    track(() => gameState.selectedChars);
    if (gameState.selectedChars.length) {
      const word = gameState.selectedChars
        .map((element: { index: number; char: string }) => element.char)
        .join('');

      const isWordInDict = dictionaryState.data.includes(word);
      const isWordYetToBeFound = !answersState.foundWords.includes(word);
      const isWordLongEnough = word.length >= languageState.minCharLength;
      if (isWordLongEnough && isWordInDict && isWordYetToBeFound) {
        gameState.isWordFound = true;

        setTimeout(() => {
          answersState.foundWords = [...answersState.foundWords, word];
          gameState.selectedChars = [];
          gameState.isWordFound = false;
          confetti.then((module) => {
            const count = 200;
            const defaults = {};

            function fire(particleRatio: number, opts: any) {
              module.default(
                Object.assign({}, defaults, opts, {
                  particleCount: Math.floor(count * particleRatio) * 2,
                  colors: [
                    '#0000af',
                    '#05b5eb',
                    '#0051ba',
                    '#230ee2',
                    '#1f3bc6',
                  ],
                })
              );
            }

            fire(0.25, {
              spread: 46,
              startVelocity: 55,
              origin: { x: 0.5, y: 1 },
              decay: 0.87,
              scalar: 1.2,
            });
          });
        }, 100);
      }
    }
  });

  useTask$(({ track }) => {
    track(() => answersState.foundWords);
    track(() => answersState.data);

    const answersLength = answersState.data.length;
    const foundWordsLength = answersState.foundWords.length - 1;

    console.log(foundWordsLength, answersLength);

    if (foundWordsLength && foundWordsLength === answersLength) {
      setTimeout(() => {
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = {
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 0,
        };

        confetti.then((module) => {
          function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
          }

          const interval: ReturnType<typeof setTimeout> = setInterval(
            function () {
              const timeLeft = animationEnd - Date.now();

              if (timeLeft <= 0) {
                return clearInterval(interval);
              }

              const particleCount = 50 * (timeLeft / duration);
              // since particles fall down, start a bit higher than random
              module.default(
                Object.assign({}, defaults, {
                  particleCount,
                  origin: {
                    x: randomInRange(0.1, 0.3),
                    y: Math.random() - 0.2,
                  },
                })
              );
              module.default(
                Object.assign({}, defaults, {
                  particleCount,
                  origin: {
                    x: randomInRange(0.7, 0.9),
                    y: Math.random() - 0.2,
                  },
                })
              );
            },
            250
          );
        });
      }, 100);
    }
  });

  return (
    <div class="h-[100%] dont-scroll">
      <Controls />
      <BoggleBoard />
      <WordsPanel />
    </div>
  );
});

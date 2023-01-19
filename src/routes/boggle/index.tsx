import {
  component$,
  useStore,
  useTask$,
  useClientEffect$,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Answers } from "./components/Answers";
import { generateRandomBoard } from "./logic/generateBoard";
import { BoggleGrid } from "./components/BoggleGrid";
import { Controls } from "./components/Controls";
import { FoundWords } from "./components/FoundWords";
import { importWordsFromPublicDir } from "./logic/api";
import { solve } from "./logic/boggle";
export const Boggle = import("../../boggle/pkg/boggle");
export const confetti = import("canvas-confetti");

export interface State {
  boardSize: number;
  board: string[];
  minWordLength: number;
  selectedPath: { index: number; char: string }[];
  wordFound: boolean;
  isLoaded: boolean;
}

export default component$(() => {
  const state = useStore<State>({
    boardSize: 5, // default board length and width dimension
    board: generateRandomBoard(5).split(""), // random default board
    minWordLength: 5, // minimum word length
    selectedPath: [], // selected path on the board
    wordFound: false, // whether a word was found, used for animation
    isLoaded: false, // whether the dictionary has been loaded
  });

  const answers = useStore({
    data: [""],
  });

  const foundWords = useStore({
    words: [""],
  });

  const dictionaryState = useStore({
    dictionary: [""],
  });

  // use client effect to import the wasm module in the top level directory in the boggle directory
  useClientEffect$(() => {
    Boggle.then(async (module) => {
      await module.default();
      module.greet("OMGGGGG");
    });
  });

  // when the component mounts, fetch the dictionary
  useClientEffect$(() => {
    if (dictionaryState.dictionary.length <= 1) {
      importWordsFromPublicDir().then((data) => {
        dictionaryState.dictionary = data;
        answers.data = solve(data, state.board).filter((value: string) => {
          return value.length >= state.minWordLength;
        });
        state.isLoaded = true;
      });
    } else {
      const filtered = solve(dictionaryState.dictionary, state.board).filter(
        (value: string) => {
          return value.length >= state.minWordLength;
        }
      );
      answers.data = filtered;
      state.isLoaded = true;
    }
  });

  /**
   * When the board size updates:
   * 1. generate a new board
   * 2. solve the board
   * 3. update the answers
   */
  useTask$(({ track }) => {
    track(() => state.boardSize);
    track(() => state.board);
    answers.data = solve(dictionaryState.dictionary, state.board).filter(
      (value: string) => {
        return value.length >= state.minWordLength;
      }
    );

    state.selectedPath = [];
    foundWords.words = [""];
  });

  /**
   * When the minimum word length updates:
   * 1. solve the board
   * 2. update the answers
   */
  useTask$(({ track }) => {
    track(() => state.minWordLength);
    answers.data = solve(dictionaryState.dictionary, state.board).filter(
      (value: string) => {
        return value.length >= state.minWordLength;
      }
    );

    state.selectedPath = [];
  });

  /**
   * When the selected path updates:
   * 1. check if the word is long enough
   * 2. check if the word exists in the dictionary
   * 3. if both are true, add the word to the found words list
   * 4. clear the selected path
   */
  useTask$(({ track }) => {
    track(() => state.selectedPath);
    if (state.selectedPath.length > 1) {
      const word = state.selectedPath
        .map((element: { index: number; char: string }) => element.char)
        .join("");

      const wordExists = dictionaryState.dictionary.includes(word);
      const wordNotFound = !foundWords.words.includes(word);
      const longEnough = word.length >= state.minWordLength;
      if (longEnough && wordExists && wordNotFound) {
        state.wordFound = true;

        setTimeout(() => {
          foundWords.words = [...foundWords.words, word];
          state.selectedPath = [];
          state.wordFound = false;
          confetti.then((module) => {
            const count = 200;
            const defaults = {};

            function fire(particleRatio: number, opts: any) {
              module.default(
                Object.assign({}, defaults, opts, {
                  particleCount: Math.floor(count * particleRatio) * 2,
                  colors: [
                    "#0000af",
                    "#05b5eb",
                    "#0051ba",
                    "#230ee2",
                    "#1f3bc6",
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
    track(() => foundWords.words);
    track(() => answers.data);

    const answersLength = answers.data.length;
    const foundWordsLength = foundWords.words.length - 1;

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

  const answersLength = answers.data.length;
  const foundWordsLength = foundWords.words.length - 1;

  return (
    <div class=" flex justify-center flex-col">
      <div class="flex w-full items-center justify-center">
        <h1 class="text-4xl m-0 text-center text-blue-800 bg-white rounded-md px-3 py-1 mt-4">
          Boggle
        </h1>
      </div>
      <main class="flex max-w-[500px] m-auto items-center justify-center mt-4 bg-white z-10">
        <Controls
          state={state}
          answersLength={answersLength}
          foundWordsLength={foundWordsLength}
        />
      </main>
      <BoggleGrid
        board={state.board}
        boardSize={state.boardSize}
        state={state}
      />
      <main class="m-auto w-[98%] mb-[50px]">
        <FoundWords
          words={foundWords.words}
          minWordLength={state.minWordLength}
        />
        <Answers
          foundWords={foundWords.words}
          answers={answers.data}
          minWordLength={state.minWordLength}
        />
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Boggle",
};

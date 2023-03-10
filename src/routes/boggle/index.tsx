import type { NoSerialize } from "@builder.io/qwik";
import {
  component$,
  useStore,
  useTask$,
  useClientEffect$,
  noSerialize,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { Answers } from "./components/Answers";
import { BoggleGrid } from "./components/BoggleGrid";
import { Controls } from "./components/Controls";
import { FoundWords } from "./components/FoundWords";
// import { solve } from "./logic/boggle";
import { fireWorks, foundWordCelebration } from "./logic/celebrations";
export const Boggle = import("../../boggle/pkg/boggle");

export interface State {
  boardSize: number;
  board: string[];
  minWordLength: number;
  selectedPath: { index: number; char: string }[];
  wordFound: boolean;
  isLoaded: boolean;
}

interface IBoggle {
  generate_board: (size: number) => string[][];
  generate_board_string: () => string;
  get_dictionary: () => Promise<string[]>;
  get_board_string: (matrix: string[][]) => string;
  run_game: () => Promise<string[]>;
}

interface Wasm {
  module: NoSerialize<
    | IBoggle
    | typeof import("/Users/alexbennett/Desktop/boggle/src/boggle/pkg/boggle")
  > | null;
}

export default component$(() => {
  const state = useStore<State>({
    boardSize: 5, // default board length and width dimension
    board: [], // random default board
    minWordLength: 3, // minimum word length
    selectedPath: [], // selected path on the board
    wordFound: false, // whether a word was found, used for animation
    isLoaded: false, // whether the dictionary has been loaded
  });

  const boggle = useStore<Wasm>({
    module: null,
  });

  const answers = useStore({
    data: [""],
  });

  const foundWords = useStore({
    data: [""],
  });

  const dictionaryState = useStore({
    data: [""],
  });

  // use client effect to import the wasm module in the top level directory in the boggle directory
  useClientEffect$(() => {
    Boggle.then(async (module) => {
      // await the module
      await module.default();

      // set the module innon-serializable  state
      boggle.module = noSerialize(module);

      // const matrix = module.generate_board(state.boardSize);
      // const boardString = module.get_board_string(matrix);
      // state.board = boardString.split("");

      // console.log("boardString", boardString);

      // get the dictionary over HTTP
      // module.get_dictionary().then((dict) => {
      //   const minLength = dict.filter((value: string) => {
      //     return value.length >= state.minWordLength;
      //   });

      //   // set the dictionary in state
      //   dictionaryState.data = minLength;
      //   state.isLoaded = true;
      // });

      module.run_game().then((dict) => {
        console.log("ANSWERS", dict);
      });
    });
  });

  // when the component mounts, fetch the dictionary
  // useClientEffect$(() => {
  //   if (dictionaryState.dictionary.length <= 1) {
  //     importWordsFromPublicDir().then((data) => {
  //       dictionaryState.dictionary = data;

  //       const foundAnswers = solve(data, state.board).filter(
  //         (value: string) => {
  //           return value.length >= state.minWordLength;
  //         }
  //       );

  //       answers.data = foundAnswers;
  //       state.isLoaded = true;
  //     });
  //   } else {
  //     const foundAnswers = solve(
  //       dictionaryState.dictionary,
  //       state.board
  //     ).filter((value: string) => {
  //       return value.length >= state.minWordLength;
  //     });

  //     answers.data = foundAnswers;
  //     state.isLoaded = true;
  //   }
  // });

  /**
   * When the board chars or grid size updates:
   * 1. generate a new board
   * 2. solve the board
   * 3. update the answers
   */
  useTask$(({ track }) => {
    track(() => state.boardSize);
    track(() => state.board);
    console.log("board size", state.boardSize);
    if (typeof window !== "undefined" && boggle.module !== null) {
      // console.log("boggle module");
      // const matrix = boggle.module!.generate_board(state.boardSize);
      // console.log("matrix", matrix);
      boggle.module!.run_game().then((ans) => {
        console.log("answers", ans);
        answers.data = ans;
      });
    }
    state.selectedPath = [];
    foundWords.data = [""];
  });

  useTask$(({ track }) => {
    track(() => state.board);
    // const foundAnswers = solve(dictionaryState.data, state.board).filter(
    //   (value: string) => {
    //     return value.length >= state.minWordLength;
    //   }
    // );

    // answers.data = foundAnswers;
  });

  /**
   * When the minimum word length updates:
   * 1. solve the board
   * 2. update the answers
   */
  useTask$(({ track }) => {
    track(() => state.minWordLength);
    // answers.data = solve(dictionaryState.data, state.board).filter(
    //   (value: string) => {
    //     return value.length >= state.minWordLength;
    //   }
    // );
    // state.selectedPath = [];
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

      const wordExists = dictionaryState.data.includes(word);
      const wordNotFound = !foundWords.data.includes(word);
      const longEnough = word.length >= state.minWordLength;
      if (longEnough && wordExists && wordNotFound) {
        state.wordFound = true;

        setTimeout(() => {
          foundWords.data = [...foundWords.data, word];
          foundWordCelebration();
          state.selectedPath = [];
          state.wordFound = false;
        }, 100);
      }
    }
  });

  /**
   * Celebrate when all the words have been found
   */
  useTask$(({ track }) => {
    track(() => foundWords.data);
    track(() => answers.data);
    const answersLength = answers.data.length;
    const foundWordsLength = foundWords.data.length - 1;
    if (foundWordsLength && foundWordsLength === answersLength) {
      fireWorks();
    }
  });

  return (
    <div class=" flex justify-center flex-col">
      <div class="flex w-full items-center justify-center">
        <h1 class="text-4xl m-0 text-center text-blue-800 bg-white rounded-md px-3 py-1 mt-4">
          Boggle
        </h1>
      </div>
      <div class="flex max-w-[500px] m-auto items-center justify-center mt-4 bg-white z-10">
        <Controls
          state={state}
          answersLength={answers.data.length}
          foundWordsLength={foundWords.data.length - 1}
        />
      </div>
      <BoggleGrid
        board={state.board}
        boardSize={state.boardSize}
        state={state}
      />
      <div class="max-w-[600px] m-auto w-[98%] mb-[50px]">
        <FoundWords
          words={foundWords.data}
          minWordLength={state.minWordLength}
        />
        <Answers
          foundWords={foundWords.data}
          answers={answers.data}
          minWordLength={state.minWordLength}
        />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Boggle",
};

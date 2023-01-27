import {
  component$,
  useStore,
  useTask$,
  useClientEffect$,
} from '@builder.io/qwik';
import type { DocumentHead } from '@builder.io/qwik-city';
import { Answers } from './components/Answers';
import { generateRandomRussianBoard } from './logic/generateBoard';
import { BoggleGrid } from './components/BoggleGrid';
import { Controls } from './components/Controls';
import { FoundWords } from './components/FoundWords';
import type { Language } from './logic/api';
import { LANGUAGE, getDictionary } from './logic/api';
import { solve } from './logic/boggle';
import { confettiCelebration, fireWorks } from './animations';

export interface State {
  boardSize: number;
  board: string[];
  minWordLength: number;
  selectedPath: { index: number; char: string }[];
  wordFound: boolean;
  isLoaded: boolean;
  language: Language;
}

export default component$(() => {
  const state = useStore<State>({
    boardSize: 5, // default board length and width and height
    board: generateRandomRussianBoard(5).split(''), // random default board
    minWordLength: 5, // minimum word length
    selectedPath: [], // selected path on the board
    wordFound: false, // whether a word was found, used for feedback
    isLoaded: false, // whether the dictionary has been loaded
    language: LANGUAGE.RUSSIAN,
  });

  const answers = useStore<{ data: string[] }>({
    data: [],
  });

  const foundWords = useStore<{ data: string[] }>({
    data: [],
  });

  const dictionary = useStore<{ data: string[] }>({
    data: [],
  });

  // when the component mounts, fetch the dictionary
  useClientEffect$(() => {
    if (!dictionary.data.length) {
      getDictionary(LANGUAGE.RUSSIAN).then((data) => {
        dictionary.data = data;
        answers.data = solve(data, state.board).filter((value: string) => {
          return value.length >= state.minWordLength;
        });
        state.isLoaded = true;
      });
    } else {
      const filtered = solve(dictionary.data, state.board).filter(
        (value: string) => {
          return value.length >= state.minWordLength;
        }
      );
      answers.data = filtered;
      state.isLoaded = true;
    }
  });

  /**
   * When the board or boardsize updates:
   * 1. Unset the selected path and found words
   * 2. Solve the new board and update the answers
   */
  useTask$(({ track }) => {
    track(() => state.boardSize);
    track(() => state.board);

    answers.data = solve(dictionary.data, state.board).filter(
      (value: string) => {
        return value.length >= state.minWordLength;
      }
    );

    state.selectedPath = [];
    foundWords.data = [];
  });

  /**
   * When the minimum word length updates:
   * 1. Solve the board
   * 2. Filter answers by the minimum word length
   * 3. Reset the selected path
   */
  useTask$(({ track }) => {
    track(() => state.minWordLength);

    answers.data = solve(dictionary.data, state.board).filter(
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
        .join('');

      const wordExists = dictionary.data.includes(word);
      const wordNotFound = !foundWords.data.includes(word);
      const longEnough = word.length >= state.minWordLength;
      if (longEnough && wordExists && wordNotFound) {
        state.wordFound = true;

        setTimeout(() => {
          foundWords.data = [...foundWords.data, word];
          state.selectedPath = [];
          state.wordFound = false;
          fireWorks();
        }, 100);
      }
    }
  });

  /**
   * When the user finds all the words, show fireworks
   */
  useTask$(({ track }) => {
    track(() => foundWords.data);
    track(() => answers.data);

    const answersLength = answers.data.length;
    const foundWordsLength = foundWords.data.length - 1;

    if (foundWordsLength && foundWordsLength === answersLength) {
      confettiCelebration();
    }
  });

  const answersLength = answers.data.length;
  const foundWordsLength = foundWords.data.length - 1;

  return (
    <div class=" flex justify-center flex-col">
      <div class="main flex w-full items-center justify-center">
        <h1 class="text-4xl m-0 text-center text-blue-800 bg-white rounded-md px-3 py-1 mt-4">
          Boggle
        </h1>
      </div>
      <div class="flex max-w-[500px] m-auto items-center justify-center mt-4 bg-white z-10">
        <Controls
          state={state}
          answersLength={answersLength}
          foundWordsLength={foundWordsLength}
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
  title: 'Boggle',
};

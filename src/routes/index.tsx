import { component$, useStore, useTask$, Resource } from '@builder.io/qwik';
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import { useEndpoint } from '@builder.io/qwik-city';
import { Answers } from '../features/boggle/components/Answers';
import type { Language } from '../features/boggle/logic/api';
import { LANGUAGE, getDictionary } from '../features/boggle/logic/api';
import {
  confettiCelebration,
  fireWorks,
} from '../features/boggle/logic/animations';
import { BoggleGrid } from '~/features/boggle/components/BoggleGrid';
import { Controls } from '~/features/boggle/components/Controls';
import { FoundWords } from '~/features/boggle/components/FoundWords';
import { solve } from '~/features/boggle/logic/boggle';
import { randomBoard } from '~/features/boggle/logic/generateBoard';
import parser from 'ua-parser-js';

export interface State {
  boardSize: number;
  board: string[];
  minWordLength: number;
  selectedChars: { index: number; char: string }[];
  isWordFound: boolean;
  isLoaded: boolean;
  language: Language;
}

export default component$(() => {
  const boardData = useEndpoint<string>();

  const state = useStore<State>({
    boardSize: 5, // default board length and width and height
    board: [], // random default board
    minWordLength: 5, // minimum word length
    selectedChars: [], // selected path on the board
    isWordFound: false, // whether a word was found, used for feedback
    isLoaded: false, // whether the dictionary has been loaded
    language: LANGUAGE.ENGLISH,
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

    state.selectedChars = [];
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

    state.selectedChars = [];
  });

  /**
   * When the selected path updates:
   * 1. check if the word is long enough
   * 2. check if the word exists in the dictionary
   * 3. if both are true, add the word to the found words list
   * 4. clear the selected path
   */
  useTask$(({ track }) => {
    console.log('selectedChars', state.selectedChars);
    track(() => state.selectedChars);
    if (state.selectedChars.length) {
      console.log('selectedChars~!!!', state.selectedChars);
      const word = state.selectedChars
        .map((element: { index: number; char: string }) => element.char)
        .join('');

      const wordExists = dictionary.data.includes(word);
      const wordNotFound = !foundWords.data.includes(word);
      const longEnough = word.length >= state.minWordLength;
      if (longEnough && wordExists && wordNotFound) {
        state.isWordFound = true;

        setTimeout(() => {
          foundWords.data = [...foundWords.data, word];
          state.selectedChars = [];
          state.isWordFound = false;
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
    <Resource
      value={boardData}
      onPending={() => <div>Loading...</div>}
      onRejected={() => <div>Error</div>}
      onResolved={(data: any) => {
        return (
          <div class=" flex justify-center flex-col">
            <Title />
            <Controls
              state={state}
              answersLength={answersLength}
              foundWordsLength={foundWordsLength}
            />
            <BoggleGrid
              board={state.board.length > 1 ? state.board : data.board}
              boardSize={state.boardSize}
              state={state}
              cellWidth={data.screenWidth / state.boardSize}
            />
            <div class="max-w-[600px] m-auto w-[98%] mb-[50px]">
              <FoundWords
                words={foundWords.data}
                minWordLength={state.minWordLength}
              />
              <Answers
                foundWords={foundWords.data}
                answers={answers.data.length > 1 ? answers.data : data.answers}
                minWordLength={state.minWordLength}
              />
            </div>
          </div>
        );
      }}
    />
  );
});

export const Title = () => {
  return (
    <div class="main flex w-full items-center justify-center">
      <h1 class="text-4xl m-0 text-center text-blue-800 bg-white rounded-md px-3 py-1 mt-4">
        Boggle
      </h1>
    </div>
  );
};

export const head: DocumentHead = {
  title: 'Boggle',
};

export interface Boggle {
  board: string[];
  answers: string[];
  screenWidth: number;
}

// handle get request
export const onGet: RequestHandler<Boggle> = async ({ url, request }) => {
  const paramsObject = Object.fromEntries(url.searchParams);

  const userAgent = parser(request.headers.get('user-agent') || '');
  const OS = userAgent.os;
  const isAndroid = OS.name === 'Android';
  const isIOS = OS.name === 'iOS';
  const isMac = OS.name === 'Mac OS';
  const isWindows = OS.name === 'Windows';
  const isChromeOS = OS.name === 'Chrome OS';

  let screenWidth = 0;
  if (isAndroid || isIOS) {
    screenWidth = 375;
  } else if (isMac || isWindows || isChromeOS) {
    screenWidth = 400;
  }

  let answers: string[] = [];
  let board: string[] = [];

  if (paramsObject.board) {
    console.log(paramsObject.board);
    board = paramsObject.board.split('');
  } else {
    board = randomBoard(LANGUAGE.ENGLISH, 5).split('');
  }

  const dictionary = await getDictionary(LANGUAGE.ENGLISH);

  answers = solve(dictionary, board).filter((value: string) => {
    return value.length >= 5;
  });

  return {
    board,
    answers,
    screenWidth,
  };
};

import {
  $,
  component$,
  noSerialize,
  useContext,
  useOnWindow,
  useStore,
  useTask$,
} from '@builder.io/qwik';
import type { QwikChangeEvent } from '@builder.io/qwik';
import { GameCtx, BoardCtx, AnswersCtx, DictionaryCtx } from '../context';
import { solve } from '../logic/boggle';
import { randomBoard } from '../logic/board';
import BoggleWorker from '../worker?worker';
import type { WebWorkerState } from '../models';

export const Controls = component$(() => {
  const gameState = useContext(GameCtx);
  const boardState = useContext(BoardCtx);
  const answersState = useContext(AnswersCtx);
  const dictionaryState = useContext(DictionaryCtx);
  const workerState = useStore<WebWorkerState>({ mod: null });

  // are controls open
  const constrolsState = useStore({
    isOpen: false,
  });

  // toggle the controls
  const toggleIsOpen = $(() => {
    constrolsState.isOpen = !constrolsState.isOpen;
  });

  useOnWindow(
    'DOMContentLoaded',
    $(async () => {
      if (window.Worker) {
        const worker = new BoggleWorker();
        workerState.mod = noSerialize(worker);
      }
      // add keydown event listen that will close the controls if the escape key is pressed
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          constrolsState.isOpen = false;
        }
      });
    })
  );

  useTask$(({ track }) => {
    track(() => workerState.mod);
    if (workerState.mod) {
      workerState.mod.onmessage = (event) => {
        console.log('workerState.mod.onmessage', event);
        dictionaryState.dictionary = event.data.dictionary;
        answersState.answers = [];
        answersState.answers = event.data.answers;
      };
    }
  });

  const handleBoardCustomization = $(
    async (e: QwikChangeEvent<HTMLInputElement>) => {
      boardState.chars = e.target.value.split('');
      workerState.mod?.postMessage({
        language: gameState.language,
        board: boardState.chars,
      });
    }
  );

  // generate new board and solve it
  const handleRandomizeBoard = $(() => {
    boardState.chars = randomBoard(
      gameState.language,
      boardState.boardSize
    ).split('');
    answersState.answers = solve(dictionaryState.dictionary, boardState.chars);
    // workerState.mod?.postMessage({
    //   language: gameState.language,
    //   board: boardState.chars,
    // });
  });

  // chaneg the language, load the dict, create new board and solve it
  const handleChangeLanguage = $((e: QwikChangeEvent<HTMLSelectElement>) => {
    gameState.language = e.target.value;
    boardState.chars = randomBoard(e.target.value, boardState.boardSize).split(
      ''
    );
    answersState.answers = solve(dictionaryState.dictionary, boardState.chars);
  });

  // change the board dimensions, create new board and solve it
  const handleChangeBoardSize = $((e: QwikChangeEvent<HTMLInputElement>) => {
    boardState.boardSize = e.target.valueAsNumber;
    boardState.chars = randomBoard(
      gameState.language,
      e.target.valueAsNumber
    ).split('');
    answersState.answers = solve(dictionaryState.dictionary, boardState.chars);
  });

  // change the min char length
  const handleChangeMinCharLength = $(
    (e: QwikChangeEvent<HTMLInputElement>) => {
      gameState.minCharLength = e.target.valueAsNumber;
    }
  );

  // filter the answers by the min char length
  const answersLength = answersState.answers.filter(
    (word) => word.length >= gameState.minCharLength
  ).length;

  return (
    <div class="fixed w-full top-0 z-50 ">
      <div class="glass h-[40px] flex items-center justify-center">
        <h1 class="text-center text-xl text-blue-900 font-medium m-0 py-2">
          Foggle
        </h1>
      </div>
      <div class="glass flex items-center h-[50px] w-full m-auto">
        <div class="m-auto w-full flex max-w-[500px]">
          <div class="w-[33.3%] flex justify-center">
            <button
              class="px-2 text-[14px] border-2 bg-white h-[40px] border-blue-800 hover:bg-blue-200 rounded-md "
              onClick$={toggleIsOpen}
            >
              {constrolsState.isOpen ? 'Close' : 'Open'} Controls
            </button>
          </div>
          <div class="w-[33.3%] flex justify-center">
            <button
              class="px-2 text-[14px] border-2 bg-white h-[40px] border-blue-800 hover:bg-blue-200 rounded-md "
              onClick$={handleRandomizeBoard}
              type="button"
            >
              Reset Board
            </button>
          </div>
          <div class="w-[33.3%] flex justify-center">
            <div class="text-[14px] rounded-md border-2 border-blue-900 bg-blue-50  h-[40px] w-[120px] flex items-center justify-start px-2">
              Answers:{'  '}
              <span class="text-[14px] rounded-sm">
                {answersLength > 0 ? ` ${answersLength}` : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
      {constrolsState.isOpen ? (
        <form class="glass border-b-2 border-[#dfdfdf] fixed z-50 w-full m-auto px-2 flex justify-center">
          <fieldset class="w-full p-2 rounded-md border-blue-900 flex flex-wrap justify-evenly max-w-[700px]">
            <div class="flex flex-col my-[10px]">
              <label class="text-[14px]" for="language">
                Language
              </label>
              <select
                id="language"
                class="pl-[2px] rounded-md w-[10ch] h-[40px] border-2 border-blue-900"
                onChange$={handleChangeLanguage}
                value={gameState.language}
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="Russian">Russian</option>
              </select>
            </div>
            <div class="flex flex-col my-[10px]">
              <label for="min-char-length" class="text-[14px]">
                Word Size
              </label>
              <input
                id="min-char-length"
                type="number"
                onChange$={handleChangeMinCharLength}
                value={gameState.minCharLength}
                class="pl-2 rounded-md w-[70px] h-[40px] border-2 border-blue-900"
              />
            </div>
            <div class="flex flex-col my-[10px]">
              <label class="text-[14px]" for="board-size">
                Board Size
              </label>
              <input
                id="board-size"
                type="number"
                onChange$={handleChangeBoardSize}
                value={boardState.boardSize}
                class="pl-2 rounded-md w-[70px] h-[40px] border-2 border-blue-900"
              />
            </div>
            <div class="flex flex-col my-[10px]">
              <label class="text-[14px] w-fit" for="customize">
                Customize
              </label>
              <input
                id="customize"
                type="text"
                class="w-[25ch] tracking-wide h-[40px] rounded-md text-center border-2 border-blue-900"
                placeholder="customize board"
                value={boardState.chars.join('')}
                onChange$={handleBoardCustomization}
              />
            </div>
          </fieldset>
        </form>
      ) : null}
    </div>
  );
});

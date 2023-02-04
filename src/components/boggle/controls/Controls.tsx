import { $, component$, useContext, useStore } from '@builder.io/qwik';
import type { QwikChangeEvent } from '@builder.io/qwik';
import {
  LanguageCtx,
  BoardCtx,
  AnswersCtx,
  DictionaryCtx,
} from '../BoggleRoot';
import { solve } from '../logic/boggle';
import { randomBoard } from '../logic/generateBoard';

export const Controls = component$(() => {
  const languageState = useContext(LanguageCtx);
  const boardState = useContext(BoardCtx);
  const answersState = useContext(AnswersCtx);
  const dictionaryState = useContext(DictionaryCtx);

  // changes the board string and solves it
  const handleBoardCustomization = $((e: QwikChangeEvent<HTMLInputElement>) => {
    boardState.data = e.target.value.split('');
    answersState.data = solve(dictionaryState.data, boardState.data);
  });

  // generate new board and solve it
  const handleRandomizeBoard = $(() => {
    boardState.data = randomBoard(
      languageState.data,
      boardState.boardSize
    ).split('');
    answersState.data = solve(dictionaryState.data, boardState.data);
  });

  // chaneg the language, load the dict, create new board and solve it
  const handleChangeLanguage = $((e: QwikChangeEvent<HTMLSelectElement>) => {
    languageState.data = e.target.value;
    boardState.data = randomBoard(e.target.value, boardState.boardSize).split(
      ''
    );
    answersState.data = solve(dictionaryState.data, boardState.data);
  });

  // change the board dimensions, create new board and solve it
  const handleChangeBoardSize = $((e: QwikChangeEvent<HTMLInputElement>) => {
    boardState.boardSize = e.target.valueAsNumber;
    boardState.data = randomBoard(
      languageState.data,
      e.target.valueAsNumber
    ).split('');
    answersState.data = solve(dictionaryState.data, boardState.data);
  });

  // change the min char length
  const handleChangeMinCharLength = $(
    (e: QwikChangeEvent<HTMLInputElement>) => {
      languageState.minCharLength = e.target.valueAsNumber;
    }
  );

  // filter the answers by the min char length
  const answersLength = answersState.data.filter(
    (word) => word.length >= languageState.minCharLength
  ).length;

  // are controls open
  const constrolsState = useStore({
    isOpen: false,
  });

  // toggle the controls
  const toggleIsOpen = $(() => {
    constrolsState.isOpen = !constrolsState.isOpen;
  });

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
                value={languageState.data}
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
                value={languageState.minCharLength}
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
                value={boardState.data.join('')}
                onChange$={handleBoardCustomization}
              />
            </div>
          </fieldset>
        </form>
      ) : null}
    </div>
  );
});

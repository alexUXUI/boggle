import {
  $,
  component$,
  useContext,
  useOnWindow,
  useStore,
} from '@builder.io/qwik';
import type { QwikChangeEvent } from '@builder.io/qwik';
import { GameCtx, BoardCtx, AnswersCtx, WorkerCtx } from '../context';
import { randomBoard } from '../logic/board';

export const Controls = component$(() => {
  const gameState = useContext(GameCtx);
  const boardState = useContext(BoardCtx);
  const answersState = useContext(AnswersCtx);
  const worker = useContext(WorkerCtx);

  const constrolsState = useStore({
    isOpen: false,
  });

  const toggleIsOpen = $(() => {
    constrolsState.isOpen = !constrolsState.isOpen;
  });

  useOnWindow(
    'DOMContentLoaded',
    $(() => {
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          constrolsState.isOpen = false;
        }
      });
      window.addEventListener('click', (e) => {
        if (constrolsState.isOpen) {
          const controlFormNode = document.getElementById('controls');
          const controlsButtonNode = document.getElementById('controls-btn');
          if (controlFormNode) {
            if (
              !controlFormNode.contains(e.target as Node) &&
              !controlsButtonNode?.contains(e.target as Node)
            ) {
              constrolsState.isOpen = false;
            }
          }
        }
      });
    })
  );

  const handleBoardCustomization = $(
    async (e: QwikChangeEvent<HTMLInputElement>) => {
      boardState.chars = e.target.value.split('');
      worker.mod?.postMessage({
        language: gameState.language,
        board: boardState.chars,
      });
    }
  );

  const handleRandomizeBoard = $(() => {
    boardState.chars = randomBoard(
      gameState.language,
      boardState.boardSize
    ).split('');
    answersState.answers = [];
    worker.mod?.postMessage({
      language: gameState.language,
      board: boardState.chars,
    });
  });

  const handleChangeLanguage = $((e: QwikChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    gameState.language = value;
    boardState.chars = randomBoard(value, boardState.boardSize).split('');
    worker.mod?.postMessage({
      language: gameState.language,
      board: boardState.chars,
    });
  });

  const handleChangeBoardSize = $((e: QwikChangeEvent<HTMLInputElement>) => {
    const { valueAsNumber } = e.target;
    boardState.boardSize = valueAsNumber;
    boardState.chars = randomBoard(gameState.language, valueAsNumber).split('');
    worker.mod?.postMessage({
      language: gameState.language,
      board: boardState.chars,
    });
  });

  const handleChangeMinCharLength = $(
    (e: QwikChangeEvent<HTMLInputElement>) => {
      gameState.minCharLength = e.target.valueAsNumber;
    }
  );

  const answersLength = answersState.answers.filter(
    (word) => word.length >= gameState.minCharLength
  ).length;

  return (
    <div class="w-full top-0 z-50">
      <div class="glass h-[40px] flex items-center justify-center">
        <h1 class="text-center text-xl text-blue-900 font-medium m-0 py-2">
          Foggle
        </h1>
      </div>
      <div class="glass flex items-center h-[50px] w-full m-auto">
        <div class="m-auto w-full flex max-w-[500px]">
          <div class="w-[33.3%] flex justify-center">
            <button
              id="controls-btn"
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
        <form
          id="controls"
          class="glass border-b-2 border-[#dfdfdf] fixed z-50 w-full m-auto px-2 flex justify-center"
        >
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

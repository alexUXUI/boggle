import { $, component$, useStore } from '@builder.io/qwik';
import type { QwikChangeEvent } from '@builder.io/qwik';

import { randomBoard } from '../../../routes/boggle/logic/generateBoard';
import type {
  AnswersState,
  BoardState,
  DictionaryState,
  LanguageState,
} from '~/features/boggle';
import { solve } from '../../../routes/boggle/logic/boggle';
interface Props {
  boardState: BoardState;
  languageState: LanguageState;
  answersState: AnswersState;
  dictionaryState: DictionaryState;
}

export const Controls = component$(
  ({ boardState, languageState, answersState, dictionaryState }: Props) => {
    const handleBoardCustomization = $(
      (e: QwikChangeEvent<HTMLInputElement>) => {
        boardState.data = e.target.value.split('');
        answersState.data = solve(dictionaryState.data, boardState.data);
      }
    );

    const handleRandomizeBoard = $(() => {
      boardState.data = randomBoard(
        languageState.data,
        boardState.boardSize
      ).split('');
      answersState.data = solve(dictionaryState.data, boardState.data);
    });

    const handleChangeLanguage = $((e: QwikChangeEvent<HTMLSelectElement>) => {
      languageState.data = e.target.value;
      boardState.data = randomBoard(e.target.value, boardState.boardSize).split(
        ''
      );
      answersState.data = solve(dictionaryState.data, boardState.data);
    });

    const handleChangeBoardSize = $((e: QwikChangeEvent<HTMLInputElement>) => {
      boardState.boardSize = e.target.valueAsNumber;
      boardState.data = randomBoard(
        languageState.data,
        e.target.valueAsNumber
      ).split('');
      answersState.data = solve(dictionaryState.data, boardState.data);
    });

    const handleChangeMinCharLength = $(
      (e: QwikChangeEvent<HTMLInputElement>) => {
        languageState.minCharLength = e.target.valueAsNumber;
      }
    );

    const answersLength = answersState.data.filter(
      (word) => word.length >= languageState.minCharLength
    ).length;

    const constrolsState = useStore({
      isOpen: false,
    });

    return (
      <div>
        <div class="flex items-center h-[60px]">
          <div class="w-[33.3%] flex justify-center">
            <button
              class="px-2 text-[14px] border-2 bg-white h-[40px] border-blue-800 hover:bg-blue-200 rounded-md "
              onClick$={() => (constrolsState.isOpen = !constrolsState.isOpen)}
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
          <div class="w-[33.3%] flex justify-start">
            <div class="text-[14px]">
              Answers:{' '}
              <span class="text-[14px] rounded-sm">
                {answersLength > 0 ? answersLength : ''}
              </span>
            </div>
          </div>
        </div>
        {constrolsState.isOpen ? (
          <form class="absolute z-50 w-full m-auto bg-white px-2 rounded-md pb-2 flex justify-center max-w-[710px]">
            <fieldset class="w-full p-2 rounded-md border-slate-300 flex flex-wrap justify-evenly max-w-[700px]">
              <div class="flex flex-col my-[3px]">
                <label class="text-[14px]" for="language">
                  Language
                </label>
                <select
                  id="language"
                  class="pl-[2px] rounded-md w-[10ch] h-[40px] border-2 border-slate-400"
                  onChange$={handleChangeLanguage}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="Russian">Russian</option>
                </select>
              </div>
              <div class="flex flex-col my-[3px]">
                <label for="min-char-length" class="text-[14px]">
                  Word Size
                </label>
                <input
                  id="min-char-length"
                  type="number"
                  onChange$={handleChangeMinCharLength}
                  value={languageState.minCharLength}
                  class="pl-2 rounded-md w-[70px] h-[40px] border-2 border-slate-400"
                />
              </div>
              <div class="flex flex-col my-[3px]">
                <label class="text-[14px]" for="board-size">
                  Board Size
                </label>
                <input
                  id="board-size"
                  type="number"
                  onChange$={handleChangeBoardSize}
                  value={boardState.boardSize}
                  class="pl-2 rounded-md w-[70px] h-[40px] border-2 border-slate-400"
                />
              </div>
              <div class="flex flex-col my-[3px]">
                <label class="text-[14px] w-fit" for="customize">
                  Customize
                </label>
                <input
                  id="customize"
                  type="text"
                  class="w-[25ch] tracking-wide h-[40px] rounded-md text-center border-2 border-slate-400"
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
  }
);

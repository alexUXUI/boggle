import { component$ } from "@builder.io/qwik";
import type { State } from "..";
import { generateRandomBoard } from "../logic/generateBoard";
export const Boggle = import("../../../boggle/pkg/boggle");

interface Props {
  state: State;
  foundWordsLength: number;
  answersLength: number;
}

export const Controls = component$(({ state, answersLength }: Props) => {
  return (
    <div
      class="flex flex-wrap justify-center"
      onSubmit$={(e) => e.preventDefault()}
    >
      <fieldset class="flex my-2 h-[30px] justify-center items-center">
        <label class="text-[18px]">Grid</label>
        <input
          type="number"
          onChange$={(e) => {
            state.boardSize = e.target.valueAsNumber;
            state.board = generateRandomBoard(e.target.valueAsNumber).split("");
          }}
          value={state.boardSize}
          class="border-[1px] border-slate-200 rounded-md p-2 w-[50px] ml-2 h-[30px]"
        />
      </fieldset>
      <fieldset class="flex my-2 ml-2 h-[30px] justify-center items-center">
        <label class="text-[18px]">Word Length</label>
        <input
          type="number"
          onChange$={(e) => {
            state.minWordLength = e.target.valueAsNumber;
          }}
          value={state.minWordLength}
          class="border-[1px] border-slate-200 rounded-md p-2 w-[50px] ml-2 h-[30px]"
        />
        <div class="ml-4 text-[18px]">Answers: {answersLength}</div>
      </fieldset>
      <fieldset class="flex flex-wrap my-2 ml-2 min-h-[30px] justify-center items-center">
        <label class="text-[18px] w-fit" for="customize">
          Customize
        </label>
        <input
          id="customize"
          type="text"
          class="w-[25ch] tracking-wide ml-2 h-[30px] rounded-md text-center border-[1px] border-slate-200"
          placeholder="customize board"
          value={state.board.join("")}
          onChange$={(event) => {
            state.board = event.target.value.split("");
          }}
        />
      </fieldset>
      <button
        class="text-[18px] my-2 ml-2 border-2 bg-white h-[32px] border-blue-800 hover:bg-blue-200 rounded-md p-2 flex justify-center items-center "
        onClick$={() => {
          Boggle.then(async (module) => {
            await module.default();
            const boardString = module.gerenate_board_string();
            console.log(boardString);
            state.board = boardString.split("");
          });
        }}
      >
        Reset Board
      </button>
    </div>
  );
});

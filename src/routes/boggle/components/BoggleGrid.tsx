import {
  component$,
  useClientEffect$,
  $,
  useStore,
  useOnWindow,
  useTask$,
} from '@builder.io/qwik';
import type { State } from '../index';
import { isInPath } from '../logic/boggle';
import { bgColor, handleBoardResize } from '../logic/generateBoard';

interface Props {
  board: string[];
  boardSize: number;
  state: State;
}

export interface ScreenState {
  width: number;
  squareWidth: number;
}

export const BoggleGrid = component$(({ board, boardSize, state }: Props) => {
  // unset the selected path when the user clicks outside the board or presses backspace or escape
  useClientEffect$(({ cleanup }) => {
    const clickHandler = (e: MouseEvent) => {
      if (!document.getElementById('board')?.contains(e.target as Node)) {
        state.selectedPath = [];
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace' || e.key === 'Escape') {
        state.selectedPath = [];
      }
    };

    document.addEventListener('click', clickHandler);
    document.addEventListener('keydown', handleKeydown);

    cleanup(() => {
      document.removeEventListener('click', clickHandler);
      document.removeEventListener('keydown', handleKeydown);
    });
  });

  const screenState = useStore<ScreenState>({
    width: 0,
    squareWidth: 0,
  });

  useClientEffect$(() => handleBoardResize(screenState, boardSize));

  useOnWindow(
    'resize',
    $(() => handleBoardResize(screenState, boardSize))
  );

  useTask$(({ track }) => {
    track(() => state.boardSize);
    handleBoardResize(screenState, boardSize);
  });

  const addToFoundList = $((i: number, j: number) => {
    state.selectedPath = [
      ...state.selectedPath,
      {
        index: i * boardSize + j,
        char: board[i * boardSize + j],
      },
    ];
  });

  const handleCellClick = $(
    (isInSelectedPath: boolean, currentIndex: number, i: number, j: number) => {
      const selectedPath = state.selectedPath;
      const lastNodeInPath = selectedPath[selectedPath.length - 1];

      // neighors of the last node in the path
      const neighbors = [
        lastNodeInPath?.index - boardSize - 1,
        lastNodeInPath?.index - boardSize,
        lastNodeInPath?.index - boardSize + 1,
        lastNodeInPath?.index - 1,
        lastNodeInPath?.index + 1,
        lastNodeInPath?.index + boardSize - 1,
        lastNodeInPath?.index + boardSize,
        lastNodeInPath?.index + boardSize + 1,
      ];

      const isFirstChar = selectedPath.length === 0;
      const isValidNeighbor =
        lastNodeInPath && neighbors.includes(currentIndex);
      const isNotAlreadySelected = !isInSelectedPath;

      /**
       * Add to path if the selected char is:
       * 1. Not in the selected path
       * 2. A neighbor of the last node in the path
       */
      if (isFirstChar || (isValidNeighbor && isNotAlreadySelected)) {
        addToFoundList(i, j);
      } else if (isInSelectedPath) {
        // deselect the node and all the nodes after it
        const index = selectedPath.findIndex(
          (element) => element.index === currentIndex
        );
        state.selectedPath = selectedPath.slice(0, index);

        return;
      }
    }
  );

  return (
    <div class="w-full flex flex-col justify-center items-center mt-[20px] mb-[20px]">
      <div class="">
        <table
          id="board"
          class={`m-auto border-[1px] border-blue-800 bg-blue-800`}
        >
          {Array.from({ length: boardSize }, (idx, i) => (
            <tr class={`flex w-full`}>
              {Array.from({ length: boardSize }, (jdx, j) => {
                const currentIndex = i * boardSize + j;
                const isInSelectedPath = isInPath(
                  currentIndex,
                  state.selectedPath,
                  board
                );
                const cellBgColor = bgColor(isInSelectedPath, state.wordFound);
                return (
                  <td
                    style={{
                      width: `${screenState.squareWidth}px`,
                      height: `${screenState.squareWidth}px`,
                    }}
                    class={`cell border-[1px]bg-blue-800 border-blue-800 hover:cursor-pointer m-[1px] flex justify-center items-center rounded-sm`}
                    id={`data-cell-${i}-${j}`}
                  >
                    <button
                      class={`text-[30px] ${cellBgColor} leading-[40px] p-0 m-0 rounded-sm`}
                      onClick$={() => {
                        handleCellClick(isInSelectedPath, currentIndex, i, j);
                      }}
                    >
                      {state.isLoaded
                        ? board[i * boardSize + j].toLocaleUpperCase()
                        : 'x'}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </table>
      </div>
    </div>
  );
});

import {
  component$,
  useClientEffect$,
  $,
  useStore,
  useOnWindow,
} from '@builder.io/qwik';
import { isInPath } from '../logic/boggle';
import { bgColor, handleBoardResize } from '../logic/generateBoard';
import type { State } from '~/routes/index';
import { handleCellClick } from '../event-handlers/BoggleBoard.handlers';

interface Props {
  board: string[];
  boardSize: number;
  state: State;
  cellWidth: number;
  screenWidth: number;
}

export interface ScreenState {
  width: number;
  squareWidth: number;
}

export const BoggleBoard = component$(
  ({ board, boardSize, state, cellWidth, screenWidth }: Props) => {
    const screenState = useStore<ScreenState>({
      width: 0,
      squareWidth: 0,
    });

    useOnWindow(
      'resize',
      $(() => handleBoardResize(screenState, boardSize))
    );

    // unset the selected path when the user clicks outside
    // the board or presses backspace or escape
    useClientEffect$(({ cleanup }) => {
      const clickHandler = (e: MouseEvent) => {
        if (!document.getElementById('board')?.contains(e.target as Node)) {
          state.selectedChars = [];
        }
      };

      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Backspace' || e.key === 'Escape') {
          state.selectedChars = [];
        }
      };

      document.addEventListener('click', clickHandler);
      document.addEventListener('keydown', handleKeydown);

      cleanup(() => {
        document.removeEventListener('click', clickHandler);
        document.removeEventListener('keydown', handleKeydown);
      });
    });

    return (
      <div class="w-full flex flex-col items-center">
        <table id="board" class={`bg-blue-800`}>
          <tbody
            style={{
              width: `${screenWidth}px`,
              height: `${screenWidth}px`,
            }}
            class={`flex flex-col bg-green w-fit h-fit justify-evenly`}
          >
            {Array.from({ length: boardSize }, (_idx, i) => (
              <tr class={`flex w-full justify-evenly`}>
                {Array.from({ length: boardSize }, (_jdx, j) => {
                  const currentIndex = i * boardSize + j;
                  const isInSelectedChars = isInPath(
                    currentIndex,
                    state.selectedChars,
                    board
                  );
                  const cellBgColor = bgColor(
                    isInSelectedChars,
                    state.isWordFound
                  );

                  return (
                    <Cube
                      letter={board[currentIndex]}
                      cellBgColor={cellBgColor}
                      cellWidth={cellWidth}
                      isInSelectedChars={isInSelectedChars}
                      state={state}
                      currentIndex={currentIndex}
                      key={currentIndex}
                      board={board}
                      i={i}
                      j={j}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
);

export interface CubeProps {
  letter: string;
  cellBgColor: string;
  cellWidth: number;
  isInSelectedChars: boolean;
  state: State;
  currentIndex: number;
  key: number;
  board: string[];
}

export const Cube = component$(
  ({
    cellWidth,
    key,
    board,
    currentIndex,
    cellBgColor,
    isInSelectedChars,
    state,
  }: CubeProps) => {
    const baseStyle = {
      height: `${cellWidth}px` ?? 0,
      width: `${cellWidth}px` ?? 0,
    };

    const translationDistance = cellWidth / 2;

    return (
      <td style={baseStyle} key={key} class={`scene m-0 p-0`}>
        <div style={baseStyle} class={`cube`}>
          <div
            style={{
              ...baseStyle,
              transform: `rotateY(90deg) translateZ(${translationDistance}px)`,
            }}
            class={`cube__face cube__face--right`}
          ></div>
          <div
            style={{
              ...baseStyle,
              transform: `rotateY(-90deg) translateZ(${translationDistance}px)`,
            }}
            class={`cube__face cube__face--left`}
          ></div>
          <div
            style={{
              ...baseStyle,
              transform: `rotateX(90deg) translateZ(${translationDistance}px)`,
            }}
            class={`cube__face cube__face--top`}
          ></div>
          <div
            style={{
              ...baseStyle,
              transform: `rotateX(-90deg) translateZ(${translationDistance}px)`,
            }}
            class={`cube__face cube__face--bottom`}
          ></div>
          <div class="face flex items-center justify-center">
            <button
              class={`h-[90%] w-[90%]  text-[30px] ${cellBgColor} leading-[40px] p-0 m-0 rounded-sm`}
              onClick$={() => {
                handleCellClick(isInSelectedChars, currentIndex, state);
              }}
            >
              {board[currentIndex]
                ? board[currentIndex].toLocaleUpperCase()
                : ' '}
            </button>
          </div>
        </div>
      </td>
    );
  }
);

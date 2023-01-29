import { $, component$, useOnWindow } from '@builder.io/qwik';
import type { BoardState, GameState, SelectedCharsState } from '..';

interface Props {
  boardState: BoardState;
  selectedCharsState: SelectedCharsState;
  gameState: GameState;
}

export interface ScreenState {
  width: number;
  squareWidth: number;
}

export const isInPath = (
  currentIndex: number,
  selectedPath: { index: number; char: string }[],
  board: string[]
) => {
  return selectedPath.reduce(
    (acc: boolean, element: { index: number; char: string }) => {
      if (
        element.index === currentIndex &&
        element.char === board[currentIndex]
      ) {
        return true;
      }
      return acc;
    },
    false
  );
};

export const handleBoardResize = (
  screenState: ScreenState,
  boardSize: number
) => {
  const maxWidth = 500;
  if (typeof window !== 'undefined') {
    screenState.width = window.innerWidth - 20;
    screenState.squareWidth = Math.floor(screenState.width / boardSize);

    if (screenState.width > maxWidth) {
      screenState.width = maxWidth;
      screenState.squareWidth = Math.floor(screenState.width / boardSize);
    }
  }
};

export const bgColor = (
  isInSelectedPath: boolean,
  isWordFound: boolean
): string => {
  let bgColor = 'bg-white'; // if char is not part of the selected path, or a found word keep white bg

  if (isInSelectedPath && isWordFound) {
    bgColor = 'bg-green-200'; // if word found, highlight the path in green
  } else if (isInSelectedPath) {
    bgColor = 'bg-blue-200'; // if char is part of the selected path, highlight it in blue
  }

  return bgColor;
};

export const addToSelectedChars = $(
  (
    currentIndex: number,
    selectedCharsState: SelectedCharsState,
    boardState: BoardState
  ) => {
    return (selectedCharsState.data = [
      ...selectedCharsState.data,
      {
        index: currentIndex,
        char: boardState.data[currentIndex],
      },
    ]);
  }
);

export const deselectCharAndAncestors = $(
  (currentIndex: number, selectedCharsState: SelectedCharsState) => {
    const index = selectedCharsState.data.findIndex(
      (element: any) => element.index === currentIndex
    );
    selectedCharsState.data = selectedCharsState.data.slice(0, index);
  }
);

export const handleCellClick = $(
  (
    isInSelectedChars: boolean,
    currentIndex: number,
    boardState: BoardState,
    selectedCharsState: SelectedCharsState
  ) => {
    const { boardSize } = boardState;

    const currentChar =
      selectedCharsState.data[selectedCharsState.data.length - 1];

    const neighbors = [
      currentChar?.index - boardSize, // top
      currentChar?.index - boardSize + 1, // top right
      currentChar?.index + 1, // right
      currentChar?.index + boardSize + 1, // bottom right
      currentChar?.index + boardSize, // bottom
      currentChar?.index + boardSize - 1, // bottom left
      currentChar?.index - 1, // left
      currentChar?.index - boardSize - 1, // top left
    ];

    const isFirstChar = selectedCharsState.data.length === 0;
    const isValidNeighbor = currentChar && neighbors.includes(currentIndex);
    const isNotSelected = !isInSelectedChars;
    const isEligible = isFirstChar || (isNotSelected && isValidNeighbor);

    if (isEligible) {
      addToSelectedChars(currentIndex, selectedCharsState, boardState);
    } else if (isInSelectedChars) {
      deselectCharAndAncestors(currentIndex, selectedCharsState);
    }
  }
);

export const BoggleBoard = component$(
  ({ boardState, selectedCharsState, gameState }: Props) => {
    // const screenState = useStore<ScreenState>({
    //   width: 0,
    //   squareWidth: 0,
    // });

    // useOnWindow(
    //   'resize',
    //   $(() => handleBoardResize(screenState, boardSize))
    // );

    // unset the selected path when the user clicks outside
    // the board or presses backspace or escape
    useOnWindow(
      'DOMContentLoaded',
      $(() => {
        const clickHandler = (e: MouseEvent) => {
          if (!document.getElementById('board')?.contains(e.target as Node)) {
            selectedCharsState.data = [];
          }
        };

        const handleKeydown = (e: KeyboardEvent) => {
          if (e.key === 'Backspace' || e.key === 'Escape') {
            selectedCharsState.data = [];
          }
        };

        // prevent scrolling on mobile on the no-scroll div
        const noScroll = document.getElementById('no-scroll');
        noScroll?.addEventListener('wheel', (e) => {
          e.preventDefault();
        });

        noScroll?.addEventListener('touchmove', (e) => {
          e.preventDefault();
        });

        document.addEventListener('click', clickHandler);
        document.addEventListener('keydown', handleKeydown);
      })
    );

    return (
      <div
        class="w-full flex flex-col items-center h-full pt-[30px] bg-blue-700"
        id="no-scroll"
      >
        <table id="board" class={`bg-blue-800`}>
          <tbody
            style={{
              width: `${boardState.boardWidth}px`,
              height: `${boardState.boardWidth}px`,
            }}
            class={`flex flex-col bg-green w-fit h-fit justify-evenly`}
          >
            {Array.from({ length: boardState.boardSize }, (_idx, i) => (
              <tr class={`flex w-full justify-evenly`}>
                {Array.from({ length: boardState.boardSize }, (_jdx, j) => {
                  const currentIndex = i * boardState.boardSize + j;
                  const isInSelectedChars = isInPath(
                    currentIndex,
                    selectedCharsState.data,
                    boardState.data
                  );
                  const cellBgColor = bgColor(
                    isInSelectedChars,
                    gameState?.isWordFound
                  );

                  return (
                    <Cube
                      letter={boardState.data[currentIndex]}
                      cellBgColor={cellBgColor}
                      cellWidth={boardState.cellWidth}
                      isInSelectedChars={isInSelectedChars}
                      currentIndex={currentIndex}
                      key={currentIndex}
                      board={boardState.data}
                      boardState={boardState}
                      selectedCharsState={selectedCharsState}
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
  currentIndex: number;
  key: number;
  board: string[];
  boardState: BoardState;
  selectedCharsState: SelectedCharsState;
}

export const Cube = ({
  cellWidth,
  key,
  board,
  currentIndex,
  cellBgColor,
  isInSelectedChars,
  boardState,
  selectedCharsState,
}: CubeProps) => {
  const baseStyle = {
    height: `${boardState.cellWidth}px` ?? 0,
    width: `${boardState.cellWidth}px` ?? 0,
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
            data-cell-index={currentIndex}
            data-cell-char={board[currentIndex]}
            data-cell-is-in-path={isInSelectedChars}
            class={`${cellBgColor} h-[90%] w-[90%] text-[30px] leading-[40px] p-0 m-0 rounded-sm`}
            onClick$={() => {
              handleCellClick(
                isInSelectedChars,
                currentIndex,
                boardState,
                selectedCharsState
              );
            }}
            onTouchMove$={(e) => {
              const element = document.elementFromPoint(
                e.targetTouches[0].clientX,
                e.targetTouches[0].clientY
              );
              if (element) {
                // get the data-cell-index from the button
                const cellIndex = element.getAttribute('data-cell-index')!;
                const cellChar = element.getAttribute('data-cell-char');
                const cellIsInPath = element.getAttribute(
                  'data-cell-is-in-path'
                );
                // const currently selected path
                const selectedPath = selectedCharsState.data;
                const lastNodeInPath =
                  selectedCharsState.data[selectedCharsState.data.length - 1];
                // neighors of the last node in the path
                const neighbors = [
                  lastNodeInPath?.index - boardState.boardSize - 1,
                  lastNodeInPath?.index - boardState.boardSize,
                  lastNodeInPath?.index - boardState.boardSize + 1,
                  lastNodeInPath?.index - 1,
                  lastNodeInPath?.index + 1,
                  lastNodeInPath?.index + boardState.boardSize - 1,
                  lastNodeInPath?.index + boardState.boardSize,
                  lastNodeInPath?.index + boardState.boardSize + 1,
                ];
                // if the current node is not in the path, and it is a neighbor of the last node in the path
                // add it to the path
                if (cellIsInPath && cellIndex) {
                  // deselect the node and all the nodes after it
                  const index = selectedPath.findIndex(
                    (element) => element.index === Number.parseInt(cellIndex)
                  );
                  selectedCharsState.data = selectedPath.slice(0, index);
                  return;
                } else if (
                  !lastNodeInPath ||
                  (lastNodeInPath &&
                    neighbors.includes(Number.parseInt(cellIndex)))
                ) {
                  selectedCharsState.data = [
                    ...selectedCharsState.data,
                    {
                      index: Number.parseInt(cellIndex)!,
                      char: cellChar!,
                    },
                  ];
                }
              }
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
};

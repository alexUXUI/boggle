import type { QwikTouchEvent } from '@builder.io/qwik';
import { $ } from '@builder.io/qwik';
import type { GameState, BoardState } from '../models';

export const calculateCellWidth = (boardWidth: number, boardSize: number) => {
  switch (boardSize) {
    case 2:
      return boardWidth / boardSize - 40;
    case 3:
      return boardWidth / boardSize - 20;
    case 4:
      return boardWidth / boardSize - 12;
    case 5:
      return boardWidth / boardSize - boardSize * 2;
    case 6:
      return boardWidth / boardSize - boardSize - 2;
    case 7:
      return boardWidth / boardSize - 6;
    case 8:
      return boardWidth / boardSize - 6;
    case 9:
      return boardWidth / boardSize - 4;
    default:
      return boardWidth / boardSize - 2;
  }
};

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
  (currentIndex: number, gameState: GameState, boardState: BoardState) => {
    return (gameState.selectedChars = [
      ...gameState.selectedChars,
      {
        index: currentIndex,
        char: boardState.data[currentIndex],
      },
    ]);
  }
);

export const deselectCharAndAncestors = $(
  (currentIndex: number, gameState: GameState) => {
    const index = gameState.selectedChars.findIndex(
      (element: any) => element.index === currentIndex
    );
    gameState.selectedChars = gameState.selectedChars.slice(0, index);
  }
);

export const handleCellClick = $(
  (
    isInSelectedChars: boolean,
    currentIndex: number,
    boardState: BoardState,
    gameState: GameState
  ) => {
    const { boardSize } = boardState;

    const currentChar =
      gameState.selectedChars[gameState.selectedChars.length - 1];

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

    const isFirstChar = gameState.selectedChars.length === 0;
    const isValidNeighbor = currentChar && neighbors.includes(currentIndex);
    const isNotSelected = !isInSelectedChars;
    const isEligible = isFirstChar || (isNotSelected && isValidNeighbor);

    if (isEligible) {
      addToSelectedChars(currentIndex, gameState, boardState);
    } else if (isInSelectedChars) {
      deselectCharAndAncestors(currentIndex, gameState);
    }
  }
);

export const handleTouchMove = $(
  (
    e: QwikTouchEvent<HTMLButtonElement>,
    boardState: BoardState,
    gameState: GameState
  ) => {
    const element = document.elementFromPoint(
      e.targetTouches[0].clientX,
      e.targetTouches[0].clientY
    );
    if (element) {
      // get the data-cell-index from the button
      const cellIndex = element.getAttribute('data-cell-index')!;
      const cellChar = element.getAttribute('data-cell-char');
      const cellIsInPath = element.getAttribute('data-cell-is-in-path');
      // const currently selected path
      const selectedPath = gameState.selectedChars;
      const lastNodeInPath =
        gameState.selectedChars[gameState.selectedChars.length - 1];
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
        gameState.selectedChars = selectedPath.slice(0, index);
        return;
      } else if (
        !lastNodeInPath ||
        (lastNodeInPath && neighbors.includes(Number.parseInt(cellIndex)))
      ) {
        gameState.selectedChars = [
          ...gameState.selectedChars,
          {
            index: Number.parseInt(cellIndex)!,
            char: cellChar!,
          },
        ];
      }
    }
  }
);

// export const handleBoardResize = (
//   screenState: ScreenState,
//   boardSize: number
// ) => {
//   const maxWidth = 500;
//   if (typeof window !== 'undefined') {
//     screenState.width = window.innerWidth - 20;
//     screenState.squareWidth = Math.floor(screenState.width / boardSize);

//     if (screenState.width > maxWidth) {
//       screenState.width = maxWidth;
//       screenState.squareWidth = Math.floor(screenState.width / boardSize);
//     }
//   }
// };

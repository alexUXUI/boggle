import type { QwikTouchEvent } from '@builder.io/qwik';
import { $ } from '@builder.io/qwik';

import type { BoardState, GameState } from '../models';
import type { LetterCubeBgColor } from './Board';

export interface LetterCubeProps {
  currentIndex: number;
  boardState: BoardState;
  key: number;
  gameState: GameState;
  cellBgColor: LetterCubeBgColor;
  isInSelectedChars: boolean;
}

export const LetterCube = ({
  currentIndex,
  boardState,
  key,
  gameState,
  cellBgColor,
  isInSelectedChars,
}: LetterCubeProps) => {
  const letter = boardState.chars[currentIndex].toLocaleUpperCase();
  const baseStyle = {
    height: `${boardState.cellWidth}px` ?? 0,
    width: `${boardState.cellWidth}px` ?? 0,
  };
  const baseClass = `cube__face cube__face--`;
  const zPerspective = boardState.cellWidth / 2;

  return (
    <td style={baseStyle} key={key} class={`scene m-0 p-0`}>
      <div style={baseStyle} class={`cube`}>
        <div
          style={{
            ...baseStyle,
            transform: `rotateY(90deg) translateZ(${zPerspective}px)`,
          }}
          class={`${baseClass}right`}
        />
        <div
          style={{
            ...baseStyle,
            transform: `rotateY(-90deg) translateZ(${zPerspective}px)`,
          }}
          class={`${baseClass}left`}
        />
        <div
          style={{
            ...baseStyle,
            transform: `rotateX(90deg) translateZ(${zPerspective}px)`,
          }}
          class={`${baseClass}top`}
        />
        <div
          style={{
            ...baseStyle,
            transform: `rotateX(-90deg) translateZ(${zPerspective}px)`,
          }}
          class={`${baseClass}bottom`}
        />
        <div class="face flex items-center justify-center">
          <button
            data-cell-index={currentIndex}
            data-cell-char={letter}
            data-cell-is-in-path={false}
            class={`${cellBgColor} h-[90%] w-[90%] text-[30px] leading-[40px] p-0 m-0 rounded-sm`}
            onClick$={() => {
              handleClick({
                boardState,
                currentIndex,
                gameState,
                isInSelectedChars,
              });
            }}
            onTouchMove$={(e) => {
              handleTouch({
                boardState,
                gameState,
                e,
              });
            }}
          >
            {letter ? letter : ' '}
          </button>
        </div>
      </div>
    </td>
  );
};

export const handleClick = $(
  ({
    boardState,
    currentIndex,
    gameState,
    isInSelectedChars,
  }: {
    boardState: BoardState;
    currentIndex: number;
    gameState: GameState;
    isInSelectedChars: boolean;
  }) => {
    const { chars } = boardState;
    const { selectedChars } = gameState;
    const lastCharInPath = selectedChars[selectedChars.length - 1];
    const currentChar = chars[currentIndex];

    updatePath({
      boardState,
      currentIndex,
      gameState,
      isInSelectedChars,
      lastCharInPath,
      currentChar,
    });
  }
);

export const handleTouch = $(
  ({
    boardState,
    gameState,
    e,
  }: {
    boardState: BoardState;
    gameState: GameState;
    e: QwikTouchEvent<HTMLButtonElement>;
  }) => {
    const element = document.elementFromPoint(
      e.targetTouches[0].clientX,
      e.targetTouches[0].clientY
    );
    if (element) {
      const currentIndex = Number.parseInt(
        element.getAttribute('data-cell-index')!
      );
      const currentChar = element.getAttribute('data-cell-char')!;
      const isInSelectedChars = Boolean(
        element.getAttribute('data-cell-is-in-path')
      );

      const lastCharInPath =
        gameState.selectedChars[gameState.selectedChars.length - 1];

      updatePath({
        boardState,
        currentIndex,
        gameState,
        isInSelectedChars,
        lastCharInPath,
        currentChar,
      });
    }
  }
);

export const updatePath = ({
  boardState,
  currentIndex,
  gameState,
  isInSelectedChars,
  lastCharInPath,
  currentChar,
}: {
  boardState: BoardState;
  currentIndex: number;
  gameState: GameState;
  isInSelectedChars: boolean;
  lastCharInPath: { index: number; char: string };
  currentChar: string;
}) => {
  if (!lastCharInPath) {
    gameState.selectedChars = [
      ...gameState.selectedChars,
      {
        index: currentIndex,
        char: currentChar,
      },
    ];
    return;
  } else if (lastCharInPath && !isInSelectedChars) {
    const { index } = lastCharInPath;
    const { boardSize } = boardState;
    const neighbors = [
      index - boardSize - 1,
      index - boardSize,
      index - boardSize + 1,
      index - 1,
      index + 1,
      index + boardSize - 1,
      index + boardSize,
      index + boardSize + 1,
    ];
    const isNeighbor = Boolean(
      neighbors.filter((idx: number) => idx === currentIndex).length
    );
    if (isNeighbor) {
      gameState.selectedChars = [
        ...gameState.selectedChars,
        {
          index: currentIndex,
          char: currentChar,
        },
      ];
      return;
    }
    return;
  } else {
    // removing everything from selected node and up in selected chars if already in path
    const index = gameState.selectedChars.findIndex(
      ({ index }: { index: number }) => index === currentIndex
    );
    gameState.selectedChars = gameState.selectedChars.slice(0, index);
  }
};

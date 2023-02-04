import { handleCellClick, handleTouchMove } from '../logic/board.logic';
import type { BoardState, GameState } from '../models';

export interface LetterCubeProps {
  cellBgColor: string;
  isInSelectedChars: boolean;
  currentIndex: number;
  boardState: BoardState;
  gameState: GameState;
}

export const LetterCube = ({
  currentIndex,
  cellBgColor,
  isInSelectedChars,
  boardState,
  gameState,
}: LetterCubeProps) => {
  const letter = boardState.data[currentIndex].toLocaleUpperCase();
  const baseStyle = {
    height: `${boardState.cellWidth}px` ?? 0,
    width: `${boardState.cellWidth}px` ?? 0,
  };
  const baseClass = `cube__face cube__face--`;
  const zPerspective = boardState.cellWidth / 2;
  return (
    <td style={baseStyle} key={currentIndex} class={`scene m-0 p-0`}>
      <div style={baseStyle} class={`cube`}>
        <div
          style={{
            ...baseStyle,
            transform: `rotateY(90deg) translateZ(${zPerspective}px)`,
          }}
          class={`${baseClass}--right`}
        />
        <div
          style={{
            ...baseStyle,
            transform: `rotateY(-90deg) translateZ(${zPerspective}px)`,
          }}
          class={`${baseClass}--left`}
        />
        <div
          style={{
            ...baseStyle,
            transform: `rotateX(90deg) translateZ(${zPerspective}px)`,
          }}
          class={`${baseClass}--top`}
        ></div>
        <div
          style={{
            ...baseStyle,
            transform: `rotateX(-90deg) translateZ(${zPerspective}px)`,
          }}
          class={`${baseClass}--bottom`}
        ></div>
        <div class="face flex items-center justify-center">
          <button
            data-cell-index={currentIndex}
            data-cell-char={letter}
            data-cell-is-in-path={isInSelectedChars}
            class={`${cellBgColor} h-[90%] w-[90%] text-[30px] leading-[40px] p-0 m-0 rounded-sm`}
            onClick$={() => {
              handleCellClick(
                isInSelectedChars,
                currentIndex,
                boardState,
                gameState
              );
            }}
            onTouchMove$={(e) => handleTouchMove(e, boardState, gameState)}
          >
            {letter ? letter : ' '}
          </button>
        </div>
      </div>
    </td>
  );
};

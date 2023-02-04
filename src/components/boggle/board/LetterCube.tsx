import {
  bgColor,
  handleCellClick,
  handleTouchMove,
  isInPath,
} from '../logic/board';
import type { BoardState, GameState } from '../models';

export interface Props {
  currentIndex: number;
  boardState: BoardState;
  gameState: GameState;
  key: number;
}

export const LetterCube = (props: Props) => {
  const { currentIndex, boardState, gameState, key } = props;
  const letter = boardState.chars[currentIndex].toLocaleUpperCase();
  const isInSelectedChars = isInPath(
    currentIndex,
    gameState.selectedChars,
    boardState.chars
  );
  const cellBgColor = bgColor(isInSelectedChars, gameState?.isWordFound);
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

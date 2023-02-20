import { handleTouch, handleClick } from '../logic/board';
import type { BoardState, GameState, LetterCubeBgColor } from '../models';

export interface LetterCubeProps {
  currentIndex: number;
  boardState: BoardState;
  key: number;
  gameState: GameState;
  cellBgColor: LetterCubeBgColor;
  isInSelectedChars: boolean;
  s: {
    isMouseDown: boolean;
  };
}

export const LetterCube = ({
  currentIndex,
  boardState,
  key,
  gameState,
  cellBgColor,
  isInSelectedChars,
  s,
}: LetterCubeProps) => {
  const letter = boardState.chars[currentIndex]?.toLocaleUpperCase();
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
            id={currentIndex.toString()}
            data-cell-index={currentIndex}
            data-cell-char={letter}
            data-cell-is-in-path={false}
            class={`${cellBgColor} important h-[90%] w-[90%] text-[30px] leading-[40px] p-0 m-0 rounded-sm`}
            onTouchMove$={(e) => {
              handleTouch({
                boardState,
                gameState,
                e,
              });
            }}
            onMouseOver$={(e) => {
              if (s.isMouseDown) {
                const el = document.elementFromPoint(e.clientX, e.clientY);
                if (el) {
                  handleClick({
                    boardState,
                    currentIndex,
                    gameState,
                    isInSelectedChars,
                  });
                }
              }
            }}
            onMouseDown$={() => {
              handleClick({
                boardState,
                currentIndex,
                gameState,
                isInSelectedChars,
              });
              s.isMouseDown = true;
            }}
            onMouseUp$={() => {
              s.isMouseDown = false;
            }}
            onKeyDown$={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleClick({
                  boardState,
                  currentIndex,
                  gameState,
                  isInSelectedChars,
                });
              }
            }}
          >
            {letter ? letter : ' '}
          </button>
        </div>
      </div>
    </td>
  );
};

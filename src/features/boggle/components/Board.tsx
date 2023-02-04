import { $, component$, useContext, useOnWindow } from '@builder.io/qwik';
import { BoardCtx, GameCtx, SelectedCharsCtx } from '..';
import { isInPath, bgColor } from '../logic/board.logic';
import { LetterCube } from './LetterCube';

export const BoggleBoard = component$(() => {
  const boardState = useContext(BoardCtx);
  const selectedCharsState = useContext(SelectedCharsCtx);
  const gameState = useContext(GameCtx);

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
      class="w-full flex flex-col justify-center items-center mt-[150px]"
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
                  <LetterCube
                    cellBgColor={cellBgColor}
                    isInSelectedChars={isInSelectedChars}
                    currentIndex={currentIndex}
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
});

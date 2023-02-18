import {
  $,
  component$,
  useContext,
  useOnWindow,
  useStore,
} from '@builder.io/qwik';
import { BoardCtx, GameCtx } from '../context';
import { LetterCube } from './LetterCube';
import { bgColor } from '../logic/board';

export const BoggleBoard = component$(() => {
  const boardState = useContext(BoardCtx);
  const gameState = useContext(GameCtx);

  useOnWindow(
    'DOMContentLoaded',
    $(() => {
      const clickHandler = (e: MouseEvent) => {
        if (!document.getElementById('board')?.contains(e.target as Node)) {
          gameState.selectedChars = [];
        }
      };

      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Backspace' || e.key === 'Escape') {
          gameState.selectedChars = [];
        }
      };

      // const noScroll = document.getElementById('no-scroll');
      // noScroll?.addEventListener('wheel', (e) => {
      //   e.preventDefault();
      // });

      // noScroll?.addEventListener('touchmove', (e) => {
      //   e.preventDefault();
      // });

      document.addEventListener('wheel', (event) => {
        console.log('wheel', event);
      });

      document.addEventListener('click', clickHandler);
      document.addEventListener('keydown', handleKeydown);
    })
  );

  const s = useStore({
    isMouseDown: false,
  });

  return (
    <div class="flex flex-col items-center mt-[120px]" id="no-scroll">
      <table id="board" class={`bg-blue-800`}>
        <tbody
          style={{
            width: `${boardState.boardWidth}px`,
            height: `${boardState.boardWidth}px`,
          }}
          class={`flex flex-col bg-green w-fit h-fit justify-evenly`}
        >
          {Array.from({ length: boardState.boardSize }, (_idx, i) => (
            <tr class={`flex w-full justify-evenly`} key={i}>
              {Array.from({ length: boardState.boardSize }, (_jdx, j) => {
                const currentIndex = i * boardState.boardSize + j;

                const isCharSelected = Boolean(
                  gameState.selectedChars.filter(
                    ({ index }) => index === currentIndex
                  ).length
                );

                const cellBgColor = bgColor(
                  isCharSelected,
                  gameState.isWordFound
                );

                return (
                  <LetterCube
                    gameState={gameState}
                    cellBgColor={cellBgColor}
                    key={currentIndex}
                    currentIndex={currentIndex}
                    boardState={boardState}
                    isInSelectedChars={isCharSelected}
                    s={s}
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

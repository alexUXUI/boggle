import { component$, useContext } from '@builder.io/qwik';
import { AnswersCtx, GameCtx } from '../context';

export const UserGameStats = component$(() => {
  const answersState = useContext(AnswersCtx);
  const gameState = useContext(GameCtx);

  const longestWord = answersState.foundWords.reduce((a, b): string => {
    return a.length > b.length ? a : b;
  }, '');

  return (
    <div class="h-fit w-full flex flex-col items-center justify-center">
      <ul class="w-full sm:max-w-[500px] h-fit pb-4 px-3 flex flex-wrap justify-between items-center m-auto">
        <li class="flex justify-center w-fit h-[20px] items-center">
          level: {gameState.currentLevel}
        </li>
        <li class="flex justify-center w-fit h-[20px] items-center">
          Score: 0
        </li>
        <li class="flex justify-center w-fit h-[20px] items-center">
          Found:{' '}
          {answersState.foundWords.length ? answersState.foundWords.length : 0}{' '}
          / {answersState.answers.length}
        </li>
        <li class="flex justify-center w-fit h-[20px] items-center">
          Best word: {longestWord.length}{' '}
          {longestWord ? `(${longestWord})` : null}
        </li>
        <li class="flex justify-center w-fit h-[20px] items-center">
          Words until next level: {gameState.wordsUntilNextLevel + 1}
        </li>
        <li class="w-full flex h-fit">
          {Array.from({ length: gameState.levelStepSize })
            .map((_, i) => {
              return (
                <div
                  class={`
                    h-[10px]
                    ${
                      gameState.wordsUntilNextLevel - i >= 0
                        ? 'bg-white'
                        : 'bg-blue-300'
                    }

                    
                    w-full h-[20px] p-2 border-[1px] border-[
                      ${
                        gameState.wordsUntilNextLevel - i >= 0
                          ? 'bg-white'
                          : 'bg-blue-300'
                      }
                    ]`}
                ></div>
              );
            })
            .reverse()}
        </li>
      </ul>
    </div>
  );
});
{
  /* <li class="w-[50%] h-[50px]">Words until next level: 0</li> */
}

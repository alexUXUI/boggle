import { component$, useContext } from '@builder.io/qwik';
import { AnswersCtx, GameCtx } from '../context';

export const UserGameStats = component$(() => {
  const answersState = useContext(AnswersCtx);
  const gameState = useContext(GameCtx);

  // const longestWord = answersState.foundWords.reduce((a, b): string => {
  //   return a.length > b.length ? a : b;
  // }, '');

  const percentage = answersState.answers.length
    ? Math.round(
        (answersState.foundWords.length / answersState.answers.length) * 100
      )
    : 0;

  console.log('percentage', percentage);

  return (
    <div class="flex flex-col items-center justify-center my-[20px] w-fit m-auto min-w-[410px]">
      <ul class="w-full h-fit px-3 flex flex-wrap justify-between items-center m-auto">
        <li class="flex justify-center w-full items-center h-[30px]">
          <div class="min-w-[80px]">
            <p class="text-[14px] text-gray-600 h-fit p-0 m-0 leading-[30px]">
              Level: {gameState.currentLevel}
            </p>
          </div>
          <div class="relative w-full">
            <div class={`h-[30px] flex justify-between w-full bg-gray-100`}>
              {Array.from({ length: gameState.levelStepSize })
                .map((_, i) => {
                  return (
                    <div
                      style={{
                        width: `${100 / gameState.levelStepSize}%`,
                      }}
                      class={`
                      m-auto h-[30px] border-[1px]
                      border-[
                        ${
                          gameState.wordsUntilNextLevel - i >= 0
                            ? 'gray-400'
                            : 'blue-300'
                        }
                      ]
                    ${
                      gameState.wordsUntilNextLevel - i >= 0
                        ? ''
                        : 'bg-blue-300'
                    }
                    rounded-sm
                    `}
                    ></div>
                  );
                })
                .reverse()}
            </div>
          </div>
        </li>

        {/* <li class="w-full flex flex-col"></li> */}
        <li class="w-full">
          <div class="relative pt-[6px] flex">
            <div class="min-w-[80px]">
              <p class="text-[14px] text-gray-600 h-fit p-0 m-0 leading-[30px]">
                Progress:
              </p>
            </div>
            <div class="absolute right-[6px]">
              <p class="text-[12px] text-gray-600 h-fit p-0 m-0 leading-[30px]">
                {answersState.foundWords.length
                  ? answersState.foundWords.length
                  : 0}{' '}
                / {answersState.answers.length} -{' '}
                {answersState.answers.length
                  ? Math.round(
                      (answersState.foundWords.length /
                        answersState.answers.length) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
            <div
              class={`w-full h-[30px] border-[1px] border-gray-300 rounded-sm bg-gray-100`}
            >
              <div
                class={`bg-blue-300 h-[100%]`}
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        </li>
        {/* <li class="flex justify-center w-fit h-[20px] items-center">
          Score: 0
        </li>
        <li class="flex justify-center w-fit h-[20px] items-center">
          Best word: {longestWord.length ? longestWord.length : null}{' '}
          {longestWord ? `(${longestWord})` : null}
        </li> */}
      </ul>
    </div>
  );
});
{
  /* <li class="w-[50%] h-[50px]">Words until next level: 0</li> */
} /**
         
*/

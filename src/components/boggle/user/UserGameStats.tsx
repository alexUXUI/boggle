import { component$, useContext } from '@builder.io/qwik';
import { AnswersCtx } from '../context';

export const UserGameStats = component$(() => {
  const answersState = useContext(AnswersCtx);

  const longestWord = answersState.foundWords.reduce((a, b): string => {
    return a.length > b.length ? a : b;
  }, '');

  return (
    <div class="h-[60px] w-full flex flex-col items-center justify-center">
      <ul class="w-full sm:max-w-full md:max-w-[500px] h-[100px] flex flex-wrap justify-between items-center m-auto">
        <li class="flex justify-center w-fit h-[40px] items-center">
          level: 0
        </li>
        <li class="flex justify-center w-fit h-[40px] items-center">
          Score: 0
        </li>
        <li class="flex justify-center w-fit h-[40px] items-center">
          Found:{' '}
          {answersState.foundWords.length ? answersState.foundWords.length : 0}{' '}
          / {answersState.answers.length}
        </li>
        <li class="flex justify-center w-fit h-[40px] items-center">
          Longest: {longestWord.length}{' '}
          {longestWord ? `(${longestWord})` : null}
        </li>
      </ul>
    </div>
  );
});
{
  /* <li class="w-[50%] h-[50px]">Words until next level: 0</li> */
}

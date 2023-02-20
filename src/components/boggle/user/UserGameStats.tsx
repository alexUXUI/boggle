import { component$ } from '@builder.io/qwik';

export const UserGameStats = component$(() => {
  return (
    <div class="h-[100px] w-full bg-red-300">
      <ul class="w-full sm:max-w-full lg:max-w-[500px] h-[100px] flex flex-wrap justify-between items-center m-auto">
        <li class="flex justify-center w-[50%] h-[50px]">level: 0</li>
        <li class="flex justify-center w-[50%] h-[50px]">Score: 0</li>
        <li class="flex justify-center w-[50%] h-[50px]">Words Found: 0</li>
        <li class="flex justify-center w-[50%] h-[50px]">Longest word: 0</li>
      </ul>
    </div>
  );
});
{
  /* <li class="w-[50%] h-[50px]">Words until next level: 0</li> */
}

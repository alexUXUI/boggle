import { component$, useContext } from '@builder.io/qwik';
import { WordsList } from './WordsList';
import { AnswersCtx } from '../context';
import { WordListType } from '../models';

export const WordsPanel = component$(() => {
  const answersState = useContext(AnswersCtx);
  return (
    <div class="flex justify-center absolute bottom-0 w-full h-[60px]">
      <WordsList words={answersState.foundWords} variant={WordListType.Found} />
      <WordsList words={answersState.answers} variant={WordListType.Answers} />
    </div>
  );
});

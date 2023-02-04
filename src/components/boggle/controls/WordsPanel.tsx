import { component$, useContext } from '@builder.io/qwik';
import { WordsList, Variant } from './WordsList';
import { AnswersCtx } from '../BoggleRoot';

export const WordsPanel = component$(() => {
  const answersState = useContext(AnswersCtx);
  return (
    <div class="flex justify-center absolute bottom-0 w-full h-[60px]">
      <WordsList words={answersState.foundWords} variant={Variant.Found} />
      <WordsList words={answersState.data} variant={Variant.Answers} />
    </div>
  );
});

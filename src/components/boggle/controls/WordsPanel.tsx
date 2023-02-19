import { component$, useContext, useStore } from '@builder.io/qwik';
import { WordsList } from './WordsList';
import { AnswersCtx } from '../context';
import { WordListType } from '../models';

export const WordsPanel = component$(() => {
  const answersState = useContext(AnswersCtx);
  const wordPanelState = useStore<{
    activeTab: WordListType | null;
  }>({
    activeTab: null,
  });

  return (
    <div class="flex justify-center absolute bottom-0 w-full h-[60px]">
      <WordsList
        words={answersState.foundWords}
        variant={'foundWords'}
        wordPanelState={wordPanelState}
      />
      <WordsList
        words={answersState.answers}
        variant={'answers'}
        wordPanelState={wordPanelState}
      />
    </div>
  );
});

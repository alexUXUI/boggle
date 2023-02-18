import { $, component$, useContext, useStore } from '@builder.io/qwik';
import { GameCtx } from '../context';

interface WordsListProps {
  words: string[];
  variant: Variant;
}

export enum Variant {
  Answers = 'answers',
  Found = 'foundwords',
}

export const WordsList = component$(({ words, variant }: WordsListProps) => {
  const gameState = useContext(GameCtx);

  const state = useStore({ isOpen: false });

  const handleToggle = $(() => {
    state.isOpen = !state.isOpen;
  });

  const styles = {
    height: `${state.isOpen ? 400 : 0}px`,
    zIndex: `${state.isOpen ? 50 : 0}`,
    bottom: `${state.isOpen ? 60 : 0}px`,
    width: state.isOpen ? '100%' : '150px',
    position: 'fixed',
    margin: 'auto',
    left: 0,
  };

  const isAnswers = variant === Variant.Answers;

  return (
    <div class="">
      <button
        class=" hover:bg-blue-100 leading-[20px] text-[14px] bg-white p-2 rounded-md border-2 border-blue-800 h-[40px] w-fit mx-4"
        onClick$={handleToggle}
      >
        {state.isOpen ? 'Close ' : 'Open '}
        {isAnswers ? 'Answers' : 'Found Words'}
      </button>
      <div
        id={`words-list-${variant}`}
        class={`flex flex-col items-center`}
        style={styles}
      >
        {state.isOpen && words.length ? (
          <div class="overflow-scroll h-full w-full heavy-glass">
            <ul class=" flex flex-wrap justify-start items-start w-full">
              {words
                .filter((word) => word.length >= gameState.minCharLength)
                .map((word) => (
                  <li class="w-[33%] text-center">{word}</li>
                ))}
            </ul>
          </div>
        ) : (
          state.isOpen && (
            <div class="h-full w-full items-center heavy-glass flex flex-wrap justify-center">
              No data
            </div>
          )
        )}
      </div>
    </div>
  );
});

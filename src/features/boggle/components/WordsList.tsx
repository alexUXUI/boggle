import { $, component$, useOnWindow } from '@builder.io/qwik';
import type { AnswersState } from '../models';

export const WordsList = component$(
  ({
    answersState,
    title,
    minCharLength,
    state,
  }: {
    answersState: AnswersState;
    title: string;
    minCharLength: number;
    state: { isOpen: boolean };
  }) => {
    // const openState = useStore({ isOpen: false });
    const isAnswers = title === 'answers';

    useOnWindow(
      'DOMContentLoaded',
      $(() => {
        const list = document.getElementById(`words-list-${title}`);

        // on click detect if the click was outside the list
        // if it was, close the list
        const handleClick = (event: MouseEvent) => {
          if (list && !list.contains(event.target as Node)) {
            state.isOpen = false;
          }
        };

        // if the user presses esc close the list
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
            state.isOpen = false;
          }
        };

        // add the event listener
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKeyDown);
      })
    );

    const handleToggle = $(() => {
      state.isOpen = !state.isOpen;
    });

    return (
      <div
        id={`words-list-${title} no-scroll`}
        class={` w-[50%] flex flex-col items-center max-h-[500px]`}
        style={{
          height: `${state.isOpen ? 500 : 50}px`,
          zIndex: `${state.isOpen ? 50 : 0}`,
          bottom: `${isAnswers ? 0 : 0}px`,
          width: state.isOpen ? '100%' : '50%',
          position: state.isOpen ? 'fixed' : 'fixed',
          right: state.isOpen
            ? isAnswers
              ? '0'
              : '0'
            : isAnswers
            ? '50%'
            : '0',
        }}
      >
        <div
          class={`heavy-glass px-4 w-full flex items-center justify-center h-[50px]`}
        >
          <button
            class=" hover:bg-blue-100 leading-[20px] text-[14px] bg-white p-2 rounded-md border-2 border-blue-800 h-[40px]"
            onClick$={handleToggle}
          >
            {state.isOpen ? 'Close ' : 'Open '}
            {isAnswers ? 'Answers' : 'Found'}
          </button>
        </div>

        {state.isOpen &&
        answersState[isAnswers ? 'data' : 'foundWords'].length ? (
          <div class="w-full overflow-scroll h-full heavy-glass">
            <ul class=" flex flex-wrap justify-start items-start w-full m-auto">
              {answersState[isAnswers ? 'data' : 'foundWords']
                .filter((word) => {
                  return word.length >= minCharLength;
                })
                .map((word) => (
                  <li class="w-[33%] text-center">{word}</li>
                ))}
            </ul>
          </div>
        ) : (
          state.isOpen && (
            <div class="w-full h-full items-center heavy-glass flex flex-wrap justify-center">
              No data
            </div>
          )
        )}
      </div>
    );
  }
);

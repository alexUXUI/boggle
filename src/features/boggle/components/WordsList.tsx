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
      <div class="">
        <button
          class=" hover:bg-blue-100 leading-[20px] text-[14px] bg-white p-2 rounded-md border-2 border-blue-800 h-[40px] w-fit mx-4"
          onClick$={handleToggle}
        >
          {state.isOpen ? 'Close ' : 'Open '}
          {isAnswers ? 'Answers' : 'Found Words'}
        </button>
        <div
          id={`words-list-${title} no-scroll`}
          class={`flex flex-col items-center`}
          style={{
            height: `${state.isOpen ? 400 : 0}px`,
            zIndex: `${state.isOpen ? 50 : 0}`,
            bottom: `${state.isOpen ? 60 : 0}px`,
            width: state.isOpen ? '100%' : '150px',
            position: 'fixed',
            margin: 'auto',
            left: 0,
          }}
        >
          {state.isOpen &&
          answersState[isAnswers ? 'data' : 'foundWords'].length ? (
            <div class="overflow-scroll h-full w-full heavy-glass">
              <ul class=" flex flex-wrap justify-start items-start w-full">
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
              <div class="h-full w-full items-center heavy-glass flex flex-wrap justify-center">
                No data
              </div>
            )
          )}
        </div>
      </div>
    );
  }
);

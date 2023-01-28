import { $ } from '@builder.io/qwik';
import type { State } from '~/routes';

export const addToSelectedChars = $((currentIndex: number, state: State) => {
  console.log(currentIndex);
  console.log(state.board);
  console.log(state.board[currentIndex]);
  state.selectedChars = [
    ...state.selectedChars,
    {
      index: currentIndex,
      char: state.board[currentIndex],
    },
  ];
});

export const deselectCharAndAncestors = $(
  (currentIndex: number, state: State) => {
    const index = state.selectedChars.findIndex(
      (element) => element.index === currentIndex
    );
    state.selectedChars = state.selectedChars.slice(0, index);
  }
);

export const handleCellClick = $(
  (isInSelectedChars: boolean, currentIndex: number, state: State) => {
    const selectedChars = state.selectedChars;
    const currentChar = selectedChars[selectedChars.length - 1];
    console.log(currentChar);
    const { boardSize } = state;

    console.log(state);

    const neighbors = [
      currentChar?.index - boardSize, // top
      currentChar?.index - boardSize + 1, // top right
      currentChar?.index + 1, // right
      currentChar?.index + boardSize + 1, // bottom right
      currentChar?.index + boardSize, // bottom
      currentChar?.index + boardSize - 1, // bottom left
      currentChar?.index - 1, // left
      currentChar?.index - boardSize - 1, // top left
    ];

    console.log(neighbors);

    const isFirstChar = selectedChars.length === 0;
    const isValidNeighbor = currentChar && neighbors.includes(currentIndex);
    const isNotSelected = !isInSelectedChars;
    const isEligible = isFirstChar || (isValidNeighbor && isNotSelected);

    if (isEligible) {
      addToSelectedChars(currentIndex, state);
    } else if (isInSelectedChars) {
      deselectCharAndAncestors(currentIndex, state);
    }
  }
);

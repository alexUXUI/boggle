// import type { QwikTouchEvent } from '@builder.io/qwik';
import { $ } from '@builder.io/qwik';
import type { GameState, AnswersState, DictionaryState } from '../models';
import { Language } from './api';
import { fireworks } from './confetti';
import { LetterCubeBgColor } from '../board/Board';

// create one random board takes in a language and returns a random board
export const randomBoard = (language: string, length: number): string => {
  switch (language) {
    case Language.English:
      return generateRandomBoard(length);
    case Language.Russian:
      return generateRandomRussianBoard(length);
    default:
      return generateRandomBoard(length);
  }
};

export const isInPath = (
  currentIndex: number,
  selectedPath: { index: number; char: string }[],
  board: string[]
) => {
  // console.log('selectedPath', selectedPath);
  return selectedPath.reduce(
    (acc: boolean, element: { index: number; char: string }) => {
      if (
        element.index === currentIndex &&
        element.char === board[currentIndex]
      ) {
        return true;
      }
      return acc;
    },
    false
  );
};

export const bgColor = (
  isCharSelected: boolean,
  isWordFound: boolean
): LetterCubeBgColor => {
  let cellBgColor;
  switch (true) {
    case isCharSelected && isWordFound:
      cellBgColor = LetterCubeBgColor.WordFound; // if word found, highlight the path in green
      break;
    case isCharSelected:
      cellBgColor = LetterCubeBgColor.Selected; // if char is part of the selected path, highlight it in blue
      break;
    default:
      cellBgColor = LetterCubeBgColor.Unselected;
  }
  return cellBgColor;
};

export const handleFoundWord = $(
  (
    gameState: GameState,
    dictionaryState: DictionaryState,
    answersState: AnswersState
  ) => {
    const word = gameState.selectedChars
      .map((element) => element.char)
      .join('')
      .toLocaleLowerCase();

    const isWordInDict =
      Boolean(word.length) && dictionaryState.dictionary.includes(word);
    const isWordNotFound = !answersState.foundWords.includes(word);
    const isWordLongEnough = word.length >= gameState.minCharLength;

    if (isWordInDict && isWordNotFound && isWordLongEnough) {
      gameState.isWordFound = true;
      fireworks();
      setTimeout(() => {
        answersState.foundWords = [...answersState.foundWords, word];
        gameState.isWordFound = false;
        gameState.selectedChars = [];
      }, 300);
    }
  }
);

export const generateRandomBoard = (length: number): string => {
  const englishVowels = [
    'e',
    'e',
    'e',
    'e',
    'e',
    'a',
    'a',
    'a',
    'i',
    'i',
    's',
    's',
  ];
  const englishConsonants = [
    'r',
    'h',
    'm',
    't',
    'd',
    'c',
    'l',
    'b',
    'f',
    'g',
    'n',
    'p',
    'w',
  ];
  const unpopularConsonants = [
    'j',
    'k',
    'k',
    'q',
    'v',
    'x',
    'y',
    'y',
    'y',
    'z',
  ];
  const lengthSquared = length * length;

  const shuffledVowels = englishVowels.sort(() => 0.5 - Math.random());
  const shuffledConsonants = englishConsonants.sort(() => 0.5 - Math.random());

  const zip = (a: string[], b: string[]) => {
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result.push(a[i]);
      result.push(b[i]);
    }
    return result;
  };

  const zipped = zip(shuffledVowels, shuffledConsonants);

  const randomUnPopularConsonant =
    unpopularConsonants[Math.floor(Math.random() * unpopularConsonants.length)];

  const results = [...zipped, randomUnPopularConsonant];
  const shuffledResults = results.sort(() => 0.5 - Math.random());

  if (lengthSquared > results.length) {
    const difference = lengthSquared - results.length;
    for (let i = 0; i < difference; i++) {
      const randomVowel =
        englishVowels[Math.floor(Math.random() * englishVowels.length)];
      const randomConsonant =
        englishConsonants[Math.floor(Math.random() * englishConsonants.length)];
      const vowelOrConsonant =
        Math.random() > 0.5 ? randomVowel : randomConsonant;
      results.push(vowelOrConsonant);
    }
  } else if (lengthSquared < results.length) {
    const shuffledResults = results.sort(() => 0.5 - Math.random());
    shuffledResults.splice(lengthSquared, results.length);
    return shuffledResults.join('');
  }

  return shuffledResults.join('');
};

export const generateRandomRussianBoard = (length: number): string => {
  const lengthSquared = length * length;

  const vowels = ['а', 'а', 'а', 'о', 'е', 'е', 'е', 'и', 'и', 'и', 'н'];
  const consonants = [
    'р',
    'т',
    'к',
    'м',
    'д',
    'п',
    'у',
    'я',
    'ы',
    'ь',
    'г',
    'з',
    'б',
    'ч',
    'й',
    'х',
    'ж',
    'ш',
    'ю',
    'ц',
    'щ',
    'ф',
    'э',
    'с',
    'в',
    'л',
  ];

  const shuffledVowels = vowels.sort(() => 0.5 - Math.random());
  const shuffledConsonants = consonants.sort(() => 0.5 - Math.random());

  const zip = (a: string[], b: string[]) => {
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result.push(a[i]);
      result.push(b[i]);
    }
    return result;
  };

  const zipped = zip(shuffledVowels, shuffledConsonants);

  const results = [...zipped];
  const shuffledResults = results.sort(() => 0.5 - Math.random());

  if (lengthSquared > results.length) {
    const difference = lengthSquared - results.length;
    for (let i = 0; i < difference; i++) {
      const randomVowel = vowels[Math.floor(Math.random() * vowels.length)];
      const randomConsonant =
        consonants[Math.floor(Math.random() * consonants.length)];
      const vowelOrConsonant =
        Math.random() > 0.5 ? randomVowel : randomConsonant;
      results.push(vowelOrConsonant);
    }
  } else if (lengthSquared < results.length) {
    const shuffledResults = results.sort(() => 0.5 - Math.random());
    shuffledResults.splice(lengthSquared, results.length);
    return shuffledResults.join('');
  }

  return shuffledResults.join('');
};

export const generateRandomSpanishBoard = (length: number): string => {
  const lengthSquared = length * length;

  const vowels = ['a', 'e', 'i', 'o', 'u'];

  const consonants = [
    'b',
    'c',
    'd',
    'f',
    'g',
    'h',
    'j',
    'k',
    'l',
    'm',
    'n',
    'ñ',
    'p',
    'q',
    'r',
    's',
    't',
    'w',
  ];

  const shuffledVowels = vowels.sort(() => 0.5 - Math.random());

  const shuffledConsonants = consonants.sort(() => 0.5 - Math.random());

  const zip = (a: string[], b: string[]) => {
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result.push(a[i]);
      result.push(b[i]);
    }
    return result;
  };

  const zipped = zip(shuffledVowels, shuffledConsonants);

  const results = [...zipped];
  const shuffledResults = results.sort(() => 0.5 - Math.random());

  if (lengthSquared > results.length) {
    const difference = lengthSquared - results.length;
    for (let i = 0; i < difference; i++) {
      const randomVowel = vowels[Math.floor(Math.random() * vowels.length)];
      const randomConsonant =
        consonants[Math.floor(Math.random() * consonants.length)];
      const vowelOrConsonant =
        Math.random() > 0.5 ? randomVowel : randomConsonant;
      results.push(vowelOrConsonant);
    }
  } else if (lengthSquared < results.length) {
    const shuffledResults = results.sort(() => 0.5 - Math.random());
    shuffledResults.splice(lengthSquared, results.length);
    return shuffledResults.join('');
  }

  return shuffledResults.join('');
};

export const calculateCellWidth = (boardWidth: number, boardSize: number) => {
  switch (boardSize) {
    case 2:
      return boardWidth / boardSize - 40;
    case 3:
      return boardWidth / boardSize - 20;
    case 4:
      return boardWidth / boardSize - 12;
    case 5:
      return boardWidth / boardSize - boardSize * 2;
    case 6:
      return boardWidth / boardSize - boardSize - 2;
    case 7:
      return boardWidth / boardSize - 6;
    case 8:
      return boardWidth / boardSize - 6;
    case 9:
      return boardWidth / boardSize - 4;
    default:
      return boardWidth / boardSize - 2;
  }
};

// export const handleBoardResize = (
//   screenState: ScreenState,
//   boardSize: number
// ) => {
//   const maxWidth = 500;
//   if (typeof window !== 'undefined') {
//     screenState.width = window.innerWidth - 20;
//     screenState.squareWidth = Math.floor(screenState.width / boardSize);

//     if (screenState.width > maxWidth) {
//       screenState.width = maxWidth;
//       screenState.squareWidth = Math.floor(screenState.width / boardSize);
//     }
//   }
// };

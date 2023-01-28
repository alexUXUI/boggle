import type { ScreenState } from '../components/BoggleGrid';
import { LANGUAGE } from './api';

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
  const eglishConsonants = [
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
  const shuffledConsonants = eglishConsonants.sort(() => 0.5 - Math.random());

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
        eglishConsonants[Math.floor(Math.random() * eglishConsonants.length)];
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

export const handleBoardResize = (
  screenState: ScreenState,
  boardSize: number
) => {
  const maxWidth = 500;
  if (typeof window !== 'undefined') {
    screenState.width = window.innerWidth - 20;
    screenState.squareWidth = Math.floor(screenState.width / boardSize);

    if (screenState.width > maxWidth) {
      screenState.width = maxWidth;
      screenState.squareWidth = Math.floor(screenState.width / boardSize);
    }
  }
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

export const bgColor = (
  isInSelectedPath: boolean,
  wordFound: boolean
): string => {
  let bgColor = 'bg-white'; // if char is not part of the selected path, or a found word keep white bg

  if (isInSelectedPath && wordFound) {
    bgColor = 'bg-green-200'; // if word found, highlight the path in green
  } else if (isInSelectedPath) {
    bgColor = 'bg-blue-200'; // if char is part of the selected path, highlight it in blue
  }

  return bgColor;
};

// create one random board function that takes in a language and returns a random board
export const randomBoard = (language: string, length: number): string => {
  if (language === LANGUAGE.ENGLISH) {
    return generateRandomBoard(length);
  } else if (language === LANGUAGE.RUSSIAN) {
    return generateRandomRussianBoard(length);
  }
  return '';
};

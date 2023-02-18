import { Language, LetterCubeBgColor } from '../models';
import type { LanguageType } from '../models';

export const generateRandomBoard = (
  length: number,
  language: LanguageType
): string => {
  const lengthSquared = length * length;

  let vowels = [];
  let consonants = [];
  let unpopularConsonants = [];

  switch (language) {
    case Language.English:
      vowels = englishVowels;
      consonants = englishConsonants;
      unpopularConsonants = englishUnpopularConsonants;
      break;
    case Language.Spanish:
      vowels = englishVowels;
      consonants = englishConsonants;
      unpopularConsonants = englishUnpopularConsonants;
      break;
    case Language.Russian:
      vowels = russianVowels;
      consonants = russianConsonants;
      unpopularConsonants = russianUnpopularConsonants;
      break;
    default:
      vowels = englishVowels;
      consonants = englishConsonants;
      unpopularConsonants = englishUnpopularConsonants;
  }

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

  const randomUnPopularConsonant =
    unpopularConsonants[Math.floor(Math.random() * unpopularConsonants.length)];

  const results = [...zipped, randomUnPopularConsonant];
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

export const randomBoard = (language: LanguageType, length: number): string => {
  switch (language) {
    case Language.English:
      return generateRandomBoard(length, Language.English);
    case Language.Spanish:
      return generateRandomBoard(length, Language.Spanish);
    case Language.Russian:
      return generateRandomBoard(length, Language.Russian);
    default:
      return generateRandomBoard(length, Language.English);
  }
};

export const bgColor = (
  isCharSelected: boolean,
  isWordFound: boolean
): LetterCubeBgColor => {
  let cellBgColor;
  switch (true) {
    case isCharSelected && isWordFound:
      cellBgColor = LetterCubeBgColor.WordFound;
      break;
    case isCharSelected:
      cellBgColor = LetterCubeBgColor.Selected;
      break;
    default:
      cellBgColor = LetterCubeBgColor.Unselected;
  }
  return cellBgColor;
};

export const englishVowels = [
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
export const englishConsonants = [
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
export const englishUnpopularConsonants = [
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

export const russianVowels = [
  'а',
  'а',
  'а',
  'о',
  'е',
  'е',
  'е',
  'и',
  'и',
  'и',
  'н',
];

export const russianConsonants = [
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

export const russianUnpopularConsonants = ['й', 'к'];

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

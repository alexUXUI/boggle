import type { QwikTouchEvent } from '@builder.io/qwik';
import { $ } from '@builder.io/qwik';
import { Language, LetterCubeBgColor } from '../models';
import type {
  LanguageType,
  AnswersState,
  DictionaryState,
  GameState,
  BoardState,
} from '../models';
import { fireworks } from './confetti';
import * as Tone from 'tone';

export const handleClick = $(
  ({
    boardState,
    currentIndex,
    gameState,
    isInSelectedChars,
  }: {
    boardState: BoardState;
    currentIndex: number;
    gameState: GameState;
    isInSelectedChars: boolean;
  }) => {
    const { chars } = boardState;
    const { selectedChars } = gameState;
    const lastCharInPath = selectedChars[selectedChars.length - 1];
    const currentChar = chars[currentIndex];

    updatePath({
      boardState,
      currentIndex,
      gameState,
      isInSelectedChars,
      lastCharInPath,
      currentChar,
    });
  }
);

export const handleTouch = $(
  ({
    boardState,
    gameState,
    e,
  }: {
    boardState: BoardState;
    gameState: GameState;
    e: QwikTouchEvent<HTMLButtonElement>;
  }) => {
    const element = document.elementFromPoint(
      e.targetTouches[0].clientX,
      e.targetTouches[0].clientY
    );
    if (element) {
      const currentIndex = Number.parseInt(
        element.getAttribute('data-cell-index')!
      );
      const currentChar = element.getAttribute('data-cell-char')!;
      const isInSelectedChars = Boolean(
        element.getAttribute('data-cell-is-in-path')
      );

      const lastCharInPath =
        gameState.selectedChars[gameState.selectedChars.length - 1];

      updatePath({
        boardState,
        currentIndex,
        gameState,
        isInSelectedChars,
        lastCharInPath,
        currentChar,
      });
    }
  }
);

export const indexToSound: {
  [key: number]: { sound: string; pitch: string };
} = {
  0: { sound: 'B4', pitch: '8n' },
  1: { sound: 'C5', pitch: '8n' },
  2: { sound: 'D5', pitch: '8n' },
  3: { sound: 'E5', pitch: '8n' },
  4: { sound: 'F5', pitch: '8n' },
  5: { sound: 'G5', pitch: '8n' },
  6: { sound: 'A5', pitch: '8n' },
  7: { sound: 'B5', pitch: '8n' },
  8: { sound: 'C6', pitch: '8n' },
  9: { sound: 'D6', pitch: '8n' },
  10: { sound: 'E6', pitch: '8n' },
  11: { sound: 'F6', pitch: '8n' },
  12: { sound: 'G6', pitch: '8n' },
  13: { sound: 'A6', pitch: '8n' },
  14: { sound: 'B6', pitch: '8n' },
  15: { sound: 'C7', pitch: '8n' },
  16: { sound: 'D7', pitch: '8n' },
  17: { sound: 'E7', pitch: '8n' },
  18: { sound: 'F7', pitch: '8n' },
  19: { sound: 'G7', pitch: '8n' },
  20: { sound: 'A7', pitch: '8n' },
  21: { sound: 'B7', pitch: '8n' },
  22: { sound: 'C8', pitch: '8n' },
  23: { sound: 'D8', pitch: '8n' },
  24: { sound: 'E8', pitch: '8n' },
  25: { sound: 'F8', pitch: '8n' },
  26: { sound: 'G8', pitch: '8n' },
  27: { sound: 'A8', pitch: '8n' },
  28: { sound: 'B8', pitch: '8n' },
  29: { sound: 'C9', pitch: '8n' },
};

export const updatePath = ({
  boardState,
  currentIndex,
  gameState,
  isInSelectedChars,
  lastCharInPath,
  currentChar,
}: {
  boardState: BoardState;
  currentIndex: number;
  gameState: GameState;
  isInSelectedChars: boolean;
  lastCharInPath: { index: number; char: string };
  currentChar: string;
}) => {
  if (!lastCharInPath) {
    gameState.selectedChars = [
      ...gameState.selectedChars,
      {
        index: currentIndex,
        char: currentChar,
      },
    ];

    const lengthOfPath = gameState.selectedChars.length;

    const { sound, pitch } = indexToSound[lengthOfPath];

    const synth = new Tone.MonoSynth({
      oscillator: {
        type: 'sine',
      },
      envelope: {
        attack: 0.5,
        decay: 0.5,
        sustain: 0.1,
        release: 0.5,
      },
    }).toDestination();
    const now = Tone.now();
    synth.triggerAttackRelease(sound, pitch, now);
    return;
  } else if (lastCharInPath && !isInSelectedChars) {
    const { index } = lastCharInPath;
    const { boardSize } = boardState;
    const neighbors = [
      index - boardSize - 1,
      index - boardSize,
      index - boardSize + 1,
      index - 1,
      index + 1,
      index + boardSize - 1,
      index + boardSize,
      index + boardSize + 1,
    ];
    const isNeighbor = Boolean(
      neighbors.filter((idx: number) => idx === currentIndex).length
    );
    if (isNeighbor) {
      gameState.selectedChars = [
        ...gameState.selectedChars,
        {
          index: currentIndex,
          char: currentChar,
        },
      ];
      const lengthOfPath = gameState.selectedChars.length;

      const { sound, pitch } = indexToSound[lengthOfPath];

      const synth = new Tone.MonoSynth({
        filterEnvelope: {
          attack: 100,
          octaves: 4,
        },
        oscillator: {
          type: 'sine',
        },
        envelope: {
          attack: 0.5,
          decay: 0.5,
          sustain: 0.1,
          release: 0.5,
        },
      }).toDestination();

      const now = Tone.now();

      synth.triggerAttackRelease(sound, pitch, now);
      return;
    }
    return;
  } else {
    // removing everything from selected node and up in selected chars if already in path
    const index = gameState.selectedChars.findIndex(
      ({ index }: { index: number }) => index === currentIndex
    );
    gameState.selectedChars = gameState.selectedChars.slice(0, index);
  }
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

      const wowAudioFile = '/wow.mp3';

      const audio = new Audio(wowAudioFile);

      // check if audio is able to play
      audio.oncanplaythrough = () => {
        audio.play();
      };

      setTimeout(() => {
        answersState.foundWords = [...answersState.foundWords, word];
        gameState.isWordFound = false;
        gameState.selectedChars = [];
      }, 300);
    }
  }
);

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

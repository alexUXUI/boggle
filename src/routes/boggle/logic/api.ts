const ENGLISH_DICT_URL =
  'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';

const RUSSIAN_DICT_URL =
  'https://raw.githubusercontent.com/hingston/russian/master/10000-russian-words.txt';

export const LANGUAGE = {
  ENGLISH: 'ENGLISH',
  RUSSIAN: 'RUSSIAN',
};

// type that enforces the values of LANGUAGE
export type Language = typeof LANGUAGE[keyof typeof LANGUAGE];

export const getDictionary = async (language: Language) => {
  const response = await fetch(
    language === LANGUAGE.ENGLISH ? ENGLISH_DICT_URL : RUSSIAN_DICT_URL
  );
  const data = await response.text();
  const dictionary = data.replace(/(\r\n|\n|\r)/gm, ' ').split(' ');
  return dictionary;
};

export const importWordsFromPublicDir = async () => {
  const response = await fetch('/engmix.txt');
  const data = await response.text();
  const dictionary = data.replace(/(\r\n|\n|\r)/gm, ' ').split(' ');
  return dictionary;
};

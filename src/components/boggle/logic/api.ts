export const English_DICT_URL =
  'https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt';

export const English_DICT_URL_2 = '/engmix.txt';

export const Russian_DICT_URL =
  'https://raw.githubusercontent.com/hingston/Russian/master/10000-Russian-words.txt';

export const Language = {
  English: 'English',
  Russian: 'Russian',
};

export type Language = typeof Language[keyof typeof Language];

export const getDictionary = async (language: Language) => {
  const response = await fetch(
    language === Language.English ? English_DICT_URL_2 : Russian_DICT_URL
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

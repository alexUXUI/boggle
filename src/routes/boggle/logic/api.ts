export const getDictionary = async () => {
  const response = await fetch(
    "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt"
  );
  const data = await response.text();
  const dictionary = data.replace(/(\r\n|\n|\r)/gm, " ").split(" ");
  return dictionary;
};

export const importWordsFromPublicDir = async () => {
  const response = await fetch("/engmix.txt");
  const data = await response.text();
  const dictionary = data.replace(/(\r\n|\n|\r)/gm, " ").split(" ");
  const fisrtFifty = dictionary.slice(0, 50);
  console.log(fisrtFifty);
  return dictionary;
};

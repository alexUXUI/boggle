export const generateRandomBoard = (length: number): string => {
  const lengthSquared = length * length;

  const vowels = ["e", "e", "e", "e", "e", "a", "a", "a", "i", "i", "s", "s"];
  const consonants = [
    "r",
    "h",
    "m",
    "t",
    "d",
    "c",
    "l",
    "b",
    "f",
    "g",
    "n",
    "p",
    "w",
  ];
  const unpopularConsonants = [
    "j",
    "k",
    "k",
    "q",
    "v",
    "x",
    "y",
    "y",
    "y",
    "z",
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
    return shuffledResults.join("");
  }

  return shuffledResults.join("");
};

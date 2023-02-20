import { getDictionary } from './logic/api';
import { solve } from './logic/boggle';

interface MessageData {
  language: string;
  board: string[];
  isDictionaryLoaded?: boolean;
  minCharLength: number;
}

let dictionaryCache: string[] = [];

onmessage = async (e: MessageEvent<MessageData>) => {
  const { language, board, isDictionaryLoaded } = e.data;

  let dictionary: string[] = [];
  if (!dictionaryCache.length) {
    dictionary = await getDictionary(language);
    dictionaryCache = dictionary;
  }

  const answers = solve(dictionaryCache, board).filter(
    (answer) => answer.length >= e.data.minCharLength
  );

  postMessage({
    dictionary: !isDictionaryLoaded ? dictionaryCache : [],
    answers,
  });
};

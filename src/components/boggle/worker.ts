import { getDictionary } from './logic/api';
import { solve } from './logic/boggle';

interface MessageData {
  language: string;
  board: string[];
}

onmessage = (e: MessageEvent<MessageData>) => {
  const { language, board } = e.data;
  getDictionary(language).then((dictionary) => {
    const answers = solve(dictionary, board);
    postMessage({
      dictionary,
      answers,
    });
  });
};

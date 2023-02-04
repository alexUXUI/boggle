import { getDictionary } from './logic/api';

interface MessageData {
  language: string;
  board: string[];
}

onmessage = async (e: MessageEvent<MessageData>) => {
  const { language, board } = e.data;
  const dictionary = await getDictionary(language);
  const boggle = await import('./boggle-solver/pkg');
  await boggle.default();
  const answers = await boggle.run_game(dictionary, board.flat().join(''));
  postMessage({
    dictionary,
    answers,
  });
};

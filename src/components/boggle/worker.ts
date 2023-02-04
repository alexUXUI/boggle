import { getDictionary } from './logic/api';

interface MessageData {
  language: string;
  board: string[];
}

onmessage = (e: MessageEvent<MessageData>) => {
  const { language, board } = e.data;
  import('./boggle-solver/pkg').then(async (module) => {
    getDictionary(language).then(async (dictionary) => {
      await module.default();
      const answers = await module.run_game(dictionary, board.flat().join(''));
      postMessage({
        dictionary,
        answers,
      });
    });
  });
};

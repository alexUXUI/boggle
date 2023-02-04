import { getDictionary } from './logic/api';
import { solve } from './logic/boggle';

interface MessageData {
  language: string;
  board: string[];
}

onmessage = (e: MessageEvent<MessageData>) => {
  const { language, board } = e.data;
  // import('./boggle-solver/pkg').then(async (module) => {
  getDictionary(language).then((dictionary) => {
    // await module.default();
    // const answers = await module.run_game(dictionary);
    // console.log(answers);
    // const value = await module.run_game();
    // console.log(value);
    // console.log(dict);
    const answers = solve(dictionary, board);

    postMessage({
      dictionary,
      answers,
    });
  });
  // });
};

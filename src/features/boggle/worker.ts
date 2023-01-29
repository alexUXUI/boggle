import { getDictionary } from '../../routes/boggle/logic/api';
import { solve } from '../../routes/boggle/logic/boggle';

interface MessageData {
  language: string;
  board: string[];
  minCharLength: number;
}

onmessage = (e: MessageEvent<MessageData>) => {
  // console.log('Message received from main script', e.data);

  getDictionary(e.data.language).then((data) => {
    // console.log('Posting message back to main script');
    // console.log(data);

    const answers = solve(data, e.data.board);

    postMessage({
      dictionary: data,
      answers,
    });
  });

  // const workerResult = `Result: YEAH DAWG`;
  // console.log('Posting message back to main script');
  // postMessage(workerResult);
};

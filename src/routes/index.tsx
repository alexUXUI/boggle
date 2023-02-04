import { Resource, component$ } from '@builder.io/qwik';
import { useEndpoint } from '@builder.io/qwik-city';
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import { Language } from '~/features/boggle/logic/api';
import { randomBoard } from '~/features/boggle/logic/generateBoard';
import { BoogleRoot } from '~/features/boggle';
import { boardWidthFromRequest } from '~/features/boggle/server.logic';

export const head: DocumentHead = {
  title: 'Boggle',
  meta: [
    {
      name: 'Boggle Game',
      content: 'Play Boggle',
    },
  ],
};
export interface ServerData {
  board: string[];
  boardWidth: number;
  boardSize: number;
  language: string;
  minCharLength: number;
}

export default component$(() => {
  const boggleData = useEndpoint<ServerData>();

  return (
    <Resource
      value={boggleData}
      onPending={() => <div>Loading...</div>}
      onRejected={() => <div>Error</div>}
      onResolved={(data: ServerData) => {
        return <BoogleRoot data={data} />;
      }}
    />
  );
});

export const onGet: RequestHandler<ServerData> = ({ url, request }) => {
  let language = Language.English;
  let board: string[] = randomBoard(language, 5).split('');
  let boardSize = 5;
  let minCharLength = 3;

  const boardWidth = boardWidthFromRequest(request);
  const paramsObject = Object.fromEntries(url.searchParams);

  if (paramsObject.language) {
    language = paramsObject.language;
  }

  if (paramsObject.fixedboard) {
    board = paramsObject.board.split('');
  }

  if (paramsObject.boardSize) {
    boardSize = parseInt(paramsObject.boardSize);
  }

  if (paramsObject.minCharLength) {
    minCharLength = parseInt(paramsObject.minCharLength);
  }

  return {
    board,
    boardWidth,
    boardSize,
    language,
    minCharLength,
  };
};

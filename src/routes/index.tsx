import { Resource, component$ } from '@builder.io/qwik';
import type {
  DocumentHead,
  RequestContext,
  RequestHandler,
} from '@builder.io/qwik-city';
import { useEndpoint } from '@builder.io/qwik-city';
import { Language } from './boggle/logic/api';
import { randomBoard } from './boggle/logic/generateBoard';
import parser from 'ua-parser-js';
import { BoogleRoot } from '~/features/boggle';

export const head: DocumentHead = {
  title: 'Foggle',
  meta: [
    {
      name: 'Foggle Game',
      content: 'Play Foggle',
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
  const paramsObject = Object.fromEntries(url.searchParams);

  let language = Language.English;

  if (paramsObject.language) {
    language = paramsObject.language;
  }

  let board: string[] = randomBoard(language, 5).split('');

  if (paramsObject.fixedboard) {
    board = paramsObject.board.split('');
  }

  let boardSize = 5;

  if (paramsObject.boardSize) {
    boardSize = parseInt(paramsObject.boardSize);
  }

  let minCharLength = 3;

  if (paramsObject.minCharLength) {
    minCharLength = parseInt(paramsObject.minCharLength);
  }

  const boardWidth = boardSizeFromRequest(request);

  return {
    board,
    boardWidth,
    boardSize,
    language,
    minCharLength,
  };
};

export const boardSizeFromRequest = (request: RequestContext) => {
  const userAgent = parser(request.headers.get('user-agent') || '');
  const OS = userAgent.os;
  const isAndroid = OS.name === 'Android';
  const isIOS = OS.name === 'iOS';
  const isMac = OS.name === 'Mac OS';
  const isWindows = OS.name === 'Windows';
  const isChromeOS = OS.name === 'Chrome OS';

  if (isAndroid || isIOS) {
    return 375;
  } else if (isMac || isWindows || isChromeOS) {
    return 400;
  }

  return 0;
};

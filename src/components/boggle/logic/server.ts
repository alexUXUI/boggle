import type { RequestContext } from '@builder.io/qwik-city';
import parser from 'ua-parser-js';
import { Language } from './api';
import { randomBoard } from './board';
import type { ServerData } from '~/routes';

type ReqArgs = {
  url: URL;
  request: RequestContext;
};

export const handleGet = ({ url, request }: ReqArgs): ServerData => {
  let language = Language.English;
  let board = randomBoard(language, 5).split('');
  let boardSize = 5;
  let minCharLength = 3;

  const boardWidth = boardWidthFromRequest(request);
  const paramsObject = Object.fromEntries(url.searchParams);

  if (paramsObject.language) {
    language = paramsObject.language;
  }

  if (paramsObject.board) {
    board = paramsObject.board.split('');
  }

  if (paramsObject.size) {
    boardSize = parseInt(paramsObject.size);
  }

  if (paramsObject.min) {
    minCharLength = parseInt(paramsObject.min);
  }

  return {
    board,
    boardWidth,
    boardSize,
    language,
    minCharLength,
  };
};

export const boardWidthFromRequest = (request: RequestContext) => {
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

import parser from 'ua-parser-js';
import { randomBoard } from './board';
import { Language } from '../models';
import type { LanguageType } from '../models';

export interface ServerData {
  board: string[];
  boardWidth: number;
  boardSize: number;
  language: LanguageType;
  minCharLength: number;
}

type ReqArgs = {
  url: URL;
  request: Request;
};

export const gameConfig = {
  boardSize: 5,
  minCharLength: 3,
  language: Language.English,
};

export const handleGet = ({ url, request }: ReqArgs): ServerData => {
  let language = gameConfig.language;
  let minCharLength = gameConfig.minCharLength;
  let boardSize = gameConfig.boardSize;

  let board = randomBoard(language, boardSize).split('');

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

export const boardWidthFromRequest = (request: Request) => {
  const userAgent = parser(request.headers.get('user-agent') || '');
  const OS = userAgent.os;
  const isAndroid = OS.name === 'Android';
  const isIOS = OS.name === 'iOS';
  const isMac = OS.name === 'Mac OS';
  const isWindows = OS.name === 'Windows';
  const isChromeOS = OS.name === 'Chrome OS';

  if (isAndroid || isIOS) {
    return 350;
  } else if (isMac || isWindows || isChromeOS) {
    return 400;
  }

  return 0;
};

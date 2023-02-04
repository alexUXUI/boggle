import { RequestContext } from '@builder.io/qwik-city';
import parser from 'ua-parser-js';

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

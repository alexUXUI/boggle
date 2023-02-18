import { getDictionary } from './logic/api';

interface MessageData {
  language: string;
  board: string[];
}

let dictionaryCache: string[] = [];

interface ModuleCache {
  isLoaded: boolean;
  module:
    | null
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    | typeof import('~/components/boggle/boggle-solver/pkg/boggle_solver');
}

const moduleCache: ModuleCache = {
  isLoaded: false,
  module: null,
};

onmessage = async (e: MessageEvent<MessageData>) => {
  const { language, board } = e.data;

  let dictionary: string[] = [];
  if (!dictionaryCache.length) {
    dictionary = await getDictionary(language);
    dictionaryCache = dictionary;
  }

  if (!moduleCache.isLoaded || !moduleCache.module) {
    const boggle = await import('./boggle-solver/pkg');
    await boggle.default();
    moduleCache.module = boggle;
    moduleCache.isLoaded = true;
  }

  const answers = await moduleCache.module.run_game(
    dictionaryCache,
    board.flat().join('')
  );

  postMessage({
    dictionary,
    answers,
  });
};

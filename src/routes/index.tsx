import { Resource, component$ } from '@builder.io/qwik';
import { useEndpoint } from '@builder.io/qwik-city';
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import { BoogleRoot } from '~/components/boggle/BoggleRoot';
import { handleGet } from '~/components/boggle/logic/server';

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
      onResolved={(data) => <BoogleRoot data={data} />}
    />
  );
});

export const onGet: RequestHandler<ServerData> = ({ url, request }) => {
  const response = handleGet({ url, request });
  console.log('response', response);
  return response;
};

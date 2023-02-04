import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import wasm from 'vite-plugin-wasm';
import wasmPack from 'vite-plugin-wasm-pack';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity(),
      qwikVite(),
      tsconfigPaths(),
      wasmPack('./src/components/boggle/boggle-solver'),
      wasm(),
    ],
    worker: {
      format: 'es',
      plugins: [wasm(), topLevelAwait()],
    },
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
  };
});

import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import wasmPack from "vite-plugin-wasm-pack";

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity(),
      qwikVite(),
      tsconfigPaths(),
      wasmPack("./src/boggle"),
    ],
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});

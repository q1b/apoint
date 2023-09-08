import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { qwikReact } from "@builder.io/qwik-react/vite";

export default defineConfig(() => {
  return {
    plugins: [qwikCity(), qwikVite(), tsconfigPaths(), qwikReact()],
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
    // alias: {
		//   ".prisma/client/index-browser": "./node_modules/.prisma/client/index-browser.js",
		//   ".prisma/client/index": "./node_modules/.prisma/client/index.js",
		//   "@prisma/client/runtime/library": "./../secondModule/node_modules/@prisma/client/runtime/library.js",
		// }
  };
});

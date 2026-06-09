import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@moca-labs/vue-router-kit-ts": resolve(__dirname, "../src/index.ts"),
    },
    dedupe: ["vue", "vue-router"],
  },
});

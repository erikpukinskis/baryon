import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import macros from "vite-plugin-babel-macros"

const inCodespace = Boolean(process.env.GITHUB_CODESPACE_TOKEN)

export default defineConfig({
  ...(inCodespace
    ? {
        hmr: {
          port: 443,
        },
      }
    : {}),

  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },

  plugins: [react(), macros()],

  build: {
    outDir: "site",
    assetsDir: "./",

    rollupOptions: {
      input: path.resolve(__dirname, "docs", "index.html"),
    },
  },
})

import path from "path"
import { defineConfig } from "vite"
import macros from "vite-plugin-babel-macros"
import react from "@vitejs/plugin-react"

export default defineConfig({
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },

  plugins: [macros(), react()],

  build: {
    rollupOptions: {},
  },
})

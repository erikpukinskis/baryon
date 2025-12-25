import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  test: {
    environment: "jsdom",
  },

  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./app"),
    },
  },

  plugins: [react()],

  build: {
    rollupOptions: {},
  },
})

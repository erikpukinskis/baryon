import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const inCodespace = Boolean(process.env.GITHUB_CODESPACE_TOKEN)

export default defineConfig({
  server: {
    ...(inCodespace
      ? {
          hmr: {
            port: 443,
          },
        }
      : {}),
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

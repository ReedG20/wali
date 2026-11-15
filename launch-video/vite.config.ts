import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { renderServer } from "./scripts/vite-render-server"

export default defineConfig({
  plugins: [react(), renderServer()],
  server: { port: 5190, strictPort: true },
})

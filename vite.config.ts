import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dns from "node:dns";
import path from 'node:path';

dns.setDefaultResultOrder("verbatim");

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  }
})

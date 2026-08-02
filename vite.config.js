import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
   base: 'https://ritualizado.github.io/Prospect-ai/',
});

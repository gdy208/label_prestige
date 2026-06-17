import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

const base = process.env.BASE_URL || '/';

export default defineConfig({
  base,
  plugins: [tailwindcss()],
});

import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  plugins: [
    {
      name: 'copy-static-assets',
      closeBundle() {
        if (fs.existsSync('assets')) {
          fs.cpSync('assets', 'dist/assets', { recursive: true });
        }
        if (fs.existsSync('css')) {
          fs.cpSync('css', 'dist/css', { recursive: true });
        }
      }
    }
  ]
});

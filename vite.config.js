import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`        -> dist/        (GitHub Pages)
// `npm run build:single` -> dist-single/ (one self-contained index.html for quick phone tests)
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'single' ? [viteSingleFile()] : [],
  build: { outDir: mode === 'single' ? 'dist-single' : 'dist' },
  test: { environment: 'jsdom', setupFiles: ['tests/setup.js'] },
}));

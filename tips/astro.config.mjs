import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  site: 'https://alexandrapink.online',
  base: '/tips',
  outDir: '../frontend/dist/tips',
  integrations: [tailwind()],
});

import { defineConfig } from '@rsbuild/core';
import { pluginVue } from '@rsbuild/plugin-vue';
import { pluginTailwindcss } from '@rsbuild/plugin-tailwindcss';
import { pluginTypeCheck } from '@rsbuild/plugin-type-check';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginVue(), pluginTailwindcss(), pluginTypeCheck()],
  server: {
    port: 3000,
  },
});


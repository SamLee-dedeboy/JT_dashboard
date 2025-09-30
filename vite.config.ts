import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tsconfigPaths(), tailwindcss()],
  base: "/jt_dashboard/",
  resolve: {
    alias: {
      'renderers': path.resolve(__dirname, 'src/renderers'),
      'constants': path.resolve(__dirname, 'src/constants'),
      'lib': path.resolve(__dirname, 'src/lib'),
    }
  }
})

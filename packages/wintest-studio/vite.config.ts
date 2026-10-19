import { sveltekit } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
export default defineConfig({ plugins: [sveltekit()], clearScreen: false, server: { port: 1420, strictPort: true } });

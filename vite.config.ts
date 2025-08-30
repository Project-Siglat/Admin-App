import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    port: 2424, // change this to the port you want
    strictPort: true, // (optional) if true, Vite will fail instead of trying next available port
    host: "0.0.0.0"  // (optional) listen on all network interfaces
  }
});

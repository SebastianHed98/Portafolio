import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Set the base to your GitHub repository name for GitHub Pages.
  // If your repo name is different, change '/netflix-clone/' accordingly.
  // If deploying to a user/organization site (username.github.io), set base: '/'
  base: '/netflix-clone/',
  server: {
    open: true,
  },
});

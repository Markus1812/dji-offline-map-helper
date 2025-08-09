import react from '@vitejs/plugin-react';
/* eslint-env node */
import { defineConfig } from 'vite';

// Derive repo name automatically in GitHub Actions for correct Pages base path.
// Locally (no GITHUB_REPOSITORY) it falls back to root '/'.
const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: repoName ? `/${repoName}/` : '/',
})

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 4096,
    // Split big libs into separate chunks so the landing page loads
    // without paying for recharts/lucide that only the journal needs.
    rollupOptions: {
      output: {
        manualChunks: {
          'recharts': ['recharts'],
          'lucide': ['lucide-react'],
          'react': ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
    host: true,
  },
});

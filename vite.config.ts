import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: process.env.GITHUB_PAGES === 'true' ? '/Next-Gen-Toolkit/' : '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
      rolldownOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/pdf-lib') || id.includes('node_modules/pako')) {
              return 'vendor-pdf';
            }
            if (id.includes('node_modules/jszip')) {
              return 'vendor-zip';
            }
            if (
              id.includes('node_modules/qrcode') ||
              id.includes('node_modules/jsonrepair') ||
              id.includes('node_modules/turndown') ||
              id.includes('node_modules/diff')
            ) {
              return 'vendor-codecs';
            }
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('src/data/toolsCatalog')) {
              return 'catalog-data';
            }
            if (id.includes('src/components/ToolWorkspace') || id.includes('src/components/NineZoneSeoContent')) {
              return 'workspace-ui';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

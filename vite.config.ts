import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: process.env.GITHUB_PAGES === 'true' ? '/Next-Gen-Toolkit/' : '/',
    plugins: [react(), tailwindcss()],
    // Local preview and dev servers are reached through proxied hosts (container
    // previews, tunnels), so they accept any Host header. This only affects
    // `vite` and `vite preview` on a developer machine; the production build is
    // static files behind Cloudflare and is unaffected.
    preview: { host: true, allowedHosts: true as const },
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
      host: true,
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

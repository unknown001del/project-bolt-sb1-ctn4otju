import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const isProd = mode === 'production';
  const hmrHost = process.env.VITE_HMR_HOST || 'localhost';
  const usePolling = (process.env.VITE_USE_POLLING || 'false') === 'true';

  return {
    base: isProd ? 'https://nova.com/' : '/',
    plugins: [react()],
    server: {
          host: true,
          port: Number(process.env.PORT) || 5173,
          // Explicit HMR options help when developing inside containers, VMs, or behind proxies.
          hmr: {
            host: hmrHost,
            protocol: 'ws'
          },
          watch: {
            // Enable polling in environments where file events don't work reliably (set VITE_USE_POLLING=true to enable)
            usePolling
          }
        },
    preview: {
      port: Number(process.env.PREVIEW_PORT) || 5173
    }
  };
});

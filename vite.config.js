import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Relative browser URLs must not become the upstream proxy target.
  const apiOrigin = /^https?:\/\//i.test(env.VITE_API_URL || '') ? env.VITE_API_URL : undefined;
  const proxyTarget = (env.VITE_PROXY_TARGET || apiOrigin || "http://localhost:5000").trim().replace(/\/$/, "").replace(/\/api$/, "");

  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['lucide-react', 'framer-motion']
          }
        }
      }
    },
    resolve: {
      alias: {
        '@services': '/src/services',
      },
    },
    server: {
      port: 5173,
      host: true,
      allowedHosts: true,
      proxy: {
        // Allow frontend to call relative "/api" in dev; proxied to backend origin
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});

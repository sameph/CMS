import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { loadEnv } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const API_URL = env.API_URL || "http://localhost:5000";

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/api": {
          target: API_URL,
          changeOrigin: true,
        },
      },
    },
    define: {
      // Expose API_URL to client code directly (without VITE_ prefix)
      "import.meta.env.API_URL": JSON.stringify(API_URL),
    },
    plugins: [
      react(), // you can conditionally add more plugins if needed
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

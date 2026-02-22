import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          "react-vendor": ["react", "react-dom", "react/jsx-runtime"],

          // Ant Design core (largest dependency)
          "antd-core": ["antd"],

          // Ant Design icons (separate chunk as it's large)
          "antd-icons": ["@ant-design/icons"],

          // Redux libraries
          "redux-vendor": ["@reduxjs/toolkit", "react-redux", "redux-persist"],

          // Router
          "router-vendor": ["react-router-dom"],

          // Form libraries
          "form-vendor": ["react-hook-form", "@hookform/resolvers", "zod"],

          // Other utilities
          "utils-vendor": ["moment", "jwt-decode", "sonner"],
        },
      },
    },
  },
});

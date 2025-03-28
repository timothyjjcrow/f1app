const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");
const { resolve } = require("path");

// https://vite.dev/config/
module.exports = defineConfig({
  plugins: [react()],
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "production"
    ),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsDir: "assets",
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  base: "/",
});

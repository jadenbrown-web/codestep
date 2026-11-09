import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The independent browser app shares every lesson and component with Sites.
export default defineConfig({
  root: "standalone",
  base: process.env.CODESTEP_BASE_PATH || "/codestep/",
  publicDir: "../public",
  plugins: [react()],
  build: { outDir: "../pages-dist", emptyOutDir: true },
});

import { defineConfig, globalIgnores } from "eslint/config";
import nextPlugin from "@next/eslint-plugin-next";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default defineConfig([
  ...tsPlugin.configs["flat/recommended"],
  nextPlugin.flatConfig.coreWebVitals,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "src/generated/**"])
]);

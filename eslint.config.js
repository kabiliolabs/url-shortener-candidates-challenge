import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "applications/web/build/**",
      "applications/web/.react-router/**",
      "libs/engine/dist/**",
      "libs/engine/prisma/migrations/**",
      "**/.turbo/**",
      "**/*.tsbuildinfo",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["applications/web/**/*.{ts,tsx}"],
    ...react.configs.flat.recommended,
    settings: {
      react: { version: "detect" },
    },
  },
  {
    files: ["applications/web/**/*.{ts,tsx}"],
    ...react.configs.flat["jsx-runtime"],
  },
  {
    files: ["applications/web/**/*.{ts,tsx}"],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    files: ["applications/web/**/*.{ts,tsx}"],
    ...reactHooks.configs.flat.recommended,
  },
);

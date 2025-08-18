import js from "@eslint/js";
import tseslint from "typescript-eslint";
import nextPlugin from "eslint-config-next";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...nextPlugin(),
  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": process.env.VERCEL ? "warn" : "off",
    },
  },
];

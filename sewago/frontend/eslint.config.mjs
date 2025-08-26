import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/no-unescaped-entities": "off",
      "@next/next/no-img-element": "warn",
      "no-restricted-imports": ["error", {
        "paths": [
          { "name": "mongoose", "message": "DB is backend-only." },
          { "name": "mongodb", "message": "DB is backend-only." },
          { "name": "@prisma/client", "message": "DB is backend-only." },
          { "name": "@/models", "message": "Use frontend DTOs, not DB models." },
          { "name": "@/lib/db", "message": "Backend utility in the frontend." }
        ],
        "patterns": ["**/models/**","**/prisma/**","**/backend/**","**/server/**"]
      }],
      // Prevent server files from importing client modules
      "no-restricted-imports": ["error", {
        "patterns": ["**/*.client.{ts,tsx}"]
      }]
    },
    settings: {},
    files: ["**/*.{ts,tsx,js,jsx}"]
  },
  {
    rules: {
      // Forbid DOM globals in server files only
      "no-restricted-globals": ["error",
        { "name": "document", "message": "DOM on server not allowed" },
        { "name": "window", "message": "DOM on server not allowed" },
        { "name": "navigator", "message": "DOM on server not allowed" },
        { "name": "localStorage", "message": "DOM on server not allowed" }
      ]
    },
    files: ["**/*.{ts,tsx,js,jsx}"]
  },
  {
    rules: {
      "no-restricted-globals": "off"
    },
    files: [
      "**/*.client.*", 
      "src/components/**/*.tsx", 
      "components/**/*.tsx", 
      "**/__tests__/**", 
      "**/*.test.*", 
      "**/*.spec.*",
      "src/contexts/**/*.tsx",
      "src/hooks/**/*.ts",
      "src/providers/**/*.tsx",
      "src/lib/**/*.ts",
      "src/app/**/*.tsx",
      "src/app/**/*.ts"
    ]
  },
  {
    rules: {
      // Allow client files to import other client modules
      "no-restricted-imports": "off"
    },
    files: ["**/*.client.{ts,tsx}"]
  }
];

export default eslintConfig;

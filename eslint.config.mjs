import { defineConfig } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  // 1️⃣ Next.js base configs
  ...nextVitals,
  ...nextTs,

  // 2️⃣ Override rules ONLY for prisma seed
  {
    files: ["prisma/seed.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

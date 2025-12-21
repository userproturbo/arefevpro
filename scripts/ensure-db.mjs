import { execSync } from "node:child_process";

console.log("🔎 Ensuring database is ready...");

try {
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("✅ Database is ready");
} catch (e) {
  console.warn("⚠️ Database not ready. Start Postgres and run:");
  console.warn("   npx prisma migrate deploy");
}

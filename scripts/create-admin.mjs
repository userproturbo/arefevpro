import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const password = "temp";
const passwordHash = await bcrypt.hash(password, 10);

await prisma.user.upsert({
  where: { login: "admin" },
  update: {
    passwordHash,
    role: "ADMIN",
  },
  create: {
    login: "admin",
    passwordHash,
    role: "ADMIN",
    nickname: "Admin",
  },
});

console.log("✅ Admin user created:");
console.log("login: admin");
console.log("password: temp");

await prisma.$disconnect();

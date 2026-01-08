const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const login = "admin";
  const password = "temp";

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { login },
    update: {
      passwordHash,
      role: "ADMIN",
      nickname: "Admin",
    },
    create: {
      login,
      passwordHash,
      role: "ADMIN",
      nickname: "Admin",
      email: null,
    },
  });

  console.log("✅ Admin ready:", {
    id: user.id,
    login: user.login,
    role: user.role,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

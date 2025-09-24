import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "raoanmarcel@gmail.com"; // usuário que você quer tornar admin

  const user = await prisma.users.update({
    where: { email },
    data: { role: "ADMIN" },
  });

  console.log("Usuário atualizado para admin:", user);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());

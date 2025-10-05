import { prisma } from "../prisma";

export async function main() {
  const email = "raoanmarcel@admin.com"; // usuário que você quer tornar admin

  try {
    const user = await prisma.users.update({
      where: { email },
      data: { role: "ADMIN" },
    });
    console.log("Usuário atualizado para admin:", user);
  } catch (e) {
    console.error(e);
    throw e; // mantém o erro propagado para testes ou CLI
  } finally {
    await prisma.$disconnect();
  }
}

// executa apenas se rodar diretamente via `node src/utils/updateAdmin.ts`
if (require.main === module) {
  main();
}
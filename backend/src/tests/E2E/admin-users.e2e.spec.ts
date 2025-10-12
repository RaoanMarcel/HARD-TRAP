import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "../../prisma";
import {
  getUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from "../../services/adminUser.service";
import { Role } from "@prisma/client";
import crypto from "crypto";

// limpa a tabela antes de cada teste
beforeEach(async () => {
  await prisma.users.deleteMany();
});

describe("AdminUserService", () => {
  it("deve listar usuários com filtros", async () => {
    const email = `cliente+${Date.now()}-${crypto.randomUUID()}@example.com`;

    await prisma.users.create({
      data: {
        name: "Cliente Teste",
        email,
        password_hash: "hashedpassword",
        role: Role.CUSTOMER,
      },
    });

    const result = await getUsersService({ role: Role.CUSTOMER });
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].role).toBe(Role.CUSTOMER);
  });

  it("deve buscar usuário por ID", async () => {
    const email = `cliente+${Date.now()}-${crypto.randomUUID()}@example.com`;

    const user = await prisma.users.create({
      data: {
        name: "Cliente Teste",
        email,
        password_hash: "hashedpassword",
        role: Role.CUSTOMER,
      },
    });

    const result = await getUserByIdService(user.id);
    expect(result?.id).toBe(user.id);
    expect(result?.email).toBe(email);
  });

  it("deve atualizar usuário", async () => {
    const email = `update+${Date.now()}-${crypto.randomUUID()}@example.com`;

    const user = await prisma.users.create({
      data: {
        name: "Cliente Update",
        email,
        password_hash: "hashedpassword",
        role: Role.CUSTOMER,
      },
    });

    const updated = await updateUserService(user.id, { role: Role.ADMIN });
    expect(updated.role).toBe(Role.ADMIN);
  });

  it("deve deletar usuário", async () => {
    const email = `delete+${Date.now()}-${crypto.randomUUID()}@example.com`;

    const user = await prisma.users.create({
      data: {
        name: "Cliente Delete",
        email,
        password_hash: "hashedpassword",
        role: Role.CUSTOMER,
      },
    });

    const deleted = await deleteUserService(user.id);
    expect(deleted.id).toBe(user.id);

    const check = await prisma.users.findUnique({ where: { id: user.id } });
    expect(check).toBeNull();
  });
});
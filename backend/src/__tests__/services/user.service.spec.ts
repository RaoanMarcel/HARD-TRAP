import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../prisma";
import {
  getAllUsers,
  getUserByIdService,
  updateUserService,
  deleteUserService,
  generateResetToken,
  resetUserPassword,
} from "../../services/user.service";
import { sendResetPasswordEmail } from "../../utils/mailer";

// 🔹 Mock do Prisma
vi.mock("../../prisma", () => ({
  prisma: {
    users: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
    },
    orders: { findMany: vi.fn(), deleteMany: vi.fn() },
    order_items: { deleteMany: vi.fn() },
    payments: { deleteMany: vi.fn() },
    $transaction: vi.fn((cb) => cb(prisma)),
  },
}));

// 🔹 Mock do mailer
vi.mock("../../utils/mailer", () => ({
  sendResetPasswordEmail: vi.fn(),
}));

// 🔹 Mock do bcrypt (com default export)
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
  },
}));

describe("User Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getAllUsers deve lançar erro se não houver usuários", async () => {
    (prisma.users.findMany as any).mockResolvedValue([]);
    await expect(getAllUsers()).rejects.toThrow("Nenhum usuário encontrado");
  });

  it("getAllUsers deve retornar lista de usuários", async () => {
    (prisma.users.findMany as any).mockResolvedValue([{ id: 1, name: "User", email: "a@a.com", role: "USER" }]);
    const result = await getAllUsers();
    expect(result).toHaveLength(1);
  });

  it("getUserByIdService deve lançar erro se usuário não existir", async () => {
    (prisma.users.findUnique as any).mockResolvedValue(null);
    await expect(getUserByIdService(99)).rejects.toThrow("Usuário não encontrado");
  });

  it("getUserByIdService deve retornar usuário se existir", async () => {
    (prisma.users.findUnique as any).mockResolvedValue({ id: 1, name: "User", email: "a@a.com", role: "USER" });
    const result = await getUserByIdService(1);
    expect(result).toEqual({ id: 1, name: "User", email: "a@a.com", role: "USER" });
  });

  it("updateUserService deve lançar erro se usuário não existir", async () => {
    (prisma.users.findUnique as any).mockResolvedValue(null);
    await expect(updateUserService(1, { name: "Novo" })).rejects.toThrow("Usuário não encontrado");
  });

  it("updateUserService deve lançar erro se role for inválida", async () => {
    (prisma.users.findUnique as any).mockResolvedValue({ id: 1 });
    await expect(updateUserService(1, { role: "INVALID" })).rejects.toThrow("Role inválido");
  });

  it("updateUserService deve atualizar usuário com sucesso", async () => {
    (prisma.users.findUnique as any).mockResolvedValue({ id: 1 });
    (prisma.users.update as any).mockResolvedValue({ id: 1, name: "Novo", email: "a@a.com", role: "USER" });

    const result = await updateUserService(1, { name: "Novo" });
    expect(prisma.users.update).toHaveBeenCalled();
    expect(result).toEqual({ id: 1, name: "Novo", email: "a@a.com", role: "USER" });
  });

  it("deleteUserService deve lançar erro se usuário não existir", async () => {
    (prisma.users.findUnique as any).mockResolvedValue(null);
    await expect(deleteUserService(1, "User")).rejects.toThrow("Usuário não encontrado");
  });

  it("deleteUserService deve lançar erro se nome não confere", async () => {
    (prisma.users.findUnique as any).mockResolvedValue({ id: 1, name: "Outro" });
    await expect(deleteUserService(1, "User")).rejects.toThrow("Nome informado não confere");
  });

  it("deleteUserService deve excluir usuário e entidades relacionadas", async () => {
    (prisma.users.findUnique as any).mockResolvedValue({ id: 1, name: "User" });
    (prisma.orders.findMany as any).mockResolvedValue([{ id: 10 }]);
    (prisma.order_items.deleteMany as any).mockResolvedValue({});
    (prisma.payments.deleteMany as any).mockResolvedValue({});
    (prisma.orders.deleteMany as any).mockResolvedValue({});
    (prisma.users.delete as any).mockResolvedValue({});

    const result = await deleteUserService(1, "User");
    expect(result).toEqual({ message: "Usuário e entidades relacionadas excluídos com sucesso" });
  });

  it("generateResetToken deve lançar erro se usuário não existir", async () => {
    (prisma.users.findUnique as any).mockResolvedValue(null);
    await expect(generateResetToken("a@a.com")).rejects.toThrow("Usuário não encontrado");
  });

  it("generateResetToken deve gerar token e enviar email", async () => {
    (prisma.users.findUnique as any).mockResolvedValue({ id: 1, email: "a@a.com" });
    (prisma.users.update as any).mockResolvedValue({});
    const result = await generateResetToken("a@a.com");
    expect(sendResetPasswordEmail).toHaveBeenCalled();
    expect(result).toEqual({ message: "Email de redefinição enviado" });
  });

  it("resetUserPassword deve lançar erro se token for inválido", async () => {
    (prisma.users.findFirst as any).mockResolvedValue(null);
    await expect(resetUserPassword("invalid", "123")).rejects.toThrow("Token inválido ou expirado");
  });

  it("resetUserPassword deve redefinir senha com sucesso", async () => {
    (prisma.users.findFirst as any).mockResolvedValue({ id: 1 });
    (prisma.users.update as any).mockResolvedValue({});
    const result = await resetUserPassword("valid", "123");
    expect(result).toEqual({ message: "Senha redefinida com sucesso" });
  });
});
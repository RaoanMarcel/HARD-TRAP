import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerUserService, loginUserService } from "../../services/auth.service";
import { prisma } from "../../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 🔹 Mock do Prisma
vi.mock("../../prisma", () => ({
  prisma: {
    users: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// 🔹 Mock do bcrypt e jwt
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));
vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
  },
}));

// 🔹 Mock do logger
vi.mock("../../logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Auth Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------
  // registerUserService
  // -----------------------------
  describe("registerUserService", () => {
    it("deve registrar usuário com sucesso", async () => {
      (prisma.users.findUnique as any).mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue("hashed_password");
      (prisma.users.create as any).mockResolvedValue({
        id: 1,
        name: "Raoan",
        email: "rao@test.com",
      });

      const result = await registerUserService({
        name: "Raoan",
        email: "rao@test.com",
        password: "12345678",
      });

      expect(prisma.users.findUnique).toHaveBeenCalledWith({ where: { email: "rao@test.com" } });
      expect(bcrypt.hash).toHaveBeenCalledWith("12345678", 10);
      expect(prisma.users.create).toHaveBeenCalled();
      expect(result).toEqual({ id: 1, name: "Raoan", email: "rao@test.com" });
    });

    it("deve lançar erro se e-mail já existir", async () => {
      (prisma.users.findUnique as any).mockResolvedValue({ id: 1, email: "rao@test.com" });

      await expect(
        registerUserService({ name: "Raoan", email: "rao@test.com", password: "12345678" })
      ).rejects.toThrow("E-mail já está em uso");
    });

    it("deve lançar erro se Prisma falhar", async () => {
      (prisma.users.findUnique as any).mockRejectedValue(new Error("Erro no banco"));

      await expect(
        registerUserService({ name: "Raoan", email: "rao@test.com", password: "12345678" })
      ).rejects.toThrow("Erro no banco");
    });
  });

  // -----------------------------
  // loginUserService
  // -----------------------------
  describe("loginUserService", () => {
    it("deve logar usuário com sucesso", async () => {
      (prisma.users.findUnique as any).mockResolvedValue({
        id: 1,
        name: "Raoan",
        email: "rao@test.com",
        password_hash: "hashed_password",
        role: "CUSTOMER",
      });
      (bcrypt.compare as any).mockResolvedValue(true);
      (jwt.sign as any).mockReturnValue("fake_jwt_token");

      const result = await loginUserService({ email: "rao@test.com", password: "12345678" });

      expect(prisma.users.findUnique).toHaveBeenCalledWith({ where: { email: "rao@test.com" } });
      expect(bcrypt.compare).toHaveBeenCalledWith("12345678", "hashed_password");
      expect(jwt.sign).toHaveBeenCalled();
      expect(result).toEqual({
        token: "fake_jwt_token",
        user: { id: 1, name: "Raoan", email: "rao@test.com", role: "CUSTOMER" },
      });
    });

    it("deve lançar erro se usuário não existir", async () => {
      (prisma.users.findUnique as any).mockResolvedValue(null);

      await expect(
        loginUserService({ email: "naoexiste@test.com", password: "123456" })
      ).rejects.toThrow("Credenciais inválidas");
    });

    it("deve lançar erro se senha for inválida", async () => {
      (prisma.users.findUnique as any).mockResolvedValue({
        id: 1,
        email: "rao@test.com",
        password_hash: "hashed_password",
      });
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        loginUserService({ email: "rao@test.com", password: "senhaerrada" })
      ).rejects.toThrow("Credenciais inválidas");
    });

    it("deve lançar erro se Prisma falhar", async () => {
      (prisma.users.findUnique as any).mockRejectedValue(new Error("Erro no banco"));

      await expect(
        loginUserService({ email: "rao@test.com", password: "123456" })
      ).rejects.toThrow("Erro no banco");
    });
  });
});
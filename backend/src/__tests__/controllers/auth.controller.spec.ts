import request from "supertest";
import express from "express";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock dos services
vi.mock("../../services/auth.service", () => ({
  registerUserService: vi.fn(),
  loginUserService: vi.fn(),
}));

// 🔹 Mock do validateRequest
vi.mock("../../utils/validation.util", () => ({
  validateRequest: vi.fn(),
}));

import { registerUserService, loginUserService } from "../../services/auth.service";
import { validateRequest } from "../../utils/validation.util";
import { register, login } from "../../controllers/auth.controller";

// Criar app Express para testar endpoints
const app = express();
app.use(express.json());
app.post("/auth/register", register);
app.post("/auth/login", login);

describe("Auth Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("deve registrar usuário com sucesso", async () => {
      (validateRequest as any).mockReturnValue({ name: "User", email: "a@a.com", password: "12345678" });
      (registerUserService as any).mockResolvedValue({ id: 1, name: "User", email: "a@a.com" });

      const res = await request(app).post("/auth/register").send({
        name: "User",
        email: "a@a.com",
        password: "12345678",
      });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({
        message: "Usuário registrado com sucesso",
        user: { id: 1, name: "User", email: "a@a.com" },
      });
      expect(registerUserService).toHaveBeenCalledWith({
        name: "User",
        email: "a@a.com",
        password: "12345678",
      });
    });

    it("deve retornar 400 se validação falhar", async () => {
      (validateRequest as any).mockReturnValue(null);

      const res = await request(app).post("/auth/register").send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        errors: [{ field: "validation", message: "Dados inválidos" }],
      });
    });

    it("deve retornar 400 se service falhar", async () => {
      (validateRequest as any).mockReturnValue({ name: "User", email: "a@a.com", password: "12345678" });
      (registerUserService as any).mockRejectedValue(new Error("Erro interno"));

      const res = await request(app).post("/auth/register").send({
        name: "User",
        email: "a@a.com",
        password: "12345678",
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        errors: [{ field: "server", message: "Erro interno" }],
      });
    });
  });

  describe("login", () => {
    it("deve logar usuário com sucesso", async () => {
      (validateRequest as any).mockReturnValue({ email: "a@a.com", password: "12345678" });
      (loginUserService as any).mockResolvedValue({ token: "jwt_token" });

      const res = await request(app).post("/auth/login").send({
        email: "a@a.com",
        password: "12345678",
      });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "Login realizado com sucesso",
        token: "jwt_token",
      });
      expect(loginUserService).toHaveBeenCalledWith({
        email: "a@a.com",
        password: "12345678",
      });
    });

    it("deve retornar 400 se validação falhar", async () => {
      (validateRequest as any).mockReturnValue(null);

      const res = await request(app).post("/auth/login").send({});

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        errors: [{ field: "validation", message: "Dados inválidos" }],
      });
    });

    it("deve retornar 400 se service falhar", async () => {
      (validateRequest as any).mockReturnValue({ email: "a@a.com", password: "12345678" });
      (loginUserService as any).mockRejectedValue(new Error("Credenciais inválidas"));

      const res = await request(app).post("/auth/login").send({
        email: "a@a.com",
        password: "12345678",
      });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        errors: [{ field: "server", message: "Credenciais inválidas" }],
      });
    });
  });
});
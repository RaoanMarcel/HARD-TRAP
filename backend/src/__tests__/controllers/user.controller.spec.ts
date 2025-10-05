import request from "supertest";
import express from "express";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock do service
vi.mock("../../services/user.service", () => ({
  getAllUsers: vi.fn(),
  getUserByIdService: vi.fn(),
  updateUserService: vi.fn(),
  deleteUserService: vi.fn(),
  generateResetToken: vi.fn(),
  resetUserPassword: vi.fn(),
}));

// 🔹 Mock do validateRequest
vi.mock("../../utils/validation.util", () => ({
  validateRequest: vi.fn(),
}));

import * as userService from "../../services/user.service";
import { validateRequest } from "../../utils/validation.util";
import {
  getUsers,
  getUserById,
  updateUser,
  getUserDeleteConfirmation,
  deleteUser,
  forgotPassword,
  resetPassword,
} from "../../controllers/user.controller";

// Criar app Express para testar endpoints
const app = express();
app.use(express.json());
app.get("/users", getUsers);
app.get("/users/:id", getUserById);
app.put("/users/:id", updateUser);
app.get("/users/:id/delete-confirmation", getUserDeleteConfirmation);
app.delete("/users/:id", deleteUser);
app.post("/users/forgot-password", forgotPassword);
app.post("/users/reset-password", resetPassword);

describe("User Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUsers", () => {
    it("deve retornar lista de usuários", async () => {
      (userService.getAllUsers as any).mockResolvedValue([{ id: 1 }]);

      const res = await request(app).get("/users");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1 }]);
    });

    it("deve retornar 404 se service falhar", async () => {
      (userService.getAllUsers as any).mockRejectedValue(new Error("Nenhum usuário encontrado"));

      const res = await request(app).get("/users");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Nenhum usuário encontrado" });
    });
  });

  describe("getUserById", () => {
    it("deve retornar usuário por ID", async () => {
      (validateRequest as any).mockReturnValue({ id: 1 });
      (userService.getUserByIdService as any).mockResolvedValue({ id: 1, name: "User" });

      const res = await request(app).get("/users/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, name: "User" });
    });

    it("deve retornar 404 se service falhar", async () => {
      (validateRequest as any).mockReturnValue({ id: 1 });
      (userService.getUserByIdService as any).mockRejectedValue(new Error("Usuário não encontrado"));

      const res = await request(app).get("/users/1");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Usuário não encontrado" });
    });
  });

  describe("updateUser", () => {
    it("deve atualizar usuário", async () => {
      (validateRequest as any)
        .mockReturnValueOnce({ id: 1 }) // params
        .mockReturnValueOnce({ name: "Novo" }); // body
      (userService.updateUserService as any).mockResolvedValue({ id: 1, name: "Novo" });

      const res = await request(app).put("/users/1").send({ name: "Novo" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, name: "Novo" });
    });

    it("deve retornar 404 se service falhar", async () => {
      (validateRequest as any)
        .mockReturnValueOnce({ id: 1 })
        .mockReturnValueOnce({ name: "Novo" });
      (userService.updateUserService as any).mockRejectedValue(new Error("Usuário não encontrado"));

      const res = await request(app).put("/users/1").send({ name: "Novo" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Usuário não encontrado" });
    });
  });

  describe("getUserDeleteConfirmation", () => {
    it("deve retornar mensagem de confirmação", async () => {
      (validateRequest as any).mockReturnValue({ id: 1 });
      (userService.getUserByIdService as any).mockResolvedValue({ id: 1, name: "User" });

      const res = await request(app).get("/users/1/delete-confirmation");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message");
      expect(res.body).toHaveProperty("user");
    });

    it("deve retornar 404 se service falhar", async () => {
      (validateRequest as any).mockReturnValue({ id: 1 });
      (userService.getUserByIdService as any).mockRejectedValue(new Error("Usuário não encontrado"));

      const res = await request(app).get("/users/1/delete-confirmation");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Usuário não encontrado" });
    });
  });

  describe("deleteUser", () => {
    it("deve deletar usuário", async () => {
      (validateRequest as any)
        .mockReturnValueOnce({ id: 1 })
        .mockReturnValueOnce({ confirmName: "User" });
      (userService.deleteUserService as any).mockResolvedValue({ message: "Usuário deletado" });

      const res = await request(app).delete("/users/1").send({ confirmName: "User" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Usuário deletado" });
    });

    it("deve retornar 400 se service falhar", async () => {
      (validateRequest as any)
        .mockReturnValueOnce({ id: 1 })
        .mockReturnValueOnce({ confirmName: "User" });
      (userService.deleteUserService as any).mockRejectedValue(new Error("Nome não confere"));

      const res = await request(app).delete("/users/1").send({ confirmName: "User" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Nome não confere" });
    });
  });

  describe("forgotPassword", () => {
    it("deve gerar token de reset", async () => {
      (validateRequest as any).mockReturnValue({ email: "a@a.com" });
      (userService.generateResetToken as any).mockResolvedValue({ message: "Email enviado" });

      const res = await request(app).post("/users/forgot-password").send({ email: "a@a.com" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Email enviado" });
    });

    it("deve retornar 404 se service falhar", async () => {
      (validateRequest as any).mockReturnValue({ email: "a@a.com" });
      (userService.generateResetToken as any).mockRejectedValue(new Error("Usuário não encontrado"));

      const res = await request(app).post("/users/forgot-password").send({ email: "a@a.com" });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Usuário não encontrado" });
    });
  });

  describe("resetPassword", () => {
    it("deve redefinir senha", async () => {
      (validateRequest as any).mockReturnValue({ token: "abc", newPassword: "12345678" });
      (userService.resetUserPassword as any).mockResolvedValue({ message: "Senha redefinida" });

      const res = await request(app).post("/users/reset-password").send({ token: "abc", newPassword: "12345678" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Senha redefinida" });
    });

    it("deve retornar 400 se service falhar", async () => {
      (validateRequest as any).mockReturnValue({ token: "abc", newPassword: "12345678" });
      (userService.resetUserPassword as any).mockRejectedValue(new Error("Token inválido"));

      const res = await request(app).post("/users/reset-password").send({ token: "abc", newPassword: "12345678" });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Token inválido" });
    });
  });
});
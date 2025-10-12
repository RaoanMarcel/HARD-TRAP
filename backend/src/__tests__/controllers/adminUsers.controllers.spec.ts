import request from "supertest";
import express from "express";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock dos services
vi.mock("../../services/adminUser.service", () => ({
  getUsersService: vi.fn(),
  getUserByIdService: vi.fn(),
  updateUserService: vi.fn(),
  deleteUserService: vi.fn(),
}));

// 🔹 Mock do validateRequest
vi.mock("../../utils/validation.util", () => ({
  validateRequest: vi.fn(),
}));

import {
  getUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from "../../services/adminUser.service";
import { validateRequest } from "../../utils/validation.util";
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../../controllers/adminUser.controller";

// Criar app Express para testar endpoints
const app = express();
app.use(express.json());
app.get("/admin/users", getUsers);
app.get("/admin/users/:id", getUserById);
app.put("/admin/users/:id", updateUser);
app.delete("/admin/users/:id", deleteUser);

describe("AdminUsersController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve listar usuários", async () => {
    (getUsersService as any).mockResolvedValue([
      { id: 1, name: "User", email: "a@a.com", role: "CUSTOMER" },
    ]);

    const res = await request(app).get("/admin/users");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      { id: 1, name: "User", email: "a@a.com", role: "CUSTOMER" },
    ]);
  });

  it("deve buscar usuário por ID", async () => {
    (getUserByIdService as any).mockResolvedValue({
      id: 1,
      name: "User",
      email: "a@a.com",
      role: "CUSTOMER",
    });

    const res = await request(app).get("/admin/users/1");

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("a@a.com");
  });

  it("deve retornar 404 se usuário não encontrado", async () => {
    (getUserByIdService as any).mockResolvedValue(null);

    const res = await request(app).get("/admin/users/99");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "Usuário não encontrado" });
  });

  it("deve atualizar usuário", async () => {
    (validateRequest as any).mockReturnValue({ role: "ADMIN" });
    (updateUserService as any).mockResolvedValue({
      id: 1,
      name: "User",
      email: "a@a.com",
      role: "ADMIN",
    });

    const res = await request(app)
      .put("/admin/users/1")
      .send({ role: "ADMIN" });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe("ADMIN");
  });

  it("deve deletar usuário", async () => {
    (deleteUserService as any).mockResolvedValue({ id: 1 });

    const res = await request(app).delete("/admin/users/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "Usuário deletado com sucesso",
    });
  });
});
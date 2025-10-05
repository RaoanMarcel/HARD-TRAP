import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// 🔹 mocks primeiro
vi.mock("../../middlewares/auth.middleware", () => ({
  authenticate: (req: any, res: any, next: any) => {
    (req as any).user = { id: 1, role: "ADMIN" }; // simula admin autenticado
    next();
  },
  isAdmin: (req: any, res: any, next: any) => next(),
}));

vi.mock("../../middlewares/rateLimiter", () => ({
  forgotPasswordLimiter: (req: any, res: any, next: any) => next(),
}));

vi.mock("../../controllers/user.controller", () => {
  return {
    getUsers: vi.fn((req: any, res: any) =>
      res.status(200).json([{ id: 1, name: "User 1" }])
    ),
    getUserById: vi.fn((req: any, res: any) =>
      res.status(200).json({ id: req.params.id, name: "User X" })
    ),
    updateUser: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Usuário atualizado" })
    ),
    deleteUser: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Usuário deletado" })
    ),
    getUserDeleteConfirmation: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Confirmação de deleção" })
    ),
    forgotPassword: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Email de recuperação enviado" })
    ),
    resetPassword: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Senha redefinida" })
    ),
  };
});

vi.mock("../../controllers/auth.controller", () => {
  return {
    register: vi.fn((req: any, res: any) =>
      res.status(201).json({ message: "Usuário registrado" })
    ),
  };
});

// importa os mocks para usar nos expects
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserDeleteConfirmation,
  forgotPassword,
  resetPassword,
} from "../../controllers/user.controller";
import { register } from "../../controllers/auth.controller";

// só agora importa o router
import userRoutes from "../../routes/user.routes";

const app = express();
app.use(express.json());
app.use("/users", userRoutes);

describe("User Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /users deve chamar register", async () => {
    const res = await request(app).post("/users").send({ email: "test@test.com" });
    expect(res.status).toBe(201);
    expect(register).toHaveBeenCalled();
  });

  it("GET /users deve chamar getUsers", async () => {
    const res = await request(app).get("/users");
    expect(res.status).toBe(200);
    expect(getUsers).toHaveBeenCalled();
  });

  it("GET /users/:id deve chamar getUserById", async () => {
    const res = await request(app).get("/users/123");
    expect(res.status).toBe(200);
    expect(getUserById).toHaveBeenCalled();
  });

  it("PUT /users/:id deve chamar updateUser", async () => {
    const res = await request(app).put("/users/123").send({ name: "Novo Nome" });
    expect(res.status).toBe(200);
    expect(updateUser).toHaveBeenCalled();
  });

  it("GET /users/:id/confirm-delete deve chamar getUserDeleteConfirmation", async () => {
    const res = await request(app).get("/users/123/confirm-delete");
    expect(res.status).toBe(200);
    expect(getUserDeleteConfirmation).toHaveBeenCalled();
  });

  it("DELETE /users/:id deve chamar deleteUser", async () => {
    const res = await request(app).delete("/users/123");
    expect(res.status).toBe(200);
    expect(deleteUser).toHaveBeenCalled();
  });

  it("POST /users/forgot-password deve chamar forgotPassword", async () => {
    const res = await request(app).post("/users/forgot-password").send({ email: "test@test.com" });
    expect(res.status).toBe(200);
    expect(forgotPassword).toHaveBeenCalled();
  });
});
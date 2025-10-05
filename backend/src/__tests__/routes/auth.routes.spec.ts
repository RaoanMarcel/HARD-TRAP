import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// 🔹 mocks primeiro
vi.mock("../../middlewares/rateLimiter", () => ({
  loginLimiter: (req: any, res: any, next: any) => next(),
}));

vi.mock("../../controllers/auth.controller", () => {
  return {
    register: vi.fn((req: any, res: any) =>
      res.status(201).json({ message: "Usuário registrado" })
    ),
    login: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Login efetuado" })
    ),
  };
});

// importa os mocks para usar nos expects
import { register, login } from "../../controllers/auth.controller";

// só agora importa o router
import authRoutes from "../../routes/auth.routes";

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);

describe("Auth Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /auth/register deve chamar register", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: "test@test.com", password: "123456" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Usuário registrado");
    expect(register).toHaveBeenCalled();
  });

  it("POST /auth/login deve chamar login", async () => {
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "test@test.com", password: "123456" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login efetuado");
    expect(login).toHaveBeenCalled();
  });
});
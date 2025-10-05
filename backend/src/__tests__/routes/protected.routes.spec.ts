import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// 🔹 mocks primeiro
vi.mock("../../middlewares/auth.middleware", () => {
  return {
    authMiddleware: vi.fn((req: any, res: any, next: any) => {
      // por padrão, simula usuário autenticado comum
      (req as any).user = { id: 1, name: "Raoan", role: "USER" };
      next();
    }),
    authorize: (roles: string[]) =>
      vi.fn((req: any, res: any, next: any) => {
        if (req.user && roles.includes(req.user.role)) {
          return next();
        }
        return res.status(403).json({ error: "Acesso negado" });
      }),
  };
});

// importa os mocks para usar nos expects
import { authMiddleware, authorize } from "../../middlewares/auth.middleware";

// só agora importa o router
import protectedRoutes from "../../routes/protected.routes";

const app = express();
app.use(express.json());
app.use("/protected", protectedRoutes);

describe("Protected Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /protected/me deve retornar usuário autenticado", async () => {
    const res = await request(app).get("/protected/me");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Você está autenticado!");
    expect(res.body.user).toEqual({ id: 1, name: "Raoan", role: "USER" });
    expect(authMiddleware).toHaveBeenCalled();
  });

  it("GET /protected/admin deve negar acesso se não for ADMIN", async () => {
    const res = await request(app).get("/protected/admin");

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Acesso negado");
  });

  it("GET /protected/admin deve permitir acesso se for ADMIN", async () => {
    // força o authMiddleware a setar role ADMIN
    (authMiddleware as any).mockImplementationOnce((req: any, res: any, next: any) => {
      (req as any).user = { id: 1, name: "Raoan", role: "ADMIN" };
      next();
    });

    const res = await request(app).get("/protected/admin");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Bem-vindo, admin!");
  });
});
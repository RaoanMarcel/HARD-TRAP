import { describe, it, expect, vi, beforeEach, beforeAll } from "vitest";
import { adminAuth } from "../../middlewares/adminAuth.middleware";
import { verify } from "jsonwebtoken"; // 🔹 importa a função usada no middleware

let mockFindUnique: any;

vi.mock("@prisma/client", () => {
  return {
    PrismaClient: vi.fn(() => ({
      users: {
        findUnique: (...args: any[]) => mockFindUnique(...args),
      },
    })),
  };
});

vi.mock("jsonwebtoken", () => ({
  verify: vi.fn(), // 🔹 mocka a função verify
}));

describe("adminAuth middleware", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeAll(() => {
    process.env.JWT_SECRET = "test-secret";
  });

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();

    mockFindUnique = vi.fn();
    vi.clearAllMocks();
  });

  it("deve retornar 401 se token ausente", async () => {
    await adminAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token ausente" });
  });

  it("deve retornar 401 se token inválido", async () => {
    req.headers.authorization = "Bearer invalid";
    (verify as any).mockImplementation(() => {
      throw new Error("invalid");
    });

    await adminAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido" });
  });

  it("deve retornar 403 se usuário não encontrado", async () => {
    req.headers.authorization = "Bearer valid";
    (verify as any).mockReturnValue({ userId: 1 });
    mockFindUnique.mockResolvedValue(null);

    await adminAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Acesso negado" });
  });

  it("deve retornar 403 se usuário não for ADMIN", async () => {
    req.headers.authorization = "Bearer valid";
    (verify as any).mockReturnValue({ userId: 1 });
    mockFindUnique.mockResolvedValue({ id: 1, role: "USER" });

    await adminAuth(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Acesso negado" });
  });

  it("deve chamar next() se usuário for ADMIN", async () => {
    req.headers.authorization = "Bearer valid";
    (verify as any).mockReturnValue({ userId: 1 });
    mockFindUnique.mockResolvedValue({ id: 1, role: "ADMIN" });

    await adminAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 1, role: "ADMIN" });
  });
});
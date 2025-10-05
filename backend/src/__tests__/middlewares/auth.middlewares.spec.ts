import { describe, it, expect, vi, beforeEach } from "vitest";
import { authMiddleware, authenticate, authorize, isAdmin, AuthRequest } from "../../middlewares/auth.middleware";
import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

describe("authMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = { headers: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("deve retornar 401 se não houver header de autorização", () => {
    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token não fornecido" });
  });

  it("deve retornar 401 se o token for inválido (sem Bearer)", () => {
    req.headers = { authorization: "invalid" };
    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("deve adicionar user ao req se token for válido", () => {
    req.headers = { authorization: "Bearer validtoken" };
    (jwt.verify as any).mockReturnValue({ userId: 1, email: "test@test.com", role: Role.ADMIN });

    authMiddleware(req as Request, res as Response, next);

    expect((req as AuthRequest).user).toEqual({ userId: 1, email: "test@test.com", role: Role.ADMIN });
    expect(next).toHaveBeenCalled();
  });

  it("deve retornar 403 se o token for inválido ou expirado", () => {
    req.headers = { authorization: "Bearer invalid" };
    (jwt.verify as any).mockImplementation(() => {
      throw new Error("invalid");
    });

    authMiddleware(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: "Token inválido ou expirado" });
  });
});

describe("authorize middleware", () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it("deve negar acesso se não houver usuário", () => {
    authorize([Role.ADMIN])(req as AuthRequest, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("deve negar acesso se usuário não tiver o papel correto", () => {
    req.user = { userId: 1, email: "x", role: Role.CUSTOMER };
    authorize([Role.ADMIN])(req as AuthRequest, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("deve permitir acesso se usuário tiver o papel correto", () => {
    req.user = { userId: 1, email: "x", role: Role.ADMIN };
    authorize([Role.ADMIN])(req as AuthRequest, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});

describe("isAdmin middleware", () => {
  let req: Partial<AuthRequest>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();
  });

  it("deve negar acesso se usuário não for admin", () => {
    req.user = { userId: 1, email: "x", role: Role.CUSTOMER };
    isAdmin(req as AuthRequest, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("deve permitir acesso se usuário for admin", () => {
    req.user = { userId: 1, email: "x", role: Role.ADMIN };
    isAdmin(req as AuthRequest, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
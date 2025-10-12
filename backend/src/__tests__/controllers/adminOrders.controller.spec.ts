import { describe, it, expect, vi, beforeEach } from "vitest";
import { register, login } from "../../controllers/auth.controller";
import * as authService from "../../services/auth.service";
import * as validation from "../../utils/validation.util";

describe("AuthController", () => {
  let req: any;
  let res: any;

  beforeEach(() => {
    req = { body: {} };
    res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
    vi.clearAllMocks();
  });

  it("deve registrar usuário com sucesso", async () => {
    vi.spyOn(validation, "validateRequest").mockReturnValue({
      name: "User",
      email: "a@a.com",
      password: "123456",
    });
    vi.spyOn(authService, "registerUserService").mockResolvedValue({
      id: 1,
      name: "User",
      email: "a@a.com",
    });

    await register(req, res);

    expect(authService.registerUserService).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Usuário registrado com sucesso",
      user: { id: 1, name: "User", email: "a@a.com" },
    });
  });

  it("deve retornar 400 se validação falhar no registro", async () => {
    vi.spyOn(validation, "validateRequest").mockReturnValue(null);

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: [{ field: "validation", message: "Dados inválidos" }],
    });
  });

  it("deve logar usuário com sucesso", async () => {
    vi.spyOn(validation, "validateRequest").mockReturnValue({
      email: "a@a.com",
      password: "123456",
    });
    vi.spyOn(authService, "loginUserService").mockResolvedValue({
      token: "jwt_token",
      user: { id: 1, name: "User", email: "a@a.com", role: "CUSTOMER" },
    });

    await login(req, res);

    expect(authService.loginUserService).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Login realizado com sucesso",
      token: "jwt_token",
    });
  });

  it("deve retornar 400 se validação falhar no login", async () => {
    vi.spyOn(validation, "validateRequest").mockReturnValue(null);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      errors: [{ field: "validation", message: "Dados inválidos" }],
    });
  });
});
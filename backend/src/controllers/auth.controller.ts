import { Request, Response } from "express";
import Joi from "joi";
import { registerUserService, loginUserService } from "../services/auth.service";
import { validateRequest } from "../utils/validation.util";

// 🔹 Schemas de validação com Joi
const registerSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Nome é obrigatório",
    "any.required": "Nome é obrigatório",
  }),
  email: Joi.string().trim().email({ tlds: { allow: false } }).required().messages({
    "string.email": "Formato de e-mail inválido",
    "string.empty": "E-mail é obrigatório",
    "any.required": "E-mail é obrigatório",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "A senha deve ter pelo menos 8 caracteres",
    "string.empty": "Senha é obrigatória",
    "any.required": "Senha é obrigatória",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email({ tlds: { allow: false } }).required().messages({
    "string.email": "Formato de e-mail inválido",
    "string.empty": "E-mail é obrigatório",
    "any.required": "E-mail é obrigatório",
  }),
  password: Joi.string().min(1).required().messages({
    "string.empty": "Senha é obrigatória",
    "any.required": "Senha é obrigatória",
  }),
});

// 🔹 Registrar usuário
export const register = async (req: Request, res: Response) => {
  const validated = validateRequest(registerSchema, req, res);
  if (!validated) {
    return res.status(400).json({
      success: false,
      errors: [{ field: "validation", message: "Dados inválidos" }],
    });
  }

  try {
    const user = await registerUserService(validated);
    res.status(201).json({
      message: "Usuário registrado com sucesso",
      user,
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      errors: [{ field: "server", message: err.message || "Erro ao registrar usuário" }],
    });
  }
};

// 🔹 Login de usuário
// 🔹 Login de usuário
export const login = async (req: Request, res: Response) => {
  const validated = validateRequest(loginSchema, req, res);
  if (!validated) {
    return res.status(400).json({
      success: false,
      errors: [{ field: "validation", message: "Dados inválidos" }],
    });
  }

  try {
    const result = await loginUserService(validated);
    res.status(200).json({
      message: "Login realizado com sucesso",
      token: result.token, // 🔹 devolve só o token
    });
  } catch (err: any) {
    res.status(400).json({
      success: false,
      errors: [{ field: "server", message: err.message || "Erro ao realizar login" }],
    });
  }
};
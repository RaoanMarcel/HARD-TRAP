import { Request, Response } from "express";
import Joi from "joi";
import * as userService from "../services/user.service";
import { validateRequest } from "../utils/validation.util";

// 🔹 Schemas Joi
const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "ID deve ser um número",
    "number.positive": "ID deve ser positivo",
    "any.required": "ID é obrigatório",
  }),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(1).optional().messages({
    "string.empty": "Nome não pode estar vazio",
  }),
  email: Joi.string().email().optional().messages({
    "string.email": "E-mail inválido",
  }),
  password: Joi.string().min(8).optional().messages({
    "string.min": "A senha deve ter pelo menos 8 caracteres",
  }),
});

const deleteUserSchema = Joi.object({
  confirmName: Joi.string().required().messages({
    "string.empty": "confirmName é obrigatório",
    "any.required": "confirmName é obrigatório",
  }),
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "E-mail inválido",
    "any.required": "E-mail é obrigatório",
  }),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "string.empty": "Token é obrigatório",
    "any.required": "Token é obrigatório",
  }),
  newPassword: Joi.string().min(8).required().messages({
    "string.min": "A nova senha deve ter pelo menos 8 caracteres",
    "any.required": "Nova senha é obrigatória",
  }),
});

// 🔹 Buscar todos os usuários
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

// 🔹 Buscar usuário por ID
export const getUserById = async (req: Request, res: Response) => {
  const params = validateRequest(idParamSchema, req, res, "params");
  if (!params) return;

  try {
    const user = await userService.getUserByIdService(params.id);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

// 🔹 Atualizar usuário
export const updateUser = async (req: Request, res: Response) => {
  const params = validateRequest(idParamSchema, req, res, "params");
  if (!params) return;

  const body = validateRequest(updateUserSchema, req, res);
  if (!body) return;

  try {
    const user = await userService.updateUserService(params.id, body);
    res.json(user);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

// 🔹 Confirmação de delete
export const getUserDeleteConfirmation = async (req: Request, res: Response) => {
  const params = validateRequest(idParamSchema, req, res, "params");
  if (!params) return;

  try {
    const user = await userService.getUserByIdService(params.id);
    const message = `Deseja realmente excluir o usuário "${user.name}" (id: ${user.id})? Envie { "confirmName": "${user.name}" } no body para confirmar.`;
    res.json({ message, user });
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

// 🔹 Deletar usuário
export const deleteUser = async (req: Request, res: Response) => {
  const params = validateRequest(idParamSchema, req, res, "params");
  if (!params) return;

  const body = validateRequest(deleteUserSchema, req, res);
  if (!body) return;

  try {
    const result = await userService.deleteUserService(params.id, body.confirmName);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// 🔹 Esqueci minha senha
export const forgotPassword = async (req: Request, res: Response) => {
  const body = validateRequest(forgotPasswordSchema, req, res);
  if (!body) return;

  try {
    const result = await userService.generateResetToken(body.email);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
};

// 🔹 Redefinir senha
export const resetPassword = async (req: Request, res: Response) => {
  const body = validateRequest(resetPasswordSchema, req, res);
  if (!body) return;

  try {
    const result = await userService.resetUserPassword(body.token, body.newPassword);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

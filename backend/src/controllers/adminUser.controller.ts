import { Request, Response } from "express";
import Joi from "joi";
import {
  getUsersService,
  getUserByIdService,
  updateUserService,
  deleteUserService,
} from "../services/adminUser.service";
import { validateRequest } from "../utils/validation.util";
import { Role } from "@prisma/client";

// Schema de atualização
const updateUserSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid("CUSTOMER", "ADMIN").optional(),
});

// Listar usuários
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, email, name, skip, take } = req.query;

    const users = await getUsersService({
      role: role ? (role as Role) : undefined,
      email: email as string,
      name: name as string,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
    });

    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao listar usuários", details: err.message });
  }
};

// Buscar usuário por ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = await getUserByIdService(id);
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao buscar usuário", details: err.message });
  }
};

// Atualizar usuário
export const updateUser = async (req: Request, res: Response) => {
  const validated = validateRequest(updateUserSchema, req, res);
  if (!validated) return;

  try {
    const id = Number(req.params.id);
    const { name, email, role } = validated;

    const updated = await updateUserService(id, {
      name,
      email,
      role: role ? (role as Role) : undefined,
    });

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao atualizar usuário", details: err.message });
  }
};

// Deletar usuário
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await deleteUserService(id);
    res.json({ success: true, message: "Usuário deletado com sucesso" });
  } catch (err: any) {
    res.status(500).json({ error: "Erro ao deletar usuário", details: err.message });
  }
};
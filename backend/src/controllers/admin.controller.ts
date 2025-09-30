import { Request, Response } from "express";
import Joi from "joi";
import {
  createProductService,
  updateProductStockService,
  getActiveProductsService,
  getAllProductsService
} from "../services/admin.service";
import { validateRequest } from "../utils/validation.util";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// 🔹 Schema de validação para criar produto
const createProductSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.empty": "Nome é obrigatório",
    "any.required": "Nome é obrigatório",
  }),
  description: Joi.string().trim().allow("").optional(),
  price: Joi.number().positive().required().messages({
    "number.base": "Preço deve ser um número",
    "number.positive": "Preço deve ser positivo",
    "any.required": "Preço é obrigatório",
  }),
  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "Estoque deve ser um número",
    "number.integer": "Estoque deve ser um número inteiro",
    "number.min": "Estoque não pode ser negativo",
    "any.required": "Estoque é obrigatório",
  }),
});

// 🔹 Schema de validação para atualizar estoque
const updateStockSchema = Joi.object({
  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "Estoque deve ser um número",
    "number.integer": "Estoque deve ser um número inteiro",
    "number.min": "Estoque não pode ser negativo",
    "any.required": "Estoque é obrigatório",
  }),
});

// 🔹 Criar produto
export const createProduct = async (req: MulterRequest, res: Response) => {
  const validated = validateRequest(createProductSchema, req, res);
  if (!validated) return;

  try {
    const product = await createProductService({
      ...validated,
      filePath: req.file?.path,
    });
    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({ success: false, errors: [{ field: "server", message: err.message || "Erro ao criar produto" }] });
  }
};

// 🔹 Atualizar estoque
export const updateProductStock = async (req: Request, res: Response) => {
  const validated = validateRequest(updateStockSchema, req, res);
  if (!validated) return;

  try {
    const product = await updateProductStockService(Number(req.params.id), validated.stock);
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ success: false, errors: [{ field: "server", message: err.message || "Erro ao atualizar estoque" }] });
  }
};

// 🔹 Listar produtos ativos (sem validação)
export const getActiveProducts = async (_: Request, res: Response) => {
  try {
    const products = await getActiveProductsService();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ success: false, errors: [{ field: "server", message: err.message || "Erro ao buscar produtos ativos" }] });
  }
};

// 🔹 Listar todos os produtos (sem validação)
export const getAllProducts = async (_: Request, res: Response) => {
  try {
    const products = await getAllProductsService();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ success: false, errors: [{ field: "server", message: err.message || "Erro ao buscar produtos" }] });
  }
};

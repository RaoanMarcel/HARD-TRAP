import { Request, Response } from "express";
import Joi from "joi";
import {
  createProductService,
  uploadProductImageService,
  getProductsService,
  getProductByIdService,
  decrementStockService,
  deleteProductService
} from "../services/product.service";
import { validateRequest } from "../utils/validation.util";

// 🔹 Schemas Joi
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

const uploadProductImageSchema = Joi.object({
  productId: Joi.number().integer().positive().required().messages({
    "number.base": "ID do produto deve ser numérico",
    "number.integer": "ID do produto deve ser inteiro",
    "number.positive": "ID do produto deve ser positivo",
    "any.required": "ID do produto é obrigatório",
  }),
});

const updateStockSchema = Joi.object({
  quantity: Joi.number().integer().positive().required().messages({
    "number.base": "Quantidade deve ser numérica",
    "number.integer": "Quantidade deve ser inteira",
    "number.positive": "Quantidade deve ser maior que 0",
    "any.required": "Quantidade é obrigatória",
  }),
});

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    "number.base": "ID deve ser numérico",
    "number.integer": "ID deve ser inteiro",
    "number.positive": "ID deve ser positivo",
    "any.required": "ID é obrigatório",
  }),
});

// 🔹 Criar produto
export const createProduct = async (req: Request, res: Response) => {
  const validated = validateRequest(createProductSchema, req, res);
  if (!validated) return;

  try {
    const product = await createProductService(validated);
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ success: false, errors: [{ field: "server", message: err.message }] });
  }
};

// 🔹 Upload de imagem do produto
export const uploadProductImage = async (req: Request, res: Response) => {
  const validated = validateRequest(uploadProductImageSchema, req, res);
  if (!validated) return;

  try {
    const file = (req as any).file as Express.Multer.File | undefined;
    const product = await uploadProductImageService(validated.productId, file?.path || "");
    res.status(200).json({ message: "Imagem enviada com sucesso", product });
  } catch (err: any) {
    res.status(400).json({ success: false, errors: [{ field: "server", message: err.message }] });
  }
};

// 🔹 Listar produtos
export const getProducts = async (_: Request, res: Response) => {
  try {
    const products = await getProductsService();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ success: false, errors: [{ field: "server", message: err.message }] });
  }
};

// 🔹 Buscar produto por ID
export const getProductById = async (req: Request, res: Response) => {
  const validated = validateRequest(idParamSchema, req, res, "params");
  if (!validated) return;

  try {
    const product = await getProductByIdService(validated.id);
    res.json(product);
  } catch (err: any) {
    res.status(404).json({ success: false, errors: [{ field: "server", message: err.message }] });
  }
};

// 🔹 Atualizar estoque
export const updateStock = async (req: Request, res: Response) => {
  const idValidated = validateRequest(idParamSchema, req, res, "params");
  if (!idValidated) return;

  const bodyValidated = validateRequest(updateStockSchema, req, res);
  if (!bodyValidated) return;

  try {
    await decrementStockService({ productId: idValidated.id, quantity: bodyValidated.quantity });
    res.json({ message: "Estoque atualizado com sucesso" });
  } catch (err: any) {
    res.status(400).json({ success: false, errors: [{ field: "server", message: err.message }] });
  }
};

// 🔹 Deletar produto
export const deleteProduct = async (req: Request, res: Response) => {
  const validated = validateRequest(idParamSchema, req, res, "params");
  if (!validated) return;

  try {
    await deleteProductService(validated.id);
    res.json({ message: "Produto deletado com sucesso" });
  } catch (err: any) {
    res.status(500).json({ success: false, errors: [{ field: "server", message: err.message }] });
  }
};

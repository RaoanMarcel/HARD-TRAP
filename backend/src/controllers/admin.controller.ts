import { Request, Response } from "express";
import Joi from "joi";
import {
  createProductService,
  updateProductStockService,
  getAllProductsService,
} from "../services/admin.service";
import { validateRequest } from "../utils/validation.util";

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// 🔹 Schema para criação de produto
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
  stock: Joi.number().integer().min(0).default(0).messages({
    "number.base": "Estoque deve ser um número",
    "number.integer": "Estoque deve ser um número inteiro",
    "number.min": "Estoque não pode ser negativo",
  }),
});

// 🔹 Schema para atualização de estoque
const updateStockSchema = Joi.object({
  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "Estoque deve ser um número",
    "number.integer": "Estoque deve ser um número inteiro",
    "number.min": "Estoque não pode ser negativo",
    "any.required": "Estoque é obrigatória",
  }),
});

// 🔹 Criar produto
export const createProduct = async (req: MulterRequest, res: Response) => {
  const validated = validateRequest(createProductSchema, req, res);
  if (!validated) {
    throw new Error("Dados inválidos"); // necessário para testes que esperam throw
  }

  try {
    const product = await createProductService({
      ...validated,
      stock: validated.stock ?? 0,
      filePath: req.file?.path, // o service agora faz o upload
    });

    res.status(201).json(product);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      errors: [
        {
          field: "server",
          message: err.message || "Erro ao criar produto",
        },
      ],
    });
  }
};

// 🔹 Atualizar estoque
export const updateProductStock = async (req: Request, res: Response) => {
  const validated = validateRequest(updateStockSchema, req, res);
  if (!validated) return;

  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    const updatedProduct = await updateProductStockService(id, validated.stock);

    res.json(updatedProduct);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      errors: [
        {
          field: "server",
          message: err.message || "Erro ao atualizar estoque",
        },
      ],
    });
  }
};

// 🔹 Listar todos os produtos
export const getAllProducts = async (_: Request, res: Response) => {
  try {
    const products = await getAllProductsService();
    res.json(products);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      errors: [
        {
          field: "server",
          message: err.message || "Erro ao buscar produtos",
        },
      ],
    });
  }
};

// 🔹 Listar produtos ativos (filtra stock > 0)
// 🔹 Listar produtos ativos (filtra stock > 0)
export const getActiveProducts = async (_: Request, res: Response) => {
  try {
    const products = (await getAllProductsService()).filter((p: { stock: number }) => p.stock > 0);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      errors: [
        {
          field: "server",
          message: err.message || "Erro ao buscar produtos ativos",
        },
      ],
    });
  }
};
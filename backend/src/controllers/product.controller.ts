import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: "Nome e preço são obrigatórios" });
    }

    const product = await prisma.product.create({
      data: { name, description, price, stock: stock || 0 },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar produto" });
  }
};

export async function decrementStock(productId: number, quantity: number) {
  const updated = await prisma.product.updateMany({
    where: {
      id: productId,
      stock: { gte: quantity },
    },
    data: {
      stock: { decrement: quantity },
    },
  });

  if (updated.count === 0) {
    throw new Error("Estoque insuficiente para este produto");
  }
}

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: "Quantidade inválida" });
    }

    await decrementStock(Number(id), quantity);

    res.json({ message: "Estoque atualizado com sucesso" });
  } catch (error: any) {
    console.error(error);
    res.status(400).json({ error: error.message || "Erro ao atualizar estoque" });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Produto deletado com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao deletar produto" });
  }
};

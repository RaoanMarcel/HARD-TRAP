import { prisma } from "../prisma";
import { uploadImageToCloudinary } from "../utils/imageUpload";

interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  stock?: number;
}

interface UpdateStockInput {
  productId: number;
  quantity: number;
}

export const createProductService = async (data: CreateProductInput) => {
  const { name, description, price, stock } = data;

  console.info("[createProductService] Iniciando criação de produto", { name, price, stock });

  if (!name || price == null) {
    console.warn("[createProductService] Falha na validação: Nome e preço são obrigatórios");
    throw new Error("Nome e preço são obrigatórios");
  }

  const product = await prisma.product.create({
    data: { name, description, price, stock: stock || 0 },
  });

  console.info("[createProductService] Produto criado com sucesso", { productId: product.id });
  return product;
};

export const uploadProductImageService = async (productId: number, filePath: string) => {
  console.info("[uploadProductImageService] Iniciando upload de imagem", { productId, filePath });

  if (!filePath) {
    console.error("[uploadProductImageService] Nenhum arquivo enviado");
    throw new Error("Nenhum arquivo enviado");
  }
  if (!productId) {
    console.error("[uploadProductImageService] ID do produto não fornecido");
    throw new Error("ID do produto é obrigatório");
  }

  const imageUrl = await uploadImageToCloudinary(filePath);
  console.info("[uploadProductImageService] Upload realizado com sucesso", { imageUrl });

  const product = await prisma.product.update({
    where: { id: productId },
    data: { imageUrl },
  });

  console.info("[uploadProductImageService] Produto atualizado com imagem", { productId });
  return product;
};

export const getProductsService = async () => {
  console.info("[getProductsService] Buscando lista de produtos");
  const products = await prisma.product.findMany();
  console.info("[getProductsService] Produtos encontrados", { count: products.length });
  return products;
};

export const getProductByIdService = async (id: number) => {
  console.info("[getProductByIdService] Buscando produto", { productId: id });
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    console.warn("[getProductByIdService] Produto não encontrado", { productId: id });
    throw new Error("Produto não encontrado");
  }

  console.info("[getProductByIdService] Produto encontrado", { productId: id });
  return product;
};

export const decrementStockService = async ({ productId, quantity }: UpdateStockInput) => {
  console.info("[decrementStockService] Decrementando estoque", { productId, quantity });

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
    console.warn("[decrementStockService] Estoque insuficiente", { productId, quantity });
    throw new Error("Estoque insuficiente para este produto");
  }

  console.info("[decrementStockService] Estoque atualizado com sucesso", { productId, quantity });
  return true;
};

export const deleteProductService = async (id: number) => {
  console.info("[deleteProductService] Deletando produto", { productId: id });

  await prisma.product.delete({ where: { id } });

  console.info("[deleteProductService] Produto deletado com sucesso", { productId: id });
  return true;
};

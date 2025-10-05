import { prisma } from "../prisma";
import { uploadImageToCloudinary } from "../utils/imageUpload";
import logger from "../logger";

// 🔹 Criar produto
export const createProductService = async (data: {
  name: string;
  description?: string;
  price: number;
  stock: number;
  filePath?: string;
}) => {
  if (!data.name || !data.price) {
    throw new Error("Nome e preço são obrigatórios");
  }

  try {
    let imageUrl: string | undefined;
    if (data.filePath) {
      imageUrl = await uploadImageToCloudinary(data.filePath);
      logger.info("[createProductService] Upload de imagem concluído", { imageUrl });
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock,
        imageUrl,
      },
    });

    logger.info("[createProductService] Produto criado com sucesso", { productId: product.id });
    return product;
  } catch (err: any) {
    logger.error("[createProductService] Erro ao criar produto", { error: err.message });
    throw err;
  }
};

// 🔹 Atualizar imagem do produto
export const uploadProductImageService = async (productId: number, filePath: string) => {
  if (!productId) throw new Error("ID do produto é obrigatório");
  if (!filePath) throw new Error("Nenhum arquivo enviado");

  try {
    const imageUrl = await uploadImageToCloudinary(filePath);
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { imageUrl },
    });
    logger.info("[uploadProductImageService] Produto atualizado com imagem", { productId });
    return updatedProduct;
  } catch (err: any) {
    logger.error("[uploadProductImageService] Erro ao atualizar imagem", { error: err.message });
    throw err;
  }
};

// 🔹 Atualizar estoque (novo service para o controller)
export const updateProductStockService = async (id: number, stock: number) => {
  try {
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { stock },
    });

    logger.info("[updateProductStockService] Estoque atualizado", { productId: id, stock });
    return updatedProduct;
  } catch (err: any) {
    logger.error("[updateProductStockService] Erro ao atualizar estoque", { error: err.message });
    throw err;
  }
};

// 🔹 Listar todos os produtos
export const getAllProductsService = async () => {
  try {
    const products = await prisma.product.findMany();
    logger.info("[getAllProductsService] Produtos encontrados", { count: products.length });
    return products;
  } catch (err: any) {
    logger.error("[getAllProductsService] Erro ao buscar produtos", { error: err.message });
    throw err;
  }
};

// 🔹 Buscar produto por ID
export const getProductByIdService = async (id: number) => {
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("Produto não encontrado");
    return product;
  } catch (err: any) {
    logger.error("[getProductByIdService] Erro ao buscar produto", { error: err.message });
    throw err;
  }
};

// 🔹 Decrementar estoque
export const decrementStockService = async ({ productId, quantity }: { productId: number; quantity: number }) => {
  try {
    const result = await prisma.product.updateMany({
      where: { id: productId, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });

    if (result.count === 0) throw new Error("Estoque insuficiente para este produto");
    return true;
  } catch (err: any) {
    logger.error("[decrementStockService] Erro ao decrementar estoque", { error: err.message });
    throw err;
  }
};

// 🔹 Deletar produto
export const deleteProductService = async (id: number) => {
  try {
    await prisma.product.delete({ where: { id } });
    logger.info("[deleteProductService] Produto deletado com sucesso", { productId: id });
    return true;
  } catch (err: any) {
    logger.error("[deleteProductService] Erro ao deletar produto", { error: err.message });
    throw err;
  }
};
import { prisma } from "../prisma";
import { uploadImageToCloudinary } from "../utils/imageUpload";
import logger from "../logger";

export const createProductService = async (data: {
  name: string;
  description?: string;
  price: number;
  stock: number;
  filePath?: string;
}) => {
  try {
    let imageUrl: string | undefined;

    if (data.filePath) {
      logger.debug("Iniciando upload da imagem para o Cloudinary", {
        filePath: data.filePath,
      });
      imageUrl = await uploadImageToCloudinary(data.filePath);
      logger.info("Upload de imagem concluído", { imageUrl });
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

    logger.info("Produto criado com sucesso", { productId: product.id });
    return product;
  } catch (err: any) {
    logger.error("Erro ao criar produto", { error: err.message });
    throw err;
  }
};

export const updateProductStockService = async (id: number, stock: number) => {
  try {
    const product = await prisma.product.update({
      where: { id },
      data: { stock },
    });
    logger.info("Estoque do produto atualizado", { productId: id, stock });
    return product;
  } catch (err: any) {
    logger.error("Erro ao atualizar estoque do produto", {
      productId: id,
      error: err.message,
    });
    throw err;
  }
};

export const getActiveProductsService = async () => {
  try {
    const products = await prisma.product.findMany({ where: { stock: { gt: 1 } } });
    logger.debug("Produtos ativos recuperados", { count: products.length });
    return products;
  } catch (err: any) {
    logger.error("Erro ao buscar produtos ativos", { error: err.message });
    throw err;
  }
};

export const getAllProductsService = async () => {
  try {
    const products = await prisma.product.findMany();
    logger.debug("Todos os produtos recuperados", { count: products.length });
    return products;
  } catch (err: any) {
    logger.error("Erro ao buscar todos os produtos", { error: err.message });
    throw err;
  }
};

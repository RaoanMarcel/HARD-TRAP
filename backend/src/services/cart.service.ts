import { prisma } from "../prisma";
import logger from "../logger";

export const getUserCart = async (userId: number) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { user_id: userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      logger.info("Carrinho não encontrado, criando novo", { userId });
      cart = await prisma.cart.create({
        data: { user_id: userId },
        include: { items: { include: { product: true } } },
      });
    }

    logger.debug("Carrinho recuperado", { userId, cartId: cart.id });
    return cart;
  } catch (err: any) {
    logger.error("Erro ao buscar ou criar carrinho", { error: err.message, userId });
    throw err;
  }
};

export const addItemToCart = async (userId: number, productId: number, quantity: number) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      logger.warn("Tentativa de adicionar produto inexistente ao carrinho", { userId, productId });
      throw new Error("Produto não encontrado");
    }

    if ((product.stock ?? 0) < quantity) {
      logger.warn("Tentativa de adicionar produto com estoque insuficiente", {
        userId,
        productId,
        requested: quantity,
        available: product.stock,
      });
      throw new Error("Estoque insuficiente");
    }

    const cart = await prisma.cart.upsert({
      where: { user_id: userId },
      update: {},
      create: { user_id: userId },
    });

    await prisma.cartItem.create({
      data: { cart_id: cart.id, product_id: productId, quantity },
    });

    logger.info("Produto adicionado ao carrinho", { userId, productId, quantity });
    return { message: "Produto adicionado ao carrinho" };
  } catch (err: any) {
    logger.error("Erro ao adicionar item ao carrinho", {
      error: err.message,
      userId,
      productId,
      quantity,
    });
    throw err;
  }
};

export const removeItemFromCart = async (userId: number, itemId: number) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { user_id: userId } });
    if (!cart) {
      logger.warn("Tentativa de remover item de carrinho inexistente", { userId, itemId });
      throw new Error("Carrinho não encontrado");
    }

    await prisma.cartItem.deleteMany({ where: { id: itemId, cart_id: cart.id } });

    logger.info("Item removido do carrinho", { userId, itemId, cartId: cart.id });
    return { message: "Item removido do carrinho" };
  } catch (err: any) {
    logger.error("Erro ao remover item do carrinho", { error: err.message, userId, itemId });
    throw err;
  }
};

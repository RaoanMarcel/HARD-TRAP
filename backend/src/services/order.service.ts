import { prisma } from "../prisma";
import logger from "../logger";

export const checkoutUserCart = async (userId: number) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { user_id: userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      logger.warn("Tentativa de checkout com carrinho vazio", { userId });
      throw new Error("Carrinho vazio");
    }

    logger.debug("Iniciando checkout", { userId, cartId: cart.id });

    return await prisma.$transaction(async (tx) => {
      let total = 0;

      for (const item of cart.items) {
        if ((item.product.stock ?? 0) < item.quantity) {
          logger.warn("Estoque insuficiente durante checkout", {
            userId,
            productId: item.product.id,
            requested: item.quantity,
            available: item.product.stock,
          });
          throw new Error(`Estoque insuficiente para ${item.product.name}`);
        }
        total += Number(item.product.price) * item.quantity;
      }

      const order = await tx.orders.create({
        data: {
          user_id: userId,
          total,
          status: "pending",
          order_items: {
            create: cart.items.map((item) => ({
              product_id: item.product.id,
              quantity: item.quantity,
              price: Number(item.product.price),
            })),
          },
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.product.id },
          data: { stock: (item.product.stock ?? 0) - item.quantity },
        });
      }

      await tx.payments.create({
        data: { order_id: order.id, method: "pix", amount: total, status: "pending" },
      });

      await tx.cartItem.deleteMany({ where: { cart_id: cart.id } });

      logger.info("Checkout concluído com sucesso", { userId, orderId: order.id, total });
      return order;
    });
  } catch (err: any) {
    logger.error("Erro no checkout do carrinho", { error: err.message, userId });
    throw err;
  }
};

export const createOrderDirect = async (
  userId: number,
  items: { productId: number; quantity: number; price: number }[]
) => {
  try {
    let total = 0;

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        logger.warn("Produto não encontrado ao criar pedido direto", { userId, productId: item.productId });
        throw new Error(`Produto ${item.productId} não encontrado`);
      }
      if ((product.stock ?? 0) < item.quantity) {
        logger.warn("Estoque insuficiente ao criar pedido direto", {
          userId,
          productId: item.productId,
          requested: item.quantity,
          available: product.stock,
        });
        throw new Error(`Estoque insuficiente para ${product.name}`);
      }
      total += Number(product.price) * item.quantity;
    }

    const order = await prisma.orders.create({
      data: {
        user_id: userId,
        total,
        status: "pending",
        order_items: {
          create: items.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
            price: Number(item.price),
          })),
        },
      },
    });

    logger.info("Pedido direto criado", { userId, orderId: order.id, total });
    return order;
  } catch (err: any) {
    logger.error("Erro ao criar pedido direto", { error: err.message, userId, items });
    throw err;
  }
};

export const getUserOrders = async (userId: number) => {
  try {
    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      include: { order_items: true },
      orderBy: { id: "desc" },
    });

    logger.debug("Pedidos do usuário recuperados", { userId, count: orders.length });
    return orders;
  } catch (err: any) {
    logger.error("Erro ao buscar pedidos do usuário", { error: err.message, userId });
    throw err;
  }
};

export const getOrderById = async (userId: number, orderId: number) => {
  try {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { order_items: true },
    });

    if (!order) {
      logger.warn("Pedido não encontrado", { userId, orderId });
      throw new Error("Pedido não encontrado");
    }
    if (order.user_id !== userId) {
      logger.warn("Tentativa de acesso não autorizado a pedido", { userId, orderId });
      throw new Error("Acesso negado");
    }

    logger.debug("Pedido recuperado com sucesso", { userId, orderId });
    return order;
  } catch (err: any) {
    logger.error("Erro ao buscar pedido por ID", { error: err.message, userId, orderId });
    throw err;
  }
};

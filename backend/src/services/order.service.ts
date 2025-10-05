import Stripe from "stripe";
import { prisma } from "../prisma";

// 🔹 Instância real (usada em produção)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "test_key", {
  apiVersion: "2025-08-27.basil",
});

// 🔹 Criar PaymentIntent no Stripe
export const createStripePaymentIntent = async (
  userId: number,
  orderId: number,
  stripeClient: Stripe = stripe
) => {
  const order = await prisma.orders.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Pedido não encontrado");
  if (order.user_id !== userId) throw new Error("Acesso negado");

  const amount = Math.round(Number(order.total) * 100);

  const paymentIntent = await stripeClient.paymentIntents.create({
    amount,
    currency: "brl",
    payment_method_types: ["card"],
    metadata: { orderId: order.id.toString() },
  });

  return { id: paymentIntent.id, clientSecret: paymentIntent.client_secret };
};

// 🔹 Checkout do carrinho do usuário
export const checkoutUserCart = async (userId: number) => {
  const cart = await prisma.cart.findUnique({
    where: { user_id: userId },
    include: {
      items: {
        include: { product: true }, // inclui produto para ter preço
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Carrinho vazio");
  }

  // Calcula o total corretamente
  const total = cart.items.reduce((acc, item) => {
    return acc + Number(item.product.price) * item.quantity;
  }, 0);

  const order = await prisma.orders.create({
    data: {
      user: { connect: { id: userId } }, // conecta usuário
      total: Number(total),
      status: "pending",
    },
  });

  // 🔹 Limpa o carrinho após checkout (primeiro itens, depois carrinho)
  await prisma.cartItem.deleteMany({ where: { cart_id: cart.id } });
  await prisma.cart.delete({ where: { id: cart.id } });

  return order;
};

// 🔹 Criar pedido direto (sem carrinho)
export const createOrderDirect = async (
  userId: number,
  items: { productId: number; quantity: number }[]
) => {
  let total = 0;
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
    });
    if (!product) throw new Error(`Produto ${item.productId} não encontrado`);
    total += Number(product.price) * item.quantity;
  }

  const order = await prisma.orders.create({
    data: {
      user: { connect: { id: userId } },
      total: Number(total),
      status: "pending",
    },
  });

  return order;
};

// 🔹 Buscar todos os pedidos de um usuário
export const getUserOrders = async (userId: number) => {
  return prisma.orders.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });
};

// 🔹 Buscar pedido específico
export const getOrderById = async (userId: number, orderId: number) => {
  const order = await prisma.orders.findUnique({
    where: { id: Number(orderId) }, // garante que é número
  });
  if (!order) throw new Error("Pedido não encontrado");
  if (order.user_id !== userId) throw new Error("Acesso negado");

  return order;
};
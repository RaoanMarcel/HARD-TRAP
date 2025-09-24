import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();

export const createOrder = async (req: Request, res: Response) => {
  const { items, paymentMethod } = req.body;
  const userId = (req as any).user?.userId;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "Pedido precisa ter ao menos 1 item" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      let total = 0;

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Produto ${item.productId} não encontrado`);
        if ((product.stock ?? 0) < item.quantity) throw new Error(`Estoque insuficiente para ${product.name}`);
        total += Number(product.price) * item.quantity;
      }

      const order = await tx.orders.create({
        data: { user_id: userId, total, status: "pending" },
      });

      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        await tx.order_items.create({
          data: { order_id: order.id, product_id: product.id, quantity: item.quantity, price: product.price },
        });

        await tx.product.update({ where: { id: product.id }, data: { stock: (product.stock ?? 0) - item.quantity } });
      }

      await tx.payments.create({
        data: { order_id: order.id, method: paymentMethod || "pix", amount: total, status: "pending" },
      });

      return order;
    });

    res.status(201).json({ message: "Pedido criado com sucesso", order: result });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || "Erro ao criar pedido" });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;

  try {
    const orders = await prisma.orders.findMany({
      where: { user_id: userId },
      include: { 
        order_items: { include: { product: true } },
        payments: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar pedidos" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { id } = req.params;

  const orderId = Number(id);
  if (isNaN(orderId)) return res.status(400).json({ error: "ID inválido" });

  try {
    const order = await prisma.orders.findUnique({
      where: { id: orderId },
      include: { 
        order_items: { include: { product: true } },
        payments: true,
      },
    });

    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
    if (order.user_id !== userId) return res.status(403).json({ error: "Acesso negado" });

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar pedido" });
  }
};

export const addItemToOrder = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { id } = req.params;
  const { productId, quantity } = req.body;

  const orderId = Number(id);
  if (isNaN(orderId)) return res.status(400).json({ error: "ID inválido" });

  try {
    const order = await prisma.orders.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
    if (order.user_id !== userId) return res.status(403).json({ error: "Acesso negado" });
    if (order.status !== "pending") return res.status(400).json({ error: "Não é possível editar pedidos finalizados" });

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Produto não encontrado" });
    if ((product.stock ?? 0) < quantity) return res.status(400).json({ error: "Estoque insuficiente" });

    await prisma.order_items.create({
      data: { order_id: order.id, product_id: productId, quantity, price: product.price },
    });

    await prisma.product.update({ where: { id: productId }, data: { stock: (product.stock ?? 0) - quantity } });

    res.json({ message: "Item adicionado ao pedido" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao adicionar item" });
  }
};

export const removeItemFromOrder = async (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { id, itemId } = req.params;

  const orderId = Number(id);
  const itemNumberId = Number(itemId);
  if (isNaN(orderId) || isNaN(itemNumberId)) return res.status(400).json({ error: "ID inválido" });

  try {
    const order = await prisma.orders.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
    if (order.user_id !== userId) return res.status(403).json({ error: "Acesso negado" });
    if (order.status !== "pending") return res.status(400).json({ error: "Não é possível editar pedidos finalizados" });

    const item = await prisma.order_items.findUnique({ where: { id: itemNumberId } });
    if (!item) return res.status(404).json({ error: "Item não encontrado" });

    const product = await prisma.product.findUnique({ where: { id: item.product_id ?? 0 } });
    if (!product) return res.status(404).json({ error: "Produto não encontrado ao tentar restaurar estoque" });

    await prisma.product.update({
      where: { id: product.id },
      data: { stock: (product.stock ?? 0) + (item.quantity ?? 0) },
    });

    await prisma.order_items.delete({ where: { id: itemNumberId } });

    res.json({ message: "Item removido do pedido" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao remover item" });
  }
};

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  console.error("STRIPE_SECRET_KEY não definido em .env");
}
const stripe = new Stripe(stripeSecret as string);

export const createStripePayment = async (req: Request, res: Response) => {
  const { orderId } = req.body;
  const userId = (req as any).user?.userId;

  const idNumber = Number(orderId);
  if (isNaN(idNumber)) return res.status(400).json({ error: "orderId inválido" });

  try {
    const order = await prisma.orders.findUnique({
      where: { id: idNumber },
      include: { order_items: true, payments: true }
    });

    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
    if (order.user_id !== userId) return res.status(403).json({ error: "Acesso negado" });

 
    const amount = Math.round(Number(order.total) * 100); // centavos

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "brl",
      payment_method_types: ["card"],
      metadata: { orderId: order.id.toString() },
    });

    res.json({ id: paymentIntent.id, clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error("createStripePayment error:", err);
    res.status(500).json({ error: "Erro ao criar pagamento" });
  }
};
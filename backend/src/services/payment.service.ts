import Stripe from "stripe";
import { prisma } from "../prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, { apiVersion: "2025-08-27.basil" });

export const createStripePaymentIntent = async (userId: number, orderId: number) => {
  const order = await prisma.orders.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Pedido não encontrado");
  if (order.user_id !== userId) throw new Error("Acesso negado");

  const amount = Math.round(Number(order.total) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency: "brl",
    payment_method_types: ["card"],
    metadata: { orderId: order.id.toString() },
  });

  return { id: paymentIntent.id, clientSecret: paymentIntent.client_secret };
};

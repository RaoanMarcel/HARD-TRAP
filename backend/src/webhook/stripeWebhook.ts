import { Request, Response } from "express";
import { prisma } from "../prisma";
import Stripe from "stripe";
import logger from "../logger";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  if (!endpointSecret) {
    logger.error("[StripeWebhook] STRIPE_WEBHOOK_SECRET não definido");
    return res.status(500).send("Webhook secret não configurado");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    logger.error("[StripeWebhook] Falha na verificação do evento Stripe", {
      error: err?.message || err,
    });
    return res.status(400).send(`Webhook Error: ${err?.message || err}`);
  }

  try {
    // Idempotência
    const existingEvent = await prisma.stripe_events.findUnique({
      where: { event_id: event.id },
    });
    if (existingEvent) {
      logger.warn("[StripeWebhook] Evento duplicado detectado", {
        eventId: event.id,
      });
      return res.status(200).json({ received: true, duplicate: true });
    }

    // Processamento
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = Number(paymentIntent.metadata?.orderId);

      if (!orderId || isNaN(orderId)) {
        logger.warn("[StripeWebhook] orderId inválido no metadata", {
          paymentIntentId: paymentIntent.id,
          metadata: paymentIntent.metadata,
        });
        return res.status(400).send("orderId inválido");
      }

      const existingOrder = await prisma.orders.findUnique({
        where: { id: orderId },
      });
      if (!existingOrder) {
        logger.warn("[StripeWebhook] Pedido não encontrado", { orderId });
        return res.status(200).send("Pedido não encontrado");
      }

      await prisma.payments.updateMany({
        where: { order_id: orderId, status: "pending" },
        data: { status: "paid", transaction_code: paymentIntent.id },
      });

      await prisma.orders.update({
        where: { id: orderId },
        data: { status: "paid" },
      });

      logger.info("[StripeWebhook] Pedido pago com sucesso", {
        orderId,
        paymentIntentId: paymentIntent.id,
      });
    }

    // Registro do evento para idempotência futura
    await prisma.stripe_events.create({
      data: { event_id: event.id },
    });
  } catch (err: any) {
    logger.error("[StripeWebhook] Erro ao processar evento", {
      eventId: event?.id,
      error: err?.message || err,
    });
    return res.status(500).send("Erro interno");
  }

  res.json({ received: true });
};

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const stripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  if (!endpointSecret) {
    console.error("STRIPE_WEBHOOK_SECRET não definido. Rode: stripe listen e copie a secret para .env");
    return res.status(500).send("Webhook secret não configurado");
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook error:", err?.message || err);
    return res.status(400).send(`Webhook Error: ${err?.message || err}`);
  }

  // trata múltiplos tipos de evento de pagamento relevantes
  try {
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderIdStr = paymentIntent.metadata?.orderId;
      const orderId = Number(orderIdStr);

      if (!orderId || isNaN(orderId)) {
        console.warn("⚠️ orderId ausente ou inválido no metadata do PaymentIntent!", paymentIntent.id);
        return res.status(400).send("orderId ausente no metadata");
      }

      // atualiza payments associados (marcar como paid)
      await prisma.payments.updateMany({
        where: { order_id: orderId, status: "pending" },
        data: {
          status: "paid",
          transaction_code: paymentIntent.id,
        },
      });

      // atualiza order
      await prisma.orders.update({
        where: { id: orderId },
        data: { status: "paid" },
      });

      console.log(`✅ Pedido ${orderId} pago com sucesso (paymentIntent ${paymentIntent.id}).`);
    }

  } catch (err: any) {
    console.error("Erro ao processar evento do webhook:", err);
    return res.status(500).send("Erro interno ao processar webhook");
  }

  res.json({ received: true });
};

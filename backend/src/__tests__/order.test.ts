import request from "supertest";
import app from "../app";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Stripe from "stripe";

jest.setTimeout(30000);

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-08-27.basil",
});

let token: string;
let userId: number;

beforeAll(async () => {
  await prisma.order_items.deleteMany();
  await prisma.payments.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.product.deleteMany();
  await prisma.users.deleteMany();

  const hashed = await bcrypt.hash("123456", 10);
  const user = await prisma.users.create({
    data: { name: "Order Tester", email: "order@example.com", password_hash: hashed },
  });
  userId = user.id;

  token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "supersecret"
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Stripe integration (test mode) — /orders -> /orders/stripe -> webhook", () => {
  it("cria pedido, cria PaymentIntent, confirma no Stripe e processa webhook (marca pago)", async () => {
    const product = await prisma.product.create({
      data: { name: "Produto Stripe Test", price: 42.5, stock: 10 },
    });

    const createOrderRes = await request(app)
      .post("/orders")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [{ productId: product.id, quantity: 1 }],
        paymentMethod: "card",
      });

    expect(createOrderRes.status).toBe(201);
    const orderId = createOrderRes.body.order.id;
    expect(orderId).toBeDefined();

    const paymentsBefore = await prisma.payments.findMany({ where: { order_id: orderId } });
    expect(paymentsBefore.length).toBeGreaterThan(0);
    expect(paymentsBefore[0].status).toBe("pending");

    const piRes = await request(app)
      .post("/orders/stripe")
      .set("Authorization", `Bearer ${token}`)
      .send({ orderId });

    expect(piRes.status).toBe(200);
    expect(piRes.body).toHaveProperty("id");
    const paymentIntentId = piRes.body.id as string;

    // Confirma o PaymentIntent no Stripe
    await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: "pm_card_visa",
    });

    // 🔑 Recarrega o objeto para garantir metadata (principal correção)
    const fullPI = await stripe.paymentIntents.retrieve(paymentIntentId);

    expect(fullPI.metadata?.orderId).toBe(orderId.toString());

    // Cria evento simulado do Stripe
    const event = {
      id: `evt_test_${Date.now()}`,
      object: "event",
      type: "payment_intent.succeeded",
      data: { object: fullPI },
    };
    const payload = JSON.stringify(event);

    const header = stripe.webhooks.generateTestHeaderString({
      payload,
      secret: process.env.STRIPE_WEBHOOK_SECRET as string,
    });

    const webhookRes = await request(app)
      .post("/webhook")
      .set("stripe-signature", header)
      .set("Content-Type", "application/json")
      .send(payload);

    expect(webhookRes.status).toBe(200);

    const paymentsAfter = await prisma.payments.findMany({ where: { order_id: orderId } });
    expect(paymentsAfter.length).toBeGreaterThan(0);
    expect(paymentsAfter[0].status).toBe("paid");
    expect(paymentsAfter[0].transaction_code).toBe(paymentIntentId);

    const orderAfter = await prisma.orders.findUnique({ where: { id: orderId } });
    expect(orderAfter?.status).toBe("paid");
  });
});

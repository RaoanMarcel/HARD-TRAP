import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// 🔹 mock do controller
vi.mock("../../webhook/stripeWebhook", () => {
  return {
    handleStripeWebhook: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Webhook recebido" })
    ),
  };
});

// importa o mock para usar nos expects
import { handleStripeWebhook } from "../../webhook/stripeWebhook";

// só agora importa o router
import webhookRoutes from "../../routes/webhook.routes";

const app = express();
app.use("/webhook", webhookRoutes);

describe("Webhook Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /webhook/stripe deve chamar handleStripeWebhook", async () => {
    const res = await request(app).post("/webhook/stripe").send({ test: true });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Webhook recebido");
    expect(handleStripeWebhook).toHaveBeenCalled();
  });
});
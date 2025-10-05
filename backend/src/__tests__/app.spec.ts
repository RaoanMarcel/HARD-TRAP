import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock das rotas
vi.mock("../routes/auth.routes", () => ({ default: (req: any, res: any) => res.send("auth ok") }));
vi.mock("../routes/protected.routes", () => ({ default: (req: any, res: any) => res.send("protected ok") }));
vi.mock("../routes/product.routes", () => ({ default: (req: any, res: any) => res.send("products ok") }));
vi.mock("../routes/user.routes", () => ({ default: (req: any, res: any) => res.send("users ok") }));
vi.mock("../routes/shipping.routes", () => ({ default: (req: any, res: any) => res.send("shipping ok") }));
vi.mock("../routes/shop.routes", () => ({ default: (req: any, res: any) => res.send("shop ok") }));

// 🔹 Mock do webhook (handleStripeWebhook criado dentro do vi.mock)
vi.mock("../webhook/stripeWebhook", () => {
  const handleStripeWebhookMock = vi.fn((req: any, res: any) => res.json({ received: true }));
  return { handleStripeWebhook: handleStripeWebhookMock, __m: { handleStripeWebhookMock } };
});

// importa o app depois dos mocks
import app from "../app";
import * as webhookModule from "../webhook/stripeWebhook";

// pega o mock exposto
const { handleStripeWebhookMock } = (webhookModule as any).__m;

describe("App setup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve registrar o webhook do Stripe em /webhook", async () => {
    const res = await request(app)
      .post("/webhook")
      .set("stripe-signature", "sig")
      .send("{}");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ received: true });
    expect(handleStripeWebhookMock).toHaveBeenCalled();
  });

  it("deve montar rota /auth", async () => {
    const res = await request(app).get("/auth");
    expect(res.text).toBe("auth ok");
  });

  it("deve montar rota /protected", async () => {
    const res = await request(app).get("/protected");
    expect(res.text).toBe("protected ok");
  });

  it("deve montar rota /products", async () => {
    const res = await request(app).get("/products");
    expect(res.text).toBe("products ok");
  });

  it("deve montar rota /users", async () => {
    const res = await request(app).get("/users");
    expect(res.text).toBe("users ok");
  });

  it("deve montar rota /shipping", async () => {
    const res = await request(app).get("/shipping");
    expect(res.text).toBe("shipping ok");
  });

  it("deve montar rota /api/shop", async () => {
    const res = await request(app).get("/api/shop");
    expect(res.text).toBe("shop ok");
  });
});
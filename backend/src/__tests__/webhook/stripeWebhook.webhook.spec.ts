import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock do Stripe (constructEvent criado dentro do vi.mock)
vi.mock("stripe", () => {
  const constructEventMock = vi.fn();
  return {
    default: vi.fn().mockImplementation(() => ({
      webhooks: { constructEvent: constructEventMock },
    })),
    __m: { constructEventMock },
  };
});

// 🔹 Mock do prisma
vi.mock("../../prisma", () => {
  const prismaMock = {
    stripe_events: { findUnique: vi.fn(), create: vi.fn() },
    orders: { findUnique: vi.fn(), update: vi.fn() },
    payments: { updateMany: vi.fn() },
  };
  return { prisma: prismaMock, __m: prismaMock };
});

// 🔹 Mock do logger
vi.mock("../../logger", () => {
  const loggerMock = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  };
  return { default: loggerMock, __m: loggerMock };
});

// importa depois dos mocks
import { handleStripeWebhook } from "../../webhook/stripeWebhook";
import * as stripeModule from "stripe";
import * as prismaModule from "../../prisma";
import * as loggerModule from "../../logger";

// pega os mocks expostos
const { constructEventMock } = (stripeModule as any).__m;
const prismaMock = (prismaModule as any).__m;
const loggerMock = (loggerModule as any).__m;

describe("handleStripeWebhook", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    mockReq = {
      headers: { "stripe-signature": "sig" },
      body: "raw-body",
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };
  });

  it("deve retornar 500 se STRIPE_WEBHOOK_SECRET não estiver definido", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    await handleStripeWebhook(mockReq, mockRes);

    expect(loggerMock.error).toHaveBeenCalledWith(
      "[StripeWebhook] STRIPE_WEBHOOK_SECRET não definido"
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith("Webhook secret não configurado");
  });

  it("deve retornar 400 se constructEvent lançar erro", async () => {
    constructEventMock.mockImplementation(() => {
      throw new Error("Invalid signature");
    });

    await handleStripeWebhook(mockReq, mockRes);

    expect(loggerMock.error).toHaveBeenCalledWith(
      "[StripeWebhook] Falha na verificação do evento Stripe",
      expect.objectContaining({ error: "Invalid signature" })
    );
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith("Webhook Error: Invalid signature");
  });

  it("deve detectar evento duplicado", async () => {
    const fakeEvent = { id: "evt_1", type: "payment_intent.succeeded", data: { object: {} } };
    constructEventMock.mockReturnValue(fakeEvent);
    prismaMock.stripe_events.findUnique.mockResolvedValue({ event_id: "evt_1" });

    await handleStripeWebhook(mockReq, mockRes);

    expect(loggerMock.warn).toHaveBeenCalledWith(
      "[StripeWebhook] Evento duplicado detectado",
      expect.objectContaining({ eventId: "evt_1" })
    );
    expect(mockRes.json).toHaveBeenCalledWith({ received: true, duplicate: true });
  });

  it("deve processar payment_intent.succeeded com sucesso", async () => {
    const fakeEvent = {
      id: "evt_2",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_123", metadata: { orderId: "42" } } },
    };
    constructEventMock.mockReturnValue(fakeEvent);
    prismaMock.stripe_events.findUnique.mockResolvedValue(null);
    prismaMock.orders.findUnique.mockResolvedValue({ id: 42 });

    await handleStripeWebhook(mockReq, mockRes);

    expect(prismaMock.payments.updateMany).toHaveBeenCalledWith({
      where: { order_id: 42, status: "pending" },
      data: { status: "paid", transaction_code: "pi_123" },
    });
    expect(prismaMock.orders.update).toHaveBeenCalledWith({
      where: { id: 42 },
      data: { status: "paid" },
    });
    expect(loggerMock.info).toHaveBeenCalledWith(
      "[StripeWebhook] Pedido pago com sucesso",
      expect.objectContaining({ orderId: 42, paymentIntentId: "pi_123" })
    );
    expect(prismaMock.stripe_events.create).toHaveBeenCalledWith({
      data: { event_id: "evt_2" },
    });
    expect(mockRes.json).toHaveBeenCalledWith({ received: true });
  });

  it("deve retornar 400 se orderId for inválido", async () => {
    const fakeEvent = {
      id: "evt_3",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_456", metadata: {} } },
    };
    constructEventMock.mockReturnValue(fakeEvent);
    prismaMock.stripe_events.findUnique.mockResolvedValue(null);

    await handleStripeWebhook(mockReq, mockRes);

    expect(loggerMock.warn).toHaveBeenCalledWith(
      "[StripeWebhook] orderId inválido no metadata",
      expect.any(Object)
    );
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.send).toHaveBeenCalledWith("orderId inválido");
  });

  it("deve retornar 200 se pedido não for encontrado", async () => {
    const fakeEvent = {
      id: "evt_4",
      type: "payment_intent.succeeded",
      data: { object: { id: "pi_789", metadata: { orderId: "99" } } },
    };
    constructEventMock.mockReturnValue(fakeEvent);
    prismaMock.stripe_events.findUnique.mockResolvedValue(null);
    prismaMock.orders.findUnique.mockResolvedValue(null);

    await handleStripeWebhook(mockReq, mockRes);

    expect(loggerMock.warn).toHaveBeenCalledWith(
      "[StripeWebhook] Pedido não encontrado",
      { orderId: 99 }
    );
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.send).toHaveBeenCalledWith("Pedido não encontrado");
  });

  it("deve retornar 500 se ocorrer erro inesperado", async () => {
    const fakeEvent = { id: "evt_5", type: "payment_intent.succeeded", data: { object: {} } };
    constructEventMock.mockReturnValue(fakeEvent);
    prismaMock.stripe_events.findUnique.mockImplementation(() => {
      throw new Error("DB error");
    });

    await handleStripeWebhook(mockReq, mockRes);

    expect(loggerMock.error).toHaveBeenCalledWith(
      "[StripeWebhook] Erro ao processar evento",
      expect.objectContaining({ eventId: "evt_5", error: "DB error" })
    );
    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith("Erro interno");
  });
});
import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../prisma";
import StripeMock, { stripeMocks } from "../utils/mockStripe";

// 🔹 Mock do Prisma
vi.mock("../../prisma", () => ({
  prisma: {
    orders: { findUnique: vi.fn() },
  },
}));

// 🔹 Mock da Stripe
vi.mock("stripe", () => ({ default: StripeMock }));

// Agora importe o service DEPOIS dos mocks
import { createStripePaymentIntent } from "../../services/order.service";

describe("Stripe Payment Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve lançar erro se pedido não existir", async () => {
    (prisma.orders.findUnique as any).mockResolvedValue(null);

    await expect(createStripePaymentIntent(1, 99)).rejects.toThrow("Pedido não encontrado");
  });

  it("deve lançar erro se pedido não pertencer ao usuário", async () => {
    (prisma.orders.findUnique as any).mockResolvedValue({ id: 10, user_id: 2, total: 100 });

    await expect(createStripePaymentIntent(1, 10)).rejects.toThrow("Acesso negado");
  });

  it("deve criar PaymentIntent com sucesso", async () => {
    (prisma.orders.findUnique as any).mockResolvedValue({ id: 10, user_id: 1, total: 123.45 });

    stripeMocks.create.mockResolvedValue({ id: "pi_123", client_secret: "secret_abc" });

    const result = await createStripePaymentIntent(1, 10);

    expect(prisma.orders.findUnique).toHaveBeenCalledWith({ where: { id: 10 } });
    expect(stripeMocks.create).toHaveBeenCalledWith({
      amount: 12345,
      currency: "brl",
      payment_method_types: ["card"],
      metadata: { orderId: "10" },
    });
    expect(result).toEqual({ id: "pi_123", clientSecret: "secret_abc" });
  });
});
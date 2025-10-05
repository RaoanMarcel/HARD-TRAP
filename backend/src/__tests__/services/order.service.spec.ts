import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../prisma";
import StripeMock from "../utils/mockStripe";

// 🔹 Mock do Prisma
vi.mock("../../prisma", () => ({
  prisma: {
    orders: { findUnique: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    cart: { findUnique: vi.fn() },
    product: { findUnique: vi.fn(), update: vi.fn() },
    payments: { create: vi.fn() },
    cartItem: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));

// 🔹 Mock da Stripe
vi.mock("stripe", () => ({ default: StripeMock }));

// Agora importe o service DEPOIS dos mocks
import {
  checkoutUserCart,
  createOrderDirect,
  getUserOrders,
  getOrderById,
  createStripePaymentIntent,
} from "../../services/order.service";

describe("Order Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("checkoutUserCart deve lançar erro se carrinho estiver vazio", async () => {
    (prisma.cart.findUnique as any).mockResolvedValue(null);
    await expect(checkoutUserCart(1)).rejects.toThrow("Carrinho vazio");
  });

  it("createOrderDirect deve lançar erro se produto não existir", async () => {
    (prisma.product.findUnique as any).mockResolvedValue(null);
    await expect(
      createOrderDirect(1, [{ productId: 99, quantity: 1, price: 10 }])
    ).rejects.toThrow("Produto 99 não encontrado");
  });

  it("getOrderById deve lançar erro se pedido não existir", async () => {
    (prisma.orders.findUnique as any).mockResolvedValue(null);
    await expect(getOrderById(1, 99)).rejects.toThrow("Pedido não encontrado");
  });
});
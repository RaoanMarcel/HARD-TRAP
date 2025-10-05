import { describe, it, expect, vi, beforeEach } from "vitest";
import { getUserCart, addItemToCart, removeItemFromCart } from "../../services/cart.service";
import { prisma } from "../../prisma";

// 🔹 Mock do Prisma
vi.mock("../../prisma", () => ({
  prisma: {
    cart: {
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
    },
    cartItem: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
  },
}));

// 🔹 Mock do logger
vi.mock("../../logger", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("Cart Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -----------------------------
  // getUserCart
  // -----------------------------
  describe("getUserCart", () => {
    it("deve retornar carrinho existente", async () => {
      (prisma.cart.findUnique as any).mockResolvedValue({ id: 1, user_id: 1, items: [] });

      const result = await getUserCart(1);

      expect(result).toEqual({ id: 1, user_id: 1, items: [] });
      expect(prisma.cart.findUnique).toHaveBeenCalledWith({
        where: { user_id: 1 },
        include: { items: { include: { product: true } } },
      });
    });

    it("deve criar carrinho se não existir", async () => {
      (prisma.cart.findUnique as any).mockResolvedValue(null);
      (prisma.cart.create as any).mockResolvedValue({ id: 2, user_id: 1, items: [] });

      const result = await getUserCart(1);

      expect(result).toEqual({ id: 2, user_id: 1, items: [] });
      expect(prisma.cart.create).toHaveBeenCalledWith({
        data: { user_id: 1 },
        include: { items: { include: { product: true } } },
      });
    });

    it("deve lançar erro se Prisma falhar", async () => {
      (prisma.cart.findUnique as any).mockRejectedValue(new Error("Erro Prisma"));

      await expect(getUserCart(1)).rejects.toThrow("Erro Prisma");
    });
  });

  // -----------------------------
  // addItemToCart
  // -----------------------------
  describe("addItemToCart", () => {
    it("deve adicionar item ao carrinho com sucesso", async () => {
      (prisma.product.findUnique as any).mockResolvedValue({ id: 1, stock: 10 });
      (prisma.cart.upsert as any).mockResolvedValue({ id: 1, user_id: 1 });
      (prisma.cartItem.create as any).mockResolvedValue({
        id: 1,
        cart_id: 1,
        product_id: 1,
        quantity: 2,
      });

      const result = await addItemToCart(1, 1, 2);

      // 🔹 Agora validamos parcialmente
      expect(result).toMatchObject({ message: "Produto adicionado ao carrinho" });
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("product_id", 1);
      expect(result).toHaveProperty("quantity", 2);

      expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.cartItem.create).toHaveBeenCalled();
    });

    it("deve lançar erro se produto não existir", async () => {
      (prisma.product.findUnique as any).mockResolvedValue(null);

      await expect(addItemToCart(1, 99, 1)).rejects.toThrow("Produto não encontrado");
    });

    it("deve lançar erro se estoque for insuficiente", async () => {
      (prisma.product.findUnique as any).mockResolvedValue({ id: 1, stock: 1 });

      await expect(addItemToCart(1, 1, 5)).rejects.toThrow("Estoque insuficiente");
    });

    it("deve lançar erro se Prisma falhar", async () => {
      (prisma.product.findUnique as any).mockRejectedValue(new Error("Erro Prisma"));

      await expect(addItemToCart(1, 1, 1)).rejects.toThrow("Erro Prisma");
    });
  });

  // -----------------------------
  // removeItemFromCart
  // -----------------------------
  describe("removeItemFromCart", () => {
    it("deve remover item do carrinho com sucesso", async () => {
      (prisma.cart.findUnique as any).mockResolvedValue({ id: 1, user_id: 1 });
      (prisma.cartItem.deleteMany as any).mockResolvedValue({ count: 1 });

      const result = await removeItemFromCart(1, 10);

      // 🔹 Valida parcialmente
      expect(result).toMatchObject({ message: "Item removido do carrinho" });
      expect(result).toHaveProperty("removedCount", 1);

      expect(prisma.cartItem.deleteMany).toHaveBeenCalledWith({
        where: { id: 10, cart_id: 1 },
      });
    });

    it("deve lançar erro se carrinho não existir", async () => {
      (prisma.cart.findUnique as any).mockResolvedValue(null);

      await expect(removeItemFromCart(1, 10)).rejects.toThrow("Carrinho não encontrado");
    });

    it("deve lançar erro se Prisma falhar", async () => {
      (prisma.cart.findUnique as any).mockRejectedValue(new Error("Erro Prisma"));

      await expect(removeItemFromCart(1, 10)).rejects.toThrow("Erro Prisma");
    });
  });
});
import request from "supertest";
import express from "express";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock dos services
vi.mock("../../services/cart.service", () => ({
  getUserCart: vi.fn(),
  addItemToCart: vi.fn(),
  removeItemFromCart: vi.fn(),
}));
vi.mock("../../services/order.service", () => ({
  checkoutUserCart: vi.fn(),
  createOrderDirect: vi.fn(),
  getUserOrders: vi.fn(),
  getOrderById: vi.fn(),
}));
vi.mock("../../services/payment.service", () => ({
  createStripePaymentIntent: vi.fn(),
}));

import * as cartService from "../../services/cart.service";
import * as orderService from "../../services/order.service";
import * as paymentService from "../../services/payment.service";
import {
  getCart,
  addToCart,
  removeFromCart,
  checkoutCart,
  createOrder,
  getUserOrders,
  getOrderById,
  createStripePayment,
} from "../../controllers/shopController";

// 🔹 Criar app Express para testar endpoints
const app = express();
app.use(express.json());

// Middleware fake para simular AuthRequest
app.use((req, _, next) => {
  (req as any).user = { userId: 123 };
  next();
});

app.get("/cart", getCart);
app.post("/cart", addToCart);
app.delete("/cart/:itemId", removeFromCart);
app.post("/cart/checkout", checkoutCart);
app.post("/orders", createOrder);
app.get("/orders", getUserOrders);
app.get("/orders/:id", getOrderById);
app.post("/payments", createStripePayment);

describe("Cart/Order/Payment Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCart", () => {
    it("deve retornar carrinho do usuário", async () => {
      (cartService.getUserCart as any).mockResolvedValue([{ id: 1 }]);

      const res = await request(app).get("/cart");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1 }]);
      expect(cartService.getUserCart).toHaveBeenCalledWith(123);
    });

    it("deve retornar 500 se service falhar", async () => {
      (cartService.getUserCart as any).mockRejectedValue(new Error("Erro"));

      const res = await request(app).get("/cart");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Erro ao buscar carrinho" });
    });
  });

  describe("addToCart", () => {
    it("deve adicionar item ao carrinho", async () => {
      (cartService.addItemToCart as any).mockResolvedValue({ success: true });

      const res = await request(app).post("/cart").send({ productId: 1, quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });
      expect(cartService.addItemToCart).toHaveBeenCalledWith(123, 1, 2);
    });

    it("deve retornar 400 se service falhar", async () => {
      (cartService.addItemToCart as any).mockRejectedValue(new Error("Produto inválido"));

      const res = await request(app).post("/cart").send({ productId: 1, quantity: 2 });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Produto inválido" });
    });
  });

  describe("removeFromCart", () => {
    it("deve remover item do carrinho", async () => {
      (cartService.removeItemFromCart as any).mockResolvedValue({ removed: true });

      const res = await request(app).delete("/cart/10");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ removed: true });
      expect(cartService.removeItemFromCart).toHaveBeenCalledWith(123, 10);
    });

    it("deve retornar 400 se service falhar", async () => {
      (cartService.removeItemFromCart as any).mockRejectedValue(new Error("Erro remoção"));

      const res = await request(app).delete("/cart/10");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Erro remoção" });
    });
  });

  describe("checkoutCart", () => {
    it("deve realizar checkout", async () => {
      (orderService.checkoutUserCart as any).mockResolvedValue({ id: 1 });

      const res = await request(app).post("/cart/checkout");

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ message: "Checkout concluído", order: { id: 1 } });
      expect(orderService.checkoutUserCart).toHaveBeenCalledWith(123);
    });

    it("deve retornar 400 se service falhar", async () => {
      (orderService.checkoutUserCart as any).mockRejectedValue(new Error("Falha checkout"));

      const res = await request(app).post("/cart/checkout");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Falha checkout" });
    });
  });

  describe("createOrder", () => {
    it("deve criar pedido", async () => {
      (orderService.createOrderDirect as any).mockResolvedValue({ id: 99 });

      const res = await request(app).post("/orders").send({ items: [{ productId: 1, qty: 2 }] });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ message: "Pedido criado", order: { id: 99 } });
      expect(orderService.createOrderDirect).toHaveBeenCalledWith(123, [{ productId: 1, qty: 2 }]);
    });

    it("deve retornar 400 se service falhar", async () => {
      (orderService.createOrderDirect as any).mockRejectedValue(new Error("Falha pedido"));

      const res = await request(app).post("/orders").send({ items: [] });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Falha pedido" });
    });
  });

  describe("getUserOrders", () => {
    it("deve retornar pedidos do usuário", async () => {
      (orderService.getUserOrders as any).mockResolvedValue([{ id: 1 }]);

      const res = await request(app).get("/orders");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1 }]);
    });

    it("deve retornar 500 se service falhar", async () => {
      (orderService.getUserOrders as any).mockRejectedValue(new Error("Erro"));

      const res = await request(app).get("/orders");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: "Erro ao buscar pedidos" });
    });
  });

  describe("getOrderById", () => {
    it("deve retornar pedido por ID", async () => {
      (orderService.getOrderById as any).mockResolvedValue({ id: 1 });

      const res = await request(app).get("/orders/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1 });
      expect(orderService.getOrderById).toHaveBeenCalledWith(123, 1);
    });

    it("deve retornar 400 se service falhar", async () => {
      (orderService.getOrderById as any).mockRejectedValue(new Error("Não encontrado"));

      const res = await request(app).get("/orders/1");

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Não encontrado" });
    });
  });

  describe("createStripePayment", () => {
    it("deve criar PaymentIntent", async () => {
      (paymentService.createStripePaymentIntent as any).mockResolvedValue({ client_secret: "abc" });

      const res = await request(app).post("/payments").send({ orderId: 10 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ client_secret: "abc" });
      expect(paymentService.createStripePaymentIntent).toHaveBeenCalledWith(123, 10);
    });

    it("deve retornar 400 se service falhar", async () => {
      (paymentService.createStripePaymentIntent as any).mockRejectedValue(new Error("Falha pagamento"));

      const res = await request(app).post("/payments").send({ orderId: 10 });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "Falha pagamento" });
    });
  });
});
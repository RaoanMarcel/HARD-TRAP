import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// 🔹 mocks primeiro
vi.mock("../../middlewares/auth.middleware", () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    (req as any).user = { id: 1, name: "Raoan" }; // simula usuário autenticado
    next();
  },
}));

vi.mock("../../controllers/shopController", () => {
  return {
    getCart: vi.fn((req: any, res: any) =>
      res.status(200).json({ items: [] })
    ),
    addToCart: vi.fn((req: any, res: any) =>
      res.status(201).json({ message: "Item adicionado" })
    ),
    removeFromCart: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Item removido" })
    ),
    checkoutCart: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Checkout realizado" })
    ),
    createOrder: vi.fn((req: any, res: any) =>
      res.status(201).json({ message: "Pedido criado" })
    ),
    getUserOrders: vi.fn((req: any, res: any) =>
      res.status(200).json([{ id: 1, total: 100 }])
    ),
    getOrderById: vi.fn((req: any, res: any) =>
      res.status(200).json({ id: req.params.id, total: 50 })
    ),
    createStripePayment: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Pagamento criado" })
    ),
  };
});

// importa os mocks para usar nos expects
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

// só agora importa o router
import shopRoutes from "../../routes/shop.routes";

const app = express();
app.use(express.json());
app.use("/shop", shopRoutes);

describe("Shop Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /shop/cart deve chamar getCart", async () => {
    const res = await request(app).get("/shop/cart");
    expect(res.status).toBe(200);
    expect(getCart).toHaveBeenCalled();
  });

  it("POST /shop/cart deve chamar addToCart", async () => {
    const res = await request(app).post("/shop/cart").send({ productId: 1 });
    expect(res.status).toBe(201);
    expect(addToCart).toHaveBeenCalled();
  });

  it("DELETE /shop/cart/:itemId deve chamar removeFromCart", async () => {
    const res = await request(app).delete("/shop/cart/123");
    expect(res.status).toBe(200);
    expect(removeFromCart).toHaveBeenCalled();
  });

  it("POST /shop/cart/checkout deve chamar checkoutCart", async () => {
    const res = await request(app).post("/shop/cart/checkout");
    expect(res.status).toBe(200);
    expect(checkoutCart).toHaveBeenCalled();
  });

  it("POST /shop/orders deve chamar createOrder", async () => {
    const res = await request(app).post("/shop/orders").send({ items: [] });
    expect(res.status).toBe(201);
    expect(createOrder).toHaveBeenCalled();
  });

  it("GET /shop/orders deve chamar getUserOrders", async () => {
    const res = await request(app).get("/shop/orders");
    expect(res.status).toBe(200);
    expect(getUserOrders).toHaveBeenCalled();
  });

  it("GET /shop/orders/:id deve chamar getOrderById", async () => {
    const res = await request(app).get("/shop/orders/123");
    expect(res.status).toBe(200);
    expect(getOrderById).toHaveBeenCalled();
  });

  it("POST /shop/orders/stripe deve chamar createStripePayment", async () => {
    const res = await request(app).post("/shop/orders/stripe").send({ amount: 100 });
    expect(res.status).toBe(200);
    expect(createStripePayment).toHaveBeenCalled();
  });
});
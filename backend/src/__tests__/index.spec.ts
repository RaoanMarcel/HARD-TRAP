import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

// 🔹 Garante que exista uma secret para assinar tokens
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";

// 🔹 Cria um token válido para os testes
const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, { expiresIn: "1h" });

// 🔹 Mock das rotas simples
vi.mock("../routes/auth.routes", () => ({
  default: (req: any, res: any) => res.send("auth ok"),
}));
vi.mock("../routes/product.routes", () => ({
  default: (req: any, res: any) => res.send("products ok"),
}));

// 🔹 Mock do Stripe
vi.mock("stripe", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      paymentIntents: { create: vi.fn() },
      webhooks: { constructEvent: vi.fn() },
    })),
  };
});

// 🔹 Mock do prisma
vi.mock("../prisma", () => ({ prisma: {} }));

// 🔹 Mock dinâmico do shopController
vi.mock("../controllers/shopController", () => {
  const fns = [
    "getCart",
    "addToCart",
    "removeFromCart",
    "checkoutCart",
    "createOrder",
    "getUserOrders",
    "getOrderById",
    "createStripePayment",
  ];
  const mockFns: Record<string, any> = {};
  fns.forEach((fn) => {
    mockFns[fn] = vi.fn((req: any, res: any) => res.send(`${fn} ok`));
  });
  return mockFns;
});

// 🔹 Spy no console.log ANTES de importar o server
const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

// importa depois dos mocks
import "../server";
import app from "../app";

describe("server.ts (com autenticação real)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve montar rota /auth", async () => {
    const res = await request(app).get("/auth");
    expect(res.text).toBe("auth ok");
  });

  it("deve montar rota /products", async () => {
    const res = await request(app).get("/products");
    expect(res.text).toBe("products ok");
  });

  it("deve montar rota /api/shop/cart", async () => {
    const res = await request(app)
      .get("/api/shop/cart")
      .set("Authorization", `Bearer ${token}`);
    expect(res.text).toBe("getCart ok");
  });

  it("deve montar rota /api/shop/cart/checkout", async () => {
    const res = await request(app)
      .post("/api/shop/cart/checkout")
      .set("Authorization", `Bearer ${token}`);
    expect(res.text).toBe("checkoutCart ok");
  });

  it("deve montar rota /api/shop/orders (POST)", async () => {
    const res = await request(app)
      .post("/api/shop/orders")
      .set("Authorization", `Bearer ${token}`);
    expect(res.text).toBe("createOrder ok");
  });

  it("deve montar rota /api/shop/orders (GET)", async () => {
    const res = await request(app)
      .get("/api/shop/orders")
      .set("Authorization", `Bearer ${token}`);
    expect(res.text).toBe("getUserOrders ok");
  });

  it("deve montar rota /api/shop/orders/:id", async () => {
    const res = await request(app)
      .get("/api/shop/orders/123")
      .set("Authorization", `Bearer ${token}`);
    expect(res.text).toBe("getOrderById ok");
  });

  it("deve montar rota /api/shop/orders/stripe", async () => {
    const res = await request(app)
      .post("/api/shop/orders/stripe")
      .set("Authorization", `Bearer ${token}`);
    expect(res.text).toBe("createStripePayment ok");
  });

    it("deve chamar app.listen com a porta correta e logar mensagem", async () => {
    vi.resetModules();

  const PORT = Number(process.env.PORT) || 3000;

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const listenMock = vi.fn((port, cb) => {
      cb(); // executa o callback
      return { close: vi.fn() };
    });

    vi.doMock("../app", () => ({
      default: { listen: listenMock },
    }));

    await import("../server");

    const port = Number(process.env.PORT) || 3000;

    expect(listenMock).toHaveBeenCalledWith(port, expect.any(Function));
    expect(
      logSpy.mock.calls.flat().some(msg => msg.includes(`Servidor rodando na porta ${port}`))
    ).toBe(true);
  });

});
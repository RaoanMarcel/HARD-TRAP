import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../../app";
import { prisma } from "../../prisma";

describe("Fluxo completo de compra", () => {
  let token: string;
  let orderId: number;

beforeAll(async () => {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE 
      "order_items",
      "orders",
      "payments",
      "addresses",
      "order_status_history",
      "stripe_events",
      "CartItem",
      "Cart",
      "products",
      "users"
    RESTART IDENTITY CASCADE;
  `);

  // Cria um produto de teste
  await prisma.product.create({
    data: {
      name: "Produto Teste",
      description: "Um produto de teste",
      price: 100,
      stock: 10,
    },
  });
});

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("deve registrar e logar usuário", async () => {
    const registerRes = await request(app)
      .post("/auth/register")
      .send({
        name: "Raoan",
        email: "raoanteste@example.com",
        password: "12345678",
      })
      .expect(201);

    expect(registerRes.body.user).toHaveProperty("id");

    const loginRes = await request(app)
      .post("/auth/login")
      .send({
        email: "raoanteste@example.com",
        password: "12345678",
      })
      .expect(200);

    expect(loginRes.body).toHaveProperty("token");
    token = loginRes.body.token;
  });

  it("deve adicionar produto ao carrinho", async () => {
    const product = await prisma.product.findFirst();

    const res = await request(app)
      .post("/api/shop/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: product!.id,
        quantity: 2,
      })
      .expect(200);

    expect(res.body).toHaveProperty("id");
    expect(res.body.quantity).toBe(2);
  });

  it("deve fazer checkout do carrinho", async () => {
    const res = await request(app)
      .post("/api/shop/cart/checkout")
      .set("Authorization", `Bearer ${token}`)
      .expect(201);

    expect(res.body).toHaveProperty("order");
    orderId = res.body.order.id;
  });

  it("deve listar pedidos do usuário", async () => {
    const res = await request(app)
      .get("/api/shop/orders")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("deve buscar pedido por ID", async () => {
    const res = await request(app)
      .get(`/api/shop/orders/${orderId}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty("id", orderId);
  });
});
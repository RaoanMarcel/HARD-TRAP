import request from "supertest";
import app from "../../app";
import { prisma } from "../../prisma";
import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";

describe("Admin Orders E2E", () => {
  let token: string;

  beforeAll(async () => {
    await prisma.users.deleteMany({ where: { email: "admin-orders@example.com" } });

    const admin = await prisma.users.create({
      data: {
        name: "Admin Orders",
        email: "admin-orders@example.com",
        password_hash: "hashedpassword",
        role: "ADMIN",
      },
    });

    const secret = process.env.JWT_SECRET || "test_secret";
    const rawToken = jwt.sign(
      { userId: admin.id, email: admin.email, role: admin.role }, // 🔹 usa userId
      secret,
      { expiresIn: "1d" }
    );

    token = rawToken; // só o JWT puro
  });

  it("deve listar pedidos", async () => {
    const customer = await prisma.users.create({
      data: {
        name: "Cliente Pedido",
        email: `cliente-orders-${Date.now()}@example.com`,
        password_hash: "hashedpassword",
        role: "CUSTOMER",
      },
    });

    await prisma.orders.create({
      data: {
        user_id: customer.id,
        status: "pending",
        total: 100,
      },
    });

    const res = await request(app)
      .get("/admin/orders")
      .set("Authorization", `Bearer ${token}`) // 🔹 agora correto
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty("status");
  });

  it("deve buscar pedido por ID", async () => {
    const customer = await prisma.users.create({
      data: {
        name: "Cliente Pedido 2",
        email: `cliente-orders2-${Date.now()}@example.com`,
        password_hash: "hashedpassword",
        role: "CUSTOMER",
      },
    });

    const order = await prisma.orders.create({
      data: {
        user_id: customer.id,
        status: "paid",
        total: 200,
      },
    });

    const res = await request(app)
      .get(`/admin/orders/${order.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.id).toBe(order.id);
    expect(res.body.status).toBe("paid");
  });

  it("deve atualizar status do pedido", async () => {
    const customer = await prisma.users.create({
      data: {
        name: "Cliente Pedido 3",
        email: `cliente-orders3-${Date.now()}@example.com`,
        password_hash: "hashedpassword",
        role: "CUSTOMER",
      },
    });

    const order = await prisma.orders.create({
      data: {
        user_id: customer.id,
        status: "pending",
        total: 300,
      },
    });

    const res = await request(app)
      .put(`/admin/orders/${order.id}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "shipped" })
      .expect(200);

    expect(res.body.status).toBe("shipped");

    const logs = await prisma.order_status_history.findMany({
      where: { order_id: order.id },
    });
    expect(logs.some((l) => l.status === "shipped")).toBe(true);
  });
});
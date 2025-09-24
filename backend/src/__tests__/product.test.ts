import request from "supertest";
import app from "../app";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

let adminToken: string;
let productId: number;

beforeAll(async () => {
  await prisma.order_items.deleteMany();
  await prisma.payments.deleteMany();
  await prisma.orders.deleteMany();
  await prisma.product.deleteMany();
  await prisma.users.deleteMany();

  const hashed = await bcrypt.hash("123456", 10);
  const admin = await prisma.users.create({
    data: { name: "Admin", email: "admin@example.com", password_hash: hashed, role: "ADMIN" },
  });

  adminToken = jwt.sign(
    { userId: admin.id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET || "supersecret"
  );
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Product Controller", () => {
  it("não deve criar produto sem autenticação", async () => {
    const res = await request(app)
      .post("/products")
      .send({ name: "Produto 1", price: 10 });

    expect(res.status).toBe(401);
  });

  it("deve criar produto com admin autenticado", async () => {
    const res = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Produto Teste", description: "Um produto de teste", price: 42.5, stock: 10 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Produto Teste");
    productId = res.body.id;
  });

  it("deve listar todos os produtos", async () => {
    const res = await request(app).get("/products");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("deve buscar produto por id", async () => {
    const res = await request(app).get(`/products/${productId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(productId);
  });

  it("deve atualizar estoque do produto", async () => {
    const res = await request(app)
      .put(`/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 2 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Estoque atualizado com sucesso");

    const updated = await prisma.product.findUnique({ where: { id: productId } });
    expect(updated?.stock).toBe(8); // 10 inicial - 2
  });

  it("não deve atualizar estoque com quantidade inválida", async () => {
    const res = await request(app)
      .put(`/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ quantity: 0 });

    expect(res.status).toBe(400);
  });

  it("deve deletar produto", async () => {
    const res = await request(app)
      .delete(`/products/${productId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Produto deletado com sucesso");
  });

  it("não deve encontrar produto deletado", async () => {
    const res = await request(app).get(`/products/${productId}`);
    expect(res.status).toBe(404);
  });
});

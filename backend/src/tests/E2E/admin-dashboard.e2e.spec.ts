import request from "supertest";
import app from "../../app";
import { prisma } from "../../prisma";
import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";

describe("Admin Dashboard E2E", () => {
  let token: string;

  beforeAll(async () => {
    // garante que não existe duplicado
    await prisma.users.deleteMany({ where: { email: "admin@example.com" } });

    // cria um admin fake
    const admin = await prisma.users.create({
      data: {
        name: "Admin Test",
        email: "admin@example.com",
        password_hash: "hashedpassword",
        role: "ADMIN",
      },
    });

    // gera token JWT internamente
    const secret = process.env.JWT_SECRET || "test_secret";
    token =
      "Bearer " +
      jwt.sign(
        {
          userId: admin.id,
          email: admin.email,
          role: admin.role,
        },
        secret,
        { expiresIn: "1d" }
      );
  });

  it("deve retornar dados do dashboard", async () => {
    const res = await request(app)
      .get("/admin/dashboard")
      .set("Authorization", token)
      .expect(200);

    expect(res.body).toHaveProperty("summary");
    expect(res.body).toHaveProperty("evolution");
    expect(res.body).toHaveProperty("topProducts");
    expect(res.body).toHaveProperty("ordersByStatus");
  });
});
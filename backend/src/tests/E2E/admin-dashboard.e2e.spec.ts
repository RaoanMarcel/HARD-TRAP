import request from "supertest";
import app from "../../app";
import { prisma } from "../../prisma";
import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";

describe("Admin Dashboard E2E", () => {
  let token: string;

  beforeAll(async () => {
    await prisma.users.deleteMany({ where: { email: "admin-dashboard@example.com" } });

    const admin = await prisma.users.create({
      data: {
        name: "Admin Dashboard",
        email: "admin-dashboard@example.com",
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

    token = rawToken;
  });

  it("deve retornar dados do dashboard", async () => {
    const res = await request(app)
      .get("/admin/dashboard")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty("summary");
  });
});
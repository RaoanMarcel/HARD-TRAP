import request from "supertest";
import app from "../app";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.users.deleteMany(); 
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Auth Controller", () => {
  describe("POST /auth/register", () => {
    it("deve registrar um usuário com sucesso", async () => {
      const res = await request(app).post("/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "123456",
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("id");
    });

    it("não deve registrar sem campos obrigatórios", async () => {
      const res = await request(app).post("/auth/register").send({
        email: "no-name@example.com",
        password: "123456",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("não deve registrar com email duplicado", async () => {
      await prisma.users.create({
        data: {
          name: "Duplicate",
          email: "duplicate@example.com",
          password_hash: await bcrypt.hash("123456", 10),
        },
      });

      const res = await request(app).post("/auth/register").send({
        name: "Duplicate2",
        email: "duplicate@example.com",
        password: "123456",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });

  describe("POST /auth/login", () => {
    it("deve logar com credenciais corretas", async () => {
      const password = await bcrypt.hash("123456", 10);
      const user = await prisma.users.create({
        data: {
          name: "Login Test",
          email: "login@example.com",
          password_hash: password,
        },
      });

      const res = await request(app).post("/auth/login").send({
        email: "login@example.com",
        password: "123456",
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
    });

    it("não deve logar com senha incorreta", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("não deve logar com email inexistente", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "no-user@example.com",
        password: "123456",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("não deve logar sem campos obrigatórios", async () => {
      const res = await request(app).post("/auth/login").send({
        email: "",
        password: "",
      });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });
  });
});

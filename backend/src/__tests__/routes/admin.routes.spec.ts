import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// 🔹 mocks primeiro, ANTES de importar o router
vi.mock("../../middlewares/adminAuth.middleware", () => ({
  adminAuth: (req: any, res: any, next: any) => next(),
}));

vi.mock("../../middlewares/upload.middleware", () => ({
  upload: {
    single: () => (req: any, res: any, next: any) => {
      req.file = { filename: "fake.png" };
      next();
    },
  },
}));

vi.mock("../../controllers/admin.controller", () => {
  return {
    createProduct: vi.fn((req: any, res: any) =>
      res.status(201).json({ message: "Produto criado" })
    ),
    updateProductStock: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Estoque atualizado" })
    ),
    getActiveProducts: vi.fn((req: any, res: any) =>
      res.status(200).json([{ id: 1, name: "Produto ativo" }])
    ),
    getAllProducts: vi.fn((req: any, res: any) =>
      res.status(200).json([{ id: 1, name: "Produto qualquer" }])
    ),
  };
});

// 🔹 importa os mocks para usar nos expects
import {
  createProduct,
  updateProductStock,
  getActiveProducts,
  getAllProducts,
} from "../../controllers/admin.controller";

// 🔹 só agora importa o router
import adminRoutes from "../../routes/admin.routes";

const app = express();
app.use(express.json());
app.use("/admin", adminRoutes);

describe("Admin Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("POST /admin/products deve chamar createProduct", async () => {
    const res = await request(app)
      .post("/admin/products")
      .attach("image", Buffer.from("fake"), "fake.png");

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Produto criado");
    expect(createProduct).toHaveBeenCalled();
  });

  it("POST /admin/products/:id/image deve chamar createProduct", async () => {
    const res = await request(app)
      .post("/admin/products/123/image")
      .attach("image", Buffer.from("fake"), "fake.png");

    expect(res.status).toBe(201);
    expect(createProduct).toHaveBeenCalled();
  });

  it("PUT /admin/products/:id/stock deve chamar updateProductStock", async () => {
    const res = await request(app).put("/admin/products/123/stock").send({ stock: 10 });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Estoque atualizado");
    expect(updateProductStock).toHaveBeenCalled();
  });

  it("GET /admin/products/active deve chamar getActiveProducts", async () => {
    const res = await request(app).get("/admin/products/active");

    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe("Produto ativo");
    expect(getActiveProducts).toHaveBeenCalled();
  });

  it("GET /admin/products deve chamar getAllProducts", async () => {
    const res = await request(app).get("/admin/products");

    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe("Produto qualquer");
    expect(getAllProducts).toHaveBeenCalled();
  });
});
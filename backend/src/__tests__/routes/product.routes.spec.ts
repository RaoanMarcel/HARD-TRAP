import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// 🔹 mocks primeiro
vi.mock("../../middlewares/auth.middleware", () => ({
  authenticate: (req: any, res: any, next: any) => next(),
  isAdmin: (req: any, res: any, next: any) => next(),
}));

vi.mock("../../middlewares/upload.middleware", () => ({
  upload: {
    single: () => (req: any, res: any, next: any) => {
      req.file = { filename: "fake.png" };
      next();
    },
  },
}));

vi.mock("../../controllers/product.controller", () => {
  return {
    createProduct: vi.fn((req: any, res: any) =>
      res.status(201).json({ message: "Produto criado" })
    ),
    getProducts: vi.fn((req: any, res: any) =>
      res.status(200).json([{ id: 1, name: "Produto 1" }])
    ),
    getProductById: vi.fn((req: any, res: any) =>
      res.status(200).json({ id: req.params.id, name: "Produto X" })
    ),
    updateStock: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Estoque atualizado" })
    ),
    deleteProduct: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Produto deletado" })
    ),
    uploadProductImage: vi.fn((req: any, res: any) =>
      res.status(200).json({ message: "Imagem enviada", file: req.file })
    ),
  };
});

// importa os mocks para usar nos expects
import {
  createProduct,
  getProducts,
  getProductById,
  updateStock,
  deleteProduct,
  uploadProductImage,
} from "../../controllers/product.controller";

// só agora importa o router
import productRoutes from "../../routes/product.routes";

const app = express();
app.use(express.json());
app.use("/products", productRoutes);

describe("Product Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET /products deve chamar getProducts", async () => {
    const res = await request(app).get("/products");
    expect(res.status).toBe(200);
    expect(res.body[0].name).toBe("Produto 1");
    expect(getProducts).toHaveBeenCalled();
  });

  it("GET /products/:id deve chamar getProductById", async () => {
    const res = await request(app).get("/products/123");
    expect(res.status).toBe(200);
    expect(res.body.id).toBe("123");
    expect(getProductById).toHaveBeenCalled();
  });

  it("POST /products deve chamar createProduct", async () => {
    const res = await request(app).post("/products").send({ name: "Novo Produto" });
    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Produto criado");
    expect(createProduct).toHaveBeenCalled();
  });

  it("PUT /products/:id deve chamar updateStock", async () => {
    const res = await request(app).put("/products/123").send({ stock: 10 });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Estoque atualizado");
    expect(updateStock).toHaveBeenCalled();
  });

  it("DELETE /products/:id deve chamar deleteProduct", async () => {
    const res = await request(app).delete("/products/123");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Produto deletado");
    expect(deleteProduct).toHaveBeenCalled();
  });

  it("POST /products/upload-image deve chamar uploadProductImage", async () => {
    const res = await request(app)
      .post("/products/upload-image")
      .attach("image", Buffer.from("fake"), "fake.png");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Imagem enviada");
    expect(uploadProductImage).toHaveBeenCalled();
  });
});
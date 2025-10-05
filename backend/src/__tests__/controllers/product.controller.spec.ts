import request from "supertest";
import express from "express";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock dos services
vi.mock("../../services/product.service", () => ({
  createProductService: vi.fn(),
  uploadProductImageService: vi.fn(),
  getProductsService: vi.fn(),
  getProductByIdService: vi.fn(),
  decrementStockService: vi.fn(),
  deleteProductService: vi.fn(),
}));

// 🔹 Mock do validateRequest
vi.mock("../../utils/validation.util", () => ({
  validateRequest: vi.fn(),
}));

import {
  createProductService,
  uploadProductImageService,
  getProductsService,
  getProductByIdService,
  decrementStockService,
  deleteProductService,
} from "../../services/product.service";
import { validateRequest } from "../../utils/validation.util";
import {
  createProduct,
  uploadProductImage,
  getProducts,
  getProductById,
  updateStock,
  deleteProduct,
} from "../../controllers/product.controller";

// Criar app Express para testar endpoints
const app = express();
app.use(express.json());
app.post("/products", createProduct);
app.post("/products/upload", uploadProductImage);
app.get("/products", getProducts);
app.get("/products/:id", getProductById);
app.put("/products/:id/stock", updateStock);
app.delete("/products/:id", deleteProduct);

describe("Product Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createProduct", () => {
    it("deve criar produto com sucesso", async () => {
      (validateRequest as any).mockReturnValue({ name: "Produto", price: 100, stock: 5 });
      (createProductService as any).mockResolvedValue({ id: 1, name: "Produto" });

      const res = await request(app).post("/products").send({ name: "Produto", price: 100, stock: 5 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 1, name: "Produto" });
      expect(createProductService).toHaveBeenCalledWith({ name: "Produto", price: 100, stock: 5 });
    });

    it("deve retornar 400 se service falhar", async () => {
      (validateRequest as any).mockReturnValue({ name: "Produto", price: 100, stock: 5 });
      (createProductService as any).mockRejectedValue(new Error("Erro interno"));

      const res = await request(app).post("/products").send({ name: "Produto", price: 100, stock: 5 });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        errors: [{ field: "server", message: "Erro interno" }],
      });
    });
  });

  describe("uploadProductImage", () => {
    it("deve enviar imagem com sucesso", async () => {
      (validateRequest as any).mockReturnValue({ productId: 1 });
      (uploadProductImageService as any).mockResolvedValue({ id: 1, imageUrl: "http://img" });

      const res = await request(app).post("/products/upload").send({ productId: 1 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: "Imagem enviada com sucesso",
        product: { id: 1, imageUrl: "http://img" },
      });
    });

    it("deve retornar 400 se service falhar", async () => {
      (validateRequest as any).mockReturnValue({ productId: 1 });
      (uploadProductImageService as any).mockRejectedValue(new Error("Falha upload"));

      const res = await request(app).post("/products/upload").send({ productId: 1 });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        errors: [{ field: "server", message: "Falha upload" }],
      });
    });
  });

  describe("getProducts", () => {
    it("deve retornar lista de produtos", async () => {
      (getProductsService as any).mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const res = await request(app).get("/products");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("deve retornar 500 se service falhar", async () => {
      (getProductsService as any).mockRejectedValue(new Error("Erro interno"));

      const res = await request(app).get("/products");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        success: false,
        errors: [{ field: "server", message: "Erro interno" }],
      });
    });
  });

  describe("getProductById", () => {
    it("deve retornar produto por ID", async () => {
      (validateRequest as any).mockReturnValue({ id: 1 });
      (getProductByIdService as any).mockResolvedValue({ id: 1, name: "Produto" });

      const res = await request(app).get("/products/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, name: "Produto" });
    });

    it("deve retornar 404 se service falhar", async () => {
      (validateRequest as any).mockReturnValue({ id: 1 });
      (getProductByIdService as any).mockRejectedValue(new Error("Não encontrado"));

      const res = await request(app).get("/products/1");

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        errors: [{ field: "server", message: "Não encontrado" }],
      });
    });
  });

  describe("updateStock", () => {
    it("deve atualizar estoque com sucesso", async () => {
      (validateRequest as any).mockReturnValueOnce({ id: 1 }).mockReturnValueOnce({ quantity: 2 });
      (decrementStockService as any).mockResolvedValue(true);

      const res = await request(app).put("/products/1/stock").send({ quantity: 2 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Estoque atualizado com sucesso" });
      expect(decrementStockService).toHaveBeenCalledWith({ productId: 1, quantity: 2 });
    });

    it("deve retornar 400 se service falhar", async () => {
      (validateRequest as any).mockReturnValueOnce({ id: 1 }).mockReturnValueOnce({ quantity: 2 });
      (decrementStockService as any).mockRejectedValue(new Error("Estoque insuficiente"));

      const res = await request(app).put("/products/1/stock").send({ quantity: 2 });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        errors: [{ field: "server", message: "Estoque insuficiente" }],
      });
    });
  });

  describe("deleteProduct", () => {
    it("deve deletar produto com sucesso", async () => {
      (validateRequest as any).mockReturnValue({ id: 1 });
      (deleteProductService as any).mockResolvedValue(true);

      const res = await request(app).delete("/products/1");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Produto deletado com sucesso" });
    });

    it("deve retornar 500 se service falhar", async () => {
      (validateRequest as any).mockReturnValue({ id: 1 });
      (deleteProductService as any).mockRejectedValue(new Error("Erro interno"));

      const res = await request(app).delete("/products/1");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        success: false,
        errors: [{ field: "server", message: "Erro interno" }],
      });
    });
  });
});
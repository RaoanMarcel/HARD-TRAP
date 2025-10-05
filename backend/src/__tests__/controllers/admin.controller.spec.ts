import request from "supertest";
import express from "express";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock dos services
vi.mock("../../services/admin.service", () => ({
  createProductService: vi.fn(),
  updateProductStockService: vi.fn(),
  getAllProductsService: vi.fn(),
}));

// 🔹 Mock do validateRequest
vi.mock("../../utils/validation.util", () => ({
  validateRequest: vi.fn(),
}));

import {
  createProductService,
  updateProductStockService,
  getAllProductsService,
} from "../../services/admin.service";
import { validateRequest } from "../../utils/validation.util";
import {
  createProduct,
  updateProductStock,
  getAllProducts,
  getActiveProducts,
} from "../../controllers/admin.controller";

// Criar app Express para testar endpoints
const app = express();
app.use(express.json());
app.post("/products", createProduct);
app.put("/products/:id/stock", updateProductStock);
app.get("/products", getAllProducts);
app.get("/products/active", getActiveProducts);

describe("Admin Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createProduct", () => {
    it("deve criar produto com sucesso", async () => {
      (validateRequest as any).mockReturnValue({ name: "Produto", price: 100, stock: 5 });
      (createProductService as any).mockResolvedValue({ id: 1, name: "Produto" });

      const res = await request(app).post("/products").send({ name: "Produto", price: 100 });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: 1, name: "Produto" });
      expect(createProductService).toHaveBeenCalledWith({
        name: "Produto",
        price: 100,
        stock: 5,
        filePath: undefined,
      });
    });

    it("deve lançar erro se validação falhar", async () => {
      (validateRequest as any).mockReturnValue(null);

      // Como o controller lança erro, precisamos capturar manualmente
      await expect(
        createProduct({ body: {} } as any, {} as any)
      ).rejects.toThrow("Dados inválidos");
    });

    it("deve retornar 500 se service falhar", async () => {
      (validateRequest as any).mockReturnValue({ name: "Produto", price: 100 });
      (createProductService as any).mockRejectedValue(new Error("Erro interno"));

      const res = await request(app).post("/products").send({ name: "Produto", price: 100 });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        success: false,
        errors: [{ field: "server", message: "Erro interno" }],
      });
    });
  });

  describe("updateProductStock", () => {
    it("deve atualizar estoque com sucesso", async () => {
      (validateRequest as any).mockReturnValue({ stock: 10 });
      (updateProductStockService as any).mockResolvedValue({ id: 1, stock: 10 });

      const res = await request(app).put("/products/1/stock").send({ stock: 10 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: 1, stock: 10 });
      expect(updateProductStockService).toHaveBeenCalledWith(1, 10);
    });

    it("deve retornar 400 se id for inválido", async () => {
      (validateRequest as any).mockReturnValue({ stock: 10 });

      const res = await request(app).put("/products/abc/stock").send({ stock: 10 });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ success: false, message: "ID inválido" });
    });

    it("deve retornar 500 se service falhar", async () => {
      (validateRequest as any).mockReturnValue({ stock: 10 });
      (updateProductStockService as any).mockRejectedValue(new Error("Erro interno"));

      const res = await request(app).put("/products/1/stock").send({ stock: 10 });

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        success: false,
        errors: [{ field: "server", message: "Erro interno" }],
      });
    });
  });

  describe("getAllProducts", () => {
    it("deve retornar lista de produtos", async () => {
      (getAllProductsService as any).mockResolvedValue([{ id: 1 }, { id: 2 }]);

      const res = await request(app).get("/products");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it("deve retornar 500 se service falhar", async () => {
      (getAllProductsService as any).mockRejectedValue(new Error("Erro interno"));

      const res = await request(app).get("/products");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        success: false,
        errors: [{ field: "server", message: "Erro interno" }],
      });
    });
  });

  describe("getActiveProducts", () => {
    it("deve retornar apenas produtos com stock > 0", async () => {
      (getAllProductsService as any).mockResolvedValue([
        { id: 1, stock: 0 },
        { id: 2, stock: 5 },
      ]);

      const res = await request(app).get("/products/active");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([{ id: 2, stock: 5 }]);
    });

    it("deve retornar 500 se service falhar", async () => {
      (getAllProductsService as any).mockRejectedValue(new Error("Erro interno"));

      const res = await request(app).get("/products/active");

      expect(res.status).toBe(500);
      expect(res.body).toEqual({
        success: false,
        errors: [{ field: "server", message: "Erro interno" }],
      });
    });
  });
});
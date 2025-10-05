// src/__tests__/products/productService.spec.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock do Prisma (mockando o módulo real)
vi.mock("../../prisma", () => ({
  prisma: {
    product: {
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock do logger (export default)
vi.mock("../../logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock do upload de imagem
vi.mock("../../utils/imageUpload", () => ({
  uploadImageToCloudinary: vi.fn(() => Promise.resolve("mocked_url")),
}));

// Importa os mocks tipados
import { prisma } from "../../prisma";
import logger from "../../logger";
import { uploadImageToCloudinary } from "../../utils/imageUpload";

// Importa o serviço depois dos mocks
import * as adminService from "../../services/admin.service";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("adminService", () => {
  // -----------------------------
  // createProductService
  // -----------------------------
  describe("createProductService", () => {
    it("deve criar produto com stock informado", async () => {
      const input = { name: "Produto 1", price: 100, stock: 10 };
      (prisma.product.create as any).mockResolvedValue({ id: 1, ...input });

      const result = await adminService.createProductService(input);
      expect(result).toEqual({ id: 1, ...input });
      expect(prisma.product.create).toHaveBeenCalledWith({ data: input });
    });

    it("deve criar produto sem stock (usa default 0)", async () => {
      const input = { name: "Produto 2", price: 50, stock: 0 };
      const output = { id: 2, ...input };
      (prisma.product.create as any).mockResolvedValue(output);

      const result = await adminService.createProductService(input);
      expect(result).toEqual(output);
      expect(prisma.product.create).toHaveBeenCalledWith({ data: input });
    });

    it("deve lançar erro se name ou price forem inválidos", async () => {
      const input: any = { name: "", price: 0, stock: 0 };
      (prisma.product.create as any).mockRejectedValue(new Error("Nome e preço são obrigatórios"));

      await expect(adminService.createProductService(input)).rejects.toThrow(
        "Nome e preço são obrigatórios"
      );
    });
  });

  // -----------------------------
  // uploadProductImageService
  // -----------------------------
  describe("uploadProductImageService", () => {
    it("deve fazer upload de imagem e atualizar produto", async () => {
      (prisma.product.update as any).mockResolvedValue({ id: 1, imageUrl: "mocked_url" });

      const result = await adminService.uploadProductImageService(1, "fake/path.jpg");

      expect(result).toEqual({ id: 1, imageUrl: "mocked_url" });
      expect(uploadImageToCloudinary).toHaveBeenCalledWith("fake/path.jpg");
      expect(prisma.product.update).toHaveBeenCalled();
    });

    it("deve lançar erro se filePath ausente", async () => {
      await expect(
        adminService.uploadProductImageService(1, "")
      ).rejects.toThrow("Nenhum arquivo enviado");
    });

    it("deve lançar erro se productId inválido", async () => {
      await expect(
        adminService.uploadProductImageService(0, "path.jpg")
      ).rejects.toThrow("ID do produto é obrigatório");
    });
  });

  // -----------------------------
  // getAllProductsService
  // -----------------------------
  describe("getAllProductsService", () => {
    it("deve retornar lista de produtos", async () => {
      const mockProducts = [{ id: 1, name: "P1", price: 10, stock: 5 }];
      (prisma.product.findMany as any).mockResolvedValue(mockProducts);

      const result = await adminService.getAllProductsService();
      expect(result).toEqual(mockProducts);
      expect(prisma.product.findMany).toHaveBeenCalled();
    });
  });

  // -----------------------------
  // decrementStockService
  // -----------------------------
  describe("decrementStockService", () => {
    it("deve decrementar estoque com sucesso", async () => {
      (prisma.product.updateMany as any).mockResolvedValue({ count: 1 });

      const result = await adminService.decrementStockService({ productId: 1, quantity: 2 });
      expect(result).toBe(true);
    });

    it("deve lançar erro se estoque insuficiente", async () => {
      (prisma.product.updateMany as any).mockResolvedValue({ count: 0 });

      await expect(
        adminService.decrementStockService({ productId: 1, quantity: 5 })
      ).rejects.toThrow("Estoque insuficiente para este produto");
    });
  });

  // -----------------------------
  // deleteProductService
  // -----------------------------
  describe("deleteProductService", () => {
    it("deve deletar produto com sucesso", async () => {
      (prisma.product.delete as any).mockResolvedValue({ id: 1 });

      const result = await adminService.deleteProductService(1);
      expect(result).toBe(true);
      expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
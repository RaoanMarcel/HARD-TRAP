import { describe, it, expect, vi, beforeEach } from "vitest";
import { prisma } from "../../prisma";
import {
  createProductService,
  uploadProductImageService,
  getProductsService,
  getProductByIdService,
  decrementStockService,
  deleteProductService,
} from "../../services/product.service";
import { uploadImageToCloudinary } from "../../utils/imageUpload";

// 🔹 Mock do Prisma
vi.mock("../../prisma", () => ({
  prisma: {
    product: {
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

// 🔹 Mock do Cloudinary
vi.mock("../../utils/imageUpload", () => ({
  uploadImageToCloudinary: vi.fn(),
}));

describe("Product Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createProductService deve lançar erro se nome ou preço não forem fornecidos", async () => {
    await expect(createProductService({ name: "", price: 10 })).rejects.toThrow(
      "Nome e preço são obrigatórios"
    );
    await expect(createProductService({ name: "Teste", price: null as any })).rejects.toThrow(
      "Nome e preço são obrigatórios"
    );
  });

  it("createProductService deve criar produto com sucesso", async () => {
    (prisma.product.create as any).mockResolvedValue({ id: 1, name: "Produto", price: 100 });

    const result = await createProductService({ name: "Produto", price: 100, stock: 5 });

    expect(prisma.product.create).toHaveBeenCalledWith({
      data: { name: "Produto", description: undefined, price: 100, stock: 5 },
    });
    expect(result).toEqual({ id: 1, name: "Produto", price: 100 });
  });

  it("uploadProductImageService deve lançar erro se filePath não for fornecido", async () => {
    await expect(uploadProductImageService(1, "")).rejects.toThrow("Nenhum arquivo enviado");
  });

  it("uploadProductImageService deve lançar erro se productId não for fornecido", async () => {
    await expect(uploadProductImageService(0, "caminho.jpg")).rejects.toThrow(
      "ID do produto é obrigatório"
    );
  });

  it("uploadProductImageService deve atualizar produto com imagem", async () => {
    (uploadImageToCloudinary as any).mockResolvedValue("http://image.url");
    (prisma.product.update as any).mockResolvedValue({ id: 1, imageUrl: "http://image.url" });

    const result = await uploadProductImageService(1, "caminho.jpg");

    expect(uploadImageToCloudinary).toHaveBeenCalledWith("caminho.jpg");
    expect(prisma.product.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { imageUrl: "http://image.url" },
    });
    expect(result).toEqual({ id: 1, imageUrl: "http://image.url" });
  });

  it("getProductsService deve retornar lista de produtos", async () => {
    (prisma.product.findMany as any).mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const result = await getProductsService();

    expect(prisma.product.findMany).toHaveBeenCalled();
    expect(result).toHaveLength(2);
  });

  it("getProductByIdService deve lançar erro se produto não existir", async () => {
    (prisma.product.findUnique as any).mockResolvedValue(null);

    await expect(getProductByIdService(99)).rejects.toThrow("Produto não encontrado");
  });

  it("getProductByIdService deve retornar produto se existir", async () => {
    (prisma.product.findUnique as any).mockResolvedValue({ id: 1, name: "Produto" });

    const result = await getProductByIdService(1);

    expect(prisma.product.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toEqual({ id: 1, name: "Produto" });
  });

  it("decrementStockService deve lançar erro se estoque for insuficiente", async () => {
    (prisma.product.updateMany as any).mockResolvedValue({ count: 0 });

    await expect(decrementStockService({ productId: 1, quantity: 10 })).rejects.toThrow(
      "Estoque insuficiente para este produto"
    );
  });

  it("decrementStockService deve decrementar estoque com sucesso", async () => {
    (prisma.product.updateMany as any).mockResolvedValue({ count: 1 });

    const result = await decrementStockService({ productId: 1, quantity: 2 });

    expect(prisma.product.updateMany).toHaveBeenCalledWith({
      where: { id: 1, stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });
    expect(result).toBe(true);
  });

  it("deleteProductService deve deletar produto com sucesso", async () => {
    (prisma.product.delete as any).mockResolvedValue({});

    const result = await deleteProductService(1);

    expect(prisma.product.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(result).toBe(true);
  });
});
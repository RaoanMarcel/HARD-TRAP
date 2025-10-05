import request from "supertest";
import express from "express";
import { describe, it, expect, vi, beforeEach } from "vitest";

// 🔹 Mock do Cloudinary util
vi.mock("../../utils/cloudinary", () => ({
  uploadToCloudinary: vi.fn(),
}));

import { uploadToCloudinary } from "../../utils/cloudinary";
import { uploadImage } from "../../controllers/upload.controller";

// Criar app Express para testar endpoint
const app = express();
app.post("/upload", (req, res) => uploadImage(req as any, res));

describe("Upload Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve retornar 400 se nenhum arquivo for enviado", async () => {
    const res = await request(app).post("/upload");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      error: "Nenhuma imagem enviada.",
    });
  });

  it("deve fazer upload com sucesso", async () => {
    (uploadToCloudinary as any).mockResolvedValue("http://image.url");

    // Simula req.file
    const fakeFile = { buffer: Buffer.from("fake") };
    const res = await request(app)
      .post("/upload")
      .set("Content-Type", "application/json")
      .send({}); // corpo vazio, mas vamos injetar manualmente

    // Chamando controller diretamente para simular req.file
    const mockReq: any = { file: fakeFile };
    const mockRes: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await uploadImage(mockReq, mockRes);

    expect(uploadToCloudinary).toHaveBeenCalledWith(fakeFile.buffer, "academia");
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      url: "http://image.url",
    });
  });

  it("deve retornar 500 se upload falhar", async () => {
    (uploadToCloudinary as any).mockRejectedValue(new Error("Falha no Cloudinary"));

    const fakeFile = { buffer: Buffer.from("fake") };
    const mockReq: any = { file: fakeFile };
    const mockRes: any = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await uploadImage(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      error: "Erro ao fazer upload da imagem.",
    });
  });
});